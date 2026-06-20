'use client';

import { useEffect, useState, useTransition } from 'react';
import { RITUAL_STEPS, type RitualStep } from './ritual-content';
import { RITUAL_LOCALES, localizedTitle } from './i18n';
import { effectiveContent, type ContentOverrides } from './content-overrides';
import { saveOverrideAction } from './content-actions';
import { tourScenes } from './tour/scenes';

const LANGS = RITUAL_LOCALES.filter((l) => l.code !== 'en');
const INPUT = 'w-full rounded-lg border-[1.5px] border-sand-300 bg-white px-3 py-2 text-[14px] focus:border-green-700 focus:outline-none';
const isRtl = (c: string): boolean => c === 'ar' || c === 'ur';

function exportTemplate(): void {
  if (typeof window === 'undefined') return;
  const payload = {
    note: 'Fill the empty title/subtitle/intro strings per language, have a scholar review, then paste them into the in-app editor.',
    languages: LANGS.map((l) => l.code),
    steps: RITUAL_STEPS.map((s) => ({
      key: s.key,
      step: s.step,
      en: { title: s.title, subtitle: s.subtitle ?? '', intro: s.intro ?? '' },
      translations: Object.fromEntries(LANGS.map((l) => [l.code, { title: localizedTitle(s, l.code) === s.title ? '' : localizedTitle(s, l.code), subtitle: '', intro: '' }])),
    })),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'umrah-translations-template.json';
  a.click();
  URL.revokeObjectURL(url);
}

export function UmrahContentAdmin({ overrides }: { overrides: ContentOverrides }) {
  const [ov, setOv] = useState<ContentOverrides>(overrides);
  const [stepKey, setStepKey] = useState<string>(RITUAL_STEPS[0]?.key ?? 'niyyah');
  const [lang, setLang] = useState<string>('ar');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [intro, setIntro] = useState('');
  const [savedMsg, setSavedMsg] = useState('');
  const [pending, start] = useTransition();

  // Default (override-or-code) content for any item — ritual step OR a tour scene (key "tour:<id>").
  const defaultsFor = (key: string, l: string): { title: string; subtitle: string; intro: string } => {
    if (key.startsWith('tour:')) {
      const sc = tourScenes(l).find((s) => `tour:${s.id}` === key);
      const o = ov[key]?.[l] ?? {};
      return { title: o.title ?? sc?.title ?? '', subtitle: o.subtitle ?? sc?.subtitle ?? '', intro: o.intro ?? sc?.desc ?? '' };
    }
    const step = RITUAL_STEPS.find((s) => s.key === key) ?? RITUAL_STEPS[0]!;
    const eff = effectiveContent(step, l, ov);
    return { title: eff.title, subtitle: eff.subtitle ?? '', intro: eff.intro ?? '' };
  };
  const labelFor = (key: string): string =>
    key.startsWith('tour:')
      ? `Tour · ${tourScenes('en').find((s) => `tour:${s.id}` === key)?.title ?? key}`
      : RITUAL_STEPS.find((s) => s.key === key)?.title ?? key;

  // Prefill the form with the current effective content (override if any, else the code default).
  useEffect(() => {
    const d = defaultsFor(stepKey, lang);
    setTitle(d.title);
    setSubtitle(d.subtitle);
    setIntro(d.intro);
    setSavedMsg('');
  }, [stepKey, lang, ov]);

  const save = (): void =>
    start(async () => {
      const updated = await saveOverrideAction(stepKey, lang, { title, subtitle, intro });
      setOv(updated);
      setSavedMsg(`Saved · ${labelFor(stepKey)} (${lang})`);
    });

  const titleDone = (s: RitualStep, code: string): boolean => localizedTitle(s, code) !== s.title || !!ov[s.key]?.[code]?.title;

  return (
    <div className="mx-auto max-w-5xl px-[clamp(16px,4vw,32px)] py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-[clamp(1.6rem,3vw,2.1rem)] font-semibold text-sand-ink">Umrah Guide — content editor</h1>
          <p className="mt-1 text-[14px] text-sand-500">Edit & translate step text live. Changes layer over the defaults and show in the guide immediately.</p>
        </div>
        <button type="button" onClick={exportTemplate} className="rounded-xl border border-sand-300 bg-white px-4 py-2.5 text-sm font-semibold text-green-800 hover:bg-sand-50">
          ⬇ Export template
        </button>
      </div>

      {/* editor */}
      <div className="mb-8 rounded-2xl border border-sand-200 bg-white p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-[12px] font-semibold uppercase tracking-wider text-sand-500">Content item</span>
            <select value={stepKey} onChange={(e) => setStepKey(e.target.value)} className={INPUT}>
              <optgroup label="Guide steps">
                {RITUAL_STEPS.map((s) => <option key={s.key} value={s.key}>{s.step}. {s.title}</option>)}
              </optgroup>
              <optgroup label="Virtual tour">
                {tourScenes('en').map((s) => <option key={s.id} value={`tour:${s.id}`}>{s.title}</option>)}
              </optgroup>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] font-semibold uppercase tracking-wider text-sand-500">Language</span>
            <select value={lang} onChange={(e) => setLang(e.target.value)} className={INPUT}>
              {RITUAL_LOCALES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </label>
        </div>
        <div className="mt-3 grid gap-3">
          <label className="block">
            <span className="mb-1 block text-[12px] font-semibold uppercase tracking-wider text-sand-500">Title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} dir={isRtl(lang) ? 'rtl' : 'ltr'} className={`${INPUT} ${isRtl(lang) ? 'text-right font-arabic' : ''}`} />
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] font-semibold uppercase tracking-wider text-sand-500">Subtitle</span>
            <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} dir={isRtl(lang) ? 'rtl' : 'ltr'} className={`${INPUT} ${isRtl(lang) ? 'text-right font-arabic' : ''}`} />
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] font-semibold uppercase tracking-wider text-sand-500">Intro / explanation</span>
            <textarea value={intro} onChange={(e) => setIntro(e.target.value)} rows={4} dir={isRtl(lang) ? 'rtl' : 'ltr'} className={`${INPUT} ${isRtl(lang) ? 'text-right font-arabic' : ''}`} />
          </label>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button type="button" onClick={save} disabled={pending} className="rounded-xl bg-green-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 active:scale-[0.98] disabled:opacity-50">
            {pending ? 'Saving…' : 'Save & publish'}
          </button>
          {savedMsg ? <span className="text-[13px] font-semibold text-success-fg">{savedMsg}</span> : null}
        </div>
        <p className="mt-2 text-[12px] text-sand-500">Clear a field and save to revert it to the built-in default. Drafts should still be scholar-reviewed before launch.</p>
      </div>

      {/* coverage */}
      <h2 className="mb-3 text-[15px] font-bold text-sand-ink">Title translation coverage</h2>
      <div className="overflow-x-auto rounded-2xl border border-sand-200 bg-white">
        <table className="w-full text-[13.5px]">
          <thead>
            <tr className="border-b border-sand-100 text-left text-[11px] uppercase tracking-wider text-sand-400">
              <th className="px-4 py-2.5">#</th>
              <th className="px-4 py-2.5">Step (EN)</th>
              {LANGS.map((l) => <th key={l.code} className="px-3 py-2.5 text-center">{l.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {RITUAL_STEPS.map((s) => (
              <tr key={s.key} className="border-t border-sand-100">
                <td className="px-4 py-2.5 font-mono text-sand-500">{s.step}</td>
                <td className="px-4 py-2.5 font-semibold">{s.title}</td>
                {LANGS.map((l) => {
                  const done = titleDone(s, l.code);
                  return <td key={l.code} className={`px-3 py-2.5 text-center ${done ? 'text-success' : 'text-sand-300'}`}>{done ? '✓' : '—'}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
