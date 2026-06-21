'use client';

import { useMemo, useState } from 'react';
import type { GuideCategory, GuideCity, GuideSlug } from './guide-data';
import { GUIDE_I18N, type GuideLocale } from './guide-i18n';

const LANGS: Array<{ code: 'en' | GuideLocale; label: string }> = [
  { code: 'en', label: 'EN' },
  { code: 'lt', label: 'LT' },
  { code: 'tr', label: 'TR' },
];

const pad2 = (n: number): string => `0${n}`.slice(-2);

export function GuideWizard({
  title,
  subtitle,
  icon,
  slug,
  cities,
}: {
  title: string;
  subtitle: string;
  icon: string;
  slug: GuideSlug;
  cities: Record<GuideCity, GuideCategory[]>;
}) {
  const [city, setCity] = useState<GuideCity>('makkah');
  const [lang, setLang] = useState<'en' | GuideLocale>('en');
  const [i, setI] = useState(0);

  // Apply the LT/TR translation overlay (category name/desc/noun + item note); EN = base; any
  // missing translation falls back to English.
  const localized = useMemo<Record<GuideCity, GuideCategory[]>>(() => {
    if (lang === 'en') return cities;
    const tx = GUIDE_I18N[slug]?.[lang];
    if (!tx) return cities;
    const map = (cats: GuideCategory[]): GuideCategory[] =>
      cats.map((c) => ({
        ...c,
        name: tx.cat[c.key]?.name ?? c.name,
        desc: tx.cat[c.key]?.desc ?? c.desc,
        noun: tx.cat[c.key]?.noun ?? c.noun,
        items: c.items.map((it) => ({ ...it, note: tx.item[it.name]?.note ?? it.note })),
      }));
    return { makkah: map(cities.makkah), madinah: map(cities.madinah) };
  }, [cities, lang, slug]);

  const cats = localized[city];
  const total = cats.length;
  const idx = Math.max(0, Math.min(i, total - 1));
  const cat = cats[idx];
  if (!cat) return null;

  const pickCity = (c: GuideCity): void => {
    setCity(c);
    setI(0);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-[clamp(1.6rem,4vw,2.25rem)] font-semibold">
            {icon} {title}
          </h1>
          <p className="mt-2 max-w-[60ch] text-sand-500">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
        {/* Language */}
        <div className="inline-flex rounded-xl border border-sand-200 bg-white p-1">
          {LANGS.map((l) => {
            const active = l.code === lang;
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => setLang(l.code)}
                className={`rounded-lg px-2.5 py-1.5 text-[12px] font-semibold transition-colors duration-fast ${
                  active ? 'bg-green-700 text-white' : 'text-sand-600 hover:text-green-800'
                }`}
                aria-pressed={active}
              >
                {l.label}
              </button>
            );
          })}
        </div>
        {/* City toggle */}
        <div className="inline-flex rounded-xl border border-sand-200 bg-white p-1">
          {(['makkah', 'madinah'] as const).map((c) => {
            const active = c === city;
            return (
              <button
                key={c}
                type="button"
                onClick={() => pickCity(c)}
                className={`rounded-lg px-4 py-1.5 text-[13px] font-semibold capitalize transition-colors duration-fast ${
                  active ? 'bg-green-700 text-white' : 'text-sand-600 hover:text-green-800'
                }`}
                aria-pressed={active}
              >
                {c}
              </button>
            );
          })}
        </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-[220px_1fr]">
        {/* Category rail */}
        <nav className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible" aria-label="Categories">
          {cats.map((c, k) => {
            const active = k === idx;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setI(k)}
                className={`flex flex-none items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-[transform,border-color,background-color] duration-fast active:scale-[0.99] md:flex-auto ${
                  active ? 'border-green-700/40 bg-green-50' : 'border-sand-200 bg-white hover:border-green-700/30'
                }`}
                aria-current={active ? 'true' : undefined}
              >
                <span
                  className={`grid h-6 w-6 flex-none place-items-center rounded-full font-mono text-[11px] font-bold ${
                    active ? 'bg-green-700 text-white' : 'bg-sand-100 text-sand-500'
                  }`}
                >
                  {pad2(k + 1)}
                </span>
                <span className={`text-[13px] font-semibold ${active ? 'text-green-800' : 'text-sand-700'}`}>{c.key}</span>
              </button>
            );
          })}
        </nav>

        {/* Items */}
        <section key={`${city}-${idx}`} className="animate-rise">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-serif text-xl font-semibold text-sand-800">{cat.name}</h2>
            <span className="flex-none font-mono text-[11px] text-sand-400">
              {pad2(idx + 1)} / {pad2(total)}
            </span>
          </div>
          <p className="mt-1 max-w-[60ch] text-[13.5px] text-sand-500">{cat.desc}</p>
          <p className="mt-2 font-mono text-[10.5px] uppercase tracking-wider text-accent-600">
            {cat.items.length} {cat.noun}
          </p>

          <ul className="mt-3 grid gap-2">
            {cat.items.map((it, k) => (
              <li
                key={`${it.name}-${k}`}
                className="flex items-center gap-3 rounded-xl border border-sand-200 bg-white p-3.5 transition-[transform,border-color] duration-fast hover:border-green-700/30"
              >
                <span className="grid h-9 min-w-[36px] flex-none place-items-center rounded-lg bg-sand-100 px-1.5 font-mono text-[12px] font-bold text-green-800">
                  {it.mark}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-semibold leading-tight text-sand-800">{it.name}</div>
                  <div className="text-[12.5px] text-sand-500">{it.note}</div>
                </div>
                {it.tag ? (
                  <span className="flex-none rounded-md bg-green-50 px-2 py-1 text-[11px] font-semibold text-green-800">{it.tag}</span>
                ) : null}
              </li>
            ))}
          </ul>

          {/* Prev / next */}
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-sand-100 pt-4">
            <button
              type="button"
              onClick={() => setI(Math.max(0, idx - 1))}
              disabled={idx === 0}
              className="rounded-lg border border-sand-300 bg-white px-4 py-2 text-[13.5px] font-semibold text-green-800 transition-transform duration-fast active:scale-[0.98] disabled:cursor-default disabled:border-sand-200 disabled:text-sand-300"
            >
              ‹ Back
            </button>
            <div className="flex items-center gap-1.5" aria-hidden>
              {cats.map((c, k) => (
                <span
                  key={c.key}
                  className={`h-2 rounded-full transition-all duration-fast ${k === idx ? 'w-6 bg-green-700' : 'w-2 bg-sand-200'}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setI(Math.min(total - 1, idx + 1))}
              disabled={idx === total - 1}
              className="rounded-lg bg-green-700 px-4 py-2 text-[13.5px] font-semibold text-white transition-transform duration-fast active:scale-[0.98] disabled:opacity-40"
            >
              Next ›
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
