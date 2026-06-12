import type { Money } from '@auj/contracts';
import { Button, Card } from '@auj/ui';
import { formatMoney } from '../money';
import { MAX_PAX } from '../multipax';

export interface MultiPaxBookingProps {
  paxCount: number;
  sell: Money;
  canBook: boolean;
  onAddRow: () => void;
  onAdd10: () => void;
  onPayFromWallet: () => void;
}

export function MultiPaxBooking({ paxCount, sell, canBook, onAddRow, onAdd10, onPayFromWallet }: MultiPaxBookingProps) {
  const full = paxCount >= MAX_PAX;
  return (
    <Card className="grid gap-3 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sand-700">Passengers</span>
        <span className="font-mono text-sand-ink">
          {paxCount} / {MAX_PAX}
        </span>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={onAddRow} disabled={full}>
          Add row
        </Button>
        <Button size="sm" variant="secondary" onClick={onAdd10} disabled={full}>
          Add 10
        </Button>
      </div>
      <div className="flex items-center justify-between border-t border-sand-200 pt-3">
        <span className="text-sand-700">Client price</span>
        <span className="font-mono text-green-800">{formatMoney(sell)}</span>
      </div>
      <Button onClick={onPayFromWallet} disabled={!canBook}>
        Pay from wallet
      </Button>
    </Card>
  );
}
