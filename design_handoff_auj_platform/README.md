# Handoff: AUJ — Pilgrimage & Travel Platform (B2C site + B2B agent portal)

## Overview
AUJ is a pilgrimage + travel platform serving EU travellers and the EU-resident Pakistani
diaspora. It has **two surfaces**:

- **B2C booking site** — public, mobile-first. Search → results → one-cart package builder
  (hotel + transport + ground + flight) → pilgrim & document capture (with an e-Visa vs
  agent-channel route indicator) → EUR/PKR checkout → "My booking" with BRNs and live visa status.
- **B2B agent portal** — trade, desktop. Login → dashboard → multi-passenger booking (up to 49 pax)
  → wallet & credit limit → markup configuration → quotation builder → statements/exports.

The product must be **multilingual EN / LT / UR / AR with full RTL** for Arabic and Urdu,
**WCAG AA** contrast, and **dark-mode aware**.

---

## About the Design Files
The files in `designs/` are **design references created in HTML** (`.dc.html`). They are
prototypes that show the intended look, layout, copy, and behavior — **not production code to
copy directly.** They open in any browser; double-click `designs/AUJ.dc.html` to start, then
navigate to the design system, B2C, and B2B surfaces.

> The `.dc.html` extension is a self-contained design-component format. Treat it as an HTML
> reference: open it, read the markup for exact values, but **re-implement the UI in the target
> codebase** using its own framework, component library, and conventions.

**Your task:** recreate these designs in the project's environment. The brief calls for a
**Next.js + Tailwind** build, and a ready-to-use `tailwind.config.js` and `tokens.css` are included
in this bundle (the token names below match them exactly). If a codebase/design system already
exists, map these tokens onto its primitives instead of introducing new ones.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, radii, shadows, and component
states are all specified. Recreate the UI faithfully using the codebase's libraries. Exact hex,
px, and font values are listed below and in `tokens.css` / `tailwind.config.js`.

---

## Design Tokens
All values live in `tailwind.config.js` (Tailwind theme.extend) and `tokens.css` (CSS variables).
Summary:

### Colour
| Group | Tokens | Notes |
|---|---|---|
| **Primary · green** | `green-50 #EFF6F1` · `100 #DCEDE4` · `400 #4FAE86` · `500 #2A9468` · `600 #1C7A4F` · `700 #156440` · `800 #0F5132` · `900 #0A3D26` · `950 #07301E` | Brand = **green-800 #0F5132**. Dark-mode primary = green-500. |
| **Neutral · sand** | `ink #2A2620` · `700 #4A4337` · `500 #7A7263` · `300 #C9BCA6` · `200 #E6DDCE` · `100 #F1EADD` · `50 #FAF6EF` | ink = strongest text; 700 = body; 500 = muted; 50 = app bg. |
| **Accent · teal-blue** | `accent-100 #E2EEF3` · `500 #3C86A8` · `600 #2F6F8F` · `700 #265D78` | Single accent — links, secondary CTAs, focus ring, "agent channel". |
| **Status** | success `#1C7A4F`/bg`#DCEDE4` · warning `#B5791E`/bg`#F7EBD3` · danger `#B23A2E`/bg`#F6E0DC` · info `#2F6F8F`/bg`#E2EEF3` | Pills use fg text on bg fill. |
| **Gold** | `#C8A24A` | Logo star & tiny highlights ONLY. Never body text (fails AA on light). |
| **Dark surfaces** | bg `#11140F` · surface `#181C16` · surface2 `#20251E` · border `#2E342A` · text `#ECEAE3` · muted `#A6A293` | |

### Typography — IBM Plex superfamily (Google Fonts)
- **Display / headings:** `IBM Plex Serif` — 400/500/600/700. Used at 600 for hero & titles.
- **UI / body:** `IBM Plex Sans` — 400/500/600/700. Covers Latin + Latin-Extended (Lithuanian diacritics).
- **Arabic & Urdu:** `IBM Plex Sans Arabic` — 400/500/600/700. Applied when `dir="rtl"` / locale is AR or UR.
- **Numeric / code:** `IBM Plex Mono` — 400/500. Used for BRNs, prices, references, hex.

Type scale (token → px / line-height): `xs 12/1.4 · sm 14/1.5 · base 16/1.6 · lg 18/1.5 ·
xl 20/1.4 · 2xl 24/1.3 · 3xl 30/1.15 · 4xl 36/1.1 (-0.02em) · 5xl 48/1.05 (-0.02em) · 6xl 60/1.04`.
Headings carry slight negative tracking (-0.01 to -0.02em); serif headings only.

> **Urdu note:** the mocks use IBM Plex Sans Arabic (naskh) for UR for UI legibility. If you want
> authentic Nastaliq for Urdu display text, load **Noto Nastaliq Urdu** and apply it to the `ur` locale.

### Spacing — 4px base grid
Matches Tailwind's default spacing scale exactly (`1`=4px, `2`=8px, `3`=12px, `4`=16px, `6`=24px,
`8`=32px). No scale override needed.

### Radius
`md 8px` (small buttons, chips) · `lg 10px` (inputs, buttons) · `xl 14px` (cards) ·
`2xl 20px` (search card, prominent cards) · `3xl 28px` (sheet/phone screen) · `full 999px` (pills, toggles).

### Elevation
- `shadow-sm` — `0 1px 2px rgba(42,38,32,.06), 0 2px 8px rgba(42,38,32,.05)` — cards, inputs.
- `shadow-lg` — `0 8px 24px rgba(42,38,32,.10), 0 2px 6px rgba(42,38,32,.06)` — popovers.
- `shadow-modal` — `0 24px 60px rgba(42,38,32,.22)` — dialogs.
- **Focus ring** — `0 0 0 3px rgba(47,111,143,.14)` + 1.5px accent border (`#2F6F8F`).

---

## Core Components (used across both surfaces)
- **Buttons** — radius `lg` (10px), font 14/600, padding ~11×20px.
  - Primary: bg `green-800`, white text, `shadow` `0 4px 12px rgba(15,81,50,.22)`.
  - Accent: bg `accent-600`, white text. Secondary: white bg, `green-700` text, 1.5px `sand-300` border.
  - Ghost: transparent, `sand-700` text. Disabled: `sand-200` bg, `sand-muted` text. Danger: `danger` bg, white.
  - Small: 13/600, padding 8×14px, radius `md`.
- **Text input** — height 46px, 1.5px `sand-300` border, radius `lg`, bg white (or `sand-50` when filled-read-only).
  Focus: accent border + focus ring. Error: `danger` border + 12.5px `danger` helper text. Label 13/500 `sand-700`.
- **Select** — same shell as input + chevron (`▾`, `sand-500`).
- **Stepper** — `−` (outline) and `+` (green-800 fill) 32px square buttons flanking a 15/600 value.
- **Card** — white, 1px `sand-200` border, radius `xl`, `shadow-sm`. Section labels 13/600.
- **Data table** — 13.5px; header row bg `sand-50`, header text 600 `sand-500`; zebra rows
  (white / `#FBF8F2`); 1px `sand-100` row borders; numeric cells `mono`, right-aligned. Sticky header.
- **Status pill** — radius `full`, 12–13/600, padding 4–6×10–13px, status `bg` fill + status `fg`
  text + a 6–7px dot in `fg`. Variants: e-Visa/Paid/Issued (success), Agent channel (info),
  Pending/Submitted (warning), Action needed (danger), Draft (sand-100/`sand-500`).
- **Tabs / segmented control** — track `sand-100`, 4px padding; active = white pill + `shadow-sm`,
  `green-800` text; inactive `sand-500` text.
- **Toggle** — 32×18px track, 14px white knob; on = `success`, off = `sand-300`.
- **Modal** — white, radius 16px, `shadow-modal`, ~360px wide; icon chip + serif title + body +
  footer button row (secondary + primary). Scrim is sand/ink at low opacity.

---

## Screens / Views

### Design System (`designs/AUJ Design System.dc.html`)
Reference page: colour swatches, type specimen (incl. EN/LT/UR/AR multilingual cards), spacing/
radius/elevation, and a full component gallery with light, dark, and RTL examples. Use it as the
source of truth for any value not spelled out here.

### B2C — mobile-first (`designs/AUJ B2C.dc.html`), design width 372px (phone)
1. **Home & search** — sticky app bar (wordmark, 🌐 language, menu) · serif hero (30/600) ·
   white search card (radius `2xl`): Umrah/Hajj/Ziyarat segmented tabs, From/Destination selects,
   Dates, Pilgrims stepper, full-width primary "Search N packages" · horizontal "Popular" card
   rail · `green-100` trust strip (licensed / e-Visa / 24/7).
2. **Results** — sticky header (back, route + pax, Edit) + scrollable filter chips (active chip =
   `green-800`) · sort row · package cards: image (with visa pill overlay + ♡), name, star rating
   (`warning` text), price (`mono`, `green-800`, "per pilgrim"), feature chips (`sand-100`),
   Details (secondary) + Build package (primary).
3. **Package builder (one cart)** — sticky header + 4-segment progress (Hotel·Transport·Ground·
   Flight; done=green-800, active=accent-600, todo=sand-200) · cart item rows (icon chip + kind
   label + Swap + title + detail + included + price) · dashed "add" row · **sticky bottom cart**
   summary with total in EUR + `≈ PKR` and "Continue to pilgrims".
4. **Pilgrim & document capture** — "Pilgrim 1 of 4" + 4-seg progress · **VISA ROUTE INDICATOR**
   (prominent `green-100` gradient card, auto-detected from nationality): shows **e-Visa route**
   (EU passport, green) vs **Agent channel** (teal) with a segmented control reflecting the choice ·
   form (name, nationality, DOB, passport `mono`) · document upload cards (uploaded = `green-100`
   success state with ✓; pending = dashed border + Upload).
5. **Checkout (EUR / PKR)** — currency segmented control (€ EUR / ₨ PKR) · order summary card with
   line items · total in EUR (24/700 `green-800`) + `≈ PKR` equivalent (`mono`) · `accent-100` info
   note explaining PKR is indicative at today's rate, card charged in EUR · payment method radios
   (Card selected w/ focus ring; SEPA; deposit 20%) · primary "Pay €X securely".
6. **My booking** — **green-800 header** (back, title, ⋯) showing **BRN** (`mono`, 24/600) +
   package + dates; content sheet overlaps header with radius `3xl` · **live visa tracker**
   (vertical timeline: done = filled `success` dot w/ ✓ + solid connector; active = `warning` dot;
   pending = hollow `sand-300` dot/grey text) + "In progress" pill · pilgrims list (avatar initials,
   per-pilgrim BRN, visa pill) · Itinerary / Documents / Support buttons.
7. **Arabic RTL home** — full mirror of screen 1 with `dir="rtl"` and `IBM Plex Sans Arabic`;
   demonstrates required RTL behavior (mirrored layout, logical padding, Arabic-Indic numerals).

### B2B — desktop (`designs/AUJ B2B.dc.html`), shown in browser/app frames
1. **Agent login** — split: left brand panel (green radial gradient, wordmark, serif headline,
   stats) + right form (Agency code `mono`, Email, Password with Show, Remember device, Sign in,
   "Apply for an agent account").
2. **Dashboard** — 76px dark-green icon rail (Home active = white pill) + topbar (agency name,
   wallet chip, + New booking, avatar) · 4 KPI cards (`mono` values, green/red deltas) · recent
   bookings table (BRN, lead pax, pax count, visa pill, sell) · visa pipeline progress bars ·
   green credit-available card with gold progress.
3. **Multi-passenger booking (up to 49)** — header (package + Import CSV + Save draft) · left:
   passengers table with **"37 / 49 pax"** counter, rows (#, name, passport `mono`, nationality
   flag, **visa-route pill** auto-set by passport — PK→Agent, EU→e-Visa, mixed groups supported),
   add-passenger / add-10-rows actions, info note · right: group summary (line items, net total,
   your markup, client price, Pay from wallet / Hold on credit).
4. **Wallet & credit** — green gradient wallet-balance card (EUR + `≈ PKR`, Top up) · credit-limit
   card with usage bar · payment-terms card (Net 30, tier pill) · wallet transactions table
   (debits `danger`, credits `success`, running balance).
5. **Markup configuration** — left: rules table (Applies to, Scope, Markup `mono` green, On/Off
   toggle) + Add rule · right: rule editor (Applies-to select, % vs Fixed € segmented, value input
   with focus ring, **live preview** net → +markup → sell, Save).
6. **Quotation builder** — left: quote #, Draft pill, client + valid-until fields, editable line-
   items table (item/sub, qty, net, sell), Add line item · right: totals card with EUR/PKR toggle
   (net → markup → service → client total + `≈ PKR`), branded-PDF preview chip, Send quote /
   Convert to booking.
7. **Statements & exports** — filter bar (date range, product, status) + export buttons
   (CSV / XLSX / Statement PDF) · 4 summary KPIs (opening, debits, credits, closing) · statement
   table (date, ref `mono`, description, debit, credit, balance) with a highlighted closing-balance
   footer row.

---

## Interactions & Behavior
- **Navigation:** B2C is a linear booking funnel (home → results → builder → pilgrims → checkout →
  my booking). B2B is rail-based app navigation between top-level sections.
- **Visa-route auto-detection:** on entering/selecting a pilgrim's **nationality/passport**, derive
  the route — EU/EEA passport ⇒ **e-Visa** (success styling); Pakistani (and other non-eligible)
  passport ⇒ **Agent channel** (info styling). Re-evaluate on change. Mixed groups must show
  per-passenger routes. This is the central business rule — surface it prominently.
- **Currency (EUR/PKR):** EUR is the charged/source currency. PKR is a derived display value at a
  live FX rate (mock uses 1 € = ₨310.8). Show the rate and a "charged in EUR" disclaimer. Toggling
  re-labels totals; never silently convert the charged amount.
- **Pax counter:** multi-pax booking enforces a **max of 49**; show "used / 49" and seats left;
  disable add when full. CSV import populates rows.
- **Forms:** validate passport expiry (≥6 months past travel — see error state in design system),
  name-matches-passport, required docs. Inline errors use `danger` border + helper text.
- **States to build (not all drawn — infer from system):** loading skeletons (use `sand-100`
  blocks), empty states, error/retry, success confirmations, disabled buttons.
- **Focus/hover:** every interactive element needs visible focus (accent ring) for AA; buttons
  darken ~6–8% on hover; rows highlight on hover.
- **Transitions:** keep calm and quick — 150–200ms ease for hovers, sheet/modal in 200–250ms.

## State Management
- **Booking funnel (B2C):** search criteria (route, from, destination, dates, pax) → selected
  package → cart (hotel/transport/ground/flight line items) → pilgrims[] (name, dob, nationality,
  passport, derived visaRoute, documents[]) → currency → payment method → confirmed booking
  (BRN, per-pilgrim BRNs, visa-status timeline).
- **Agent portal (B2B):** session (agency code, tier), wallet balance + transactions, credit
  limit/used, markup rules[], group booking (pax[] up to 49, group totals, markup applied),
  quotations[] (line items, validity, status), statement ledger (date-range filtered).
- **Cross-cutting:** `locale` (en|lt|ur|ar) + `dir` (ltr|rtl), `theme` (light|dark), FX rate.
  Drive RTL from locale; persist theme + locale.
- **Data fetching:** package search/results, FX rate, visa-status updates (poll or webhook for
  "live" status), wallet/credit/statement reads, quotation CRUD, CSV import parsing.

## Responsive Behavior
- **B2C is mobile-first** (designs at 372px). Scale up to comfortable max-width single/two-column
  layouts on tablet/desktop; keep the search card and sticky cart patterns.
- **B2B is desktop-first** (rail + content). Collapse the rail to icons / drawer on narrow widths;
  tables become horizontally scrollable or stack into cards on mobile.
- **RTL:** use CSS logical properties (margin-inline, padding-inline, inset-inline, `start/end`)
  and `dir="rtl"` on `<html>` for AR/UR so the whole layout mirrors. The B2C Arabic home in the
  designs is the reference.

## Accessibility (WCAG AA)
- All text/background pairs in the token set meet AA. Do **not** put `gold #C8A24A` on light
  surfaces as text. On dark surfaces use `green-500`+ (not green-800) for primary text/fills.
- Provide visible focus rings, 44px min touch targets (B2C), labelled inputs, and table headers.

## Assets
- **Fonts:** IBM Plex Serif, IBM Plex Sans, IBM Plex Sans Arabic, IBM Plex Mono (Google Fonts).
  (Optional: Noto Nastaliq Urdu for authentic UR display.)
- **Logo:** an 8-point star glyph in gold `#C8A24A` on a green-800 rounded square (inline SVG in
  the designs — lift the path or replace with the final brand mark). "AUJ" wordmark set in Plex Serif.
- **Imagery:** package/hotel images are **gradient placeholders** in the mocks. Replace with real
  photography of Makkah/Madinah/Najaf-Karbala and hotels. Icons in the mocks use emoji as
  placeholders — swap for a proper icon set (e.g. Lucide/Phosphor) matching the calm, line style.
- **Flags:** nationality flags shown via emoji — use a flag asset set in production.

## Files in this bundle
- `designs/AUJ.dc.html` — launcher / overview (start here).
- `designs/AUJ Design System.dc.html` — tokens, type, components (light/dark/RTL).
- `designs/AUJ B2C.dc.html` — all six B2C screens + Arabic RTL home.
- `designs/AUJ B2B.dc.html` — all seven B2B portal screens.
- `tailwind.config.js` — Tailwind `theme.extend` with every token (colours, fonts, sizes, radii, shadows).
- `tokens.css` — the same tokens as CSS custom properties, incl. a `.dark` override block.
