# 13 · Admin: Service Providers · Saudi Connector · Nusuk Services · Travel Suppliers

**Prototypes:** `AUJ Service Providers`, `AUJ Saudi Connector`, `AUJ Nusuk Services`, `AUJ Travel Suppliers.dc.html`
**Target:** `apps/web/app/admin/<slug>/`
**Wave:** C

## What they are
- **Service Providers:** admin registry over the connector seam — status (connected/sandbox/gated/not-configured),
  capabilities, env binding, Test connection, rotate creds.
- **Saudi Connector:** ops console for the gated certified adapter (auth gate, contract tests, domain mapping, resilience, 2025 Nusuk-hotel rule).
- **Nusuk Services:** approved-agent parity (package modes, Rawdah permit, ziyarah/meals add-ons, gift Umrah, e-services).
- **Travel Suppliers:** bedbank/flight GDS status, TravelSupplier interface, search→book→cancel net offers.

## Port map
- Provider registry → derive status from env presence (`src/connectors.ts`); sample data in dev.
- Test connection → call adapter `auth/ping` (stub now). These are **ops views over interfaces** — never bypass them.
- Nusuk package mode / Rawdah → new methods on `SaudiConnector` in `contracts` (mock first): `bookRawdah`, package-mode.

## DB integration (see 00b-db-conventions.md)
- `service_providers (id, name, kind, adapter, status, capabilities JSONB, env_keys JSONB, agent_code, last_checked, latency_ms)`
  via `ProviderRepository` — registry-driven so new providers need no product code change. **Secrets never in DB/UI** — vault only; store key *names*.
- Nusuk add-ons that a pilgrim selects persist on the **booking** (`booking_selections`, spec 06), not here.
- `health_checks (id, provider_id, ts, ok, latency_ms, message)` appended by Test connection.

## Command
```
Implement the admin connector screens from their .dc.html refs at app/admin/providers,
app/admin/connector, app/admin/nusuk, app/admin/suppliers.
DB: service_providers (registry; status from env presence) + health_checks (SCHEMA_SQL, adapters,
  repo tests). Store env KEY NAMES only — secrets in vault, never DB/UI.
UI: provider table + detail drawer (capabilities, env binding, Test connection→adapter auth/ping stub,
  rotate creds); Saudi Connector ops console (mock↔certified flag, contract tests, domain mapping,
  resilience, 2025 Nusuk-hotel validation); Nusuk Services (package modes, Rawdah slot, add-ons, gift,
  e-services — Rawdah/package-mode = new SaudiConnector methods in contracts, mock first); Travel
  Suppliers (status + search→book→cancel net offers via TravelSupplier mock).
packages/ui + tokens.css. Pass: typecheck, lint, unit, contract-tests, e2e-mock. Summarize; update sessions/.
```

## Acceptance
- [ ] Registry lists every integration w/ accurate status + capabilities; Test connection per provider.
- [ ] New provider added via registry without product-module changes; secrets not in DB/UI.
- [ ] Nusuk Rawdah/package-mode go through SaudiConnector interface (mock) — drop-in for real.
