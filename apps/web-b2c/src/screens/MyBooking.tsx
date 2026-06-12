import type { Booking, VisaCase } from '@auj/core-booking';
import { Card, StatusPill, type PillTone } from '@auj/ui';
import { t, type Locale } from '../i18n';

function visaTone(status: VisaCase['status']): PillTone {
  if (status === 'ISSUED') return 'success';
  if (status === 'REJECTED') return 'danger';
  return 'warning';
}

export interface MyBookingProps {
  locale: Locale;
  booking: Booking;
  visaCase?: VisaCase;
}

export function MyBooking({ locale, booking, visaCase }: MyBookingProps) {
  const brns = booking.items.map((i) => i.brn).filter((b): b is string => Boolean(b));
  return (
    <div className="grid gap-3">
      <Card className="bg-green-800 p-5 text-white">
        <div className="text-xs opacity-80">{t(locale, 'my_booking')}</div>
        <div className="font-mono text-2xl">{booking.bookingRef ?? booking.id}</div>
      </Card>
      <Card className="p-4">
        <div className="text-xs text-sand-500">BRNs</div>
        <div className="font-mono text-sand-ink">{brns.join(', ') || '—'}</div>
      </Card>
      {visaCase ? (
        <Card className="flex items-center justify-between p-4">
          <span className="text-sand-700">{t(locale, 'visa_route')}</span>
          <StatusPill tone={visaTone(visaCase.status)}>{visaCase.status}</StatusPill>
        </Card>
      ) : null}
    </div>
  );
}
