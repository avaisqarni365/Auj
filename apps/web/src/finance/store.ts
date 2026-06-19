// Finance calculations store — in-memory by default; Postgres when DATABASE_URL is set. Persists
// saved package calculations AND an activity (audit) log of every save. Mirrors the leads pattern.
import { createPool, type DbPool } from '@auj/core-booking/postgres';
import { computeFinance, type FinanceInputs } from './calc';
import type { ActivityEntry, FinanceStore, SaveOpts, SavedCalc } from './types';

export type { ActivityEntry, FinanceStatus, FinanceStore, SaveOpts, SavedCalc } from './types';
export { FINANCE_STATUSES } from './types';

function uuid(): string {
  return globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.floor(Math.random() * 1e9).toString(16)}`;
}
function newRef(id: string): string {
  return `FIN-${id.replace(/[^0-9a-fA-F]/g, '').slice(0, 4).toUpperCase()}`;
}

function build(name: string, inputs: FinanceInputs, createdAt: string, opts: SaveOpts): SavedCalc {
  const b = computeFinance(inputs);
  const id = uuid();
  return {
    id,
    ref: newRef(id),
    name: name.trim() || inputs.packageName.trim() || 'Untitled package',
    currency: inputs.currency,
    travellers: b.travellers,
    status: opts.status,
    note: opts.note,
    sellingPriceCents: b.sellingPriceCents,
    profitCents: b.profitCents,
    createdAt,
    inputs,
  };
}

function activityFor(s: SavedCalc, actor: string): ActivityEntry {
  return { id: uuid(), ref: s.ref, at: s.createdAt, actor, action: 'saved', status: s.status, note: s.note };
}

export class InMemoryFinance implements FinanceStore {
  private readonly m = new Map<string, SavedCalc>();
  private readonly acts: ActivityEntry[] = [];
  async save(name: string, inputs: FinanceInputs, opts: SaveOpts): Promise<SavedCalc> {
    const s = build(name, inputs, new Date().toISOString(), opts);
    this.m.set(s.id, s);
    this.acts.unshift(activityFor(s, opts.actor));
    return s;
  }
  async list(): Promise<SavedCalc[]> {
    return [...this.m.values()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }
  async listActivity(): Promise<ActivityEntry[]> {
    return [...this.acts];
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
  async save(name: string, inputs: FinanceInputs, opts: SaveOpts): Promise<SavedCalc> {
    const s = build(name, inputs, new Date().toISOString(), opts);
    const { id, ref, createdAt, ...data } = s;
    await this.pool.query('INSERT INTO umrah_finance_calcs (id, ref, created_at, data) VALUES ($1,$2,$3,$4)', [id, ref, createdAt, data]);
    const a = activityFor(s, opts.actor);
    await this.pool.query(
      'INSERT INTO umrah_finance_activity (id, ref, at, actor, action, status, note) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [a.id, a.ref, a.at, a.actor, a.action, a.status, a.note ?? null],
    );
    return s;
  }
  async list(): Promise<SavedCalc[]> {
    const r = await this.pool.query<Row>('SELECT id, ref, created_at, data FROM umrah_finance_calcs ORDER BY created_at DESC');
    return r.rows.map(toSaved);
  }
  async listActivity(): Promise<ActivityEntry[]> {
    const r = await this.pool.query<ActivityEntry & { note: string | null }>(
      'SELECT id, ref, at, actor, action, status, note FROM umrah_finance_activity ORDER BY at DESC LIMIT 100',
    );
    return r.rows.map((e) => ({ ...e, note: e.note ?? undefined }));
  }
}

const KEY = Symbol.for('auj.finance.store');
const g = globalThis as unknown as { [KEY]?: Promise<FinanceStore> };

async function init(): Promise<FinanceStore> {
  const url = process.env.DATABASE_URL;
  if (!url) return new InMemoryFinance();
  const pool = createPool(url);
  await pool.query('CREATE TABLE IF NOT EXISTS umrah_finance_calcs (id text PRIMARY KEY, ref text NOT NULL, created_at text NOT NULL, data jsonb NOT NULL)');
  await pool.query('CREATE TABLE IF NOT EXISTS umrah_finance_activity (id text PRIMARY KEY, ref text NOT NULL, at text NOT NULL, actor text NOT NULL, action text NOT NULL, status text NOT NULL, note text)');
  return new PostgresFinance(pool);
}

export function getFinanceStore(): Promise<FinanceStore> {
  return (g[KEY] ??= init());
}
