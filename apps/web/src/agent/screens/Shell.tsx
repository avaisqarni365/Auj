import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

export function Logo({ size = 30, onDark = false }: { size?: number; onDark?: boolean }) {
  const inner = Math.round(size * 0.55);
  return (
    <span
      className={`inline-flex items-center justify-center rounded-[10px] ${onDark ? 'bg-white/10' : 'bg-green-800'}`}
      style={{ width: size, height: size }}
    >
      <svg width={inner} height={inner} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 3l2.2 5.4L20 9.2l-4 3.9 1 5.7L12 16l-5 2.8 1-5.7-4-3.9 5.8-.8L12 3z" fill="#C8A24A" />
      </svg>
    </span>
  );
}

const NAV = [
  { key: 'home', icon: '▦' },
  { key: 'pax', icon: '👥' },
  { key: 'wallet', icon: '💳' },
  { key: 'markup', icon: '🏷' },
  { key: 'quotes', icon: '📄' },
  { key: 'reports', icon: '📊' },
] as const;

export interface ShellProps {
  agencyName: string;
  subline?: string;
  walletLabel: string;
  active?: string;
  children: ReactNode;
}

export function Shell({ agencyName, subline, walletLabel, active = 'home', children }: ShellProps) {
  const t = useTranslations('agent');
  return (
    <div className="flex min-h-screen bg-sand-50">
      {/* rail */}
      <div className="flex w-[76px] shrink-0 flex-col items-center gap-1.5 bg-green-950 py-4">
        <div className="mb-3.5">
          <Logo size={40} onDark />
        </div>
        {NAV.map((n) => {
          const on = n.key === active;
          return (
            <div
              key={n.key}
              className={`flex w-[52px] flex-col items-center gap-1 rounded-xl py-2.5 ${on ? 'bg-white' : ''}`}
            >
              <span className={`text-base ${on ? '' : 'opacity-80'}`}>{n.icon}</span>
              <span className={`text-[9px] font-semibold ${on ? 'text-green-800' : 'text-green-100/80'}`}>{t(`nav.${n.key}`)}</span>
            </div>
          );
        })}
      </div>

      {/* main */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between border-b border-sand-200 bg-white px-7 py-4">
          <div>
            <div className="font-serif text-[22px] font-semibold text-sand-ink">{t('greeting', { name: agencyName })}</div>
            {subline ? <div className="text-[13px] text-sand-500">{subline}</div> : null}
          </div>
          <div className="flex items-center gap-3.5">
            <div className="flex items-center gap-2 rounded-[10px] bg-green-100 px-3.5 py-1.5">
              <span className="text-xs font-semibold text-success-fg">{t('walletChip')}</span>
              <span className="font-mono text-sm font-semibold text-green-800">{walletLabel}</span>
            </div>
            <button type="button" className="rounded-[10px] bg-green-800 px-4 py-2 text-[13px] font-semibold text-white">
              {t('newBooking')}
            </button>
            <span className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-accent-600 text-sm font-semibold text-white">
              {agencyName.slice(0, 2).toUpperCase()}
            </span>
          </div>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
