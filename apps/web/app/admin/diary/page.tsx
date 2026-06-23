import { requireRole } from '../../../src/auth/session';
import { SitePage } from '../../../src/components/SitePage';
import { DiaryDefaultsAdmin } from '../../../src/admin/DiaryDefaultsAdmin';
import { getDiaryDefaultsStore } from '../../../src/ritual/diary-defaults-store';

// Admin — full CRUD over the shared default Personal Diary config (Quran target + nafl + dua list).
export default async function DiaryAdminPage() {
  const user = await requireRole(['ADMIN'], '/admin/diary');
  const defaults = await (await getDiaryDefaultsStore()).getDefaults();
  return (
    <SitePage user={user}>
      <DiaryDefaultsAdmin initial={defaults} />
    </SitePage>
  );
}
