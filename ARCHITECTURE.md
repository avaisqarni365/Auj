# Technical Architecture — Pilgrimage & Travel Platform

> Companion to the per-module skill files. Read this, then `CLAUDE.md`, then start Wave 0.

## 1. Principles
1. **Hybrid:** we BUILD the product (sites, booking, CRM, payments) and only INTEGRATE the
   regulated Saudi pipe (Maqam GDS / Nusuk Masar) and general-travel supply (bedbanks, flight GDS).
2. **One seam:** all Saudi access is behind a single interface (`SaudiConnector`). It is the only
   gated dependency, and it is quarantined so nothing else waits on it.
3. **Parallelizable:** define the contract + a mock first; build every other module against the mock.
4. **Two independent revenue legs:** general travel (open APIs — launch first) and pilgrimage (gated).

## 2. System context — build vs buy vs external
- **BUILD (ours):** web-b2c, web-b2b, admin, core-booking, payments, visa-router, contracts, mocks.
- **BUY / integrate:** certified Saudi connector (via partner/ERP), bedbank + flight GDS adapters.
- **EXTERNAL / regulated:** Maqam GDS / Nusuk Masar (Ministry-gated), bedbank/GDS suppliers,
  EU + PKR payment acquirers.

## 3. Component architecture (top → bottom)
```
apps:     web-b2c        web-b2b        admin
            │  typed API (tRPC) │           │
services: core-booking  ·  payments  ·  visa-router
            │  depends on interfaces only │
contracts: SaudiConnector  ·  TravelSupplier  ·  domain types (single source of truth)
            │  implemented by │
connectors: connector-mock (default) · connector-saudi (gated) · connector-travel
            │  maps to │
external:  Maqam/Nusuk · bedbanks/flight GDS · payment acquirers
```

## 4. Monorepo layout
```
/packages
  contracts/          shared TS types + interfaces + Zod schemas + contract-tests
  connector-mock/     in-memory SaudiConnector + TravelSupplier (dev/test default)
  connector-saudi/    real Maqam/Nusuk adapter (gated; Wave C)
  connector-travel/   bedbank + flight GDS adapters
  core-booking/       booking, CRM, documents, visa-router, package builder
  payments/           EUR + PKR gateways, agent wallet, double-entry ledger
/apps
  web-b2c/            public website (Next.js)
  web-b2b/            agent portal (Next.js)
  admin/             back office
/infra                Terraform, CI, environments
```

## 5. Technology stack (reference — swappable, but keep the contract in TS)
- Runtime: Node 20, TypeScript strict. Monorepo: pnpm workspaces + Turborepo.
- Front-end: Next.js (App Router) + React + Tailwind. i18n EN/LT/UR/AR via next-intl; RTL for Arabic.
- API: Fastify (or NestJS). tRPC for app↔API typing; OpenAPI for any external/B2B partner API.
- Data: PostgreSQL + Prisma. Redis for holds/cache and BullMQ job queues.
- Validation: Zod at every boundary (HTTP, connectors, webhooks).
- Auth: session/JWT; RBAC with agent→sub-agent hierarchy; admin SSO optional.
- Payments: Stripe (EUR) + a Pakistan gateway (e.g. Safepay/PayFast) behind a `PaymentProvider` port.
- Documents: S3-compatible object store (EU region) with presigned uploads; optional passport-MRZ OCR.
- Infra: Docker containers in an EU region (GDPR); Terraform IaC; managed Postgres + Redis.
- CI/CD: GitHub Actions with preview environments. Observability: OpenTelemetry + structured logs + Sentry.

## 6. Core data model
Customer 1—* Pilgrim (mahram self-link) · Package *—* Offer · Booking 1—* BookingItem (hotel|
transport|ground|flight, holds BRN) · Pilgrim 1—* Document · Booking 1—1 VisaCase (route+status) ·
Agent (hierarchy) 1—1 Wallet · Wallet 1—* LedgerEntry · Booking 1—* Payment.
Money is `{ amount: minorUnits, currency }`; IDs are UUID v7; timestamps ISO-8601 UTC.

## 7. The connector seam
`SaudiConnector` and `TravelSupplier` live in `contracts`. Concrete connectors map vendor payloads
INTO our domain types — never the reverse. The active connector is chosen by env
(`CONNECTOR=mock|saudi`); product code is identical across them. See the
`saudi-connector-interface` and `general-travel-connectors` skills for the exact method signatures.

## 8. Key flows
- **Booking:** search (connector) → hold → take payment (payments) → confirm (connector returns BRNs)
  → persist BRNs → booking CONFIRMED.
- **Visa:** visa-router decides EVISA_DIRECT vs AGENT_CHANNEL from passport/residence → connector
  creates the visa application → poll status. Visa flows enforce a Nusuk-approved hotel.
- **Payment + wallet:** B2C pays by card (EUR/PKR); B2B agents pay from a wallet with credit limits;
  every movement is a double-entry ledger record reconciled against gateway webhooks.
- **General travel:** identical booking shape via `TravelSupplier`; no Saudi dependency at all.

## 9. Environments & configuration
- **dev:** `CONNECTOR=mock`, all sandboxes faked, seeded data.
- **staging:** sandbox bedbank/flight + partner Saudi sandbox where available.
- **prod:** real connectors behind feature flags; Saudi flow dark-launched until certified.
Key env: `CONNECTOR`, `DATABASE_URL`, `REDIS_URL`, `STRIPE_*`, `PKR_GATEWAY_*`, `OBJECT_STORE_*`,
`SAUDI_PARTNER_*`, `EVISA_ELIGIBLE_LIST`, `SEASONAL_SUSPENSIONS`.

## 10. Security & compliance
- PCI: gateway tokenization only; never store PANs; idempotency keys on capture.
- GDPR: EU data residency, data-processing records, data-subject export/delete, signed DPAs.
- EU Package Travel Directive: issue a consumer security/insolvency certificate per package booking;
  present pre-contract info + record consent before charging; enforce the six-month insolvency
  refund window in the refund workflow.
- Secrets in a managed vault; least-privilege; audit log on bookings, payments, visa cases.

## 11. Deployment topology
EU region. Stateless app + API containers behind a load balancer; worker containers for BullMQ
jobs (holds expiry, webhook processing, document OCR, visa polling); managed Postgres + Redis;
object store for documents/vouchers; CDN in front of web-b2c.

## 12. Testing strategy
Unit tests per package · **shared contract-tests** run against BOTH connector-mock and (in Wave C)
connector-saudi · e2e against the mock for full flows · integration against bedbank/flight/payment
sandboxes. CI gates: typecheck, lint, unit, contract-tests, e2e-mock.

## 13. Build roadmap
- **Wave 0 (sequential):** scaffold monorepo → `contracts` (interfaces + types) → `connector-mock`.
- **Wave A (parallel, on mock):** core-booking, payments, visa-router, general-travel-connectors.
- **Wave B (parallel, on A):** web-b2c, web-b2b.
- **Wave C (gated/anytime):** connector-saudi (needs partner/Ministry access), compliance-eu, admin.

### Day-0 scaffold (illustrative)
```
pnpm dlx create-turbo@latest auj
cd auj
pnpm add -w zod typescript
# create packages/contracts, packages/connector-mock per their SKILL.md
# add prisma to packages/core-booking; spin up Postgres + Redis via docker-compose
# wire CONNECTOR=mock and run the scripted search→hold→confirm→BRN→visa demo
```

## 14. Key risks & dependencies
- **Saudi Maqam access is gated** (Ministry-approved). Mitigation: interface + mock + launch the
  general-travel leg first; treat connector-saudi as a swap-in.
- **Seasonal visa suspensions** for some nationalities — handled in visa-router as warnings/config.
- **PKR acquiring** can be harder than EUR — validate the Pakistan gateway early.
- **PTD/GDPR transposition** may tighten — keep compliance rules as config, not hard-coded.
