// Personal diary persistence — Postgres when DATABASE_URL is set, in-memory fallback.
// One row per (pilgrim, date).
import { createPool, type DbPool } from '@auj/core-booking/postgres';
import type { DiaryEntry, DiaryStore } from './diary';

const key = (userId: string, date: string): string => `${userId}::${date}`;

class InMemoryDiary implements DiaryStore {
  private readonly m = new Map<string, DiaryEntry>();
  async get(userId: string, date: string): Promise<DiaryEntry | undefined> {
    return this.m.get(key(userId, date));
  }
  async save(userId: string, entry: DiaryEntry): Promise<void> {
    this.m.set(key(userId, entry.date), entry);
  }
}

class PostgresDiary implements DiaryStore {
  constructor(private readonly pool: DbPool) {}
  async get(userId: string, date: string): Promise<DiaryEntry | undefined> {
    const r = await this.pool.query<{
      date: string;
      quran_target: number;
      quran_done: number;
      nafl: Record<string, number>;
      duas: Record<string, boolean>;
      note: string;
    }>(
      `SELECT to_char(date,'YYYY-MM-DD') AS date, quran_target, quran_done, nafl, duas, note
       FROM diary_entries WHERE pilgrim_id = $1 AND date = $2`,
      [userId, date],
    );
    const row = r.rows[0];
    return row
      ? {
          date: row.date,
          quranTarget: row.quran_target,
          quranDone: row.quran_done,
          nafl: row.nafl ?? {},
          duas: row.duas ?? {},
          note: row.note ?? '',
        }
      : undefined;
  }
  async save(userId: string, e: DiaryEntry): Promise<void> {
    await this.pool.query(
      `INSERT INTO diary_entries (pilgrim_id, date, quran_target, quran_done, nafl, duas, note, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, now())
       ON CONFLICT (pilgrim_id, date)
       DO UPDATE SET quran_target = $3, quran_done = $4, nafl = $5, duas = $6, note = $7, updated_at = now()`,
      [userId, e.date, e.quranTarget, e.quranDone, JSON.stringify(e.nafl), JSON.stringify(e.duas), e.note],
    );
  }
}

const KEY = Symbol.for('auj.ritual.diary.store');
const g = globalThis as unknown as { [KEY]?: Promise<DiaryStore> };

async function init(): Promise<DiaryStore> {
  const url = process.env.DATABASE_URL;
  if (!url) return new InMemoryDiary();
  const pool = createPool(url);
  await pool.query(
    `CREATE TABLE IF NOT EXISTS diary_entries (
       pilgrim_id   text NOT NULL,
       date         date NOT NULL,
       quran_target integer NOT NULL DEFAULT 1,
       quran_done   integer NOT NULL DEFAULT 0,
       nafl         jsonb NOT NULL DEFAULT '{}'::jsonb,
       duas         jsonb NOT NULL DEFAULT '{}'::jsonb,
       note         text NOT NULL DEFAULT '',
       updated_at   timestamptz NOT NULL DEFAULT now(),
       PRIMARY KEY (pilgrim_id, date)
     )`,
  );
  return new PostgresDiary(pool);
}

export function getDiaryStore(): Promise<DiaryStore> {
  return (g[KEY] ??= init());
}
