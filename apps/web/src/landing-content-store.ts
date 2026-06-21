// Landing CMS store — in-memory by default; Postgres when DATABASE_URL is set. Holds admin edits
// of landing copy (per key + locale), layered over the i18n defaults by landingCopy(). Server-only.
import { createPool, type DbPool } from '@auj/core-booking/postgres';
import type { LandingOverrides } from './landing-content';

export interface LandingContentStore {
  getOverrides(): Promise<LandingOverrides>;
  setOverride(key: string, locale: string, value: string): Promise<void>;
}

class InMemoryLandingContent implements LandingContentStore {
  private readonly m: LandingOverrides = {};
  async getOverrides(): Promise<LandingOverrides> {
    return this.m;
  }
  async setOverride(key: string, locale: string, value: string): Promise<void> {
    (this.m[key] ??= {})[locale] = value;
  }
}

class PostgresLandingContent implements LandingContentStore {
  constructor(private readonly pool: DbPool) {}
  async getOverrides(): Promise<LandingOverrides> {
    const r = await this.pool.query<{ key: string; locale: string; value: string }>('SELECT key, locale, value FROM landing_content');
    const out: LandingOverrides = {};
    for (const row of r.rows) (out[row.key] ??= {})[row.locale] = row.value;
    return out;
  }
  async setOverride(key: string, locale: string, value: string): Promise<void> {
    await this.pool.query(
      'INSERT INTO landing_content (key, locale, value) VALUES ($1,$2,$3) ON CONFLICT (key, locale) DO UPDATE SET value = $3',
      [key, locale, value],
    );
  }
}

const KEY = Symbol.for('auj.landing.content.store');
const g = globalThis as unknown as { [KEY]?: Promise<LandingContentStore> };

async function init(): Promise<LandingContentStore> {
  const url = process.env.DATABASE_URL;
  if (!url) return new InMemoryLandingContent();
  const pool = createPool(url);
  await pool.query('CREATE TABLE IF NOT EXISTS landing_content (key text NOT NULL, locale text NOT NULL, value text NOT NULL, PRIMARY KEY (key, locale))');
  return new PostgresLandingContent(pool);
}

export function getLandingContentStore(): Promise<LandingContentStore> {
  return (g[KEY] ??= init());
}
