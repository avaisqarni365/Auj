# 11 · Virtual Tour & ritual wizards (Airport, Luggage, Makka/Madina Ziyarat)

**Prototypes:** `AUJ Virtual Tour.dc.html`, `AUJ Airport Wizard`, `AUJ Luggage Wizard`,
`AUJ Makka/Madina Ziyarat Wizard.dc.html`
**Target:** `apps/web/app/guide/<slug>/` + `apps/web/src/ritual/`
**Wave:** B

## What they are
Step wizards with a video/scene panel + bilingual (EN + Arabic, others) instruction side. Per-step
**video link/upload** (YouTube/Vimeo/MP4). Ziyarat wizards list all sites (Makkah 16, Madinah 14);
Luggage = Saudi customs rules (allowed/declare/prohibited); Airport = check-in→hotel.

## Port map
- Build **one reusable `<StepVideoWizard>`** (rail + media panel + bilingual text + per-step controls).
- Step content (title/body/items/tip, EN+AR) → DB seed (localised); video embeds parsed by a `parseEmbed` util.
- Per-step user video → `DocumentStore` (upload) or a stored URL; localStorage keys (`auj-*-vids`) → offline cache.

## DB integration (see 00b-db-conventions.md)
- `ritual_steps (id, wizard, idx, kind, title_en, title_ar, body_en, body_ar, items JSONB, tip, video_url, sort)`
  via `RitualRepository` (+ `listByWizard`), seeded from each prototype.
- `pilgrim_step_videos (id, pilgrim_id, wizard, step_idx, url|blob_key, created_at)` for user-added clips.
- Localised text columns; RTL for AR/UR.

## Command
```
Implement the Virtual Tour + Airport/Luggage/Makka/Madina Ziyarat wizards from their .dc.html refs at
app/guide/<slug>, using ONE shared <StepVideoWizard> (rail + media panel + EN/AR instruction side +
per-step video link/upload, parseEmbed for YouTube/Vimeo/MP4).
DB: ritual_steps (localised content, seeded per wizard) + pilgrim_step_videos (user clips →
  DocumentStore or URL) — SCHEMA_SQL, adapters, repo tests. Keep auj-*-vids localStorage as offline cache.
UI: packages/ui + tokens.css, RTL verified, 44px controls. Pass: typecheck, lint, unit, e2e-mock.
Summarize; update sessions/.
```

## Acceptance
- [ ] One wizard component powers all five; steps seeded from DB (localised).
- [ ] Per-step video link/upload persists; RTL Arabic side correct.
