import { z } from 'zod';

/** Supported settlement / display currencies. EUR is the charged currency; PKR is display; SAR is supplier-side. */
export const CurrencySchema = z.enum(['EUR', 'PKR', 'SAR']);
export type Currency = z.infer<typeof CurrencySchema>;

/** Money is ALWAYS integer minor units + currency. Never a float. */
export const MoneySchema = z.object({
  amount: z.number().int(), // minor units (e.g. cents)
  currency: CurrencySchema,
});
export type Money = z.infer<typeof MoneySchema>;
