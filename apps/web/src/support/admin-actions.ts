'use server';

import { revalidatePath } from 'next/cache';
import type { Ticket, TicketStatus } from '@auj/support';
import { ticketReply } from '@auj/notifications';
import { getSupport } from './backend';
import { getCurrentUser } from '../auth/session';
import { getNotifier } from '../notifications/notifier';

async function assertAdmin(): Promise<string> {
  const me = await getCurrentUser();
  if (me?.role !== 'ADMIN') throw new Error('Forbidden');
  return me.displayName;
}

/** All tickets (ADMIN only), newest first. */
export async function listAllTicketsAction(): Promise<Ticket[]> {
  await assertAdmin();
  return (await getSupport()).listAll();
}

/** Staff reply to any ticket (ADMIN only). Returns the refreshed list. */
export async function staffReplyAction(ticketId: string, body: string): Promise<Ticket[]> {
  const name = await assertAdmin();
  const svc = await getSupport();
  if (body.trim()) {
    const ticket = await svc.reply(ticketId, 'STAFF', name, body);
    // Best-effort email to the ticket owner.
    try {
      await getNotifier().send(ticketReply({ to: ticket.userEmail, ref: ticket.ref, subject: ticket.subject, body }));
    } catch {
      /* notifications are non-critical */
    }
  }
  revalidatePath('/admin');
  return svc.listAll();
}

/** Staff set ticket status (ADMIN only). Returns the refreshed list. */
export async function setTicketStatusAction(ticketId: string, status: TicketStatus): Promise<Ticket[]> {
  await assertAdmin();
  await (await getSupport()).setStatus(ticketId, status);
  revalidatePath('/admin');
  return (await getSupport()).listAll();
}
