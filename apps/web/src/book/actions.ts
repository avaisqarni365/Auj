'use server';

// Server Actions for the booking funnel. The backend runs server-side (node:crypto + DB):
// Postgres-backed when DATABASE_URL is set, in-memory otherwise. Bookings are attached to
// the logged-in user (their account is the customer).
import type { CateringOffer, GroundOffer, Money, PackageMode, SearchCriteria } from '@auj/contracts';
import type { PackageItem, SpecialRequestCategory, VisaCase } from '@auj/core-booking';
import { bookingConfirmation } from '@auj/notifications';
import { placePilgrimageBooking, pollVisaUntilIssued, type PlacedBooking } from './usecases';
import type { PilgrimDraft } from './funnel';
import { getCurrentUser } from '../auth/session';
import { getBookingBackend as getBackend } from './backend/singleton';
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

export async function placeBookingAction(input: {
  pilgrims: PilgrimDraft[];
  items: PackageItem[];
  total: Money;
  mode?: PackageMode;
  rawdahDate?: string;
  gift?: { recipientName: string; recipientEmail?: string; message?: string };
  specialRequests?: Array<{ category: SpecialRequestCategory; note?: string }>;
}): Promise<PlacedBooking> {
  const user = await getCurrentUser();
  const lead = input.pilgrims[0];
  const customer = {
    fullName: user?.displayName ?? (lead ? `${lead.firstName} ${lead.lastName}` : 'Guest'),
    email: user?.email ?? 'guest@auj.example',
  };
  const placed = await placePilgrimageBooking(await getBackend(), { ...input, customer });

  // Best-effort confirmation email (never fail the booking on a notify error).
  try {
    await getNotifier().send(
      bookingConfirmation({
        to: customer.email,
        bookingRef: placed.booking.bookingRef ?? placed.booking.id.slice(0, 12),
        pilgrims: placed.booking.pilgrimIds.length,
      }),
    );
  } catch {
    /* swallow — notifications are non-critical */
  }
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
