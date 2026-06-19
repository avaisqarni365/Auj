'use client';

import { useMemo, useState, useTransition, type ReactNode } from 'react';
import {
  CURRENCIES,
  PACKAGE_TYPES,
  computeFinance,
  defaultInputs,
  fmt,
  toCents,
  type CostBasis,
  type FinanceInputs,
} from './calc';
import { saveCalculationAction } from './actions';
import type { SavedCalc } from './store';

const INPUT =
  'w-full rounded-lg border-[1.5px] border-sand-300 bg-white px-3 py-2 text-[14px] focus:border-green-700 focus:outline-none';

function uid(): string {
  return globalThis.crypto?.randomUUID?.() ?? `c-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-sand-200 bg-white p-[clamp(16px,2.4vw,22px)]">
      <h2 className="mb-4 text-[15px] font-bold text-sand-ink">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-semibold uppercase tracking-wider text-sand-500">{label}</span>
      {children}
    </label>
  );
}

/** Decimal money input that emits integer cents. */
function Money({ cents, onChange }: { cents: number; onChange: (c: number) => void }) {
  const [s, setS] = useState(cents ? (cents / 100).toString() : '');
  return (
    <input
      inputMode="decimal"
      value={s}
      onChange={(e) => {
        setS(e.target.value);
        onChange(toCents(e.target.value));
      }}
      placeholder="0.00"
      className={`${INPUT} text-right font-mono`}
    />
  );
}

function Pct({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <input
      inputMode="decimal"
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => onChange(Number.parseFloat(e.target.value) || 0)}
      className={`${INPUT} text-right font-mono`}
    />
  );
}

function Stepper({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div>
      <div className="mb-1 text-[12px] font-semibold uppercase tracking-wider text-sand-500">{label}</div>
      <div className="flex items-center justify-between rounded-lg border-[1.5px] border-sand-300 px-2 py-1.5">
        <button type="button" aria-label={`Fewer ${label}`} onClick={() => onChange(Math.max(0, value - 1))} className="h-8 w-8 rounded-md border border-sand-200 bg-sand-50 text-lg text-green-700">−</button>
        <span className="font-mono text-[15px] font-semibold">{value}</span>
        <button type="button" aria-label={`More ${label}`} onClick={() => onChange(value + 1)} className="h-8 w-8 rounded-md bg-green-800 text-lg text-white">+</button>
      </div>
    </div>
  );
}

function Row({ label, value, strong, tone }: { label: string; value: string; strong?: boolean; tone?: string }) {
  return (
    <div className={`flex items-center justify-between py-1.5 ${strong ? 'border-t border-sand-200 pt-2.5' : ''}`}>
      <span className={`text-[13.5px] ${strong ? 'font-bold text-sand-ink' : 'text-sand-600'}`}>{label}</span>
      <span className={`font-mono text-[13.5px] ${strong ? 'font-bold' : ''} ${tone ?? 'text-sand-ink'}`}>{value}</span>
    </div>
  );
}

export function FinanceCalculator({ saved }: { saved: SavedCalc[] }) {
  const [i, setI] = useState<FinanceInputs>(defaultInputs);
  const [name, setName] = useState('');
  const [list, setList] = useState<SavedCalc[]>(saved);
  const [savedRef, setSavedRef] = useState<string>();
  const [pending, start] = useTransition();

  const b = useMemo(() => computeFinance(i), [i]);
  const set = (patch: Partial<FinanceInputs>): void => setI((p) => ({ ...p, ...patch }));
  const setItem = (id: string, patch: Partial<{ label: string; cents: number; basis: CostBasis }>): void =>
    set({ items: i.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) });
  const cur = i.currency;

  const save = (): void =>
    start(async () => {
      const result = await saveCalculationAction(name, i);
      setList((cur2) => [result, ...cur2]);
      setSavedRef(result.ref);
    });

  return (
    <div className="mx-auto max-w-6xl px-[clamp(16px,4vw,32px)] py-8">
      <div className="mb-6">
        <h1 className="font-serif text-[clamp(1.6rem,3vw,2.1rem)] font-semibold text-sand-ink">Umrah Finance Calculator</h1>
        <p className="mt-1 text-[14px] text-sand-500">Manual costing → selling price, profit and balance. Amounts in {cur}. Internal — admin/finance only.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* ---- inputs ---- */}
        <div className="space-y-6">
          <Card title="Package">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Package name">
                <input value={i.packageName} onChange={(e) => set({ packageName: e.target.value })} placeholder="e.g. Ramadan Premium 14 nights" className={INPUT} />
              </Field>
              <Field label="Type">
                <select value={i.packageType} onChange={(e) => set({ packageType: e.target.value })} className={INPUT}>
                  {PACKAGE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Currency">
                <select value={i.currency} onChange={(e) => set({ currency: e.target.value })} className={INPUT}>
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
            </div>
          </Card>

          <Card title="Travellers / group">
            <div className="grid grid-cols-3 gap-3">
              <Stepper label="Adults" value={i.adults} onChange={(n) => set({ adults: n })} />
              <Stepper label="Children" value={i.children} onChange={(n) => set({ children: n })} />
              <Stepper label="Infants" value={i.infants} onChange={(n) => set({ infants: n })} />
            </div>
            <p className="mt-3 text-[12.5px] text-sand-500">{b.travellers} traveller(s). “Per person” costs are multiplied by this count.</p>
          </Card>

          <Card title="Costs">
            <div className="space-y-2">
              <div className="hidden grid-cols-[1fr_120px_120px_32px] gap-2 px-1 text-[11px] font-bold uppercase tracking-wider text-sand-400 sm:grid">
                <span>Item</span><span className="text-right">Amount</span><span className="text-center">Basis</span><span />
              </div>
              {i.items.map((it) => (
                <div key={it.id} className="grid grid-cols-[1fr_88px_32px] items-center gap-2 sm:grid-cols-[1fr_120px_120px_32px]">
                  <input value={it.label} onChange={(e) => setItem(it.id, { label: e.target.value })} className={INPUT} />
                  <Money cents={it.cents} onChange={(c) => setItem(it.id, { cents: c })} />
                  <select value={it.basis} onChange={(e) => setItem(it.id, { basis: e.target.value as CostBasis })} className={`${INPUT} hidden px-1.5 sm:block`}>
                    <option value="per_person">/ person</option>
                    <option value="total">total</option>
                  </select>
                  <button type="button" aria-label="Remove" onClick={() => set({ items: i.items.filter((x) => x.id !== it.id) })} className="h-9 rounded-md text-[16px] text-sand-400 hover:bg-danger-bg hover:text-danger-fg">×</button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => set({ items: [...i.items, { id: uid(), label: 'New cost', cents: 0, basis: 'total' }] })} className="mt-3 rounded-lg border border-dashed border-sand-300 px-3 py-2 text-[13px] font-semibold text-accent-600 hover:bg-sand-50">+ Add cost</button>
            <div className="mt-3 text-right text-[13px] text-sand-600">Base cost: <span className="font-mono font-bold text-sand-ink">{fmt(b.baseCostCents, cur)}</span></div>
          </Card>

          <Card title="Markup, commission, tax & fees">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Buffer %"><Pct value={i.bufferPercent} onChange={(n) => set({ bufferPercent: n })} /></Field>
              <Field label="Payment fee %"><Pct value={i.paymentFeePercent} onChange={(n) => set({ paymentFeePercent: n })} /></Field>
              <Field label="Markup %"><Pct value={i.markupPercent} onChange={(n) => set({ markupPercent: n })} /></Field>
              <Field label={`Fixed markup (${cur})`}><Money cents={i.fixedMarkupCents} onChange={(c) => set({ fixedMarkupCents: c })} /></Field>
              <Field label="Agent commission %"><Pct value={i.agentCommissionPercent} onChange={(n) => set({ agentCommissionPercent: n })} /></Field>
              <Field label={`Fixed commission (${cur})`}><Money cents={i.agentCommissionFixedCents} onChange={(c) => set({ agentCommissionFixedCents: c })} /></Field>
              <Field label="Tax %"><Pct value={i.taxPercent} onChange={(n) => set({ taxPercent: n })} /></Field>
              <Field label={`Discount (${cur})`}><Money cents={i.discountCents} onChange={(c) => set({ discountCents: c })} /></Field>
              <Field label={`Deposit received (${cur})`}><Money cents={i.depositCents} onChange={(c) => set({ depositCents: c })} /></Field>
            </div>
          </Card>
        </div>

        {/* ---- summary + quote + save ---- */}
        <div className="space-y-6 self-start lg:sticky lg:top-4">
          <Card title="Profit summary">
            <Row label="Base cost" value={fmt(b.baseCostCents, cur)} />
            <Row label={`Buffer (${i.bufferPercent}%)`} value={fmt(b.bufferCents, cur)} />
            <Row label={`Markup`} value={fmt(b.markupCents, cur)} />
            <Row label="Agent commission" value={fmt(b.agentCommissionCents, cur)} />
            <Row label={`Payment fee (${i.paymentFeePercent}%)`} value={fmt(b.paymentFeeCents, cur)} />
            <Row label={`Tax (${i.taxPercent}%)`} value={fmt(b.taxCents, cur)} />
            {b.discountCents > 0 ? <Row label="Discount" value={`− ${fmt(b.discountCents, cur)}`} tone="text-danger-fg" /> : null}
            <Row label="Net cost" value={fmt(b.netCostCents, cur)} />
            <Row label="Selling price" value={fmt(b.sellingPriceCents, cur)} strong />
            <Row label="Profit" value={`${fmt(b.profitCents, cur)} · ${b.marginPct.toFixed(1)}%`} tone="text-success-fg" strong />
            <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-sand-50 p-3 text-center">
              <div><div className="font-mono text-lg font-bold text-green-800">{fmt(b.perPersonCents, cur)}</div><div className="text-[11px] text-sand-500">per person</div></div>
              <div><div className="font-mono text-lg font-bold text-green-800">{fmt(b.balanceDueCents, cur)}</div><div className="text-[11px] text-sand-500">balance due</div></div>
            </div>
          </Card>

          <Card title="Quote / invoice preview">
            <div className="rounded-xl border border-sand-200 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-serif text-lg font-semibold text-sand-ink">{i.packageName || 'Umrah package'}</div>
                  <div className="text-[12px] text-sand-500">{i.packageType} · {b.travellers} traveller(s) · {cur}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[13px] text-sand-500">per person</div>
                  <div className="font-mono text-lg font-bold text-green-800">{fmt(b.perPersonCents, cur)}</div>
                </div>
              </div>
              <div className="mt-3 border-t border-sand-100 pt-3">
                <Row label="Package total" value={fmt(b.sellingPriceCents, cur)} strong />
                <Row label="Deposit received" value={fmt(b.depositCents, cur)} />
                <Row label="Balance due" value={fmt(b.balanceDueCents, cur)} strong tone="text-green-800" />
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-sand-500">Prices in {cur}. Quote valid 7 days. Deposit secures the booking; balance due before departure. Subject to availability and final confirmation.</p>
            </div>
            <button type="button" onClick={() => typeof window !== 'undefined' && window.print()} className="mt-3 w-full rounded-xl border border-sand-300 bg-white py-2.5 text-[13.5px] font-semibold text-sand-700 hover:bg-sand-50">Print / save PDF</button>
          </Card>

          <Card title="Save calculation">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (defaults to package name)" className={INPUT} />
            <button type="button" onClick={save} disabled={pending} className="mt-3 w-full rounded-xl bg-green-800 py-2.5 text-sm font-semibold text-white transition-[transform,background-color] duration-fast hover:bg-green-700 active:scale-[0.98] disabled:opacity-50">
              {pending ? 'Saving…' : 'Save to database'}
            </button>
            {savedRef ? <p className="mt-2 text-center text-[12.5px] font-semibold text-success-fg">Saved · {savedRef}</p> : null}
          </Card>
        </div>
      </div>

      {/* ---- saved list ---- */}
      {list.length > 0 ? (
        <div className="mt-8">
          <h2 className="mb-3 text-[15px] font-bold text-sand-ink">Saved calculations</h2>
          <div className="overflow-x-auto rounded-2xl border border-sand-200 bg-white">
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className="border-b border-sand-100 text-left text-[11px] uppercase tracking-wider text-sand-400">
                  <th className="px-4 py-2.5">Ref</th><th className="px-4 py-2.5">Package</th><th className="px-4 py-2.5">Pax</th>
                  <th className="px-4 py-2.5 text-right">Selling</th><th className="px-4 py-2.5 text-right">Profit</th>
                </tr>
              </thead>
              <tbody>
                {list.map((s) => (
                  <tr key={s.id} className="border-t border-sand-100">
                    <td className="px-4 py-2.5 font-mono text-[12.5px] text-sand-500">{s.ref}</td>
                    <td className="px-4 py-2.5 font-semibold">{s.name}</td>
                    <td className="px-4 py-2.5">{s.travellers}</td>
                    <td className="px-4 py-2.5 text-right font-mono">{fmt(s.sellingPriceCents, s.currency)}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-success-fg">{fmt(s.profitCents, s.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
