// @auj/connector-travel — adapters for general (non-pilgrimage) travel supply:
// a bedbank (hotels) + a flight GDS, mapping vendor payloads INTO our domain
// types behind the TravelSupplier interface. Open APIs, zero Saudi dependency.
import type { BedbankClient } from './bedbank';
import type { FlightClient } from './flights';
import { BedbankHotelSource, SandboxBedbankClient } from './bedbank';
import { AmadeusFlightSource, SandboxFlightClient } from './flights';
import { TravelConnector } from './travel-connector';

export * from './ports';
export * from './money';
export * from './bedbank';
export * from './flights';
export { TravelConnector } from './travel-connector';
export { uuidv7 } from './ids';

/**
 * Build a TravelSupplier. Defaults to offline sandbox clients; inject real
 * bedbank/GDS clients (same interfaces) in production.
 */
export function createTravelConnector(deps?: {
  bedbank?: BedbankClient;
  flights?: FlightClient;
}): TravelConnector {
  return new TravelConnector(
    new BedbankHotelSource(deps?.bedbank ?? new SandboxBedbankClient()),
    new AmadeusFlightSource(deps?.flights ?? new SandboxFlightClient()),
  );
}
