'use client';

import { useEffect, useRef, useState } from 'react';

// Map the guide's language codes to BCP-47 tags for speech synthesis voices.
const BCP47: Record<string, string> = { en: 'en-US', ar: 'ar-SA', ur: 'ur-PK', tr: 'tr-TR', de: 'de-DE' };

function ttsAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Plays an audio file if `audioSrc` is given and loads; otherwise reads `text` aloud via the
 * browser's speech synthesis. Normal + slow playback, a repeat/loop toggle, a stop control, and a
 * transcript shown while it plays. Icon-only buttons so no per-language label text is needed.
 */
export function ListenButton({ audioSrc, text, lang }: { audioSrc?: string; text: string; lang: string }) {
  const [playing, setPlaying] = useState(false);
  const [loop, setLoop] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loopRef = useRef(false);
  const rateRef = useRef(1);
  useEffect(() => {
    loopRef.current = loop;
    if (audioRef.current) audioRef.current.loop = loop;
  }, [loop]);

  const stop = (): void => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (ttsAvailable()) window.speechSynthesis.cancel();
    setPlaying(false);
  };

  const speak = (rate: number): void => {
    if (!ttsAvailable() || !text.trim()) {
      setPlaying(false);
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = BCP47[lang] ?? 'en-US';
    u.rate = rate;
    u.onend = () => {
      if (loopRef.current) speak(rate);
      else setPlaying(false);
    };
    u.onerror = () => setPlaying(false);
    setPlaying(true);
    window.speechSynthesis.speak(u);
  };

  const play = (rate: number): void => {
    stop();
    rateRef.current = rate;
    if (audioSrc) {
      const a = new Audio(audioSrc);
      a.playbackRate = rate;
      a.loop = loopRef.current;
      a.onended = () => {
        if (!loopRef.current) setPlaying(false);
      };
      a.onerror = () => {
        audioRef.current = null;
        speak(rate); // missing/blocked file → speak the text instead
      };
      audioRef.current = a;
      setPlaying(true);
      a.play().catch(() => {
        audioRef.current = null;
        speak(rate);
      });
    } else {
      speak(rate);
    }
  };

  useEffect(() => () => stop(), []);

  const btn = 'inline-flex h-8 items-center gap-1 rounded-lg border px-2.5 text-[12.5px] font-semibold';

  return (
    <span className="inline-flex flex-col gap-1.5">
      <span className="inline-flex flex-wrap items-center gap-1">
        {playing ? (
          <button type="button" onClick={stop} aria-label="Stop" className={`${btn} border-sand-300 bg-white text-sand-700 hover:bg-sand-50`}>
            ⏹ Stop
          </button>
        ) : (
          <>
            <button type="button" onClick={() => play(1)} aria-label="Listen" className={`${btn} border-green-700/30 bg-white text-green-800 hover:bg-green-50`}>
              ▶ Listen
            </button>
            <button type="button" onClick={() => play(0.7)} aria-label="Listen slowly" title="Slow" className={`${btn} border-sand-300 bg-white text-sand-600 hover:bg-sand-50`}>
              🐢
            </button>
          </>
        )}
        <button
          type="button"
          onClick={() => setLoop((v) => !v)}
          aria-pressed={loop}
          aria-label="Repeat"
          title="Repeat"
          className={`${btn} ${loop ? 'border-green-800 bg-green-800 text-white' : 'border-sand-300 bg-white text-sand-600 hover:bg-sand-50'}`}
        >
          🔁
        </button>
      </span>
      {playing ? (
        <span dir={lang === 'ar' || lang === 'ur' ? 'rtl' : 'ltr'} className="max-w-[36ch] text-[11.5px] leading-snug text-sand-500">
          🔊 {text}
        </span>
      ) : null}
    </span>
  );
}
