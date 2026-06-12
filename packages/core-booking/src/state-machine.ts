import type { BookingStatus } from './domain';

/** Allowed booking transitions. DRAFT -> CONFIRMED exists for one-step travel bookings. */
export const TRANSITIONS: Record<BookingStatus, readonly BookingStatus[]> = {
  DRAFT: ['HELD', 'CONFIRMED', 'CANCELLED'],
  HELD: ['CONFIRMED', 'DRAFT', 'CANCELLED'],
  CONFIRMED: ['VISA_IN_PROGRESS', 'TICKETED', 'CANCELLED'],
  VISA_IN_PROGRESS: ['TICKETED', 'COMPLETED', 'CANCELLED'],
  TICKETED: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: ['REFUNDED'],
  REFUNDED: [],
};

export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export class InvalidTransitionError extends Error {
  constructor(
    readonly from: BookingStatus,
    readonly to: BookingStatus,
  ) {
    super(`Invalid booking transition: ${from} -> ${to}`);
    this.name = 'InvalidTransitionError';
  }
}

export function assertTransition(from: BookingStatus, to: BookingStatus): void {
  if (!canTransition(from, to)) throw new InvalidTransitionError(from, to);
}
