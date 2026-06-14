import { ProviderRouter } from './router';
import { StripeProvider } from './stripe';
import { PkrGatewayProvider } from './pkr';
import { LiveStripeProvider } from './stripe-live';
import { LiveHttpProvider } from './http-live';
import type { PaymentProvider } from '../ports';

export interface PaymentEnv {
  STRIPE_SECRET_KEY?: string;
  STRIPE_BASE_URL?: string;
  PKR_GATEWAY_URL?: string;
  PKR_GATEWAY_KEY?: string;
}

/** EUR provider: live Stripe when STRIPE_SECRET_KEY is set, else the in-memory sandbox. */
export function selectEurProvider(env: PaymentEnv = process.env): PaymentProvider {
  return env.STRIPE_SECRET_KEY
    ? new LiveStripeProvider({ secretKey: env.STRIPE_SECRET_KEY, ...(env.STRIPE_BASE_URL ? { baseUrl: env.STRIPE_BASE_URL } : {}) })
    : new StripeProvider();
}

/** PKR provider: live HTTP gateway when URL+KEY are set, else the in-memory sandbox. */
export function selectPkrProvider(env: PaymentEnv = process.env): PaymentProvider {
  return env.PKR_GATEWAY_URL && env.PKR_GATEWAY_KEY
    ? new LiveHttpProvider({ name: 'safepay', currency: 'PKR', baseUrl: env.PKR_GATEWAY_URL, apiKey: env.PKR_GATEWAY_KEY })
    : new PkrGatewayProvider();
}

/**
 * Build the payment router from env. Defaults to the offline sandbox providers (dev/test/CI),
 * and swaps in the real acquirers when their credentials are present — no caller changes.
 */
export function createPaymentRouter(env: PaymentEnv = process.env): ProviderRouter {
  return new ProviderRouter().register(selectEurProvider(env)).register(selectPkrProvider(env));
}
