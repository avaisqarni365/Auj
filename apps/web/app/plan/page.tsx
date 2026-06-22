import { getCurrentUser } from '../../src/auth/session';
import { SitePage } from '../../src/components/SitePage';
import { SmartPlanner } from '../../src/components/SmartPlanner';

// Public — the Smart Visit planner (split-panel configurator). Anyone can shape a complete,
// visa-ready plan in seven calm steps; no login required. The final step opens matching packages.
export default async function PlanPage() {
  const user = await getCurrentUser();
  return (
    <SitePage user={user}>
      <div className="py-[clamp(18px,3.5vw,36px)]">
        <SmartPlanner />
      </div>
    </SitePage>
  );
}
