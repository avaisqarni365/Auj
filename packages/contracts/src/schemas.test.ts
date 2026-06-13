import { describe, it, expect } from 'vitest';
import {
  MoneySchema,
  PilgrimSchema,
  HotelOfferSchema,
  BookingResultSchema,
  VisaApplicationSchema,
  PackageModeSchema,
  RawdahPermitSchema,
  CONTRACTS_VERSION,
} from './index';

describe('@auj/contracts schemas', () => {
  it('exposes a semver contract version', () => {
    expect(CONTRACTS_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('Money requires integer minor units and a known currency', () => {
    expect(MoneySchema.safeParse({ amount: 1000, currency: 'EUR' }).success).toBe(true);
    expect(MoneySchema.safeParse({ amount: 10.5, currency: 'EUR' }).success).toBe(false); // no floats
    expect(MoneySchema.safeParse({ amount: 1000, currency: 'USD' }).success).toBe(false); // unknown currency
  });

  it('Pilgrim rejects missing required fields', () => {
    expect(PilgrimSchema.safeParse({ id: 'p1' }).success).toBe(false);
    expect(
      PilgrimSchema.safeParse({
        id: 'p1',
        firstName: 'Aisha',
        lastName: 'Khan',
        passportNumber: 'AB1234567',
        nationality: 'PK',
        dob: '1990-01-01',
        gender: 'F',
      }).success,
    ).toBe(true);
  });

  it('HotelOffer validates nested Money', () => {
    expect(
      HotelOfferSchema.safeParse({
        id: 'h1',
        name: 'Swissotel Makkah',
        city: 'MAKKAH',
        starRating: 5,
        nightlyNet: { amount: 50000, currency: 'SAR' },
        nusukApproved: true,
      }).success,
    ).toBe(true);
  });

  it('PackageMode + RawdahPermit validate (Nusuk parity)', () => {
    expect(PackageModeSchema.safeParse('COMPREHENSIVE').success).toBe(true);
    expect(PackageModeSchema.safeParse('FREE').success).toBe(false);
    expect(
      RawdahPermitSchema.safeParse({ permitRef: 'R1', slotId: 's1', startsAt: '2026-09-10T03:00:00Z', pilgrimIds: ['p1'], status: 'CONFIRMED' }).success,
    ).toBe(true);
  });

  it('BookingResult and VisaApplication enforce their enums', () => {
    expect(
      BookingResultSchema.safeParse({ bookingRef: 'b', brns: [], status: 'NOPE' }).success,
    ).toBe(false);
    expect(
      VisaApplicationSchema.safeParse({ visaRef: 'v', route: 'EVISA_DIRECT', status: 'ISSUED' })
        .success,
    ).toBe(true);
    expect(
      VisaApplicationSchema.safeParse({ visaRef: 'v', route: 'WALK_IN', status: 'ISSUED' }).success,
    ).toBe(false);
  });
});
