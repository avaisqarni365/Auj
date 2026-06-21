import { getCurrentUser } from '../auth/session';
import { SitePage } from '../components/SitePage';
import { StepVideoWizard } from './StepVideoWizard';
import { getStepVideoStore } from './step-video-store';
import { WIZARDS } from './wizard-steps';
import { getWizardStore } from './wizard-store';
import type { WizardSlug } from './wizard-steps-types';

// Server loader shared by every step-video wizard (/guide/<slug>).
// Public; step content from the DB seed, per-step clips persist to the account when signed in.
export async function WizardScreen({ slug }: { slug: WizardSlug }) {
  const user = await getCurrentUser();
  const steps = await (await getWizardStore()).getWizard(slug);
  const videos = user ? await (await getStepVideoStore()).listByWizard(user.id, slug) : {};
  const def = WIZARDS[slug];
  return (
    <SitePage user={user}>
      <StepVideoWizard title={def.title} subtitle={def.subtitle} icon={def.icon} slug={slug} steps={steps} signedIn={!!user} initialVideos={videos} />
    </SitePage>
  );
}
