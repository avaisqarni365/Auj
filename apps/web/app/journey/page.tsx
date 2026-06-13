'use client';

import { useState, type ReactNode } from 'react';
import { Logo } from '@auj/ui';
import { routeFor } from '@auj/visa-router';
import { formatMoney, pkrIndicative } from '../../src/currency';
import {
  BOOKING,
  DOCUMENTS,
  ITINERARY,
  NEXT_STEPS,
  PILGRIM_VISAS,
  STAGES,
  TIMELINE,
  TRANSACTIONS,
} from '../../src/journey-content';

type Tab = 'Journey' | 'Itinerary' | 'Documents' | 'Payments';
const TABS: Tab[] = ['Journey', 'Itinerary', 'Documents', 'Payments'];

export default function JourneyPage() {
  const [tab, setTab] = useState<Tab>('Journey');
  const balance = { amount: BOOKING.total.amount - BOOKING.paid.amount, currency: BOOKING.total.currency };
  const progress = Math.round((BOOKING.stageIndex / (STAGES.length - 1)) * 100);

  return (
    <div className="min-h-screen bg-[#ECE7DD]">
      {/* portal top nav */}
      <header className="sticky top-0 z-40 border-b border-sand-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-[clamp(16px,3vw,28px)] py-3">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2.5">
              <Logo size={30} />
              <span className="font-serif text-base font-semibold tracking-[0.04em]">AUJ</span>
            </div>
            <div className="flex flex-wrap gap-0.5">
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`rounded-[9px] px-3.5 py-2 text-[13.5px] font-semibold ${tab === t ? 'bg-green-100 text-green-800' : 'text-sand-700 hover:bg-sand-100'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="rounded-lg border border-sand-200 px-2.5 py-1.5 text-[13px] font-semibold text-sand-700">🌐 EN</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-800 text-[12.5px] font-semibold text-white">AK</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl p-[clamp(16px,3vw,30px)]">
        {/* booking hero */}
        <div className="relative mb-5 overflow-hidden rounded-[18px] bg-gradient-to-br from-green-800 to-green-900 p-[clamp(22px,2.6vw,30px)] text-green-50">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <div className="text-[11.5px] tracking-wider text-green-100/70">BOOKING REFERENCE</div>
              <div className="my-1 font-mono text-[clamp(22px,2.6vw,28px)] font-semibold">{BOOKING.brn}</div>
              <div className="font-serif text-[22px] font-medium">{BOOKING.pkg}</div>
              <div className="mt-1 text-[13.5px] text-green-100/80">{BOOKING.route} · {BOOKING.dates} · {BOOKING.pax} pilgrims</div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F7EBD3]/20 px-3 py-1 text-[12.5px] font-semibold text-[#F0D9A4]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E3CC97]" />Visa in progress
              </span>
              <div className="mt-3 font-mono text-3xl font-bold text-white">{BOOKING.daysToDeparture}</div>
              <div className="text-xs text-green-100/70">days to departure</div>
            </div>
          </div>
          <div className="mt-5">
            <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-gold" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-2 flex justify-between text-[11.5px] text-green-100/80">
              {STAGES.map((s, i) => (
                <span key={s} className={i === BOOKING.stageIndex ? 'font-semibold text-[#F0D9A4]' : ''}>{s}</span>
              ))}
            </div>
          </div>
        </div>

        {tab === 'Journey' && <Journey />}
        {tab === 'Itinerary' && <Itinerary />}
        {tab === 'Documents' && <Documents />}
        {tab === 'Payments' && <Payments balance={balance} />}
      </div>
    </div>
  );
}

function Panel({ title, children, className = '' }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-sand-200 bg-white p-6 ${className}`}>
      {title ? <div className="mb-4 text-[15px] font-bold">{title}</div> : null}
      {children}
    </div>
  );
}

function Journey() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
      <Panel title="Your journey — every step">
        {TIMELINE.map((t, i) => {
          const done = i < BOOKING.stageIndex;
          const active = i === BOOKING.stageIndex;
          const last = i === TIMELINE.length - 1;
          return (
            <div key={t.title} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className={`flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 text-sm text-white ${done ? 'border-success bg-success' : active ? 'border-warning bg-warning' : 'border-sand-300 bg-white'}`}>{done ? '✓' : ''}</span>
                {!last ? <span className={`min-h-[26px] w-0.5 flex-1 ${i < BOOKING.stageIndex ? 'bg-success' : 'bg-sand-200'}`} /> : null}
              </div>
              <div className="flex-1 pb-5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className={`text-[15px] font-semibold ${done || active ? 'text-sand-ink' : 'text-sand-500'}`}>{t.title}</span>
                  {t.badge ? <span className="rounded-full bg-warning-bg px-2.5 py-0.5 text-[11px] font-semibold text-warning-fg">{t.badge}</span> : null}
                </div>
                <div className="mt-0.5 text-[13px] text-sand-500">{t.sub}</div>
              </div>
            </div>
          );
        })}
      </Panel>
      <div className="grid content-start gap-4">
        <Panel title="What's next">
          {NEXT_STEPS.map((n) => (
            <div key={n.title} className="mb-2.5 flex items-center gap-3 rounded-xl border border-sand-200 bg-sand-50 px-3.5 py-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-green-100 text-base">{n.icon}</span>
              <div className="min-w-0 flex-1"><div className="text-[13.5px] font-semibold">{n.title}</div><div className="text-[11.5px] text-sand-500">{n.sub}</div></div>
              <span className="whitespace-nowrap text-[12.5px] font-semibold text-accent-600">{n.action}</span>
            </div>
          ))}
        </Panel>
        <div className="rounded-2xl bg-gradient-to-br from-green-950 to-green-900 p-6 text-center text-green-50">
          <div className="mb-3.5 text-[11.5px] tracking-[0.1em] text-green-100/70">AUJ DIGITAL PASS</div>
          <div className="inline-block rounded-2xl bg-white p-3.5">
            <Qr seed={BOOKING.brn} />
          </div>
          <div className="mt-3.5 font-mono text-[13px] text-white">{BOOKING.brn}</div>
          <div className="mt-0.5 text-xs text-green-100/70">Show at check-in &amp; ground services</div>
        </div>
      </div>
    </div>
  );
}

/** Faux-QR: deterministic from the BRN (replace with a real QR encoder in production). */
function Qr({ seed }: { seed: string }) {
  const n = 13;
  const cell = (r: number, c: number): boolean => {
    let h = 0;
    const s = `${seed}-${r}-${c}`;
    for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h % 3 === 0;
  };
  const finder = (r: number, c: number): boolean => (r < 3 && c < 3) || (r < 3 && c >= n - 3) || (r >= n - 3 && c < 3);
  return (
    <div className="grid" style={{ gridTemplateColumns: `repeat(${n}, 9px)` }}>
      {Array.from({ length: n * n }, (_, idx) => {
        const r = Math.floor(idx / n);
        const c = idx % n;
        const on = finder(r, c) || cell(r, c);
        return <span key={idx} style={{ width: 9, height: 9, background: on ? '#07301E' : '#fff' }} />;
      })}
    </div>
  );
}

function Itinerary() {
  return (
    <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white">
      {ITINERARY.map((d) => (
        <div key={d.day} className="flex gap-4 border-t border-sand-100 px-6 py-4 first:border-0">
          <div className="w-14 shrink-0 text-center">
            <div className="font-mono text-[11px] text-sand-500">{d.day}</div>
            <div className="mt-1.5 flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-xl">{d.icon}</div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <span className="text-[15.5px] font-semibold">{d.title}</span>
              <span className="text-xs text-sand-500">{d.date}</span>
            </div>
            <p className="mt-1 text-[13.5px] leading-relaxed text-sand-700">{d.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function Documents() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Documents">
        <div className="grid gap-2.5">
          {DOCUMENTS.map((d) => (
            <div key={d.name} className={`flex items-center gap-3 rounded-xl border-[1.5px] px-3.5 py-3 ${d.done ? 'border-green-100 bg-green-50' : 'border-dashed border-sand-300 bg-white'}`}>
              <span className="flex h-[38px] w-[38px] items-center justify-center rounded-[9px] bg-sand-100 text-[17px]">📄</span>
              <div className="flex-1"><div className="text-[13.5px] font-semibold">{d.name}</div><div className="text-[11.5px] text-sand-500">{d.meta}</div></div>
              <span className={`text-lg ${d.done ? 'text-success' : 'text-sand-300'}`}>{d.done ? '✓' : '…'}</span>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Per-pilgrim visa status">
        <div className="grid gap-2.5">
          {PILGRIM_VISAS.map((p) => {
            const evisa = routeFor({ id: 'x', firstName: 'A', lastName: 'B', passportNumber: 'X', nationality: p.nationality, dob: '1990-01-01', gender: 'M' }).route === 'EVISA_DIRECT';
            return (
              <div key={p.name} className="flex items-center justify-between rounded-xl border border-sand-200 px-3.5 py-3">
                <div><div className="text-[13.5px] font-semibold">{p.name}</div><div className="text-[11.5px] text-sand-500">{p.nationality} passport</div></div>
                <span className={`rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${evisa ? 'bg-success-bg text-success-fg' : 'bg-info-bg text-info-fg'}`}>{evisa ? 'e-Visa' : 'Agent channel'}</span>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

function Payments({ balance }: { balance: { amount: number; currency: 'EUR' | 'PKR' | 'SAR' } }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
      <Panel title="Summary">
        <Row label="Total" value={formatMoney(BOOKING.total)} />
        <Row label="Paid" value={formatMoney(BOOKING.paid)} tone="text-success-fg" />
        <div className="mt-2 flex items-center justify-between border-t border-sand-200 pt-3">
          <div><div className="text-sm font-bold">Balance</div><div className="font-mono text-[11px] text-sand-500">{pkrIndicative(balance)}</div></div>
          <span className="font-mono text-xl font-bold text-green-800">{formatMoney(balance)}</span>
        </div>
        <div className="mt-3 rounded-lg bg-accent-100 px-3 py-2 text-[12px] text-accent-700">Charged in EUR · PKR indicative at today’s rate.</div>
        <button type="button" className="mt-4 w-full rounded-xl bg-green-800 py-2.5 text-sm font-semibold text-white">Pay balance</button>
        <button type="button" className="mt-2 w-full rounded-xl border-[1.5px] border-sand-300 bg-white py-2.5 text-sm font-semibold text-sand-700">Download receipt / plan</button>
      </Panel>
      <Panel title="Transactions">
        <table className="w-full text-[13px]">
          <tbody>
            {TRANSACTIONS.map((t) => (
              <tr key={t.date} className="border-t border-sand-100 first:border-0">
                <td className="py-2.5 text-sand-700">{t.date}</td>
                <td className="py-2.5">{t.desc}</td>
                <td className="py-2.5 text-right font-mono font-semibold text-success-fg">{formatMoney(t.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}

function Row({ label, value, tone = '' }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[13px] text-sand-700">{label}</span>
      <span className={`font-mono text-[13px] ${tone}`}>{value}</span>
    </div>
  );
}
