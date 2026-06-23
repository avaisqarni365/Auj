'use server';

import { requireRole } from '../auth/session';
import { getHotelsStore } from './hotels-store';
import { cleanCity, isHotelCity, type CityHotels, type HotelCity } from './hotels-data';

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
  await store.setCity(slug, cleanCity(slug, data));
  return store.getCity(slug);
}
