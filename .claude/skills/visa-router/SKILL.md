---
name: visa-router
description: "Use this skill to build the eligibility engine that routes each pilgrim to the correct visa channel — direct Saudi e-visa vs MoRA/agent channel — based on passport and residence. Pure domain logic, no network. Build in parallel wave A; consumed by booking and both apps."
---

# Visa router (eligibility engine)

## Scope
A pure function library in `packages/core-booking` (or its own package) that decides the visa
route for a pilgrim. No I/O. Deterministic and unit-tested. Eligibility follows the TRAVELLER,
never the company's location.

## Depends on
`saudi-connector-interface` (Pilgrim, VisaRoute types).

## Rules (encode as data + tests)
- `EVISA_DIRECT` if: nationality is on the Saudi e-visa-eligible list, OR pilgrim holds valid
  Schengen/UK/US residence or a used Schengen/UK/US visa, OR is a GCC resident.
- `AGENT_CHANNEL` otherwise (e.g. Pakistani passport, resident in Pakistan, no qualifying visa) —
  must go via a MoRA-licensed operator + Nusuk Masar.
- Flag seasonal suspensions: a configurable list of nationalities temporarily blocked during Hajj
  prep; return a `warning` with the route rather than a hard pass.

## Build steps
1. Model `eligibleNationalities[]` and `residenceQualifiers[]` as config (easy to update).
2. Implement `routeFor(pilgrim): { route: VisaRoute; warnings: string[] }`.
3. Add a `seasonalSuspensions` config with date windows + nationality list.
4. Exhaustive unit tests: each branch, dual-national preference, missing data → safe default.

## Acceptance criteria
- 100% branch coverage on the routing rules.
- Updating the eligibility lists requires only a config change, no code change.

## Out of scope
Submitting the visa (that's the connector), document collection (booking/CRM).
