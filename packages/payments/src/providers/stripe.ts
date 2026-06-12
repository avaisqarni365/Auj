import { SandboxPaymentProvider } from './sandbox';

/**
 * EUR acquirer (Stripe). Sandbox/in-memory stand-in implementing the PaymentProvider
 * port; replace the internals with the Stripe SDK (PaymentIntents API) for production.
 */
export class StripeProvider extends SandboxPaymentProvider {
  constructor() {
    super('stripe', 'EUR');
  }
}
