import type { Money } from '@auj/contracts';

const SYMBOL: Record<Money['currency'], string> = { EUR: '€', PKR: '₨', SAR: 'SAR ' };

export function formatMoney(m: Money): string {
  const major = (m.amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${SYMBOL[m.currency]}${major}`;
}
