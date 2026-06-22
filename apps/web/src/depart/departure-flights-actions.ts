'use server';

// Live-if-API flight lookup for the departure hub. Goes through the TravelSupplier seam:
// real GDS (Amadeus/Sabre via @auj/connector-travel) when SUPPLIER=live, otherwise the mock.
// Product code depends only on the interface — no change here when the real GDS is wired.
import type { FlightOffer } from '@auj/contracts';
import { selectTravelSupplier, selectedSupplierKind } from '../connectors';

export interface DepartureFlights {
  live: boolean; // true when a real GDS is configured (SUPPLIER=live); else sample offers from the mock
  offers: FlightOffer[];
}

/** Flights from `from` (IATA) to the Saudi entry airport `hub` ('JED' | 'MED') on `date`. */
export async function getDepartureFlightsAction(from: string, hub: string, date: string): Promise<DepartureFlights> {
  const live = selectedSupplierKind() === 'live';
  const f = from.trim().toUpperCase().slice(0, 4);
  const to = hub.trim().toUpperCase() === 'MED' ? 'MED' : 'JED';
  try {
    const offers = await selectTravelSupplier().searchFlights({ from: f, to, date, pax: 1 });
    return { live, offers: offers.slice(0, 8) };
  } catch {
    return { live, offers: [] };
  }
}
