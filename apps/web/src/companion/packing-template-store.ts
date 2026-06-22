// Packing-organizer default template persistence — Postgres when DATABASE_URL is set,
// in-memory fallback. The whole SectionDef[] template lives in a single row (id=1), seeded
// from PACKING_TEMPLATE_SEED and editable via the Admin CRUD. Server-only: the sole pg importer.
import { createPool, type DbPool } from '@auj/core-booking/postgres';
import { PACKING_TEMPLATE_SEED, type SectionDef } from './packing';

export interface PackingTemplateStore {
  getTemplate(): Promise<SectionDef[]>;
  setTemplate(sections: SectionDef[]): Promise<void>;
}

class InMemoryPackingTemplate implements PackingTemplateStore {
  private data: SectionDef[] = PACKING_TEMPLATE_SEED;
  async getTemplate(): Promise<SectionDef[]> {
    return this.data;
  }
  async setTemplate(sections: SectionDef[]): Promise<void> {
    this.data = sections;
  }
}

class PostgresPackingTemplate implements PackingTemplateStore {
  constructor(private readonly pool: DbPool) {}
  async getTemplate(): Promise<SectionDef[]> {
    const r = await this.pool.query<{ data: SectionDef[] }>('SELECT data FROM packing_template WHERE id = 1');
    const row = r.rows[0];
    return row?.data ?? PACKING_TEMPLATE_SEED;
  }
  async setTemplate(sections: SectionDef[]): Promise<void> {
    // jsonb bound as the raw object — node-pg serializes it (matches content-store.ts).
    await this.pool.query(
      'INSERT INTO packing_template (id, data) VALUES (1, $1) ON CONFLICT (id) DO UPDATE SET data = $1',
      [sections],
    );
  }
}

// Idempotent: inserts the seed as id=1 only when the single row does not exist yet.
async function seed(pool: DbPool): Promise<void> {
  await pool.query('INSERT INTO packing_template (id, data) VALUES (1, $1) ON CONFLICT (id) DO NOTHING', [PACKING_TEMPLATE_SEED]);
}

const KEY = Symbol.for('auj.packing.template.store');
const g = globalThis as unknown as { [KEY]?: Promise<PackingTemplateStore> };

async function init(): Promise<PackingTemplateStore> {
  const url = process.env.DATABASE_URL;
  if (!url) return new InMemoryPackingTemplate();
  const pool = createPool(url);
  await pool.query(
    `CREATE TABLE IF NOT EXISTS packing_template (
       id   integer PRIMARY KEY DEFAULT 1,
       data jsonb NOT NULL
     )`,
  );
  await seed(pool);
  return new PostgresPackingTemplate(pool);
}

export function getPackingTemplateStore(): Promise<PackingTemplateStore> {
  return (g[KEY] ??= init());
}
