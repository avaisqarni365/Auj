'use client';

// Nusuk Services ops — proves approved-agent parity THROUGH the SaudiConnector interface
// (the mock by default). Live ziyarah + catering inventory is loaded via the booking server
// action (searchAddonsAction → SaudiConnector.searchZiyarah / searchCatering), then the agent
// drives an interactive package builder client-side: package mode, a Rawdah slot picker with a
// confirmation message, toggleable add-ons with a running EUR total (+ indicative PKR), a
// "Send a gift Umrah" CTA and the e-services grid — matching the cinematic prototype.
import Link from 'next/link';
import { useEffect, useMemo, useState, useTransition } from 'react';
import type { CateringOffer, GroundOffer, Money, SearchCriteria } from '@auj/contracts';
import { displayFromEur, formatMoney } from '../currency';
import { ScreenFrame } from '../components/ScreenFrame';
import { searchAddonsAction } from '../book/actions';

const SAMPLE: SearchCriteria = { city: 'MADINAH', checkIn: '2026-09-02', checkOut: '2026-09-06', pax: 2 };

type ModeId = 'COMPREHENSIVE' | 'VISA_OPTIONAL' | 'CUSTOM';
const PACKAGE_MODES: ReadonlyArray<{
  mode: ModeId;
  label: string;
  note: string;
  pill: string;
  pillCls: string;
}> = [
  { mode: 'COMPREHENSIVE', label: 'Comprehensive', note: 'Visa included — hotel, transfers, ziyarah and visa in one price.', pill: 'Visa included', pillCls: 'bg-success-bg text-success-fg' },
  { mode: 'VISA_OPTIONAL', label: 'Visa-optional', note: 'Pilgrim already holds a valid visa — book the land package only.', pill: 'Bring your own visa', pillCls: 'bg-accent-100 text-accent-700' },
  { mode: 'CUSTOM', label: 'Custom', note: 'Build-your-own — pick hotels, nights, transport and add-ons.', pill: 'Build your own', pillCls: 'bg-warning-bg text-warning-fg' },
];

// Time-slotted Rawdah (Riyadh ul-Jannah) permit windows, as the prototype presents them.
const RAWDAH_SLOTS: ReadonlyArray<string> = ['Fajr', '08:30', '10:00', 'Dhuhr', '16:00', 'Isha'];

// Fixed-price add-ons from the prototype (EUR minor units). Ziyarah / catering prices are taken
// from the live connector inventory when available; these are the indicative list prices.
type AddonId = 'ziyarah' | 'meals' | 'transport' | 'personalize';
const ADDONS: ReadonlyArray<{ id: AddonId; label: string; note: string; eurMinor: number; suffix?: string }> = [
  { id: 'ziyarah', label: 'Ziyarah bundle', note: 'Makkah & Madinah heritage sites', eurMinor: 6000 },
  { id: 'meals', label: 'Meals / catering', note: 'Half or full board', eurMinor: 1800, suffix: '/day' },
  { id: 'transport', label: 'Intercity transport', note: 'Makkah ↔ Madinah', eurMinor: 4500 },
  { id: 'personalize', label: 'Special requests', note: 'Wheelchair, female guide, diet', eurMinor: 0 },
];

const E_SERVICES: ReadonlyArray<{ label: string; dot: string }> = [
  { label: 'My bookings', dot: 'bg-green-600' },
  { label: 'Documents', dot: 'bg-green-600' },
  { label: 'Support tickets', dot: 'bg-accent-600' },
  { label: 'Profile & login', dot: 'bg-accent-600' },
  { label: 'Hotels near Haram', dot: 'bg-gold' },
  { label: 'Newsletter', dot: 'bg-sand-300' },
];

function Card({ title, tag, children }: { title: string; tag?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-sand-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-serif text-lg font-semibold text-sand-800">{title}</h2>
        {tag ? <span className="rounded-full bg-accent-100 px-2.5 py-0.5 text-[11px] font-semibold text-accent-700">{tag}</span> : null}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

// Resolve an add-on's EUR price from the live connector inventory where we have it, else list price.
function addonEurMinor(id: AddonId, ziyarah: GroundOffer[], catering: CateringOffer[], listMinor: number): number {
  if (id === 'ziyarah') {
    const first = ziyarah[0];
    if (first && first.net.currency === 'EUR') return first.net.amount;
  }
  if (id === 'meals') {
    const first = catering[0];
    if (first && first.net.currency === 'EUR') return first.net.amount;
  }
  return listMinor;
}

export function NusukConsole() {
  const [mode, setMode] = useState<ModeId>('COMPREHENSIVE');
  const [slot, setSlot] = useState<string>('');
  const [selected, setSelected] = useState<Record<AddonId, boolean>>({ ziyarah: true, meals: false, transport: true, personalize: false });
  const [ziyarah, setZiyarah] = useState<GroundOffer[]>([]);
  const [catering, setCatering] = useState<CateringOffer[]>([]);
  const [loading, startLoad] = useTransition();

  // Live inventory through the regulated seam (SaudiConnector via the booking server action).
  useEffect(() => {
    startLoad(() => {
      void searchAddonsAction(SAMPLE).then((res) => {
        setZiyarah(res.ziyarah);
        setCatering(res.catering);
      });
    });
  }, []);

  const totalEurMinor = useMemo(() => {
    let sum = 0;
    for (const a of ADDONS) {
      if (selected[a.id]) sum += addonEurMinor(a.id, ziyarah, catering, a.eurMinor);
    }
    return sum;
  }, [selected, ziyarah, catering]);

  const totalMoney: Money = { amount: totalEurMinor, currency: 'EUR' };
  const rawdahMsg = slot
    ? `Permit requested for the ${slot} slot — confirmation via Nusuk on approval.`
    : 'Select a slot — permits are limited and confirmed by Nusuk.';

  const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-1';

  return (
    <ScreenFrame label="🕋 Nusuk services" tag="via SaudiConnector · mock">
      <p className="max-w-[60ch] text-sand-500">
        Approved-agent parity — every call goes through the regulated interface, so the certified adapter is a drop-in swap.
      </p>

      <div className="mt-6 grid gap-4">
        {/* PACKAGE MODE */}
        <Card title="Umrah package mode">
          <p className="-mt-1 mb-3 text-[12.5px] text-sand-500">The visa step is conditional on the mode and the per-pilgrim visa route.</p>
          <div className="grid gap-2.5 sm:grid-cols-3">
            {PACKAGE_MODES.map((m) => {
              const on = mode === m.mode;
              return (
                <button
                  key={m.mode}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setMode(m.mode)}
                  className={`min-h-[44px] rounded-xl border p-3.5 text-left transition-[transform,background-color,border-color] duration-fast ease-out-soft active:scale-[0.99] ${focusRing} ${
                    on ? 'border-green-600 bg-green-50' : 'border-sand-200 bg-sand-50 hover:border-sand-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-semibold text-sand-800">{m.label}</span>
                    <span
                      aria-hidden
                      className={`grid h-5 w-5 place-items-center rounded-full border-2 text-[11px] font-bold text-white ${
                        on ? 'border-green-800 bg-green-800' : 'border-sand-300 bg-white'
                      }`}
                    >
                      {on ? '✓' : ''}
                    </span>
                  </div>
                  <div className="mt-1 text-[12px] leading-relaxed text-sand-500">{m.note}</div>
                  <span className={`mt-2.5 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${m.pillCls}`}>{m.pill}</span>
                </button>
              );
            })}
          </div>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* RAWDAH */}
          <Card title="Rawdah permit" tag="Madinah">
            <p className="-mt-1 mb-3 text-[12.5px] text-sand-500">Time-slotted permit to Riyadh ul-Jannah — pick a slot.</p>
            <div className="flex flex-wrap gap-2">
              {RAWDAH_SLOTS.map((label) => {
                const on = slot === label;
                return (
                  <button
                    key={label}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setSlot(on ? '' : label)}
                    className={`min-h-[44px] rounded-lg border px-3.5 py-2 font-mono text-[12.5px] font-semibold transition-[transform,background-color,border-color] duration-fast ease-out-soft active:scale-[0.97] ${focusRing} ${
                      on ? 'border-green-800 bg-green-800 text-white' : 'border-sand-200 bg-sand-50 text-sand-800 hover:border-sand-300'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <p
              aria-live="polite"
              className={`mt-3 rounded-xl border px-3.5 py-3 text-[12.5px] transition-colors duration-fast ${
                slot ? 'border-green-100 bg-green-50 text-green-800' : 'border-sand-200 bg-sand-50 text-sand-500'
              }`}
            >
              {rawdahMsg}
            </p>
            <p className="mt-2 text-[12px] text-sand-500">
              Booked via <span className="font-mono">SaudiConnector.bookRawdah</span> against the pilgrim list.
            </p>
          </Card>

          {/* ADD-ONS + RUNNING TOTAL */}
          <Card title="Add to your package" tag={loading ? 'loading…' : `${ziyarah.length + catering.length} live offers`}>
            <div className="flex flex-col gap-2">
              {ADDONS.map((a) => {
                const on = selected[a.id];
                const eur = addonEurMinor(a.id, ziyarah, catering, a.eurMinor);
                const price = eur === 0 ? 'Free' : `${formatMoney({ amount: eur, currency: 'EUR' })}${a.suffix ?? ''}`;
                return (
                  <button
                    key={a.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setSelected((s) => ({ ...s, [a.id]: !s[a.id] }))}
                    className={`flex min-h-[44px] w-full items-center gap-3 rounded-xl border p-3 text-left transition-[transform,background-color,border-color] duration-fast ease-out-soft active:scale-[0.99] ${focusRing} ${
                      on ? 'border-green-100 bg-green-50' : 'border-sand-100 bg-sand-50 hover:border-sand-200'
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`grid h-[22px] w-[22px] flex-shrink-0 place-items-center rounded-md border-2 text-[12px] font-bold text-white ${
                        on ? 'border-green-800 bg-green-800' : 'border-sand-300 bg-white'
                      }`}
                    >
                      {on ? '✓' : ''}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-semibold text-sand-800">{a.label}</span>
                      <span className="block text-[12px] text-sand-500">{a.note}</span>
                    </span>
                    <span className="font-mono text-[13px] font-semibold text-green-800">{price}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex items-center justify-between rounded-xl border border-sand-200 bg-white px-3.5 py-3">
              <span className="text-[13px] font-semibold text-sand-700">Selected total</span>
              <span className="text-right">
                <span className="block font-mono text-[15px] font-bold text-green-800">{formatMoney(totalMoney)}</span>
                <span className="block font-mono text-[11px] text-sand-400">{displayFromEur(totalEurMinor, 'PKR')} indicative</span>
              </span>
            </div>
            <p className="mt-2 text-[12px] text-sand-500">EUR charged · PKR indicative. Meals priced per day.</p>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* GIFT UMRAH */}
          <section className="rounded-2xl border border-green-900 bg-gradient-to-br from-green-800 to-green-950 p-5 text-green-50 shadow-sm">
            <div className="flex items-center gap-3">
              <span aria-hidden className="grid h-9 w-9 place-items-center rounded-xl border border-white/20 bg-white/10">🎁</span>
              <h2 className="font-serif text-lg font-semibold">Gift an Umrah</h2>
            </div>
            <p className="mt-2.5 text-[13.5px] leading-relaxed text-green-100/90">
              Book and pay a package on behalf of another person — enter the recipient&rsquo;s details and we issue a gift voucher with their booking reference.
            </p>
            <Link
              href="/book?gift=1"
              className={`mt-4 inline-flex min-h-[44px] items-center rounded-xl bg-gold px-4 py-3 text-[14px] font-semibold text-green-950 transition-transform duration-fast ease-out-soft active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-green-900`}
            >
              Send a gift Umrah →
            </Link>
          </section>

          {/* E-SERVICES */}
          <Card title="E-services">
            <div className="grid grid-cols-2 gap-2.5">
              {E_SERVICES.map((e) => (
                <div key={e.label} className="flex items-center gap-2.5 rounded-xl border border-sand-100 px-3 py-2.5">
                  <span aria-hidden className={`h-2 w-2 flex-shrink-0 rounded-full ${e.dot}`} />
                  <span className="flex-1 text-[13px] text-sand-800">{e.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <p className="flex items-start gap-2.5 rounded-xl border border-warning-bg bg-warning-bg/40 px-4 py-3 text-[12.5px] leading-relaxed text-sand-700">
          <span aria-hidden className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-md bg-warning text-[13px] font-bold text-white">i</span>
          <span>
            Every service runs against <span className="font-mono text-[12px]">connector-mock</span> today and is a drop-in for{' '}
            <span className="font-mono text-[12px]">connector-saudi</span> when real Nusuk Masar access lands — nothing blocks on Ministry authorization. BRNs verbatim · EUR charged / PKR indicative.
          </span>
        </p>
      </div>
    </ScreenFrame>
  );
}
