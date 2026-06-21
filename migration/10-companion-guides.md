# 10 · Companion guides (Hotels ×2, Food, Transport, Connectivity, Gifts, Laundry, Hospitals, Helpline)

**Prototypes:** `AUJ Makkah/Madina Hotels`, `AUJ Food/Transport/Connectivity/Gifts/Laundry/Hospitals/Helpline Guide.dc.html`
**Target:** `apps/web/app/guide/<slug>/` + `apps/web/src/companion/`
**Wave:** B

## What they are
Reference guides with a city/category rail and listed options. Hotels are **by distance to Haram**;
others are categorised (food, transport with fares, SIM/connectivity, gifts, laundry, hospitals, helpline/SOS).
These are mostly **content** + (hotels/transport) live supplier data.

## Port map
- Build **one reusable `<GuideWizard>`** (rail + city/cat tabs + list) — all guides share it; data differs.
- Static guide content (food, gifts, laundry, hospitals, helpline) → seed/CMS (`admin-content.ts` pattern).
- Hotels → `SaudiConnector.searchHotels` (distanceToHaramM, nusukApproved) sorted by distance.
- Transport/flights → `TravelSupplier` where applicable; otherwise seeded fares.

## DB integration (see 00b-db-conventions.md)
- Content guides → `guide_entries (id, guide, city, category, name, note, tag, sort, locale)` editable in Admin CMS,
  via `GuideRepository` (+ `listByGuide(guide, city)`), seeded from the prototype data.
- Hotels/transport → **not stored**; fetched live via the connector interfaces (cache optional).
- Localised columns or a `locale` key for EN/LT/UR/AR (RTL).

## Command
```
Implement the companion guides from the *Guide.dc.html references at app/guide/<slug> using ONE shared
<GuideWizard> (city/category rail + list).
DB: guide_entries (guide, city, category, name, note, tag, sort, locale) — SCHEMA_SQL, adapters, repo
  test; seed from each prototype's data; editable later via Admin CMS. Hotels via
  SaudiConnector.searchHotels sorted by distanceToHaramM (nusukApproved badge); transport via
  TravelSupplier/seeded fares. Money EUR/PKR. RTL for AR/UR.
packages/ui + tokens.css. Pass: typecheck, lint, unit, contract-tests, e2e-mock. Summarize; update sessions/.
```

## Acceptance
- [ ] One GuideWizard powers all guides; content from DB seed.
- [ ] Hotels sorted by real distance via connector; fares show EUR/PKR; RTL ok.
