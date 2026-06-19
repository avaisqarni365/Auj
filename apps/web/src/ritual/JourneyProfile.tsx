'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RITUAL_STEPS } from './ritual-content';
import { deleteDua, exportDuas, listDuas, type PersonalDua } from './personal-duas-store';
import { deleteRecording, listAllRecordings, type RecordingRecord } from './recordings-store';

const TOTAL = RITUAL_STEPS.length;

interface Progress {
  stepIndex: number;
  counters: { tawaf: number; sai: number };
  notes: string;
  elapsedSec: number;
  completedAt: number | null;
}

function fmtClock(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = (n: number): string => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

const stepTitle = (key: string): string => RITUAL_STEPS.find((s) => s.key === key)?.title ?? key;
const isRtl = (c: string): boolean => c === 'ar' || c === 'ur';

function RecItem({ rec, onDelete }: { rec: RecordingRecord; onDelete: (id: string) => void }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    const u = URL.createObjectURL(rec.blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [rec.blob]);
  return (
    <div className="rounded-xl border border-sand-200 bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-[13.5px] font-semibold text-sand-ink">{rec.name}</div>
          <div className="text-[11px] text-sand-500">{stepTitle(rec.stepKey)} · {new Date(rec.createdAt).toLocaleDateString()}</div>
        </div>
        <button type="button" onClick={() => onDelete(rec.id)} className="rounded-md px-2 py-1 text-[12px] font-semibold text-danger-fg hover:bg-danger-bg">Delete</button>
      </div>
      {url ? <audio controls preload="none" src={url} className="mt-2 h-9 w-full" /> : null}
    </div>
  );
}

export function JourneyProfile() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [recs, setRecs] = useState<RecordingRecord[]>([]);
  const [duas, setDuas] = useState<PersonalDua[]>([]);
  const [ready, setReady] = useState(false);

  const reloadRecs = (): void => {
    listAllRecordings().then(setRecs).catch(() => setRecs([]));
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem('auj.ritual.v1');
      if (raw) setProgress(JSON.parse(raw) as Progress);
    } catch {
      /* ignore */
    }
    reloadRecs();
    setDuas(listDuas());
    setReady(true);
  }, []);

  const removeRec = (id: string): void => {
    deleteRecording(id).then(reloadRecs).catch(() => undefined);
  };
  const removeDua = (id: string): void => {
    deleteDua(id);
    setDuas(listDuas());
  };
  const exportAll = (): void => {
    if (typeof window === 'undefined') return;
    const blob = new Blob([exportDuas()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-umrah-duas.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const pct = progress ? Math.round(((progress.stepIndex + 1) / TOTAL) * 100) : 0;
  const empty = ready && !progress && recs.length === 0 && duas.length === 0;

  return (
    <div className="mx-auto max-w-2xl px-4 pb-16 pt-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="font-serif text-[clamp(1.5rem,3.2vw,2rem)] font-semibold text-sand-ink">My Umrah journey</h1>
        <Link href="/guide" className="shrink-0 rounded-xl border border-sand-300 bg-white px-4 py-2 text-[13px] font-semibold text-green-800 hover:bg-sand-50">
          Open the guide →
        </Link>
      </div>
      <p className="mb-5 text-[13px] text-sand-500">Everything here is saved privately on this device.</p>

      {empty ? (
        <div className="rounded-2xl border border-sand-200 bg-white p-8 text-center">
          <div className="text-3xl">🕋</div>
          <p className="mt-2 text-[14px] text-sand-600">Nothing saved yet. Start the step-by-step guide — your progress, du‘as and voice notes will appear here.</p>
          <Link href="/guide" className="mt-4 inline-block rounded-xl bg-green-800 px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-green-700">Begin</Link>
        </div>
      ) : null}

      {progress ? (
        <section className="mb-6 rounded-2xl border border-sand-200 bg-white p-5">
          <h2 className="mb-3 text-[14px] font-bold text-sand-ink">Progress</h2>
          <div className="h-1.5 overflow-hidden rounded-full bg-sand-100">
            <div className="h-full rounded-full bg-green-700" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
            <div><div className="font-mono text-lg font-bold text-green-800">{Math.min(progress.stepIndex + 1, TOTAL)}/{TOTAL}</div><div className="text-[11px] text-sand-500">step</div></div>
            <div><div className="font-mono text-lg font-bold text-green-800">{fmtClock(progress.elapsedSec)}</div><div className="text-[11px] text-sand-500">elapsed</div></div>
            <div><div className="font-mono text-lg font-bold text-green-800">{progress.counters?.tawaf ?? 0}/7</div><div className="text-[11px] text-sand-500">tawaf</div></div>
            <div><div className="font-mono text-lg font-bold text-green-800">{progress.counters?.sai ?? 0}/7</div><div className="text-[11px] text-sand-500">sa‘i</div></div>
          </div>
          {progress.completedAt ? (
            <p className="mt-3 text-center text-[13px] font-semibold text-success-fg">🎉 Umrah completed on {new Date(progress.completedAt).toLocaleDateString()}</p>
          ) : null}
          {progress.notes ? <p className="mt-3 rounded-lg bg-sand-50 p-3 text-[13px] text-sand-700">📝 {progress.notes}</p> : null}
        </section>
      ) : null}

      {recs.length > 0 ? (
        <section className="mb-6">
          <h2 className="mb-3 text-[14px] font-bold text-sand-ink">Voice notes ({recs.length})</h2>
          <div className="grid gap-2">
            {recs.map((r) => <RecItem key={r.id} rec={r} onDelete={removeRec} />)}
          </div>
        </section>
      ) : null}

      {duas.length > 0 ? (
        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[14px] font-bold text-sand-ink">Personal du‘as ({duas.length})</h2>
            <button type="button" onClick={exportAll} className="text-[12px] font-semibold text-accent-600 hover:underline">Export all</button>
          </div>
          <ul className="grid gap-2">
            {duas.map((d) => {
              const rtl = isRtl(d.lang);
              return (
                <li key={d.id} className="rounded-xl border border-sand-200 bg-white p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p dir={rtl ? 'rtl' : 'ltr'} className={`text-[14px] leading-relaxed text-sand-ink ${rtl ? 'text-right font-arabic' : ''}`}>
                      {d.pinned ? '📌 ' : ''}{d.text}
                    </p>
                    <button type="button" onClick={() => removeDua(d.id)} className="shrink-0 rounded-md px-2 py-0.5 text-[12px] font-semibold text-danger-fg hover:bg-danger-bg">Delete</button>
                  </div>
                  {d.translit ? <p className="mt-1 text-[12.5px] italic text-sand-600">{d.translit}</p> : null}
                  {d.meaning ? <p className="mt-0.5 text-[12.5px] text-sand-600">“{d.meaning}”</p> : null}
                  {d.note ? <p className="mt-1 text-[11.5px] text-sand-500">📝 {d.note}</p> : null}
                  <div className="mt-1 text-[11px] uppercase tracking-wider text-sand-400">{stepTitle(d.stepKey)} · {d.lang}</div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
