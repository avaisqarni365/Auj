---
name: AUJ Departure Airports
description: "The dynamic per-airport 'Departing from your city' hub — for each European airport: walkthrough + helper media, easy check-in, and live-if-API flights to/from Makkah & Madinah (airline + route per city), fully linked to booking."
---

# AUJ Departure Airports

## What it is
A fully dynamic hub per European departure airport. From the "Departing from your city" directory
(Baltics / Central / Western Europe) a pilgrim opens **`/from/<IATA>`** and sees, for THAT airport:
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
- **Per-airport content:** `apps/web/src/depart/airport-content.ts` — `DEPART_AIRPORTS` (12: Baltics VNO/RIX/TLL/KUN · Central WAW/BER/VIE/PRG · Western DUB/AMS/BRU/CDG); each has region, blurb, `checkInSteps`, `toMakkah`/`toMadinah` routes (airlines · via · frequency · duration), `arrivalsNote`
- **Flights (live-if-API):** `apps/web/src/depart/departure-flights-actions.ts` → `getDepartureFlightsAction(from, hub, date)` calls **`selectTravelSupplier().searchFlights`** through the connector seam — real Amadeus/Sabre when `SUPPLIER=live`, the mock otherwise (offers tagged "Live availability" vs "Sample schedule")
- **Landing link-up:** `apps/web/src/Landing.tsx` departures section maps each `DEPARTURES_GRID` city → `/from/<code>` via `DEPART_AIRPORTS`

## Live data
Flights flow through the **TravelSupplier interface only** (golden rule — never import a concrete
connector). Set `SUPPLIER=live` (+ GDS creds) to switch from the deterministic mock to real
Amadeus/Sabre availability; no product-code change. EUR is the charged currency.

## Design
Cinematic `ScreenFrame`; `@auj/ui` tokens (green/sand/accent/gold), mono numerals for codes/times;
Makkah/Madinah tabs, route cards with frequency pills, a green walkthrough media tile; design-taste
motion ≤300ms, focus rings, 44px targets; RTL-safe.

## Acceptance criteria
- [ ] `/from` lists all 12 airports by region; each links to `/from/<code>`.
- [ ] `/from/<code>` shows blurb + walkthrough/media + 5 check-in steps + Makkah/Madinah routes (airlines/via/frequency) + return note + booking CTA.
- [ ] "Show flights" calls the supplier seam and lists offers (carrier · times · EUR), tagged live vs sample; graceful empty state.
- [ ] Unknown code → 404; ScreenFrame + tokens; no localStorage; flights via the interface only.

## Status
Live. Airport content is curated reference (airlines/frequency); real-time schedules activate with
`SUPPLIER=live`. Per-airport walkthrough videos reuse the Airport wizard (`/guide/airport`) until
bespoke clips exist.

## Out of scope
Actual ticketing/seat selection (that's booking + the GDS), live gate/delay status, loyalty miles.
