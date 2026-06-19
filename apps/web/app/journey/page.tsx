import { requireRole } from '../../src/auth/session';
import { SitePage } from '../../src/components/SitePage';
import { JourneyView } from '../../src/journey/JourneyView';

// Pilgrim journey portal. Authenticated like the rest of the account area, so the shared
// header shows the signed-in user (account menu) consistently on every page.
export default async function JourneyPage() {
  const user = await requireRole(['PILGRIM', 'AGENT', 'SUB_AGENT', 'ADMIN'], '/journey');
  return (
    <SitePage user={user}>
      <JourneyView user={user} />
    </SitePage>
  );
}
