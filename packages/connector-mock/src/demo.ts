// Scripted, offline demo: search -> hold -> confirm -> BRN -> visa -> ISSUED.
// Run with: pnpm --filter @auj/connector-mock demo
import type { Pilgrim, SearchCriteria, VisaStatus } from '@auj/contracts';
import { MockSaudiConnector } from './saudi';

async function main(): Promise<void> {
  const connector = new MockSaudiConnector();
  const criteria: SearchCriteria = {
    city: 'MAKKAH',
    checkIn: '2026-09-01',
    checkOut: '2026-09-05',
    pax: 2,
  };
  const pilgrims: Pilgrim[] = [
    { id: 'p1', firstName: 'Imran', lastName: 'Ali', passportNumber: 'PK1234567', nationality: 'PK', dob: '1985-04-12', gender: 'M' },
    { id: 'p2', firstName: 'Sara', lastName: 'Ali', passportNumber: 'LT7654321', nationality: 'LT', dob: '1990-08-03', gender: 'F', mahramPilgrimId: 'p1' },
  ];

  const hotels = await connector.searchHotels(criteria);
  const top = hotels[0];
  if (!top) throw new Error('demo: catalog returned no hotels');
  console.log(`search    -> ${hotels.length} hotels (top: ${top.name}, ${top.nightlyNet.amount / 100} ${top.nightlyNet.currency}/night)`);

  const hold = await connector.hold([top.id], pilgrims);
  console.log(`hold      -> ${hold.holdId} (expires ${hold.expiresAt})`);

  const booking = await connector.confirm(hold.holdId, { ref: 'pay_demo' });
  console.log(`confirm   -> ${booking.status} ${booking.bookingRef}, BRNs: ${booking.brns.join(', ')}`);

  const visa = await connector.createVisaApplication(booking.bookingRef, pilgrims);
  console.log(`visa      -> route ${visa.route}, status ${visa.status}`);

  let status: VisaStatus = visa.status;
  let guard = 0;
  while (status !== 'ISSUED' && status !== 'REJECTED' && guard < 10) {
    status = await connector.getVisaStatus(visa.visaRef);
    console.log(`  poll    -> ${status}`);
    guard += 1;
  }
  console.log(`DONE      -> visa ${status}`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
