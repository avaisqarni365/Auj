import type {
  FlightOffer,
  GroundOffer,
  HotelOffer,
  TransportOffer,
} from '@auj/contracts';
import type { BookingChannel, Package, PackageItem } from './domain';
import { sumByCurrency } from './money';
import { uuidv7 } from './ids';

// Map connector/supplier offers into channel-neutral PackageItems.
export const hotelItem = (o: HotelOffer): PackageItem => ({
  kind: 'HOTEL',
  offerId: o.id,
  title: o.name,
  net: o.nightlyNet,
});
export const transportItem = (o: TransportOffer): PackageItem => ({
  kind: 'TRANSPORT',
  offerId: o.id,
  title: `${o.route} — ${o.vehicle}`,
  net: o.net,
});
export const groundItem = (o: GroundOffer): PackageItem => ({
  kind: 'GROUND',
  offerId: o.id,
  title: o.name,
  net: o.net,
});
export const flightItem = (o: FlightOffer): PackageItem => ({
  kind: 'FLIGHT',
  offerId: o.id,
  title: `${o.carrier} ${o.depart} → ${o.arrive}`,
  net: o.net,
});

/** Compose offers into a sellable package with per-currency net totals. */
export function buildPackage(input: {
  name: string;
  channel: BookingChannel;
  items: PackageItem[];
}): Package {
  return {
    id: uuidv7(),
    name: input.name,
    channel: input.channel,
    items: input.items,
    totals: sumByCurrency(input.items.map((i) => i.net)),
  };
}
