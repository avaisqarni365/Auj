import Link from 'next/link';
import { requireRole } from '../../../src/auth/session';
import { SitePage } from '../../../src/components/SitePage';

// Admin — the single "Wizards & content" landing: every pilgrim-facing wizard, guide, directory and
// tool in one place, each with its management entry point and what an admin can edit. This is the
// completeness map — every wizard with shared content is admin-CRUD; per-user tools are marked.

type Crud = 'full' | 'content' | 'peruser';
interface Entry {
  icon: string;
  name: string;
  editable: string;
  href?: string;
  view?: string; // public route, for reference
  crud: Crud;
}
interface Group {
  title: string;
  sub: string;
  entries: Entry[];
}

const GROUPS: Group[] = [
  {
    title: 'Step-by-step wizards',
    sub: 'Video wizards — edit/add/reorder/delete steps, checklists, tips & clips.',
    entries: [
      { icon: '✈️', name: 'Airport wizard', editable: 'Steps, checklists, video per step', href: '/admin/wizards', view: '/guide/airport', crud: 'full' },
      { icon: '🧳', name: 'Luggage & customs', editable: 'Steps, allowed/declare/prohibited, video', href: '/admin/wizards', view: '/guide/luggage', crud: 'full' },
      { icon: '🕋', name: 'Makkah Ziyarat', editable: 'Sites, descriptions, video per site', href: '/admin/wizards', view: '/guide/makkah-ziyarat', crud: 'full' },
      { icon: '🕌', name: 'Madinah Ziyarat', editable: 'Sites, descriptions, video per site', href: '/admin/wizards', view: '/guide/madina-ziyarat', crud: 'full' },
    ],
  },
  {
    title: 'Companion guides',
    sub: 'On-the-ground guides — edit/add/delete items per city & category.',
    entries: [
      { icon: '🍽️', name: 'Food & dining', editable: 'Restaurants, delivery apps', href: '/admin/guides', view: '/guide/food', crud: 'full' },
      { icon: '🚌', name: 'Transport', editable: 'Rail, ride-hailing, fares', href: '/admin/guides', view: '/guide/transport', crud: 'full' },
      { icon: '📶', name: 'Connectivity', editable: 'SIM/eSIM, wifi, official apps', href: '/admin/guides', view: '/guide/connectivity', crud: 'full' },
      { icon: '🎁', name: 'Gifts & shopping', editable: 'Dates, Zamzam, souqs', href: '/admin/guides', view: '/guide/gifts', crud: 'full' },
      { icon: '🧺', name: 'Laundry', editable: 'Shops, express, pickup apps', href: '/admin/guides', view: '/guide/laundry', crud: 'full' },
      { icon: '🏥', name: 'Hospitals & care', editable: 'Hospitals, clinics, pharmacies', href: '/admin/guides', view: '/guide/hospitals', crud: 'full' },
      { icon: '🆘', name: 'Helpline & SOS', editable: 'Emergency numbers, embassy', href: '/admin/guides', view: '/guide/helpline', crud: 'full' },
    ],
  },
  {
    title: 'Catalog & directories',
    sub: 'Per-airport / per-city / per-scene content — full add/edit/delete.',
    entries: [
      { icon: '🛫', name: 'Departure airports', editable: 'Airports, routes, check-in, media', href: '/admin/airports', view: '/from', crud: 'full' },
      { icon: '🏨', name: 'Makkah & Madinah hotels', editable: 'Cities, distance bands, hotels', href: '/admin/hotels', view: '/hotels/makkah', crud: 'full' },
      { icon: '🧭', name: 'Virtual tour scenes', editable: 'Scenes + text per language (EN/AR/UR/TR/DE)', href: '/admin/tour', view: '/guide/tour', crud: 'full' },
    ],
  },
  {
    title: 'Planning tools',
    sub: 'The shared default templates pilgrims start from — fully editable.',
    entries: [
      { icon: '🧳', name: 'Packing organizer', editable: 'Default list: sections, items, profiles', href: '/admin/packing', view: '/companion/packing', crud: 'full' },
      { icon: '💶', name: 'Financial planner', editable: 'Cost presets (package & private), in EUR', href: '/admin/budget', view: '/plan/budget', crud: 'full' },
      { icon: '🕌', name: 'Day planner', editable: 'Driven by jamaat times — pilgrim-personal, no shared content', view: '/plan/day', crud: 'peruser' },
      { icon: '📿', name: 'Personal diary', editable: "Quran, nafl, du'a & notes — private to each pilgrim", view: '/companion/diary', crud: 'peruser' },
    ],
  },
  {
    title: 'Ritual & landing content',
    sub: 'The guided Umrah ritual text and the public landing copy.',
    entries: [
      { icon: '📖', name: 'Umrah Guide content', editable: 'Ritual step text + translation coverage', href: '/admin/umrah-content', view: '/guide', crud: 'content' },
      { icon: '📝', name: 'Landing & CMS', editable: 'Hero, sections, deals copy', href: '/admin/umrah-content', view: '/', crud: 'content' },
    ],
  },
];

const BADGE: Record<Crud, { label: string; cls: string }> = {
  full: { label: 'Full CRUD', cls: 'bg-success-bg text-success-fg' },
  content: { label: 'Content editor', cls: 'bg-accent-100 text-accent-700' },
  peruser: { label: 'Per-user', cls: 'bg-sand-100 text-sand-500' },
};

export default async function AdminCatalogPage() {
  const user = await requireRole(['ADMIN'], '/admin/catalog');
  const managed = GROUPS.flatMap((g) => g.entries).filter((e) => e.crud !== 'peruser').length;
  return (
    <SitePage user={user}>
      <div className="mx-auto max-w-[1100px] px-[clamp(16px,3vw,32px)] py-[clamp(18px,3.5vw,36px)]">
        <div className="mb-6">
          <div className="mb-1.5 font-mono text-xs text-accent-600">ADMIN · WIZARDS &amp; CONTENT</div>
          <h1 className="font-serif text-[clamp(1.5rem,3vw,1.875rem)] font-semibold tracking-[-0.02em] text-sand-ink">Manage every wizard</h1>
          <p className="mt-1.5 max-w-[60ch] text-[14px] text-sand-500">
            Every pilgrim-facing wizard, guide, directory and tool — and where to manage it.
            <strong className="text-sand-700"> {managed} surfaces</strong> are admin-editable; the day planner and
            personal diary hold each pilgrim&apos;s private data, so there is no shared content to edit.
          </p>
        </div>

        <div className="grid gap-7">
          {GROUPS.map((group) => (
            <section key={group.title}>
              <div className="mb-2.5">
                <h2 className="font-serif text-lg font-semibold text-sand-ink">{group.title}</h2>
                <p className="text-[12.5px] text-sand-500">{group.sub}</p>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {group.entries.map((e) => {
                  const badge = BADGE[e.crud];
                  const inner = (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-sand-100 text-[19px]">{e.icon}</span>
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${badge.cls}`}>{badge.label}</span>
                      </div>
                      <div className="mt-3 text-[14.5px] font-semibold text-sand-ink">{e.name}</div>
                      <div className="mt-0.5 text-[12.5px] leading-snug text-sand-500">{e.editable}</div>
                      <div className="mt-3 flex items-center justify-between border-t border-sand-100 pt-2.5">
                        {e.href ? (
                          <span className="text-[12.5px] font-semibold text-green-800">Manage →</span>
                        ) : (
                          <span className="text-[12px] text-sand-400">No shared content</span>
                        )}
                        {e.view ? (
                          <span className="font-mono text-[11px] text-sand-400">{e.view}</span>
                        ) : null}
                      </div>
                    </>
                  );
                  return e.href ? (
                    <Link
                      key={e.name}
                      href={e.href}
                      className="rounded-2xl border border-sand-200 bg-white p-4 transition-transform duration-fast hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:shadow-focus active:scale-[0.99]"
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div key={e.name} className="rounded-2xl border border-dashed border-sand-200 bg-sand-50/40 p-4">
                      {inner}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </SitePage>
  );
}
