import { uuidv7 } from './ids';
import { PRECONTRACT_INFO_VERSION } from './config';

export interface ConsentRecord {
  id: string;
  customerId: string;
  bookingRef: string;
  infoVersion: string;
  consentedAt: string;
}

export class ConsentRequiredError extends Error {
  constructor(bookingRef: string) {
    super(`Pre-contract consent required before charging booking ${bookingRef}`);
    this.name = 'ConsentRequiredError';
  }
}

/** Records that the mandated pre-contractual info was shown and consented to before payment. */
export class ConsentService {
  private readonly byBooking = new Map<string, ConsentRecord>();

  constructor(private readonly now: () => string = () => new Date().toISOString()) {}

  recordPreContractConsent(input: { customerId: string; bookingRef: string; infoVersion?: string }): ConsentRecord {
    const record: ConsentRecord = {
      id: uuidv7(),
      customerId: input.customerId,
      bookingRef: input.bookingRef,
      infoVersion: input.infoVersion ?? PRECONTRACT_INFO_VERSION,
      consentedAt: this.now(),
    };
    this.byBooking.set(input.bookingRef, record);
    return record;
  }

  hasConsent(bookingRef: string): boolean {
    return this.byBooking.has(bookingRef);
  }

  get(bookingRef: string): ConsentRecord | undefined {
    return this.byBooking.get(bookingRef);
  }

  forCustomer(customerId: string): ConsentRecord[] {
    return [...this.byBooking.values()].filter((c) => c.customerId === customerId);
  }
}
