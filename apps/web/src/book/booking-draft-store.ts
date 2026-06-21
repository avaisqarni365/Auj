// Resumable booking draft — Postgres when DATABASE_URL is set, in-memory fallback. One row per user.
import { createPool, type DbPool } from '@auj/core-booking/postgres';
import type { BookingDraft, BookingDraftStore } from './booking-draft-types';

class InMemoryDrafts implements BookingDraftStore {
  private readonly m = new Map<string, BookingDraft>();
  async get(userId: string): Promise<BookingDraft | undefined> {
    return this.m.get(userId);
  }
  async save(userId: string, draft: BookingDraft): Promise<void> {
    this.m.set(userId, draft);
  }
  async clear(userId: string): Promise<void> {
    this.m.delete(userId);
  }
}

class PostgresDrafts implements BookingDraftStore {
  constructor(private readonly pool: DbPool) {}
  async get(userId: string): Promise<BookingDraft | undefined> {
    const r = await this.pool.query<{ data: BookingDraft }>('SELECT data FROM booking_drafts WHERE user_id = $1', [userId]);
    return r.rows[0]?.data;
  }
  async save(userId: string, draft: BookingDraft): Promise<void> {
    await this.pool.query('INSERT INTO booking_drafts (user_id, data) VALUES ($1,$2) ON CONFLICT (user_id) DO UPDATE SET data = $2', [userId, draft]);
  }
  async clear(userId: string): Promise<void> {
    await this.pool.query('DELETE FROM booking_drafts WHERE user_id = $1', [userId]);
  }
}

const KEY = Symbol.for('auj.booking.draft.store');
const g = globalThis as unknown as { [KEY]?: Promise<BookingDraftStore> };

async function init(): Promise<BookingDraftStore> {
  const url = process.env.DATABASE_URL;
  if (!url) return new InMemoryDrafts();
  const pool = createPool(url);
  await pool.query('CREATE TABLE IF NOT EXISTS booking_drafts (user_id text PRIMARY KEY, data jsonb NOT NULL)');
  return new PostgresDrafts(pool);
}

export function getBookingDraftStore(): Promise<BookingDraftStore> {
  return (g[KEY] ??= init());
}
