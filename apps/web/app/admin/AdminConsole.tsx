'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Logo, StatusPill, type PillTone } from '@auj/ui';
import { routeFor } from '@auj/visa-router';
import type { PublicUser } from '@auj/auth';
import type { Ticket, TicketStatus } from '@auj/support';
import type { SpecialRequestCategory, SpecialRequestStatus } from '@auj/core-booking';
import { formatMoney } from '../../src/currency';
import { approveAgentAction, listAgentsAction } from '../../src/auth/admin-actions';
import { listAllTicketsAction, setTicketStatusAction, staffReplyAction } from '../../src/support/admin-actions';
import { listDocumentsAction, listSpecialRequestsAction, setRequestStatusAction, verifyDocumentAction, type DocRow, type RequestGroup } from '../../src/book/admin-actions';
import { listInquiriesAction, setInquiryStatusAction } from '../../src/leads/actions';
import { INQUIRY_STATUSES, type Inquiry, type InquiryStatus } from '../../src/leads/inquiry';
import {
  ADMIN_KPIS,
  CMS_SECTIONS,
  DEPARTURES,
  PILGRIMS,
  PIPELINE,
  PROVIDERS,
  RECENT_BOOKINGS,
  STAGES,
  USERS,
  type AdminPilgrim,
  type ProviderStatus,
} from '../../src/admin-content';

type View = 'overview' | 'leads' | 'pilgrims' | 'providers' | 'requests' | 'documents' | 'content' | 'users' | 'support';

const NAV: Array<{ key: View; icon: string; badge?: string }> = [
  { key: 'overview', icon: '▦' },
  { key: 'leads', icon: '📨' },
  { key: 'pilgrims', icon: '👥', badge: '1.3k' },
  { key: 'providers', icon: '🔌' },
  { key: 'requests', icon: '🧩' },
  { key: 'documents', icon: '📄' },
  { key: 'support', icon: '🎧' },
  { key: 'content', icon: '📝' },
  { key: 'users', icon: '🛡' },
];

const MORE: Array<{ key: 'payments' | 'reports' | 'settings'; icon: string }> = [
  { key: 'payments', icon: '💶' },
  { key: 'reports', icon: '📊' },
  { key: 'settings', icon: '⚙' },
];

export function AdminConsole() {
  const t = useTranslations('admin');
  const [view, setView] = useState<View>('overview');
  const [selected, setSelected] = useState<AdminPilgrim | null>(null);

  const go = (v: View): void => {
    setSelected(null);
    setView(v);
  };

  return (
    <div className="flex min-h-screen bg-sand-50 text-sand-ink">
      {/* sidebar */}
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col bg-green-950 text-green-100 md:flex">
        <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-5">
          <Logo size={38} />
          <div>
            <div className="font-serif text-lg font-semibold leading-none tracking-[0.05em] text-white">AUJ</div>
            <div className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-green-100/60">{t('brandSub')}</div>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          <div className="px-3 pb-1.5 pt-2 text-[10.5px] uppercase tracking-wider text-green-100/50">{t('groupOperate')}</div>
          {NAV.map((n) => {
            const on = n.key === view;
            return (
              <button
                key={n.key}
                type="button"
                onClick={() => go(n.key)}
                className={`flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-sm ${on ? 'bg-white font-semibold text-green-900' : 'font-medium text-green-100/90 hover:bg-white/5'}`}
              >
                <span className="w-5 text-center">{n.icon}</span>
                <span className="flex-1">{t(`nav.${n.key}`)}</span>
                {n.badge ? <span className="rounded-full bg-white/15 px-2 py-0.5 font-mono text-[11px] font-semibold">{n.badge}</span> : null}
              </button>
            );
          })}
          <div className="px-3 pb-1.5 pt-4 text-[10.5px] uppercase tracking-wider text-green-100/50">{t('groupMore')}</div>
          {MORE.map((m) => (
            <div key={m.key} className="rounded-[10px] px-3 py-2.5 text-sm font-medium text-green-100/60">{m.icon} {t(`more.${m.key}`)}</div>
          ))}
        </nav>
        <div className="border-t border-white/10 p-3.5">
          <div className="flex items-center gap-2.5 rounded-xl bg-white/5 px-3 py-2.5">
            <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-gold text-[13px] font-bold text-green-950">SR</span>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-white">Sara Rashid</div>
              <div className="text-[11px] text-green-100/60">{t('userRole')}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* main */}
      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center gap-3.5 border-b border-sand-200 bg-sand-50/90 px-[clamp(16px,3vw,36px)] py-3.5 backdrop-blur">
          <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-[10px] border-[1.5px] border-sand-200 bg-white px-3.5 py-2.5">
            <span className="text-sand-500">🔍</span>
            <span className="truncate text-sm text-sand-500">{t('search')}</span>
            <span className="ms-auto rounded border border-sand-200 px-1.5 font-mono text-[11px] text-sand-300">⌘K</span>
          </div>
          <span className="hidden whitespace-nowrap rounded-full bg-accent-100 px-3 py-1.5 text-[12.5px] font-semibold text-accent-700 sm:inline">FX · 1 € = ₨310.8</span>
          <Link href="/admin/umrah-finance" className="whitespace-nowrap rounded-[10px] border-[1.5px] border-sand-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-green-800 hover:bg-sand-50">💷 Finance</Link>
          <Link href="/admin/finance" className="hidden whitespace-nowrap rounded-[10px] border-[1.5px] border-sand-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-green-800 hover:bg-sand-50 lg:inline">📊 Assess</Link>
          <Link href="/admin/umrah-content" className="hidden whitespace-nowrap rounded-[10px] border-[1.5px] border-sand-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-green-800 hover:bg-sand-50 sm:inline">📖 Content</Link>
          <Link href="/admin/visa" className="hidden whitespace-nowrap rounded-[10px] border-[1.5px] border-sand-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-green-800 hover:bg-sand-50 lg:inline">🛂 Visa</Link>
          <button type="button" className="relative h-10 w-10 rounded-[10px] border-[1.5px] border-sand-200 bg-white">🔔<span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-danger" /></button>
          <button type="button" className="whitespace-nowrap rounded-[10px] bg-green-800 px-4 py-2.5 text-sm font-semibold text-white">{t('newBooking')}</button>
        </header>

        <div className="p-[clamp(16px,3vw,32px)]">
          <div key={selected ? selected.id : view} className="animate-fade-in">
            {selected ? (
              <Profile pilgrim={selected} onBack={() => setSelected(null)} />
            ) : view === 'overview' ? (
              <Overview onViewAll={() => go('pilgrims')} />
            ) : view === 'leads' ? (
              <Leads />
            ) : view === 'pilgrims' ? (
              <Pilgrims onSelect={setSelected} />
            ) : view === 'providers' ? (
              <ServiceProviders />
            ) : view === 'requests' ? (
              <Requests />
            ) : view === 'documents' ? (
              <Documents />
            ) : view === 'support' ? (
              <Support />
            ) : view === 'content' ? (
              <Content />
            ) : (
              <Users />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ---------- shared bits ---------- */

function VisaPill({ nationality }: { nationality: string }) {
  const evisa = routeFor({ id: 'x', firstName: 'A', lastName: 'B', passportNumber: 'X', nationality, dob: '1990-01-01', gender: 'M' }).route === 'EVISA_DIRECT';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${evisa ? 'bg-success-bg text-success-fg' : 'bg-info-bg text-info-fg'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${evisa ? 'bg-success-fg' : 'bg-info-fg'}`} />
      {evisa ? 'e-Visa' : 'Agent channel'}
    </span>
  );
}

function MiniTimeline({ stage }: { stage: number }) {
  return (
    <div className="flex gap-1">
      {STAGES.map((s, i) => (
        <span key={s} className={`h-1.5 w-1.5 rounded-full ${i <= stage ? 'bg-success' : 'bg-sand-300'}`} />
      ))}
    </div>
  );
}

function PageHead({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mb-6">
      <div className="mb-1.5 font-mono text-xs text-accent-600">{kicker}</div>
      <h1 className="font-serif text-[clamp(1.5rem,3vw,1.875rem)] font-semibold tracking-[-0.02em]">{title}</h1>
    </div>
  );
}

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-sand-200 bg-white ${className}`}>{children}</div>;
}

/* ---------- views ---------- */

function Overview({ onViewAll }: { onViewAll: () => void }) {
  const t = useTranslations('admin');
  return (
    <>
      <PageHead kicker={t('views.overviewKicker')} title={t('views.overviewTitle', { name: 'Sara' })} />
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {ADMIN_KPIS.map((k) => (
          <Card key={k.label} className="p-5 shadow-sm">
            <div className="mb-3.5 flex items-center justify-between">
              <span className="text-[13px] font-medium text-sand-500">{k.label}</span>
              <span className={`flex h-8 w-8 items-center justify-center rounded-[9px] ${k.iconBg}`}>{k.icon}</span>
            </div>
            <div className="font-mono text-[28px] font-semibold">{k.value}</div>
            <div className="mt-1.5 text-xs font-semibold text-success-fg">{k.delta}</div>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-sand-100 px-5 py-4">
            <span className="text-sm font-bold">{t('sections.recentBookings')}</span>
            <button type="button" onClick={onViewAll} className="text-[13px] font-semibold text-success-fg">{t('viewAll')} →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[460px] text-[13px]">
              <thead>
                <tr className="bg-sand-50 text-left text-sand-500">
                  <th className="px-5 py-2.5 font-semibold">BRN</th>
                  <th className="px-3 py-2.5 font-semibold">Lead pilgrim</th>
                  <th className="px-3 py-2.5 font-semibold">Visa</th>
                  <th className="px-5 py-2.5 text-right font-semibold">Sell</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_BOOKINGS.map((r) => (
                  <tr key={r.brn} className="border-t border-sand-100">
                    <td className="px-5 py-3 font-mono text-accent-600">{r.brn}</td>
                    <td className="px-3 py-3"><div className="font-semibold">{r.lead}</div><div className="text-[11.5px] text-sand-500">{r.pkg}</div></td>
                    <td className="px-3 py-3"><VisaPill nationality={r.nationality} /></td>
                    <td className="px-5 py-3 text-right font-mono">{r.sell}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <div className="grid gap-4">
          <Card className="p-5">
            <div className="mb-4 text-sm font-bold">{t('sections.visaPipeline')}</div>
            {PIPELINE.map((p) => (
              <div key={p.label} className="mb-3">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[13px] text-sand-700">{p.label}</span>
                  <span className="font-mono text-[13px] font-semibold">{p.count}</span>
                </div>
                <div className="h-[7px] overflow-hidden rounded-full bg-sand-100"><div className={`h-full rounded-full ${p.color}`} style={{ width: p.pct }} /></div>
              </div>
            ))}
          </Card>
          <Card className="p-5">
            <div className="mb-3 text-sm font-bold">{t('sections.upcomingDepartures')}</div>
            {DEPARTURES.map((d) => (
              <div key={`${d.day}-${d.route}`} className="flex items-center gap-3 border-t border-sand-100 py-2.5">
                <div className="w-10 text-center"><div className="font-mono text-base font-semibold text-green-800">{d.day}</div><div className="text-[10px] uppercase text-sand-500">{d.mon}</div></div>
                <div className="min-w-0 flex-1"><div className="text-[13px] font-semibold">{d.route}</div><div className="text-[11.5px] text-sand-500">{d.pax}</div></div>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${d.tone === 'success' ? 'bg-success-bg text-success-fg' : 'bg-warning-bg text-warning-fg'}`}>{d.status}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </>
  );
}

function Leads() {
  const t = useTranslations('admin');
  const [rows, setRows] = useState<Inquiry[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string>();
  useEffect(() => {
    void listInquiriesAction()
      .then(setRows)
      .catch((e: unknown) => setErr(e instanceof Error ? e.message : 'Failed to load leads'));
  }, []);
  const setStatus = (id: string, status: InquiryStatus): void => {
    setBusy(id);
    void setInquiryStatusAction(id, status)
      .then(setRows)
      .catch((e: unknown) => setErr(e instanceof Error ? e.message : 'Update failed'))
      .finally(() => setBusy(null));
  };
  const newCount = rows.filter((r) => r.status === 'NEW').length;
  return (
    <>
      <PageHead kicker={t('views.leadsKicker')} title={t('views.leadsTitle')} />
      {err ? <p className="mb-3 text-[13px] text-danger-fg">{err}</p> : null}
      <div className="mb-4 text-[13px] text-sand-500">
        <strong className="text-sand-ink">{newCount}</strong> new · {rows.length} total
      </div>
      {rows.length === 0 ? (
        <Card className="p-6 text-center text-sm text-sand-500">No Smart Visit inquiries yet.</Card>
      ) : (
        <div className="grid gap-3">
          {rows.map((r) => (
            <Card key={r.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-mono text-[13px] font-semibold text-accent-600">{r.ref}</div>
                  <div className="font-semibold">
                    {r.name} <span className="font-normal text-sand-500">· {r.email}{r.phone ? ` · ${r.phone}` : ''}</span>
                  </div>
                  <div className="text-[12px] text-sand-500">
                    {r.country}{r.city ? `, ${r.city}` : ''} · {r.adults}+{r.children}+{r.infants} ({r.partyKind}) · Makkah {r.makkahNights}n · {r.transferMode}{r.transferDate ? ` ${r.transferDate}` : ''} → Madinah {r.madinahNights}n{r.rawdah ? ` · Rawdah${r.rawdahDay ? ` ${r.rawdahDay}` : ''}` : ''} · return {r.returnFrom} via {r.returnMode}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`/book?city=MAKKAH&pax=${Math.min(49, Math.max(1, r.adults + r.children))}${r.windowFrom ? `&checkIn=${r.windowFrom}` : ''}${r.windowTo ? `&checkOut=${r.windowTo}` : ''}`}
                    className="whitespace-nowrap rounded-lg bg-green-800 px-3 py-1.5 text-[12.5px] font-semibold text-white hover:bg-green-700"
                  >
                    {t('convert')}
                  </a>
                  <select
                    value={r.status}
                    disabled={busy === r.id}
                    onChange={(e) => setStatus(r.id, e.target.value as InquiryStatus)}
                    className="rounded-lg border-[1.5px] border-sand-300 bg-white px-2.5 py-1.5 text-[12.5px] font-semibold"
                  >
                    {INQUIRY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

function Pilgrims({ onSelect }: { onSelect: (p: AdminPilgrim) => void }) {
  const t = useTranslations('admin');
  return (
    <>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3.5">
        <PageHead kicker={t('views.pilgrimsKicker', { count: '1,284' })} title={t('views.pilgrimsTitle')} />
        <div className="flex flex-wrap gap-2 pb-1">
          <span className="rounded-[10px] border-[1.5px] border-sand-200 bg-white px-3 py-2 text-[13px] font-semibold text-sand-700">Route: All ▾</span>
          <span className="rounded-[10px] border-[1.5px] border-sand-200 bg-white px-3 py-2 text-[13px] font-semibold text-sand-700">Status: All ▾</span>
          <button type="button" className="rounded-[10px] bg-green-800 px-4 py-2 text-[13px] font-semibold text-white">+ Add pilgrim</button>
        </div>
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-[13.5px]">
            <thead>
              <tr className="bg-sand-50 text-left text-sand-500">
                <th className="px-5 py-3 font-semibold">Pilgrim</th>
                <th className="px-3 py-3 font-semibold">BRN</th>
                <th className="px-3 py-3 font-semibold">Nat.</th>
                <th className="px-3 py-3 font-semibold">Visa route</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-3 py-3 font-semibold">Journey</th>
                <th className="px-5 py-3 text-right font-semibold">Balance</th>
              </tr>
            </thead>
            <tbody>
              {PILGRIMS.map((p) => {
                const balance = { amount: p.total.amount - p.paid.amount, currency: p.total.currency };
                return (
                  <tr key={p.id} onClick={() => onSelect(p)} className="cursor-pointer border-t border-sand-100 hover:bg-sand-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-accent-600 text-[12.5px] font-semibold text-white">{p.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</span>
                        <div><div className="font-semibold">{p.name}</div><div className="text-[11.5px] text-sand-500">{p.pkg}</div></div>
                      </div>
                    </td>
                    <td className="px-3 py-3 font-mono text-accent-600">{p.brn}</td>
                    <td className="px-3 py-3">{p.nationality}</td>
                    <td className="px-3 py-3"><VisaPill nationality={p.nationality} /></td>
                    <td className="px-3 py-3"><MiniTimeline stage={p.stage} /></td>
                    <td className="px-3 py-3 text-sand-700">{p.journey}</td>
                    <td className="px-5 py-3 text-right font-mono">{formatMoney(balance)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

function Profile({ pilgrim, onBack }: { pilgrim: AdminPilgrim; onBack: () => void }) {
  const t = useTranslations('admin');
  const balance = { amount: pilgrim.total.amount - pilgrim.paid.amount, currency: pilgrim.total.currency };
  return (
    <>
      <button type="button" onClick={onBack} className="mb-4 text-[13px] font-semibold text-accent-600">← {t('nav.pilgrims')}</button>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-600 text-base font-semibold text-white">{pilgrim.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</span>
          <div>
            <h1 className="font-serif text-2xl font-semibold">{pilgrim.name}</h1>
            <div className="font-mono text-[13px] text-accent-600">{pilgrim.brn}</div>
          </div>
          <VisaPill nationality={pilgrim.nationality} />
        </div>
        <button type="button" className="rounded-[10px] border-[1.5px] border-sand-300 bg-white px-4 py-2 text-[13px] font-semibold text-sand-700">📄 Travel plan PDF</button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="grid gap-4">
          <Card className="p-5">
            <div className="mb-4 text-sm font-bold">{t('sections.journeyStatus')}</div>
            {STAGES.map((s, i) => {
              const done = i < pilgrim.stage;
              const active = i === pilgrim.stage;
              const last = i === STAGES.length - 1;
              return (
                <div key={s} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className={`flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 text-[11px] text-white ${done ? 'border-success bg-success' : active ? 'border-warning bg-warning' : 'border-sand-300 bg-white'}`}>{done ? '✓' : ''}</span>
                    {!last ? <div className={`min-h-[16px] w-0.5 flex-1 ${i < pilgrim.stage ? 'bg-success' : 'bg-sand-200'}`} /> : null}
                  </div>
                  <div className="pb-3"><div className={`text-[13.5px] font-semibold ${done || active ? 'text-sand-ink' : 'text-sand-500'}`}>{s}</div></div>
                </div>
              );
            })}
          </Card>
          <Card className="p-5">
            <div className="mb-3 text-sm font-bold">{t('sections.documents')}</div>
            <div className="grid gap-2.5">
              <DocRow label="Passport scan" sub="uploaded" ok />
              <DocRow label="Visa photo" sub="White background · 45×35mm" />
            </div>
          </Card>
          <Card className="p-5">
            <div className="mb-3 text-sm font-bold">{t('sections.communications')}</div>
            {['Email · Booking confirmed', 'WhatsApp · Documents reminder', 'SMS · Visa update'].map((c) => (
              <div key={c} className="border-t border-sand-100 py-2 text-[13px] text-sand-700 first:border-0">{c}</div>
            ))}
          </Card>
        </div>
        <div className="grid gap-4">
          <Card className="p-5">
            <div className="mb-2 text-sm font-bold">{t('sections.visaRoute')}</div>
            <VisaPill nationality={pilgrim.nationality} />
            <p className="mt-2 text-[12.5px] text-sand-500">Auto-detected from the {pilgrim.nationality} passport.</p>
          </Card>
          <Card className="p-5">
            <div className="mb-3 text-sm font-bold">{t('sections.payments')}</div>
            <PayRow label="Total" value={formatMoney(pilgrim.total)} />
            <PayRow label="Paid" value={formatMoney(pilgrim.paid)} tone="text-success-fg" />
            <div className="mt-2 flex items-center justify-between border-t border-sand-200 pt-3">
              <span className="text-sm font-bold">{t('sections.balance')}</span>
              <span className="font-mono text-lg font-bold text-green-800">{formatMoney(balance)}</span>
            </div>
          </Card>
          <Card className="p-5">
            <div className="mb-2 text-sm font-bold">{t('sections.groupMembers')}</div>
            <p className="text-[13px] text-sand-700">{pilgrim.name} + 3 others on {pilgrim.brn}</p>
          </Card>
        </div>
      </div>
    </>
  );
}

function DocRow({ label, sub, ok }: { label: string; sub: string; ok?: boolean }) {
  return (
    <div className={`flex items-center gap-3 rounded-xl border-[1.5px] px-3.5 py-3 ${ok ? 'border-green-100 bg-green-50' : 'border-dashed border-sand-300 bg-white'}`}>
      <span className="flex h-[38px] w-[38px] items-center justify-center rounded-[9px] bg-sand-100 text-[17px]">{ok ? '📄' : '📷'}</span>
      <div className="flex-1"><div className="text-[13.5px] font-semibold">{label}</div><div className="text-[11.5px] text-sand-500">{sub}</div></div>
      {ok ? <span className="text-lg text-success">✓</span> : <span className="text-xs font-semibold text-accent-600">Upload</span>}
    </div>
  );
}

function PayRow({ label, value, tone = '' }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[13px] text-sand-700">{label}</span>
      <span className={`font-mono text-[13px] ${tone}`}>{value}</span>
    </div>
  );
}

function providerTone(status: ProviderStatus): PillTone {
  if (status === 'connected') return 'success';
  if (status === 'sandbox') return 'info';
  if (status === 'gated') return 'warning';
  return 'draft';
}

function ServiceProviders() {
  const t = useTranslations('admin');
  return (
    <>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <PageHead kicker={t('views.providersKicker')} title={t('views.providersTitle')} />
        <button type="button" className="rounded-[10px] bg-green-800 px-4 py-2 text-[13px] font-semibold text-white">+ Add provider</button>
      </div>
      <p className="mb-4 max-w-2xl text-[13px] text-sand-500">
        Every external integration behind the connector seam — Saudi pilgrimage (Nusuk Masar / Maqam),
        general-travel supply, payment gateways and storage. Only licensed/approved partners are listed.
      </p>
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { href: '/admin/providers', label: '🔌 Provider registry + health' },
          { href: '/admin/connector', label: '🛂 Saudi connector' },
          { href: '/admin/nusuk', label: '🕋 Nusuk services' },
          { href: '/admin/suppliers', label: '🧭 Travel suppliers' },
          { href: '/admin/compliance', label: '🛡️ EU compliance' },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-lg border border-sand-200 bg-white px-3 py-2 text-[12.5px] font-semibold text-green-800 transition-transform duration-fast hover:border-green-700 active:scale-[0.98]"
          >
            {l.label}
          </Link>
        ))}
      </div>
      <div className="grid gap-3.5 lg:grid-cols-2">
        {PROVIDERS.map((p) => (
          <Card key={p.name} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{p.name}</div>
                <div className="text-[12.5px] text-sand-500">{p.kind}</div>
              </div>
              <StatusPill tone={providerTone(p.status)}>{p.status}</StatusPill>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {p.capabilities.map((c) => (
                <span key={c} className="rounded-[7px] bg-sand-100 px-2.5 py-1 text-[11.5px] text-sand-700">{c}</span>
              ))}
            </div>
            <div className="mt-3 border-t border-sand-100 pt-3 text-[12.5px] text-sand-500">
              Adapter <span className="font-mono text-sand-700">{p.adapter}</span> · selector <span className="font-mono text-sand-700">{p.binding}</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[12px] text-sand-500">Last checked {p.lastChecked}</span>
              <button type="button" className="rounded-[9px] border-[1.5px] border-sand-300 bg-white px-3 py-1.5 text-[12.5px] font-semibold text-sand-700">Test connection</button>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

function Content() {
  const t = useTranslations('admin');
  return (
    <>
      <PageHead kicker={t('views.contentKicker')} title={t('views.contentTitle')} />
      <div className="grid gap-4 xl:grid-cols-[1fr_1.4fr]">
        <Card className="p-5">
          <div className="mb-3 text-sm font-bold">{t('sections.hero')}</div>
          <label className="text-[12px] font-medium text-sand-700">Headline</label>
          <div className="mb-3 mt-1 rounded-lg border-[1.5px] border-sand-300 bg-white px-3 py-2.5 text-sm">Begin a sacred journey, with calm.</div>
          <label className="text-[12px] font-medium text-sand-700">Sub-headline</label>
          <div className="mb-3 mt-1 rounded-lg border-[1.5px] border-sand-300 bg-white px-3 py-2.5 text-sm">Hotel, transport, ground services and flights in one cart…</div>
          <button type="button" className="rounded-[10px] bg-green-800 px-4 py-2.5 text-sm font-semibold text-white">Save &amp; publish</button>
        </Card>
        <Card className="overflow-hidden">
          <div className="border-b border-sand-100 px-5 py-4 text-sm font-bold">{t('sections.sectionsList')}</div>
          <table className="w-full text-[13px]">
            <tbody>
              {CMS_SECTIONS.map((s) => (
                <tr key={s.name} className="border-t border-sand-100 first:border-0">
                  <td className="px-5 py-3 font-semibold">{s.name}</td>
                  <td className="px-3 py-3"><span className={`rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${s.status === 'Published' ? 'bg-success-bg text-success-fg' : 'bg-warning-bg text-warning-fg'}`}>{s.status}</span></td>
                  <td className="px-3 py-3 text-sand-500">{s.edited}</td>
                  <td className="px-5 py-3 text-right"><button type="button" className="text-[13px] font-semibold text-accent-600">Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
}

function AgentApprovals() {
  const [agents, setAgents] = useState<PublicUser[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string>();

  useEffect(() => {
    void listAgentsAction()
      .then(setAgents)
      .catch((e: unknown) => setErr(e instanceof Error ? e.message : 'Failed to load agents'));
  }, []);

  const approve = (id: string): void => {
    setBusy(id);
    void approveAgentAction(id)
      .then(setAgents)
      .catch((e: unknown) => setErr(e instanceof Error ? e.message : 'Approve failed'))
      .finally(() => setBusy(null));
  };

  const pending = agents.filter((a) => a.agentStatus !== 'ACTIVE');

  const t = useTranslations('admin');
  return (
    <Card className="mb-4 p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-bold">{t('sections.agentApprovals')}</div>
        <span className="rounded-full bg-warning-bg px-2.5 py-0.5 text-[11.5px] font-semibold text-warning-fg">{pending.length} pending</span>
      </div>
      {err ? <p className="text-[13px] text-danger-fg">{err}</p> : null}
      {!err && agents.length === 0 ? <p className="text-[13px] text-sand-500">No agent accounts yet.</p> : null}
      <div className="grid gap-2">
        {agents.map((a) => {
          const active = a.agentStatus === 'ACTIVE';
          return (
            <div key={a.id} className="flex items-center justify-between rounded-xl border border-sand-200 px-3.5 py-2.5">
              <div>
                <div className="text-[13.5px] font-semibold">{a.displayName}</div>
                <div className="text-[11.5px] text-sand-500">{a.email} · {a.role}</div>
              </div>
              {active ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success-bg px-2.5 py-1 text-[11.5px] font-semibold text-success-fg">Active</span>
              ) : (
                <button
                  type="button"
                  onClick={() => approve(a.id)}
                  disabled={busy === a.id}
                  className="rounded-lg bg-green-800 px-3.5 py-1.5 text-[12.5px] font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                >
                  {busy === a.id ? 'Approving…' : 'Approve'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

const REQUEST_LABEL: Record<SpecialRequestCategory, string> = {
  WHEELCHAIR: '♿ Wheelchair access',
  DIETARY: '🍽 Dietary needs',
  ROOM_NEAR_HARAM: '🕋 Room near Haram',
  LATE_CHECKOUT: '🕔 Late checkout',
  OTHER: '📝 Note',
};
const REQUEST_TONE: Record<SpecialRequestStatus, PillTone> = { REQUESTED: 'info', ACKNOWLEDGED: 'warning', FULFILLED: 'success', DECLINED: 'danger' };
const NEXT_ACTIONS: Array<{ status: SpecialRequestStatus; label: string }> = [
  { status: 'ACKNOWLEDGED', label: 'Acknowledge' },
  { status: 'FULFILLED', label: 'Fulfil' },
  { status: 'DECLINED', label: 'Decline' },
];

function Documents() {
  const t = useTranslations('admin');
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string>();

  useEffect(() => {
    void listDocumentsAction()
      .then(setDocs)
      .catch((e: unknown) => setErr(e instanceof Error ? e.message : 'Failed to load documents'));
  }, []);

  const verify = (id: string): void => {
    setBusy(id);
    void verifyDocumentAction(id)
      .then(setDocs)
      .catch((e: unknown) => setErr(e instanceof Error ? e.message : 'Verify failed'))
      .finally(() => setBusy(null));
  };

  const pending = docs.filter((d) => !d.verified).length;

  return (
    <>
      <PageHead kicker={t('views.documentsKicker')} title={t('views.documentsTitle')} />
      {err ? <p className="mb-3 text-[13px] text-danger-fg">{err}</p> : null}
      <div className="mb-4 text-[13px] text-sand-500"><strong className="text-sand-ink">{pending}</strong> awaiting verification · {docs.length} total</div>
      {docs.length === 0 ? (
        <Card className="p-6 text-center text-sm text-sand-500">No documents uploaded yet.</Card>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-[13.5px]">
            <thead>
              <tr className="bg-sand-50 text-left text-sand-500">
                <th className="px-5 py-3 font-semibold">Pilgrim</th>
                <th className="px-3 py-3 font-semibold">Type</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.id} className="border-t border-sand-100">
                  <td className="px-5 py-3"><div className="font-semibold">{d.pilgrimName}</div><div className="font-mono text-[10.5px] text-sand-500">{d.fileRef.split('/').pop()}</div></td>
                  <td className="px-3 py-3"><span className="rounded-full bg-sand-100 px-2.5 py-0.5 text-[11.5px] font-semibold text-sand-700">{d.type}</span></td>
                  <td className="px-3 py-3"><StatusPill tone={d.verified ? 'success' : 'warning'}>{d.verified ? 'Verified' : 'Pending'}</StatusPill></td>
                  <td className="px-5 py-3 text-right">
                    {d.verified ? <span className="text-[12px] text-sand-400">—</span> : (
                      <button type="button" disabled={busy === d.id} onClick={() => verify(d.id)} className="rounded-lg bg-green-800 px-3 py-1.5 text-[12.5px] font-semibold text-white hover:bg-green-700 disabled:opacity-60">
                        {busy === d.id ? 'Verifying…' : 'Verify'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}

function Requests() {
  const t = useTranslations('admin');
  const [groups, setGroups] = useState<RequestGroup[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string>();

  useEffect(() => {
    void listSpecialRequestsAction()
      .then(setGroups)
      .catch((e: unknown) => setErr(e instanceof Error ? e.message : 'Failed to load requests'));
  }, []);

  const set = (bookingId: string, requestId: string, status: SpecialRequestStatus): void => {
    setBusy(requestId);
    void setRequestStatusAction(bookingId, requestId, status)
      .then(setGroups)
      .catch((e: unknown) => setErr(e instanceof Error ? e.message : 'Update failed'))
      .finally(() => setBusy(null));
  };

  const pending = groups.flatMap((g) => g.requests).filter((r) => r.status === 'REQUESTED' || r.status === 'ACKNOWLEDGED').length;

  return (
    <>
      <PageHead kicker={t('views.requestsKicker')} title={t('views.requestsTitle')} />
      {err ? <p className="mb-3 text-[13px] text-danger-fg">{err}</p> : null}
      <div className="mb-4 text-[13px] text-sand-500"><strong className="text-sand-ink">{pending}</strong> open across <strong className="text-sand-ink">{groups.length}</strong> bookings</div>
      {groups.length === 0 ? (
        <Card className="p-6 text-center text-sm text-sand-500">No special requests yet.</Card>
      ) : (
        <div className="grid gap-3">
          {groups.map((g) => (
            <Card key={g.bookingId} className="p-4">
              <div className="mb-2 font-mono text-[12px] text-sand-500">{g.bookingRef}</div>
              <div className="grid gap-2">
                {g.requests.map((r) => (
                  <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-sand-50 px-3 py-2">
                    <span className="text-[13.5px] text-sand-700">{REQUEST_LABEL[r.category]}{r.note ? ` — ${r.note}` : ''}</span>
                    <div className="flex items-center gap-2">
                      <StatusPill tone={REQUEST_TONE[r.status]}>{r.status}</StatusPill>
                      {NEXT_ACTIONS.filter((a) => a.status !== r.status).map((a) => (
                        <button key={a.status} type="button" disabled={busy === r.id} onClick={() => set(g.bookingId, r.id, a.status)} className="rounded-full border border-sand-300 px-2.5 py-1 text-[11.5px] font-semibold text-sand-700 hover:bg-sand-100 disabled:opacity-40">
                          {a.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

const TICKET_TONE: Record<TicketStatus, PillTone> = { OPEN: 'info', PENDING: 'warning', RESOLVED: 'success', CLOSED: 'draft' };

function Support() {
  const tr = useTranslations('admin');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string>();

  useEffect(() => {
    void listAllTicketsAction()
      .then(setTickets)
      .catch((e: unknown) => setErr(e instanceof Error ? e.message : 'Failed to load tickets'));
  }, []);

  const run = (id: string, p: Promise<Ticket[]>): void => {
    setBusy(id);
    void p
      .then(setTickets)
      .catch((e: unknown) => setErr(e instanceof Error ? e.message : 'Action failed'))
      .finally(() => setBusy(null));
  };
  const reply = (id: string): void => {
    const body = (drafts[id] ?? '').trim();
    if (!body) return;
    setDrafts((d) => ({ ...d, [id]: '' }));
    run(id, staffReplyAction(id, body));
  };

  const open = tickets.filter((t) => t.status === 'OPEN' || t.status === 'PENDING').length;

  return (
    <>
      <PageHead kicker={tr('views.supportKicker')} title={tr('views.supportTitle')} />
      {err ? <p className="mb-3 text-[13px] text-danger-fg">{err}</p> : null}
      <div className="mb-4 text-[13px] text-sand-500"><strong className="text-sand-ink">{open}</strong> open · {tickets.length} total</div>
      {tickets.length === 0 ? (
        <Card className="p-6 text-center text-sm text-sand-500">No tickets yet.</Card>
      ) : (
        <div className="grid gap-3">
          {tickets.map((t) => (
            <Card key={t.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-[14.5px] font-semibold">{t.subject}</div>
                  <div className="font-mono text-[11px] text-sand-500">{t.ref} · {t.category} · {t.userEmail}{t.bookingRef ? ` · ${t.bookingRef}` : ''}</div>
                </div>
                <StatusPill tone={TICKET_TONE[t.status]}>{t.status}</StatusPill>
              </div>
              <div className="mt-3 grid gap-2">
                {t.messages.map((m, i) => (
                  <div key={i} className={`rounded-xl px-3 py-2 text-[13.5px] ${m.author === 'STAFF' ? 'bg-green-100 text-sand-ink' : 'bg-sand-50 text-sand-700'}`}>
                    <div className="mb-0.5 text-[11px] font-semibold text-sand-500">{m.author === 'STAFF' ? `${m.authorName} · AUJ` : m.authorName}</div>
                    {m.body}
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  value={drafts[t.id] ?? ''}
                  onChange={(e) => setDrafts((d) => ({ ...d, [t.id]: e.target.value }))}
                  placeholder="Reply as AUJ…"
                  className="flex-1 rounded-[10px] border-[1.5px] border-sand-300 px-3 py-2 text-[14px] focus:border-green-700 focus:outline-none"
                />
                <button type="button" disabled={busy === t.id} onClick={() => reply(t.id)} className="rounded-[10px] bg-green-800 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60">Reply</button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(['RESOLVED', 'CLOSED', 'OPEN'] as const).map((s) => (
                  <button key={s} type="button" disabled={busy === t.id || t.status === s} onClick={() => run(t.id, setTicketStatusAction(t.id, s))} className="rounded-full border border-sand-300 px-3 py-1 text-[12px] font-semibold text-sand-700 hover:bg-sand-100 disabled:opacity-40">
                    {s === 'OPEN' ? 'Re-open' : s === 'RESOLVED' ? 'Resolve' : 'Close'}
                  </button>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

function Users() {
  const tr = useTranslations('admin');
  const [tab, setTab] = useState<'All' | 'Admins' | 'Agents' | 'Customers'>('All');
  const filtered = USERS.filter((u) => tab === 'All' || u.role === tab.slice(0, -1));
  return (
    <>
      <PageHead kicker={tr('views.usersKicker')} title={tr('views.usersTitle')} />
      <AgentApprovals />
      <div className="mb-4 flex gap-1 rounded-[10px] bg-sand-100 p-1">
        {(['All', 'Admins', 'Agents', 'Customers'] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={`rounded-[7px] px-4 py-1.5 text-sm font-semibold ${tab === t ? 'bg-white text-green-800 shadow-sm' : 'text-sand-500'}`}>{t}</button>
        ))}
      </div>
      <Card className="overflow-hidden">
        <table className="w-full text-[13.5px]">
          <thead>
            <tr className="bg-sand-50 text-left text-sand-500">
              <th className="px-5 py-3 font-semibold">User</th>
              <th className="px-3 py-3 font-semibold">Role</th>
              <th className="px-3 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 text-right font-semibold">Last active</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.email} className="border-t border-sand-100">
                <td className="px-5 py-3"><div className="font-semibold">{u.name}</div><div className="text-[11.5px] text-sand-500">{u.email}</div></td>
                <td className="px-3 py-3"><span className="rounded-full bg-sand-100 px-2.5 py-0.5 text-[11.5px] font-semibold text-sand-700">{u.role}</span></td>
                <td className="px-3 py-3"><span className="inline-flex items-center gap-1.5 text-[13px]"><span className={`h-1.5 w-1.5 rounded-full ${u.status === 'Active' ? 'bg-success' : 'bg-warning'}`} />{u.status}</span></td>
                <td className="px-5 py-3 text-right text-sand-500">{u.lastActive}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
