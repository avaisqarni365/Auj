import type { Money } from '@auj/contracts';
import { uuidv7 } from './ids';
import { GUARANTEE_TIERS, type GuaranteeTier } from './config';

export interface SecurityCertificate {
  id: string;
  bookingRef: string;
  customerId: string;
  customerName: string;
  tier: GuaranteeTier;
  coverage: Money;
  insurer: string;
  issuedAt: string;
  deliveredAt?: string;
  deliveryProof?: string;
  content: string; // certificate body (stand-in for the rendered PDF)
}

export function renderCertificate(c: {
  id: string;
  bookingRef: string;
  customerName: string;
  tier: GuaranteeTier;
  insurer: string;
  issuedAt: string;
}): string {
  return [
    'AUJ — Consumer Insolvency Protection Certificate',
    `Certificate: ${c.id}`,
    `Booking: ${c.bookingRef}`,
    `Customer: ${c.customerName}`,
    `Protection: ${GUARANTEE_TIERS[c.tier].label}`,
    `Insurer / guarantor: ${c.insurer}`,
    `Issued: ${c.issuedAt}`,
    'Issued under the EU Package Travel Directive by the Lithuanian tour operator.',
  ].join('\n');
}

/** Issues + stores the insolvency-protection certificate and records its delivery. */
export class CertificateService {
  private readonly certs = new Map<string, SecurityCertificate>();

  constructor(
    private readonly insurer = 'TBD guarantor (VVTAT-registered)',
    private readonly now: () => string = () => new Date().toISOString(),
  ) {}

  issue(input: { bookingRef: string; customerId: string; customerName: string; tier: GuaranteeTier }): SecurityCertificate {
    const id = `CERT-${uuidv7().slice(0, 8)}`;
    const issuedAt = this.now();
    const cert: SecurityCertificate = {
      id,
      bookingRef: input.bookingRef,
      customerId: input.customerId,
      customerName: input.customerName,
      tier: input.tier,
      coverage: GUARANTEE_TIERS[input.tier].coverage,
      insurer: this.insurer,
      issuedAt,
      content: renderCertificate({ id, bookingRef: input.bookingRef, customerName: input.customerName, tier: input.tier, insurer: this.insurer, issuedAt }),
    };
    this.certs.set(cert.id, cert);
    return cert;
  }

  deliver(certId: string, channel: string): SecurityCertificate {
    const cert = this.require(certId);
    cert.deliveredAt = this.now();
    cert.deliveryProof = `delivered via ${channel} at ${cert.deliveredAt}`;
    return cert;
  }

  byBooking(bookingRef: string): SecurityCertificate | undefined {
    return [...this.certs.values()].find((c) => c.bookingRef === bookingRef);
  }

  byCustomer(customerId: string): SecurityCertificate[] {
    return [...this.certs.values()].filter((c) => c.customerId === customerId);
  }

  list(): SecurityCertificate[] {
    return [...this.certs.values()];
  }

  get(id: string): SecurityCertificate | undefined {
    return this.certs.get(id);
  }

  private require(id: string): SecurityCertificate {
    const cert = this.certs.get(id);
    if (!cert) throw new Error(`Unknown certificate: ${id}`);
    return cert;
  }
}
