'use client';

import { useMemo, useState, useTransition } from 'react';
import { buildAssessment, toCents, type Channel } from './calc';
import { dealKind, type Deal, type DealLine } from './deals-types';
import { deleteDealAction, listDealsAction, saveDealAction } from './deals-actions';
import { formatMoney, pkrIndicative } from '../currency';
import { ScreenFrame } from '../components/ScreenFrame';

const INPUT = 'rounded-lg border-[1.5px] border-sand-300 bg-white px-3 py-2 text-[14px] focus:border-green-700 focus:outline-none';
const eur = (cents: number): string => formatMoney({ amount: cents, currency: 'EUR' });
const pkr = (cents: number): string => pkrIndicative({ amount: cents, currency: 'EUR' });

function newId(): string {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    /* ignore */
  }
  return `line-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

function defaultCosts(): DealLine[] {
  return [
    { id: 'flights', label: 'Flights', cents: 0 },
    { id: 'visa', label: 'Visa', cents: 0 },
    { id: 'hotels', label: 'Hotels', cents: 0 },
    { id: 'transport', label: 'Transport', cents: 0 },
  ];
}

function Money({ cents, onChange }: { cents: number; onChange: (c: number) => void }) {
  const [s, setS] = useState(cents ? (cents / 100).toString() : '');
  return (
    <input
      inputMode="decimal"
      value={s}
      onChange={(e) => { setS(e.target.value); onChange(toCents(e.target.value)); }}
      placeholder="0.00"
      className={`${INPUT} w-28 text-right font-mono`}
    />
  );
}

function Dial({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-semibold uppercase tracking-wider text-sand-500">{label}</span>
      <input inputMode="decimal" value={value} onChange={(e) => onChange(Number.parseFloat(e.target.value) || 0)} className={`${INPUT} w-full text-right font-mono`} />
    </label>
  );
}

export function FinanceSelfAssessment({ deals: initialDeals }: { deals: Deal[] }) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [currentId, setCurrentId] = useState<string | undefined>();
  const [name, setName] = useState('New deal');
  const [channel, setChannel] = useState<Channel>('B2C');
  const [pax, setPax] = useState(1);
  const [bufferPct, setBufferPct] = useState(5);
  const [markupPct, setMarkupPct] = useState(12);
  const [feePct, setFeePct] = useState(2);
  const [commissionPct, setCommissionPct] = useState(8);
  const [costs, setCosts] = useState<DealLine[]>(defaultCosts);
  const [savedMsg, setSavedMsg] = useState('');
  const [pending, start] = useTransition();

  const a = useMemo(
    () => buildAssessment({ costsCents: costs.map((c) => c.cents), bufferPct, markupPct, feePct, commissionPct, channel, pax }),
    [costs, bufferPct, markupPct, feePct, commissionPct, channel, pax],
  );

  // Deal-bar metadata (cosmetic, matches the prototype): a stable DEAL-YY-NNN reference, the
  // IND/GRP type chip and a "ref · pax · channel" subline.
  const dealSeq = currentId ? deals.findIndex((x) => x.id === currentId) + 1 : deals.length + 1;
  const dealYear = (currentId ? deals.find((x) => x.id === currentId)?.createdAt : undefined)?.slice(2, 4) || '26';
  const dealRef = `DEAL-${dealYear}-${String(Math.max(1, dealSeq)).padStart(3, '0')}`;
  const kind = dealKind(pax);

  const pick = (id: string): void => {
    const d = deals.find((x) => x.id === id);
    if (!d) return;
    setCurrentId(d.id); setName(d.name); setChannel(d.channel); setPax(d.pax);
    setBufferPct(d.bufferPct); setMarkupPct(d.markupPct); setFeePct(d.feePct); setCommissionPct(d.commissionPct);
    setCosts(d.costs); setSavedMsg('');
  };
  const reset = (): void => {
    setCurrentId(undefined); setName('New deal'); setChannel('B2C'); setPax(1);
    setBufferPct(5); setMarkupPct(12); setFeePct(2); setCommissionPct(8); setCosts(defaultCosts()); setSavedMsg('');
  };
  const save = (): void =>
    start(async () => {
      const d = await saveDealAction({ id: currentId, name: name.trim() || 'Untitled deal', channel, pax, bufferPct, markupPct, feePct, commissionPct, costs });
      setCurrentId(d.id);
      setDeals(await listDealsAction());
      setSavedMsg(`Saved · ${d.name}`);
    });
  const remove = (): void =>
    start(async () => {
      if (currentId) await deleteDealAction(currentId);
      setDeals(await listDealsAction());
      reset();
    });
  const setLine = (id: string, patch: Partial<DealLine>): void => setCosts((c) => c.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  // Waterfall segments of the selling price.
  const segs: Array<[string, number, string]> = [
    ['Base', a.baseCents, 'bg-green-800'],
    ['Buffer', a.bufferCents, 'bg-green-600'],
    ['Markup', a.markupCents, 'bg-gold'],
    ['Fee', a.feeCents, 'bg-accent-600'],
    ['Commission', a.commissionCents, 'bg-sand-400'],
  ];
  const total = Math.max(1, a.sellingCents);

  return (
    <ScreenFrame label="📊 Finance — self-assessment" maxWidth="max-w-5xl">
      <p className="mb-6 text-[14px] text-sand-500">Money in / out / profit per deal. Charged in EUR · PKR indicative. Internal — admin only.</p>

      {/* deal bar */}
      <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-sand-200 bg-white p-3">
        <select value={currentId ?? ''} onChange={(e) => (e.target.value ? pick(e.target.value) : reset())} className={`${INPUT} min-w-[180px]`}>
          <option value="">+ New deal</option>
          {deals.map((d) => <option key={d.id} value={d.id}>{d.name} · {dealKind(d.pax)}</option>)}
        </select>
        <span aria-hidden title={kind === 'GRP' ? 'Group deal' : 'Individual deal'} className="grid h-9 w-11 flex-none place-items-center rounded-lg bg-green-100 font-mono text-[11px] font-bold text-green-800">{kind}</span>
        <div className="flex min-w-[180px] flex-1 flex-col">
          <input value={name} onChange={(e) => setName(e.target.value)} className={`${INPUT} w-full`} placeholder="Deal name (e.g. Khan family · Ramadan)" />
          <span className="mt-1 font-mono text-[10.5px] text-sand-400">{dealRef} · {pax} pax · {channel}</span>
        </div>
        <button type="button" onClick={save} disabled={pending} className="rounded-lg bg-green-800 px-4 py-2 text-[13px] font-semibold text-white hover:bg-green-700 active:scale-[0.98] disabled:opacity-50">{pending ? 'Saving…' : 'Save'}</button>
        <button type="button" onClick={reset} className="rounded-lg border border-sand-300 bg-white px-3 py-2 text-[13px] font-semibold text-sand-600 hover:bg-sand-50">New</button>
        {currentId ? <button type="button" onClick={remove} className="rounded-lg px-3 py-2 text-[13px] font-semibold text-danger-fg hover:bg-danger-bg">Delete</button> : null}
        {savedMsg ? <span className="text-[12.5px] font-semibold text-success-fg">{savedMsg}</span> : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* inputs */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-sand-200 bg-white p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex gap-1 rounded-xl bg-sand-100 p-1">
                {(['B2C', 'B2B'] as const).map((c) => (
                  <button key={c} type="button" onClick={() => setChannel(c)} className={`rounded-lg px-4 py-1.5 text-[13px] font-semibold ${channel === c ? 'bg-white text-green-800 shadow-sm' : 'text-sand-500'}`}>{c}</button>
                ))}
              </div>
              <label className="flex items-center gap-2 text-[13px] text-sand-600">
                Pilgrims
                <input type="number" min={1} value={pax} onChange={(e) => setPax(Math.max(1, Number.parseInt(e.target.value, 10) || 1))} className={`${INPUT} w-20 text-center font-mono`} />
              </label>
            </div>
            <div className="text-[12px] font-semibold uppercase tracking-wider text-sand-500">Costs</div>
            <div className="mt-2 space-y-2">
              {costs.map((l) => (
                <div key={l.id} className="flex items-center gap-2">
                  <input value={l.label} onChange={(e) => setLine(l.id, { label: e.target.value })} className={`${INPUT} flex-1`} />
                  <Money cents={l.cents} onChange={(c) => setLine(l.id, { cents: c })} />
                  <button type="button" aria-label="Remove" onClick={() => setCosts((c) => c.filter((x) => x.id !== l.id))} className="h-9 rounded-md px-2 text-sand-400 hover:bg-danger-bg hover:text-danger-fg">×</button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setCosts((c) => [...c, { id: newId(), label: 'New cost', cents: 0 }])} className="mt-2 rounded-lg border border-dashed border-sand-300 px-3 py-1.5 text-[13px] font-semibold text-accent-600 hover:bg-sand-50">+ Add cost</button>
          </div>

          <div className="rounded-2xl border border-sand-200 bg-white p-5">
            <div className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-sand-500">Pricing dials</div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Dial label="Buffer %" value={bufferPct} onChange={setBufferPct} />
              <Dial label="Markup %" value={markupPct} onChange={setMarkupPct} />
              <Dial label="Fee %" value={feePct} onChange={setFeePct} />
              {channel === 'B2B' ? <Dial label="Comm. %" value={commissionPct} onChange={setCommissionPct} /> : null}
            </div>
          </div>
        </div>

        {/* summary */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-sand-200 bg-white p-3 text-center"><div className="text-[11px] text-sand-500">In</div><div className="font-mono text-[15px] font-bold text-green-800">{eur(a.sellingCents)}</div></div>
            <div className="rounded-2xl border border-sand-200 bg-white p-3 text-center"><div className="text-[11px] text-sand-500">Out</div><div className="font-mono text-[15px] font-bold text-sand-ink">{eur(a.sellingCents - a.markupCents)}</div></div>
            <div className="rounded-2xl border border-green-100 bg-green-50 p-3 text-center"><div className="text-[11px] text-sand-500">Profit</div><div className="font-mono text-[15px] font-bold text-success-fg">{eur(a.profitCents)}</div></div>
          </div>

          <div className="rounded-2xl border border-sand-200 bg-white p-5">
            <div className="mb-2 flex items-center justify-between text-[12px] font-semibold uppercase tracking-wider text-sand-500">
              <span>Per-pilgrim selling</span><span>{a.marginPct.toFixed(1)}% margin</span>
            </div>
            <div className="font-mono text-2xl font-bold text-green-800">{eur(a.perPilgrimCents)}</div>
            <div className="font-mono text-[12px] text-sand-500">{pkr(a.perPilgrimCents)} indicative</div>

            {/* waterfall */}
            <div className="mt-4 flex h-3 overflow-hidden rounded-full">
              {segs.filter(([, v]) => v > 0).map(([label, v, cls]) => (
                <div key={label} className={cls} style={{ width: `${(v / total) * 100}%` }} title={`${label}: ${eur(v)}`} />
              ))}
            </div>
            <div className="mt-3 grid gap-1.5">
              {segs.map(([label, v, cls]) => (
                <div key={label} className="flex items-center justify-between text-[12.5px]">
                  <span className="inline-flex items-center gap-1.5 text-sand-600"><span className={`h-2.5 w-2.5 rounded-sm ${cls}`} /> {label}</span>
                  <span className="font-mono text-sand-ink">{eur(v)}</span>
                </div>
              ))}
              <div className="mt-1 flex items-center justify-between border-t border-sand-200 pt-1.5 text-[13px] font-bold">
                <span>Selling</span><span className="font-mono text-green-800">{eur(a.sellingCents)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScreenFrame>
  );
}
