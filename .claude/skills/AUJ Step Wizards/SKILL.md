---
name: AUJ Step Wizards
description: "The step-by-step video wizards (Airport, Luggage, Makka Ziyarat, Madina Ziyarat) — one shared StepVideoWizard shell, DB-backed steps + per-pilgrim clips, admin step CRUD."
---

# AUJ Step Wizards

## What it is
One-screen-per-step companions: the **Airport** journey (check-in → immigration → transfer), the
**Luggage** packing & customs guide (allowed / declare / prohibited), and the **Makkah** & **Madinah
Ziyarat** sacred-sites walkthroughs. Free, no-login, mobile-first, multilingual (EN/AR/UR/TR/DE + LT, RTL).

## Source prototypes (in this folder)
`AUJ Airport Wizard.dc.html` · `AUJ Luggage Wizard.dc.html` · `AUJ Makka Ziyarat Wizard.dc.html` ·
`AUJ Madina Ziyarat Wizard.dc.html`

## Where the logic lives (one shared shell)
- **Routes:** `apps/web/app/guide/<slug>/page.tsx` → slug ∈ airport · luggage · makkah-ziyarat · madina-ziyarat (renders `WizardScreen`)
- **Shell:** `apps/web/src/ritual/WizardScreen.tsx` (server loader) → `StepVideoWizard.tsx` (client)
- **Seed steps + types:** `apps/web/src/ritual/wizard-steps.ts` (`WIZARDS`, `WIZARD_SLUGS`) + `wizard-steps-types.ts` (`WizStep`: short, label, localized text, items, tip, videoUrl) + `wizard-steps-i18n.ts` (LT/TR overlay)
- **Step store:** `apps/web/src/ritual/wizard-store.ts` — `ritual_steps` (Postgres + in-memory), `getWizard` / `setWizard`
- **Per-pilgrim clips:** `apps/web/src/ritual/step-video-store.ts` + `step-video-actions.ts` — `pilgrim_step_videos` (account-scoped, no localStorage)
- **Admin step CRUD:** `/admin/wizards` → `src/admin/WizardsAdmin.tsx` + `src/ritual/wizard-admin-actions.ts` (add/edit/configure/reorder/delete steps + items)

## Design
Cinematic `ScreenFrame` chrome, a step rail with done/active states, a per-step media panel, item
chips with `ok / permit / prohibited` status (Luggage), a tip, and an optional per-step video.
`@auj/ui` tokens only; RTL; design-taste motion ≤300ms, focus rings, 44px targets.

## Data & backend
Steps seeded from `wizard-steps.ts` into `ritual_steps`, editable at `/admin/wizards`. Personal clips
(YouTube/Vimeo/MP4 link) persist per signed-in user in `pilgrim_step_videos` — the public wizard is
identical for everyone. No localStorage.

## Acceptance criteria
- [ ] Each `/guide/<slug>` renders the shared StepVideoWizard with the prototype's steps/items.
- [ ] Signed-in pilgrim can attach/replace/remove a per-step clip; anonymous sees the shared steps.
- [ ] Admin can CRUD steps at `/admin/wizards`; multilingual + RTL; ScreenFrame + tokens only.

## Status
Live and matching the prototypes. Gaps: Ziyarat bodies are EN/AR-first (UR/DE pending for some sites);
real per-step videos are placeholders until clips are added.
