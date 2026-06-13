---
name: nusuk-umrah-services
description: "Feature parity with the official Nusuk / Nusuk Masar platform (umrah.nusuk.sa), mapped onto AUJ's hybrid architecture. Use when building pilgrimage product features so we match what a Nusuk-approved partner/external agent can sell: packages (visa-included/optional/custom), Rawdah permit, ziyarah, meals, gift Umrah, personalization, e-services. These are NEW features layered on the existing booking/connector seam."
---

# Nusuk / Masar feature parity (AUJ as approved partner)

AUJ is (will be) a **Nusuk-approved external agent**: contracted to a Saudi-licensed Umrah company,
reaching Maqam GDS / Nusuk Masar through `connector-saudi` (gated). This skill lists the Nusuk
pilgrim-facing features we must reach parity on, and where each lands in our **hybrid** stack
(BUILD the product; INTEGRATE the regulated pipe behind `SaudiConnector`). Build behind the mock
first; the real data arrives via `connector-saudi`.

## Source
Analysed from `umrah.nusuk.sa`. Nusuk = the Ministry of Hajj & Umrah's official platform; **Nusuk
Masar** = its B2B/external-agent surface. All supply flows from licensed/approved service providers.

## Features to reach parity (and where they live)
1. **Umrah packages — three modes** (extend `core-booking` package-builder + `b2c`):
   - *Comprehensive* (visa included), *visa-optional* (pilgrim has/holds a visa), *custom* (build your own).
   - Surface the mode at search; the visa step is conditional on mode + `visa-router`.
2. **Visa issuance** — already modelled: `visa-router` decides route; `SaudiConnector.createVisaApplication`
   issues. Add the "visa included vs bring-your-own" toggle to the package + checkout.
3. **Hotels near the Haram** — `HotelOffer.distanceToHaramM` + `nusukApproved` already exist; add a
   "distance to Haram" filter/sort in `b2c` results.
4. **Rawdah (Riyadh ul-Jannah) permit** — NEW: a time-slotted permit booking in Madinah. Add
   `RawdahPermit { pilgrimId, slot, status }` to `contracts`; `SaudiConnector.bookRawdah(slot, pilgrims)`;
   surface as a step/add-on in the package builder + a card in the traveller portal.
5. **Ziyarah / heritage visits** — already a `GroundOffer`; add curated ziyarah bundles (Makkah/Madinah/
   Iraq) selectable in the builder.
6. **Transport** — intercity (Makkah↔Madinah) + ground (Naqaba) already in `SaudiConnector.searchTransport`.
7. **Meals / catering** — NEW add-on line item (`ItemKind` += 'CATERING' or a package option).
8. **Flights** — `TravelSupplier.searchFlights` (connector-travel). Bundle into the one cart.
9. **Gift Umrah** — NEW: book/pay a package on behalf of another person (recipient details, gift voucher).
10. **Personalization & special requests** — free-text/structured requests routed to the approved provider.
11. **Account & e-services** — login/profile (needs the auth gap), my-bookings, documents, support tickets,
    newsletter. Maps to `web-b2c` "My booking" + a support/ticket feature (NEW).
12. **Service-provider directory** — only licensed/approved providers; managed in **admin** (see the
    `partner-service-providers` skill).

## Architecture (hybrid — unchanged)
- Product modules import the `SaudiConnector` / `TravelSupplier` **interfaces** only; new methods
  (`bookRawdah`, package-mode) go on those interfaces in `contracts`, are implemented in
  `connector-mock` first, then `connector-saudi` for real Nusuk Masar.
- New domain types (`RawdahPermit`, package mode, catering, gift) go in `packages/contracts` with Zod.
- BRNs verbatim; EUR-charged / PKR-indicative; visa-route per pilgrim — all enforced as today.

## Acceptance (per feature)
- Each new feature works end-to-end against `connector-mock` and is a drop-in for `connector-saudi`.
- Nothing blocks on real Nusuk access; the mock simulates Rawdah slots, package modes, ziyarah, meals.

## Out of scope
Real Ministry certification/licensing (operator guide); the actual Maqam payloads (assumption A1).
