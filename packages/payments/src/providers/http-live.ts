import type { Currency, Money } from '@auj/contracts';
import type {
  CreateIntentInput,
  IntentStatus,
  PaymentIntent,
  PaymentMethod,
  PaymentProvider,
  RefundResult,
  WebhookEvent,
} from '../ports';
import { defaultFetch, type FetchLike } from './http';

// Generic JSON-over-HTTP acquirer adapter — used for the PKR gateway (Safepay / PayFast).
// It speaks a small documented contract; a real integration maps the gateway's own
// payloads/status codes into these shapes inside this class. `fetchFn` is injectable for
// offline tests. PKR acquiring is flagged higher-risk to validate early (assumptions A3).
//
//   POST {base}/intents                  -> GwIntent
//   POST {base}/intents/{id}/capture     -> GwIntent
//   POST {base}/intents/{id}/refunds     -> GwRefund
//   webhook body                         -> { type: WebhookType, intentId, amount }

export interface HttpGatewayConfig {
  name: string;
  currency: Currency;
  baseUrl: string;
  apiKey: string;
  fetchFn?: FetchLike;
}

interface GwIntent {
  id: string;
  status: IntentStatus;
  amount: number;
  capturedAmount?: number;
  refundedAmount?: number;
  bookingRef?: string;
  method?: PaymentMethod;
  createdAt?: string;
}
interface GwRefund {
  refunded: number;
  status: IntentStatus;
}
interface GwError {
  error?: string;
}

export class LiveHttpProvider implements PaymentProvider {
  readonly name: string;
  readonly currency: Currency;
  private readonly fetchFn: FetchLike;

  constructor(private readonly cfg: HttpGatewayConfig) {
    this.name = cfg.name;
    this.currency = cfg.currency;
    this.fetchFn = cfg.fetchFn ?? defaultFetch;
  }

  private assertCurrency(m: Money): void {
    if (m.currency !== this.currency) throw new Error(`${this.name} handles ${this.currency}, got ${m.currency}`);
  }

  private async post<T>(path: string, payload: Record<string, unknown>): Promise<T> {
    const res = await this.fetchFn(`${this.cfg.baseUrl}${path}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.cfg.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const body = (await res.json()) as T & GwError;
    if (!res.ok) throw new Error(body.error ?? `${this.name} error ${res.status}`);
    return body;
  }

  private toIntent(g: GwIntent, method: PaymentMethod): PaymentIntent {
    return {
      id: g.id,
      provider: this.name,
      amount: { amount: g.amount, currency: this.currency },
      status: g.status,
      method: g.method ?? method,
      capturedAmount: g.capturedAmount ?? 0,
      refundedAmount: g.refundedAmount ?? 0,
      createdAt: g.createdAt ?? new Date().toISOString(),
      ...(g.bookingRef ? { bookingRef: g.bookingRef } : {}),
    };
  }

  async createIntent(input: CreateIntentInput): Promise<PaymentIntent> {
    this.assertCurrency(input.amount);
    const g = await this.post<GwIntent>('/intents', {
      amount: input.amount.amount,
      currency: this.currency,
      idempotencyKey: input.idempotencyKey,
      method: input.method ?? 'CARD',
      ...(input.bookingRef ? { bookingRef: input.bookingRef } : {}),
    });
    return this.toIntent(g, input.method ?? 'CARD');
  }

  async capture(intentId: string, opts: { idempotencyKey: string }): Promise<PaymentIntent> {
    const g = await this.post<GwIntent>(`/intents/${intentId}/capture`, { idempotencyKey: opts.idempotencyKey });
    return this.toIntent(g, 'CARD');
  }

  async refund(intentId: string, amount?: Money): Promise<RefundResult> {
    if (amount) this.assertCurrency(amount);
    const r = await this.post<GwRefund>(`/intents/${intentId}/refunds`, amount ? { amount: amount.amount } : {});
    return { intentId, refunded: { amount: r.refunded, currency: this.currency }, status: r.status };
  }

  parseWebhook(raw: string): WebhookEvent {
    const data = JSON.parse(raw) as { type: WebhookEvent['type']; intentId: string; amount: number };
    return { type: data.type, intentId: data.intentId, amount: { amount: data.amount, currency: this.currency } };
  }
}
