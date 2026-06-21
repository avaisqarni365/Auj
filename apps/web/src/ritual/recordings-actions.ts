'use server';

import { getCurrentUser } from '../auth/session';
import { getObjectStore } from '../storage/document-store';
import { getCloudRecordingStore, type CloudRecording } from './recordings-cloud-store';

const MAX_BYTES = 20 * 1024 * 1024; // 20 MB audio
const EXT: Record<string, string> = { 'audio/webm': 'webm', 'audio/ogg': 'ogg', 'audio/mp4': 'm4a', 'audio/mpeg': 'mp3', 'audio/wav': 'wav' };

export interface CloudRecordingView extends CloudRecording {
  url: string;
}

const withUrl = (r: CloudRecording): CloudRecordingView => ({ ...r, url: `/api/doc/${r.audioKey}` });

export async function listMyRecordingsAction(stepKey?: string): Promise<CloudRecordingView[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  return (await (await getCloudRecordingStore()).list(user.id, stepKey)).map(withUrl);
}

export async function uploadRecordingAction(form: FormData): Promise<{ ok: boolean; error?: string; rec?: CloudRecordingView }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: 'Sign in to save to your account' };
  const file = form.get('file');
  if (!(file instanceof File)) return { ok: false, error: 'No audio' };
  if (file.size > MAX_BYTES) return { ok: false, error: 'Recording too large (max 20 MB)' };
  const mimeRaw = ((file.type || 'audio/webm').split(';')[0] ?? 'audio/webm').toLowerCase();
  const ext = EXT[mimeRaw] ?? 'webm';

  const id = (globalThis.crypto?.randomUUID?.() ?? `rec-${Date.now()}`).slice(0, 36);
  const key = `${user.id}/recording/${id}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  await (await getObjectStore()).put(key, bytes, mimeRaw);

  const rec: CloudRecording = {
    id,
    stepKey: String(form.get('stepKey') || '').slice(0, 64),
    name: String(form.get('name') || 'Recording').slice(0, 120),
    lang: String(form.get('lang') || 'en').slice(0, 8),
    audioKey: key,
    mime: mimeRaw,
    durationSec: Math.max(0, Math.trunc(Number(form.get('durationSec')) || 0)),
    createdAt: new Date().toISOString(),
  };
  await (await getCloudRecordingStore()).add(user.id, rec);
  return { ok: true, rec: withUrl(rec) };
}

export async function deleteRecordingCloudAction(id: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  await (await getCloudRecordingStore()).remove(user.id, id);
}
