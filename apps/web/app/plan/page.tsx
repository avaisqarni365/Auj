import { getCurrentUser } from '../../src/auth/session';
import { SitePage } from '../../src/components/SitePage';
import { SmartVisitWizard } from '../../src/leads/SmartVisitWizard';

// Public — the Smart Visit planner. Anyone can express intent in <2 min; no login required.
// AUJ's team follows up with a real package. Also reachable from the pilgrim account.
export default async function PlanPage() {
  const user = await getCurrentUser();
  return (
    <SitePage user={user}>
      <SmartVisitWizard />
    </SitePage>
  );
}
