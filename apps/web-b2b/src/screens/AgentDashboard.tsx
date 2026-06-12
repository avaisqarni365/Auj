import type { Money } from '@auj/contracts';
import { Card, StatusPill, type PillTone } from '@auj/ui';
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

export function AgentDashboard({ agent, walletBalance, available, bookings }: AgentDashboardProps) {
  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl text-sand-ink">{agent.agencyName}</h2>
        <StatusPill tone={statusTone(agent.status)}>{agent.status}</StatusPill>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="text-xs text-sand-500">Wallet</div>
          <div className="font-mono text-lg text-green-800">{formatMoney(walletBalance)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-sand-500">Available</div>
          <div className="font-mono text-lg text-green-800">{formatMoney(available)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-sand-500">Bookings</div>
          <div className="font-mono text-lg text-green-800">{bookings}</div>
        </Card>
      </div>
    </div>
  );
}
