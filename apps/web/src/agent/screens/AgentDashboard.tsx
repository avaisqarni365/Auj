import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { JournalEntry } from '@auj/payments';
import { StatusPill, type PillTone } from '@auj/ui';
import { formatMoney } from '../money';
import type { Agent } from '../domain';

function statusTone(status: Agent['status']): PillTone {
  if (status === 'APPROVED') return 'success';
  if (status === 'PENDING') return 'warning';
  return 'danger';
}

export interface AgentDashboardProps {
  agent: Agent;
  balance: number; // EUR minor units; negative = credit consumed
  creditLimit: number; // EUR minor units
  entries: JournalEntry[];
  account: string; // wallet account id, e.g. wallet:<agentId>
}

export function AgentDashboard({ agent, balance, creditLimit, entries, account }: AgentDashboardProps) {
  const t = useTranslations('agent');
  const eur = (amount: number) => formatMoney({ amount, currency: 'EUR' as const });

  const used = balance < 0 ? -balance : 0;
  const available = creditLimit - used; // available-to-book (matches the ledger view)
  const utilPct = creditLimit > 0 ? Math.max(0, Math.min(100, Math.round((available / creditLimit) * 100))) : 0;

  // Real activity, derived from the agency's own ledger postings on the wallet account.
  const activity = useMemo(() => {
    let billed = 0;
    let toppedUp = 0;
    let bookings = 0;
    for (const e of entries) {
      const p = e.postings.find((x) => x.account === account);
      if (!p) continue;
      if (p.direction === 'DEBIT') {
        billed += p.amount;
        if (!/refund|ref-/i.test(`${e.memo ?? ''} ${e.ref}`)) bookings += 1;
      } else {
        toppedUp += p.amount;
      }
    }
    return { billed, toppedUp, bookings };
  }, [entries, account]);

  const kpis = [
    { label: t('kpi.walletBalance'), value: eur(balance) },
    { label: t('kpi.available'), value: eur(available) },
    { label: t('kpi.bookings'), value: String(activity.bookings) },
    { label: t('kpi.tier'), value: agent.tier },
  ];

  const activityRows = [
    { label: 'Group bookings', value: String(activity.bookings), color: 'bg-green-800', pct: activity.bookings > 0 ? '100%' : '6%' },
    { label: 'Total billed to wallet', value: eur(activity.billed), color: 'bg-info', pct: creditLimit > 0 ? `${Math.min(100, Math.round((activity.billed / creditLimit) * 100))}%` : '6%' },
    { label: 'Top-ups received', value: eur(activity.toppedUp), color: 'bg-success', pct: activity.billed + activity.toppedUp > 0 ? `${Math.round((activity.toppedUp / (activity.billed + activity.toppedUp)) * 100)}%` : '6%' },
  ];

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl text-sand-ink">{agent.agencyName}</h2>
        <StatusPill tone={statusTone(agent.status)}>{agent.status}</StatusPill>
      </div>

      <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border border-sand-200 bg-white p-4">
            <div className="text-[12.5px] font-medium text-sand-500">{k.label}</div>
            <div className="mt-1.5 font-mono text-2xl font-semibold text-sand-ink">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-3.5 md:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-sand-200 bg-white p-5">
          <div className="mb-3.5 text-sm font-bold">Account activity</div>
          {activityRows.map((v) => (
            <div key={v.label} className="mb-3">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[12.5px] text-sand-700">{v.label}</span>
                <span className="font-mono text-[12.5px] font-semibold">{v.value}</span>
              </div>
              <div className="h-[7px] overflow-hidden rounded-full bg-sand-100">
                <div className={`h-full rounded-full ${v.color}`} style={{ width: v.pct }} />
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-2xl bg-green-800 p-5 text-green-50">
          <div className="text-[13px] text-green-100/80">{t('creditAvailable')}</div>
          <div className="my-1 font-mono text-2xl font-semibold">{eur(available)}</div>
          <div className="text-[11.5px] text-green-100/70">{eur(used)} used of {eur(creditLimit)} credit</div>
          <div className="mt-2.5 h-[7px] overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-gold" style={{ width: `${utilPct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
