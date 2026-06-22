---
name: AUJ Landing Cinematic
description: "Build the AUJ Landing — the cinematic, frame-by-frame public home at /. It is the design source of truth for the whole product: a dark-green/gold/sand world in IBM Plex Serif/Sans/Mono, scene-backed sections that reveal on scroll, a multi-mode search/quick-launcher (Umrah/Hajj/Hotels/Flights), this-week's connector-backed deals, an 'in your language' preview (EN/LT/UR/AR + RTL), packages, trust/testimonials, payments, FAQ and footer. Deals come from the TravelSupplier/Saudi connector seam; editable copy comes from the DB CMS (admin/umrah-content). Multilingual, mobile-first, no login. Use when building/refining the landing or the shared cinematic frame."
---

# AUJ Landing — the cinematic frame-by-frame home

## What it is
The public home page and the **design source of truth** for AUJ: a calm, cinematic, scroll-revealed
sequence of scene-backed sections that sells both the pilgrimage and general-travel legs and launches
the pilgrim into search, packages, deals, the planner, the Umrah Guide and the tour. It establishes
the visual language (`ScreenFrame`, scenes, tokens, motion) that every other screen reuses. Public,
no login, multilingual (EN/LT/UR/AR + RTL), mobile-first.

## Source prototype
`AUJ Landing Cinematic.dc.html` — the full long-scroll landing: hero with stats + a multi-tab
search/quick-launcher (Umrah/Hajj/Hotels/Flights), trust marquee, journey types, destinations,
this-week's deals (deal-of-the-day featured + grid), value props, package cards, an "in your
language" locale preview, departures grid, testimonials, payment methods, support channels, FAQ and
footer. Dark-green→deep-green gradients, gold accent, sand surfaces, IBM Plex type, reduced-motion
guard.

## Route & files
- Live route: `/` (public; `apps/web/app/page.tsx` renders the `Landing` client component, injecting
  connector deals + DB CMS overrides server-side).
- Component: `apps/web/src/Landing.tsx` (client) with `Section`, `Scene`, `HeroBackdrop`,
  `SiteHeader`/`SiteFooter`, `AnnouncementBar`, `ScreenFrame`, `BrandMark`.
- Content/catalog: `apps/web/src/content.ts` (DEALS, PACKAGES, DESTINATIONS, JOURNEY_TYPES,
  LANDING_FRAMES, HERO_STATS, FAQS, TESTIMONIALS, SEARCH_TABS, LOCALES, …), `landing-data.ts`.
- Editable copy (CMS): `landing-content.ts` (`landingCopy`, `LandingOverrides`),
  `landing-content-store.ts` (Postgres `landing_content` table, in-memory fallback),
  `landing-content-actions.ts`; admin editor at `/admin/umrah-content`.
- i18n: `messages/{en,lt,ur,ar}.json` via `next-intl` (`useTranslations('landing'|'common')`).
- Tokens/motion: `@auj/ui` (`tokens.css`, `motion.css`, `preset.ts`); tests `Landing.test.tsx`.

## Design
This **is** the cinematic frame — every other AUJ screen borrows its language. `@auj/ui` tokens
only: green-800/green-950 gradients, gold accent, sand surfaces, IBM Plex Serif (display) / Sans
(body) / Mono (labels & numerals). Full-bleed `Scene` imagery with gradient scrims for legible text;
sections reveal on scroll (`animate-rise`) and honour `prefers-reduced-motion`. Tight type scale,
44px targets, AA contrast, RTL verified for AR/UR. Motion ≤300ms transform/opacity, origin-aware —
run the design-taste checklist before finishing.

## Data & backend
- **Deals** are injected from the **connector-interface seam** (TravelSupplier / SaudiConnector via
  the booking layer), passed in as the `deals` prop; the page **never imports a concrete connector**.
  Mock-backed by default, so the landing renders fully offline; static `DEALS` are the fallback.
- **Editable copy** comes from the **DB CMS**: `landing-content-store` (Postgres `landing_content`,
  in-memory fallback) → `landingCopy(key, locale, fallback, overrides)`, which falls back i18n → EN →
  catalog. Edited at `/admin/umrah-content`.
- The hero/visa hint reuses the pure `@auj/visa-router` (`routeFor`) — no network. No login required.

## Acceptance criteria
- [ ] `/` renders the full cinematic long-scroll: hero + multi-tab search, deals, packages,
      destinations, value props, locale preview, testimonials, payments, FAQ, footer.
- [ ] Deals come from the injected connector-seam `deals` prop (mock default) with static fallback;
      no concrete connector imported.
- [ ] Editable copy resolves through the DB CMS overrides → i18n → EN → catalog chain.
- [ ] EN/LT/UR/AR parity; RTL correct for AR/UR; mobile-first; no login required.
- [ ] Scenes reveal on scroll and respect `prefers-reduced-motion`; `@auj/ui` tokens only.
- [ ] design-taste checklist passes; typecheck/lint/unit (`Landing.test.tsx`)/e2e-mock green.

## Status
**Live** at `/` — `Landing.tsx` with all sections wired to connector deals + the DB CMS and
multilingual via `next-intl`. It is the in-production design source of truth; matches the prototype.
