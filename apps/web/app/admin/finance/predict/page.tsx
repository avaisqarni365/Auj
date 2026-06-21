import { requireRole } from '../../../../src/auth/session';
import { SitePage } from '../../../../src/components/SitePage';
import { PredictiveAnalysis } from '../../../../src/finance/PredictiveAnalysis';

// Predictive cost analysis — group forecast by pax + season. ADMIN only.
export default async function AdminPredictPage() {
  const user = await requireRole(['ADMIN'], '/admin/finance/predict');
  return (
    <SitePage user={user}>
      <PredictiveAnalysis />
    </SitePage>
  );
}
