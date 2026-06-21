// Runtime contract checks — the same shape as @auj/contracts/contract-tests (vitest), but
// executable in a server action so /admin can run them live against the selected adapter.
// The Zod schemas are the shared source of truth; this just exercises the interface and parses.
import {
  BookingResultSchema,
  CateringOfferSchema,
  FlightOfferSchema,
  GroundOfferSchema,
  HotelOfferSchema,
  RawdahPermitSchema,
  RawdahSlotSchema,
  TransportOfferSchema,
  VisaApplicationSchema,
  VisaStatusSchema,
  type Pilgrim,
  type SaudiConnector,
  type SearchCriteria,
  type TravelSupplier,
} from '@auj/contracts';

export interface CheckResult {
  name: string;
  ok: boolean;
  detail: string;
}

const PILGRIMS: Pilgrim[] = [
  { id: 'p1', firstName: 'Aisha', lastName: 'Khan', passportNumber: 'AB1234567', nationality: 'PK', dob: '1990-01-01', gender: 'F' },
];
const CRITERIA: SearchCriteria = { city: 'MAKKAH', checkIn: '2026-09-01', checkOut: '2026-09-05', pax: 1 };

async function check(name: string, fn: () => Promise<string>): Promise<CheckResult> {
  try {
    return { name, ok: true, detail: await fn() };
  } catch (e) {
    return { name, ok: false, detail: e instanceof Error ? e.message : 'failed' };
  }
}

export async function runSaudiContract(c: SaudiConnector): Promise<CheckResult[]> {
  return [
    await check('searchHotels → schema-valid offers', async () => {
      const offers = await c.searchHotels(CRITERIA);
      offers.forEach((o) => HotelOfferSchema.parse(o));
      return `${offers.length} offers`;
    }),
    await check('searchTransport / searchGroundServices', async () => {
      (await c.searchTransport(CRITERIA)).forEach((o) => TransportOfferSchema.parse(o));
      (await c.searchGroundServices(CRITERIA)).forEach((o) => GroundOfferSchema.parse(o));
      return 'transport + ground valid';
    }),
    await check('searchZiyarah / searchCatering (Nusuk parity)', async () => {
      (await c.searchZiyarah(CRITERIA)).forEach((o) => GroundOfferSchema.parse(o));
      (await c.searchCatering(CRITERIA)).forEach((o) => CateringOfferSchema.parse(o));
      return 'ziyarah + catering valid';
    }),
    await check('hold → confirm → CONFIRMED with BRN', async () => {
      const offers = await c.searchHotels(CRITERIA);
      const hold = await c.hold(offers.map((o) => o.id), PILGRIMS);
      const r = BookingResultSchema.parse(await c.confirm(hold.holdId, { ref: 'pay_1' }));
      if (r.status !== 'CONFIRMED') throw new Error(`status ${r.status}`);
      if (r.brns.length < 1) throw new Error('no BRN');
      return `${r.brns.length} BRN(s)`;
    }),
    await check('createVisaApplication → getVisaStatus', async () => {
      const app = VisaApplicationSchema.parse(await c.createVisaApplication('BR1', PILGRIMS));
      VisaStatusSchema.parse(await c.getVisaStatus(app.visaRef));
      return `route ${app.route}`;
    }),
    await check('searchRawdahSlots → bookRawdah', async () => {
      const slots = await c.searchRawdahSlots('2026-09-10');
      slots.forEach((s) => RawdahSlotSchema.parse(s));
      const first = slots[0];
      if (!first) return 'no slots (ok)';
      const permit = RawdahPermitSchema.parse(await c.bookRawdah(first.slotId, PILGRIMS));
      if (!['REQUESTED', 'CONFIRMED'].includes(permit.status)) throw new Error(`status ${permit.status}`);
      return `permit ${permit.status}`;
    }),
    await check('cancel → boolean outcome', async () => {
      const r = await c.cancel('BR1');
      if (typeof r.cancelled !== 'boolean') throw new Error('non-boolean');
      return `cancelled=${r.cancelled}`;
    }),
  ];
}

export async function runSupplierContract(s: TravelSupplier): Promise<CheckResult[]> {
  return [
    await check('searchHotels → schema-valid offers', async () => {
      const offers = await s.searchHotels({ ...CRITERIA, country: 'AE' });
      offers.forEach((o) => HotelOfferSchema.parse(o));
      return `${offers.length} offers`;
    }),
    await check('searchFlights → schema-valid offers', async () => {
      const offers = await s.searchFlights({ from: 'VNO', to: 'JED', date: '2026-09-01', pax: 1 });
      offers.forEach((o) => FlightOfferSchema.parse(o));
      return `${offers.length} flights`;
    }),
    await check('book → cancel round-trips', async () => {
      const booking = BookingResultSchema.parse(await s.book(['h1'], PILGRIMS));
      if (!booking.bookingRef) throw new Error('no bookingRef');
      const r = await s.cancel(booking.bookingRef);
      if (typeof r.cancelled !== 'boolean') throw new Error('non-boolean cancel');
      return `ref ${booking.bookingRef}`;
    }),
  ];
}
