---
name: getting-started
description: "Use this skill FIRST to scaffold the monorepo so every other skill has a place to land. It creates the pnpm + Turborepo workspace, the package/app skeleton, shared tooling (TS, ESLint, Zod, Prisma), env handling, and CI. Run before the connector interface."
---

# Getting started (scaffold the repo)

## Scope
Stand up an empty-but-wired TypeScript monorepo matching `ARCHITECTURE.md` so all other skills can
fill in their package/app. No business logic here — just structure, tooling, and green CI.

> Layout note (post-scaffold): the three app folders below (`web-b2c`/`web-b2b`/`admin`) were later
> unified into a single `apps/web` Next.js app (public + `/book` + `/agent` + `/admin`). The
> scaffold/tooling steps still apply verbatim; only the app folder names changed. See
> `00-architecture-and-conventions` for the current layout.

## Build steps
1. Init workspace:
   ```bash
   pnpm init && pnpm add -D turbo typescript @types/node eslint prettier vitest tsx
   ```
2. Create `pnpm-workspace.yaml`:
   ```yaml
   packages: ['packages/*', 'apps/*']
   ```
3. Create the skeleton folders (empty package.json + tsconfig each):
   `packages/{contracts,connector-mock,connector-saudi,connector-travel,core-booking,payments,compliance,ui}`
   `apps/{web-b2c,web-b2b,admin}` and `infra/`.
4. Root `tsconfig.base.json` (strict: true) extended by every package. Shared ESLint + Prettier.
5. Add `turbo.json` pipelines: `build`, `lint`, `test`, `dev` with proper `dependsOn`.
6. Tooling: add Zod to contracts; Prisma to core-booking + payments; docker-compose for
   Postgres + Redis + S3 mock; `.env.example` with `CONNECTOR=mock`, `SUPPLIER=mock`, DB/Redis URLs.
7. CI (GitHub Actions): install → lint → typecheck → test → build on every PR.
8. Root scripts in package.json: `dev`, `build`, `lint`, `test` delegating to turbo.

## Acceptance criteria
- `pnpm install && pnpm build && pnpm lint && pnpm test` all pass on an empty skeleton.
- `docker-compose up` brings Postgres + Redis + S3 mock; apps boot with `CONNECTOR=mock`.
- CI is green on a fresh PR.

## Out of scope
Any module logic — that belongs to the per-module skills.
