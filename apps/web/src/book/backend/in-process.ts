// COMPOSITION ROOT (dev/test + server). The ONLY file in the app that knows about a
// concrete connector and the persistence choice. It wires core-booking + payments into
// the BookingApi / PaymentsApi ports the rest of the app depends on.
//   - createInProcessBackend(): in-memory, synchronous — used by tests.
//   - createBackend(): env-aware — Postgres when DATABASE_URL is set, else in-memory.
import type { SaudiConnector, TravelSupplier } from '@auj/contracts';
import { MockSaudiConnector, MockTravelSupplier } from '@auj/connector-mock';
import { createCoreBooking, type CoreBooking } from '@auj/core-booking';
import { createPool, migrate, createPostgresStores } from '@auj/core-booking/postgres';
import { Ledger, PaymentsService, createPaymentRouter } from '@auj/payments';
import type { Backend, BookingApi, PaymentsApi } from '../ports';
import { selectSaudiConnector, selectTravelSupplier } from '../../connectors';

function wire(core: CoreBooking, saudi: SaudiConnector, travel: TravelSupplier): Backend {
  const ledger = new Ledger();
  // Env-selected: live Stripe/PKR when their keys are set, else the offline sandbox.
  const payments = new PaymentsService(createPaymentRouter(), ledger);

  const booking: BookingApi = {
    searchHotels: (c) => saudi.searchHotels(c),
    searchFlights: (c) => travel.searchFlights(c),
    searchZiyarah: (c) => saudi.searchZiyarah(c),
    searchCatering: (c) => saudi.searchCatering(c),
    createCustomer: (input) => core.crm.createCustomer(input),
    addPilgrim: (input) => core.crm.addPilgrim(input),
    createBooking: (input) => core.bookings.createDraft(input),
    hold: (id) => core.bookings.hold(id),
    confirm: (id, ref) => core.bookings.confirm(id, ref),
    startVisa: (id) => core.bookings.startVisa(id),
    refreshVisa: (id) => core.bookings.refreshVisa(id),
    rawdahSlots: (date) => core.bookings.rawdahSlots(date),
    bookRawdah: (id, slotId) => core.bookings.bookRawdah(id, slotId),
    redeemGift: (code) => core.bookings.redeemGift(code),
    setRequestStatus: (id, requestId, status) => core.bookings.setRequestStatus(id, requestId, status),
    listBookings: () => core.stores.bookings.list(),
    myBookings: async (email) => {
      const lower = email.toLowerCase();
      const mine = new Set((await core.stores.customers.list()).filter((c) => c.email.toLowerCase() === lower).map((c) => c.id));
      const all = await core.stores.bookings.list();
      return all.filter((b) => mine.has(b.customerId)).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    },
    myBooking: async (email, id) => {
      const b = await core.stores.bookings.get(id);
      if (!b) return undefined;
      const customer = await core.stores.customers.get(b.customerId);
      return customer && customer.email.toLowerCase() === email.toLowerCase() ? b : undefined;
    },
    pilgrims: (ids) => core.crm.getPilgrims(ids),
    getBooking: (id) => core.stores.bookings.get(id),
  };

  const paymentsApi: PaymentsApi = {
    pay: (input) => payments.pay(input).then((r) => ({ paymentRef: r.paymentRef })),
  };

  return { booking, payments: paymentsApi };
}

/** In-memory backend with the mock seam (hermetic). Synchronous — used by unit/e2e tests. */
export function createInProcessBackend(): Backend {
  const saudi = new MockSaudiConnector();
  const travel = new MockTravelSupplier();
  return wire(createCoreBooking({ saudi, travel }), saudi, travel);
}

/** Production/dev backend: connector/supplier selected by env (CONNECTOR/SUPPLIER);
 * Postgres-backed when DATABASE_URL is set, else in-memory. */
export async function createBackend(): Promise<Backend> {
  const saudi = selectSaudiConnector();
  const travel = selectTravelSupplier();
  const url = process.env.DATABASE_URL;

  if (url) {
    const pool = createPool(url);
    await migrate(pool);
    return wire(createCoreBooking({ saudi, travel, stores: createPostgresStores(pool) }), saudi, travel);
  }
  return wire(createCoreBooking({ saudi, travel }), saudi, travel);
}
