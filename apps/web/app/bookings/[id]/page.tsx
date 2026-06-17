import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { StatusPill, type PillTone } from '@auj/ui';
import { routeFor } from '@auj/visa-router';
import type { Booking, BookingStatus, CrmPilgrim, Document, SpecialRequestCategory } from '@auj/core-booking';
import { requireRole } from '../../../src/auth/session';
import { getBookingBackend } from '../../../src/book/backend/singleton';
import { uploadDocumentAction } from '../../../src/book/doc-actions';
import { formatMoney } from '../../../src/currency';
import { SitePage } from '../../../src/components/SitePage';

const STATUS_TONE: Record<BookingStatus, PillTone> = {
  DRAFT: 'draft', HELD: 'info', CONFIRMED: 'info', VISA_IN_PROGRESS: 'warning',
  TICKETED: 'info', COMPLETED: 'success', CANCELLED: 'danger', REFUNDED: 'draft',
};
const MODE_LABEL: Record<NonNullable<Booking['mode']>, string> = {
  COMPREHENSIVE: 'Comprehensive package', VISA_OPTIONAL: 'Visa-optional package', CUSTOM: 'Custom package',
};
const REQUEST_LABEL: Record<SpecialRequestCategory, string> = {
  WHEELCHAIR: '♿ Wheelchair access', DIETARY: '🍽 Dietary needs', ROOM_NEAR_HARAM: '🕋 Room near Haram', LATE_CHECKOUT: '🕔 Late checkout', OTHER: '📝 Note',
};

export default async function BookingDetailPage({ params }: { params: { id: string } }) {
  const user = await requireRole(['PILGRIM', 'AGENT', 'SUB_AGENT', 'ADMIN'], '/bookings');
  const backend = (await getBookingBackend()).booking;
  const booking = await backend.myBooking(user.email, params.id);
  if (!booking) notFound();
  const pilgrims = await backend.pilgrims(booking.pilgrimIds);
  const docs = await backend.documentsForPilgrims(booking.pilgrimIds);
  const docsByPilgrim = (id: string): Document[] => docs.filter((d) => d.pilgrimId === id);

  return (
    <SitePage user={user}>
      <div className="mx-auto max-w-3xl px-4 py-6">
        <Link href="/bookings" className="mb-4 inline-block text-[13px] font-semibold text-accent-600 hover:text-accent-700">← My bookings</Link>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="font-mono text-xl font-semibold">{booking.bookingRef ?? booking.id.slice(0, 16)}</div>
            <div className="text-[13px] text-sand-500">
              {booking.channel === 'PILGRIMAGE' ? 'Pilgrimage' : 'Travel'}
              {booking.mode ? ` · ${MODE_LABEL[booking.mode]}` : ''} · {new Date(booking.createdAt).toUTCString().slice(0, 16)}
            </div>
          </div>
          <StatusPill tone={STATUS_TONE[booking.status]}>{booking.status.replace(/_/g, ' ')}</StatusPill>
        </div>

        {/* Items + BRNs */}
        <Section title="Items">
          {booking.items.length === 0 ? (
            <p className="text-sm text-sand-500">No items.</p>
          ) : (
            <div className="grid gap-2">
              {booking.items.map((it, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl bg-sand-50 px-3 py-2">
                  <div>
                    <div className="text-[13.5px] font-semibold">{it.title}</div>
                    <div className="text-[11px] text-sand-500">{it.kind}{it.brn ? ` · BRN ${it.brn}` : ''}</div>
                  </div>
                  <span className="font-mono text-[13px] font-semibold text-green-800">{formatMoney(it.net)}</span>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Pilgrims + per-pilgrim visa route */}
        <Section title={`Pilgrims (${pilgrims.length})`}>
          <div className="grid gap-2">
            {pilgrims.map((p: CrmPilgrim) => {
              const evisa = routeFor(p).route === 'EVISA_DIRECT';
              const pd = docsByPilgrim(p.id);
              return (
                <div key={p.id} className="rounded-xl border border-sand-200 px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[13.5px] font-semibold">{p.firstName} {p.lastName}</div>
                      <div className="text-[11px] text-sand-500">{p.nationality} · {p.passportNumber}</div>
                    </div>
                    <StatusPill tone={evisa ? 'success' : 'info'}>{evisa ? 'e-Visa' : 'Agent channel'}</StatusPill>
                  </div>

                  {/* documents */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {pd.length === 0 ? <span className="text-[11.5px] text-sand-500">No documents yet.</span> : null}
                    {pd.map((d) => (
                      <span key={d.id} className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${d.verified ? 'bg-success-bg text-success-fg' : 'bg-sand-100 text-sand-700'}`}>
                        📄 {d.type}{d.verified ? ' ✓' : ''}
                      </span>
                    ))}
                  </div>

                  <form action={uploadDocumentAction} className="mt-2 flex flex-wrap items-center gap-2">
                    <input type="hidden" name="pilgrimId" value={p.id} />
                    <input type="hidden" name="bookingId" value={booking.id} />
                    <select name="type" defaultValue="PASSPORT" className="rounded-lg border border-sand-300 bg-white px-2 py-1.5 text-[12.5px]">
                      <option value="PASSPORT">Passport</option>
                      <option value="PHOTO">Visa photo</option>
                      <option value="VISA">Visa</option>
                      <option value="OTHER">Other</option>
                    </select>
                    <input type="file" name="file" required className="text-[12px] text-sand-600 file:mr-2 file:rounded-md file:border-0 file:bg-sand-100 file:px-2.5 file:py-1.5 file:text-[12px] file:font-semibold" />
                    <button type="submit" className="rounded-lg bg-green-800 px-3 py-1.5 text-[12.5px] font-semibold text-white hover:bg-green-700">Upload</button>
                  </form>
                </div>
              );
            })}
          </div>
        </Section>

        {booking.rawdah ? (
          <Section title="Rawdah permit">
            <Row label="Riyadh ul-Jannah" value={`${booking.rawdah.status} · ${booking.rawdah.permitRef}`} />
          </Section>
        ) : null}

        {booking.gift ? (
          <Section title="Gift voucher">
            <Row label={`For ${booking.gift.recipientName}`} value={`${booking.gift.voucherCode} · ${booking.gift.redeemed ? 'Redeemed' : 'Active'}`} />
          </Section>
        ) : null}

        {booking.specialRequests && booking.specialRequests.length > 0 ? (
          <Section title="Special requests">
            <div className="grid gap-2">
              {booking.specialRequests.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-xl bg-sand-50 px-3 py-2">
                  <span className="text-[13px] text-sand-700">{REQUEST_LABEL[r.category]}{r.note ? ` — ${r.note}` : ''}</span>
                  <span className="rounded-full bg-info-bg px-2 py-0.5 text-[10.5px] font-semibold text-info-fg">{r.status}</span>
                </div>
              ))}
            </div>
          </Section>
        ) : null}
      </div>
    </SitePage>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-3.5 rounded-2xl border border-sand-200 bg-white p-4">
      <div className="mb-2.5 text-sm font-bold">{title}</div>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-sand-50 px-3 py-2">
      <span className="text-[13px] text-sand-700">{label}</span>
      <span className="font-mono text-[12px] text-sand-500">{value}</span>
    </div>
  );
}
