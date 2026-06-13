# CLAUDE_CODE.md — Implementing the AUJ frontend

Paste the **kickoff prompt** below into Claude Code at the root of the AUJ repo. Then drive it
screen by screen. Read `README.md` first — it has every token, layout and interaction.

---

## 📋 Kickoff prompt (copy/paste)

> You are implementing the AUJ frontend from a design handoff in `design_handoff_auj_frontend/`.
> AUJ (أوج = "zenith") is a multilingual (EN/LT/UR/AR, with RTL) Umrah/Hajj/Ziyarat platform.
>
> The `designs/*.dc.html` files are **high-fidelity references, not code to copy** — open them to read
> exact values, then rebuild in **our stack: Next.js (App Router) + TypeScript + Tailwind**, using the
> tokens in `tokens.css` / `tailwind.config.js`. Do NOT invent new colours, fonts, or spacing — map onto
> those tokens. Fonts: IBM Plex Serif / Sans / Sans Arabic / Mono via `next/font`.
>
> CRITICAL — these are **separate surfaces, do not merge them**:
> 1. `AUJ Landing.dc.html` → **responsive public web** at `/`.
> 2. `AUJ Admin (Web).dc.html` → **desktop web** app at `/admin` (248px sidebar + content; tables scroll
>    on mobile; sidebar collapses to a drawer).
> 3. `AUJ Traveller Portal.dc.html` has TWO surfaces in one file: the top (`WEB · PORTAL`) → **responsive
>    web** at `/journey`; the bottom (`MOBILE · APP`, phone bezels at 314px) → the **mobile app** screens.
>    The phone bezel is presentation only — build the screen contents, not the bezel.
>
> Build order: (1) design-system primitives (tokens, fonts, Button, Input, Select, Stepper, Card, Pill,
> Table, Modal, Tabs — match the gallery in `AUJ Design System.dc.html`), (2) the zenith `<Logo/>`
> component (SVG in README), (3) Landing, (4) Traveller portal (web + mobile), (5) Admin.
>
> Enforce two business rules everywhere a pilgrim appears: **visa-route auto-detection** (EU/EEA passport ⇒
> e-Visa/success; Pakistani & other ⇒ Agent channel/info; mixed groups show per-pilgrim) and **EUR-charged /
> PKR-indicative** currency display (show FX + "charged in EUR", never silently convert).
>
> Start with the design-system primitives and the `<Logo/>`, then stop and show me before building pages.

---

## 🗂 Suggested route / file map
```
app/
  (marketing)/page.tsx            ← AUJ Landing.dc.html
  journey/page.tsx                ← Traveller Web portal (tabs: Journey/Itinerary/Documents/Payments)
  admin/
    layout.tsx                    ← sidebar + topbar shell
    page.tsx                      ← Overview dashboard
    pilgrims/page.tsx             ← CRM list
    pilgrims/[brn]/page.tsx       ← pilgrim profile (timeline, docs, visa, payments, comms, group)
    content/page.tsx              ← Landing CMS
    users/page.tsx                ← Users & roles
mobile/ (Expo/React Native or PWA)← Traveller Mobile app screens
components/ui/                    ← Button, Input, Select, Stepper, Card, Pill, Table, Tabs, Modal, Logo, StatusTimeline, VisaRoutePill, QRPass
lib/visaRoute.ts                  ← passport → route rule
lib/currency.ts                   ← EUR charge + PKR indicative formatter
```

## ✅ Acceptance checklist
- [ ] Tokens wired from `tokens.css` / `tailwind.config.js`; no ad-hoc hex/spacing.
- [ ] `<Logo/>` matches the zenith SVG; renders crisp at 24px and as a favicon.
- [ ] Landing is fully fluid 360px→desktop (no horizontal scroll); RTL verified for AR/UR.
- [ ] Admin sidebar collapses on narrow; CRM tables scroll horizontally; master→detail works.
- [ ] Traveller **web** and **mobile** are distinct implementations, not one shared layout.
- [ ] Visa-route rule + per-pilgrim routes correct for a mixed EU/PK group.
- [ ] All money shows EUR with PKR-indicative + "charged in EUR"; FX rate surfaced.
- [ ] Status timeline (booked→docs→visa→travel→return) drives both admin and traveller views from one source.
- [ ] QR pass encodes the real BRN (replace the faux-QR placeholder).
- [ ] AA contrast, visible focus rings, 44px touch targets on mobile.

## ⚠️ Gotchas
- The `.dc.html` files need `support.js` (bundled) to render — that runtime is **prototype-only**, never ship it.
- Imagery (gradients, the CSS Masjid an-Nabawi skyline, `PHOTO ·` blocks) and emoji icons/flags are
  **placeholders** — replace with real photography, a proper icon set (Lucide/Phosphor) and flag assets.
- Gold `#C8A24A` is for the logo star and tiny highlights only — never body text on light (fails AA).
- The printable **PDF travel plan + Umrah guide** (`AUJ Travel Plan (Doc).dc.html`) is referenced by the
  Admin and Portal but not yet designed — flag it as a follow-up screen.
- Drive RTL from `locale`; use CSS logical properties (`margin-inline`, `inset-inline`, `start/end`).
