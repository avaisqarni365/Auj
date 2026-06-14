'use server';

import { revalidatePath } from 'next/cache';
import type { DocumentType } from '@auj/core-booking';
import { getBookingBackend } from './backend/singleton';
import { getCurrentUser } from '../auth/session';

const TYPES: DocumentType[] = ['PASSPORT', 'PHOTO', 'VISA', 'VOUCHER', 'OTHER'];
const toType = (v: FormDataEntryValue | null): DocumentType => (TYPES.includes(v as DocumentType) ? (v as DocumentType) : 'OTHER');

/**
 * Upload a document for a pilgrim. Ownership-checked: the pilgrim must belong to one of the
 * logged-in user's bookings, so a user can't attach documents to someone else's pilgrim.
 */
export async function uploadDocumentAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;

  const pilgrimId = String(formData.get('pilgrimId') ?? '');
  const bookingId = String(formData.get('bookingId') ?? '');
  const file = formData.get('file');
  if (!pilgrimId || !(file instanceof File) || file.size === 0) return;

  const backend = (await getBookingBackend()).booking;
  const owned = (await backend.myBookings(user.email)).some((b) => b.pilgrimIds.includes(pilgrimId));
  if (!owned) return; // not your pilgrim

  await backend.uploadDocument({
    pilgrimId,
    type: toType(formData.get('type')),
    fileName: file.name || 'upload',
    bytes: new Uint8Array(await file.arrayBuffer()),
    contentType: file.type || 'application/octet-stream',
  });
  if (bookingId) revalidatePath(`/bookings/${bookingId}`);
}
