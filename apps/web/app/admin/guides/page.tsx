import { requireRole } from '../../../src/auth/session';
import { SitePage } from '../../../src/components/SitePage';
import { GuidesAdmin } from '../../../src/admin/GuidesAdmin';
import { getGuideStore, type GuideCities } from '../../../src/companion/guide-store';
import { GUIDES, GUIDE_SLUGS, type GuideSlug } from '../../../src/companion/guide-data';

// Admin — full CRUD over the companion guides' items (per city & category).
export default async function GuidesAdminPage() {
  const user = await requireRole(['ADMIN'], '/admin/guides');
  const store = await getGuideStore();
  const initial = {} as Record<GuideSlug, GuideCities>;
  for (const slug of GUIDE_SLUGS) initial[slug] = await store.getGuide(slug);
  const titles = Object.fromEntries(GUIDE_SLUGS.map((s) => [s, GUIDES[s].title])) as Record<GuideSlug, string>;
  return (
    <SitePage user={user}>
      <GuidesAdmin initial={initial} titles={titles} slugs={[...GUIDE_SLUGS]} />
    </SitePage>
  );
}
