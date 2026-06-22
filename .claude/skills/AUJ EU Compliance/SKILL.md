---
name: auj-eu-compliance
description: "Build the AUJ admin EU-compliance console for the Lithuanian tour-operator entity — the operational surface over the @auj/compliance domain logic. It shows the consumer insolvency/security certificate issued on every package booking (with delivery proof + PDF), the mandated pre-contractual information + recorded consent, the revised Package Travel Directive 6-month refund window, and GDPR duties (Art. 30 processing records, consent log, subject-access export, right-to-erasure). ADMIN-only screen at /admin/compliance backed by Postgres (in-memory fallback). It encodes obligations as product features — it is NOT legal advice and does not file the VVTAT certificate or buy the guarantee."
---

# AUJ EU Compliance — admin compliance console

## What it is
The ADMIN operations surface for the Lithuanian operator's EU duties. It surfaces the regulated
records the platform must keep: the **consumer security / insolvency-protection certificate** issued and
delivered on every package booking, the **pre-contractual information** shown before payment with
**timestamped consent**, the **revised PTD refund window** (6 months max), and **GDPR** handling (Art. 30
register, consent log, export-my-data, delete-my-data). It is the operational console over the pure
`@auj/compliance` logic (tiers, certificate rendering, `refundDueBy`) — not the customer-facing
certificate delivery itself.

## Source prototype
`migration/Files/AUJ EU Compliance.dc.html` (this folder's `.dc.html`). Cinematic green header with
guarantee-tier segmented control (€20k / €50k / €200k), a security-certificate card with Download PDF /
Resend, a pre-contract checklist + 6-month refund-window stat, a GDPR 4-tile grid, and an amber
"not legal advice" disclaimer.

## Route & files
- Route: `/admin/compliance` — `apps/web/app/admin/compliance/page.tsx` (server; `requireRole(['ADMIN'])`,
  wrapped in `SitePage`).
- Component: `apps/web/src/admin/ComplianceConsole.tsx` (client).
- Server actions: `apps/web/src/admin/compliance-actions.ts` (`listComplianceAction`, GDPR request/complete).
- Store: `apps/web/src/admin/compliance-store.ts` (+ `compliance-store.test.ts`); PDF via
  `apps/web/src/admin/pdf.ts` → object store.
- Domain: `@auj/compliance` (`GUARANTEE_TIERS`, `renderCertificate`, `refundDueBy`, `uuidv7`).

## Design
Cinematic `ScreenFrame` (radial green header + sand body) using `@auj/ui` tokens — `green-800/950`,
`gold`, `sand-*`, `StatusPill`, `SegmentedControl` for the tier picker; IBM Plex Serif headings, mono for
refs/amounts/timestamps. Status chips (DELIVERED, EU data residency). Motion ≤300ms transform/opacity,
origin-aware; respects `prefers-reduced-motion`; 44px targets; AA contrast. Apply the design-taste checklist.

## Data & backend
- Postgres when `DATABASE_URL` is set, in-memory fallback otherwise — **no localStorage**. Tables:
  `security_certificates`, `precontract_consents`, `refund_windows`, `gdpr_requests` (migration 14).
- `onPackageBooking` atomically records consent (before charge), issues + delivers the certificate
  (rendered text + PDF key in the DocumentStore), and opens the 6-month refund window.
- Money in **integer minor units** (`coverageMinor`); coverage from `GUARANTEE_TIERS`.
- GDPR export returns the customer's certificates/consents; delete erases PII (`customerName`/proof →
  `[erased]`, consents removed). Real credentials/guarantee filing are out of scope (vault / VVTAT).

## Acceptance criteria
- [ ] `/admin/compliance` is ADMIN-gated (`requireRole(['ADMIN'])`); other roles bounce to login/next.
- [ ] Certificate card shows tier, booking ref, insurer, coverage; Download PDF + Resend wired to the
      stored record (delivery proof shown).
- [ ] Pre-contract checklist + recorded consent timestamp; refund window shows 6-month due date from
      `refundDueBy`.
- [ ] GDPR: export produces JSON for the customer; delete erases PII; requests logged with status.
- [ ] Disclaimer present ("encodes obligations, not legal advice"); typecheck/lint/unit green.

## Status
Live page exists at `/admin/compliance` with `ComplianceConsole` + Postgres store. **Matches** the
prototype; confirm the console renders all four prototype blocks (certificate, pre-contract, refund,
GDPR) and the tier picker before declaring done.
