import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../cn';

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const base =
  'inline-flex items-center justify-center font-semibold transition-[colors,transform] duration-fast ease-out-soft active:scale-[0.98] focus:outline-none focus-visible:shadow-focus focus-visible:border-accent-600 disabled:cursor-not-allowed disabled:bg-sand-200 disabled:text-sand-500 disabled:active:scale-100';

const sizes: Record<ButtonSize, string> = {
  md: 'text-sm px-5 py-[11px] rounded-lg',
  sm: 'text-[13px] px-[14px] py-2 rounded-md',
};

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-green-800 text-white hover:bg-green-900 shadow-[0_4px_12px_rgba(15,81,50,0.22)]',
  accent: 'bg-accent-600 text-white hover:bg-accent-700',
  secondary: 'bg-white text-green-700 border-[1.5px] border-sand-300 hover:bg-sand-50',
  ghost: 'bg-transparent text-sand-700 hover:bg-sand-100',
  danger: 'bg-danger text-white hover:opacity-90',
};

export function Button({ variant = 'primary', size = 'md', className, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(base, sizes[size], variants[variant], className)}
      {...props}
    />
  );
}
