// @auj/connector-mock — the default dev/test implementation of the contracts.
// Product modules talk to the SaudiConnector / TravelSupplier interfaces; in dev
// and test those are satisfied by these in-memory mocks (no network, deterministic).
import type { SaudiConnector, TravelSupplier } from '@auj/contracts';
import { MockSaudiConnector } from './saudi';
import { MockTravelSupplier } from './travel';

export { MockSaudiConnector } from './saudi';
export { MockTravelSupplier } from './travel';
export * from './catalog';
export { resolveVisaRoute } from './visa-rule';

/** Factory matching the env-selected connector seam (CONNECTOR=mock). */
export function createSaudiConnector(): SaudiConnector {
  return new MockSaudiConnector();
}

/** Factory matching the env-selected supplier seam (SUPPLIER=mock). */
export function createTravelSupplier(): TravelSupplier {
  return new MockTravelSupplier();
}
