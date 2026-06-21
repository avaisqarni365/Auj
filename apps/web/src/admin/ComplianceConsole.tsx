'use client';

import { useState, useTransition } from 'react';
import type { GuaranteeTier } from '@auj/compliance';
import { formatMoney } from '../currency';
import { ScreenFrame } from '../components/ScreenFrame';
import {
  completeGdprAction,
  listComplianceAction,
  requestGdprAction,
  simulateBookingAction,
  type ComplianceSnapshot,
} from './compliance-actions';
import type { CertificateRecord, GdprKind } from './compliance-store';

// Client-safe mirror of @auj/compliance GUARANTEE_TIERS (the package barrel pulls node:crypto via
// uuidv7, so the client must not import it at runtime).
const TIERS: Array<{ tier: GuaranteeTier; coverage: { amount: number; currency: 'EUR' }; label: string }> = [
  { tier: 'T20K', coverage: { amount: 2_000_000, currency: 'EUR' }, label: 'EUR 20,000 insolvency guarantee' },
  { tier: 'T50K', coverage: { amount: 5_000_000, currency: 'EUR' }, label: 'EUR 50,000 insolvency guarantee' },
  { tier: 'T200K', coverage: { amount: 20_000_000, currency: 'EUR' }, label: 'EUR 200,000 insolvency guarantee' },
];

function daysLeft(dueIso: string): number {
  return Math.ceil((new Date(dueIso).getTime() - Date.now()) / 86_400_000);
}

function download(name: string, content: string, type = 'text/plain'): void {
  const blob = new Blob([content], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function Card({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-sand-200 bg-white p-5 shadow-sm">
      <h2 className="font-serif text-lg font-semibold text-sand-800">{title}</h2>
      {sub ? <p className="mt-0.5 text-[12.5px] text-sand-500">{sub}</p> : null}
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function ComplianceConsole({ initial }: { initial: ComplianceSnapshot }) {
  const [snap, setSnap] = useState<ComplianceSnapshot>(initial);
  const [name, setName] = useState('');
  const [tier, setTier] = useState<GuaranteeTier>('T50K');
  const [gdprId, setGdprId] = useState('');
  const [gdprKind, setGdprKind] = useState<GdprKind>('export');
  const [pending, start] = useTransition();

  const refresh = (): void => void listComplianceAction().then(setSnap);

  const simulate = (): void => start(async () => {
    await simulateBookingAction({ customerName: name, tier });
    setName('');
    refresh();
  });
  const newGdpr = (): void => start(async () => {
    if (!gdprId.trim()) return;
    await requestGdprAction(gdprId, gdprKind);
    setGdprId('');
    refresh();
  });
  const complete = (id: string, kind: GdprKind): void => start(async () => {
    const r = await completeGdprAction(id);
    if (kind === 'export' && r.export) download(`gdpr-export-${id}.json`, JSON.stringify(r.export, null, 2), 'application/json');
    refresh();
  });
  const downloadCert = (c: CertificateRecord): void => {
    if (c.pdfKey) {
      window.open(`/api/doc/${c.pdfKey}`, '_blank', 'noopener');
      return;
    }
    download(`${c.id}.txt`, c.content); // fallback if the PDF wasn't stored
  };

  return (
    <ScreenFrame label="🛡️ EU compliance">
      <p className="max-w-[60ch] text-sand-500">
        Lithuanian operator duties under the EU Package Travel Directive + GDPR: insolvency-protection
        certificates, pre-contract consent before charge, the 6-month refund window, and data rights.
      </p>

      <div className="mt-6 grid gap-4">
        {/* Tiers + simulate */}
        <Card title="Guarantee tier" sub="Config — drives the certificate cover text.">
          <div className="grid gap-2.5 sm:grid-cols-3">
            {TIERS.map((t) => (
              <button
                key={t.tier}
                type="button"
                onClick={() => setTier(t.tier)}
                aria-pressed={tier === t.tier}
                className={`rounded-xl border p-3.5 text-left transition-[border-color,background-color] duration-fast ${
                  tier === t.tier ? 'border-green-700 bg-green-50' : 'border-sand-200 bg-white hover:border-green-700/40'
                }`}
              >
                <div className="font-mono text-[15px] font-semibold text-green-800">{formatMoney(t.coverage)}</div>
                <div className="mt-0.5 text-[12px] text-sand-500">{t.label}</div>
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Customer name"
              className="min-w-0 flex-1 rounded-lg border border-sand-200 bg-sand-50 px-3 py-2 text-[13.5px] outline-none focus:border-accent-600 focus:shadow-focus"
            />
            <button
              type="button"
              onClick={simulate}
              disabled={pending}
              className="rounded-lg bg-green-700 px-4 py-2 text-[13.5px] font-semibold text-white transition-transform duration-fast active:scale-[0.98] disabled:opacity-40"
            >
              Simulate package booking
            </button>
          </div>
          <p className="mt-2 text-[12px] text-sand-500">Records consent → issues + delivers the certificate → opens the refund window, all in one step.</p>
        </Card>

        {/* Certificates */}
        <Card title={`Security certificates · ${snap.certificates.length}`} sub="Issued + delivered on every package booking; PDF→DocumentStore deferred (text artifact stored).">
          {snap.certificates.length ? (
            <ul className="grid gap-2">
              {snap.certificates.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-sand-200 bg-white p-3 text-[13px]">
                  <div>
                    <span className="font-mono font-semibold text-sand-800">{c.id}</span>
                    <span className="text-sand-500"> · {c.bookingRef} · {c.customerName}</span>
                    <div className="text-[12px] text-sand-500">{formatMoney({ amount: c.coverageMinor, currency: 'EUR' })} · {c.deliveredAt ? '✓ delivered' : 'pending'}</div>
                  </div>
                  <button type="button" onClick={() => downloadCert(c)} className="rounded-lg border border-sand-300 bg-white px-3 py-1.5 text-[12px] font-semibold text-green-800 active:scale-[0.98]">
                    Download
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-sand-500">No certificates yet — simulate a booking above.</p>
          )}
        </Card>

        {/* Refund windows */}
        <Card title={`Refund windows · ${snap.refunds.length}`} sub="EU PTD insolvency refund window = opened + ~6 months.">
          {snap.refunds.length ? (
            <ul className="grid gap-2">
              {snap.refunds.map((r) => {
                const d = daysLeft(r.dueAt);
                return (
                  <li key={r.bookingRef} className="flex items-center justify-between rounded-xl border border-sand-200 bg-white p-3 text-[13px]">
                    <span className="font-mono text-sand-700">{r.bookingRef}</span>
                    <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${d < 0 ? 'bg-danger-bg text-danger-fg' : 'bg-green-50 text-green-800'}`}>
                      {d < 0 ? 'overdue' : `${d} days left`} · due {r.dueAt.slice(0, 10)}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-[13px] text-sand-500">No open refund windows.</p>
          )}
        </Card>

        {/* Consents */}
        <Card title={`Pre-contract consents · ${snap.consents.length}`} sub="Recorded before any charge.">
          {snap.consents.length ? (
            <ul className="grid gap-1.5 text-[13px]">
              {snap.consents.map((c) => (
                <li key={c.id} className="flex items-center justify-between rounded-lg border border-sand-200 bg-white px-3 py-2">
                  <span className="font-mono text-sand-700">{c.bookingRef}</span>
                  <span className="text-sand-500">v{c.infoVersion} · {c.shown.length} items · {c.consentedAt.slice(0, 10)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-sand-500">No consents recorded.</p>
          )}
        </Card>

        {/* GDPR */}
        <Card title={`GDPR requests · ${snap.gdpr.length}`} sub="Right of access (export) and erasure (delete).">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <input
              value={gdprId}
              onChange={(e) => setGdprId(e.target.value)}
              placeholder="Customer id"
              className="min-w-0 flex-1 rounded-lg border border-sand-200 bg-sand-50 px-3 py-2 text-[13.5px] outline-none focus:border-accent-600 focus:shadow-focus"
            />
            <select value={gdprKind} onChange={(e) => setGdprKind(e.target.value as GdprKind)} className="rounded-lg border border-sand-200 bg-white px-3 py-2 text-[13.5px]">
              <option value="export">Export</option>
              <option value="delete">Delete</option>
            </select>
            <button type="button" onClick={newGdpr} disabled={pending} className="rounded-lg bg-green-700 px-4 py-2 text-[13.5px] font-semibold text-white active:scale-[0.98] disabled:opacity-40">
              Raise request
            </button>
          </div>
          {snap.gdpr.length ? (
            <ul className="grid gap-1.5 text-[13px]">
              {snap.gdpr.map((r) => (
                <li key={r.id} className="flex items-center justify-between rounded-lg border border-sand-200 bg-white px-3 py-2">
                  <span className="text-sand-700">
                    <span className="font-mono">{r.customerId}</span> · {r.kind}
                  </span>
                  {r.status === 'completed' ? (
                    <span className="rounded-md bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-800">completed</span>
                  ) : (
                    <button type="button" onClick={() => complete(r.id, r.kind)} disabled={pending} className="rounded-lg border border-sand-300 bg-white px-3 py-1 text-[12px] font-semibold text-green-800 active:scale-[0.98]">
                      {r.kind === 'export' ? 'Export & complete' : 'Erase & complete'}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-sand-500">No GDPR requests.</p>
          )}
        </Card>
      </div>
    </ScreenFrame>
  );
}
