'use server';

// Server Actions: the booking backend runs server-side (node:crypto + DB). It is
// Postgres-backed when DATABASE_URL is set, in-memory otherwise. A lazily-created
// singleton (with migrate() applied once) is reused across actions.
import type { Money, SearchCriteria } from '@auj/contracts';
import type { Booking, PackageItem, VisaCase } from '@auj/core-booking';
import { createBackend } from '../src/backend/in-process';
import type { Backend } from '../src/ports';
import { placePilgrimageBooking, pollVisaUntilIssued } from '../src/usecases';
import type { PilgrimDraft } from '../src/funnel';

let backendPromise: Promise<Backend> | undefined;
function getBackend(): Promise<Backend> {
  backendPromise ??= createBackend();
  return backendPromise;
}

export async function searchHotelsAction(criteria: SearchCriteria) {
  const backend = await getBackend();
  return backend.booking.searchHotels(criteria);
}

export async function placeBookingAction(input: {
  customer: { fullName: string; email: string };
  pilgrims: PilgrimDraft[];
  items: PackageItem[];
  total: Money;
}): Promise<{ booking: Booking; visaCase: VisaCase }> {
  return placePilgrimageBooking(await getBackend(), input);
}

export async function pollVisaAction(bookingId: string): Promise<VisaCase> {
  return pollVisaUntilIssued(await getBackend(), bookingId);
}
