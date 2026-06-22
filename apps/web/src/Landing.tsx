'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { routeFor } from '@auj/visa-router';
import { BrandMark } from './components/BrandMark';
import type { PublicUser } from '@auj/auth';
import { formatMoney, pkrIndicative } from './currency';
import { landingCopy, type LandingOverrides } from './landing-content';
import { HeroBackdrop } from './HeroBackdrop';
import { Scene } from './components/Scene';
import { AnnouncementBar } from './components/AnnouncementBar';
import { DEPART_AIRPORTS } from './depart/airport-content';
import { SiteHeader } from './components/SiteHeader';
import { SiteFooter } from './components/SiteFooter';
import { ScreenFrame } from './components/ScreenFrame';
import {
  DEALS,
  type Deal,
  DEPARTURE_CITIES,
  DEPARTURES_GRID,
  DESTINATIONS,
  FAQS,
  FEATURE_ICONS,
  GLANCE_TILES,
  HERO_STATS,
  JOURNEY_TYPES,
  LANDING_FRAMES,
  type LandingFrame,
  LOCALES,
  PACKAGES,
  PAYMENT_METHODS,
  SEARCH_COUNT,
  SEARCH_TABS,
  SUPPORT_CHANNELS,
  TESTIMONIALS,
  TRUST_MARQUEE,
  VALUE_ICONS,
  type SearchTab,
} from './content';

export default function Landing({ user, deals, content = {} }: { user?: PublicUser; deals?: Deal[]; content?: LandingOverrides }) {
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
  const locale = useLocale();
  // Admin CMS copy overrides the i18n default per locale (landingCopy falls back to EN, then catalog).
  const copy = (key: string, fallback: string): string => landingCopy(key, locale, fallback, content);
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
      {/* announcement — white line, text aligned to the top-right (shared on every page) */}
      <AnnouncementBar />

      {/* nav */}
      <SiteHeader user={user} />

      {/* hero — calm two-column, fills the first screen (no scroll), warm white + high contrast */}
      <section
        className="relative flex min-h-[calc(100svh-150px)] items-center overflow-hidden px-[clamp(16px,4vw,32px)] py-[clamp(20px,3vw,40px)]"
        style={{ background: 'radial-gradient(150% 120% at 82% -10%, #FFFFFF 0%, #FAF6EF 48%, #F1E6D2 100%)' }}
      >
        <HeroBackdrop />
        <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-[clamp(28px,4.5vw,52px)] md:grid-cols-2">
          {/* text */}
          <div className="animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-sand-200 bg-sand-50 px-3.5 py-1.5 text-[12.5px] font-medium text-green-800">
              <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
              {copy('hero.badge', t('heroBadge'))}
            </span>
            <h1 className="mt-6 font-serif text-[clamp(2.4rem,5.2vw,4rem)] font-semibold leading-[1.02] tracking-[-0.025em] text-sand-ink">
              {copy('hero.title', t('heroTitle'))}
            </h1>
            <p className="mt-5 max-w-[52ch] text-[clamp(1.02rem,1.5vw,1.2rem)] leading-relaxed text-sand-600">
              {copy('hero.subtitle', t('heroSubtitle'))}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="/plan" className="relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-green-800 px-6 py-3.5 text-[15.5px] font-semibold text-white shadow-[0_10px_28px_rgba(15,81,50,0.26)] transition-[transform,background-color] duration-fast hover:bg-green-700 active:scale-[0.98] focus-visible:outline-none focus-visible:shadow-focus">
                <span aria-hidden className="animate-sheen pointer-events-none absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                <span className="relative">{t('planPilgrimage')}</span>
              </a>
              <Link href="/guide/tour" className="inline-flex items-center gap-1.5 rounded-xl border border-sand-300 bg-white px-5 py-3.5 text-[15.5px] font-semibold text-green-800 transition-colors duration-fast hover:bg-sand-50 focus-visible:outline-none focus-visible:shadow-focus">
                🧭 Take the virtual tour
              </Link>
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-sand-100 pt-6 text-[13px] text-sand-500">
              {HERO_STATS.map((s, i) => (
                <span key={s.label} className="inline-flex items-baseline gap-1.5">
                  <span className="font-mono text-[15px] font-semibold text-green-800">
                    <CountUp value={s.value} />
                  </span>
                  {statLabels[i] ?? s.label}
                </span>
              ))}
            </div>
          </div>
          {/* frame 01 — Smart Planner glance card (matches the cinematic prototype hero) */}
          <div id="plan-glance" className="w-full">
            <HeroPlannerCard />
          </div>
        </div>
      </section>

      {/* FRAME 02 · VIRTUAL TOUR — cinematic two-panel card (prototype frame 02) */}
      <div id="tour" className="relative z-10 mt-12 scroll-mt-24">
        <ScreenFrame label="FRAME 02 · VIRTUAL TOUR" tag="15 guided steps" maxWidth="max-w-[1080px]" bodyClassName="p-0">
          <div className="flex flex-wrap">
            {/* preview side */}
            <Link
              href="/guide/tour"
              aria-label="Open the virtual tour"
              className="group relative flex min-h-[300px] flex-1 basis-[340px] items-center justify-center overflow-hidden bg-gradient-to-br from-green-700 via-green-900 to-green-950"
            >
              <span aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_100%_at_70%_20%,rgba(42,148,104,0.55),transparent_60%)]" />
              <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-green-950/70 to-transparent" />
              <span className="absolute left-3.5 top-3.5 inline-flex items-center gap-1.5 rounded-full bg-green-950/55 px-3 py-1.5 font-mono text-[10.5px] tracking-[0.1em] text-green-50 backdrop-blur">VIDEO · 01 / 15</span>
              <span className="relative grid h-[78px] w-[78px] place-items-center rounded-full bg-green-800/95 shadow-[0_14px_34px_rgba(0,0,0,0.4)] transition-transform duration-fast group-hover:scale-105 group-active:scale-95">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="#fff" aria-hidden><path d="M8 5v14l11-7z" /></svg>
              </span>
              <span className="absolute bottom-3.5 left-4 font-mono text-[11px] text-white/75">Tap to walk through each rite</span>
            </Link>
            {/* content side */}
            <div className="flex flex-1 basis-[320px] flex-col gap-3.5 p-[clamp(20px,2.4vw,28px)]">
              <div className="flex items-center gap-3">
                <div className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl bg-green-800 font-mono text-[17px] font-semibold text-white">01</div>
                <div>
                  <div className="font-mono text-[10.5px] tracking-[0.1em] text-accent-600">STEP 1 OF 15</div>
                  <div className="mt-px font-serif text-[19px] font-semibold text-sand-ink">Enter the state of Ihram</div>
                </div>
              </div>
              <div dir="rtl" className="rounded-[13px] border border-sand-200 bg-sand-50 px-4 py-3">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="text-[12.5px] font-semibold text-gold">الميقات · النية</span>
                  <span className="rounded-md bg-accent-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-green-800">AR</span>
                </div>
                <div className="text-[17px] leading-[1.7] text-sand-ink">ابدأ رحلتك بالنية والتلبية عند الميقات قبل دخول مكة المكرمة.</div>
              </div>
              <div className="rounded-[13px] border border-sand-200 bg-sand-50 px-4 py-3">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="text-[12px] font-semibold text-gold">Miqat · Intention</span>
                  <span className="rounded-md bg-accent-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-green-800">EN</span>
                </div>
                <div className="text-[14.5px] leading-relaxed text-sand-700">Begin with the intention and Talbiyah at the Miqat, before entering Makkah.</div>
              </div>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-1">
                <span className="font-mono text-[12px] text-sand-500">EN · العربية · اردو · DE</span>
                <Link href="/guide/tour" className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 transition-colors duration-fast hover:text-green-800">
                  Open virtual tour <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          </div>
        </ScreenFrame>
      </div>

      {/* FRAME 03 · SEARCH — direct booking inside the cinematic frame chrome (prototype frame 03) */}
      <div id="search" className="relative z-10 scroll-mt-24">
        <ScreenFrame
          label="FRAME 03 · SEARCH"
          tag="FX today · 1 € = ₨310.8 · charged in EUR"
          maxWidth="max-w-[1080px]"
          bodyClassName="p-[clamp(18px,2.4vw,24px)]"
        >
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
            <span className="text-[13px] text-sand-500">Search the verified catalogue</span>
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
        </ScreenFrame>
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

      {/* cinematic frames — every migrated tool as a framed feature card, frame by frame (frames 02–18) */}
      <Section id="tools" title="Everything for your journey, frame by frame" sub="Free planning tools and on-the-ground guides — most need no login." maxWidth="max-w-[1080px]">
        <div className="flex flex-col gap-[clamp(20px,3vw,32px)]">
          {/* frames 02 (tour) & 03 (search) render as rich cards above; list the rest here */}
          {LANDING_FRAMES.filter((f) => String(f.n) !== '02' && String(f.n) !== '2' && String(f.n) !== '03' && String(f.n) !== '3').map((f) => (
            <FrameCard key={f.n} frame={f} />
          ))}
        </div>
      </Section>

      {/* trust marquee (after the frame sequence, per the prototype order) */}
      <TrustMarquee />

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
                {group.cities.map((city) => {
                  const code = DEPART_AIRPORTS.find((a) => a.city === city)?.code;
                  return (
                    <li key={city}>
                      <Link href={code ? `/from/${code}` : '/from'} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-[13.5px] text-sand-700 hover:bg-sand-50 hover:text-green-800">
                        <span>✈️ {city}</span>
                        <span className="text-sand-300">→</span>
                      </Link>
                    </li>
                  );
                })}
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
            <a href="/plan" className="rounded-xl bg-sand-50 px-6 py-3 text-sm font-semibold text-green-900 transition-[transform,background-color] duration-fast hover:bg-white active:scale-[0.98] focus-visible:outline-none focus-visible:shadow-focus">Plan my pilgrimage</a>
            <Link href="/agent" className="rounded-xl border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold transition-[transform,background-color] duration-fast hover:bg-white/15 active:scale-[0.98] focus-visible:outline-none focus-visible:shadow-focus">For travel agents</Link>
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

function Section({ id, title, sub, maxWidth = 'max-w-6xl', children }: { id?: string; title: string; sub?: string; maxWidth?: string; children: ReactNode }) {
  return (
    <section id={id} className={`mx-auto ${maxWidth} px-[clamp(16px,4vw,32px)] py-12`}>
      <Reveal>
        <h2 className="font-serif text-[clamp(1.5rem,3vw,2.25rem)] font-semibold tracking-[-0.01em]">{title}</h2>
        {sub ? <p className="mt-2 max-w-[60ch] text-sand-500">{sub}</p> : null}
        <div className="mt-7">{children}</div>
      </Reveal>
    </section>
  );
}

// Hero "frame 01" — the Smart Planner glance card (matches the cinematic prototype).
// Data: GLANCE_TILES / LANDING_FRAMES / TRUST_MARQUEE live in content.ts (client-safe landing data).
function HeroPlannerCard() {
  return (
    <div className="animate-rise overflow-hidden rounded-[22px] border border-sand-200 bg-gradient-to-b from-white to-sand-50 shadow-[0_44px_96px_-34px_rgba(5,28,18,0.6)]">
      <div className="relative flex items-center justify-between gap-3 overflow-hidden bg-gradient-to-br from-green-800 to-green-950 px-4 py-3.5">
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
        <div className="flex items-center gap-2.5">
          <span className="grid place-items-center rounded-lg bg-sand-50 px-2 py-1 shadow-sm">
            <BrandMark height={20} />
          </span>
          <span className="font-mono text-[11.5px] tracking-[0.08em] text-green-100/80">FRAME 01 · SMART PLANNER</span>
        </div>
        <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[12px] font-semibold text-green-50">Quick info</span>
      </div>
      <div className="p-[clamp(18px,2.2vw,24px)]">
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h3 className="font-serif text-[clamp(1.2rem,2.2vw,1.45rem)] font-semibold text-sand-ink">Your trip at a glance</h3>
          <span className="text-[12.5px] text-sand-500">Editable anytime</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {GLANCE_TILES.map(([k, v, mono]) => (
            <div key={k} className="rounded-xl border border-sand-200 bg-sand-50 p-3">
              <div className="text-[10.5px] font-semibold uppercase tracking-wide text-sand-500">{k}</div>
              <div className={`mt-1 text-[15px] font-semibold ${mono ? 'font-mono text-green-800' : 'text-sand-800'}`}>{v}</div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between text-[13px]">
          <span className="font-semibold text-sand-800">Planning progress</span>
          <span className="font-mono text-[12px] text-sand-500">Step 3 of 7 · Visa</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-sand-100">
          <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-800" style={{ width: '43%' }} />
        </div>
        <div className="mt-5 flex flex-wrap gap-2.5">
          <a href="/plan" className="inline-flex items-center gap-2 rounded-xl bg-green-800 px-5 py-3 text-[14px] font-semibold text-white shadow-[0_8px_18px_rgba(15,81,50,0.26)] transition-[transform,background-color] duration-fast hover:bg-green-700 active:scale-[0.98]">
            Continue in Smart Planner <span aria-hidden>→</span>
          </a>
          <a href="#search" className="inline-flex items-center gap-2 rounded-xl border border-sand-300 bg-white px-5 py-3 text-[14px] font-semibold text-green-800 transition-colors duration-fast hover:bg-sand-50">
            Or search packages
          </a>
        </div>
      </div>
    </div>
  );
}

// Preview-panel accent → token gradient (gold/red are highlight panels, not body text).
const FRAME_PANEL: Record<LandingFrame['accent'], string> = {
  green: 'bg-gradient-to-br from-green-600 to-green-950',
  blue: 'bg-gradient-to-br from-accent-500 to-green-950',
  gold: 'bg-gradient-to-br from-gold to-warning-fg',
  red: 'bg-gradient-to-br from-danger to-danger-fg',
};

function FrameCard({ frame }: { frame: LandingFrame }) {
  const panel = FRAME_PANEL[frame.accent];
  return (
    <Reveal>
      <article className="overflow-hidden rounded-[22px] border border-sand-200 bg-gradient-to-b from-white to-sand-50 shadow-[0_30px_70px_-28px_rgba(42,38,32,0.42)]">
        {/* header bar */}
        <div className="relative flex flex-wrap items-center justify-between gap-3 overflow-hidden bg-gradient-to-br from-green-800 to-green-950 px-4 py-3.5">
          <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
          <div className="relative flex items-center gap-2.5">
            <span className="grid place-items-center rounded-lg bg-sand-50 px-2 py-1 shadow-sm">
              <BrandMark height={18} />
            </span>
            <span className="font-mono text-[11.5px] tracking-[0.08em] text-green-100/80">
              FRAME {frame.n} · {frame.name}
            </span>
          </div>
          <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[12px] font-semibold text-green-50">{frame.tag}</span>
        </div>
        {/* body — preview panel (left) + content panel (right) */}
        <div className="flex flex-col sm:flex-row">
          <div className={`relative flex min-h-[200px] flex-1 flex-col justify-between overflow-hidden p-[clamp(18px,2.2vw,24px)] text-white sm:basis-1/2 ${panel}`}>
            <span aria-hidden className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold/15 blur-xl" />
            <div className="relative font-mono text-[10.5px] uppercase tracking-[0.1em] text-white/75">{frame.kicker}</div>
            <div className="relative flex items-center gap-3.5">
              <span className="grid h-14 w-14 flex-none place-items-center rounded-2xl border border-white/25 bg-white/10 text-3xl" aria-hidden>{frame.icon}</span>
              <span className="font-serif text-[clamp(1.25rem,2.2vw,1.5rem)] font-semibold leading-tight">{frame.punch}</span>
            </div>
            <div className="relative font-mono text-[10.5px] uppercase tracking-[0.08em] text-white/75">{frame.caption}</div>
          </div>
          <div className="flex flex-1 flex-col gap-3.5 p-[clamp(20px,2.4vw,28px)] sm:basis-1/2">
            <h3 className="font-serif text-[clamp(1.25rem,2.4vw,1.55rem)] font-semibold tracking-[-0.01em] text-sand-ink">{frame.heading}</h3>
            <p className="max-w-[56ch] text-[14.5px] leading-relaxed text-sand-700">{frame.blurb}</p>
            {frame.chips.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {frame.chips.map((c) => (
                  <span key={c} className="rounded-full border border-sand-200 bg-sand-50 px-3 py-1.5 text-[12.5px] font-medium text-sand-700">{c}</span>
                ))}
              </div>
            ) : null}
            <Link
              href={frame.href}
              className="mt-auto inline-flex w-fit items-center gap-2 rounded-xl bg-green-800 px-5 py-3 text-[14px] font-semibold text-white shadow-[0_8px_18px_rgba(15,81,50,0.26)] transition-[transform,background-color] duration-fast hover:bg-green-700 active:scale-[0.98] focus-visible:outline-none focus-visible:shadow-focus"
            >
              {frame.cta} <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

// Animate the leading number of a stat string (e.g. "1,240+" → counts to 1,240 keeping "+").
function CountUp({ value }: { value: string }) {
  const m = value.match(/^([\d.,]+)(.*)$/);
  const target = m ? Number(m[1]!.replace(/,/g, '')) : NaN;
  const suffix = m ? m[2]! : value;
  const decimals = m && m[1]!.includes('.') ? (m[1]!.split('.')[1]?.length ?? 0) : 0;
  const grouped = !!m && m[1]!.includes(',');
  const [shown, setShown] = useState(Number.isFinite(target) ? 0 : target);

  useEffect(() => {
    if (!Number.isFinite(target)) return undefined;
    if (typeof requestAnimationFrame === 'undefined') {
      setShown(target);
      return undefined;
    }
    let raf = 0;
    let start: number | null = null;
    const ease = (p: number): number => 1 - (1 - p) ** 3;
    const tick = (now: number): void => {
      if (start === null) start = now;
      const p = Math.min(1, (now - start) / 1300);
      setShown(target * ease(p));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  if (!Number.isFinite(target)) return <>{value}</>;
  const num = decimals ? shown.toFixed(decimals) : Math.round(shown).toLocaleString('en-US', { useGrouping: grouped });
  return (
    <>
      {num}
      {suffix}
    </>
  );
}

// Seamless trust marquee: the list is doubled and the track animates to -50%.
function TrustMarquee() {
  return (
    <section className="mt-[clamp(40px,5vw,52px)] overflow-hidden border-y border-sand-200 bg-sand-50" aria-label="Trust & accreditation">
      <div className="flex w-max animate-marquee">
        {[...TRUST_MARQUEE, ...TRUST_MARQUEE].map((b, i) => (
          <span key={`${b}-${i}`} className="inline-flex items-center gap-2 whitespace-nowrap px-[30px] py-4 text-[14px] font-semibold text-sand-700">
            <span className="text-green-700" aria-hidden>
              ✓
            </span>
            {b}
          </span>
        ))}
      </div>
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
