'use client';

import { useState, useTransition } from 'react';
import { ScreenFrame } from '../components/ScreenFrame';
import { saveLinesAction } from '../budget/finance-admin-actions';
import type { FinanceLine, FinanceLines } from '../budget/FinancialPlanner';

const INPUT = 'w-full rounded-[10px] border-[1.5px] border-sand-300 bg-white px-3 py-2 text-[13.5px] text-sand-ink focus:border-green-700 focus:outline-none';
const KINDS: FinanceLine['kind'][] = ['nightly', 'perDay', 'fixed'];
const KIND_LABEL: Record<FinanceLine['kind'], string> = {
  nightly: 'Nightly (× days)',
  perDay: 'Per day (× days)',
  fixed: 'Fixed (one-off)',
};

type GroupKey = keyof FinanceLines; // 'package' | 'private'
const GROUPS: { key: GroupKey; title: string; accent: 'green' | 'warning' }[] = [
  { key: 'package', title: 'AUJ PACKAGE · INCLUDED IN ONE PRICE', accent: 'green' },
  { key: 'private', title: 'PRIVATE SPENDING · YOUR OWN BUDGET', accent: 'warning' },
];

const emptyLine = (): FinanceLine => ({ label: '', note: '', kind: 'fixed', cents: 0 });
// €-string for an input; integer cents -> euros without float drift in display.
const eur = (c: number): string => (c / 100).toFixed(2);

// Admin CRUD for the Financial-Planner cost presets: the Package and Private line groups.
// Amounts are entered in euros and stored as integer cents.
export function FinanceLinesAdmin({ initial }: { initial: FinanceLines }) {
  const [lines, setLines] = useState<FinanceLines>(initial);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [pending, start] = useTransition();

  const updateGroup = (key: GroupKey, fn: (g: FinanceLine[]) => FinanceLine[]): void => {
    setLines((l) => ({ ...l, [key]: fn(l[key]) }));
    setMsg('');
    setErr('');
  };
  const setField = (key: GroupKey, i: number, patch: Partial<FinanceLine>): void =>
    updateGroup(key, (g) => g.map((l, k) => (k === i ? { ...l, ...patch } : l)));
  const addLine = (key: GroupKey): void => updateGroup(key, (g) => [...g, emptyLine()]);
  const delLine = (key: GroupKey, i: number): void => updateGroup(key, (g) => g.filter((_, k) => k !== i));
  const move = (key: GroupKey, i: number, d: number): void =>
    updateGroup(key, (g) => {
      const j = i + d;
      if (j < 0 || j >= g.length) return g;
      const n = [...g];
      const [x] = n.splice(i, 1);
      if (x) n.splice(j, 0, x);
      return n;
    });

  const save = (): void =>
    start(async () => {
      try {
        const fresh = await saveLinesAction(lines);
        setLines(fresh);
        setMsg('Saved cost presets.');
        setErr('');
      } catch {
        setErr('Could not save. Please try again.');
        setMsg('');
      }
    });

  return (
    <ScreenFrame label="ADMIN · FINANCIAL PLANNER" tag={`${lines.package.length + lines.private.length} lines`} maxWidth="max-w-4xl">
      <p className="mb-4 text-[13.5px] text-sand-500">
        Edit, add, reorder and delete the cost lines behind the public Financial Planner. Amounts are in euros (stored as
        integer cents). Use <code className="font-mono text-[12px]">{'{days}'}</code> in a note to substitute the selected stay length.
        “Nightly” and “Per day” lines are multiplied by the number of days; “Fixed” lines are one-off.
      </p>

      <div className="grid gap-6">
        {GROUPS.map(({ key, title, accent }) => {
          const group = lines[key];
          return (
            <section key={key}>
              <h2 className={`mb-2.5 font-mono text-[10.5px] tracking-[0.08em] ${accent === 'green' ? 'text-green-800' : 'text-warning'}`}>{title}</h2>
              <div className="grid gap-2.5">
                {group.map((l, i) => (
                  <div
                    key={i}
                    className={`rounded-xl border border-sand-100 bg-sand-50/40 p-2.5 ${accent === 'green' ? 'border-l-[3px] border-l-green-600' : 'border-l-[3px] border-l-warning'}`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-mono text-[11px] text-sand-400">#{i + 1}</span>
                      <div className="flex items-center gap-1.5">
                        <button type="button" onClick={() => move(key, i, -1)} disabled={i === 0} className="h-9 w-9 rounded-md border border-sand-200 text-[12px] transition-transform duration-fast active:scale-[0.98] disabled:opacity-40">↑</button>
                        <button type="button" onClick={() => move(key, i, 1)} disabled={i === group.length - 1} className="h-9 w-9 rounded-md border border-sand-200 text-[12px] transition-transform duration-fast active:scale-[0.98] disabled:opacity-40">↓</button>
                        <button type="button" onClick={() => delLine(key, i)} className="h-9 rounded-md border border-danger/30 px-2 text-[12px] font-semibold text-danger-fg transition-transform duration-fast hover:bg-danger-bg active:scale-[0.98]">✕</button>
                      </div>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <input value={l.label} onChange={(e) => setField(key, i, { label: e.target.value })} placeholder="Label" className={INPUT} />
                      <select value={l.kind} onChange={(e) => setField(key, i, { kind: (e.target.value as FinanceLine['kind']) })} className={INPUT}>
                        {KINDS.map((k) => (
                          <option key={k} value={k}>{KIND_LABEL[k]}</option>
                        ))}
                      </select>
                      <input value={l.note} onChange={(e) => setField(key, i, { note: e.target.value })} placeholder="Note (supports {days})" className={`${INPUT} sm:col-span-2`} />
                      <label className="flex items-center gap-2 sm:col-span-2">
                        <span className="font-mono text-[12px] text-sand-500">€</span>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          inputMode="decimal"
                          value={eur(l.cents)}
                          onChange={(e) => setField(key, i, { cents: Math.max(0, Math.round((Number(e.target.value) || 0) * 100)) })}
                          placeholder="0.00"
                          className={`${INPUT} max-w-[180px] text-right font-mono tabular-nums`}
                        />
                      </label>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => addLine(key)} disabled={group.length >= 20} className="self-start rounded-lg border border-dashed border-sand-300 px-3 py-1.5 text-[12.5px] font-semibold text-green-800 transition-transform duration-fast hover:bg-sand-50 active:scale-[0.98] disabled:opacity-40">+ Add line</button>
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-sand-100 pt-5">
        <button type="button" onClick={save} disabled={pending} className="min-h-[44px] rounded-xl bg-green-800 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(15,81,50,0.26)] transition-[transform,background-color] duration-fast hover:bg-green-700 active:scale-[0.98] disabled:opacity-50">
          {pending ? 'Saving…' : 'Save cost presets'}
        </button>
        {msg ? <span className="text-[13px] font-semibold text-success-fg">{msg}</span> : null}
        {err ? <span className="text-[13px] font-semibold text-danger-fg">{err}</span> : null}
      </div>
    </ScreenFrame>
  );
}
