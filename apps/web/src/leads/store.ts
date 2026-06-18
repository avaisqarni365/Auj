// Leads store — in-memory by default; Postgres when DATABASE_URL is set, so Smart Visit
// inquiries persist across restarts. Mirrors the booking/auth/support persistence pattern.
import { createPool, type DbPool } from '@auj/core-booking/postgres';
import { buildInquiry, type Inquiry, type InquiryInput, type InquiryStatus } from './inquiry';

export interface LeadsStore {
  create(input: InquiryInput): Promise<Inquiry>;
  list(): Promise<Inquiry[]>;
  setStatus(id: string, status: InquiryStatus): Promise<Inquiry | undefined>;
}

export class InMemoryLeads implements LeadsStore {
  private readonly m = new Map<string, Inquiry>();
  async create(input: InquiryInput): Promise<Inquiry> {
    const i = buildInquiry(input, new Date().toISOString());
    this.m.set(i.id, i);
    return i;
  }
  async list(): Promise<Inquiry[]> {
    return [...this.m.values()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }
  async setStatus(id: string, status: InquiryStatus): Promise<Inquiry | undefined> {
    const i = this.m.get(id);
    if (!i) return undefined;
    i.status = status;
    return i;
  }
}

interface Row { id: string; ref: string; status: InquiryStatus; created_at: string; data: InquiryInput }
const toInquiry = (r: Row): Inquiry => ({ id: r.id, ref: r.ref, status: r.status, createdAt: r.created_at, ...r.data });

class PostgresLeads implements LeadsStore {
  constructor(private readonly pool: DbPool) {}
  async create(input: InquiryInput): Promise<Inquiry> {
    const i = buildInquiry(input, new Date().toISOString());
    const { id, ref, status, createdAt, ...data } = i;
    await this.pool.query('INSERT INTO inquiries (id, ref, status, created_at, data) VALUES ($1,$2,$3,$4,$5)', [id, ref, status, createdAt, data]);
    return i;
  }
  async list(): Promise<Inquiry[]> {
    const r = await this.pool.query<Row>('SELECT id, ref, status, created_at, data FROM inquiries ORDER BY created_at DESC');
    return r.rows.map(toInquiry);
  }
  async setStatus(id: string, status: InquiryStatus): Promise<Inquiry | undefined> {
    const r = await this.pool.query<Row>('UPDATE inquiries SET status=$2 WHERE id=$1 RETURNING id, ref, status, created_at, data', [id, status]);
    return r.rows[0] ? toInquiry(r.rows[0]) : undefined;
  }
}

const KEY = Symbol.for('auj.leads.store');
const g = globalThis as unknown as { [KEY]?: Promise<LeadsStore> };

async function build(): Promise<LeadsStore> {
  const url = process.env.DATABASE_URL;
  if (!url) return new InMemoryLeads();
  const pool = createPool(url);
  await pool.query(
    'CREATE TABLE IF NOT EXISTS inquiries (id text PRIMARY KEY, ref text NOT NULL, status text NOT NULL, created_at text NOT NULL, data jsonb NOT NULL)',
  );
  return new PostgresLeads(pool);
}

/** Lazily-built singleton (cached on globalThis to survive HMR). */
export function getLeads(): Promise<LeadsStore> {
  return (g[KEY] ??= build());
}
