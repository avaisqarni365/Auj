---
name: b2c-website
description: "Use this skill to build the public customer website where pilgrims and general travellers search, build packages, and pay. Consumes the booking and payments APIs only. Multilingual (EN/LT/UR/AR), mobile-first. Build in parallel wave B against the mock-backed API."
---

# B2C website (public)

## Scope
In `apps/web-b2c`: the customer-facing site. Search → package → checkout → manage booking.
Talks ONLY to the booking + payments + visa-router APIs. No connector imports.

## Depends on
`booking-crm-documents` API, `payments-wallet` API, `visa-router` (for showing the right visa path).

## Build steps
1. Search UX for pilgrimage packages and general hotels/flights; show net+display price (markup applied server-side).
2. Package builder UI: hotel + transport + ground + flight into one cart.
3. At checkout, show the pilgrim their visa route (e-visa vs agent channel) from visa-router, and
   collect required documents accordingly.
4. Payment with EUR/PKR via the payments API; show the Nusuk-approved-hotel requirement for visa flows.
5. "My booking" area: status, BRNs, documents, visa status.
6. i18n: English, Lithuanian, Urdu, Arabic (RTL-aware). Mobile-first, SEO-friendly package pages.

## Acceptance criteria
- A user can complete search → package → pay → see BRNs + visa status, end-to-end on the mock.
- Language switch works incl. RTL Arabic; Lighthouse mobile passes.

## Out of scope
Agent/sub-agent features (B2B app), back-office, real connectors.
