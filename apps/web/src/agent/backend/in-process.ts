// COMPOSITION ROOT (dev/test). The only file that references concrete connectors.
// Wires core-booking + the env-selected connector + the payments wallet/ledger into
// the AgentApi / BookingApi / WalletApi ports the portal depends on.
import { createCoreBooking } from '@auj/core-booking';
import { Ledger, WalletService } from '@auj/payments';
import { AgentService } from '../agents';
import type { AgentApi, Backend, BookingApi, WalletApi } from '../ports';
import { selectSaudiConnector, selectTravelSupplier } from '../../connectors';

export function createInProcessBackend(): Backend {
  const saudi = selectSaudiConnector();
  const travel = selectTravelSupplier();
  const core = createCoreBooking({ saudi, travel });

  const ledger = new Ledger();
  const wallet = new WalletService(ledger);
  const agentService = new AgentService();

  const agents: AgentApi = {
    register: (input) => agentService.register(input),
    approve: (id) => agentService.approve(id),
    get: (id) => agentService.get(id),
    list: () => agentService.list(),
  };

  const booking: BookingApi = {
    searchHotels: (c) => saudi.searchHotels(c),
    createCustomer: (input) => core.crm.createCustomer(input),
    addPilgrim: (input) => core.crm.addPilgrim(input),
    createBooking: (input) => core.bookings.createDraft(input),
    hold: (id) => core.bookings.hold(id),
    confirm: (id, ref) => core.bookings.confirm(id, ref),
    getBooking: (id) => core.stores.bookings.get(id),
  };

  const walletApi: WalletApi = {
    open: (agentId, currency, creditLimit) => wallet.open({ agentId, currency, creditLimit }),
    balance: (agentId) => wallet.balance(agentId),
    available: (agentId) => wallet.available(agentId),
    held: (agentId) => wallet.held(agentId),
    topUp: (agentId, amount, ref) => wallet.topUp(agentId, amount, ref),
    hold: (agentId, amount, ref) => wallet.hold(agentId, amount, ref),
    settle: (agentId, amount, ref) => wallet.settle(agentId, amount, ref),
    entries: () => ledger.all(),
  };

  return { agents, booking, wallet: walletApi };
}
