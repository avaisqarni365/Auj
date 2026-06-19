'use client';

import { RITUAL_STEPS } from './ritual-content';
import { RITUAL_LOCALES, localizedTitle } from './i18n';

// Read-only content + translation-coverage overview for admins. Ritual content lives in code
// (ritual-content.ts / i18n.ts), so this shows WHAT exists and WHAT still needs translating, and
// exports a fill-in template for a translator. (Live editing would need a content DB — a later phase.)

const LANGS = RITUAL_LOCALES.filter((l) => l.code !== 'en');

function exportTemplate(): void {
  if (typeof window === 'undefined') return;
  const payload = {
    note: 'Fill the empty title/subtitle/intro strings per language, have a scholar review, then send back.',
    languages: LANGS.map((l) => l.code),
    steps: RITUAL_STEPS.map((s) => ({
      key: s.key,
      step: s.step,
      en: { title: s.title, subtitle: s.subtitle ?? '', intro: s.intro ?? '' },
      translations: Object.fromEntries(
        LANGS.map((l) => [l.code, { title: localizedTitle(s, l.code) === s.title ? '' : localizedTitle(s, l.code), subtitle: '', intro: '' }]),
      ),
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

export function UmrahContentAdmin() {
  // Title coverage: a non-EN title counts as translated if it differs from the English title.
  const titleCov = LANGS.map((l) => ({
    code: l.code,
    label: l.label,
    done: RITUAL_STEPS.filter((s) => localizedTitle(s, l.code) !== s.title).length,
  }));
  const duas = RITUAL_STEPS.flatMap((s) => (s.duas ?? []).map((d) => ({ stepKey: s.key, translit: d.translit, codes: d.translations.map((t) => t.code) })));
  const uniqueDuas = duas.filter((d, idx) => duas.findIndex((x) => x.translit === d.translit) === idx);

  return (
    <div className="mx-auto max-w-5xl px-[clamp(16px,4vw,32px)] py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-[clamp(1.6rem,3vw,2.1rem)] font-semibold text-sand-ink">Umrah Guide — content</h1>
          <p className="mt-1 text-[14px] text-sand-500">15 steps · {RITUAL_LOCALES.length} languages. Translation coverage and a translator export.</p>
        </div>
        <button type="button" onClick={exportTemplate} className="rounded-xl bg-green-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700">
          ⬇ Export translation template
        </button>
      </div>

      {/* coverage summary */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {titleCov.map((c) => (
          <div key={c.code} className="rounded-2xl border border-sand-200 bg-white p-4">
            <div className="text-[12px] font-bold uppercase tracking-wider text-sand-500">{c.label}</div>
            <div className="mt-1 font-mono text-2xl font-bold text-green-800">{c.done}/{RITUAL_STEPS.length}</div>
            <div className="text-[12px] text-sand-500">step titles translated</div>
          </div>
        ))}
      </div>

      <div className="mb-3 rounded-xl border border-warning-bg bg-warning-bg/40 px-4 py-3 text-[13px] text-warning-fg">
        Step <strong>bodies</strong> (intro/instructions) are English‑only — they show a “shown in English” note in non‑EN. Duas, titles and UI chrome are translated (drafts, pending scholarly review).
      </div>

      {/* per-step title coverage */}
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
                  const done = localizedTitle(s, l.code) !== s.title;
                  return <td key={l.code} className={`px-3 py-2.5 text-center ${done ? 'text-success' : 'text-sand-300'}`}>{done ? '✓' : '—'}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* dua coverage */}
      <h2 className="mb-3 mt-8 text-[15px] font-bold text-sand-ink">Du'a meanings ({uniqueDuas.length})</h2>
      <div className="overflow-x-auto rounded-2xl border border-sand-200 bg-white">
        <table className="w-full text-[13.5px]">
          <thead>
            <tr className="border-b border-sand-100 text-left text-[11px] uppercase tracking-wider text-sand-400">
              <th className="px-4 py-2.5">Du'a</th>
              {LANGS.map((l) => <th key={l.code} className="px-3 py-2.5 text-center">{l.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {uniqueDuas.map((d) => (
              <tr key={d.translit} className="border-t border-sand-100">
                <td className="px-4 py-2.5 italic text-sand-700">{d.translit}</td>
                {LANGS.map((l) => {
                  const done = l.code === 'ar' || d.codes.includes(l.code);
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
