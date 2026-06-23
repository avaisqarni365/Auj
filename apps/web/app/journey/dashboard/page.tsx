import { requireRole } from '../../../src/auth/session';
import { SitePage } from '../../../src/components/SitePage';
import { PilgrimDashboard } from '../../../src/journey/PilgrimDashboard';
import { getDashboardAction } from '../../../src/journey/dashboard-actions';

// Pilgrim dashboard — passport scans, deposits, progress + tools. Account area (signed-in).
export default async function DashboardPage() {
  const user = await requireRole(['PILGRIM', 'AGENT', 'SUB_AGENT', 'ADMIN'], '/journey/dashboard');
  const initial = (await getDashboardAction()) ?? {
    members: [{ memberId: 'me', name: 'Me', relation: 'Me' }],
    passports: {},
    bookingStep: null,
    depositPaid: false,
    greetName: (user.displayName || '').trim().split(/\s+/)[0] ?? '',
    bookingRef: 'BRN-26-00000',
    packageTotalMinor: 0,
    depositPaidMinor: 0,
  };
  return (
    <SitePage user={user}>
      <PilgrimDashboard initial={initial} />
    </SitePage>
  );
}
