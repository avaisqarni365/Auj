import { getCurrentUser } from '../auth/session';
import { SitePage } from '../components/SitePage';
import { GUIDES, type GuideSlug } from './guide-data';
import { getGuideStore } from './guide-store';
import { GuideWizard } from './GuideWizard';

// Server loader shared by every companion guide page (/guide/<slug>).
// Public; content comes from the DB seed (editable later via the Admin CMS).
export async function GuideScreen({ slug }: { slug: GuideSlug }) {
  const [user, cities] = await Promise.all([getCurrentUser(), (await getGuideStore()).getGuide(slug)]);
  const def = GUIDES[slug];
  return (
    <SitePage user={user}>
      <GuideWizard title={def.title} subtitle={def.subtitle} icon={def.icon} cities={cities} />
    </SitePage>
  );
}
