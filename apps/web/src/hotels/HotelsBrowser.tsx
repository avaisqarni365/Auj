'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ScreenFrame } from '../components/ScreenFrame';
import type { CityHotels } from './hotels-data';

// Distance-band hotel browser (AUJ Makkah/Madina Hotels.dc.html): a green band stage with a
// clickable distance rail + a white hotel list, navigated by prev/next and dots.

const pad2 = (n: number): string => `0${n}`.slice(-2);

export function HotelsBrowser({ city }: { city: CityHotels }) {
  const bands = city.bands;
  const [i, setI] = useState(0);
  const band = bands[Math.max(0, Math.min(i, bands.length - 1))]!;
  const total = bands.length;

  return (
    <ScreenFrame
      label={`${city.title.toUpperCase()} · BY WALKING DISTANCE`}
      tag={<span className="font-mono">{pad2(i + 1)} / {pad2(total)}</span>}
      maxWidth="max-w-[1040px]"
      bodyClassName="p-0"
    >
      <div className="flex flex-wrap">
        {/* band stage + rail */}
        <div className="relative flex flex-1 basis-[300px] flex-col gap-5 overflow-hidden bg-gradient-to-br from-green-700 via-green-900 to-green-950 p-[clamp(22px,2.6vw,30px)] text-green-50">
          <span aria-hidden className="pointer-events-none absolute -right-11 -top-12 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(200,162,74,0.22),transparent_70%)]" />
          <div className="relative">
            <div className="font-mono text-[10.5px] tracking-[0.1em] text-green-100/70">DISTANCE TO {city.mosque.toUpperCase()}</div>
            <div className="mt-2 font-mono text-[clamp(30px,5vw,44px)] font-semibold leading-[1.05]">{band.dist}</div>
            <div className="mt-1.5 text-[13px] text-green-100/80">{band.walk}</div>
            <div className="mt-3 font-serif text-lg font-semibold text-gold">{band.name}</div>
            <p className="mt-1 max-w-[40ch] text-[12.5px] leading-relaxed text-green-100/70">{band.area}</p>
          </div>
          {/* rail */}
          <div className="relative mt-1 flex flex-col gap-1.5">
            {bands.map((b, k) => {
              const active = k === i;
              return (
                <button
                  key={b.short}
                  type="button"
                  onClick={() => setI(k)}
                  className={`flex items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 ${active ? 'bg-white/15' : 'hover:bg-white/[0.07]'}`}
                >
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full font-mono text-[11px] font-semibold ${active ? 'bg-gold text-green-950' : 'bg-white/10 text-green-100/70'}`}>{pad2(k + 1)}</span>
                  <span className={`text-[13px] font-semibold ${active ? 'text-white' : 'text-green-100/60'}`}>{b.short}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* hotel list */}
        <div className="flex flex-1 basis-[360px] flex-col p-[clamp(20px,2.4vw,26px)]">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-[10.5px] tracking-[0.08em] text-green-800">{band.hotels.length} HOTELS · {band.name}</span>
            <Link href={`/book?city=${city.slug.toUpperCase()}`} className="text-[13px] font-semibold text-green-700 transition-colors hover:text-green-800">
              Book in this band →
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {band.hotels.map((h) => (
              <div key={h.name} className="flex items-center gap-3 rounded-xl border border-sand-100 bg-sand-50/40 px-3.5 py-3">
                <span className="grid h-9 w-12 shrink-0 place-items-center rounded-lg bg-green-100 font-mono text-[11px] font-semibold text-green-800">{h.stars}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-sand-ink">{h.name}</div>
                  <div className="text-xs text-sand-500">{h.note}</div>
                </div>
                <span className="whitespace-nowrap font-mono text-[12.5px] font-semibold text-sand-700">{h.dist}</span>
              </div>
            ))}
          </div>

          {/* nav */}
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-sand-100 pt-4">
            <button
              type="button"
              onClick={() => setI((k) => Math.max(0, k - 1))}
              disabled={i === 0}
              className="inline-flex items-center gap-1.5 rounded-xl border border-sand-300 px-4 py-2.5 text-sm font-semibold text-green-700 transition-colors hover:bg-sand-50 disabled:cursor-default disabled:border-sand-200 disabled:text-sand-300"
            >
              ‹ Closer
            </button>
            <div className="flex items-center gap-1.5">
              {bands.map((b, k) => (
                <button
                  key={b.short}
                  type="button"
                  aria-label={`Band ${k + 1}`}
                  onClick={() => setI(k)}
                  className={`h-2.5 rounded-full transition-all duration-200 ${k === i ? 'w-6 bg-green-800' : 'w-2.5 bg-sand-200 hover:bg-sand-300'}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setI((k) => Math.min(total - 1, k + 1))}
              disabled={i === total - 1}
              className="inline-flex items-center gap-1.5 rounded-xl bg-green-800 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(15,81,50,0.26)] transition-colors hover:bg-green-700 disabled:cursor-default disabled:bg-sand-300"
            >
              Further ›
            </button>
          </div>
        </div>
      </div>
    </ScreenFrame>
  );
}
