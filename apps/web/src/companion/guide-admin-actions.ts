'use server';

import { requireRole } from '../auth/session';
import { getGuideStore, type GuideCities } from './guide-store';
import { GUIDE_SLUGS, type GuideCity, type GuideSlug } from './guide-data';

const isSlug = (s: string): s is GuideSlug => (GUIDE_SLUGS as readonly string[]).includes(s);

/** Admin — current content (cities → categories → items) for one guide. */
export async function getGuideAction(slug: GuideSlug): Promise<GuideCities> {
  await requireRole(['ADMIN'], '/admin/guides');
  return (await getGuideStore()).getGuide(slug);
}

/** Admin — replace a guide's editable items (add / edit / reorder / delete) across its cities. */
export async function saveGuideAction(slug: GuideSlug, cities: GuideCities): Promise<{ ok: boolean }> {
  await requireRole(['ADMIN'], '/admin/guides');
  if (!isSlug(slug)) throw new Error('Unknown guide');
  const clean: GuideCities = {};
  for (const city of Object.keys(cities) as GuideCity[]) {
    clean[city] = (cities[city] ?? []).map((cat) => ({
      key: String(cat.key ?? '').slice(0, 60),
      name: String(cat.name ?? '').slice(0, 120),
      desc: String(cat.desc ?? '').slice(0, 200),
      noun: String(cat.noun ?? '').slice(0, 40),
      items: (Array.isArray(cat.items) ? cat.items : []).slice(0, 60).map((it) => ({
        name: String(it.name ?? '').slice(0, 200),
        note: String(it.note ?? '').slice(0, 400),
        tag: String(it.tag ?? '').slice(0, 80),
        mark: String(it.mark ?? '').slice(0, 40),
      })),
    }));
  }
  await (await getGuideStore()).setGuide(slug, clean);
  return { ok: true };
}
