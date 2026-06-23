'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { ScreenFrame } from '../components/ScreenFrame';
import { formatMoney } from '../currency';
import { getDepartureFlightsAction, type DepartureFlights } from './departure-flights-actions';
import type { DepartAirport, DepartRoute } from './airport-content';

const DEST_HUB: Record<string, string> = { Makkah: 'JED', Madinah: 'MED' };
const fmtTime = (iso: string): string => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString(undefined, { weekday: 'short', hour: '2-digit', minute: '2-digit' });
};
const soon = (): string => new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10);

export function DepartureHub({ airport }: { airport: DepartAirport }) {
  const [dest, setDest] = useState<'Makkah' | 'Madinah'>('Makkah');
  const [flights, setFlights] = useState<Record<string, DepartureFlights>>({});
  const [pending, start] = useTransition();
  const routes = dest === 'Makkah' ? airport.toMakkah : airport.toMadinah;
  const hub = DEST_HUB[dest] ?? 'JED';

  const loadFlights = (key: string, from: string, h: string): void =>
    start(async () => {
      const r = await getDepartureFlightsAction(from, h, soon());
      setFlights((m) => ({ ...m, [key]: r }));
    });

  const fwdKey = `${dest}`;
  const fwd = flights[fwdKey];
  const ret = flights.return;

  return (
    <ScreenFrame label={`DEPARTING · ${airport.city.toUpperCase()} (${airport.code})`} tag={airport.region}>
      <p className="mb-4 max-w-[60ch] text-[14.5px] leading-relaxed text-sand-600">{airport.blurb}</p>

      {/* media: bespoke walkthrough clips/photos (uploaded or linked from the airport site) when
          present; otherwise the Airport-guide walkthrough tile + a helper image. */}
      {airport.media && airport.media.length > 0 ? (
        <div className="mb-5 grid gap-3 md:grid-cols-2">
          {airport.media.map((m, i) => (
            <figure key={i} className="relative overflow-hidden rounded-2xl border border-sand-200 bg-green-950">
              {m.type === 'image' ? (
                <img src={m.url} alt={m.title ?? `${airport.city} airport`} className="h-44 w-full object-cover" loading="lazy" />
              ) : m.source === 'upload' ? (
                <video src={m.url} controls preload="metadata" className="h-44 w-full bg-black object-contain" />
              ) : (
                <a href={m.url} target="_blank" rel="noopener noreferrer" className="group flex h-44 items-center justify-center bg-gradient-to-br from-green-700 via-green-900 to-green-950">
                  <span className="relative grid h-16 w-16 place-items-center rounded-full bg-green-800/95 shadow-lg transition-transform duration-fast group-hover:scale-105"><svg width="28" height="28" viewBox="0 0 24 24" fill="#fff" aria-hidden><path d="M8 5v14l11-7z" /></svg></span>
                </a>
              )}
              {m.title ? <figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-950/80 to-transparent px-4 py-2 font-mono text-[11px] tracking-[0.08em] text-green-50/95">{m.title}</figcaption> : null}
            </figure>
          ))}
        </div>
      ) : (
        <div className="mb-5 grid gap-3 md:grid-cols-2">
          <Link href="/guide/airport" className="group relative flex h-44 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-green-700 via-green-900 to-green-950">
            <span aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_100%_at_70%_20%,rgba(42,148,104,0.5),transparent_60%)]" />
            <span className="relative grid h-16 w-16 place-items-center rounded-full bg-green-800/95 shadow-lg transition-transform duration-fast group-hover:scale-105"><svg width="28" height="28" viewBox="0 0 24 24" fill="#fff" aria-hidden><path d="M8 5v14l11-7z" /></svg></span>
            <span className="absolute bottom-3 left-4 font-mono text-[11px] tracking-[0.1em] text-green-50/90">AIRPORT WALKTHROUGH · {airport.code}</span>
          </Link>
          <div className="relative h-44 overflow-hidden rounded-2xl">
            <img src="/img/scenes/makkah-madinah.webp" alt="Makkah & Madinah" className="h-full w-full object-cover" loading="lazy" />
            <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-green-950/60 to-transparent" />
            <span className="absolute bottom-3 left-4 font-mono text-[11px] tracking-[0.1em] text-white/90">{airport.city} → MAKKAH · MADINAH</span>
          </div>
        </div>
      )}

      {/* check-in guide */}
      <section className="mb-5 rounded-2xl border border-sand-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-serif text-lg font-semibold text-sand-ink">Easy check-in at {airport.city}</h2>
          <Link href="/guide/airport" className="shrink-0 rounded-xl border border-sand-300 bg-white px-3.5 py-1.5 text-[12.5px] font-semibold text-green-800 hover:bg-sand-50">Full airport guide →</Link>
        </div>
        <ol className="grid gap-2.5 sm:grid-cols-2">
          {airport.checkInSteps.map((s, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-green-100 font-mono text-[12px] font-semibold text-green-800">{i + 1}</span>
              <span className="text-[13.5px] leading-snug text-sand-700">{s}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* flights to Makkah / Madinah */}
      <section className="mb-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-serif text-lg font-semibold text-sand-ink">Flights to the Haramain</h2>
          <div className="flex gap-1 rounded-xl bg-sand-100 p-1">
            {(['Makkah', 'Madinah'] as const).map((d) => (
              <button key={d} type="button" onClick={() => setDest(d)} className={`rounded-lg px-4 py-1.5 text-[13px] font-semibold ${dest === d ? 'bg-white text-green-800 shadow-sm' : 'text-sand-500'}`}>
                {d} <span className="font-mono text-[11px] opacity-70">· {DEST_HUB[d]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-2.5">
          {routes.map((r: DepartRoute, i) => (
            <div key={i} className="rounded-2xl border border-sand-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-semibold text-sand-ink">{airport.code} → {r.hub} <span className="text-sand-400">·</span> {r.via}</div>
                <span className="rounded-full bg-green-100 px-2.5 py-1 text-[12px] font-semibold text-green-800">{r.frequency}</span>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-sand-600">
                <span>✈️ {r.airlines.join(' · ')}</span>
                <span className="text-sand-400">{r.durationText}</span>
              </div>
            </div>
          ))}
        </div>

        <button type="button" onClick={() => loadFlights(fwdKey, airport.code, hub)} disabled={pending} className="mt-3 rounded-xl bg-green-800 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-fast hover:bg-green-700 disabled:opacity-50">
          {pending && !fwd ? 'Searching…' : `Show flights · ${airport.code} → ${hub}`}
        </button>
        {fwd ? <FlightList data={fwd} emptyHub={hub} /> : null}
      </section>

      {/* arrivals from Makkah/Madinah */}
      <section className="mb-5 rounded-2xl border border-sand-200 bg-white p-5">
        <h2 className="mb-1 font-serif text-lg font-semibold text-sand-ink">Coming home to {airport.city}</h2>
        <p className="mb-3 text-[13.5px] text-sand-600">{airport.arrivalsNote}</p>
        <button type="button" onClick={() => loadFlights('return', hub, airport.code)} disabled={pending} className="rounded-xl border border-sand-300 bg-white px-5 py-2.5 text-sm font-semibold text-green-800 transition-colors duration-fast hover:bg-sand-50 disabled:opacity-50">
          {pending && !ret ? 'Searching…' : `Show return flights · ${hub} → ${airport.code}`}
        </button>
        {ret ? <FlightList data={ret} emptyHub={airport.code} /> : null}
      </section>

      <Link href={`/book?from=${airport.code}`} className="inline-flex items-center gap-2 rounded-xl bg-green-800 px-6 py-3 text-[15px] font-semibold text-white shadow-[0_8px_18px_rgba(15,81,50,0.26)] transition-colors duration-fast hover:bg-green-700">
        Search packages from {airport.city} <span aria-hidden>→</span>
      </Link>
    </ScreenFrame>
  );
}

function FlightList({ data, emptyHub }: { data: DepartureFlights; emptyHub: string }) {
  if (data.offers.length === 0) {
    return <p className="mt-3 rounded-xl border border-dashed border-sand-200 bg-sand-50/50 px-4 py-4 text-center text-[13px] text-sand-500">No flights returned for {emptyHub} right now — try the booking search, or check back closer to your dates.</p>;
  }
  return (
    <div className="mt-3">
      <div className="mb-1.5 text-[11.5px] font-semibold uppercase tracking-wider text-sand-400">
        {data.live ? 'Live availability' : 'Sample schedule'} · charged in EUR
      </div>
      <div className="grid gap-2">
        {data.offers.map((o) => (
          <div key={o.id} className="flex items-center gap-3 rounded-xl border border-sand-100 bg-sand-50/40 px-3.5 py-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-green-100 text-[15px]">✈️</span>
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] font-semibold text-sand-ink">{o.carrier}</div>
              <div className="font-mono text-[12px] text-sand-500">{fmtTime(o.depart)} → {fmtTime(o.arrive)}</div>
            </div>
            <span className="whitespace-nowrap font-mono text-[13.5px] font-semibold text-green-800">{formatMoney(o.net)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
