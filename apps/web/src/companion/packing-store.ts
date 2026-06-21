// Packing list persistence — Postgres when DATABASE_URL is set, in-memory fallback.
// One row per (pilgrim, profile): the chosen stay length + which items are ticked.
import { createPool, type DbPool } from '@auj/core-booking/postgres';
import type { PackingProfile } from './packing';
import type { PackingState, PackingStore } from './packing-types';

const key = (userId: string, profile: PackingProfile): string => `${userId}::${profile}`;

class InMemoryPacking implements PackingStore {
  private readonly m = new Map<string, PackingState>();
  async get(userId: string, profile: PackingProfile): Promise<PackingState | undefined> {
    return this.m.get(key(userId, profile));
  }
  async save(userId: string, profile: PackingProfile, state: PackingState): Promise<void> {
    this.m.set(key(userId, profile), state);
  }
}

class PostgresPacking implements PackingStore {
  constructor(private readonly pool: DbPool) {}
  async get(userId: string, profile: PackingProfile): Promise<PackingState | undefined> {
    const r = await this.pool.query<{ days: number; checked: Record<string, boolean> }>(
      'SELECT days, checked FROM packing_lists WHERE pilgrim_id = $1 AND profile = $2',
      [userId, profile],
    );
    const row = r.rows[0];
    return row ? { days: row.days, checked: row.checked ?? {} } : undefined;
  }
  async save(userId: string, profile: PackingProfile, state: PackingState): Promise<void> {
    await this.pool.query(
      `INSERT INTO packing_lists (pilgrim_id, profile, days, checked, updated_at)
       VALUES ($1, $2, $3, $4, now())
       ON CONFLICT (pilgrim_id, profile) DO UPDATE SET days = $3, checked = $4, updated_at = now()`,
      [userId, profile, state.days, JSON.stringify(state.checked)],
    );
  }
}

const KEY = Symbol.for('auj.companion.packing.store');
const g = globalThis as unknown as { [KEY]?: Promise<PackingStore> };

async function init(): Promise<PackingStore> {
  const url = process.env.DATABASE_URL;
  if (!url) return new InMemoryPacking();
  const pool = createPool(url);
  await pool.query(
    `CREATE TABLE IF NOT EXISTS packing_lists (
       pilgrim_id text NOT NULL,
       profile    text NOT NULL,
       days       integer NOT NULL,
       checked    jsonb NOT NULL DEFAULT '{}'::jsonb,
       updated_at timestamptz NOT NULL DEFAULT now(),
       PRIMARY KEY (pilgrim_id, profile)
     )`,
  );
  return new PostgresPacking(pool);
}

export function getPackingStore(): Promise<PackingStore> {
  return (g[KEY] ??= init());
}
