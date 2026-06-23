'use server';

import { requireRole } from '../auth/session';
import { getDayPlanTemplateStore } from './day-plan-template-store';
import type { BaseSlot, PlannerCity, SlotKind } from './planner';

type DayPlanTemplate = Record<PlannerCity, BaseSlot[]>;

const SLOT_KINDS: readonly SlotKind[] = ['prayer', 'meal', 'activity', 'rest'];
const MAX_SLOTS = 30;

const clampInt = (v: unknown, lo: number, hi: number): number => {
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) return lo;
  const i = Math.trunc(n);
  return Math.max(lo, Math.min(hi, i));
};

const cleanKind = (v: unknown): SlotKind => (SLOT_KINDS.includes(v as SlotKind) ? (v as SlotKind) : 'activity');

const cleanSlot = (raw: unknown): BaseSlot => {
  const s = (raw ?? {}) as Partial<BaseSlot>;
  return {
    h: clampInt(s.h, 0, 23),
    m: clampInt(s.m, 0, 59),
    title: String(s.title ?? '').slice(0, 80),
    note: String(s.note ?? '').slice(0, 160),
    type: cleanKind(s.type),
    tag: String(s.tag ?? '').slice(0, 40),
  };
};

const cleanCity = (raw: unknown): BaseSlot[] => {
  const arr = Array.isArray(raw) ? raw : [];
  return arr.slice(0, MAX_SLOTS).map(cleanSlot);
};

const cleanTemplate = (raw: unknown): DayPlanTemplate => {
  const t = (raw ?? {}) as Partial<Record<PlannerCity, unknown>>;
  return {
    makkah: cleanCity(t.makkah),
    madinah: cleanCity(t.madinah),
  };
};

/** Admin — the current default day-planner template (both cities). */
export async function getTemplateAction(): Promise<DayPlanTemplate> {
  await requireRole(['ADMIN'], '/admin/day-planner');
  return (await getDayPlanTemplateStore()).getTemplate();
}

/** Admin — replace the default day-planner template; returns the fresh template. */
export async function saveTemplateAction(template: DayPlanTemplate): Promise<DayPlanTemplate> {
  await requireRole(['ADMIN'], '/admin/day-planner');
  const clean = cleanTemplate(template);
  const store = await getDayPlanTemplateStore();
  await store.setTemplate(clean);
  return store.getTemplate();
}
