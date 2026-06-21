'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ScreenFrame } from '../components/ScreenFrame';
import { dayPlan, SHIFT_MAX, SHIFT_STEP, type PlannerCity, type SlotKind } from './planner';
import { saveDayPlanAction } from './day-plan-actions';
import type { DayPlanPref } from './day-plan-types';

const ACCENT: Record<SlotKind, string> = {
  prayer: 'border-l-green-700',
  meal: 'border-l-warning-fg',
  activity: 'border-l-accent-600',
  rest: 'border-l-sand-300',
};
const TAG: Record<SlotKind, string> = {
  prayer: 'bg-green-50 text-green-800',
  meal: 'bg-warning-bg text-warning-fg',
  activity: 'bg-accent-100 text-accent-700',
  rest: 'bg-sand-100 text-sand-600',
};

export function DayPlanner({ signedIn, initialPref = null }: { signedIn: boolean; initialPref?: DayPlanPref | null }) {
  const [city, setCity] = useState<PlannerCity>(initialPref?.city ?? 'makkah');
  const [shift, setShift] = useState<number>(initialPref?.shiftMin ?? 0);
  const view = useMemo(() => dayPlan(city, shift), [city, shift]);

  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => saveTimer.current && clearTimeout(saveTimer.current), []);
  const persist = (c: PlannerCity, s: number): void => {
    if (!signedIn) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => void saveDayPlanAction(c, s), 700);
  };

  const pickCity = (c: PlannerCity): void => {
    setCity(c);
    persist(c, shift);
  };
  const bump = (delta: number): void => {
    const next = Math.max(-SHIFT_MAX, Math.min(SHIFT_MAX, shift + delta));
    setShift(next);
    persist(city, next);
  };
  const reset = (): void => {
    setShift(0);
    persist(city, 0);
  };

  return (
    <ScreenFrame label="🕌 Day planner" maxWidth="max-w-3xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="max-w-[60ch] text-sand-500">
          A jamaat-anchored daily rhythm for {view.cityLabel}. Nudge the whole day to match your hotel and pace —
          {signedIn ? ' your preference is saved.' : ' sign in to save your preference.'}
        </p>
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

      {/* Time-adjust + temperature band */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-sand-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1 rounded-xl border border-sand-200 bg-sand-50 p-1">
            <button
              type="button"
              onClick={() => bump(-SHIFT_STEP)}
              className="grid h-9 w-9 place-items-center rounded-lg bg-white text-lg font-semibold text-green-800 transition-transform duration-fast active:scale-[0.95]"
              aria-label="Shift earlier"
            >
              −
            </button>
            <span className="min-w-[92px] text-center font-mono text-[13px] font-semibold tabular-nums text-sand-700">
              {view.shiftLabel}
            </span>
            <button
              type="button"
              onClick={() => bump(SHIFT_STEP)}
              className="grid h-9 w-9 place-items-center rounded-lg bg-green-700 text-lg font-bold text-white transition-transform duration-fast active:scale-[0.95]"
              aria-label="Shift later"
            >
              +
            </button>
          </div>
          {shift !== 0 && (
            <button
              type="button"
              onClick={reset}
              className="text-[12.5px] font-semibold text-sand-500 underline-offset-2 hover:text-sand-700 hover:underline"
            >
              Reset
            </button>
          )}
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-bg px-3 py-1.5 font-mono text-[12px] font-semibold text-warning-fg">
          ☀ {view.tempRange.min}–{view.tempRange.max}°C · hot season
        </span>
      </div>

      {!signedIn && (
        <Link
          href="/login?next=/plan/day"
          className="mt-4 flex items-center justify-between rounded-xl border border-accent-600/30 bg-accent-100 p-3.5 text-[13.5px] font-semibold text-accent-700 transition-transform duration-fast active:scale-[0.99]"
        >
          <span>🔒 Sign in to save your city & timing</span>
          <span aria-hidden>→</span>
        </Link>
      )}

      <p className="mt-6 font-mono text-[10.5px] uppercase tracking-wider text-accent-600">
        {view.cityLabel} · full day · {view.count} slots
      </p>

      {/* Timeline */}
      <div className="mt-3 grid gap-2">
        {view.slots.map((s, i) => (
          <div
            key={`${s.title}-${i}`}
            className={`flex items-center gap-3 rounded-xl border border-sand-200 border-l-[3px] bg-white p-3 ${ACCENT[s.type]} animate-rise`}
          >
            <div className="w-[46px] flex-none font-mono text-[14px] font-bold tabular-nums text-sand-800">{s.time}</div>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-semibold leading-tight text-sand-800">{s.title}</div>
              <div className="text-[12px] text-sand-500">{s.note}</div>
            </div>
            <span className="hidden flex-none rounded-md bg-warning-bg px-2 py-1 font-mono text-[11px] font-semibold text-warning-fg sm:inline">
              {s.temp}°
            </span>
            <span className={`flex-none rounded-md px-2 py-1 text-[11px] font-semibold ${TAG[s.type]}`}>{s.tag}</span>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[12px] text-sand-500">
        Times follow the Haram jamaat as a seasonal guide — confirm exact prayer times locally each day.
      </p>

      <div className="mt-6 flex flex-wrap gap-4 text-[13.5px] font-semibold">
        <Link href="/companion/diary" className="text-green-800 hover:underline">
          Personal diary →
        </Link>
        <Link href="/companion" className="text-sand-500 hover:underline">
          Companion ↗
        </Link>
      </div>
    </ScreenFrame>
  );
}
