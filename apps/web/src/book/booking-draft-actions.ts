'use server';

import { getCurrentUser } from '../auth/session';
import { getBookingDraftStore } from './booking-draft-store';
import type { BookingDraft } from './booking-draft-types';

export async function getBookingDraftAction(): Promise<BookingDraft | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return (await (await getBookingDraftStore()).get(user.id)) ?? null;
}

export async function saveBookingDraftAction(draft: BookingDraft): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  await (await getBookingDraftStore()).save(user.id, draft);
}

export async function clearBookingDraftAction(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  await (await getBookingDraftStore()).clear(user.id);
}
