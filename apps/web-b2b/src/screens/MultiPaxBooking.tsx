import type { Money } from '@auj/contracts';
import { Button } from '@auj/ui';
import { formatMoney } from '../money';
import { MAX_PAX } from '../multipax';

export interface PaxPreview {
  name: string;
  passport: string;
  nat: string;
  route: 'e-Visa' | 'Agent';
}

export interface MultiPaxBookingProps {
  paxCount: number;
  sell: Money;
  canBook: boolean;
  onAddRow: () => void;
  onAdd10: () => void;
  onPayFromWallet: () => void;
  rows?: PaxPreview[];
}

function generateRows(count: number): PaxPreview[] {
  return Array.from({ length: Math.min(count, MAX_PAX) }, (_, i) => {
    const pk = i % 3 === 0;
    return {
      name: `Passenger ${i + 1}`,
      passport: `${pk ? 'PK' : 'LT'}${(1000000 + i).toString()}`,
      nat: pk ? '🇵🇰 PK' : '🇱🇹 LT',
      route: pk ? 'Agent' : 'e-Visa',
    };
  });
}

export function MultiPaxBooking({ paxCount, sell, canBook, onAddRow, onAdd10, onPayFromWallet, rows }: MultiPaxBookingProps) {
  const full = paxCount >= MAX_PAX;
  const data = rows ?? generateRows(paxCount);
  return (
    <div className="grid gap-3.5 md:grid-cols-[1fr_320px]">
      {/* passengers table */}
      <div>
        <div className="mb-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold">Passengers</span>
            <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-success-fg">
              {paxCount} / {MAX_PAX} pax
            </span>
          </div>
          <span className="text-xs text-sand-500">{MAX_PAX - paxCount} seats left</span>
        </div>
        <div className="overflow-hidden rounded-xl border border-sand-200 bg-white">
          <div className="max-h-[360px] overflow-y-auto">
            <table className="w-full text-[12.5px]">
              <thead className="sticky top-0">
                <tr className="bg-sand-50 text-left text-sand-500">
                  <th className="px-3.5 py-2.5 font-semibold">#</th>
                  <th className="px-2 py-2.5 font-semibold">Full name</th>
                  <th className="px-2 py-2.5 font-semibold">Passport</th>
                  <th className="px-2 py-2.5 font-semibold">Nat.</th>
                  <th className="px-2 py-2.5 font-semibold">Visa route</th>
                </tr>
              </thead>
              <tbody>
                {data.map((p, i) => (
                  <tr key={p.passport} className="border-t border-sand-100">
                    <td className="px-3.5 py-2 font-mono text-sand-500">{i + 1}</td>
                    <td className="px-2 py-2 font-semibold">{p.name}</td>
                    <td className="px-2 py-2 font-mono text-sand-700">{p.passport}</td>
                    <td className="px-2 py-2">{p.nat}</td>
                    <td className="px-2 py-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          p.route === 'e-Visa' ? 'bg-success-bg text-success-fg' : 'bg-info-bg text-info-fg'
                        }`}
                      >
                        {p.route}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-2.5 border-t border-sand-100 p-3.5">
            <Button size="sm" variant="secondary" onClick={onAddRow} disabled={full}>
              + Add passenger
            </Button>
            <Button size="sm" variant="secondary" onClick={onAdd10} disabled={full}>
              + Add 10 rows
            </Button>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-[10px] bg-accent-100 px-3.5 py-2.5">
          <span className="text-sm">ℹ️</span>
          <span className="text-xs leading-snug text-accent-700">
            Pakistani passports auto-route to the <strong>agent channel</strong>; EU passports get <strong>e-Visa</strong>. Mixed groups are supported.
          </span>
        </div>
      </div>

      {/* group summary */}
      <div>
        <div className="mb-3.5 text-sm font-bold">Group summary</div>
        <div className="mb-3 rounded-xl border border-sand-200 bg-white p-4">
          <Line label="Hotel · 14 nights" value={sell} />
          <div className="flex items-center justify-between pt-3">
            <span className="text-sm font-bold">Client price</span>
            <span className="font-mono text-lg font-bold text-green-800">{formatMoney(sell)}</span>
          </div>
        </div>
        <Button className="mb-2 w-full" onClick={onPayFromWallet} disabled={!canBook}>
          Pay from wallet
        </Button>
        <Button variant="secondary" className="w-full">
          Hold on credit
        </Button>
      </div>
    </div>
  );
}

function Line({ label, value }: { label: string; value: Money }) {
  return (
    <div className="flex items-center justify-between border-b border-sand-100 py-1.5">
      <span className="text-[13px] text-sand-700">{label}</span>
      <span className="font-mono text-[13px] font-medium">{formatMoney(value)}</span>
    </div>
  );
}
