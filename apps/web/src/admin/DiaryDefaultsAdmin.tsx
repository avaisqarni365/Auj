'use client';

import { useState, useTransition } from 'react';
import { ScreenFrame } from '../components/ScreenFrame';
import { saveDefaultsAction } from '../ritual/diary-defaults-actions';
import { type DiaryDefaults, type DuaDef, type NaflDef } from '../ritual/diary';

const INPUT = 'w-full rounded-[10px] border-[1.5px] border-sand-300 bg-white px-3 py-2 text-[13.5px] text-sand-ink focus:border-green-700 focus:outline-none';
const BTN_MOVE = 'min-h-[36px] min-w-[36px] rounded-md border border-sand-200 px-2 py-0.5 text-[12px] transition-[transform,background-color] duration-fast hover:bg-sand-50 active:scale-[0.98] disabled:opacity-40';
const BTN_DEL = 'min-h-[36px] min-w-[36px] rounded-md border border-danger/30 px-2 py-0.5 text-[12px] font-semibold text-danger-fg transition-[transform,background-color] duration-fast hover:bg-danger-bg active:scale-[0.98]';

const newNafl = (): NaflDef => ({ key: '', label: '', note: '' });
const newDua = (): DuaDef => ({ key: '', label: '' });

function moveIn<T>(arr: T[], i: number, d: number): T[] {
  const j = i + d;
  if (j < 0 || j >= arr.length) return arr;
  const n = [...arr];
  const [x] = n.splice(i, 1);
  if (x !== undefined) n.splice(j, 0, x);
  return n;
}

// Admin CRUD for the shared default Personal Diary configuration: the starting Quran target, the
// nafl/sunnah list (key/label/note) and the dua checklist (key/label). Saves the whole config to DB.
export function DiaryDefaultsAdmin({ initial }: { initial: DiaryDefaults }) {
  const [quranTarget, setQuranTarget] = useState<number>(initial.quranTarget);
  const [nafl, setNafl] = useState<NaflDef[]>(initial.nafl);
  const [duas, setDuas] = useState<DuaDef[]>(initial.duas);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [pending, start] = useTransition();

  const clear = (): void => {
    setMsg('');
    setErr('');
  };

  // Quran target
  const onTarget = (raw: string): void => {
    clear();
    const trimmed = raw.trim();
    setQuranTarget(trimmed === '' ? 1 : Math.min(100, Math.max(1, Math.trunc(Number(trimmed)) || 1)));
  };

  // Nafl list
  const setNaflField = (i: number, patch: Partial<NaflDef>): void => {
    clear();
    setNafl((arr) => arr.map((n, k) => (k === i ? { ...n, ...patch } : n)));
  };
  const addNafl = (): void => {
    clear();
    setNafl((arr) => [...arr, newNafl()]);
  };
  const delNafl = (i: number): void => {
    clear();
    setNafl((arr) => arr.filter((_, k) => k !== i));
  };
  const moveNafl = (i: number, d: number): void => {
    clear();
    setNafl((arr) => moveIn(arr, i, d));
  };

  // Dua list
  const setDuaField = (i: number, patch: Partial<DuaDef>): void => {
    clear();
    setDuas((arr) => arr.map((x, k) => (k === i ? { ...x, ...patch } : x)));
  };
  const addDua = (): void => {
    clear();
    setDuas((arr) => [...arr, newDua()]);
  };
  const delDua = (i: number): void => {
    clear();
    setDuas((arr) => arr.filter((_, k) => k !== i));
  };
  const moveDua = (i: number, d: number): void => {
    clear();
    setDuas((arr) => moveIn(arr, i, d));
  };

  const save = (): void =>
    start(async () => {
      try {
        const fresh = await saveDefaultsAction({ quranTarget, nafl, duas });
        setQuranTarget(fresh.quranTarget);
        setNafl(fresh.nafl);
        setDuas(fresh.duas);
        setErr('');
        setMsg('Saved the diary defaults.');
      } catch {
        setMsg('');
        setErr('Could not save. Please try again.');
      }
    });

  return (
    <ScreenFrame label="ADMIN · DIARY" tag={`${nafl.length} nafl · ${duas.length} duas`} maxWidth="max-w-4xl">
      <p className="mb-4 text-[13.5px] text-sand-500">
        Edit the shared default Personal Diary — the starting Quran target, the nafl/sunnah list and the dua checklist
        every pilgrim sees on a fresh day. Each pilgrim&apos;s own entries are unaffected.
      </p>

      {/* Quran target */}
      <div className="rounded-2xl border border-sand-200 bg-white p-4">
        <div className="font-serif text-[15px] font-semibold text-sand-800">Default Quran target</div>
        <p className="mb-3 mt-1 text-[12.5px] text-sand-500">Juz per day a fresh entry starts with (1–100).</p>
        <input
          value={`${quranTarget}`}
          onChange={(e) => onTarget(e.target.value)}
          inputMode="numeric"
          placeholder="1"
          className={`${INPUT} sm:w-40`}
          aria-label="Default Quran target (juz per day)"
        />
      </div>

      {/* Nafl list */}
      <div className="mt-4 rounded-2xl border border-sand-200 bg-white p-4">
        <div className="mb-3 font-serif text-[15px] font-semibold text-sand-800">Nafl &amp; Sunnah list</div>
        <div className="grid gap-2.5">
          {nafl.map((n, i) => (
            <div key={i} className="rounded-xl border border-sand-100 bg-sand-50/40 p-2.5">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-[11px] text-sand-400">#{i + 1}</span>
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => moveNafl(i, -1)} disabled={i === 0} className={BTN_MOVE} aria-label="Move nafl up">↑</button>
                  <button type="button" onClick={() => moveNafl(i, 1)} disabled={i === nafl.length - 1} className={BTN_MOVE} aria-label="Move nafl down">↓</button>
                  <button type="button" onClick={() => delNafl(i)} className={BTN_DEL} aria-label="Delete nafl">✕</button>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <input value={n.key} onChange={(e) => setNaflField(i, { key: e.target.value })} placeholder="key (slug)" className={INPUT} />
                <input value={n.label} onChange={(e) => setNaflField(i, { label: e.target.value })} placeholder="Label" className={INPUT} />
                <input value={n.note} onChange={(e) => setNaflField(i, { note: e.target.value })} placeholder="Note" className={INPUT} />
              </div>
            </div>
          ))}
          <button type="button" onClick={addNafl} className="min-h-[36px] self-start rounded-lg border border-dashed border-sand-300 px-3 py-1.5 text-[12.5px] font-semibold text-green-800 transition-[transform,background-color] duration-fast hover:bg-sand-50 active:scale-[0.98]">+ Add nafl</button>
        </div>
      </div>

      {/* Dua checklist */}
      <div className="mt-4 rounded-2xl border border-sand-200 bg-white p-4">
        <div className="mb-3 font-serif text-[15px] font-semibold text-sand-800">Dua checklist</div>
        <div className="grid gap-2.5">
          {duas.map((d, i) => (
            <div key={i} className="rounded-xl border border-sand-100 bg-sand-50/40 p-2.5">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-[11px] text-sand-400">#{i + 1}</span>
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => moveDua(i, -1)} disabled={i === 0} className={BTN_MOVE} aria-label="Move dua up">↑</button>
                  <button type="button" onClick={() => moveDua(i, 1)} disabled={i === duas.length - 1} className={BTN_MOVE} aria-label="Move dua down">↓</button>
                  <button type="button" onClick={() => delDua(i)} className={BTN_DEL} aria-label="Delete dua">✕</button>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <input value={d.key} onChange={(e) => setDuaField(i, { key: e.target.value })} placeholder="key (slug)" className={INPUT} />
                <input value={d.label} onChange={(e) => setDuaField(i, { label: e.target.value })} placeholder="Label" className={INPUT} />
              </div>
            </div>
          ))}
          <button type="button" onClick={addDua} className="min-h-[36px] self-start rounded-lg border border-dashed border-sand-300 px-3 py-1.5 text-[12.5px] font-semibold text-green-800 transition-[transform,background-color] duration-fast hover:bg-sand-50 active:scale-[0.98]">+ Add dua</button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-sand-100 pt-5">
        <button type="button" onClick={save} disabled={pending} className="min-h-[44px] rounded-xl bg-green-800 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(15,81,50,0.26)] transition-[transform,background-color] duration-fast hover:bg-green-700 active:scale-[0.98] disabled:opacity-50">
          {pending ? 'Saving…' : 'Save defaults'}
        </button>
        {msg ? <span className="text-[13px] font-semibold text-success-fg">{msg}</span> : null}
        {err ? <span className="text-[13px] font-semibold text-danger-fg">{err}</span> : null}
      </div>
    </ScreenFrame>
  );
}
