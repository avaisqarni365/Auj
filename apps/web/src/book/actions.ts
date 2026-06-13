'use server';

// Server Actions for the booking funnel. The backend runs server-side (node:crypto + DB):
// Postgres-backed when DATABASE_URL is set, in-memory otherwise. Bookings are attached to
// the logged-in user (their account is the customer).
import type { CateringOffer, GroundOffer, Money, PackageMode, SearchCriteria } from '@auj/contracts';
import type { PackageItem, VisaCase } from '@auj/core-booking';
import { createBackend } from './backend/in-process';
import type { Backend } from './ports';
import { placePilgrimageBooking, pollVisaUntilIssued, type PlacedBooking } from './usecases';
import type { PilgrimDraft } from './funnel';
import { getCurrentUser } from '../auth/session';

let backendPromise: Promise<Backend> | undefined;
function getBackend(): Promise<Backend> {
  backendPromise ??= createBackend();
  return backendPromise;
}

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
}): Promise<PlacedBooking> {
  const user = await getCurrentUser();
  const lead = input.pilgrims[0];
  const customer = {
    fullName: user?.displayName ?? (lead ? `${lead.firstName} ${lead.lastName}` : 'Guest'),
    email: user?.email ?? 'guest@auj.example',
  };
  return placePilgrimageBooking(await getBackend(), { ...input, customer });
}

export async function pollVisaAction(bookingId: string): Promise<VisaCase> {
  return pollVisaUntilIssued(await getBackend(), bookingId);
}
