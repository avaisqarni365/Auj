import { requireRole } from '../../../src/auth/session';
import { SitePage } from '../../../src/components/SitePage';
import { HotelsAdmin } from '../../../src/admin/HotelsAdmin';
import { getHotelsStore } from '../../../src/hotels/hotels-store';

// Admin — full CRUD over the Makkah / Madinah hotel directory (city meta, bands, hotels).
export default async function HotelsAdminPage() {
  const user = await requireRole(['ADMIN'], '/admin/hotels');
  const cities = await (await getHotelsStore()).listCities();
  return (
    <SitePage user={user}>
      <HotelsAdmin initial={cities} />
    </SitePage>
  );
}
