# ADR 0002 — Postgres persistence via node-postgres behind the repository ports
Date: 2026-06-13 · Status: accepted

## Context
core-booking defines persistence as `Repository<T>` ports with in-memory adapters
(dev/test default). We need a real Postgres implementation for staging/prod. The
build/test gate must stay green offline (no DB, no network), and the project ships a
Prisma schema as a persistence reference.

## Decision
Implement the Postgres adapter with **node-postgres (`pg`)** and hand-written SQL,
exposed at the `@auj/core-booking/postgres` subpath as `createPostgresStores(pool)`
returning the same `Stores` shape the in-memory adapter does. It is a drop-in for
`createCoreBooking({ stores })`.
- The DDL is an inline SQL string (`SCHEMA_SQL`) applied by `migrate(pool)` — no
  migration tool needed yet.
- Row↔domain mapping lives in pure functions (`mappers.ts`), unit-tested offline.
- Integration tests connect to a real Postgres only when `TEST_DATABASE_URL` is set;
  otherwise they skip, keeping the offline gate green.

## Why not Prisma (yet)
Prisma requires `prisma generate` (query-engine download) before `tsc` can compile
code that imports `@prisma/client`. That breaks the offline gate and the simple
`tsc` build. `pg` compiles with no codegen. The Prisma schema stays as documentation;
we can swap the adapter later behind the same ports without touching callers.

## Consequences
- Persistence is a drop-in env choice; the app uses Postgres when `DATABASE_URL` is set,
  in-memory otherwise. No domain/app changes.
- We own the SQL/migrations (a tiny inline schema for now); revisit a migration tool
  (Prisma Migrate / drizzle) when the schema grows.
- Integration coverage requires a real Postgres (docker-compose locally, or the IONOS
  Postgres via the SSH tunnel).

## Alternatives considered
- Prisma client — better DX/migrations, but codegen breaks the offline gate today.
- Drizzle ORM — typed SQL, but adds a dependency + learning curve for marginal gain now.
