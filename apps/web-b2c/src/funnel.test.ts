import { describe, it, expect } from 'vitest';
import { funnelReducer, initialFunnel, cartTotals, type FunnelState } from './funnel';
import type { PackageItem } from '@auj/core-booking';

const hotel: PackageItem = { kind: 'HOTEL', offerId: 'h1', title: 'Makkah', net: { amount: 1000, currency: 'SAR' } };
const flight: PackageItem = { kind: 'FLIGHT', offerId: 'f1', title: 'Saudia', net: { amount: 2000, currency: 'EUR' } };

describe('funnel reducer', () => {
  it('updates criteria and navigates steps', () => {
    let s = initialFunnel();
    s = funnelReducer(s, { type: 'SET_CRITERIA', criteria: { pax: 3 } });
    expect(s.criteria.pax).toBe(3);
    s = funnelReducer(s, { type: 'GO', step: 'RESULTS' });
    expect(s.step).toBe('RESULTS');
  });

  it('adds items, dedupes by offerId, and removes', () => {
    let s = initialFunnel();
    s = funnelReducer(s, { type: 'ADD_ITEM', item: hotel });
    s = funnelReducer(s, { type: 'ADD_ITEM', item: hotel }); // dedupe
    expect(s.cart).toHaveLength(1);
    s = funnelReducer(s, { type: 'ADD_ITEM', item: flight });
    s = funnelReducer(s, { type: 'REMOVE_ITEM', offerId: 'h1' });
    expect(s.cart.map((i) => i.offerId)).toEqual(['f1']);
  });

  it('SET_BOOKING moves to CONFIRMED', () => {
    const s = funnelReducer(initialFunnel(), { type: 'SET_BOOKING', bookingId: 'bk1' });
    expect(s.step).toBe('CONFIRMED');
    expect(s.bookingId).toBe('bk1');
  });

  it('cartTotals sums per currency', () => {
    const s: FunnelState = { ...initialFunnel(), cart: [hotel, flight, hotel] };
    const totals = cartTotals(s);
    expect(totals).toContainEqual({ amount: 2000, currency: 'SAR' });
    expect(totals).toContainEqual({ amount: 2000, currency: 'EUR' });
  });
});
