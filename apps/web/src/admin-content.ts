// Sample data for the Admin console UI. In production this is fed by @auj/admin
// (bookings/CRM/ledger oversight) via server actions; here it's representative data.
import type { Money } from '@auj/contracts';

export const ADMIN_KPIS: Array<{ label: string; value: string; delta: string; icon: string; iconBg: string }> = [
  { label: 'Active bookings', value: '342', delta: '+12%', icon: '🧳', iconBg: 'bg-green-100' },
  { label: 'Pilgrims in visa', value: '189', delta: '+8', icon: '🪪', iconBg: 'bg-accent-100' },
  { label: 'Revenue (MTD)', value: '€1.24M', delta: '+18%', icon: '💶', iconBg: 'bg-green-100' },
  { label: 'Departures (30d)', value: '27', delta: '6 this week', icon: '✈', iconBg: 'bg-warning-bg' },
];

export const RECENT_BOOKINGS: Array<{ brn: string; lead: string; pkg: string; nationality: string; sell: string }> = [
  { brn: 'BRN-26-VNO-00481', lead: 'Imran Ali', pkg: 'Umrah Premium', nationality: 'PK', sell: '€9,920' },
  { brn: 'BRN-26-DUB-00477', lead: 'Ayesha Khan', pkg: 'Umrah Essential', nationality: 'LT', sell: '€6,760' },
  { brn: 'BRN-26-WAW-00472', lead: 'Bilal Raza', pkg: 'Iraq Ziyarat', nationality: 'PK', sell: '€8,480' },
  { brn: 'BRN-26-VNO-00469', lead: 'Greta K.', pkg: 'Umrah Premium', nationality: 'LT', sell: '€9,920' },
  { brn: 'BRN-26-RIX-00461', lead: 'Omar F.', pkg: 'Hajj Standard', nationality: 'GB', sell: '€14,200' },
];

export const PIPELINE: Array<{ label: string; count: number; pct: string; color: string }> = [
  { label: 'Documents pending', count: 42, pct: '55%', color: 'bg-warning' },
  { label: 'e-Visa submitted', count: 88, pct: '74%', color: 'bg-success' },
  { label: 'Agent channel · review', count: 31, pct: '40%', color: 'bg-info' },
  { label: 'Issued', count: 124, pct: '90%', color: 'bg-green-800' },
];

export const DEPARTURES: Array<{ day: string; mon: string; route: string; pax: string; status: string; tone: 'success' | 'warning' }> = [
  { day: '12', mon: 'Sep', route: 'VNO → JED', pax: '4 pilgrims · Umrah', status: 'On track', tone: 'success' },
  { day: '18', mon: 'Sep', route: 'DUB → JED', pax: '2 pilgrims · Umrah', status: 'Docs due', tone: 'warning' },
  { day: '26', mon: 'Sep', route: 'WAW → NJF', pax: '6 pilgrims · Ziyarat', status: 'On track', tone: 'success' },
];

export const STAGES = ['Booked', 'Documents', 'Visa', 'Travel', 'Return'] as const;

export interface AdminPilgrim {
  id: string;
  name: string;
  pkg: string;
  brn: string;
  nationality: string;
  journey: string;
  total: Money;
  paid: Money;
  stage: number; // 0..4 index into STAGES
}

export const PILGRIMS: AdminPilgrim[] = [
  { id: 'p1', name: 'Imran Ali', pkg: 'Umrah Premium', brn: 'BRN-26-VNO-00481', nationality: 'PK', journey: '12 Sep 2026', total: { amount: 992000, currency: 'EUR' }, paid: { amount: 198400, currency: 'EUR' }, stage: 2 },
  { id: 'p2', name: 'Ayesha Khan', pkg: 'Umrah Essential', brn: 'BRN-26-DUB-00477', nationality: 'LT', journey: '18 Sep 2026', total: { amount: 676000, currency: 'EUR' }, paid: { amount: 676000, currency: 'EUR' }, stage: 3 },
  { id: 'p3', name: 'Bilal Raza', pkg: 'Iraq Ziyarat', brn: 'BRN-26-WAW-00472', nationality: 'PK', journey: '26 Sep 2026', total: { amount: 848000, currency: 'EUR' }, paid: { amount: 0, currency: 'EUR' }, stage: 1 },
  { id: 'p4', name: 'Greta Kazlauskaitė', pkg: 'Umrah Premium', brn: 'BRN-26-VNO-00469', nationality: 'LT', journey: '12 Sep 2026', total: { amount: 992000, currency: 'EUR' }, paid: { amount: 992000, currency: 'EUR' }, stage: 4 },
  { id: 'p5', name: 'Omar Farah', pkg: 'Hajj Standard', brn: 'BRN-26-RIX-00461', nationality: 'GB', journey: '02 Jun 2027', total: { amount: 1420000, currency: 'EUR' }, paid: { amount: 284000, currency: 'EUR' }, stage: 0 },
  { id: 'p6', name: 'Sana Malik', pkg: 'Umrah Essential', brn: 'BRN-26-DUB-00455', nationality: 'PK', journey: '20 Sep 2026', total: { amount: 676000, currency: 'EUR' }, paid: { amount: 338000, currency: 'EUR' }, stage: 2 },
];

export const USERS: Array<{ name: string; email: string; role: 'Admin' | 'Agent' | 'Customer'; status: 'Active' | 'Invited'; lastActive: string }> = [
  { name: 'Sara Rashid', email: 'sara@auj.travel', role: 'Admin', status: 'Active', lastActive: '2 min ago' },
  { name: 'Safar Pilgrim Travel', email: 'desk@safarpilgrim.lt', role: 'Agent', status: 'Active', lastActive: '1 h ago' },
  { name: 'Imran Ali', email: 'imran@example.com', role: 'Customer', status: 'Active', lastActive: 'Yesterday' },
  { name: 'New Ops Hire', email: 'ops2@auj.travel', role: 'Admin', status: 'Invited', lastActive: '—' },
];

// Partner / supplier API integrations behind the connector seam (see the
// partner-service-providers skill). Mirrors Nusuk's licensed-provider directory.
export type ProviderStatus = 'connected' | 'sandbox' | 'gated' | 'not-configured';
export interface ServiceProvider {
  name: string;
  kind: string;
  adapter: string;
  binding: string;
  status: ProviderStatus;
  capabilities: string[];
  lastChecked: string;
}
export const PROVIDERS: ServiceProvider[] = [
  { name: 'Nusuk Masar / Maqam GDS', kind: 'Saudi pilgrimage', adapter: 'connector-saudi', binding: 'CONNECTOR=saudi', status: 'gated', capabilities: ['Hotels (Makkah/Madinah)', 'Transport (Naqaba)', 'Ground & ziyarah', 'e-Visa', 'Rawdah permit', 'BRN'], lastChecked: '—' },
  { name: 'TBO / Hotelbeds', kind: 'General hotels (bedbank)', adapter: 'connector-travel', binding: 'SUPPLIER=live', status: 'sandbox', capabilities: ['Hotels worldwide', 'Net rates'], lastChecked: '2 h ago' },
  { name: 'Amadeus / Sabre', kind: 'Flights (GDS)', adapter: 'connector-travel', binding: 'SUPPLIER=live', status: 'sandbox', capabilities: ['Flight search', 'Ticketing'], lastChecked: '2 h ago' },
  { name: 'Stripe', kind: 'Payments · EUR', adapter: 'payments', binding: 'STRIPE_*', status: 'sandbox', capabilities: ['Card', 'SEPA', 'Refunds', 'Webhooks'], lastChecked: '1 h ago' },
  { name: 'Safepay / PayFast', kind: 'Payments · PKR', adapter: 'payments', binding: 'PKR_GATEWAY_*', status: 'sandbox', capabilities: ['Card', 'Refunds'], lastChecked: '1 h ago' },
  { name: 'S3 / MinIO', kind: 'Document store', adapter: 'core-booking · DocumentStore', binding: 'OBJECT_STORE_*', status: 'not-configured', capabilities: ['Presigned upload', 'Blob storage'], lastChecked: '—' },
  { name: 'Passport OCR', kind: 'Documents', adapter: 'core-booking · PassportOcr', binding: 'OCR_*', status: 'not-configured', capabilities: ['MRZ read'], lastChecked: '—' },
];

export const CMS_SECTIONS: Array<{ name: string; status: 'Published' | 'Draft'; edited: string }> = [
  { name: 'Hero', status: 'Published', edited: '2 days ago' },
  { name: 'Journey types', status: 'Published', edited: '1 week ago' },
  { name: 'Featured packages', status: 'Draft', edited: '3 h ago' },
  { name: 'FAQ', status: 'Published', edited: '5 days ago' },
];
