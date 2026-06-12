import { SandboxPaymentProvider } from './sandbox';

/**
 * PKR gateway (e.g. Safepay/PayFast). Sandbox/in-memory stand-in implementing the
 * PaymentProvider port; replace with the gateway SDK for production. PKR acquiring
 * is flagged as higher-risk to validate early (see docs/assumptions.md A3).
 */
export class PkrGatewayProvider extends SandboxPaymentProvider {
  constructor() {
    super('safepay', 'PKR');
  }
}
