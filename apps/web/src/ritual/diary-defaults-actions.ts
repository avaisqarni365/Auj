'use server';

import { requireRole } from '../auth/session';
import { getDiaryDefaultsStore } from './diary-defaults-store';
import { type DiaryDefaults, type DuaDef, type NaflDef } from './diary';

const slug = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

const clampTarget = (v: unknown): number => {
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) return 1;
  return Math.min(100, Math.max(1, Math.trunc(n)));
};

const cleanNafl = (raw: unknown): NaflDef[] => {
  const arr = Array.isArray(raw) ? raw : [];
  return arr
    .slice(0, 20)
    .map((it): NaflDef => {
      const n = (it ?? {}) as Partial<NaflDef>;
      return {
        key: slug(String(n.key ?? '')),
        label: String(n.label ?? '').slice(0, 80),
        note: String(n.note ?? '').slice(0, 120),
      };
    })
    .filter((n) => n.key !== '' && n.label !== '');
};

const cleanDuas = (raw: unknown): DuaDef[] => {
  const arr = Array.isArray(raw) ? raw : [];
  return arr
    .slice(0, 20)
    .map((it): DuaDef => {
      const d = (it ?? {}) as Partial<DuaDef>;
      return {
        key: slug(String(d.key ?? '')),
        label: String(d.label ?? '').slice(0, 80),
      };
    })
    .filter((d) => d.key !== '' && d.label !== '');
};

const cleanDefaults = (raw: unknown): DiaryDefaults => {
  const d = (raw ?? {}) as Partial<DiaryDefaults>;
  return {
    quranTarget: clampTarget(d.quranTarget),
    nafl: cleanNafl(d.nafl),
    duas: cleanDuas(d.duas),
  };
};

/** Admin — the current default diary configuration (Quran target + nafl + duas). */
export async function getDefaultsAction(): Promise<DiaryDefaults> {
  await requireRole(['ADMIN'], '/admin/diary');
  return (await getDiaryDefaultsStore()).getDefaults();
}

/** Admin — replace the default diary configuration, returns the fresh defaults. */
export async function saveDefaultsAction(d: DiaryDefaults): Promise<DiaryDefaults> {
  await requireRole(['ADMIN'], '/admin/diary');
  const clean = cleanDefaults(d);
  const store = await getDiaryDefaultsStore();
  await store.setDefaults(clean);
  return store.getDefaults();
}
