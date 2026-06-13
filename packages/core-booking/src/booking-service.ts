import type { PackageMode, Pilgrim as ContractsPilgrim, RawdahPermit, RawdahSlot, SaudiConnector, TravelSupplier } from '@auj/contracts';
import { routeForGroup, type VisaConfig } from '@auj/visa-router';
import type { Booking, BookingChannel, CrmPilgrim, PackageItem, VisaCase } from './domain';
import { toContractsPilgrim } from './domain';
import { assertTransition } from './state-machine';
import type { BookingRepository, Clock, PilgrimRepository, VisaCaseRepository } from './ports';
import { uuidv7 } from './ids';

const isoNow: Clock = () => new Date().toISOString();

export class BookingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BookingError';
  }
}

export interface CreateBookingInput {
  customerId: string;
  channel: BookingChannel;
  mode?: PackageMode;
  pilgrimIds: string[];
  items: PackageItem[];
}

export interface BookingServiceDeps {
  bookings: BookingRepository;
  visaCases: VisaCaseRepository;
  pilgrims: PilgrimRepository;
  /** Pilgrimage supply (Maqam/Nusuk) — injected interface, never a concrete connector. */
  saudi: SaudiConnector;
  /** General-travel supply — injected interface. */
  travel: TravelSupplier;
  visaConfig?: VisaConfig;
  now?: Clock;
}

/**
 * Orchestrates the booking lifecycle across the connector seam + visa-router.
 * Pilgrimage bookings are two-step (hold -> confirm) with a visa flow; general
 * travel is one-step (book). Receives connectors by DI, so swapping in the real
 * Saudi connector needs no change here.
 */
export class BookingService {
  private readonly now: Clock;

  constructor(private readonly deps: BookingServiceDeps) {
    this.now = deps.now ?? isoNow;
  }

  private async require(bookingId: string): Promise<Booking> {
    const b = await this.deps.bookings.get(bookingId);
    if (!b) throw new BookingError(`Unknown booking: ${bookingId}`);
    return b;
  }

  private async contractsPilgrims(b: Booking): Promise<ContractsPilgrim[]> {
    const crm = await this.crmPilgrims(b);
    return crm.map(toContractsPilgrim);
  }

  private async crmPilgrims(b: Booking): Promise<CrmPilgrim[]> {
    const found = await Promise.all(b.pilgrimIds.map((id) => this.deps.pilgrims.get(id)));
    return found.filter((p): p is CrmPilgrim => p !== undefined);
  }

  private async persist(b: Booking): Promise<Booking> {
    b.updatedAt = this.now();
    return this.deps.bookings.save(b);
  }

  async createDraft(input: CreateBookingInput): Promise<Booking> {
    const ts = this.now();
    return this.deps.bookings.save({
      id: uuidv7(),
      customerId: input.customerId,
      channel: input.channel,
      status: 'DRAFT',
      pilgrimIds: input.pilgrimIds,
      items: input.items.map((i) => ({ ...i })),
      createdAt: ts,
      updatedAt: ts,
      ...(input.mode ? { mode: input.mode } : {}),
    });
  }

  /** Rawdah (Riyadh ul-Jannah) permit slots for a date (Madinah). */
  async rawdahSlots(date: string): Promise<RawdahSlot[]> {
    return this.deps.saudi.searchRawdahSlots(date);
  }

  /** Book a Rawdah permit for the booking's pilgrims and attach it to the booking. */
  async bookRawdah(bookingId: string, slotId: string): Promise<RawdahPermit> {
    const b = await this.require(bookingId);
    if (b.channel !== 'PILGRIMAGE') throw new BookingError('Rawdah is pilgrimage-only');
    const permit = await this.deps.saudi.bookRawdah(slotId, await this.contractsPilgrims(b));
    b.rawdah = permit;
    await this.persist(b);
    return permit;
  }

  /** Pilgrimage: place a hold with the Saudi connector. */
  async hold(bookingId: string): Promise<Booking> {
    const b = await this.require(bookingId);
    if (b.channel !== 'PILGRIMAGE') {
      throw new BookingError('hold() is for pilgrimage bookings; travel uses confirm() directly');
    }
    assertTransition(b.status, 'HELD');
    const ref = await this.deps.saudi.hold(
      b.items.map((i) => i.offerId),
      await this.contractsPilgrims(b),
    );
    b.holdId = ref.holdId;
    b.holdExpiresAt = ref.expiresAt;
    b.status = 'HELD';
    return this.persist(b);
  }

  /** Confirm payment-backed booking. Persists BRNs (one per item). */
  async confirm(bookingId: string, paymentRef: string): Promise<Booking> {
    const b = await this.require(bookingId);
    return b.channel === 'TRAVEL'
      ? this.confirmTravel(b)
      : this.confirmPilgrimage(b, paymentRef);
  }

  private async confirmPilgrimage(b: Booking, paymentRef: string): Promise<Booking> {
    if (!b.holdId) throw new BookingError('Cannot confirm: booking is not held');
    assertTransition(b.status, 'CONFIRMED');
    const result = await this.deps.saudi.confirm(b.holdId, { ref: paymentRef });
    if (result.status !== 'CONFIRMED') {
      throw new BookingError(`Connector confirm failed: ${result.status}`);
    }
    this.applyBooking(b, result.bookingRef, result.brns);
    b.status = 'CONFIRMED';
    return this.persist(b);
  }

  private async confirmTravel(b: Booking): Promise<Booking> {
    assertTransition(b.status, 'CONFIRMED');
    const result = await this.deps.travel.book(
      b.items.map((i) => i.offerId),
      await this.contractsPilgrims(b),
    );
    if (result.status !== 'CONFIRMED') {
      throw new BookingError(`Supplier book failed: ${result.status}`);
    }
    this.applyBooking(b, result.bookingRef, result.brns);
    b.status = 'CONFIRMED';
    return this.persist(b);
  }

  private applyBooking(b: Booking, bookingRef: string, brns: string[]): void {
    b.bookingRef = bookingRef;
    b.items = b.items.map((item, idx) => ({ ...item, brn: brns[idx] }));
  }

  /** Decide routes (visa-router), create the visa application (connector), open a VisaCase. */
  async startVisa(bookingId: string): Promise<{ booking: Booking; visaCase: VisaCase }> {
    const b = await this.require(bookingId);
    if (b.channel !== 'PILGRIMAGE') throw new BookingError('Visa flow is pilgrimage-only');
    if (!b.bookingRef) throw new BookingError('Confirm the booking before starting the visa flow');
    assertTransition(b.status, 'VISA_IN_PROGRESS');

    const pilgrims = (await this.crmPilgrims(b)).map(toContractsPilgrim);
    const perPilgrim = routeForGroup(pilgrims, { config: this.deps.visaConfig });
    const application = await this.deps.saudi.createVisaApplication(b.bookingRef, pilgrims);

    const visaCase: VisaCase = {
      id: uuidv7(),
      bookingId: b.id,
      visaRef: application.visaRef,
      route: application.route,
      status: application.status,
      perPilgrim,
    };
    await this.deps.visaCases.save(visaCase);

    b.visaCaseId = visaCase.id;
    b.status = 'VISA_IN_PROGRESS';
    await this.persist(b);
    return { booking: b, visaCase };
  }

  /** Poll the connector for the latest visa status and update the VisaCase. */
  async refreshVisa(bookingId: string): Promise<VisaCase> {
    const b = await this.require(bookingId);
    if (!b.visaCaseId) throw new BookingError('No visa case on this booking');
    const visaCase = await this.deps.visaCases.get(b.visaCaseId);
    if (!visaCase) throw new BookingError('Visa case not found');
    visaCase.status = await this.deps.saudi.getVisaStatus(visaCase.visaRef);
    return this.deps.visaCases.save(visaCase);
  }

  async markTicketed(bookingId: string): Promise<Booking> {
    const b = await this.require(bookingId);
    assertTransition(b.status, 'TICKETED');
    b.status = 'TICKETED';
    return this.persist(b);
  }

  async complete(bookingId: string): Promise<Booking> {
    const b = await this.require(bookingId);
    assertTransition(b.status, 'COMPLETED');
    b.status = 'COMPLETED';
    return this.persist(b);
  }

  /** Cancel via the relevant connector and capture any refund. */
  async cancel(bookingId: string): Promise<Booking> {
    const b = await this.require(bookingId);
    assertTransition(b.status, 'CANCELLED');
    if (b.bookingRef) {
      const res =
        b.channel === 'PILGRIMAGE'
          ? await this.deps.saudi.cancel(b.bookingRef)
          : await this.deps.travel.cancel(b.bookingRef);
      b.refund = res.refund;
    }
    b.status = 'CANCELLED';
    return this.persist(b);
  }

  async refund(bookingId: string): Promise<Booking> {
    const b = await this.require(bookingId);
    assertTransition(b.status, 'REFUNDED');
    b.status = 'REFUNDED';
    return this.persist(b);
  }
}
