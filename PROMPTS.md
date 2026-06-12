# Prompts — kickoff & design

These prompts are pre-filled for **AUJ**. They assume the repo contains
`CLAUDE.md`, `ARCHITECTURE.md`, and the `*/SKILL.md` files from this package.

---

## 1. Master kickoff prompt (paste into Claude Code at the repo root)

```
You are building AUJ, a hybrid Umrah/Hajj and general-travel platform. The repo contains
CLAUDE.md, ARCHITECTURE.md, and one SKILL.md per module. Read CLAUDE.md and ARCHITECTURE.md
fully before doing anything.

Your job: build the application wave by wave exactly as CLAUDE.md specifies, treating each
module's SKILL.md as its spec and its "Acceptance criteria" as the definition of done.

Non-negotiable rules:
- Product modules reach external supply ONLY through the interfaces in packages/contracts,
  satisfied by packages/connector-mock in dev/test. Never import a concrete integration
  (Maqam/partner/bedbank/GDS) into a product module.
- TypeScript strict; Zod at every boundary; UUID v7; Money as { amount: minorUnits, currency };
  ISO-8601 UTC; never floats for money.
- Every module passes its own tests AND the shared contract-tests and runs against
  connector-mock offline before it is "done".
- Connector chosen by env: CONNECTOR=mock|saudi, SUPPLIER=mock|live.

Process:
1. First output a short BUILD PLAN: the waves, the packages/apps you will create, the order,
   each step citing the relevant skill. Wait for nothing — then proceed.
2. Wave 0 (sequential): run 00-getting-started to scaffold the monorepo, then build
   packages/contracts (saudi-connector-interface), then packages/connector-mock
   (saudi-connector-mock). Run: pnpm install && pnpm build && pnpm lint && pnpm test. Report.
3. Wave A: booking-crm-documents, payments-wallet, visa-router, general-travel-connectors —
   each against the mock. Run the quality gate after each.
4. Wave B: web-b2c, web-b2b against the Wave A APIs.
5. Wave C only when I confirm partner access: certified-saudi-connector. compliance-eu may
   proceed anytime; finalize before launch. Never block Wave A/B on Wave C.

Prioritize the GENERAL-TRAVEL slice (connector-travel + core-booking + payments + web-b2c) as the
first launchable milestone — it has zero Saudi dependency.

After each module: commit on its own branch, summarize what was built, what the tests prove, and
what is next. Pause and ask before any step needing real credentials or spending money.
Begin with the BUILD PLAN.
```

---

## 2. Contracts-first prompt (get working code, not just a spec)

```
Generate packages/contracts as ready-to-commit TypeScript: the SaudiConnector and TravelSupplier
interfaces, all domain types (Money, Pilgrim, SearchCriteria, HotelOffer, TransportOffer,
GroundOffer, FlightOffer, HoldRef, BookingResult, VisaApplication, VisaStatus), matching Zod
schemas for each, and a contract-tests suite that any implementation (mock or real) must pass.
Use the EXACT shapes in saudi-connector-interface/SKILL.md and general-travel-connectors/SKILL.md.
Strict TS, fully exported, semver-versioned. Then write packages/connector-mock implementing the
interfaces in-memory so the contract-tests pass offline.
```

---

## 3. Per-module prompt template

```
Build the [MODULE] module. Load [dir]/SKILL.md as the spec and follow CLAUDE.md conventions and
the golden rule. Implement against packages/contracts using connector-mock; import no real
integration. Write tests first. The module is done ONLY when its Acceptance criteria are met and
it passes the shared contract-tests offline. Output a short plan, implement, run
pnpm lint && pnpm build && pnpm test, then summarize what was built and what the tests prove.
```

---

## 4. Wave orchestration prompts

```
WAVE A: Build booking-crm-documents, payments-wallet, visa-router, and general-travel-connectors,
each against connector-mock, each finished to its SKILL.md Acceptance criteria with the quality
gate green. If single-threaded, do them in that order; keep each on its own branch.
```
```
WAVE B: Build web-b2c then web-b2b against the Wave A APIs. No connector imports — apps call the
booking/payments/visa-router APIs only. Multilingual EN/LT/UR/AR, mobile-first, dark-mode aware.
```

---

## 5. UI / design prompt (paste into Claude Design, or to generate the front-end look)

```
Design the UI for AUJ, a pilgrimage + travel platform serving EU travellers and the
EU-resident Pakistani diaspora. Two surfaces: a public B2C booking site and a B2B agent portal.

Aesthetic: trustworthy, calm, premium-but-accessible, respectful of the religious context.
Clean typography, generous whitespace, a restrained palette (deep green + warm neutral + one
accent), no clutter. Fully multilingual EN / LT / UR / AR with proper RTL for Arabic and Urdu.
Mobile-first, WCAG AA contrast, dark-mode aware.

Deliver a cohesive design system first: color tokens, type scale, spacing, and components
(buttons, inputs, selects, cards, data tables, status pills, modals). Then high-fidelity mockups
of these screens:

B2C: home with search; results; package builder (hotel + transport + ground + flight into one
cart); pilgrim & document capture showing the visa-route indicator (e-visa vs agent channel);
checkout supporting EUR and PKR; "My booking" with BRNs and live visa status.

B2B: agent login + dashboard; multi-passenger booking (up to 49 pax); wallet & credit limit;
markup configuration; quotation builder; statements/exports.

Keep it consistent with a Tailwind-friendly token set so it maps directly to a Next.js build.
```
