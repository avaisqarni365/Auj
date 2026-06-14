'use server';

import { revalidatePath } from 'next/cache';
import type { DocumentType, SpecialRequest, SpecialRequestStatus } from '@auj/core-booking';
import { getCurrentUser } from '../auth/session';
import { getBookingBackend as getBackend } from './backend/singleton';

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

export interface DocRow {
  id: string;
  pilgrimName: string;
  type: DocumentType;
  fileRef: string;
  verified: boolean;
  uploadedAt: string;
}

/** Every uploaded document with its pilgrim's name (ADMIN only); unverified first. */
export async function listDocumentsAction(): Promise<DocRow[]> {
  await assertAdmin();
  const b = (await getBackend()).booking;
  const docs = await b.listAllDocuments();
  const pilgrims = await b.pilgrims([...new Set(docs.map((d) => d.pilgrimId))]);
  const nameById = new Map(pilgrims.map((p) => [p.id, `${p.firstName} ${p.lastName}`.trim()]));
  return docs
    .map((d) => ({ id: d.id, pilgrimName: nameById.get(d.pilgrimId) ?? d.pilgrimId.slice(0, 8), type: d.type, fileRef: d.fileRef, verified: d.verified, uploadedAt: d.uploadedAt }))
    .sort((a, c) => Number(a.verified) - Number(c.verified)); // unverified first
}

/** Mark a document verified (ADMIN only). Returns the refreshed list. */
export async function verifyDocumentAction(documentId: string): Promise<DocRow[]> {
  await assertAdmin();
  await (await getBackend()).booking.verifyDocument(documentId);
  revalidatePath('/admin');
  return listDocumentsAction();
}
