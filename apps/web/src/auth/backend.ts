// Server-only composition root for auth. Postgres-backed when DATABASE_URL is set,
// in-memory otherwise. A lazily-created singleton, reused across requests, with a
// seeded admin so the back office is reachable on a fresh install.
import { AuthService, createInMemoryAuthStores } from '@auj/auth';
import { createPool, createPostgresAuthStores, migrateAuth } from '@auj/auth/postgres';

// Cache on globalThis so the in-memory store (users + sessions, and the seeded admin)
// survives Next dev's HMR / module re-evaluation — otherwise a recompile between login
// and navigation would silently drop the session.
const globalForAuth = globalThis as unknown as { __aujAuth?: Promise<AuthService> };

async function build(): Promise<AuthService> {
  const url = process.env.DATABASE_URL;
  const auth = url
    ? await (async () => {
        const pool = createPool(url);
        await migrateAuth(pool);
        return new AuthService(createPostgresAuthStores(pool));
      })()
    : new AuthService(createInMemoryAuthStores());
  await auth.ensureAdmin(
    process.env.ADMIN_EMAIL ?? 'admin@auj.example',
    process.env.ADMIN_PASSWORD ?? 'admin12345',
    'AUJ Admin',
  );
  return auth;
}

export function getAuth(): Promise<AuthService> {
  globalForAuth.__aujAuth ??= build();
  return globalForAuth.__aujAuth;
}
