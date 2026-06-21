// Provider health checks (migration 13) — Postgres when DATABASE_URL is set, in-memory fallback.
// `service_providers` holds a status snapshot per slug (NO secrets — only the env key names that
// live in the registry); `health_checks` is the append-only Test-connection log.
import { createPool, type DbPool } from '@auj/core-booking/postgres';

export interface HealthSnapshot {
  slug: string;
  ok: boolean;
  latencyMs: number;
  message: string;
  ts: string;
}

export interface HealthStore {
  record(slug: string, status: string, ok: boolean, latencyMs: number, message: string): Promise<void>;
  latest(): Promise<Record<string, HealthSnapshot>>;
}

class InMemoryHealth implements HealthStore {
  private readonly m = new Map<string, HealthSnapshot>();
  async record(slug: string, _status: string, ok: boolean, latencyMs: number, message: string): Promise<void> {
    this.m.set(slug, { slug, ok, latencyMs, message, ts: new Date().toISOString() });
  }
  async latest(): Promise<Record<string, HealthSnapshot>> {
    return Object.fromEntries(this.m);
  }
}

class PostgresHealth implements HealthStore {
  constructor(private readonly pool: DbPool) {}
  async record(slug: string, status: string, ok: boolean, latencyMs: number, message: string): Promise<void> {
    await this.pool.query(
      `INSERT INTO service_providers (slug, status, last_checked, latency_ms)
       VALUES ($1,$2, now(), $3)
       ON CONFLICT (slug) DO UPDATE SET status = $2, last_checked = now(), latency_ms = $3`,
      [slug, status, latencyMs],
    );
    await this.pool.query('INSERT INTO health_checks (provider_slug, ok, latency_ms, message) VALUES ($1,$2,$3,$4)', [
      slug,
      ok,
      latencyMs,
      message,
    ]);
  }
  async latest(): Promise<Record<string, HealthSnapshot>> {
    const r = await this.pool.query<{ slug: string; ok: boolean; latency_ms: number; message: string; ts: string }>(
      `SELECT DISTINCT ON (provider_slug) provider_slug AS slug, ok, latency_ms,
         message, to_char(ts,'YYYY-MM-DD"T"HH24:MI:SSZ') AS ts
       FROM health_checks ORDER BY provider_slug, ts DESC`,
    );
    return Object.fromEntries(r.rows.map((x) => [x.slug, { slug: x.slug, ok: x.ok, latencyMs: x.latency_ms, message: x.message, ts: x.ts }]));
  }
}

const KEY = Symbol.for('auj.admin.health.store');
const g = globalThis as unknown as { [KEY]?: Promise<HealthStore> };

async function init(): Promise<HealthStore> {
  const url = process.env.DATABASE_URL;
  if (!url) return new InMemoryHealth();
  const pool = createPool(url);
  await pool.query(`CREATE TABLE IF NOT EXISTS service_providers (
     slug text PRIMARY KEY, status text NOT NULL DEFAULT 'not-configured',
     last_checked timestamptz, latency_ms integer)`);
  await pool.query(`CREATE TABLE IF NOT EXISTS health_checks (
     id bigserial PRIMARY KEY, provider_slug text NOT NULL, ts timestamptz NOT NULL DEFAULT now(),
     ok boolean NOT NULL, latency_ms integer NOT NULL DEFAULT 0, message text NOT NULL DEFAULT '')`);
  return new PostgresHealth(pool);
}

export function getHealthStore(): Promise<HealthStore> {
  return (g[KEY] ??= init());
}
