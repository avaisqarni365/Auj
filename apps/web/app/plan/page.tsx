import Link from 'next/link';
import { getCurrentUser } from '../../src/auth/session';
import { SitePage } from '../../src/components/SitePage';
import { SmartPlanner } from '../../src/components/SmartPlanner';

// Public — the Smart Visit planner (split-panel configurator) on its own page, reached from the
// landing's "Continue in Smart Planner" CTA. Anyone can shape a complete, visa-ready plan in seven
// calm steps; no login required. The final step opens matching packages.
export default async function PlanPage() {
  const user = await getCurrentUser();
  return (
    <SitePage user={user}>
      <div className="mx-auto w-full max-w-[1080px] px-[clamp(16px,4vw,32px)] pt-[clamp(14px,2.5vw,24px)]">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-lg px-1 py-1.5 text-[13.5px] font-semibold text-sand-600 transition-colors duration-fast hover:text-green-800 focus-visible:outline-none focus-visible:shadow-focus"
        >
          <span aria-hidden>‹</span> Back to home
        </Link>
      </div>
      <div className="pb-[clamp(18px,3.5vw,36px)] pt-2">
        <SmartPlanner />
      </div>
    </SitePage>
  );
}
