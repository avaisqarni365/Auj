import { requireRole } from '../../../src/auth/session';
import { SitePage } from '../../../src/components/SitePage';
import { WizardsAdmin } from '../../../src/admin/WizardsAdmin';
import { getWizardStore } from '../../../src/ritual/wizard-store';
import { WIZARDS, WIZARD_SLUGS } from '../../../src/ritual/wizard-steps';
import type { WizStep, WizardSlug } from '../../../src/ritual/wizard-steps-types';

// Admin — full CRUD over the guided wizards' steps (add / edit / configure / reorder / delete).
export default async function WizardsAdminPage() {
  const user = await requireRole(['ADMIN'], '/admin/wizards');
  const store = await getWizardStore();
  const initial = {} as Record<WizardSlug, WizStep[]>;
  for (const slug of WIZARD_SLUGS) initial[slug] = await store.getWizard(slug);
  const titles = Object.fromEntries(WIZARD_SLUGS.map((s) => [s, WIZARDS[s].title])) as Record<WizardSlug, string>;
  return (
    <SitePage user={user}>
      <WizardsAdmin initial={initial} titles={titles} slugs={[...WIZARD_SLUGS]} />
    </SitePage>
  );
}
