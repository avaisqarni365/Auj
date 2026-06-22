// Step-video wizard content persistence — Postgres when DATABASE_URL is set, in-memory fallback.
// `ritual_steps` is seeded from wizard-steps.ts on first init; editable later via the Admin CMS.
import { createPool, type DbPool } from '@auj/core-booking/postgres';
import { WIZARDS, WIZARD_SLUGS } from './wizard-steps';
import type { LocalizedText, WizardSlug, WizItem, WizStep } from './wizard-steps-types';

export interface WizardStore {
  getWizard(slug: WizardSlug): Promise<WizStep[]>;
  setWizard(slug: WizardSlug, steps: WizStep[]): Promise<void>;
}

class InMemoryWizards implements WizardStore {
  private readonly edited = new Map<WizardSlug, WizStep[]>();
  async getWizard(slug: WizardSlug): Promise<WizStep[]> {
    return this.edited.get(slug) ?? WIZARDS[slug].steps;
  }
  async setWizard(slug: WizardSlug, steps: WizStep[]): Promise<void> {
    this.edited.set(slug, steps);
  }
}

class PostgresWizards implements WizardStore {
  constructor(private readonly pool: DbPool) {}
  async getWizard(slug: WizardSlug): Promise<WizStep[]> {
    const r = await this.pool.query<{
      short: string;
      label: string;
      text: LocalizedText;
      items: WizItem[];
      tip: string | null;
      video_url: string | null;
    }>(
      'SELECT short, label, text, items, tip, video_url FROM ritual_steps WHERE wizard = $1 ORDER BY sort',
      [slug],
    );
    if (!r.rows.length) return WIZARDS[slug].steps; // not seeded — fall back to the bundled seed
    return r.rows.map((row) => ({
      short: row.short,
      label: row.label,
      text: row.text ?? {},
      items: row.items ?? [],
      ...(row.tip ? { tip: row.tip } : {}),
      ...(row.video_url ? { videoUrl: row.video_url } : {}),
    }));
  }
  async setWizard(slug: WizardSlug, steps: WizStep[]): Promise<void> {
    // Replace the wizard's steps wholesale (the admin edits the full ordered list).
    await this.pool.query('DELETE FROM ritual_steps WHERE wizard = $1', [slug]);
    for (let i = 0; i < steps.length; i++) {
      const s = steps[i]!;
      await this.pool.query(
        `INSERT INTO ritual_steps (wizard, idx, short, label, text, items, tip, video_url, sort)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [slug, i, s.short, s.label, JSON.stringify(s.text), JSON.stringify(s.items), s.tip ?? null, s.videoUrl ?? null, i],
      );
    }
  }
}

async function seed(pool: DbPool): Promise<void> {
  const existing = await pool.query<{ n: string }>('SELECT count(*)::text AS n FROM ritual_steps');
  if (Number(existing.rows[0]?.n ?? '0') > 0) return;
  for (const slug of WIZARD_SLUGS) {
    WIZARDS[slug].steps.forEach((s, idx) => {
      void pool
        .query(
          `INSERT INTO ritual_steps (wizard, idx, short, label, text, items, tip, video_url, sort)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [slug, idx, s.short, s.label, JSON.stringify(s.text), JSON.stringify(s.items), s.tip ?? null, s.videoUrl ?? null, idx],
        )
        .catch(() => undefined);
    });
  }
}

const KEY = Symbol.for('auj.ritual.wizard.store');
const g = globalThis as unknown as { [KEY]?: Promise<WizardStore> };

async function init(): Promise<WizardStore> {
  const url = process.env.DATABASE_URL;
  if (!url) return new InMemoryWizards();
  const pool = createPool(url);
  await pool.query(
    `CREATE TABLE IF NOT EXISTS ritual_steps (
       id        bigserial PRIMARY KEY,
       wizard    text NOT NULL,
       idx       integer NOT NULL,
       short     text NOT NULL,
       label     text NOT NULL DEFAULT '',
       text      jsonb NOT NULL DEFAULT '{}'::jsonb,
       items     jsonb NOT NULL DEFAULT '[]'::jsonb,
       tip       text,
       video_url text,
       sort      integer NOT NULL DEFAULT 0
     )`,
  );
  await seed(pool);
  return new PostgresWizards(pool);
}

export function getWizardStore(): Promise<WizardStore> {
  return (g[KEY] ??= init());
}
