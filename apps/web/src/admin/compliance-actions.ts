'use server';

import type { GuaranteeTier } from '@auj/compliance';
import { requireRole } from '../auth/session';
import {
  getComplianceStore,
  type CertificateRecord,
  type ConsentRecord,
  type GdprKind,
  type GdprRequest,
  type RefundWindow,
} from './compliance-store';

// Mandated pre-contractual information shown (and consented to) before any charge.
export const PRECONTRACT_INFO = [
  'Total price incl. taxes & fees',
  'Insolvency protection & guarantor',
  'Main characteristics of the travel services',
  '6-month PTD insolvency refund window',
  'Right of withdrawal & cancellation terms',
  'Data processing (GDPR) notice',
];

export interface ComplianceSnapshot {
  certificates: CertificateRecord[];
  consents: ConsentRecord[];
  refunds: RefundWindow[];
  gdpr: GdprRequest[];
}

export async function listComplianceAction(): Promise<ComplianceSnapshot> {
  await requireRole(['ADMIN'], '/admin/compliance');
  const s = await getComplianceStore();
  const [certificates, consents, refunds, gdpr] = await Promise.all([s.listCertificates(), s.listConsents(), s.listRefundWindows(), s.listGdpr()]);
  return { certificates, consents, refunds, gdpr };
}

/** Demonstrate the on-booking flow: consent (before charge) → issue + deliver certificate → open refund window. */
export async function simulateBookingAction(input: { customerName: string; tier: GuaranteeTier }): Promise<void> {
  await requireRole(['ADMIN'], '/admin/compliance');
  const ref = `BK-${Math.abs(hash(input.customerName + input.tier)).toString(36).slice(0, 6).toUpperCase()}`;
  await (await getComplianceStore()).onPackageBooking({
    bookingRef: ref,
    customerId: `cust-${ref}`,
    customerName: input.customerName.trim() || 'Demo Pilgrim',
    tier: input.tier,
    shown: PRECONTRACT_INFO,
    ip: '0.0.0.0',
  });
}

export async function requestGdprAction(customerId: string, kind: GdprKind): Promise<void> {
  await requireRole(['ADMIN'], '/admin/compliance');
  await (await getComplianceStore()).requestGdpr(customerId.trim(), kind);
}

export async function completeGdprAction(id: string): Promise<{ export?: unknown }> {
  await requireRole(['ADMIN'], '/admin/compliance');
  return (await getComplianceStore()).completeGdpr(id);
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}
