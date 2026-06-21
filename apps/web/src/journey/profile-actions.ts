'use server';

import { getCurrentUser } from '../auth/session';
import { getProfileStore } from './profile-store';
import type { PilgrimProfile, ProfileInput } from './profile-types';

export async function getProfileAction(): Promise<PilgrimProfile | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return (await (await getProfileStore()).get(user.id)) ?? null;
}

/** Sign-in required to save (always-DB, per-pilgrim). */
export async function saveProfileAction(input: ProfileInput): Promise<PilgrimProfile> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Please sign in to save your profile.');
  return (await getProfileStore()).save(user.id, input);
}
