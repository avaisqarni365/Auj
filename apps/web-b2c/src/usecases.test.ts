import { describe, it, expect } from 'vitest';
import { hotelItem } from '@auj/core-booking';
import { createInProcessBackend } from './backend/in-process';
import { placePilgrimageBooking, pollVisaUntilIssued, previewVisaRoute } from './usecases';
import type { PilgrimDraft } from './funnel';

const pkPilgrim: PilgrimDraft = {
  firstName: 'Imran', lastName: 'Ali', passportNumber: 'PK123', nationality: 'PK', dob: '1985-01-01', gender: 'M',
};

describe('previewVisaRoute', () => {
  it('shows agent channel for PK and e-Visa for LT', () => {
    expect(previewVisaRoute(pkPilgrim).route).toBe('AGENT_CHANNEL');
    expect(previewVisaRoute({ ...pkPilgrim, nationality: 'LT' }).route).toBe('EVISA_DIRECT');
  });
});

describe('end-to-end booking funnel on the mock', () => {
  it('search -> package -> pay -> BRNs + visa, polled to ISSUED', async () => {
    const backend = createInProcessBackend();

    const hotels = await backend.booking.searchHotels({ city: 'MAKKAH', checkIn: '2026-09-01', checkOut: '2026-09-05', pax: 1 });
    expect(hotels.length).toBeGreaterThan(0);
    const item = hotelItem(hotels[0]!);

    const placed = await placePilgrimageBooking(backend, {
      customer: { fullName: 'Imran Ali', email: 'imran@example.com' },
      pilgrims: [pkPilgrim],
      items: [item],
      total: { amount: 120000, currency: 'EUR' }, // sell price, charged in EUR
    });

    // confirm captured the booking, then the visa flow advanced it to VISA_IN_PROGRESS
    expect(placed.booking.status).toBe('VISA_IN_PROGRESS');
    expect(placed.booking.bookingRef).toBeTruthy();
    expect(placed.booking.items[0]?.brn).toBeTruthy(); // BRN captured on confirm
    expect(placed.visaCase.route).toBe('AGENT_CHANNEL'); // PK pilgrim
    expect(placed.visaCase.status).toBe('DRAFT');

    const issued = await pollVisaUntilIssued(backend, placed.booking.id);
    expect(issued.status).toBe('ISSUED');

    const fetched = await backend.booking.getBooking(placed.booking.id);
    expect(fetched?.bookingRef).toBe(placed.booking.bookingRef);
  });
});
