'use server';

import { requireRole } from '../auth/session';
import { getObjectStore } from '../storage/document-store';
import { getAirportStore } from './airport-store';
import { DEPART_REGIONS, cleanMedia, type DepartAirport, type DepartMedia, type DepartRegion, type DepartRoute } from './airport-content';

const str = (x: unknown, n: number): string => String(x ?? '').slice(0, n);

const toRegion = (x: unknown): DepartRegion =>
  (DEPART_REGIONS as readonly string[]).includes(String(x)) ? (x as DepartRegion) : 'Western Europe';

function cleanRoutes(raw: unknown, dest: 'Makkah' | 'Madinah'): DepartRoute[] {
  const arr = Array.isArray(raw) ? raw : [];
  return arr.slice(0, 6).map((r): DepartRoute => {
    const o = (r ?? {}) as Partial<DepartRoute>;
    const airlines = (Array.isArray(o.airlines) ? o.airlines : [])
      .slice(0, 6)
      .map((al) => str(al, 80))
      .filter((al) => al.length > 0);
    return {
      dest,
      hub: str(o.hub, 8),
      airlines,
      via: str(o.via, 120),
      frequency: str(o.frequency, 80),
      durationText: str(o.durationText, 80),
    };
  });
}

function clean(a: DepartAirport): DepartAirport {
  const checkInSteps = (Array.isArray(a.checkInSteps) ? a.checkInSteps : [])
    .slice(0, 8)
    .map((s) => str(s, 300));
  return {
    code: str(a.code, 4).toUpperCase(),
    city: str(a.city, 80),
    country: str(a.country, 80),
    region: toRegion(a.region),
    blurb: str(a.blurb, 400),
    checkInSteps,
    toMakkah: cleanRoutes(a.toMakkah, 'Makkah'),
    toMadinah: cleanRoutes(a.toMadinah, 'Madinah'),
    arrivalsNote: str(a.arrivalsNote, 400),
    ...(a.media && a.media.length ? { media: cleanMedia(a.media) } : {}),
  };
}

// Uploaded airport walkthrough media is PUBLIC content, stored under `depart/<code>/...` and
// served by the public /api/airport-media route (not the owner-scoped /api/doc).
const MEDIA_MAX = 64 * 1024 * 1024; // 64 MB
const MEDIA_EXT: Record<string, string> = {
  'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov',
  'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp',
};

/** Admin — upload a walkthrough clip/photo for an airport; returns its public URL + media item. */
export async function uploadAirportMediaAction(form: FormData): Promise<{ ok: boolean; error?: string; media?: DepartMedia }> {
  await requireRole(['ADMIN'], '/admin/airports');
  const code = str(form.get('code'), 4).toUpperCase().replace(/[^A-Z]/g, '');
  if (!code) return { ok: false, error: 'Select an airport first' };
  const file = form.get('file');
  if (!(file instanceof File)) return { ok: false, error: 'No file' };
  if (file.size > MEDIA_MAX) return { ok: false, error: 'File too large (max 64 MB)' };
  const ct = (file.type || '').toLowerCase();
  const ext = MEDIA_EXT[ct];
  if (!ext) return { ok: false, error: 'Use MP4/WebM/MOV video or PNG/JPG/WebP image' };

  const bytes = new Uint8Array(await file.arrayBuffer());
  const id = (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`).slice(0, 36);
  const key = `depart/${code}/${id}.${ext}`;
  await (await getObjectStore()).put(key, bytes, ct);
  return { ok: true, media: { type: ct.startsWith('image/') ? 'image' : 'video', source: 'upload', url: `/api/airport-media/${key}` } };
}

/** Admin — every departure airport, in display order. */
export async function listAirportsAction(): Promise<DepartAirport[]> {
  await requireRole(['ADMIN'], '/admin/airports');
  return (await getAirportStore()).listAirports();
}

/** Admin — create or update an airport; returns the fresh list so the client can refresh. */
export async function saveAirportAction(a: DepartAirport): Promise<DepartAirport[]> {
  await requireRole(['ADMIN'], '/admin/airports');
  const safe = clean(a);
  if (!safe.code) throw new Error('Airport code is required');
  const store = await getAirportStore();
  await store.upsertAirport(safe);
  return store.listAirports();
}

/** Admin — delete an airport; returns the fresh list so the client can refresh. */
export async function deleteAirportAction(code: string): Promise<DepartAirport[]> {
  await requireRole(['ADMIN'], '/admin/airports');
  const store = await getAirportStore();
  await store.deleteAirport(str(code, 4).toUpperCase());
  return store.listAirports();
}
