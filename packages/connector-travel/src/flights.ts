import type { FlightOffer } from '@auj/contracts';
import type { FlightSource } from './ports';
import { money } from './money';

// --- Raw vendor payloads (Amadeus/Sabre-style). ---
export interface AmadeusSegment {
  departure: { iataCode: string; at: string };
  arrival: { iataCode: string; at: string };
}
export interface AmadeusFlightOffer {
  id: string;
  validatingAirlineCodes: string[];
  itineraries: Array<{ segments: AmadeusSegment[] }>;
  price: { total: string; currency: string }; // total as a major-units string
}
export interface AmadeusSearchResponse {
  data: AmadeusFlightOffer[];
}
export interface AmadeusSearchRequest {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  adults: number;
}
export interface FlightClient {
  search(req: AmadeusSearchRequest): Promise<AmadeusSearchResponse>;
}

/** Map a raw flight offer INTO our domain FlightOffer. */
export function mapAmadeusFlight(o: AmadeusFlightOffer): FlightOffer {
  const segments = o.itineraries[0]?.segments ?? [];
  const first = segments[0];
  const last = segments[segments.length - 1];
  return {
    id: `amadeus:${o.id}`,
    carrier: o.validatingAirlineCodes[0] ?? 'XX',
    depart: first?.departure.at ?? '',
    arrive: last?.arrival.at ?? '',
    net: money(Number.parseFloat(o.price.total), o.price.currency),
  };
}

export class AmadeusFlightSource implements FlightSource {
  constructor(private readonly client: FlightClient) {}

  async searchFlights(c: { from: string; to: string; date: string; pax: number }): Promise<FlightOffer[]> {
    const res = await this.client.search({
      originLocationCode: c.from,
      destinationLocationCode: c.to,
      departureDate: c.date,
      adults: c.pax,
    });
    return res.data.map(mapAmadeusFlight);
  }
}

/** Offline sandbox returning canned vendor-shaped flights. */
export class SandboxFlightClient implements FlightClient {
  async search(req: AmadeusSearchRequest): Promise<AmadeusSearchResponse> {
    const { originLocationCode: from, destinationLocationCode: to, departureDate: date } = req;
    return {
      data: [
        {
          id: '1',
          validatingAirlineCodes: ['LH'],
          itineraries: [
            { segments: [{ departure: { iataCode: from, at: `${date}T08:00:00` }, arrival: { iataCode: to, at: `${date}T13:30:00` } }] },
          ],
          price: { total: '385.00', currency: 'EUR' },
        },
        {
          id: '2',
          validatingAirlineCodes: ['TK'],
          itineraries: [
            { segments: [
              { departure: { iataCode: from, at: `${date}T10:15:00` }, arrival: { iataCode: 'IST', at: `${date}T14:05:00` } },
              { departure: { iataCode: 'IST', at: `${date}T16:20:00` }, arrival: { iataCode: to, at: `${date}T20:40:00` } },
            ] },
          ],
          price: { total: '298.40', currency: 'EUR' },
        },
      ],
    };
  }
}
