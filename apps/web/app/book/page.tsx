import type { SearchCriteria } from '@auj/contracts';
import { requireRole } from '../../src/auth/session';
import { BookingFunnel } from '../../src/book/BookingFunnel';
import { SitePage } from '../../src/components/SitePage';

const CITIES = ['MAKKAH', 'MADINAH', 'JEDDAH'] as const;

function toCity(raw: string | undefined): SearchCriteria['city'] {
  return (CITIES as readonly string[]).includes(raw ?? '') ? (raw as SearchCriteria['city']) : 'MAKKAH';
}

const isDate = (v: string | undefined): v is string => !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);

// Booking funnel — any signed-in user. The booking is attached to their account.
export default async function BookPage({ searchParams }: { searchParams: { city?: string; pax?: string; checkIn?: string; checkOut?: string } }) {
  const user = await requireRole(['PILGRIM', 'AGENT', 'SUB_AGENT', 'ADMIN'], '/book');
  const pax = Math.min(49, Math.max(1, Number.parseInt(searchParams.pax ?? '1', 10) || 1));
  return (
    <SitePage user={user}>
      <BookingFunnel
        initialCity={toCity(searchParams.city)}
        initialPax={pax}
        initialCheckIn={isDate(searchParams.checkIn) ? searchParams.checkIn : ''}
        initialCheckOut={isDate(searchParams.checkOut) ? searchParams.checkOut : ''}
      />
    </SitePage>
  );
}
