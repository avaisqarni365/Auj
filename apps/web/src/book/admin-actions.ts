'use server';

import { revalidatePath } from 'next/cache';
import type { SpecialRequest, SpecialRequestStatus } from '@auj/core-booking';
import { createBackend } from './backend/in-process';
import type { Backend } from './ports';
import { getCurrentUser } from '../auth/session';

// Shares the same singleton key as the booking funnel's getBackend (book/actions.ts).
const globalForBackend = globalThis as unknown as { __aujBookingBackend?: Promise<Backend> };
function getBackend(): Promise<Backend> {
  globalForBackend.__aujBookingBackend ??= createBackend();
  return globalForBackend.__aujBookingBackend;
}

async function assertAdmin(): Promise<void> {
  const me = await getCurrentUser();
  if (me?.role !== 'ADMIN') throw new Error('Forbidden');
}

export interface RequestGroup {
  bookingId: string;
  bookingRef: string;
  customerId: string;
  requests: SpecialRequest[];
}

/** Bookings that carry special requests (ADMIN only), newest-ish first. */
export async function listSpecialRequestsAction(): Promise<RequestGroup[]> {
  await assertAdmin();
  const bookings = await (await getBackend()).booking.listBookings();
  return bookings
    .filter((b) => b.specialRequests && b.specialRequests.length > 0)
    .map((b) => ({
      bookingId: b.id,
      bookingRef: b.bookingRef ?? b.id.slice(0, 8),
      customerId: b.customerId,
      requests: b.specialRequests ?? [],
    }));
}

/** Provider/staff updates a single request's status (ADMIN only). Returns the refreshed list. */
export async function setRequestStatusAction(
  bookingId: string,
  requestId: string,
  status: SpecialRequestStatus,
): Promise<RequestGroup[]> {
  await assertAdmin();
  await (await getBackend()).booking.setRequestStatus(bookingId, requestId, status);
  revalidatePath('/admin');
  return listSpecialRequestsAction();
}
