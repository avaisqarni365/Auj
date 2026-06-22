'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { ScreenFrame } from '../components/ScreenFrame';
import { buildFrom, PACKING_DAYS, PACKING_PROFILES, PACKING_TEMPLATE_SEED, totalItems, type PackingProfile, type SectionDef } from './packing';
import { getPackingAction, savePackingAction } from './packing-actions';
import type { PackingState } from './packing-types';

const PROFILE_ICON: Record<PackingProfile, string> = {
  Men: '👳',
  Women: '🧕',
  Kids: '🧒',
  Family: '👪',
  Diabetic: '💉',
};

export function PackingOrganizer({
  signedIn,
  initialProfile = 'Family',
  initialState = null,
  template = PACKING_TEMPLATE_SEED,
}: {
  signedIn: boolean;
  initialProfile?: PackingProfile;
  initialState?: PackingState | null;
  template?: SectionDef[];
}) {
  const [profile, setProfile] = useState<PackingProfile>(initialProfile);
  const [days, setDays] = useState<number>(initialState?.days ?? 11);
  const [checked, setChecked] = useState<Record<string, boolean>>(initialState?.checked ?? {});
  const [loading, startLoad] = useTransition();
  const loadedOnce = useRef(false);

  const sections = useMemo(() => buildFrom(template, profile, days), [template, profile, days]);
  const total = useMemo(() => totalItems(sections), [sections]);
  const done = useMemo(
    () => sections.reduce((n, s) => n + s.items.filter((i) => checked[i.id]).length, 0),
    [sections, checked],
  );
  const pct = total ? Math.round((done / total) * 100) : 0;

  // Load this profile's saved list from the DB when the profile changes (signed-in only).
  // The very first render already has the server-provided initialState for initialProfile.
  useEffect(() => {
    if (!signedIn) {
      setChecked({});
      return;
    }
    if (!loadedOnce.current && profile === initialProfile) {
      loadedOnce.current = true;
      return;
    }
    startLoad(async () => {
      const saved = await getPackingAction(profile);
      setDays(saved?.days ?? 11);
      setChecked(saved?.checked ?? {});
    });
  }, [profile, signedIn, initialProfile]);

  // Debounced save of the current state (signed-in; the action no-ops otherwise).
  const persist = (next: PackingState): void => {
    if (!signedIn) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => void savePackingAction(profile, next), 900);
  };
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => saveTimer.current && clearTimeout(saveTimer.current), []);

  const toggle = (id: string): void =>
    setChecked((cur) => {
      const next = { ...cur, [id]: !cur[id] };
      persist({ days, checked: next });
      return next;
    });

  const pickDays = (d: number): void => {
    setDays(d);
    persist({ days: d, checked });
  };

  const reset = (): void => {
    setChecked({});
    persist({ days, checked: {} });
  };

  return (
    <ScreenFrame label="🧳 Packing organizer" maxWidth="max-w-3xl">
      <p className="max-w-[60ch] text-sand-500">
        A smart checklist tuned to who is travelling and how long you stay. Tick items as you pack —
        {signedIn ? ' your progress is saved to your account.' : ' sign in to save your progress.'}
      </p>

      {/* Profile tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {PACKING_PROFILES.map((p) => {
          const active = p === profile;
          return (
            <button
              key={p}
              type="button"
              onClick={() => setProfile(p)}
              className={`rounded-full border px-4 py-2 text-[13.5px] font-semibold transition-[transform,background-color,border-color] duration-fast active:scale-[0.97] ${
                active
                  ? 'border-green-700 bg-green-700 text-white shadow-sm'
                  : 'border-sand-200 bg-white text-sand-700 hover:border-green-700 hover:text-green-800'
              }`}
              aria-pressed={active}
            >
              <span className="mr-1.5">{PROFILE_ICON[p]}</span>
              {p}
            </button>
          );
        })}
      </div>

      {/* Days toggle + progress */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex rounded-xl border border-sand-200 bg-white p-1">
          {PACKING_DAYS.map((d) => {
            const active = d === days;
            return (
              <button
                key={d}
                type="button"
                onClick={() => pickDays(d)}
                className={`rounded-lg px-3.5 py-1.5 text-[13px] font-semibold transition-colors duration-fast ${
                  active ? 'bg-green-700 text-white' : 'text-sand-600 hover:text-green-800'
                }`}
                aria-pressed={active}
              >
                {d} days
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={reset}
          className="text-[12.5px] font-semibold text-sand-500 underline-offset-2 hover:text-sand-700 hover:underline"
        >
          Reset ticks
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-sand-200 bg-white p-4 shadow-sm">
        <div className="flex items-baseline justify-between text-[13px]">
          <span className="font-semibold text-sand-700">
            {done} / {total} packed
          </span>
          <span className="font-mono tabular-nums text-green-800">{pct}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-sand-100">
          <div
            className="h-full rounded-full bg-green-700 transition-[width] duration-300 ease-out-soft"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {!signedIn && (
        <Link
          href="/login?next=/companion/packing"
          className="mt-4 flex items-center justify-between rounded-xl border border-accent-600/30 bg-accent-100 p-3.5 text-[13.5px] font-semibold text-accent-700 transition-transform duration-fast active:scale-[0.99]"
        >
          <span>🔒 Sign in to save your packing progress</span>
          <span aria-hidden>→</span>
        </Link>
      )}

      {/* Grouped checklist */}
      <div className={`mt-6 grid gap-6 ${loading ? 'opacity-60' : ''}`}>
        {sections.map((s) => (
          <section key={s.title} className="animate-rise">
            <h2 className="font-serif text-lg font-semibold">{s.title}</h2>
            <ul className="mt-3 grid gap-2">
              {s.items.map((it) => {
                const on = !!checked[it.id];
                return (
                  <li key={it.id}>
                    <button
                      type="button"
                      onClick={() => toggle(it.id)}
                      className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left text-[13.5px] transition-[transform,border-color,background-color] duration-fast active:scale-[0.99] ${
                        on ? 'border-green-700/40 bg-green-50' : 'border-sand-200 bg-white hover:border-green-700/40'
                      }`}
                      aria-pressed={on}
                    >
                      <span
                        className={`grid h-5 w-5 flex-none place-items-center rounded-md border text-[12px] font-bold transition-colors duration-fast ${
                          on ? 'border-green-700 bg-green-700 text-white' : 'border-sand-300 bg-white text-transparent'
                        }`}
                      >
                        ✓
                      </span>
                      <span className={`flex-1 ${on ? 'text-sand-500 line-through' : 'text-sand-800'}`}>{it.label}</span>
                      {it.qty ? (
                        <span className="flex-none rounded-md bg-sand-100 px-2 py-0.5 font-mono text-[12px] tabular-nums text-sand-600">
                          ×{it.qty}
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </ScreenFrame>
  );
}
