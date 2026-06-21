// Service-provider registry (migration 13). Registry-driven: adding an integration here needs
// NO product-module change. Status is DERIVED from env presence — secrets themselves never live
// in code/DB/UI, only the env KEY NAMES that bind an adapter to its credentials.
export type ProviderStatus = 'connected' | 'sandbox' | 'gated' | 'not-configured';
export type ProviderMode = 'saudi-seam' | 'supplier-seam' | 'service';

export interface ProviderDef {
  slug: string;
  name: string;
  kind: string;
  adapter: string;
  binding: string; // human label of the env binding
  mode: ProviderMode;
  envKeys: string[]; // key NAMES only — values live in the vault
  capabilities: string[];
}

export const PROVIDERS: ProviderDef[] = [
  {
    slug: 'nusuk-saudi',
    name: 'Nusuk Masar / Maqam GDS',
    kind: 'Saudi pilgrimage',
    adapter: 'connector-saudi',
    binding: 'CONNECTOR=saudi',
    mode: 'saudi-seam',
    envKeys: ['CONNECTOR', 'MAQAM_CLIENT_ID', 'MAQAM_CLIENT_SECRET', 'NUSUK_AGENT_CODE'],
    capabilities: ['Hotels (Makkah/Madinah)', 'Transport (Naqaba)', 'Ground & ziyarah', 'Catering', 'e-Visa', 'Rawdah permit', 'BRN'],
  },
  {
    slug: 'bedbank',
    name: 'TBO / Hotelbeds',
    kind: 'General hotels (bedbank)',
    adapter: 'connector-travel',
    binding: 'SUPPLIER=live',
    mode: 'supplier-seam',
    envKeys: ['SUPPLIER', 'TBO_API_KEY'],
    capabilities: ['Hotels worldwide', 'Net rates'],
  },
  {
    slug: 'gds-flights',
    name: 'Amadeus / Sabre',
    kind: 'Flights (GDS)',
    adapter: 'connector-travel',
    binding: 'SUPPLIER=live',
    mode: 'supplier-seam',
    envKeys: ['SUPPLIER', 'AMADEUS_API_KEY'],
    capabilities: ['Flight search', 'Ticketing'],
  },
  {
    slug: 'stripe',
    name: 'Stripe',
    kind: 'Payments · EUR',
    adapter: 'payments',
    binding: 'STRIPE_*',
    mode: 'service',
    envKeys: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'],
    capabilities: ['Card', 'SEPA', 'Refunds', 'Webhooks'],
  },
  {
    slug: 'pkr-gateway',
    name: 'Safepay / PayFast',
    kind: 'Payments · PKR',
    adapter: 'payments',
    binding: 'PKR_GATEWAY_*',
    mode: 'service',
    envKeys: ['PKR_GATEWAY_KEY', 'PKR_GATEWAY_SECRET'],
    capabilities: ['Card', 'Refunds'],
  },
  {
    slug: 'object-store',
    name: 'S3 / MinIO',
    kind: 'Document store',
    adapter: 'core-booking · DocumentStore',
    binding: 'OBJECT_STORE_*',
    mode: 'service',
    envKeys: ['OBJECT_STORE_ENDPOINT', 'OBJECT_STORE_KEY', 'OBJECT_STORE_SECRET'],
    capabilities: ['Presigned upload', 'Blob storage'],
  },
  {
    slug: 'passport-ocr',
    name: 'Passport OCR',
    kind: 'Documents',
    adapter: 'core-booking · PassportOcr',
    binding: 'OCR_*',
    mode: 'service',
    envKeys: ['OCR_API_KEY'],
    capabilities: ['MRZ read'],
  },
];

type Env = Record<string, string | undefined>;
const hasCreds = (p: ProviderDef, env: Env): boolean =>
  p.envKeys.filter((k) => k !== 'CONNECTOR' && k !== 'SUPPLIER').every((k) => !!env[k]);

/** Pure status derivation from the env (so it is unit-testable without real env). */
export function providerStatus(p: ProviderDef, env: Env): ProviderStatus {
  if (p.mode === 'saudi-seam') {
    if ((env.CONNECTOR ?? 'mock').toLowerCase() === 'saudi') return hasCreds(p, env) ? 'connected' : 'gated';
    return 'sandbox'; // mock pipe is active
  }
  if (p.mode === 'supplier-seam') {
    if ((env.SUPPLIER ?? 'mock').toLowerCase() === 'live') return hasCreds(p, env) ? 'connected' : 'gated';
    return 'sandbox';
  }
  return hasCreds(p, env) ? 'connected' : 'not-configured';
}

export interface ProviderView extends ProviderDef {
  status: ProviderStatus;
  /** env keys that ARE bound (truthy) — names only, never values. */
  boundKeys: string[];
  missingKeys: string[];
}

export function listProviders(env: Env = process.env): ProviderView[] {
  return PROVIDERS.map((p) => ({
    ...p,
    status: providerStatus(p, env),
    boundKeys: p.envKeys.filter((k) => !!env[k]),
    missingKeys: p.envKeys.filter((k) => !env[k]),
  }));
}

export function findProvider(slug: string): ProviderDef | undefined {
  return PROVIDERS.find((p) => p.slug === slug);
}
