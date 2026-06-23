// Day-planner default template persistence — Postgres when DATABASE_URL is set, in-memory
// fallback. The whole jamaat-anchored daily schedule (both cities) lives in a single row (id=1),
// seeded from DAY_PLAN_SEED and editable via the Admin CRUD. Server-only: the sole pg importer.
import { createPool, type DbPool } from '@auj/core-booking/postgres';
import { DAY_PLAN_SEED, type BaseSlot, type PlannerCity } from './planner';

type DayPlanTemplate = Record<PlannerCity, BaseSlot[]>;

export interface DayPlanTemplateStore {
  getTemplate(): Promise<DayPlanTemplate>;
  setTemplate(template: DayPlanTemplate): Promise<void>;
}

class InMemoryDayPlanTemplate implements DayPlanTemplateStore {
  private data: DayPlanTemplate = DAY_PLAN_SEED;
  async getTemplate(): Promise<DayPlanTemplate> {
    return this.data;
  }
  async setTemplate(template: DayPlanTemplate): Promise<void> {
    this.data = template;
  }
}

class PostgresDayPlanTemplate implements DayPlanTemplateStore {
  constructor(private readonly pool: DbPool) {}
  async getTemplate(): Promise<DayPlanTemplate> {
    const r = await this.pool.query<{ data: DayPlanTemplate }>('SELECT data FROM day_plan_template WHERE id = 1');
    const row = r.rows[0];
    return row?.data ?? DAY_PLAN_SEED;
  }
  async setTemplate(template: DayPlanTemplate): Promise<void> {
    // jsonb bound as the raw object — node-pg serializes it (matches packing-template-store.ts).
    await this.pool.query(
      'INSERT INTO day_plan_template (id, data) VALUES (1, $1) ON CONFLICT (id) DO UPDATE SET data = $1',
      [template],
    );
  }
}

// Idempotent: inserts the seed as id=1 only when the single row does not exist yet.
async function seed(pool: DbPool): Promise<void> {
  await pool.query('INSERT INTO day_plan_template (id, data) VALUES (1, $1) ON CONFLICT (id) DO NOTHING', [DAY_PLAN_SEED]);
}

const KEY = Symbol.for('auj.dayplan.template.store');
const g = globalThis as unknown as { [KEY]?: Promise<DayPlanTemplateStore> };

async function init(): Promise<DayPlanTemplateStore> {
  const url = process.env.DATABASE_URL;
  if (!url) return new InMemoryDayPlanTemplate();
  const pool = createPool(url);
  await pool.query(
    `CREATE TABLE IF NOT EXISTS day_plan_template (
       id   integer PRIMARY KEY DEFAULT 1,
       data jsonb NOT NULL
     )`,
  );
  await seed(pool);
  return new PostgresDayPlanTemplate(pool);
}

export function getDayPlanTemplateStore(): Promise<DayPlanTemplateStore> {
  return (g[KEY] ??= init());
}
