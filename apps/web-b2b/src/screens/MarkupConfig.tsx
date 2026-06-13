import type { Money } from '@auj/contracts';
import { formatMoney } from '../money';
import { applyMarkup } from '../markup';
import type { MarkupRule } from '../domain';

export interface MarkupConfigProps {
  rules: MarkupRule[];
  previewNet: Money;
  onToggle: (id: string, enabled: boolean) => void;
}

export function MarkupConfig({ rules, previewNet, onToggle }: MarkupConfigProps) {
  const active = rules.find((r) => r.enabled);
  const sell = active ? applyMarkup(previewNet, active) : previewNet;
  const markup = sell.amount - previewNet.amount;
  return (
    <div className="grid gap-4 md:grid-cols-[1.5fr_1fr]">
      {/* rules table */}
      <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white">
        <div className="flex items-center justify-between border-b border-sand-100 px-5 py-4">
          <div>
            <div className="text-sm font-bold">Markup rules</div>
            <div className="text-xs text-sand-500">Applied automatically to net rates before client price</div>
          </div>
        </div>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-sand-50 text-left text-sand-500">
              <th className="px-5 py-2.5 font-semibold">Applies to</th>
              <th className="px-3 py-2.5 font-semibold">Scope</th>
              <th className="px-3 py-2.5 font-semibold">Markup</th>
              <th className="px-5 py-2.5 text-right font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.id} className="border-t border-sand-100">
                <td className="px-5 py-3 font-semibold">{r.tier ?? 'Any tier'}</td>
                <td className="px-3 py-3 text-sand-700">{r.productKind ?? 'Any product'}</td>
                <td className="px-3 py-3 font-mono font-semibold text-success-fg">
                  {r.kind === 'PERCENT' ? `${r.value}%` : formatMoney({ amount: r.value, currency: previewNet.currency })}
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    type="button"
                    aria-label="Toggle"
                    onClick={() => onToggle(r.id, !r.enabled)}
                    className={`relative inline-block h-[18px] w-8 rounded-full ${r.enabled ? 'bg-success' : 'bg-sand-300'}`}
                  >
                    <span className={`absolute top-0.5 h-[14px] w-[14px] rounded-full bg-white ${r.enabled ? 'left-[14px]' : 'left-0.5'}`} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* editor + preview */}
      <div className="rounded-2xl border border-sand-200 bg-white p-5">
        <div className="mb-4 text-sm font-bold">Markup rule</div>
        <label className="mb-1.5 block text-xs font-medium text-sand-700">Markup type</label>
        <div className="mb-3.5 flex gap-1 rounded-[10px] bg-sand-100 p-1">
          <span className="flex-1 rounded-[7px] bg-white py-2 text-center text-[13px] font-semibold text-green-800 shadow-sm">Percentage</span>
          <span className="flex-1 py-2 text-center text-[13px] font-semibold text-sand-500">Fixed €</span>
        </div>
        <div className="rounded-xl bg-sand-50 p-3.5">
          <div className="mb-2.5 text-xs font-semibold text-sand-500">PREVIEW</div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[13px] text-sand-700">Net rate</span>
            <span className="font-mono text-[13px]">{formatMoney(previewNet)}</span>
          </div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[13px] text-sand-700">Markup{active && active.kind === 'PERCENT' ? ` +${active.value}%` : ''}</span>
            <span className="font-mono text-[13px] text-success-fg">+{formatMoney({ amount: markup, currency: previewNet.currency })}</span>
          </div>
          <div className="flex items-center justify-between border-t border-sand-200 pt-2">
            <span className="text-[13px] font-bold">Sell price</span>
            <span className="font-mono text-[15px] font-bold text-green-800">{formatMoney(sell)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
