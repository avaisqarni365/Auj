---
name: AUJ Hotels
description: "The Makkah & Madinah hotel browsers — a /hotels/[city] distance-band directory of named hotels by walking distance to the Haram, handing off to /book."
---

# AUJ Hotels

## What it is
Curated, reference-only directories that organise hotels by **walking distance** to Masjid al-Haram
(Makkah) and Masjid an-Nabawi (Madinah) — band by band, with walk time, district, and named hotels
(star rating + approximate distance). No live rates, no SaudiConnector; selecting a band hands off to
the `/book` funnel.

## Source prototypes (in this folder)
`AUJ Makkah Hotels.dc.html` · `AUJ Madina Hotels.dc.html`

## Where the logic lives (one shared component)
- **Route:** `apps/web/app/hotels/[city]/page.tsx` → city ∈ makkah · madinah (`generateStaticParams`; `notFound()` otherwise)
- **Component:** `apps/web/src/hotels/HotelsBrowser.tsx` (shared by both cities)
- **Data:** `apps/web/src/hotels/hotels-data.ts` — `HOTEL_CITIES`, `hotelsForCity`, `isHotelCity`; ~50 named hotels across 5 distance bands per city (server-side reference data, no pg)
- **Hand-off:** "Book in this band" → `/book?city=MAKKAH|MADINAH`
- Surfaced from the landing frames 08/09 (`src/content.ts` → `/hotels/makkah`, `/hotels/madinah`)

## Design
Cinematic `ScreenFrame`; a green band "stage" with a clickable distance rail (`Any airport`-style
"Any band" + the bands) and a white hotel list (star chip + name + note + distance), with prev/next
("Closer"/"Further") + dot pagination. `@auj/ui` tokens only; RTL; design-taste motion ≤300ms.

## Data & backend
Reference data is a typed server module (`hotels-data.ts`) read by the server component — a real
server-side source, no localStorage. Pricing/availability deliberately deferred to `/book`.

## Acceptance criteria
- [ ] `/hotels/makkah` and `/hotels/madinah` render the band browser with the curated hotels.
- [ ] Band rail + list + prev/next; hands off to `/book`; ScreenFrame + tokens; RTL.

## Status
Live and matching the prototypes. Cosmetic deviation: the band rail renders vertically in the green
stage rather than the prototype's top horizontal rail (not a blocker).
