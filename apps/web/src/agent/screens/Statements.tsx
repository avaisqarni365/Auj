import { Button } from '@auj/ui';
import { formatMoney } from '../money';
import type { Statement } from '../domain';

export interface StatementsProps {
  statement: Statement;
  onExportCSV: () => void;
}

export function Statements({ statement, onExportCSV }: StatementsProps) {
  const m = (amount: number) => formatMoney({ amount, currency: statement.currency });
  const kpis = [
    { label: 'Opening', value: m(statement.opening), color: 'text-sand-ink' },
    { label: 'Debits', value: m(statement.debits), color: 'text-danger' },
    { label: 'Credits', value: m(statement.credits), color: 'text-success' },
    { label: 'Closing', value: m(statement.closing), color: 'text-green-800' },
  ];
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="rounded-[10px] border-[1.5px] border-sand-300 bg-white px-3.5 py-2 text-[13px] font-medium">📅 01 – 31 May 2026</span>
          <span className="rounded-[10px] border-[1.5px] border-sand-300 bg-white px-3.5 py-2 text-[13px] font-medium">All products ▾</span>
          <span className="rounded-[10px] border-[1.5px] border-sand-300 bg-white px-3.5 py-2 text-[13px] font-medium">All status ▾</span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={onExportCSV}>
            Export CSV
          </Button>
          <Button size="sm" variant="secondary">
            XLSX
          </Button>
          <Button size="sm">Statement PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border border-sand-200 bg-white p-4">
            <div className="text-[12.5px] text-sand-500">{k.label}</div>
            <div className={`mt-1.5 font-mono text-[22px] font-semibold ${k.color}`}>{k.value}</div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-sand-50 text-left text-sand-500">
              <th className="px-5 py-3 font-semibold">Reference</th>
              <th className="px-3 py-3 font-semibold">Description</th>
              <th className="px-3 py-3 text-right font-semibold">Debit</th>
              <th className="px-3 py-3 text-right font-semibold">Credit</th>
              <th className="px-5 py-3 text-right font-semibold">Balance</th>
            </tr>
          </thead>
          <tbody>
            {statement.rows.map((r, i) => (
              <tr key={i} className="border-t border-sand-100">
                <td className="px-5 py-3 font-mono text-accent-600">{r.ref}</td>
                <td className="px-3 py-3 font-medium">{r.description || '—'}</td>
                <td className="px-3 py-3 text-right font-mono text-danger">{r.debit ? m(r.debit) : ''}</td>
                <td className="px-3 py-3 text-right font-mono text-success">{r.credit ? m(r.credit) : ''}</td>
                <td className="px-5 py-3 text-right font-mono">{m(r.balance)}</td>
              </tr>
            ))}
            <tr className="border-t border-sand-200 bg-sand-50 font-semibold">
              <td className="px-5 py-3" colSpan={4}>
                Closing balance
              </td>
              <td className="px-5 py-3 text-right font-mono text-green-800">{m(statement.closing)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
