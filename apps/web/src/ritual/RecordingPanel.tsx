'use client';

import { useEffect, useRef, useState } from 'react';
import {
  addRecording,
  deleteRecording,
  listByStep,
  recordingsSupported,
  updateRecording,
  type RecordingRecord,
  type Visibility,
} from './recordings-store';
import { ui } from './i18n';

function mmss(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function newId(): string {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    /* fall through */
  }
  return `rec-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

/** One saved recording: owns its playback object-URL lifecycle. */
function RecordingItem({
  rec,
  onDelete,
  onVisibility,
}: {
  rec: RecordingRecord;
  onDelete: (id: string) => void;
  onVisibility: (id: string, v: Visibility) => void;
}) {
  const [url, setUrl] = useState<string>('');
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
          <div className="text-[11px] text-sand-500">
            {new Date(rec.createdAt).toLocaleString()} · {mmss(rec.durationSec)}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onDelete(rec.id)}
          className="rounded-md px-2 py-1 text-[12px] font-semibold text-danger-fg hover:bg-danger-bg"
        >
          Delete
        </button>
      </div>
      {url ? <audio controls preload="none" src={url} className="mt-2 h-9 w-full" /> : null}
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px]">
        <label className="flex items-center gap-1.5 text-sand-600">
          Visibility:
          <select
            value={rec.visibility}
            onChange={(e) => onVisibility(rec.id, e.target.value as Visibility)}
            className="rounded-md border border-sand-300 bg-white px-1.5 py-0.5 text-[12px] font-semibold text-sand-700"
          >
            <option value="private">Private (only me)</option>
            <option value="family">Family share</option>
          </select>
        </label>
        {url ? (
          <a href={url} download={`${rec.name || 'recording'}.webm`} className="font-semibold text-accent-600 hover:underline">
            Download
          </a>
        ) : null}
      </div>
    </div>
  );
}

export function RecordingPanel({ stepKey, stepTitle, lang = 'en' }: { stepKey: string; stepTitle: string; lang?: string }) {
  const t = ui(lang);
  const [supported, setSupported] = useState(false);
  const [list, setList] = useState<RecordingRecord[]>([]);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [pending, setPending] = useState<{ blob: Blob; url: string; durationSec: number; mime: string } | null>(null);
  const [name, setName] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('private');
  const [error, setError] = useState('');

  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reload = (): void => {
    listByStep(stepKey).then(setList).catch(() => setList([]));
  };

  useEffect(() => {
    const ok = recordingsSupported();
    setSupported(ok);
    if (ok) reload();
    // Reset transient UI when switching steps.
    setPending(null);
    setError('');
    setName('');
  }, [stepKey]);

  const stopTimer = (): void => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const start = async (): Promise<void> => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const mime = mr.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mime });
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setPending((prev) => {
          if (prev) URL.revokeObjectURL(prev.url);
          return { blob, url: URL.createObjectURL(blob), durationSec: elapsed, mime };
        });
        setName(`${stepTitle} — ${new Date().toLocaleDateString()}`);
      };
      mr.start();
      recRef.current = mr;
      setElapsed(0);
      setRecording(true);
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } catch {
      setError('Microphone access was blocked. Allow it in your browser to record.');
    }
  };

  const stop = (): void => {
    recRef.current?.stop();
    recRef.current = null;
    setRecording(false);
    stopTimer();
  };

  // Clean up an unsaved recording / live stream on unmount.
  useEffect(
    () => () => {
      stopTimer();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    },
    [],
  );

  const save = async (): Promise<void> => {
    if (!pending) return;
    const lang = (typeof document !== 'undefined' && document.documentElement.lang) || 'en';
    await addRecording({
      id: newId(),
      stepKey,
      name: name.trim() || `${stepTitle} reflection`,
      lang,
      visibility,
      durationSec: pending.durationSec,
      createdAt: Date.now(),
      mime: pending.mime,
      blob: pending.blob,
    });
    URL.revokeObjectURL(pending.url);
    setPending(null);
    setName('');
    setVisibility('private');
    reload();
  };

  const discard = (): void => {
    if (pending) URL.revokeObjectURL(pending.url);
    setPending(null);
    setName('');
  };

  const onDelete = (id: string): void => {
    deleteRecording(id).then(reload).catch(() => undefined);
  };
  const onVisibility = (id: string, v: Visibility): void => {
    updateRecording(id, { visibility: v }).then(reload).catch(() => undefined);
  };

  return (
    <div className="mt-4 rounded-2xl border border-sand-200 bg-sand-50 p-4">
      <div className="flex items-center gap-2 text-[13px] font-bold text-sand-ink">🎙️ {t.reflections}</div>
      <p className="mt-0.5 text-[12px] text-sand-500">
        Record a personal du‘a, a reflection, or practise the recitation. Saved only on this device — private by default.
      </p>

      {!supported ? (
        <p className="mt-3 text-[12.5px] text-sand-500">
          Recording needs a browser with microphone support (open the guide on your phone or a modern browser).
        </p>
      ) : (
        <>
          {error ? <p className="mt-3 text-[12.5px] font-semibold text-danger-fg">{error}</p> : null}

          {pending ? (
            <div className="mt-3 rounded-xl border border-sand-200 bg-white p-3">
              <audio controls src={pending.url} className="h-9 w-full" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name this recording"
                className="mt-2 w-full rounded-lg border-[1.5px] border-sand-300 px-3 py-2 text-[13.5px] focus:border-green-700 focus:outline-none"
              />
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as Visibility)}
                  className="rounded-lg border border-sand-300 bg-white px-2 py-1.5 text-[12.5px] font-semibold text-sand-700"
                >
                  <option value="private">Private (only me)</option>
                  <option value="family">Family share</option>
                </select>
                <button
                  type="button"
                  onClick={save}
                  className="rounded-lg bg-green-800 px-4 py-1.5 text-[13px] font-semibold text-white transition-[transform,background-color] duration-fast hover:bg-green-700 active:scale-[0.98]"
                >
                  {t.save}
                </button>
                <button
                  type="button"
                  onClick={discard}
                  className="rounded-lg border border-sand-300 bg-white px-3 py-1.5 text-[13px] font-semibold text-sand-600 hover:bg-sand-100"
                >
                  Discard
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={recording ? stop : start}
              className={`mt-3 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-semibold text-white transition-[transform,background-color] duration-fast active:scale-[0.98] ${
                recording ? 'bg-danger-fg hover:opacity-90' : 'bg-green-800 hover:bg-green-700'
              }`}
            >
              {recording ? (
                <>
                  <span className="h-2.5 w-2.5 rounded-sm bg-white" /> {t.stop} · {mmss(elapsed)}
                </>
              ) : (
                <>
                  <span className="h-2.5 w-2.5 rounded-full bg-white" /> {t.record}
                </>
              )}
            </button>
          )}

          {list.length > 0 ? (
            <div className="mt-4 grid gap-2">
              {list.map((rec) => (
                <RecordingItem key={rec.id} rec={rec} onDelete={onDelete} onVisibility={onVisibility} />
              ))}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
