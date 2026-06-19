'use client';

import { useEffect, useRef, useState } from 'react';

const BCP47: Record<string, string> = { en: 'en-US', ar: 'ar-SA', ur: 'ur-PK', tr: 'tr-TR', de: 'de-DE' };

interface SREvent {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}
interface SR {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SREvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start(): void;
  stop(): void;
}

function getRecognition(): (new () => SR) | undefined {
  if (typeof window === 'undefined') return undefined;
  const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

/** Speak-to-type: dictates speech (in the chosen language) and appends it via onText. Modern mic pill;
 * hides itself where the browser has no speech recognition. */
export function DictateButton({ lang, onText }: { lang: string; onText: (text: string) => void }) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const ref = useRef<SR | null>(null);

  useEffect(() => {
    setSupported(!!getRecognition());
    return () => ref.current?.stop();
  }, []);

  const toggle = (): void => {
    if (listening) {
      ref.current?.stop();
      return;
    }
    const Reco = getRecognition();
    if (!Reco) return;
    const r = new Reco();
    r.lang = BCP47[lang] ?? 'en-US';
    r.continuous = false;
    r.interimResults = false;
    r.onresult = (e) => {
      const text = Array.from(e.results)
        .map((res) => res[0]?.transcript ?? '')
        .join(' ')
        .trim();
      if (text) onText(text);
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    ref.current = r;
    setListening(true);
    try {
      r.start();
    } catch {
      setListening(false);
    }
  };

  if (!supported) return null;
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={listening}
      aria-label="Speak to type"
      title="Speak to type"
      className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold transition-colors duration-fast ${
        listening ? 'animate-pulse bg-danger-fg text-white' : 'border border-green-700/30 bg-white text-green-800 hover:bg-green-50'
      }`}
    >
      {listening ? <><span className="h-2 w-2 rounded-full bg-white" /> Listening…</> : <>🎤 Speak</>}
    </button>
  );
}
