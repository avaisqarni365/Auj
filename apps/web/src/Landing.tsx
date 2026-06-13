'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Logo } from '@auj/ui';
import { routeFor } from '@auj/visa-router';
import type { PublicUser } from '@auj/auth';
import { formatMoney, pkrIndicative } from './currency';
import { AccountMenu } from './auth/AccountMenu';
import {
  DEPARTURE_CITIES,
  DESTINATIONS,
  FAQS,
  HERO_STATS,
  JOURNEY_TYPES,
  LOCALES,
  NAV_LINKS,
  PACKAGES,
  SEARCH_COUNT,
  SEARCH_TABS,
  STEPS,
  TESTIMONIALS,
  TRUST,
  type SearchTab,
} from './content';

export default function Landing({ user }: { user?: PublicUser }) {
  const [tab, setTab] = useState<SearchTab>('Umrah');
  const [from, setFrom] = useState<string>(DEPARTURE_CITIES[0]);
  const [dest, setDest] = useState<string>(DESTINATIONS[0]);
  const [pax, setPax] = useState(4);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [locale, setLocale] = useState(LOCALES[0]!);
  const cycleLocale = (): void => setLocale((cur) => LOCALES[(LOCALES.findIndex((l) => l.code === cur.code) + 1) % LOCALES.length]!);

  return (
    <div className="overflow-x-hidden bg-sand-50 text-sand-ink">
      {/* announcement */}
      <div className="bg-green-950 text-[13px] text-green-100">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-[clamp(16px,4vw,32px)] py-2.5">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            Now departing from <strong className="font-semibold text-green-50">6 EU cities</strong> · e-Visa guidance on every booking
          </span>
          <span className="flex items-center gap-4 text-green-100/80">
            <a href="#agents" className="font-medium hover:text-green-50">For travel agents →</a>
            <span>🌐 EN · LT · UR · AR</span>
          </span>
        </div>
      </div>

      {/* nav */}
      <header className="sticky top-0 z-50 border-b border-sand-200 bg-sand-50/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-[clamp(16px,4vw,32px)] py-3">
          <div className="flex items-center gap-2.5">
            <Logo size={38} />
            <div>
              <div className="font-serif text-xl font-semibold leading-none tracking-[0.05em]">AUJ</div>
              <div className="mt-0.5 text-[10.5px] uppercase tracking-[0.14em] text-sand-500">Pilgrimage &amp; travel</div>
            </div>
          </div>
          <nav className="hidden flex-wrap items-center gap-0.5 md:flex">
            {NAV_LINKS.map((n) => (
              <a key={n} href="#" className="whitespace-nowrap rounded-lg px-3 py-2 text-[14.5px] font-medium text-sand-700 hover:bg-sand-100 hover:text-green-800">
                {n}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button type="button" onClick={cycleLocale} aria-label="Switch language" className="inline-flex items-center gap-1.5 rounded-lg border border-sand-200 bg-white px-3 py-2 text-[13.5px] font-semibold text-sand-700 hover:bg-sand-100">
              🌐 {locale.code.toUpperCase()} ▾
            </button>
            {user ? (
              <AccountMenu user={user} />
            ) : (
              <Link href="/login" className="whitespace-nowrap rounded-lg px-3 py-2 text-[14.5px] font-semibold text-sand-700 hover:bg-sand-100">
                Log in
              </Link>
            )}
            <Link href={user ? '/book' : '/signup'} className="whitespace-nowrap rounded-[10px] bg-green-800 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(15,81,50,0.24)] hover:bg-green-700">
              {user ? 'Book now' : 'Sign up'}
            </Link>
          </div>
        </div>
      </header>

      {/* hero */}
      <section className="relative bg-[radial-gradient(130%_110%_at_88%_0%,#156440_0%,#0A3D26_46%,#07301E_100%)] px-[clamp(16px,4vw,32px)] pb-[clamp(96px,11vw,132px)] pt-[clamp(48px,7vw,76px)] text-green-50">
        <div className="mx-auto grid max-w-6xl items-center gap-[clamp(36px,5vw,56px)] md:grid-cols-2">
          <div className="animate-rise">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[13px] font-medium text-green-100">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Umrah · Hajj · Ziyarat — EU &amp; the Pakistani diaspora
            </span>
            <h1 className="mb-5 font-serif text-[clamp(2.25rem,5.4vw,3.75rem)] font-semibold leading-[1.03] tracking-[-0.022em]">
              Begin a sacred journey, with calm.
            </h1>
            <p className="mb-8 max-w-[520px] text-[clamp(1rem,1.6vw,1.2rem)] leading-relaxed text-green-100/90">
              Hotel, transport, ground services and flights in one cart — with e-Visa guidance, live booking status and prices in EUR or PKR.
            </p>
            <div className="mb-10 flex flex-wrap items-center gap-3">
              <a href="#search" className="inline-flex items-center gap-2 rounded-xl bg-sand-50 px-6 py-3.5 text-[15.5px] font-semibold text-green-900 shadow-[0_10px_28px_rgba(7,48,30,0.4)] hover:bg-white">
                Plan my pilgrimage →
              </a>
              <a href="#how" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3.5 text-[15.5px] font-semibold hover:bg-white/15">
                How it works
              </a>
            </div>
            <div className="flex flex-wrap gap-x-9 gap-y-5 border-t border-white/15 pt-7">
              {HERO_STATS.map((s) => (
                <div key={s.label}>
                  <div className="font-mono text-[22px] font-semibold text-white">{s.value}</div>
                  <div className="mt-0.5 text-[12.5px] text-green-100/70">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          {/* right: photo placeholder + floating cards */}
          <div className="relative min-w-0 animate-fade-in">
            <div className="relative h-[clamp(360px,42vw,520px)] overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(120%_90%_at_68%_16%,#2A9468_0%,#0F5132_42%,#062418_100%)] shadow-[0_36px_70px_-28px_rgba(5,28,18,0.75)]">
              <span className="absolute bottom-4 left-4 rounded-lg bg-green-950/50 px-2.5 py-1.5 font-mono text-[11px] tracking-wide text-white/75">PHOTO · MASJID AL-HARAM, MAKKAH</span>
            </div>
            <div className="absolute -left-2 top-5 w-[232px] max-w-[70%] rounded-2xl bg-white p-4 text-sand-ink shadow-[0_20px_44px_rgba(5,28,18,0.34)]">
              <div className="mb-2.5 flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider text-sand-500">LIVE VISA STATUS</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-bg px-2.5 py-0.5 text-[11px] font-semibold text-warning-fg">
                  <span className="h-1.5 w-1.5 rounded-full bg-warning" />In progress
                </span>
              </div>
              <div className="font-mono text-[13px] font-medium text-accent-600">BRN-26-VNO-00481</div>
              <div className="mt-1 text-[12.5px] text-sand-700">e-Visa submitted to MOFA · est. 2–3 days</div>
            </div>
            <div className="absolute -right-2 bottom-6 rounded-xl bg-white p-3.5 text-sand-ink shadow-[0_20px_44px_rgba(5,28,18,0.34)]">
              <div className="text-[11px] font-semibold text-sand-500">Umrah Premium · 14 nights</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-mono text-[22px] font-bold text-green-800">€2,480</span>
                <span className="font-mono text-[11px] text-sand-500">≈ ₨771k</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* search card (overlapping) */}
      <div id="search" className="relative z-20 mx-auto -mt-[clamp(88px,9vw,92px)] max-w-5xl px-[clamp(16px,4vw,32px)]">
        <div className="animate-rise rounded-[22px] border border-sand-200 bg-white p-[clamp(18px,2.4vw,24px)] shadow-[0_24px_60px_-24px_rgba(42,38,32,0.34)]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1 rounded-xl bg-sand-100 p-1">
              {SEARCH_TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`rounded-lg px-5 py-2 text-sm font-semibold ${tab === t ? 'bg-white text-green-800 shadow-sm' : 'text-sand-500'}`}
                >
                  {t}
                </button>
              ))}
            </div>
            <span className="text-[13px] text-sand-500">FX today · 1 € = ₨310.8 · charged in EUR</span>
          </div>
          <div className="grid items-end gap-3 md:grid-cols-[repeat(4,1fr)_auto]">
            <SelectField label="From" value={from} onChange={setFrom} options={[...DEPARTURE_CITIES]} />
            <SelectField label="Destination" value={dest} onChange={setDest} options={[...DESTINATIONS]} />
            <Field label="Dates" value="📅 12–26 Sep · 14 nts" />
            <div>
              <Lbl>Pilgrims</Lbl>
              <div className="flex items-center justify-between rounded-[10px] border-[1.5px] border-sand-300 px-2 py-1.5">
                <button type="button" aria-label="Decrease" onClick={() => setPax((p) => Math.max(1, p - 1))} className="h-8 w-8 rounded-lg border border-sand-200 bg-sand-50 text-lg text-green-700">−</button>
                <span className="text-[14.5px] font-semibold">{pax}</span>
                <button type="button" aria-label="Increase" onClick={() => setPax((p) => Math.min(49, p + 1))} className="h-8 w-8 rounded-lg bg-green-800 text-lg text-white">+</button>
              </div>
            </div>
            <Link
              href={`/book?city=${dest.toUpperCase()}&pax=${pax}`}
              className="flex h-[50px] items-center justify-center whitespace-nowrap rounded-[11px] bg-green-800 px-6 text-[15px] font-semibold text-white shadow-[0_6px_16px_rgba(15,81,50,0.25)] hover:bg-green-700"
            >
              Search {SEARCH_COUNT[tab]} {tab} · {dest} →
            </Link>
          </div>
        </div>
      </div>

      {/* trust strip */}
      <div className="mx-auto max-w-6xl px-[clamp(16px,4vw,32px)] py-10">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-center text-[13.5px] font-semibold text-sand-700">
          {TRUST.map((t) => (
            <span key={t} className="inline-flex items-center gap-2">
              <span className="text-success">✓</span> {t}
            </span>
          ))}
        </div>
      </div>

      {/* journey types */}
      <Section id="journeys" title="Choose your journey" sub="Three ways to travel — each with the right visa route and protection.">
        <div className="grid gap-5 md:grid-cols-3">
          {JOURNEY_TYPES.map((j, i) => (
            <div key={j.name} style={{ animationDelay: `${i * 70}ms` }} className="animate-rise overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-sm">
              <div className={`h-36 bg-gradient-to-br ${j.img}`} />
              <div className="p-5">
                <h3 className="font-serif text-xl font-semibold">{j.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-sand-500">{j.desc}</p>
                <a href="#packages" className="mt-4 inline-block text-sm font-semibold text-accent-600">Explore {j.name} →</a>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* one cart */}
      <Section id="cart" title="Everything in one cart" sub="Hotel, transport, ground services and flights — priced together, charged in EUR.">
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
            <a href="#search" className="mt-5 block rounded-xl bg-green-800 py-3 text-center text-sm font-semibold text-white hover:bg-green-700">Build your package</a>
          </div>
        </div>
      </Section>

      {/* how it works */}
      <Section id="how" title="How it works" sub="From search to a tracked, ticketed booking — in four calm steps.">
        <div className="grid gap-5 md:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-2xl border border-sand-200 bg-white p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-800 font-mono text-lg font-semibold text-white">{s.n}</span>
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
      <Section id="packages" title="Featured packages" sub="A few of this season’s most-booked journeys.">
        <div className="grid gap-5 md:grid-cols-3">
          {PACKAGES.map((p, i) => (
            <div key={p.name} style={{ animationDelay: `${i * 70}ms` }} className="animate-rise overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-sm">
              <div className={`relative h-40 bg-gradient-to-br ${p.img}`}>
                <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${p.visa === 'e-Visa' ? 'bg-success-bg text-success-fg' : 'bg-info-bg text-info-fg'}`}>{p.visa}</span>
              </div>
              <div className="p-5">
                <h3 className="text-base font-semibold">{p.name}</h3>
                <div className="mt-0.5 text-[13px] text-sand-500">{p.meta}</div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-mono text-2xl font-bold text-green-800">{formatMoney(p.price)}</span>
                  <span className="text-[11px] text-sand-500">per pilgrim</span>
                </div>
                <div className="font-mono text-xs text-sand-500">{pkrIndicative(p.price)}</div>
                <a href="#search" className="mt-4 block rounded-xl bg-green-800 py-2.5 text-center text-sm font-semibold text-white hover:bg-green-700">View package</a>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* multilingual */}
      <Section id="lang" title="In your language" sub="EN · LT · UR · AR — Arabic and Urdu mirror to right-to-left.">
        <div className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap gap-2">
            {LOCALES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLocale(l)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${locale.code === l.code ? 'bg-green-800 text-white' : 'bg-sand-100 text-sand-700'}`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <div dir={locale.rtl ? 'rtl' : 'ltr'} className={`rounded-xl bg-sand-50 p-6 ${locale.rtl ? 'font-arabic' : ''}`}>
            <div className="font-serif text-2xl font-semibold text-sand-ink">{locale.phrase}</div>
            <div className="mt-1 text-sm text-sand-500">{locale.label} · dir={locale.rtl ? 'rtl' : 'ltr'}</div>
          </div>
        </div>
      </Section>

      {/* track booking */}
      <Section id="track" title="Track any booking" sub="Enter a BRN to see live status — booked, documents, visa, travel, return.">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
            <label className="text-[13px] font-medium text-sand-700">Booking reference (BRN)</label>
            <div className="mt-2 flex gap-2">
              <input defaultValue="BRN-26-VNO-00481" className="h-12 flex-1 rounded-lg border-[1.5px] border-sand-300 px-3 font-mono text-sm" />
              <button type="button" className="rounded-lg bg-green-800 px-5 text-sm font-semibold text-white">Track</button>
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

      {/* testimonials */}
      <Section id="reviews" title="Trusted by pilgrims across the EU">
        <div className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="rounded-2xl border border-sand-200 bg-white p-5 shadow-sm">
              <blockquote className="text-[15px] leading-relaxed text-sand-700">“{t.quote}”</blockquote>
              <figcaption className="mt-3 text-sm font-semibold text-sand-ink">
                {t.name} <span className="font-normal text-sand-500">· {t.city}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      {/* faq */}
      <Section id="faq" title="Frequently asked">
        <div className="mx-auto max-w-3xl divide-y divide-sand-200 overflow-hidden rounded-2xl border border-sand-200 bg-white">
          {FAQS.map((f, i) => (
            <div key={f.q}>
              <button type="button" onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-semibold">
                {f.q}
                <span className="text-sand-500">{openFaq === i ? '−' : '+'}</span>
              </button>
              {openFaq === i ? <p className="px-5 pb-4 text-sm leading-relaxed text-sand-500">{f.a}</p> : null}
            </div>
          ))}
        </div>
      </Section>

      {/* CTA band */}
      <div id="agents" className="mx-auto max-w-6xl px-[clamp(16px,4vw,32px)] py-10">
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-3xl bg-green-800 p-[clamp(24px,4vw,44px)] text-green-50">
          <div>
            <h2 className="font-serif text-[clamp(1.5rem,3vw,2rem)] font-semibold">Ready to begin?</h2>
            <p className="mt-1 text-green-100/80">Plan a pilgrimage, or open a trade account for your agency.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="#search" className="rounded-xl bg-sand-50 px-6 py-3 text-sm font-semibold text-green-900 hover:bg-white">Plan my pilgrimage</a>
            <a href="#" className="rounded-xl border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold hover:bg-white/15">For travel agents</a>
          </div>
        </div>
      </div>

      {/* footer */}
      <footer className="border-t border-sand-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-[clamp(16px,4vw,32px)] py-8 text-sm text-sand-500">
          <div className="flex items-center gap-2.5">
            <Logo size={32} />
            <span className="font-serif text-lg font-semibold tracking-[0.05em] text-sand-ink">AUJ</span>
          </div>
          <span>© 2026 AUJ · Licensed EU tour operator · Charged in EUR</span>
          <span>EN · LT · UR · AR</span>
        </div>
      </footer>
    </div>
  );
}

function Lbl({ children }: { children: ReactNode }) {
  return <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-sand-500">{children}</div>;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Lbl>{label}</Lbl>
      <div className="flex items-center justify-between rounded-[10px] border-[1.5px] border-sand-300 px-3 py-3 text-[14.5px] font-medium">
        {value} <span className="text-sand-500">▾</span>
      </div>
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

function Section({ id, title, sub, children }: { id?: string; title: string; sub?: string; children: ReactNode }) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-[clamp(16px,4vw,32px)] py-12">
      <h2 className="font-serif text-[clamp(1.5rem,3vw,2.25rem)] font-semibold tracking-[-0.01em]">{title}</h2>
      {sub ? <p className="mt-2 max-w-2xl text-sand-500">{sub}</p> : null}
      <div className="mt-7">{children}</div>
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
