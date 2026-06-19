'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { PublicUser } from '@auj/auth';
import { RITUAL_STEPS, ZIYARAT, type Dua, type RitualStep } from './ritual-content';
import { ritualAudioSrc, stepDesignImage, ziyaratImage, type ResolvedImage } from './ritual-images';
import { RecordingPanel } from './RecordingPanel';
import { PersonalDuaPanel } from './PersonalDuaPanel';
import { RITUAL_LOCALES, isRtlLang, localizedTitle, ui } from './i18n';
import { useRitualLang } from './useRitualLang';
import { ListenButton } from './ListenButton';

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

function remainingMin(fromIndex: number): number {
  return RITUAL_STEPS.slice(fromIndex).reduce((t, s) => t + (typeof s.approxMin === 'number' ? s.approxMin : 0), 0);
}

/** The full designed step infographic. Opens full-size on tap; hides itself if the file is missing. */
function DesignImage({ src, alt }: { src: string | null; alt: string }) {
  const [ok, setOk] = useState(true);
  if (!src || !ok) return null;
  return (
    <a href={src} target="_blank" rel="noreferrer" className="block focus-visible:outline-none focus-visible:shadow-focus">
      <img
        src={src}
        alt={alt}
        decoding="async"
        className="w-full rounded-2xl border border-sand-200 shadow-sm transition-shadow duration-fast hover:shadow-lg"
        onError={() => setOk(false)}
      />
    </a>
  );
}

/** Ziyarat photo with a scene fallback. */
function ZImg({ img, className }: { img: ResolvedImage; className?: string }) {
  const [errored, setErrored] = useState(false);
  return (
    <img
      src={errored ? img.fallbackSrc : img.src}
      alt={img.alt}
      loading="lazy"
      decoding="async"
      draggable={false}
      className={className}
      onError={() => setErrored(true)}
    />
  );
}

function DuaBlock({ dua, lang }: { dua: Dua; lang: string }) {
  const sel = dua.translations.find((x) => x.code === lang);
  return (
    <div className="mt-4 rounded-2xl border border-green-100 bg-green-50 p-5">
      <p dir="rtl" lang="ar" className="text-right font-arabic text-[24px] leading-[1.95] text-green-900">
        {dua.arabic}
      </p>
      <p className="mt-2.5 text-[14px] font-semibold italic text-sand-700">{dua.translit}</p>
      {sel ? (
        <p dir={lang === 'ur' ? 'rtl' : 'ltr'} className={`mt-1.5 text-[14px] leading-relaxed text-sand-700 ${lang === 'ur' ? 'text-right font-arabic' : ''}`}>
          “{sel.text}”
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <ListenButton audioSrc={dua.audio ? ritualAudioSrc(dua.audio) : undefined} text={dua.arabic} lang="ar" />
        <span className="text-[11.5px] text-sand-500">Source: {dua.source}</span>
      </div>
      <details className="mt-3 [&_summary]:cursor-pointer">
        <summary className="text-[12px] font-semibold text-green-800">🌐 {ui(lang).showMeaning}</summary>
        <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
          {dua.translations.map((t) => {
            const rtl = t.code === 'ur';
            return (
              <div key={t.code} className="rounded-xl border border-sand-200 bg-white p-3">
                <div className="text-[10.5px] font-bold uppercase tracking-wider text-accent-600">{t.label}</div>
                <p dir={rtl ? 'rtl' : 'ltr'} className={`mt-1 text-[13px] leading-relaxed text-sand-700 ${rtl ? 'text-right font-arabic' : ''}`}>
                  {t.text}
                </p>
              </div>
            );
          })}
        </div>
      </details>
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
  kind,
  total,
  value,
  onBump,
  onReset,
}: {
  kind: 'tawaf' | 'sai';
  total: number;
  value: number;
  onBump: () => void;
  onReset: () => void;
}) {
  const done = value >= total;
  const label = kind === 'tawaf' ? 'round' : 'passage';
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

function ZiyaratGrid({ city }: { city: 'makkah' | 'madinah' }) {
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {ZIYARAT[city].map((p) => (
        <div key={p.slug} className="overflow-hidden rounded-2xl border border-sand-200 bg-white">
          <ZImg img={ziyaratImage(city, p.slug)} className="h-32 w-full object-cover" />
          <div className="p-3.5">
            <div className="text-[14.5px] font-semibold text-sand-ink">{p.name}</div>
            <p className="mt-0.5 text-[12.5px] leading-relaxed text-sand-500">{p.note}</p>
          </div>
        </div>
      ))}
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
  const [lang, setLang] = useRitualLang();
  const t = ui(lang);
  const rtl = isRtlLang(lang);

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

  useEffect(() => {
    if (!hydrated || resume) return;
    const p: Persisted = { stepIndex: step, checked, counters, notes, elapsedSec, completedAt };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    } catch {
      /* non-fatal */
    }
  }, [hydrated, resume, step, checked, counters, notes, elapsedSec, completedAt]);

  useEffect(() => {
    if (!running || completedAt) return undefined;
    const id = setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running, completedAt]);

  const cur = RITUAL_STEPS[step];
  if (!cur) return null;

  const doResume = (): void => {
    if (!resume) return;
    setStep(Math.min(resume.stepIndex, TOTAL - 1));
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
    setStep(0);
    setChecked({});
    setCounters({ tawaf: 0, sai: 0 });
    setNotes('');
    setElapsedSec(0);
    setRunning(false);
    setCompletedAt(null);
  };

  const goNext = (): void => {
    if (step === 0) setRunning(true);
    const nextIndex = Math.min(step + 1, TOTAL - 1);
    if (RITUAL_STEPS[nextIndex]?.key === 'umrah-complete' && !completedAt) {
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
  const badge =
    cur.approxMin === 'ongoing' ? t.reciteOngoing : typeof cur.approxMin === 'number' ? `≈ ${cur.approxMin} ${t.min}` : null;
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
    <div dir={rtl ? 'rtl' : 'ltr'} className="mx-auto max-w-3xl px-4 pb-16 pt-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <label className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-sand-600">
          🌐
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            aria-label="Language"
            className="rounded-lg border border-sand-300 bg-white px-2 py-1 text-[12.5px] font-semibold text-sand-700"
          >
            {RITUAL_LOCALES.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </label>
        <span className="flex flex-wrap items-center gap-2">
          <Link
            href="/guide/profile"
            className="rounded-full border border-sand-300 bg-white px-3.5 py-1.5 text-[12.5px] font-semibold text-green-800 transition-colors duration-fast hover:bg-sand-50"
          >
            🧭 My journey
          </Link>
          <Link
            href="/guide/tour"
            className="rounded-full border border-sand-300 bg-white px-3.5 py-1.5 text-[12.5px] font-semibold text-green-800 transition-colors duration-fast hover:bg-sand-50"
          >
            {t.virtualTour} →
          </Link>
        </span>
      </div>

      {/* progress + timer header */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-[12.5px] font-semibold text-sand-500">
          <span className="uppercase tracking-wider text-green-800">{cur.phase}</span>
          <span>{t.step} {cur.step} / {TOTAL}</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sand-100">
          <div className="h-full rounded-full bg-green-700 transition-[width] duration-200 ease-out-soft" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-sand-500">
          {badge ? <span className="font-semibold text-sand-700">{badge}</span> : null}
          {running || elapsedSec > 0 ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="font-mono font-semibold text-green-800">{fmtClock(elapsedSec)}</span> {t.elapsed}
              {!completedAt ? (
                <button
                  type="button"
                  onClick={() => setRunning((r) => !r)}
                  className="ms-1 rounded-md border border-sand-300 bg-white px-2 py-0.5 text-[11px] font-semibold text-sand-600 hover:bg-sand-50"
                >
                  {running ? t.pause : t.resume}
                </button>
              ) : null}
            </span>
          ) : null}
          {!completedAt && remaining > 0 ? <span>≈ {remaining} {t.min} {t.toComplete}</span> : null}
        </div>
      </div>

      {/* title */}
      <div className="mb-3">
        <h1 className="font-serif text-[clamp(1.4rem,3vw,1.9rem)] font-semibold leading-tight text-sand-ink">
          <span className="text-green-800">{cur.step}.</span> {localizedTitle(cur, lang)}
        </h1>
        {cur.subtitle ? <p className="mt-0.5 text-[14px] font-medium text-accent-600">{cur.subtitle}</p> : null}
      </div>

      {/* the designed step image (tap to view full) */}
      <div key={cur.key} className="animate-rise">
        <DesignImage src={stepDesignImage(cur.key)} alt={`${cur.title} — ${cur.subtitle ?? ''}`} />

        {step === 0 && user?.displayName ? (
          <p className="mt-4 text-[14px] font-medium text-green-800">Assalamu alaikum, {user.displayName.trim().split(/\s+/)[0]}.</p>
        ) : null}

        {lang !== 'en' ? (
          <p className="mt-4 rounded-lg bg-sand-100 px-3 py-2 text-[12px] text-sand-500">{t.langNote}</p>
        ) : null}

        {cur.intro ? (
          <div className="mt-4">
            <p className="text-[15px] leading-relaxed text-sand-700">{cur.intro}</p>
            <div className="mt-2">
              <ListenButton text={cur.intro} lang="en" />
            </div>
          </div>
        ) : null}

        {cur.forMen || cur.forWomen ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {cur.forMen ? <ForGroup title="For men" items={cur.forMen} /> : null}
            {cur.forWomen ? <ForGroup title="For women" items={cur.forWomen} /> : null}
          </div>
        ) : null}

        {cur.duas?.map((d, i) => <DuaBlock key={i} dua={d} lang={lang} />)}

        {counter ? (
          <Counter
            kind={counter.kind}
            total={counter.total}
            value={counters[counter.kind]}
            onBump={() => bump(counter.kind, counter.total)}
            onReset={() => resetCounter(counter.kind)}
          />
        ) : null}

        <Checklist step={cur} checked={checked} onToggle={toggleCheck} />

        {cur.ziyarat ? <ZiyaratGrid city={cur.ziyarat} /> : null}

        {cur.hadith ? (
          <div className="mt-4 rounded-2xl border border-sand-200 bg-sand-50 p-4">
            <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-green-800">📖 Hadith</div>
            <p className="text-[13.5px] italic leading-relaxed text-sand-700">{cur.hadith}</p>
          </div>
        ) : null}

        {cur.tip ? (
          <div className="mt-4 flex gap-3 rounded-2xl border border-green-100 bg-green-50 p-4">
            <span className="text-lg">💡</span>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-green-800">Tip</div>
              <p className="mt-0.5 text-[13.5px] leading-relaxed text-sand-700">{cur.tip}</p>
            </div>
          </div>
        ) : null}

        <PersonalDuaPanel stepKey={cur.key} uiLang={lang} />

        <RecordingPanel stepKey={cur.key} stepTitle={cur.title} lang={lang} />

        {/* Completion extras */}
        {cur.key === 'umrah-complete' ? (
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
                    <div className="font-mono text-2xl font-bold text-white">{new Date(completedAt).toLocaleDateString()}</div>
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
      </div>

      {/* nav */}
      <div className="mt-7 flex items-center gap-3">
        {step > 0 ? (
          <button
            type="button"
            onClick={goBack}
            className="rounded-xl border border-sand-300 bg-white px-5 py-3 text-[14px] font-semibold text-sand-600 transition-colors duration-fast hover:bg-sand-50"
          >
            {t.back}
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
          <span className="flex-1 text-center text-[13px] text-sand-500">{t.progressSaved}</span>
        )}
      </div>

      <p className="mt-5 text-center text-[11.5px] leading-relaxed text-sand-500">{t.disclaimer}</p>
    </div>
  );
}
