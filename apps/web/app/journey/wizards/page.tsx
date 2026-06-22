import { requireRole } from '../../../src/auth/session';
import { SitePage } from '../../../src/components/SitePage';
import { PilgrimWizardsHub, type TourClip, type WizardClip } from '../../../src/journey/PilgrimWizardsHub';
import { getProfileStore } from '../../../src/journey/profile-store';
import { getTourVideoStore } from '../../../src/ritual/tour/tour-video-store';
import { getStepVideoStore } from '../../../src/ritual/step-video-store';
import { getWizardStore } from '../../../src/ritual/wizard-store';
import { WIZARDS, WIZARD_SLUGS } from '../../../src/ritual/wizard-steps';
import { tourScenes } from '../../../src/ritual/tour/scenes';

// Pilgrim — manage your personal wizard data (preferences + the videos you've attached). Sign-in required.
export default async function MyWizardsPage() {
  const user = await requireRole(['PILGRIM', 'AGENT', 'SUB_AGENT', 'ADMIN'], '/journey/wizards');

  const [profile, tourVideos] = await Promise.all([
    (await getProfileStore()).get(user.id),
    (await getTourVideoStore()).listForUser(user.id),
  ]);

  const scenes = tourScenes('en');
  const tourClips: TourClip[] = Object.entries(tourVideos).map(([sceneId, url]) => ({
    sceneId,
    label: scenes.find((s) => s.id === sceneId)?.title ?? sceneId,
    url,
  }));

  const sv = await getStepVideoStore();
  const ws = await getWizardStore();
  const wizardClips: WizardClip[] = [];
  for (const slug of WIZARD_SLUGS) {
    const vids = await sv.listByWizard(user.id, slug);
    const entries = Object.entries(vids);
    if (entries.length === 0) continue;
    const steps = await ws.getWizard(slug);
    for (const [idxStr, url] of entries) {
      const stepIdx = Number(idxStr);
      wizardClips.push({ wizard: slug, wizardTitle: WIZARDS[slug].title, stepIdx, stepLabel: steps[stepIdx]?.short ?? `Step ${stepIdx + 1}`, url });
    }
  }

  return (
    <SitePage user={user}>
      <PilgrimWizardsHub preferences={profile?.preferences ?? []} tourClips={tourClips} wizardClips={wizardClips} />
    </SitePage>
  );
}
