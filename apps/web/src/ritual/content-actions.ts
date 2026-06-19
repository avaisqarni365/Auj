'use server';

import { requireRole } from '../auth/session';
import { getContentStore } from './content-store';
import type { ContentOverrides, StepOverride } from './content-overrides';

export async function listOverridesAction(): Promise<ContentOverrides> {
  await requireRole(['ADMIN'], '/admin/umrah-content');
  return (await getContentStore()).getOverrides();
}

export async function saveOverrideAction(stepKey: string, lang: string, fields: StepOverride): Promise<ContentOverrides> {
  await requireRole(['ADMIN'], '/admin/umrah-content');
  const store = await getContentStore();
  await store.setOverride(stepKey, lang, fields);
  return store.getOverrides();
}
