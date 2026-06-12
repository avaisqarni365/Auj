export interface StepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
  label?: string;
}

export function Stepper({ value, min = 0, max = Number.MAX_SAFE_INTEGER, onChange, label }: StepperProps) {
  const set = (next: number): void => onChange?.(Math.min(max, Math.max(min, next)));
  return (
    <div className="inline-flex items-center gap-3" role="group" aria-label={label}>
      <button
        type="button"
        aria-label="Decrease"
        disabled={value <= min}
        onClick={() => set(value - 1)}
        className="h-8 w-8 rounded-md border border-sand-300 text-sand-700 disabled:opacity-40"
      >
        −
      </button>
      <span className="min-w-[1.5rem] text-center text-[15px] font-semibold tabular-nums">{value}</span>
      <button
        type="button"
        aria-label="Increase"
        disabled={value >= max}
        onClick={() => set(value + 1)}
        className="h-8 w-8 rounded-md bg-green-800 text-white disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}
