// Personal diary data + helpers (migration 09). Pure + client-safe (no pg).
// One entry per pilgrim per day: Quran target/done, nafl counters, dua checklist, reflection.

export interface DiaryEntry {
  date: string; // YYYY-MM-DD
  quranTarget: number;
  quranDone: number;
  nafl: Record<string, number>;
  duas: Record<string, boolean>;
  note: string;
}

export type NaflDef = { key: string; label: string; note: string };
export type DuaDef = { key: string; label: string };
export type DiaryDefaults = { quranTarget: number; nafl: NaflDef[]; duas: DuaDef[] };

export const NAFL: NaflDef[] = [
  { key: 'tahajjud', label: 'Tahajjud', note: 'Night prayer' },
  { key: 'duha', label: 'Duha (Chasht)', note: 'Forenoon prayer' },
  { key: 'witr', label: 'Witr', note: 'After Isha' },
  { key: 'rawatib', label: 'Sunnah Rawatib', note: 'Before/after fard' },
  { key: 'extra', label: 'Extra nafl', note: 'Voluntary rakʿah' },
];

export const DUAS: DuaDef[] = [
  { key: 'forgive', label: 'Forgiveness' },
  { key: 'parents', label: 'For my parents' },
  { key: 'health', label: 'Health & shifa' },
  { key: 'ummah', label: 'The Ummah' },
  { key: 'rizq', label: 'Rizq & guidance' },
  { key: 'need', label: 'My special need' },
  { key: 'accept', label: 'Acceptance of Umrah' },
];

// Default Quran target / nafl list / dua checklist — the seed an admin can override (migration 10).
export const DIARY_DEFAULTS_SEED: DiaryDefaults = { quranTarget: 1, nafl: NAFL, duas: DUAS };

export function emptyEntry(date: string, quranTarget = 1): DiaryEntry {
  return { date, quranTarget, quranDone: 0, nafl: {}, duas: {}, note: '' };
}

export function naflTotal(e: DiaryEntry, nafl: NaflDef[] = NAFL): number {
  return nafl.reduce((a, n) => a + (e.nafl[n.key] || 0), 0);
}

export function duaDone(e: DiaryEntry, duas: DuaDef[] = DUAS): number {
  return duas.reduce((a, d) => a + (e.duas[d.key] ? 1 : 0), 0);
}

export function quranPct(e: DiaryEntry): number {
  const target = e.quranTarget || 1;
  return Math.max(0, Math.min(100, Math.round((e.quranDone / target) * 100)));
}

export interface DiaryStore {
  get(userId: string, date: string): Promise<DiaryEntry | undefined>;
  save(userId: string, entry: DiaryEntry): Promise<void>;
}
