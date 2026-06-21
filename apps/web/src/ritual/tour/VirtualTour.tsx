'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PanoramaViewer } from './PanoramaViewer';
import { ScreenFrame } from '../../components/ScreenFrame';
import { tourChrome, tourScenes } from './scenes';
import { isRtlLang, ui } from '../i18n';
import { useRitualLang } from '../useRitualLang';
import { ListenButton } from '../ListenButton';
import type { ContentOverrides } from '../content-overrides';

const MEDIA_H = 'h-[clamp(220px,42vw,420px)]';

/** Walkthrough video for a scene; falls back to a calm placeholder until an .mp4 is dropped in. */
function TourVideo({ src, poster, soonLabel }: { src: string; poster: string; soonLabel: string }) {
  const [ok, setOk] = useState(true);
  if (!ok) {
    return (
      <div className={`flex ${MEDIA_H} items-center justify-center rounded-2xl border border-dashed border-sand-300 bg-sand-50`}>
        <span className="text-[13px] font-medium text-sand-500">🎥 {soonLabel}</span>
      </div>
    );
  }
  return (
    <video
      controls
      preload="none"
      poster={poster}
      src={src}
      onError={() => setOk(false)}
      className={`${MEDIA_H} w-full rounded-2xl border border-sand-200 bg-green-950 object-cover`}
    />
  );
}

function Caption({ children }: { children: React.ReactNode }) {
  return <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-sand-500">{children}</div>;
}

export function VirtualTour({ overrides = {} }: { overrides?: ContentOverrides }) {
  const [lang] = useRitualLang();
  const rtl = isRtlLang(lang);
  const chrome = tourChrome(lang);
  // Apply admin content-editor overrides (keyed tour:<id>; intro → scene description).
  const scenes = tourScenes(lang).map((s) => {
    const o = overrides[`tour:${s.id}`]?.[lang] ?? {};
    return { ...s, title: o.title?.trim() || s.title, subtitle: o.subtitle?.trim() || s.subtitle, desc: o.intro?.trim() || s.desc };
  });
  const [idx, setIdx] = useState(0);
  const scene = scenes[idx] ?? scenes[0];
  if (!scene) return null;

  return (
    <ScreenFrame label={ui(lang).virtualTour} tag={`${idx + 1} / ${scenes.length}`} dir={rtl ? 'rtl' : 'ltr'}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-[14px] text-sand-500">{chrome.subtitle}</p>
        <Link
          href="/guide"
          className="shrink-0 rounded-xl border border-sand-300 bg-white px-4 py-2 text-[13px] font-semibold text-green-800 transition-colors duration-fast hover:bg-sand-50 active:scale-[0.98] focus-visible:outline-none focus-visible:shadow-focus"
        >
          {chrome.back} →
        </Link>
      </div>

      {/* picture + video, side by side */}
      <div key={scene.id} className="animate-rise grid gap-3 md:grid-cols-2">
        <figure>
          <Caption>{chrome.photo}</Caption>
          <PanoramaViewer src={scene.src} fallbackSrc={scene.fallbackSrc} alt={`${scene.title} — ${scene.subtitle}`} hint={chrome.hint} />
        </figure>
        <figure>
          <Caption>{chrome.video}</Caption>
          <TourVideo src={scene.videoSrc} poster={scene.fallbackSrc} soonLabel={chrome.videoSoon} />
        </figure>
      </div>

      {/* localized scene content */}
      <div key={`${scene.id}-text`} className="mt-4 animate-rise">
        <h2 className="font-serif text-xl font-semibold text-sand-ink">{scene.title}</h2>
        <div className="text-[13.5px] font-medium text-accent-600">{scene.subtitle}</div>
        <p className="mt-2 max-w-[60ch] text-[14.5px] leading-relaxed text-sand-700">{scene.desc}</p>
        <div className="mt-3">
          <ListenButton audioSrc={scene.narrationSrc} text={scene.desc} lang={lang} />
        </div>
      </div>

      {/* scene selector */}
      <div className="mt-5 flex flex-wrap gap-2">
        {scenes.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setIdx(i)}
            aria-pressed={i === idx}
            className={`rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors duration-fast active:scale-[0.98] focus-visible:outline-none focus-visible:shadow-focus ${
              i === idx ? 'border-green-800 bg-green-800 text-white' : 'border-sand-300 bg-white text-sand-700 hover:bg-sand-50'
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>
    </ScreenFrame>
  );
}
