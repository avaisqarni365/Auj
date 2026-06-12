---
name: certified-saudi-connector
description: "Use this skill to build the REAL adapter that implements SaudiConnector against Maqam GDS / Nusuk Masar, via your Ministry-approved partner or ERP. This module is GATED on operator authorization and is built LAST. It must be a drop-in replacement for the mock — no product module changes when swapping it in."
---

# Certified Saudi connector (gated; build last)

## Scope
Implement `SaudiConnector` in `packages/connector-saudi` by mapping the partner/ERP/Maqam API
to our domain types. It is a drop-in for `connector-mock`, selected by env/flag in production.

## Hard prerequisite (not a coding task)
Live Maqam GDS / Nusuk Masar access is granted by the Ministry of Hajj and Umrah only after your
operator / external-agent authorization, or via a partner who already holds it. Do NOT block other
modules on this. The interface + mock let everything else ship first.

## Depends on
`saudi-connector-interface`. Credentials/spec from your Saudi-licensed partner or ERP vendor.

## Build steps
1. Wrap the partner/ERP/Maqam endpoints behind the interface; map their payloads → our types.
2. Implement auth (their token flow; some require per-agent codes + authenticator).
3. Enforce the 2025 rule: visa issuance requires a Nusuk-approved hotel booking — surface this as
   a validation error if a non-approved hotel is confirmed for a visa flow.
4. Map BRNs through verbatim. Handle holds/expiries per the partner's TTLs.
5. Add resilience: retries, idempotency keys on confirm, circuit-breaker, structured error mapping.
6. Run the SAME shared contract-tests used by the mock; they must pass against a sandbox.

## Acceptance criteria
- Passes shared contract-tests against the partner sandbox.
- Swapping `connector-mock` → `connector-saudi` requires only an env change; no product edits.

## Out of scope
Any product/UI logic. Eligibility decisions (those live in `visa-router`).
