// Content-overrides store — in-memory by default; Postgres when DATABASE_URL is set. Holds admin
// edits/translations of ritual step text (title/subtitle/intro per language), layered over the code
// defaults by the merge in content-overrides.ts. Server-only (imports pg).
import { createPool, type DbPool } from '@auj/core-booking/postgres';
import { cleanOverride, type ContentOverrides, type StepOverride } from './content-overrides';

export interface ContentStore {
  getOverrides(): Promise<ContentOverrides>;
  setOverride(stepKey: string, lang: string, fields: StepOverride): Promise<void>;
}

class InMemoryContent implements ContentStore {
  private readonly m: ContentOverrides = {};
  async getOverrides(): Promise<ContentOverrides> {
    return this.m;
  }
  async setOverride(stepKey: string, lang: string, fields: StepOverride): Promise<void> {
    (this.m[stepKey] ??= {})[lang] = cleanOverride(fields);
  }
}

class PostgresContent implements ContentStore {
  constructor(private readonly pool: DbPool) {}
  async getOverrides(): Promise<ContentOverrides> {
    const r = await this.pool.query<{ step_key: string; lang: string; data: StepOverride }>(
      'SELECT step_key, lang, data FROM umrah_content_overrides',
    );
    const out: ContentOverrides = {};
    for (const row of r.rows) (out[row.step_key] ??= {})[row.lang] = row.data;
    return out;
  }
  async setOverride(stepKey: string, lang: string, fields: StepOverride): Promise<void> {
    await this.pool.query(
      'INSERT INTO umrah_content_overrides (step_key, lang, data) VALUES ($1,$2,$3) ON CONFLICT (step_key, lang) DO UPDATE SET data = $3',
      [stepKey, lang, cleanOverride(fields)],
    );
  }
}

const KEY = Symbol.for('auj.ritual.content.store');
const g = globalThis as unknown as { [KEY]?: Promise<ContentStore> };

async function init(): Promise<ContentStore> {
  const url = process.env.DATABASE_URL;
  if (!url) return new InMemoryContent();
  const pool = createPool(url);
  await pool.query(
    'CREATE TABLE IF NOT EXISTS umrah_content_overrides (step_key text NOT NULL, lang text NOT NULL, data jsonb NOT NULL, PRIMARY KEY (step_key, lang))',
  );
  return new PostgresContent(pool);
}

export function getContentStore(): Promise<ContentStore> {
  return (g[KEY] ??= init());
}
