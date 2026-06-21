# DB integration — conventions (read before any screen)

Every form persists to **Postgres** through the repo's existing seam. Do NOT introduce Prisma models
ad-hoc or a new ORM — follow the established pattern.

## The pattern (from packages/core-booking, payments, auth, support)
1. **Port** — a generic `Repository<T>` interface in the owning package's `src/ports.ts`:
   ```ts
   export interface Repository<T> {
     get(id: string): Promise<T | undefined>;
     save(entity: T): Promise<T>;
     list(): Promise<T[]>;
   }
   ```
   Add narrow methods when needed (e.g. `listByCustomer(id)`), same as `DocumentRepository.listByPilgrim`.
2. **In-memory adapter** — `src/in-memory.ts` implements the port (default in dev/test).
3. **Postgres adapter** — `src/postgres/`:
   - `schema.ts` exports **`SCHEMA_SQL`** — inline DDL, **idempotent** (`CREATE TABLE IF NOT EXISTS`),
     timestamps as ISO-8601 **TEXT**, money as integer **minor units**, structured blobs as **JSONB**.
   - `index.ts` implements the port with parametrised SQL (`pg`), maps rows ⇄ domain.
   - exported via `package.json` `"./postgres"` subpath (mirror existing packages).
4. **Wiring** — `apps/web` selects in-memory vs postgres by `DATABASE_URL` presence (see `src/connectors.ts`).
   Server Actions / route handlers call the **port**, never SQL directly from a component.

## Rules
- **Money:** integer minor units + a `currency` column; never floats, never mix currencies in one row.
- **Timestamps:** ISO-8601 text. **IDs:** typed string ids via `src/ids.ts` (BRN verbatim where applicable).
- **Validation:** Zod-parse form input at the action boundary before `save()` (schemas mirror `contracts`).
- **Audit:** financial/status changes append an `activity_logs` row (actor, entity, before/after, reason, ts).
- **Auth scope:** B2B agents only read their own customers — filter every query by `agent_id`/`agency_id`.
- **Migration:** running `SCHEMA_SQL` on boot is the dev path; for prod add a numbered migration in the
  package's `prisma/` or `infra/` per existing convention. Never destructive without a reason note.

## Per-form deliverables (every spec lists its own tables)
- [ ] Domain type in `contracts` (or package `domain.ts`) + Zod schema.
- [ ] `Repository<T>` port method(s).
- [ ] `SCHEMA_SQL` table(s) with indexes.
- [ ] in-memory + postgres adapters, both passing the same repo test.
- [ ] Server Action: `validate → save → revalidate`; optimistic UI optional.
- [ ] `activity_logs` entry on create/update of financial or status data.
