'use server';

import { getCurrentUser } from '../auth/session';
import { getObjectStore } from './document-store';

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED = /^(image\/(png|jpe?g|webp|heic)|application\/pdf)$/i;
const EXT: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/webp': 'webp', 'image/heic': 'heic', 'application/pdf': 'pdf' };

export interface UploadResult {
  ok: boolean;
  key?: string;
  url?: string;
  contentType?: string;
  error?: string;
}

/** Upload a document for the signed-in user. Stored under their id so retrieval is owner-scoped. */
export async function uploadDocumentAction(form: FormData): Promise<UploadResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: 'Not signed in' };
  const file = form.get('file');
  const kind = String(form.get('kind') || 'doc').replace(/[^a-z0-9_-]/gi, '').slice(0, 32) || 'doc';
  if (!(file instanceof File)) return { ok: false, error: 'No file' };
  if (file.size > MAX_BYTES) return { ok: false, error: 'File too large (max 8 MB)' };
  const contentType = file.type || 'application/octet-stream';
  if (!ALLOWED.test(contentType)) return { ok: false, error: 'Only images or PDF are allowed' };

  const bytes = new Uint8Array(await file.arrayBuffer());
  const id = (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.round(Math.random() * 1e9)}`).slice(0, 36);
  const key = `${user.id}/${kind}/${id}.${EXT[contentType.toLowerCase()] ?? 'bin'}`;
  await (await getObjectStore()).put(key, bytes, contentType);
  return { ok: true, key, url: `/api/doc/${key}`, contentType };
}
