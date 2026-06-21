'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ScreenFrame } from '../components/ScreenFrame';
import { DUAS, NAFL, duaDone, emptyEntry, naflTotal, quranPct, type DiaryEntry } from './diary';
import { saveDiaryAction } from './diary-actions';

function Stepper({ value, onDec, onInc }: { value: string; onDec: () => void; onInc: () => void }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl bg-sand-100 p-0.5">
      <button
        type="button"
        onClick={onDec}
        className="grid h-7 w-7 place-items-center rounded-lg bg-sand-50 text-[15px] font-semibold text-green-800 transition-transform duration-fast active:scale-[0.95]"
      >
        −
      </button>
      <span className="min-w-[26px] text-center font-mono text-[14px] font-bold tabular-nums text-green-800">{value}</span>
      <button
        type="button"
        onClick={onInc}
        className="grid h-7 w-7 place-items-center rounded-lg bg-green-700 text-[15px] font-semibold text-white transition-transform duration-fast active:scale-[0.95]"
      >
        +
      </button>
    </div>
  );
}

export function DiaryJournal({ signedIn, date, initialEntry = null }: { signedIn: boolean; date: string; initialEntry?: DiaryEntry | null }) {
  const [entry, setEntry] = useState<DiaryEntry>(initialEntry ?? emptyEntry(date));

  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => saveTimer.current && clearTimeout(saveTimer.current), []);
  const update = (patch: Partial<DiaryEntry>): void => {
    setEntry((cur) => {
      const next = { ...cur, ...patch };
      if (signedIn) {
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => void saveDiaryAction(next), 800);
      }
      return next;
    });
  };

  const bar = quranPct(entry);
  const nafl = naflTotal(entry);
  const duas = duaDone(entry);

  const setNafl = (k: string, delta: number): void =>
    update({ nafl: { ...entry.nafl, [k]: Math.max(0, (entry.nafl[k] || 0) + delta) } });
  const toggleDua = (k: string): void => update({ duas: { ...entry.duas, [k]: !entry.duas[k] } });
  const resetDay = (): void => update({ quranDone: 0, nafl: {}, duas: {}, note: '' });

  return (
    <ScreenFrame label="📿 Personal diary" tag={date} maxWidth="max-w-3xl">
      <p className="max-w-[60ch] text-sand-500">
        Your spiritual journal — Quran, nafl, duas and a daily reflection.
        {signedIn ? ' Saved to your account.' : ' Sign in to save it.'}
      </p>

      {/* Today summary */}
      <div className="mt-5 grid gap-3 rounded-2xl border border-sand-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_auto_auto] sm:items-center">
        <div>
          <div className="flex items-baseline justify-between text-[13px]">
            <span className="font-semibold text-sand-700">Quran target</span>
            <span className="font-mono tabular-nums text-green-800">
              {entry.quranDone} / {entry.quranTarget} juz
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-sand-100">
            <div className="h-full rounded-full bg-green-700 transition-[width] duration-300 ease-out-soft" style={{ width: `${bar}%` }} />
          </div>
        </div>
        <div className="rounded-xl bg-sand-50 px-4 py-2 text-center">
          <div className="font-mono text-xl font-semibold text-green-800">{nafl}</div>
          <div className="text-[11px] text-sand-500">Nafl prayed</div>
        </div>
        <div className="rounded-xl bg-sand-50 px-4 py-2 text-center">
          <div className="font-mono text-xl font-semibold text-green-800">{duas}</div>
          <div className="text-[11px] text-sand-500">Duas marked</div>
        </div>
      </div>

      {!signedIn && (
        <Link
          href="/login?next=/companion/diary"
          className="mt-4 flex items-center justify-between rounded-xl border border-accent-600/30 bg-accent-100 p-3.5 text-[13.5px] font-semibold text-accent-700 transition-transform duration-fast active:scale-[0.99]"
        >
          <span>🔒 Sign in to save your diary</span>
          <span aria-hidden>→</span>
        </Link>
      )}

      {/* Quran */}
      <section className="mt-6 rounded-2xl border border-sand-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[15px] font-semibold text-sand-800">Quran listening &amp; reading</div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-sand-500">target</span>
            <Stepper
              value={`${entry.quranTarget}`}
              onDec={() => update({ quranTarget: Math.max(1, entry.quranTarget - 1) })}
              onInc={() => update({ quranTarget: Math.min(30, entry.quranTarget + 1) })}
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => update({ quranDone: Math.min(30, entry.quranDone + 1) })}
            className="rounded-xl bg-green-700 px-4 py-2.5 text-[13.5px] font-semibold text-white transition-transform duration-fast active:scale-[0.98]"
          >
            +1 juz done
          </button>
          <button
            type="button"
            onClick={() => update({ quranDone: Math.max(0, entry.quranDone - 1) })}
            className="rounded-xl border border-sand-300 bg-white px-3.5 py-2.5 text-[13.5px] font-semibold text-green-800 transition-transform duration-fast active:scale-[0.98]"
          >
            −1
          </button>
          <span className="text-[13px] text-sand-500">
            {entry.quranDone} of {entry.quranTarget} juz today · listen or read
          </span>
        </div>
      </section>

      {/* Nafl */}
      <section className="mt-4 rounded-2xl border border-sand-200 bg-white p-4 shadow-sm">
        <div className="text-[15px] font-semibold text-sand-800">Nafl &amp; Sunnah prayers</div>
        <div className="mt-3 grid gap-2">
          {NAFL.map((n) => (
            <div key={n.key} className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-semibold text-sand-800">{n.label}</div>
                <div className="text-[12px] text-sand-500">{n.note}</div>
              </div>
              <Stepper value={`${entry.nafl[n.key] || 0}`} onDec={() => setNafl(n.key, -1)} onInc={() => setNafl(n.key, 1)} />
            </div>
          ))}
        </div>
      </section>

      {/* Duas */}
      <section className="mt-4 rounded-2xl border border-sand-200 bg-white p-4 shadow-sm">
        <div className="text-[15px] font-semibold text-sand-800">Dua list — tap when made</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {DUAS.map((d) => {
            const on = !!entry.duas[d.key];
            return (
              <button
                key={d.key}
                type="button"
                onClick={() => toggleDua(d.key)}
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-[13px] font-medium transition-[transform,background-color,border-color] duration-fast active:scale-[0.97] ${
                  on ? 'border-green-700 bg-green-700 text-white' : 'border-sand-300 bg-white text-sand-700 hover:border-green-700/50'
                }`}
                aria-pressed={on}
              >
                <span
                  className={`grid h-4 w-4 place-items-center rounded-full text-[10px] ${
                    on ? 'bg-green-500 text-white' : 'bg-sand-200 text-transparent'
                  }`}
                >
                  ✓
                </span>
                {d.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Reflection */}
      <section className="mt-4 rounded-2xl border border-sand-200 bg-white p-4 shadow-sm">
        <div className="mb-2 text-[15px] font-semibold text-sand-800">Today&apos;s reflection</div>
        <textarea
          value={entry.note}
          onChange={(e) => update({ note: e.target.value })}
          placeholder="What touched your heart today? Write a dua, a moment, a goal…"
          className="min-h-[120px] w-full resize-y rounded-xl border border-sand-200 bg-sand-50 p-3.5 text-[14px] leading-relaxed text-sand-800 outline-none focus:border-accent-600 focus:shadow-focus"
        />
      </section>

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={resetDay}
          className="text-[12.5px] font-semibold text-sand-500 underline-offset-2 hover:text-sand-700 hover:underline"
        >
          Reset day
        </button>
        <Link href="/plan/day" className="text-[13.5px] font-semibold text-green-800 hover:underline">
          Day planner →
        </Link>
      </div>
    </ScreenFrame>
  );
}
