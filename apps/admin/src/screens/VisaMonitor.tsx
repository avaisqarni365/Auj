import type { VisaCase } from '@auj/core-booking';
import { Card, StatusPill, type PillTone } from '@auj/ui';

function tone(status: VisaCase['status']): PillTone {
  if (status === 'ISSUED') return 'success';
  if (status === 'REJECTED') return 'danger';
  return 'warning';
}

export interface VisaMonitorProps {
  cases: VisaCase[];
}

export function VisaMonitor({ cases }: VisaMonitorProps) {
  return (
    <Card className="p-4">
      <div className="mb-2 text-xs text-sand-500">Visa cases</div>
      <table className="w-full text-[13px]">
        <thead>
          <tr className="text-sand-500">
            <th className="text-left font-semibold">Visa ref</th>
            <th className="text-left font-semibold">Route</th>
            <th className="text-right font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((v) => (
            <tr key={v.id} className="border-t border-sand-100">
              <td className="py-1 font-mono">{v.visaRef}</td>
              <td className="py-1">{v.route}</td>
              <td className="py-1 text-right">
                <StatusPill tone={tone(v.status)}>{v.status}</StatusPill>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
