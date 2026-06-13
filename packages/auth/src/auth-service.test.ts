import { describe, it, expect } from 'vitest';
import { AuthService, AuthError } from './auth-service';
import { createInMemoryAuthStores } from './in-memory';

function make(now = () => '2026-06-13T00:00:00.000Z'): AuthService {
  return new AuthService({ ...createInMemoryAuthStores(), now });
}

describe('AuthService (in-memory)', () => {
  it('signs up a pilgrim, hashes the password, and issues a session', async () => {
    const auth = make();
    const { user, session } = await auth.signup({ email: 'Imran@Example.com', password: 'secret123', displayName: 'Imran' });
    expect(user.email).toBe('imran@example.com'); // lowercased
    expect(user.role).toBe('PILGRIM');
    expect((user as unknown as { passwordHash?: string }).passwordHash).toBeUndefined(); // never exposed
    expect(session.token).toBeTruthy();
    expect(await auth.getSessionUser(session.token)).toMatchObject({ email: 'imran@example.com' });
  });

  it('an agent signs up PENDING and is activated by approveAgent', async () => {
    const auth = make();
    const { user } = await auth.signup({ email: 'agent@a.com', password: 'secret123', displayName: 'Agent', role: 'AGENT' });
    expect(user.role).toBe('AGENT');
    expect(user.agentStatus).toBe('PENDING');
    const approved = await auth.approveAgent(user.id);
    expect(approved.agentStatus).toBe('ACTIVE');
  });

  it('rejects duplicate emails and wrong passwords', async () => {
    const auth = make();
    await auth.signup({ email: 'dup@a.com', password: 'secret123', displayName: 'A' });
    await expect(auth.signup({ email: 'dup@a.com', password: 'secret123', displayName: 'B' })).rejects.toThrow(AuthError);
    await expect(auth.login({ email: 'dup@a.com', password: 'wrongpass' })).rejects.toThrow(/Invalid email or password/);
    const ok = await auth.login({ email: 'dup@a.com', password: 'secret123' });
    expect(ok.user.email).toBe('dup@a.com');
  });

  it('rejects weak passwords and invalid emails at the schema boundary', async () => {
    const auth = make();
    await expect(auth.signup({ email: 'not-an-email', password: 'secret123', displayName: 'X' })).rejects.toThrow();
    await expect(auth.signup({ email: 'a@b.com', password: 'short', displayName: 'X' })).rejects.toThrow();
  });

  it('expires sessions and clears them on logout', async () => {
    let t = '2026-06-13T00:00:00.000Z';
    const auth = new AuthService({ ...createInMemoryAuthStores(), now: () => t });
    const { session } = await auth.signup({ email: 'exp@a.com', password: 'secret123', displayName: 'E' });
    expect(await auth.getSessionUser(session.token)).toBeTruthy();
    t = '2026-06-30T00:00:00.000Z'; // > 7 days later
    expect(await auth.getSessionUser(session.token)).toBeUndefined();

    const fresh = await auth.login({ email: 'exp@a.com', password: 'secret123' });
    await auth.logout(fresh.session.token);
    expect(await auth.getSessionUser(fresh.session.token)).toBeUndefined();
  });

  it('ensureAdmin is idempotent', async () => {
    const auth = make();
    const a = await auth.ensureAdmin('admin@auj.example', 'adminpass1');
    const b = await auth.ensureAdmin('admin@auj.example', 'differentpass');
    expect(a.id).toBe(b.id);
    expect(a.role).toBe('ADMIN');
    expect((await auth.login({ email: 'admin@auj.example', password: 'adminpass1' })).user.role).toBe('ADMIN');
  });
});
