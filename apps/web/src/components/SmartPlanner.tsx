'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { BrandMark } from './BrandMark';
import { Combobox, type ComboOption } from './Combobox';
import { SendInquiryPanel, type InquiryContact } from './SendInquiryPanel';
import { COUNTRIES, airportLabel, airportsFor, anyAirport } from '../geo/airports';
import { airportCode, bookHref as buildBookHref, visaRoute } from './smart-planner-derive';
import type { InquiryInput } from '../leads/inquiry';

// Searchable country list (Europe + UK + Pakistan) for the airline-style picker.
const COUNTRY_OPTIONS: ComboOption[] = COUNTRIES.map((c) => ({ value: c, label: c }));

// Smart Visit planner — split-panel configurator from AUJ Smart Planner.dc.html.
// Dark-green aside (logo + title + 7-step rail + skyline) and a form panel
// (progress + step + footer nav). Seven calm steps: Origin → Journey → Dates →
// Travellers → Stay → Visa → Review, ending in "See N packages" → /book.

type Journey = 'Umrah' | 'Hajj' | 'Ziyarat';

interface PlanData {
  country: string;
  city: string;
  airport: string;
  journey: Journey;
  month: string;
  nights: number;
  flexible: boolean;
  pilgrims: number;
  rooms: number;
  distance: string;
  stars: string;
  board: string;
  nationality: string;
}

const INITIAL: PlanData = {
  country: 'Lithuania',
  city: '',
  airport: 'Vilnius (VNO)',
  journey: 'Umrah',
  month: 'September 2026',
  nights: 14,
  flexible: true,
  pilgrims: 4,
  rooms: 2,
  distance: 'Near (≤300m)',
  stars: '5★',
  board: 'Half board',
  nationality: 'Mixed (EU + Pakistani)',
};

// Step identity keys — labels/questions/subs are translated; the index drives RAIL_ICON.
const STEP_KEYS = ['origin', 'journey', 'dates', 'travellers', 'stay', 'visa', 'review'] as const;
const STEP_COUNT = STEP_KEYS.length;

const COUNTS: Record<Journey, number> = { Umrah: 38, Hajj: 6, Ziyarat: 14 };

// Journey icons (blurb/tag/name come from i18n).
const JOURNEY_ICONS: Record<Journey, JSX.Element> = {
  Umrah: <path d="M12 3l7 4v10l-7 4-7-4V7z M5 7l7 4 7-4M12 11v10" />,
  Hajj: <path d="M7 21V4 M7 5h10l-2.5 3.5L17 12H7" />,
  Ziyarat: <path d="M4 20v-7M20 20v-7M4 13h16 M12 3c2.5 2 4 4.2 4 7H8c0-2.8 1.5-5 4-7z M3 20h18" />,
};

// Canonical option values kept in state (so all logic/derived/inquiry stay stable); only the
// DISPLAY label is translated, via these value→message-key maps.
const MONTH_KEY: Record<string, string> = { 'September 2026': 'sep26', 'October 2026': 'oct26', 'November 2026': 'nov26', 'December 2026': 'dec26', 'Ramadan 2027': 'ram27', "I'm flexible": 'flex' };
const DISTANCE_KEY: Record<string, string> = { 'Near (≤300m)': 'near', 'Walking (≤800m)': 'walking', 'Any distance': 'any' };
const BOARD_KEY: Record<string, string> = { 'Room only': 'room', Breakfast: 'breakfast', 'Half board': 'half', 'Full board': 'full' };
const NAT_KEY: Record<string, string> = { 'All EU / EEA passports': 'eu', 'All Pakistani passports': 'pk', 'Mixed (EU + Pakistani)': 'mixed', 'Other nationality': 'other' };
const MONTH_VALUES = Object.keys(MONTH_KEY);
const DISTANCE_VALUES = Object.keys(DISTANCE_KEY);
const BOARD_VALUES = Object.keys(BOARD_KEY);
const NAT_VALUES = Object.keys(NAT_KEY);

const RAIL_ICON = [
  'M10 2.5a4.5 4.5 0 0 1 4.5 4.5c0 3.2-4.5 9-4.5 9S5.5 10.2 5.5 7A4.5 4.5 0 0 1 10 2.5z M10 5.4a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2z',
  'M10 2.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15z M13.2 6.8l-2 4.4-4.4 2 2-4.4z',
  'M5.5 4.5h9a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z M3.5 8h13M6.5 3v3M13.5 3v3',
  'M7.5 5.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z M3 16c0-2.4 2-4 4.5-4s4.5 1.6 4.5 4 M13 6.2a2.3 2.3 0 0 1 0 4.6M14 15.8c0-1.9.8-3 2.5-3.4',
  'M3 8.5V16M3 12h14v4M17 16v-3.5a2 2 0 0 0-2-2H9 M6 7.9a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6z',
  'M6.5 3h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z M10 6.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4z M7.5 13h5',
  'M5.5 4.5h9a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2V6.5a2 2 0 0 1 2-2z M7.5 4.5V3.5h5v1 M7.6 11l1.7 1.7L13 9',
];

export function SmartPlanner() {
  const t = useTranslations('smartPlanner');
  const locale = useLocale();
  const [step, setStep] = useState(0);
  const [d, setD] = useState<PlanData>(INITIAL);
  const set = (patch: Partial<PlanData>): void => setD((s) => ({ ...s, ...patch }));
  const go = (i: number): void => setStep(Math.max(0, Math.min(STEP_COUNT - 1, i)));

  const matchCount = COUNTS[d.journey];

  // Translate canonical option values + proper nouns for display only.
  const tMonth = (v: string): string => (MONTH_KEY[v] ? t(`months.${MONTH_KEY[v]}`) : v);
  const tDistance = (v: string): string => (DISTANCE_KEY[v] ? t(`distances.${DISTANCE_KEY[v]}`) : v);
  const tBoard = (v: string): string => (BOARD_KEY[v] ? t(`boards.${BOARD_KEY[v]}`) : v);
  const tNat = (v: string): string => (NAT_KEY[v] ? t(`nationalities.${NAT_KEY[v]}`) : v);
  const journeyName = (k: Journey): string => t(`journeys.${k}.name`);

  // Airports for the selected country: a translated "Any airport" option, then that country's airports.
  const airportOptionsFor = (country: string): ComboOption[] => [
    { value: anyAirport(country), label: t('anyAirport'), hint: 'ANY', search: `any all ${country}` },
    ...airportsFor(country).map((a) => ({ value: airportLabel(a), label: a.city, hint: a.code, search: `${a.city} ${a.code}` })),
  ];

  // Visa route is computed from the canonical nationality value; copy is translated.
  const route = useMemo(() => visaRoute(d.nationality), [d.nationality]);
  const routeTitle = t(`routes.${route.key}.title`);
  const routeTag = t(`routes.${route.key}.tag`);
  const routeBody = t(`routes.${route.key}.body`);

  const subFor = (i: number): string => {
    switch (i) {
      case 0: return d.city ? `${d.city} · ${d.airport}` : d.airport;
      case 1: return journeyName(d.journey);
      case 2: return t('railValues.nightsMonth', { nights: d.nights, month: tMonth(d.month) });
      case 3: return t('railValues.paxRooms', { pax: d.pilgrims, rooms: d.rooms });
      case 4: return t('railValues.starsDist', { stars: d.stars, dist: tDistance(d.distance) });
      case 5: return t(`railValues.${route.key}`);
      default: return t('railValues.matches', { n: matchCount });
    }
  };

  const summary: { label: string; value: string }[] = [
    { label: t('summary.from'), value: `${d.city ? `${d.city}, ` : ''}${d.country}` },
    { label: t('summary.airport'), value: d.airport },
    { label: t('summary.journey'), value: journeyName(d.journey) },
    { label: t('summary.when'), value: `${d.nights} ${t('units.nights')} · ${tMonth(d.month)}` },
    { label: t('summary.travellers'), value: t('railValues.paxRooms', { pax: d.pilgrims, rooms: d.rooms }) },
    { label: t('summary.hotel'), value: `${d.stars} · ${tDistance(d.distance)}` },
    { label: t('summary.board'), value: tBoard(d.board) },
    { label: t('summary.visaRoute'), value: routeTitle },
  ];

  const bookHref = useMemo(
    () => buildBookHref({ journey: d.journey, pilgrims: d.pilgrims, rooms: d.rooms, nights: d.nights, airport: d.airport, stars: d.stars }),
    [d],
  );

  const progressPct = Math.round(((step + 1) / STEP_COUNT) * 100);

  // Map the plan + captured contact into a lead the AUJ team can follow up.
  const buildInquiry = (c: InquiryContact, consent: boolean): InquiryInput => ({
    country: d.country,
    city: c.address || d.city,
    departureAirport: airportCode(d.airport) || d.airport,
    adults: d.pilgrims,
    children: 0,
    infants: 0,
    partyKind: d.pilgrims > 1 ? 'FAMILY' : 'SOLO',
    makkahNights: d.nights,
    makkahHotelBand: d.distance,
    makkahZiyarah: [],
    transferMode: 'FLEXIBLE',
    transferPrivate: false,
    transferTime: 'FLEXIBLE',
    madinahNights: 0,
    madinahHotelBand: d.distance,
    rawdah: false,
    madinahZiyarah: [],
    dining: 'NO_PREF',
    returnFrom: 'MADINAH',
    returnMode: 'FLEXIBLE',
    jeddahStopover: false,
    trackerOptIn: true,
    name: c.name,
    email: c.email,
    phone: c.phone,
    channel: 'WHATSAPP',
    lang: locale,
    consent,
  });

  return (
    <div className="mx-auto w-full max-w-[1080px]">
      {/* tabs */}
      <div className="mb-[clamp(16px,3vw,28px)] flex flex-wrap gap-2.5">
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-green-800 shadow-[0_6px_16px_rgba(15,81,50,0.12)]">
          <PlannerTabIcon /> {t('tabs.current')}
        </span>
        <TabLink href="/#search">{t('tabs.search')}</TabLink>
        <TabLink href="/guide">{t('tabs.guide')}</TabLink>
        <TabLink href="/guide/tour">{t('tabs.tour')}</TabLink>
      </div>

      {/* card */}
      <div className="flex flex-col overflow-hidden rounded-[26px] border border-sand-200 bg-white shadow-[0_40px_90px_-40px_rgba(42,38,32,0.5)] md:flex-row">
        {/* ASIDE */}
        <aside className="relative shrink-0 overflow-hidden bg-gradient-to-br from-green-700 via-green-900 to-green-950 p-[clamp(22px,2.4vw,30px)] text-green-50 md:w-[336px]">
          <span aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'repeating-linear-gradient(135deg, #fff 0 2px, transparent 2px 12px)' }} />
          {/* stars */}
          <span aria-hidden className="absolute left-[24%] top-[18%] h-0.5 w-0.5 rounded-full bg-green-50 shadow-[0_0_5px_#fff]" />
          <span aria-hidden className="absolute left-[62%] top-[30%] h-[2.5px] w-[2.5px] rounded-full bg-gold shadow-[0_0_6px_#C8A24A]" />
          <span aria-hidden className="absolute left-[78%] top-[12%] h-0.5 w-0.5 rounded-full bg-green-50 shadow-[0_0_5px_#fff]" />
          {/* crescent */}
          <span aria-hidden className="absolute right-6 top-6 h-[34px] w-[34px] rounded-full bg-sand-50 shadow-[0_0_22px_rgba(244,236,214,0.4)]">
            <span className="absolute -left-[7px] -top-[5px] h-[34px] w-[34px] rounded-full bg-green-900" />
          </span>

          <div className="relative z-10">
            <span className="inline-flex items-center rounded-[13px] bg-sand-50 px-3 py-2 shadow-[0_8px_22px_rgba(0,0,0,0.28)]">
              <BrandMark height={44} />
            </span>
            <h2 className="mt-5 font-serif text-2xl font-semibold tracking-[-0.01em] text-green-50">{t('asideTitle')}</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-green-100/80">{t('asideSub')}</p>
          </div>

          {/* RAIL (md+) */}
          <div className="relative z-10 mt-7 hidden flex-col md:flex">
            {STEP_KEYS.map((key, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <button key={key} type="button" onClick={() => go(i)} className="flex items-start gap-3.5 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60">
                  <span className="flex shrink-0 flex-col items-center">
                    <span
                      className={`grid h-[30px] w-[30px] place-items-center rounded-full border-2 transition-colors duration-200 ${
                        done ? 'border-gold bg-gold' : active ? 'border-gold/80 bg-gold/15' : 'border-white/20 bg-white/[0.06]'
                      }`}
                    >
                      {done ? (
                        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="#06251A" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 10.5l4 4 8-9" /></svg>
                      ) : (
                        <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke={active ? '#E8C36A' : '#9CC6AE'} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d={RAIL_ICON[i]} />
                        </svg>
                      )}
                    </span>
                    {i < STEP_COUNT - 1 && <span className={`my-[3px] h-[18px] w-0.5 ${done ? 'bg-gold' : 'bg-white/15'}`} />}
                  </span>
                  <span className="pt-[5px]">
                    <span className={`block text-[13.5px] font-semibold transition-colors ${active ? 'text-white' : done ? 'text-green-50' : 'text-green-100/60'}`}>{t(`steps.${key}.label`)}</span>
                    <span className={`mt-px block text-[11.5px] ${active ? 'text-gold' : 'text-green-100/45'}`}>{i <= step ? subFor(i) : '—'}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* scene image — Makkah & Madinah (modern visual) */}
          <div className="relative z-10 mt-auto hidden pt-6 md:block">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-[0_18px_40px_-22px_rgba(0,0,0,0.6)]">
              <img src="/img/scenes/makkah-madinah.webp" alt="Makkah & Madinah" className="h-32 w-full object-cover" loading="lazy" />
              <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-green-950/70 to-transparent" />
              <span className="absolute bottom-2.5 left-3 font-mono text-[10.5px] tracking-[0.1em] text-green-50/90">MAKKAH · MADINAH</span>
            </div>
          </div>
        </aside>

        {/* FORM PANEL */}
        <section className="flex min-w-0 flex-1 flex-col p-[clamp(24px,3vw,40px)]">
          {/* progress */}
          <div className="mb-[clamp(22px,2.6vw,30px)] h-1.5 overflow-hidden rounded-full bg-sand-100">
            <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-gold transition-[width] duration-500 ease-out-soft" style={{ width: `${progressPct}%` }} />
          </div>

          <div key={step} className="flex-1 animate-rise">
            <div className="mb-2.5 font-mono text-xs uppercase tracking-[0.08em] text-accent-600">{t('stepN', { n: step + 1, total: STEP_COUNT })}</div>
            <h3 className="mb-2 font-serif text-[clamp(24px,3vw,33px)] font-semibold leading-[1.12] tracking-[-0.02em] text-sand-ink">{t(`steps.${STEP_KEYS[step]}.q`)}</h3>
            <p className="mb-7 max-w-[480px] text-[14.5px] leading-relaxed text-sand-500">{t(`steps.${STEP_KEYS[step]}.sub`)}</p>

            {/* STEP 0 — ORIGIN */}
            {step === 0 && (
              <div className="flex max-w-[480px] flex-col gap-5">
                <FieldLabel label={t('fields.country')}>
                  <Combobox
                    ariaLabel={t('fields.country')}
                    value={d.country}
                    placeholder={t('fields.countryPlaceholder')}
                    options={COUNTRY_OPTIONS}
                    onChange={(country) => set({ country, airport: anyAirport(country) })}
                  />
                </FieldLabel>
                <FieldLabel label={t('fields.city')} optionalLabel={t('optional')}>
                  <input value={d.city} onChange={(e) => set({ city: e.target.value })} placeholder={t('fields.cityPlaceholder')} className={INPUT} />
                </FieldLabel>
                <FieldLabel label={t('fields.nearestAirport')}>
                  <Combobox
                    ariaLabel={t('fields.nearestAirport')}
                    value={d.airport}
                    placeholder={t('fields.airportPlaceholder', { country: d.country })}
                    options={airportOptionsFor(d.country)}
                    onChange={(airport) => set({ airport })}
                  />
                </FieldLabel>
              </div>
            )}

            {/* STEP 1 — JOURNEY */}
            {step === 1 && (
              <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                {(Object.keys(JOURNEY_ICONS) as Journey[]).map((k) => {
                  const sel = d.journey === k;
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => set({ journey: k })}
                      className={`rounded-2xl border-2 p-5 text-left transition-colors duration-200 ${sel ? 'border-green-500 bg-green-50/60' : 'border-sand-200 bg-white hover:border-green-500'}`}
                    >
                      <span className={`mb-3.5 grid h-[42px] w-[42px] place-items-center rounded-xl ${sel ? 'bg-green-100 text-green-800' : 'bg-sand-100 text-sand-500'}`}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>{JOURNEY_ICONS[k]}</svg>
                      </span>
                      <span className="mb-1 block font-serif text-xl font-semibold text-sand-ink">{journeyName(k)}</span>
                      <span className="block text-[13px] leading-relaxed text-sand-500">{t(`journeys.${k}.blurb`)}</span>
                      <span className={`mt-3 block text-xs font-semibold ${sel ? 'text-green-800' : 'text-sand-300'}`}>{t(`journeys.${k}.tag`)}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* STEP 2 — DATES */}
            {step === 2 && (
              <div className="flex max-w-[480px] flex-col gap-5">
                <SelectField label={t('fields.travelMonth')} value={d.month} onChange={(v) => set({ month: v })} options={MONTH_VALUES.map((v) => ({ value: v, label: tMonth(v) }))} />
                <Stepper label={t('fields.lengthOfStay')} unit={t('units.nights')} value={d.nights} min={5} max={30} onChange={(v) => set({ nights: v })} />
                <Switch
                  on={d.flexible}
                  onToggle={() => set({ flexible: !d.flexible })}
                  title={t('flexible.title')}
                  hint={t('flexible.hint')}
                />
              </div>
            )}

            {/* STEP 3 — TRAVELLERS */}
            {step === 3 && (
              <div className="flex max-w-[480px] flex-col gap-5">
                <Stepper label={t('fields.pilgrims')} unit={t('units.travelling')} value={d.pilgrims} min={1} max={49} onChange={(v) => set({ pilgrims: v })} />
                <Stepper label={t('fields.rooms')} unit={t('units.rooms')} value={d.rooms} min={1} max={20} onChange={(v) => set({ rooms: v })} />
              </div>
            )}

            {/* STEP 4 — STAY */}
            {step === 4 && (
              <div className="flex max-w-[520px] flex-col gap-[22px]">
                <ChipGroup label={t('fields.distance')} value={d.distance} options={DISTANCE_VALUES.map((v) => ({ value: v, label: tDistance(v) }))} onChange={(v) => set({ distance: v })} />
                <ChipGroup label={t('fields.hotelClass')} value={d.stars} options={['3★', '4★', '5★'].map((v) => ({ value: v, label: v }))} onChange={(v) => set({ stars: v })} />
                <SelectField label={t('fields.board')} value={d.board} onChange={(v) => set({ board: v })} options={BOARD_VALUES.map((v) => ({ value: v, label: tBoard(v) }))} />
              </div>
            )}

            {/* STEP 5 — VISA */}
            {step === 5 && (
              <div className="flex max-w-[520px] flex-col gap-5">
                <SelectField label={t('fields.passports')} value={d.nationality} onChange={(v) => set({ nationality: v })} options={NAT_VALUES.map((v) => ({ value: v, label: tNat(v) }))} />
                <div className={`rounded-2xl border p-5 ${route.kind === 'success' ? 'border-green-100 bg-green-50' : 'border-accent-100 bg-accent-100/40'}`}>
                  <div className="mb-2.5 flex items-center gap-3">
                    <span className={`grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl ${route.kind === 'success' ? 'bg-green-100 text-green-800' : 'bg-accent-100 text-accent-700'}`}>
                      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="5" y="3" width="14" height="18" rx="2" /><circle cx="12" cy="10" r="3" /><path d="M9 16h6" /></svg>
                    </span>
                    <div>
                      <div className={`text-base font-bold ${route.kind === 'success' ? 'text-green-800' : 'text-accent-700'}`}>{routeTitle}</div>
                      <div className={`text-[12.5px] font-semibold ${route.kind === 'success' ? 'text-green-600' : 'text-accent-600'}`}>{routeTag}</div>
                    </div>
                  </div>
                  <p className="text-[13.5px] leading-relaxed text-sand-700">{routeBody}</p>
                </div>
              </div>
            )}

            {/* STEP 6 — REVIEW */}
            {step === 6 && (
              <div>
                <div className="grid gap-px overflow-hidden rounded-2xl border border-sand-200 bg-sand-200 sm:grid-cols-2 lg:grid-cols-3">
                  {summary.map((s) => (
                    <div key={s.label} className="bg-white px-[18px] py-[15px]">
                      <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-sand-500">{s.label}</div>
                      <div className="text-[15px] font-semibold text-sand-ink">{s.value}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center gap-3.5 rounded-2xl border border-green-100 bg-green-100/60 px-[18px] py-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-green-800 font-mono text-lg font-semibold text-white">{matchCount}</span>
                  <div>
                    <div className="text-[15px] font-bold text-green-800">{t('review.matchTitle', { n: matchCount })}</div>
                    <div className="text-[13px] text-sand-700">{t('review.matchSub', { airport: d.airport })}</div>
                  </div>
                </div>

                {/* passenger details + send the plan to AUJ (WhatsApp / email / direct inquiry) */}
                <div className="mt-5">
                  <SendInquiryPanel
                    summary={summary}
                    buildInquiry={buildInquiry}
                    successCta={<Link href={bookHref} className="inline-block rounded-xl bg-green-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700">{t('seeMatching', { n: matchCount })}</Link>}
                  />
                </div>
              </div>
            )}
          </div>

          {/* FOOTER NAV */}
          <div className="mt-7 flex items-center justify-between gap-3 border-t border-sand-100 pt-[22px]">
            <button
              type="button"
              onClick={() => go(step - 1)}
              disabled={step === 0}
              className="inline-flex items-center gap-1.5 rounded-lg px-1 py-2 text-[14.5px] font-semibold text-sand-500 transition-colors disabled:cursor-default disabled:text-sand-300"
            >
              ‹ {t('back')}
            </button>
            {step < STEP_COUNT - 1 ? (
              <button
                type="button"
                onClick={() => go(step + 1)}
                className="inline-flex items-center gap-2 rounded-xl bg-green-800 px-6 py-3 text-[15px] font-semibold text-white shadow-[0_8px_18px_rgba(15,81,50,0.26)] transition-[transform,background-color] duration-fast hover:bg-green-700 active:scale-[0.98]"
              >
                {t('next')} <span aria-hidden>→</span>
              </button>
            ) : (
              <Link
                href={bookHref}
                className="inline-flex items-center gap-2 rounded-xl bg-green-800 px-6 py-3 text-[15px] font-semibold text-white shadow-[0_8px_18px_rgba(15,81,50,0.26)] transition-[transform,background-color] duration-fast hover:bg-green-700 active:scale-[0.98]"
              >
                {t('seePackages', { n: matchCount })} <span aria-hidden>→</span>
              </Link>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

const INPUT =
  'w-full rounded-xl border-[1.5px] border-sand-300 bg-white px-3.5 py-3 text-[15px] text-sand-ink transition-shadow focus:border-accent-600 focus:outline-none focus:ring-[3px] focus:ring-accent-600/15';

function TabLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-full border border-sand-200 bg-white/55 px-4 py-2.5 text-sm font-semibold text-sand-500 transition-colors duration-fast hover:bg-white hover:text-green-800"
    >
      {children}
    </Link>
  );
}

function PlannerTabIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 18V3l9 1.5L5 6" />
      <circle cx="14" cy="15" r="2.4" />
      <path d="M14 12.6V6" />
    </svg>
  );
}

function FieldLabel({ label, optionalLabel, children }: { label: string; optionalLabel?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-[7px] block text-[11.5px] font-semibold uppercase tracking-[0.07em] text-sand-500">
        {label} {optionalLabel && <span className="font-medium normal-case tracking-normal text-sand-300">{optionalLabel}</span>}
      </span>
      {children}
    </label>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <FieldLabel label={label}>
      <div className="relative">
        <select value={value} onChange={(e) => onChange(e.target.value)} className={`${INPUT} cursor-pointer appearance-none pr-10`}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <span aria-hidden className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sand-500">▾</span>
      </div>
    </FieldLabel>
  );
}

function Stepper({ label, unit, value, min, max, onChange }: { label: string; unit: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <FieldLabel label={label}>
      <div className="flex items-center gap-4 rounded-xl border-[1.5px] border-sand-300 px-3.5 py-2">
        <button type="button" aria-label={`${label} −`} onClick={() => onChange(Math.max(min, value - 1))} className="h-[38px] w-[38px] rounded-[10px] border border-sand-200 bg-sand-50 text-xl text-green-700 transition-colors hover:bg-sand-100">−</button>
        <div className="flex-1 text-center">
          <span className="font-mono text-[22px] font-semibold text-sand-ink tabular-nums">{value}</span> <span className="text-sm text-sand-500">{unit}</span>
        </div>
        <button type="button" aria-label={`${label} +`} onClick={() => onChange(Math.min(max, value + 1))} className="h-[38px] w-[38px] rounded-[10px] bg-green-800 text-xl text-white transition-colors hover:bg-green-700">+</button>
      </div>
    </FieldLabel>
  );
}

function ChipGroup({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <FieldLabel label={label}>
      <div className="flex flex-wrap gap-2.5">
        {options.map((o) => {
          const sel = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              className={`rounded-xl border-[1.5px] px-4 py-2.5 text-[13.5px] font-semibold transition-colors duration-fast ${sel ? 'border-green-800 bg-green-800 text-white' : 'border-sand-300 bg-white text-sand-700 hover:border-green-500'}`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </FieldLabel>
  );
}

function Switch({ on, onToggle, title, hint }: { on: boolean; onToggle: () => void; title: string; hint: string }) {
  return (
    <button type="button" aria-pressed={on} onClick={onToggle} className="flex items-center gap-3.5 text-left">
      <span className={`relative h-[27px] w-[46px] shrink-0 rounded-full transition-colors duration-200 ${on ? 'bg-green-600' : 'bg-sand-300'}`}>
        <span className={`absolute left-[3px] top-[3px] h-[21px] w-[21px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.25)] transition-transform duration-200 ${on ? 'translate-x-[19px]' : 'translate-x-0'}`} />
      </span>
      <span>
        <span className="block text-[14.5px] font-semibold text-sand-ink">{title}</span>
        <span className="block text-[12.5px] text-sand-500">{hint}</span>
      </span>
    </button>
  );
}
