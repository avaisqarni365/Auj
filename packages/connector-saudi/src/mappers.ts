import type { Currency, GroundOffer, HotelOffer, RawdahSlot, RawdahStatus, TransportOffer, VisaRoute, VisaStatus } from '@auj/contracts';
import type { MaqamCity, MaqamGround, MaqamHotel, MaqamRawdahSlot, MaqamTransport } from './client';

const CITY: Record<MaqamCity, string> = { MAK: 'MAKKAH', MAD: 'MADINAH', JED: 'JEDDAH' };

export function toCityCode(city: 'MAKKAH' | 'MADINAH' | 'JEDDAH'): MaqamCity {
  return city === 'MAKKAH' ? 'MAK' : city === 'MADINAH' ? 'MAD' : 'JED';
}

export function mapHotel(h: MaqamHotel): HotelOffer {
  return {
    id: `maqam:${h.hotelId}`,
    name: h.name,
    city: CITY[h.cityCode],
    starRating: h.rating,
    nightlyNet: { amount: h.rateMinor, currency: h.rateCurrency as Currency },
    nusukApproved: h.nusukApproved,
    ...(h.distanceMeters != null ? { distanceToHaramM: h.distanceMeters } : {}),
  };
}

export function mapTransport(t: MaqamTransport): TransportOffer {
  return { id: `maqam:${t.id}`, route: t.routeCode, vehicle: t.vehicleType, net: { amount: t.priceMinor, currency: t.priceCurrency as Currency } };
}

export function mapGround(g: MaqamGround): GroundOffer {
  return { id: `maqam:${g.serviceId}`, name: g.title, net: { amount: g.priceMinor, currency: g.priceCurrency as Currency } };
}

export function mapBookingState(state: 'OK' | 'PENDING' | 'FAIL'): 'CONFIRMED' | 'PENDING' | 'FAILED' {
  return state === 'OK' ? 'CONFIRMED' : state === 'PENDING' ? 'PENDING' : 'FAILED';
}

export function mapRoute(channel: 'EVISA' | 'AGENT'): VisaRoute {
  return channel === 'EVISA' ? 'EVISA_DIRECT' : 'AGENT_CHANNEL';
}

const VISA_STATES = new Set<VisaStatus>(['DRAFT', 'SUBMITTED', 'PAID', 'ISSUED', 'REJECTED']);

export function mapVisaState(state: string): VisaStatus {
  const upper = state.toUpperCase();
  return VISA_STATES.has(upper as VisaStatus) ? (upper as VisaStatus) : 'SUBMITTED';
}

export function mapRawdahSlot(s: MaqamRawdahSlot): RawdahSlot {
  return { slotId: s.slot, startsAt: s.at, capacity: s.seatsLeft };
}

const RAWDAH_STATES = new Set<RawdahStatus>(['REQUESTED', 'CONFIRMED', 'REJECTED']);
export function mapRawdahState(state: string): RawdahStatus {
  const upper = state.toUpperCase();
  return RAWDAH_STATES.has(upper as RawdahStatus) ? (upper as RawdahStatus) : 'REQUESTED';
}
