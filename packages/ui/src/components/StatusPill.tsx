import type { ReactNode } from 'react';
import { cn } from '../cn';

export type PillTone = 'success' | 'info' | 'warning' | 'danger' | 'draft';

const tones: Record<PillTone, string> = {
  success: 'bg-success-bg text-success-fg',
  info: 'bg-info-bg text-info-fg',
  warning: 'bg-warning-bg text-warning-fg',
  danger: 'bg-danger-bg text-danger-fg',
  draft: 'bg-sand-100 text-sand-500',
};

const dots: Record<PillTone, string> = {
  success: 'bg-success-fg',
  info: 'bg-info-fg',
  warning: 'bg-warning-fg',
  danger: 'bg-danger-fg',
  draft: 'bg-sand-500',
};

export interface StatusPillProps {
  tone?: PillTone;
  children: ReactNode;
}

export function StatusPill({ tone = 'draft', children }: StatusPillProps) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold', tones[tone])}>
      <span aria-hidden className={cn('h-1.5 w-1.5 rounded-full', dots[tone])} />
      {children}
    </span>
  );
}
