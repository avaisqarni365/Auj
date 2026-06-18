'use server';

import { requireRole } from '../auth/session';
import { getNotifier } from '../notifications/notifier';
import type { Inquiry, InquiryInput, InquiryStatus } from './inquiry';
import { getLeads } from './store';

/** Public — anyone can submit a Smart Visit inquiry (lead). No login required. */
export async function submitInquiryAction(input: InquiryInput): Promise<{ ref: string }> {
  const inquiry = await (await getLeads()).create(input);
  // Best-effort: notify the AUJ team so they can follow up with a package (never fail the submit).
  try {
    await getNotifier().send({
      to: process.env.LEADS_INBOX ?? process.env.EMAIL_FROM ?? 'team@auj.example',
      subject: `New Smart Visit inquiry ${inquiry.ref} — ${inquiry.name}`,
      text: [
        `Ref: ${inquiry.ref}`,
        `Name: ${inquiry.name} · ${inquiry.email}${inquiry.phone ? ` · ${inquiry.phone}` : ''} (prefers ${inquiry.channel})`,
        `From: ${inquiry.country}${inquiry.city ? `, ${inquiry.city}` : ''} · airport ${inquiry.departureAirport ?? '—'}`,
        `Party: ${inquiry.adults} adults, ${inquiry.children} children, ${inquiry.infants} infants (${inquiry.partyKind})`,
        `Makkah: ${inquiry.makkahNights} nts, hotel ${inquiry.makkahHotelBand}`,
        `Transfer: ${inquiry.transferMode}${inquiry.transferPrivate ? ' (private)' : ''} · ${inquiry.transferDate || 'date TBD'} ${inquiry.transferTime}`,
        `Madinah: ${inquiry.madinahNights} nts, hotel ${inquiry.madinahHotelBand}, Rawdah: ${inquiry.rawdah ? `yes${inquiry.rawdahDay ? ` (${inquiry.rawdahDay})` : ''}` : 'no'}, dining ${inquiry.dining}`,
        `Return: from ${inquiry.returnFrom} via ${inquiry.returnMode}${inquiry.jeddahStopover ? ' (+Jeddah stop)' : ''}`,
        `Window: ${inquiry.windowFrom ?? '—'} → ${inquiry.windowTo ?? '—'}`,
      ].join('\n'),
    });
  } catch {
    /* notifications are non-critical */
  }
  return { ref: inquiry.ref };
}

/** Admin — list every inquiry. */
export async function listInquiriesAction(): Promise<Inquiry[]> {
  await requireRole(['ADMIN'], '/admin');
  return (await getLeads()).list();
}

/** Admin — move a lead through the pipeline. */
export async function setInquiryStatusAction(id: string, status: InquiryStatus): Promise<Inquiry[]> {
  await requireRole(['ADMIN'], '/admin');
  const leads = await getLeads();
  await leads.setStatus(id, status);
  return leads.list();
}
