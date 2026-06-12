import { describe, it, expect } from 'vitest';
import { DocumentService } from './document-service';
import { createInMemoryStores } from './in-memory';
import type { PassportOcr } from './ports';

const ocr: PassportOcr = {
  read: async () => ({ mrz: 'P<PAKALI<<IMRAN<<<<<<<<<<<<<<<<<<<<<<<<<<' }),
};

function makeService(withOcr = false) {
  const stores = createInMemoryStores();
  return {
    svc: new DocumentService(stores.documents, stores.documentStore, withOcr ? ocr : undefined, () => 'T0'),
    stores,
  };
}

describe('DocumentService', () => {
  it('uploads, stores bytes, and starts unverified', async () => {
    const { svc, stores } = makeService();
    const doc = await svc.upload({ pilgrimId: 'p1', type: 'PHOTO', fileName: 'photo.jpg', bytes: new Uint8Array([1, 2, 3]), contentType: 'image/jpeg' });
    expect(doc.verified).toBe(false);
    expect(doc.fileRef).toContain('pilgrims/p1/photo/');
    expect(await stores.documentStore.get(doc.fileRef)).toEqual(new Uint8Array([1, 2, 3]));
  });

  it('runs OCR on passport uploads when an OCR hook is provided', async () => {
    const { svc } = makeService(true);
    const doc = await svc.upload({ pilgrimId: 'p1', type: 'PASSPORT', fileName: 'pp.jpg', bytes: new Uint8Array([9]), contentType: 'image/jpeg' });
    expect(doc.mrz).toContain('P<PAK');
  });

  it('verifies and reports missing required types', async () => {
    const { svc } = makeService();
    const doc = await svc.upload({ pilgrimId: 'p1', type: 'PASSPORT', fileName: 'pp.jpg', bytes: new Uint8Array([1]), contentType: 'image/jpeg' });
    const verified = await svc.verify(doc.id);
    expect(verified.verified).toBe(true);
    expect(await svc.missingRequired('p1', ['PASSPORT', 'PHOTO'])).toEqual(['PHOTO']);
  });
});
