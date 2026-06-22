import { getCurrentUser } from '../auth/session';
import { SitePage } from '../components/SitePage';
import { StepVideoWizard } from './StepVideoWizard';
import { getStepVideoStore } from './step-video-store';
import { WIZARDS } from './wizard-steps';
import { WIZARD_I18N } from './wizard-steps-i18n';
import { DRAFT_LOCALES, WIZARD_DRAFTS } from './wizard-steps-drafts';
import { getWizardStore } from './wizard-store';
import type { WizardSlug } from './wizard-steps-types';

// Server loader shared by every step-video wizard (/guide/<slug>).
// Public; step content from the DB seed, per-step clips persist to the account when signed in.
export async function WizardScreen({ slug }: { slug: WizardSlug }) {
  const user = await getCurrentUser();
  const baseSteps = await (await getWizardStore()).getWizard(slug);
  // Merge translation overlays (index-aligned) into each step's localized text; EN/other languages
  // are unaffected, and any missing translation falls back to English at render time.
  //   • WIZARD_I18N — reviewed LT/TR.
  //   • WIZARD_DRAFTS — machine-translated UR/DE drafts (flagged "under review" in the UI).
  const overlay = WIZARD_I18N[slug] ?? [];
  const drafts = WIZARD_DRAFTS[slug] ?? [];
  const steps = baseSteps.map((s, i) => ({ ...s, text: { ...s.text, ...(overlay[i] ?? {}), ...(drafts[i] ?? {}) } }));
  const draftLangs = WIZARD_DRAFTS[slug] ? [...DRAFT_LOCALES] : [];
  const videos = user ? await (await getStepVideoStore()).listByWizard(user.id, slug) : {};
  const def = WIZARDS[slug];
  return (
    <SitePage user={user}>
      <StepVideoWizard title={def.title} subtitle={def.subtitle} icon={def.icon} slug={slug} steps={steps} signedIn={!!user} initialVideos={videos} draftLangs={draftLangs} />
    </SitePage>
  );
}
