# Pilgrimage & Travel Platform — Complete Build Kit

Everything Claude Code (or a developer) needs to build the hybrid Umrah/Hajj + general-travel
platform: the architecture, the orchestration, ready-to-paste prompts, and one skill file per module.

## What's in here
- `ARCHITECTURE.md` — the complete technical architecture (read first).
- `CLAUDE.md` — orchestration: golden rules, build waves, quality gates. Place at repo root.
- `PROMPTS.md` — copy-paste prompts to drive Claude Code (kickoff, contracts-first, per-module,
  wave orchestration) and a Claude Design UI prompt.
- `*/SKILL.md` — one self-contained spec per module (Scope, Depends/Provides, Build steps,
  Acceptance criteria, Out of scope).

## The golden rule that makes this fast
> Build the **contracts and a mock first**, then build every product module in parallel against the
> mock. Swap real connectors in last, behind the same interface. Product modules never import a real
> Saudi/GDS integration — only the interfaces in `contracts`, satisfied by `connector-mock`.

## Build order (and what runs in parallel)
1. **Wave 0 — sequential:** `00-getting-started` (scaffold the monorepo) → read
   `00-architecture-and-conventions` → `saudi-connector-interface` → `saudi-connector-mock`.
2. **Wave A — parallel (against the mock):** `booking-crm-documents`, `payments-wallet`,
   `visa-router`, `general-travel-connectors`.
3. **Wave B — parallel (on Wave A's APIs):** `b2c-website`, `b2b-agent-portal`.
4. **Wave C — gated / anytime:** `certified-saudi-connector` (needs Ministry/partner access),
   `compliance-eu` (finalize before launch), `admin`.

## First launchable slice
The general-travel leg (`general-travel-connectors` + booking + payments + `b2c-website`) has ZERO
Saudi dependency — ship it first to prove the stack and start revenue while Saudi access is pending.

## How to use with Claude Code
- Drop this folder into your repo. Put `CLAUDE.md` and `ARCHITECTURE.md` at the root.
- Paste the master kickoff prompt from `PROMPTS.md`, then drive wave by wave.
- One skill per branch/agent so parallel work never collides. "Acceptance criteria" = definition of done.

## Reference stack (swappable; keep the contract in TypeScript)
pnpm + Turborepo monorepo · TypeScript strict · Next.js front-ends (i18n EN/LT/UR/AR, RTL) ·
Fastify/NestJS API with tRPC · PostgreSQL + Prisma · Redis + BullMQ · Zod · Stripe (EUR) + a PKR
gateway · S3-compatible docs (EU region) · Terraform · GitHub Actions · OpenTelemetry + Sentry.
