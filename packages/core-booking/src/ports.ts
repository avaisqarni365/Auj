import type { Booking, CrmPilgrim, Customer, Document, Package, VisaCase } from './domain';

/** Generic persistence port. In-memory in dev/test; a Prisma adapter implements the same shape later. */
export interface Repository<T> {
  get(id: string): Promise<T | undefined>;
  save(entity: T): Promise<T>;
  list(): Promise<T[]>;
}

export type CustomerRepository = Repository<Customer>;
export type PilgrimRepository = Repository<CrmPilgrim>;
export type PackageRepository = Repository<Package>;
export type BookingRepository = Repository<Booking>;
export type VisaCaseRepository = Repository<VisaCase>;

export interface DocumentRepository extends Repository<Document> {
  listByPilgrim(pilgrimId: string): Promise<Document[]>;
}

/** S3-compatible blob storage seam. In-memory in dev/test; real object store later. */
export interface DocumentStore {
  put(key: string, bytes: Uint8Array, contentType: string): Promise<{ key: string }>;
  get(key: string): Promise<Uint8Array | undefined>;
}

/** Optional passport-MRZ OCR seam. */
export interface PassportOcr {
  read(bytes: Uint8Array): Promise<{ mrz: string } | undefined>;
}

/** Injectable clock so timestamps are deterministic in tests. */
export type Clock = () => string;
