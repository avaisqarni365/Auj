# Landing migration — forcing prompt for Claude Code

Use this when the landing "only changes partially." Two problems cause that:
1. **Wrong file** — Claude Code edits a component that isn't what `/` actually renders.
2. **Partial port** — the landing has **34 sections**; the agent stops after a few.

Fix both with the steps below.

---

## STEP 0 — make it find the real file first (paste this)

```
Before editing anything: tell me exactly which file renders at the route "/".
Trace it: app/(marketing)/page.tsx (or app/page.tsx) → every component it imports →
down to the actual landing markup. List the file paths in that chain and which one
holds the current hero. Do NOT edit yet — just report the chain.
```

If two landing files exist (e.g. an old `app/page.tsx` AND `app/(marketing)/page.tsx`),
that's your bug: you've been editing one while the other renders. Delete/redirect the
stale one before continuing.

---

## STEP 1 — the replace command (paste this, after Step 0)

```
Replace the landing page completely — do not ask for confirmation, make all edits.

SOURCE OF TRUTH (layout, copy, colors, order): "AUJ Landing Cinematic.dc.html" (migration/Files).
TARGET (edit the file Step 0 identified as the real render chain), extending src/Landing.tsx.

Hard requirements:
- Port the .dc.html template markup → JSX 1:1. renderVals() keys → React state/hooks.
- Use tokens.css CSS variables, NOT raw hex (they map 1:1 — see migration/00-README.md).
- The page MUST contain ALL 34 sections in the exact order in the checklist below.
  Do not stop early, do not summarize sections, do not "// rest unchanged".
- Each numbered FRAME links to its real migrated route; if a route isn't built yet,
  link the path anyway and add a // TODO. Never drop the section.
- Keep hero animations (stat counters, reveal-on-scroll, parallax, skyline) and all
  localStorage keys verbatim.
- Fully fluid 360px→desktop, no horizontal scroll, RTL for AR/UR. Gold only for
  logo/highlights, never body text.

When done: run typecheck + lint, fix errors, then print the checklist below with a
[x] next to every section you actually rendered. If any box is unchecked, keep going.
```

---

## STEP 2 — the completeness checklist (must ALL be present, in order)

```
[ ] 01  Announcement bar (6 EU cities · e-Visa · EN·LT·UR·AR)
[ ] 02  Nav header (Packages dropdown, Umrah, Ziyarat, lang switch, "Plan my pilgrimage")
[ ] 03  Hero — badge, headline, subtext, 2 CTAs, 4 animated stat counters, skyline/stars/moon
[ ] 04  FRAME 01 · Smart Planner card (trip-at-a-glance + progress)
[ ] 05  FRAME 02 · Virtual Tour
[ ] 06  FRAME 03 · Search (tabs, from/dest/dates/pax, search button)
[ ] 07  FRAME 04 · Luggage Wizard
[ ] 08  FRAME 05 · Airport Wizard
[ ] 09  FRAME 06 · Makka Ziyarat
[ ] 10  FRAME 07 · Madina Ziyarat
[ ] 11  FRAME 08 · Makkah Hotels
[ ] 12  FRAME 09 · Madina Hotels
[ ] 13  FRAME 10 · Food & Dining
[ ] 14  FRAME 11 · Hospitals & Care
[ ] 15  FRAME 12 · Transport
[ ] 16  FRAME 13 · Laundry
[ ] 17  FRAME 14 · Gifts & Shopping
[ ] 18  FRAME 15 · Day Planner
[ ] 19  FRAME 16 · Personal Diary
[ ] 20  FRAME 17 · Helpline & SOS
[ ] 21  FRAME 18 · Connectivity
[ ] 22  Trust marquee
[ ] 23  Journey types
[ ] 24  Explore & stay
[ ] 25  One cart (→ Financial Planner / "one price")
[ ] 26  How it works
[ ] 27  Visa route
[ ] 28  Featured packages
[ ] 29  Multilingual
[ ] 30  Track booking
[ ] 31  Testimonials
[ ] 32  FAQ
[ ] 33  Final CTA
[ ] 34  Footer
```

---

## STEP 3 — if it STILL shows the old page

The code changed but the browser/build didn't:
```
- Stop the dev server, delete the .next build cache, restart.
- Hard-refresh the browser (Cmd/Ctrl+Shift+R) — Next caches aggressively.
- Confirm you're hitting the same route Step 0 traced (not a cached / old marketing route).
- grep the repo for the OLD hero headline text — if it still appears anywhere that an
  import resolves to, that stale component is what's rendering. Replace or delete it.
```

## Frame → route map (for the CTA links)
Each frame's `.dc.html` is the screen it links to. Point each CTA at that screen's
migrated route (e.g. Smart Planner → /smart-planner, Visa → /visa-router,
One cart / one price → Financial Planner). Use the routes from your earlier migration
steps 01–14; leave a // TODO for any not built yet.
