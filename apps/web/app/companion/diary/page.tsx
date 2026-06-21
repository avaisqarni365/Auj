import { getCurrentUser } from '../../../src/auth/session';
import { SitePage } from '../../../src/components/SitePage';
import { DiaryJournal } from '../../../src/ritual/DiaryJournal';
import { getDiaryStore } from '../../../src/ritual/diary-store';

// Personal diary — Quran/nafl/dua/reflection journal, one entry per pilgrim per day (DB-backed).
// Public + useful to anyone; persists to the account when signed in.

// Today's date in Makkah/Madinah time (the journal follows the pilgrim's location).
function todayInKsa(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Riyadh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

export default async function DiaryPage() {
  const user = await getCurrentUser();
  const date = todayInKsa();
  const initialEntry = user ? ((await (await getDiaryStore()).get(user.id, date)) ?? null) : null;
  return (
    <SitePage user={user}>
      <DiaryJournal signedIn={!!user} date={date} initialEntry={initialEntry} />
    </SitePage>
  );
}
