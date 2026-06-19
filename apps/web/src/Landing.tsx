'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { routeFor } from '@auj/visa-router';
import type { PublicUser } from '@auj/auth';
import { formatMoney, pkrIndicative } from './currency';
import { Scene } from './components/Scene';
import { SiteHeader } from './components/SiteHeader';
import { SiteFooter } from './components/SiteFooter';
import { SmartVisitWizard } from './leads/SmartVisitWizard';
import {
  DEALS,
  type Deal,
  DEPARTURE_CITIES,
  DEPARTURES_GRID,
  DESTINATIONS,
  FAQS,
  FEATURE_ICONS,
  HERO_STATS,
  JOURNEY_TYPES,
  LOCALES,
  PACKAGES,
  PAYMENT_METHODS,
  SEARCH_COUNT,
  SEARCH_TABS,
  SUPPORT_CHANNELS,
  TESTIMONIALS,
  VALUE_ICONS,
  type SearchTab,
} from './content';

export default function Landing({ user, deals }: { user?: PublicUser; deals?: Deal[] }) {
  const dealCards = deals && deals.length > 0 ? deals : DEALS;
  const [tab, setTab] = useState<SearchTab>('Umrah');
  const [from, setFrom] = useState<string>(DEPARTURE_CITIES[0]);
  const [dest, setDest] = useState<string>(DESTINATIONS[0]);
  const [pax, setPax] = useState(4);
  const [checkIn, setCheckIn] = useState('2026-09-12');
  const [checkOut, setCheckOut] = useState('2026-09-26');
  const [makkahNights, setMakkahNights] = useState(6);
  const [madinahNights, setMadinahNights] = useState(3);
  const [madinahFirst, setMadinahFirst] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [demoLocale, setDemoLocale] = useState(LOCALES[0]!); // the "in your language" preview widget
  const t = useTranslations('common');
  const tl = useTranslations('landing');
  const trust = tl.raw('trust') as string[];
  const statLabels = tl.raw('statLabels') as string[];
  const journeyDesc = tl.raw('journeyDesc') as string[];
  const stepItems = tl.raw('steps6') as { title: string; desc: string }[];
  const pkgItems = tl.raw('packages') as { name: string; meta: string; visa: string }[];
  const faqItems = tl.raw('faqs') as { q: string; a: string }[];
  const quotes = tl.raw('testimonialQuotes') as string[];
  const microtrust = tl.raw('microtrust') as string[];
  const valueProps = tl.raw('valueProps') as { title: string; desc: string }[];
  const features = tl.raw('features') as { title: string; desc: string }[];
  const categories = tl.raw('categories') as string[];
  const departureRegions = tl.raw('departures') as string[];
  const supportChannels = tl.raw('supportChannels') as string[];

  return (
    <div className="overflow-x-hidden bg-sand-50 text-sand-ink">
      {/* announcement */}
      <div className="bg-green-950 text-[13px] text-green-100">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-[clamp(16px,4vw,32px)] py-2.5">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            {tl('announce')}
          </span>
          <span className="flex items-center gap-4 text-green-100/80">
            <a href="#agents" className="font-medium hover:text-green-50">{tl('forAgents')}</a>
            <span>🌐 EN · LT · UR · AR</span>
          </span>
        </div>
      </div>

      {/* nav */}
      <SiteHeader user={user} />

      {/* hero */}
      <section className="relative bg-[radial-gradient(130%_110%_at_88%_0%,#156440_0%,#0A3D26_46%,#07301E_100%)] px-[clamp(16px,4vw,32px)] pb-[clamp(96px,11vw,132px)] pt-[clamp(48px,7vw,76px)] text-green-50">
        <div className="mx-auto grid max-w-6xl items-center gap-[clamp(36px,5vw,56px)] md:grid-cols-2">
          <div className="animate-rise">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[13px] font-medium text-green-100">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              {t('heroBadge')}
            </span>
            <h1 className="mb-5 font-serif text-[clamp(2.25rem,5.4vw,3.75rem)] font-semibold leading-[1.03] tracking-[-0.022em]">
              {t('heroTitle')}
            </h1>
            <p className="mb-8 max-w-[520px] text-[clamp(1rem,1.6vw,1.2rem)] leading-relaxed text-green-100/90">
              {t('heroSubtitle')}
            </p>
            <div className="mb-10 flex flex-wrap items-center gap-3">
              <a href="#plan" className="inline-flex items-center gap-2 rounded-xl bg-sand-50 px-6 py-3.5 text-[15.5px] font-semibold text-green-900 shadow-[0_10px_28px_rgba(7,48,30,0.4)] transition-[transform,background-color] duration-fast hover:bg-white active:scale-[0.98] focus-visible:outline-none focus-visible:shadow-focus">
                {t('planPilgrimage')}
              </a>
              <a href="#how" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3.5 text-[15.5px] font-semibold transition-[transform,background-color] duration-fast hover:bg-white/15 active:scale-[0.98] focus-visible:outline-none focus-visible:shadow-focus">
                {t('howItWorks')}
              </a>
            </div>
            <div className="flex flex-wrap gap-x-9 gap-y-5 border-t border-white/15 pt-7">
              {HERO_STATS.map((s, i) => (
                <div key={s.label}>
                  <div className="font-mono text-[22px] font-semibold text-white">{s.value}</div>
                  <div className="mt-0.5 text-[12.5px] text-green-100/70">{statLabels[i] ?? s.label}</div>
                </div>
              ))}
            </div>
          </div>
          {/* right: hero scene (Makkah) + floating live-status / price cards */}
          <div className="relative min-w-0 animate-fade-in">
            <div className="relative h-[clamp(360px,42vw,520px)] overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(120%_90%_at_68%_16%,#2A9468_0%,#0F5132_42%,#062418_100%)] shadow-[0_36px_70px_-28px_rgba(5,28,18,0.75)]">
              <Scene name="makkah" priority className="animate-kenburns absolute inset-0 h-full w-full object-cover" />
              <span className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-green-950/55 to-transparent" />
            </div>
            <div className="animate-float absolute -left-2 top-5 w-[232px] max-w-[70%] rounded-2xl bg-white p-4 text-sand-ink shadow-[0_20px_44px_rgba(5,28,18,0.34)]">
              <div className="mb-2.5 flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider text-sand-500">LIVE VISA STATUS</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-bg px-2.5 py-0.5 text-[11px] font-semibold text-warning-fg">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-warning" />In progress
                </span>
              </div>
              <div className="font-mono text-[13px] font-medium text-accent-600">BRN-26-VNO-00481</div>
              <div className="mt-1 text-[12.5px] text-sand-700">e-Visa submitted to MOFA · est. 2–3 days</div>
            </div>
            <div className="animate-float absolute -right-2 bottom-6 rounded-xl bg-white p-3.5 text-sand-ink shadow-[0_20px_44px_rgba(5,28,18,0.34)]" style={{ animationDelay: '-3s' }}>
              <div className="text-[11px] font-semibold text-sand-500">Umrah Premium · 14 nights</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-mono text-[22px] font-bold text-green-800">€2,480</span>
                <span className="font-mono text-[11px] text-sand-500">≈ ₨771k</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Visit planner — primary widget, overlaps the hero (hero CTA scrolls here) */}
      <div id="plan" className="relative z-20 mx-auto -mt-[clamp(88px,9vw,92px)] max-w-2xl scroll-mt-24 px-[clamp(16px,4vw,32px)]">
        <div className="animate-rise rounded-[22px] border border-sand-200 bg-white px-[clamp(6px,1.4vw,16px)] shadow-[0_24px_60px_-24px_rgba(42,38,32,0.34)]">
          <SmartVisitWizard />
        </div>
      </div>

      {/* search card — direct booking, below the planner */}
      <div id="search" className="relative z-10 mx-auto mt-12 max-w-5xl px-[clamp(16px,4vw,32px)]">
        <div className="animate-rise rounded-[22px] border border-sand-200 bg-white p-[clamp(18px,2.4vw,24px)] shadow-[0_24px_60px_-24px_rgba(42,38,32,0.34)]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1 rounded-xl bg-sand-100 p-1">
              {SEARCH_TABS.map((tb) => (
                <button
                  key={tb}
                  type="button"
                  onClick={() => setTab(tb)}
                  className={`rounded-lg px-5 py-2 text-sm font-semibold ${tab === tb ? 'bg-white text-green-800 shadow-sm' : 'text-sand-500'}`}
                >
                  {tb}
                </button>
              ))}
            </div>
            <span className="text-[13px] text-sand-500">FX today · 1 € = ₨310.8 · charged in EUR</span>
          </div>

          {/* city order + nights in each holy city (dynamic packaging) */}
          <div className="mb-3 flex flex-wrap items-end gap-3">
            <div>
              <Lbl>{tl('search.makkahFirst').replace(' first', '')} / {tl('search.madinahFirst').replace(' first', '')}</Lbl>
              <div className="flex gap-1 rounded-[10px] bg-sand-100 p-1">
                {[false, true].map((mf) => (
                  <button
                    key={String(mf)}
                    type="button"
                    onClick={() => setMadinahFirst(mf)}
                    className={`rounded-[7px] px-3.5 py-1.5 text-[13px] font-semibold ${madinahFirst === mf ? 'bg-white text-green-800 shadow-sm' : 'text-sand-500'}`}
                  >
                    {mf ? tl('search.madinahFirst') : tl('search.makkahFirst')}
                  </button>
                ))}
              </div>
            </div>
            <NightStepper label={tl('search.makkahNights')} value={makkahNights} onChange={setMakkahNights} />
            <NightStepper label={tl('search.madinahNights')} value={madinahNights} onChange={setMadinahNights} />
          </div>

          <div className="grid items-end gap-3 md:grid-cols-[repeat(5,1fr)_auto]">
            <SelectField label={t('from')} value={from} onChange={setFrom} options={[...DEPARTURE_CITIES]} />
            <SelectField label={t('destination')} value={dest} onChange={setDest} options={[...DESTINATIONS]} />
            <DateField label={t('checkIn')} value={checkIn} onChange={setCheckIn} />
            <DateField label={t('checkOut')} value={checkOut} min={checkIn} onChange={setCheckOut} />
            <div>
              <Lbl>{t('pilgrims')}</Lbl>
              <div className="flex items-center justify-between rounded-[10px] border-[1.5px] border-sand-300 px-2 py-1.5">
                <button type="button" aria-label="Decrease" onClick={() => setPax((p) => Math.max(1, p - 1))} className="h-8 w-8 rounded-lg border border-sand-200 bg-sand-50 text-lg text-green-700">−</button>
                <span className="text-[14.5px] font-semibold">{pax}</span>
                <button type="button" aria-label="Increase" onClick={() => setPax((p) => Math.min(49, p + 1))} className="h-8 w-8 rounded-lg bg-green-800 text-lg text-white">+</button>
              </div>
            </div>
            <Link
              href={`/book?city=${dest.toUpperCase()}&pax=${pax}&checkIn=${checkIn}&checkOut=${checkOut}&makkahNights=${makkahNights}&madinahNights=${madinahNights}&order=${madinahFirst ? 'madinah' : 'makkah'}`}
              className="flex h-[50px] items-center justify-center whitespace-nowrap rounded-[11px] bg-green-800 px-6 text-[15px] font-semibold text-white shadow-[0_6px_16px_rgba(15,81,50,0.25)] transition-[transform,background-color] duration-fast hover:bg-green-700 active:scale-[0.98] focus-visible:outline-none focus-visible:shadow-focus"
            >
              {t('searchCta', { count: SEARCH_COUNT[tab], tab, dest })}
            </Link>
          </div>
          <p className="mt-3 text-[12.5px] text-sand-500">{tl('search.flexibleHint')}</p>

          {/* micro-trust row */}
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-sand-100 pt-4 text-[12.5px] font-semibold text-sand-700">
            {microtrust.map((m) => (
              <span key={m} className="inline-flex items-center gap-1.5"><span className="text-success">✓</span> {m}</span>
            ))}
          </div>
        </div>
      </div>

      {/* trust strip */}
      <div className="mx-auto max-w-6xl px-[clamp(16px,4vw,32px)] py-10">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-center text-[13.5px] font-semibold text-sand-700">
          {trust.map((badge) => (
            <span key={badge} className="inline-flex items-center gap-2">
              <span className="text-success">✓</span> {badge}
            </span>
          ))}
        </div>
      </div>

      {/* Umrah Guide — step-by-step ritual companion (distinct from the Smart Visit planner) */}
      <section className="mx-auto max-w-6xl px-[clamp(16px,4vw,32px)] py-4">
        <div className="flex flex-col items-start gap-4 overflow-hidden rounded-[20px] border border-green-100 bg-gradient-to-br from-green-50 to-sand-50 p-[clamp(20px,3vw,30px)] sm:flex-row sm:items-center">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-800 text-3xl">🕋</div>
          <div className="flex-1">
            <div className="font-serif text-[clamp(1.25rem,2.4vw,1.6rem)] font-semibold leading-tight text-sand-ink">
              Performing Umrah? Follow our free step-by-step guide
            </div>
            <p className="mt-1 max-w-[60ch] text-[14.5px] leading-relaxed text-sand-600">
              15 steps with duas, Tawaf &amp; Sa‘i counters, a timer, personal du‘as and voice notes — plus a virtual tour. No login needed.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              href="/guide"
              className="inline-flex items-center gap-2 rounded-xl bg-green-800 px-5 py-3 text-[14.5px] font-semibold text-white transition-[transform,background-color] duration-fast hover:bg-green-700 active:scale-[0.98]"
            >
              Open the guide →
            </Link>
            <Link
              href="/guide/tour"
              className="inline-flex items-center gap-2 rounded-xl border border-green-700/30 bg-white px-5 py-3 text-[14.5px] font-semibold text-green-800 transition-colors duration-fast hover:bg-green-50"
            >
              🧭 Virtual tour
            </Link>
          </div>
        </div>
      </section>

      {/* why book with AUJ */}
      <Section id="why" title={tl('sections.why.title')} sub={tl('sections.why.sub')}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {valueProps.map((v, i) => (
            <div key={v.title} className="rounded-2xl border border-sand-200 bg-white p-5 shadow-sm transition-[transform,box-shadow] duration-200 ease-out-soft hover:-translate-y-0.5 hover:shadow-lg">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-[20px]">{VALUE_ICONS[i]}</span>
              <h3 className="mt-3.5 text-[15px] font-semibold">{v.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-sand-500">{v.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* this week's exclusive deals */}
      <Section id="deals" title={tl('sections.deals.title')} sub={tl('sections.deals.sub')}>
        {/* deal of the day — featured */}
        {dealCards[0] ? (
          <div className="mb-5 flex flex-col items-stretch gap-5 overflow-hidden rounded-2xl border border-sand-200 bg-green-950 text-green-50 md:flex-row">
            <div className="relative min-h-[160px] md:w-2/5">
              <Scene name={dealCards[0].scene} className="absolute inset-0 h-full w-full object-cover" />
              <span className="absolute left-3 top-3 rounded-full bg-gold px-2.5 py-1 text-[11.5px] font-bold text-green-950">{tl('dealsLabels.dealOfDay')}</span>
            </div>
            <div className="flex flex-1 flex-col justify-center gap-2 p-[clamp(20px,3vw,32px)]">
              <h3 className="font-serif text-[clamp(1.25rem,2.4vw,1.75rem)] font-semibold">{dealCards[0].days}-day · {tl('dealsLabels.makkah')} + {tl('dealsLabels.madinah')}</h3>
              <p className="max-w-[52ch] text-[13.5px] leading-relaxed text-green-100/80">
                🕋 {dealCards[0].makkahHotel} · {tl('dealsLabels.nights', { n: dealCards[0].makkahNights })} — 🕌 {dealCards[0].madinahHotel} · {tl('dealsLabels.nights', { n: dealCards[0].madinahNights })}
              </p>
              <div className="mt-1 flex flex-wrap items-end gap-x-4 gap-y-2">
                <span className="font-mono text-[clamp(1.6rem,3vw,2.2rem)] font-bold">{formatMoney(dealCards[0].price)}</span>
                <span className="text-[12px] text-green-100/70">{tl('dealsLabels.perPilgrim')} · {tl('dealsLabels.departs')} {dealCards[0].from}</span>
                <a href="#search" className="ms-auto rounded-xl bg-sand-50 px-5 py-2.5 text-sm font-semibold text-green-900 transition-[transform,background-color] duration-150 hover:bg-white active:scale-[0.98]">{tl('dealsLabels.viewDeal')}</a>
              </div>
            </div>
          </div>
        ) : null}
        <div className="grid gap-5 md:grid-cols-3">
          {dealCards.map((d, i) => (
            <div key={d.id} style={{ animationDelay: `${i * 70}ms` }} className="animate-rise overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-sm transition-[transform,box-shadow] duration-200 ease-out-soft hover:-translate-y-0.5 hover:shadow-lg">
              <div className="relative h-36 overflow-hidden bg-gradient-to-br from-green-700 to-green-950">
                <Scene name={d.scene} className="absolute inset-0 h-full w-full object-cover" />
                <span className="absolute left-3 top-3 rounded-full bg-gold px-2.5 py-1 text-[11.5px] font-bold text-green-950">{tl('dealsLabels.departs')} {d.from}</span>
              </div>
              <div className="p-5">
                <h3 className="text-base font-semibold">{d.days}-day · {pkgItems[i % pkgItems.length]?.name ?? 'Umrah'}</h3>
                <div className="mt-2 grid gap-1 text-[12.5px] text-sand-500">
                  <div className="flex justify-between"><span>🕋 {tl('dealsLabels.makkah')} · {d.makkahHotel}</span><span className="font-mono">{tl('dealsLabels.nights', { n: d.makkahNights })}</span></div>
                  <div className="flex justify-between"><span>🕌 {tl('dealsLabels.madinah')} · {d.madinahHotel}</span><span className="font-mono">{tl('dealsLabels.nights', { n: d.madinahNights })}</span></div>
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <div className="text-[11px] text-sand-500">{tl('dealsLabels.from')}</div>
                    <div className="font-mono text-2xl font-bold text-green-800">{formatMoney(d.price)}</div>
                    <div className="text-[11px] text-sand-500">{tl('dealsLabels.perPilgrim')}</div>
                  </div>
                  <a href="#search" className="rounded-xl bg-green-800 px-4 py-2.5 text-sm font-semibold text-white transition-[transform,background-color] duration-150 hover:bg-green-700 active:scale-[0.98]">{tl('dealsLabels.viewDeal')}</a>
                </div>
                <div className="mt-3 border-t border-sand-100 pt-2.5 text-[11.5px] font-medium text-success-fg">🔒 {tl('dealsLabels.secure')}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* journey types */}
      <Section id="journeys" title={tl('sections.journeys.title')} sub={tl('sections.journeys.sub')}>
        <div className="grid gap-5 md:grid-cols-3">
          {JOURNEY_TYPES.map((j, i) => (
            <div key={j.name} style={{ animationDelay: `${i * 70}ms` }} className="animate-rise overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-sm transition-[transform,box-shadow] duration-200 ease-out-soft hover:-translate-y-0.5 hover:shadow-lg">
              <div className={`relative h-36 overflow-hidden bg-gradient-to-br ${j.img}`}>
                <Scene name={j.scene} className="absolute inset-0 h-full w-full object-cover" />
              </div>
              <div className="p-5">
                <h3 className="font-serif text-xl font-semibold">{j.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-sand-500">{journeyDesc[i] ?? j.desc}</p>
                <a href="#packages" className="mt-4 inline-block text-sm font-semibold text-accent-600">{tl('explore', { name: j.name })}</a>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* experience the difference */}
      <Section id="difference" title={tl('sections.difference.title')} sub={tl('sections.difference.sub')}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <div key={f.title} className="rounded-2xl border border-sand-200 bg-sand-50 p-5 transition-[transform,box-shadow] duration-200 ease-out-soft hover:-translate-y-0.5 hover:shadow-lg">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[20px] shadow-sm">{FEATURE_ICONS[i]}</span>
              <h3 className="mt-3.5 text-[15px] font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-sand-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* one cart */}
      <Section id="cart" title={tl('sections.cart.title')} sub={tl('sections.cart.sub')}>
        <div className="grid items-center gap-8 md:grid-cols-2">
          <ul className="grid gap-3">
            {['Nusuk-approved hotels in Makkah & Madinah', 'Airport & inter-city transport (Naqaba)', 'Guided ground services & ziyarah', 'Flights from your EU city'].map((f) => (
              <li key={f} className="flex items-center gap-3 rounded-xl border border-sand-200 bg-white p-3.5 text-sm font-medium">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-success-fg">✓</span>
                {f}
              </li>
            ))}
          </ul>
          <div className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
            <div className="text-[13px] font-semibold text-sand-500">Your cart · 4 pilgrims · 14 nights</div>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="font-mono text-4xl font-bold text-green-800">{formatMoney({ amount: 992000, currency: 'EUR' })}</span>
              <span className="font-mono text-sm text-sand-500">{pkrIndicative({ amount: 992000, currency: 'EUR' })}</span>
            </div>
            <div className="mt-1 text-xs text-sand-500">Charged in EUR · PKR indicative at today’s rate</div>
            <a href="#search" className="mt-5 block rounded-xl bg-green-800 py-3 text-center text-sm font-semibold text-white transition-[transform,background-color] duration-fast hover:bg-green-700 active:scale-[0.98] focus-visible:outline-none focus-visible:shadow-focus">Build your package</a>
          </div>
        </div>
      </Section>

      {/* how it works */}
      <Section id="how" title={tl('sections.how.title')} sub={tl('sections.how.sub')}>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stepItems.map((s, i) => (
            <div key={s.title} className="rounded-2xl border border-sand-200 bg-white p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-800 font-mono text-lg font-semibold text-white">{i + 1}</span>
              <h3 className="mt-3 text-base font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-sand-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* visa route panel */}
      <div className="mx-auto max-w-6xl px-[clamp(16px,4vw,32px)] py-8">
        <div className="rounded-3xl bg-[radial-gradient(120%_120%_at_0%_0%,#156440,#0A3D26_60%)] p-[clamp(24px,4vw,48px)] text-green-50">
          <h2 className="font-serif text-[clamp(1.5rem,3vw,2.25rem)] font-semibold">Your visa route, detected automatically</h2>
          <p className="mt-2 max-w-2xl text-green-100/80">From each pilgrim’s passport — no guesswork. Mixed groups show a route per person.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <VisaCard nationality="LT" passport="Lithuania (EU)" />
            <VisaCard nationality="PK" passport="Pakistan" />
          </div>
        </div>
      </div>

      {/* featured packages */}
      <Section id="packages" title={tl('sections.packages.title')} sub={tl('sections.packages.sub')}>
        <div className="grid gap-5 md:grid-cols-3">
          {PACKAGES.map((p, i) => (
            <div key={p.name} style={{ animationDelay: `${i * 70}ms` }} className="animate-rise overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-sm transition-[transform,box-shadow] duration-200 ease-out-soft hover:-translate-y-0.5 hover:shadow-lg">
              <div className={`relative h-40 overflow-hidden bg-gradient-to-br ${p.img}`}>
                <Scene name={p.scene} className="absolute inset-0 h-full w-full object-cover" />
                <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${p.visa === 'e-Visa' ? 'bg-success-bg text-success-fg' : 'bg-info-bg text-info-fg'}`}>{pkgItems[i]?.visa ?? p.visa}</span>
              </div>
              <div className="p-5">
                <h3 className="text-base font-semibold">{pkgItems[i]?.name ?? p.name}</h3>
                <div className="mt-0.5 text-[13px] text-sand-500">{pkgItems[i]?.meta ?? p.meta}</div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-mono text-2xl font-bold text-green-800">{formatMoney(p.price)}</span>
                  <span className="text-[11px] text-sand-500">per pilgrim</span>
                </div>
                <div className="font-mono text-xs text-sand-500">{pkrIndicative(p.price)}</div>
                <a href="#search" className="mt-4 block rounded-xl bg-green-800 py-2.5 text-center text-sm font-semibold text-white transition-[transform,background-color] duration-fast hover:bg-green-700 active:scale-[0.98] focus-visible:outline-none focus-visible:shadow-focus">View package</a>
              </div>
            </div>
          ))}
        </div>
        {/* popular categories */}
        <div className="mt-6 flex flex-wrap gap-2.5">
          {categories.map((c) => (
            <a key={c} href="#search" className="rounded-full border border-sand-200 bg-white px-4 py-2 text-[13px] font-semibold text-sand-700 hover:border-green-700 hover:text-green-800">
              {c}
            </a>
          ))}
        </div>
      </Section>

      {/* departures directory */}
      <Section id="departures" title={tl('sections.departures.title')} sub={tl('sections.departures.sub')}>
        <div className="grid gap-5 md:grid-cols-3">
          {DEPARTURES_GRID.map((group, gi) => (
            <div key={gi} className="rounded-2xl border border-sand-200 bg-white p-5 shadow-sm">
              <div className="mb-3 text-[13px] font-bold text-sand-ink">{departureRegions[gi] ?? `Region ${gi + 1}`}</div>
              <ul className="grid gap-2">
                {group.cities.map((city) => (
                  <li key={city}>
                    <a href="#search" className="flex items-center justify-between rounded-lg px-2 py-1.5 text-[13.5px] text-sand-700 hover:bg-sand-50 hover:text-green-800">
                      <span>✈️ {city}</span>
                      <span className="text-sand-300">→</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* multilingual */}
      <Section id="lang" title={tl('sections.lang.title')} sub={tl('sections.lang.sub')}>
        <div className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap gap-2">
            {LOCALES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setDemoLocale(l)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${demoLocale.code === l.code ? 'bg-green-800 text-white' : 'bg-sand-100 text-sand-700'}`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <div dir={demoLocale.rtl ? 'rtl' : 'ltr'} className={`rounded-xl bg-sand-50 p-6 ${demoLocale.rtl ? 'font-arabic' : ''}`}>
            <div className="font-serif text-2xl font-semibold text-sand-ink">{demoLocale.phrase}</div>
            <div className="mt-1 text-sm text-sand-500">{demoLocale.label} · dir={demoLocale.rtl ? 'rtl' : 'ltr'}</div>
          </div>
        </div>
      </Section>

      {/* track booking */}
      <Section id="track" title={tl('sections.track.title')} sub={tl('sections.track.sub')}>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
            <label className="text-[13px] font-medium text-sand-700">Booking reference (BRN)</label>
            <div className="mt-2 flex gap-2">
              <input defaultValue="BRN-26-VNO-00481" className="h-12 flex-1 rounded-lg border-[1.5px] border-sand-300 px-3 font-mono text-sm" />
              <button type="button" className="rounded-lg bg-green-800 px-5 text-sm font-semibold text-white transition-[transform,background-color] duration-fast hover:bg-green-700 active:scale-[0.98] focus-visible:outline-none focus-visible:shadow-focus">Track</button>
            </div>
          </div>
          <div className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
            {['Booked', 'Documents', 'Visa processing', 'Travel', 'Return'].map((step, i) => (
              <div key={step} className="flex items-center gap-3 py-1">
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] text-white ${i < 2 ? 'bg-success' : i === 2 ? 'bg-warning' : 'bg-sand-300'}`}>{i < 2 ? '✓' : ''}</span>
                <span className={`text-sm ${i <= 2 ? 'font-semibold text-sand-ink' : 'text-sand-500'}`}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* support channels */}
      <Section id="support" title={tl('sections.support.title')} sub={tl('sections.support.sub')}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SUPPORT_CHANNELS.map((ch, i) => (
            <div key={ch.detail} className="rounded-2xl border border-sand-200 bg-white p-5 shadow-sm">
              <span className="text-[22px]">{ch.icon}</span>
              <h3 className="mt-2.5 text-[15px] font-semibold">{supportChannels[i] ?? ch.detail}</h3>
              <div className="mt-1 font-mono text-[13px] text-accent-600">{ch.detail}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* payment & protection */}
      <Section id="protection" title={tl('sections.protection.title')} sub={tl('sections.protection.sub')}>
        <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <div className="grid gap-4 sm:grid-cols-3">
            {(['installments', 'secure3ds', 'insolvency'] as const).map((k, i) => (
              <div key={k} className="rounded-2xl border border-sand-200 bg-white p-5 shadow-sm">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-[20px]">{['💳', '🔒', '🛡️'][i]}</span>
                <h3 className="mt-3.5 text-[14.5px] font-semibold">{tl(`protection.${k}`)}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-sand-500">{tl(`protection.${k}Desc`)}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl bg-green-800 p-6 text-green-50">
            <div className="text-[13px] font-semibold text-green-100/80">{tl('protection.methods')}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {PAYMENT_METHODS.map((m) => (
                <span key={m} className="rounded-lg bg-white/10 px-3 py-1.5 text-[13px] font-semibold">{m}</span>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-2 border-t border-white/15 pt-4 text-[13px] font-semibold">
              <span className="text-gold">★</span> {tl('protection.licensed')}
            </div>
          </div>
        </div>
      </Section>

      {/* testimonials */}
      <Section id="reviews" title={tl('sections.reviews.title')}>
        <div className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((tt, i) => (
            <figure key={tt.name} className="rounded-2xl border border-sand-200 bg-white p-5 shadow-sm">
              <blockquote className="text-[15px] leading-relaxed text-sand-700">“{quotes[i] ?? tt.quote}”</blockquote>
              <figcaption className="mt-3 text-sm font-semibold text-sand-ink">
                {tt.name} <span className="font-normal text-sand-500">· {tt.city}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      {/* faq */}
      <Section id="faq" title={tl('sections.faq.title')}>
        <div className="mx-auto max-w-3xl divide-y divide-sand-200 overflow-hidden rounded-2xl border border-sand-200 bg-white">
          {FAQS.map((f, i) => (
            <div key={i}>
              <button type="button" onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-semibold">
                {faqItems[i]?.q ?? f.q}
                <span className="text-sand-500">{openFaq === i ? '−' : '+'}</span>
              </button>
              {openFaq === i ? <p className="px-5 pb-4 text-sm leading-relaxed text-sand-500">{faqItems[i]?.a ?? f.a}</p> : null}
            </div>
          ))}
        </div>
      </Section>

      {/* CTA band */}
      <div id="agents" className="mx-auto max-w-6xl px-[clamp(16px,4vw,32px)] py-10">
        <div className="relative flex flex-wrap items-center justify-between gap-6 overflow-hidden rounded-3xl bg-green-800 p-[clamp(24px,4vw,44px)] text-green-50">
          <img
            src="/img/scenes/madinah.webp"
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <span aria-hidden className="absolute inset-0 bg-gradient-to-r from-green-950/92 via-green-900/80 to-green-900/55" />
          <div className="relative">
            <h2 className="font-serif text-[clamp(1.5rem,3vw,2rem)] font-semibold">Ready to begin?</h2>
            <p className="mt-1 text-green-100/80">Plan a pilgrimage, or open a trade account for your agency.</p>
          </div>
          <div className="relative flex flex-wrap gap-3">
            <a href="#plan" className="rounded-xl bg-sand-50 px-6 py-3 text-sm font-semibold text-green-900 transition-[transform,background-color] duration-fast hover:bg-white active:scale-[0.98] focus-visible:outline-none focus-visible:shadow-focus">Plan my pilgrimage</a>
            <a href="#" className="rounded-xl border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold transition-[transform,background-color] duration-fast hover:bg-white/15 active:scale-[0.98] focus-visible:outline-none focus-visible:shadow-focus">For travel agents</a>
          </div>
        </div>
      </div>

      {/* footer */}
      <SiteFooter />
    </div>
  );
}

function Lbl({ children }: { children: ReactNode }) {
  return <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-sand-500">{children}</div>;
}

function NightStepper({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <Lbl>{label}</Lbl>
      <div className="flex items-center gap-2 rounded-[10px] border-[1.5px] border-sand-300 px-2 py-1.5">
        <button type="button" aria-label={`${label} −`} onClick={() => onChange(Math.max(0, value - 1))} className="h-8 w-8 rounded-lg border border-sand-200 bg-sand-50 text-lg text-green-700">−</button>
        <span className="min-w-[1.5rem] text-center text-[14.5px] font-semibold tabular-nums">{value}</span>
        <button type="button" aria-label={`${label} +`} onClick={() => onChange(Math.min(30, value + 1))} className="h-8 w-8 rounded-lg bg-green-800 text-lg text-white">+</button>
      </div>
    </div>
  );
}

function DateField({ label, value, onChange, min }: { label: string; value: string; onChange: (v: string) => void; min?: string }) {
  return (
    <div>
      <Lbl>{label}</Lbl>
      <input
        type="date"
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="w-full rounded-[10px] border-[1.5px] border-sand-300 bg-white px-3 py-[11px] text-[14px] font-medium text-sand-ink focus:border-green-700 focus:outline-none"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <Lbl>{label}</Lbl>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="w-full rounded-[10px] border-[1.5px] border-sand-300 bg-white px-3 py-3 text-[14.5px] font-medium text-sand-ink focus:border-green-700 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

/**
 * Reveals its children once, with a single quiet rise+fade, when they scroll into view.
 * Origin-aware (rises 8px from below), ≤300ms, transform/opacity only. Falls back to
 * shown-immediately where IntersectionObserver is absent (SSR/jsdom) and drops the motion
 * entirely under prefers-reduced-motion.
 */
function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`transition-[opacity,transform] duration-300 ease-out-soft motion-reduce:transition-none ${
        shown
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-2 motion-reduce:translate-y-0 motion-reduce:opacity-100'
      }`}
    >
      {children}
    </div>
  );
}

function Section({ id, title, sub, children }: { id?: string; title: string; sub?: string; children: ReactNode }) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-[clamp(16px,4vw,32px)] py-12">
      <Reveal>
        <h2 className="font-serif text-[clamp(1.5rem,3vw,2.25rem)] font-semibold tracking-[-0.01em]">{title}</h2>
        {sub ? <p className="mt-2 max-w-[60ch] text-sand-500">{sub}</p> : null}
        <div className="mt-7">{children}</div>
      </Reveal>
    </section>
  );
}

function VisaCard({ nationality, passport }: { nationality: string; passport: string }) {
  const route = routeFor({ id: 'x', firstName: 'A', lastName: 'B', passportNumber: 'X', nationality, dob: '1990-01-01', gender: 'M' }).route;
  const evisa = route === 'EVISA_DIRECT';
  return (
    <div className="rounded-2xl bg-white/10 p-5">
      <div className="text-[13px] text-green-100/70">{passport}</div>
      <div className="mt-2 flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${evisa ? 'bg-success' : 'bg-info'}`}>🪪</span>
        <div>
          <div className="font-semibold text-white">{evisa ? 'e-Visa route' : 'Agent channel'}</div>
          <div className="text-[12.5px] text-green-100/80">{evisa ? 'Issued online in ~3 days' : 'Via a MoRA-licensed operator'}</div>
        </div>
      </div>
    </div>
  );
}
