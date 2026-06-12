---
name: general-travel-connectors
description: "Use this skill to build adapters for the general (non-pilgrimage) travel supply — bedbanks (TBO, Hotelbeds, WebBeds) and flight GDS (Amadeus/Sabre). These use OPEN developer APIs, so this whole revenue stream can be built and launched with zero Saudi dependency. Build in parallel wave A."
---

# General-travel connectors (open APIs — no Saudi gate)

## Scope
Define a `TravelSupplier` interface in `packages/contracts` and implement adapters in
`packages/connector-travel` for at least one bedbank and one flight source. This powers the
Europe/general-travel side, independent of anything Saudi.

## Provides
`TravelSupplier` (hotels + flights), consumed by booking, b2c, b2b.

## Interface (reference)
```ts
export interface TravelSupplier {
  searchHotels(c: SearchCriteria & { country: string }): Promise<HotelOffer[]>;
  searchFlights(c: { from: string; to: string; date: string; pax: number }): Promise<FlightOffer[]>;
  book(offerIds: string[], travellers: Pilgrim[]): Promise<BookingResult>;
  cancel(bookingRef: string): Promise<{ cancelled: boolean; refund?: Money }>;
}
export interface FlightOffer { id: string; carrier: string; depart: string; arrive: string; net: Money }
```

## Build steps
1. Add `TravelSupplier` to contracts; reuse shared domain types (Money, Pilgrim, BookingResult).
2. Implement a bedbank adapter (e.g. TBO/Hotelbeds): register, map their hotel API → HotelOffer.
3. Implement a flight adapter (Amadeus/Sabre self-service dev program) → FlightOffer.
4. Normalize currencies to our Money; net rates only (markups applied later in B2B layer).
5. Provide a mock supplier too, mirroring connector-mock, so apps can build offline.

## Acceptance criteria
- Search → book → cancel works against each provider's sandbox.
- Same flows pass against the mock supplier offline.

## Out of scope
Markups (B2B layer), payment capture (payments module), Saudi/Maqam supply.
