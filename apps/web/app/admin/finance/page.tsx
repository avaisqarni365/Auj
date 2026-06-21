import { requireRole } from '../../../src/auth/session';
import { SitePage } from '../../../src/components/SitePage';
import { FinanceSelfAssessment } from '../../../src/finance/FinanceSelfAssessment';
import { getDealsStore } from '../../../src/finance/deals-store';

// Finance self-assessment (deal-by-deal money in/out/profit). ADMIN only. DB-backed deal book.
export default async function AdminFinanceAssessmentPage() {
  const user = await requireRole(['ADMIN'], '/admin/finance');
  const deals = await (await getDealsStore()).list();
  return (
    <SitePage user={user}>
      <FinanceSelfAssessment deals={deals} />
    </SitePage>
  );
}
