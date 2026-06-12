// COMPOSITION ROOT (dev/test). This is the ONLY file in the app that knows about a
// concrete connector — it selects CONNECTOR=mock and wires core-booking + payments
// into the BookingApi / PaymentsApi ports the rest of the app depends on. In
// production a different backend (real connector by env, or a network client)
// implements the same ports; no screen or usecase changes.
import { MockSaudiConnector, MockTravelSupplier } from '@auj/connector-mock';
import { createCoreBooking } from '@auj/core-booking';
import {
  Ledger,
  PaymentsService,
  PkrGatewayProvider,
  ProviderRouter,
  StripeProvider,
} from '@auj/payments';
import type { Backend, BookingApi, PaymentsApi } from '../ports';

export function createInProcessBackend(): Backend {
  const saudi = new MockSaudiConnector();
  const travel = new MockTravelSupplier();
  const core = createCoreBooking({ saudi, travel });

  const ledger = new Ledger();
  const router = new ProviderRouter().register(new StripeProvider()).register(new PkrGatewayProvider());
  const payments = new PaymentsService(router, ledger);

  const booking: BookingApi = {
    searchHotels: (c) => saudi.searchHotels(c),
    searchFlights: (c) => travel.searchFlights(c),
    createCustomer: (input) => core.crm.createCustomer(input),
    addPilgrim: (input) => core.crm.addPilgrim(input),
    createBooking: (input) => core.bookings.createDraft(input),
    hold: (id) => core.bookings.hold(id),
    confirm: (id, ref) => core.bookings.confirm(id, ref),
    startVisa: (id) => core.bookings.startVisa(id),
    refreshVisa: (id) => core.bookings.refreshVisa(id),
    getBooking: (id) => core.stores.bookings.get(id),
  };

  const paymentsApi: PaymentsApi = {
    pay: (input) => payments.pay(input).then((r) => ({ paymentRef: r.paymentRef })),
  };

  return { booking, payments: paymentsApi };
}
