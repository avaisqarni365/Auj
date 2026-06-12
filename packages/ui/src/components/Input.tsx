import type { InputHTMLAttributes } from 'react';
import { cn } from '../cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  return (
    <label className="block">
      {label ? <span className="mb-1 block text-[13px] font-medium text-sand-700">{label}</span> : null}
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        className={cn(
          'h-[46px] w-full rounded-lg border-[1.5px] bg-white px-3 text-sm text-sand-ink placeholder:text-sand-500 focus:outline-none focus-visible:shadow-focus',
          error ? 'border-danger' : 'border-sand-300 focus-visible:border-accent-600',
          className,
        )}
        {...props}
      />
      {error ? <span className="mt-1 block text-[12.5px] text-danger">{error}</span> : null}
    </label>
  );
}
