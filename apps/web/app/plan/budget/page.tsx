import { getCurrentUser } from '../../../src/auth/session';
import { SitePage } from '../../../src/components/SitePage';
import { FinancialPlanner } from '../../../src/budget/FinancialPlanner';

// Public — the Financial Planner budget estimator. Splits the confirmed AUJ package price from
// private spending, with a per-pilgrim EUR + indicative PKR total over a 10- or 15-day stay.
export default async function BudgetPage() {
  const user = await getCurrentUser();
  return (
    <SitePage user={user}>
      <div className="py-[clamp(18px,3.5vw,36px)]">
        <FinancialPlanner />
      </div>
    </SitePage>
  );
}
