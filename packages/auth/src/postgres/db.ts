import pg from 'pg';
import { AUTH_SCHEMA_SQL } from './schema';

export type DbPool = pg.Pool;

/** Create a connection pool (or reuse one shared with core-booking). */
export function createPool(connectionString?: string): pg.Pool {
  const url = connectionString ?? process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return new pg.Pool({ connectionString: url });
}

/** Apply the auth schema (idempotent). Safe to run alongside core-booking's migrate. */
export async function migrateAuth(pool: pg.Pool): Promise<void> {
  await pool.query(AUTH_SCHEMA_SQL);
}
