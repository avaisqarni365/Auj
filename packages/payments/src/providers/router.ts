import type { Currency } from '@auj/contracts';
import type { PaymentProvider } from '../ports';

/** Routes a payment to the provider registered for its currency. */
export class ProviderRouter {
  private readonly byCurrency = new Map<Currency, PaymentProvider>();

  register(provider: PaymentProvider): this {
    this.byCurrency.set(provider.currency, provider);
    return this;
  }

  supports(currency: Currency): boolean {
    return this.byCurrency.has(currency);
  }

  forCurrency(currency: Currency): PaymentProvider {
    const provider = this.byCurrency.get(currency);
    if (!provider) throw new Error(`No payment provider registered for ${currency}`);
    return provider;
  }
}
