import { cn } from '../cn';

export interface Segment<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  value: T;
  options: Array<Segment<T>>;
  onChange?: (value: T) => void;
  ariaLabel?: string;
}

export function SegmentedControl<T extends string>({ value, options, onChange, ariaLabel }: SegmentedControlProps<T>) {
  return (
    <div role="tablist" aria-label={ariaLabel} className="inline-flex rounded-full bg-sand-100 p-1">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange?.(option.value)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
              active ? 'bg-white text-green-800 shadow-sm' : 'text-sand-500',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
