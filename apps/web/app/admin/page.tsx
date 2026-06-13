'use client';

import { useState, type ReactNode } from 'react';
import { Logo, StatusPill, type PillTone } from '@auj/ui';
import { routeFor } from '@auj/visa-router';
import { formatMoney } from '../../src/currency';
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

type View = 'overview' | 'pilgrims' | 'providers' | 'content' | 'users';

const NAV: Array<{ key: View; label: string; icon: string; badge?: string }> = [
  { key: 'overview', label: 'Overview', icon: '▦' },
  { key: 'pilgrims', label: 'Pilgrims · CRM', icon: '👥', badge: '1.3k' },
  { key: 'providers', label: 'Service providers', icon: '🔌' },
  { key: 'content', label: 'Landing content', icon: '📝' },
  { key: 'users', label: 'Users & roles', icon: '🛡' },
];

export default function AdminPage() {
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
            <div className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-green-100/60">Admin · Web</div>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          <div className="px-3 pb-1.5 pt-2 text-[10.5px] uppercase tracking-wider text-green-100/50">Operate</div>
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
                <span className="flex-1">{n.label}</span>
                {n.badge ? <span className="rounded-full bg-white/15 px-2 py-0.5 font-mono text-[11px] font-semibold">{n.badge}</span> : null}
              </button>
            );
          })}
          <div className="px-3 pb-1.5 pt-4 text-[10.5px] uppercase tracking-wider text-green-100/50">More</div>
          {['💶 Payments', '📊 Reports', '⚙ Settings'].map((s) => (
            <div key={s} className="rounded-[10px] px-3 py-2.5 text-sm font-medium text-green-100/60">{s}</div>
          ))}
        </nav>
        <div className="border-t border-white/10 p-3.5">
          <div className="flex items-center gap-2.5 rounded-xl bg-white/5 px-3 py-2.5">
            <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-gold text-[13px] font-bold text-green-950">SR</span>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-white">Sara Rashid</div>
              <div className="text-[11px] text-green-100/60">Operations admin</div>
            </div>
          </div>
        </div>
      </aside>

      {/* main */}
      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center gap-3.5 border-b border-sand-200 bg-sand-50/90 px-[clamp(16px,3vw,36px)] py-3.5 backdrop-blur">
          <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-[10px] border-[1.5px] border-sand-200 bg-white px-3.5 py-2.5">
            <span className="text-sand-500">🔍</span>
            <span className="truncate text-sm text-sand-500">Search pilgrims, BRN, bookings…</span>
            <span className="ms-auto rounded border border-sand-200 px-1.5 font-mono text-[11px] text-sand-300">⌘K</span>
          </div>
          <span className="hidden whitespace-nowrap rounded-full bg-accent-100 px-3 py-1.5 text-[12.5px] font-semibold text-accent-700 sm:inline">FX · 1 € = ₨310.8</span>
          <button type="button" className="relative h-10 w-10 rounded-[10px] border-[1.5px] border-sand-200 bg-white">🔔<span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-danger" /></button>
          <button type="button" className="whitespace-nowrap rounded-[10px] bg-green-800 px-4 py-2.5 text-sm font-semibold text-white">+ New booking</button>
        </header>

        <div className="p-[clamp(16px,3vw,32px)]">
          <div key={selected ? selected.id : view} className="animate-fade-in">
            {selected ? (
              <Profile pilgrim={selected} onBack={() => setSelected(null)} />
            ) : view === 'overview' ? (
              <Overview onViewAll={() => go('pilgrims')} />
            ) : view === 'pilgrims' ? (
              <Pilgrims onSelect={setSelected} />
            ) : view === 'providers' ? (
              <ServiceProviders />
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
  return (
    <>
      <PageHead kicker="OVERVIEW · 13 JUN 2026" title="Good morning, Sara." />
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
            <span className="text-sm font-bold">Recent bookings</span>
            <button type="button" onClick={onViewAll} className="text-[13px] font-semibold text-success-fg">View all →</button>
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
            <div className="mb-4 text-sm font-bold">Visa pipeline</div>
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
            <div className="mb-3 text-sm font-bold">Upcoming departures</div>
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

function Pilgrims({ onSelect }: { onSelect: (p: AdminPilgrim) => void }) {
  return (
    <>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3.5">
        <PageHead kicker="CRM · 1,284 ACTIVE" title="Pilgrims & travellers" />
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
  const balance = { amount: pilgrim.total.amount - pilgrim.paid.amount, currency: pilgrim.total.currency };
  return (
    <>
      <button type="button" onClick={onBack} className="mb-4 text-[13px] font-semibold text-accent-600">← Back to pilgrims</button>
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
            <div className="mb-4 text-sm font-bold">Journey status</div>
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
            <div className="mb-3 text-sm font-bold">Documents</div>
            <div className="grid gap-2.5">
              <DocRow label="Passport scan" sub="uploaded" ok />
              <DocRow label="Visa photo" sub="White background · 45×35mm" />
            </div>
          </Card>
          <Card className="p-5">
            <div className="mb-3 text-sm font-bold">Communications</div>
            {['Email · Booking confirmed', 'WhatsApp · Documents reminder', 'SMS · Visa update'].map((c) => (
              <div key={c} className="border-t border-sand-100 py-2 text-[13px] text-sand-700 first:border-0">{c}</div>
            ))}
          </Card>
        </div>
        <div className="grid gap-4">
          <Card className="p-5">
            <div className="mb-2 text-sm font-bold">Visa route</div>
            <VisaPill nationality={pilgrim.nationality} />
            <p className="mt-2 text-[12.5px] text-sand-500">Auto-detected from the {pilgrim.nationality} passport.</p>
          </Card>
          <Card className="p-5">
            <div className="mb-3 text-sm font-bold">Payments</div>
            <PayRow label="Total" value={formatMoney(pilgrim.total)} />
            <PayRow label="Paid" value={formatMoney(pilgrim.paid)} tone="text-success-fg" />
            <div className="mt-2 flex items-center justify-between border-t border-sand-200 pt-3">
              <span className="text-sm font-bold">Balance</span>
              <span className="font-mono text-lg font-bold text-green-800">{formatMoney(balance)}</span>
            </div>
          </Card>
          <Card className="p-5">
            <div className="mb-2 text-sm font-bold">Group members</div>
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
  return (
    <>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <PageHead kicker="INTEGRATIONS" title="Service providers" />
        <button type="button" className="rounded-[10px] bg-green-800 px-4 py-2 text-[13px] font-semibold text-white">+ Add provider</button>
      </div>
      <p className="mb-4 max-w-2xl text-[13px] text-sand-500">
        Every external integration behind the connector seam — Saudi pilgrimage (Nusuk Masar / Maqam),
        general-travel supply, payment gateways and storage. Only licensed/approved partners are listed.
      </p>
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
  return (
    <>
      <PageHead kicker="CMS" title="Landing content" />
      <div className="grid gap-4 xl:grid-cols-[1fr_1.4fr]">
        <Card className="p-5">
          <div className="mb-3 text-sm font-bold">Hero</div>
          <label className="text-[12px] font-medium text-sand-700">Headline</label>
          <div className="mb-3 mt-1 rounded-lg border-[1.5px] border-sand-300 bg-white px-3 py-2.5 text-sm">Begin a sacred journey, with calm.</div>
          <label className="text-[12px] font-medium text-sand-700">Sub-headline</label>
          <div className="mb-3 mt-1 rounded-lg border-[1.5px] border-sand-300 bg-white px-3 py-2.5 text-sm">Hotel, transport, ground services and flights in one cart…</div>
          <button type="button" className="rounded-[10px] bg-green-800 px-4 py-2.5 text-sm font-semibold text-white">Save &amp; publish</button>
        </Card>
        <Card className="overflow-hidden">
          <div className="border-b border-sand-100 px-5 py-4 text-sm font-bold">Sections</div>
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

function Users() {
  const [tab, setTab] = useState<'All' | 'Admins' | 'Agents' | 'Customers'>('All');
  const filtered = USERS.filter((u) => tab === 'All' || u.role === tab.slice(0, -1));
  return (
    <>
      <PageHead kicker="ACCESS" title="Users & roles" />
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
