'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Lightweight "look around" viewer — no WebGL / three.js. The image is scaled to the viewport
 * height and panned horizontally by drag / arrow buttons (works with wide panoramas and reads fine
 * with equirectangular photos). Swaps to a fallback image if the scene file is missing.
 */
export function PanoramaViewer({ src, fallbackSrc, alt }: { src: string; fallbackSrc: string; alt: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<{ pointerX: number; startX: number } | null>(null);
  const [x, setX] = useState(0);
  const [maxDrag, setMaxDrag] = useState(0); // negative number: how far left we can pan
  const [useFallback, setUseFallback] = useState(false);

  const measure = (): void => {
    const wrap = wrapRef.current;
    const img = imgRef.current;
    if (!wrap || !img) return;
    const overflow = img.offsetWidth - wrap.offsetWidth;
    const min = overflow > 0 ? -overflow : 0;
    setMaxDrag(min);
    setX((cur) => Math.max(min, Math.min(0, cur)));
  };

  useEffect(() => {
    measure();
    const onResize = (): void => measure();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [src, useFallback]);

  // Re-centre when the scene changes.
  useEffect(() => setX((cur) => Math.max(maxDrag, Math.min(0, cur))), [maxDrag]);

  const clamp = (v: number): number => Math.max(maxDrag, Math.min(0, v));

  const onPointerDown = (e: React.PointerEvent): void => {
    dragRef.current = { pointerX: e.clientX, startX: x };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent): void => {
    if (!dragRef.current) return;
    setX(clamp(dragRef.current.startX + (e.clientX - dragRef.current.pointerX)));
  };
  const onPointerUp = (): void => {
    dragRef.current = null;
  };
  const nudge = (dir: -1 | 1): void => setX((cur) => clamp(cur + dir * 120));

  return (
    <div className="relative overflow-hidden rounded-2xl border border-sand-200 bg-green-950">
      <div
        ref={wrapRef}
        className="relative h-[clamp(240px,46vw,460px)] w-full touch-none select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        style={{ cursor: dragRef.current ? 'grabbing' : 'grab' }}
      >
        <img
          ref={imgRef}
          src={useFallback ? fallbackSrc : src}
          alt={alt}
          onLoad={measure}
          onError={() => setUseFallback(true)}
          draggable={false}
          className="absolute left-0 top-0 h-full w-auto max-w-none"
          style={{ transform: `translateX(${x}px)` }}
        />
        {maxDrag < 0 ? (
          <>
            <button
              type="button"
              aria-label="Look left"
              onClick={() => nudge(1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 px-3 py-2 text-white backdrop-blur transition-colors hover:bg-black/60"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Look right"
              onClick={() => nudge(-1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 px-3 py-2 text-white backdrop-blur transition-colors hover:bg-black/60"
            >
              ›
            </button>
          </>
        ) : null}
        <span className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 text-[11.5px] font-medium text-white/90 backdrop-blur">
          ↔ Drag to look around
        </span>
      </div>
    </div>
  );
}
