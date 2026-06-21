// Companion-guide content persistence — Postgres when DATABASE_URL is set, in-memory fallback.
// `guide_entries` is seeded from guide-data.ts on first init; editable later via the Admin CMS.
// Category structure/order + headings come from the seed; the DB holds the editable item rows.
import { createPool, type DbPool } from '@auj/core-booking/postgres';
import { GUIDES, type GuideCategory, type GuideCity, type GuideSlug } from './guide-data';

export type GuideCities = Partial<Record<GuideCity, GuideCategory[]>>;

const citiesOf = (slug: GuideSlug): GuideCity[] => Object.keys(GUIDES[slug].cities) as GuideCity[];

export interface GuideStore {
  getGuide(slug: GuideSlug): Promise<GuideCities>;
}

class InMemoryGuides implements GuideStore {
  async getGuide(slug: GuideSlug): Promise<GuideCities> {
    return GUIDES[slug].cities;
  }
}

class PostgresGuides implements GuideStore {
  constructor(private readonly pool: DbPool) {}
  async getGuide(slug: GuideSlug): Promise<GuideCities> {
    const r = await this.pool.query<{ city: GuideCity; category: string; name: string; note: string; tag: string; mark: string }>(
      'SELECT city, category, name, note, tag, mark FROM guide_entries WHERE guide = $1 ORDER BY sort',
      [slug],
    );
    if (!r.rows.length) return GUIDES[slug].cities; // not seeded — fall back to the bundled seed
    const out: GuideCities = {};
    for (const city of citiesOf(slug)) {
      out[city] = (GUIDES[slug].cities[city] ?? [])
        .map((cat) => ({
          ...cat,
          items: r.rows.filter((row) => row.city === city && row.category === cat.key).map((row) => ({
            name: row.name,
            note: row.note,
            tag: row.tag,
            mark: row.mark,
          })),
        }))
        .filter((cat) => cat.items.length > 0);
    }
    return out;
  }
}

// Idempotent per (guide, city): seeds a city's rows only when it has none yet, so newly added
// cities (e.g. Jeddah gifts) get seeded on deploy without disturbing existing rows.
async function seed(pool: DbPool): Promise<void> {
  for (const slug of Object.keys(GUIDES) as GuideSlug[]) {
    for (const city of citiesOf(slug)) {
      const existing = await pool.query<{ n: string }>('SELECT count(*)::text AS n FROM guide_entries WHERE guide = $1 AND city = $2', [slug, city]);
      if (Number(existing.rows[0]?.n ?? '0') > 0) continue;
      (GUIDES[slug].cities[city] ?? []).forEach((cat, ci) => {
        cat.items.forEach((item, ii) => {
          void pool
            .query(
              `INSERT INTO guide_entries (guide, city, category, name, note, tag, mark, sort, locale)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'en')`,
              [slug, city, cat.key, item.name, item.note, item.tag, item.mark, ci * 100 + ii],
            )
            .catch(() => undefined);
        });
      });
    }
  }
}

const KEY = Symbol.for('auj.companion.guide.store');
const g = globalThis as unknown as { [KEY]?: Promise<GuideStore> };

async function init(): Promise<GuideStore> {
  const url = process.env.DATABASE_URL;
  if (!url) return new InMemoryGuides();
  const pool = createPool(url);
  await pool.query(
    `CREATE TABLE IF NOT EXISTS guide_entries (
       id         bigserial PRIMARY KEY,
       guide      text NOT NULL,
       city       text NOT NULL,
       category   text NOT NULL,
       name       text NOT NULL,
       note       text NOT NULL DEFAULT '',
       tag        text NOT NULL DEFAULT '',
       mark       text NOT NULL DEFAULT '',
       sort       integer NOT NULL DEFAULT 0,
       locale     text NOT NULL DEFAULT 'en'
     )`,
  );
  await seed(pool);
  return new PostgresGuides(pool);
}

export function getGuideStore(): Promise<GuideStore> {
  return (g[KEY] ??= init());
}
