// Server-only composition root for support. Postgres-backed when DATABASE_URL is set,
// in-memory otherwise. Cached on globalThis so the in-memory tickets survive Next dev HMR.
import { SupportService, createInMemoryTicketRepository } from '@auj/support';
import { createPool, createPostgresTicketRepository, migrateSupport } from '@auj/support/postgres';

const globalForSupport = globalThis as unknown as { __aujSupport?: Promise<SupportService> };

async function build(): Promise<SupportService> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const pool = createPool(url);
    await migrateSupport(pool);
    return new SupportService({ tickets: createPostgresTicketRepository(pool) });
  }
  return new SupportService({ tickets: createInMemoryTicketRepository() });
}

export function getSupport(): Promise<SupportService> {
  globalForSupport.__aujSupport ??= build();
  return globalForSupport.__aujSupport;
}
