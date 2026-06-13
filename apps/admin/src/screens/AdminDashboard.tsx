import { Card } from '@auj/ui';
import { formatMoney } from '../money';
import type { AdminMetrics } from '../usecases';

export interface AdminDashboardProps {
  metrics: AdminMetrics;
}

export function AdminDashboard({ metrics }: AdminDashboardProps) {
  const kpis = [
    { label: 'Bookings', value: String(metrics.totalBookings) },
    { label: 'Active', value: String(metrics.active) },
    { label: 'Visas issued', value: String(metrics.visaIssued) },
    { label: 'Revenue', value: formatMoney(metrics.revenueEur) },
  ];
  return (
    <div className="grid grid-cols-4 gap-3">
      {kpis.map((k) => (
        <Card key={k.label} className="p-4">
          <div className="text-xs text-sand-500">{k.label}</div>
          <div className="font-mono text-lg text-green-800">{k.value}</div>
        </Card>
      ))}
    </div>
  );
}
