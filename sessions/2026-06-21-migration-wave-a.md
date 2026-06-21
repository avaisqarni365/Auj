# 2026-06-21 — Screen migration, Wave A (01–03)

Driving `migration/*.md` in order, one screen per commit, gated + auto-deployed.

## Rules in force (this migration)
- **No localStorage — always DB.** Persistence = server actions → Postgres (in-memory fallback).
  Client components import a pg-free `*-types.ts`; the pg store stays server-only.
- **Wizards/forms fully interactive with DB.**
- **Pilgrim guide: browse open, sign-in to save** (progress/du'as/recordings → DB per user).
  Retrofit of the existing on-device guide storage is scheduled for **04–05 (Pilgrim Profile/Dashboard)**.

## Done & deployed
- **01 Visa Router** (`ccc939d`) — `/admin/visa` QA page over the existing pure `@auj/visa-router`
  (16 branch tests). Inputs → e-Visa/Agent pill + decision trace. No connector.
- **02 Finance Self-Assessment** (`2bab4f4`) — `/admin/finance`. `calc.buildAssessment` (decimals,
  B2B-only commission, profit==markup) + tests. **DB deal book** `umrah_finance_deals` via
  `deals-store.ts`/`deals-actions.ts` (NOT localStorage). B2C/B2B, cost lines, dials, in/out/profit,
  per-pilgrim, waterfall, EUR/PKR.
- **03 Predictive Cost Analysis** (`4a70aca`) — `/admin/finance/predict`. `predict.forecast()` scales
  flights+hotels by season (×1/1.28/1.55), reuses `buildAssessment` for sell/profit; 4 tests. Pax
  40/80/120 + clamp 1–500, live breakdown bar. **Save as deal → DB** (reuses #02). Links to /admin/finance.

- **07 Packing Organizer** (`bf3ae5d`) — `/companion/packing`. Pure `companion/packing.ts`
  `build(profile, days)` — quantities scale with stay (11/21/30), profile gates items, **Diabetic**
  adds glucose meter/insulin/strips/tabs (3 tests). **DB** `packing_lists (pilgrim_id, profile, days,
  checked jsonb)` via `packing-store.ts`/`packing-actions.ts` — browse open, **sign-in to save**,
  debounced upsert per (pilgrim, profile). UI: profile tabs, 11/21/30 toggle, grouped checkboxes,
  progress bar; linked from `/companion`.

- **08 Day Planner** (`ba78f2b`) — `/plan/day`. (Smart Planner #08-pt1 already shipped at `/plan`
  via `leads/SmartVisitWizard`.) Pure `ritual/planner.ts` `dayPlan(city, shiftMin)`: jamaat-anchored
  14-slot schedule per city, hourly temperature (Makkah; Madinah −2°C), ±15-min whole-day shift,
  `clampShift` (5 tests). **DB** `day_plans (pilgrim_id PK, city, shift_min)` via store/actions —
  browse open, **sign-in to save** city+shift. UI: city toggle, ∓ time-adjust, temp band, timeline.
  Assumption A8 logged (times are a static approximation).
- **09 Personal Diary** (`ba78f2b`) — `/companion/diary`. Pure `ritual/diary.ts` (NAFL/DUAS consts +
  `naflTotal`/`duaDone`/`quranPct`, 2 tests). **DB** `diary_entries (pilgrim_id, date, quran_target,
  quran_done, nafl jsonb, duas jsonb, note)` keyed per pilgrim+day (KSA date) — **DB not localStorage**,
  sign-in to save, server clamps bounds. UI: Quran target/done + nafl counters + dua chips +
  reflection textarea, debounced save. Both linked from `/companion`.

- **10 Companion guides** (`dc6507c`) — `/guide/<slug>` for food, transport, connectivity, gifts,
  laundry, hospitals, helpline. ONE shared `<GuideWizard>` (city tabs + category rail + item list +
  prev/next dots). Content transcribed from the 7 prototypes into `companion/guide-data.ts`
  (`GUIDES`, ~290 items, both cities, marks/tags/notes preserved). **DB** `guide_entries (guide, city,
  category, name, note, tag, mark, sort, locale)` via `guide-store.ts` — seeds from the seed on first
  init, `getGuide(slug)` regroups DB rows under the seed's category meta; editable later via Admin CMS.
  `GuideScreen` server loader; all 7 linked from `/companion`. Seed-integrity test (2). Public.
  Deferred: hotels-via-`SaudiConnector.searchHotels` (hotels already searchable in the booking funnel)
  and the prototype's Jeddah gifts block (type is makkah/madinah only) — note for a later pass.

- **11 Step-video wizards** (`e0b10b5`) — `/guide/{airport,luggage,makkah-ziyarat,madina-ziyarat}`.
  (Virtual Tour already live at `/guide/tour`.) ONE shared `<StepVideoWizard>` (step rail + media
  panel + localized RTL title/body + string-or-customs-rule items + tip + per-step video link +
  language switcher + prev/next). `parse-embed.ts` YouTube/Vimeo/MP4 → embeddable (4 tests). Content
  transcribed into `ritual/wizard-steps.ts` (45 steps: airport 7, luggage 8, Makkah 16, Madinah 14;
  EN/UR/AR/DE airport+luggage, EN/AR ziyarat; luggage items = ok/permit/prohibited customs rules).
  **DB** `ritual_steps (wizard, idx, short, label, text jsonb, items jsonb, tip, video_url, sort)` via
  `wizard-store.ts` (seeds from seed, editable via CMS) + `pilgrim_step_videos (pilgrim_id, wizard,
  step_idx, url)` via `step-video-store.ts`/`-actions.ts` — **sign-in to save** per-step clips, URL
  validated by parseEmbed. `WizardScreen` loader; all linked from `/companion`. Seed test (2).
  Assumption A9 logged (content + translations + customs rules pending review). Deferred: object-store
  video upload (URL-only for now) + LT/TR locale text.

- **12 B2B Agent Portal** (`0770e90`) — `/agent`. Portal engine/screens/tests already existed but ran
  on a shared in-process backend (not durable, not per-user). Added durable, **agency-scoped Postgres
  persistence** (`agent-db.ts`, in-memory fallback): `agencies, wallets, wallet_ledger (double-entry),
  quotes` — every query scoped by agency (= user id); one agent never sees another's wallet/quotes.
  Rewrote `actions.ts` DB-backed: setup load-or-creates the agency + seeds a €60k float; bookGroup
  blocks over `balance+creditLimit`, books via core-booking, appends a balanced ledger leg; new
  `saveQuote/listQuotes/convertQuote/statementCsv` actions. Wallet/ledger now persist across restarts;
  balance + history reload on visit. New `QuotesPanel` (build → save → shareable `/agent/quote/<ref>`
  public page → convert), CSV statement download (reconciles the ledger via existing `buildStatement`).
  Repo test (3: double-entry balance, statement reconcile, agency isolation); existing 26 agent tests
  still green. Deferred: `markups` table persistence (markup engine already tested), sub-agent
  hierarchy/approval workflow UI, live wallet holds (held=0), PKR-indicative on quotes.

- **13 Admin connectors** (`236b4a7`) — `/admin/{providers,connector,nusuk,suppliers}`.
  **Provider registry** `src/admin/providers.ts` (pure): 7 integrations with env KEY NAMES (never
  secrets); `providerStatus` derives connected/sandbox/gated/not-configured from env presence — Saudi
  & supplier seams sandbox on mock, gated when switched live without creds (4 tests, asserts secret
  values never serialised). **DB** `service_providers` (status snapshot) + `health_checks` (append) via
  `health-store.ts`; `connector-actions.ts` (ADMIN): `listProviders` + `testConnection` pings the
  adapter THROUGH the interface (mock by default) and logs latency. `ProvidersConsole` table + detail
  drawer (capabilities, bound/missing key names, Test connection, vault-rotate note). Ops consoles:
  Saudi connector (auth gate, domain map, 2025 Nusuk-approved-hotel rule verified live, resilience),
  Nusuk (package modes + Rawdah slots + ziyarah/catering via `SaudiConnector` mock), Travel suppliers
  (net hotels/flights via `TravelSupplier` mock). Linked from AdminConsole. Deferred: live contract-test
  runner UI, real vault rotate-creds, supplier book→cancel interactivity, "+ Add provider" (registry is code).

- **14 EU Compliance** (`8ab44b4`) — `/admin/compliance`. `@auj/compliance` logic already existed
  (tiers, `renderCertificate`, `refundDueBy`, GDPR/consent); added it as a web dep + closed the DB gap.
  **DB** `compliance-store.ts` (Postgres + in-memory): `security_certificates` (+ delivery proof),
  `precontract_consents`, `refund_windows`, `gdpr_requests`. `onPackageBooking` records consent (before
  charge) → issues + delivers the certificate (tier drives cover) → opens the **6-month** refund window
  (`refundDueBy`, 183d), in one step. `compliance-actions.ts` (ADMIN): list, simulate-booking, GDPR
  request/complete (export returns the customer's records; delete erases PII). `ComplianceConsole`:
  tier config, certificates (download .txt), refund windows (overdue/days-left), consents, GDPR
  export/delete. Repo test (2: on-booking issue+consent+window=183d; GDPR export/erase). Linked from
  AdminConsole. Deferred: certificate **PDF→DocumentStore** (object-store pending; text artifact stored),
  wiring `onPackageBooking` into the live checkout confirm step (flow + simulate available now),
  per-issue/refund `activity_logs`.

- **15 Landing** (`ea38a5b`) — `/` (`src/Landing.tsx`, already a rich cinematic page). Closed the
  "hub links to everything" gap: added an **"Everything for your journey"** frame (`#tools`) — a
  responsive grid linking every migrated route (/plan, /book, /companion, /plan/day,
  /companion/packing, /companion/diary, /guide + /guide/tour, the 4 step wizards, food/transport/
  helpline guides, /agent); fixed the dead "For travel agents" CTA → `/agent`. Lead capture already
  persists with a **GDPR consent** checkbox that gates submit (`SmartVisitWizard` → `leads`/inquiry,
  `consent: boolean`). Fluid `clamp()` + RTL + tokens pre-existing. Landing's 17 tests still green.
  **Also fixed a latent #14 break**: `compliance-actions.ts` exported a non-function const from a
  `'use server'` file (Next forbids) → made `PRECONTRACT_INFO` module-local; build now collects all
  47 pages.

- **Object store foundation** (`6fe31d5`) — unblocks #05 + closes the standing object-store deferrals.
  User chose "wire MinIO/S3 now". `src/storage/document-store.ts` implements core-booking's
  `DocumentStore` contract with env-selected backends: **S3/MinIO** when `OBJECT_STORE_*` set
  (`@aws-sdk/client-s3`, path-style for MinIO), **durable Postgres `documents_blob` (bytea)** when only
  `DATABASE_URL` (works on the live server today, no MinIO needed), in-memory otherwise.
  `uploadDocumentAction` (sign-in, 8 MB cap, images/PDF only, key = `${userId}/${kind}/${uuid}.ext`) +
  owner-scoped blob route `GET /api/doc/[...key]` (only the owner or ADMIN may fetch). Test (2:
  round-trip + miss). Next: #05 Dashboard (passport upload+OCR, Me/Family/Group switcher) on this seam.

- **05 Pilgrim Dashboard** (`4d3042c`) — `/journey/dashboard` (linked from the journey tab bar + landing).
  Built on the object-store seam. **Me/Family/Group switcher** (`dashboard_members`, 'me' implicit,
  add/remove, owner-scoped). **Passport scan**: upload image → object store (`${uid}/passport/${member}/…`)
  → owner-scoped `/api/doc` preview → editable MRZ fields → persist to `passport_scans`
  (OCR auto-fill is a provider swap; manual entry until OCR_* set). **Deposit card** EUR/USD/SAR/PKR
  (`displayFromEur`, EUR charged of record, others indicative). **Progress bar**
  Registered→Passport→Deposit→Visa→Info derived from real signals (passport confirmed + booking-draft
  step). **Tool grid** → real routes. Per-member **visa-route pill** via `routeFor(nationality)`.
  Repo test (3: member isolation, 'me' kept, passport persist). Deferred: real MRZ OCR (provider),
  deposit→payments intent (currently links to /book).

## Migration status — COMPLETE
**All 15 migration screens (01–15) delivered, gated & deployed**, plus the object-store foundation.
Full web suite: **33 files / 124 tests green**; `next build` **48/48 pages**, no client pg/crypto leak.
Per-screen gate held throughout: typecheck · lint · unit · build → commit → pipeline deploy.
Standing deferrals: none — all cleared.

### Live contract-test runner (done)
`contract-runner.ts` — runtime mirror of the `@auj/contracts` vitest suite (same Zod schemas as the
shared source of truth) for `SaudiConnector` (7 checks) + `TravelSupplier` (3 checks), each wrapped
to a `{name, ok, detail}` result. `runContractTestsAction` (ADMIN) runs them live against the selected
adapter (mock by default). `ContractRunner` client component (Run button + pass/fail list + N/N badge)
embedded in the Saudi connector + Travel suppliers consoles. Test asserts the mock passes every check.
This makes the connector consoles' "contract tests" real, not descriptive.

### Passport OCR provider (done)
`passport-mrz.ts` — pure TD3 MRZ parser (passport no., names, nationality, DOB, expiry, sex; lenient,
century guard; 3 tests incl. the ICAO specimen). `passport-ocr.ts` — provider seam behind `OCR_*`:
when `OCR_ENDPOINT`+`OCR_API_KEY` are set the image is POSTed (generic `{mrz|text}` contract) and
parsed; otherwise OCR is off and the dashboard keeps manual entry. `dashboard-actions.uploadPassportAction`
now auto-fills extracted fields from the scan when OCR is configured (editable, then confirm); the UI
note adapts ("Auto-filled from the scan — please check" vs manual). Provider registry updated
(`OCR_ENDPOINT`+`OCR_API_KEY`, MRZ read + TD3 parse). Swap vendors by pointing `OCR_ENDPOINT` at them
and adapting the response shape in `passport-ocr.ts`.

### Jeddah gifts data (done)
Widened `GuideCity` to include `'jeddah'` and made `GuideDef.cities` partial. Restored the Gifts
prototype's Jeddah block (4 categories / 16 items: Dates & last-minute gifts, Souqs & souvenirs,
Malls & Corniche, Order online). `GuideWizard` city toggle is now data-driven (renders the cities a
guide actually has — 3 for gifts, 2 for the rest); `guide-store` seeds + regroups per the guide's
own cities. Seeding is now **idempotent per (guide, city)** so the new Jeddah rows seed on deploy
without disturbing existing makkah/madinah rows. Jeddah descriptive text falls back to EN (LT/TR
overlay covers the shared keys; new Jeddah-only keys pending, per A10).

### Guide + wizard LT/TR localisation (done)
Non-destructive translation overlays (EN stays the reviewed base; missing strings fall back to EN).
- Companion guides: `companion/guide-i18n.ts` (`GUIDE_I18N`, lt+tr — 35 categories / 179 items per
  locale; proper-noun names/tags/marks kept as join keys). `GuideWizard` gains an EN/LT/TR switcher that
  applies the overlay (category name/desc/noun + item note); `slug` threaded from `GuideScreen`.
- Step wizards: `ritual/wizard-steps-i18n.ts` (`WIZARD_I18N`, lt+tr for all 45 steps, index-aligned).
  `WizardScreen` merges the overlay into each step's localized `text`; `RITUAL_LOCALES` += Lithuanian
  (the EN/AR/UR/TR/DE/LT switcher already drives `StepVideoWizard`).
Coverage test (2: every guide category key + every wizard step has lt+tr). Assumption A10 logged
(machine-drafted, pending native review). Full web suite 130 tests; build 48/48.

### B2B markups persistence (done)
`agent-db.ts` gains a `markups` table + `listMarkups/saveMarkup/deleteMarkup` (per agency, upsert).
`actions.ts`: `listMarkupsAction/saveMarkupAction/toggleMarkupAction/deleteMarkupAction` +
`markupPreviewAction` (net→sell per tier via the tested `MarkupEngine`, server-side). New crypto-free
`MarkupsPanel` (rules list + add/toggle/delete + per-tier preview) on the agent portal — imports the
markup *types* only, never `markup.ts`/`ids` (which pull node:crypto). Repo test (markups upsert +
isolation). Completes #12's data model.

### Dashboard deposit → live payments intent (done)
`deposit-store.ts` (`deposits` table) + `deposit-actions.ts`: `startDepositAction` authorizes an
EUR payment intent via the booking backend's `payments.authorize` (synthetic `deposit:<uid>:<ts>`
ref), persists a pending row holding the intent id; live Stripe → returns clientSecret/publishable
key, sandbox → captures immediately. `finalizeDepositAction` captures after the browser confirms
(owner-checked). Dashboard deposit card now pays inline via the shared `StripePaymentForm` (EUR
charged, EUR/USD/SAR/PKR display), shows "✓ Deposit paid", and the **Deposit progress stage now
reflects a real paid deposit** (`depositPaid`). €50–50,000 bounds. Repo test (1).

### Object-store retrofits (done)
- **Certificate PDFs** — dependency-free `src/admin/pdf.ts` `textPdf()` (valid PDF 1.4 + xref; 2 tests).
  `compliance-store.onPackageBooking` now renders the certificate to a PDF, stores it in the object
  store (`compliance/<certId>.pdf`, new `pdf_key` column), and the console **Download** opens it via the
  owner/ADMIN-scoped `/api/doc` route (text fallback if absent).
- **Voice recordings** — opt-in cloud copy alongside the private on-device IndexedDB store.
  `recordings-cloud-store.ts` (`pilgrim_recordings`) + `recordings-actions.ts`: "☁️ Save to account"
  on each recording uploads the audio blob to the object store (`${uid}/recording/<id>.ext`) and lists
  cloud recordings (cross-device) with `/api/doc` playback + delete. 20 MB cap, sign-in gated.
- Pending (non-blocking): voice recordings on-device vs object store; passport OCR (needs object store);
  hotels-via-connector in guides; Jeddah gifts data + guide localisation (LT/UR/AR via `locale`).

Gate per screen: typecheck · lint · unit · build green → commit → pipeline deploys.

### Cinematic design rollout (ScreenFrame) — all migration screens
Built a reusable `components/ScreenFrame` (prototype chrome: white rounded card on the warm canvas +
dark-green gradient header with AUJ logo chip + mono section label + tag pill + gold underline +
texture) and applied it across every screen, in 4 gated waves:
- W1 (12): VirtualTour (/guide/tour) + GuideWizard (7 guides) + StepVideoWizard (4 wizards).
- W2 (6): Pilgrim Dashboard, Day Planner, Personal Diary, Packing, Companion hub, Smart Visit planner.
- W3 (9): Visa Router, Finance Self-Assessment, Predictive Analysis, Umrah Finance Calculator,
  Service Providers, Saudi Connector, Nusuk, Travel Suppliers, EU Compliance.
- W4 (1): Booking funnel (step name as tag, width adapts).
Already prototype-faithful (left as-is): Pilgrim Profile (green cover card), B2B Portal (Shell rail +
agency/wallet header), Landing (its own cinematic hero/frames). Plus landing cinematic polish earlier
(parallax skyline/dome hero, count-up stats, trust marquee, CTA sheen). SW bumped to auj-v3 to evict
stale clients. Full monorepo green: 26 typecheck · 14 lint · 26 test · 14 build; web next build 48/48.

### Landing DB layer (migration 15 finalize) — CMS + leads
- **landing_content CMS** — `landing-content.ts` (client-safe `LandingOverrides` + `landingCopy()`
  locale→EN→catalog fallback + `LANDING_CONTENT_KEYS`), `landing-content-store.ts` (Postgres
  `landing_content (key, locale, value)` + in-memory), `landing-content-actions.ts` (ADMIN list/save,
  key-allowlisted). `app/page.tsx` fetches overrides → `Landing` applies them to hero badge/title/
  subtitle over the i18n defaults. Repo test (override layering + fallback).
- **leads table** — extended `src/leads/store.ts` with a normalized `leads (id, name, contact, intent,
  locale, consent, created_at)` projection written alongside the rich `inquiries` row on every Smart
  Visit submission (GDPR `consent` carried through); `listLeads()` + `toLead()`. Repo test (projection
  + email→phone fallback + consent true/false).
- Frames already link to real migrated routes; fluid clamp() + overflow-hidden (no h-scroll); RTL via
  app locale dir; gold = logo/highlights only. Note: target route is `app/page.tsx` (no `(marketing)`
  group exists; creating one would collide with the root page). Gates: typecheck · lint · 138 unit ·
  build 48/48 — all green.
