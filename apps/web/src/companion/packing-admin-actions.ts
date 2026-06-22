'use server';

import { requireRole } from '../auth/session';
import { getPackingTemplateStore } from './packing-template-store';
import { PACKING_PROFILES, type Def, type PackingProfile, type SectionDef } from './packing';

const slug = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

const clampPer = (v: unknown): number | undefined => {
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) return undefined;
  const i = Math.trunc(n);
  if (i < 1) return undefined;
  return Math.min(3650, i);
};

const cleanProfiles = (v: unknown): PackingProfile[] | undefined => {
  if (!Array.isArray(v)) return undefined;
  const set = v.filter((p): p is PackingProfile => (PACKING_PROFILES as readonly unknown[]).includes(p));
  return set.length ? set : undefined;
};

const cleanItem = (raw: unknown): Def => {
  const it = (raw ?? {}) as Partial<Def>;
  const def: Def = {
    id: slug(String(it.id ?? '')),
    label: String(it.label ?? '').slice(0, 200),
  };
  const per = clampPer(it.per);
  if (per !== undefined) def.per = per;
  const profiles = cleanProfiles(it.profiles);
  if (profiles !== undefined) def.profiles = profiles;
  return def;
};

const cleanSection = (raw: unknown): SectionDef => {
  const s = (raw ?? {}) as Partial<SectionDef>;
  const items = Array.isArray(s.items) ? s.items : [];
  return {
    title: String(s.title ?? '').slice(0, 80),
    items: items.slice(0, 40).map(cleanItem),
  };
};

const cleanTemplate = (sections: unknown): SectionDef[] => {
  const arr = Array.isArray(sections) ? sections : [];
  return arr.slice(0, 12).map(cleanSection);
};

/** Admin — the current default packing template. */
export async function getTemplateAction(): Promise<SectionDef[]> {
  await requireRole(['ADMIN'], '/admin/packing');
  return (await getPackingTemplateStore()).getTemplate();
}

/** Admin — replace the default packing template (sections + items), returns the fresh template. */
export async function saveTemplateAction(sections: SectionDef[]): Promise<SectionDef[]> {
  await requireRole(['ADMIN'], '/admin/packing');
  const clean = cleanTemplate(sections);
  const store = await getPackingTemplateStore();
  await store.setTemplate(clean);
  return store.getTemplate();
}
