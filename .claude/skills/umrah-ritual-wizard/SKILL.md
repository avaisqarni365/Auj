---
name: umrah-ritual-wizard
description: "Build the AUJ 'Umrah Guide' — a separate, step-by-step GUIDED RITUAL wizard that walks a pilgrim through actually PERFORMING Umrah (Ihram → Niyyah → Talbiyah → Tawaf ×7 → 2 Rak'ahs → Zamzam → Sa'i ×7 → hair-cutting → complete), with one instruction at a time, a per-step approximate-time badge + a live elapsed timer, checklists, Arabic duas (text + optional audio), Tawaf/Sa'i counters, and an optional Ziyarat guide for Makkah & Madinah. This is NOT the Smart Visit lead wizard and NOT the /book funnel — it is a free, no-login, mobile-first ritual companion that can live on the landing page and in the pilgrim account. Multilingual EN/LT/UR/AR + RTL; Arabic dua text is shown verbatim. Use when building the ritual walkthrough."
---

# Umrah Guide — step-by-step ritual wizard

## The idea (read first)
A first-time pilgrim opens this and is **guided through performing Umrah, one instruction at a time**.
It thinks from the *pilgrim's journey* (what do I do now?), not a textbook. Every screen answers a
simple question or gives one clear action, shows **approximately how long this step takes**, keeps a
**running elapsed timer** once the ritual starts, offers **checklists** to tick, shows the **dua**
(Arabic + transliteration + translation, optional audio), and advances on a single big button.

Hard boundaries:
- **Separate from** `smart-visit-planner` (lead capture) and `/book` (paid booking). No payment, **no login
  required**. No `SaudiConnector` call.
- It is **guidance/education**, so it carries a **disclaimer** and its religious content must be
  **reviewed by a qualified scholar** before launch (see "Religious accuracy" below). Do not present it
  as a fatwa; link to the pilgrim's group scholar / official sources.
- Progress is **resumable** — the ritual spans hours and the pilgrim will lock their phone. Persist to
  `localStorage` (and optionally to the account if logged in). Never lose a half-finished Tawaf count.

Two surfaces, one component:
- **Landing page** — a distinct "Umrah Guide — step by step" entry, separate from the Smart Visit planner.
  Starts anonymously.
- **Pilgrim account** (`/journey` companion) — same wizard to resume on the ground.

Route: `/guide` (public). Component: `apps/web/src/ritual/UmrahRitualWizard.tsx` (client). Content/data:
`apps/web/src/ritual/ritual-content.ts`. Images: see "Image manifest" — drop files in
`apps/web/public/img/ritual/`.

---

## The flow — 15 screens (one action per screen)
Each step in `ritual-content.ts` is a `RitualStep` with: `key`, `phase`, `title`, `approxMin` (number |
"ongoing" | null), `instructions` (string[]), optional `checklist` (string[]), optional `dua`
(`{ arabic, translit, translation, source, audio? }`), optional `counter` (`{ kind: 'tawaf' | 'sai',
total: 7 }`), `image` (manifest key), and `next` label.

The header shows: **phase name**, a **progress bar** (step n / 15), a **per-step time badge**
("≈ 30–45 min" / "Recite continuously" / no badge), and once started a **live elapsed timer** + a rough
**"time to complete" remaining** estimate (sum of remaining `approxMin` midpoints). Honour
`prefers-reduced-motion`; the timer pauses on a "Pause" control and survives reload.

### Phase 1 — Before travel
1. **Welcome** — what this guide is + the disclaimer + "Begin". `approxMin: null`. image `welcome`.
2. **Travel information** — simple inputs (departure country, arrival airport, travel date, hotel,
   group/individual). Reuse `wizard-data.ts` COUNTRIES/airports. `approxMin: 2`. image `travel`.
   → leads into explaining Miqat.
3. **Miqat** — explain the Miqat boundary; let them pick which Miqat they cross (e.g. Dhul-Hulayfah,
   Yalamlam, Juhfah, Qarn al-Manazil, Dhat Irq) or "from Jeddah/within". Note: enter Ihram **before**
   crossing. `approxMin: 3` (read). image `miqat`.

### Phase 2 — Entering Ihram
4. **Prepare for Ihram** — split guidance:
   - **Men:** Ghusl (ritual bath) · two white unstitched cloths · no stitched clothing · no head cover.
   - **Women:** normal modest dress · no face veil touching the face · no gloves.
   Checklist: ☐ Performed Ghusl ☐ Wearing Ihram ☐ Ready for Niyyah. `approxMin: 20`. image `ihram`.
5. **Niyyah (intention)** — at/just before Miqat. Dua: `Labbayka Allahumma Umrah` (لَبَّيْكَ اللّٰهُمَّ عُمْرَة).
   Button: "✅ I have made my intention". `approxMin: 1`. image `niyyah`.
6. **Talbiyah** — show full text; "recite continuously until you reach Masjid al-Haram".
   `approxMin: "ongoing"`. Optional audio loop. image `talbiyah`.
   ```
   Labbayka Allahumma Labbayk · Labbayka La Sharika Laka Labbayk
   Innal-Hamda Wan-Ni'mata Laka Wal-Mulk · La Sharika Lak
   ```

### Phase 3 — Arrival in Makkah
7. **Enter Masjid al-Haram & first sight of the Kaaba** — checklist: ☐ Enter mosque (right foot, entry
   dua) ☐ First sight of the Kaaba ☐ Make personal dua (a moment when dua is accepted). Emotional
   full-bleed Kaaba image. `approxMin: null`. image `kaaba-arrival`.

### Phase 4 — Tawaf
8. **Tawaf — 7 circuits** — start at the **Black Stone (Hajar al-Aswad)** corner, go **anti-clockwise**.
   **Counter** (`kind: 'tawaf', total: 7`): big "+1 round" button, round dots Round 1…7, manual by
   default with an **optional location assist** (toggle; never required, never blocks). Men: *idtiba'* &
   *raml* in first 3 rounds (explain). `approxMin: 40` (varies with crowd — say so). image `tawaf`.
9. **Pray 2 Rak'ahs** — behind **Maqam Ibrahim** if possible, else anywhere. Recommended surahs
   (al-Kafirun, al-Ikhlas). Checklist: ☐ Completed 2 Rak'ahs. `approxMin: 5`. image `maqam-ibrahim`.
10. **Drink Zamzam** — drink, face the Qibla, make dua. Checklist: ☐ Drank Zamzam ☐ Made dua.
    `approxMin: 5`. image `zamzam`.

### Phase 5 — Sa'i
11. **Go to Safa** — recite Qur'an 2:158 (Safa & Marwah are among the symbols of Allah) on approaching.
    Checklist: ☐ Reached Safa. `approxMin: 2`. image `safa`.
12. **Sa'i — 7 passages** — **Counter** (`kind: 'sai', total: 7`) Safa→Marwah = 1, Marwah→Safa = 2 …
    finishing at Marwah on 7. Progress bar 0→100%. Men jog between the green markers (explain).
    `approxMin: 35`. image `sai`.

### Phase 6 — Complete Umrah
13. **Hair-cutting (Halq/Taqsir)** — Men: shave (preferred) or trim evenly. Women: cut a fingertip's
    length from the end of the hair. Checklist: ☐ Hair cut completed. `approxMin: 10`. image `halq`.
14. **Umrah complete** — 🎉 congratulations screen: total time taken (from the timer), date completed,
    a place for **personal notes**, a closing dua, and **"Save / share my completion"** (download a
    simple certificate; optionally save to the account). image `complete`.
15. **Ziyarat guide** (optional module, entered from the complete screen) — see below. image `ziyarat`.

---

## Optional Ziyarat module
A grid of notable places with a short note, etiquette, and an image each. Tapping one opens a detail
card (history + dua/etiquette). Group by city. **Makkah:** Kaaba, Maqam Ibrahim, Hateem, Multazam, Safa,
Marwah, Jabal al-Noor (Cave Hira), Jabal Thawr, Mina, Muzdalifah, Arafat. **Madinah:** Masjid an-Nabawi,
Rawdah (note: permit via the **Nusuk app** — we guide, we don't issue), Green Dome, Jannat al-Baqi,
Masjid Quba, Masjid Qiblatain, Mount Uhud, Martyrs of Uhud. Reuse the existing ziyarah catalog where it
overlaps; this module is presentational.

---

## Image manifest — WHERE TO PUT IMAGES
**Drop your images here:** `apps/web/public/img/ritual/` (and `…/ritual/ziyarat/makkah|madinah/` for the
Ziyarat places). They are served at `/img/ritual/<file>`. A manifest `ritual-images.ts` maps each
screen → file (mirrors `scenes.ts`, including the `NEXT_PUBLIC_IMG_BASE` CDN override). **If a file is
missing, the screen falls back to the existing `makkah`/`madinah` scene art** so nothing renders broken.

Recommended files (web-optimised **.webp or .jpg**, landscape ~1600×900 for screen heroes, ~800×600 for
Ziyarat cards; keep each < ~300 KB; **must be licensed for commercial use** — see note):

| Screen | File to drop |
|---|---|
| Welcome | `img/ritual/welcome.webp` |
| Travel information | `img/ritual/travel.webp` |
| Miqat | `img/ritual/miqat.webp` |
| Ihram | `img/ritual/ihram.webp` |
| Niyyah | `img/ritual/niyyah.webp` |
| Talbiyah | `img/ritual/talbiyah.webp` |
| Arrival at the Kaaba | `img/ritual/kaaba-arrival.webp` |
| Tawaf | `img/ritual/tawaf.webp` |
| Two Rak'ahs (Maqam Ibrahim) | `img/ritual/maqam-ibrahim.webp` |
| Zamzam | `img/ritual/zamzam.webp` |
| Safa | `img/ritual/safa.webp` |
| Sa'i | `img/ritual/sai.webp` |
| Hair-cutting | `img/ritual/halq.webp` |
| Umrah complete | `img/ritual/complete.webp` |
| Ziyarat guide cover | `img/ritual/ziyarat.webp` |
| Ziyarat — Makkah places | `img/ritual/ziyarat/makkah/<slug>.webp` (kaaba, maqam-ibrahim, hateem, multazam, safa, marwah, jabal-al-noor, jabal-thawr, mina, muzdalifah, arafat) |
| Ziyarat — Madinah places | `img/ritual/ziyarat/madinah/<slug>.webp` (masjid-nabawi, rawdah, green-dome, jannat-al-baqi, masjid-quba, masjid-qiblatain, mount-uhud, martyrs-of-uhud) |

Optional dua audio: `apps/web/public/audio/ritual/<key>.mp3` (e.g. `talbiyah.mp3`, `niyyah.mp3`); the
`dua.audio` field points at it; the player is hidden when the file is absent.

> **Image licensing:** use only images you own or that are licensed for commercial use (e.g. your own
> photography, or a paid/clearly-CC source). Do not drop random web images — the site is public and
> commercial. The folder ships with a README listing exactly these names.

---

## Data, persistence & counters
- `ritual-content.ts` exports `RITUAL_STEPS: RitualStep[]` and `ZIYARAT` (Makkah/Madinah arrays). Pure
  data + types; unit-tested (count = 15, counters total 7, every `image` key resolves or falls back).
- State machine in the component: `stepIndex`, per-step `checked: Set`, `counters: { tawaf, sai }`,
  `notes`, `startedAt`, `elapsedMs` (ticks via `setInterval`, pausable), `completedAt`.
- **Persist** the whole state to `localStorage` under `auj.ritual.v1`; on load, if a run exists, show a
  **"Resume your Umrah Guide?"** prompt (Resume / Start over). If logged in, also offer save to account.
- Counter rules: cannot exceed `total`; Tawaf/Sa'i auto-advance to the next screen when the 7th is
  recorded (with a confirm). Location-assist is **opt-in and advisory only** — manual tap is the source
  of truth; never block on GPS.

---

## Religious accuracy (must-do before launch)
- Mark all ritual text **"pending scholarly review"** in `/docs/assumptions.md` until a qualified scholar
  signs off. Provide Arabic + transliteration + translation + a **source** for each dua/verse.
- Add a persistent, dismissible **disclaimer**: "Guidance for convenience; follow your group's scholar
  and official sources. Rulings differ between schools." Note madhhab differences where relevant
  (e.g. what breaks Ihram, raml/idtiba').
- Arabic dua text renders **verbatim** in Arabic script regardless of UI locale (do not 'translate' it);
  RTL correct. Transliteration + translation localise per UI language.

---

## Build steps
1. `ritual-content.ts` — types + `RITUAL_STEPS` (15) + `ZIYARAT`; `ritual-images.ts` manifest with
   fallback to `scenes.ts`. Unit tests for both.
2. `public/img/ritual/` folder + README (the table above). Commit `.gitkeep` so the path exists before
   images arrive.
3. `UmrahRitualWizard.tsx` (client) — header (phase, progress, time badge, live timer + pause), the
   step renderer (instructions, checklist, dua block with optional audio, Tawaf/Sai counters), big
   primary "next" button, back/skip, resume-from-localStorage prompt, completion screen with notes +
   certificate, and the Ziyarat grid.
4. Route `app/guide/page.tsx` (public; no `requireRole`) wrapped in `SitePage` (header/footer; pass the
   user if present so the chrome matches every page). Add a distinct landing entry (separate from the
   Smart Visit planner) and an account/companion link.
5. i18n: new `ritual` namespace in `messages/{en,lt,ur,ar}.json` (labels/instructions/transliteration/
   translation — NOT the Arabic dua text). Parity-check all four.
6. design-taste pass: motion ≤300ms transform/opacity, origin-aware; mono numerals for counters/timer;
   44px targets; AA contrast; full-bleed hero images with a gradient scrim for legible text; RTL verified.

## Acceptance criteria
- [ ] `/guide` works with **no login and no payment**; resumable after reload (counter + checks + timer
      survive); "Start over" clears it.
- [ ] Exactly 15 ordered screens across the 6 phases; one clear action per screen; back/skip work.
- [ ] Per-step **approximate-time badge** shown; a **live elapsed timer** runs once started, pauses, and
      a remaining-estimate is shown; completion screen shows total time + date + notes + certificate.
- [ ] Tawaf and Sa'i counters reach 7 (dots/progress), can't exceed 7, manual is source of truth,
      location-assist is opt-in and never blocks.
- [ ] Every dua shows Arabic (verbatim, RTL) + transliteration + translation + source; optional audio
      plays only when the asset exists.
- [ ] Every screen resolves an image from `img/ritual/…` or falls back cleanly to scene art (no broken
      images); Ziyarat module lists all Makkah + Madinah places with images/fallbacks.
- [ ] Disclaimer present; ritual content flagged for scholarly review in `/docs/assumptions.md`.
- [ ] EN/LT/UR/AR parity; RTL correct; design-taste checklist passes; typecheck/lint/unit/e2e-mock green.

## Virtual Tour (`/guide/tour`) — shared by default, personal when signed in
Source of truth: `migration/Files/AUJ Virtual Tour.dc.html`. A calm scene-by-scene walk-through
(panorama photo + walkthrough video + localized title/subtitle/description + a Listen/narration
button + scene selector), EN/AR/UR/TR/DE with RTL. Component `apps/web/src/ritual/tour/VirtualTour.tsx`;
scenes in `tour/scenes.ts`; admin copy overrides via the content store (`tour:<id>` keys).

Two surfaces, one component (matches the prototype's per-step video):
- **Public / anonymous** — the tour is **identical for everyone**: shared photo + walkthrough video.
  A "Sign in to add your own video" hint links to `/login?next=/guide/tour`.
- **Signed-in pilgrim** — the tour becomes **personal**: per-scene they can paste a video link
  (YouTube / Vimeo / MP4) which **plays in the main frame in place of the shared walkthrough**, with
  Replace / Remove. Clips are **DB-backed per user** (`tour_videos(user_id, scene_id, url)` — Postgres
  with in-memory fallback) via `tour-video-store.ts` + `tour-video-actions.ts` (sign-in enforced; **no
  localStorage**). Each pilgrim sees only their own clips.

(The prototype's voice-recorder is a separate, later add-on — use the DB-backed `recordings-store`/
`RecordingPanel`, never localStorage.)

## Out of scope
Issuing Rawdah/Hajj permits (Nusuk does that — we only guide), payments, Hajj rites (Mina/Arafat/
Muzdalifah/Jamarat as a *performed* flow — list under Ziyarat only for now), real-time crowd data.
