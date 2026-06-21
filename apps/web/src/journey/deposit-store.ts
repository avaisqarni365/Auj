// Deposit payments — Postgres when DATABASE_URL is set, in-memory fallback. One row per deposit
// intent; the authorized intent id is held server-side until capture. EUR is charged of record.
import { createPool, type DbPool } from '@auj/core-booking/postgres';

export interface DepositRecord {
  id: string;
  pilgrimId: string;
  ref: string;
  amountMinor: number;
  currency: 'EUR';
  intentId: string;
  status: 'pending' | 'paid';
  createdAt: string;
}

export interface DepositStore {
  create(rec: Omit<DepositRecord, 'createdAt'>): Promise<void>;
  byRef(pilgrimId: string, ref: string): Promise<DepositRecord | undefined>;
  markPaid(pilgrimId: string, ref: string): Promise<void>;
  listByPilgrim(pilgrimId: string): Promise<DepositRecord[]>;
}

class InMemoryDeposits implements DepositStore {
  private readonly m = new Map<string, DepositRecord[]>();
  async create(rec: Omit<DepositRecord, 'createdAt'>): Promise<void> {
    const arr = this.m.get(rec.pilgrimId) ?? [];
    arr.unshift({ ...rec, createdAt: new Date().toISOString() });
    this.m.set(rec.pilgrimId, arr);
  }
  async byRef(pilgrimId: string, ref: string): Promise<DepositRecord | undefined> {
    return (this.m.get(pilgrimId) ?? []).find((d) => d.ref === ref);
  }
  async markPaid(pilgrimId: string, ref: string): Promise<void> {
    const d = (this.m.get(pilgrimId) ?? []).find((x) => x.ref === ref);
    if (d) d.status = 'paid';
  }
  async listByPilgrim(pilgrimId: string): Promise<DepositRecord[]> {
    return this.m.get(pilgrimId) ?? [];
  }
}

class PostgresDeposits implements DepositStore {
  constructor(private readonly pool: DbPool) {}
  async create(rec: Omit<DepositRecord, 'createdAt'>): Promise<void> {
    await this.pool.query(
      'INSERT INTO deposits (id, pilgrim_id, ref, amount_minor, currency, intent_id, status) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [rec.id, rec.pilgrimId, rec.ref, rec.amountMinor, rec.currency, rec.intentId, rec.status],
    );
  }
  async byRef(pilgrimId: string, ref: string): Promise<DepositRecord | undefined> {
    const r = await this.pool.query<DepositRecord & { pilgrim_id: string; amount_minor: number; intent_id: string; created_at: string }>(
      "SELECT id, pilgrim_id AS \"pilgrimId\", ref, amount_minor AS \"amountMinor\", currency, intent_id AS \"intentId\", status, to_char(created_at,'YYYY-MM-DD\"T\"HH24:MI:SSZ') AS \"createdAt\" FROM deposits WHERE pilgrim_id = $1 AND ref = $2",
      [pilgrimId, ref],
    );
    return r.rows[0] as unknown as DepositRecord | undefined;
  }
  async markPaid(pilgrimId: string, ref: string): Promise<void> {
    await this.pool.query("UPDATE deposits SET status = 'paid' WHERE pilgrim_id = $1 AND ref = $2", [pilgrimId, ref]);
  }
  async listByPilgrim(pilgrimId: string): Promise<DepositRecord[]> {
    const r = await this.pool.query(
      "SELECT id, pilgrim_id AS \"pilgrimId\", ref, amount_minor AS \"amountMinor\", currency, intent_id AS \"intentId\", status, to_char(created_at,'YYYY-MM-DD\"T\"HH24:MI:SSZ') AS \"createdAt\" FROM deposits WHERE pilgrim_id = $1 ORDER BY created_at DESC",
      [pilgrimId],
    );
    return r.rows as unknown as DepositRecord[];
  }
}

const KEY = Symbol.for('auj.journey.deposit.store');
const g = globalThis as unknown as { [KEY]?: Promise<DepositStore> };

async function init(): Promise<DepositStore> {
  const url = process.env.DATABASE_URL;
  if (!url) return new InMemoryDeposits();
  const pool = createPool(url);
  await pool.query(`CREATE TABLE IF NOT EXISTS deposits (
     id text PRIMARY KEY, pilgrim_id text NOT NULL, ref text NOT NULL, amount_minor bigint NOT NULL,
     currency text NOT NULL DEFAULT 'EUR', intent_id text NOT NULL DEFAULT '', status text NOT NULL DEFAULT 'pending',
     created_at timestamptz NOT NULL DEFAULT now())`);
  return new PostgresDeposits(pool);
}

export function getDepositStore(): Promise<DepositStore> {
  return (g[KEY] ??= init());
}
