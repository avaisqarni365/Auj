import pg from 'pg';
import { SCHEMA_SQL } from './schema';

export type DbPool = pg.Pool;

/** Create a connection pool from a connection string (or DATABASE_URL). */
export function createPool(connectionString?: string): pg.Pool {
  const url = connectionString ?? process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return new pg.Pool({ connectionString: url });
}

/** Apply the schema (idempotent). Run once at startup / in deploy. */
export async function migrate(pool: pg.Pool): Promise<void> {
  await pool.query(SCHEMA_SQL);
}
