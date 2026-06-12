import { describe, it, expect, afterEach } from 'vitest';
import type { Pilgrim, SearchCriteria } from '@auj/contracts';
import { MockSaudiConnector } from './saudi';

const criteria: SearchCriteria = {
  city: 'MAKKAH',
  checkIn: '2026-09-01',
  checkOut: '2026-09-05',
  pax: 1,
};
const pilgrimPk: Pilgrim[] = [
  { id: 'p1', firstName: 'Imran', lastName: 'Ali', passportNumber: 'PK1', nationality: 'PK', dob: '1985-01-01', gender: 'M' },
];
const pilgrimLt: Pilgrim[] = [
  { id: 'p2', firstName: 'Greta', lastName: 'Kazlauskaite', passportNumber: 'LT1', nationality: 'LT', dob: '1990-01-01', gender: 'F' },
];

describe('MockSaudiConnector behaviour', () => {
  afterEach(() => {
    delete process.env.AUJ_MOCK_HOLD_EXPIRY;
    delete process.env.AUJ_MOCK_REJECT_VISA;
    delete process.env.AUJ_MOCK_SOLD_OUT;
  });

  it('issues one BRN per held item', async () => {
    const c = new MockSaudiConnector();
    const hotels = await c.searchHotels(criteria);
    const hold = await c.hold(
      hotels.slice(0, 2).map((h) => h.id),
      pilgrimPk,
    );
    const res = await c.confirm(hold.holdId, { ref: 'pay' });
    expect(res.status).toBe('CONFIRMED');
    expect(res.brns).toHaveLength(2);
  });

  it('routes PK -> AGENT_CHANNEL and EU -> EVISA_DIRECT', async () => {
    const c = new MockSaudiConnector();
    expect((await c.createVisaApplication('BK', pilgrimPk)).route).toBe('AGENT_CHANNEL');
    expect((await c.createVisaApplication('BK', pilgrimLt)).route).toBe('EVISA_DIRECT');
  });

  it('advances visa status to ISSUED on repeated polling', async () => {
    const c = new MockSaudiConnector();
    const v = await c.createVisaApplication('BK', pilgrimLt);
    let status = v.status;
    for (let i = 0; status !== 'ISSUED' && i < 10; i += 1) {
      status = await c.getVisaStatus(v.visaRef);
    }
    expect(status).toBe('ISSUED');
  });

  it('cancel returns a refund', async () => {
    const c = new MockSaudiConnector();
    const res = await c.cancel('BK');
    expect(res.cancelled).toBe(true);
    expect(res.refund?.currency).toBe('SAR');
  });

  it('AUJ_MOCK_HOLD_EXPIRY makes confirm FAIL', async () => {
    process.env.AUJ_MOCK_HOLD_EXPIRY = '1';
    const c = new MockSaudiConnector();
    const hotels = await c.searchHotels(criteria);
    const top = hotels[0];
    expect(top).toBeDefined();
    const hold = await c.hold([top?.id ?? 'x'], pilgrimPk);
    const res = await c.confirm(hold.holdId, { ref: 'pay' });
    expect(res.status).toBe('FAILED');
    expect(res.brns).toHaveLength(0);
  });

  it('AUJ_MOCK_REJECT_VISA forces REJECTED', async () => {
    process.env.AUJ_MOCK_REJECT_VISA = '1';
    const c = new MockSaudiConnector();
    const v = await c.createVisaApplication('BK', pilgrimLt);
    expect(await c.getVisaStatus(v.visaRef)).toBe('REJECTED');
  });

  it('AUJ_MOCK_SOLD_OUT returns no hotels', async () => {
    process.env.AUJ_MOCK_SOLD_OUT = '1';
    const c = new MockSaudiConnector();
    expect(await c.searchHotels(criteria)).toHaveLength(0);
  });
});
