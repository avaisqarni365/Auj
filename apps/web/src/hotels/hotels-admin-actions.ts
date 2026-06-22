'use server';

import { requireRole } from '../auth/session';
import { getHotelsStore } from './hotels-store';
import { isHotelCity, type CityHotels, type Hotel, type HotelBand, type HotelCity } from './hotels-data';

const str = (x: unknown, n: number): string => String(x ?? '').slice(0, n);

function cleanHotel(h: unknown): Hotel {
  const o = (h ?? {}) as Partial<Hotel>;
  return {
    name: str(o.name, 200),
    stars: str(o.stars, 12),
    note: str(o.note, 200),
    dist: str(o.dist, 60),
  };
}

function cleanBand(b: unknown): HotelBand {
  const o = (b ?? {}) as Partial<HotelBand>;
  return {
    short: str(o.short, 40),
    dist: str(o.dist, 60),
    walk: str(o.walk, 80),
    area: str(o.area, 200),
    name: str(o.name, 80),
    hotels: (Array.isArray(o.hotels) ? o.hotels : []).slice(0, 30).map(cleanHotel),
  };
}

function clean(slug: HotelCity, data: CityHotels): CityHotels {
  return {
    slug, // canonical — never trust the client-supplied slug on the body
    title: str(data?.title, 120),
    mosque: str(data?.mosque, 120),
    bands: (Array.isArray(data?.bands) ? data.bands : []).slice(0, 12).map(cleanBand),
  };
}

/** Admin — current directory (city meta → bands → hotels) for one city. */
export async function getCityAction(slug: HotelCity): Promise<CityHotels> {
  await requireRole(['ADMIN'], '/admin/hotels');
  if (!isHotelCity(slug)) throw new Error('Unknown city');
  return (await getHotelsStore()).getCity(slug);
}

/** Admin — list both cities' directories. */
export async function listCitiesAction(): Promise<CityHotels[]> {
  await requireRole(['ADMIN'], '/admin/hotels');
  return (await getHotelsStore()).listCities();
}

/** Admin — replace one city's directory (city meta + bands + hotels). Returns the fresh data. */
export async function saveCityAction(slug: HotelCity, data: CityHotels): Promise<CityHotels> {
  await requireRole(['ADMIN'], '/admin/hotels');
  if (!isHotelCity(slug)) throw new Error('Unknown city');
  const store = await getHotelsStore();
  await store.setCity(slug, clean(slug, data));
  return store.getCity(slug);
}
