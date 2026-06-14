import type { Currency, Money } from '@auj/contracts';
import type {
  CreateIntentInput,
  IntentStatus,
  PaymentIntent,
  PaymentProvider,
  RefundResult,
  WebhookEvent,
} from '../ports';
import { defaultFetch, formEncode, type FetchLike } from './http';

// Real Stripe acquirer (EUR) over the PaymentIntents REST API. PANs never touch us —
// card collection happens client-side with Stripe.js; this server adapter creates a
// manual-capture intent, captures, and refunds. `fetchFn` is injectable for offline tests.
//
// LIMITATION (documented, like the Maqam connector): a production card flow also needs the
// Stripe.js client step (collect + confirm the payment method) before capture; that UI piece
// is out of scope for this server-side port adapter.

export interface StripeConfig {
  secretKey: string;
  baseUrl?: string;
  fetchFn?: FetchLike;
}

interface StripePI {
  id: string;
  status: string;
  amount: number;
  amount_received?: number;
  created?: number;
  metadata?: Record<string, string>;
  latest_charge?: { amount_captured?: number; amount_refunded?: number };
}
interface StripeRefund {
  amount: number;
  payment_intent: string;
}
interface StripeError {
  error?: { message?: string };
}

export function mapStripeStatus(s: string): IntentStatus {
  switch (s) {
    case 'succeeded':
      return 'CAPTURED';
    case 'canceled':
      return 'FAILED';
    default:
      // requires_payment_method | requires_confirmation | requires_action | requires_capture | processing
      return 'REQUIRES_CAPTURE';
  }
}

export class LiveStripeProvider implements PaymentProvider {
  readonly name = 'stripe';
  readonly currency: Currency = 'EUR';
  private readonly baseUrl: string;
  private readonly fetchFn: FetchLike;

  constructor(private readonly cfg: StripeConfig) {
    this.baseUrl = cfg.baseUrl ?? 'https://api.stripe.com';
    this.fetchFn = cfg.fetchFn ?? defaultFetch;
  }

  private assertCurrency(m: Money): void {
    if (m.currency !== this.currency) throw new Error(`${this.name} handles ${this.currency}, got ${m.currency}`);
  }

  private async post<T>(path: string, fields: Record<string, string | number | boolean>, idempotencyKey?: string): Promise<T> {
    const res = await this.fetchFn(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.cfg.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
      },
      body: formEncode(fields),
    });
    const body = (await res.json()) as T & StripeError;
    if (!res.ok) throw new Error(body.error?.message ?? `Stripe error ${res.status}`);
    return body;
  }

  private async get<T>(path: string): Promise<T> {
    const res = await this.fetchFn(`${this.baseUrl}${path}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${this.cfg.secretKey}` },
    });
    const body = (await res.json()) as T & StripeError;
    if (!res.ok) throw new Error(body.error?.message ?? `Stripe error ${res.status}`);
    return body;
  }

  private toIntent(pi: StripePI, method: PaymentIntent['method'] = 'CARD'): PaymentIntent {
    const captured = pi.amount_received ?? pi.latest_charge?.amount_captured ?? (pi.status === 'succeeded' ? pi.amount : 0);
    return {
      id: pi.id,
      provider: this.name,
      amount: { amount: pi.amount, currency: this.currency },
      status: mapStripeStatus(pi.status),
      method,
      capturedAmount: captured,
      refundedAmount: pi.latest_charge?.amount_refunded ?? 0,
      createdAt: pi.created ? new Date(pi.created * 1000).toISOString() : new Date().toISOString(),
      ...(pi.metadata?.bookingRef ? { bookingRef: pi.metadata.bookingRef } : {}),
    };
  }

  async createIntent(input: CreateIntentInput): Promise<PaymentIntent> {
    this.assertCurrency(input.amount);
    const pi = await this.post<StripePI>(
      '/v1/payment_intents',
      {
        amount: input.amount.amount,
        currency: 'eur',
        capture_method: 'manual',
        'automatic_payment_methods[enabled]': 'true',
        ...(input.bookingRef ? { 'metadata[bookingRef]': input.bookingRef } : {}),
      },
      `intent:${input.idempotencyKey}`,
    );
    return this.toIntent(pi, input.method ?? 'CARD');
  }

  async capture(intentId: string, opts: { idempotencyKey: string }): Promise<PaymentIntent> {
    const pi = await this.post<StripePI>(`/v1/payment_intents/${intentId}/capture`, {}, `capture:${opts.idempotencyKey}`);
    return this.toIntent(pi);
  }

  async refund(intentId: string, amount?: Money): Promise<RefundResult> {
    if (amount) this.assertCurrency(amount);
    const refund = await this.post<StripeRefund>('/v1/refunds', {
      payment_intent: intentId,
      ...(amount ? { amount: amount.amount } : {}),
    });
    // Re-read the intent (with its charge) to derive full vs partial.
    const pi = await this.get<StripePI>(`/v1/payment_intents/${intentId}?expand[]=latest_charge`);
    const captured = pi.latest_charge?.amount_captured ?? pi.amount_received ?? pi.amount;
    const refunded = pi.latest_charge?.amount_refunded ?? refund.amount;
    const status: IntentStatus = refunded >= captured ? 'REFUNDED' : 'PARTIALLY_REFUNDED';
    return { intentId, refunded: { amount: refund.amount, currency: this.currency }, status };
  }

  parseWebhook(raw: string): WebhookEvent {
    // NOTE: production must verify the Stripe-Signature header with the webhook secret.
    const evt = JSON.parse(raw) as { type: string; data?: { object?: StripePI } };
    const pi = evt.data?.object;
    const amount = { amount: pi?.amount ?? 0, currency: this.currency };
    const intentId = pi?.id ?? '';
    if (evt.type === 'payment_intent.succeeded') return { type: 'intent.captured', intentId, amount };
    if (evt.type === 'charge.refunded' || evt.type === 'payment_intent.refunded') return { type: 'intent.refunded', intentId, amount };
    return { type: 'intent.failed', intentId, amount };
  }
}
