import { describe, it, expect } from 'vitest';
import { findProvider, listProviders, providerStatus } from './providers';

const p = (slug: string) => findProvider(slug)!;

describe('provider registry status derivation', () => {
  it('Saudi seam: sandbox on mock, gated when switched without creds, connected with creds', () => {
    const saudi = p('nusuk-saudi');
    expect(providerStatus(saudi, {})).toBe('sandbox'); // default mock pipe
    expect(providerStatus(saudi, { CONNECTOR: 'saudi' })).toBe('gated'); // no creds
    expect(
      providerStatus(saudi, { CONNECTOR: 'saudi', MAQAM_CLIENT_ID: 'x', MAQAM_CLIENT_SECRET: 'y', NUSUK_AGENT_CODE: 'z' }),
    ).toBe('connected');
  });

  it('supplier seam: sandbox on mock, gated when live without creds', () => {
    const bed = p('bedbank');
    expect(providerStatus(bed, {})).toBe('sandbox');
    expect(providerStatus(bed, { SUPPLIER: 'live' })).toBe('gated');
    expect(providerStatus(bed, { SUPPLIER: 'live', TBO_API_KEY: 'k' })).toBe('connected');
  });

  it('service: not-configured until all key NAMES are present', () => {
    const stripe = p('stripe');
    expect(providerStatus(stripe, {})).toBe('not-configured');
    expect(providerStatus(stripe, { STRIPE_SECRET_KEY: 'sk' })).toBe('not-configured'); // webhook still missing
    expect(providerStatus(stripe, { STRIPE_SECRET_KEY: 'sk', STRIPE_WEBHOOK_SECRET: 'wh' })).toBe('connected');
  });

  it('listProviders reports bound/missing key NAMES (never values)', () => {
    const views = listProviders({ STRIPE_SECRET_KEY: 'secret-value' });
    const stripe = views.find((v) => v.slug === 'stripe')!;
    expect(stripe.boundKeys).toEqual(['STRIPE_SECRET_KEY']);
    expect(stripe.missingKeys).toContain('STRIPE_WEBHOOK_SECRET');
    // the array holds key NAMES, not the secret value
    expect(JSON.stringify(views)).not.toContain('secret-value');
  });
});
