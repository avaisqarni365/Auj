import type { Money } from '@auj/contracts';
import type { JournalEntry } from '@auj/payments';
import { Card } from '@auj/ui';
import { formatMoney, formatWithPkr } from '../money';

export interface WalletViewProps {
  balance: Money;
  creditLimit: number;
  account: string;
  entries: JournalEntry[];
}

export function WalletView({ balance, creditLimit, account, entries }: WalletViewProps) {
  const used = balance.amount < 0 ? -balance.amount : 0;
  const pct = creditLimit > 0 ? Math.min(100, Math.round((used / creditLimit) * 100)) : 0;
  const txns = entries.flatMap((e) =>
    e.postings
      .filter((p) => p.account === account)
      .map((p) => ({
        label: e.memo || e.ref,
        debit: p.direction === 'DEBIT' ? p.amount : 0,
        credit: p.direction === 'CREDIT' ? p.amount : 0,
        currency: p.currency,
      })),
  );

  return (
    <div className="grid gap-3">
      <Card className="bg-green-800 p-5 text-white">
        <div className="text-xs opacity-80">Wallet balance</div>
        <div className="font-mono text-2xl">{formatMoney(balance)}</div>
        <div className="text-xs opacity-80">{formatWithPkr(balance)}</div>
      </Card>
      <Card className="p-4">
        <div className="flex justify-between text-sm">
          <span className="text-sand-700">Credit used</span>
          <span className="font-mono">
            {formatMoney({ amount: used, currency: balance.currency })} /{' '}
            {formatMoney({ amount: creditLimit, currency: balance.currency })}
          </span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-sand-100">
          <div className="h-2 rounded-full bg-gold" style={{ width: `${pct}%` }} />
        </div>
      </Card>
      <Card className="p-4">
        <div className="mb-2 text-xs text-sand-500">Transactions</div>
        <table className="w-full text-[13px]">
          <tbody>
            {txns.map((t, i) => (
              <tr key={i} className="border-t border-sand-100">
                <td className="py-1">{t.label}</td>
                <td className="py-1 text-right font-mono text-danger">
                  {t.debit ? formatMoney({ amount: t.debit, currency: t.currency }) : ''}
                </td>
                <td className="py-1 text-right font-mono text-success">
                  {t.credit ? formatMoney({ amount: t.credit, currency: t.currency }) : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
