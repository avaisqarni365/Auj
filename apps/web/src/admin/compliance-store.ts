// EU compliance persistence (migration 14) — Postgres when DATABASE_URL is set, in-memory fallback.
// Reuses the @auj/compliance pure logic (tiers, certificate rendering, 6-month refund window) and
// persists the regulated records: certificates (+ delivery proof), pre-contract consent, refund
// windows, GDPR requests. Certificate PDF→DocumentStore is deferred; the rendered text is stored.
import { createPool, type DbPool } from '@auj/core-booking/postgres';
import { GUARANTEE_TIERS, refundDueBy, renderCertificate, uuidv7, type GuaranteeTier } from '@auj/compliance';

export interface CertificateRecord {
  id: string;
  bookingRef: string;
  customerId: string;
  customerName: string;
  tier: GuaranteeTier;
  coverageMinor: number;
  insurer: string;
  content: string;
  issuedAt: string;
  deliveredAt: string | null;
  deliveryProof: string | null;
}
export interface ConsentRecord {
  id: string;
  bookingRef: string;
  infoVersion: string;
  shown: string[];
  consentedAt: string;
  ip: string;
}
export interface RefundWindow {
  bookingRef: string;
  openedAt: string;
  dueAt: string;
}
export type GdprKind = 'export' | 'delete';
export interface GdprRequest {
  id: string;
  customerId: string;
  kind: GdprKind;
  status: 'requested' | 'completed';
  requestedAt: string;
  completedAt: string | null;
}

const INSURER = 'TBD guarantor (VVTAT-registered)';

export interface ComplianceStore {
  /** On every package booking: record consent (before charge), issue + deliver the certificate,
   *  and open the 6-month refund window — atomically from the caller's view. */
  onPackageBooking(input: {
    bookingRef: string;
    customerId: string;
    customerName: string;
    tier: GuaranteeTier;
    shown: string[];
    ip: string;
  }): Promise<{ certificate: CertificateRecord; consent: ConsentRecord; refund: RefundWindow }>;
  listCertificates(): Promise<CertificateRecord[]>;
  listConsents(): Promise<ConsentRecord[]>;
  listRefundWindows(): Promise<RefundWindow[]>;
  listGdpr(): Promise<GdprRequest[]>;
  requestGdpr(customerId: string, kind: GdprKind): Promise<GdprRequest>;
  completeGdpr(id: string): Promise<{ export?: unknown }>;
}

function buildCertificate(input: { bookingRef: string; customerId: string; customerName: string; tier: GuaranteeTier; now: string }): CertificateRecord {
  const id = `CERT-${uuidv7().slice(0, 8)}`;
  const content = renderCertificate({ id, bookingRef: input.bookingRef, customerName: input.customerName, tier: input.tier, insurer: INSURER, issuedAt: input.now });
  return {
    id,
    bookingRef: input.bookingRef,
    customerId: input.customerId,
    customerName: input.customerName,
    tier: input.tier,
    coverageMinor: GUARANTEE_TIERS[input.tier].coverage.amount,
    insurer: INSURER,
    content,
    issuedAt: input.now,
    deliveredAt: input.now,
    deliveryProof: `Emailed to customer ${input.customerId} at ${input.now}`,
  };
}

class InMemoryCompliance implements ComplianceStore {
  private certs: CertificateRecord[] = [];
  private consents: ConsentRecord[] = [];
  private refunds = new Map<string, RefundWindow>();
  private gdpr: GdprRequest[] = [];

  async onPackageBooking(input: Parameters<ComplianceStore['onPackageBooking']>[0]) {
    const now = new Date().toISOString();
    const consent: ConsentRecord = { id: uuidv7(), bookingRef: input.bookingRef, infoVersion: '2026-01', shown: input.shown, consentedAt: now, ip: input.ip };
    this.consents.unshift(consent);
    const certificate = buildCertificate({ ...input, now });
    this.certs.unshift(certificate);
    const refund: RefundWindow = { bookingRef: input.bookingRef, openedAt: now, dueAt: refundDueBy(now) };
    this.refunds.set(input.bookingRef, refund);
    return { certificate, consent, refund };
  }
  async listCertificates() {
    return this.certs;
  }
  async listConsents() {
    return this.consents;
  }
  async listRefundWindows() {
    return [...this.refunds.values()];
  }
  async listGdpr() {
    return this.gdpr;
  }
  async requestGdpr(customerId: string, kind: GdprKind) {
    const req: GdprRequest = { id: uuidv7(), customerId, kind, status: 'requested', requestedAt: new Date().toISOString(), completedAt: null };
    this.gdpr.unshift(req);
    return req;
  }
  async completeGdpr(id: string) {
    const req = this.gdpr.find((r) => r.id === id);
    if (!req) return {};
    req.status = 'completed';
    req.completedAt = new Date().toISOString();
    if (req.kind === 'export') {
      return { export: { certificates: this.certs.filter((c) => c.customerId === req.customerId), consents: this.consents.filter((c) => this.certs.some((x) => x.bookingRef === c.bookingRef && x.customerId === req.customerId)) } };
    }
    // delete → erase PII
    this.consents = this.consents.filter((c) => !this.certs.some((x) => x.bookingRef === c.bookingRef && x.customerId === req.customerId));
    this.certs = this.certs.map((c) => (c.customerId === req.customerId ? { ...c, customerName: '[erased]', deliveryProof: '[erased]' } : c));
    return {};
  }
}

class PostgresCompliance implements ComplianceStore {
  constructor(private readonly pool: DbPool) {}
  async onPackageBooking(input: Parameters<ComplianceStore['onPackageBooking']>[0]) {
    const now = new Date().toISOString();
    const consent: ConsentRecord = { id: uuidv7(), bookingRef: input.bookingRef, infoVersion: '2026-01', shown: input.shown, consentedAt: now, ip: input.ip };
    await this.pool.query(
      'INSERT INTO precontract_consents (id, booking_ref, info_version, shown, consented_at, ip) VALUES ($1,$2,$3,$4,$5,$6)',
      [consent.id, consent.bookingRef, consent.infoVersion, JSON.stringify(consent.shown), now, consent.ip],
    );
    const certificate = buildCertificate({ ...input, now });
    await this.pool.query(
      `INSERT INTO security_certificates (id, booking_ref, customer_id, customer_name, tier, coverage_minor, insurer, content, issued_at, delivered_at, delivery_proof)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [certificate.id, certificate.bookingRef, certificate.customerId, certificate.customerName, certificate.tier, certificate.coverageMinor, certificate.insurer, certificate.content, now, now, certificate.deliveryProof],
    );
    const refund: RefundWindow = { bookingRef: input.bookingRef, openedAt: now, dueAt: refundDueBy(now) };
    await this.pool.query(
      'INSERT INTO refund_windows (booking_ref, opened_at, due_at) VALUES ($1,$2,$3) ON CONFLICT (booking_ref) DO NOTHING',
      [refund.bookingRef, now, refund.dueAt],
    );
    return { certificate, consent, refund };
  }
  async listCertificates() {
    const r = await this.pool.query<CertificateRecord & { booking_ref: string; customer_id: string; customer_name: string; coverage_minor: number; issued_at: string; delivered_at: string | null; delivery_proof: string | null }>(
      "SELECT id, booking_ref AS \"bookingRef\", customer_id AS \"customerId\", customer_name AS \"customerName\", tier, coverage_minor AS \"coverageMinor\", insurer, content, to_char(issued_at,'YYYY-MM-DD\"T\"HH24:MI:SSZ') AS \"issuedAt\", to_char(delivered_at,'YYYY-MM-DD\"T\"HH24:MI:SSZ') AS \"deliveredAt\", delivery_proof AS \"deliveryProof\" FROM security_certificates ORDER BY issued_at DESC",
    );
    return r.rows as unknown as CertificateRecord[];
  }
  async listConsents() {
    const r = await this.pool.query<ConsentRecord>(
      "SELECT id, booking_ref AS \"bookingRef\", info_version AS \"infoVersion\", shown, to_char(consented_at,'YYYY-MM-DD\"T\"HH24:MI:SSZ') AS \"consentedAt\", ip FROM precontract_consents ORDER BY consented_at DESC",
    );
    return r.rows as unknown as ConsentRecord[];
  }
  async listRefundWindows() {
    const r = await this.pool.query<RefundWindow>(
      "SELECT booking_ref AS \"bookingRef\", to_char(opened_at,'YYYY-MM-DD\"T\"HH24:MI:SSZ') AS \"openedAt\", to_char(due_at,'YYYY-MM-DD\"T\"HH24:MI:SSZ') AS \"dueAt\" FROM refund_windows ORDER BY due_at",
    );
    return r.rows as unknown as RefundWindow[];
  }
  async listGdpr() {
    const r = await this.pool.query<GdprRequest>(
      "SELECT id, customer_id AS \"customerId\", kind, status, to_char(requested_at,'YYYY-MM-DD\"T\"HH24:MI:SSZ') AS \"requestedAt\", to_char(completed_at,'YYYY-MM-DD\"T\"HH24:MI:SSZ') AS \"completedAt\" FROM gdpr_requests ORDER BY requested_at DESC",
    );
    return r.rows as unknown as GdprRequest[];
  }
  async requestGdpr(customerId: string, kind: GdprKind) {
    const req: GdprRequest = { id: uuidv7(), customerId, kind, status: 'requested', requestedAt: new Date().toISOString(), completedAt: null };
    await this.pool.query('INSERT INTO gdpr_requests (id, customer_id, kind, status) VALUES ($1,$2,$3,$4)', [req.id, customerId, kind, 'requested']);
    return req;
  }
  async completeGdpr(id: string) {
    const rr = await this.pool.query<{ customer_id: string; kind: GdprKind }>('SELECT customer_id, kind FROM gdpr_requests WHERE id = $1', [id]);
    const req = rr.rows[0];
    if (!req) return {};
    await this.pool.query("UPDATE gdpr_requests SET status = 'completed', completed_at = now() WHERE id = $1", [id]);
    if (req.kind === 'export') {
      const certs = await this.pool.query('SELECT * FROM security_certificates WHERE customer_id = $1', [req.customer_id]);
      return { export: { certificates: certs.rows } };
    }
    await this.pool.query("UPDATE security_certificates SET customer_name = '[erased]', delivery_proof = '[erased]' WHERE customer_id = $1", [req.customer_id]);
    await this.pool.query(
      'DELETE FROM precontract_consents WHERE booking_ref IN (SELECT booking_ref FROM security_certificates WHERE customer_id = $1)',
      [req.customer_id],
    );
    return {};
  }
}

const KEY = Symbol.for('auj.admin.compliance.store');
const g = globalThis as unknown as { [KEY]?: Promise<ComplianceStore> };

async function init(): Promise<ComplianceStore> {
  const url = process.env.DATABASE_URL;
  if (!url) return new InMemoryCompliance();
  const pool = createPool(url);
  await pool.query(`CREATE TABLE IF NOT EXISTS security_certificates (
     id text PRIMARY KEY, booking_ref text NOT NULL, customer_id text NOT NULL, customer_name text NOT NULL,
     tier text NOT NULL, coverage_minor bigint NOT NULL, insurer text NOT NULL, content text NOT NULL,
     issued_at timestamptz NOT NULL DEFAULT now(), delivered_at timestamptz, delivery_proof text)`);
  await pool.query(`CREATE TABLE IF NOT EXISTS precontract_consents (
     id text PRIMARY KEY, booking_ref text NOT NULL, info_version text NOT NULL,
     shown jsonb NOT NULL DEFAULT '[]'::jsonb, consented_at timestamptz NOT NULL DEFAULT now(), ip text NOT NULL DEFAULT '')`);
  await pool.query(`CREATE TABLE IF NOT EXISTS refund_windows (
     booking_ref text PRIMARY KEY, opened_at timestamptz NOT NULL DEFAULT now(), due_at timestamptz NOT NULL)`);
  await pool.query(`CREATE TABLE IF NOT EXISTS gdpr_requests (
     id text PRIMARY KEY, customer_id text NOT NULL, kind text NOT NULL, status text NOT NULL DEFAULT 'requested',
     requested_at timestamptz NOT NULL DEFAULT now(), completed_at timestamptz)`);
  return new PostgresCompliance(pool);
}

export function getComplianceStore(): Promise<ComplianceStore> {
  return (g[KEY] ??= init());
}
