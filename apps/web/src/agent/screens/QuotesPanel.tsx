'use client';

import { useEffect, useState, useTransition } from 'react';
import type { Money } from '@auj/contracts';
import { formatMoney } from '../money';
import { convertQuoteAction, listQuotesAction, saveQuoteAction } from '../actions';
import type { QuoteRecord } from '../agent-db';

interface DraftLine {
  label: string;
  amount: string; // EUR major, as typed
}

const eur = (minor: number): Money => ({ amount: minor, currency: 'EUR' });

export function QuotesPanel() {
  const [lines, setLines] = useState<DraftLine[]>([{ label: '', amount: '' }]);
  const [markupPct, setMarkupPct] = useState('12');
  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [copied, setCopied] = useState<string>();
  const [pending, start] = useTransition();

  const refresh = (): void => void listQuotesAction().then(setQuotes);
  useEffect(refresh, []);

  const netMinor = lines.reduce((s, l) => s + Math.round((parseFloat(l.amount) || 0) * 100), 0);
  const pct = Math.max(0, Math.min(100, parseInt(markupPct, 10) || 0));
  const markupMinor = Math.round((netMinor * pct) / 100);
  const sellMinor = netMinor + markupMinor;

  const setLine = (i: number, patch: Partial<DraftLine>): void => setLines((cur) => cur.map((l, k) => (k === i ? { ...l, ...patch } : l)));
  const addLine = (): void => setLines((cur) => [...cur, { label: '', amount: '' }]);
  const removeLine = (i: number): void => setLines((cur) => (cur.length > 1 ? cur.filter((_, k) => k !== i) : cur));

  const save = (): void => {
    const payload = lines
      .filter((l) => l.label.trim() && (parseFloat(l.amount) || 0) > 0)
      .map((l) => ({ label: l.label.trim(), net: eur(Math.round((parseFloat(l.amount) || 0) * 100)) }));
    if (!payload.length) return;
    start(async () => {
      await saveQuoteAction({ lines: payload, markupPct: pct });
      setLines([{ label: '', amount: '' }]);
      refresh();
    });
  };

  const convert = (id: string): void => start(async () => {
    await convertQuoteAction(id);
    refresh();
  });

  const share = (q: QuoteRecord): void => {
    const url = `${window.location.origin}/agent/quote/${q.ref}`;
    void navigator.clipboard?.writeText(url).then(() => {
      setCopied(q.id);
      setTimeout(() => setCopied(undefined), 1500);
    });
  };

  return (
    <div className="grid gap-4">
      {/* builder */}
      <div className="rounded-2xl border border-sand-200 bg-white p-4 shadow-sm">
        <div className="grid gap-2">
          {lines.map((l, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={l.label}
                onChange={(e) => setLine(i, { label: e.target.value })}
                placeholder="Line item (e.g. 5★ hotel, 7 nights)"
                className="min-w-0 flex-1 rounded-lg border border-sand-200 bg-sand-50 px-3 py-2 text-[13.5px] outline-none focus:border-accent-600 focus:shadow-focus"
              />
              <div className="flex items-center rounded-lg border border-sand-200 bg-sand-50 px-2">
                <span className="text-[13px] text-sand-400">€</span>
                <input
                  value={l.amount}
                  inputMode="decimal"
                  onChange={(e) => setLine(i, { amount: e.target.value })}
                  placeholder="0.00"
                  className="w-24 bg-transparent px-1 py-2 text-right font-mono text-[13.5px] outline-none"
                />
              </div>
              <button type="button" onClick={() => removeLine(i)} className="px-2 text-sand-400 hover:text-danger-fg" aria-label="Remove line">
                ✕
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addLine} className="mt-2 text-[12.5px] font-semibold text-accent-600 hover:underline">
          + Add line
        </button>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-sand-100 pt-3">
          <label className="flex items-center gap-2 text-[13px] text-sand-600">
            Markup
            <input
              value={markupPct}
              inputMode="numeric"
              onChange={(e) => setMarkupPct(e.target.value)}
              className="w-14 rounded-lg border border-sand-200 bg-sand-50 px-2 py-1.5 text-right font-mono text-[13px] outline-none focus:border-accent-600"
            />
            %
          </label>
          <div className="text-[13px] text-sand-600">
            Net <span className="font-mono font-semibold text-sand-800">{formatMoney(eur(netMinor))}</span> + markup{' '}
            <span className="font-mono font-semibold text-warning-fg">{formatMoney(eur(markupMinor))}</span> ={' '}
            <span className="font-mono font-semibold text-green-800">{formatMoney(eur(sellMinor))}</span>
          </div>
          <button
            type="button"
            onClick={save}
            disabled={pending || netMinor === 0}
            className="rounded-lg bg-green-700 px-4 py-2 text-[13.5px] font-semibold text-white transition-transform duration-fast active:scale-[0.98] disabled:opacity-40"
          >
            Save quote
          </button>
        </div>
      </div>

      {/* saved quotes */}
      {quotes.length ? (
        <ul className="grid gap-2">
          {quotes.map((q) => (
            <li key={q.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sand-200 bg-white p-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[13px] font-bold text-sand-800">{q.ref}</span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                      q.status === 'CONVERTED' ? 'bg-green-100 text-green-800' : 'bg-accent-100 text-accent-700'
                    }`}
                  >
                    {q.status}
                  </span>
                </div>
                <div className="mt-0.5 text-[12.5px] text-sand-500">
                  {q.lines.length} items · sell{' '}
                  <span className="font-mono font-semibold text-green-800">{formatMoney(eur(q.sellMinor))}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => share(q)} className="rounded-lg border border-sand-300 bg-white px-3 py-1.5 text-[12.5px] font-semibold text-accent-700 active:scale-[0.98]">
                  {copied === q.id ? 'Copied ✓' : 'Share link'}
                </button>
                {q.status !== 'CONVERTED' ? (
                  <button type="button" onClick={() => convert(q.id)} disabled={pending} className="rounded-lg bg-green-700 px-3 py-1.5 text-[12.5px] font-semibold text-white active:scale-[0.98] disabled:opacity-40">
                    Convert to booking
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[13px] text-sand-500">No quotes yet — build one above and share it with your customer.</p>
      )}
    </div>
  );
}
