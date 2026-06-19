import { getCurrentUser } from '../../../src/auth/session';
import { SitePage } from '../../../src/components/SitePage';
import { VirtualTour } from '../../../src/ritual/tour/VirtualTour';

// Virtual tour — public, no login. Part of the Umrah Guide module (kept under /guide).
export default async function GuideTourPage() {
  const user = await getCurrentUser();
  return (
    <SitePage user={user}>
      <VirtualTour />
    </SitePage>
  );
}
