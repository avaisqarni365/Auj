// Finance calculations store — in-memory by default; Postgres when DATABASE_URL is set, so saved
// package calculations persist. Mirrors the leads/booking persistence pattern.
import { createPool, type DbPool } from '@auj/core-booking/postgres';
import { computeFinance, type FinanceInputs } from './calc';

export interface SavedCalc {
  id: string;
  ref: string;
  name: string;
  currency: string;
  travellers: number;
  sellingPriceCents: number;
  profitCents: number;
  createdAt: string;
  inputs: FinanceInputs;
}

export interface FinanceStore {
  save(name: string, inputs: FinanceInputs): Promise<SavedCalc>;
  list(): Promise<SavedCalc[]>;
}

function newIds(): { id: string; ref: string } {
  const id =
    globalThis.crypto?.randomUUID?.() ?? `fin-${Date.now()}-${Math.floor(Math.random() * 1e9).toString(16)}`;
  const ref = `FIN-${id.replace(/[^0-9a-fA-F]/g, '').slice(0, 4).toUpperCase()}`;
  return { id, ref };
}

function build(name: string, inputs: FinanceInputs, createdAt: string): SavedCalc {
  const b = computeFinance(inputs);
  const { id, ref } = newIds();
  return {
    id,
    ref,
    name: name.trim() || inputs.packageName.trim() || 'Untitled package',
    currency: inputs.currency,
    travellers: b.travellers,
    sellingPriceCents: b.sellingPriceCents,
    profitCents: b.profitCents,
    createdAt,
    inputs,
  };
}

export class InMemoryFinance implements FinanceStore {
  private readonly m = new Map<string, SavedCalc>();
  async save(name: string, inputs: FinanceInputs): Promise<SavedCalc> {
    const s = build(name, inputs, new Date().toISOString());
    this.m.set(s.id, s);
    return s;
  }
  async list(): Promise<SavedCalc[]> {
    return [...this.m.values()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }
}

interface Row {
  id: string;
  ref: string;
  created_at: string;
  data: Omit<SavedCalc, 'id' | 'ref' | 'createdAt'>;
}
const toSaved = (r: Row): SavedCalc => ({ id: r.id, ref: r.ref, createdAt: r.created_at, ...r.data });

class PostgresFinance implements FinanceStore {
  constructor(private readonly pool: DbPool) {}
  async save(name: string, inputs: FinanceInputs): Promise<SavedCalc> {
    const s = build(name, inputs, new Date().toISOString());
    const { id, ref, createdAt, ...data } = s;
    await this.pool.query('INSERT INTO umrah_finance_calcs (id, ref, created_at, data) VALUES ($1,$2,$3,$4)', [
      id,
      ref,
      createdAt,
      data,
    ]);
    return s;
  }
  async list(): Promise<SavedCalc[]> {
    const r = await this.pool.query<Row>('SELECT id, ref, created_at, data FROM umrah_finance_calcs ORDER BY created_at DESC');
    return r.rows.map(toSaved);
  }
}

const KEY = Symbol.for('auj.finance.store');
const g = globalThis as unknown as { [KEY]?: Promise<FinanceStore> };

async function init(): Promise<FinanceStore> {
  const url = process.env.DATABASE_URL;
  if (!url) return new InMemoryFinance();
  const pool = createPool(url);
  await pool.query(
    'CREATE TABLE IF NOT EXISTS umrah_finance_calcs (id text PRIMARY KEY, ref text NOT NULL, created_at text NOT NULL, data jsonb NOT NULL)',
  );
  return new PostgresFinance(pool);
}

export function getFinanceStore(): Promise<FinanceStore> {
  return (g[KEY] ??= init());
}
