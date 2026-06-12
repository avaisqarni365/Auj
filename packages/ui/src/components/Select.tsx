import type { SelectHTMLAttributes } from 'react';
import { cn } from '../cn';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Select({ label, error, className, id, children, ...props }: SelectProps) {
  return (
    <label className="block">
      {label ? <span className="mb-1 block text-[13px] font-medium text-sand-700">{label}</span> : null}
      <div className="relative">
        <select
          id={id}
          aria-invalid={error ? true : undefined}
          className={cn(
            'h-[46px] w-full appearance-none rounded-lg border-[1.5px] bg-white px-3 pe-9 text-sm text-sand-ink focus:outline-none focus-visible:shadow-focus',
            error ? 'border-danger' : 'border-sand-300 focus-visible:border-accent-600',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <span aria-hidden className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-sand-500">
          ▾
        </span>
      </div>
    </label>
  );
}
