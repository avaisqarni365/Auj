// Finance deal book — Postgres when DATABASE_URL is set, in-memory fallback otherwise. No localStorage.
// Stores inputs (the deal); results are recomputed server-side via calc.buildAssessment when needed.
import { createPool, type DbPool } from '@auj/core-booking/postgres';
import type { Deal, DealInput, DealsStore } from './deals-types';

function uuid(): string {
  return globalThis.crypto?.randomUUID?.() ?? `deal-${Date.now()}-${Math.floor(Math.random() * 1e9).toString(16)}`;
}

type DealData = Omit<Deal, 'id' | 'createdAt'>;
const dataOf = (input: DealInput, updatedAt: string): DealData => ({
  name: input.name.trim() || 'Untitled deal',
  channel: input.channel,
  pax: input.pax,
  bufferPct: input.bufferPct,
  markupPct: input.markupPct,
  feePct: input.feePct,
  commissionPct: input.commissionPct,
  costs: input.costs,
  updatedAt,
});

class InMemoryDeals implements DealsStore {
  private readonly m = new Map<string, Deal>();
  async list(): Promise<Deal[]> {
    return [...this.m.values()].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  }
  async save(input: DealInput): Promise<Deal> {
    const now = new Date().toISOString();
    const id = input.id ?? uuid();
    const deal: Deal = { id, createdAt: this.m.get(id)?.createdAt ?? now, ...dataOf(input, now) };
    this.m.set(id, deal);
    return deal;
  }
  async remove(id: string): Promise<void> {
    this.m.delete(id);
  }
}

interface Row {
  id: string;
  created_at: string;
  data: DealData;
}
const toDeal = (r: Row): Deal => ({ id: r.id, createdAt: r.created_at, ...r.data });

class PostgresDeals implements DealsStore {
  constructor(private readonly pool: DbPool) {}
  async list(): Promise<Deal[]> {
    const r = await this.pool.query<Row>("SELECT id, created_at, data FROM umrah_finance_deals ORDER BY (data->>'updatedAt') DESC");
    return r.rows.map(toDeal);
  }
  async save(input: DealInput): Promise<Deal> {
    const now = new Date().toISOString();
    const id = input.id ?? uuid();
    await this.pool.query(
      'INSERT INTO umrah_finance_deals (id, created_at, data) VALUES ($1,$2,$3) ON CONFLICT (id) DO UPDATE SET data = $3',
      [id, now, dataOf(input, now)],
    );
    const r = await this.pool.query<Row>('SELECT id, created_at, data FROM umrah_finance_deals WHERE id = $1', [id]);
    return r.rows[0] ? toDeal(r.rows[0]) : { id, createdAt: now, ...dataOf(input, now) };
  }
  async remove(id: string): Promise<void> {
    await this.pool.query('DELETE FROM umrah_finance_deals WHERE id = $1', [id]);
  }
}

const KEY = Symbol.for('auj.finance.deals.store');
const g = globalThis as unknown as { [KEY]?: Promise<DealsStore> };

async function init(): Promise<DealsStore> {
  const url = process.env.DATABASE_URL;
  if (!url) return new InMemoryDeals();
  const pool = createPool(url);
  await pool.query('CREATE TABLE IF NOT EXISTS umrah_finance_deals (id text PRIMARY KEY, created_at text NOT NULL, data jsonb NOT NULL)');
  return new PostgresDeals(pool);
}

export function getDealsStore(): Promise<DealsStore> {
  return (g[KEY] ??= init());
}
