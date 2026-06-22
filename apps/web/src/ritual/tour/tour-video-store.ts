// Per-pilgrim personal videos for the Virtual Tour — one clip (link) per scene, per signed-in user.
// Postgres when DATABASE_URL is set, in-memory otherwise. The public tour is identical for everyone;
// only a logged-in pilgrim sees (and saves) their own clips. No localStorage.
import { createPool, type DbPool } from '@auj/core-booking/postgres';

export interface TourVideoStore {
  listForUser(userId: string): Promise<Record<string, string>>;
  set(userId: string, sceneId: string, url: string): Promise<void>;
  remove(userId: string, sceneId: string): Promise<void>;
}

class InMemoryTourVideos implements TourVideoStore {
  private readonly m = new Map<string, Map<string, string>>();
  async listForUser(userId: string): Promise<Record<string, string>> {
    return Object.fromEntries(this.m.get(userId) ?? new Map());
  }
  async set(userId: string, sceneId: string, url: string): Promise<void> {
    const u = this.m.get(userId) ?? new Map<string, string>();
    u.set(sceneId, url);
    this.m.set(userId, u);
  }
  async remove(userId: string, sceneId: string): Promise<void> {
    this.m.get(userId)?.delete(sceneId);
  }
}

class PostgresTourVideos implements TourVideoStore {
  constructor(private readonly pool: DbPool) {}
  async listForUser(userId: string): Promise<Record<string, string>> {
    const r = await this.pool.query<{ scene_id: string; url: string }>('SELECT scene_id, url FROM tour_videos WHERE user_id = $1', [userId]);
    const out: Record<string, string> = {};
    for (const row of r.rows) out[row.scene_id] = row.url;
    return out;
  }
  async set(userId: string, sceneId: string, url: string): Promise<void> {
    await this.pool.query(
      'INSERT INTO tour_videos (user_id, scene_id, url) VALUES ($1,$2,$3) ON CONFLICT (user_id, scene_id) DO UPDATE SET url = $3',
      [userId, sceneId, url],
    );
  }
  async remove(userId: string, sceneId: string): Promise<void> {
    await this.pool.query('DELETE FROM tour_videos WHERE user_id = $1 AND scene_id = $2', [userId, sceneId]);
  }
}

const KEY = Symbol.for('auj.tour.videos.store');
const g = globalThis as unknown as { [KEY]?: Promise<TourVideoStore> };

async function init(): Promise<TourVideoStore> {
  const url = process.env.DATABASE_URL;
  if (!url) return new InMemoryTourVideos();
  const pool = createPool(url);
  await pool.query('CREATE TABLE IF NOT EXISTS tour_videos (user_id text NOT NULL, scene_id text NOT NULL, url text NOT NULL, PRIMARY KEY (user_id, scene_id))');
  return new PostgresTourVideos(pool);
}

export function getTourVideoStore(): Promise<TourVideoStore> {
  return (g[KEY] ??= init());
}
