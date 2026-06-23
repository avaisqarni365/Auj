'use server';

// Server Actions for the booking funnel. The backend runs server-side (node:crypto + DB):
// Postgres-backed when DATABASE_URL is set, in-memory otherwise. Bookings are attached to
// the logged-in user (their account is the customer).
import type { CateringOffer, GroundOffer, Money, PackageMode, SearchCriteria } from '@auj/contracts';
import type { PackageItem, SpecialRequestCategory, VisaCase } from '@auj/core-booking';
import { bookingConfirmation } from '@auj/notifications';
import { headers } from 'next/headers';
import { confirmHeldBooking, createHeldBooking, pollVisaUntilIssued, type PlacedBooking } from './usecases';
import type { PilgrimDraft } from './funnel';
import { getCurrentUser } from '../auth/session';
import { issuePackageCompliance } from '../admin/compliance-store';
import { getBookingBackend as getBackend } from './backend/singleton';
import type { Backend } from './ports';
import { putPending, takePending } from './backend/pending';
import { getNotifier } from '../notifications/notifier';

export async function searchHotelsAction(criteria: SearchCriteria) {
  const backend = await getBackend();
  return backend.booking.searchHotels(criteria);
}

export async function searchAddonsAction(
  criteria: SearchCriteria,
): Promise<{ ziyarah: GroundOffer[]; catering: CateringOffer[] }> {
  const backend = await getBackend();
  const [ziyarah, catering] = await Promise.all([
    backend.booking.searchZiyarah(criteria),
    backend.booking.searchCatering(criteria),
  ]);
  return { ziyarah, catering };
}

export interface PlaceBookingInput {
  pilgrims: PilgrimDraft[];
  items: PackageItem[];
  total: Money;
  mode?: PackageMode;
  rawdahDate?: string;
  gift?: { recipientName: string; recipientEmail?: string; message?: string };
  specialRequests?: Array<{ category: SpecialRequestCategory; note?: string }>;
}

/** Booking is placed and confirmed (single-shot path — sandbox / server-only gateway). */
export interface CheckoutDone {
  status: 'done';
  placed: PlacedBooking;
}
/** Card needs browser confirmation (live Stripe). The booking is HELD until finalize. */
export interface CheckoutRequiresCard {
  status: 'requires_card';
  bookingId: string;
  clientSecret: string;
  publishableKey: string;
}
export type CheckoutResult = CheckoutDone | CheckoutRequiresCard;

/** Best-effort confirmation email — never fails the booking on a notify error. */
async function sendConfirmation(email: string, placed: PlacedBooking): Promise<void> {
  try {
    await getNotifier().send(
      bookingConfirmation({
        to: email,
        bookingRef: placed.booking.bookingRef ?? placed.booking.id.slice(0, 12),
        pilgrims: placed.booking.pilgrimIds.length,
      }),
    );
  } catch {
    /* swallow — notifications are non-critical */
  }
}

function customerFor(user: { displayName?: string; email: string } | null | undefined, lead?: PilgrimDraft) {
  return {
    fullName: user?.displayName ?? (lead ? `${lead.firstName} ${lead.lastName}` : 'Guest'),
    email: user?.email ?? 'guest@auj.example',
  };
}

// EU Package Travel Directive: on every confirmed package booking, issue the insolvency
// certificate, record pre-contract consent and open the 6-month refund window. Best-effort —
// a compliance-store hiccup must not fail an already-paid booking (the admin console can re-issue).
async function recordCompliance(placed: PlacedBooking, customerName: string, eurMinor: number): Promise<void> {
  try {
    const ip = headers().get('x-forwarded-for')?.split(',')[0]?.trim() || '0.0.0.0';
    await issuePackageCompliance({
      bookingRef: placed.booking.bookingRef ?? placed.booking.id,
      customerId: placed.booking.customerId,
      customerName,
      eurMinor,
      ip,
    });
  } catch {
    /* swallow — never fail a paid booking on a compliance-record error */
  }
}

/**
 * Start checkout: create + hold the booking, then authorize the payment. When the gateway
 * has a browser step (live Stripe) we return its clientSecret + publishable key and leave
 * the booking HELD for finalizeBookingAction. Otherwise (offline sandbox / PKR) we capture
 * and confirm immediately and return the placed booking.
 */
export async function startCheckoutAction(input: PlaceBookingInput): Promise<CheckoutResult> {
  const user = await getCurrentUser();
  const customer = customerFor(user, input.pilgrims[0]);
  const backend = await getBackend();
  const { bookingId } = await createHeldBooking(backend, { ...input, customer });

  const { intentId, clientSecret } = await backend.payments.authorize({
    amount: input.total,
    bookingRef: bookingId,
    idempotencyKey: `${bookingId}:pay`,
    method: 'CARD',
  });

  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  if (clientSecret && publishableKey) {
    putPending(bookingId, {
      intentId,
      currency: input.total.currency as 'EUR' | 'PKR',
      ...(input.rawdahDate ? { rawdahDate: input.rawdahDate } : {}),
      ...(input.total.currency === 'EUR' ? { amountMinor: input.total.amount } : {}),
    });
    return { status: 'requires_card', bookingId, clientSecret, publishableKey };
  }

  // No browser step — capture now and finish.
  const { paymentRef } = await backend.payments.capture({
    intentId,
    currency: input.total.currency as 'EUR' | 'PKR',
    bookingRef: bookingId,
    idempotencyKey: `${bookingId}:pay`,
  });
  const placed = await confirmHeldBooking(backend, {
    bookingId,
    paymentRef,
    ...(input.rawdahDate ? { rawdahDate: input.rawdahDate } : {}),
  });
  await recordCompliance(placed, customer.fullName, input.total.currency === 'EUR' ? input.total.amount : 0);
  await sendConfirmation(customer.email, placed);
  return { status: 'done', placed };
}

/**
 * Finalize a card booking after the browser confirmed it with Stripe.js: capture the
 * server-recorded intent for this HELD booking, then confirm + open visa. Ownership-checked;
 * the intent id comes from our pending store, never from the client.
 */
export async function finalizeBookingAction(bookingId: string): Promise<PlacedBooking> {
  const user = await getCurrentUser();
  const backend: Backend = await getBackend();

  const email = user?.email ?? 'guest@auj.example';
  const owned = await backend.booking.myBooking(email, bookingId);
  if (!owned) throw new Error('Booking not found');

  const pending = takePending(bookingId);
  if (!pending) throw new Error('No pending payment for this booking');

  const { paymentRef } = await backend.payments.capture({
    intentId: pending.intentId,
    currency: pending.currency,
    bookingRef: bookingId,
    idempotencyKey: `${bookingId}:pay`,
  });
  const placed = await confirmHeldBooking(backend, {
    bookingId,
    paymentRef,
    ...(pending.rawdahDate ? { rawdahDate: pending.rawdahDate } : {}),
  });
  await recordCompliance(placed, user?.displayName ?? 'Guest', pending.amountMinor ?? 0);
  await sendConfirmation(email, placed);
  return placed;
}

export interface RedeemState {
  error?: string;
  ok?: boolean;
  ref?: string;
  recipientName?: string;
}

/** Redeem a gift voucher by code (public — the code is the bearer token). */
export async function redeemVoucherAction(_prev: RedeemState, formData: FormData): Promise<RedeemState> {
  const code = String(formData.get('code') ?? '').trim().toUpperCase();
  if (!code) return { error: 'Enter your voucher code' };
  try {
    const booking = await (await getBackend()).booking.redeemGift(code);
    return { ok: true, ref: booking.bookingRef ?? booking.id.slice(0, 8), recipientName: booking.gift?.recipientName ?? '' };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Could not redeem voucher' };
  }
}

export async function pollVisaAction(bookingId: string): Promise<VisaCase> {
  return pollVisaUntilIssued(await getBackend(), bookingId);
}
