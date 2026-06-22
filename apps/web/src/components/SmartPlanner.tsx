'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { BrandMark } from './BrandMark';
import { Combobox, type ComboOption } from './Combobox';
import { AIRPORT_COMBO_OPTIONS, COUNTRIES, anyAirport, countryForAirport } from '../geo/airports';
import { submitInquiryAction } from '../leads/actions';
import { AUJ_CONTACT } from '../content';

// Searchable option lists (Europe + UK + Pakistan) for the airline-style pickers.
const COUNTRY_OPTIONS: ComboOption[] = COUNTRIES.map((c) => ({ value: c, label: c }));
const AIRPORT_OPTIONS: ComboOption[] = AIRPORT_COMBO_OPTIONS;

const WHATSAPP_NUMBER = AUJ_CONTACT.phone.replace(/[^\d]/g, '');

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

const STEPS: { label: string; q: string; sub: string }[] = [
  { label: 'Origin', q: 'Where do you start from?', sub: 'Tell us your departure point so we can price flights and routings from your city.' },
  { label: 'Journey', q: 'Which journey are you planning?', sub: 'Choose the pilgrimage you have in mind — you can refine everything later.' },
  { label: 'Dates', q: 'When would you like to travel?', sub: 'Pick a month and length of stay. Flexible dates unlock better fares.' },
  { label: 'Travellers', q: 'Who is travelling?', sub: 'Add everyone in your group, including children, and how many rooms you need.' },
  { label: 'Stay', q: 'Where would you like to stay?', sub: 'Set your preference for proximity to the Haram, hotel class and board.' },
  { label: 'Visa', q: 'Passports & visa route', sub: 'We read your group’s passports and set the right path automatically.' },
  { label: 'Review', q: 'Review your plan', sub: 'Here’s everything so far. Confirm to see the packages that match.' },
];

const COUNTS: Record<Journey, number> = { Umrah: 38, Hajj: 6, Ziyarat: 14 };

const JOURNEY_META: Record<Journey, { blurb: string; tag: string; icon: JSX.Element }> = {
  Umrah: {
    blurb: 'The lesser pilgrimage, any time of year.',
    tag: 'Year-round · from €1,180',
    icon: <path d="M12 3l7 4v10l-7 4-7-4V7z M5 7l7 4 7-4M12 11v10" />,
  },
  Hajj: {
    blurb: 'The fifth pillar, fully organised.',
    tag: 'Dhul-Hijjah · from €6,400',
    icon: <path d="M7 21V4 M7 5h10l-2.5 3.5L17 12H7" />,
  },
  Ziyarat: {
    blurb: 'Sacred sites of Madinah & beyond.',
    tag: 'Seasonal · from €980',
    icon: <path d="M4 20v-7M20 20v-7M4 13h16 M12 3c2.5 2 4 4.2 4 7H8c0-2.8 1.5-5 4-7z M3 20h18" />,
  },
};

const RAIL_ICON = [
  'M10 2.5a4.5 4.5 0 0 1 4.5 4.5c0 3.2-4.5 9-4.5 9S5.5 10.2 5.5 7A4.5 4.5 0 0 1 10 2.5z M10 5.4a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2z',
  'M10 2.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15z M13.2 6.8l-2 4.4-4.4 2 2-4.4z',
  'M5.5 4.5h9a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z M3.5 8h13M6.5 3v3M13.5 3v3',
  'M7.5 5.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z M3 16c0-2.4 2-4 4.5-4s4.5 1.6 4.5 4 M13 6.2a2.3 2.3 0 0 1 0 4.6M14 15.8c0-1.9.8-3 2.5-3.4',
  'M3 8.5V16M3 12h14v4M17 16v-3.5a2 2 0 0 0-2-2H9 M6 7.9a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6z',
  'M6.5 3h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z M10 6.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4z M7.5 13h5',
  'M5.5 4.5h9a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2V6.5a2 2 0 0 1 2-2z M7.5 4.5V3.5h5v1 M7.6 11l1.7 1.7L13 9',
];

function airportCode(airport: string): string {
  const m = airport.match(/\(([^)]+)\)/);
  return m ? m[1]! : airport;
}

export function SmartPlanner() {
  const [step, setStep] = useState(0);
  const [d, setD] = useState<PlanData>(INITIAL);
  const set = (patch: Partial<PlanData>): void => setD((s) => ({ ...s, ...patch }));
  const go = (i: number): void => setStep(Math.max(0, Math.min(STEPS.length - 1, i)));

  const matchCount = COUNTS[d.journey];

  const route = useMemo(() => {
    const n = d.nationality;
    const eu = n.includes('EU');
    const pk = n.includes('Pakistani');
    if (eu && pk)
      return { kind: 'info' as const, title: 'Two routes — handled together', tag: 'Mixed group', body: 'EU/EEA pilgrims get the online e-Visa; Pakistani pilgrims go through our licensed agent channel. Both are tracked under one booking reference.' };
    if (eu)
      return { kind: 'success' as const, title: 'e-Visa route', tag: 'Fast · online', body: 'Submitted online to MOFA and typically issued in 2–3 days. We guide every field and track it live.' };
    return { kind: 'info' as const, title: 'Licensed agent channel', tag: 'Fully supported', body: 'Handled by our licensed partners with full document support, from collection to issued visa.' };
  }, [d.nationality]);

  const subFor = (i: number): string => {
    switch (i) {
      case 0: return d.city ? `${d.city} · ${d.airport}` : d.airport;
      case 1: return d.journey;
      case 2: return `${d.nights} nts · ${d.month.replace(/ 202\d/, '')}`;
      case 3: return `${d.pilgrims} pilgrims · ${d.rooms} rooms`;
      case 4: return `${d.stars} · ${d.distance.split(' ')[0]}`;
      case 5: return route.title === 'e-Visa route' ? 'e-Visa' : route.title.includes('Two') ? 'Mixed routes' : 'Agent channel';
      default: return `${matchCount} matches`;
    }
  };

  const summary: { label: string; value: string }[] = [
    { label: 'From', value: `${d.city ? `${d.city}, ` : ''}${d.country}` },
    { label: 'Airport', value: d.airport },
    { label: 'Journey', value: d.journey },
    { label: 'When', value: `${d.nights} nights · ${d.month}` },
    { label: 'Travellers', value: `${d.pilgrims} pilgrims · ${d.rooms} rooms` },
    { label: 'Hotel', value: `${d.stars} · ${d.distance}` },
    { label: 'Board', value: d.board },
    { label: 'Visa route', value: route.title },
  ];

  const bookHref = useMemo(() => {
    const params = new URLSearchParams({
      city: 'MAKKAH',
      journey: d.journey,
      pax: String(d.pilgrims),
      rooms: String(d.rooms),
      nights: String(d.nights),
      from: airportCode(d.airport),
      stars: d.stars.replace('★', ''),
    });
    return `/book?${params.toString()}`;
  }, [d]);

  const progressPct = Math.round(((step + 1) / STEPS.length) * 100);

  // ── Passenger details + send the plan to AUJ (WhatsApp / email / direct inquiry) ──
  const [contact, setContact] = useState({ name: '', phone: '', address: '', email: '' });
  const setC = (patch: Partial<typeof contact>): void => setContact((c) => ({ ...c, ...patch }));
  const [consent, setConsent] = useState(false);
  const [sentRef, setSentRef] = useState<string>();
  const [sending, startSend] = useTransition();
  const canSend = contact.name.trim() !== '' && /.+@.+\..+/.test(contact.email) && consent;

  const planText = useMemo(
    () =>
      [
        'AUJ — Smart Visit plan',
        ...summary.map((s) => `• ${s.label}: ${s.value}`),
        '',
        `Name: ${contact.name || '—'}`,
        `Phone: ${contact.phone || '—'}`,
        `City / address: ${contact.address || '—'}`,
        `Email: ${contact.email || '—'}`,
      ].join('\n'),
    [summary, contact],
  );
  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(planText)}`;
  const mailHref = `mailto:${AUJ_CONTACT.email}?subject=${encodeURIComponent('AUJ Smart Visit plan')}&body=${encodeURIComponent(planText)}`;

  const sendToAuj = (): void =>
    startSend(async () => {
      const { ref } = await submitInquiryAction({
        country: d.country,
        city: contact.address || d.city,
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
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        channel: 'WHATSAPP',
        lang: 'en',
        consent,
      });
      setSentRef(ref);
    });

  return (
    <div className="mx-auto w-full max-w-[1080px]">
      {/* tabs */}
      <div className="mb-[clamp(16px,3vw,28px)] flex flex-wrap gap-2.5">
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-green-800 shadow-[0_6px_16px_rgba(15,81,50,0.12)]">
          <PlannerTabIcon /> Smart planner
        </span>
        <TabLink href="/#search">Search packages</TabLink>
        <TabLink href="/guide">Umrah Guide</TabLink>
        <TabLink href="/guide/tour">Virtual tour</TabLink>
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
            <h2 className="mt-5 font-serif text-2xl font-semibold tracking-[-0.01em] text-green-50">Smart Visit planner</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-green-100/80">Seven calm steps to a complete, visa-ready pilgrimage.</p>
          </div>

          {/* RAIL (md+) */}
          <div className="relative z-10 mt-7 hidden flex-col md:flex">
            {STEPS.map((s, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <button key={s.label} type="button" onClick={() => go(i)} className="flex items-start gap-3.5 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60">
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
                    {i < STEPS.length - 1 && <span className={`my-[3px] h-[18px] w-0.5 ${done ? 'bg-gold' : 'bg-white/15'}`} />}
                  </span>
                  <span className="pt-[5px]">
                    <span className={`block text-[13.5px] font-semibold transition-colors ${active ? 'text-white' : done ? 'text-green-50' : 'text-green-100/60'}`}>{s.label}</span>
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
            <div className="mb-2.5 font-mono text-xs tracking-[0.08em] text-accent-600">STEP {step + 1} OF {STEPS.length}</div>
            <h3 className="mb-2 font-serif text-[clamp(24px,3vw,33px)] font-semibold leading-[1.12] tracking-[-0.02em] text-sand-ink">{STEPS[step]!.q}</h3>
            <p className="mb-7 max-w-[480px] text-[14.5px] leading-relaxed text-sand-500">{STEPS[step]!.sub}</p>

            {/* STEP 0 — ORIGIN */}
            {step === 0 && (
              <div className="flex max-w-[480px] flex-col gap-5">
                <FieldLabel label="Country">
                  <Combobox
                    ariaLabel="Country"
                    value={d.country}
                    placeholder="Search your country"
                    options={COUNTRY_OPTIONS}
                    onChange={(country) => set({ country, airport: anyAirport(country) })}
                  />
                </FieldLabel>
                <FieldLabel label="City" optional>
                  <input value={d.city} onChange={(e) => set({ city: e.target.value })} placeholder="e.g. Vilnius" className={INPUT} />
                </FieldLabel>
                <FieldLabel label="Nearest airport">
                  <Combobox
                    ariaLabel="Nearest airport"
                    value={d.airport}
                    placeholder="Search city or airport code"
                    options={AIRPORT_OPTIONS}
                    onChange={(airport) => set({ airport, country: countryForAirport(airport) ?? d.country })}
                  />
                </FieldLabel>
              </div>
            )}

            {/* STEP 1 — JOURNEY */}
            {step === 1 && (
              <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                {(Object.keys(JOURNEY_META) as Journey[]).map((k) => {
                  const sel = d.journey === k;
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => set({ journey: k })}
                      className={`rounded-2xl border-2 p-5 text-left transition-colors duration-200 ${sel ? 'border-green-500 bg-green-50/60' : 'border-sand-200 bg-white hover:border-green-500'}`}
                    >
                      <span className={`mb-3.5 grid h-[42px] w-[42px] place-items-center rounded-xl ${sel ? 'bg-green-100 text-green-800' : 'bg-sand-100 text-sand-500'}`}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>{JOURNEY_META[k].icon}</svg>
                      </span>
                      <span className="mb-1 block font-serif text-xl font-semibold text-sand-ink">{k}</span>
                      <span className="block text-[13px] leading-relaxed text-sand-500">{JOURNEY_META[k].blurb}</span>
                      <span className={`mt-3 block text-xs font-semibold ${sel ? 'text-green-800' : 'text-sand-300'}`}>{JOURNEY_META[k].tag}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* STEP 2 — DATES */}
            {step === 2 && (
              <div className="flex max-w-[480px] flex-col gap-5">
                <SelectField label="Travel month" value={d.month} onChange={(v) => set({ month: v })} options={['September 2026', 'October 2026', 'November 2026', 'December 2026', 'Ramadan 2027', "I'm flexible"]} />
                <Stepper label="Length of stay" unit="nights" value={d.nights} min={5} max={30} onChange={(v) => set({ nights: v })} />
                <Switch
                  on={d.flexible}
                  onToggle={() => set({ flexible: !d.flexible })}
                  title="Flexible by ± a few days"
                  hint="We’ll find the best fares around your dates."
                />
              </div>
            )}

            {/* STEP 3 — TRAVELLERS */}
            {step === 3 && (
              <div className="flex max-w-[480px] flex-col gap-5">
                <Stepper label="Pilgrims" unit="travelling" value={d.pilgrims} min={1} max={49} onChange={(v) => set({ pilgrims: v })} />
                <Stepper label="Hotel rooms" unit="rooms" value={d.rooms} min={1} max={20} onChange={(v) => set({ rooms: v })} />
              </div>
            )}

            {/* STEP 4 — STAY */}
            {step === 4 && (
              <div className="flex max-w-[520px] flex-col gap-[22px]">
                <ChipGroup label="Distance to the Haram" value={d.distance} options={['Near (≤300m)', 'Walking (≤800m)', 'Any distance']} onChange={(v) => set({ distance: v })} />
                <ChipGroup label="Hotel class" value={d.stars} options={['3★', '4★', '5★']} onChange={(v) => set({ stars: v })} />
                <SelectField label="Board" value={d.board} onChange={(v) => set({ board: v })} options={['Room only', 'Breakfast', 'Half board', 'Full board']} />
              </div>
            )}

            {/* STEP 5 — VISA */}
            {step === 5 && (
              <div className="flex max-w-[520px] flex-col gap-5">
                <SelectField label="Passports in your group" value={d.nationality} onChange={(v) => set({ nationality: v })} options={['All EU / EEA passports', 'All Pakistani passports', 'Mixed (EU + Pakistani)', 'Other nationality']} />
                <div className={`rounded-2xl border p-5 ${route.kind === 'success' ? 'border-green-100 bg-green-50' : 'border-accent-100 bg-accent-100/40'}`}>
                  <div className="mb-2.5 flex items-center gap-3">
                    <span className={`grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl ${route.kind === 'success' ? 'bg-green-100 text-green-800' : 'bg-accent-100 text-accent-700'}`}>
                      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="5" y="3" width="14" height="18" rx="2" /><circle cx="12" cy="10" r="3" /><path d="M9 16h6" /></svg>
                    </span>
                    <div>
                      <div className={`text-base font-bold ${route.kind === 'success' ? 'text-green-800' : 'text-accent-700'}`}>{route.title}</div>
                      <div className={`text-[12.5px] font-semibold ${route.kind === 'success' ? 'text-green-600' : 'text-accent-600'}`}>{route.tag}</div>
                    </div>
                  </div>
                  <p className="text-[13.5px] leading-relaxed text-sand-700">{route.body}</p>
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
                    <div className="text-[15px] font-bold text-green-800">{matchCount} packages match your plan</div>
                    <div className="text-[13px] text-sand-700">Verified, near-Haram and visa-ready from {d.airport}.</div>
                  </div>
                </div>

                {/* passenger details + send the plan to AUJ */}
                {sentRef ? (
                  <div className="mt-5 rounded-2xl border border-green-100 bg-green-50 px-5 py-6 text-center">
                    <div className="text-2xl">📨</div>
                    <div className="mt-1 text-[15px] font-bold text-green-800">Your plan is on its way to AUJ</div>
                    <p className="mt-1 text-[13px] text-sand-600">Reference <span className="font-mono font-semibold text-green-800">{sentRef}</span> — our team will be in touch shortly.</p>
                    <Link href={bookHref} className="mt-3 inline-block rounded-xl bg-green-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700">See {matchCount} matching packages →</Link>
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl border border-sand-200 bg-white p-5">
                    <div className="text-[15px] font-bold text-sand-ink">Send your plan to AUJ</div>
                    <p className="mb-3 mt-0.5 text-[13px] text-sand-500">Add your details and we’ll prepare a tailored quote — by WhatsApp, email, or a direct inquiry.</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <FieldLabel label="Full name"><input value={contact.name} onChange={(e) => setC({ name: e.target.value })} className={INPUT} placeholder="As in passport" /></FieldLabel>
                      <FieldLabel label="Phone"><input value={contact.phone} onChange={(e) => setC({ phone: e.target.value })} className={INPUT} placeholder="+…" /></FieldLabel>
                      <FieldLabel label="City / address"><input value={contact.address} onChange={(e) => setC({ address: e.target.value })} className={INPUT} placeholder="City, country" /></FieldLabel>
                      <FieldLabel label="Email"><input type="email" value={contact.email} onChange={(e) => setC({ email: e.target.value })} className={INPUT} placeholder="you@email.com" /></FieldLabel>
                    </div>
                    <label className="mt-3 flex items-start gap-2 text-[12.5px] text-sand-600">
                      <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
                      <span>I agree AUJ may contact me about this plan and store my details (GDPR).</span>
                    </label>
                    <div className="mt-4 flex flex-wrap gap-2.5">
                      <button
                        type="button"
                        onClick={sendToAuj}
                        disabled={!canSend || sending}
                        className="inline-flex items-center gap-2 rounded-xl bg-green-800 px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(15,81,50,0.26)] transition-[transform,background-color] duration-fast hover:bg-green-700 active:scale-[0.98] disabled:cursor-default disabled:bg-sand-300"
                      >
                        {sending ? 'Sending…' : 'Send to AUJ'} <span aria-hidden>→</span>
                      </button>
                      <a
                        href={waHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl border-[1.5px] border-success/40 bg-success/5 px-5 py-3 text-sm font-semibold text-success-fg transition-colors duration-fast hover:bg-success/10"
                      >
                        <span aria-hidden>✆</span> WhatsApp
                      </a>
                      <a
                        href={mailHref}
                        className="inline-flex items-center gap-2 rounded-xl border-[1.5px] border-sand-300 bg-white px-5 py-3 text-sm font-semibold text-green-800 transition-colors duration-fast hover:bg-sand-50"
                      >
                        <span aria-hidden>✉</span> Email
                      </a>
                    </div>
                    <p className="mt-2 text-[11.5px] text-sand-400">WhatsApp & email open with your plan pre-filled. “Send to AUJ” needs a name, email and consent.</p>
                  </div>
                )}
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
              ‹ Back
            </button>
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => go(step + 1)}
                className="inline-flex items-center gap-2 rounded-xl bg-green-800 px-6 py-3 text-[15px] font-semibold text-white shadow-[0_8px_18px_rgba(15,81,50,0.26)] transition-[transform,background-color] duration-fast hover:bg-green-700 active:scale-[0.98]"
              >
                Next <span aria-hidden>→</span>
              </button>
            ) : (
              <Link
                href={bookHref}
                className="inline-flex items-center gap-2 rounded-xl bg-green-800 px-6 py-3 text-[15px] font-semibold text-white shadow-[0_8px_18px_rgba(15,81,50,0.26)] transition-[transform,background-color] duration-fast hover:bg-green-700 active:scale-[0.98]"
              >
                See {matchCount} packages <span aria-hidden>→</span>
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

function FieldLabel({ label, optional, children }: { label: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-[7px] block text-[11.5px] font-semibold uppercase tracking-[0.07em] text-sand-500">
        {label} {optional && <span className="font-medium normal-case tracking-normal text-sand-300">(optional)</span>}
      </span>
      {children}
    </label>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <FieldLabel label={label}>
      <div className="relative">
        <select value={value} onChange={(e) => onChange(e.target.value)} className={`${INPUT} cursor-pointer appearance-none pr-10`}>
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
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

function ChipGroup({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <FieldLabel label={label}>
      <div className="flex flex-wrap gap-2.5">
        {options.map((o) => {
          const sel = value === o;
          return (
            <button
              key={o}
              type="button"
              onClick={() => onChange(o)}
              className={`rounded-xl border-[1.5px] px-4 py-2.5 text-[13.5px] font-semibold transition-colors duration-fast ${sel ? 'border-green-800 bg-green-800 text-white' : 'border-sand-300 bg-white text-sand-700 hover:border-green-500'}`}
            >
              {o}
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
