import { describe, it, expect } from 'vitest';
import { Ledger } from './ledger';
import { ProviderRouter } from './providers/router';
import { StripeProvider } from './providers/stripe';
import { PkrGatewayProvider } from './providers/pkr';
import { PaymentsService } from './payments-service';

function setup() {
  const ledger = new Ledger();
  const router = new ProviderRouter().register(new StripeProvider()).register(new PkrGatewayProvider());
  return { ledger, payments: new PaymentsService(router, ledger) };
}

describe('PaymentsService', () => {
  it('pays in EUR, returns a stable ref, and records a balanced ledger entry', async () => {
    const { ledger, payments } = setup();
    const { paymentRef, intent } = await payments.pay({
      amount: { amount: 120000, currency: 'EUR' },
      bookingRef: 'BK1',
      idempotencyKey: 'idem-1',
    });
    expect(paymentRef).toBe(intent.id);
    expect(intent.status).toBe('CAPTURED');
    expect(ledger.balance('revenue:bookings', 'EUR')).toBe(120000);
    expect(ledger.isBalanced()).toBe(true);
  });

  it('routes PKR through the PKR gateway', async () => {
    const { payments, ledger } = setup();
    const { intent } = await payments.pay({
      amount: { amount: 31080000, currency: 'PKR' },
      bookingRef: 'BK2',
      idempotencyKey: 'idem-pkr',
    });
    expect(intent.provider).toBe('safepay');
    expect(ledger.balance('revenue:bookings', 'PKR')).toBe(31080000);
  });

  it('refunds and posts the reversing entry', async () => {
    const { ledger, payments } = setup();
    const { intent } = await payments.pay({ amount: { amount: 10000, currency: 'EUR' }, bookingRef: 'BK3', idempotencyKey: 'i' });
    await payments.refund(intent.id, 'EUR', { amount: 4000, currency: 'EUR' });
    expect(ledger.balance('revenue:bookings', 'EUR')).toBe(6000);
    expect(ledger.isBalanced()).toBe(true);
  });

  it('two-phase: authorize does not move money; captureAuthorized does', async () => {
    const { ledger, payments } = setup();
    const { intent } = await payments.authorize({
      amount: { amount: 120000, currency: 'EUR' },
      bookingRef: 'BK4',
      idempotencyKey: 'idem-2phase',
    });
    // Authorized but not captured — ledger is still empty.
    expect(intent.status).toBe('REQUIRES_CAPTURE');
    expect(ledger.balance('revenue:bookings', 'EUR')).toBe(0);

    const { paymentRef, intent: captured } = await payments.captureAuthorized({
      intentId: intent.id,
      currency: 'EUR',
      bookingRef: 'BK4',
      idempotencyKey: 'idem-2phase',
    });
    expect(captured.status).toBe('CAPTURED');
    expect(paymentRef).toBe(intent.id);
    expect(ledger.balance('revenue:bookings', 'EUR')).toBe(120000);
    expect(ledger.isBalanced()).toBe(true);
  });

  it('reconciles webhooks idempotently', () => {
    const { payments } = setup();
    const event = { type: 'intent.captured' as const, intentId: 'i1', amount: { amount: 1, currency: 'EUR' as const } };
    expect(payments.reconcile(event).duplicate).toBe(false);
    expect(payments.reconcile(event).duplicate).toBe(true);
  });
});
