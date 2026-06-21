# AUJ — Screen migration pack

One spec sheet per prototype screen. Drive Claude Code **one file at a time, in the order below**.
Open the next `NN-*.md`, paste its **Command** block at the repo root, review, merge, move on.

## Why this is a clean migration
The prototype `.dc.html` inline colours are **already your `tokens.css` values** (1:1), so this is a
token swap, not a re-theme:

| Prototype hex | Token |
|---|---|
| `#0F5132` | `--auj-green-800` / `--auj-primary` |
| `#156440` | `--auj-green-700` |
| `#1C7A4F` | `--auj-green-600` / `--auj-success` |
| `#2A9468` | `--auj-green-500` |
| `#0A3D26` / `#06251A` | `--auj-green-900` / `-950` (header gradient) |
| `#2A2620` `#4A4337` `#7A7263` | `--auj-sand-ink` / `-700` / `-500` (text) |
| `#E6DDCE` `#F1EADD` `#FAF6EF` `#FFFDFA` | `--auj-border` / `surface-alt` / `sand-50` / surface |
| `#2F6F8F` `#E2EEF3` | `--auj-accent-600` / `-100` |
| `#B5791E` `#F7EBD3` | `--auj-warning` / `-bg` |
| `#B23A2E` `#F6E0DC` | `--auj-danger` / `-bg` |
| `#C8A24A` | `--auj-gold` (logo + tiny highlights ONLY — never body text) |
| IBM Plex Serif / Sans / Sans Arabic / Mono | `next/font` families already wired |

## Golden rules (from CLAUDE.md — never break)
1. Product modules import **interfaces** (`SaudiConnector`, `TravelSupplier`) — never a concrete connector.
2. Default connector is `connector-mock`; real one only via `CONNECTOR=saudi` in prod.
3. Never block on real Saudi access — build on the mock, record assumptions in `docs/assumptions.md`.
4. Every pilgrim/price: **visa-route per pilgrim** + **EUR-charged / PKR-indicative** (`src/currency.ts`).
5. Not done until typecheck · lint · unit · contract-tests (mock) · e2e-mock are green.

## How each .dc.html maps to code
- **template markup** → JSX
- **`renderVals()` returns** → component state/hooks (the keys are your prop/var names)
- **`data-props` `$preview`** → just the design canvas size, ignore
- **pure math in the logic class** → a `packages/*` or `src/*/calc.ts` function with a unit test
- **`localStorage` keys** → keep them verbatim so saved user data survives

## Order (follows the build waves)
- 01 Visa Router  · 02 Finance Self-Assessment · 03 Predictive Analysis   ← Wave A
- 04 Pilgrim Profile · 05 Pilgrim Dashboard · 06 Booking Process · 07 Packing Organizer
- 08 Smart/Day Planner · 09 Personal Diary · 10 Companion guides · 11 Virtual Tour & wizards  ← Wave B
- 12 B2B Portal · 13 Admin: Service Providers/Saudi Connector/Nusuk/Travel Suppliers
- 14 EU Compliance · 15 Landing  ← Wave C (landing last)

Connector **Contract** and **Mock** prototypes are *reference only* — those packages already exist
(`packages/contracts`, `packages/connector-mock`); diff them, don't rebuild.
