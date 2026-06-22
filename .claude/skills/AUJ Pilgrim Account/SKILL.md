---
name: AUJ Pilgrim Account
description: "The signed-in pilgrim's account surfaces — Dashboard (booking progress, passport OCR, deposit), Profile (details, preferences, history) and the personal wizard hub."
---

# AUJ Pilgrim Account

## What it is
The account-gated home for a signed-in pilgrim: a **Dashboard** (greeting, booking-progress, passport
scan + OCR, deposit), an editable **Profile** (details, loyalty tier, preferences, pilgrimage history),
and a **wizard hub** to manage their personal videos/preferences. All data is DB-backed per user.

## Source prototypes (in this folder)
`AUJ Pilgrim Dashboard.dc.html` · `AUJ Pilgrim Profile.dc.html`

## Where the logic lives
- **Dashboard** → route `/journey/dashboard` · `apps/web/src/journey/PilgrimDashboard.tsx` · store `journey/dashboard-store.ts` (`dashboard_members`, `passport_scans`); passport MRZ OCR; real Stripe deposit (`startDepositAction`/`finalizeDepositAction`); passport images via the object store at `/api/doc/[...key]`; visa pill from `@auj/visa-router`
- **Profile** → route `/journey/profile` · `apps/web/src/journey/ProfileEditor.tsx` · store `journey/profile-store.ts` (`pilgrim_profiles` jsonb) + `profile-actions.ts`; preferences chips + pilgrimage-history timeline
- **Wizard hub** → route `/journey/wizards` · `apps/web/src/journey/PilgrimWizardsHub.tsx` · aggregates `tour-video-store` + `step-video-store` + `profile-store` (their preferences + personal tour/wizard clips)

## Design
Cinematic cover header (green gradient) + `@auj/ui` tokens; member switcher (Me/Family/Group),
progress chips, editable cards, tools grid; design-taste motion ≤300ms, focus rings, 44px targets; RTL.

## Data & backend
Everything is per-user Postgres (in-memory fallback) — never localStorage. Consumes booking + payments
via their interfaces; no direct SaudiConnector. Deposit goes through real Stripe.

## Acceptance criteria
- [ ] `/journey/dashboard` shows progress + passport OCR + Stripe deposit; multi-member.
- [ ] `/journey/profile` edits details + preferences + history; persists per user.
- [ ] `/journey/wizards` lists & removes the pilgrim's personal clips + shows preferences.

## Status
Live and matching/exceeding the prototypes (DB + real OCR + real Stripe replace the prototypes'
localStorage/demo). Profile progress stages are partly placeholder until wired to live booking state.
