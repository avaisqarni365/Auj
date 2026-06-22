'use client';

import { useState, useTransition } from 'react';
import { ScreenFrame } from '../components/ScreenFrame';
import { saveCityAction } from '../hotels/hotels-admin-actions';
import { isHotelCity, type CityHotels, type Hotel, type HotelBand, type HotelCity } from '../hotels/hotels-data';

const INPUT = 'w-full rounded-[10px] border-[1.5px] border-sand-300 bg-white px-3 py-2 text-[13.5px] text-sand-ink focus:border-green-700 focus:outline-none';
const CITY_LABEL: Record<HotelCity, string> = { makkah: 'Makkah', madinah: 'Madinah' };

const EMPTY_HOTEL: Hotel = { name: '', stars: '', note: '', dist: '' };
const EMPTY_BAND: HotelBand = { short: '', dist: '', walk: '', area: '', name: '', hotels: [] };

function reorder<T>(arr: T[], i: number, d: number): T[] {
  const j = i + d;
  if (j < 0 || j >= arr.length) return arr;
  const n = [...arr];
  const [x] = n.splice(i, 1);
  if (x) n.splice(j, 0, x);
  return n;
}

// Admin CRUD for the Makkah / Madinah hotel directory. Edit city meta (title, mosque), the
// distance bands (add / reorder / delete + per-band fields) and the hotels inside each band.
// English-only — the public browser is English-only. Saves the whole city via saveCityAction.
export function HotelsAdmin({ initial }: { initial: CityHotels[] }) {
  const seed = {} as Record<HotelCity, CityHotels>;
  for (const c of initial) if (isHotelCity(c.slug)) seed[c.slug] = c;
  const [all, setAll] = useState<Record<HotelCity, CityHotels>>(seed);
  const cityKeys = Object.keys(all) as HotelCity[];
  const [active, setActive] = useState<HotelCity>(cityKeys[0] ?? 'makkah');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [pending, start] = useTransition();

  const city: CityHotels = all[active] ?? { slug: active, title: '', mosque: '', bands: [] };

  const update = (fn: (c: CityHotels) => CityHotels): void => {
    setAll((a) => ({ ...a, [active]: fn(a[active] ?? { slug: active, title: '', mosque: '', bands: [] }) }));
    setMsg('');
    setErr('');
  };
  const setMeta = (patch: Partial<CityHotels>): void => update((c) => ({ ...c, ...patch }));
  const updateBands = (fn: (bands: HotelBand[]) => HotelBand[]): void => update((c) => ({ ...c, bands: fn(c.bands) }));
  const setBand = (bi: number, patch: Partial<HotelBand>): void =>
    updateBands((bands) => bands.map((b, k) => (k === bi ? { ...b, ...patch } : b)));
  const addBand = (): void => updateBands((bands) => [...bands, { ...EMPTY_BAND, hotels: [] }]);
  const delBand = (bi: number): void => updateBands((bands) => bands.filter((_, k) => k !== bi));
  const moveBand = (bi: number, d: number): void => updateBands((bands) => reorder(bands, bi, d));

  const updateHotels = (bi: number, fn: (hotels: Hotel[]) => Hotel[]): void =>
    updateBands((bands) => bands.map((b, k) => (k === bi ? { ...b, hotels: fn(b.hotels) } : b)));
  const setHotel = (bi: number, hi: number, patch: Partial<Hotel>): void =>
    updateHotels(bi, (hotels) => hotels.map((h, k) => (k === hi ? { ...h, ...patch } : h)));
  const addHotel = (bi: number): void => updateHotels(bi, (hotels) => [...hotels, { ...EMPTY_HOTEL }]);
  const delHotel = (bi: number, hi: number): void => updateHotels(bi, (hotels) => hotels.filter((_, k) => k !== hi));
  const moveHotel = (bi: number, hi: number, d: number): void => updateHotels(bi, (hotels) => reorder(hotels, hi, d));

  const save = (): void =>
    start(async () => {
      try {
        const fresh = await saveCityAction(active, city);
        setAll((a) => ({ ...a, [active]: fresh }));
        setMsg(`Saved ${CITY_LABEL[active]}.`);
        setErr('');
      } catch {
        setErr('Could not save. Please try again.');
      }
    });

  return (
    <ScreenFrame label="ADMIN · HOTELS" tag={`${city.bands.length} bands`} maxWidth="max-w-4xl">
      <p className="mb-4 text-[13.5px] text-sand-500">
        Edit the Makkah &amp; Madinah hotel directory: the city heading, the walking-distance bands (add, reorder, delete) and the hotels inside each band. Saves to the live directory at <span className="font-mono text-[12.5px]">/hotels/{active}</span>.
      </p>

      <div className="mb-5 flex flex-wrap gap-2">
        {cityKeys.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => { setActive(c); setMsg(''); setErr(''); }}
            className={`min-h-[44px] rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors ${active === c ? 'border-green-800 bg-green-800 text-white' : 'border-sand-300 bg-white text-sand-700 hover:bg-sand-50'}`}
          >
            {CITY_LABEL[c]}
          </button>
        ))}
      </div>

      <div className="mb-5 grid gap-2 rounded-2xl border border-sand-200 bg-white p-4 sm:grid-cols-2">
        <label className="grid gap-1">
          <span className="text-[12px] font-semibold text-sand-500">Title</span>
          <input value={city.title} onChange={(e) => setMeta({ title: e.target.value })} placeholder="Makkah hotels" className={INPUT} />
        </label>
        <label className="grid gap-1">
          <span className="text-[12px] font-semibold text-sand-500">Mosque</span>
          <input value={city.mosque} onChange={(e) => setMeta({ mosque: e.target.value })} placeholder="Masjid al-Haram" className={INPUT} />
        </label>
      </div>

      <div className="grid gap-4">
        {city.bands.map((band, bi) => (
          <div key={bi} className="rounded-2xl border border-sand-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono text-[11px] text-sand-400">BAND #{bi + 1}</span>
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={() => moveBand(bi, -1)} disabled={bi === 0} className="min-h-[44px] rounded-md border border-sand-200 px-2.5 text-[12px] transition-transform active:scale-[0.98] disabled:opacity-40">↑</button>
                <button type="button" onClick={() => moveBand(bi, 1)} disabled={bi === city.bands.length - 1} className="min-h-[44px] rounded-md border border-sand-200 px-2.5 text-[12px] transition-transform active:scale-[0.98] disabled:opacity-40">↓</button>
                <button type="button" onClick={() => delBand(bi)} className="min-h-[44px] rounded-md border border-danger/30 px-2.5 text-[12px] font-semibold text-danger-fg transition-transform hover:bg-danger-bg active:scale-[0.98]">Delete band</button>
              </div>
            </div>

            <div className="mb-3 grid gap-2 sm:grid-cols-2">
              <input value={band.name} onChange={(e) => setBand(bi, { name: e.target.value })} placeholder="Band name (e.g. HARAM-FRONT)" className={INPUT} />
              <input value={band.short} onChange={(e) => setBand(bi, { short: e.target.value })} placeholder="Short (e.g. 0–250 m)" className={INPUT} />
              <input value={band.dist} onChange={(e) => setBand(bi, { dist: e.target.value })} placeholder="Distance (e.g. 0 – 250 m)" className={INPUT} />
              <input value={band.walk} onChange={(e) => setBand(bi, { walk: e.target.value })} placeholder="Walk (e.g. 2–4 min walk)" className={INPUT} />
              <input value={band.area} onChange={(e) => setBand(bi, { area: e.target.value })} placeholder="Area description" className={`${INPUT} sm:col-span-2`} />
            </div>

            <div className="grid gap-2.5">
              {band.hotels.map((h, hi) => (
                <div key={hi} className="rounded-xl border border-sand-100 bg-sand-50/40 p-2.5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-mono text-[11px] text-sand-400">#{hi + 1}</span>
                    <div className="flex items-center gap-1.5">
                      <button type="button" onClick={() => moveHotel(bi, hi, -1)} disabled={hi === 0} className="min-h-[44px] rounded-md border border-sand-200 px-2.5 text-[12px] transition-transform active:scale-[0.98] disabled:opacity-40">↑</button>
                      <button type="button" onClick={() => moveHotel(bi, hi, 1)} disabled={hi === band.hotels.length - 1} className="min-h-[44px] rounded-md border border-sand-200 px-2.5 text-[12px] transition-transform active:scale-[0.98] disabled:opacity-40">↓</button>
                      <button type="button" onClick={() => delHotel(bi, hi)} className="min-h-[44px] rounded-md border border-danger/30 px-2.5 text-[12px] font-semibold text-danger-fg transition-transform hover:bg-danger-bg active:scale-[0.98]">✕</button>
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input value={h.name} onChange={(e) => setHotel(bi, hi, { name: e.target.value })} placeholder="Hotel name" className={`${INPUT} sm:col-span-2`} />
                    <input value={h.stars} onChange={(e) => setHotel(bi, hi, { stars: e.target.value })} placeholder="Stars (e.g. 5★)" className={INPUT} />
                    <input value={h.dist} onChange={(e) => setHotel(bi, hi, { dist: e.target.value })} placeholder="Distance (e.g. ~120 m)" className={INPUT} />
                    <input value={h.note} onChange={(e) => setHotel(bi, hi, { note: e.target.value })} placeholder="Note" className={`${INPUT} sm:col-span-2`} />
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => addHotel(bi)} className="min-h-[44px] self-start rounded-lg border border-dashed border-sand-300 px-3 text-[12.5px] font-semibold text-green-800 transition-transform hover:bg-sand-50 active:scale-[0.98]">+ Add hotel</button>
            </div>
          </div>
        ))}

        <button type="button" onClick={addBand} className="min-h-[44px] self-start rounded-lg border border-dashed border-sand-300 px-4 text-[13px] font-semibold text-green-800 transition-transform hover:bg-sand-50 active:scale-[0.98]">+ Add band</button>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-sand-100 pt-5">
        <button type="button" onClick={save} disabled={pending} className="min-h-[44px] rounded-xl bg-green-800 px-6 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(15,81,50,0.26)] transition-[transform,background-color] duration-fast hover:bg-green-700 active:scale-[0.98] disabled:opacity-50">
          {pending ? 'Saving…' : `Save ${CITY_LABEL[active]}`}
        </button>
        {msg ? <span className="text-[13px] font-semibold text-success-fg">{msg}</span> : null}
        {err ? <span className="text-[13px] font-semibold text-danger-fg">{err}</span> : null}
      </div>
    </ScreenFrame>
  );
}
