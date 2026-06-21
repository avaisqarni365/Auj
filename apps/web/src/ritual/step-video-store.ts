// Per-pilgrim, per-step video links — Postgres when DATABASE_URL is set, in-memory fallback.
// One row per (pilgrim, wizard, step). Stores a URL (object-store upload is a later option).
import { createPool, type DbPool } from '@auj/core-booking/postgres';
import type { WizardSlug } from './wizard-steps-types';

export interface StepVideoStore {
  listByWizard(userId: string, wizard: WizardSlug): Promise<Record<number, string>>;
  set(userId: string, wizard: WizardSlug, stepIdx: number, url: string): Promise<void>;
  remove(userId: string, wizard: WizardSlug, stepIdx: number): Promise<void>;
}

const key = (userId: string, wizard: string): string => `${userId}::${wizard}`;

class InMemoryStepVideos implements StepVideoStore {
  private readonly m = new Map<string, Record<number, string>>();
  async listByWizard(userId: string, wizard: WizardSlug): Promise<Record<number, string>> {
    return this.m.get(key(userId, wizard)) ?? {};
  }
  async set(userId: string, wizard: WizardSlug, stepIdx: number, url: string): Promise<void> {
    const cur = this.m.get(key(userId, wizard)) ?? {};
    cur[stepIdx] = url;
    this.m.set(key(userId, wizard), cur);
  }
  async remove(userId: string, wizard: WizardSlug, stepIdx: number): Promise<void> {
    const cur = this.m.get(key(userId, wizard));
    if (cur) delete cur[stepIdx];
  }
}

class PostgresStepVideos implements StepVideoStore {
  constructor(private readonly pool: DbPool) {}
  async listByWizard(userId: string, wizard: WizardSlug): Promise<Record<number, string>> {
    const r = await this.pool.query<{ step_idx: number; url: string }>(
      'SELECT step_idx, url FROM pilgrim_step_videos WHERE pilgrim_id = $1 AND wizard = $2',
      [userId, wizard],
    );
    const out: Record<number, string> = {};
    for (const row of r.rows) out[row.step_idx] = row.url;
    return out;
  }
  async set(userId: string, wizard: WizardSlug, stepIdx: number, url: string): Promise<void> {
    await this.pool.query(
      `INSERT INTO pilgrim_step_videos (pilgrim_id, wizard, step_idx, url, created_at)
       VALUES ($1,$2,$3,$4, now())
       ON CONFLICT (pilgrim_id, wizard, step_idx) DO UPDATE SET url = $4, created_at = now()`,
      [userId, wizard, stepIdx, url],
    );
  }
  async remove(userId: string, wizard: WizardSlug, stepIdx: number): Promise<void> {
    await this.pool.query('DELETE FROM pilgrim_step_videos WHERE pilgrim_id = $1 AND wizard = $2 AND step_idx = $3', [
      userId,
      wizard,
      stepIdx,
    ]);
  }
}

const KEY = Symbol.for('auj.ritual.stepvideo.store');
const g = globalThis as unknown as { [KEY]?: Promise<StepVideoStore> };

async function init(): Promise<StepVideoStore> {
  const url = process.env.DATABASE_URL;
  if (!url) return new InMemoryStepVideos();
  const pool = createPool(url);
  await pool.query(
    `CREATE TABLE IF NOT EXISTS pilgrim_step_videos (
       pilgrim_id text NOT NULL,
       wizard     text NOT NULL,
       step_idx   integer NOT NULL,
       url        text NOT NULL,
       created_at timestamptz NOT NULL DEFAULT now(),
       PRIMARY KEY (pilgrim_id, wizard, step_idx)
     )`,
  );
  return new PostgresStepVideos(pool);
}

export function getStepVideoStore(): Promise<StepVideoStore> {
  return (g[KEY] ??= init());
}
