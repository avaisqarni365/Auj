'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PanoramaViewer } from './PanoramaViewer';
import { tourScenes } from './scenes';

export function VirtualTour() {
  const scenes = tourScenes();
  const [idx, setIdx] = useState(0);
  const scene = scenes[idx] ?? scenes[0];
  if (!scene) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-[clamp(1.5rem,3.4vw,2rem)] font-semibold leading-tight text-sand-ink">Virtual tour</h1>
          <p className="mt-0.5 text-[14px] text-sand-500">A calm walk-through of the holy places, stop by stop.</p>
        </div>
        <Link href="/guide" className="shrink-0 rounded-xl border border-sand-300 bg-white px-4 py-2 text-[13px] font-semibold text-sand-700 hover:bg-sand-50">
          ← Step-by-step guide
        </Link>
      </div>

      <PanoramaViewer src={scene.src} fallbackSrc={scene.fallbackSrc} alt={`${scene.title} — ${scene.subtitle}`} />

      <div className="mt-3">
        <div className="font-serif text-xl font-semibold text-sand-ink">{scene.title}</div>
        <div className="text-[13.5px] text-accent-600">{scene.subtitle}</div>
      </div>

      {/* scene selector */}
      <div className="mt-4 flex flex-wrap gap-2">
        {scenes.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setIdx(i)}
            aria-pressed={i === idx}
            className={`rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors duration-fast ${
              i === idx ? 'border-green-800 bg-green-800 text-white' : 'border-sand-300 bg-white text-sand-700 hover:bg-sand-50'
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>

      <p className="mt-5 text-center text-[11.5px] leading-relaxed text-sand-500">
        Lightweight preview — drag to look around. Add real 360° equirectangular photos in
        <span className="font-mono"> public/img/ritual/tour/ </span> and they appear automatically.
      </p>
    </div>
  );
}
