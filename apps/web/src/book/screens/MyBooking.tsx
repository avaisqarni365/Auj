import type { Booking, SpecialRequestCategory, VisaCase } from '@auj/core-booking';
import { Button } from '@auj/ui';
import { t, type Locale } from '../i18n';

const MODE_LABEL: Record<NonNullable<Booking['mode']>, string> = {
  COMPREHENSIVE: 'Comprehensive package',
  VISA_OPTIONAL: 'Visa-optional package',
  CUSTOM: 'Custom package',
};

const REQUEST_LABEL: Record<SpecialRequestCategory, string> = {
  WHEELCHAIR: '♿ Wheelchair access',
  DIETARY: '🍽 Dietary needs',
  ROOM_NEAR_HARAM: '🕋 Room near Haram',
  LATE_CHECKOUT: '🕔 Late checkout',
  OTHER: '📝 Note',
};

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
        {booking.mode ? (
          <span className="mt-2 inline-flex items-center rounded-full bg-green-50/15 px-2.5 py-1 text-[11px] font-semibold text-green-50">
            {MODE_LABEL[booking.mode]}
          </span>
        ) : null}
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

        {/* Rawdah permit */}
        {booking.rawdah ? (
          <div className="mb-3.5 flex items-center gap-3 rounded-2xl border border-sand-200 bg-white p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-800/5 text-[20px]">🕋</div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">Rawdah permit</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success-bg px-2.5 py-1 text-[11px] font-semibold text-success-fg">
                  {booking.rawdah.status === 'CONFIRMED' ? 'Confirmed' : booking.rawdah.status === 'REQUESTED' ? 'Requested' : 'Rejected'}
                </span>
              </div>
              <div className="mt-0.5 text-[12px] text-sand-500">
                {new Date(booking.rawdah.startsAt).toUTCString().slice(0, 22)} · {booking.rawdah.pilgrimIds.length} pilgrims
              </div>
              <div className="mt-0.5 font-mono text-[11px] text-sand-500">{booking.rawdah.permitRef}</div>
            </div>
          </div>
        ) : null}

        {/* Gift voucher */}
        {booking.gift ? (
          <div className="mb-3.5 rounded-2xl border border-gold/40 bg-gradient-to-br from-[#FBF6EA] to-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/20 text-[20px]">🎁</div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold">Gift voucher</div>
                <div className="text-[12px] text-sand-500">For {booking.gift.recipientName}{booking.gift.recipientEmail ? ` · ${booking.gift.recipientEmail}` : ''}</div>
              </div>
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${booking.gift.redeemed ? 'bg-sand-100 text-sand-600' : 'bg-success-bg text-success-fg'}`}>
                {booking.gift.redeemed ? 'Redeemed' : 'Active'}
              </span>
            </div>
            <div className="mt-2.5 rounded-lg border border-dashed border-gold/50 bg-white px-3 py-2 text-center">
              <div className="text-[10.5px] uppercase tracking-wider text-sand-500">Voucher code</div>
              <div className="font-mono text-[15px] font-bold tracking-[0.06em] text-green-800">{booking.gift.voucherCode}</div>
            </div>
            {booking.gift.message ? <p className="mt-2 text-center text-[12.5px] italic text-sand-700">“{booking.gift.message}”</p> : null}
          </div>
        ) : null}

        {/* Special requests */}
        {booking.specialRequests && booking.specialRequests.length > 0 ? (
          <div className="mb-3.5 rounded-2xl border border-sand-200 bg-white p-4">
            <div className="mb-2 text-sm font-bold">Special requests</div>
            <div className="grid gap-2">
              {booking.specialRequests.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-2 rounded-xl bg-sand-50 px-3 py-2">
                  <span className="text-[13px] text-sand-700">{REQUEST_LABEL[r.category]}{r.note ? ` — ${r.note}` : ''}</span>
                  <span className="shrink-0 rounded-full bg-info-bg px-2 py-0.5 text-[10.5px] font-semibold text-info-fg">{r.status}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

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
