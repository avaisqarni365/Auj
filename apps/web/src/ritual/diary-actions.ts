'use server';

import { getCurrentUser } from '../auth/session';
import { getDiaryStore } from './diary-store';
import type { DiaryEntry } from './diary';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function getDiaryAction(date: string): Promise<DiaryEntry | null> {
  if (!DATE_RE.test(date)) return null;
  const user = await getCurrentUser();
  if (!user) return null;
  return (await (await getDiaryStore()).get(user.id, date)) ?? null;
}

export async function saveDiaryAction(entry: DiaryEntry): Promise<void> {
  if (!DATE_RE.test(entry.date)) return;
  const user = await getCurrentUser();
  if (!user) return;
  // Clamp to sane bounds server-side.
  const safe: DiaryEntry = {
    date: entry.date,
    quranTarget: Math.max(1, Math.min(30, Math.trunc(entry.quranTarget) || 1)),
    quranDone: Math.max(0, Math.min(30, Math.trunc(entry.quranDone) || 0)),
    nafl: Object.fromEntries(Object.entries(entry.nafl || {}).map(([k, v]) => [k, Math.max(0, Math.trunc(Number(v)) || 0)])),
    duas: Object.fromEntries(Object.entries(entry.duas || {}).map(([k, v]) => [k, !!v])),
    note: String(entry.note || '').slice(0, 4000),
  };
  await (await getDiaryStore()).save(user.id, safe);
}
