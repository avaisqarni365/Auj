import { CertificateService, type SecurityCertificate } from './certificate';
import { ConsentRequiredError, ConsentService } from './consent';
import { GdprService } from './gdpr';
import type { GuaranteeTier } from './config';

export interface ComplianceConfig {
  /** Guarantee tier the operator holds; stated on every certificate. */
  tier: GuaranteeTier;
  insurer?: string;
  now?: () => string;
}

/**
 * Cross-cutting EU compliance for the Lithuanian operator: insolvency certificate
 * per package booking, pre-contract consent gating before charging, and GDPR.
 */
export class ComplianceService {
  readonly certificates: CertificateService;
  readonly consent: ConsentService;
  readonly gdpr: GdprService;
  private readonly tier: GuaranteeTier;

  constructor(cfg: ComplianceConfig) {
    this.tier = cfg.tier;
    this.certificates = new CertificateService(cfg.insurer, cfg.now);
    this.consent = new ConsentService(cfg.now);
    this.gdpr = new GdprService(cfg.now);

    this.gdpr.recordProcessing({
      purpose: 'Package booking fulfilment & insolvency protection',
      dataCategories: ['identity', 'passport', 'contact', 'payment-reference'],
      legalBasis: 'Contract / legal obligation (EU PTD)',
    });
    this.gdpr.registerProvider((customerId) => ({
      certificates: this.certificates.byCustomer(customerId),
      consents: this.consent.forCustomer(customerId),
    }));
  }

  /** Block a charge until pre-contractual info has been shown and consented to. */
  assertChargeable(bookingRef: string): void {
    if (!this.consent.hasConsent(bookingRef)) throw new ConsentRequiredError(bookingRef);
  }

  /** On a confirmed package booking: issue and deliver the security certificate. */
  onPackageBooked(input: {
    bookingRef: string;
    customerId: string;
    customerName: string;
    deliveryChannel?: string;
  }): SecurityCertificate {
    const cert = this.certificates.issue({
      bookingRef: input.bookingRef,
      customerId: input.customerId,
      customerName: input.customerName,
      tier: this.tier,
    });
    return this.certificates.deliver(cert.id, input.deliveryChannel ?? 'email');
  }
}
