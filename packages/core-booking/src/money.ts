import type { Currency, Money } from '@auj/contracts';

/**
 * Sum a list of Money into one subtotal per currency. A package may legitimately
 * mix currencies (SAR pilgrimage supply + EUR flights); FX conversion is the
 * payments module's job, so we never collapse currencies here.
 */
export function sumByCurrency(amounts: Money[]): Money[] {
  const totals = new Map<Currency, number>();
  for (const m of amounts) {
    totals.set(m.currency, (totals.get(m.currency) ?? 0) + m.amount);
  }
  return [...totals.entries()].map(([currency, amount]) => ({ amount, currency }));
}
