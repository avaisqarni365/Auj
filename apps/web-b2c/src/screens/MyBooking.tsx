import type { Booking, VisaCase } from '@auj/core-booking';
import { Button } from '@auj/ui';
import { t, type Locale } from '../i18n';

const FLOW: Array<{ key: VisaCase['status']; title: string; sub: string }> = [
  { key: 'DRAFT', title: 'Application created', sub: 'Visa case opened' },
  { key: 'SUBMITTED', title: 'Submitted to authority', sub: 'Awaiting review' },
  { key: 'PAID', title: 'Fees paid', sub: 'Processing' },
  { key: 'ISSUED', title: 'Visa issued', sub: 'Ready to travel' },
];

export interface MyBookingProps {
  locale: Locale;
  booking: Booking;
  visaCase?: VisaCase;
}

export function MyBooking({ locale, booking, visaCase }: MyBookingProps) {
  const status = visaCase?.status ?? 'DRAFT';
  const currentIndex = FLOW.findIndex((s) => s.key === status);
  const issued = status === 'ISSUED';

  return (
    <div className="min-h-screen bg-green-800">
      {/* green header */}
      <div className="bg-green-800 px-5 pb-6 pt-4 text-green-50">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xl">←</span>
          <span className="text-[15px] font-semibold">{t(locale, 'my_booking')}</span>
          <span className="text-[19px]">⋯</span>
        </div>
        <div className="text-xs tracking-[0.04em] text-green-100/80">BOOKING REFERENCE</div>
        <div className="my-1 font-mono text-2xl font-semibold tracking-[0.02em]">{booking.bookingRef ?? booking.id.slice(0, 16)}</div>
        <div className="font-serif text-[19px] font-medium">Umrah Premium · 14 nights</div>
        <div className="text-[13px] text-green-100/80">12 – 26 Sep 2026 · {booking.pilgrimIds.length} pilgrims</div>
      </div>

      {/* sheet */}
      <div className="-mt-2.5 min-h-[60vh] rounded-t-[28px] bg-sand-50 px-4 pb-6 pt-5">
        {/* live visa tracker */}
        <div className="mb-3.5 rounded-2xl border border-sand-200 bg-white p-4">
          <div className="mb-3.5 flex items-center justify-between">
            <span className="text-sm font-bold">Live visa status</span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                issued ? 'bg-success-bg text-success-fg' : 'bg-warning-bg text-warning-fg'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${issued ? 'bg-success-fg' : 'bg-warning'}`} />
              {issued ? 'Issued' : 'In progress'}
            </span>
          </div>
          {FLOW.map((step, i) => {
            const done = currentIndex >= 0 && i <= currentIndex;
            const active = i === currentIndex && !issued;
            const last = i === FLOW.length - 1;
            return (
              <div key={step.key} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 text-[11px] text-white ${
                      done ? 'border-success bg-success' : active ? 'border-warning bg-warning' : 'border-sand-300 bg-white'
                    }`}
                  >
                    {done ? '✓' : ''}
                  </div>
                  {!last ? <div className={`min-h-[18px] w-0.5 flex-1 ${i < currentIndex ? 'bg-success' : 'bg-sand-200'}`} /> : null}
                </div>
                <div className="pb-3.5">
                  <div className={`text-[13.5px] font-semibold ${done || active ? 'text-sand-ink' : 'text-sand-500'}`}>{step.title}</div>
                  <div className="text-xs text-sand-500">{step.sub}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* pilgrims & visas */}
        <div className="mx-1 mb-2.5 text-[13px] font-bold">Pilgrims &amp; visas</div>
        <div className="mb-4 grid gap-2">
          {booking.pilgrimIds.map((pid, i) => {
            const per = visaCase?.perPilgrim[i];
            const evisa = (per?.route ?? visaCase?.route) === 'EVISA_DIRECT';
            return (
              <div key={pid} className="flex items-center gap-3 rounded-xl border border-sand-200 bg-white px-3 py-2.5">
                <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-green-700 text-[13px] font-semibold text-white">
                  P{i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-semibold">Pilgrim {i + 1}</div>
                  <div className="font-mono text-[11px] text-sand-500">{booking.items[0]?.brn ?? booking.bookingRef ?? '—'}</div>
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${evisa ? 'bg-success-bg text-success-fg' : 'bg-info-bg text-info-fg'}`}>
                  {evisa ? t(locale, 'visa_evisa') : t(locale, 'visa_agent')}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2.5">
          <Button variant="secondary" size="sm" className="flex-1 !py-3">
            Itinerary
          </Button>
          <Button variant="secondary" size="sm" className="flex-1 !py-3">
            Documents
          </Button>
          <Button variant="accent" size="sm" className="flex-1 !py-3">
            Support
          </Button>
        </div>
      </div>
    </div>
  );
}
