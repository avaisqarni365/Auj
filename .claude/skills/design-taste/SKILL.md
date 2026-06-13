---
name: design-taste
description: "Use this skill on EVERY frontend change — building or refining components, pages, animations, typography, or layout. Encodes impeccable design taste and Emil Kowalski-style motion (purposeful, fast, origin-aware transitions; spring for direct manipulation; respects prefers-reduced-motion), a tight type scale, and restraint. Read it before touching UI; apply the checklist before you finish."
---

# Design taste & motion (apply to all UI)

The bar: it should feel *considered* — calm, fast, and quiet. Inspired by Emil Kowalski's work
(Sonner, Vaul, "Animations on the Web"): motion exists to explain a change, never to decorate.
Stay on the AUJ tokens (`@auj/ui` preset + `tokens.css`) — never invent colours/spacing.

## 1. Motion — the rules
- **Purpose only.** Animate to show *where something came from / went to* (open/close, enter/exit,
  reorder). If it doesn't aid understanding, don't animate it.
- **Fast.** Durations: micro/hover **120–160ms**, enter/exit **180–240ms**, larger surfaces (sheets,
  modals) **240–300ms**. Anything >320ms feels slow.
- **Easing.** Enter = ease-out (`cubic-bezier(0.22,1,0.36,1)` — decelerate in). Exit = ease-in (quicker).
  Direct manipulation (drag, toggles, press) = **spring**, not duration. Never linear except opacity-only.
- **Origin-aware.** Transform from the element's source: menus scale from their trigger corner
  (`transform-origin`), sheets slide from their edge, list items rise a few px (`translateY(6–8px)` + fade).
- **Compositor-only.** Animate `transform` and `opacity`. Never animate `width/height/top/left` or
  box-shadow blur in a loop (jank). Use `will-change` sparingly.
- **Press feedback.** Interactive elements get `active:scale-[0.98]` + a fast color transition.
- **One thing at a time.** Don't stagger five things on load; a single quiet rise+fade for the section.
- **Reduced motion is non-negotiable.** Wrap everything so `@media (prefers-reduced-motion: reduce)`
  drops transforms/animations to a plain fade or nothing. (`@auj/ui/motion.css` does this globally.)

Use the AUJ motion utilities (in the preset): `animate-fade-in`, `animate-rise` (translateY+fade),
`animate-pop` (scale-in), `ease-out-soft`, `duration-fast`. Prefer CSS/Tailwind; reach for a library
(Framer Motion) only for orchestrated exit animations or drag.

## 2. Typography
- **One serif for display, one sans for UI.** AUJ: IBM Plex Serif (headings, 600, −0.02em tracking
  on 4xl+), IBM Plex Sans (UI/body), Mono (numbers/BRN/prices), Sans Arabic (RTL).
- **Tight scale, generous leading.** Headings line-height 1.0–1.15; body 1.5–1.65. Use `clamp()` for
  fluid hero/section headings, not breakpoint jumps.
- **Measure.** Body copy max ~66ch (`max-w-[60ch]`/`max-w-prose`). Never full-width paragraphs.
- **Numbers are mono + tabular** (prices, BRNs, balances) so they align and don't shift.
- **Hierarchy by weight & colour, not size alone.** ink → 700 sand → 500 sand for descending emphasis.

## 3. Layout, space & colour
- **4px grid.** Consistent rhythm; prefer `gap` over margins; align to a baseline.
- **Restraint.** One accent (teal). Green is the brand; gold is for the logo star + tiny highlights
  only — never body text on light (fails AA).
- **Depth sparingly.** `shadow-sm` for cards, `shadow-lg` for popovers, `shadow-modal` for dialogs.
  Borders are `sand-200`; surfaces are white on a `sand-50` app bg / `#ECE7DD` page canvas.
- **Empty/loading/error states** are part of the design — skeletons in `sand-100`, never a blank flash.

## 4. Micro-interactions & a11y
- Visible **focus rings** (`shadow-focus` + 1.5px accent border) on every interactive element — AA.
- **44px** min touch targets on mobile.
- Hover: buttons darken ~6–8%, rows highlight, cards lift `translateY(-2px)` + `shadow-lg`.
- Honour the central product rules in UI: **visa-route** pill (e-Visa/success vs agent/info) and
  **EUR-charged / PKR-indicative** money everywhere a pilgrim or price appears.

## ✅ Finish checklist (run before declaring UI done)
- [ ] Motion is purposeful, ≤300ms, transform/opacity only, origin-aware.
- [ ] `prefers-reduced-motion` respected (import `@auj/ui/motion.css` once per app).
- [ ] Press states (`active:scale`) + visible focus rings on all controls.
- [ ] Type: serif display + mono numbers; `clamp()` headings; body ≤66ch.
- [ ] Only AUJ tokens — no ad-hoc hex/px; gold not used as body text.
- [ ] Responsive 360px→desktop, no horizontal scroll; RTL verified for AR/UR.
- [ ] Empty/loading/error states exist; AA contrast; 44px touch targets.

## Out of scope
Brand/token *definitions* (those live in `@auj/ui` + the design handoff) and copywriting.
