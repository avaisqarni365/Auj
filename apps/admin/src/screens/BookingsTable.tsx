import type { Booking } from '@auj/core-booking';
import { Button, Card, StatusPill, type PillTone } from '@auj/ui';

function tone(status: Booking['status']): PillTone {
  if (status === 'COMPLETED' || status === 'TICKETED') return 'success';
  if (status === 'CANCELLED' || status === 'REFUNDED') return 'danger';
  if (status === 'DRAFT') return 'draft';
  return 'info';
}

export interface BookingsTableProps {
  bookings: Booking[];
  onCancel: (id: string) => void;
  onRefund: (id: string) => void;
}

export function BookingsTable({ bookings, onCancel, onRefund }: BookingsTableProps) {
  return (
    <Card className="p-4">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="text-sand-500">
            <th className="text-left font-semibold">Ref</th>
            <th className="text-left font-semibold">Channel</th>
            <th className="text-left font-semibold">Status</th>
            <th className="text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id} className="border-t border-sand-100">
              <td className="py-1 font-mono">{b.bookingRef ?? b.id.slice(0, 8)}</td>
              <td className="py-1">{b.channel}</td>
              <td className="py-1">
                <StatusPill tone={tone(b.status)}>{b.status}</StatusPill>
              </td>
              <td className="py-1 text-right">
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => onCancel(b.id)}>
                    Cancel
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onRefund(b.id)}>
                    Refund
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
