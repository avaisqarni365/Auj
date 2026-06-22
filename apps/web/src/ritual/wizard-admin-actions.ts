'use server';

import { requireRole } from '../auth/session';
import { getWizardStore } from './wizard-store';
import { WIZARD_SLUGS } from './wizard-steps';
import type { WizStep, WizardSlug } from './wizard-steps-types';

const isSlug = (s: string): s is WizardSlug => (WIZARD_SLUGS as readonly string[]).includes(s);

/** Admin — current steps for one wizard (DB if edited/seeded, else the bundled seed). */
export async function getWizardStepsAction(slug: WizardSlug): Promise<WizStep[]> {
  await requireRole(['ADMIN'], '/admin/wizards');
  return (await getWizardStore()).getWizard(slug);
}

/** Admin — replace a wizard's full ordered step list (add / edit / reorder / delete in one save). */
export async function saveWizardStepsAction(slug: WizardSlug, steps: WizStep[]): Promise<{ ok: boolean; count: number }> {
  await requireRole(['ADMIN'], '/admin/wizards');
  if (!isSlug(slug)) throw new Error('Unknown wizard');
  // Sanitise: trim strings, cap sizes, keep only known item shapes.
  const clean: WizStep[] = steps.slice(0, 60).map((s) => ({
    short: String(s.short ?? '').slice(0, 60),
    label: String(s.label ?? '').slice(0, 80),
    text: s.text ?? {},
    items: (Array.isArray(s.items) ? s.items : []).slice(0, 40).map((it) =>
      typeof it === 'string' ? it.slice(0, 200) : { label: String(it.label ?? '').slice(0, 200), status: it.status },
    ),
    ...(s.tip ? { tip: String(s.tip).slice(0, 300) } : {}),
    ...(s.videoUrl ? { videoUrl: String(s.videoUrl).slice(0, 1000) } : {}),
  }));
  await (await getWizardStore()).setWizard(slug, clean);
  return { ok: true, count: clean.length };
}
