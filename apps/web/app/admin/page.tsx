import { requireRole } from '../../src/auth/session';
import { AdminConsole } from './AdminConsole';

// Back office — ADMIN only. Guard runs server-side before the client console renders.
export default async function AdminPage() {
  await requireRole(['ADMIN'], '/admin');
  return <AdminConsole />;
}
