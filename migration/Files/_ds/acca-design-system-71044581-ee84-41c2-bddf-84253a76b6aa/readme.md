# ACCA Design System

> Warm, Claude.ai-inspired design system for **ACCA** — a German cloud-accounting SaaS by **Enviree UG** (Essen, Germany).

This project is the design system: tokens, fonts, reusable React primitives, foundation specimen cards, and full-screen UI-kit recreations of the ACCA product surfaces. Consuming projects link one file — `styles.css` — and render components from the bundled runtime.

---

## 1. Product context

**ACCA** is a multi-tenant cloud accounting + tax-compliance platform built for the German market. It serves three audiences from one codebase:

- **Tax advisers (Steuerberater)** — manage 50–300+ client businesses, DATEV/ELSTER, StBVV billing.
- **Bookkeepers (Buchhalter)** — AI bookkeeping pipeline (PDF → OCR → AI → Soll/Haben → DATEV).
- **Businesses** — 14 industry profiles (Taxi, Gastro, Hotel, Bau, IT…), invoicing, VAT, reports.

Deeply German: SKR03/04 charts of accounts, GoBD audit-proofing, ELSTER UStVA/ZM filing, §14 UStG validation, DATEV EXTF export, 22 Rechtsformen. Primary UI language is **German**; the product also ships EN/TR/FA/AR/UK.

The visual language is explicitly **"Claude.ai-inspired"**: warm terracotta accent on sand neutrals, whisper-soft shadows, generous rounding, dense and calm.

### Sources this system was built from
- **Codebase:** `ACCA/` monorepo (Turborepo + npm workspaces), attached locally.
  - `packages/design-system/src/index.ts` — original design tokens.
  - `packages/ui/src/*.tsx` — the React component library (Button, Card, Badge, Input, Select, Toggle, Tabs, Avatar, Modal, …).
  - `apps/web-platform/` — Next.js 14 app: `tailwind.config.js`, `styles/globals.css`, `pages/index.tsx` (landing), `pages/dashboard.tsx`, `pages/login.tsx`, `components/layouts/` (DashboardLayout, nav-config, nav-icons), `data/landing-content.ts`.
  - `docs/PROJECT_PROMPT.md` — full product/architecture reference.
- No Figma file or slide decks were provided.

---

## 2. Content fundamentals — how ACCA writes

- **Bilingual, German-first.** App chrome and product copy are German (`Rechnungen`, `Offene Posten`, `Buchungssatz`, `Kostenlos starten`). English labels exist as fallbacks. When in doubt, write German.
- **Voice:** professional, plain, reassuring — never playful or salesy in-app. Marketing is confident but factual ("14 Branchenprofile. KI-Buchführung. DATEV & ELSTER Integration.").
- **Person:** addresses the user as **Sie** (formal). Headlines speak to outcomes ("Cloud-Buchhaltung für Deutschland", "Von der Rechnung zum Buchungssatz in Sekunden").
- **Casing:** Sentence case for UI labels and headings; German nouns capitalized normally. Eyebrow/section labels are UPPERCASE with wide tracking. No Title Case Everywhere.
- **Domain terms stay in German** even in English UI: UStVA, DATEV, GoBD, SKR03, Soll/Haben, Kreditor/Debitor, Jahresabschluss. These are terms of art — never translate them.
- **Numbers:** German formatting — `€ 12.480,00` (period thousands, comma decimal), dates `DD.MM.YYYY`. Always tabular-nums + mono for amounts, account numbers, IBANs, voucher numbers (`RE-2026-00148`).
- **Emoji:** used **only on marketing/landing surfaces** — for the 14 industry profiles (🚕🍽️🏨🚚) and the AI pipeline (📄👁️🤖). **Never** in the app chrome, which uses the outline SVG icon set. Don't introduce emoji into product UI.
- **Trust signals** recur: "GoBD-konform", "DSGVO", "DATEV-Partner", "Made in Germany".

---

## 3. Visual foundations

**Color.** Warm terracotta accent (`--accent-600 #c47a3a`) on warm-gray **sand** neutrals (`#faf9f7` → `#3d3930`). Conventional status ramps: green success, amber warning, red error, blue info. The page background is warm off-white `--surface-page #faf9f7`; cards are pure white. Accent is reserved for primary actions, active states, links, and brand — neutrals carry the rest. Marketing hero/CTA bands add a signature accent→violet gradient; the app uses an accent→amber gradient hero. Avoid blue/purple gradients anywhere in the app chrome.

**Type.** Sans for everything; mono for figures and codes. Production ships **Styrene A** (sans) and **Söhne Mono** (mono) — Klim Type Foundry faces (same as Claude.ai). ⚠ Those are not redistributable, so this system substitutes **Hanken Grotesk** (sans) and **JetBrains Mono** (mono) via Google Fonts; the `--font-sans` / `--font-mono` tokens list the real family names first so licensed installs render exactly. Tracking is tight and optical (`-0.02em` headings, `-0.011em` body). App body is a dense **14px**; marketing scales up to 48px heroes.

**Spacing & radius.** 4px base grid. Rounding is generous and never sharp — **`--radius-xl` (14px) is the default** for cards and controls; pills/avatars are fully round. Modals use 16px, feature panels 20px.

**Elevation.** Whisper-soft, low-contrast shadows — depth comes from **1px sand borders first**, shadow second. `soft` → `card` → `elevated` → `modal`. No heavy drop-shadows, no neumorphism.

**Cards.** White fill, `1px solid --sand-200` border, 14px radius; optional soft `--shadow-card`. Header/footer separated by 1px sand rules. Ghost variant = sand-50 fill, transparent border.

**Borders.** Hairline `--sand-200`/`--sand-300`. Inputs: `--sand-300`, hover `--sand-400`, focus = accent border + soft accent ring (`--focus-ring`, 3px @ 12% accent).

**Motion.** Short and eased, never bouncy: `120ms / 200ms / 300ms ease`. Fades and 4px slide-ups for entrances; subtle `scale(0.97)` on button press. Focus rings appear on keyboard nav only.

**States.** Hover = a step up the sand scale (or accent-700 on the primary button). Active/press = a further step down + slight scale-in. Disabled = 50% opacity, no pointer events. Status uses the tinted-50 background + 700 text + inset 200 ring pattern (see Badge).

**Imagery.** The product is data-dense and uses almost no photography. Marketing leans on emoji tiles and gradient panels rather than stock imagery. There are no illustration assets in the codebase.

**Backgrounds.** Flat warm neutrals. The only gradients are the two hero/CTA bands; everything else is solid sand or white.

---

## 4. Iconography

- **App chrome** uses a **custom outline icon set** — 20×20 viewBox, `stroke="currentColor"`, 1.5 stroke weight, round caps/joins, no fills, rendered ~18px. Lifted verbatim from `nav-icons.tsx` into **`assets/icons.js`** (`window.accaIcon(name, size)` / `ACCA_ICON_PATHS`). See the **Iconography** card (Brand group) for the full set: dashboard, invoice, debtor, kreditor, banking, vat, datev, chart, closing, collab, ai, team, settings, bell, etc.
- **Use this set** for any app/product surface. Color it via `color:` on the parent (it inherits `currentColor`).
- **Marketing/landing** additionally uses **emoji** as category icons (industries, AI pipeline). Keep emoji to marketing; never in app chrome.
- No icon font, no Lucide/Heroicons dependency, no PNG icons. If you need a glyph that isn't in the set, draw it in the same outline style (20×20, 1.5 stroke, round caps) rather than importing a different family.
- The **logo** is a rounded terracotta square (`--accent-600`, `--radius-xl`/`2xl`) with a white bold **"A"**, beside the **ACCA** wordmark and a small "by Enviree UG". See the **Logo & Wordmark** card. The "A" stays white; the square may sit on accent-600, accent-700, or sand-900.

---

## 5. Index / manifest

**Root**
- `styles.css` — global entry point (consumers link this). `@import`s tokens + base + components.
- `readme.md` — this file.
- `SKILL.md` — Agent-Skill front matter for Claude Code use.
- `INTEGRATION.md` — how to adopt this system in the **live ACCA repo** (Tailwind + `@acca/ui` parity, token cheat-sheet, theming). Read this before writing production code.

**Tokens** (`tokens/`, all reached from `styles.css`)
- `fonts.css` — webfont loading (Google Fonts substitutes; see font note above).
- `colors.css` — accent + sand scales, status ramps, semantic text/surface/border aliases.
- `typography.css` — font families, size scale, weights, line-heights, tracking.
- `spacing.css` — 4px spacing scale + radius scale.
- `effects.css` — shadows, transitions, z-index.
- `base.css` — element resets, base type, scrollbar, reusable surface utilities.

**Components** (`components/`)
- `components.css` — class-based styling for the primitives (native hover/focus/active).
- `core/` — `Button`, `Badge`, `Avatar`, `Input`, `Select`, `Switch`, `Tabs`, `Card`, `StatCard`, `Modal`. Each: `.jsx` + `.d.ts` + `.prompt.md`. Cards: `buttons`, `forms`, `display`, `containers`.
- Reach them at runtime via `const { Button } = window.ACCADesignSystem_710445` after loading `_ds_bundle.js`.

**Foundation cards** (`guidelines/`) — Colors (accent, sand, semantic, roles), Type (display, body, mono), Spacing (scale, radius, elevation).

**Assets** (`assets/`) — `icons.js` (outline icon set + helper), `iconography.card.html`, `brand.card.html`.

**UI kits** (`ui_kits/`)
- `platform/` — interactive ACCA web-app shell (login → dashboard → invoices). React, composes the primitives.
- `marketing/` — public landing-page recreation (single HTML).

---

## 6. Caveats
- **Fonts substituted** — Styrene A / Söhne Mono are proprietary; Hanken Grotesk / JetBrains Mono stand in. Drop licensed `.woff2` into `assets/fonts/` and swap the `@import` in `tokens/fonts.css` for `@font-face` rules to render pixel-accurate.
- No Figma or decks were provided; everything is sourced from the codebase. Components are cosmetic recreations (not the production Tailwind implementations) but match the visual contract.
