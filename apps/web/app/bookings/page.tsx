import Link from 'next/link';
import { Logo, StatusPill, type PillTone } from '@auj/ui';
import type { Booking, BookingStatus } from '@auj/core-booking';
import { requireRole } from '../../src/auth/session';
import { getBookingBackend } from '../../src/book/backend/singleton';
import { formatMoney } from '../../src/currency';

const STATUS_TONE: Record<BookingStatus, PillTone> = {
  DRAFT: 'draft',
  HELD: 'info',
  CONFIRMED: 'info',
  VISA_IN_PROGRESS: 'warning',
  TICKETED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
  REFUNDED: 'draft',
};

const MODE_LABEL: Record<NonNullable<Booking['mode']>, string> = {
  COMPREHENSIVE: 'Comprehensive',
  VISA_OPTIONAL: 'Visa-optional',
  CUSTOM: 'Custom',
};

// The logged-in user's real bookings (any signed-in role). Booking is tied to the
// account by the customer email captured at checkout.
export default async function BookingsPage() {
  const user = await requireRole(['PILGRIM', 'AGENT', 'SUB_AGENT', 'ADMIN'], '/bookings');
  const bookings = await (await getBookingBackend()).booking.myBookings(user.email);

  return (
    <div className="min-h-screen bg-sand-50">
      <header className="border-b border-sand-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 text-sand-700">
            <Logo size={26} />
            <span className="font-serif text-base font-semibold tracking-[0.04em]">AUJ</span>
          </Link>
          <Link href="/book" className="text-[13px] font-semibold text-accent-600">+ New booking</Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="mb-1 font-serif text-2xl font-semibold">My bookings</h1>
        <p className="mb-5 text-sm text-sand-500">{bookings.length} booking{bookings.length === 1 ? '' : 's'} on {user.email}</p>

        {bookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-sand-300 bg-white p-8 text-center">
            <p className="text-sm text-sand-500">No bookings yet.</p>
            <Link href="/book" className="mt-3 inline-block rounded-xl bg-green-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700">Start a booking →</Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {bookings.map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function BookingCard({ booking: b }: { booking: Booking }) {
  const eur = b.items.find((i) => i.net.currency === 'EUR')?.net;
  const chips = [
    b.rawdah ? 'Rawdah permit' : null,
    b.gift ? 'Gift' : null,
    b.specialRequests && b.specialRequests.length > 0 ? `${b.specialRequests.length} request${b.specialRequests.length === 1 ? '' : 's'}` : null,
  ].filter(Boolean) as string[];

  return (
    <Link href={`/bookings/${b.id}`} className="block rounded-2xl border border-sand-200 bg-white p-4 transition-colors hover:border-sand-300 hover:bg-white/80">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="font-mono text-[14px] font-semibold">{b.bookingRef ?? b.id.slice(0, 16)}</div>
          <div className="text-[12px] text-sand-500">
            {b.channel === 'PILGRIMAGE' ? 'Pilgrimage' : 'Travel'}
            {b.mode ? ` · ${MODE_LABEL[b.mode]}` : ''} · {b.pilgrimIds.length} pilgrim{b.pilgrimIds.length === 1 ? '' : 's'} · {b.items.length} item{b.items.length === 1 ? '' : 's'}
          </div>
        </div>
        <StatusPill tone={STATUS_TONE[b.status]}>{b.status.replace(/_/g, ' ')}</StatusPill>
      </div>
      {chips.length > 0 ? (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <span key={c} className="rounded-full bg-sand-100 px-2.5 py-0.5 text-[11.5px] font-semibold text-sand-700">{c}</span>
          ))}
        </div>
      ) : null}
      <div className="mt-3 flex items-center justify-between border-t border-sand-100 pt-2.5">
        <span className="text-[12px] text-sand-500">{new Date(b.createdAt).toUTCString().slice(0, 16)}</span>
        {eur ? <span className="font-mono text-sm font-semibold text-green-800">{formatMoney(eur)}</span> : null}
      </div>
    </Link>
  );
}
