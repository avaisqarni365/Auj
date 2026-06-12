import type { Currency, Money } from '@auj/contracts';
import type {
  CreateIntentInput,
  PaymentIntent,
  PaymentProvider,
  RefundResult,
  WebhookEvent,
} from '../ports';
import { uuidv7 } from '../ids';

/**
 * In-memory, deterministic stand-in for a real acquirer. Models intents,
 * idempotent create/capture, and full/partial refunds. Swap in the real SDK
 * (Stripe / PKR gateway) behind the same PaymentProvider port — no caller changes.
 */
export class SandboxPaymentProvider implements PaymentProvider {
  private readonly intents = new Map<string, PaymentIntent>();
  private readonly idempotency = new Map<string, string>(); // scoped key -> intentId

  constructor(
    readonly name: string,
    readonly currency: Currency,
  ) {}

  private assertCurrency(money: Money): void {
    if (money.currency !== this.currency) {
      throw new Error(`${this.name} handles ${this.currency}, got ${money.currency}`);
    }
  }

  async createIntent(input: CreateIntentInput): Promise<PaymentIntent> {
    this.assertCurrency(input.amount);
    const key = `intent:${input.idempotencyKey}`;
    const existingId = this.idempotency.get(key);
    if (existingId) return this.intents.get(existingId)!;

    const intent: PaymentIntent = {
      id: uuidv7(),
      provider: this.name,
      amount: input.amount,
      status: 'REQUIRES_CAPTURE',
      bookingRef: input.bookingRef,
      method: input.method ?? 'CARD',
      capturedAmount: 0,
      refundedAmount: 0,
      createdAt: new Date().toISOString(),
    };
    this.intents.set(intent.id, intent);
    this.idempotency.set(key, intent.id);
    return intent;
  }

  async capture(intentId: string, opts: { idempotencyKey: string }): Promise<PaymentIntent> {
    const intent = this.intents.get(intentId);
    if (!intent) throw new Error(`Unknown intent: ${intentId}`);

    const key = `capture:${opts.idempotencyKey}`;
    if (this.idempotency.has(key)) return intent; // idempotent replay
    if (intent.status !== 'REQUIRES_CAPTURE') {
      throw new Error(`Cannot capture an intent in status ${intent.status}`);
    }
    intent.status = 'CAPTURED';
    intent.capturedAmount = intent.amount.amount;
    this.idempotency.set(key, intentId);
    return intent;
  }

  async refund(intentId: string, amount?: Money): Promise<RefundResult> {
    const intent = this.intents.get(intentId);
    if (!intent) throw new Error(`Unknown intent: ${intentId}`);
    if (intent.status !== 'CAPTURED' && intent.status !== 'PARTIALLY_REFUNDED') {
      throw new Error(`Cannot refund an intent in status ${intent.status}`);
    }
    if (amount) this.assertCurrency(amount);

    const remaining = intent.capturedAmount - intent.refundedAmount;
    const refundMinor = amount?.amount ?? remaining;
    if (refundMinor <= 0 || refundMinor > remaining) {
      throw new Error(`Invalid refund amount ${refundMinor}; remaining ${remaining}`);
    }
    intent.refundedAmount += refundMinor;
    intent.status = intent.refundedAmount >= intent.capturedAmount ? 'REFUNDED' : 'PARTIALLY_REFUNDED';
    return { intentId, refunded: { amount: refundMinor, currency: this.currency }, status: intent.status };
  }

  parseWebhook(raw: string): WebhookEvent {
    const data = JSON.parse(raw) as { type: WebhookEvent['type']; intentId: string; amount: number };
    return { type: data.type, intentId: data.intentId, amount: { amount: data.amount, currency: this.currency } };
  }

  /** Test/inspection helper (not part of the port). */
  getIntent(id: string): PaymentIntent | undefined {
    return this.intents.get(id);
  }
}
