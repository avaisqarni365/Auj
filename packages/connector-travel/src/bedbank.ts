import type { HotelOffer, SearchCriteria } from '@auj/contracts';
import type { HotelSource } from './ports';
import { money } from './money';

// --- Raw vendor payloads (TBO/Hotelbeds-style). Deliberately NOT our domain shape. ---
export interface BedbankHotelResult {
  HotelCode: string;
  HotelName: string;
  CityName: string;
  StarRating: number;
  Price: { RoomRateMajor: number; CurrencyCode: string }; // major units
}
export interface BedbankSearchResponse {
  Hotels: BedbankHotelResult[];
}
export interface BedbankSearchRequest {
  CityName: string;
  CheckIn: string;
  CheckOut: string;
  Pax: number;
  Country: string;
}
export interface BedbankClient {
  searchHotels(req: BedbankSearchRequest): Promise<BedbankSearchResponse>;
}

/** Map a raw bedbank result INTO our domain HotelOffer (never the reverse). */
export function mapBedbankHotel(r: BedbankHotelResult): HotelOffer {
  return {
    id: `tbo:${r.HotelCode}`,
    name: r.HotelName,
    city: r.CityName,
    starRating: r.StarRating,
    nightlyNet: money(r.Price.RoomRateMajor, r.Price.CurrencyCode),
    nusukApproved: false, // general-travel supply is never Nusuk-approved
  };
}

/** A bedbank as a HotelSource. The client is injected (sandbox in dev/test, SDK in prod). */
export class BedbankHotelSource implements HotelSource {
  constructor(private readonly client: BedbankClient) {}

  async searchHotels(c: SearchCriteria & { country: string }): Promise<HotelOffer[]> {
    const res = await this.client.searchHotels({
      CityName: c.city,
      CheckIn: c.checkIn,
      CheckOut: c.checkOut,
      Pax: c.pax,
      Country: c.country,
    });
    return res.Hotels.map(mapBedbankHotel);
  }
}

/** Offline sandbox returning canned vendor-shaped data. */
export class SandboxBedbankClient implements BedbankClient {
  async searchHotels(_req: BedbankSearchRequest): Promise<BedbankSearchResponse> {
    return {
      Hotels: [
        { HotelCode: 'DXB001', HotelName: 'Address Downtown', CityName: 'Dubai', StarRating: 5, Price: { RoomRateMajor: 320.0, CurrencyCode: 'EUR' } },
        { HotelCode: 'IST014', HotelName: 'Pera Palace', CityName: 'Istanbul', StarRating: 5, Price: { RoomRateMajor: 210.5, CurrencyCode: 'EUR' } },
        { HotelCode: 'LON220', HotelName: 'The Savoy', CityName: 'London', StarRating: 5, Price: { RoomRateMajor: 540.75, CurrencyCode: 'EUR' } },
      ],
    };
  }
}
