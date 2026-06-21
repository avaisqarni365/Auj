// Day-plan preference persistence — Postgres when DATABASE_URL is set, in-memory fallback.
// One row per pilgrim: their chosen city + ±15-min day shift.
import { createPool, type DbPool } from '@auj/core-booking/postgres';
import type { PlannerCity } from './planner';
import type { DayPlanPref, DayPlanStore } from './day-plan-types';

class InMemoryDayPlans implements DayPlanStore {
  private readonly m = new Map<string, DayPlanPref>();
  async get(userId: string): Promise<DayPlanPref | undefined> {
    return this.m.get(userId);
  }
  async save(userId: string, pref: DayPlanPref): Promise<void> {
    this.m.set(userId, pref);
  }
}

class PostgresDayPlans implements DayPlanStore {
  constructor(private readonly pool: DbPool) {}
  async get(userId: string): Promise<DayPlanPref | undefined> {
    const r = await this.pool.query<{ city: PlannerCity; shift_min: number }>(
      'SELECT city, shift_min FROM day_plans WHERE pilgrim_id = $1',
      [userId],
    );
    const row = r.rows[0];
    return row ? { city: row.city, shiftMin: row.shift_min } : undefined;
  }
  async save(userId: string, pref: DayPlanPref): Promise<void> {
    await this.pool.query(
      `INSERT INTO day_plans (pilgrim_id, city, shift_min, updated_at)
       VALUES ($1, $2, $3, now())
       ON CONFLICT (pilgrim_id) DO UPDATE SET city = $2, shift_min = $3, updated_at = now()`,
      [userId, pref.city, pref.shiftMin],
    );
  }
}

const KEY = Symbol.for('auj.ritual.dayplan.store');
const g = globalThis as unknown as { [KEY]?: Promise<DayPlanStore> };

async function init(): Promise<DayPlanStore> {
  const url = process.env.DATABASE_URL;
  if (!url) return new InMemoryDayPlans();
  const pool = createPool(url);
  await pool.query(
    `CREATE TABLE IF NOT EXISTS day_plans (
       pilgrim_id text PRIMARY KEY,
       city       text NOT NULL,
       shift_min  integer NOT NULL DEFAULT 0,
       updated_at timestamptz NOT NULL DEFAULT now()
     )`,
  );
  return new PostgresDayPlans(pool);
}

export function getDayPlanStore(): Promise<DayPlanStore> {
  return (g[KEY] ??= init());
}
