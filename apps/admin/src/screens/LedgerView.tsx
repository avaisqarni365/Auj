import type { JournalEntry } from '@auj/payments';
import { Card } from '@auj/ui';
import { formatMoney } from '../money';

export interface LedgerViewProps {
  entries: JournalEntry[];
}

export function LedgerView({ entries }: LedgerViewProps) {
  const rows = entries.flatMap((e) =>
    e.postings.map((p) => ({ ref: e.ref, memo: e.memo ?? '', account: p.account, dir: p.direction, amount: p.amount, currency: p.currency })),
  );
  return (
    <Card className="p-4">
      <div className="mb-2 text-xs text-sand-500">Ledger postings</div>
      <table className="w-full text-[13px]">
        <thead>
          <tr className="text-sand-500">
            <th className="text-left font-semibold">Account</th>
            <th className="text-left font-semibold">Memo</th>
            <th className="text-left font-semibold">Dir</th>
            <th className="text-right font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-sand-100">
              <td className="py-1 font-mono">{r.account}</td>
              <td className="py-1">{r.memo}</td>
              <td className="py-1">{r.dir}</td>
              <td className="py-1 text-right font-mono">{formatMoney({ amount: r.amount, currency: r.currency })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
