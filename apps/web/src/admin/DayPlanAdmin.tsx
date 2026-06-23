'use client';

import { useState, useTransition } from 'react';
import { ScreenFrame } from '../components/ScreenFrame';
import { saveTemplateAction } from '../ritual/day-plan-template-actions';
import type { BaseSlot, PlannerCity, SlotKind } from '../ritual/planner';

type DayPlanTemplate = Record<PlannerCity, BaseSlot[]>;

const CITIES: readonly PlannerCity[] = ['makkah', 'madinah'];
const KINDS: readonly SlotKind[] = ['prayer', 'meal', 'activity', 'rest'];
const CITY_LABEL: Record<PlannerCity, string> = { makkah: 'Makkah', madinah: 'Madinah' };

const INPUT =
  'w-full rounded-[10px] border-[1.5px] border-sand-300 bg-white px-3 py-2 text-[13.5px] text-sand-ink focus:border-green-700 focus:outline-none';
const BTN_MOVE =
  'min-h-[36px] min-w-[36px] rounded-md border border-sand-200 px-2 py-0.5 text-[12px] transition-[transform,background-color] duration-fast hover:bg-sand-50 active:scale-[0.98] disabled:opacity-40';

const newSlot = (): BaseSlot => ({ h: 8, m: 0, title: 'New slot', note: '', type: 'activity', tag: '' });

function moveIn<T>(arr: T[], i: number, d: number): T[] {
  const j = i + d;
  if (j < 0 || j >= arr.length) return arr;
  const n = [...arr];
  const [x] = n.splice(i, 1);
  if (x !== undefined) n.splice(j, 0, x);
  return n;
}

// Admin CRUD for the shared default Day Planner template. Switch city (Makkah / Madinah); per city
// edit the slot list (add / remove / reorder) with hour + minute, title, note, type and tag.
// Saves the whole template (both cities) to the DB.
export function DayPlanAdmin({ initial }: { initial: DayPlanTemplate }) {
  const [template, setTemplate] = useState<DayPlanTemplate>(initial);
  const [city, setCity] = useState<PlannerCity>('makkah');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [pending, start] = useTransition();

  const slots = template[city];

  const update = (fn: (s: BaseSlot[]) => BaseSlot[]): void => {
    setTemplate((t) => ({ ...t, [city]: fn(t[city]) }));
    setMsg('');
    setErr('');
  };

  const setField = (i: number, patch: Partial<BaseSlot>): void =>
    update((s) => s.map((slot, k) => (k === i ? { ...slot, ...patch } : slot)));
  const addSlot = (): void => update((s) => [...s, newSlot()]);
  const delSlot = (i: number): void => update((s) => s.filter((_, k) => k !== i));
  const moveSlot = (i: number, d: number): void => update((s) => moveIn(s, i, d));

  const setHour = (i: number, raw: string): void => {
    const n = Math.max(0, Math.min(23, Math.trunc(Number(raw)) || 0));
    setField(i, { h: n });
  };
  const setMinute = (i: number, raw: string): void => {
    const n = Math.max(0, Math.min(59, Math.trunc(Number(raw)) || 0));
    setField(i, { m: n });
  };

  const save = (): void =>
    start(async () => {
      try {
        const fresh = await saveTemplateAction(template);
        setTemplate(fresh);
        setErr('');
        setMsg('Saved the day-planner template.');
      } catch {
        setMsg('');
        setErr('Could not save. Please try again.');
      }
    });

  return (
    <ScreenFrame label="ADMIN · DAY PLANNER" tag={`${slots.length} slots`} maxWidth="max-w-4xl">
      <p className="mb-4 text-[13.5px] text-sand-500">
        Edit the shared default Day Planner template — the jamaat-anchored daily schedule every pilgrim sees. Switch
        between Makkah and Madinah; each slot has a time, title, note, a type (prayer / meal / activity / rest) and a
        short tag. Times are a seasonal guide pilgrims can nudge with the whole-day shift.
      </p>

      {/* City switch */}
      <div className="mb-4 inline-flex rounded-xl border border-sand-200 bg-white p-1">
        {CITIES.map((c) => {
          const active = c === city;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setCity(c)}
              aria-pressed={active}
              className={`rounded-lg px-4 py-1.5 text-[13px] font-semibold transition-colors duration-fast ${
                active ? 'bg-green-700 text-white' : 'text-sand-600 hover:text-green-800'
              }`}
            >
              {CITY_LABEL[c]}
            </button>
          );
        })}
      </div>

      <div className="grid gap-2.5">
        {slots.map((slot, i) => (
          <div key={i} className="rounded-xl border border-sand-200 bg-white p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-[11px] text-sand-400">#{i + 1}</span>
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={() => moveSlot(i, -1)} disabled={i === 0} className={BTN_MOVE} aria-label="Move slot up">↑</button>
                <button type="button" onClick={() => moveSlot(i, 1)} disabled={i === slots.length - 1} className={BTN_MOVE} aria-label="Move slot down">↓</button>
                <button
                  type="button"
                  onClick={() => delSlot(i)}
                  className="min-h-[36px] min-w-[36px] rounded-md border border-danger/30 px-2 py-0.5 text-[12px] font-semibold text-danger-fg transition-[transform,background-color] duration-fast hover:bg-danger-bg active:scale-[0.98]"
                  aria-label="Delete slot"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-[auto_auto_1fr]">
              <label className="flex items-center gap-1.5 text-[12px] text-sand-500">
                <span>Hour</span>
                <input
                  value={slot.h}
                  onChange={(e) => setHour(i, e.target.value)}
                  type="number"
                  min={0}
                  max={23}
                  inputMode="numeric"
                  className={`${INPUT} w-20 tabular-nums`}
                  aria-label="Hour (0–23)"
                />
              </label>
              <label className="flex items-center gap-1.5 text-[12px] text-sand-500">
                <span>Min</span>
                <input
                  value={slot.m}
                  onChange={(e) => setMinute(i, e.target.value)}
                  type="number"
                  min={0}
                  max={59}
                  inputMode="numeric"
                  className={`${INPUT} w-20 tabular-nums`}
                  aria-label="Minute (0–59)"
                />
              </label>
              <input
                value={slot.title}
                onChange={(e) => setField(i, { title: e.target.value })}
                placeholder="Title"
                className={`${INPUT} font-serif font-semibold`}
              />
            </div>

            <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
              <input
                value={slot.note}
                onChange={(e) => setField(i, { note: e.target.value })}
                placeholder="Note"
                className={INPUT}
              />
              <select
                value={slot.type}
                onChange={(e) => setField(i, { type: e.target.value as SlotKind })}
                className={`${INPUT} sm:w-36`}
                aria-label="Slot type"
              >
                {KINDS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
              <input
                value={slot.tag}
                onChange={(e) => setField(i, { tag: e.target.value })}
                placeholder="Tag"
                className={`${INPUT} sm:w-32`}
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addSlot}
          className="min-h-[44px] self-start rounded-xl border border-dashed border-sand-300 px-4 py-2 text-[13px] font-semibold text-green-800 transition-[transform,background-color] duration-fast hover:bg-sand-50 active:scale-[0.98]"
        >
          + Add slot
        </button>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-sand-100 pt-5">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="min-h-[44px] rounded-xl bg-green-800 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(15,81,50,0.26)] transition-[transform,background-color] duration-fast hover:bg-green-700 active:scale-[0.98] disabled:opacity-50"
        >
          {pending ? 'Saving…' : 'Save template'}
        </button>
        {msg ? <span className="text-[13px] font-semibold text-success-fg">{msg}</span> : null}
        {err ? <span className="text-[13px] font-semibold text-danger-fg">{err}</span> : null}
      </div>
    </ScreenFrame>
  );
}
