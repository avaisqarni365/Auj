import { describe, it, expect } from 'vitest';
import { createSaudiConnector, createTravelSupplier } from '@auj/connector-mock';
import { runSaudiContract, runSupplierContract } from './contract-runner';

describe('runtime contract runner (against the mock)', () => {
  it('mock SaudiConnector passes every contract check', async () => {
    const results = await runSaudiContract(createSaudiConnector());
    expect(results.length).toBeGreaterThan(0);
    expect(results.filter((r) => !r.ok)).toEqual([]);
  });

  it('mock TravelSupplier passes every contract check', async () => {
    const results = await runSupplierContract(createTravelSupplier());
    expect(results.filter((r) => !r.ok)).toEqual([]);
  });
});
