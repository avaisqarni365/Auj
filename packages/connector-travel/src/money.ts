import { CurrencySchema, type Currency, type Money } from '@auj/contracts';

/** Validate a vendor currency code against our supported set. */
export function parseCurrency(code: string): Currency {
  return CurrencySchema.parse(code.toUpperCase());
}

/** Vendors quote major units (e.g. 120.50); we store integer minor units. */
export function toMinorUnits(major: number): number {
  if (!Number.isFinite(major)) throw new Error(`Invalid price: ${major}`);
  return Math.round(major * 100);
}

export function money(major: number, code: string): Money {
  return { amount: toMinorUnits(major), currency: parseCurrency(code) };
}
