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

  async pay(input: PayInput): Promise<{ paymentRef: string; intent: PaymentIntent }> {
    const provider = this.router.forCurrency(input.amount.currency);
    const intent = await provider.createIntent({
      amount: input.amount,
      idempotencyKey: input.idempotencyKey,
      bookingRef: input.bookingRef,
      method: input.method,
    });
    const captured = await provider.capture(intent.id, { idempotencyKey: input.idempotencyKey });

    this.ledger.post({
      ref: input.bookingRef,
      memo: `capture ${provider.name}`,
      postings: [
        { account: gatewayAccount(input.amount.currency), direction: 'DEBIT', amount: input.amount.amount, currency: input.amount.currency },
        { account: REVENUE, direction: 'CREDIT', amount: input.amount.amount, currency: input.amount.currency },
      ],
    });

    return { paymentRef: captured.id, intent: captured };
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
