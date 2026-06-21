'use client';

import { useEffect, useRef } from 'react';

// Cinematic hero backdrop: a faint mosque skyline with a central green dome, twinkling minaret
// lights, ambient stars and a crescent moon — gently parallaxed on scroll + pointer. Purely
// decorative (aria-hidden, pointer-events-none) and disabled under prefers-reduced-motion.

const STARS = [
  { x: 12, y: 22, s: 2, g: 5 },
  { x: 24, y: 40, s: 2.5, g: 6 },
  { x: 38, y: 16, s: 2, g: 5 },
  { x: 61, y: 28, s: 2.5, g: 6 },
  { x: 73, y: 18, s: 2, g: 5 },
  { x: 84, y: 36, s: 3, g: 7 },
  { x: 92, y: 24, s: 2, g: 5 },
  { x: 48, y: 12, s: 2, g: 5 },
];

const DARK = '#05230F';
const DARKER = '#04190F';
const GOLD = '#C8A24A';
const LIGHT_GOLD = '#E8C36A';

function Minaret({ flip }: { flip?: boolean }) {
  return (
    <div className="flex flex-col items-center" style={{ zIndex: 2, marginInline: flip ? '0' : '0' }}>
      <div style={{ width: 3, height: 14, background: GOLD, opacity: 0.85 }} />
      <div style={{ width: 16, height: 20, borderRadius: '8px 8px 0 0', background: '#05200F' }} />
      <div style={{ width: 10, height: 6, background: '#05200F' }} />
      <div style={{ width: 19, height: 'clamp(150px,24vh,250px)', background: '#05200F', borderRadius: '4px 4px 0 0', position: 'relative' }}>
        <span className="animate-twinkle" style={{ position: 'absolute', left: '50%', top: '32%', transform: 'translateX(-50%)', width: 3, height: 3, borderRadius: '50%', background: LIGHT_GOLD, boxShadow: `0 0 5px ${GOLD}` }} />
        <span className="animate-twinkle" style={{ position: 'absolute', left: '50%', top: '56%', transform: 'translateX(-50%)', width: 3, height: 3, borderRadius: '50%', background: LIGHT_GOLD, boxShadow: `0 0 5px ${GOLD}`, animationDelay: '.7s' }} />
      </div>
    </div>
  );
}

function SideDome() {
  return (
    <div className="flex flex-col items-center" style={{ margin: '0 -4px' }}>
      <div style={{ width: 2, height: 11, background: GOLD, opacity: 0.8 }} />
      <div style={{ width: 52, height: 38, borderRadius: '26px 26px 6px 6px / 34px 34px 6px 6px', background: '#05200F' }} />
      <div style={{ width: 70, height: 'clamp(78px,12vh,128px)', background: '#05200F', borderRadius: '8px 8px 0 0', marginTop: -2 }} />
    </div>
  );
}

export function HeroBackdrop() {
  const stars = useRef<HTMLDivElement>(null);
  const crescent = useRef<HTMLDivElement>(null);
  const skyline = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    let mx = 0;
    let my = 0;
    let raf = 0;
    const layers: Array<[HTMLDivElement | null, number]> = [
      [stars.current, 0.18],
      [crescent.current, 0.1],
      [skyline.current, 0.05],
    ];
    const apply = (): void => {
      const sy = window.scrollY || 0;
      for (const [el, f] of layers) {
        if (el) el.style.transform = `translate(${mx * f * 40}px, ${sy * f * 0.4 + my * f * 26}px)`;
      }
    };
    const onScroll = (): void => {
      raf = requestAnimationFrame(apply);
    };
    const onMove = (e: MouseEvent): void => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
      raf = requestAnimationFrame(apply);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousemove', onMove, { passive: true });
    apply();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* stars */}
      <div ref={stars} className="absolute inset-0 will-change-transform">
        {STARS.map((s, i) => (
          <span
            key={i}
            className="animate-twinkle absolute rounded-full"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, background: LIGHT_GOLD, boxShadow: `0 0 ${s.g}px ${GOLD}`, animationDelay: `${(i % 5) * 0.4}s` }}
          />
        ))}
      </div>

      {/* crescent moon, top-right */}
      <div ref={crescent} className="absolute will-change-transform" style={{ top: 'clamp(28px,8vh,84px)', right: 'clamp(40px,14vw,220px)' }}>
        <div className="animate-glow absolute" style={{ inset: -30, borderRadius: '50%', background: `radial-gradient(circle, rgba(200,162,74,0.4), transparent 68%)` }} />
        <div style={{ position: 'relative', width: 60, height: 60, borderRadius: '50%', background: '#F4ECD6', boxShadow: '0 0 36px rgba(244,236,214,0.4)' }} />
        <div style={{ position: 'absolute', top: -8, left: 11, width: 60, height: 60, borderRadius: '50%', background: 'radial-gradient(140% 120% at 84% -6%, #1C7A4F 0%, #0A3D26 44%, #06251A 100%)' }} />
      </div>

      {/* skyline silhouette across the bottom */}
      <div ref={skyline} className="absolute inset-x-0 bottom-0 will-change-transform" style={{ height: 'clamp(180px,28vh,320px)', opacity: 0.14 }}>
        <div className="absolute inset-x-0 bottom-0" style={{ height: '62%', background: 'linear-gradient(to top, rgba(200,162,74,0.16), transparent)' }} />
        <div className="absolute bottom-0 left-1/2 flex items-end justify-center" style={{ transform: 'translateX(-50%)', filter: `drop-shadow(0 0 1px rgba(200,162,74,0.35))` }}>
          <div style={{ width: 46, height: 'clamp(70px,11vh,118px)', background: DARKER, borderRadius: '6px 6px 0 0', marginRight: -6 }} />
          <Minaret />
          <SideDome />
          {/* central green dome */}
          <div className="relative flex flex-col items-center" style={{ zIndex: 3, margin: '0 -8px' }}>
            <div style={{ position: 'relative', width: 14, height: 14, marginBottom: 1 }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: GOLD, boxShadow: `0 0 8px rgba(200,162,74,.8)` }} />
              <div style={{ position: 'absolute', top: -2, left: 4, width: 12, height: 12, borderRadius: '50%', background: '#0A3D26' }} />
            </div>
            <div style={{ width: 3, height: 16, background: GOLD }} />
            <div style={{ width: 96, height: 78, borderRadius: '52px 52px 8px 8px / 72px 72px 8px 8px', background: 'linear-gradient(#0D3A24,#06280F)', boxShadow: 'inset 0 4px 0 rgba(42,148,104,.3), 0 0 22px rgba(42,148,104,.18)' }} />
            <div style={{ width: 128, height: 'clamp(96px,15vh,150px)', background: DARK, borderRadius: '10px 10px 0 0', marginTop: -3, position: 'relative' }}>
              {[24, 47, 70].map((l, i) => (
                <span key={l} className="animate-twinkle absolute" style={{ left: `${l}%`, top: '26%', width: 6, height: 9, borderRadius: 2, background: LIGHT_GOLD, boxShadow: `0 0 6px ${GOLD}`, animationDelay: `${i * 0.5}s` }} />
              ))}
            </div>
          </div>
          <SideDome />
          <Minaret flip />
          <div style={{ width: 46, height: 'clamp(70px,11vh,118px)', background: DARKER, borderRadius: '6px 6px 0 0', marginLeft: -6 }} />
        </div>
      </div>
    </div>
  );
}
