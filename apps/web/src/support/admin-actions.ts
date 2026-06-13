'use server';

import { revalidatePath } from 'next/cache';
import type { Ticket, TicketStatus } from '@auj/support';
import { getSupport } from './backend';
import { getCurrentUser } from '../auth/session';

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
  if (body.trim()) await (await getSupport()).reply(ticketId, 'STAFF', name, body);
  revalidatePath('/admin');
  return (await getSupport()).listAll();
}

/** Staff set ticket status (ADMIN only). Returns the refreshed list. */
export async function setTicketStatusAction(ticketId: string, status: TicketStatus): Promise<Ticket[]> {
  await assertAdmin();
  await (await getSupport()).setStatus(ticketId, status);
  revalidatePath('/admin');
  return (await getSupport()).listAll();
}
