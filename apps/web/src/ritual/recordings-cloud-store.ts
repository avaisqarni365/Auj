// Durable cloud copy of a pilgrim's voice recordings (opt-in). Audio bytes live in the object
// store; metadata in `pilgrim_recordings`. The on-device IndexedDB store stays the private default.
import { createPool, type DbPool } from '@auj/core-booking/postgres';

export interface CloudRecording {
  id: string;
  stepKey: string;
  name: string;
  lang: string;
  audioKey: string;
  mime: string;
  durationSec: number;
  createdAt: string;
}

export interface CloudRecordingStore {
  list(userId: string, stepKey?: string): Promise<CloudRecording[]>;
  add(userId: string, rec: CloudRecording): Promise<void>;
  remove(userId: string, id: string): Promise<void>;
}

class InMemoryCloudRecordings implements CloudRecordingStore {
  private readonly m = new Map<string, CloudRecording[]>();
  async list(userId: string, stepKey?: string): Promise<CloudRecording[]> {
    const all = this.m.get(userId) ?? [];
    return (stepKey ? all.filter((r) => r.stepKey === stepKey) : all).slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  async add(userId: string, rec: CloudRecording): Promise<void> {
    const arr = this.m.get(userId) ?? [];
    arr.push(rec);
    this.m.set(userId, arr);
  }
  async remove(userId: string, id: string): Promise<void> {
    this.m.set(userId, (this.m.get(userId) ?? []).filter((r) => r.id !== id));
  }
}

class PostgresCloudRecordings implements CloudRecordingStore {
  constructor(private readonly pool: DbPool) {}
  async list(userId: string, stepKey?: string): Promise<CloudRecording[]> {
    const r = stepKey
      ? await this.pool.query<Row>(SELECT + ' AND step_key = $2 ORDER BY created_at DESC', [userId, stepKey])
      : await this.pool.query<Row>(SELECT + ' ORDER BY created_at DESC', [userId]);
    return r.rows.map(fromRow);
  }
  async add(userId: string, rec: CloudRecording): Promise<void> {
    await this.pool.query(
      `INSERT INTO pilgrim_recordings (id, pilgrim_id, step_key, name, lang, audio_key, mime, duration_sec)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [rec.id, userId, rec.stepKey, rec.name, rec.lang, rec.audioKey, rec.mime, rec.durationSec],
    );
  }
  async remove(userId: string, id: string): Promise<void> {
    await this.pool.query('DELETE FROM pilgrim_recordings WHERE pilgrim_id = $1 AND id = $2', [userId, id]);
  }
}

interface Row {
  id: string;
  step_key: string;
  name: string;
  lang: string;
  audio_key: string;
  mime: string;
  duration_sec: number;
  created_at: string;
}
const SELECT =
  "SELECT id, step_key, name, lang, audio_key, mime, duration_sec, to_char(created_at,'YYYY-MM-DD\"T\"HH24:MI:SSZ') AS created_at FROM pilgrim_recordings WHERE pilgrim_id = $1";
const fromRow = (x: Row): CloudRecording => ({
  id: x.id,
  stepKey: x.step_key,
  name: x.name,
  lang: x.lang,
  audioKey: x.audio_key,
  mime: x.mime,
  durationSec: x.duration_sec,
  createdAt: x.created_at,
});

const KEY = Symbol.for('auj.ritual.cloudrecordings.store');
const g = globalThis as unknown as { [KEY]?: Promise<CloudRecordingStore> };

async function init(): Promise<CloudRecordingStore> {
  const url = process.env.DATABASE_URL;
  if (!url) return new InMemoryCloudRecordings();
  const pool = createPool(url);
  await pool.query(`CREATE TABLE IF NOT EXISTS pilgrim_recordings (
     id text PRIMARY KEY, pilgrim_id text NOT NULL, step_key text NOT NULL DEFAULT '', name text NOT NULL DEFAULT '',
     lang text NOT NULL DEFAULT 'en', audio_key text NOT NULL, mime text NOT NULL DEFAULT 'audio/webm',
     duration_sec integer NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now())`);
  return new PostgresCloudRecordings(pool);
}

export function getCloudRecordingStore(): Promise<CloudRecordingStore> {
  return (g[KEY] ??= init());
}
