import { Button, Card } from '@auj/ui';
import { formatMoney } from '../money';
import type { Quotation } from '../domain';

export interface QuotationBuilderProps {
  quote: Quotation;
  onSend: () => void;
  onConvert: () => void;
}

export function QuotationBuilder({ quote, onSend, onConvert }: QuotationBuilderProps) {
  return (
    <Card className="grid gap-3 p-4">
      <div className="flex items-center justify-between">
        <span className="font-serif text-lg text-sand-ink">Quote</span>
        <span className="text-xs text-sand-500">{quote.status}</span>
      </div>
      {quote.lines.map((l, i) => (
        <div key={i} className="flex justify-between text-sm">
          <span>{l.label}</span>
          <span className="font-mono">{formatMoney(l.net)}</span>
        </div>
      ))}
      <div className="border-t border-sand-200 pt-2 text-sm">
        <div className="flex justify-between">
          <span className="text-sand-500">Net</span>
          <span className="font-mono">{formatMoney(quote.netTotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sand-500">Markup</span>
          <span className="font-mono">{formatMoney(quote.markup)}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Client total</span>
          <span className="font-mono text-green-800">{formatMoney(quote.sell)}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={onSend}>
          Send quote
        </Button>
        <Button size="sm" onClick={onConvert}>
          Convert to booking
        </Button>
      </div>
    </Card>
  );
}
