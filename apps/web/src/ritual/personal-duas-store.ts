// Personal duas the pilgrim writes for each step. Saved on-device (localStorage — text is small and
// syncing isn't needed). Private; no AI is ever called here — an optional "translate" button can be
// added later behind the user's explicit click (brief feature #5). Pure-ish; unit-tested via jsdom.

export interface PersonalDua {
  id: string;
  stepKey: string;
  text: string;
  /** Language code the pilgrim wrote in (en, ar, ur, tr, de…). */
  lang: string;
  /** Optional transliteration (how to say it) + meaning (translation). */
  translit?: string;
  meaning?: string;
  /** Family names / personal note attached to this du'a. */
  note?: string;
  pinned: boolean;
  createdAt: number;
}

const KEY = 'auj.ritual.duas.v1';

function readAll(): PersonalDua[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PersonalDua[]) : [];
  } catch {
    return [];
  }
}

function writeAll(list: PersonalDua[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage full / disabled — non-fatal */
  }
}

function makeId(): string {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    /* fall through */
  }
  return `dua-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

/** Pinned first, then newest. Optionally filtered to one step. */
export function listDuas(stepKey?: string): PersonalDua[] {
  const all = stepKey ? readAll().filter((d) => d.stepKey === stepKey) : readAll();
  return all.sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt - a.createdAt);
}

/** Create (no id) or update (with id). Empty text is ignored. Returns the saved dua, or null. */
export function saveDua(input: {
  id?: string;
  stepKey: string;
  text: string;
  lang: string;
  translit?: string;
  meaning?: string;
  note?: string;
  pinned?: boolean;
}): PersonalDua | null {
  if (!input.text.trim()) return null;
  const all = readAll();
  if (input.id) {
    const idx = all.findIndex((d) => d.id === input.id);
    if (idx >= 0) {
      const existing = all[idx]!;
      const updated: PersonalDua = {
        ...existing,
        text: input.text,
        lang: input.lang,
        translit: input.translit,
        meaning: input.meaning,
        note: input.note,
      };
      all[idx] = updated;
      writeAll(all);
      return updated;
    }
  }
  const created: PersonalDua = {
    id: makeId(),
    stepKey: input.stepKey,
    text: input.text,
    lang: input.lang,
    translit: input.translit,
    meaning: input.meaning,
    note: input.note,
    pinned: input.pinned ?? false,
    createdAt: Date.now(),
  };
  writeAll([created, ...all]);
  return created;
}

export function deleteDua(id: string): void {
  writeAll(readAll().filter((d) => d.id !== id));
}

export function togglePin(id: string): void {
  writeAll(readAll().map((d) => (d.id === id ? { ...d, pinned: !d.pinned } : d)));
}

/** Pretty JSON of every personal dua, for the "export after Umrah" download. */
export function exportDuas(): string {
  return JSON.stringify(readAll(), null, 2);
}
