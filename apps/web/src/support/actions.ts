'use server';

import { revalidatePath } from 'next/cache';
import type { TicketCategory } from '@auj/support';
import { getSupport } from './backend';
import { getCurrentUser } from '../auth/session';

export interface TicketFormState {
  error?: string;
  ok?: boolean;
}

const CATEGORIES: TicketCategory[] = ['BOOKING', 'VISA', 'PAYMENT', 'GENERAL'];
const toCategory = (v: FormDataEntryValue | null): TicketCategory =>
  CATEGORIES.includes(v as TicketCategory) ? (v as TicketCategory) : 'GENERAL';

/** Open a new ticket for the logged-in user (useFormState action). */
export async function openTicketAction(_prev: TicketFormState, formData: FormData): Promise<TicketFormState> {
  const user = await getCurrentUser();
  if (!user) return { error: 'Please log in to contact support' };
  try {
    await (await getSupport()).open(
      { id: user.id, email: user.email, name: user.displayName },
      {
        subject: String(formData.get('subject') ?? ''),
        category: toCategory(formData.get('category')),
        body: String(formData.get('body') ?? ''),
        ...(formData.get('bookingRef') ? { bookingRef: String(formData.get('bookingRef')) } : {}),
      },
    );
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Could not open ticket' };
  }
  revalidatePath('/support');
  return { ok: true };
}

/** Customer reply to their own ticket (plain form action, no client state needed). */
export async function replyTicketAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  const ticketId = String(formData.get('ticketId') ?? '');
  const body = String(formData.get('body') ?? '');
  if (!ticketId || !body.trim()) return;
  const svc = await getSupport();
  const ticket = await svc.get(ticketId);
  if (!ticket || ticket.userId !== user.id) return; // only your own tickets
  await svc.reply(ticketId, 'USER', user.displayName, body);
  revalidatePath('/support');
}
