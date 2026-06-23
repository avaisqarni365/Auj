---
name: AUJ Visa Router
description: "Build the AUJ Visa Router — a pure, deterministic eligibility engine that routes each pilgrim to the correct visa channel (direct Saudi e-Visa vs MoRA/agent channel) from passport nationality + residence/qualifying visa, with a readable decision trace and seasonal-suspension warnings. Pure domain logic, NO network/IO; eligibility lists and seasonal suspensions are config, updatable without code. Lives in packages/visa-router (routeFor) and is consumed by booking + both apps; the ADMIN QA/demo surface is /admin/visa. Submitting the visa is the connector's job — the router only decides the route. Use when building/refining visa routing."
---

# AUJ Visa Router — eligibility engine + admin demo

## What it is
The deterministic engine that decides **which visa channel** a pilgrim uses: the direct **Saudi
e-Visa** (applied online, no MoRA operator) or the **agent channel** (a MoRA-licensed operator via
Nusuk Masar, handled by AUJ's approved partner). It is **pure domain logic** — `routeFor(pilgrim)`
takes nationality + residence/qualifying visa and returns a route, warnings, and a decision trace.
Eligibility follows the **traveller, never the company**. No network, no IO. It only *decides the
route* — actually *submitting* the visa is the connector's job.

## Source prototype
`AUJ Visa Router.dc.html` — header "ELIGIBILITY ENGINE · PURE DOMAIN · NO I/O / routeFor(pilgrim)";
a **Pilgrim** input card (nationality select, residence/qualifying-visa select); a **Route** result
card (Saudi e-Visa vs Agent channel, with route code `EVISA_DIRECT` / `AGENT_CHANNEL`, description,
and an amber seasonal-suspension warning when applicable); and a **Decision trace** (nationality on
e-visa list · qualifying residence/used visa · GCC resident · seasonal-suspension check) with
pass/neutral marks. Footer note: lists + seasonal suspensions are config, updatable without code;
submitting is the connector's job.

## Route & files
- Engine: `packages/visa-router/src` — `routeFor()` and `routeForGroup()` in `router.ts`,
  `DEFAULT_VISA_CONFIG` in `config.ts`, unit tests in `router.test.ts`. Exported from `index.ts`.
- Types: `packages/contracts` (`Pilgrim`); result `VisaRouting` = `{ route, warnings, trace }` where
  `trace: TraceStep[]` (`check: 'nationality'|'residence'|'seasonal'`, `pass`, `detail`) is produced by
  the PURE engine and rendered verbatim by the demo (no UI recomputation). Trace is unit-tested.
- Admin QA/demo route: `/admin/visa` (ADMIN only via `requireRole(['ADMIN'])`, in `SitePage`).
- Demo page: `apps/web/app/admin/visa/page.tsx`.
- Demo component: `apps/web/src/admin/VisaRouterDemo.tsx` (calls `routeFor` live, uses `ScreenFrame`
  + `@auj/ui` `StatusPill`).
- Also consumed on the public Landing (`apps/web/src/Landing.tsx` imports `routeFor`) and the booking
  funnel.

## Design
The admin demo uses the cinematic `ScreenFrame` shell (dark-green gradient header, logo chip, mono
label) matching the Landing's frame-by-frame language. `@auj/ui` tokens only — green-800/green-950,
sand surfaces, gold accent, IBM Plex Serif/Sans/Mono; `StatusPill` for the route. Result card tone
swaps by route (green = e-Visa, blue = agent channel); amber warning callout for seasonal
suspension; mono decision-trace rows with pass/neutral dots. Reduced-motion honoured; AA contrast;
design-taste pass (≤300ms transform/opacity). The engine package itself is headless — no UI.

## Data & backend
**Pure function, zero IO.** `routeFor` reads only its input pilgrim + the eligibility config
(`DEFAULT_VISA_CONFIG`): e-visa nationality list, qualifying-residence rules, GCC handling, and
seasonal-suspension windows — all **config, updatable without a code change**. It performs **no
connector call**: it sits *before* the `SaudiConnector` seam and tells booking/Nusuk which channel
to use; submitting the application is the connector's job. Deterministic and fully unit-tested so the
same input always yields the same route + trace.

## Acceptance criteria
- [ ] `routeFor(pilgrim)` is pure (no network/IO) and returns route + warnings + decision trace.
- [ ] e-Visa vs agent-channel decision derives from nationality + residence/qualifying visa + GCC;
      eligibility comes from config, not hard-coded branches in callers.
- [ ] Seasonal-suspension warning surfaces without changing the route.
- [ ] `/admin/visa` demo is ADMIN-gated, renders in `SitePage` + `ScreenFrame`, calls `routeFor`
      live, and shows the route, code, description and full decision trace.
- [ ] The router never imports or calls a connector; submitting the visa stays the connector's job.
- [ ] Unit tests cover the route matrix; design-taste pass; `@auj/ui` tokens; reduced-motion honoured;
      typecheck/lint/unit/e2e-mock green.

## Status
**Live** — `@auj/visa-router` (`routeFor`/`routeForGroup` + `DEFAULT_VISA_CONFIG`) is built and
consumed by the Landing and booking; the ADMIN QA/demo is live at `/admin/visa` via
`VisaRouterDemo`. Matches the prototype.
