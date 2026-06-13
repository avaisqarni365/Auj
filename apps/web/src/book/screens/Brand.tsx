import type { ReactNode } from 'react';

// AUJ brand mark: an 8-point gold star on a green-800 rounded square + serif wordmark.
export function Logo({ size = 30 }: { size?: number }) {
  const inner = Math.round(size * 0.53);
  return (
    <span className="inline-flex items-center justify-center rounded-[9px] bg-green-800" style={{ width: size, height: size }}>
      <svg width={inner} height={inner} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 3l2.2 5.4L20 9.2l-4 3.9 1 5.7L12 16l-5 2.8 1-5.7-4-3.9 5.8-.8L12 3z" fill="#C8A24A" />
      </svg>
    </span>
  );
}

export function Wordmark() {
  return <span className="font-serif text-[17px] font-semibold tracking-[0.04em] text-sand-ink">AUJ</span>;
}

/** Sticky back-header used by the sub-screens. */
export function ScreenHeader({ title, onBack, right }: { title: string; onBack?: () => void; right?: ReactNode }) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-sand-200 bg-sand-50/90 px-5 py-3 backdrop-blur">
      <button type="button" aria-label="Back" onClick={onBack} className="text-xl text-sand-700">
        ←
      </button>
      <span className="text-[15px] font-semibold text-sand-ink">{title}</span>
      <span className="min-w-[40px] text-right text-[13px] font-semibold text-accent-600">{right}</span>
    </div>
  );
}
