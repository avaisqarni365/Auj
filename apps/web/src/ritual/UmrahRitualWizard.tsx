'use client';

import { useEffect, useState } from 'react';
import type { PublicUser } from '@auj/auth';
import { RITUAL_STEPS, ZIYARAT, type ApproxMin, type Dua, type RitualStep } from './ritual-content';
import { ritualAudioSrc, ritualImage, ziyaratImage, type ResolvedImage } from './ritual-images';

const STORAGE_KEY = 'auj.ritual.v1';

interface Persisted {
  stepIndex: number;
  checked: Record<string, boolean>;
  counters: { tawaf: number; sai: number };
  notes: string;
  elapsedSec: number;
  completedAt: number | null;
}

const TOTAL = RITUAL_STEPS.length;

function fmtClock(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = (n: number): string => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

function approxBadge(a: ApproxMin): string | null {
  if (a === 'ongoing') return 'Recite continuously';
  if (typeof a === 'number') return `≈ ${a} min`;
  return null;
}

/** Sum of remaining point-estimate minutes from `fromIndex` onward. */
function remainingMin(fromIndex: number): number {
  return RITUAL_STEPS.slice(fromIndex).reduce((t, s) => t + (typeof s.approxMin === 'number' ? s.approxMin : 0), 0);
}

/** <img> that swaps to a fallback once if the primary asset is missing. */
function Img({ img, className }: { img: ResolvedImage; className?: string }) {
  const [errored, setErrored] = useState(false);
  return (
    <img
      src={errored ? img.fallbackSrc : img.src}
      alt={img.alt}
      className={className}
      loading="lazy"
      decoding="async"
      draggable={false}
      onError={() => setErrored(true)}
    />
  );
}

function DuaBlock({ dua }: { dua: Dua }) {
  const [audioOk, setAudioOk] = useState(true);
  return (
    <div className="mt-4 rounded-2xl border border-green-100 bg-green-50 p-5">
      <p dir="rtl" lang="ar" className="text-right font-arabic text-[26px] leading-[1.9] text-green-900">
        {dua.arabic}
      </p>
      <p className="mt-3 text-[14.5px] font-semibold italic text-sand-700">{dua.translit}</p>
      <p className="mt-1.5 text-[14px] leading-relaxed text-sand-700">“{dua.translation}”</p>
      <p className="mt-2 text-[11.5px] text-sand-500">Source: {dua.source}</p>
      {dua.audio && audioOk ? (
        <audio
          controls
          preload="none"
          className="mt-3 h-9 w-full"
          src={ritualAudioSrc(dua.audio)}
          onError={() => setAudioOk(false)}
        >
          <track kind="captions" />
        </audio>
      ) : null}
    </div>
  );
}

function Checklist({
  step,
  checked,
  onToggle,
}: {
  step: RitualStep;
  checked: Record<string, boolean>;
  onToggle: (key: string) => void;
}) {
  if (!step.checklist) return null;
  return (
    <div className="mt-4 grid gap-2">
      {step.checklist.map((item, i) => {
        const key = `${step.key}:${i}`;
        const on = !!checked[key];
        return (
          <button
            key={key}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(key)}
            className={`flex items-center gap-3 rounded-xl border p-3.5 text-start transition-colors duration-fast ${
              on ? 'border-green-800 bg-green-800/5' : 'border-sand-200 bg-white hover:bg-sand-50'
            }`}
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-[1.5px] text-[13px] font-bold ${
                on ? 'border-green-800 bg-green-800 text-white' : 'border-sand-300 text-transparent'
              }`}
              aria-hidden
            >
              ✓
            </span>
            <span className="text-[14.5px] font-medium text-sand-ink">{item}</span>
          </button>
        );
      })}
    </div>
  );
}

function Counter({
  step,
  value,
  onBump,
  onReset,
}: {
  step: RitualStep;
  value: number;
  onBump: () => void;
  onReset: () => void;
}) {
  if (!step.counter) return null;
  const { total } = step.counter;
  const done = value >= total;
  const label = step.counter.kind === 'tawaf' ? 'round' : 'passage';
  return (
    <div className="mt-4 rounded-2xl border border-sand-200 bg-white p-5 text-center">
      <div className="mb-3 flex flex-wrap justify-center gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold ${
              i < value ? 'bg-green-800 text-white' : 'border border-sand-300 bg-sand-50 text-sand-500'
            }`}
          >
            {i < value ? '✓' : i + 1}
          </span>
        ))}
      </div>
      <div className="font-mono text-3xl font-bold text-green-800">
        {value} <span className="text-base font-semibold text-sand-500">/ {total}</span>
      </div>
      <div className="mb-3 text-[12.5px] text-sand-500">{done ? `All ${total} ${label}s complete` : `${label} ${value + 1} of ${total}`}</div>
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={onBump}
          disabled={done}
          className="rounded-xl bg-green-800 px-6 py-3 text-[15px] font-semibold text-white transition-[transform,background-color] duration-fast hover:bg-green-700 active:scale-[0.98] disabled:opacity-40"
        >
          +1 {label}
        </button>
        {value > 0 ? (
          <button
            type="button"
            onClick={onReset}
            className="rounded-xl border border-sand-300 bg-white px-4 py-3 text-[13px] font-semibold text-sand-600 hover:bg-sand-50"
          >
            Reset
          </button>
        ) : null}
      </div>
    </div>
  );
}

function ForGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-sand-200 bg-white p-4">
      <div className="mb-2 text-[12px] font-bold uppercase tracking-wider text-green-800">{title}</div>
      <ul className="grid gap-1.5">
        {items.map((it) => (
          <li key={it} className="flex gap-2 text-[14px] leading-relaxed text-sand-700">
            <span className="text-success">•</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ZiyaratGrid() {
  const [city, setCity] = useState<'makkah' | 'madinah'>('makkah');
  const places = ZIYARAT[city];
  return (
    <div className="mt-4">
      <div className="mb-4 inline-flex gap-1 rounded-xl bg-sand-100 p-1">
        {(['makkah', 'madinah'] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCity(c)}
            className={`rounded-lg px-5 py-2 text-[13.5px] font-semibold capitalize transition-colors duration-fast ${
              city === c ? 'bg-white text-green-800 shadow-sm' : 'text-sand-500'
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {places.map((p) => (
          <div key={p.slug} className="overflow-hidden rounded-2xl border border-sand-200 bg-white">
            <Img img={ziyaratImage(city, p.slug)} className="h-32 w-full object-cover" />
            <div className="p-3.5">
              <div className="text-[14.5px] font-semibold text-sand-ink">{p.name}</div>
              <p className="mt-0.5 text-[12.5px] leading-relaxed text-sand-500">{p.note}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function UmrahRitualWizard({ user }: { user?: PublicUser }) {
  const [step, setStep] = useState(0);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [counters, setCounters] = useState<{ tawaf: number; sai: number }>({ tawaf: 0, sai: 0 });
  const [notes, setNotes] = useState('');
  const [elapsedSec, setElapsedSec] = useState(0);
  const [running, setRunning] = useState(false);
  const [completedAt, setCompletedAt] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [resume, setResume] = useState<Persisted | null>(null);

  // Load any saved run (client-only).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw) as Persisted;
        const hasProgress =
          p.stepIndex > 0 || p.elapsedSec > 0 || (p.counters?.tawaf ?? 0) > 0 || (p.counters?.sai ?? 0) > 0 || !!p.completedAt;
        if (hasProgress) setResume(p);
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  // Persist on change.
  useEffect(() => {
    if (!hydrated || resume) return;
    const p: Persisted = { stepIndex: step, checked, counters, notes, elapsedSec, completedAt };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    } catch {
      /* storage full / disabled — non-fatal */
    }
  }, [hydrated, resume, step, checked, counters, notes, elapsedSec, completedAt]);

  // Tick the elapsed timer while running and not yet complete.
  useEffect(() => {
    if (!running || completedAt) return undefined;
    const id = setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running, completedAt]);

  const cur = RITUAL_STEPS[step];
  if (!cur) return null;

  const doResume = (): void => {
    if (!resume) return;
    setStep(resume.stepIndex);
    setChecked(resume.checked ?? {});
    setCounters(resume.counters ?? { tawaf: 0, sai: 0 });
    setNotes(resume.notes ?? '');
    setElapsedSec(resume.elapsedSec ?? 0);
    setCompletedAt(resume.completedAt ?? null);
    setRunning(!resume.completedAt && resume.stepIndex > 0);
    setResume(null);
  };
  const startOver = (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setResume(null);
  };

  const goNext = (): void => {
    if (cur.key === 'welcome') setRunning(true);
    const nextIndex = Math.min(step + 1, TOTAL - 1);
    if (RITUAL_STEPS[nextIndex]?.key === 'complete' && !completedAt) {
      setCompletedAt(Date.now());
      setRunning(false);
    }
    setStep(nextIndex);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const goBack = (): void => {
    setStep((s) => Math.max(0, s - 1));
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleCheck = (key: string): void => setChecked((c) => ({ ...c, [key]: !c[key] }));
  const bump = (kind: 'tawaf' | 'sai', total: number): void =>
    setCounters((c) => ({ ...c, [kind]: Math.min(total, c[kind] + 1) }));
  const resetCounter = (kind: 'tawaf' | 'sai'): void => setCounters((c) => ({ ...c, [kind]: 0 }));

  const progressPct = Math.round(((step + 1) / TOTAL) * 100);
  const badge = approxBadge(cur.approxMin);
  const remaining = remainingMin(step);
  const counter = cur.counter;

  // --- Resume prompt ------------------------------------------------------
  if (hydrated && resume) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="rounded-2xl border border-sand-200 bg-white p-7 shadow-sm">
          <div className="text-3xl">🕋</div>
          <h2 className="mt-3 font-serif text-2xl font-semibold text-sand-ink">Resume your Umrah Guide?</h2>
          <p className="mt-2 text-[14px] text-sand-500">
            You were on “{RITUAL_STEPS[Math.min(resume.stepIndex, TOTAL - 1)]?.title ?? 'your guide'}”
            {resume.elapsedSec > 0 ? ` · ${fmtClock(resume.elapsedSec)} elapsed` : ''}.
          </p>
          <div className="mt-5 grid gap-2">
            <button
              type="button"
              onClick={doResume}
              className="rounded-xl bg-green-800 py-3 text-[15px] font-semibold text-white transition-[transform,background-color] duration-fast hover:bg-green-700 active:scale-[0.98]"
            >
              Resume
            </button>
            <button
              type="button"
              onClick={startOver}
              className="rounded-xl border border-sand-300 bg-white py-3 text-[14px] font-semibold text-sand-600 hover:bg-sand-50"
            >
              Start over
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-16 pt-6">
      {/* progress + timer header */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-[12.5px] font-semibold text-sand-500">
          <span className="uppercase tracking-wider text-green-800">{cur.phase}</span>
          <span>
            Step {step + 1} / {TOTAL}
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sand-100">
          <div className="h-full rounded-full bg-green-700 transition-[width] duration-200 ease-out-soft" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-sand-500">
          {badge ? <span className="font-semibold text-sand-700">{badge}</span> : null}
          {running || elapsedSec > 0 ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="font-mono font-semibold text-green-800">{fmtClock(elapsedSec)}</span> elapsed
              {!completedAt ? (
                <button
                  type="button"
                  onClick={() => setRunning((r) => !r)}
                  className="ms-1 rounded-md border border-sand-300 bg-white px-2 py-0.5 text-[11px] font-semibold text-sand-600 hover:bg-sand-50"
                >
                  {running ? 'Pause' : 'Resume'}
                </button>
              ) : null}
            </span>
          ) : null}
          {!completedAt && remaining > 0 ? <span>≈ {remaining} min to complete</span> : null}
        </div>
      </div>

      {/* hero image */}
      <div className="relative mb-5 overflow-hidden rounded-[20px]">
        <Img img={ritualImage(cur.image)} className="h-44 w-full object-cover sm:h-56" />
        <div className="absolute inset-0 bg-gradient-to-t from-green-950/70 to-transparent" />
        <h1 className="absolute bottom-4 start-5 end-5 font-serif text-[clamp(1.5rem,3.4vw,2rem)] font-semibold leading-tight text-white">
          {cur.title}
        </h1>
      </div>

      {/* body */}
      <div key={cur.key} className="animate-rise">
        {cur.key === 'welcome' && user?.displayName ? (
          <p className="mb-2 text-[14px] font-medium text-green-800">Assalamu alaikum, {user.displayName.trim().split(/\s+/)[0]}.</p>
        ) : null}

        {cur.intro ? <p className="text-[15px] leading-relaxed text-sand-700">{cur.intro}</p> : null}

        {cur.instructions ? (
          <ul className="mt-3 grid gap-2">
            {cur.instructions.map((it) => (
              <li key={it} className="flex gap-2.5 text-[14.5px] leading-relaxed text-sand-700">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-green-700" />
                <span>{it}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {cur.forMen || cur.forWomen ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {cur.forMen ? <ForGroup title="For men" items={cur.forMen} /> : null}
            {cur.forWomen ? <ForGroup title="For women" items={cur.forWomen} /> : null}
          </div>
        ) : null}

        {cur.dua ? <DuaBlock dua={cur.dua} /> : null}

        {counter ? (
          <Counter
            step={cur}
            value={counters[counter.kind]}
            onBump={() => bump(counter.kind, counter.total)}
            onReset={() => resetCounter(counter.kind)}
          />
        ) : null}

        <Checklist step={cur} checked={checked} onToggle={toggleCheck} />

        {/* Completion screen extras */}
        {cur.key === 'complete' ? (
          <div className="mt-4 grid gap-4">
            <div className="rounded-2xl bg-gradient-to-br from-green-800 to-green-950 p-6 text-center text-green-50">
              <div className="text-4xl">🎉</div>
              <div className="mt-2 font-serif text-2xl font-semibold text-white">Umrah Mubarak</div>
              <div className="mt-3 flex justify-center gap-8">
                <div>
                  <div className="font-mono text-2xl font-bold text-white">{fmtClock(elapsedSec)}</div>
                  <div className="text-[11.5px] text-green-100/70">total time</div>
                </div>
                {completedAt ? (
                  <div>
                    <div className="font-mono text-2xl font-bold text-white">
                      {new Date(completedAt).toLocaleDateString()}
                    </div>
                    <div className="text-[11.5px] text-green-100/70">completed</div>
                  </div>
                ) : null}
              </div>
            </div>
            <div>
              <label className="text-[13px] font-semibold text-sand-700" htmlFor="ritual-notes">
                Personal notes for this day
              </label>
              <textarea
                id="ritual-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="A du‘a you made, a feeling, who you prayed for…"
                className="mt-1.5 w-full rounded-xl border-[1.5px] border-sand-300 px-3 py-2.5 text-[14px] focus:border-green-700 focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => typeof window !== 'undefined' && window.print()}
                className="rounded-xl border border-sand-300 bg-white px-4 py-2.5 text-[13.5px] font-semibold text-sand-700 hover:bg-sand-50"
              >
                Print / save my certificate
              </button>
              <button
                type="button"
                onClick={startOver}
                className="rounded-xl border border-sand-300 bg-white px-4 py-2.5 text-[13.5px] font-semibold text-sand-600 hover:bg-sand-50"
              >
                Start a new Umrah
              </button>
            </div>
          </div>
        ) : null}

        {/* Ziyarat module */}
        {cur.key === 'ziyarat' ? <ZiyaratGrid /> : null}
      </div>

      {/* nav */}
      <div className="mt-7 flex items-center gap-3">
        {step > 0 ? (
          <button
            type="button"
            onClick={goBack}
            className="rounded-xl border border-sand-300 bg-white px-5 py-3 text-[14px] font-semibold text-sand-600 transition-colors duration-fast hover:bg-sand-50"
          >
            Back
          </button>
        ) : null}
        {step < TOTAL - 1 ? (
          <button
            type="button"
            onClick={goNext}
            className="flex-1 rounded-xl bg-green-800 px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_6px_16px_rgba(15,81,50,0.25)] transition-[transform,background-color] duration-fast hover:bg-green-700 active:scale-[0.98] focus-visible:outline-none focus-visible:shadow-focus"
          >
            {cur.next}
          </button>
        ) : (
          <span className="flex-1 text-center text-[13px] text-sand-500">Your progress is saved on this device.</span>
        )}
      </div>

      <p className="mt-5 text-center text-[11.5px] leading-relaxed text-sand-500">
        Guidance for convenience only — follow your group’s scholar and official sources. Rulings can differ between
        schools of thought.
      </p>
    </div>
  );
}
