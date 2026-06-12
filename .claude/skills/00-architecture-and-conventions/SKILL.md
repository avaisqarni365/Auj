---
name: architecture-and-conventions
description: "Use this skill FIRST and keep it loaded for every module of the pilgrimage/travel platform. It defines the repo layout, shared conventions, the module map, and the non-negotiable rule that all Saudi/GDS access goes through interface adapters — never imported directly into product modules. Read before building any other skill."
---

# Architecture & conventions (read first)

## What we are building
A hybrid Umrah/Hajj + general-travel platform. We BUILD the product (B2C site, B2B portal,
booking, CRM, payments) and only BUY/integrate the regulated Saudi pipe (Maqam GDS / Nusuk
Masar) and general-travel supply (bedbanks, flight GDS) behind adapters.

## The one rule that protects velocity
All external supply is reached through an interface (`SaudiConnector`, `TravelSupplier`).
Product modules import the **interface**, never a concrete integration. This lets us:
- build every module in parallel against a mock,
- launch the general-travel side with zero Saudi dependency,
- swap a bought Saudi connector for our own certified one later, with no product changes.

## Repo layout (monorepo)
```
/packages
  contracts/            # shared TS types + interfaces (SaudiConnector, TravelSupplier, domain models)
  connector-mock/       # in-memory implementation of the contracts (dev + tests)
  connector-saudi/      # real Maqam/Nusuk adapter (gated; later)
  connector-travel/     # bedbank + flight GDS adapters
  core-booking/         # booking, CRM, documents, visa-router (domain services + API)
  payments/             # gateways (EUR, PKR), wallet, ledger
/apps
  web-b2c/              # public website
  web-b2b/              # agent portal
  admin/               # back office
/infra                  # IaC, CI, env
```

## Conventions
- Language: TypeScript, strict. Validation with Zod at every boundary.
- IDs: UUID v7. Money is always `{ amount: integer_minor_units, currency: 'EUR'|'PKR'|'SAR' }`.
- All dates ISO-8601 UTC. Never store amounts as floats.
- Every service exposes a typed API (tRPC or OpenAPI) consumed by the apps.
- Feature flags gate anything touching the real Saudi connector.
- Tests: each module ships unit tests + a contract test proving it works against `connector-mock`.

## Definition of "done" for any module
Builds, lints, passes its own tests AND the shared contract tests, runs end-to-end against
`connector-mock` with no reference to a real integration.

## Out of scope here
Concrete UI design, marketing, and the legal/licensing steps (those live in the operator guide,
not in code).
