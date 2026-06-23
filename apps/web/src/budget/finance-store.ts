// Financial-Planner cost-preset persistence — Postgres when DATABASE_URL is set, in-memory fallback.
// One row (id = 1) holds the two line groups ({package, private}) as jsonb; seeded from FINANCE_SEED
// on first init, editable later via the Admin CRUD. Server-only (imports pg).
import { createPool, type DbPool } from '@auj/core-booking/postgres';
import { FINANCE_SEED, type FinanceLines } from './finance-data';

export interface FinanceStore {
  getLines(): Promise<FinanceLines>;
  setLines(lines: FinanceLines): Promise<void>;
}

class InMemoryFinance implements FinanceStore {
  private lines: FinanceLines = FINANCE_SEED;
  async getLines(): Promise<FinanceLines> {
    return this.lines;
  }
  async setLines(lines: FinanceLines): Promise<void> {
    this.lines = lines;
  }
}

class PostgresFinance implements FinanceStore {
  constructor(private readonly pool: DbPool) {}
  async getLines(): Promise<FinanceLines> {
    const r = await this.pool.query<{ data: FinanceLines }>('SELECT data FROM finance_lines WHERE id = 1');
    return r.rows[0]?.data ?? FINANCE_SEED;
  }
  async setLines(lines: FinanceLines): Promise<void> {
    // Bind jsonb as the RAW object (matches content-store.ts) — never JSON.stringify.
    await this.pool.query(
      'INSERT INTO finance_lines (id, data) VALUES (1, $1) ON CONFLICT (id) DO UPDATE SET data = $1',
      [lines],
    );
  }
}

// Idempotent: seeds id = 1 from FINANCE_SEED only when no row exists yet.
async function seed(pool: DbPool): Promise<void> {
  await pool.query('INSERT INTO finance_lines (id, data) VALUES (1, $1) ON CONFLICT (id) DO NOTHING', [FINANCE_SEED]);
}

const KEY = Symbol.for('auj.budget.finance.store');
const g = globalThis as unknown as { [KEY]?: Promise<FinanceStore> };

async function init(): Promise<FinanceStore> {
  const url = process.env.DATABASE_URL;
  if (!url) return new InMemoryFinance();
  const pool = createPool(url);
  await pool.query(
    'CREATE TABLE IF NOT EXISTS finance_lines (id integer PRIMARY KEY DEFAULT 1, data jsonb NOT NULL)',
  );
  await seed(pool);
  return new PostgresFinance(pool);
}

export function getFinanceStore(): Promise<FinanceStore> {
  return (g[KEY] ??= init());
}
