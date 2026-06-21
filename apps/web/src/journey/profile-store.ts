// Pilgrim profile store — Postgres when DATABASE_URL is set, in-memory fallback. No localStorage;
// source of truth is the DB, keyed by the signed-in user's id.
import { createPool, type DbPool } from '@auj/core-booking/postgres';
import type { PilgrimProfile, ProfileInput, ProfileStore } from './profile-types';

class InMemoryProfiles implements ProfileStore {
  private readonly m = new Map<string, PilgrimProfile>();
  async get(id: string): Promise<PilgrimProfile | undefined> {
    return this.m.get(id);
  }
  async save(id: string, input: ProfileInput): Promise<PilgrimProfile> {
    const p: PilgrimProfile = { pilgrimId: id, ...input };
    this.m.set(id, p);
    return p;
  }
}

class PostgresProfiles implements ProfileStore {
  constructor(private readonly pool: DbPool) {}
  async get(id: string): Promise<PilgrimProfile | undefined> {
    const r = await this.pool.query<{ data: ProfileInput }>('SELECT data FROM pilgrim_profiles WHERE pilgrim_id = $1', [id]);
    return r.rows[0] ? { pilgrimId: id, ...r.rows[0].data } : undefined;
  }
  async save(id: string, input: ProfileInput): Promise<PilgrimProfile> {
    await this.pool.query(
      'INSERT INTO pilgrim_profiles (pilgrim_id, data) VALUES ($1,$2) ON CONFLICT (pilgrim_id) DO UPDATE SET data = $2',
      [id, input],
    );
    return { pilgrimId: id, ...input };
  }
}

const KEY = Symbol.for('auj.pilgrim.profile.store');
const g = globalThis as unknown as { [KEY]?: Promise<ProfileStore> };

async function init(): Promise<ProfileStore> {
  const url = process.env.DATABASE_URL;
  if (!url) return new InMemoryProfiles();
  const pool = createPool(url);
  await pool.query('CREATE TABLE IF NOT EXISTS pilgrim_profiles (pilgrim_id text PRIMARY KEY, data jsonb NOT NULL)');
  return new PostgresProfiles(pool);
}

export function getProfileStore(): Promise<ProfileStore> {
  return (g[KEY] ??= init());
}
