import { describe, it, expect } from 'vitest';
import { createInProcessBackend } from './backend/in-process';
import { createHeldBooking, confirmHeldBooking } from './usecases';
import type { PilgrimDraft } from './funnel';

const PILGRIM: PilgrimDraft = {
  firstName: 'Imran',
  lastName: 'Ali',
  passportNumber: 'PK1234567',
  nationality: 'PK',
  dob: '1985-04-12',
  gender: 'M',
};
const TOTAL = { amount: 120000, currency: 'EUR' as const };

describe('two-phase booking (create/hold → authorize+capture → confirm)', () => {
  it('holds first, then captures and confirms across separate calls', async () => {
    const be = createInProcessBackend();

    // Phase 1: customer + pilgrims + draft + HOLD — no payment yet.
    const { bookingId } = await createHeldBooking(be, {
      customer: { fullName: 'Imran Ali', email: 'imran@auj.example' },
      pilgrims: [PILGRIM],
      items: [{ kind: 'HOTEL', offerId: 'htl_mak_1', title: 'Makkah Hotel', net: TOTAL }],
      total: TOTAL,
    });
    const held = await be.booking.getBooking(bookingId);
    expect(held?.status).toBe('HELD');

    // Phase 2: authorize (no capture) then capture — mirrors the card flow's two server hops.
    const { intentId, clientSecret } = await be.payments.authorize({
      amount: TOTAL,
      bookingRef: bookingId,
      idempotencyKey: `${bookingId}:pay`,
      method: 'CARD',
    });
    // Sandbox gateway has no browser step → no clientSecret (live Stripe would set one).
    expect(clientSecret).toBeUndefined();
    const { paymentRef } = await be.payments.capture({
      intentId,
      currency: 'EUR',
      bookingRef: bookingId,
      idempotencyKey: `${bookingId}:pay`,
    });

    // Phase 3: confirm (sets BRNs) + open visa — booking moves past HELD into the visa flow.
    const placed = await confirmHeldBooking(be, { bookingId, paymentRef });
    expect(['CONFIRMED', 'VISA_IN_PROGRESS']).toContain(placed.booking.status);
    expect(placed.booking.id).toBe(bookingId);
    expect(placed.visaCase).toBeDefined();
  });
});
