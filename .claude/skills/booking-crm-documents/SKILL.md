---
name: booking-crm-documents
description: "Use this skill to build the core domain: bookings, packages, the pilgrim/customer CRM, and document handling (passport, photo, vouchers). It orchestrates the connectors via their interfaces and the visa-router. The heart of the platform. Build in parallel wave A against the mock."
---

# Booking, CRM & documents (core domain)

## Scope
In `packages/core-booking`: package building, the booking lifecycle, customer/pilgrim CRM, and
document management. Orchestrates `SaudiConnector` + `TravelSupplier` + `visa-router` via interfaces.
Never imports a concrete connector — receives one by dependency injection.

## Depends on
`saudi-connector-interface`, `general-travel-connectors` (TravelSupplier), `visa-router`.
Uses the mock connector in dev/test.

## Data model (Prisma-style entities)
- Customer, Pilgrim (links to Customer, mahram links), Package (composed items),
  Booking (status machine), BookingItem (hotel|transport|ground|flight, holds BRN),
  Document (type, file ref, verified flag), VisaCase (route, status, BRN links).

## Booking lifecycle
`DRAFT → HELD → CONFIRMED → TICKETED/VISA_IN_PROGRESS → COMPLETED` (+ CANCELLED, REFUNDED).
On confirm, persist BRNs returned by the connector; on visa flow, call visa-router then connector.

## Build steps
1. Define entities + migrations. Implement a package-builder (compose offers into a sellable package).
2. Implement booking services that call connectors via injected interfaces.
3. Wire visa-router into the booking flow; create a VisaCase per booking when required.
4. Document service: upload, store (S3-compatible), validate, attach to pilgrim; optional OCR hook.
5. Expose a typed API (tRPC/OpenAPI) for the apps.
6. Tests run against `connector-mock` end-to-end.

## Acceptance criteria
- Full lifecycle works offline against mocks, including BRN capture and visa-case creation.
- Swapping in real connectors needs no change here.

## Out of scope
Money capture (payments module), UI, markups (B2B).
