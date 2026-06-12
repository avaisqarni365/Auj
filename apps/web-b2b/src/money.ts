import type { Money } from '@auj/contracts';

const SYMBOL: Record<Money['currency'], string> = { EUR: '€', PKR: '₨', SAR: 'SAR ' };

export const FX_EUR_TO_PKR = 310.8;

export function formatMoney(m: Money): string {
  const major = (m.amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${SYMBOL[m.currency]}${major}`;
}

/** "€1,200.00 ≈ ₨372,960" for an EUR amount (display only). */
export function formatWithPkr(eur: Money): string {
  if (eur.currency !== 'EUR') return formatMoney(eur);
  const pkr = formatMoney({ amount: Math.round(eur.amount * FX_EUR_TO_PKR), currency: 'PKR' });
  return `${formatMoney(eur)} ≈ ${pkr}`;
}
