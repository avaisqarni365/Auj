'use server';

import { requireRole } from './auth/session';
import { getLandingContentStore } from './landing-content-store';
import { LANDING_CONTENT_KEYS, type LandingOverrides } from './landing-content';

export async function listLandingContentAction(): Promise<LandingOverrides> {
  await requireRole(['ADMIN'], '/admin/landing-content');
  return (await getLandingContentStore()).getOverrides();
}

export async function saveLandingContentAction(key: string, locale: string, value: string): Promise<LandingOverrides> {
  await requireRole(['ADMIN'], '/admin/landing-content');
  // Only allow the known editable keys; clamp value length.
  if (!(LANDING_CONTENT_KEYS as readonly string[]).includes(key)) return (await getLandingContentStore()).getOverrides();
  const store = await getLandingContentStore();
  await store.setOverride(key, locale.slice(0, 8), value.trim().slice(0, 400));
  return store.getOverrides();
}
