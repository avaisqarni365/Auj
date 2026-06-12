// packages/contracts is the single source of truth for shared types + interfaces.
// Filled in by the saudi-connector-interface skill (next Wave 0 step). Seeded here.
export const CONTRACTS_VERSION = '0.0.0';

export type Currency = 'EUR' | 'PKR' | 'SAR';

/** Money is always integer minor units + currency. Never a float. */
export interface Money {
  readonly amount: number; // minor units
  readonly currency: Currency;
}
