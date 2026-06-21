---
name: smart-visit-planner
description: "Build the AUJ 'Smart Visit' planner — a fast, low-friction inquiry wizard (lead capture, NOT a full booking) that learns a pilgrim's intent in <2 minutes so the AUJ team can follow up with a real package, PLUS the day-to-day companion modules for the trip (prayer times, day/food/mosque planning, transport Makkah↔Madinah, Rawdah, ziyarah, restaurants, safety/emergency, SIM/logistics). Lives on the landing page and inside the pilgrim account. Multilingual EN/LT/UR/AR + RTL. Use when building the interest-capture funnel and the in-trip concierge."
---

# Smart Visit planner (fast inquiry → lead → AUJ sends a package)

## The idea (read first)
A pilgrim should be able to express *exactly* what they want in **under two minutes**, with **no payment
and no login required to start**. The wizard captures intent as an **Inquiry (lead)**; AUJ's team then
sends tailored real packages. This is the top-of-funnel, interest-grabbing feature — light, friendly,
mobile-first, in the pilgrim's language. It is NOT the booking funnel (`/book`) and does NOT call the
Saudi connector. Indicative prices/availability are OPTIONAL and always labelled "indicative — AUJ
confirms".

Two surfaces, one wizard:
- **Landing page** — a prominent "Plan your Smart Visit" entry; start anonymously, capture contact at the end.
- **Pilgrim account** (`/journey` / account) — the same wizard to refine, PLUS the in-trip **companion modules**.

Optional **journey tracker** toggle at the end ("keep me updated day-by-day").

Architecture fit: this is BUILD-only (lead capture + content). No `SaudiConnector` dependency. New
`Inquiry` model + an admin **Leads** view + team notification. Reuses the existing distance-to-Haram,
ziyarah catalog, visa-router (for an indicative route hint), notifications, and i18n.

---

## A. The wizard — ordered steps (the inquiry)
Keep each step to ONE decision, large touch targets, a progress bar, back/skip. Order:

1. **Where do you live?** Country → city. Use it to **suggest nearest departure airports** automatically
   (system-driven; pilgrim confirms/changes). Drives currency hint (EUR/PKR) and visa-route hint via `visa-router`.
2. **Who is travelling?** Adults + children + infants → group size. (Drives room/board guidance later.)
3. **Group or solo/family?** Solo · family · group (and group size band). Optional: women-only / mahram note.
4. **Departure airport** — show the airports near their city (from step 1), pick one or "flexible".
5. **Makkah — how long?** Nights in Makkah (stepper). 
6. **Makkah — hotel closeness** — preference by **distance to the Haram in km** (e.g. ≤300m, ≤800m, ≤2km, any).
   Map to `HotelOffer.distanceToHaramM`. Show indicative partner hotels OPTIONALLY (toggleable).
7. **Makkah — what to visit** — checklist of famous ziyarah places (Jabal al-Nour/Hira, Mina, Arafat,
   Muzdalifah, Jabal Thawr, etc.) from the existing ziyarah catalog. "Pick what interests you."
8. **Makkah → Madinah travel** — mode: **Haramain high-speed train** (≈2–2.5h) · bus · private car · group coach;
   private vs group; **preferred date & approximate time** to leave. (See Transport research below.)
9. **Madinah — how long + hotels** — nights; hotel closeness by **km to Masjid an-Nabawi**; show near partners OPTIONALLY.
10. **Madinah — Rawdah (Riyadh ul-Jannah)** — capture intent + preferred day/time window. NOTE the permit is
    booked by the pilgrim in the **Nusuk app** (we capture intent + deep-link/guide; we do not issue it).
11. **Madinah — what to visit** — ziyarah checklist (Quba, Uhud, Qiblatain, Trench/Khandaq…) + restaurant
    preference (cuisine / top-rated near hotel).
12. **Return** — choose: fly out of **Madinah**, OR return **Makkah → Jeddah (KAIA)**; return transport mode
    (train/bus/car); **optional 1-day Jeddah stop** if the flight schedule needs it.
13. **Your dates & contact** — rough travel window + name, email/phone, preferred language & contact channel
    (WhatsApp/email/call) + **consent** to be contacted. Optional: "create an account to save & track."
14. **Done** — "AUJ will send you tailored packages." Optional toggle: **enable the journey tracker**.

Design: each step has a sensible default and "skip / decide later". Show a **live summary chip** of choices.
At submit → persist `Inquiry`, notify the AUJ team, thank-you screen.

---

## B. Companion modules (in the pilgrim account, after the inquiry / once travelling)
Ordered for a real day on the ground. These READ official/live sources — never hard-code times/permits.

1. **Prayer times & jamaat** — today's 5 salah times for **Makkah** and **Madinah**, with the **iqamah/jamaat**
   offset, next-prayer countdown, and Jumu'ah note. Source from an official prayer-times feed (Umm al-Qura /
   a prayer-times API keyed by city/coords); never store static times.
2. **Day plan (ibaadat-first)** — a suggested daily rhythm centred on the five prayers: pre-salah departure to
   the mosque (with walk-time from the hotel), in-mosque ibaadat windows, Quran/dhikr blocks, rest, and free
   ziyarah slots. "Plan your day around the jamaat."
3. **Mosque travel planning** — before/after each namaz: when to leave the hotel (crowd buffer), gate guidance,
   women's sections, shoe-storage note, return route. Uses hotel↔Haram distance.
4. **Food management** — meal windows that fit around salah; top-rated / highly-rated restaurants near the
   hotel (maps/places integration); halal-by-default; dietary needs from the booking.
5. **Rawdah & ziyarah time management** — Rawdah appointment reminder + a route to fit more ziyarah places into
   a day efficiently (cluster by area/time).
6. **Local tech for pilgrims** — surface what's available: the **Nusuk app** (permits, services), smart e-gates,
   electric/golf carts for the elderly & disabled, Zamzam dispensers, crowd-flow guidance, and the **Asefny**
   emergency app. Link out; don't reimplement.
7. **Safety & emergencies** — one-tap card: **911** (unified emergency in Makkah/Madinah), **997** ambulance
   (Saudi Red Crescent), **999** police, **998** civil defence; nearest hospitals (maps); the **Asefny** app
   (GPS + nearest hospital). Show the pilgrim's hotel address + group leader contact.
8. **Insurance** — surface travel/health insurance options (partner) appropriate to the EU operator duties.
9. **Logistics concierge** — SIM card (where/how on arrival), ihram clothing & footwear management (incl. shoe
   storage at the mosque), luggage, and "request assistance" (wheelchair, elderly support).
10. **Day-to-day status / tracker** — opt-in timeline: pre-departure checklist → arrival → each day's plan →
    return, with reminders. Ties to the existing booking status timeline when they convert.

---

## C. Research notes & live data sources (verify before each season; do NOT hard-code)
- **Rawdah / Riyadh ul-Jannah permit** — booked via the **official Nusuk app** (Ministry of Hajj & Umrah);
  required for men & women; weekly slots that fill fast; book before arriving in Madinah. We capture intent and
  guide/deep-link to Nusuk — we do not issue the permit.
- **Makkah ↔ Madinah transport — Haramain High-Speed Railway**: ≈**2–2.5 hours** (vs 5–6h by road), up to
  300 km/h; **5 stations** incl. **Jeddah / King Abdulaziz Airport (KAIA)** and KAEC; Makkah station ≈3.5km from
  the Haram, Madinah station ≈10–20 min from the Prophet's Mosque. Alternatives: SAPTCO/coach, private car.
- **Prayer times** — use an official/Umm al-Qura-based source by city; iqamah offsets differ Makkah vs Madinah.
- **Emergency** — 911 (unified Makkah/Madinah/Riyadh/Eastern), 997 ambulance (SRCA), 999 police, 998 civil
  defence; **Asefny** SRCA app (GPS, nearest hospital). English widely spoken in clinical settings.
- **Hotels** — reuse `HotelOffer.distanceToHaramM` + `nusukApproved`; show distance in km/m.
- **Restaurants / maps / nearest hospital** — a maps/places provider (e.g. Google Places) behind a port; keep
  it swappable like the other connectors.

(All of the above are pointers/integrations — the wizard itself needs none of them to capture a lead.)

---

## D. Data model & wiring (AUJ architecture)
- **`Inquiry` (NEW)** — a lead, separate from `Booking`: `{ id, createdAt, contact{name,email,phone,channel,lang,consent},
  residence{country,city}, departureAirport, party{adults,children,infants,kind:solo|family|group},
  makkah{nights,hotelDistanceBand,ziyarah[]}, transferToMadinah{mode,when}, madinah{nights,hotelDistanceBand,
  rawdahWindow,ziyarah[],dining}, return{from:MADINAH|JEDDAH,mode,jeddahStopover}, window{from,to},
  trackerOptIn, status: NEW|CONTACTED|QUOTED|CONVERTED|CLOSED, visaHint }`. Put it in `core-booking` (or a small
  `leads` module) behind a repository port; in-memory + Postgres adapters like the rest.
- **No connector/payment.** Optional indicative pricing from curated/mock data, clearly labelled.
- **Notify the AUJ team** on submit via `@auj/notifications` (email/WhatsApp webhook).
- **Admin → Leads** view: list inquiries, filter by status, mark CONTACTED/QUOTED/CONVERTED, open detail; a
  one-click "convert to booking" that pre-fills `/book` (or the agent portal).
- **i18n** — new `smartvisit` namespace in all 4 catalogs (EN/LT/UR/AR) + RTL; mobile-first.
- **Imagery/logo** — refine the logo separately; for hero/scene photography use the existing `scenes.ts`
  manifest seam to drop in **licensed** Makkah/Madinah photography (do not ship copyrighted images). On-brand
  SVG scenes remain the fallback.

## E. Where it lives
- **Landing** (`/`): a "Plan your Smart Visit" wizard — start anonymous; capture contact at step 13.
- **Pilgrim account**: the wizard (saved/editable) + the companion modules (B).
- **Optional tracker** from step 14.

## F. Build phases (gate each on the previous; mock-first)
- **Phase 1 — Inquiry wizard + leads (highest value, no integrations):** steps A1–A14, `Inquiry` model +
  repo (in-memory + Postgres), submit → persist + team notification, Admin **Leads** view, full i18n + RTL,
  mobile-first, on landing + account. Indicative content only.
- **Phase 2 — Companion essentials:** prayer times (live API), day plan + mosque-travel timing, safety/emergency
  card, transport options (Haramain), Rawdah intent + Nusuk guidance, restaurants (maps port).
- **Phase 3 — Concierge & integrations:** tracker, insurance partner, SIM/clothing/assistance, deeper maps,
  and convert-to-package handoff.

## G. Acceptance criteria
- Wizard completes in <2 min on mobile; works EN/LT/UR/AR with correct RTL; every step skippable with defaults.
- Submit creates a persisted `Inquiry` and notifies the team; Admin can list/manage/convert leads.
- Zero payment/connector dependency; any prices shown are labelled "indicative".
- Companion modules read official/live sources where factual (prayer times, permits, transport, emergency);
  nothing safety-related is hard-coded; emergency numbers shown exactly (911/997/999/998 + Asefny).
- CI gate green: typecheck · lint · unit · contract-tests (unaffected) · e2e-on-mock; new wizard + leads tests.
