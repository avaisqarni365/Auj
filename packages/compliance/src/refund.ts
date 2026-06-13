import { REFUND_WINDOW_DAYS } from './config';

const DAY_MS = 86_400_000;

/** The PTD deadline by which an insolvency/cancellation refund must be made. */
export function refundDueBy(referenceDateIso: string): string {
  return new Date(new Date(referenceDateIso).getTime() + REFUND_WINDOW_DAYS * DAY_MS).toISOString();
}

export function isRefundOverdue(referenceDateIso: string, nowIso: string): boolean {
  return new Date(nowIso).getTime() > new Date(refundDueBy(referenceDateIso)).getTime();
}

export function daysUntilRefundDue(referenceDateIso: string, nowIso: string): number {
  return Math.ceil((new Date(refundDueBy(referenceDateIso)).getTime() - new Date(nowIso).getTime()) / DAY_MS);
}
