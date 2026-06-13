import { describe, it, expect } from 'vitest';
import { newDb } from 'pg-mem';
import { SupportService } from '../service';
import { migrateSupport, type DbPool } from './db';
import { createPostgresTicketRepository } from './repositories';

async function freshPool(): Promise<DbPool> {
  const db = newDb();
  const { Pool } = db.adapters.createPg();
  const pool = new Pool() as unknown as DbPool;
  await migrateSupport(pool);
  return pool;
}

describe('support Postgres adapter against pg-mem', () => {
  it('round-trips a ticket + thread across fresh services', async () => {
    const pool = await freshPool();
    const svc = new SupportService({ tickets: createPostgresTicketRepository(pool), now: () => '2026-06-13T00:00:00.000Z' });
    const t = await svc.open({ id: 'u1', email: 'a@x.example', name: 'Aisha' }, { subject: 'Visa help', category: 'VISA', body: 'status?' });
    await svc.reply(t.id, 'STAFF', 'Omar', 'Looking into it');

    const fresh = new SupportService({ tickets: createPostgresTicketRepository(pool), now: () => '2026-06-13T00:00:00.000Z' });
    const reloaded = await fresh.get(t.id);
    expect(reloaded?.ref).toBe(t.ref);
    expect(reloaded?.status).toBe('PENDING');
    expect(reloaded?.messages).toHaveLength(2);
    expect(await fresh.listByUser('u1')).toHaveLength(1);
    expect((await fresh.setStatus(t.id, 'RESOLVED')).status).toBe('RESOLVED');
  });
});
