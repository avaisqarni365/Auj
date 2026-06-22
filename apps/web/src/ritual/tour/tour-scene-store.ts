// Virtual-tour scene catalog persistence — Postgres when DATABASE_URL is set, in-memory otherwise.
// Holds the ordered list of localized SceneDefs (title/subtitle/desc per language) so admins can
// edit / add / reorder / delete tour scenes without a deploy. Seeded from SCENE_SEED on first run.
// Server-only (imports pg) — never import this from the client VirtualTour; it imports the
// client-safe SCENE_SEED / SceneDef from ./scenes.
import { createPool, type DbPool } from '@auj/core-booking/postgres';
import { SCENE_SEED, type SceneDef } from './scenes';

export interface TourSceneStore {
  listScenes(): Promise<SceneDef[]>;
  getScene(id: string): Promise<SceneDef | undefined>;
  saveScenes(defs: SceneDef[]): Promise<void>;
  deleteScene(id: string): Promise<void>;
}

class InMemoryTourScenes implements TourSceneStore {
  private scenes: SceneDef[] = SCENE_SEED.map((s) => ({ ...s }));
  async listScenes(): Promise<SceneDef[]> {
    return this.scenes;
  }
  async getScene(id: string): Promise<SceneDef | undefined> {
    return this.scenes.find((s) => s.id === id);
  }
  async saveScenes(defs: SceneDef[]): Promise<void> {
    this.scenes = defs.map((s) => ({ ...s }));
  }
  async deleteScene(id: string): Promise<void> {
    this.scenes = this.scenes.filter((s) => s.id !== id);
  }
}

class PostgresTourScenes implements TourSceneStore {
  constructor(private readonly pool: DbPool) {}
  async listScenes(): Promise<SceneDef[]> {
    const r = await this.pool.query<{ data: SceneDef }>('SELECT data FROM tour_scenes ORDER BY sort, id');
    if (!r.rows.length) return SCENE_SEED; // not seeded — fall back to the bundled seed
    return r.rows.map((row) => row.data);
  }
  async getScene(id: string): Promise<SceneDef | undefined> {
    const r = await this.pool.query<{ data: SceneDef }>('SELECT data FROM tour_scenes WHERE id = $1', [id]);
    return r.rows[0]?.data;
  }
  async saveScenes(defs: SceneDef[]): Promise<void> {
    // Replace-all, preserving the given order via `sort`.
    await this.pool.query('DELETE FROM tour_scenes');
    for (let i = 0; i < defs.length; i++) {
      const d = defs[i]!;
      await this.pool.query('INSERT INTO tour_scenes (id, sort, data) VALUES ($1,$2,$3)', [d.id, i, d]);
    }
  }
  async deleteScene(id: string): Promise<void> {
    await this.pool.query('DELETE FROM tour_scenes WHERE id = $1', [id]);
  }
}

// Idempotent: insert each seed scene only if its id is absent, with sort = seed index. Lets newly
// added seed scenes land on deploy without disturbing admin-edited rows.
async function seed(pool: DbPool): Promise<void> {
  for (let i = 0; i < SCENE_SEED.length; i++) {
    const d = SCENE_SEED[i]!;
    await pool
      .query('INSERT INTO tour_scenes (id, sort, data) VALUES ($1,$2,$3) ON CONFLICT (id) DO NOTHING', [d.id, i, d])
      .catch(() => undefined);
  }
}

const KEY = Symbol.for('auj.tour.scene.store');
const g = globalThis as unknown as { [KEY]?: Promise<TourSceneStore> };

async function init(): Promise<TourSceneStore> {
  const url = process.env.DATABASE_URL;
  if (!url) return new InMemoryTourScenes();
  const pool = createPool(url);
  await pool.query(
    `CREATE TABLE IF NOT EXISTS tour_scenes (
       id   text PRIMARY KEY,
       sort integer NOT NULL DEFAULT 0,
       data jsonb NOT NULL
     )`,
  );
  await seed(pool);
  return new PostgresTourScenes(pool);
}

export function getTourSceneStore(): Promise<TourSceneStore> {
  return (g[KEY] ??= init());
}
