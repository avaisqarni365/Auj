import pg from 'pg';
import { SUPPORT_SCHEMA_SQL } from './schema';

export type DbPool = pg.Pool;

/** Create a connection pool (or reuse one shared with core-booking/auth). */
export function createPool(connectionString?: string): pg.Pool {
  const url = connectionString ?? process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return new pg.Pool({ connectionString: url });
}

/** Apply the support schema (idempotent). Safe to run alongside the other migrations. */
export async function migrateSupport(pool: pg.Pool): Promise<void> {
  await pool.query(SUPPORT_SCHEMA_SQL);
}
