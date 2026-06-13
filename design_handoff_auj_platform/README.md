# Handoff: AUJ Frontend — Brand, Landing, Admin & Traveller Portal

## Overview
AUJ (أوج — Arabic for *zenith*) is a multilingual pilgrimage + travel platform for EU travellers
and the EU-resident Pakistani diaspora (Umrah · Hajj · Ziyarat). This bundle covers the **public
and account-facing frontend** built on the existing AUJ design system:

- **Brand / logo** — the refined "zenith" mark + bilingual lockups.
- **Marketing landing page** — public, fully responsive web.
- **Admin platform (Web)** — desktop ops console: dashboard, Pilgrim CRM, Landing CMS, user management.
- **Traveller portal** — the customer's own journey view, delivered as **two distinct surfaces**:
  a responsive **Web portal** and a **Mobile app**.

It complements the earlier `design_handoff_auj_platform` bundle (the original B2C app screens, B2B
agent portal, and the design-system source of truth).

## About the Design Files
The files in `designs/` are **design references created in HTML** (`.dc.html`) — high-fidelity
prototypes showing the intended look, layout, copy, and behavior. **They are not production code to
ship directly.** Open them in any browser (double-click `designs/AUJ.dc.html` to start; each
`.dc.html` loads the bundled `designs/support.js` runtime). Read the markup for exact values, then
**re-implement in the target stack** (the brief calls for **Next.js + Tailwind**, EN/LT/UR/AR i18n
with RTL). `tokens.css` and `tailwind.config.js` are included and map 1:1 to the values below.

## Fidelity
**High-fidelity (hifi).** Final colours, typography, spacing, radii, shadows and component states
are all specified here and in the prototypes. Recreate pixel-faithfully using the codebase's own
component library; do not introduce new tokens — map onto the existing ones.

---

## ⚠️ Critical: Mobile vs Web are SEPARATE surfaces
A developer must not conflate them. Each prototype is explicitly labelled:

| Surface | File | Device | Build target |
|---|---|---|---|
| Marketing landing | `AUJ Landing.dc.html` | **Responsive web** (mobile→desktop, one page) | public site route `/` |
| Admin console | `AUJ Admin (Web).dc.html` | **Desktop web only** (data-dense, sidebar + content) | internal app `/admin` |
| Traveller — Web portal | `AUJ Traveller Portal.dc.html` (top section, tagged `WEB · PORTAL`) | **Responsive web** | customer app `/journey` |
| Traveller — Mobile app | `AUJ Traveller Portal.dc.html` (bottom section, tagged `MOBILE · APP`) | **Native / mobile webview** (phone frames = the device, not part of the screen) | iOS / Android app |

Rules of thumb:
- **Web/responsive** screens use fluid layout (CSS grid `auto-fit` + `minmax`, `clamp()` type,
  `flex-wrap`). They reflow from ~360px to desktop with no fixed device width.
- **Mobile app** screens are drawn inside phone bezels at **314px** screen width. The bezel is a
  presentation device — build the screen contents, not the bezel. Use bottom-tab navigation, 44px
  min touch targets, sticky headers.
- **Admin** is desktop-first: a fixed **248px** sidebar + scrolling content. On narrow widths collapse
  the sidebar to icons/drawer and let tables scroll horizontally (tables already wrap in a
  horizontal-scroll container in the prototype).

---

## Brand / Logo (`designs/AUJ Brand.dc.html`)
**Concept — "zenith".** AUJ (أوج) means *the highest point*. The mark is an **eight-point gold star
set as the keystone of a mihrab arch** (star = zenith of devotion; arch = sacred threshold).

- **Primary mark**: green-800 rounded tile (radius ≈ 27% of size), cream arch stroke, gold star.
- **Construction (SVG, 64-box)**: tile `rect rx=17`; arch `M19 47V31a13 13 0 0 1 26 0v16` stroke
  `#FAF6EF` width `3.4`; star path `M12 3l2.2 5.4L20 9.2l-4 3.9 1 5.7L12 16l-5 2.8 1-5.7-4-3.9 5.8-.8L12 3z`
  fill `#C8A24A`, transformed `translate(17.8 4) scale(1.18)`.
- **Colourways**: Primary (green tile), Inverse (cream tile + green arch), On-dark (green-950 tile),
  Monochrome (single ink colour). Min size 24px digital / 8mm print; clearspace = ½ tile height.
- **Wordmark**: "AUJ" in IBM Plex Serif 600, letter-spacing 0.04–0.18em. Bilingual lockup pairs it
  with "أوج" (IBM Plex Sans Arabic, gold) and tagline "Pilgrimage & travel · رحلةٌ مُقدّسة".
- **Artistic signature**: a banner with a stylised **Masjid an-Nabawi skyline** (green dome + twin
  minarets with gold finials, crescent, stars) behind the bilingual wordmark — for hero/splash/social.
  In production, replace the CSS skyline with real photography or a commissioned illustration.

---

## Screens / Views

### 1. Landing page — `AUJ Landing.dc.html` (responsive web)
Sticky announcement bar → nav → **hero** (green radial gradient, serif H1 `clamp(36–60px)`, dual CTA,
floating live-visa + price cards over a photo placeholder) → **overlapping search card** (Umrah/Hajj/
Ziyarat segmented tabs, From/Destination/Dates/Pilgrims-stepper, "Search N" — interactive) → trust
strip → **journey types** (3 cards) → **one cart** (feature list + live cart total in EUR/PKR) →
**how it works** (4 steps) → **visa route** (e-Visa vs agent channel, dark green panel) → **featured
packages** (3 cards, visa pills, per-pilgrim price) → **multilingual** (working EN/LT/UR/AR switcher
that mirrors to RTL) → **track booking** (BRN + live visa timeline card) → testimonials → **FAQ**
(accordion) → CTA band → footer. All grids are `repeat(auto-fit, minmax(…, 1fr))`; headings use `clamp()`.

### 2. Admin (Web) — `AUJ Admin (Web).dc.html` (desktop)
Sidebar (Overview · Pilgrims·CRM · Landing content · Users & roles) + topbar (search, FX chip,
notifications, + New booking). View switching is client-side.
- **Overview**: 4 KPI cards (mono values, deltas), recent-bookings table, visa pipeline bars, upcoming departures.
- **Pilgrims · CRM**: filterable table (avatar, BRN, nationality, **visa-route pill**, 5-dot status
  mini-timeline, journey date, balance). Row click → **profile**: header (status pill, "Travel plan PDF"),
  **journey status timeline** (booked→docs→visa→travel→return), documents, visa-route card,
  payments (total/paid/balance + transactions), communications log (email/SMS/WhatsApp), group members.
- **Landing content (CMS)**: hero editor (headline/subhead/image/CTA) + a publishable section list
  (each with status + last-edited + Edit).
- **Users & roles**: tabs (All/Admins/Agents/Customers) + table (role pill, status dot, last active).

### 3. Traveller portal — `AUJ Traveller Portal.dc.html`
- **Web portal**: browser-framed, responsive. Booking hero (BRN, route, dates, status pill,
  days-to-departure, 5-stage progress bar) + tabs: **Journey** (full each-step timeline + "what's next"
  cards + **QR digital pass**), **Itinerary** (day-by-day Umrah plan), **Documents** (docs + per-pilgrim
  visa status), **Payments** (summary + transactions + receipt/plan download).
- **Mobile app**: 3 phone screens (314px) — My journey (header + timeline + "show pass"), Itinerary
  (day cards), Documents & pass (QR pass + document list).

> **Still to build (not in this bundle):** the printable **PDF travel plan + comprehensive Umrah guide**.
> Both the Admin profile and the Traveller portal link to `AUJ Travel Plan (Doc).dc.html` — implement
> that route as a print-optimised document (rituals, day-by-day, document checklist, tips).

---

## Design Tokens (see `tokens.css` / `tailwind.config.js` for the full set)

**Colour**
- Green (primary): `50 #EFF6F1 · 100 #DCEDE4 · 500 #2A9468 · 600 #1C7A4F · 700 #156440 · 800 #0F5132 (brand) · 900 #0A3D26 · 950 #07301E`
- Sand (neutral): `ink #2A2620 · 700 #4A4337 · 500 #7A7263 · 300 #C9BCA6 · 200 #E6DDCE · 100 #F1EADD · 50 #FAF6EF` (app bg); page canvas (admin/portal) `#ECE7DD`
- Accent (teal): `100 #E2EEF3 · 500 #3C86A8 · 600 #2F6F8F · 700 #265D78`
- Status: success `#1C7A4F`/bg`#DCEDE4` · warning `#B5791E`/bg`#F7EBD3` · danger `#B23A2E`/bg`#F6E0DC` · info `#2F6F8F`/bg`#E2EEF3`
- Gold `#C8A24A` — logo star + tiny highlights ONLY (never body text on light; fails AA).

**Type** — IBM Plex superfamily (Google Fonts): Serif (display/headings, 600), Sans (UI/body, Latin
+ Lithuanian), Sans Arabic (AR/UR, applied on `dir="rtl"`), Mono (BRNs, prices, references).
Scale `xs12 · sm14 · base16 · lg18 · xl20 · 2xl24 · 3xl30 · 4xl36 · 5xl48 · 6xl60`; serif headings carry −0.02em.

**Spacing** 4px base grid (Tailwind default). **Radius** `md8 · lg10 · xl14 · 2xl20 · 3xl28/32 (sheets/phone) · full999`.
**Shadow** sm `0 1px 2px rgba(42,38,32,.06),0 2px 8px rgba(42,38,32,.05)`; lg `0 8px 24px rgba(42,38,32,.10),…`; focus ring `0 0 0 3px rgba(47,111,143,.14)` + 1.5px `#2F6F8F` border.

---

## Interactions & Behaviour
- **Visa-route auto-detection** (central rule): derive from each pilgrim's passport — EU/EEA ⇒ **e-Visa**
  (success styling); Pakistani & other ⇒ **Agent channel** (info styling). Re-evaluate on change; mixed
  groups show per-pilgrim routes. Surface prominently everywhere a pilgrim is shown.
- **Currency**: charged in EUR; show indicative PKR at live FX (mock 1 € = ₨310.8) + "charged in EUR" note. Never silently convert the charged amount.
- **Status timeline** (each-step awareness): booked → documents → visa processing → travel & departure
  → return. done = filled success dot + ✓ + solid connector; active = amber dot; pending = hollow sand-300 dot + grey text.
- **QR digital pass**: encodes the BRN; shown at check-in / ground services. (Prototype renders a faux
  QR — generate a real QR in production.)
- **Landing**: segmented search tabs update the package count; pilgrims stepper (1–49); language switcher
  swaps copy + `dir`; FAQ accordion (one open at a time).
- **Admin**: sidebar view switching; CRM master→detail; user-role tab filter; CMS publish toggles.
- **Transitions**: calm, 150–250ms ease. Visible focus rings (AA). Hover: buttons darken ~6–8%, rows highlight.

## State Management
- **Traveller**: booking (BRN, package, dates, pax) → pilgrims[] (name, dob, nationality, passport,
  derived `visaRoute`, documents[]) → status timeline stage → currency → payments/transactions.
- **Admin**: `view` + `selectedPilgrim`; pilgrims list, KPIs, pipeline, content blocks (status), users (role filter).
- **Cross-cutting**: `locale` (en|lt|ur|ar) + `dir` (ltr|rtl) drive RTL; persist locale; FX rate; auth/session + roles (admin/agent/customer).

## Assets
- **Fonts**: IBM Plex Serif / Sans / Sans Arabic / Mono (Google Fonts). Optional Noto Nastaliq Urdu for authentic UR display.
- **Logo**: the zenith mark — lift the SVG from `AUJ Brand.dc.html` (construction documented above).
- **Imagery**: all package/hotel/hero/mosque visuals are **placeholders** (gradients, a CSS skyline,
  `PHOTO ·`-labelled blocks). Replace with real photography of Makkah/Madinah/Najaf-Karbala and hotels.
- **Icons / flags**: emoji are placeholders — swap for a calm line icon set (Lucide/Phosphor) and a flag asset set.

## Files
- `designs/AUJ.dc.html` — launcher / overview.
- `designs/AUJ Brand.dc.html` — logo concept, colourways, lockups, the Masjid an-Nabawi signature, usage.
- `designs/AUJ Design System.dc.html` — tokens, type, component gallery (light/dark/RTL).
- `designs/AUJ Landing.dc.html` — responsive marketing landing.
- `designs/AUJ Admin (Web).dc.html` — desktop admin (dashboard, CRM, CMS, users).
- `designs/AUJ Traveller Portal.dc.html` — traveller Web portal + Mobile app.
- `designs/AUJ B2C.dc.html` / `AUJ B2B.dc.html` — earlier app & agent-portal screens (context).
- `designs/support.js` — the runtime that renders the `.dc.html` prototypes in a browser.
- `tokens.css`, `tailwind.config.js` — design tokens (CSS vars + Tailwind theme).
- `CLAUDE_CODE.md` — paste-ready kickoff prompt + build order + gotchas for Claude Code.
