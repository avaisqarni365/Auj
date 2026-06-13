import type pg from 'pg';
import type { Ticket, TicketCategory, TicketMessage, TicketStatus } from '../domain';
import type { TicketRepository } from '../ports';

interface TicketRow {
  id: string;
  ref: string;
  user_id: string;
  user_email: string;
  subject: string;
  category: string;
  status: string;
  booking_ref: string | null;
  messages: TicketMessage[]; // jsonb
  created_at: string;
  updated_at: string;
}

function rowToTicket(r: TicketRow): Ticket {
  return {
    id: r.id,
    ref: r.ref,
    userId: r.user_id,
    userEmail: r.user_email,
    subject: r.subject,
    category: r.category as TicketCategory,
    status: r.status as TicketStatus,
    messages: r.messages,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    ...(r.booking_ref != null ? { bookingRef: r.booking_ref } : {}),
  };
}

class PgTicketRepository implements TicketRepository {
  constructor(private readonly pool: pg.Pool) {}
  async get(id: string): Promise<Ticket | undefined> {
    const { rows } = await this.pool.query<TicketRow>('SELECT * FROM tickets WHERE id = $1', [id]);
    return rows[0] ? rowToTicket(rows[0]) : undefined;
  }
  async save(t: Ticket): Promise<Ticket> {
    await this.pool.query(
      `INSERT INTO tickets (id, ref, user_id, user_email, subject, category, status, booking_ref, messages, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,$11)
       ON CONFLICT (id) DO UPDATE SET status=$7, booking_ref=$8, messages=$9::jsonb, updated_at=$11`,
      [t.id, t.ref, t.userId, t.userEmail, t.subject, t.category, t.status, t.bookingRef ?? null, JSON.stringify(t.messages), t.createdAt, t.updatedAt],
    );
    return t;
  }
  async list(): Promise<Ticket[]> {
    const { rows } = await this.pool.query<TicketRow>('SELECT * FROM tickets ORDER BY updated_at DESC');
    return rows.map(rowToTicket);
  }
  async listByUser(userId: string): Promise<Ticket[]> {
    const { rows } = await this.pool.query<TicketRow>('SELECT * FROM tickets WHERE user_id = $1 ORDER BY updated_at DESC', [userId]);
    return rows.map(rowToTicket);
  }
}

export function createPostgresTicketRepository(pool: pg.Pool): TicketRepository {
  return new PgTicketRepository(pool);
}
