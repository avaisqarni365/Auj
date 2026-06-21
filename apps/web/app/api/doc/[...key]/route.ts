import { getCurrentUser } from '../../../../src/auth/session';
import { getObjectStore } from '../../../../src/storage/document-store';

// Owner-scoped blob retrieval. Documents are keyed `${userId}/...`; only the owner (or an
// ADMIN) may fetch them, so passports/recordings never leak across accounts.
export async function GET(_req: Request, { params }: { params: { key: string[] } }) {
  const key = params.key.map(decodeURIComponent).join('/');
  const user = await getCurrentUser();
  if (!user) return new Response('Unauthorized', { status: 401 });
  const owner = key.split('/')[0];
  if (owner !== user.id && user.role !== 'ADMIN') return new Response('Forbidden', { status: 403 });

  const doc = await (await getObjectStore()).get(key);
  if (!doc) return new Response('Not found', { status: 404 });
  return new Response(Buffer.from(doc.bytes), {
    status: 200,
    headers: { 'Content-Type': doc.contentType, 'Cache-Control': 'private, max-age=300' },
  });
}
