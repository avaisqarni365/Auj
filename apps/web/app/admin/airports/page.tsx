import { requireRole } from '../../../src/auth/session';
import { SitePage } from '../../../src/components/SitePage';
import { AirportsAdmin } from '../../../src/admin/AirportsAdmin';
import { getAirportStore } from '../../../src/depart/airport-store';

// Admin — full CRUD over the per-airport "Departing from your city" hubs.
export default async function AirportsAdminPage() {
  const user = await requireRole(['ADMIN'], '/admin/airports');
  const airports = await (await getAirportStore()).listAirports();
  return (
    <SitePage user={user}>
      <AirportsAdmin initial={airports} />
    </SitePage>
  );
}
