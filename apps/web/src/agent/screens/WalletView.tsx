import { useTranslations } from 'next-intl';
import type { Money } from '@auj/contracts';
import type { JournalEntry } from '@auj/payments';
import { formatMoney, formatWithPkr } from '../money';

export interface WalletViewProps {
  balance: Money;
  creditLimit: number;
  account: string;
  entries: JournalEntry[];
}

export function WalletView({ balance, creditLimit, account, entries }: WalletViewProps) {
  const t = useTranslations('agent.wallet2');
  const used = balance.amount < 0 ? -balance.amount : 0;
  const pct = creditLimit > 0 ? Math.min(100, Math.round((used / creditLimit) * 100)) : 0;
  const available = creditLimit - used;
  const pkr = formatWithPkr(balance).split('≈')[1]?.trim();
  const txns = entries.flatMap((e) =>
    e.postings
      .filter((p) => p.account === account)
      .map((p) => ({ label: e.memo || e.ref, ref: e.ref, debit: p.direction === 'DEBIT' ? p.amount : 0, credit: p.direction === 'CREDIT' ? p.amount : 0, currency: p.currency })),
  );

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-green-700 to-green-950 p-5 text-green-50">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-green-100/80">{t('balance')}</span>
            <span className="text-lg">💳</span>
          </div>
          <div className="my-2 font-mono text-3xl font-bold">{formatMoney(balance)}</div>
          {pkr ? <div className="font-mono text-xs text-green-100/80">≈ {pkr}</div> : null}
          <button type="button" className="mt-4 rounded-[10px] bg-gold px-4 py-2.5 text-[13px] font-bold text-[#2A2010]">
            {t('topUp')}
          </button>
        </div>

        <div className="rounded-2xl border border-sand-200 bg-white p-5">
          <span className="text-[13px] text-sand-500">{t('creditLimit')}</span>
          <div className="my-2 font-mono text-2xl font-semibold">{formatMoney({ amount: creditLimit, currency: balance.currency })}</div>
          <div className="mb-2 h-[9px] overflow-hidden rounded-full bg-sand-100">
            <div className="h-full rounded-full bg-accent-600" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-sand-500">
              {t('used')} <strong className="text-sand-ink">{formatMoney({ amount: used, currency: balance.currency })}</strong>
            </span>
            <span className="font-semibold text-success-fg">{formatMoney({ amount: available, currency: balance.currency })} {t('available')}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-sand-200 bg-white p-5">
          <span className="text-[13px] text-sand-500">{t('paymentTerms')}</span>
          <div className="my-2 font-serif text-xl font-semibold">{t('net30')}</div>
          <div className="flex flex-col gap-1.5 text-[13px]">
            <div className="flex items-center justify-between">
              <span className="text-sand-700">{t('tier')}</span>
              <span className="rounded-full bg-warning-bg px-2.5 py-0.5 text-[11.5px] font-semibold text-warning-fg">{t('goldPartner')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white">
        <div className="border-b border-sand-100 px-5 py-3.5 text-sm font-bold">{t('transactions')}</div>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-sand-50 text-left text-sand-500">
              <th className="px-5 py-2.5 font-semibold">{t('colDescription')}</th>
              <th className="px-3 py-2.5 font-semibold">{t('colReference')}</th>
              <th className="px-3 py-2.5 text-right font-semibold">{t('colDebit')}</th>
              <th className="px-5 py-2.5 text-right font-semibold">{t('colCredit')}</th>
            </tr>
          </thead>
          <tbody>
            {txns.map((t, i) => (
              <tr key={i} className="border-t border-sand-100">
                <td className="px-5 py-2.5 font-medium">{t.label}</td>
                <td className="px-3 py-2.5 font-mono text-accent-600">{t.ref.slice(0, 12)}</td>
                <td className="px-3 py-2.5 text-right font-mono text-danger">{t.debit ? formatMoney({ amount: t.debit, currency: t.currency }) : ''}</td>
                <td className="px-5 py-2.5 text-right font-mono text-success">{t.credit ? formatMoney({ amount: t.credit, currency: t.currency }) : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
