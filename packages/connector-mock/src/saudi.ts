import type {
  SaudiConnector,
  SearchCriteria,
  HotelOffer,
  TransportOffer,
  GroundOffer,
  HoldRef,
  BookingResult,
  VisaApplication,
  VisaStatus,
  VisaRoute,
  Pilgrim,
  Cancellation,
} from '@auj/contracts';
import { HOTELS, TRANSPORT, GROUND } from './catalog';
import { resolveVisaRoute } from './visa-rule';

const HOLD_TTL_MS = 15 * 60 * 1000; // 15 minutes
const VISA_PROGRESSION: VisaStatus[] = ['DRAFT', 'SUBMITTED', 'PAID', 'ISSUED'];

interface HoldState {
  offerIds: string[];
  pilgrims: Pilgrim[];
  expiresAt: number; // epoch ms
}
interface VisaState {
  route: VisaRoute;
  status: VisaStatus;
}

const flag = (key: string): boolean => {
  const v = process.env[key];
  return v === '1' || v === 'true';
};

/**
 * In-memory SaudiConnector. No network, deterministic catalog. State is
 * per-instance so tests are isolated. Env toggles simulate edge cases:
 *   AUJ_MOCK_SOLD_OUT     -> searches return no hotels
 *   AUJ_MOCK_HOLD_EXPIRY  -> holds are created already-expired (confirm fails)
 *   AUJ_MOCK_REJECT_VISA  -> visa polling resolves to REJECTED
 */
export class MockSaudiConnector implements SaudiConnector {
  private seq = 0;
  private readonly holds = new Map<string, HoldState>();
  private readonly visas = new Map<string, VisaState>();

  private id(prefix: string): string {
    this.seq += 1;
    return `${prefix}_${this.seq.toString().padStart(4, '0')}`;
  }

  async searchHotels(c: SearchCriteria): Promise<HotelOffer[]> {
    if (flag('AUJ_MOCK_SOLD_OUT')) return [];
    return HOTELS.filter((h) => c.city === 'JEDDAH' || h.city === c.city).filter(
      (h) => c.starRating === undefined || h.starRating >= c.starRating,
    );
  }

  async searchTransport(_c: SearchCriteria): Promise<TransportOffer[]> {
    return TRANSPORT;
  }

  async searchGroundServices(c: SearchCriteria): Promise<GroundOffer[]> {
    if (c.city === 'JEDDAH') return GROUND;
    const tag = c.city === 'MAKKAH' ? 'mak' : 'mad';
    return GROUND.filter((g) => g.id.includes(tag));
  }

  async hold(offerIds: string[], pilgrims: Pilgrim[]): Promise<HoldRef> {
    const holdId = this.id('hold');
    const ttl = flag('AUJ_MOCK_HOLD_EXPIRY') ? -1000 : HOLD_TTL_MS;
    const expiresAt = Date.now() + ttl;
    this.holds.set(holdId, { offerIds, pilgrims, expiresAt });
    return { holdId, expiresAt: new Date(expiresAt).toISOString() };
  }

  async confirm(holdId: string, _payment: { ref: string }): Promise<BookingResult> {
    const h = this.holds.get(holdId);
    if (!h || Date.now() > h.expiresAt) {
      this.holds.delete(holdId);
      return { bookingRef: this.id('BK'), brns: [], status: 'FAILED' };
    }
    this.holds.delete(holdId);
    const items = h.offerIds.length > 0 ? h.offerIds : ['booking'];
    return {
      bookingRef: this.id('BK'),
      brns: items.map(() => this.id('BRN')), // one synthetic BRN per booked item
      status: 'CONFIRMED',
    };
  }

  async createVisaApplication(_bookingRef: string, pilgrims: Pilgrim[]): Promise<VisaApplication> {
    const lead = pilgrims[0];
    const route: VisaRoute = lead ? resolveVisaRoute(lead) : 'AGENT_CHANNEL';
    const visaRef = this.id('visa');
    this.visas.set(visaRef, { route, status: 'DRAFT' });
    return { visaRef, route, status: 'DRAFT' };
  }

  async getVisaStatus(visaRef: string): Promise<VisaStatus> {
    const v = this.visas.get(visaRef);
    if (!v) return 'REJECTED';
    if (flag('AUJ_MOCK_REJECT_VISA')) {
      v.status = 'REJECTED';
      return v.status;
    }
    const idx = VISA_PROGRESSION.indexOf(v.status);
    if (idx >= 0 && idx < VISA_PROGRESSION.length - 1) {
      v.status = VISA_PROGRESSION[idx + 1] as VisaStatus;
    }
    return v.status;
  }

  async cancel(_bookingRef: string): Promise<Cancellation> {
    return { cancelled: true, refund: { amount: 50000, currency: 'SAR' } };
  }
}
