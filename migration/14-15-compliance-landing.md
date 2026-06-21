# 14 · EU Compliance   ·   15 · Landing (last)

## 14 · EU Compliance
**Prototype:** `AUJ EU Compliance.dc.html`
**Target:** `packages/compliance` (logic — exists) + `apps/web/app/admin/compliance/page.tsx`
**Wave:** C

### What it is
Lithuanian operator duties: guarantee tier config (€20k/50k/200k), consumer **security certificate**
(PDF) per package booking, pre-contractual info + consent, PTD **6-month** refund window, GDPR
(records, consent log, export/delete, EU residency).

### DB integration (see 00b-db-conventions.md)
- `security_certificates (id, booking_id, tier_minor, insurer, policy_ref, pdf_key→DocumentStore, delivered_at)`.
- `precontract_consents (id, booking_id, shown JSONB, consented_at, ip)`.
- `gdpr_requests (id, customer_id, kind 'export'|'delete', status, requested_at, completed_at)`.
- `refund_windows (booking_id, opened_at, due_at)` (due = opened + 6 months) feeding the refund workflow.
- Certificate PDF generated on every package booking; **proof of delivery stored**; `activity_logs` on issue/refund.
- Guarantee tier is config affecting certificate text.

### Command
```
Implement EU Compliance from "AUJ EU Compliance.dc.html": packages/compliance logic + app/admin/compliance.
DB: security_certificates, precontract_consents, gdpr_requests, refund_windows (SCHEMA_SQL, adapters,
  repo tests). On every package booking: generate+deliver insolvency certificate PDF (DocumentStore),
  store proof; record pre-contract consent before any charge; enforce 6-month PTD refund window;
  GDPR export/delete actions. Guarantee tier (20k/50k/200k) = config in certificate text. activity_logs.
packages/ui + tokens.css. Pass: typecheck, lint, unit, e2e-mock. Summarize; update sessions/.
```

### Acceptance
- [ ] Every package booking stores+delivers a certificate; consent recorded before charge.
- [ ] GDPR export/delete works; refund window = 6 months; tier drives certificate.

---

## 15 · Landing (do last — links to everything)
**Prototype:** `AUJ Landing Cinematic.dc.html`
**Target:** `apps/web/app/(marketing)/page.tsx` + `apps/web/src/Landing.tsx` (exists) + `landing-data.ts`
**Wave:** C

### What it is
Public marketing page: hero + sectioned frames (each links to a migrated tool), trust marquee, FAQ,
"one price" → Financial Planner. Fully fluid 360px→desktop; RTL.

### DB integration (see 00b-db-conventions.md)
- Landing copy/frames are **CMS content** → `landing_content` (already `admin-content.ts` pattern) editable in Admin.
- Lead capture (search/CTA) → `leads (id, name, contact, intent, locale, created_at)` via `LeadRepository`
  (note: `src/leads/` already exists — extend it).
- No pilgrim PII beyond the lead; GDPR consent checkbox on submit.

### Command
```
Finalize the Landing at app/(marketing) from "AUJ Landing Cinematic.dc.html", extending src/Landing.tsx.
DB: landing_content via existing admin-content CMS pattern; lead capture → leads table (extend src/leads;
  SCHEMA_SQL, adapters, repo test) with GDPR consent. Frames link to the real migrated routes.
Fully fluid 360px→desktop, no horizontal scroll, RTL for AR/UR; gold only for logo/highlights.
packages/ui + tokens.css. Pass: typecheck, lint, unit, e2e-mock. Summarize; update sessions/.
```

### Acceptance
- [ ] All frame CTAs hit real routes; copy from CMS; leads persist w/ consent.
- [ ] Fluid + RTL verified; gold not used as body text (AA).
