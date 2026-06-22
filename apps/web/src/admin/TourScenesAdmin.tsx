'use client';

import { useState, useTransition } from 'react';
import { ScreenFrame } from '../components/ScreenFrame';
import { saveScenesAction } from '../ritual/tour/tour-scene-admin-actions';
import type { SceneDef } from '../ritual/tour/scenes';

const LANGS = [
  { code: 'en', label: 'EN', rtl: false },
  { code: 'ar', label: 'AR', rtl: true },
  { code: 'ur', label: 'UR', rtl: true },
  { code: 'tr', label: 'TR', rtl: false },
  { code: 'de', label: 'DE', rtl: false },
] as const;

const INPUT = 'w-full rounded-[10px] border-[1.5px] border-sand-300 bg-white px-3 py-2 text-[13.5px] text-sand-ink focus:border-green-700 focus:outline-none';

const emptyScene = (): SceneDef => ({ id: '', file: '', title: {}, subtitle: {}, desc: {} });

// Admin CRUD for the Virtual Tour scenes. List on the left (add / reorder / delete by id), editor on
// the right: id + image filename, then a language tab strip editing title / subtitle / desc per
// language (RTL for ar/ur). "Save all" persists the whole ordered catalog.
export function TourScenesAdmin({ initial }: { initial: SceneDef[] }) {
  const [scenes, setScenes] = useState<SceneDef[]>(initial.length ? initial : [emptyScene()]);
  const [sel, setSel] = useState(0);
  const [lang, setLang] = useState<string>('en');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [pending, start] = useTransition();

  const active = LANGS.find((l) => l.code === lang) ?? LANGS[0];
  const scene = scenes[sel] ?? scenes[0];

  const touch = (): void => { setMsg(''); setErr(''); };

  const patchScene = (i: number, patch: Partial<SceneDef>): void => {
    setScenes((s) => s.map((sc, k) => (k === i ? { ...sc, ...patch } : sc)));
    touch();
  };
  const setLocal = (field: 'title' | 'subtitle' | 'desc', value: string): void => {
    if (!scene) return;
    patchScene(sel, { [field]: { ...scene[field], [lang]: value } } as Partial<SceneDef>);
  };

  const addScene = (): void => {
    setScenes((s) => [...s, emptyScene()]);
    setSel(scenes.length);
    touch();
  };
  const delScene = (i: number): void => {
    setScenes((s) => s.filter((_, k) => k !== i));
    setSel((cur) => Math.max(0, cur > i ? cur - 1 : cur === i ? Math.min(cur, scenes.length - 2) : cur));
    touch();
  };
  const move = (i: number, d: number): void => {
    const j = i + d;
    if (j < 0 || j >= scenes.length) return;
    setScenes((s) => {
      const n = [...s];
      const [x] = n.splice(i, 1);
      if (x) n.splice(j, 0, x);
      return n;
    });
    setSel(j);
    touch();
  };

  const save = (): void =>
    start(async () => {
      try {
        const fresh = await saveScenesAction(scenes);
        setScenes(fresh.length ? fresh : [emptyScene()]);
        setSel((cur) => Math.min(cur, Math.max(0, fresh.length - 1)));
        setErr('');
        setMsg(`Saved ${fresh.length} scene${fresh.length === 1 ? '' : 's'}.`);
      } catch {
        setMsg('');
        setErr('Could not save. Please try again.');
      }
    });

  const val = (field: 'title' | 'subtitle' | 'desc'): string => scene?.[field]?.[lang] ?? '';

  return (
    <ScreenFrame label="ADMIN · VIRTUAL TOUR" tag={`${scenes.length} scenes`} maxWidth="max-w-5xl">
      <p className="mb-4 text-[13.5px] text-sand-500">
        Edit the cinematic tour scenes — add, reorder and delete stops, set each scene&rsquo;s image
        filename, and translate the title, subtitle and description into all five languages. Saves to
        the live tour.
      </p>

      <div className="grid gap-6 md:grid-cols-[260px_1fr]">
        {/* scene list */}
        <aside className="grid content-start gap-2">
          {scenes.map((s, i) => (
            <div key={i} className={`rounded-xl border p-2.5 transition-colors ${i === sel ? 'border-green-800 bg-green-50' : 'border-sand-200 bg-white'}`}>
              <button type="button" onClick={() => { setSel(i); touch(); }} className="block w-full text-left">
                <div className="font-mono text-[11px] text-sand-400">#{i + 1}</div>
                <div className="truncate text-[13.5px] font-semibold text-sand-ink">{s.title.en || s.id || '(untitled)'}</div>
                <div className="truncate font-mono text-[11px] text-sand-500">{s.id || '—'}</div>
              </button>
              <div className="mt-2 flex items-center gap-1.5">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded-md border border-sand-200 px-2 py-0.5 text-[12px] transition-transform duration-fast active:scale-[0.98] disabled:opacity-40">↑</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === scenes.length - 1} className="rounded-md border border-sand-200 px-2 py-0.5 text-[12px] transition-transform duration-fast active:scale-[0.98] disabled:opacity-40">↓</button>
                <button type="button" onClick={() => delScene(i)} className="ml-auto rounded-md border border-danger/30 px-2 py-0.5 text-[12px] font-semibold text-danger-fg transition-transform duration-fast hover:bg-danger-bg active:scale-[0.98]">✕</button>
              </div>
            </div>
          ))}
          <button type="button" onClick={addScene} className="min-h-[44px] rounded-lg border border-dashed border-sand-300 px-3 py-2 text-[12.5px] font-semibold text-green-800 transition-transform duration-fast hover:bg-sand-50 active:scale-[0.98]">
            + Add scene
          </button>
        </aside>

        {/* editor */}
        {scene ? (
          <section className="rounded-2xl border border-sand-200 bg-white p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-[12px] font-semibold text-sand-500">Scene id (kebab-case)</span>
                <input value={scene.id} onChange={(e) => patchScene(sel, { id: e.target.value })} placeholder="e.g. kaaba" className={INPUT} />
              </label>
              <label className="block">
                <span className="mb-1 block text-[12px] font-semibold text-sand-500">Image filename</span>
                <input value={scene.file} onChange={(e) => patchScene(sel, { file: e.target.value })} placeholder="e.g. kaaba.jpg" dir="ltr" className={INPUT} />
              </label>
            </div>

            {/* language tab strip */}
            <div className="mt-5 flex flex-wrap gap-1.5">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLang(l.code)}
                  className={`min-h-[44px] rounded-full border-[1.5px] px-4 py-1.5 text-[13px] font-semibold transition-colors duration-fast ${lang === l.code ? 'border-green-800 bg-green-800 text-white' : 'border-sand-300 bg-white text-sand-700 hover:border-green-500'}`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            <div className="mt-4 grid gap-3" dir={active.rtl ? 'rtl' : 'ltr'}>
              <label className="block">
                <span className="mb-1 block text-[12px] font-semibold text-sand-500">Title ({active.label})</span>
                <textarea rows={2} value={val('title')} onChange={(e) => setLocal('title', e.target.value)} dir={active.rtl ? 'rtl' : 'ltr'} className={`${INPUT} resize-y`} />
              </label>
              <label className="block">
                <span className="mb-1 block text-[12px] font-semibold text-sand-500">Subtitle ({active.label})</span>
                <textarea rows={2} value={val('subtitle')} onChange={(e) => setLocal('subtitle', e.target.value)} dir={active.rtl ? 'rtl' : 'ltr'} className={`${INPUT} resize-y`} />
              </label>
              <label className="block">
                <span className="mb-1 block text-[12px] font-semibold text-sand-500">Description ({active.label})</span>
                <textarea rows={4} value={val('desc')} onChange={(e) => setLocal('desc', e.target.value)} dir={active.rtl ? 'rtl' : 'ltr'} className={`${INPUT} resize-y`} />
              </label>
            </div>
          </section>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-sand-100 pt-5">
        <button type="button" onClick={save} disabled={pending} className="min-h-[44px] rounded-xl bg-green-800 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(15,81,50,0.26)] transition-[transform,background-color] duration-fast hover:bg-green-700 active:scale-[0.98] disabled:opacity-50">
          {pending ? 'Saving…' : 'Save all'}
        </button>
        {msg ? <span className="text-[13px] font-semibold text-success-fg">{msg}</span> : null}
        {err ? <span className="text-[13px] font-semibold text-danger-fg">{err}</span> : null}
      </div>
    </ScreenFrame>
  );
}
