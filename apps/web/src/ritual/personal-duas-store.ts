// Personal du'as — Postgres when DATABASE_URL is set, in-memory fallback. Per signed-in user; no
// localStorage (always DB). Sorted pinned-first then newest.
import { createPool, type DbPool } from '@auj/core-booking/postgres';
import type { DuaInput, DuasStore, PersonalDua } from './personal-duas-types';

function uuid(): string {
  return globalThis.crypto?.randomUUID?.() ?? `dua-${Date.now()}-${Math.floor(Math.random() * 1e9).toString(16)}`;
}
const sortDuas = (a: PersonalDua, b: PersonalDua): number => Number(b.pinned) - Number(a.pinned) || b.createdAt - a.createdAt;

export class InMemoryDuas implements DuasStore {
  private readonly m = new Map<string, PersonalDua[]>();
  async list(userId: string, stepKey?: string): Promise<PersonalDua[]> {
    const all = (this.m.get(userId) ?? []).filter((d) => !stepKey || d.stepKey === stepKey);
    return [...all].sort(sortDuas);
  }
  async save(userId: string, input: DuaInput): Promise<PersonalDua | null> {
    if (!input.text.trim()) return null;
    const list = this.m.get(userId) ?? [];
    const existing = input.id ? list.find((d) => d.id === input.id) : undefined;
    const dua: PersonalDua = {
      id: existing?.id ?? uuid(),
      stepKey: input.stepKey,
      text: input.text,
      lang: input.lang,
      translit: input.translit,
      meaning: input.meaning,
      note: input.note,
      pinned: existing?.pinned ?? input.pinned ?? false,
      createdAt: existing?.createdAt ?? Date.now(),
    };
    const next = existing ? list.map((d) => (d.id === dua.id ? dua : d)) : [dua, ...list];
    this.m.set(userId, next);
    return dua;
  }
  async remove(userId: string, id: string): Promise<void> {
    this.m.set(userId, (this.m.get(userId) ?? []).filter((d) => d.id !== id));
  }
  async togglePin(userId: string, id: string): Promise<void> {
    this.m.set(userId, (this.m.get(userId) ?? []).map((d) => (d.id === id ? { ...d, pinned: !d.pinned } : d)));
  }
}

interface Row {
  id: string;
  step_key: string;
  data: Omit<PersonalDua, 'id' | 'stepKey'>;
}
const toDua = (r: Row): PersonalDua => ({ id: r.id, stepKey: r.step_key, ...r.data });

class PostgresDuas implements DuasStore {
  constructor(private readonly pool: DbPool) {}
  async list(userId: string, stepKey?: string): Promise<PersonalDua[]> {
    const r = stepKey
      ? await this.pool.query<Row>('SELECT id, step_key, data FROM personal_duas WHERE user_id=$1 AND step_key=$2', [userId, stepKey])
      : await this.pool.query<Row>('SELECT id, step_key, data FROM personal_duas WHERE user_id=$1', [userId]);
    return r.rows.map(toDua).sort(sortDuas);
  }
  async save(userId: string, input: DuaInput): Promise<PersonalDua | null> {
    if (!input.text.trim()) return null;
    const id = input.id ?? uuid();
    const existing = input.id
      ? (await this.pool.query<Row>('SELECT id, step_key, data FROM personal_duas WHERE user_id=$1 AND id=$2', [userId, id])).rows[0]
      : undefined;
    const data: Omit<PersonalDua, 'id' | 'stepKey'> = {
      text: input.text,
      lang: input.lang,
      translit: input.translit,
      meaning: input.meaning,
      note: input.note,
      pinned: existing?.data.pinned ?? input.pinned ?? false,
      createdAt: existing?.data.createdAt ?? Date.now(),
    };
    await this.pool.query(
      'INSERT INTO personal_duas (id, user_id, step_key, data) VALUES ($1,$2,$3,$4) ON CONFLICT (id) DO UPDATE SET step_key=$3, data=$4',
      [id, userId, input.stepKey, data],
    );
    return { id, stepKey: input.stepKey, ...data };
  }
  async remove(userId: string, id: string): Promise<void> {
    await this.pool.query('DELETE FROM personal_duas WHERE user_id=$1 AND id=$2', [userId, id]);
  }
  async togglePin(userId: string, id: string): Promise<void> {
    await this.pool.query(
      "UPDATE personal_duas SET data = jsonb_set(data, '{pinned}', (NOT (data->>'pinned')::boolean)::text::jsonb) WHERE user_id=$1 AND id=$2",
      [userId, id],
    );
  }
}

const KEY = Symbol.for('auj.personal.duas.store');
const g = globalThis as unknown as { [KEY]?: Promise<DuasStore> };

async function init(): Promise<DuasStore> {
  const url = process.env.DATABASE_URL;
  if (!url) return new InMemoryDuas();
  const pool = createPool(url);
  await pool.query('CREATE TABLE IF NOT EXISTS personal_duas (id text PRIMARY KEY, user_id text NOT NULL, step_key text NOT NULL, data jsonb NOT NULL)');
  return new PostgresDuas(pool);
}

export function getDuasStore(): Promise<DuasStore> {
  return (g[KEY] ??= init());
}
