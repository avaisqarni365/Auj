---
name: saudi-connector-interface
description: "Use this skill to define the SaudiConnector contract — the single seam between the product and the regulated Saudi systems (Maqam GDS / Nusuk Masar). Build this BEFORE any consuming module. It contains only types and interfaces, no implementation. Everything else depends on it."
---

# Saudi connector interface (the seam — build first)

## Scope
Define, in `packages/contracts`, the `SaudiConnector` interface plus all shared domain types.
NO network code, NO vendor specifics. This is the contract both the mock and the real adapter
implement, and the only Saudi-facing surface product modules are allowed to import.

## Provides
`SaudiConnector` interface + domain types. Consumed by: booking, visa-router, b2c, b2b, mock, real adapter.

## Domain types (reference)
```ts
export type Currency = 'EUR' | 'PKR' | 'SAR';
export interface Money { amount: number; currency: Currency } // minor units

export interface Pilgrim {
  id: string; firstName: string; lastName: string;
  passportNumber: string; nationality: string;     // ISO-3166
  residenceCountry?: string; residencePermit?: boolean;
  dob: string; gender: 'M' | 'F'; mahramPilgrimId?: string;
}

export interface SearchCriteria {
  city: 'MAKKAH' | 'MADINAH' | 'JEDDAH';
  checkIn: string; checkOut: string; pax: number; starRating?: 1|2|3|4|5;
}
export interface HotelOffer { id: string; name: string; city: string; starRating: number;
  distanceToHaramM?: number; nightlyNet: Money; nusukApproved: boolean }
export interface TransportOffer { id: string; route: string; vehicle: string; net: Money }
export interface GroundOffer { id: string; name: string; net: Money }

export interface HoldRef { holdId: string; expiresAt: string }
export interface BookingResult { bookingRef: string; brns: string[]; status: 'CONFIRMED'|'PENDING'|'FAILED' }

export type VisaRoute = 'EVISA_DIRECT' | 'AGENT_CHANNEL';
export interface VisaApplication { visaRef: string; route: VisaRoute; status: VisaStatus }
export type VisaStatus = 'DRAFT'|'SUBMITTED'|'PAID'|'ISSUED'|'REJECTED';
```

## The interface
```ts
export interface SaudiConnector {
  searchHotels(c: SearchCriteria): Promise<HotelOffer[]>;
  searchTransport(c: SearchCriteria): Promise<TransportOffer[]>;
  searchGroundServices(c: SearchCriteria): Promise<GroundOffer[]>;
  hold(offerIds: string[], pilgrims: Pilgrim[]): Promise<HoldRef>;
  confirm(holdId: string, payment: { ref: string }): Promise<BookingResult>; // returns BRNs
  createVisaApplication(bookingRef: string, pilgrims: Pilgrim[]): Promise<VisaApplication>;
  getVisaStatus(visaRef: string): Promise<VisaStatus>;
  cancel(bookingRef: string): Promise<{ cancelled: boolean; refund?: Money }>;
}
```

## Build steps
1. Create `packages/contracts` with the types above, exported.
2. Add Zod schemas mirroring each type for runtime validation at adapter boundaries.
3. Write a `contract-tests` suite (interface-level expectations) that ANY implementation must pass.
4. Version the contract (semver); breaking changes require a major bump.

## Acceptance criteria
- `pnpm build` produces typed exports; Zod schemas parse valid/invalid fixtures correctly.
- The contract-tests suite exists and is importable by both mock and real adapter.

## Out of scope
Any vendor/Maqam payload shapes (they live in `connector-saudi`, mapped INTO these types).
