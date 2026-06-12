import { Button, Card } from '@auj/ui';
import { formatMoney } from '../money';
import type { Statement } from '../domain';

export interface StatementsProps {
  statement: Statement;
  onExportCSV: () => void;
}

export function Statements({ statement, onExportCSV }: StatementsProps) {
  const m = (amount: number) => formatMoney({ amount, currency: statement.currency });
  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl text-sand-ink">Statement</h2>
        <Button size="sm" variant="secondary" onClick={onExportCSV}>
          Export CSV
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <div className="text-xs text-sand-500">Debits</div>
          <div className="font-mono text-danger">{m(statement.debits)}</div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-sand-500">Credits</div>
          <div className="font-mono text-success">{m(statement.credits)}</div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-sand-500">Closing</div>
          <div className="font-mono text-green-800">{m(statement.closing)}</div>
        </Card>
      </div>
      <Card className="p-4">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-sand-500">
              <th className="text-left font-semibold">Ref</th>
              <th className="text-right font-semibold">Debit</th>
              <th className="text-right font-semibold">Credit</th>
              <th className="text-right font-semibold">Balance</th>
            </tr>
          </thead>
          <tbody>
            {statement.rows.map((r, i) => (
              <tr key={i} className="border-t border-sand-100">
                <td className="py-1">{r.description || r.ref}</td>
                <td className="py-1 text-right font-mono text-danger">{r.debit ? m(r.debit) : ''}</td>
                <td className="py-1 text-right font-mono text-success">{r.credit ? m(r.credit) : ''}</td>
                <td className="py-1 text-right font-mono">{m(r.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
