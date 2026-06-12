import type { SaudiConnector, TravelSupplier } from '@auj/contracts';
import type { VisaConfig } from '@auj/visa-router';
import { CrmService } from './crm';
import { BookingService } from './booking-service';
import { DocumentService } from './document-service';
import { buildPackage } from './package-builder';
import { createInMemoryStores, type Stores } from './in-memory';
import type { Clock, DocumentStore, PassportOcr } from './ports';

export interface CoreBookingDeps {
  /** Injected connector seam — connector-mock in dev/test, connector-saudi in prod. */
  saudi: SaudiConnector;
  travel: TravelSupplier;
  /** Defaults to all-in-memory stores (offline). */
  stores?: Stores;
  visaConfig?: VisaConfig;
  documentStore?: DocumentStore;
  ocr?: PassportOcr;
  now?: Clock;
}

/** The typed service surface the apps consume (wrap in tRPC/OpenAPI at the app edge). */
export interface CoreBooking {
  crm: CrmService;
  bookings: BookingService;
  documents: DocumentService;
  buildPackage: typeof buildPackage;
  stores: Stores;
}

export function createCoreBooking(deps: CoreBookingDeps): CoreBooking {
  const stores = deps.stores ?? createInMemoryStores();
  const documentStore = deps.documentStore ?? stores.documentStore;

  return {
    crm: new CrmService(stores.customers, stores.pilgrims, deps.now),
    bookings: new BookingService({
      bookings: stores.bookings,
      visaCases: stores.visaCases,
      pilgrims: stores.pilgrims,
      saudi: deps.saudi,
      travel: deps.travel,
      visaConfig: deps.visaConfig,
      now: deps.now,
    }),
    documents: new DocumentService(stores.documents, documentStore, deps.ocr, deps.now),
    buildPackage,
    stores,
  };
}
