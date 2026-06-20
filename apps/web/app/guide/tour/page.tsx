import { getCurrentUser } from '../../../src/auth/session';
import { SitePage } from '../../../src/components/SitePage';
import { VirtualTour } from '../../../src/ritual/tour/VirtualTour';
import { getContentStore } from '../../../src/ritual/content-store';

// Virtual tour — public, no login. Part of the Umrah Guide module (kept under /guide).
export default async function GuideTourPage() {
  const user = await getCurrentUser();
  const overrides = await (await getContentStore()).getOverrides();
  return (
    <SitePage user={user}>
      <VirtualTour overrides={overrides} />
    </SitePage>
  );
}
