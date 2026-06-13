// COMPOSITION ROOT for the back office. Wires the shared service packages and exposes
// the AdminApi oversight surface. In production these share the same Postgres/ledger as
// the customer apps; here they are in-memory for dev/test.
import { MockSaudiConnector, MockTravelSupplier } from '@auj/connector-mock';
import { ComplianceService } from '@auj/compliance';
import { createCoreBooking, type CoreBooking } from '@auj/core-booking';
import { Ledger, PaymentsService, PkrGatewayProvider, ProviderRouter, StripeProvider } from '@auj/payments';
import type { AdminApi } from '../ports';

export interface AdminBackend {
  admin: AdminApi;
  core: CoreBooking;
  payments: PaymentsService;
  ledger: Ledger;
  compliance: ComplianceService;
  saudi: MockSaudiConnector;
}

export function createInProcessBackend(): AdminBackend {
  const saudi = new MockSaudiConnector();
  const travel = new MockTravelSupplier();
  const core = createCoreBooking({ saudi, travel });

  const ledger = new Ledger();
  const payments = new PaymentsService(
    new ProviderRouter().register(new StripeProvider()).register(new PkrGatewayProvider()),
    ledger,
  );
  const compliance = new ComplianceService({ tier: 'T50K' });

  const admin: AdminApi = {
    listBookings: () => core.stores.bookings.list(),
    getBooking: (id) => core.stores.bookings.get(id),
    cancelBooking: (id) => core.bookings.cancel(id),
    refundBooking: (id) => core.bookings.refund(id),
    listVisaCases: () => core.stores.visaCases.list(),
    ledgerEntries: () => ledger.all(),
    accountBalance: (account, currency) => ledger.balance(account, currency),
    listCertificates: () => compliance.certificates.list(),
    exportSubject: (id) => compliance.gdpr.exportSubject(id),
    deleteSubject: (id) => compliance.gdpr.deleteSubject(id),
  };

  return { admin, core, payments, ledger, compliance, saudi };
}
