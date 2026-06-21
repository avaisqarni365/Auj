'use client';

import { useEffect, useState, useTransition } from 'react';
import { formatMoney } from '../money';
import {
  deleteMarkupAction,
  listMarkupsAction,
  markupPreviewAction,
  saveMarkupAction,
  toggleMarkupAction,
  type TierPreview,
} from '../actions';
import type { AgentTier, MarkupRule } from '../domain';

const TIERS: AgentTier[] = ['BRONZE', 'SILVER', 'GOLD'];
const PRODUCTS: MarkupRule['productKind'][] = ['HOTEL', 'TRANSPORT', 'GROUND', 'FLIGHT', 'CATERING'];

export function MarkupsPanel() {
  const [rules, setRules] = useState<MarkupRule[]>([]);
  const [preview, setPreview] = useState<TierPreview[]>([]);
  const [netEur, setNetEur] = useState('1000');
  const [pending, start] = useTransition();

  // draft for a new rule
  const [tier, setTier] = useState<'any' | AgentTier>('any');
  const [product, setProduct] = useState<'any' | NonNullable<MarkupRule['productKind']>>('any');
  const [kind, setKind] = useState<MarkupRule['kind']>('PERCENT');
  const [value, setValue] = useState('12');

  const netMinor = Math.round((parseFloat(netEur) || 0) * 100);
  const refresh = (): void => {
    void listMarkupsAction().then(setRules);
    void markupPreviewAction(netMinor).then(setPreview);
  };
  useEffect(refresh, []);
  useEffect(() => {
    void markupPreviewAction(netMinor).then(setPreview);
  }, [netMinor, rules]);

  const add = (): void => start(async () => {
    await saveMarkupAction({
      ...(tier !== 'any' ? { tier } : {}),
      ...(product !== 'any' ? { productKind: product } : {}),
      kind,
      value: kind === 'FIXED' ? Math.round((parseFloat(value) || 0) * 100) : Math.round(parseFloat(value) || 0),
      enabled: true,
    });
    refresh();
  });
  const toggle = (r: MarkupRule): void => start(async () => {
    await toggleMarkupAction(r.id, !r.enabled);
    refresh();
  });
  const remove = (id: string): void => start(async () => {
    await deleteMarkupAction(id);
    refresh();
  });

  return (
    <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
      {/* rules + add */}
      <div className="rounded-2xl border border-sand-200 bg-white p-5 shadow-sm">
        <div className="text-sm font-bold text-sand-ink">Markup rules</div>
        <div className="text-xs text-sand-500">Most specific enabled rule wins (tier+product &gt; tier &gt; product &gt; any).</div>

        <ul className="mt-3 grid gap-2">
          {rules.length ? (
            rules.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-2 rounded-xl border border-sand-200 bg-white p-3 text-[13px]">
                <div>
                  <span className="font-semibold text-sand-800">{r.tier ?? 'Any tier'}</span>
                  <span className="text-sand-500"> · {r.productKind ?? 'Any product'}</span>
                  <span className="ms-2 font-mono font-semibold text-success-fg">
                    {r.kind === 'PERCENT' ? `${r.value}%` : formatMoney({ amount: r.value, currency: 'EUR' })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggle(r)}
                    aria-pressed={r.enabled}
                    className={`relative inline-block h-[18px] w-8 rounded-full ${r.enabled ? 'bg-success' : 'bg-sand-300'}`}
                    aria-label="Toggle rule"
                  >
                    <span className={`absolute top-0.5 h-[14px] w-[14px] rounded-full bg-white transition-[left] ${r.enabled ? 'left-[14px]' : 'left-0.5'}`} />
                  </button>
                  <button type="button" onClick={() => remove(r.id)} className="text-sand-400 hover:text-danger-fg" aria-label="Delete rule">✕</button>
                </div>
              </li>
            ))
          ) : (
            <li className="text-[13px] text-sand-500">No markup rules yet — add one below.</li>
          )}
        </ul>

        <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-sand-100 pt-3">
          <label className="text-[11px] font-semibold text-sand-500">
            Tier
            <select value={tier} onChange={(e) => setTier(e.target.value as 'any' | AgentTier)} className="mt-0.5 block rounded-lg border border-sand-200 bg-white px-2 py-1.5 text-[13px]">
              <option value="any">Any</option>
              {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className="text-[11px] font-semibold text-sand-500">
            Product
            <select value={product} onChange={(e) => setProduct(e.target.value as 'any' | NonNullable<MarkupRule['productKind']>)} className="mt-0.5 block rounded-lg border border-sand-200 bg-white px-2 py-1.5 text-[13px]">
              <option value="any">Any</option>
              {PRODUCTS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
          <label className="text-[11px] font-semibold text-sand-500">
            Type
            <select value={kind} onChange={(e) => setKind(e.target.value as MarkupRule['kind'])} className="mt-0.5 block rounded-lg border border-sand-200 bg-white px-2 py-1.5 text-[13px]">
              <option value="PERCENT">Percent</option>
              <option value="FIXED">Fixed €</option>
            </select>
          </label>
          <label className="text-[11px] font-semibold text-sand-500">
            {kind === 'PERCENT' ? 'Percent' : 'Amount €'}
            <input value={value} inputMode="decimal" onChange={(e) => setValue(e.target.value)} className="mt-0.5 block w-20 rounded-lg border border-sand-200 bg-sand-50 px-2 py-1.5 text-right font-mono text-[13px]" />
          </label>
          <button type="button" onClick={add} disabled={pending} className="rounded-lg bg-green-700 px-4 py-2 text-[13px] font-semibold text-white active:scale-[0.98] disabled:opacity-40">
            Add rule
          </button>
        </div>
      </div>

      {/* net → sell preview per tier */}
      <div className="rounded-2xl border border-sand-200 bg-white p-5 shadow-sm">
        <div className="text-sm font-bold text-sand-ink">Net → sell preview</div>
        <div className="mt-2 flex items-center gap-2 text-[13px]">
          <span className="text-sand-500">Hotel net €</span>
          <input value={netEur} inputMode="decimal" onChange={(e) => setNetEur(e.target.value)} className="w-24 rounded-lg border border-sand-200 bg-sand-50 px-2 py-1.5 text-right font-mono text-[13px]" />
        </div>
        <div className="mt-3 grid gap-2">
          {preview.map((p) => (
            <div key={p.tier} className="rounded-xl border border-sand-200 bg-sand-50 p-3">
              <div className="flex items-center justify-between text-[12.5px]">
                <span className="font-semibold text-sand-700">{p.tier}</span>
                <span className="font-mono text-sand-500">+{formatMoney({ amount: p.markupMinor, currency: 'EUR' })}</span>
              </div>
              <div className="mt-0.5 font-mono text-[15px] font-semibold text-green-800">{formatMoney({ amount: p.sellMinor, currency: 'EUR' })}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
