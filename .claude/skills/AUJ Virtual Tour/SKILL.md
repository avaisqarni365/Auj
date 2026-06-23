---
name: AUJ Virtual Tour
description: "The /guide/tour cinematic scene-by-scene walk-through of the Umrah journey — Miqat & Ihram → Masjid al-Haram entrance → the Kaaba & Tawaf → Maqam Ibrahim → Zamzam → Safa & Marwah → … — each scene a pannable panorama + an optional walkthrough video, a localized title/subtitle/description, a Listen/narration button and a Du'a panel. Shared & identical for everyone when anonymous; a signed-in pilgrim adds their own per-scene video that plays in the main frame. Free, no-login to view; multilingual EN/AR/UR/TR/DE with RTL; videos DB-backed per user (no localStorage)."
---

# AUJ Virtual Tour — scene-by-scene journey walk-through

## What it is
A calm, cinematic tour of the Umrah journey, one scene at a time: a panorama photo + an optional
walkthrough video, a localized title/subtitle/description, a Listen/narration button, a Du'a panel, and
a numbered scene selector. It is the visual companion to the Umrah Guide — not a performed-ritual flow
and not the /book funnel. Two surfaces, one component: **anonymous** users see a tour that is identical
for everyone (shared photo + walkthrough); a **signed-in pilgrim** can attach a personal per-scene
video that plays in the main frame in place of the shared walkthrough.

## Source prototype
`migration/Files/AUJ Virtual Tour.dc.html` (mirrored here). A tab row (Smart planner / Search /
Umrah Guide / **Virtual tour**), a language switcher, a numbered stepper, and a split "virtual screen":
left = video side (uploaded clip / YouTube-Vimeo iframe / virtual-walk poster with play), right = the
station card with Arabic + chosen-language text, a Listen button, and a Du'a toggle. The prototype's
per-step localStorage clip cache is replaced by a DB-backed per-user store.

## Route & files
- Route: `apps/web/app/guide/tour/page.tsx` (public; loads content overrides + per-user videos).
- Component: `apps/web/src/ritual/tour/VirtualTour.tsx` (client).
- Scenes: `apps/web/src/ritual/tour/scenes.ts` (`SCENE_SEED`, `resolveScenes(defs,lang)`, `tourScenes(lang)`, `tourChrome(lang)`; EN/AR/UR/TR/DE).
- Panorama: `apps/web/src/ritual/tour/PanoramaViewer.tsx`; narration: `ritual/ListenButton.tsx`.
- Store/actions: `tour/tour-video-store.ts` + `tour/tour-video-actions.ts`.
- **Scene CRUD (DB-backed, multilingual):** `apps/web/src/ritual/tour/tour-scene-store.ts` (Postgres `tour_scenes` jsonb-per-id + in-memory fallback, seeded from `SCENE_SEED`), `tour/tour-scene-admin-actions.ts` (ADMIN-gated list/save), UI `apps/web/src/admin/TourScenesAdmin.tsx`, route `apps/web/app/admin/tour/page.tsx`. The public page now passes `sceneDefs` (from `getTourSceneStore()`) into `VirtualTour`, which builds scenes via `resolveScenes`. Admin edits scene id/image + title/subtitle/desc per language (EN/AR/UR/TR/DE), add/delete/reorder.
- Admin copy overrides (ritual step text, separate concern): `ritual/content-store.ts` via `tour:<sceneId>` keys.

## Design
Cinematic `ScreenFrame` from `@auj/ui` with green/sand/accent tokens — no raw hex. Blurred panorama
backdrop behind the active video, a centred play control with a ripple ring, a numbered scene rail, and
the station card showing the Arabic text verbatim alongside the chosen language. Multilingual
EN/AR/UR/TR/DE via the `RITUAL_LOCALES` switcher; `dir="rtl"` + `font-arabic` for AR/UR, chrome stays
LTR. Design-taste: ≤300ms transform/opacity transitions (`duration-fast`), origin-aware scene change,
`shadow-focus` rings, 44px targets, `prefers-reduced-motion` honoured (the ken-burns/ripple animations
disable).

## Data & backend
Scenes are static data in `scenes.ts` (localized, with CDN-overridable `NEXT_PUBLIC_IMG_BASE` asset
paths and a Makkah/Madinah fallback image). Admin copy overrides come from the DB-backed content store
(`content-store.ts`, Postgres + in-memory fallback) keyed `tour:<sceneId>`. Per-user videos persist in
`tour-video-store.ts` (one clip per user per scene; Postgres when `DATABASE_URL` is set, in-memory
otherwise). **No localStorage.** No `SaudiConnector` call.

## Personalization
The tour is **shared by default, personal when signed in**. A signed-in pilgrim pastes a per-scene video
link (YouTube/Vimeo/MP4, validated via `parseEmbed`) that plays in the main frame with Replace/Remove,
saved through `tour-video-actions.ts` to `tour-video-store.ts`. Each pilgrim sees only their own clips;
anonymous viewers get the shared walkthrough plus a "Sign in to add your own video →
/login?next=/guide/tour" hint. (This is the same DB-backed model documented in the umrah-ritual-wizard
SKILL's Virtual Tour section.)

## Acceptance criteria
- [ ] `/guide/tour` renders the scene catalog in order; public, no login to view; scene rail + prev/next work.
- [ ] Each scene shows panorama + walkthrough (or placeholder), localized title/subtitle/description, Listen, and a Du'a panel.
- [ ] EN/AR/UR/TR/DE switch live with correct RTL; the Arabic text shows verbatim regardless of UI locale.
- [ ] Anonymous = identical shared tour + sign-in hint; signed-in = personal per-scene video plays in the main frame, Replace/Remove, persists across reload (DB-backed); no localStorage.
- [ ] Admin `tour:<id>` copy overrides apply; design-taste checklist passes (motion ≤300ms, focus, 44px, reduced-motion); typecheck/lint/unit/e2e-mock green.

## Status
Live and matches the prototype's intent. The route, scene-by-scene viewer, EN/AR/UR/TR/DE localization
+ RTL, Listen/narration, Du'a panel, admin copy overrides, and the shared-vs-personal video model
(DB-backed per user) all ship. Improvement over the prototype: personal clips are account-scoped in
Postgres rather than localStorage, and copy is admin-editable. Tested: scene localization + EN-fallback
+ src/narration paths (`scenes.test.ts`) and per-user clip scoping (`tour-video-store.test.ts` — no
cross-account leak). Left: real panorama photos + walkthrough videos per scene to be supplied
(placeholders/fallbacks until then); the prototype's voice-recorder is a separate later add-on using the
DB-backed `recordings-store`/`RecordingPanel`, not localStorage.
