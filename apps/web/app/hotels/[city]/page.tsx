import { notFound } from 'next/navigation';
import { getCurrentUser } from '../../../src/auth/session';
import { SitePage } from '../../../src/components/SitePage';
import { HotelsBrowser } from '../../../src/hotels/HotelsBrowser';
import { HOTEL_CITIES, isHotelCity } from '../../../src/hotels/hotels-data';
import { getHotelsStore } from '../../../src/hotels/hotels-store';

// Public — curated hotel directory by walking-distance band for Makkah / Madinah.
export function generateStaticParams() {
  return HOTEL_CITIES.map((city) => ({ city }));
}

export default async function HotelsPage({ params }: { params: { city: string } }) {
  if (!isHotelCity(params.city)) notFound();
  const [user, city] = [await getCurrentUser(), await (await getHotelsStore()).getCity(params.city)];
  return (
    <SitePage user={user}>
      <div className="py-[clamp(18px,3.5vw,36px)]">
        <HotelsBrowser city={city} />
      </div>
    </SitePage>
  );
}
