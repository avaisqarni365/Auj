// Personal-diary default-config persistence — Postgres when DATABASE_URL is set, in-memory fallback.
// The whole DiaryDefaults (quranTarget + nafl list + dua checklist) lives in a single row (id=1),
// seeded from DIARY_DEFAULTS_SEED and editable via the Admin CRUD. Server-only: the sole pg importer.
import { createPool, type DbPool } from '@auj/core-booking/postgres';
import { DIARY_DEFAULTS_SEED, type DiaryDefaults } from './diary';

export interface DiaryDefaultsStore {
  getDefaults(): Promise<DiaryDefaults>;
  setDefaults(d: DiaryDefaults): Promise<void>;
}

class InMemoryDiaryDefaults implements DiaryDefaultsStore {
  private data: DiaryDefaults = DIARY_DEFAULTS_SEED;
  async getDefaults(): Promise<DiaryDefaults> {
    return this.data;
  }
  async setDefaults(d: DiaryDefaults): Promise<void> {
    this.data = d;
  }
}

class PostgresDiaryDefaults implements DiaryDefaultsStore {
  constructor(private readonly pool: DbPool) {}
  async getDefaults(): Promise<DiaryDefaults> {
    const r = await this.pool.query<{ data: DiaryDefaults }>('SELECT data FROM diary_defaults WHERE id = 1');
    const row = r.rows[0];
    return row?.data ?? DIARY_DEFAULTS_SEED;
  }
  async setDefaults(d: DiaryDefaults): Promise<void> {
    // jsonb bound as the raw object — node-pg serializes it (matches packing-template-store.ts).
    await this.pool.query(
      'INSERT INTO diary_defaults (id, data) VALUES (1, $1) ON CONFLICT (id) DO UPDATE SET data = $1',
      [d],
    );
  }
}

// Idempotent: inserts the seed as id=1 only when the single row does not exist yet.
async function seed(pool: DbPool): Promise<void> {
  await pool.query('INSERT INTO diary_defaults (id, data) VALUES (1, $1) ON CONFLICT (id) DO NOTHING', [DIARY_DEFAULTS_SEED]);
}

const KEY = Symbol.for('auj.diary.defaults.store');
const g = globalThis as unknown as { [KEY]?: Promise<DiaryDefaultsStore> };

async function init(): Promise<DiaryDefaultsStore> {
  const url = process.env.DATABASE_URL;
  if (!url) return new InMemoryDiaryDefaults();
  const pool = createPool(url);
  await pool.query(
    `CREATE TABLE IF NOT EXISTS diary_defaults (
       id   integer PRIMARY KEY DEFAULT 1,
       data jsonb NOT NULL
     )`,
  );
  await seed(pool);
  return new PostgresDiaryDefaults(pool);
}

export function getDiaryDefaultsStore(): Promise<DiaryDefaultsStore> {
  return (g[KEY] ??= init());
}
