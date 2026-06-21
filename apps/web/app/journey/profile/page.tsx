import { requireRole } from '../../../src/auth/session';
import { SitePage } from '../../../src/components/SitePage';
import { ProfileEditor } from '../../../src/journey/ProfileEditor';
import { getProfileStore } from '../../../src/journey/profile-store';

// Pilgrim profile — editable details persisted to DB per signed-in user. Sign-in required.
export default async function ProfilePage() {
  const user = await requireRole(['PILGRIM', 'AGENT', 'SUB_AGENT', 'ADMIN'], '/journey/profile');
  const profile = (await (await getProfileStore()).get(user.id)) ?? null;
  return (
    <SitePage user={user}>
      <ProfileEditor user={user} profile={profile} />
    </SitePage>
  );
}
