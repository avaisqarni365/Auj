// Live prayer times for Makkah & Madinah from the free AlAdhan API using the
// Umm al-Qura calculation method (method=4, the official Saudi method). Fetched server-side
// and cached 1h. Returns null on any failure so the UI degrades gracefully (never hard-codes
// times). Iqamah/jamaat is ~a few minutes after the adhan — confirm at the mosque.

export type City = 'Makkah' | 'Madinah';

export interface PrayerDay {
  city: City;
  date: string; // readable Gregorian
  hijri: string; // e.g. "12 Dhū al-Ḥijjah 1447"
  timings: { Fajr: string; Sunrise: string; Dhuhr: string; Asr: string; Maghrib: string; Isha: string };
}

const clean = (t: unknown): string => (typeof t === 'string' ? t.replace(/\s*\(.*\)\s*/, '').trim() : '');

export async function fetchPrayerTimes(city: City): Promise<PrayerDay | null> {
  try {
    const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=Saudi%20Arabia&method=4`;
    // `next.revalidate` is Next's fetch extension (caches 1h); cast since the base lib type omits it.
    const res = await fetch(url, { next: { revalidate: 3600 } } as RequestInit);
    if (!res.ok) return null;
    const j = (await res.json()) as {
      data?: { timings?: Record<string, string>; date?: { readable?: string; hijri?: { day?: string; month?: { en?: string }; year?: string } } };
    };
    const t = j.data?.timings;
    const d = j.data?.date;
    if (!t) return null;
    const hijri = d?.hijri ? `${d.hijri.day ?? ''} ${d.hijri.month?.en ?? ''} ${d.hijri.year ?? ''}`.trim() : '';
    return {
      city,
      date: d?.readable ?? '',
      hijri,
      timings: {
        Fajr: clean(t.Fajr),
        Sunrise: clean(t.Sunrise),
        Dhuhr: clean(t.Dhuhr),
        Asr: clean(t.Asr),
        Maghrib: clean(t.Maghrib),
        Isha: clean(t.Isha),
      },
    };
  } catch {
    return null;
  }
}
