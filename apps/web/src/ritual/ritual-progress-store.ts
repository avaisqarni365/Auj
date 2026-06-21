// Ritual wizard progress — Postgres when DATABASE_URL is set, in-memory fallback. One row per user.
import { createPool, type DbPool } from '@auj/core-booking/postgres';
import type { ProgressStore, RitualProgress } from './ritual-progress-types';

class InMemoryProgress implements ProgressStore {
  private readonly m = new Map<string, RitualProgress>();
  async get(userId: string): Promise<RitualProgress | undefined> {
    return this.m.get(userId);
  }
  async save(userId: string, p: RitualProgress): Promise<void> {
    this.m.set(userId, p);
  }
}

class PostgresProgress implements ProgressStore {
  constructor(private readonly pool: DbPool) {}
  async get(userId: string): Promise<RitualProgress | undefined> {
    const r = await this.pool.query<{ data: RitualProgress }>('SELECT data FROM ritual_progress WHERE user_id = $1', [userId]);
    return r.rows[0]?.data;
  }
  async save(userId: string, p: RitualProgress): Promise<void> {
    await this.pool.query('INSERT INTO ritual_progress (user_id, data) VALUES ($1,$2) ON CONFLICT (user_id) DO UPDATE SET data = $2', [userId, p]);
  }
}

const KEY = Symbol.for('auj.ritual.progress.store');
const g = globalThis as unknown as { [KEY]?: Promise<ProgressStore> };

async function init(): Promise<ProgressStore> {
  const url = process.env.DATABASE_URL;
  if (!url) return new InMemoryProgress();
  const pool = createPool(url);
  await pool.query('CREATE TABLE IF NOT EXISTS ritual_progress (user_id text PRIMARY KEY, data jsonb NOT NULL)');
  return new PostgresProgress(pool);
}

export function getProgressStore(): Promise<ProgressStore> {
  return (g[KEY] ??= init());
}
