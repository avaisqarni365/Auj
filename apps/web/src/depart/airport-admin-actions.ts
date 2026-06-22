'use server';

import { requireRole } from '../auth/session';
import { getAirportStore } from './airport-store';
import { DEPART_REGIONS, type DepartAirport, type DepartRegion, type DepartRoute } from './airport-content';

const str = (x: unknown, n: number): string => String(x ?? '').slice(0, n);

const toRegion = (x: unknown): DepartRegion =>
  (DEPART_REGIONS as readonly string[]).includes(String(x)) ? (x as DepartRegion) : 'Western Europe';

function cleanRoutes(raw: unknown, dest: 'Makkah' | 'Madinah'): DepartRoute[] {
  const arr = Array.isArray(raw) ? raw : [];
  return arr.slice(0, 6).map((r): DepartRoute => {
    const o = (r ?? {}) as Partial<DepartRoute>;
    const airlines = (Array.isArray(o.airlines) ? o.airlines : [])
      .slice(0, 6)
      .map((al) => str(al, 80))
      .filter((al) => al.length > 0);
    return {
      dest,
      hub: str(o.hub, 8),
      airlines,
      via: str(o.via, 120),
      frequency: str(o.frequency, 80),
      durationText: str(o.durationText, 80),
    };
  });
}

function clean(a: DepartAirport): DepartAirport {
  const checkInSteps = (Array.isArray(a.checkInSteps) ? a.checkInSteps : [])
    .slice(0, 8)
    .map((s) => str(s, 300));
  return {
    code: str(a.code, 4).toUpperCase(),
    city: str(a.city, 80),
    country: str(a.country, 80),
    region: toRegion(a.region),
    blurb: str(a.blurb, 400),
    checkInSteps,
    toMakkah: cleanRoutes(a.toMakkah, 'Makkah'),
    toMadinah: cleanRoutes(a.toMadinah, 'Madinah'),
    arrivalsNote: str(a.arrivalsNote, 400),
  };
}

/** Admin — every departure airport, in display order. */
export async function listAirportsAction(): Promise<DepartAirport[]> {
  await requireRole(['ADMIN'], '/admin/airports');
  return (await getAirportStore()).listAirports();
}

/** Admin — create or update an airport; returns the fresh list so the client can refresh. */
export async function saveAirportAction(a: DepartAirport): Promise<DepartAirport[]> {
  await requireRole(['ADMIN'], '/admin/airports');
  const safe = clean(a);
  if (!safe.code) throw new Error('Airport code is required');
  const store = await getAirportStore();
  await store.upsertAirport(safe);
  return store.listAirports();
}

/** Admin — delete an airport; returns the fresh list so the client can refresh. */
export async function deleteAirportAction(code: string): Promise<DepartAirport[]> {
  await requireRole(['ADMIN'], '/admin/airports');
  const store = await getAirportStore();
  await store.deleteAirport(str(code, 4).toUpperCase());
  return store.listAirports();
}
