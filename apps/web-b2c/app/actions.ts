'use server';

// Server Actions: the booking backend uses node:crypto and in-memory state, so it
// runs on the server. A module-level singleton keeps funnel state across actions in
// dev. (A real build would persist via the DB-backed repositories.)
import type { SearchCriteria } from '@auj/contracts';
import type { Booking, VisaCase } from '@auj/core-booking';
import { createInProcessBackend } from '../src/backend/in-process';
import { placePilgrimageBooking, pollVisaUntilIssued } from '../src/usecases';
import type { PilgrimDraft } from '../src/funnel';
import type { PackageItem } from '@auj/core-booking';
import type { Money } from '@auj/contracts';

const backend = createInProcessBackend();

export async function searchHotelsAction(criteria: SearchCriteria) {
  return backend.booking.searchHotels(criteria);
}

export async function placeBookingAction(input: {
  customer: { fullName: string; email: string };
  pilgrims: PilgrimDraft[];
  items: PackageItem[];
  total: Money;
}): Promise<{ booking: Booking; visaCase: VisaCase }> {
  return placePilgrimageBooking(backend, input);
}

export async function pollVisaAction(bookingId: string): Promise<VisaCase> {
  return pollVisaUntilIssued(backend, bookingId);
}
