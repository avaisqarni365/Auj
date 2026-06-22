import Link from 'next/link';
import { getCurrentUser } from '../../src/auth/session';
import { SitePage } from '../../src/components/SitePage';
import { ScreenFrame } from '../../src/components/ScreenFrame';
import { DEPART_AIRPORTS, DEPART_REGIONS } from '../../src/depart/airport-content';

// Public — "Departing from your city": the European departure airports, grouped by region,
// each linking to its dynamic per-airport hub.
export default async function FromIndexPage() {
  const user = await getCurrentUser();
  return (
    <SitePage user={user}>
      <div className="py-[clamp(18px,3.5vw,36px)]">
        <ScreenFrame label="DEPARTING FROM YOUR CITY" tag="Europe → Haramain" maxWidth="max-w-[1000px]">
          <p className="mb-5 text-[14.5px] text-sand-500">Direct and connecting routes from across Europe — pick your airport for the walkthrough, easy check-in and flights to Makkah &amp; Madinah.</p>
          <div className="grid gap-6">
            {DEPART_REGIONS.map((region) => (
              <section key={region}>
                <h2 className="mb-2.5 font-mono text-[11px] uppercase tracking-[0.1em] text-accent-600">{region}</h2>
                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                  {DEPART_AIRPORTS.filter((a) => a.region === region).map((a) => (
                    <Link
                      key={a.code}
                      href={`/from/${a.code}`}
                      className="flex items-center justify-between gap-2 rounded-2xl border border-sand-200 bg-white px-4 py-3 transition-shadow duration-fast hover:shadow-lg focus-visible:outline-none focus-visible:shadow-focus"
                    >
                      <span className="min-w-0">
                        <span className="block text-[14.5px] font-semibold text-sand-ink">✈️ {a.city}</span>
                        <span className="font-mono text-[11.5px] text-sand-500">{a.code} · {a.country}</span>
                      </span>
                      <span aria-hidden className="text-green-700">→</span>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </ScreenFrame>
      </div>
    </SitePage>
  );
}
