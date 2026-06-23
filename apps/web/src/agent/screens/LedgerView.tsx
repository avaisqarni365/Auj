'use client';

import { useMemo, useState } from 'react';
import type { JournalEntry } from '@auj/payments';
import { displayFromEur } from '../../currency';
import { availableToBook, filterRows, ledgerHealth, usedOf, walletRows, type TxFilter } from './ledger-derive';

// Payments & Ledger (AUJ Payments Ledger.dc.html): cinematic wallet + double-entry health +
// filtered transactions, driven by the agency's real wallet balance/credit and ledger entries.

export interface LedgerViewProps {
  agencyName: string;
  balance: number; // EUR minor units; negative = credit consumed
  creditLimit: number; // EUR minor units
  entries: JournalEntry[];
  account: string; // wallet account id, e.g. wallet:<agentId>
}

export function LedgerView({ agencyName, balance, creditLimit, entries, account }: LedgerViewProps) {
  const [cur, setCur] = useState<'EUR' | 'PKR'>('EUR');
  const [filter, setFilter] = useState<TxFilter>('all');
  const f = (eurMinor: number): string => displayFromEur(eurMinor, cur);

  const used = usedOf(balance);
  const available = availableToBook(balance, creditLimit);

  // Double-entry health: Σ debit = Σ credit across every posting (pure helper).
  const { debitSum, creditSum, balanced } = useMemo(() => ledgerHealth(entries), [entries]);

  const rows = useMemo(() => walletRows(entries, account), [entries, account]);
  const shown = filterRows(rows, filter);

  const curBtn = (c: 'EUR' | 'PKR') => (
    <button
      key={c}
      type="button"
      onClick={() => setCur(c)}
      className={`rounded-md px-2.5 py-1 font-mono text-[11px] font-semibold transition-colors ${cur === c ? 'bg-gold text-green-950' : 'text-green-100/70 hover:text-white'}`}
    >
      {c}
    </button>
  );
  const filterBtn = (k: typeof filter, label: string) => (
    <button
      key={k}
      type="button"
      onClick={() => setFilter(k)}
      className={`rounded-md px-3 py-1.5 text-[11.5px] font-semibold transition-colors ${filter === k ? 'bg-green-800 text-white' : 'text-sand-700 hover:bg-sand-100'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="grid gap-[18px]">
      {/* gateway pills */}
      <div className="flex flex-wrap gap-2">
        {['Stripe · EUR', 'Safepay · PKR'].map((g) => (
          <span key={g} className="inline-flex items-center gap-2 rounded-full border border-sand-200 bg-white px-3 py-1.5 text-[11.5px] font-semibold text-sand-700">
            <span className="h-[7px] w-[7px] rounded-full bg-success" /> {g}
          </span>
        ))}
      </div>

      <div className="grid gap-[18px] md:grid-cols-2">
        {/* wallet */}
        <div className="rounded-2xl border border-green-900 bg-gradient-to-br from-green-800 to-green-950 p-5 text-green-50">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold">Agent wallet · {agencyName}</span>
            <span className="flex gap-1 rounded-lg bg-black/20 p-0.5">{curBtn('EUR')}{curBtn('PKR')}</span>
          </div>
          <div className="mt-3.5 font-mono text-4xl font-semibold">{f(available)}</div>
          <div className="text-xs text-green-100/70">available to book</div>
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {[['Balance', balance], ['Credit', creditLimit], ['Used', used]].map(([label, v]) => (
              <div key={label as string} className="rounded-xl border border-white/15 bg-white/[0.08] p-2.5">
                <div className="text-[10.5px] text-green-100/70">{label}</div>
                <div className={`mt-0.5 font-mono text-sm font-semibold ${label === 'Used' ? 'text-gold' : ''}`}>{f(v as number)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ledger health */}
        <div className="flex flex-col rounded-2xl border border-sand-200 bg-white p-5">
          <div className="mb-1 text-base font-semibold text-sand-ink">Ledger health</div>
          <div className="mb-4 text-[12.5px] text-sand-500">Double-entry — debits must equal credits.</div>
          <div className={`flex items-center gap-3.5 rounded-2xl border px-4 py-3.5 ${balanced ? 'border-green-100 bg-green-50' : 'border-danger-bg bg-danger-bg'}`}>
            <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl font-bold text-white ${balanced ? 'bg-green-800' : 'bg-danger'}`}>{balanced ? '=' : '≠'}</span>
            <div className="flex-1">
              <div className={`text-sm font-semibold ${balanced ? 'text-green-800' : 'text-danger-fg'}`}>{balanced ? 'Balanced' : 'Out of balance'}</div>
              <div className="font-mono text-[12px] text-sand-500">Σ debit {displayFromEur(debitSum, 'EUR')} {balanced ? '=' : '≠'} Σ credit {displayFromEur(creditSum, 'EUR')}</div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[12.5px] text-sand-500">
            <span>Reconciled to gateway webhooks</span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-green-800"><span className="h-2 w-2 rounded-full bg-green-600" /> up to date</span>
          </div>
        </div>
      </div>

      {/* transactions */}
      <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white">
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <div className="text-base font-semibold text-sand-ink">Recent transactions</div>
          <div className="flex gap-1 rounded-lg bg-sand-100 p-0.5">{filterBtn('all', 'All')}{filterBtn('payments', 'Payments')}{filterBtn('refunds', 'Refunds')}</div>
        </div>
        {shown.length === 0 ? (
          <div className="border-t border-sand-100 px-4 py-8 text-center text-sm text-sand-500">No transactions yet — book a group or top up the wallet.</div>
        ) : (
          shown.map((r, idx) => (
            <div key={`${r.ref}-${idx}`} className="flex items-center gap-3 border-t border-sand-100 px-4 py-3">
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-[10px] text-base font-bold ${r.refund ? 'bg-danger-bg text-danger' : r.amount >= 0 ? 'bg-green-100 text-green-800' : 'bg-warning-bg text-warning-fg'}`}>
                {r.refund ? '↩' : r.amount >= 0 ? '+' : '↓'}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13.5px] font-semibold text-sand-ink">{r.label}</div>
                <div className="font-mono text-[11.5px] text-sand-500">{r.ref.slice(0, 16)} · {r.kind}</div>
              </div>
              <span className={`whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-semibold ${r.refund ? 'bg-danger-bg text-danger-fg' : 'bg-green-100 text-green-800'}`}>{r.refund ? 'Refunded' : r.amount >= 0 ? 'Settled' : 'Captured'}</span>
              <span className={`w-28 text-right font-mono text-sm font-bold ${r.amount < 0 ? 'text-danger' : 'text-sand-ink'}`}>{r.amount < 0 ? '−' : ''}{f(Math.abs(r.amount))}</span>
            </div>
          ))
        )}
      </div>

      <div className="flex items-start gap-2.5 rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-[12.5px] leading-relaxed text-sand-700">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-green-800 text-[13px] text-white">i</span>
        <span>Amounts in minor units; one currency per ledger entry. No card numbers stored — gateway tokenization only, idempotency keys on capture. Booking calls payments on <span className="font-mono">confirm</span>; payments never call connectors.</span>
      </div>
    </div>
  );
}
