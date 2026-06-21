'use server';

import { getCurrentUser } from '../auth/session';
import { getBookingDraftStore } from '../book/booking-draft-store';
import { getObjectStore } from '../storage/document-store';
import { getDashboardStore } from './dashboard-store';
import { EMPTY_PASSPORT, type Member, type PassportFields, type PassportScan } from './dashboard-types';

const MAX_BYTES = 8 * 1024 * 1024;
const EXT: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'application/pdf': 'pdf' };

export interface DashboardData {
  members: Member[];
  passports: Record<string, PassportScan>;
  bookingStep: string | null;
}

// MRZ OCR is a provider swap (OCR_* in the registry). Until configured, fields are entered manually.
async function runOcr(_bytes: Uint8Array): Promise<Partial<PassportFields> | undefined> {
  if (!process.env.OCR_API_KEY) return undefined;
  return undefined; // a real PassportOcr.read() call would populate fields here
}

export async function getDashboardAction(): Promise<DashboardData | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const store = await getDashboardStore();
  const members = await store.listMembers(user.id);
  const passports: Record<string, PassportScan> = {};
  for (const m of members) {
    const scan = await store.getPassport(user.id, m.memberId);
    if (scan) passports[m.memberId] = scan;
  }
  const draft = await (await getBookingDraftStore()).get(user.id);
  return { members, passports, bookingStep: draft?.state.step ?? null };
}

export async function addMemberAction(name: string, relation: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  await (await getDashboardStore()).addMember(user.id, name.trim().slice(0, 60) || 'Member', relation === 'Group' ? 'Group' : 'Family');
}

export async function removeMemberAction(memberId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  await (await getDashboardStore()).removeMember(user.id, memberId);
}

export interface UploadPassportResult {
  ok: boolean;
  error?: string;
  scan?: PassportScan;
}

export async function uploadPassportAction(form: FormData): Promise<UploadPassportResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: 'Not signed in' };
  const memberId = String(form.get('memberId') || 'me').replace(/[^a-z0-9_-]/gi, '').slice(0, 24) || 'me';
  const file = form.get('file');
  if (!(file instanceof File)) return { ok: false, error: 'No file' };
  if (file.size > MAX_BYTES) return { ok: false, error: 'File too large (max 8 MB)' };
  const ct = (file.type || '').toLowerCase();
  if (!EXT[ct]) return { ok: false, error: 'Upload a passport image (PNG/JPG/WebP) or PDF' };

  const bytes = new Uint8Array(await file.arrayBuffer());
  const id = (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`).slice(0, 36);
  const key = `${user.id}/passport/${memberId}/${id}.${EXT[ct]}`;
  await (await getObjectStore()).put(key, bytes, ct);

  const ocr = await runOcr(bytes);
  const scan: PassportScan = { memberId, imageKey: key, extracted: { ...EMPTY_PASSPORT, ...(ocr ?? {}) }, status: 'uploaded' };
  await (await getDashboardStore()).savePassport(user.id, memberId, { imageKey: scan.imageKey, extracted: scan.extracted, status: scan.status });
  return { ok: true, scan };
}

export async function savePassportFieldsAction(memberId: string, fields: PassportFields): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  const store = await getDashboardStore();
  const existing = await store.getPassport(user.id, memberId);
  const clean: PassportFields = {
    passportNumber: fields.passportNumber.trim().slice(0, 20),
    surname: fields.surname.trim().slice(0, 60),
    givenNames: fields.givenNames.trim().slice(0, 60),
    nationality: fields.nationality.trim().slice(0, 40),
    dob: fields.dob.trim().slice(0, 20),
    expiry: fields.expiry.trim().slice(0, 20),
    sex: fields.sex.trim().slice(0, 4),
  };
  await store.savePassport(user.id, memberId, { imageKey: existing?.imageKey ?? null, extracted: clean, status: 'confirmed' });
}
