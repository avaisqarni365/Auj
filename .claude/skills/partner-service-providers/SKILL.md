---
name: partner-service-providers
description: "Build the admin 'Service providers' area to manage partner/supplier API integrations (Nusuk Masar / Maqam GDS, bedbanks, flight GDS, payment gateways, object store) — connection status, credentials, capabilities, health checks, and onboarding new providers. Mirrors Nusuk's 'licensed/approved providers' directory. Lives in apps/web /admin."
---

# Partner service providers (admin API management)

Like Nusuk lists only licensed/approved providers, AUJ admin needs a **Service providers** console to
see and manage every external integration behind our connector seam — so ops can check what's
connected, with which credentials and capabilities, and onboard new partners later.

## Scope
In `apps/web` `/admin` → a **Service providers** view. Each provider is one row/card:
- **Identity**: name, kind (Saudi pilgrimage / hotels / flights / payments EUR / payments PKR / object store / OCR).
- **Status**: `connected` (live), `sandbox` (test creds), `gated` (awaiting authorization, e.g. Nusuk),
  `not-configured`. Coloured pill (success/info/warning/danger).
- **Capabilities**: what the provider exposes (e.g. Nusuk: hotels, transport, ground/ziyarah, e-Visa,
  Rawdah permit, BRN; Stripe: card/SEPA/refund/webhook).
- **Binding**: which `CONNECTOR`/`SUPPLIER`/`PROVIDER` env selects it + the env-var keys it needs.
- **Health**: last checked, a "Test connection" action (calls the adapter's auth/ping), latency.
- **Manage**: rotate credentials, enable/disable, view contract/agent code (Nusuk external-agent code).

## The providers (today)
| Provider | Kind | Adapter | Status now |
|---|---|---|---|
| Nusuk Masar / Maqam GDS | Saudi pilgrimage | `connector-saudi` | gated (shell + sandbox client) |
| TBO / Hotelbeds | General hotels | `connector-travel` | sandbox |
| Amadeus / Sabre | Flights (GDS) | `connector-travel` | sandbox |
| Stripe | Payments · EUR | `payments` (StripeProvider) | sandbox |
| Safepay / PayFast | Payments · PKR | `payments` (PkrGatewayProvider) | sandbox |
| S3 / MinIO | Document store | `core-booking` DocumentStore | not-configured |
| Passport OCR | Documents | `core-booking` PassportOcr port | not-configured |

## Build steps
1. Add a `service-providers` registry (typed list + status) — derive status from env presence in prod;
   sample data in dev.
2. Admin `/admin` → "Service providers" nav item + table/cards (status pill, capabilities, env binding).
3. Per-provider detail drawer: capabilities checklist, env keys, "Test connection", last-checked, agent code.
4. "Add provider" affordance (onboarding flow placeholder) for future partners.
5. Wire status to reality where possible: a provider is `connected` if its credential env vars are set,
   else `sandbox`/`not-configured`; `gated` for connector-saudi until partner access lands.

## Acceptance
- Admin lists every integration with an accurate status + capabilities.
- A "Test connection" action exists per provider (stub now; calls the adapter's auth/ping when real).
- New providers can be represented without code changes to product modules (registry-driven).

## Architecture (hybrid)
This is an **ops/admin** view over the connector seam — it never bypasses the interfaces. Providers map
1:1 to adapters behind `SaudiConnector` / `TravelSupplier` / `PaymentProvider` / `DocumentStore`.
Selecting a provider is an env/flag change; product modules never change. Real credential storage uses
a secrets vault (never in the DB/UI in plaintext).

## Out of scope
Real secret storage/rotation backend (vault), and the partners' own onboarding/legal.
