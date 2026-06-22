'use client';

import { useState, useTransition } from 'react';
import { ScreenFrame } from '../components/ScreenFrame';
import { saveTemplateAction } from '../companion/packing-admin-actions';
import { PACKING_PROFILES, type Def, type PackingProfile, type SectionDef } from '../companion/packing';

const INPUT = 'w-full rounded-[10px] border-[1.5px] border-sand-300 bg-white px-3 py-2 text-[13.5px] text-sand-ink focus:border-green-700 focus:outline-none';
const BTN_MOVE = 'min-h-[36px] min-w-[36px] rounded-md border border-sand-200 px-2 py-0.5 text-[12px] transition-[transform,background-color] duration-fast hover:bg-sand-50 active:scale-[0.98] disabled:opacity-40';

const newItem = (): Def => ({ id: '', label: '' });
const newSection = (): SectionDef => ({ title: 'New section', items: [] });

function moveIn<T>(arr: T[], i: number, d: number): T[] {
  const j = i + d;
  if (j < 0 || j >= arr.length) return arr;
  const n = [...arr];
  const [x] = n.splice(i, 1);
  if (x !== undefined) n.splice(j, 0, x);
  return n;
}

// Admin CRUD for the shared default Packing Organizer template. Sections (add / remove / reorder /
// edit title); within each, items (add / remove / reorder) with label, optional per (days-per-unit)
// and a profile multi-select (none checked = all profiles). Saves the whole template to the DB.
export function PackingAdmin({ initial }: { initial: SectionDef[] }) {
  const [sections, setSections] = useState<SectionDef[]>(initial);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [pending, start] = useTransition();

  const update = (fn: (s: SectionDef[]) => SectionDef[]): void => {
    setSections((s) => fn(s));
    setMsg('');
    setErr('');
  };
  const setSectionField = (si: number, patch: Partial<SectionDef>): void =>
    update((s) => s.map((sec, k) => (k === si ? { ...sec, ...patch } : sec)));
  const updateItems = (si: number, fn: (items: Def[]) => Def[]): void =>
    update((s) => s.map((sec, k) => (k === si ? { ...sec, items: fn(sec.items) } : sec)));

  const addSection = (): void => update((s) => [...s, newSection()]);
  const delSection = (si: number): void => update((s) => s.filter((_, k) => k !== si));
  const moveSection = (si: number, d: number): void => update((s) => moveIn(s, si, d));

  const setItemField = (si: number, ii: number, patch: Partial<Def>): void =>
    updateItems(si, (items) => items.map((it, k) => (k === ii ? { ...it, ...patch } : it)));
  const addItem = (si: number): void => updateItems(si, (items) => [...items, newItem()]);
  const delItem = (si: number, ii: number): void => updateItems(si, (items) => items.filter((_, k) => k !== ii));
  const moveItem = (si: number, ii: number, d: number): void => updateItems(si, (items) => moveIn(items, ii, d));

  const toggleProfile = (si: number, ii: number, p: PackingProfile): void =>
    updateItems(si, (items) =>
      items.map((it, k) => {
        if (k !== ii) return it;
        const cur = it.profiles ?? [];
        const next = cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p];
        const { profiles: _omit, ...rest } = it;
        return next.length ? { ...rest, profiles: next } : rest;
      }),
    );

  const setPer = (si: number, ii: number, raw: string): void => {
    const trimmed = raw.trim();
    setItemField(si, ii, trimmed === '' ? { per: undefined } : { per: Math.max(1, Math.trunc(Number(trimmed)) || 1) });
  };

  const save = (): void =>
    start(async () => {
      try {
        const fresh = await saveTemplateAction(sections);
        setSections(fresh);
        setErr('');
        setMsg('Saved the packing template.');
      } catch {
        setMsg('');
        setErr('Could not save. Please try again.');
      }
    });

  return (
    <ScreenFrame label="ADMIN · PACKING" tag={`${sections.length} sections`} maxWidth="max-w-4xl">
      <p className="mb-4 text-[13.5px] text-sand-500">
        Edit the shared default Packing Organizer template — the sections and items every traveller sees.
        <code className="mx-1 rounded bg-sand-100 px-1 font-mono text-[12px]">per</code> sets how many days share one unit
        (qty scales with stay length); leave it blank for a single item. Profiles restrict who sees an item — none ticked = everyone.
      </p>

      <div className="grid gap-4">
        {sections.map((sec, si) => (
          <div key={si} className="rounded-2xl border border-sand-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <input
                value={sec.title}
                onChange={(e) => setSectionField(si, { title: e.target.value })}
                placeholder="Section title"
                className={`${INPUT} font-serif text-[15px] font-semibold`}
              />
              <div className="flex flex-none items-center gap-1.5">
                <button type="button" onClick={() => moveSection(si, -1)} disabled={si === 0} className={BTN_MOVE} aria-label="Move section up">↑</button>
                <button type="button" onClick={() => moveSection(si, 1)} disabled={si === sections.length - 1} className={BTN_MOVE} aria-label="Move section down">↓</button>
                <button type="button" onClick={() => delSection(si)} className="min-h-[36px] rounded-md border border-danger/30 px-2 py-0.5 text-[12px] font-semibold text-danger-fg transition-[transform,background-color] duration-fast hover:bg-danger-bg active:scale-[0.98]">Delete</button>
              </div>
            </div>

            <div className="grid gap-2.5">
              {sec.items.map((it, ii) => (
                <div key={ii} className="rounded-xl border border-sand-100 bg-sand-50/40 p-2.5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-mono text-[11px] text-sand-400">#{ii + 1}</span>
                    <div className="flex items-center gap-1.5">
                      <button type="button" onClick={() => moveItem(si, ii, -1)} disabled={ii === 0} className={BTN_MOVE} aria-label="Move item up">↑</button>
                      <button type="button" onClick={() => moveItem(si, ii, 1)} disabled={ii === sec.items.length - 1} className={BTN_MOVE} aria-label="Move item down">↓</button>
                      <button type="button" onClick={() => delItem(si, ii)} className="min-h-[36px] min-w-[36px] rounded-md border border-danger/30 px-2 py-0.5 text-[12px] font-semibold text-danger-fg transition-[transform,background-color] duration-fast hover:bg-danger-bg active:scale-[0.98]" aria-label="Delete item">✕</button>
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                    <input value={it.label} onChange={(e) => setItemField(si, ii, { label: e.target.value })} placeholder="Item label" className={INPUT} />
                    <input
                      value={it.per ?? ''}
                      onChange={(e) => setPer(si, ii, e.target.value)}
                      inputMode="numeric"
                      placeholder="per (days/unit)"
                      className={`${INPUT} sm:w-36`}
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="mr-1 text-[12px] text-sand-500">Profiles:</span>
                    {PACKING_PROFILES.map((p) => {
                      const on = (it.profiles ?? []).includes(p);
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => toggleProfile(si, ii, p)}
                          aria-pressed={on}
                          className={`min-h-[36px] rounded-full border px-3 py-1 text-[12px] font-semibold transition-[transform,background-color,border-color] duration-fast active:scale-[0.98] ${
                            on ? 'border-green-700 bg-green-700 text-white' : 'border-sand-200 bg-white text-sand-600 hover:border-green-700'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                    {!(it.profiles ?? []).length ? <span className="text-[11px] text-sand-400">(all)</span> : null}
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => addItem(si)} className="min-h-[36px] self-start rounded-lg border border-dashed border-sand-300 px-3 py-1.5 text-[12.5px] font-semibold text-green-800 transition-[transform,background-color] duration-fast hover:bg-sand-50 active:scale-[0.98]">+ Add item</button>
            </div>
          </div>
        ))}
      </div>

      <button type="button" onClick={addSection} className="mt-4 min-h-[44px] rounded-xl border border-dashed border-sand-300 px-4 py-2 text-[13px] font-semibold text-green-800 transition-[transform,background-color] duration-fast hover:bg-sand-50 active:scale-[0.98]">+ Add section</button>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-sand-100 pt-5">
        <button type="button" onClick={save} disabled={pending} className="min-h-[44px] rounded-xl bg-green-800 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(15,81,50,0.26)] transition-[transform,background-color] duration-fast hover:bg-green-700 active:scale-[0.98] disabled:opacity-50">
          {pending ? 'Saving…' : 'Save template'}
        </button>
        {msg ? <span className="text-[13px] font-semibold text-success-fg">{msg}</span> : null}
        {err ? <span className="text-[13px] font-semibold text-danger-fg">{err}</span> : null}
      </div>
    </ScreenFrame>
  );
}
