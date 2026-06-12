import type { HTMLAttributes } from 'react';
import { cn } from '../cn';

export type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return <div className={cn('rounded-xl border border-sand-200 bg-white shadow-sm', className)} {...props} />;
}
