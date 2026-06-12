import { describe, it, expect } from 'vitest';
import { runTravelSupplierContractTests } from '@auj/contracts/contract-tests';
import type { Pilgrim } from '@auj/contracts';
import { createTravelConnector } from './index';

// The shared, implementation-agnostic contract the mock also satisfies.
runTravelSupplierContractTests('connector-travel', () => createTravelConnector());

describe('TravelConnector search -> book -> cancel (sandbox)', () => {
  const traveller: Pilgrim = {
    id: 't1', firstName: 'Jonas', lastName: 'P', passportNumber: 'LT1',
    nationality: 'LT', dob: '1988-01-01', gender: 'M',
  };

  it('books searched offers and cancels', async () => {
    const travel = createTravelConnector();
    const hotels = await travel.searchHotels({ city: 'JEDDAH', country: 'AE', checkIn: '2026-10-01', checkOut: '2026-10-04', pax: 1 });
    const flights = await travel.searchFlights({ from: 'VNO', to: 'JED', date: '2026-10-01', pax: 1 });

    const booking = await travel.book([hotels[0]!.id, flights[0]!.id], [traveller]);
    expect(booking.status).toBe('CONFIRMED');
    expect(booking.bookingRef).toMatch(/^TRV-/);
    expect(booking.brns).toHaveLength(2);

    const cancelled = await travel.cancel(booking.bookingRef);
    expect(cancelled.cancelled).toBe(true);
  });
});
