'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { ScreenFrame } from '../components/ScreenFrame';
import { isRtlLang, RITUAL_LOCALES } from './i18n';
import { parseEmbed } from './parse-embed';
import { useRitualLang } from './useRitualLang';
import { deleteStepVideoAction, saveStepVideoAction } from './step-video-actions';
import type { WizardSlug, WizItem, WizStep } from './wizard-steps-types';

const STATUS_STYLE: Record<'ok' | 'permit' | 'prohibited', string> = {
  ok: 'border-success-fg/25 bg-success-bg text-success-fg',
  permit: 'border-warning-fg/25 bg-warning-bg text-warning-fg',
  prohibited: 'border-danger-fg/25 bg-danger-bg text-danger-fg',
};
const STATUS_MARK: Record<'ok' | 'permit' | 'prohibited', string> = { ok: '✓', permit: '!', prohibited: '✕' };

function isRule(it: WizItem): it is { label: string; status: 'ok' | 'permit' | 'prohibited' } {
  return typeof it !== 'string';
}

function MediaPanel({ url }: { url: string }) {
  const embed = parseEmbed(url);
  if (embed.kind === 'iframe') {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-xl border border-sand-200 bg-black">
        <iframe src={embed.url} title="Step video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="h-full w-full" />
      </div>
    );
  }
  if (embed.kind === 'video') {
    return <video src={embed.url} controls className="aspect-video w-full rounded-xl border border-sand-200 bg-black" />;
  }
  return (
    <div className="grid aspect-video w-full place-items-center rounded-xl border border-dashed border-sand-300 bg-sand-50 text-center text-[13px] text-sand-500">
      <span>🎬 No video yet — paste a YouTube, Vimeo or MP4 link below.</span>
    </div>
  );
}

export function StepVideoWizard({
  title,
  subtitle,
  icon,
  slug,
  steps,
  signedIn,
  initialVideos = {},
}: {
  title: string;
  subtitle: string;
  icon: string;
  slug: WizardSlug;
  steps: WizStep[];
  signedIn: boolean;
  initialVideos?: Record<number, string>;
}) {
  const [lang] = useRitualLang();
  const rtl = isRtlLang(lang);
  const [i, setI] = useState(0);
  const [videos, setVideos] = useState<Record<number, string>>(initialVideos);
  const [draft, setDraft] = useState('');
  const [pending, start] = useTransition();
  const [err, setErr] = useState(false);

  const total = steps.length;
  const idx = Math.max(0, Math.min(i, total - 1));
  const step = steps[idx];
  const tx = useMemo(() => {
    if (!step) return { t: '', b: '' };
    const keys = Object.keys(step.text);
    return step.text[lang] ?? step.text.en ?? (keys[0] ? step.text[keys[0]] : undefined) ?? { t: step.short, b: '' };
  }, [step, lang]);

  if (!step) return null;

  const userVideo = videos[idx] ?? '';
  const activeUrl = userVideo || step.videoUrl || '';

  const go = (n: number): void => {
    setI(Math.max(0, Math.min(total - 1, n)));
    setDraft('');
    setErr(false);
  };

  const saveVideo = (): void => {
    const url = draft.trim();
    if (!url) return;
    if (parseEmbed(url).kind === null) {
      setErr(true);
      return;
    }
    setErr(false);
    setVideos((cur) => ({ ...cur, [idx]: url }));
    setDraft('');
    start(async () => {
      const r = await saveStepVideoAction(slug, idx, url);
      if (!r.ok) setErr(true);
    });
  };
  const clearVideo = (): void => {
    setVideos((cur) => {
      const next = { ...cur };
      delete next[idx];
      return next;
    });
    start(async () => deleteStepVideoAction(slug, idx));
  };

  const txRtl = isRtlLang(lang);

  return (
    <ScreenFrame label={`${icon} ${title}`} dir={rtl ? 'rtl' : 'ltr'}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="max-w-[60ch] text-sand-500">{subtitle}</p>
        {/* Language switcher */}
        <div className="flex flex-wrap gap-1.5" dir="ltr">
          {RITUAL_LOCALES.map((l) => <LangChip key={l.code} code={l.code} label={l.label} />)}
        </div>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-[200px_1fr]">
        {/* Step rail */}
        <nav className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible" aria-label="Steps" dir="ltr">
          {steps.map((s, k) => {
            const active = k === idx;
            return (
              <button
                key={`${s.short}-${k}`}
                type="button"
                onClick={() => go(k)}
                className={`flex flex-none items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-[transform,border-color,background-color] duration-fast active:scale-[0.99] md:flex-auto ${
                  active ? 'border-green-700/40 bg-green-50' : 'border-sand-200 bg-white hover:border-green-700/30'
                }`}
                aria-current={active ? 'true' : undefined}
              >
                <span
                  className={`grid h-6 w-6 flex-none place-items-center rounded-full font-mono text-[11px] font-bold ${
                    active ? 'bg-green-700 text-white' : k < idx ? 'bg-green-100 text-green-800' : 'bg-sand-100 text-sand-500'
                  }`}
                >
                  {k < idx ? '✓' : k + 1}
                </span>
                <span className={`text-[13px] font-semibold ${active ? 'text-green-800' : 'text-sand-700'}`}>{s.short}</span>
              </button>
            );
          })}
        </nav>

        {/* Step body */}
        <section key={`${idx}-${lang}`} className="animate-rise">
          <p className="font-mono text-[10.5px] uppercase tracking-wider text-accent-600" dir="ltr">
            {step.label} · {idx + 1} / {total}
          </p>

          <div className="mt-2">
            <MediaPanel url={activeUrl} />
          </div>

          {/* localized title + body */}
          <h2
            dir={txRtl ? 'rtl' : 'ltr'}
            className={`mt-4 font-serif text-xl font-semibold text-sand-800 ${txRtl ? 'text-right font-arabic' : ''}`}
            lang={lang}
          >
            {tx.t}
          </h2>
          {tx.b ? (
            <p
              dir={txRtl ? 'rtl' : 'ltr'}
              className={`mt-1.5 max-w-[60ch] text-[14.5px] leading-relaxed text-sand-700 ${txRtl ? 'text-right font-arabic' : ''}`}
              lang={lang}
            >
              {tx.b}
            </p>
          ) : null}

          {/* items: bullets or customs rules */}
          {step.items.length ? (
            <ul className="mt-4 flex flex-wrap gap-2" dir="ltr">
              {step.items.map((it, k) =>
                isRule(it) ? (
                  <li
                    key={k}
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[13px] font-semibold ${STATUS_STYLE[it.status]}`}
                  >
                    <span className="font-bold">{STATUS_MARK[it.status]}</span>
                    {it.label}
                  </li>
                ) : (
                  <li key={k} className="inline-flex items-center gap-2 rounded-lg border border-sand-200 bg-white px-3 py-1.5 text-[13px] font-medium text-sand-700">
                    <span className="text-green-700">✓</span>
                    {it}
                  </li>
                ),
              )}
            </ul>
          ) : null}

          {step.tip ? (
            <p className="mt-4 rounded-xl border border-warning-fg/20 bg-warning-bg px-3.5 py-2.5 text-[13px] text-warning-fg" dir="ltr">
              {step.tip}
            </p>
          ) : null}

          {/* per-step video link */}
          <div className="mt-5 rounded-xl border border-sand-200 bg-white p-3.5" dir="ltr">
            <div className="text-[12.5px] font-semibold text-sand-700">📹 Add your own clip for this step</div>
            {signedIn ? (
              <>
                <div className="mt-2 flex flex-wrap gap-2">
                  <input
                    value={draft}
                    onChange={(e) => {
                      setDraft(e.target.value);
                      setErr(false);
                    }}
                    placeholder="Paste a YouTube, Vimeo or MP4 link"
                    className="min-w-0 flex-1 rounded-lg border border-sand-200 bg-sand-50 px-3 py-2 text-[13.5px] text-sand-800 outline-none focus:border-accent-600 focus:shadow-focus"
                  />
                  <button
                    type="button"
                    onClick={saveVideo}
                    disabled={pending || !draft.trim()}
                    className="rounded-lg bg-green-700 px-4 py-2 text-[13px] font-semibold text-white transition-transform duration-fast active:scale-[0.98] disabled:opacity-40"
                  >
                    Save
                  </button>
                  {userVideo ? (
                    <button
                      type="button"
                      onClick={clearVideo}
                      disabled={pending}
                      className="rounded-lg border border-sand-300 bg-white px-3 py-2 text-[13px] font-semibold text-danger-fg transition-transform duration-fast active:scale-[0.98]"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
                {err ? <p className="mt-1.5 text-[12px] text-danger-fg">That link isn’t a recognised YouTube, Vimeo or MP4 URL.</p> : null}
                {userVideo ? <p className="mt-1.5 text-[12px] text-success-fg">Your clip is saved for this step.</p> : null}
              </>
            ) : (
              <Link href={`/login?next=/guide/${slug}`} className="mt-2 inline-block text-[13px] font-semibold text-accent-700 hover:underline">
                🔒 Sign in to save your own clips →
              </Link>
            )}
          </div>

          {/* prev / next */}
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-sand-100 pt-4" dir="ltr">
            <button
              type="button"
              onClick={() => go(idx - 1)}
              disabled={idx === 0}
              className="rounded-lg border border-sand-300 bg-white px-4 py-2 text-[13.5px] font-semibold text-green-800 transition-transform duration-fast active:scale-[0.98] disabled:border-sand-200 disabled:text-sand-300"
            >
              ‹ Back
            </button>
            <div className="flex items-center gap-1.5" aria-hidden>
              {steps.map((s, k) => (
                <span key={`${s.short}-${k}`} className={`h-2 rounded-full transition-all duration-fast ${k === idx ? 'w-6 bg-green-700' : 'w-2 bg-sand-200'}`} />
              ))}
            </div>
            <button
              type="button"
              onClick={() => go(idx + 1)}
              disabled={idx === total - 1}
              className="rounded-lg bg-green-700 px-4 py-2 text-[13.5px] font-semibold text-white transition-transform duration-fast active:scale-[0.98] disabled:opacity-40"
            >
              Next ›
            </button>
          </div>
        </section>
      </div>
    </ScreenFrame>
  );
}

function LangChip({ code, label }: { code: string; label: string }) {
  const [lang, setLang] = useRitualLang();
  const active = lang === code;
  return (
    <button
      type="button"
      onClick={() => setLang(code)}
      aria-pressed={active}
      className={`rounded-full border px-2.5 py-1 text-[12px] font-semibold transition-colors duration-fast ${
        active ? 'border-green-700 bg-green-700 text-white' : 'border-sand-200 bg-white text-sand-600 hover:text-green-800'
      }`}
    >
      {label}
    </button>
  );
}
