// Reusable, implementation-agnostic contract tests. ANY SaudiConnector or
// TravelSupplier implementation (connector-mock today, connector-saudi later)
// must pass these. Consume from a package's own test file, e.g.:
//
//   import { runSaudiConnectorContractTests } from '@auj/contracts/contract-tests';
//   runSaudiConnectorContractTests('mock', () => new MockSaudiConnector());
//
import { describe, it, expect } from 'vitest';
import type { SaudiConnector, TravelSupplier } from './ports';
import type { Pilgrim, SearchCriteria } from './domain';
import {
  HotelOfferSchema,
  TransportOfferSchema,
  GroundOfferSchema,
  FlightOfferSchema,
  BookingResultSchema,
  VisaApplicationSchema,
  VisaStatusSchema,
  RawdahSlotSchema,
  RawdahPermitSchema,
  CateringOfferSchema,
} from './domain';

const samplePilgrims: Pilgrim[] = [
  {
    id: 'p1',
    firstName: 'Aisha',
    lastName: 'Khan',
    passportNumber: 'AB1234567',
    nationality: 'PK',
    dob: '1990-01-01',
    gender: 'F',
  },
];

const sampleCriteria: SearchCriteria = {
  city: 'MAKKAH',
  checkIn: '2026-09-01',
  checkOut: '2026-09-05',
  pax: 1,
};

export function runSaudiConnectorContractTests(name: string, make: () => SaudiConnector): void {
  describe(`SaudiConnector contract: ${name}`, () => {
    it('searchHotels returns schema-valid offers', async () => {
      const offers = await make().searchHotels(sampleCriteria);
      expect(Array.isArray(offers)).toBe(true);
      for (const o of offers) HotelOfferSchema.parse(o);
    });

    it('searchTransport and searchGroundServices return schema-valid offers', async () => {
      const c = make();
      for (const o of await c.searchTransport(sampleCriteria)) TransportOfferSchema.parse(o);
      for (const o of await c.searchGroundServices(sampleCriteria)) GroundOfferSchema.parse(o);
    });

    it('searchZiyarah returns ground-shaped offers and searchCatering returns catering offers', async () => {
      const c = make();
      for (const o of await c.searchZiyarah(sampleCriteria)) GroundOfferSchema.parse(o);
      for (const o of await c.searchCatering(sampleCriteria)) CateringOfferSchema.parse(o);
    });

    it('hold then confirm yields a CONFIRMED booking with at least one BRN', async () => {
      const c = make();
      const offers = await c.searchHotels(sampleCriteria);
      const hold = await c.hold(
        offers.map((o) => o.id),
        samplePilgrims,
      );
      expect(hold.holdId).toBeTruthy();
      const result = BookingResultSchema.parse(await c.confirm(hold.holdId, { ref: 'pay_1' }));
      expect(result.status).toBe('CONFIRMED');
      expect(result.brns.length).toBeGreaterThan(0);
    });

    it('createVisaApplication then getVisaStatus return valid visa state', async () => {
      const c = make();
      const app = VisaApplicationSchema.parse(
        await c.createVisaApplication('BR1', samplePilgrims),
      );
      VisaStatusSchema.parse(await c.getVisaStatus(app.visaRef));
    });

    it('searchRawdahSlots then bookRawdah return valid Rawdah state', async () => {
      const c = make();
      const slots = await c.searchRawdahSlots('2026-09-10');
      expect(Array.isArray(slots)).toBe(true);
      for (const s of slots) RawdahSlotSchema.parse(s);
      const first = slots[0];
      if (first) {
        const permit = RawdahPermitSchema.parse(await c.bookRawdah(first.slotId, samplePilgrims));
        expect(['REQUESTED', 'CONFIRMED']).toContain(permit.status);
        expect(permit.slotId).toBe(first.slotId);
      }
    });

    it('cancel reports a boolean outcome', async () => {
      const res = await make().cancel('BR1');
      expect(typeof res.cancelled).toBe('boolean');
    });
  });
}

export function runTravelSupplierContractTests(name: string, make: () => TravelSupplier): void {
  describe(`TravelSupplier contract: ${name}`, () => {
    it('searchHotels returns schema-valid offers', async () => {
      const offers = await make().searchHotels({ ...sampleCriteria, country: 'AE' });
      for (const o of offers) HotelOfferSchema.parse(o);
    });

    it('searchFlights returns schema-valid offers', async () => {
      const offers = await make().searchFlights({
        from: 'VNO',
        to: 'JED',
        date: '2026-09-01',
        pax: 1,
      });
      for (const o of offers) FlightOfferSchema.parse(o);
    });

    it('book then cancel round-trips', async () => {
      const s = make();
      const booking = BookingResultSchema.parse(await s.book(['h1'], samplePilgrims));
      expect(booking.bookingRef).toBeTruthy();
      const res = await s.cancel(booking.bookingRef);
      expect(typeof res.cancelled).toBe('boolean');
    });
  });
}
