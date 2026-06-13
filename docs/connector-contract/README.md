# AUJ Connector Contract — v1.2.0

> Generated from `@auj/contracts` (Zod schemas). **Do not hand-edit** — run `pnpm gen:spec`.
> Machine-readable: [`openapi.json`](./openapi.json).

This is the **single seam** between AUJ's product modules and external supply. Everything *above* the
seam (web, B2B portal, CRM, payments) is built and owned by AUJ; everything *below* it is swappable.
Product code depends only on these two interfaces — never a concrete connector — so a partner/ERP can
be plugged in to go live, then replaced by AUJ's own certification with **zero change above the seam**.

- **`SaudiConnector`** — the regulated pilgrimage pipe (Maqam GDS / Nusuk Masar). **Gated.** Default
  implementation is the in-memory mock; the certified implementation is selected with `CONNECTOR=saudi`.
- **`TravelSupplier`** — general-travel supply (bedbank + flight GDS). **No Saudi dependency** — this leg
  ships first. Real bedbank/GDS selected with `SUPPLIER=live`.

Operations are transport-agnostic: a provider may expose them over HTTP/gRPC/in-process. Money is
`{ amount: integer minor units, currency }`; BRNs (Booking Reference Numbers) are returned verbatim by
`confirm` / `book` and are required for visa processing.

## SaudiConnector (gated pilgrimage pipe)

| Method | Purpose | Request | Response |
|---|---|---|---|
| `searchHotels` | Search Nusuk-approved hotels | `SearchCriteria` | `HotelOffer[]` |
| `searchTransport` | Search intercity / ground transport | `SearchCriteria` | `TransportOffer[]` |
| `searchGroundServices` | Search ground services | `SearchCriteria` | `GroundOffer[]` |
| `searchZiyarah` | Curated ziyarah (heritage) bundles | `SearchCriteria` | `GroundOffer[]` |
| `searchCatering` | Meal / catering plans | `SearchCriteria` | `CateringOffer[]` |
| `hold` | Place a hold on offers for a group | `{ offerIds: string[], pilgrims: Pilgrim[] }` | `HoldRef` |
| `confirm` | Confirm a hold against payment; returns BRNs | `{ holdId, payment:{ ref } }` | `BookingResult (BRNs)` |
| `createVisaApplication` | Open a visa application for a booking | `{ bookingRef, pilgrims: Pilgrim[] }` | `VisaApplication` |
| `getVisaStatus` | Poll a visa application status | `{ visaRef }` | `{ status: VisaStatus }` |
| `searchRawdahSlots` | Rawdah (Riyadh ul-Jannah) permit slots for a date | `{ date }` | `RawdahSlot[]` |
| `bookRawdah` | Book a Rawdah permit for pilgrims | `{ slotId, pilgrims: Pilgrim[] }` | `RawdahPermit` |
| `cancel` | Cancel a booking and report any refund | `{ bookingRef }` | `Cancellation` |

## TravelSupplier (open general-travel APIs)

| Method | Purpose | Request | Response |
|---|---|---|---|
| `searchHotels` | Search general-travel hotels (bedbank) | `SearchCriteria & { country }` | `HotelOffer[]` |
| `searchFlights` | Search flights (GDS) | `{ from, to, date, pax }` | `FlightOffer[]` |
| `book` | Book offers for travellers; returns BRNs | `{ offerIds: string[], travellers: Pilgrim[] }` | `BookingResult` |
| `cancel` | Cancel a booking and report any refund | `{ bookingRef }` | `Cancellation` |

## Swapping implementations

| Env | Values | Effect |
|---|---|---|
| `CONNECTOR` | `mock` (default) · `saudi` | Selects the `SaudiConnector`: in-memory mock vs the certified Maqam/Nusuk adapter. |
| `SUPPLIER` | `mock` (default) · `live` | Selects the `TravelSupplier`: mock vs real bedbank/GDS. |

Both are read in `apps/web/src/connectors.ts`. Any new implementation must pass the shared
**contract-tests** in `@auj/contracts` before it can be wired in.

## Data shapes

Full JSON Schema for every type (`Pilgrim`, `HotelOffer`, `BookingResult`, `VisaApplication`,
`RawdahPermit`, …) is in [`openapi.json`](./openapi.json) under `components.schemas`.
