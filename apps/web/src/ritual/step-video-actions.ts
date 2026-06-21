'use server';

import { getCurrentUser } from '../auth/session';
import { parseEmbed } from './parse-embed';
import { getStepVideoStore } from './step-video-store';
import type { WizardSlug } from './wizard-steps-types';

export async function getStepVideosAction(wizard: WizardSlug): Promise<Record<number, string>> {
  const user = await getCurrentUser();
  if (!user) return {};
  return (await getStepVideoStore()).listByWizard(user.id, wizard);
}

export async function saveStepVideoAction(wizard: WizardSlug, stepIdx: number, url: string): Promise<{ ok: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false };
  // Only persist links we can actually embed.
  if (parseEmbed(url).kind === null) return { ok: false };
  await (await getStepVideoStore()).set(user.id, wizard, Math.max(0, Math.trunc(stepIdx)), url.trim().slice(0, 1000));
  return { ok: true };
}

export async function deleteStepVideoAction(wizard: WizardSlug, stepIdx: number): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  await (await getStepVideoStore()).remove(user.id, wizard, Math.max(0, Math.trunc(stepIdx)));
}
