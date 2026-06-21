// Durable, agency-scoped persistence for the B2B portal (migration 12).
// Postgres when DATABASE_URL is set, in-memory fallback otherwise. The DB is the source of
// truth for the agency, its wallet and double-entry ledger, and its quotes. Every query is
// scoped by agency_id — one agent never sees another agency's wallet or quotes.
import { createPool, type DbPool } from '@auj/core-booking/postgres';
import type { Money } from '@auj/contracts';
import type { JournalEntry } from '@auj/payments';
import { uuidv7 } from './ids';
import type { AgentTier, QuoteLine, QuoteStatus } from './domain';

export const SEED_TOPUP_MINOR = 6_000_000; // €60,000 demo float on first onboarding
export const DEFAULT_CREDIT_LIMIT_MINOR = 600_000; // €6,000

const WALLET_ACCT = (agencyId: string): string => `wallet:${agencyId}`;

export interface AgencyRow {
  id: string;
  name: string;
  email: string;
  tier: AgentTier;
  status: 'APPROVED';
  createdAt: string;
}
export interface WalletSnapshot {
  balanceMinor: number;
  creditLimitMinor: number;
  currency: Money['currency'];
}
export type LedgerKind = 'TOPUP' | 'BOOKING' | 'ADJUST';
export interface LedgerLeg {
  ts: string;
  ref: string;
  kind: LedgerKind;
  memo: string;
  debitMinor: number; // wallet debit (money out)
  creditMinor: number; // wallet credit (money in)
}
export interface QuoteRecord {
  id: string;
  ref: string;
  lines: QuoteLine[];
  netMinor: number;
  markupMinor: number;
  sellMinor: number;
  currency: Money['currency'];
  status: QuoteStatus;
  createdAt: string;
}

export interface AgentDb {
  loadOrCreateAgency(userId: string, name: string, email: string, tier: AgentTier): Promise<AgencyRow>;
  wallet(agencyId: string): Promise<WalletSnapshot>;
  ledger(agencyId: string): Promise<LedgerLeg[]>;
  append(agencyId: string, leg: Omit<LedgerLeg, 'ts'>): Promise<WalletSnapshot>;
  saveQuote(agencyId: string, q: Omit<QuoteRecord, 'id' | 'ref' | 'createdAt' | 'status'>): Promise<QuoteRecord>;
  listQuotes(agencyId: string): Promise<QuoteRecord[]>;
  convertQuote(agencyId: string, id: string): Promise<void>;
  /** Public lookup for a shared quote link (by human ref, across agencies). */
  findByRef(ref: string): Promise<QuoteRecord | undefined>;
}

// Reconstruct balanced double-entry journal entries from the wallet legs (for the existing
// statement/wallet screens). Each entry posts the wallet leg + a balancing contra leg.
export function toJournalEntries(agencyId: string, legs: LedgerLeg[], currency: Money['currency']): JournalEntry[] {
  const acct = WALLET_ACCT(agencyId);
  return legs.map((l, i) => {
    const amount = l.creditMinor || l.debitMinor;
    const walletCredit = l.creditMinor > 0;
    const contra = walletCredit ? 'external:funding' : 'revenue:bookings';
    return {
      id: `${l.ref}-${i}`,
      ref: l.ref,
      memo: l.memo,
      createdAt: l.ts,
      postings: walletCredit
        ? [
            { account: acct, direction: 'CREDIT' as const, amount, currency },
            { account: contra, direction: 'DEBIT' as const, amount, currency },
          ]
        : [
            { account: acct, direction: 'DEBIT' as const, amount, currency },
            { account: contra, direction: 'CREDIT' as const, amount, currency },
          ],
    };
  });
}

function balanceOf(legs: LedgerLeg[]): number {
  return legs.reduce((b, l) => b + l.creditMinor - l.debitMinor, 0);
}
function refOf(id: string): string {
  return `Q-${id.replace(/[^a-z0-9]/gi, '').slice(-6).toUpperCase()}`;
}

// ---------------------------------------------------------------------------
class InMemoryAgentDb implements AgentDb {
  private agencies = new Map<string, AgencyRow>();
  private wallets = new Map<string, { creditLimitMinor: number; currency: Money['currency'] }>();
  private legs = new Map<string, LedgerLeg[]>();
  private quotes = new Map<string, QuoteRecord[]>();

  async loadOrCreateAgency(userId: string, name: string, email: string, tier: AgentTier): Promise<AgencyRow> {
    const existing = this.agencies.get(userId);
    if (existing) return existing;
    const row: AgencyRow = { id: userId, name, email, tier, status: 'APPROVED', createdAt: new Date().toISOString() };
    this.agencies.set(userId, row);
    this.wallets.set(userId, { creditLimitMinor: DEFAULT_CREDIT_LIMIT_MINOR, currency: 'EUR' });
    this.legs.set(userId, [
      { ts: new Date().toISOString(), ref: 'seed-topup', kind: 'TOPUP', memo: 'Opening float', debitMinor: 0, creditMinor: SEED_TOPUP_MINOR },
    ]);
    return row;
  }
  async wallet(agencyId: string): Promise<WalletSnapshot> {
    const w = this.wallets.get(agencyId) ?? { creditLimitMinor: DEFAULT_CREDIT_LIMIT_MINOR, currency: 'EUR' as const };
    return { balanceMinor: balanceOf(this.legs.get(agencyId) ?? []), creditLimitMinor: w.creditLimitMinor, currency: w.currency };
  }
  async ledger(agencyId: string): Promise<LedgerLeg[]> {
    return this.legs.get(agencyId) ?? [];
  }
  async append(agencyId: string, leg: Omit<LedgerLeg, 'ts'>): Promise<WalletSnapshot> {
    const arr = this.legs.get(agencyId) ?? [];
    arr.push({ ...leg, ts: new Date().toISOString() });
    this.legs.set(agencyId, arr);
    return this.wallet(agencyId);
  }
  async saveQuote(agencyId: string, q: Omit<QuoteRecord, 'id' | 'ref' | 'createdAt' | 'status'>): Promise<QuoteRecord> {
    const id = uuidv7();
    const rec: QuoteRecord = { ...q, id, ref: refOf(id), status: 'SENT', createdAt: new Date().toISOString() };
    const arr = this.quotes.get(agencyId) ?? [];
    arr.unshift(rec);
    this.quotes.set(agencyId, arr);
    return rec;
  }
  async listQuotes(agencyId: string): Promise<QuoteRecord[]> {
    return this.quotes.get(agencyId) ?? [];
  }
  async convertQuote(agencyId: string, id: string): Promise<void> {
    const arr = this.quotes.get(agencyId) ?? [];
    const q = arr.find((x) => x.id === id);
    if (q) q.status = 'CONVERTED';
  }
  async findByRef(ref: string): Promise<QuoteRecord | undefined> {
    for (const arr of this.quotes.values()) {
      const q = arr.find((x) => x.ref === ref);
      if (q) return q;
    }
    return undefined;
  }
}

// ---------------------------------------------------------------------------
class PostgresAgentDb implements AgentDb {
  constructor(private readonly pool: DbPool) {}

  async loadOrCreateAgency(userId: string, name: string, email: string, tier: AgentTier): Promise<AgencyRow> {
    const r = await this.pool.query<{ id: string; name: string; email: string; tier: AgentTier; created_at: string }>(
      "SELECT id, name, email, tier, to_char(created_at,'YYYY-MM-DD\"T\"HH24:MI:SSZ') AS created_at FROM agencies WHERE id = $1",
      [userId],
    );
    if (r.rows[0]) {
      const a = r.rows[0];
      return { id: a.id, name: a.name, email: a.email, tier: a.tier, status: 'APPROVED', createdAt: a.created_at };
    }
    await this.pool.query('INSERT INTO agencies (id, name, email, tier, status) VALUES ($1,$2,$3,$4,$5)', [userId, name, email, tier, 'APPROVED']);
    await this.pool.query('INSERT INTO wallets (agency_id, credit_limit_minor, currency) VALUES ($1,$2,$3) ON CONFLICT (agency_id) DO NOTHING', [
      userId,
      DEFAULT_CREDIT_LIMIT_MINOR,
      'EUR',
    ]);
    await this.pool.query(
      "INSERT INTO wallet_ledger (agency_id, ref, kind, memo, debit_minor, credit_minor) VALUES ($1,'seed-topup','TOPUP','Opening float',0,$2)",
      [userId, SEED_TOPUP_MINOR],
    );
    const created = await this.pool.query<{ created_at: string }>(
      "SELECT to_char(created_at,'YYYY-MM-DD\"T\"HH24:MI:SSZ') AS created_at FROM agencies WHERE id = $1",
      [userId],
    );
    return { id: userId, name, email, tier, status: 'APPROVED', createdAt: created.rows[0]?.created_at ?? new Date().toISOString() };
  }
  async wallet(agencyId: string): Promise<WalletSnapshot> {
    const w = await this.pool.query<{ credit_limit_minor: number; currency: Money['currency'] }>(
      'SELECT credit_limit_minor, currency FROM wallets WHERE agency_id = $1',
      [agencyId],
    );
    const legs = await this.ledger(agencyId);
    return {
      balanceMinor: balanceOf(legs),
      creditLimitMinor: w.rows[0]?.credit_limit_minor ?? DEFAULT_CREDIT_LIMIT_MINOR,
      currency: w.rows[0]?.currency ?? 'EUR',
    };
  }
  async ledger(agencyId: string): Promise<LedgerLeg[]> {
    const r = await this.pool.query<{ ts: string; ref: string; kind: LedgerKind; memo: string; debit_minor: number; credit_minor: number }>(
      "SELECT to_char(ts,'YYYY-MM-DD\"T\"HH24:MI:SSZ') AS ts, ref, kind, memo, debit_minor, credit_minor FROM wallet_ledger WHERE agency_id = $1 ORDER BY ts, id",
      [agencyId],
    );
    return r.rows.map((x) => ({ ts: x.ts, ref: x.ref, kind: x.kind, memo: x.memo, debitMinor: x.debit_minor, creditMinor: x.credit_minor }));
  }
  async append(agencyId: string, leg: Omit<LedgerLeg, 'ts'>): Promise<WalletSnapshot> {
    await this.pool.query(
      'INSERT INTO wallet_ledger (agency_id, ref, kind, memo, debit_minor, credit_minor) VALUES ($1,$2,$3,$4,$5,$6)',
      [agencyId, leg.ref, leg.kind, leg.memo, leg.debitMinor, leg.creditMinor],
    );
    return this.wallet(agencyId);
  }
  async saveQuote(agencyId: string, q: Omit<QuoteRecord, 'id' | 'ref' | 'createdAt' | 'status'>): Promise<QuoteRecord> {
    const id = uuidv7();
    const ref = refOf(id);
    await this.pool.query(
      `INSERT INTO quotes (id, agency_id, ref, lines, net_minor, markup_minor, sell_minor, currency, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'SENT')`,
      [id, agencyId, ref, JSON.stringify(q.lines), q.netMinor, q.markupMinor, q.sellMinor, q.currency],
    );
    return { ...q, id, ref, status: 'SENT', createdAt: new Date().toISOString() };
  }
  async listQuotes(agencyId: string): Promise<QuoteRecord[]> {
    const r = await this.pool.query<{
      id: string; ref: string; lines: QuoteLine[]; net_minor: number; markup_minor: number; sell_minor: number; currency: Money['currency']; status: QuoteStatus; created_at: string;
    }>(
      "SELECT id, ref, lines, net_minor, markup_minor, sell_minor, currency, status, to_char(created_at,'YYYY-MM-DD\"T\"HH24:MI:SSZ') AS created_at FROM quotes WHERE agency_id = $1 ORDER BY created_at DESC",
      [agencyId],
    );
    return r.rows.map((x) => ({
      id: x.id, ref: x.ref, lines: x.lines ?? [], netMinor: x.net_minor, markupMinor: x.markup_minor, sellMinor: x.sell_minor,
      currency: x.currency, status: x.status, createdAt: x.created_at,
    }));
  }
  async convertQuote(agencyId: string, id: string): Promise<void> {
    await this.pool.query("UPDATE quotes SET status = 'CONVERTED' WHERE agency_id = $1 AND id = $2", [agencyId, id]);
  }
  async findByRef(ref: string): Promise<QuoteRecord | undefined> {
    const r = await this.pool.query<{
      id: string; ref: string; lines: QuoteLine[]; net_minor: number; markup_minor: number; sell_minor: number; currency: Money['currency']; status: QuoteStatus; created_at: string;
    }>(
      "SELECT id, ref, lines, net_minor, markup_minor, sell_minor, currency, status, to_char(created_at,'YYYY-MM-DD\"T\"HH24:MI:SSZ') AS created_at FROM quotes WHERE ref = $1 LIMIT 1",
      [ref],
    );
    const x = r.rows[0];
    return x
      ? { id: x.id, ref: x.ref, lines: x.lines ?? [], netMinor: x.net_minor, markupMinor: x.markup_minor, sellMinor: x.sell_minor, currency: x.currency, status: x.status, createdAt: x.created_at }
      : undefined;
  }
}

const KEY = Symbol.for('auj.agent.db');
const g = globalThis as unknown as { [KEY]?: Promise<AgentDb> };

async function init(): Promise<AgentDb> {
  const url = process.env.DATABASE_URL;
  if (!url) return new InMemoryAgentDb();
  const pool = createPool(url);
  await pool.query(`CREATE TABLE IF NOT EXISTS agencies (
     id text PRIMARY KEY, name text NOT NULL, email text NOT NULL DEFAULT '', tier text NOT NULL DEFAULT 'GOLD',
     status text NOT NULL DEFAULT 'APPROVED', created_at timestamptz NOT NULL DEFAULT now())`);
  await pool.query(`CREATE TABLE IF NOT EXISTS wallets (
     agency_id text PRIMARY KEY, credit_limit_minor bigint NOT NULL DEFAULT 0, currency text NOT NULL DEFAULT 'EUR')`);
  await pool.query(`CREATE TABLE IF NOT EXISTS wallet_ledger (
     id bigserial PRIMARY KEY, agency_id text NOT NULL, ts timestamptz NOT NULL DEFAULT now(),
     ref text NOT NULL, kind text NOT NULL, memo text NOT NULL DEFAULT '',
     debit_minor bigint NOT NULL DEFAULT 0, credit_minor bigint NOT NULL DEFAULT 0)`);
  await pool.query(`CREATE TABLE IF NOT EXISTS quotes (
     id text PRIMARY KEY, agency_id text NOT NULL, ref text NOT NULL, lines jsonb NOT NULL DEFAULT '[]'::jsonb,
     net_minor bigint NOT NULL DEFAULT 0, markup_minor bigint NOT NULL DEFAULT 0, sell_minor bigint NOT NULL DEFAULT 0,
     currency text NOT NULL DEFAULT 'EUR', status text NOT NULL DEFAULT 'SENT', created_at timestamptz NOT NULL DEFAULT now())`);
  return new PostgresAgentDb(pool);
}

export function getAgentDb(): Promise<AgentDb> {
  return (g[KEY] ??= init());
}
