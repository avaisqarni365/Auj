import type { Money } from '@auj/contracts';

/** Mock FX rate (1 EUR = ₨310.8). EUR is the charged currency; PKR is display only. */
export const FX_EUR_TO_PKR = 310.8;

/** Convert EUR minor units to an indicative PKR minor-unit amount (display only). */
export function eurToPkrMinor(eurMinor: number): number {
  return Math.round(eurMinor * FX_EUR_TO_PKR);
}

const SYMBOL: Record<Money['currency'], string> = { EUR: '€', PKR: '₨', SAR: 'SAR ' };

/** Format minor units as a human string, e.g. { 120000, EUR } -> "€1,200.00". */
export function formatMoney(m: Money): string {
  const major = (m.amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${SYMBOL[m.currency]}${major}`;
}

/** "€1,200.00 ≈ ₨372,960" for an EUR amount. */
export function formatWithPkr(eur: Money): string {
  if (eur.currency !== 'EUR') return formatMoney(eur);
  const pkr = formatMoney({ amount: eurToPkrMinor(eur.amount), currency: 'PKR' });
  return `${formatMoney(eur)} ≈ ${pkr}`;
}
