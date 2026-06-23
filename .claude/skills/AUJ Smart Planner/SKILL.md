---
name: AUJ Smart Planner
description: "Build the Smart Visit planner — a calm split-panel, seven-step configurator (Origin → Journey → Dates → Travellers → Stay → Visa → Review) that shapes a visa-ready plan and opens the matching packages."
---

# AUJ Smart Planner — seven-step visit configurator

## What it is
A calm, split-panel lead/intent wizard that shapes a complete, visa-ready pilgrimage in **seven
steps**: Origin → Journey (Umrah/Hajj/Ziyarat) → Dates → Travellers → Stay → Visa route → Review.
A dark-green aside holds the logo, title and a clickable step rail; the form panel shows a progress
bar, the active step and footer nav. The visa step previews the right channel (e-Visa vs licensed
agent vs mixed). The Review step ends in "See N packages", handing off to the `/book` funnel. This is
intent capture, NOT a paid booking. No login required.

## Source prototype
`AUJ Smart Planner.dc.html` (in this folder).

## Route & files
- Route: `/plan` (public) — `apps/web/app/plan/page.tsx` (also surfaced from the landing "Continue in Smart Planner" CTA)
- Component: `apps/web/src/components/SmartPlanner.tsx` (client); pure derivations (IATA code, visa-route preview, `/book` href) in `components/smart-planner-derive.ts` (+ tests)
- Supporting: `apps/web/src/components/Combobox.tsx`, `SendInquiryPanel.tsx`, `BrandMark.tsx`; geo in `apps/web/src/geo/airports.ts`; lead types in `apps/web/src/leads/inquiry.ts`
- Lead store/actions: `apps/web/src/leads/store.ts` · `actions.ts` (used when an inquiry is sent)

## Design
Split-panel card per the prototype: dark-green aside (gradient, ambient stars/crescent, mini skyline,
7-step rail) + white form panel with a top progress bar. `@auj/ui` tokens — green/sand/accent/gold,
IBM Plex Serif step questions, mono for the STEP n/7 eyebrow. Airline-style `Combobox` pickers,
+/- steppers and chips at 44px with `aria-pressed` + focus rings. Step transition uses an origin-aware
rise ≤300ms (prototype's `.45s` slide is trimmed to taste), `prefers-reduced-motion` honoured, AA
contrast. RTL + EN/LT/UR/AR; rail/question copy localises.

## Data & backend
Step options (countries/airports, journeys, distance/star/board, visa-route logic) are **static** —
airports from `geo/airports.ts`, visa route derived in-component from the group's passports (no
network; this mirrors the visa-router's intent). The only persisted thing is a **lead/inquiry**, sent
via `leads/actions.ts` → `leads/store.ts` (**Postgres + in-memory fallback**) when the pilgrim submits
to the AUJ team. No `localStorage` for plan data; the in-progress plan is component state.

## Acceptance criteria
- [ ] `/plan` works with no login; all 7 steps render, rail dots reflect done/active, back/next + rail jumps work.
- [ ] Progress bar tracks step n/7; Combobox/steppers/chips drive the plan state; flexible-dates toggle works.
- [ ] Visa step shows the correct route preview (EU e-Visa / agent channel / mixed) from the chosen passports.
- [ ] Review summarises every field; the final CTA reads "See N packages" and hands off to `/book`.
- [ ] No `localStorage` for plan data; a submitted inquiry persists via the DB-backed lead store.
- [ ] design-taste pass: motion ≤300ms, focus rings, 44px targets, mono eyebrow; EN/LT/UR/AR + RTL; typecheck/lint/unit green.

## Status
Live page matches the prototype's split-panel design and seven-step flow under the AUJ chrome: the
dark-green rail aside, progress bar, per-step inputs and Review→packages handoff are implemented in
`SmartPlanner.tsx`. It is integrated beyond the static prototype — real country/airport data, the
visa-route preview and a DB-backed inquiry hand-off. No structural redesign needed; the prototype's
top-level tab bar (Smart planner / Search / Umrah Guide / Virtual tour) lives at the landing/nav
level here rather than inside this component.

i18n: `SmartPlanner.tsx` is wired to next-intl (`useTranslations('smartPlanner')`) with EN/LT/UR/AR
catalogs in `messages/*.json`; RTL is inherited from the locale-driven `<html dir>`. Canonical option
values stay English in state (so visa-route logic, summary and the `/book` hand-off are stable) and
only the display is translated. LT/UR/AR are machine-drafted pending native review (see assumptions A12).
