// AUJ "zenith" mark: an eight-point gold star as the keystone of a mihrab arch on a
// rounded tile. Construction per the brand handoff (64-box). Crisp from 24px to favicon.
export type LogoVariant = 'primary' | 'inverse' | 'onDark' | 'mono';

export interface LogoProps {
  size?: number;
  variant?: LogoVariant;
  title?: string;
}

const COLOURS: Record<LogoVariant, { tile: string; arch: string; star: string }> = {
  primary: { tile: '#0F5132', arch: '#FAF6EF', star: '#C8A24A' }, // green-800 tile
  inverse: { tile: '#FAF6EF', arch: '#0F5132', star: '#C8A24A' }, // cream tile
  onDark: { tile: '#07301E', arch: '#FAF6EF', star: '#C8A24A' }, // green-950 tile
  mono: { tile: 'none', arch: 'currentColor', star: 'currentColor' },
};

export function Logo({ size = 32, variant = 'primary', title = 'AUJ' }: LogoProps) {
  const c = COLOURS[variant];
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-label={title}>
      <title>{title}</title>
      {c.tile !== 'none' ? <rect width="64" height="64" rx="17" fill={c.tile} /> : null}
      <path d="M19 47V31a13 13 0 0 1 26 0v16" stroke={c.arch} strokeWidth="3.4" fill="none" />
      <path
        d="M12 3l2.2 5.4L20 9.2l-4 3.9 1 5.7L12 16l-5 2.8 1-5.7-4-3.9 5.8-.8L12 3z"
        fill={c.star}
        transform="translate(17.8 4) scale(1.18)"
      />
    </svg>
  );
}

/** "AUJ" wordmark in IBM Plex Serif, optionally with the Arabic أوج lockup. */
export function Wordmark({ arabic = false, className }: { arabic?: boolean; className?: string }) {
  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'baseline', gap: '0.5rem' }}>
      <span className="font-serif font-semibold tracking-[0.04em] text-sand-ink">AUJ</span>
      {arabic ? <span className="font-arabic font-semibold text-gold">أوج</span> : null}
    </span>
  );
}
