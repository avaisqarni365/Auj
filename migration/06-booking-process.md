# 06 · Booking Process

**Prototype:** `AUJ Booking Process.dc.html`
**Target:** `apps/web/app/book/` + `apps/web/src/book/` (uses `core-booking`, `visa-router`, `payments`)
**Wave:** B

## What it is
10-step confirmed flow after package selection: Pilgrims & passports → Insurance → Visa route →
Flights & airport → Luggage → Pre-departure planning → Intention → Hotel in Makkah → Transfers →
Confirm (summary → adviser). Each choice persisted; final summary.

## Port map
- Each step's selection → a draft `Booking` (core-booking `booking-service.ts` + `state-machine.ts`).
- Visa step → `visa-router.routeFor` per pilgrim (mixed groups per-pilgrim).
- Hotel options → `SaudiConnector.searchHotels` (mock); confirm → `hold`→`confirm` returns **BRN verbatim**.
- localStorage `auj-booking` → draft cache; DB is source of truth.

## DB integration (see 00b-db-conventions.md)
- Reuse `bookings` + `booking_travellers`. Add:
  `booking_drafts (id, customer_id, step, choices JSONB, names JSONB, updated_at)` for resumable progress.
  `booking_selections (booking_id, kind, option_id, label, price_minor, currency)` once confirmed.
- Server Actions per step (`saveStep`) Zod-validate → upsert draft; `confirmBooking` → core-booking
  `hold`+`confirm` (mock), write `bookings` (status from state-machine), BRNs verbatim, `activity_logs`.
- Money minor units; visa route stored per traveller.

## Command
```
Implement the Booking Process from "AUJ Booking Process.dc.html" at app/book.
DB: booking_drafts (resumable step+choices) and on confirm write bookings + booking_travellers +
  booking_selections (SCHEMA_SQL, adapters, repo tests). Money minor units; BRNs verbatim.
Flow: 10 steps; per step saveStep action (Zod). Visa step uses visa-router.routeFor per pilgrim
  (mixed EU/PK group → per-pilgrim). Hotels via SaudiConnector.searchHotels (mock); confirm via
  core-booking hold+confirm; status from state-machine; activity_logs on confirm.
UI: stepper + option cards + passport textarea + summary, packages/ui + tokens.css, EUR/PKR money.
Pass: typecheck, lint, unit, contract-tests, e2e-mock. Summarize; update sessions/.
```

## Acceptance
- [ ] Draft resumes from DB; confirm writes booking + BRNs (verbatim) via mock.
- [ ] Per-pilgrim visa route correct for mixed group; money in minor units.
