import { describe, it, expect } from 'vitest';
import { StripeProvider } from './stripe';
import { PkrGatewayProvider } from './pkr';
import { ProviderRouter } from './router';

describe('sandbox payment providers', () => {
  it('Stripe captures EUR and is idempotent on capture', async () => {
    const stripe = new StripeProvider();
    const intent = await stripe.createIntent({ amount: { amount: 25000, currency: 'EUR' }, idempotencyKey: 'k1' });
    expect(intent.status).toBe('REQUIRES_CAPTURE');
    const captured = await stripe.capture(intent.id, { idempotencyKey: 'cap1' });
    expect(captured.status).toBe('CAPTURED');
    expect(captured.capturedAmount).toBe(25000);
    // replay returns same intent, no double charge
    const replay = await stripe.capture(intent.id, { idempotencyKey: 'cap1' });
    expect(replay.id).toBe(captured.id);
  });

  it('createIntent is idempotent by key', async () => {
    const stripe = new StripeProvider();
    const a = await stripe.createIntent({ amount: { amount: 100, currency: 'EUR' }, idempotencyKey: 'same' });
    const b = await stripe.createIntent({ amount: { amount: 100, currency: 'EUR' }, idempotencyKey: 'same' });
    expect(a.id).toBe(b.id);
  });

  it('supports full and partial refunds', async () => {
    const stripe = new StripeProvider();
    const intent = await stripe.createIntent({ amount: { amount: 10000, currency: 'EUR' }, idempotencyKey: 'k' });
    await stripe.capture(intent.id, { idempotencyKey: 'c' });

    const partial = await stripe.refund(intent.id, { amount: 4000, currency: 'EUR' });
    expect(partial.status).toBe('PARTIALLY_REFUNDED');

    const rest = await stripe.refund(intent.id);
    expect(rest.status).toBe('REFUNDED');
    expect(rest.refunded.amount).toBe(6000);

    await expect(stripe.refund(intent.id)).rejects.toThrow();
  });

  it('rejects a wrong-currency intent', async () => {
    const pkr = new PkrGatewayProvider();
    await expect(
      pkr.createIntent({ amount: { amount: 100, currency: 'EUR' }, idempotencyKey: 'k' }),
    ).rejects.toThrow(/PKR/);
  });

  it('router selects a provider by currency', () => {
    const router = new ProviderRouter().register(new StripeProvider()).register(new PkrGatewayProvider());
    expect(router.forCurrency('EUR').name).toBe('stripe');
    expect(router.forCurrency('PKR').name).toBe('safepay');
    expect(router.supports('SAR')).toBe(false);
    expect(() => router.forCurrency('SAR')).toThrow(/No payment provider/);
  });

  it('parses a webhook into a typed event', () => {
    const stripe = new StripeProvider();
    const event = stripe.parseWebhook(JSON.stringify({ type: 'intent.captured', intentId: 'i1', amount: 5000 }));
    expect(event).toEqual({ type: 'intent.captured', intentId: 'i1', amount: { amount: 5000, currency: 'EUR' } });
  });
});
