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

export const NAFL: Array<{ key: string; label: string; note: string }> = [
  { key: 'tahajjud', label: 'Tahajjud', note: 'Night prayer' },
  { key: 'duha', label: 'Duha (Chasht)', note: 'Forenoon prayer' },
  { key: 'witr', label: 'Witr', note: 'After Isha' },
  { key: 'rawatib', label: 'Sunnah Rawatib', note: 'Before/after fard' },
  { key: 'extra', label: 'Extra nafl', note: 'Voluntary rakʿah' },
];

export const DUAS: Array<{ key: string; label: string }> = [
  { key: 'forgive', label: 'Forgiveness' },
  { key: 'parents', label: 'For my parents' },
  { key: 'health', label: 'Health & shifa' },
  { key: 'ummah', label: 'The Ummah' },
  { key: 'rizq', label: 'Rizq & guidance' },
  { key: 'need', label: 'My special need' },
  { key: 'accept', label: 'Acceptance of Umrah' },
];

export function emptyEntry(date: string): DiaryEntry {
  return { date, quranTarget: 1, quranDone: 0, nafl: {}, duas: {}, note: '' };
}

export function naflTotal(e: DiaryEntry): number {
  return NAFL.reduce((a, n) => a + (e.nafl[n.key] || 0), 0);
}

export function duaDone(e: DiaryEntry): number {
  return DUAS.reduce((a, d) => a + (e.duas[d.key] ? 1 : 0), 0);
}

export function quranPct(e: DiaryEntry): number {
  const target = e.quranTarget || 1;
  return Math.max(0, Math.min(100, Math.round((e.quranDone / target) * 100)));
}

export interface DiaryStore {
  get(userId: string, date: string): Promise<DiaryEntry | undefined>;
  save(userId: string, entry: DiaryEntry): Promise<void>;
}
