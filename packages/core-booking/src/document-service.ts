import type { Document, DocumentType } from './domain';
import type { Clock, DocumentRepository, DocumentStore, PassportOcr } from './ports';
import { uuidv7 } from './ids';

const isoNow: Clock = () => new Date().toISOString();

export interface UploadInput {
  pilgrimId: string;
  type: DocumentType;
  fileName: string;
  bytes: Uint8Array;
  contentType: string;
}

/** Upload, store (S3-compatible), validate, and attach documents to pilgrims. */
export class DocumentService {
  constructor(
    private readonly documents: DocumentRepository,
    private readonly store: DocumentStore,
    private readonly ocr?: PassportOcr,
    private readonly now: Clock = isoNow,
  ) {}

  async upload(input: UploadInput): Promise<Document> {
    const key = `pilgrims/${input.pilgrimId}/${input.type.toLowerCase()}/${uuidv7()}-${input.fileName}`;
    await this.store.put(key, input.bytes, input.contentType);

    const mrz =
      input.type === 'PASSPORT' && this.ocr
        ? (await this.ocr.read(input.bytes))?.mrz
        : undefined;

    return this.documents.save({
      id: uuidv7(),
      pilgrimId: input.pilgrimId,
      type: input.type,
      fileRef: key,
      verified: false,
      uploadedAt: this.now(),
      mrz,
    });
  }

  async verify(documentId: string): Promise<Document> {
    const doc = await this.documents.get(documentId);
    if (!doc) throw new Error(`Unknown document: ${documentId}`);
    return this.documents.save({ ...doc, verified: true });
  }

  async forPilgrim(pilgrimId: string): Promise<Document[]> {
    return this.documents.listByPilgrim(pilgrimId);
  }

  /** Which of the required document types are still missing for a pilgrim. */
  async missingRequired(pilgrimId: string, required: DocumentType[]): Promise<DocumentType[]> {
    const present = new Set((await this.documents.listByPilgrim(pilgrimId)).map((d) => d.type));
    return required.filter((t) => !present.has(t));
  }
}
