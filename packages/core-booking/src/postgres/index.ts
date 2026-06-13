// @auj/core-booking/postgres — a Postgres implementation of the repository ports.
// Kept on a subpath so the in-memory path never imports `pg`.
//
//   import { createPool, migrate, createPostgresStores } from '@auj/core-booking/postgres';
//   const pool = createPool(process.env.DATABASE_URL);
//   await migrate(pool);
//   const core = createCoreBooking({ saudi, travel, stores: createPostgresStores(pool) });
export { createPool, migrate, type DbPool } from './db';
export { createPostgresStores } from './repositories';
export * from './mappers';
export { SCHEMA_SQL } from './schema';
