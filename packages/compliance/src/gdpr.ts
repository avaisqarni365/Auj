import { uuidv7 } from './ids';

export interface ProcessingRecord {
  id: string;
  purpose: string;
  dataCategories: string[];
  legalBasis: string;
  createdAt: string;
}

/** Pulls a customer's data from a subsystem for a subject-access export. */
export type SubjectDataProvider = (customerId: string) => Record<string, unknown>;

/** GDPR duties: processing records, subject export (access/portability), erasure. */
export class GdprService {
  private readonly processing: ProcessingRecord[] = [];
  private readonly erased = new Set<string>();
  private readonly providers: SubjectDataProvider[] = [];

  constructor(private readonly now: () => string = () => new Date().toISOString()) {}

  recordProcessing(input: { purpose: string; dataCategories: string[]; legalBasis: string }): ProcessingRecord {
    const record: ProcessingRecord = { id: uuidv7(), ...input, createdAt: this.now() };
    this.processing.push(record);
    return record;
  }

  processingRecords(): ProcessingRecord[] {
    return [...this.processing];
  }

  registerProvider(provider: SubjectDataProvider): void {
    this.providers.push(provider);
  }

  /** Subject access / portability: aggregate everything held about a customer. */
  exportSubject(customerId: string): { customerId: string; exportedAt: string; sources: Record<string, unknown>[] } {
    return { customerId, exportedAt: this.now(), sources: this.providers.map((p) => p(customerId)) };
  }

  /** Right to erasure. */
  deleteSubject(customerId: string): { customerId: string; erasedAt: string } {
    this.erased.add(customerId);
    return { customerId, erasedAt: this.now() };
  }

  isErased(customerId: string): boolean {
    return this.erased.has(customerId);
  }
}
