---
name: saudi-connector-mock
description: "Use this skill to build an in-memory implementation of the SaudiConnector interface. This mock is what unblocks parallel development — every product module builds and tests against it instead of the real, gated Maqam/Nusuk systems. Build immediately after the interface."
---

# Saudi connector mock (unblocks everyone)

## Scope
Implement `SaudiConnector` in `packages/connector-mock` with deterministic, in-memory data.
No network. It must pass the shared contract-tests. This is the default connector in all dev
and test environments.

## Depends on
`saudi-connector-interface`.

## Behaviour
- `searchHotels/Transport/GroundServices`: return a fixed catalog (a few Makkah + Madinah hotels,
  some marked `nusukApproved: true`, some false, with realistic net prices in SAR).
- `hold`: returns a `holdId` valid for 15 minutes (in-memory expiry).
- `confirm`: returns `CONFIRMED` with one synthetic BRN per booked item; fails if hold expired.
- `createVisaApplication`: routes via the visa-router rule (e-visa vs agent channel) and returns DRAFT.
- `getVisaStatus`: advances DRAFT→SUBMITTED→ISSUED on repeated calls (so flows can be demoed).
- `cancel`: returns `cancelled: true` with a mock refund.

## Build steps
1. Create `connector-mock` implementing every method.
2. Seed a small JSON catalog of hotels/transport/ground services.
3. Add toggles via env to simulate edge cases: hold expiry, rejected visa, sold-out hotel.
4. Run the shared contract-tests against it — they must pass.

## Acceptance criteria
- Implements 100% of the interface; contract-tests green.
- A scripted demo (search → hold → confirm → BRN → visa → status=ISSUED) runs end-to-end offline.

## Out of scope
Real Maqam payloads, real pricing, persistence.

## Status
Complete — `MockSaudiConnector` implements 100% of the interface (incl. the Nusuk-parity additions
`searchZiyarah`/`searchCatering`/`searchRawdahSlots`/`bookRawdah`) and passes the shared
`runSaudiConnectorContractTests` (17 tests). Env toggles `AUJ_MOCK_SOLD_OUT` / `AUJ_MOCK_HOLD_EXPIRY` /
`AUJ_MOCK_REJECT_VISA` simulate edge cases. Default connector in all dev/test (`CONNECTOR=mock`).
