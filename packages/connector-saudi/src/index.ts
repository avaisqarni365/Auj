// @auj/connector-saudi — the REAL SaudiConnector adapter (Maqam GDS / Nusuk Masar via
// a Ministry-approved partner). GATED on operator authorization. Drop-in for
// connector-mock, selected by env (CONNECTOR=saudi). Today it ships an offline sandbox
// client so it passes the shared contract-tests; swap in the real HTTP client when the
// partner sandbox/credentials arrive (see docs/assumptions.md A1).
import type { SaudiConnector } from '@auj/contracts';
import { SandboxSaudiPartnerClient, type SaudiPartnerClient } from './client';
import { SaudiPartnerConnector, type SaudiPartnerConfig } from './connector';

export * from './client';
export * from './mappers';
export { SaudiPartnerConnector, NusukApprovalError, type SaudiPartnerConfig } from './connector';

export function createSaudiConnector(opts?: {
  client?: SaudiPartnerClient;
  config?: SaudiPartnerConfig;
}): SaudiConnector {
  return new SaudiPartnerConnector(opts?.client ?? new SandboxSaudiPartnerClient(), opts?.config ?? {});
}
