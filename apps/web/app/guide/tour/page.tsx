import { getCurrentUser } from '../../../src/auth/session';
import { SitePage } from '../../../src/components/SitePage';
import { VirtualTour } from '../../../src/ritual/tour/VirtualTour';
import { getContentStore } from '../../../src/ritual/content-store';
import { getTourVideoStore } from '../../../src/ritual/tour/tour-video-store';
import { getTourSceneStore } from '../../../src/ritual/tour/tour-scene-store';

// Virtual tour — public, no login. Part of the Umrah Guide module (kept under /guide).
// The public tour is identical for everyone; a signed-in pilgrim also sees & saves their own
// per-step videos (personal to their account).
export default async function GuideTourPage() {
  const user = await getCurrentUser();
  const overrides = await (await getContentStore()).getOverrides();
  const videos = user ? await (await getTourVideoStore()).listForUser(user.id) : {};
  const sceneDefs = await (await getTourSceneStore()).listScenes();
  return (
    <SitePage user={user}>
      <VirtualTour overrides={overrides} signedIn={!!user} initialVideos={videos} sceneDefs={sceneDefs} />
    </SitePage>
  );
}
