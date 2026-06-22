'use client';

import { useState } from 'react';
import { ScreenFrame } from '../components/ScreenFrame';
import { displayFromEur } from '../currency';

// Pilgrim-facing budget estimator from AUJ Financial Planner.dc.html: a 10/15-day toggle, the
// AUJ package (one confirmed price) split from private spending, with an estimated per-pilgrim
// total in EUR + indicative PKR. Amounts are EUR minor units (cents).

type Line = { label: string; note: (days: number) => string; kind: 'nightly' | 'perDay' | 'fixed'; cents: number };

const PACKAGE: Line[] = [
  { label: 'Hotel near the Haram', note: (d) => `${d} nights · twin-share`, kind: 'nightly', cents: 11_000 },
  { label: 'Flights (return)', note: () => 'From your EU city', kind: 'fixed', cents: 48_000 },
  { label: 'Ground transfers & ziyarat', note: () => 'Airport, Haram, sites', kind: 'fixed', cents: 18_000 },
  { label: 'Visa & services', note: () => 'e-Visa, SIM, Ihram kit', kind: 'fixed', cents: 15_000 },
];

const PRIVATE: Line[] = [
  { label: 'Food & dining', note: () => '~€18 / day', kind: 'perDay', cents: 1_800 },
  { label: 'Local transport', note: () => 'Taxis, ride-hailing ~€6 / day', kind: 'perDay', cents: 600 },
  { label: 'Laundry', note: () => 'Wash & iron for the trip', kind: 'fixed', cents: 2_500 },
  { label: 'Clothes & ihram', note: () => 'Ihram, abaya, basics', kind: 'fixed', cents: 6_000 },
  { label: 'Gifts, dates & Zamzam', note: () => 'To carry home', kind: 'fixed', cents: 9_000 },
  { label: 'SIM & data', note: () => 'Local number + bundle', kind: 'fixed', cents: 2_000 },
];

const amount = (l: Line, days: number): number => (l.kind === 'fixed' ? l.cents : l.cents * days);
const sum = (ls: Line[], days: number): number => ls.reduce((a, l) => a + amount(l, days), 0);

export function FinancialPlanner() {
  const [days, setDays] = useState<10 | 15>(10);
  const pkgSum = sum(PACKAGE, days);
  const privSum = sum(PRIVATE, days);
  const grand = pkgSum + privSum;

  const dayBtn = (n: 10 | 15) => (
    <button
      key={n}
      type="button"
      onClick={() => setDays(n)}
      className={`rounded-lg px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors duration-fast ${
        days === n ? 'bg-white/20 text-white ring-1 ring-white/30' : 'text-green-100/80 hover:text-white'
      }`}
    >
      {n} days
    </button>
  );

  return (
    <ScreenFrame
      label="FINANCIAL PLANNER · AUJ PACKAGE + PRIVATE SPENDING"
      tag={<span className="flex gap-1 rounded-[11px] bg-white/10 p-1">{dayBtn(10)}{dayBtn(15)}</span>}
      maxWidth="max-w-[1040px]"
      bodyClassName="p-0"
    >
      <div className="flex flex-wrap">
        {/* total stage */}
        <div className="relative flex flex-1 basis-[300px] flex-col justify-between gap-6 overflow-hidden bg-gradient-to-br from-green-700 via-green-900 to-green-950 p-[clamp(22px,2.6vw,30px)] text-green-50">
          <span aria-hidden className="pointer-events-none absolute -right-11 -top-12 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(200,162,74,0.22),transparent_70%)]" />
          <div className="relative">
            <div className="font-mono text-[10.5px] tracking-[0.1em] text-green-100/70">ESTIMATED TOTAL · {days} DAYS · PER PILGRIM</div>
            <div className="mt-2 font-mono text-[clamp(38px,6vw,56px)] font-semibold leading-[1.05]">{displayFromEur(grand, 'EUR')}</div>
            <div className="mt-1.5 font-mono text-[13px] text-green-100/80">≈ {displayFromEur(grand, 'PKR')}</div>
          </div>
          <div className="relative flex flex-col gap-2.5">
            <div className="flex items-center justify-between rounded-xl border border-white/15 bg-white/[0.08] px-3.5 py-3">
              <span className="text-[13.5px] font-semibold">AUJ package</span>
              <span className="font-mono text-[15px] font-semibold text-gold">{displayFromEur(pkgSum, 'EUR')}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/15 bg-white/[0.08] px-3.5 py-3">
              <span className="text-[13.5px] font-semibold">Private spending</span>
              <span className="font-mono text-[15px] font-semibold text-gold">{displayFromEur(privSum, 'EUR')}</span>
            </div>
          </div>
          <p className="relative text-[12px] leading-relaxed text-green-100/70">
            Indicative estimate per pilgrim in EUR. Your AUJ package price is confirmed at checkout; private spending varies by person.
          </p>
        </div>

        {/* breakdown */}
        <div className="flex flex-1 basis-[360px] flex-col gap-[18px] p-[clamp(20px,2.4vw,26px)]">
          <Group title="AUJ PACKAGE · INCLUDED IN ONE PRICE" titleClass="text-green-800" lines={PACKAGE} days={days} accent="green" />
          <Group title="PRIVATE SPENDING · YOUR OWN BUDGET" titleClass="text-warning" lines={PRIVATE} days={days} accent="warning" />
        </div>
      </div>
    </ScreenFrame>
  );
}

function Group({ title, titleClass, lines, days, accent }: { title: string; titleClass: string; lines: Line[]; days: number; accent: 'green' | 'warning' }) {
  return (
    <div>
      <div className={`mb-2.5 font-mono text-[10.5px] tracking-[0.08em] ${titleClass}`}>{title}</div>
      <div className="flex flex-col gap-2">
        {lines.map((l) => (
          <div
            key={l.label}
            className={`flex items-center gap-3 rounded-xl border border-sand-100 bg-sand-50/40 px-3.5 py-3 ${accent === 'green' ? 'border-l-[3px] border-l-green-600' : 'border-l-[3px] border-l-warning'}`}
          >
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-sand-ink">{l.label}</div>
              <div className="text-xs text-sand-500">{l.note(days)}</div>
            </div>
            <div className={`whitespace-nowrap font-mono text-sm font-semibold ${accent === 'green' ? 'text-green-800' : 'text-warning'}`}>
              {displayFromEur(amount(l, days), 'EUR')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
