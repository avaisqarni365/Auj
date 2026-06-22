'use server';

import { getCurrentUser } from '../../auth/session';
import { getTourVideoStore } from './tour-video-store';

/** A pilgrim's saved tour clips (sceneId → url). Empty for anonymous visitors. */
export async function getTourVideosAction(): Promise<Record<string, string>> {
  const user = await getCurrentUser();
  if (!user) return {};
  return (await getTourVideoStore()).listForUser(user.id);
}

/** Sign-in required: attach your own clip to a scene (link to YouTube / Vimeo / MP4). */
export async function saveTourVideoAction(sceneId: string, url: string): Promise<{ ok: boolean }> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Please sign in to add your own videos.');
  const clean = url.trim().slice(0, 1000);
  if (!clean) throw new Error('Please paste a video link.');
  await (await getTourVideoStore()).set(user.id, sceneId.slice(0, 80), clean);
  return { ok: true };
}

export async function deleteTourVideoAction(sceneId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  await (await getTourVideoStore()).remove(user.id, sceneId.slice(0, 80));
}
