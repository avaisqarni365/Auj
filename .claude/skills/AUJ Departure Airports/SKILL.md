---
name: AUJ Departure Airports
description: "The dynamic per-airport 'Departing from your city' hub — for each European airport: walkthrough + helper media, easy check-in, and live-if-API flights to/from Makkah & Madinah (airline + route per city), fully linked to booking."
---

# AUJ Departure Airports

## What it is
A fully dynamic hub per European departure airport. From the "Departing from your city" directory
(Baltics / Central / Western Europe) a pilgrim opens **`/from/<IATA>`** and sees, for THAT airport (Europe **and Pakistan**):
an airport walkthrough + helper media, **easy check-in** steps, **flights to Makkah (JED) and Madinah
(MED)** with the airlines/route/frequency per city, **return flights** (coming home), and a hand-off
to booking. Free, no-login, mobile-first.

## Source / origin
The landing's "Departing from your city" section (grouped airport list) — now each city links to its
hub instead of a static anchor. Routes/airlines are realistic per city; flight availability is live
when a GDS is configured (see below).

## Where the logic lives
- **Index route:** `apps/web/app/from/page.tsx` — region-grouped airport directory → `/from/<code>`
- **Hub route:** `apps/web/app/from/[code]/page.tsx` (`generateStaticParams` over DEPART_CODES; `notFound()` otherwise) → `DepartureHub`
- **Component:** `apps/web/src/depart/DepartureHub.tsx` (client) — hero, walkthrough/media, check-in steps (+ link to the full Airport wizard `/guide/airport`), Makkah/Madinah flight tabs, return flights, airline/route cards, CTA → `/book?from=<code>`
- **Per-airport content:** `apps/web/src/depart/airport-content.ts` — `DEPART_AIRPORTS` (18: Baltics VNO/RIX/TLL/KUN · Central WAW/BER/VIE/PRG · Western DUB/AMS/BRU/CDG · Pakistan KHI/LHE/ISB/PEW/MUX/SKT — Pakistan routes are mostly **direct** to JED/MED on PIA/Saudia/flynas/Airblue/AirSial); each has region, blurb, `checkInSteps`, `toMakkah`/`toMadinah` routes (airlines · via · frequency · duration), `arrivalsNote`, optional `media[]` (`DepartMedia`: video/image × upload/link). Pure helpers `safeMediaUrl`/`cleanMedia` sanitize admin media (reject javascript:/data:).
- **Flights (live-if-API):** `apps/web/src/depart/departure-flights-actions.ts` → `getDepartureFlightsAction(from, hub, date)` calls **`selectTravelSupplier().searchFlights`** through the connector seam — real Amadeus/Sabre when `SUPPLIER=live`, the mock otherwise (offers tagged "Live availability" vs "Sample schedule")
- **Landing link-up:** `apps/web/src/Landing.tsx` departures section maps each `DEPARTURES_GRID` city → `/from/<code>` via `DEPART_AIRPORTS`
- **Admin CRUD (DB-backed):** `apps/web/src/depart/airport-store.ts` (Postgres `depart_airports` jsonb-per-code + in-memory fallback, seeded from `DEPART_AIRPORTS`), `apps/web/src/depart/airport-admin-actions.ts` (ADMIN-gated list/save/delete + `uploadAirportMediaAction`), UI `apps/web/src/admin/AirportsAdmin.tsx`, route `apps/web/app/admin/airports/page.tsx`. The public `/from` pages read from `getAirportStore()` (no longer the hardcoded array directly). Editable: code/city/country/region/blurb/check-in steps/routes/arrivals + **walkthrough media** (English — the public hub is English-only).
- **Walkthrough media:** admins add per-airport videos/photos two ways — **upload** (→ `uploadAirportMediaAction` stores under `depart/<code>/…` in the object store, served PUBLICLY by `apps/web/app/api/airport-media/[...key]/route.ts`, guarded to the `depart/` prefix) or **link** an external airport-website URL. `DepartureHub` renders a media gallery when present (inline `<video>` for uploads, play-card link for site videos, `<img>` for photos), else falls back to the Airport-guide walkthrough tile.

## Live data
Flights flow through the **TravelSupplier interface only** (golden rule — never import a concrete
connector). Set `SUPPLIER=live` (+ GDS creds) to switch from the deterministic mock to real
Amadeus/Sabre availability; no product-code change. EUR is the charged currency.

## Design
Cinematic `ScreenFrame`; `@auj/ui` tokens (green/sand/accent/gold), mono numerals for codes/times;
Makkah/Madinah tabs, route cards with frequency pills, a green walkthrough media tile; design-taste
motion ≤300ms, focus rings, 44px targets; RTL-safe.

## Acceptance criteria
- [ ] `/from` lists all 18 airports by region (incl. Pakistan); each links to `/from/<code>`.
- [ ] `/from/<code>` shows blurb + walkthrough/media + 5 check-in steps + Makkah/Madinah routes (airlines/via/frequency) + return note + booking CTA.
- [ ] "Show flights" calls the supplier seam and lists offers (carrier · times · EUR), tagged live vs sample; graceful empty state.
- [ ] Unknown code → 404; ScreenFrame + tokens; no localStorage; flights via the interface only.

## Status
Live. Airport content is curated reference (airlines/frequency); real-time schedules activate with
`SUPPLIER=live`. Admins can now attach **bespoke per-airport walkthrough media** (upload a clip/photo
or link the airport's own website video) at `/admin/airports`; the hub falls back to the Airport-guide
walkthrough tile when an airport has no media yet. Content invariants are covered by tests.

## Out of scope
Actual ticketing/seat selection (that's booking + the GDS), live gate/delay status, loyalty miles.
