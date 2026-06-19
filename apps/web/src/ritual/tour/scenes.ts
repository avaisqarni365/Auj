// Virtual-tour scenes. Lightweight, no 3D dependency: a pannable wide/equirectangular image per
// stop. Titles/subtitles are localized (EN/AR/UR/TR/DE). Drop 360° equirectangular photos in
// apps/web/public/img/ritual/tour/<id>.jpg; until they exist each scene falls back to a real wide
// Makkah/Madinah photo so the viewer is never empty.

const BASE = (process.env.NEXT_PUBLIC_IMG_BASE ?? '').replace(/\/$/, '');
const FALLBACK = `${BASE}/img/scenes/makkah-madinah.webp`;

type L = Record<string, string>;
interface SceneDef {
  id: string;
  file: string;
  title: L;
  subtitle: L;
}

const SCENES: SceneDef[] = [
  {
    id: 'miqat', file: 'miqat.jpg',
    title: { en: 'Miqat & Ihram', ar: 'الميقات والإحرام', ur: 'میقات اور احرام', tr: 'Mîkat ve İhram', de: 'Miqat & Ihram' },
    subtitle: { en: 'Where the journey begins', ar: 'حيث تبدأ الرحلة', ur: 'جہاں سفر کا آغاز ہوتا ہے', tr: 'Yolculuğun başladığı yer', de: 'Wo die Reise beginnt' },
  },
  {
    id: 'haram-entrance', file: 'haram-entrance.jpg',
    title: { en: 'Masjid al-Haram entrance', ar: 'مدخل المسجد الحرام', ur: 'مسجد الحرام کا داخلہ', tr: 'Mescid-i Haram girişi', de: 'Eingang zur Masjid al-Haram' },
    subtitle: { en: 'Arriving at the House of Allah', ar: 'الوصول إلى بيت الله', ur: 'اللہ کے گھر پہنچنا', tr: 'Allah’ın evine varış', de: 'Ankunft am Haus Allahs' },
  },
  {
    id: 'kaaba', file: 'kaaba.jpg',
    title: { en: 'The Kaaba & Tawaf', ar: 'الكعبة والطواف', ur: 'کعبہ اور طواف', tr: 'Kâbe ve Tavaf', de: 'Die Kaaba & Tawaf' },
    subtitle: { en: 'Circling the Sacred House', ar: 'الطواف حول البيت الحرام', ur: 'بیت الحرام کا طواف', tr: 'Kutsal Ev’in etrafında dönmek', de: 'Umrundung des heiligen Hauses' },
  },
  {
    id: 'maqam-ibrahim', file: 'maqam-ibrahim.jpg',
    title: { en: 'Maqam Ibrahim', ar: 'مقام إبراهيم', ur: 'مقامِ ابراہیم', tr: 'Makam-ı İbrahim', de: 'Maqam Ibrahim' },
    subtitle: { en: 'Where two Rak‘ahs are prayed', ar: 'حيث تُصلى ركعتان', ur: 'جہاں دو رکعت پڑھی جاتی ہیں', tr: 'İki rekât namaz kılınan yer', de: 'Wo zwei Rak‘ah gebetet werden' },
  },
  {
    id: 'zamzam', file: 'zamzam.jpg',
    title: { en: 'Zamzam', ar: 'زمزم', ur: 'زمزم', tr: 'Zemzem', de: 'Zamzam' },
    subtitle: { en: 'The blessed well', ar: 'البئر المباركة', ur: 'بابرکت کنواں', tr: 'Mübarek kuyu', de: 'Der gesegnete Brunnen' },
  },
  {
    id: 'safa-marwa', file: 'safa-marwa.jpg',
    title: { en: 'Safa & Marwah', ar: 'الصفا والمروة', ur: 'صفا و مروہ', tr: 'Safa ve Merve', de: 'Safa & Marwah' },
    subtitle: { en: 'The walk of Sa‘i', ar: 'مسير السعي', ur: 'سعی کا راستہ', tr: 'Sa‘y yürüyüşü', de: 'Der Gang des Sa‘i' },
  },
  {
    id: 'completion', file: 'completion.jpg',
    title: { en: 'Completion', ar: 'إتمام العمرة', ur: 'تکمیل', tr: 'Tamamlanma', de: 'Abschluss' },
    subtitle: { en: 'Umrah complete', ar: 'اكتملت العمرة', ur: 'عمرہ مکمل', tr: 'Umre tamamlandı', de: 'Umrah abgeschlossen' },
  },
  {
    id: 'madinah', file: 'madinah.jpg',
    title: { en: 'Madinah (optional)', ar: 'المدينة (اختياري)', ur: 'مدینہ (اختیاری)', tr: 'Medine (isteğe bağlı)', de: 'Madinah (optional)' },
    subtitle: { en: 'Masjid an-Nabawi', ar: 'المسجد النبوي', ur: 'مسجد نبوی', tr: 'Mescid-i Nebevî', de: 'Masjid an-Nabawi' },
  },
];

const pick = (m: L, lang: string): string => m[lang] ?? m.en ?? '';

export interface TourScene {
  id: string;
  title: string;
  subtitle: string;
  src: string;
  fallbackSrc: string;
}

export function tourScenes(lang: string): TourScene[] {
  return SCENES.map((s) => ({
    id: s.id,
    title: pick(s.title, lang),
    subtitle: pick(s.subtitle, lang),
    src: `${BASE}/img/ritual/tour/${s.file}`,
    fallbackSrc: FALLBACK,
  }));
}

// Tour chrome strings (selected-language).
const CHROME: Record<string, { subtitle: string; back: string; hint: string }> = {
  en: { subtitle: 'A calm walk-through of the holy places.', back: 'Step-by-step guide', hint: 'Drag to look around' },
  ar: { subtitle: 'جولة هادئة في الأماكن المقدسة.', back: 'الدليل خطوة بخطوة', hint: 'اسحب للنظر حولك' },
  ur: { subtitle: 'مقدس مقامات کی پرسکون سیر۔', back: 'مرحلہ وار رہنمائی', hint: 'دیکھنے کے لیے گھمائیں' },
  tr: { subtitle: 'Kutsal mekânlarda sakin bir gezinti.', back: 'Adım adım rehber', hint: 'Bakınmak için sürükleyin' },
  de: { subtitle: 'Ein ruhiger Rundgang durch die heiligen Stätten.', back: 'Schritt-für-Schritt-Anleitung', hint: 'Zum Umsehen ziehen' },
};
export const tourChrome = (lang: string): { subtitle: string; back: string; hint: string } => CHROME[lang] ?? CHROME.en!;
