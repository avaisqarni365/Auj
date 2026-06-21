// Leads store — in-memory by default; Postgres when DATABASE_URL is set, so Smart Visit
// inquiries persist across restarts. Mirrors the booking/auth/support persistence pattern.
import { createPool, type DbPool } from '@auj/core-booking/postgres';
import { buildInquiry, type Inquiry, type InquiryInput, type InquiryStatus } from './inquiry';

// Normalized lead projection (CRM table per migration 15): id, name, contact, intent, locale,
// GDPR consent + created_at. Written alongside the rich inquiry on every Smart Visit submission.
export interface LeadRecord {
  id: string;
  name: string;
  contact: string;
  intent: string;
  locale: string;
  consent: boolean;
  createdAt: string;
}

export function toLead(i: Inquiry): LeadRecord {
  return {
    id: i.id,
    name: i.name,
    contact: i.email || i.phone || '',
    intent: `${i.partyKind} · ${i.makkahNights}+${i.madinahNights} nts`,
    locale: i.lang,
    consent: i.consent,
    createdAt: i.createdAt,
  };
}

export interface LeadsStore {
  create(input: InquiryInput): Promise<Inquiry>;
  list(): Promise<Inquiry[]>;
  setStatus(id: string, status: InquiryStatus): Promise<Inquiry | undefined>;
  /** Normalized lead rows (CRM projection) — newest first. */
  listLeads(): Promise<LeadRecord[]>;
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
  async listLeads(): Promise<LeadRecord[]> {
    return (await this.list()).map(toLead);
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
    const lead = toLead(i);
    await this.pool.query(
      'INSERT INTO leads (id, name, contact, intent, locale, consent, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO NOTHING',
      [lead.id, lead.name, lead.contact, lead.intent, lead.locale, lead.consent, lead.createdAt],
    );
    return i;
  }
  async listLeads(): Promise<LeadRecord[]> {
    const r = await this.pool.query<LeadRecord & { createdat?: string }>(
      'SELECT id, name, contact, intent, locale, consent, created_at AS "createdAt" FROM leads ORDER BY created_at DESC',
    );
    return r.rows as unknown as LeadRecord[];
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
  await pool.query(
    'CREATE TABLE IF NOT EXISTS leads (id text PRIMARY KEY, name text NOT NULL DEFAULT \'\', contact text NOT NULL DEFAULT \'\', intent text NOT NULL DEFAULT \'\', locale text NOT NULL DEFAULT \'en\', consent boolean NOT NULL DEFAULT false, created_at text NOT NULL)',
  );
  return new PostgresLeads(pool);
}

/** Lazily-built singleton (cached on globalThis to survive HMR). */
export function getLeads(): Promise<LeadsStore> {
  return (g[KEY] ??= build());
}
