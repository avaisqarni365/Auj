'use client';

import { useMemo, useState, useTransition, type ReactNode } from 'react';
import Link from 'next/link';
import { clampPax, forecast, SCEN_LABEL, type Scenario } from './predict';
import { toCents } from './calc';
import { saveDealAction } from './deals-actions';
import { formatMoney, pkrIndicative } from '../currency';
import { ScreenFrame } from '../components/ScreenFrame';

const INPUT = 'rounded-lg border-[1.5px] border-sand-300 bg-white px-3 py-2 text-[14px] focus:border-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700/40';
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
function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="flex items-center justify-between gap-3 py-1"><span className="text-[13.5px] text-sand-700">{label}</span>{children}</label>;
}

// The prototype's 6-step rail: one cost group per step, summary last. `kind` mirrors the
// prototype's mono sub-label; the inputs for each step are rendered by `Step.body`.
interface Step {
  key: string;
  short: string;
  kind: string;
  title: string;
  desc: string;
  // lines whose group cost belongs to this step, for the per-step subtotal footer.
  lineKeys: string[];
}
const STEPS: Step[] = [
  { key: 'flights', short: 'Flights', kind: 'AIR', title: 'Flights', desc: 'Return airfare per pilgrim from your departure city — scaled by the season scenario.', lineKeys: ['flights'] },
  { key: 'hotels', short: 'Hotels', kind: 'STAY', title: 'Hotels', desc: 'Nightly room rate × nights, divided by occupancy — the biggest lever in the group cost.', lineKeys: ['hotels'] },
  { key: 'transport', short: 'Transport', kind: 'GROUND', title: 'Transport', desc: 'Coaches, airport transfers and intercity Makkah↔Madinah — a fixed group charter cost.', lineKeys: ['transport'] },
  { key: 'visa', short: 'Visa', kind: 'PERMIT', title: 'Visa & services', desc: 'Visa, insurance, SIM and Ihram kit — typically a flat per-pilgrim figure.', lineKeys: ['visa'] },
  { key: 'ground', short: 'Ziyarat & food', kind: 'LAND', title: 'Ziyarat, guide & food', desc: 'Guided ziyarat plus daily food — food scales with the number of nights.', lineKeys: ['ziyarat', 'food'] },
  { key: 'summary', short: 'Forecast', kind: 'RESULT', title: 'Forecast & margin', desc: 'Full predicted cost for the group plus buffer, with a suggested selling price and projected profit.', lineKeys: [] },
];

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
  const [step, setStep] = useState(0);

  const f = useMemo(
    () => forecast({ flightEachCents: flightEach, hotelNightCents: hotelNight, nights, roomShare, transportCents: transport, visaEachCents: visaEach, ziyaratEachCents: ziyaratEach, foodDayCents: foodDay }, pax, scen, { bufferPct, markupPct, feePct }),
    [flightEach, hotelNight, nights, roomShare, transport, visaEach, ziyaratEach, foodDay, pax, scen, bufferPct, markupPct, feePct],
  );
  const total = Math.max(1, f.grandCents);
  const p = clampPax(pax);

  const saveAsDeal = (): void =>
    start(async () => {
      const d = await saveDealAction({
        name: `Forecast · ${p} pax · ${SCEN_LABEL[scen]}`,
        channel: 'B2C', pax: p, bufferPct, markupPct, feePct, commissionPct: 0,
        costs: f.lines.map((l) => ({ id: l.key, label: l.label, cents: l.groupCents })),
      });
      setSavedMsg(`Saved “${d.name}” to the deal planner.`);
    });

  const last = STEPS.length - 1;
  const idx = Math.max(0, Math.min(step, last));
  const cur = STEPS[idx]!;
  const isSummary = cur.key === 'summary';

  // per-step subtotal (sum of this step's forecast lines)
  const stepLines = f.lines.filter((l) => cur.lineKeys.includes(l.key));
  const stepGroupCents = stepLines.reduce((s, l) => s + l.groupCents, 0);
  const stepEachCents = stepLines.reduce((s, l) => s + l.perPaxCents, 0);

  const goPrev = (): void => setStep(Math.max(0, idx - 1));
  const goNext = (): void => setStep(Math.min(last, idx + 1));

  return (
    <ScreenFrame label="📈 Predictive cost analysis" tag={<Link href="/admin/finance" className="text-green-50 hover:underline">Deal planner →</Link>} maxWidth="max-w-5xl">
      <p className="mb-6 text-[14px] text-sand-500">Group forecast by pax + season, step by step. Charged in EUR · PKR indicative.</p>

      {/* pax + scenario */}
      <div className="mb-4 flex flex-wrap items-center gap-4 rounded-2xl border border-sand-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold uppercase tracking-wider text-sand-500">Pilgrims</span>
          {[40, 80, 120].map((n) => (
            <button key={n} type="button" onClick={() => setPax(n)} className={`min-h-[44px] rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-[transform,background-color] duration-fast active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700/40 ${p === n ? 'bg-green-800 text-white' : 'border border-sand-300 bg-white text-sand-700'}`}>{n}</button>
          ))}
          <button type="button" aria-label="Fewer" onClick={() => setPax((q) => clampPax(q - 1))} className="h-11 w-11 rounded-md border border-sand-200 bg-sand-50 text-green-700 transition-transform duration-fast active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700/40">−</button>
          <Num value={p} onChange={setPax} />
          <button type="button" aria-label="More" onClick={() => setPax((q) => clampPax(q + 1))} className="h-11 w-11 rounded-md bg-green-800 text-white transition-transform duration-fast active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700/40">+</button>
        </div>
        <div className="inline-flex gap-1 rounded-xl bg-sand-100 p-1">
          {(['normal', 'peak', 'ramadan'] as const).map((s) => (
            <button key={s} type="button" onClick={() => setScen(s)} className={`min-h-[44px] rounded-lg px-3 py-1.5 text-[12.5px] font-semibold transition-[transform,background-color] duration-fast active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700/40 ${scen === s ? 'bg-white text-green-800 shadow-sm' : 'text-sand-500'}`}>{SCEN_LABEL[s]}</button>
          ))}
        </div>
        <span className="ml-auto font-mono text-[12px] text-sand-500">{String(idx + 1).padStart(2, '0')} / {String(STEPS.length).padStart(2, '0')}</span>
      </div>

      {/* stepper rail */}
      <nav aria-label="Forecast steps" dir="ltr" className="mb-4 flex gap-2 overflow-x-auto rounded-2xl border border-sand-200 bg-white p-3">
        {STEPS.map((s, k) => {
          const active = k === idx;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setStep(k)}
              aria-current={active ? 'step' : undefined}
              className={`flex min-h-[44px] flex-none items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-[transform,border-color,background-color] duration-fast active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700/40 ${
                active ? 'border-green-700/40 bg-green-50' : 'border-sand-200 bg-white hover:border-green-700/30'
              }`}
            >
              <span className={`grid h-7 w-7 flex-none place-items-center rounded-full font-mono text-[11px] font-bold transition-colors duration-fast ${active ? 'bg-green-700 text-white' : k < idx ? 'bg-green-100 text-green-800' : 'bg-sand-100 text-sand-500'}`}>
                {k < idx ? '✓' : String(k + 1).padStart(2, '0')}
              </span>
              <span className={`text-[12.5px] font-semibold ${active ? 'text-green-800' : 'text-sand-700'}`}>{s.short}</span>
            </button>
          );
        })}
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* step detail */}
        <div key={idx} className="animate-rise space-y-4 self-start">
          <div className="rounded-2xl border border-sand-200 bg-white p-5">
            <p className="font-mono text-[10.5px] uppercase tracking-wider text-accent-600">STEP {String(idx + 1).padStart(2, '0')} · {cur.kind}</p>
            <h2 className="mt-1 font-serif text-[clamp(20px,2.6vw,26px)] font-semibold tracking-tight text-sand-ink">{cur.title}</h2>
            <p className="mb-4 mt-1.5 max-w-[58ch] text-[14px] leading-relaxed text-sand-600">{cur.desc}</p>

            <div className="space-y-1">
              {cur.key === 'flights' ? (
                <Field label="Flight, each (scales with season)"><Money cents={flightEach} onChange={setFlightEach} /></Field>
              ) : null}
              {cur.key === 'hotels' ? (
                <>
                  <Field label="Hotel, per room / night (scales)"><Money cents={hotelNight} onChange={setHotelNight} /></Field>
                  <Field label="Nights"><Num value={nights} onChange={setNights} /></Field>
                  <Field label="Pilgrims per room"><Num value={roomShare} onChange={setRoomShare} /></Field>
                </>
              ) : null}
              {cur.key === 'transport' ? (
                <Field label="Transport (group total)"><Money cents={transport} onChange={setTransport} /></Field>
              ) : null}
              {cur.key === 'visa' ? (
                <Field label="Visa & services, each"><Money cents={visaEach} onChange={setVisaEach} /></Field>
              ) : null}
              {cur.key === 'ground' ? (
                <>
                  <Field label="Ziyarat & guide, each"><Money cents={ziyaratEach} onChange={setZiyaratEach} /></Field>
                  <Field label="Food, per pilgrim / day"><Money cents={foodDay} onChange={setFoodDay} /></Field>
                </>
              ) : null}
              {isSummary ? (
                <>
                  <Field label="Buffer %"><Num value={bufferPct} onChange={setBufferPct} /></Field>
                  <Field label="Markup %"><Num value={markupPct} onChange={setMarkupPct} /></Field>
                  <Field label="Payment fee %"><Num value={feePct} onChange={setFeePct} /></Field>
                </>
              ) : null}
            </div>

            {/* per-step subtotal (cost steps only) */}
            {!isSummary ? (
              <div className="mt-4 flex items-center justify-between border-t border-sand-200 pt-3">
                <div>
                  <div className="text-[12.5px] text-sand-500">{cur.short} — group of {p}</div>
                  <div className="mt-0.5 font-mono text-[20px] font-bold text-accent-600">{eur(stepGroupCents)}</div>
                </div>
                <div className="text-right">
                  <div className="text-[12.5px] text-sand-500">per pilgrim</div>
                  <div className="mt-0.5 font-mono text-[15px] font-semibold text-sand-ink">{eur(stepEachCents)}</div>
                </div>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-sand-200 pt-3 text-center">
                <div><div className="font-mono text-xl font-bold text-green-800">{eur(f.assessment.sellingCents)}</div><div className="text-[11px] text-sand-500">suggested sell · {markupPct}% markup</div></div>
                <div><div className="font-mono text-xl font-bold text-success-fg">{eur(f.assessment.profitCents)}</div><div className="text-[11px] text-sand-500">profit · {f.assessment.marginPct.toFixed(1)}%</div></div>
              </div>
            )}

            {/* back / next */}
            <div className="mt-5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={goPrev}
                disabled={idx === 0}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border-[1.5px] border-sand-300 bg-white px-4 py-2.5 text-[14px] font-semibold text-green-700 transition-transform duration-fast active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700/40 disabled:cursor-not-allowed disabled:border-sand-200 disabled:text-sand-400"
              >
                <span aria-hidden>←</span> Back
              </button>
              {isSummary ? (
                <button
                  type="button"
                  onClick={saveAsDeal}
                  disabled={pending}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-green-800 px-5 py-2.5 text-[14px] font-semibold text-white shadow-[0_8px_18px_rgba(15,81,50,0.26)] transition-transform duration-fast hover:bg-green-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700/40 disabled:opacity-50"
                >
                  {pending ? 'Saving…' : 'Save as deal'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-green-800 px-5 py-2.5 text-[14px] font-semibold text-white shadow-[0_8px_18px_rgba(15,81,50,0.26)] transition-transform duration-fast hover:bg-green-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700/40"
                >
                  Next <span aria-hidden>→</span>
                </button>
              )}
            </div>
            {savedMsg ? <p className="mt-3 text-center text-[12.5px] font-semibold text-success-fg">{savedMsg} <Link href="/admin/finance" className="underline">Open</Link></p> : null}
          </div>
        </div>

        {/* live forecast — persistent side panel */}
        <div className="space-y-4 self-start lg:sticky lg:top-4">
          <div className="rounded-2xl border border-sand-200 bg-white p-5">
            <div className="font-mono text-[10.5px] uppercase tracking-wider text-sand-500">Forecast total · {p} pilgrims</div>
            <div className="mt-1 font-mono text-[clamp(26px,5vw,38px)] font-bold leading-none text-sand-ink">{eur(f.grandCents)}</div>
            <div className="mt-1 text-[12.5px] text-sand-500">{eur(f.perPaxCents)} per pilgrim · {SCEN_LABEL[scen]}</div>

            <div className="my-4 flex h-2.5 overflow-hidden rounded-full bg-sand-100">
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
            <button type="button" onClick={saveAsDeal} disabled={pending} className="mt-3 min-h-[44px] w-full rounded-xl bg-green-800 py-2.5 text-sm font-semibold text-white transition-transform duration-fast hover:bg-green-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700/40 disabled:opacity-50">{pending ? 'Saving…' : 'Save as deal'}</button>
          </div>
        </div>
      </div>
    </ScreenFrame>
  );
}
