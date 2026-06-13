import { Button } from '@auj/ui';
import { formatMoney, formatWithPkr } from '../money';
import type { Quotation } from '../domain';

export interface QuotationBuilderProps {
  quote: Quotation;
  onSend: () => void;
  onConvert: () => void;
}

export function QuotationBuilder({ quote, onSend, onConvert }: QuotationBuilderProps) {
  const pkr = formatWithPkr(quote.sell).split('≈')[1]?.trim();
  return (
    <div className="grid items-start gap-4 md:grid-cols-[1.4fr_1fr]">
      {/* builder */}
      <div className="rounded-2xl border border-sand-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-[15px] font-bold">Quotation #{quote.id.slice(0, 8)}</div>
          <span className="rounded-full bg-sand-100 px-2.5 py-1 text-xs font-semibold text-sand-500">{quote.status}</span>
        </div>
        <div className="mb-3 text-[13px] font-bold">Line items</div>
        <div className="overflow-hidden rounded-xl border border-sand-200">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-sand-50 text-left text-sand-500">
                <th className="px-3.5 py-2.5 font-semibold">Item</th>
                <th className="px-2 py-2.5 text-right font-semibold">Net</th>
              </tr>
            </thead>
            <tbody>
              {quote.lines.map((l, i) => (
                <tr key={i} className="border-t border-sand-100">
                  <td className="px-3.5 py-2.5 font-semibold">{l.label}</td>
                  <td className="px-2 py-2.5 text-right font-mono text-sand-700">{formatMoney(l.net)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" className="mt-3.5 rounded-[9px] border-[1.5px] border-dashed border-sand-300 px-3.5 py-2 text-[13px] font-semibold text-accent-600">
          + Add line item
        </button>
      </div>

      {/* totals */}
      <div className="grid gap-3.5">
        <div className="rounded-2xl border border-sand-200 bg-white p-5">
          <div className="mb-3 text-sm font-bold">Totals</div>
          <Row label="Net subtotal" value={formatMoney(quote.netTotal)} />
          <Row label="Markup" value={`+${formatMoney(quote.markup)}`} accent />
          <div className="flex items-center justify-between pt-3">
            <div>
              <div className="text-[15px] font-bold">Client total</div>
              {pkr ? <div className="font-mono text-[11px] text-sand-500">≈ {pkr}</div> : null}
            </div>
            <span className="font-mono text-[22px] font-bold text-green-800">{formatMoney(quote.sell)}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-sand-200 bg-white p-4">
          <div className="flex h-[60px] w-[46px] items-end rounded-md bg-gradient-to-br from-green-700 to-green-950 p-1.5 shadow">
            <span className="font-serif text-[11px] font-semibold text-gold">AUJ</span>
          </div>
          <div className="flex-1">
            <div className="text-[13px] font-semibold">Branded PDF ready</div>
            <div className="text-xs text-sand-500">Your agency logo &amp; terms applied</div>
          </div>
        </div>
        <Button className="w-full" onClick={onSend}>
          Send quote to client
        </Button>
        <Button variant="accent" className="w-full" onClick={onConvert}>
          Convert to booking
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-[13px] text-sand-700">{label}</span>
      <span className={`font-mono text-[13px] ${accent ? 'text-success-fg' : ''}`}>{value}</span>
    </div>
  );
}
