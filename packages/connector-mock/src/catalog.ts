import type { HotelOffer, TransportOffer, GroundOffer, FlightOffer } from '@auj/contracts';

// Deterministic, in-memory seed data. Net prices in SAR for Saudi supply,
// EUR for general-travel supply. Some hotels are nusukApproved, some not
// (visa flows require a Nusuk-approved hotel — exercised by downstream modules).

export const HOTELS: HotelOffer[] = [
  { id: 'htl_mak_1', name: 'Swissotel Al Maqam Makkah', city: 'MAKKAH', starRating: 5, distanceToHaramM: 100, nightlyNet: { amount: 95000, currency: 'SAR' }, nusukApproved: true },
  { id: 'htl_mak_2', name: 'Makkah Towers', city: 'MAKKAH', starRating: 4, distanceToHaramM: 350, nightlyNet: { amount: 52000, currency: 'SAR' }, nusukApproved: true },
  { id: 'htl_mak_3', name: 'Ajyad Crystal', city: 'MAKKAH', starRating: 3, distanceToHaramM: 800, nightlyNet: { amount: 28000, currency: 'SAR' }, nusukApproved: false },
  { id: 'htl_mad_1', name: 'Anwar Al Madinah Movenpick', city: 'MADINAH', starRating: 5, distanceToHaramM: 150, nightlyNet: { amount: 70000, currency: 'SAR' }, nusukApproved: true },
  { id: 'htl_mad_2', name: 'Al Eiman Taibah', city: 'MADINAH', starRating: 4, distanceToHaramM: 400, nightlyNet: { amount: 40000, currency: 'SAR' }, nusukApproved: false },
];

export const TRANSPORT: TransportOffer[] = [
  { id: 'trn_jed_mak', route: 'JED -> MAKKAH', vehicle: 'GMC Suburban (up to 7)', net: { amount: 45000, currency: 'SAR' } },
  { id: 'trn_mak_mad', route: 'MAKKAH -> MADINAH', vehicle: 'Coach (49 seats)', net: { amount: 18000, currency: 'SAR' } },
  { id: 'trn_mad_jed', route: 'MADINAH -> JED', vehicle: 'Coach (49 seats)', net: { amount: 22000, currency: 'SAR' } },
];

export const GROUND: GroundOffer[] = [
  { id: 'grd_ziyarah_mak', name: 'Makkah ziyarah (guided)', net: { amount: 12000, currency: 'SAR' } },
  { id: 'grd_ziyarah_mad', name: 'Madinah ziyarah (guided)', net: { amount: 10000, currency: 'SAR' } },
];

export const FLIGHTS: FlightOffer[] = [
  { id: 'flt_vno_jed', carrier: 'Saudia', depart: '2026-09-01T09:00:00Z', arrive: '2026-09-01T16:30:00Z', net: { amount: 38000, currency: 'EUR' } },
  { id: 'flt_jed_vno', carrier: 'Saudia', depart: '2026-09-12T18:00:00Z', arrive: '2026-09-13T01:00:00Z', net: { amount: 39000, currency: 'EUR' } },
];

// General-travel (non-pilgrimage) hotels for the TravelSupplier mock.
export const TRAVEL_HOTELS: HotelOffer[] = [
  { id: 'htl_dxb_1', name: 'Address Downtown Dubai', city: 'DUBAI', starRating: 5, nightlyNet: { amount: 60000, currency: 'EUR' }, nusukApproved: false },
  { id: 'htl_ist_1', name: 'Pera Palace Istanbul', city: 'ISTANBUL', starRating: 5, nightlyNet: { amount: 32000, currency: 'EUR' }, nusukApproved: false },
];
