'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { clampPax, forecast, SCEN_LABEL, type Scenario } from './predict';
import { toCents } from './calc';
import { saveDealAction } from './deals-actions';
import { formatMoney, pkrIndicative } from '../currency';

const INPUT = 'rounded-lg border-[1.5px] border-sand-300 bg-white px-3 py-2 text-[14px] focus:border-green-700 focus:outline-none';
const eur = (c: number): string => formatMoney({ amount: c, currency: 'EUR' });
const pkr = (c: number): string => pkrIndicative({ amount: c, currency: 'EUR' });
const COLORS: Record<string, string> = { flights: 'bg-green-800', hotels: 'bg-green-600', transport: 'bg-accent-600', visa: 'bg-gold', ziyarat: 'bg-green-500', food: 'bg-sand-400' };

function Money({ cents, onChange, w = 'w-28' }: { cents: number; onChange: (c: number) => void; w?: string }) {
  const [s, setS] = useState(cents ? (cents / 100).toString() : '');
  return <input inputMode="decimal" value={s} onChange={(e) => { setS(e.target.value); onChange(toCents(e.target.value)); }} placeholder="0.00" className={`${INPUT} ${w} text-right font-mono`} />;
}
function Num({ value, onChange, w = 'w-20' }: { value: number; onChange: (n: number) => void; w?: string }) {
  return <input inputMode="numeric" value={value} onChange={(e) => onChange(Number.parseInt(e.target.value, 10) || 0)} className={`${INPUT} ${w} text-center font-mono`} />;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="flex items-center justify-between gap-3 py-1"><span className="text-[13.5px] text-sand-700">{label}</span>{children}</label>;
}

export function PredictiveAnalysis() {
  const [pax, setPax] = useState(80);
  const [scen, setScen] = useState<Scenario>('normal');
  const [flightEach, setFlightEach] = useState(toCents(520));
  const [hotelNight, setHotelNight] = useState(toCents(110));
  const [nights, setNights] = useState(12);
  const [roomShare, setRoomShare] = useState(4);
  const [transport, setTransport] = useState(toCents(4000));
  const [visaEach, setVisaEach] = useState(toCents(120));
  const [ziyaratEach, setZiyaratEach] = useState(toCents(60));
  const [foodDay, setFoodDay] = useState(toCents(18));
  const [bufferPct, setBufferPct] = useState(5);
  const [markupPct, setMarkupPct] = useState(12);
  const [feePct, setFeePct] = useState(2);
  const [savedMsg, setSavedMsg] = useState('');
  const [pending, start] = useTransition();

  const f = useMemo(
    () => forecast({ flightEachCents: flightEach, hotelNightCents: hotelNight, nights, roomShare, transportCents: transport, visaEachCents: visaEach, ziyaratEachCents: ziyaratEach, foodDayCents: foodDay }, pax, scen, { bufferPct, markupPct, feePct }),
    [flightEach, hotelNight, nights, roomShare, transport, visaEach, ziyaratEach, foodDay, pax, scen, bufferPct, markupPct, feePct],
  );
  const total = Math.max(1, f.grandCents);

  const saveAsDeal = (): void =>
    start(async () => {
      const d = await saveDealAction({
        name: `Forecast · ${clampPax(pax)} pax · ${SCEN_LABEL[scen]}`,
        channel: 'B2C', pax: clampPax(pax), bufferPct, markupPct, feePct, commissionPct: 0,
        costs: f.lines.map((l) => ({ id: l.key, label: l.label, cents: l.groupCents })),
      });
      setSavedMsg(`Saved “${d.name}” to the deal planner.`);
    });

  return (
    <div className="mx-auto max-w-5xl px-[clamp(16px,4vw,32px)] py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-[clamp(1.6rem,3vw,2.1rem)] font-semibold text-sand-ink">Predictive cost analysis</h1>
          <p className="mt-1 text-[14px] text-sand-500">Group forecast by pax + season. Charged in EUR · PKR indicative.</p>
        </div>
        <Link href="/admin/finance" className="rounded-xl border border-sand-300 bg-white px-4 py-2 text-[13px] font-semibold text-green-800 hover:bg-sand-50">Open deal planner →</Link>
      </div>

      {/* pax + scenario */}
      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-2xl border border-sand-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold uppercase tracking-wider text-sand-500">Pilgrims</span>
          {[40, 80, 120].map((n) => (
            <button key={n} type="button" onClick={() => setPax(n)} className={`rounded-lg px-3 py-1.5 text-[13px] font-semibold ${clampPax(pax) === n ? 'bg-green-800 text-white' : 'border border-sand-300 bg-white text-sand-700'}`}>{n}</button>
          ))}
          <button type="button" aria-label="Fewer" onClick={() => setPax((p) => clampPax(p - 1))} className="h-8 w-8 rounded-md border border-sand-200 bg-sand-50 text-green-700">−</button>
          <Num value={clampPax(pax)} onChange={setPax} />
          <button type="button" aria-label="More" onClick={() => setPax((p) => clampPax(p + 1))} className="h-8 w-8 rounded-md bg-green-800 text-white">+</button>
        </div>
        <div className="inline-flex gap-1 rounded-xl bg-sand-100 p-1">
          {(['normal', 'peak', 'ramadan'] as const).map((s) => (
            <button key={s} type="button" onClick={() => setScen(s)} className={`rounded-lg px-3 py-1.5 text-[12.5px] font-semibold ${scen === s ? 'bg-white text-green-800 shadow-sm' : 'text-sand-500'}`}>{SCEN_LABEL[s]}</button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* inputs */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-sand-200 bg-white p-5">
            <div className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-sand-500">Rates</div>
            <Field label="Flight, each (scales with season)"><Money cents={flightEach} onChange={setFlightEach} /></Field>
            <Field label="Hotel, per room / night (scales)"><Money cents={hotelNight} onChange={setHotelNight} /></Field>
            <Field label="Nights"><Num value={nights} onChange={setNights} /></Field>
            <Field label="Pilgrims per room"><Num value={roomShare} onChange={setRoomShare} /></Field>
            <Field label="Transport (group total)"><Money cents={transport} onChange={setTransport} /></Field>
            <Field label="Visa, each"><Money cents={visaEach} onChange={setVisaEach} /></Field>
            <Field label="Ziyarat, each"><Money cents={ziyaratEach} onChange={setZiyaratEach} /></Field>
            <Field label="Food, per day"><Money cents={foodDay} onChange={setFoodDay} /></Field>
          </div>
          <div className="rounded-2xl border border-sand-200 bg-white p-5">
            <div className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-sand-500">Pricing</div>
            <Field label="Buffer %"><Num value={bufferPct} onChange={setBufferPct} /></Field>
            <Field label="Markup %"><Num value={markupPct} onChange={setMarkupPct} /></Field>
            <Field label="Payment fee %"><Num value={feePct} onChange={setFeePct} /></Field>
          </div>
        </div>

        {/* live forecast */}
        <div className="space-y-4 self-start lg:sticky lg:top-4">
          <div className="rounded-2xl border border-sand-200 bg-white p-5">
            <div className="mb-3 flex h-3 overflow-hidden rounded-full">
              {f.lines.filter((l) => l.groupCents > 0).map((l) => (
                <div key={l.key} className={COLORS[l.key] ?? 'bg-sand-300'} style={{ width: `${(l.groupCents / total) * 100}%` }} title={`${l.label}: ${eur(l.groupCents)}`} />
              ))}
            </div>
            {f.lines.map((l) => (
              <div key={l.key} className="flex items-center justify-between py-1 text-[13px]">
                <span className="inline-flex items-center gap-1.5 text-sand-600"><span className={`h-2.5 w-2.5 rounded-sm ${COLORS[l.key] ?? 'bg-sand-300'}`} /> {l.label}</span>
                <span className="font-mono text-sand-ink">{eur(l.groupCents)} <span className="text-sand-400">· {eur(l.perPaxCents)}/pax</span></span>
              </div>
            ))}
            <div className="mt-2 flex items-center justify-between border-t border-sand-200 pt-2 text-[14px] font-bold">
              <span>Group cost</span><span className="font-mono text-sand-ink">{eur(f.grandCents)}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div><div className="font-mono text-xl font-bold text-green-800">{eur(f.assessment.sellingCents)}</div><div className="text-[11px] text-sand-500">suggested sell</div></div>
              <div><div className="font-mono text-xl font-bold text-success-fg">{eur(f.assessment.profitCents)}</div><div className="text-[11px] text-sand-500">profit · {f.assessment.marginPct.toFixed(1)}%</div></div>
            </div>
            <div className="mt-2 text-center font-mono text-[12px] text-sand-500">{eur(f.assessment.perPilgrimCents)} /pax · {pkr(f.assessment.perPilgrimCents)}</div>
            <button type="button" onClick={saveAsDeal} disabled={pending} className="mt-3 w-full rounded-xl bg-green-800 py-2.5 text-sm font-semibold text-white hover:bg-green-700 active:scale-[0.98] disabled:opacity-50">{pending ? 'Saving…' : 'Save as deal'}</button>
            {savedMsg ? <p className="mt-2 text-center text-[12.5px] font-semibold text-success-fg">{savedMsg} <Link href="/admin/finance" className="underline">Open</Link></p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
