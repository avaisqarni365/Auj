import { describe, it, expect } from 'vitest';
import { newDb } from 'pg-mem';
import { AuthService } from '../auth-service';
import { migrateAuth, type DbPool } from './db';
import { createPostgresAuthStores } from './repositories';

// Exercises the real SQL + repositories against an in-memory Postgres emulator.
async function freshPool(): Promise<DbPool> {
  const db = newDb();
  const { Pool } = db.adapters.createPg();
  const pool = new Pool() as unknown as DbPool;
  await migrateAuth(pool);
  return pool;
}

describe('auth Postgres adapter against pg-mem', () => {
  it('round-trips a user + session and authenticates across fresh stores', async () => {
    const pool = await freshPool();
    const auth = new AuthService({ ...createPostgresAuthStores(pool), now: () => '2026-06-13T00:00:00.000Z' });

    const { user, session } = await auth.signup({ email: 'p@x.example', password: 'secret123', displayName: 'P', role: 'AGENT' });
    expect(user.agentStatus).toBe('PENDING');

    // A separate service instance on the same pool proves persistence.
    const fresh = new AuthService({ ...createPostgresAuthStores(pool), now: () => '2026-06-13T00:00:00.000Z' });
    expect(await fresh.getSessionUser(session.token)).toMatchObject({ email: 'p@x.example' });
    const approved = await fresh.approveAgent(user.id);
    expect(approved.agentStatus).toBe('ACTIVE');
    expect((await fresh.login({ email: 'p@x.example', password: 'secret123' })).user.agentStatus).toBe('ACTIVE');
  });

  it('enforces unique email and clears sessions on logout', async () => {
    const pool = await freshPool();
    const auth = new AuthService(createPostgresAuthStores(pool));
    await auth.signup({ email: 'u@x.example', password: 'secret123', displayName: 'U' });
    await expect(auth.signup({ email: 'u@x.example', password: 'secret123', displayName: 'U2' })).rejects.toThrow();
    const { session } = await auth.login({ email: 'u@x.example', password: 'secret123' });
    await auth.logout(session.token);
    expect(await auth.getSessionUser(session.token)).toBeUndefined();
  });
});
