import {
  OpenTicketSchema,
  type OpenTicketInput,
  type Ticket,
  type TicketAuthor,
  type TicketStatus,
} from './domain';
import { newId, newTicketRef } from './ids';
import type { Clock, TicketRepository } from './ports';

export class SupportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SupportError';
  }
}

export interface SupportServiceDeps {
  tickets: TicketRepository;
  now?: Clock;
}

/**
 * Customer support tickets. Customers open + reply to their own tickets; staff (admin)
 * see every ticket, reply, and move status. Receives its repository by DI so it runs
 * in-memory (dev/test) or Postgres-backed identically.
 */
export class SupportService {
  private readonly now: Clock;

  constructor(private readonly deps: SupportServiceDeps) {
    this.now = deps.now ?? (() => new Date().toISOString());
  }

  async open(user: { id: string; email: string; name: string }, input: OpenTicketInput): Promise<Ticket> {
    const parsed = OpenTicketSchema.parse(input);
    const ts = this.now();
    const ticket: Ticket = {
      id: newId(),
      ref: newTicketRef(),
      userId: user.id,
      userEmail: user.email,
      subject: parsed.subject,
      category: parsed.category,
      status: 'OPEN',
      messages: [{ author: 'USER', authorName: user.name, body: parsed.body, at: ts }],
      createdAt: ts,
      updatedAt: ts,
      ...(parsed.bookingRef ? { bookingRef: parsed.bookingRef } : {}),
    };
    return this.deps.tickets.save(ticket);
  }

  get(id: string): Promise<Ticket | undefined> {
    return this.deps.tickets.get(id);
  }

  listByUser(userId: string): Promise<Ticket[]> {
    return this.deps.tickets.listByUser(userId);
  }

  listAll(): Promise<Ticket[]> {
    return this.deps.tickets.list();
  }

  /** Append a message. A USER reply re-opens a PENDING ticket; a STAFF reply marks it PENDING. */
  async reply(ticketId: string, author: TicketAuthor, authorName: string, body: string): Promise<Ticket> {
    if (!body.trim()) throw new SupportError('Message cannot be empty');
    const t = await this.deps.tickets.get(ticketId);
    if (!t) throw new SupportError('Unknown ticket');
    t.messages.push({ author, authorName, body, at: this.now() });
    if (t.status !== 'CLOSED' && t.status !== 'RESOLVED') {
      t.status = author === 'STAFF' ? 'PENDING' : 'OPEN';
    }
    t.updatedAt = this.now();
    return this.deps.tickets.save(t);
  }

  /** Staff action: set the ticket status explicitly (e.g. RESOLVED / CLOSED). */
  async setStatus(ticketId: string, status: TicketStatus): Promise<Ticket> {
    const t = await this.deps.tickets.get(ticketId);
    if (!t) throw new SupportError('Unknown ticket');
    t.status = status;
    t.updatedAt = this.now();
    return this.deps.tickets.save(t);
  }
}
