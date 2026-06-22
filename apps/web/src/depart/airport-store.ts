// Departure-airport content persistence — Postgres when DATABASE_URL is set, in-memory fallback.
// `depart_airports` is seeded from airport-content.ts on first init; editable later via the Admin CMS.
// The full DepartAirport is persisted as jsonb; region + sort are mirrored as columns for ordering.
// SERVER-ONLY: this is the only module that imports pg — airport-content.ts stays client-safe.
import { createPool, type DbPool } from '@auj/core-booking/postgres';
import { DEPART_AIRPORTS, type DepartAirport } from './airport-content';

export interface AirportStore {
  listAirports(): Promise<DepartAirport[]>;
  getAirport(code: string): Promise<DepartAirport | undefined>;
  upsertAirport(a: DepartAirport): Promise<void>;
  deleteAirport(code: string): Promise<void>;
}

class InMemoryAirports implements AirportStore {
  private readonly map = new Map<string, DepartAirport>();
  constructor() {
    DEPART_AIRPORTS.forEach((a) => this.map.set(a.code, a));
  }
  async listAirports(): Promise<DepartAirport[]> {
    return [...this.map.values()];
  }
  async getAirport(code: string): Promise<DepartAirport | undefined> {
    return this.map.get(code);
  }
  async upsertAirport(a: DepartAirport): Promise<void> {
    this.map.set(a.code, a);
  }
  async deleteAirport(code: string): Promise<void> {
    this.map.delete(code);
  }
}

class PostgresAirports implements AirportStore {
  constructor(private readonly pool: DbPool) {}
  async listAirports(): Promise<DepartAirport[]> {
    const r = await this.pool.query<{ data: DepartAirport }>(
      'SELECT data FROM depart_airports ORDER BY region, sort, code',
    );
    return r.rows.map((row) => row.data);
  }
  async getAirport(code: string): Promise<DepartAirport | undefined> {
    const r = await this.pool.query<{ data: DepartAirport }>(
      'SELECT data FROM depart_airports WHERE code = $1',
      [code],
    );
    return r.rows[0]?.data;
  }
  async upsertAirport(a: DepartAirport): Promise<void> {
    await this.pool.query(
      `INSERT INTO depart_airports (code, region, sort, data)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (code) DO UPDATE SET region = EXCLUDED.region, data = EXCLUDED.data`,
      [a.code, a.region, 0, a],
    );
  }
  async deleteAirport(code: string): Promise<void> {
    await this.pool.query('DELETE FROM depart_airports WHERE code = $1', [code]);
  }
}

// Idempotent: inserts each bundled airport only if its code row doesn't already exist,
// preserving the bundled seed order in `sort` (ON CONFLICT DO NOTHING keeps edits intact).
async function seed(pool: DbPool): Promise<void> {
  for (let i = 0; i < DEPART_AIRPORTS.length; i++) {
    const a = DEPART_AIRPORTS[i];
    if (!a) continue;
    await pool
      .query(
        `INSERT INTO depart_airports (code, region, sort, data)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (code) DO NOTHING`,
        [a.code, a.region, i, a],
      )
      .catch(() => undefined);
  }
}

const KEY = Symbol.for('auj.depart.airport.store');
const g = globalThis as unknown as { [KEY]?: Promise<AirportStore> };

async function init(): Promise<AirportStore> {
  const url = process.env.DATABASE_URL;
  if (!url) return new InMemoryAirports();
  const pool = createPool(url);
  await pool.query(
    `CREATE TABLE IF NOT EXISTS depart_airports (
       code   text PRIMARY KEY,
       region text NOT NULL,
       sort   integer NOT NULL DEFAULT 0,
       data   jsonb NOT NULL
     )`,
  );
  await seed(pool);
  return new PostgresAirports(pool);
}

export function getAirportStore(): Promise<AirportStore> {
  return (g[KEY] ??= init());
}
