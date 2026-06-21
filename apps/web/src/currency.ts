import type { Money } from '@auj/contracts';

/** Mock FX rate (1 EUR = ₨310.8). EUR is the charged currency; PKR is display only. */
export const FX_EUR_TO_PKR = 310.8;

const SYMBOL: Record<Money['currency'], string> = { EUR: '€', PKR: '₨', SAR: 'SAR ' };

export function formatMoney(m: Money): string {
  const major = (m.amount / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return `${SYMBOL[m.currency]}${major}`;
}

/** Indicative PKR equivalent of an EUR amount (display only; never the charged figure). */
export function pkrIndicative(eur: Money): string {
  const pkr = Math.round((eur.amount / 100) * FX_EUR_TO_PKR);
  if (pkr >= 1_000_000) return `≈ ₨${(pkr / 1_000_000).toFixed(2)}M`;
  if (pkr >= 1000) return `≈ ₨${Math.round(pkr / 1000)}k`;
  return `≈ ₨${pkr}`;
}

// EUR is the charged currency of record. These are mock indicative rates for display only.
export type DisplayCurrency = 'EUR' | 'USD' | 'SAR' | 'PKR';
export const FX_FROM_EUR: Record<Exclude<DisplayCurrency, 'EUR'>, number> = { USD: 1.08, SAR: 4.05, PKR: FX_EUR_TO_PKR };
const DISPLAY_SYMBOL: Record<DisplayCurrency, string> = { EUR: '€', USD: '$', SAR: 'SAR ', PKR: '₨' };

/** Format an EUR (minor-units) amount in a chosen display currency. Non-EUR is indicative. */
export function displayFromEur(eurMinor: number, currency: DisplayCurrency): string {
  const major = currency === 'EUR' ? eurMinor / 100 : (eurMinor / 100) * FX_FROM_EUR[currency];
  return `${DISPLAY_SYMBOL[currency]}${Math.round(major).toLocaleString('en-US')}`;
}
