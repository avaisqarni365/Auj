---
name: AUJ Companion Guides
description: "The seven on-the-ground companion guides (Food, Gifts, Helpline, Hospitals, Laundry, Transport, Connectivity) — one shared GuideWizard shell, DB-backed & admin-editable."
---

# AUJ Companion Guides

## What it is
Calm, browsable on-the-ground directories for pilgrims in Makkah & Madinah (and Jeddah for Gifts):
where to eat, what to bring home, who to call in an emergency, where to get medical help, laundry,
how to get around, and how to stay connected. Free, no-login, mobile-first, multilingual.

## Source prototypes (in this folder)
`AUJ Food Guide.dc.html` · `AUJ Gifts Guide.dc.html` · `AUJ Helpline Guide.dc.html` ·
`AUJ Hospitals Guide.dc.html` · `AUJ Laundry Guide.dc.html` · `AUJ Transport Guide.dc.html`
(Connectivity has no loose prototype but ships as a guide too.)

## Where the logic lives (one shared shell)
- **Routes:** `apps/web/app/guide/<slug>/page.tsx` → `<slug>` ∈ food · gifts · helpline · hospitals · laundry · transport · connectivity
- **Shell:** `apps/web/src/companion/GuideScreen.tsx` (server loader) → `GuideWizard.tsx` (client)
- **Seed content + types:** `apps/web/src/companion/guide-data.ts` (`GUIDES`, `GUIDE_SLUGS`, `GuideCity` makkah/madinah/jeddah)
- **Store:** `apps/web/src/companion/guide-store.ts` — `guide_entries` (Postgres + in-memory), seeded idempotently per (guide, city); `getGuide` / `setGuide`
- **Admin CRUD:** `/admin/guides` → `src/admin/GuidesAdmin.tsx` + `src/companion/guide-admin-actions.ts` (item add/edit/reorder/delete per city→category)
- **i18n overlay:** `apps/web/src/companion/guide-i18n.ts` (LT/TR)

## Design
Cinematic `ScreenFrame` chrome (`@auj/ui` green/sand/accent/gold tokens, serif/mono), a city toggle,
a numbered category rail, and a card list per category (name · note · tag · mark). RTL-safe;
design-taste motion ≤300ms, focus rings, 44px targets.

## Data & backend
Category structure/headings come from the seed (`guide-data.ts`); the editable **items** are persisted
in `guide_entries` and managed at `/admin/guides`. No localStorage — content is shared/identical for
everyone.

## Acceptance criteria
- [ ] All seven `/guide/<slug>` routes render via the shared GuideWizard with the prototype's content.
- [ ] City toggle + category rail + card list; multilingual + RTL; ScreenFrame + tokens only.
- [ ] Admin can add/edit/reorder/delete items at `/admin/guides`; persists to `guide_entries`.

## Status
Live and matching the prototypes; DB-backed and admin-editable (beyond the static prototypes). Minor:
the live language overlay is EN/LT/TR (not the EN/LT/UR/AR set named elsewhere) — extend if needed.
