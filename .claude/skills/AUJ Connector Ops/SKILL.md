---
name: AUJ Connector Ops
description: "The admin ops consoles over the integration seam — Saudi Connector, Travel Suppliers, Nusuk Services and Service Providers. Everything goes through interfaces; never import a concrete connector."
---

# AUJ Connector Ops

## What it is
Four ADMIN-only cockpits over AUJ's integration seam: the regulated **Saudi Connector** (Maqam/Nusuk),
the general **Travel Suppliers** (bedbanks + flight GDS), the **Nusuk Services** parity surface
(packages/Rawdah/add-ons/gift/e-services), and the **Service Providers** registry (status + health).
Golden rule: product modules import the *interface*, never a concrete adapter; mock by default.

## Source prototypes (in this folder)
`AUJ Saudi Connector.dc.html` · `AUJ Travel Suppliers.dc.html` · `AUJ Nusuk Services.dc.html` ·
`AUJ Service Providers.dc.html`

## Where the logic lives
- **Saudi Connector** → route `/admin/connector` (ADMIN) · `apps/web/src/admin/SaudiConnectorConsole.tsx` · interface `packages/contracts/src/ports.ts` (`SaudiConnector`) · `packages/connector-mock` (default) / `packages/connector-saudi` (gated, `CONNECTOR=saudi`) · live `@auj/contracts` suite via `src/admin/contract-runner.ts`
- **Travel Suppliers** → route `/admin/suppliers` (ADMIN) · `apps/web/src/admin/SuppliersConsole.tsx` · `TravelSupplier` interface + `@auj/connector-travel`; live search→book→cancel + contract suite
- **Nusuk Services** → route `/admin/nusuk` (ADMIN) · `apps/web/src/admin/NusukConsole.tsx` · reads ziyarah/catering/Rawdah via `SaudiConnector` (`searchAddonsAction`); package modes, Rawdah slot, add-ons, gift Umrah, e-services
- **Service Providers** → route `/admin/providers` (ADMIN) · `apps/web/src/admin/ProvidersConsole.tsx` · registry `src/admin/providers.ts` (status DERIVED from env key NAMES) + health log `src/admin/health-store.ts` + `connector-actions.ts` (test connection)

## Design
Cinematic `ScreenFrame`; `@auj/ui` tokens; status pills, capability lists, contract-test runner,
domain-mapping panels; design-taste motion ≤300ms, focus rings, 44px targets.

## Data & backend
All Saudi/GDS access flows through `SaudiConnector` / `TravelSupplier` interfaces (mock by default,
drop-in real adapter). Provider status is derived from env presence — real secrets live in a vault,
never DB/UI. Health checks persist in `provider_health`. No localStorage.

## Acceptance criteria
- [ ] Each `/admin/{connector,suppliers,nusuk,providers}` renders via its interface (mock by default).
- [ ] Contract suites run live against the active adapter; provider status reflects env; ADMIN-gated.
- [ ] No product module imports a concrete connector; ScreenFrame + tokens.

## Status
Live and matching the prototypes. `/admin/nusuk` add-ons/Rawdah/gift are interactive; the others are
ops/parity views over the seam.
