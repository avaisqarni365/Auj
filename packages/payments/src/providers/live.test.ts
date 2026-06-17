import { describe, it, expect } from 'vitest';
import { LiveStripeProvider, mapStripeStatus } from './stripe-live';
import { LiveHttpProvider } from './http-live';
import { StripeProvider } from './stripe';
import { PkrGatewayProvider } from './pkr';
import { selectEurProvider, selectPkrProvider, createPaymentRouter } from './factory';
import type { FetchLike, FetchResponse } from './http';

const resp = (body: unknown, ok = true, status = 200): FetchResponse => ({ ok, status, json: async () => body });

interface Call {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
}

describe('LiveStripeProvider (injected fetch)', () => {
  it('createIntent posts a manual-capture intent with an Idempotency-Key and maps the response', async () => {
    const calls: Call[] = [];
    const fetchFn: FetchLike = async (url, init) => {
      calls.push({ url, ...init });
      return resp({ id: 'pi_1', status: 'requires_capture', amount: 25000, client_secret: 'pi_1_secret_abc', metadata: { bookingRef: 'BR1' } });
    };
    const stripe = new LiveStripeProvider({ secretKey: 'sk_test', fetchFn });
    const intent = await stripe.createIntent({ amount: { amount: 25000, currency: 'EUR' }, idempotencyKey: 'k1', bookingRef: 'BR1' });

    expect(intent).toMatchObject({ id: 'pi_1', provider: 'stripe', status: 'REQUIRES_CAPTURE', bookingRef: 'BR1' });
    // The browser needs the client_secret to confirm the card before we capture.
    expect(intent.clientSecret).toBe('pi_1_secret_abc');
    expect(intent.amount).toEqual({ amount: 25000, currency: 'EUR' });
    const call = calls[0]!;
    expect(call.url).toBe('https://api.stripe.com/v1/payment_intents');
    expect(call.headers.Authorization).toBe('Bearer sk_test');
    expect(call.headers['Idempotency-Key']).toBe('intent:k1');
    expect(call.body).toContain('capture_method=manual');
    expect(call.body).toContain('amount=25000');
    expect(call.body).toContain('currency=eur');
  });

  it('capture maps succeeded → CAPTURED', async () => {
    const fetchFn: FetchLike = async () => resp({ id: 'pi_1', status: 'succeeded', amount: 25000, amount_received: 25000 });
    const stripe = new LiveStripeProvider({ secretKey: 'sk', fetchFn });
    const captured = await stripe.capture('pi_1', { idempotencyKey: 'c1' });
    expect(captured.status).toBe('CAPTURED');
    expect(captured.capturedAmount).toBe(25000);
  });

  it('refund derives partial vs full from the re-read intent', async () => {
    const fetchFn: FetchLike = async (url, init) => {
      if (init.method === 'POST' && url.endsWith('/v1/refunds')) return resp({ amount: 10000, payment_intent: 'pi_1' });
      return resp({ id: 'pi_1', amount: 25000, latest_charge: { amount_captured: 25000, amount_refunded: 10000 } });
    };
    const stripe = new LiveStripeProvider({ secretKey: 'sk', fetchFn });
    const r = await stripe.refund('pi_1', { amount: 10000, currency: 'EUR' });
    expect(r.status).toBe('PARTIALLY_REFUNDED');
    expect(r.refunded).toEqual({ amount: 10000, currency: 'EUR' });
  });

  it('surfaces Stripe API errors and rejects wrong currency', async () => {
    const errFetch: FetchLike = async () => resp({ error: { message: 'card_declined' } }, false, 402);
    const stripe = new LiveStripeProvider({ secretKey: 'sk', fetchFn: errFetch });
    await expect(stripe.createIntent({ amount: { amount: 100, currency: 'EUR' }, idempotencyKey: 'k' })).rejects.toThrow(/card_declined/);
    await expect(stripe.createIntent({ amount: { amount: 100, currency: 'PKR' }, idempotencyKey: 'k' })).rejects.toThrow(/EUR/);
  });

  it('mapStripeStatus covers the lifecycle', () => {
    expect(mapStripeStatus('succeeded')).toBe('CAPTURED');
    expect(mapStripeStatus('canceled')).toBe('FAILED');
    expect(mapStripeStatus('requires_capture')).toBe('REQUIRES_CAPTURE');
  });
});

describe('LiveHttpProvider (PKR gateway, injected fetch)', () => {
  const cfg = (fetchFn: FetchLike) => ({ name: 'safepay', currency: 'PKR' as const, baseUrl: 'https://pay.example', apiKey: 'key', fetchFn });

  it('creates and refunds an intent over the JSON contract', async () => {
    const fetchFn: FetchLike = async (url) =>
      url.endsWith('/refunds') ? resp({ refunded: 5000, status: 'REFUNDED' }) : resp({ id: 'gw_1', status: 'REQUIRES_CAPTURE', amount: 5000 });
    const pkr = new LiveHttpProvider(cfg(fetchFn));
    const intent = await pkr.createIntent({ amount: { amount: 5000, currency: 'PKR' }, idempotencyKey: 'k' });
    expect(intent).toMatchObject({ id: 'gw_1', provider: 'safepay', status: 'REQUIRES_CAPTURE' });
    const r = await pkr.refund('gw_1');
    expect(r.status).toBe('REFUNDED');
  });

  it('rejects a wrong-currency intent', async () => {
    const pkr = new LiveHttpProvider(cfg(async () => resp({})));
    await expect(pkr.createIntent({ amount: { amount: 1, currency: 'EUR' }, idempotencyKey: 'k' })).rejects.toThrow(/PKR/);
  });
});

describe('createPaymentRouter selects by env', () => {
  it('defaults to the offline sandbox providers', () => {
    expect(selectEurProvider({})).toBeInstanceOf(StripeProvider);
    expect(selectPkrProvider({})).toBeInstanceOf(PkrGatewayProvider);
    const router = createPaymentRouter({});
    expect(router.forCurrency('EUR').name).toBe('stripe');
    expect(router.forCurrency('PKR').name).toBe('safepay');
  });

  it('swaps in live providers when credentials are present', () => {
    expect(selectEurProvider({ STRIPE_SECRET_KEY: 'sk_live' })).toBeInstanceOf(LiveStripeProvider);
    expect(selectPkrProvider({ PKR_GATEWAY_URL: 'https://pay.example', PKR_GATEWAY_KEY: 'k' })).toBeInstanceOf(LiveHttpProvider);
  });
});
