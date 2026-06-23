'use client';

import { useMemo, useState } from 'react';
import { routeFor } from '@auj/visa-router';
import type { Pilgrim } from '@auj/contracts';
import { StatusPill } from '@auj/ui';
import { ScreenFrame } from '../components/ScreenFrame';

// Nationalities for the demo dropdown — a mix of e-visa-eligible and agent-channel passports.
const NATIONS: ReadonlyArray<[string, string]> = [
  ['LT', 'Lithuania'], ['DE', 'Germany'], ['FR', 'France'], ['GB', 'United Kingdom'],
  ['US', 'United States'], ['CA', 'Canada'], ['SA', 'Saudi Arabia'], ['AE', 'UAE'],
  ['PK', 'Pakistan'], ['IN', 'India'], ['BD', 'Bangladesh'], ['NG', 'Nigeria'],
  ['ID', 'Indonesia'], ['EG', 'Egypt'], ['MA', 'Morocco'],
];
const RESIDENCES: ReadonlyArray<[string, string]> = [
  ['', '— none —'], ['DE', 'Germany (Schengen)'], ['GB', 'United Kingdom'], ['US', 'United States'],
  ['AE', 'UAE (GCC)'], ['SA', 'Saudi Arabia (GCC)'], ['PK', 'Pakistan (non-qualifying)'],
];


function demoPilgrim(nationality: string, residenceCountry: string, residencePermit: boolean): Pilgrim {
  return {
    id: 'demo',
    firstName: 'Demo',
    lastName: 'Pilgrim',
    passportNumber: 'X0000000',
    nationality,
    dob: '1990-01-01',
    gender: 'M',
    residenceCountry: residenceCountry || undefined,
    residencePermit,
  };
}

function TraceRow({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 py-1.5">
      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${ok ? 'bg-success-bg text-success-fg' : 'bg-sand-100 text-sand-400'}`}>
        {ok ? '✓' : '·'}
      </span>
      <span className="text-[13.5px] leading-relaxed text-sand-700">{children}</span>
    </div>
  );
}

export function VisaRouterDemo() {
  const [nat, setNat] = useState('PK');
  const [res, setRes] = useState('');
  const [permit, setPermit] = useState(false);

  const result = useMemo(() => routeFor(demoPilgrim(nat, res, permit)), [nat, res, permit]);
  const evisa = result.route === 'EVISA_DIRECT';
  const SELECT = 'w-full rounded-lg border-[1.5px] border-sand-300 bg-white px-3 py-2 text-[14px] focus:border-green-700 focus:outline-none';

  return (
    <ScreenFrame label="🛂 Visa Router" maxWidth="max-w-3xl">
      <p className="mb-6 text-[14px] text-sand-500">Eligibility QA — passport + residence decide e‑Visa vs agent channel. Pure domain (no connector).</p>

      <div className="grid gap-6 md:grid-cols-2">
        {/* inputs */}
        <div className="rounded-2xl border border-sand-200 bg-white p-5">
          <label className="block">
            <span className="mb-1 block text-[12px] font-semibold uppercase tracking-wider text-sand-500">Passport nationality</span>
            <select value={nat} onChange={(e) => setNat(e.target.value)} className={SELECT}>
              {NATIONS.map(([c, n]) => <option key={c} value={c}>{n}</option>)}
            </select>
          </label>
          <label className="mt-3 block">
            <span className="mb-1 block text-[12px] font-semibold uppercase tracking-wider text-sand-500">Residence country</span>
            <select value={res} onChange={(e) => { setRes(e.target.value); setPermit(e.target.value !== ''); }} className={SELECT}>
              {RESIDENCES.map(([c, n]) => <option key={c || 'none'} value={c}>{n}</option>)}
            </select>
          </label>
          <label className="mt-3 flex items-center gap-2.5">
            <input type="checkbox" checked={permit} onChange={(e) => setPermit(e.target.checked)} disabled={!res} className="h-4 w-4 accent-green-700" />
            <span className="text-[13.5px] text-sand-700">Holds a valid residence permit</span>
          </label>
        </div>

        {/* result */}
        <div className="rounded-2xl border border-sand-200 bg-white p-5">
          <div className="text-[12px] font-semibold uppercase tracking-wider text-sand-500">Routed channel</div>
          <div className="mt-2">
            <StatusPill tone={evisa ? 'success' : 'info'}>{evisa ? 'e‑Visa · direct' : 'Agent channel'}</StatusPill>
          </div>
          <p className="mt-2 text-[12.5px] text-sand-500">
            {evisa ? 'Eligible for the Saudi e‑Visa — book directly.' : 'Routed via a MoRA‑licensed operator (Nusuk Masar).'}
          </p>
          {result.warnings.length > 0 ? (
            <div className="mt-3 rounded-lg bg-warning-bg px-3 py-2 text-[12.5px] text-warning-fg">
              {result.warnings.map((w) => <div key={w}>⚠ {w}</div>)}
            </div>
          ) : null}
        </div>
      </div>

      {/* decision trace — straight from the pure engine (no recomputation here) */}
      <div className="mt-6 rounded-2xl border border-sand-200 bg-white p-5">
        <div className="mb-2 text-[13px] font-bold text-sand-ink">Decision trace</div>
        {result.trace.map((t, i) => (
          <TraceRow key={`${t.check}-${i}`} ok={t.pass}>{t.detail}</TraceRow>
        ))}
        <div className="mt-2 border-t border-sand-100 pt-2 text-[13.5px] font-semibold text-sand-ink">
          → {result.route}
        </div>
      </div>
    </ScreenFrame>
  );
}
