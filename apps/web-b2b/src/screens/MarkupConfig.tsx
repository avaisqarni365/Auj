import type { Money } from '@auj/contracts';
import { Card, Toggle } from '@auj/ui';
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
  return (
    <div className="grid gap-3">
      <Card className="p-4">
        <div className="mb-2 text-xs text-sand-500">Markup rules</div>
        {rules.map((r) => (
          <div key={r.id} className="flex items-center justify-between border-t border-sand-100 py-2">
            <div>
              <div className="text-sand-ink">
                {r.tier ?? 'Any tier'} · {r.productKind ?? 'Any product'}
              </div>
              <div className="font-mono text-xs text-green-700">
                {r.kind === 'PERCENT' ? `${r.value}%` : formatMoney({ amount: r.value, currency: previewNet.currency })}
              </div>
            </div>
            <Toggle checked={r.enabled} onChange={(v) => onToggle(r.id, v)} />
          </div>
        ))}
      </Card>
      {active ? (
        <Card className="p-4">
          <div className="text-xs text-sand-500">Preview</div>
          <div className="font-mono text-sm">
            {formatMoney(previewNet)} →{' '}
            <span className="text-green-800">{formatMoney(applyMarkup(previewNet, active))}</span>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
