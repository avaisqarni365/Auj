import { cn } from '../cn';

export interface ToggleProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
}

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange?.(!checked)}
      className={cn(
        'relative inline-flex h-[18px] w-8 items-center rounded-full transition-colors',
        checked ? 'bg-success' : 'bg-sand-300',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'inline-block h-[14px] w-[14px] rounded-full bg-white transition-transform',
          checked ? 'translate-x-[16px]' : 'translate-x-[2px]',
        )}
      />
    </button>
  );
}
