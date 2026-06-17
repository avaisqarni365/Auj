import type { Currency, Money } from '@auj/contracts';

export type PaymentMethod = 'CARD' | 'SEPA' | 'WALLET';

export type IntentStatus =
  | 'REQUIRES_CAPTURE'
  | 'CAPTURED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED'
  | 'FAILED';

export interface CreateIntentInput {
  amount: Money;
  /** Required: makes createIntent + capture idempotent (PCI/double-charge safety). */
  idempotencyKey: string;
  bookingRef?: string;
  method?: PaymentMethod;
}

export interface PaymentIntent {
  id: string;
  provider: string;
  amount: Money;
  status: IntentStatus;
  bookingRef?: string;
  method: PaymentMethod;
  capturedAmount: number; // minor units
  refundedAmount: number; // minor units
  createdAt: string;
  /**
   * Opaque token the client uses to collect + confirm the card with the gateway's
   * browser SDK (Stripe.js) BEFORE the server captures. Only populated by gateways
   * that have a client-side confirmation step (live Stripe). Undefined for the
   * in-memory sandbox and server-only gateways — those capture in one server call.
   */
  clientSecret?: string;
}

export interface RefundResult {
  intentId: string;
  refunded: Money;
  status: IntentStatus;
}

export type WebhookType = 'intent.captured' | 'intent.refunded' | 'intent.failed';

export interface WebhookEvent {
  type: WebhookType;
  intentId: string;
  amount: Money;
}

/**
 * Gateway abstraction. One provider per currency. We never see PANs — the gateway
 * tokenizes; we only hold intent ids and tokens. Real adapters (Stripe SDK, PKR
 * gateway SDK) implement this same port.
 */
export interface PaymentProvider {
  readonly name: string;
  readonly currency: Currency;
  createIntent(input: CreateIntentInput): Promise<PaymentIntent>;
  capture(intentId: string, opts: { idempotencyKey: string }): Promise<PaymentIntent>;
  refund(intentId: string, amount?: Money): Promise<RefundResult>;
  parseWebhook(raw: string): WebhookEvent;
}
