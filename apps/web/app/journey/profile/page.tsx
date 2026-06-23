import { requireRole } from '../../../src/auth/session';
import { SitePage } from '../../../src/components/SitePage';
import { ProfileEditor } from '../../../src/journey/ProfileEditor';
import { getProfileStore } from '../../../src/journey/profile-store';
import { getDashboardAction } from '../../../src/journey/dashboard-actions';
import { reachedStages } from '../../../src/journey/dashboard-derive';

// Pilgrim profile — editable details persisted to DB per signed-in user. Sign-in required.
// Journey-progress stages are derived from real booking signals (passport scan, deposit, booking
// step) so the timeline reflects the pilgrim's actual status rather than a placeholder.
export default async function ProfilePage() {
  const user = await requireRole(['PILGRIM', 'AGENT', 'SUB_AGENT', 'ADMIN'], '/journey/profile');
  const [profile, dash] = await Promise.all([(await getProfileStore()).get(user.id), getDashboardAction()]);
  const reached = reachedStages(dash);

  return (
    <SitePage user={user}>
      <ProfileEditor user={user} profile={profile ?? null} reached={reached} />
    </SitePage>
  );
}
