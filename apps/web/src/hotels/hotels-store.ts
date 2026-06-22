// Hotel-directory persistence — Postgres when DATABASE_URL is set, in-memory fallback.
// One CityHotels row per slug, stored as jsonb. Seeded from hotels-data.ts on first init;
// editable later via the Admin CMS. This is the ONLY pg importer in the hotels surface —
// hotels-data.ts stays pure/client-safe.
import { createPool, type DbPool } from '@auj/core-booking/postgres';
import { HOTEL_CITIES, hotelsForCity, type CityHotels, type HotelCity } from './hotels-data';

export interface HotelsStore {
  getCity(slug: HotelCity): Promise<CityHotels>;
  setCity(slug: HotelCity, data: CityHotels): Promise<void>;
  listCities(): Promise<CityHotels[]>;
}

class InMemoryHotels implements HotelsStore {
  private readonly edited = new Map<HotelCity, CityHotels>();
  constructor() {
    for (const slug of HOTEL_CITIES) this.edited.set(slug, hotelsForCity(slug));
  }
  async getCity(slug: HotelCity): Promise<CityHotels> {
    return this.edited.get(slug) ?? hotelsForCity(slug);
  }
  async setCity(slug: HotelCity, data: CityHotels): Promise<void> {
    this.edited.set(slug, data);
  }
  async listCities(): Promise<CityHotels[]> {
    const out: CityHotels[] = [];
    for (const slug of HOTEL_CITIES) out.push(await this.getCity(slug));
    return out;
  }
}

class PostgresHotels implements HotelsStore {
  constructor(private readonly pool: DbPool) {}
  async getCity(slug: HotelCity): Promise<CityHotels> {
    const r = await this.pool.query<{ data: CityHotels }>('SELECT data FROM hotel_cities WHERE slug = $1', [slug]);
    return r.rows[0]?.data ?? hotelsForCity(slug); // not seeded — fall back to the bundled seed
  }
  async setCity(slug: HotelCity, data: CityHotels): Promise<void> {
    await this.pool.query(
      `INSERT INTO hotel_cities (slug, data) VALUES ($1, $2)
       ON CONFLICT (slug) DO UPDATE SET data = EXCLUDED.data`,
      [slug, data],
    );
  }
  async listCities(): Promise<CityHotels[]> {
    const out: CityHotels[] = [];
    for (const slug of HOTEL_CITIES) out.push(await this.getCity(slug));
    return out;
  }
}

// Idempotent: seeds makkah & madinah only when absent, so a deploy seeds new cities without
// disturbing rows an admin has already edited.
async function seed(pool: DbPool): Promise<void> {
  for (const slug of HOTEL_CITIES) {
    await pool
      .query('INSERT INTO hotel_cities (slug, data) VALUES ($1, $2) ON CONFLICT (slug) DO NOTHING', [
        slug,
        hotelsForCity(slug),
      ])
      .catch(() => undefined);
  }
}

const KEY = Symbol.for('auj.hotels.store');
const g = globalThis as unknown as { [KEY]?: Promise<HotelsStore> };

async function init(): Promise<HotelsStore> {
  const url = process.env.DATABASE_URL;
  if (!url) return new InMemoryHotels();
  const pool = createPool(url);
  await pool.query(
    `CREATE TABLE IF NOT EXISTS hotel_cities (
       slug text PRIMARY KEY,
       data jsonb NOT NULL
     )`,
  );
  await seed(pool);
  return new PostgresHotels(pool);
}

export function getHotelsStore(): Promise<HotelsStore> {
  return (g[KEY] ??= init());
}
