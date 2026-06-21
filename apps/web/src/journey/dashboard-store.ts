// Dashboard persistence — Postgres when DATABASE_URL is set, in-memory fallback.
// `dashboard_members` (Me/Family/Group) + `passport_scans` (image_key→object store, extracted fields).
import { createPool, type DbPool } from '@auj/core-booking/postgres';
import { EMPTY_PASSPORT, type DashboardStore, type Member, type PassportFields, type PassportScan, type PassportStatus } from './dashboard-types';

const ME: Member = { memberId: 'me', name: 'Me', relation: 'Me' };
const mkey = (ownerId: string): string => ownerId;

class InMemoryDashboard implements DashboardStore {
  private members = new Map<string, Member[]>();
  private scans = new Map<string, PassportScan>();
  private skey = (o: string, m: string): string => `${o}::${m}`;

  async listMembers(ownerId: string): Promise<Member[]> {
    return [ME, ...(this.members.get(mkey(ownerId)) ?? [])];
  }
  async addMember(ownerId: string, name: string, relation: string): Promise<Member> {
    const member: Member = { memberId: `m-${Math.random().toString(36).slice(2, 8)}`, name, relation };
    const arr = this.members.get(mkey(ownerId)) ?? [];
    arr.push(member);
    this.members.set(mkey(ownerId), arr);
    return member;
  }
  async removeMember(ownerId: string, memberId: string): Promise<void> {
    if (memberId === 'me') return;
    this.members.set(mkey(ownerId), (this.members.get(mkey(ownerId)) ?? []).filter((m) => m.memberId !== memberId));
    this.scans.delete(this.skey(ownerId, memberId));
  }
  async getPassport(ownerId: string, memberId: string): Promise<PassportScan | undefined> {
    return this.scans.get(this.skey(ownerId, memberId));
  }
  async savePassport(ownerId: string, memberId: string, scan: Omit<PassportScan, 'memberId'>): Promise<void> {
    this.scans.set(this.skey(ownerId, memberId), { memberId, ...scan });
  }
}

class PostgresDashboard implements DashboardStore {
  constructor(private readonly pool: DbPool) {}
  async listMembers(ownerId: string): Promise<Member[]> {
    const r = await this.pool.query<{ member_id: string; name: string; relation: string }>(
      'SELECT member_id, name, relation FROM dashboard_members WHERE owner_id = $1 ORDER BY created_at',
      [ownerId],
    );
    return [ME, ...r.rows.map((x) => ({ memberId: x.member_id, name: x.name, relation: x.relation }))];
  }
  async addMember(ownerId: string, name: string, relation: string): Promise<Member> {
    const memberId = `m-${Math.random().toString(36).slice(2, 8)}`;
    await this.pool.query('INSERT INTO dashboard_members (owner_id, member_id, name, relation) VALUES ($1,$2,$3,$4)', [ownerId, memberId, name, relation]);
    return { memberId, name, relation };
  }
  async removeMember(ownerId: string, memberId: string): Promise<void> {
    if (memberId === 'me') return;
    await this.pool.query('DELETE FROM dashboard_members WHERE owner_id = $1 AND member_id = $2', [ownerId, memberId]);
    await this.pool.query('DELETE FROM passport_scans WHERE owner_id = $1 AND member_id = $2', [ownerId, memberId]);
  }
  async getPassport(ownerId: string, memberId: string): Promise<PassportScan | undefined> {
    const r = await this.pool.query<{ image_key: string | null; extracted: PassportFields; status: PassportStatus }>(
      'SELECT image_key, extracted, status FROM passport_scans WHERE owner_id = $1 AND member_id = $2',
      [ownerId, memberId],
    );
    const row = r.rows[0];
    return row ? { memberId, imageKey: row.image_key, extracted: { ...EMPTY_PASSPORT, ...(row.extracted ?? {}) }, status: row.status } : undefined;
  }
  async savePassport(ownerId: string, memberId: string, scan: Omit<PassportScan, 'memberId'>): Promise<void> {
    await this.pool.query(
      `INSERT INTO passport_scans (owner_id, member_id, image_key, extracted, status, updated_at)
       VALUES ($1,$2,$3,$4,$5, now())
       ON CONFLICT (owner_id, member_id) DO UPDATE SET image_key = $3, extracted = $4, status = $5, updated_at = now()`,
      [ownerId, memberId, scan.imageKey, JSON.stringify(scan.extracted), scan.status],
    );
  }
}

const KEY = Symbol.for('auj.journey.dashboard.store');
const g = globalThis as unknown as { [KEY]?: Promise<DashboardStore> };

async function init(): Promise<DashboardStore> {
  const url = process.env.DATABASE_URL;
  if (!url) return new InMemoryDashboard();
  const pool = createPool(url);
  await pool.query(`CREATE TABLE IF NOT EXISTS dashboard_members (
     owner_id text NOT NULL, member_id text NOT NULL, name text NOT NULL, relation text NOT NULL DEFAULT 'Family',
     created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (owner_id, member_id))`);
  await pool.query(`CREATE TABLE IF NOT EXISTS passport_scans (
     owner_id text NOT NULL, member_id text NOT NULL, image_key text, extracted jsonb NOT NULL DEFAULT '{}'::jsonb,
     status text NOT NULL DEFAULT 'none', updated_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (owner_id, member_id))`);
  return new PostgresDashboard(pool);
}

export function getDashboardStore(): Promise<DashboardStore> {
  return (g[KEY] ??= init());
}
