// Server-only seam selection. Picks the connector/supplier implementation by env:
//   CONNECTOR=mock|saudi   (default mock)  — the regulated Saudi pipe (Maqam/Nusuk)
//   SUPPLIER=mock|live     (default mock)  — general-travel supply (bedbank/GDS)
// Product code depends ONLY on the SaudiConnector / TravelSupplier interfaces, so
// swapping these requires no change anywhere above the seam.
import type { SaudiConnector, TravelSupplier } from '@auj/contracts';
import { createSaudiConnector as createMockSaudi, createTravelSupplier as createMockTravel } from '@auj/connector-mock';
import { createSaudiConnector as createCertifiedSaudi } from '@auj/connector-saudi';
import { createTravelConnector } from '@auj/connector-travel';

export function selectedConnectorKind(): 'mock' | 'saudi' {
  return (process.env.CONNECTOR ?? 'mock').toLowerCase() === 'saudi' ? 'saudi' : 'mock';
}

export function selectedSupplierKind(): 'mock' | 'live' {
  return (process.env.SUPPLIER ?? 'mock').toLowerCase() === 'live' ? 'live' : 'mock';
}

/** The Saudi pipe: certified connector when CONNECTOR=saudi, else the mock. */
export function selectSaudiConnector(): SaudiConnector {
  return selectedConnectorKind() === 'saudi' ? createCertifiedSaudi() : createMockSaudi();
}

/** General-travel supply: live bedbank/GDS connector when SUPPLIER=live, else the mock. */
export function selectTravelSupplier(): TravelSupplier {
  return selectedSupplierKind() === 'live' ? createTravelConnector() : createMockTravel();
}
