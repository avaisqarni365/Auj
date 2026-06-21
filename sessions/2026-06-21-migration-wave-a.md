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

## Migration status
Screens 01–15 delivered & deployed **except 05 Dashboard** (passport OCR + Me/Family/Group switcher),
which is gated on the object-store decision. Full web suite: 31 files / 119 tests green; `next build`
47/47 pages. Standing deferrals tracked below.
- Pending (non-blocking): voice recordings on-device vs object store; passport OCR (needs object store);
  hotels-via-connector in guides; Jeddah gifts data + guide localisation (LT/UR/AR via `locale`).

Gate per screen: typecheck · lint · unit · build green → commit → pipeline deploys.
