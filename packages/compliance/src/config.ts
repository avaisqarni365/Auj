import type { Money } from '@auj/contracts';

/** Insolvency-guarantee tiers (config so the certificate states the right cover). */
export type GuaranteeTier = 'T20K' | 'T50K' | 'T200K';

export interface TierConfig {
  tier: GuaranteeTier;
  coverage: Money; // minor units EUR
  label: string;
}

export const GUARANTEE_TIERS: Record<GuaranteeTier, TierConfig> = {
  T20K: { tier: 'T20K', coverage: { amount: 2_000_000, currency: 'EUR' }, label: 'EUR 20,000 insolvency guarantee' },
  T50K: { tier: 'T50K', coverage: { amount: 5_000_000, currency: 'EUR' }, label: 'EUR 50,000 insolvency guarantee' },
  T200K: { tier: 'T200K', coverage: { amount: 20_000_000, currency: 'EUR' }, label: 'EUR 200,000 insolvency guarantee' },
};

/** Revised EU Package Travel Directive insolvency refund window (~six months). */
export const REFUND_WINDOW_DAYS = 183;

/** Version of the mandated pre-contractual information shown before payment. */
export const PRECONTRACT_INFO_VERSION = '2026-01';
