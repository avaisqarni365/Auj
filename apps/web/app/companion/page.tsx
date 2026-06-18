import { getCurrentUser } from '../../src/auth/session';
import { SitePage } from '../../src/components/SitePage';
import { Companion } from '../../src/companion/Companion';
import { fetchPrayerTimes } from '../../src/companion/prayer-times';

// Pilgrim companion — live prayer times (Makkah & Madinah), day plan, safety/emergency,
// getting around, and tips. Public + useful to anyone; also linked from the account.
export default async function CompanionPage() {
  const [user, makkah, madinah] = await Promise.all([
    getCurrentUser(),
    fetchPrayerTimes('Makkah'),
    fetchPrayerTimes('Madinah'),
  ]);
  return (
    <SitePage user={user}>
      <Companion makkah={makkah} madinah={madinah} />
    </SitePage>
  );
}
