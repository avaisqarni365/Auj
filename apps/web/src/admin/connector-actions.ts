'use server';

// Admin connector ops actions. ADMIN-only. Status is derived from env presence; Test connection
// pings the adapter THROUGH the interface (the mock by default) and logs a health_check.
import type { SearchCriteria } from '@auj/contracts';
import { requireRole } from '../auth/session';
import { selectSaudiConnector, selectTravelSupplier } from '../connectors';
import { findProvider, listProviders, providerStatus, type ProviderStatus } from './providers';
import { getHealthStore } from './health-store';

const SAMPLE: SearchCriteria = { city: 'MAKKAH', checkIn: '2026-09-01', checkOut: '2026-09-05', pax: 2 };

export interface ProviderRow {
  slug: string;
  name: string;
  kind: string;
  adapter: string;
  binding: string;
  status: ProviderStatus;
  capabilities: string[];
  boundKeys: string[];
  missingKeys: string[];
  lastChecked: string | null;
  latencyMs: number | null;
  lastOk: boolean | null;
}

export async function listProvidersAction(): Promise<ProviderRow[]> {
  await requireRole(['ADMIN'], '/admin/providers');
  const latest = await (await getHealthStore()).latest();
  return listProviders().map((p) => {
    const h = latest[p.slug];
    return {
      slug: p.slug,
      name: p.name,
      kind: p.kind,
      adapter: p.adapter,
      binding: p.binding,
      status: p.status,
      capabilities: p.capabilities,
      boundKeys: p.boundKeys,
      missingKeys: p.missingKeys,
      lastChecked: h?.ts ?? null,
      latencyMs: h?.latencyMs ?? null,
      lastOk: h?.ok ?? null,
    };
  });
}

/** Ping an adapter through its interface and record the result. Never touches secrets. */
export async function testConnectionAction(slug: string): Promise<{ ok: boolean; latencyMs: number; message: string }> {
  await requireRole(['ADMIN'], '/admin/providers');
  const p = findProvider(slug);
  if (!p) return { ok: false, latencyMs: 0, message: 'Unknown provider' };
  const status = providerStatus(p, process.env);

  const t0 = Date.now();
  let ok = false;
  let message = '';
  try {
    if (p.mode === 'saudi-seam') {
      const n = (await selectSaudiConnector().searchHotels(SAMPLE)).length;
      ok = true;
      message = `${status === 'sandbox' ? 'Mock' : 'Certified'} adapter responded · ${n} hotel offers`;
    } else if (p.mode === 'supplier-seam') {
      const n = (await selectTravelSupplier().searchHotels({ ...SAMPLE, country: 'SA' })).length;
      ok = true;
      message = `${status === 'sandbox' ? 'Mock' : 'Live'} supplier responded · ${n} offers`;
    } else if (status === 'connected') {
      ok = true;
      message = 'Credentials present · adapter reachable (stub ping)';
    } else {
      ok = false;
      const missing = p.envKeys.filter((k) => !process.env[k]);
      message = `Not configured — missing ${missing.join(', ') || 'credentials'} in the vault`;
    }
  } catch (e) {
    ok = false;
    message = e instanceof Error ? e.message : 'Ping failed';
  }
  const latencyMs = Date.now() - t0;
  await (await getHealthStore()).record(slug, status, ok, latencyMs, message);
  return { ok, latencyMs, message };
}
