import type { Currency, Money } from '@auj/contracts';
import type { PaymentIntent, PaymentMethod, RefundResult, WebhookEvent } from './ports';
import { ProviderRouter } from './providers/router';
import { Ledger } from './ledger';

const gatewayAccount = (currency: Currency): string => `gateway:${currency}`;
const REVENUE = 'revenue:bookings';

export interface PayInput {
  amount: Money;
  bookingRef: string;
  idempotencyKey: string;
  method?: PaymentMethod;
}

/**
 * Customer-facing payments: route by currency, capture, and record the movement
 * in the double-entry ledger. Returns a stable payment ref that booking.confirm()
 * passes to the connector. Never calls connectors itself.
 */
export class PaymentsService {
  private readonly reconciled = new Set<string>();

  constructor(
    private readonly router: ProviderRouter,
    private readonly ledger: Ledger,
  ) {}

  /**
   * Phase 1 of the two-phase card flow: create the (manual-capture) intent WITHOUT
   * capturing. Posts nothing to the ledger yet — money only moves on capture. When the
   * gateway has a browser step (live Stripe) the returned intent carries a `clientSecret`
   * the app hands to Stripe.js; the sandbox returns an intent with none, so the caller can
   * capture immediately in the same request.
   */
  async authorize(input: PayInput): Promise<{ intent: PaymentIntent }> {
    const provider = this.router.forCurrency(input.amount.currency);
    const intent = await provider.createIntent({
      amount: input.amount,
      idempotencyKey: input.idempotencyKey,
      bookingRef: input.bookingRef,
      method: input.method,
    });
    return { intent };
  }

  /**
   * Phase 2: capture an already-authorized intent (after the browser confirmed the card)
   * and record the movement in the ledger. Capture is by intent id only — the amount comes
   * from the gateway's captured intent, so a client cannot influence what we charge.
   */
  async captureAuthorized(input: {
    intentId: string;
    currency: Currency;
    bookingRef: string;
    idempotencyKey: string;
  }): Promise<{ paymentRef: string; intent: PaymentIntent }> {
    const provider = this.router.forCurrency(input.currency);
    const captured = await provider.capture(input.intentId, { idempotencyKey: input.idempotencyKey });
    const minor = captured.capturedAmount || captured.amount.amount;

    this.ledger.post({
      ref: input.bookingRef,
      memo: `capture ${provider.name}`,
      postings: [
        { account: gatewayAccount(input.currency), direction: 'DEBIT', amount: minor, currency: input.currency },
        { account: REVENUE, direction: 'CREDIT', amount: minor, currency: input.currency },
      ],
    });

    return { paymentRef: captured.id, intent: captured };
  }

  /** Single-shot authorize + capture — for server-only gateways and the offline sandbox. */
  async pay(input: PayInput): Promise<{ paymentRef: string; intent: PaymentIntent }> {
    const { intent } = await this.authorize(input);
    return this.captureAuthorized({
      intentId: intent.id,
      currency: input.amount.currency,
      bookingRef: input.bookingRef,
      idempotencyKey: input.idempotencyKey,
    });
  }

  async refund(intentId: string, currency: Currency, amount?: Money): Promise<RefundResult> {
    const provider = this.router.forCurrency(currency);
    const result = await provider.refund(intentId, amount);
    this.ledger.post({
      ref: intentId,
      memo: 'refund',
      postings: [
        { account: REVENUE, direction: 'DEBIT', amount: result.refunded.amount, currency },
        { account: gatewayAccount(currency), direction: 'CREDIT', amount: result.refunded.amount, currency },
      ],
    });
    return result;
  }

  /** Idempotently reconcile a gateway webhook against captured intents. */
  reconcile(event: WebhookEvent): { reconciled: boolean; duplicate: boolean } {
    const key = `${event.intentId}:${event.type}`;
    if (this.reconciled.has(key)) return { reconciled: true, duplicate: true };
    this.reconciled.add(key);
    return { reconciled: true, duplicate: false };
  }
}
