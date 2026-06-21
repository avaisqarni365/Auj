'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ScreenFrame } from '../components/ScreenFrame';
import { GUIDES, GUIDE_SLUGS } from './guide-data';
import type { PrayerDay } from './prayer-times';

const PRAYERS = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;
const EMERGENCY: Array<{ key: 'unified' | 'ambulance' | 'police' | 'fire'; num: string }> = [
  { key: 'unified', num: '911' },
  { key: 'ambulance', num: '997' },
  { key: 'police', num: '999' },
  { key: 'fire', num: '998' },
];

function PrayerCard({ day, fallback }: { day: PrayerDay | null; fallback: string }) {
  if (!day) return <div className="rounded-xl border border-sand-200 bg-white p-4 text-[13px] text-sand-500">{fallback}</div>;
  return (
    <div className="rounded-2xl border border-sand-200 bg-white p-5 shadow-sm">
      <div className="flex items-baseline justify-between">
        <div className="font-serif text-lg font-semibold">{day.city}</div>
        <div className="text-[11.5px] text-sand-500">{day.hijri || day.date}</div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2.5 sm:grid-cols-6">
        {PRAYERS.map((p) => (
          <div key={p} className="rounded-lg bg-sand-50 p-2 text-center">
            <div className="text-[10.5px] font-semibold uppercase tracking-wide text-sand-500">{p}</div>
            <div className="font-mono text-[14px] font-semibold text-green-800 tabular-nums">{day.timings[p]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Section({ icon, title, sub, children }: { icon: string; title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-serif text-[clamp(1.25rem,2.4vw,1.6rem)] font-semibold">{icon} {title}</h2>
      {sub ? <p className="mt-1 max-w-[60ch] text-sm text-sand-500">{sub}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-2">
      {items.map((it) => (
        <li key={it} className="flex items-start gap-2.5 rounded-xl border border-sand-200 bg-white p-3.5 text-[13.5px] leading-relaxed">
          <span className="mt-0.5 text-success">✓</span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

export function Companion({ makkah, madinah }: { makkah: PrayerDay | null; madinah: PrayerDay | null }) {
  const t = useTranslations('companion');
  const day = t.raw('day.items') as string[];
  const transport = t.raw('transport.items') as string[];
  const tips = t.raw('tips.items') as string[];
  const before = t.raw('before.items') as string[];
  const stages = t.raw('journey.stages') as string[];
  const mapsUrl = (q: string): string => `https://www.google.com/maps/search/${encodeURIComponent(q)}`;
  return (
    <ScreenFrame label={`🧭 ${t('title')}`} maxWidth="max-w-3xl">
      <p className="max-w-[60ch] text-sand-500">{t('subtitle')}</p>

      <Section icon="🧭" title={t('journey.title')} sub={t('journey.sub')}>
        <List items={stages} />
      </Section>

      <Section icon="🕌" title={t('prayer.title')} sub={t('prayer.sub')}>
        <div className="grid gap-3">
          <PrayerCard day={makkah} fallback={t('prayer.fallback')} />
          <PrayerCard day={madinah} fallback={t('prayer.fallback')} />
        </div>
        <p className="mt-2 text-[12px] text-sand-500">{t('prayer.jamaatNote')}</p>
      </Section>

      <Section icon="🌅" title={t('day.title')} sub={t('day.sub')}>
        <List items={day} />
        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
          <Link
            href="/plan/day"
            className="flex items-center justify-between rounded-xl border border-green-700/30 bg-green-50 p-3.5 text-[13.5px] font-semibold text-green-800 transition-transform duration-fast hover:border-green-700 active:scale-[0.99]"
          >
            <span>🕌 Open the day planner — jamaat schedule + ±15 min</span>
            <span aria-hidden>→</span>
          </Link>
          <Link
            href="/companion/diary"
            className="flex items-center justify-between rounded-xl border border-green-700/30 bg-green-50 p-3.5 text-[13.5px] font-semibold text-green-800 transition-transform duration-fast hover:border-green-700 active:scale-[0.99]"
          >
            <span>📿 Personal diary — Quran, nafl, duas, reflection</span>
            <span aria-hidden>→</span>
          </Link>
        </div>
      </Section>

      <Section icon="🧳" title={t('before.title')} sub={t('before.sub')}>
        <List items={before} />
        <Link
          href="/companion/packing"
          className="mt-3 flex items-center justify-between rounded-xl border border-green-700/30 bg-green-50 p-3.5 text-[13.5px] font-semibold text-green-800 transition-transform duration-fast hover:border-green-700 active:scale-[0.99]"
        >
          <span>📋 Open the smart packing organizer — by traveller & stay length</span>
          <span aria-hidden>→</span>
        </Link>
      </Section>

      <Section icon="🚑" title={t('safety.title')} sub={t('safety.sub')}>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {EMERGENCY.map((e) => (
            <a key={e.num} href={`tel:${e.num}`} className="rounded-xl border border-danger-fg/25 bg-danger-bg p-3 text-center transition-transform duration-fast active:scale-[0.98]">
              <div className="font-mono text-2xl font-bold text-danger-fg">{e.num}</div>
              <div className="text-[11.5px] font-semibold text-danger-fg">{t(`safety.${e.key}`)}</div>
            </a>
          ))}
        </div>
        <p className="mt-3 text-[13px] text-sand-600">{t('safety.asefny')}</p>
        <p className="mt-1 text-[13px] text-sand-600">{t('safety.hospitalNote')}</p>
      </Section>

      <Section icon="🚄" title={t('transport.title')} sub={t('transport.sub')}>
        <List items={transport} />
      </Section>

      <Section icon="🍽️" title={t('dining.title')} sub={t('dining.sub')}>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {[
            { label: t('dining.makkah'), q: 'restaurants near Masjid al-Haram Makkah' },
            { label: t('dining.madinah'), q: "restaurants near Al-Masjid an-Nabawi Madinah" },
          ].map((d) => (
            <a key={d.q} href={mapsUrl(d.q)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-xl border border-sand-200 bg-white p-3.5 text-[13.5px] font-semibold text-sand-700 transition-[transform,border-color] duration-fast hover:border-green-700 hover:text-green-800 active:scale-[0.99]">
              <span>📍 {d.label}</span>
              <span className="text-sand-300">↗</span>
            </a>
          ))}
        </div>
      </Section>

      <Section icon="🧭" title="On-the-ground guides" sub="Food, transport, connectivity, gifts, laundry, hospitals and a helpline — by city.">
        <div className="grid gap-2.5 sm:grid-cols-2">
          {GUIDE_SLUGS.map((slug) => {
            const def = GUIDES[slug];
            return (
              <Link
                key={slug}
                href={`/guide/${slug}`}
                className="flex items-center justify-between rounded-xl border border-sand-200 bg-white p-3.5 text-[13.5px] font-semibold text-sand-700 transition-[transform,border-color,color] duration-fast hover:border-green-700 hover:text-green-800 active:scale-[0.99]"
              >
                <span>
                  {def.icon} {def.title}
                </span>
                <span className="text-sand-300" aria-hidden>
                  →
                </span>
              </Link>
            );
          })}
        </div>
      </Section>

      <Section icon="🎬" title="Step-by-step wizards" sub="Bilingual walk-throughs with a video on each step — airport, luggage & customs, and the Ziyarat sites.">
        <div className="grid gap-2.5 sm:grid-cols-2">
          {[
            { href: '/guide/airport', icon: '✈️', label: 'Airport wizard' },
            { href: '/guide/luggage', icon: '🧳', label: 'Luggage & customs' },
            { href: '/guide/makkah-ziyarat', icon: '🕋', label: 'Makkah Ziyarat sites' },
            { href: '/guide/madina-ziyarat', icon: '🕌', label: 'Madinah Ziyarat sites' },
            { href: '/guide/tour', icon: '🌅', label: 'Virtual tour' },
            { href: '/guide', icon: '📿', label: 'Umrah ritual guide' },
          ].map((w) => (
            <Link
              key={w.href}
              href={w.href}
              className="flex items-center justify-between rounded-xl border border-sand-200 bg-white p-3.5 text-[13.5px] font-semibold text-sand-700 transition-[transform,border-color,color] duration-fast hover:border-green-700 hover:text-green-800 active:scale-[0.99]"
            >
              <span>
                {w.icon} {w.label}
              </span>
              <span className="text-sand-300" aria-hidden>
                →
              </span>
            </Link>
          ))}
        </div>
      </Section>

      <Section icon="💡" title={t('tips.title')}>
        <List items={tips} />
      </Section>
    </ScreenFrame>
  );
}
