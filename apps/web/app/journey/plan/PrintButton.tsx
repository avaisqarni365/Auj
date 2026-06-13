'use client';

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-[10px] bg-green-800 px-4 py-2.5 text-sm font-semibold text-white transition-[colors,transform] duration-fast ease-out-soft active:scale-[0.98]"
    >
      🖨 Print / Save as PDF
    </button>
  );
}
