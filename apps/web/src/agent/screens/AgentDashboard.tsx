import { useTranslations } from 'next-intl';
import type { Money } from '@auj/contracts';
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
  walletBalance: Money;
  available: Money;
  bookings: number;
}

const PIPELINE = [
  { key: 'eVisa', count: 18, pct: '70%', color: 'bg-success' },
  { key: 'review', count: 9, pct: '40%', color: 'bg-info' },
  { key: 'issued', count: 24, pct: '88%', color: 'bg-green-800' },
] as const;

export function AgentDashboard({ agent, walletBalance, available, bookings }: AgentDashboardProps) {
  const t = useTranslations('agent');
  const kpis = [
    { label: t('kpi.walletBalance'), value: formatMoney(walletBalance) },
    { label: t('kpi.available'), value: formatMoney(available) },
    { label: t('kpi.bookings'), value: String(bookings) },
    { label: t('kpi.tier'), value: agent.tier },
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
          <div className="mb-3.5 text-sm font-bold">{t('visaPipeline')}</div>
          {PIPELINE.map((v) => (
            <div key={v.key} className="mb-3">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[12.5px] text-sand-700">{t(`pipeline.${v.key}`)}</span>
                <span className="font-mono text-[12.5px] font-semibold">{v.count}</span>
              </div>
              <div className="h-[7px] overflow-hidden rounded-full bg-sand-100">
                <div className={`h-full rounded-full ${v.color}`} style={{ width: v.pct }} />
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-2xl bg-green-800 p-5 text-green-50">
          <div className="text-[13px] text-green-100/80">{t('creditAvailable')}</div>
          <div className="my-1 font-mono text-2xl font-semibold">{formatMoney(available)}</div>
          <div className="mt-2.5 h-[7px] overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-gold" style={{ width: '58%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
