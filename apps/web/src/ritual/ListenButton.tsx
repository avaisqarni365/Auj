'use client';

import { useEffect, useRef, useState } from 'react';

// Map the guide's language codes to BCP-47 tags for speech synthesis voices.
const BCP47: Record<string, string> = { en: 'en-US', ar: 'ar-SA', ur: 'ur-PK', tr: 'tr-TR', de: 'de-DE' };

function ttsAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Plays an audio file if `audioSrc` is given and loads; otherwise falls back to the browser's
 * speech synthesis to read `text` in `lang`. Offers normal + slow playback and a stop control.
 * Icon-only (aria-labelled) so it needs no per-language label text.
 */
export function ListenButton({ audioSrc, text, lang }: { audioSrc?: string; text: string; lang: string }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
    u.onend = () => setPlaying(false);
    u.onerror = () => setPlaying(false);
    setPlaying(true);
    window.speechSynthesis.speak(u);
  };

  const play = (rate: number): void => {
    stop();
    if (audioSrc) {
      const a = new Audio(audioSrc);
      a.playbackRate = rate;
      a.onended = () => setPlaying(false);
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

  return (
    <span className="inline-flex items-center gap-1">
      {playing ? (
        <button
          type="button"
          onClick={stop}
          aria-label="Stop"
          className="inline-flex h-8 items-center gap-1 rounded-lg border border-sand-300 bg-white px-2.5 text-[12.5px] font-semibold text-sand-700 hover:bg-sand-50"
        >
          ⏹ Stop
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={() => play(1)}
            aria-label="Listen"
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-green-700/30 bg-white px-2.5 text-[12.5px] font-semibold text-green-800 hover:bg-green-50"
          >
            ▶ Listen
          </button>
          <button
            type="button"
            onClick={() => play(0.7)}
            aria-label="Listen slowly"
            title="Slow"
            className="inline-flex h-8 items-center rounded-lg border border-sand-300 bg-white px-2 text-[12.5px] font-semibold text-sand-600 hover:bg-sand-50"
          >
            🐢
          </button>
        </>
      )}
    </span>
  );
}
