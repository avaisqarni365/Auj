import { z } from 'zod';
import { MoneySchema } from './money';

/** A traveller / pilgrim. Nationality + residence drive the visa route. */
export const PilgrimSchema = z.object({
  id: z.string(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  passportNumber: z.string().min(1),
  nationality: z.string().min(2).max(3), // ISO-3166 alpha-2/alpha-3
  residenceCountry: z.string().optional(),
  residencePermit: z.boolean().optional(),
  dob: z.string(), // ISO-8601 date
  gender: z.enum(['M', 'F']),
  mahramPilgrimId: z.string().optional(),
});
export type Pilgrim = z.infer<typeof PilgrimSchema>;

export const SearchCriteriaSchema = z.object({
  city: z.enum(['MAKKAH', 'MADINAH', 'JEDDAH']),
  checkIn: z.string(), // ISO-8601 date
  checkOut: z.string(),
  pax: z.number().int().positive(),
  starRating: z
    .union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)])
    .optional(),
});
export type SearchCriteria = z.infer<typeof SearchCriteriaSchema>;

export const HotelOfferSchema = z.object({
  id: z.string(),
  name: z.string(),
  city: z.string(),
  starRating: z.number().int().min(0).max(5),
  distanceToHaramM: z.number().nonnegative().optional(),
  nightlyNet: MoneySchema,
  nusukApproved: z.boolean(),
});
export type HotelOffer = z.infer<typeof HotelOfferSchema>;

export const TransportOfferSchema = z.object({
  id: z.string(),
  route: z.string(),
  vehicle: z.string(),
  net: MoneySchema,
});
export type TransportOffer = z.infer<typeof TransportOfferSchema>;

export const GroundOfferSchema = z.object({
  id: z.string(),
  name: z.string(),
  net: MoneySchema,
});
export type GroundOffer = z.infer<typeof GroundOfferSchema>;

export const FlightOfferSchema = z.object({
  id: z.string(),
  carrier: z.string(),
  depart: z.string(), // ISO-8601 datetime
  arrive: z.string(),
  net: MoneySchema,
});
export type FlightOffer = z.infer<typeof FlightOfferSchema>;

export const HoldRefSchema = z.object({
  holdId: z.string(),
  expiresAt: z.string(), // ISO-8601 datetime
});
export type HoldRef = z.infer<typeof HoldRefSchema>;

export const BookingResultSchema = z.object({
  bookingRef: z.string(),
  brns: z.array(z.string()), // Booking Reference Numbers, required for visa processing
  status: z.enum(['CONFIRMED', 'PENDING', 'FAILED']),
});
export type BookingResult = z.infer<typeof BookingResultSchema>;

export const VisaRouteSchema = z.enum(['EVISA_DIRECT', 'AGENT_CHANNEL']);
export type VisaRoute = z.infer<typeof VisaRouteSchema>;

export const VisaStatusSchema = z.enum(['DRAFT', 'SUBMITTED', 'PAID', 'ISSUED', 'REJECTED']);
export type VisaStatus = z.infer<typeof VisaStatusSchema>;

export const VisaApplicationSchema = z.object({
  visaRef: z.string(),
  route: VisaRouteSchema,
  status: VisaStatusSchema,
});
export type VisaApplication = z.infer<typeof VisaApplicationSchema>;

/** Package mode (Nusuk parity): comprehensive = visa included; visa-optional = pilgrim
 * holds their own visa; custom = build-your-own cart. */
export const PackageModeSchema = z.enum(['COMPREHENSIVE', 'VISA_OPTIONAL', 'CUSTOM']);
export type PackageMode = z.infer<typeof PackageModeSchema>;

/** A bookable Rawdah (Riyadh ul-Jannah) time slot in Madinah. */
export const RawdahSlotSchema = z.object({
  slotId: z.string(),
  startsAt: z.string(), // ISO-8601 datetime
  capacity: z.number().int().nonnegative(),
});
export type RawdahSlot = z.infer<typeof RawdahSlotSchema>;

export const RawdahStatusSchema = z.enum(['REQUESTED', 'CONFIRMED', 'REJECTED']);
export type RawdahStatus = z.infer<typeof RawdahStatusSchema>;

export const RawdahPermitSchema = z.object({
  permitRef: z.string(),
  slotId: z.string(),
  startsAt: z.string(),
  pilgrimIds: z.array(z.string()),
  status: RawdahStatusSchema,
});
export type RawdahPermit = z.infer<typeof RawdahPermitSchema>;

export const CancellationSchema = z.object({
  cancelled: z.boolean(),
  refund: MoneySchema.optional(),
});
export type Cancellation = z.infer<typeof CancellationSchema>;
