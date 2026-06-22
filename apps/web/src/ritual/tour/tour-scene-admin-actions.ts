'use server';

import { requireRole } from '../../auth/session';
import { getTourSceneStore } from './tour-scene-store';
import type { L, SceneDef } from './scenes';

const LANGS = ['en', 'ar', 'ur', 'tr', 'de'] as const;

const kebabId = (s: string): string =>
  String(s ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

// Restrict a localized map to the supported langs; clamp each value to 400 chars.
const cleanL = (m: unknown): L => {
  const src = (m && typeof m === 'object' ? (m as Record<string, unknown>) : {});
  const out: L = {};
  for (const lang of LANGS) {
    const v = src[lang];
    if (typeof v === 'string' && v.trim()) out[lang] = v.slice(0, 400);
  }
  return out;
};

const cleanScene = (d: SceneDef): SceneDef => ({
  id: kebabId(d.id),
  file: String(d.file ?? '').slice(0, 120),
  title: cleanL(d.title),
  subtitle: cleanL(d.subtitle),
  desc: cleanL(d.desc),
});

/** Admin — the current ordered scene catalog. */
export async function listScenesAction(): Promise<SceneDef[]> {
  await requireRole(['ADMIN'], '/admin/tour');
  return (await getTourSceneStore()).listScenes();
}

/** Admin — replace the whole scene catalog (add / edit / reorder / delete). Returns the fresh list. */
export async function saveScenesAction(defs: SceneDef[]): Promise<SceneDef[]> {
  await requireRole(['ADMIN'], '/admin/tour');
  const clean = (Array.isArray(defs) ? defs : [])
    .slice(0, 30)
    .map(cleanScene)
    .filter((d) => d.id.length > 0);
  const store = await getTourSceneStore();
  await store.saveScenes(clean);
  return store.listScenes();
}
