import { getCurrentUser } from '../../../src/auth/session';
import { SitePage } from '../../../src/components/SitePage';
import { JourneyProfile } from '../../../src/ritual/JourneyProfile';

// "My journey" — the pilgrim's on-device progress, voice notes and personal du'as (brief /umrah/profile).
export default async function GuideProfilePage() {
  const user = await getCurrentUser();
  return (
    <SitePage user={user}>
      <JourneyProfile />
    </SitePage>
  );
}
