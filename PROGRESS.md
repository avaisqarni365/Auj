# PROGRESS — single source of truth for "where are we"
_Last updated: 2026-06-13 · by: Claude Code · commit: unify apps + auth/RBAC_

## ARCHITECTURE CHANGE — unified single app (2026-06-13)
Per user decision, the three separate Next apps were UNIFIED into one app at `apps/web` (:3000).
`apps/web-b2c` and `apps/web-b2b` were DELETED; their funnel/portal source was relocated into
`apps/web/src/book` and `apps/web/src/agent` and mounted as routes. One server, one login.
- Routes: `/` (landing) · `/login` `/signup` (auth) · `/book` (B2C funnel, any signed-in user) ·
  `/agent` (B2B portal, AGENT/SUB_AGENT, ADMIN) · `/admin` (back office, ADMIN) · `/journey`.
- Real auth + RBAC via NEW `@auj/auth` package: email+password (scrypt), opaque server sessions
  (httpOnly cookie), roles PILGRIM|AGENT|SUB_AGENT|ADMIN, agent register→PENDING→admin-approve→ACTIVE.
  In-memory + Postgres adapters (pg-mem tested). Seeded admin via ADMIN_EMAIL/ADMIN_PASSWORD
  (default admin@auj.example / admin12345 — CHANGE in prod).
- Route guards: `requireRole()` server-side; /book /agent /admin 307→/login?next=… when unauthed.
- Admin → Users & roles now has a live "Agent approvals" panel (lists agents, approve button).
- Deploy: single image `…-web` (apps/web/Dockerfile); infra/compose service renamed web; env WEB_IMAGE.
- Note: `next build` standalone output fails on THIS Windows host with EPERM (symlink) — Developer
  Mode/admin needed for symlinks; does NOT affect `next dev` or the CI gate (tsc). Linux CI is fine.

## Connector seam: env switch + language-agnostic contract (2026-06-13)
- The seam is now ENV-SELECTED end-to-end: `apps/web/src/connectors.ts` reads `CONNECTOR=mock|saudi`
  and `SUPPLIER=mock|live` and picks the connector/supplier. Both composition roots (book + agent)
  use the selectors; `createInProcessBackend` stays mock for hermetic tests. Proven: CONNECTOR=saudi
  swaps `htl_mak_1` (mock) → `maqam:MAK-001` (certified adapter) with zero change above the seam.
- Language-agnostic contract GENERATED from the Zod source of truth (cannot drift):
  `scripts/gen-connector-spec.mts` → `docs/connector-contract/openapi.json` (OpenAPI 3.1, 16 ops,
  15 schemas) + `README.md` (one-page summary). Run with `pnpm gen:spec`. This is the artifact a
  partner/ERP or the future Maqam integration builds against.

## Build status
ALL MODULES BUILT + unified app + env-selected seam + full Nusuk-parity product surface
(modes, Rawdah, ziyarah, catering, distance sort, Gift Umrah + redemption, Support tickets,
Personalization + admin management). Gate: build 13/13, lint 13/13, test 24/24 (apps/web 62,
core-booking 29). Remaining: real partner SaudiPartnerClient (gated), real payment-gateway SDKs, deploy.

## Frontend handoff (design_handoff_auj_platform, expanded 2026-06-13)
- New bundle adds Brand/Logo, Landing (responsive web /), Admin (Web) console, Traveller portal (web /journey + mobile). CLAUDE_CODE.md = kickoff prompt + route map; README = full spec.
- [x] @auj/ui <Logo/> — official zenith mark (4 colourways) + bilingual Wordmark.
- [x] apps/web (NEW Next app @auj/web) — Landing page at /: announcement, nav, hero (+floating cards), overlapping search (tabs/stepper), trust, journey types, one-cart, how-it-works, visa-route panel (real routeFor demo), featured packages, EN/LT/UR/AR switcher w/ RTL, track-booking timeline, testimonials, FAQ accordion, CTA, footer. Responsive (clamp/auto-fit). 6 tests. `npm run dev:web` (:3000).
- [x] Admin (Web) console at /admin — 248px green sidebar + topbar (search, FX chip, bell, +New booking); client view switching: Overview (KPIs, recent bookings, visa pipeline, departures), Pilgrims·CRM (table -> master/detail profile: journey timeline, docs, visa card, payments, comms, group), Landing CMS (hero editor + sections), Users & roles (tab filter + table). visa-route pills via real routeFor. Sample data in src/admin-content.ts (4 tests).
- [x] Traveller web portal /journey — portal nav + booking hero (BRN, route/dates/pax, "Visa in progress" pill, days-to-departure, 5-stage progress) + tabs: Journey (every-step timeline + What's-next + QR digital pass encoding the BRN), Itinerary (day cards), Documents (docs + per-pilgrim visa status via routeFor), Payments (summary + EUR/PKR + transactions + receipt/plan). Content in src/journey-content.ts (5 tests).
- [x] PDF travel-plan + Umrah guide — print-optimised /journey/plan (rituals, day-by-day, document checklist, tips; Print/Save-PDF; print:hidden toolbar, break-inside-avoid). Linked from portal + admin profile.
- [ ] Traveller MOBILE app screens (separate RN/PWA track).

## Nusuk parity + partner APIs (added 2026-06-13)
- Analysed umrah.nusuk.sa (we'll be a Nusuk-approved external agent). Features captured as skills:
  - .claude/skills/nusuk-umrah-services/SKILL.md — feature parity (packages visa-included/optional/custom,
    Rawdah permit, ziyarah, meals, gift Umrah, personalization, e-services) mapped onto the hybrid
    SaudiConnector seam (build on mock, swap connector-saudi). NEW domain bits to add: RawdahPermit,
    package mode, catering, gift.
  - .claude/skills/partner-service-providers/SKILL.md — admin management of partner/supplier APIs.
- [x] Admin → Service providers view (apps/web /admin): registry of integrations (Nusuk Masar/Maqam=gated,
  TBO/Hotelbeds, Amadeus/Sabre, Stripe, Safepay/PayFast, S3/MinIO, OCR) with status pill
  (connected/sandbox/gated/not-configured), capabilities, adapter+env binding, Test-connection, Add-provider.
  PROVIDERS registry in src/admin-content.ts (test). Mirrors Nusuk's licensed-provider directory.
- [x] Rawdah permit + package modes (2026-06-13) — full hybrid-seam feature, contracts v1.1.0:
  - contracts: PackageMode (COMPREHENSIVE|VISA_OPTIONAL|CUSTOM), RawdahSlot, RawdahPermit (+Zod);
    SaudiConnector.searchRawdahSlots(date) + bookRawdah(slotId, pilgrims); contract-tests cover both.
  - connector-mock: 3 fixed daily slots + permit issuance. connector-saudi: Maqam Rawdah client types,
    sandbox impl, mappers (mapRawdahSlot/mapRawdahState), connector methods (withRetry).
  - core-booking: Package.mode + Booking.mode + Booking.rawdah; BookingService.rawdahSlots()/bookRawdah()
    (pilgrimage-only guard); Postgres adapter persists mode (text) + rawdah (jsonb) — schema/mappers/repo;
    lifecycle + pg-mem tests green.
  - web-b2c: PackageBuilder mode selector + Rawdah add-on toggle → funnel state → placeBookingAction
    (mode + optional rawdahDate books first slot); MyBooking shows mode badge + Rawdah permit card.
  - apps/web /journey: package-mode badge on hero + Rawdah permit card in the Journey tab.
- [x] Ziyarah bundles + Meals/catering + distance-to-Haram sort (2026-06-13), contracts v1.2.0:
  - contracts: CateringOffer + CateringPlan (HALF_BOARD|FULL_BOARD|IFTAR_SUHOOR) (+Zod);
    SaudiConnector.searchZiyarah (curated GroundOffers) + searchCatering; contract-tests cover both.
  - connector-mock: ZIYARAH + CATERING catalog (city-filtered). connector-saudi: Maqam ziyarah/catering
    client types + sandbox + mappers (mapZiyarah, mapCatering w/ plan-code map) + connector methods.
  - core-booking: ItemKind += 'CATERING'; cateringItem() builder (ziyarah reuses groundItem→GROUND);
    lifecycle test builds hotel+ziyarah+catering package.
  - web-b2c: PackageBuilder ziyarah + catering add-on groups (toggle into cart via ADD/REMOVE_ITEM),
    backend+ports wired, searchAddonsAction; Results has a working distance-to-Haram sort + Near-Haram chip.
- [x] Gift Umrah (2026-06-13) — book/pay a package for a recipient + redeemable voucher:
  - core-booking: Booking.gift { recipientName, recipientEmail?, message?, voucherCode, redeemed };
    giftVoucherCode() (AUJ-GIFT-XXXXXXXX); createDraft accepts `gift`; redeemGift(code) one-time.
    Postgres adapter persists gift (jsonb). Lifecycle + pg-mem tests.
  - web-b2c funnel: Checkout "Send as a gift" toggle + recipient name/email/message; funnel SET_GIFT;
    placeBookingAction passes gift; MyBooking shows a gift-voucher card (code + recipient + status).
- [x] Support tickets (2026-06-13) — NEW @auj/support package + e-service:
  - @auj/support: Ticket { ref, userId, subject, category, status OPEN/PENDING/RESOLVED/CLOSED,
    messages thread, bookingRef? }; SupportService (open, listByUser, listAll, reply user/staff
    w/ status transitions, setStatus); in-memory + Postgres adapters (jsonb messages). 7 tests.
  - apps/web /support (any signed-in user): open-ticket form + own tickets with thread + reply;
    backend singleton (globalThis, Postgres when DATABASE_URL); account-menu "Help & support" link.
  - admin: Support view (list all, reply as staff, set status) via admin-guarded actions.
  - Verified e2e: open ticket -> persists -> lists; route 307-guards when unauthed.
- [x] Personalization / special requests (2026-06-13) — Nusuk feature #10:
  - core-booking: SpecialRequest { id, category (WHEELCHAIR|DIETARY|ROOM_NEAR_HARAM|LATE_CHECKOUT|OTHER),
    note?, status REQUESTED|ACKNOWLEDGED|FULFILLED|DECLINED }; Booking.specialRequests?;
    createDraft accepts them; addSpecialRequest + setRequestStatus (provider/staff). Postgres jsonb.
    Lifecycle + pg-mem tests.
  - web-b2c: Checkout "Special requests" chips (wheelchair/dietary/room-near-Haram/late-checkout) +
    free-text note → funnel TOGGLE_REQUEST/SET_REQUEST_NOTE → placeBookingAction; MyBooking lists
    requests with status.
- [x] Gift-voucher redemption UI (2026-06-13): public /redeem page (code is the bearer token) →
  redeemVoucherAction → BookingApi.redeemGift → core.bookings.redeemGift; success card + journey link.
  Booking backend singleton moved to globalThis (in-memory gift survives HMR). Footer "Redeem a gift"
  link + voucher-card hint. Verified: /redeem public 200, bogus code → "Unknown gift voucher".
- [x] Admin special-request management (2026-06-14): /admin → "Special requests" view lists
  bookings carrying requests; staff Acknowledge / Fulfil / Decline each (admin-guarded actions
  listSpecialRequestsAction + setRequestStatusAction → BookingApi.listBookings/setRequestStatus →
  core.bookings.setRequestStatus). Verified: nav present, /admin 200.
- TODO: real Nusuk Masar via connector-saudi (gated on partner access). Nusuk-parity product
  surface otherwise COMPLETE behind the mock seam.

## My bookings + detail (2026-06-14)
- /bookings: real list of the logged-in user's bookings (BookingApi.myBookings by customer email);
  cards link to detail. /bookings/[id]: ownership-checked detail (BookingApi.myBooking returns the
  booking only if it belongs to the user) — items+BRNs, pilgrims with per-pilgrim visa route (routeFor),
  Rawdah/Gift/special-requests. Shared booking-backend singleton extracted to backend/singleton.ts.
  Unit tests for myBookings/myBooking; verified guard (307) + ownership notFound (404). apps/web 63.
- Per-pilgrim document upload (2026-06-14): /bookings/[id] has a passport/photo/visa upload form per
  pilgrim → uploadDocumentAction (multipart File → bytes → DocumentService.upload → DocumentStore).
  Ownership-checked (pilgrim must be in one of the user's bookings). Documents listed per pilgrim with
  verified badge. BookingApi.uploadDocument + documentsForPilgrims wired to core.documents. Unit-tested.
- Staff document verification (2026-06-14): /admin → "Documents" view lists every uploaded doc
  (pilgrim name join, unverified first) with a Verify button → verifyDocumentAction (admin-guarded) →
  DocumentService.verify. BookingApi.listAllDocuments + verifyDocument. Closes the upload→verify loop.

## Domain + TLS — auj.codes-ai.uk (2026-06-14)
- infra now includes a Caddy reverse proxy (auto Let's Encrypt) for ${DOMAIN}; web is bound to
  127.0.0.1 (Caddy on 80/443 is the public entrypoint). infra/Caddyfile + compose `caddy` service
  + caddy_data/config volumes. .env.example gains DOMAIN/ACME_EMAIL/APP_ORIGIN (defaults
  auj.codes-ai.uk). next.config serverActions.allowedOrigins allow-lists the domain so login/signup
  work behind the proxy. DEPLOY-RUNBOOK §2a: exact GoDaddy A-record steps (auj → 212.227.54.250),
  open 80/443, set env, deploy → https. Operator still does the GoDaddy DNS + firewall.

## Deploy runbook (2026-06-14)
- infra/DEPLOY-RUNBOOK.md: concrete copy-paste deploy procedure (prereqs, env table, first-time
  server setup, CI/CD tag→build→push→ssh-deploy, smoke test, rollback, tunnel-only datastores,
  security checklist). Confirmed schema auto-migrates on first request when DATABASE_URL is set
  (book migrate + auth migrateAuth + support migrateSupport). Only host + secret VALUES remain on
  the operator. Note: `next build` standalone fails on Windows (EPERM symlink) — build on Linux/CI.

## Email notifications (2026-06-14)
- NEW @auj/notifications: Notifier port + LogNotifier (default, offline) + HttpEmailNotifier
  (generic JSON email API, injectable fetch); pure message builders (bookingConfirmation,
  ticketReply); createNotifier(env) → HTTP when EMAIL_API_URL+KEY set, else log. 4 tests.
- Wired (best-effort, never fails the action): booking confirmation email on placeBookingAction;
  ticket-owner email on staff reply. Notifier singleton on globalThis. infra/.env.example documents
  EMAIL_API_URL/KEY/FROM. Gate: build 14/14, lint 14/14, test 26/26.

## Multi-pilgrim capture (2026-06-14)
- B2C funnel now captures a GROUP, not a single pilgrim. BookingFunnel holds pilgrims: PilgrimDraft[]
  (sized to the pax chosen at search; add/remove in the PILGRIMS step). PilgrimCapture refactored to
  render a card per pilgrim (first/last/nationality/passport) with a per-pilgrim visa-route pill
  (routeForGroup/previewVisaRoute) + warnings. placeBookingAction already accepted an array, so the
  whole group flows through to per-pilgrim visa cases + MyBooking's per-pilgrim list. screens tests
  updated to the multi API. Gate: build 13/13, lint 13/13, test 24/24 (apps/web 62).

## Real i18n (2026-06-14)
- next-intl wired in apps/web WITHOUT /[locale] URL routing — cookie-driven (NEXT_LOCALE).
  src/i18n/{locales,request,actions,LocaleSwitcher}; messages/{en,lt,ur,ar}.json (namespace "common").
  Root layout drives <html lang dir> from the locale (RTL for ar/ur) + NextIntlClientProvider.
  next.config wrapped with createNextIntlPlugin.
- Landing chrome migrated to useTranslations (hero, auth CTAs, search labels + CTA, footer, redeem);
  LocaleSwitcher (server action sets cookie + revalidates layout) replaces the fake cycle button.
  Verified: NEXT_LOCALE=ar → <html lang="ar" dir="rtl"> + Arabic copy; lt → Lithuanian.
- Auth surface translated (2026-06-14): AuthForm (/login + /signup — titles, field labels,
  role options, submit, footer links) + AccountMenu (menu items + role label) via "auth"/"account"
  namespaces in all 4 catalogs. Verified: /login ar → RTL + Arabic; /signup lt → Lithuanian.
- Booking funnel + support translated (2026-06-14): BookingFunnel now passes the real cookie
  locale (useLocale) into every screen — activating the EXISTING 4-locale dict in book/i18n.ts
  across search→build→pilgrims→checkout→confirm. /support page (getTranslations) + OpenTicketForm
  (useTranslations) via a "support" namespace (4 catalogs). Verified ar/lt at runtime.
- Landing section headings + trust badges + hero-stat labels translated (2026-06-14) via a
  "landing" namespace (4 catalogs); Landing reads them with useTranslations + t.raw for arrays.
  Verified ar/lt. Remaining landing prose (FAQ answers, testimonials, package details) left in EN.
- Landing prose fully translated (2026-06-14): announcement bar, journey-type descriptions,
  how-it-works steps, package name/meta/visa, all FAQ Q&A, and testimonial quotes — in the
  "landing" namespace (4 catalogs), rendered via t.raw arrays zipped with content.ts for the
  non-text bits (gradients, prices, person names). The LANDING is now 100% localized EN/LT/UR/AR + RTL.
- Gate: build 13/13, lint 13/13, test 24/24 (apps/web 64).
- [x] Staff-chrome i18n (2026-06-17): /agent + /admin chrome now localized EN/LT/UR/AR + RTL.
  NEW "agent" + "admin" namespaces in all 4 catalogs (101 keys each, parity-checked). Agent portal
  fully wired (Shell nav/topbar/greeting, AgentPortal headings, AgentDashboard KPIs+pipeline,
  MultiPaxBooking table+actions, WalletView cards+table) via useTranslations('agent'). Admin console
  chrome wired (sidebar brand/groups/nav/more/role, topbar search+CTA, all 8 view PageHeads +
  section sub-headings) via useTranslations('admin'). Deep admin DATA tables (row cells, some table
  headers, filter-tab labels) left EN — documented remaining. screens.test wrapped in
  NextIntlClientProvider; new shell-i18n test asserts EN + AR render. Gate: build 14/14, lint 14/14,
  test 26/26 (apps/web 71).

## Landing feature parity with dynamic-packaging Umrah platforms (yuusr.com) — 2026-06-17
- Analysed yuusr.com/en and added its landing feature set to AUJ's landing, in AUJ's OWN design
  (sand/green, serif headings, Section component, Scene imagery) and fully localized EN/LT/UR/AR + RTL.
- Search widget: added Makkah-first/Madinah-first toggle + independent Makkah/Madinah NIGHT steppers
  (signature dynamic-packaging control) + a "flexible dates" hint + a micro-trust row (Trusted by
  12k+ · Payment protection · EU insolvency-protected). Steppers feed /book via makkahNights/
  madinahNights/order query params (funnel ignores unknowns — no funnel change).
- NEW sections: "Why book with AUJ" (4 value props), "This week's exclusive deals" (3 cards w/ named
  Makkah+Madinah hotels, nights, departure city, from-price per pilgrim, secure-booking line),
  "Experience the difference" (4 service blocks), How-it-works expanded 4→6 steps (adds Compare/
  filters + Customize + richer confirmation), "Popular packages" category chips (8), "Departing from
  your city" geo directory (3 regions × cities), "24/7 multilingual support" channels (phone/WhatsApp/
  email/live-chat), "Pay your way, protected" (instalments + 3-D Secure + EU insolvency cert +
  payment methods + licensed-operator), and a newsletter signup in the CTA band.
- Data (hotel names, prices, cities, support numbers, payment methods) in content.ts; all prose in the
  landing catalog (4 locales, 71 keys each, parity-checked). content.ts: DEALS, VALUE_ICONS,
  FEATURE_ICONS, DEPARTURES_GRID, SUPPORT_CHANNELS, PAYMENT_METHODS.
- Tests: Landing now asserts new sections render + night steppers feed the link + 10 scene images.
- Gate: build 14/14, lint 14/14, test 26/26 (apps/web 73).
- Deliberately NOT copied (out of scope / AUJ-specific): yuusr's "AI platform" branding, their
  inconsistent ATOL numbers, charity/Zakat framing. AUJ keeps EU-insolvency-certificate framing.
  Deals/support/departure values are realistic placeholders — swap for live data when available.

## Landing follow-up — real-data deals, deal-of-the-day, polish, richer FAQ (2026-06-17)
- NOTE: declined a verbatim 1:1 clone of yuusr's content/style (their copyrighted copy + trade
  dress; also bad for SEO/brand). Instead deepened AUJ's OWN landing across 4 chosen directions.
- Deals wired to REAL connector data: NEW src/landing-data.ts buildDeals() pulls live Makkah +
  Madinah hotel offers via the env-selected SaudiConnector (mock now, Maqam later), pairs them into
  3 deal cards (cheapest→premium) with derived per-pilgrim pricing; app/page.tsx fetches them
  server-side and passes `deals` to Landing; falls back to static DEALS offline. content.ts exports
  a `Deal` type; Landing takes an optional deals prop.
- NEW "Deal of the day" featured banner (missing section) using the top live deal.
- Design polish (design-taste skill): hover lift (translateY(-2px)+shadow-lg, transform/opacity,
  200ms ease-out-soft) on deal/value/feature cards; press (active:scale-[0.98]) on deal CTAs.
- Richer original copy: +2 AUJ-specific FAQ entries (Hajj + general travel; agent portal) — own
  voice, all 4 locales (faqs now 6×4). +dealOfDay label ×4. Catalogs reformatted to 2-space JSON.
- Landing key parity 72×4. Gate: build 14/14, lint 14/14, test 26/26 (apps/web 73).

## Landing design-taste polish pass (2026-06-17, design-taste skill)
- Scroll-reveal: NEW <Reveal> wraps every <Section> — one quiet rise+fade (opacity + 8px translateY,
  300ms ease-out-soft) when it enters the viewport, via IntersectionObserver. Guards: shown-immediately
  when IO is absent (SSR/jsdom — tests stay green), and motion-reduce drops the transform entirely.
- Hover lift on ALL landing cards (journeys/packages now match deals/value/features):
  -translate-y-0.5 + shadow-lg, transform/shadow only, 200ms ease-out-soft.
- Press + focus on every primary control (15 active:scale-[0.98] + focus-visible:shadow-focus):
  hero CTAs, search submit, Build/View package, CTA band, newsletter, Track, + nav-link focus rings.
- Tokens only (shadow-focus / ease-out-soft / duration-fast from @auj/ui preset) — no ad-hoc values.
  Body sub-copy tightened to max-w-[60ch]. Verified live on :3001 (GET / 200, 12 scenes, no errors).
- Gate: build 14/14, lint 14/14, test 26/26 (apps/web 73).

## Unified site header + footer across all pages (2026-06-17)
- NEW shared chrome lifted from the landing's own design: src/components/SiteHeader.tsx (sticky nav:
  Logo+wordmark→/, nav links → /#section so they work off-home, LocaleSwitcher, AccountMenu/Login,
  Book/Signup CTA — with press + focus states), SiteFooter.tsx, and SitePage.tsx (header + flexible
  main + footer frame; `center` for auth/redeem cards).
- Applied to EVERY public/account page: landing (refactored to use SiteHeader/SiteFooter), /book
  (funnel's redundant brand bar removed), /journey (shared header + tabs kept as a sub-bar + footer),
  /bookings, /bookings/[id], /support, /login, /signup, /redeem. AuthForm + RedeemForm dropped their
  own min-h-screen wrappers so they sit inside SitePage's centred main. Per-page ad-hoc mini-headers
  (Logo+AUJ) removed; unused Logo/Link/useLocale imports cleaned up.
- Staff consoles /admin + /agent intentionally KEEP their dedicated app shells (sidebar/rail) — they
  are internal dashboards per the design handoff, not part of the marketing/site chrome.
- Verified live on :3001: / · /login · /signup · /redeem · /journey all render identical header +
  footer + nav (HTTP 200). Gate: build 14/14, lint 14/14, test 26/26 (apps/web 73).

## Rich multi-column footer (2026-06-17)
- Expanded SiteFooter into a full dark-green (green-950) footer matching the structure of large
  Umrah platforms but with AUJ's OWN identity & original copy (did NOT copy yuusr's ATOL number,
  TRAVELEAP company/registration, address, contact, or legal disclaimer — those would be false +
  infringing on an EU operator). Columns: brand + tagline + EU-insolvency-protection badge + socials;
  Quick links; Our packages (Economy/Standard/Premium); Stay-connected newsletter + Get-in-touch
  (email/phone/location) + accepted payment methods; legal line (own wording: licensed EU operator,
  agent model, PTD insolvency certificate) + rights + redeem + locales.
- NEW "footer" message namespace (22 keys) localized EN/LT/UR/AR. content.ts: AUJ_CONTACT + SOCIALS
  (PLACEHOLDERS). Removed the duplicate landing CTA-band newsletter (footer now carries it globally).
- Accuracy fix: landing trust badge "ATOL-style protection" → "Insolvency-protected" (4 locales) —
  AUJ is EU, not UK-ATOL; consistent with the footer's framing.
- ACTION REQUIRED before launch (operator to supply; do NOT ship placeholders): real support
  email/phone, registered company number + address, the insolvency-protection provider/scheme
  reference, and real Terms/Privacy/About/Newsroom pages (footer links currently point to #anchors).
- Gate: build 14/14, lint 14/14, test 26/26 (apps/web 73). landing 72 + footer 22 keys ×4, parity OK.

## Real payment acquirers (2026-06-14)
- @auj/payments: LiveStripeProvider (real Stripe PaymentIntents REST — manual-capture create,
  capture, refund via PI re-read, webhook + status mapping) and LiveHttpProvider (generic JSON
  gateway for PKR / Safepay-PayFast). Both take an INJECTABLE fetch → mapping/idempotency unit-tested
  offline (no network, CI stays green). `createPaymentRouter(env)` selects live when keys present
  (STRIPE_SECRET_KEY / PKR_GATEWAY_URL+KEY), else the in-memory sandbox (default).
- apps/web book backend now builds payments via createPaymentRouter() — set the keys in infra/.env to
  go live, no code change.
- Gate: build 13/13, lint 13/13, test 24/24 (payments 28).

## Real Stripe.js card flow (2026-06-17) — closes the payments limitation above
- @auj/payments: PaymentIntent gains `clientSecret?`; LiveStripeProvider maps Stripe's client_secret
  from createIntent. PaymentsService split into TWO phases: `authorize()` (create intent, no capture,
  no ledger post) + `captureAuthorized()` (capture by intent id — amount comes from the gateway, a
  client can't influence the charge — then post the ledger). `pay()` is now authorize+capture (the
  single-shot path for the offline sandbox / server-only PKR gateway). 2 new tests (payments 29).
- apps/web seam: PaymentsApi += authorize/capture; usecases split into createHeldBooking (customer +
  pilgrims + draft + HOLD) → confirmHeldBooking (confirm + visa + Rawdah). placePilgrimageBooking now
  composes the three; behaviour identical on the sandbox.
- Two-phase booking actions: `startCheckoutAction` creates+holds, authorizes, and BRANCHES — if the
  gateway returned a clientSecret AND STRIPE_PUBLISHABLE_KEY is set it returns { requires_card,
  bookingId, clientSecret, publishableKey } and leaves the booking HELD; otherwise it captures +
  confirms immediately (unchanged sandbox path). `finalizeBookingAction(bookingId)` is ownership-checked,
  captures the SERVER-recorded intent (from a globalThis pending store keyed by bookingId — client never
  supplies an intent id), then confirms. New 1 test (apps/web 66).
- Browser: StripePaymentForm.tsx ('use client') loads Stripe.js from js.stripe.com (CDN — PCI SAQ-A
  requires their script from their domain; no npm dep, offline gate stays green), mounts the Payment
  Element, confirmPayment({ redirect: 'if_required' }) → intent becomes requires_capture → onConfirmed
  → finalizeBookingAction captures. New CARD funnel step between CHECKOUT and CONFIRMED. PANs never
  touch our code. stripe-js.ts = minimal typed loader.
- Env: STRIPE_PUBLISHABLE_KEY documented in infra/.env.example. With no key the EUR flow stays
  single-shot (sandbox) — zero behaviour change for dev/CI.
- LIMITATION (remaining): pending-intent store is in-process (single instance ok; multi-instance needs
  Redis/Postgres or webhook-driven capture); Stripe webhook signature verification still TODO for prod.
- Gate: build 14/14, lint 14/14, test 26/26 (payments 29, apps/web 66).

## Imagery seam + on-brand scene artwork (2026-06-17)
- The design handoff (README "Assets → Imagery") shipped all hero/package/hotel visuals as
  gradient/"PHOTO ·" placeholders. Replaced them with committed, license-free SVG scene art so
  nothing renders as a missing image, behind a one-line swap seam for real photography.
- NEW apps/web/public/img/scenes/: makkah-haram.svg (Kaaba + clock tower + Haram arcade),
  madinah-nabawi.svg (green dome + twin minarets, reuses the brand skyline construction),
  ziyarat-iraq.svg (golden Najaf/Karbala domes). All on-brand palette, well-formed XML.
- NEW src/scenes.ts = manifest (name→file+alt) + sceneSrc()/sceneAlt(); honours
  NEXT_PUBLIC_IMG_BASE so photos can be served from a CDN without code change. NEW
  components/Scene.tsx = server-safe <img> (lazy, alt, priority for the hero).
- Wired: Landing hero (makkah, priority), 3 journey-type cards + 3 featured-package cards
  (makkah/madinah/ziyarat) — gradient kept as the underlay/fallback; funnel Results hotel cards
  (scene by destination city). To ship real photography: replace the file under public/img/scenes
  (+ update scenes.ts `file`) or point NEXT_PUBLIC_IMG_BASE at a mirror — NO component edits.
- Tests: scenes manifest (2) + Landing renders ≥7 scene <img> with descriptive alt (a11y).
- Gate: build 14/14, lint 14/14, test 26/26 (payments 29, apps/web 69).

## Design quality as a workflow (added 2026-06-13)
- [x] .claude/skills/design-taste/SKILL.md — Emil-Kowalski-grade motion + impeccable design + typography + taste, with a finish checklist. Auto-surfaces on UI work (description match); invoke as /design-taste. THE workflow to apply on every frontend change.
- [x] @auj/ui motion — preset keyframes (fade-in/rise/pop), ease-out-soft, duration-fast; @auj/ui/motion.css (prefers-reduced-motion guard, imported in all 3 app globals); Button press (active:scale .98), Card hover transition. Purposeful, fast, transform/opacity-only.

## How to run (each app is a SEPARATE Next app; one at a time on :3000)
- `npm run dev`  -> marketing LANDING (@auj/web) — the public front door. Routes: / , /admin , /journey , /journey/plan.
- `npm run dev:b2c` -> booking funnel (web-b2c). `npm run dev:b2b` -> agent portal. `npm run dev:web` = landing (alias of dev).
- If a page shows HTTP 500 / blank after many edits: it's a stale Next cache — stop dev, `rm -rf apps/<app>/.next`, restart. NEVER run `build:next` while `next dev` is live on the same app (it corrupts .next).
- (history) `npm run dev` previously launched web-b2c; it now launches the landing. (app bar + gold-star logo, serif hero, search card, popular rail, trust strip; sticky sub-screen headers; visa-route gradient card; green My-Booking header + live visa timeline).
- `npm run dev:b2b` -> web-b2b agent portal (:3000): HI-FI desktop design (dark-green rail + topbar, KPI dashboard + visa pipeline + credit card, multi-pax passenger table + group summary, wallet 3-card + transactions, markup rules+editor, quotation, statements). Auto-onboards a GOLD agent, funds wallet, multi-pax book (<=49).
- `npm run dev:all` -> every app (needs --concurrency, already set).

## Status by wave
### Wave 0 — sequential (scaffold + contracts + mock) — DONE
- [x] 00-getting-started — pnpm+Turborepo monorepo wired; build/typecheck/lint/test all green; CI + docker-compose authored
- [x] saudi-connector-interface — @auj/contracts v1.0.0: SaudiConnector + TravelSupplier ports, full Zod domain schemas, reusable contract-tests (@auj/contracts/contract-tests). 5 schema tests green
- [x] saudi-connector-mock — @auj/connector-mock v1.0.0: in-memory SaudiConnector + TravelSupplier, seed catalog, env edge-case toggles, offline demo (search->hold->confirm->BRN->visa->ISSUED). 15 tests incl. shared contract-tests green

### Wave A — parallel, against the mock
- [x] booking-crm-documents — @auj/core-booking v1.0.0: full booking lifecycle state machine, CRM (customers/pilgrims/mahram), package builder, document service (S3 port + OCR hook), connectors by DI + visa-router wired. 14 tests incl. e2e pilgrimage + travel against the mock
- [x] payments-wallet — @auj/payments v1.0.0: PaymentProvider port + Stripe(EUR)/PKR sandbox adapters, double-entry Ledger (always balances), agent WalletService with credit limits/holds/settlement, idempotent capture + refunds + webhook reconcile. 19 tests
- [x] visa-router — @auj/visa-router v1.0.0: pure routeFor()/routeForGroup(), config-driven eligibility (nationality + Schengen/UK/US/GCC residence), dual-national preference, seasonal-suspension warnings. 16 tests, all branches
- [x] general-travel-connectors — @auj/connector-travel v1.0.0: bedbank (TBO-style) + flight (Amadeus-style) adapters mapping vendor payloads into domain types, composed into a TravelConnector behind TravelSupplier; sandbox clients for offline. 8 tests incl. the shared TravelSupplier contract-tests

### Wave B — parallel, on Wave A APIs
- [x] ui design system — @auj/ui v1.0.0: aujPreset (Tailwind tokens), tokens.css, core React components (Button/Input/Select/Card/StatusPill/Stepper/SegmentedControl/Toggle). 10 tests. Maps the design handoff onto reusable primitives both apps share
- [x] b2c-website — @auj/web-b2c: funnel (ports + in-process backend, reducer, usecases, fx, i18n EN/LT/UR/AR, 6 @auj/ui screens; 15 tests incl. e2e on the mock) PLUS a Next.js App Router shell (app/ with Server Actions running the backend server-side, aujPreset Tailwind, IBM Plex fonts, tokens.css). `npm run dev` serves it at :3000; `next build` green. tsc gate stays fast (build = tsc -p tsconfig.build.json)
- [x] b2b-agent-portal (framework-light) — @auj/web-b2b: AgentService (register/approve/sub-agent hierarchy), MarkupEngine (tier+product specificity), multi-pax bookGroupFromWallet (<=49, wallet-funded, credit limit blocks over-limit), QuotationService, statements (ledger-reconciling + CSV), 6 @auj/ui screens. 21 tests incl. e2e (register->approve->fund->book 49 pax with markup->statement reconciles). Next.js shell optional/pending like web-b2c

### Wave C — gated / anytime
- [x] certified-saudi-connector (SHELL) — @auj/connector-saudi v1.0.0: SaudiPartnerConnector implements SaudiConnector by mapping Maqam/Nusuk vendor payloads (client.ts SaudiPartnerClient seam) -> domain; BRNs verbatim; Nusuk-approved-hotel rule enforced on visa flow; retry resilience. Ships an offline SandboxSaudiPartnerClient so the SHARED contract-tests pass now. 11 tests. SWAP: implement a real HTTP SaudiPartnerClient when partner sandbox/credentials land (A1); select via CONNECTOR=saudi
- [x] compliance-eu — @auj/compliance v1.0.0: insolvency-protection certificate (issue+deliver, guarantee tier config 20k/50k/200k), pre-contract consent gating (assertChargeable blocks until consent), PTD 6-month refund window, GDPR (processing records, subject export, erasure). ComplianceService facade. 4 test groups
- [x] admin — @auj/admin v1.0.0: back office over the shared service packages. AdminApi oversight (list/cancel/refund bookings, visa cases, ledger entries + balances, certificate registry, GDPR export/erase), adminMetrics, 5 @auj/ui screens (Dashboard/BookingsTable/LedgerView/VisaMonitor/CompliancePanel). 5 tests incl. oversight e2e. Framework-light (Next shell optional, like web-b2b)

### Persistence (added 2026-06-13)
- [x] Postgres adapter behind the repository ports — @auj/core-booking/postgres:
  createPool/migrate (inline SCHEMA_SQL) + createPostgresStores(pool) returning the
  same Stores shape as in-memory (drop-in for createCoreBooking({ stores })). node-postgres
  + hand-written SQL (not Prisma — keeps the offline gate green; see ADR-0002).
  Pure row<->domain mappers unit-tested; full adapter exercised offline via pg-mem
  (aggregate save/reload, jsonb, upsert); real-DB integration test gated on TEST_DATABASE_URL.
- [x] web-b2c env-driven persistence — backend/in-process.ts now has createBackend():
  Postgres (createPool + migrate + createPostgresStores) when DATABASE_URL is set, else
  in-memory. Server Actions use a lazy async singleton. next.config marks pg external.
  Next app compiles + generates pages either way.

### Deployment pipeline (added 2026-06-13)
- [x] web-b2c Docker image (multi-stage monorepo -> Next standalone); .dockerignore
- [x] infra/docker-compose.yml (web + postgres/redis/minio, datastores bound to 127.0.0.1)
- [x] CI workflow (lint/typecheck/test/build + docker build verify) + Deploy workflow (tag -> GHCR push -> SSH deploy, guarded on secrets)
- [x] infra/deploy.sh + infra/.env.example + infra/README.md runbook (tunnel guidance, rollback)
- NOTE: standalone next build needs Linux symlinks (works in Docker/CI); local Windows build hits EPERM on the final symlink-copy only (app compiles fine). Docker build + remote deploy not executed here (no Docker/gh locally).

## In progress
- Wave B: web-b2c (runnable) + web-b2b (framework-light) done. Optional web-b2b Next shell; Wave C next.

## DB / infra (answered 2026-06-13)
- DB = PostgreSQL. Real adapter now exists at @auj/core-booking/postgres (node-postgres). In-memory remains the default until an app wires DATABASE_URL. To use it: createPool -> migrate -> createCoreBooking({ stores: createPostgresStores(pool) }). Verify against a DB: `TEST_DATABASE_URL=postgresql://auj:auj@localhost:5432/auj pnpm --filter @auj/core-booking test`.
- IONOS server 212.227.54.250: direct SSH check was blocked by the "only through tunnel" guardrail. To use the DB: open an SSH tunnel `ssh -N -L 5432:localhost:5432 root@212.227.54.250`, keep Postgres bound to 127.0.0.1 on the server, set DATABASE_URL=postgresql://USER:PASS@localhost:5432/auj. Do NOT expose 5432 publicly.

## Notes / how to run
- `npm run dev` (root) -> turbo builds web-b2c deps then `next dev` at http://localhost:3000.
- `npm run dev:all` runs every package's dev (needs --concurrency=15, already set).
- web-b2c gate build is `tsc -p tsconfig.build.json` (fast); the Next app build is `build:next`.

## Next up (top 3)
1. Wave B: web-b2b — agent portal (wallet/credit, multi-pax <=49, markups, quotations, statements), same framework-light-then-shell approach.
2. Wave C anytime: compliance-eu; connector-saudi when partner access lands.
3. Optional: drive <html lang/dir> from a locale route in web-b2c; add real photography/icons per the design handoff.

## Blockers / waiting on
- Saudi Maqam access: PENDING (partner TBD). Does NOT block Wave A/B — build on the mock.

## Open assumptions (full list in docs/assumptions.md)
- Maqam payload shapes are mocked; real shapes come from partner sandbox in Wave C.
- e-visa eligible nationality list is config-driven; verify against the current Saudi list.
- PKR payment gateway = TBD; validate acquiring early.

## First launchable milestone
General-travel slice (connector-travel + core-booking + payments + web-b2c) — zero Saudi dependency.
