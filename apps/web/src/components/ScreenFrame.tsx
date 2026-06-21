import type { ReactNode } from 'react';
import { Logo } from '@auj/ui';

// Shared cinematic screen chrome from the prototypes: a white rounded card on the warm canvas with
// a dark-green gradient header bar — logo chip + mono section label + optional tag pill + gold
// underline. Wrap any screen's content in this to match the prototype design language.
export function ScreenFrame({
  label,
  tag,
  dir,
  bodyClassName,
  maxWidth = 'max-w-4xl',
  children,
}: {
  label: string;
  tag?: ReactNode;
  dir?: 'ltr' | 'rtl';
  bodyClassName?: string;
  maxWidth?: string;
  children: ReactNode;
}) {
  return (
    <div className={`mx-auto w-full ${maxWidth} px-[clamp(16px,4vw,32px)] py-[clamp(18px,3.5vw,36px)]`}>
      <div className="animate-rise overflow-hidden rounded-[24px] border border-sand-200 bg-white shadow-[0_40px_90px_-40px_rgba(42,38,32,0.5)]">
        {/* header */}
        <div className="relative flex flex-wrap items-center justify-between gap-3 overflow-hidden bg-gradient-to-br from-green-800 to-green-950 px-5 py-3.5">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{ backgroundImage: 'repeating-linear-gradient(135deg, #fff 0 2px, transparent 2px 11px)' }}
          />
          <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
          <div className="relative flex items-center gap-3">
            <span className="grid place-items-center rounded-lg bg-sand-50 px-2 py-1 shadow-sm">
              <Logo size={22} />
            </span>
            <span className="font-mono text-[11.5px] uppercase tracking-[0.1em] text-green-100/80">{label}</span>
          </div>
          {tag ? (
            <span className="relative rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[12px] font-semibold text-green-50">{tag}</span>
          ) : null}
        </div>
        {/* body */}
        <div dir={dir} className={bodyClassName ?? 'p-[clamp(18px,3vw,30px)]'}>
          {children}
        </div>
      </div>
    </div>
  );
}
