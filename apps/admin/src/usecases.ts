import type { Money } from '@auj/contracts';
import type { Booking } from '@auj/core-booking';
import type { AdminApi } from './ports';

export interface AdminMetrics {
  totalBookings: number;
  active: number; // confirmed and beyond, not cancelled/refunded
  visaIssued: number;
  revenueEur: Money;
}

const ACTIVE: ReadonlySet<Booking['status']> = new Set(['CONFIRMED', 'VISA_IN_PROGRESS', 'TICKETED', 'COMPLETED']);

export async function adminMetrics(admin: AdminApi): Promise<AdminMetrics> {
  const [bookings, visaCases] = await Promise.all([admin.listBookings(), admin.listVisaCases()]);
  return {
    totalBookings: bookings.length,
    active: bookings.filter((b) => ACTIVE.has(b.status)).length,
    visaIssued: visaCases.filter((v) => v.status === 'ISSUED').length,
    revenueEur: { amount: admin.accountBalance('revenue:bookings', 'EUR'), currency: 'EUR' },
  };
}
