import { getObjectStore } from '../../../../src/storage/document-store';

// PUBLIC airport walkthrough media (admin-uploaded clips/photos). Unlike /api/doc (owner-scoped),
// these are public content — but we only ever serve keys under `depart/` so no user-owned blob
// (passports, recordings, keyed by userId) can be reached through here.
export async function GET(_req: Request, { params }: { params: { key: string[] } }) {
  const key = params.key.map(decodeURIComponent).join('/');
  if (!key.startsWith('depart/') || key.includes('..')) return new Response('Not found', { status: 404 });

  const doc = await (await getObjectStore()).get(key);
  if (!doc) return new Response('Not found', { status: 404 });
  return new Response(Buffer.from(doc.bytes), {
    status: 200,
    headers: { 'Content-Type': doc.contentType, 'Cache-Control': 'public, max-age=86400' },
  });
}
