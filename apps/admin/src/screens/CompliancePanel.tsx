import type { SecurityCertificate } from '@auj/compliance';
import { Button, Card } from '@auj/ui';
import { formatMoney } from '../money';

export interface CompliancePanelProps {
  certificates: SecurityCertificate[];
  onExport: (customerId: string) => void;
  onErase: (customerId: string) => void;
}

export function CompliancePanel({ certificates, onExport, onErase }: CompliancePanelProps) {
  return (
    <Card className="p-4">
      <div className="mb-2 text-xs text-sand-500">Insolvency-protection certificates</div>
      <table className="w-full text-[13px]">
        <thead>
          <tr className="text-sand-500">
            <th className="text-left font-semibold">Certificate</th>
            <th className="text-left font-semibold">Booking</th>
            <th className="text-left font-semibold">Cover</th>
            <th className="text-left font-semibold">Delivered</th>
            <th className="text-right font-semibold">GDPR</th>
          </tr>
        </thead>
        <tbody>
          {certificates.map((c) => (
            <tr key={c.id} className="border-t border-sand-100">
              <td className="py-1 font-mono">{c.id}</td>
              <td className="py-1 font-mono">{c.bookingRef}</td>
              <td className="py-1">{formatMoney(c.coverage)}</td>
              <td className="py-1">{c.deliveredAt ? '✓' : '—'}</td>
              <td className="py-1 text-right">
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => onExport(c.customerId)}>
                    Export
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onErase(c.customerId)}>
                    Erase
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
