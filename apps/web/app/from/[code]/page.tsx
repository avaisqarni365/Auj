import { notFound } from 'next/navigation';
import { getCurrentUser } from '../../../src/auth/session';
import { SitePage } from '../../../src/components/SitePage';
import { DepartureHub } from '../../../src/depart/DepartureHub';
import { DEPART_CODES, departAirport } from '../../../src/depart/airport-content';

// Public — the dynamic per-airport departure hub: walkthrough, easy check-in, and live-if-API
// flights to/from Makkah & Madinah from this city.
export function generateStaticParams() {
  return DEPART_CODES.map((code) => ({ code }));
}

export default async function DeparturePage({ params }: { params: { code: string } }) {
  const airport = departAirport(params.code.toUpperCase());
  if (!airport) notFound();
  const user = await getCurrentUser();
  return (
    <SitePage user={user}>
      <div className="py-[clamp(18px,3.5vw,36px)]">
        <DepartureHub airport={airport} />
      </div>
    </SitePage>
  );
}
