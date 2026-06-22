'use client';

import { useState, useTransition } from 'react';
import { ScreenFrame } from '../components/ScreenFrame';
import { saveGuideAction } from '../companion/guide-admin-actions';
import type { GuideCities } from '../companion/guide-store';
import type { GuideCity, GuideItem, GuideSlug } from '../companion/guide-data';

const INPUT = 'w-full rounded-[10px] border-[1.5px] border-sand-300 bg-white px-3 py-2 text-[13.5px] text-sand-ink focus:border-green-700 focus:outline-none';
const CITY_LABEL: Record<string, string> = { makkah: 'Makkah', madinah: 'Madinah', jeddah: 'Jeddah' };

// Admin CRUD for the companion guides. Category structure/headings come from the seed; the editable
// content is the items (name / note / tag / mark) per city → category. Add / reorder / delete + save.
export function GuidesAdmin({ initial, titles, slugs }: { initial: Record<GuideSlug, GuideCities>; titles: Record<GuideSlug, string>; slugs: GuideSlug[] }) {
  const [all, setAll] = useState<Record<GuideSlug, GuideCities>>(initial);
  const [active, setActive] = useState<GuideSlug>(slugs[0] ?? 'food');
  const [msg, setMsg] = useState('');
  const [pending, start] = useTransition();
  const cities = all[active] ?? {};

  const updateCities = (fn: (c: GuideCities) => GuideCities): void => {
    setAll((a) => ({ ...a, [active]: fn(a[active] ?? {}) }));
    setMsg('');
  };
  const updateItems = (city: GuideCity, ci: number, fn: (items: GuideItem[]) => GuideItem[]): void =>
    updateCities((c) => ({ ...c, [city]: (c[city] ?? []).map((cat, k) => (k === ci ? { ...cat, items: fn(cat.items) } : cat)) }));

  const setField = (city: GuideCity, ci: number, ii: number, patch: Partial<GuideItem>): void =>
    updateItems(city, ci, (items) => items.map((it, k) => (k === ii ? { ...it, ...patch } : it)));
  const addItem = (city: GuideCity, ci: number): void => updateItems(city, ci, (items) => [...items, { name: '', note: '', tag: '', mark: '' }]);
  const delItem = (city: GuideCity, ci: number, ii: number): void => updateItems(city, ci, (items) => items.filter((_, k) => k !== ii));
  const move = (city: GuideCity, ci: number, ii: number, d: number): void =>
    updateItems(city, ci, (items) => {
      const j = ii + d;
      if (j < 0 || j >= items.length) return items;
      const n = [...items];
      const [x] = n.splice(ii, 1);
      if (x) n.splice(j, 0, x);
      return n;
    });

  const save = (): void =>
    start(async () => {
      await saveGuideAction(active, cities);
      setMsg(`Saved “${titles[active] ?? active}”.`);
    });

  const cityKeys = Object.keys(cities) as GuideCity[];

  return (
    <ScreenFrame label="ADMIN · GUIDES" tag={`${cityKeys.length} cities`} maxWidth="max-w-4xl">
      <p className="mb-4 text-[13.5px] text-sand-500">
        Edit, add, reorder and delete the items in each guide (per city &amp; category). Category headings come from the guide template; the items here are the editable content. Saves to the live guide.
      </p>

      <div className="mb-5 flex flex-wrap gap-2">
        {slugs.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => { setActive(s); setMsg(''); }}
            className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors ${active === s ? 'border-green-800 bg-green-800 text-white' : 'border-sand-300 bg-white text-sand-700 hover:bg-sand-50'}`}
          >
            {titles[s] ?? s}
          </button>
        ))}
      </div>

      <div className="grid gap-6">
        {cityKeys.map((city) => (
          <section key={city}>
            <h2 className="mb-2 font-serif text-lg font-semibold text-sand-ink">{CITY_LABEL[city] ?? city}</h2>
            <div className="grid gap-4">
              {(cities[city] ?? []).map((cat, ci) => (
                <div key={cat.key} className="rounded-2xl border border-sand-200 bg-white p-4">
                  <div className="mb-2.5">
                    <div className="text-[14px] font-bold text-sand-ink">{cat.name}</div>
                    {cat.desc ? <div className="text-[12px] text-sand-500">{cat.desc}</div> : null}
                  </div>
                  <div className="grid gap-2.5">
                    {cat.items.map((it, ii) => (
                      <div key={ii} className="rounded-xl border border-sand-100 bg-sand-50/40 p-2.5">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="font-mono text-[11px] text-sand-400">#{ii + 1}</span>
                          <div className="flex items-center gap-1.5">
                            <button type="button" onClick={() => move(city, ci, ii, -1)} disabled={ii === 0} className="rounded-md border border-sand-200 px-2 py-0.5 text-[12px] disabled:opacity-40">↑</button>
                            <button type="button" onClick={() => move(city, ci, ii, 1)} disabled={ii === cat.items.length - 1} className="rounded-md border border-sand-200 px-2 py-0.5 text-[12px] disabled:opacity-40">↓</button>
                            <button type="button" onClick={() => delItem(city, ci, ii)} className="rounded-md border border-danger/30 px-2 py-0.5 text-[12px] font-semibold text-danger-fg hover:bg-danger-bg">✕</button>
                          </div>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <input value={it.name} onChange={(e) => setField(city, ci, ii, { name: e.target.value })} placeholder="Name" className={INPUT} />
                          <input value={it.tag} onChange={(e) => setField(city, ci, ii, { tag: e.target.value })} placeholder="Tag" className={INPUT} />
                          <input value={it.note} onChange={(e) => setField(city, ci, ii, { note: e.target.value })} placeholder="Note" className={`${INPUT} sm:col-span-2`} />
                          <input value={it.mark} onChange={(e) => setField(city, ci, ii, { mark: e.target.value })} placeholder="Mark (e.g. distance / number)" className={INPUT} />
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={() => addItem(city, ci)} className="self-start rounded-lg border border-dashed border-sand-300 px-3 py-1.5 text-[12.5px] font-semibold text-green-800 hover:bg-sand-50">+ Add item</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-sand-100 pt-5">
        <button type="button" onClick={save} disabled={pending} className="rounded-xl bg-green-800 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(15,81,50,0.26)] transition-[transform,background-color] duration-fast hover:bg-green-700 active:scale-[0.98] disabled:opacity-50">
          {pending ? 'Saving…' : `Save ${titles[active] ?? active}`}
        </button>
        {msg ? <span className="text-[13px] font-semibold text-success-fg">{msg}</span> : null}
      </div>
    </ScreenFrame>
  );
}
