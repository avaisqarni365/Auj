import type { Booking, CrmPilgrim, Customer, Document, Package, VisaCase } from './domain';
import type {
  BookingRepository,
  CustomerRepository,
  DocumentRepository,
  DocumentStore,
  PackageRepository,
  PilgrimRepository,
  Repository,
  VisaCaseRepository,
} from './ports';

class InMemoryRepo<T extends { id: string }> implements Repository<T> {
  protected readonly items = new Map<string, T>();

  async get(id: string): Promise<T | undefined> {
    return this.items.get(id);
  }

  async save(entity: T): Promise<T> {
    this.items.set(entity.id, entity);
    return entity;
  }

  async list(): Promise<T[]> {
    return [...this.items.values()];
  }
}

class InMemoryDocumentRepo extends InMemoryRepo<Document> implements DocumentRepository {
  async listByPilgrim(pilgrimId: string): Promise<Document[]> {
    return [...this.items.values()].filter((d) => d.pilgrimId === pilgrimId);
  }
}

export class InMemoryDocumentStore implements DocumentStore {
  private readonly blobs = new Map<string, Uint8Array>();

  async put(key: string, bytes: Uint8Array): Promise<{ key: string }> {
    this.blobs.set(key, bytes);
    return { key };
  }

  async get(key: string): Promise<Uint8Array | undefined> {
    return this.blobs.get(key);
  }
}

export interface Stores {
  customers: CustomerRepository;
  pilgrims: PilgrimRepository;
  packages: PackageRepository;
  bookings: BookingRepository;
  visaCases: VisaCaseRepository;
  documents: DocumentRepository;
  documentStore: DocumentStore;
}

/** The default dev/test wiring: everything in memory, no network, no DB. */
export function createInMemoryStores(): Stores {
  return {
    customers: new InMemoryRepo<Customer>(),
    pilgrims: new InMemoryRepo<CrmPilgrim>(),
    packages: new InMemoryRepo<Package>(),
    bookings: new InMemoryRepo<Booking>(),
    visaCases: new InMemoryRepo<VisaCase>(),
    documents: new InMemoryDocumentRepo(),
    documentStore: new InMemoryDocumentStore(),
  };
}
