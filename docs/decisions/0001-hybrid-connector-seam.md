# ADR 0001 — Hybrid architecture with a single SaudiConnector seam
Date: 2026-06-12 · Status: accepted

## Context
The Saudi Umrah pipe (Maqam GDS / Nusuk Masar) is Ministry-gated and cannot be self-integrated
quickly; it is the only hard external dependency. We are a technical team that can build the app
layer cheaply, and we also sell general (non-pilgrimage) travel via open APIs.

## Decision
Build the product ourselves and reach ALL external supply through interfaces (`SaudiConnector`,
`TravelSupplier`) in `packages/contracts`. Default everything to `connector-mock` in dev/test;
select the real Saudi connector by env (`CONNECTOR=saudi`) in production once a partner/Ministry
link exists. The general-travel leg ships first with zero Saudi dependency.

## Consequences
- All modules build in parallel against the mock; nothing waits on Saudi access.
- Swapping mock → real connector is an env change, not a rewrite.
- We carry a mock-vs-real risk: real Maqam payloads are assumed until the partner sandbox (Wave C).

## Alternatives considered
- Buy a turnkey ERP — fast but rents the UI/data and locks us in; poor fit for a technical team.
- Pursue our own Maqam certification first — long, gated, blocks everything; defer to scale.
