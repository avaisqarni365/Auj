// Virtual-tour scenes. Lightweight, no 3D dependency: a pannable image + an optional walkthrough
// video per stop, with localized title/subtitle/description (EN/AR/UR/TR/DE). Drop assets in
//   apps/web/public/img/ritual/tour/<id>.jpg     (360°/wide photo)
//   apps/web/public/video/ritual/tour/<id>.mp4   (walkthrough video)
// Until they exist, the photo falls back to a wide Makkah/Madinah shot and the video shows a
// tasteful "coming soon" placeholder.

const BASE = (process.env.NEXT_PUBLIC_IMG_BASE ?? '').replace(/\/$/, '');
const FALLBACK = `${BASE}/img/scenes/makkah-madinah.webp`;

export type L = Record<string, string>;
export interface SceneDef {
  id: string;
  file: string;
  title: L;
  subtitle: L;
  desc: L;
}

const SCENES: SceneDef[] = [
  {
    id: 'miqat', file: 'miqat.jpg',
    title: { en: 'Miqat & Ihram', ar: 'الميقات والإحرام', ur: 'میقات اور احرام', tr: 'Mîkat ve İhram', de: 'Miqat & Ihram' },
    subtitle: { en: 'Where the journey begins', ar: 'حيث تبدأ الرحلة', ur: 'جہاں سفر کا آغاز ہوتا ہے', tr: 'Yolculuğun başladığı yer', de: 'Wo die Reise beginnt' },
    desc: { en: 'The boundary where pilgrims enter the state of Ihram before Umrah.', ar: 'الحد الذي يُحرم منه الحجاج قبل العمرة.', ur: 'وہ حد جہاں سے عمرہ سے پہلے احرام باندھا جاتا ہے۔', tr: 'Hacıların Umre öncesi ihrama girdiği sınır.', de: 'Die Grenze, an der Pilger vor der Umrah den Ihram anlegen.' },
  },
  {
    id: 'haram-entrance', file: 'haram-entrance.jpg',
    title: { en: 'Masjid al-Haram entrance', ar: 'مدخل المسجد الحرام', ur: 'مسجد الحرام کا داخلہ', tr: 'Mescid-i Haram girişi', de: 'Eingang zur Masjid al-Haram' },
    subtitle: { en: 'Arriving at the House of Allah', ar: 'الوصول إلى بيت الله', ur: 'اللہ کے گھر پہنچنا', tr: 'Allah’ın evine varış', de: 'Ankunft am Haus Allahs' },
    desc: { en: 'The gateway into the Sacred Mosque around the Kaaba.', ar: 'البوابة المؤدية إلى المسجد الحرام حول الكعبة.', ur: 'کعبہ کے گرد مسجد الحرام میں داخلے کا دروازہ۔', tr: 'Kâbe’nin çevresindeki Mescid-i Haram’a açılan kapı.', de: 'Das Tor zur Heiligen Moschee rund um die Kaaba.' },
  },
  {
    id: 'kaaba', file: 'kaaba.jpg',
    title: { en: 'The Kaaba & Tawaf', ar: 'الكعبة والطواف', ur: 'کعبہ اور طواف', tr: 'Kâbe ve Tavaf', de: 'Die Kaaba & Tawaf' },
    subtitle: { en: 'Circling the Sacred House', ar: 'الطواف حول البيت الحرام', ur: 'بیت الحرام کا طواف', tr: 'Kutsal Ev’in etrafında dönmek', de: 'Umrundung des heiligen Hauses' },
    desc: { en: 'The Sacred House; pilgrims circle it seven times in Tawaf.', ar: 'البيت الحرام؛ يطوف الحجاج حوله سبعاً.', ur: 'بیت الحرام؛ حاجی اس کا سات بار طواف کرتے ہیں۔', tr: 'Kutsal Ev; hacılar tavafta etrafında yedi kez döner.', de: 'Das heilige Haus; Pilger umrunden es siebenmal im Tawaf.' },
  },
  {
    id: 'maqam-ibrahim', file: 'maqam-ibrahim.jpg',
    title: { en: 'Maqam Ibrahim', ar: 'مقام إبراهيم', ur: 'مقامِ ابراہیم', tr: 'Makam-ı İbrahim', de: 'Maqam Ibrahim' },
    subtitle: { en: 'Where two Rak‘ahs are prayed', ar: 'حيث تُصلى ركعتان', ur: 'جہاں دو رکعت پڑھی جاتی ہیں', tr: 'İki rekât namaz kılınan yer', de: 'Wo zwei Rak‘ah gebetet werden' },
    desc: { en: 'The station of Prophet Ibrahim; two Rak‘ahs are prayed here after Tawaf.', ar: 'مقام النبي إبراهيم؛ تُصلى عنده ركعتان بعد الطواف.', ur: 'مقامِ ابراہیم؛ طواف کے بعد یہاں دو رکعت پڑھی جاتی ہیں۔', tr: 'İbrahim Peygamber’in makamı; tavaftan sonra burada iki rekât kılınır.', de: 'Die Stätte des Propheten Ibrahim; nach dem Tawaf werden hier zwei Rak‘ah gebetet.' },
  },
  {
    id: 'zamzam', file: 'zamzam.jpg',
    title: { en: 'Zamzam', ar: 'زمزم', ur: 'زمزم', tr: 'Zemzem', de: 'Zamzam' },
    subtitle: { en: 'The blessed well', ar: 'البئر المباركة', ur: 'بابرکت کنواں', tr: 'Mübarek kuyu', de: 'Der gesegnete Brunnen' },
    desc: { en: 'The blessed well; pilgrims drink its water with du‘a.', ar: 'البئر المباركة؛ يشرب الحجاج من مائها بالدعاء.', ur: 'بابرکت کنواں؛ حاجی دعا کے ساتھ اس کا پانی پیتے ہیں۔', tr: 'Mübarek kuyu; hacılar suyunu dua ile içer.', de: 'Der gesegnete Brunnen; Pilger trinken sein Wasser mit Bittgebet.' },
  },
  {
    id: 'safa-marwa', file: 'safa-marwa.jpg',
    title: { en: 'Safa & Marwah', ar: 'الصفا والمروة', ur: 'صفا و مروہ', tr: 'Safa ve Merve', de: 'Safa & Marwah' },
    subtitle: { en: 'The walk of Sa‘i', ar: 'مسير السعي', ur: 'سعی کا راستہ', tr: 'Sa‘y yürüyüşü', de: 'Der Gang des Sa‘i' },
    desc: { en: 'The two hills walked between seven times in Sa‘i.', ar: 'التلّان يُسعى بينهما سبعاً في السعي.', ur: 'دو پہاڑیاں جن کے درمیان سعی میں سات بار چلا جاتا ہے۔', tr: 'Sa‘yde aralarında yedi kez yürünen iki tepe.', de: 'Die zwei Hügel, zwischen denen man im Sa‘i siebenmal geht.' },
  },
  {
    id: 'completion', file: 'completion.jpg',
    title: { en: 'Completion', ar: 'إتمام العمرة', ur: 'تکمیل', tr: 'Tamamlanma', de: 'Abschluss' },
    subtitle: { en: 'Umrah complete', ar: 'اكتملت العمرة', ur: 'عمرہ مکمل', tr: 'Umre tamamlandı', de: 'Umrah abgeschlossen' },
    desc: { en: 'After hair-cutting, the rites of Umrah are complete.', ar: 'بعد الحلق أو التقصير تكتمل مناسك العمرة.', ur: 'بال کٹوانے کے بعد عمرہ کے ارکان مکمل ہو جاتے ہیں۔', tr: 'Saç tıraşından sonra Umre menasiki tamamlanır.', de: 'Nach dem Haareschneiden sind die Riten der Umrah vollendet.' },
  },
  {
    id: 'madinah', file: 'madinah.jpg',
    title: { en: 'Madinah (optional)', ar: 'المدينة (اختياري)', ur: 'مدینہ (اختیاری)', tr: 'Medine (isteğe bağlı)', de: 'Madinah (optional)' },
    subtitle: { en: 'Masjid an-Nabawi', ar: 'المسجد النبوي', ur: 'مسجد نبوی', tr: 'Mescid-i Nebevî', de: 'Masjid an-Nabawi' },
    desc: { en: 'The Prophet’s Mosque in Madinah, visited after Umrah.', ar: 'المسجد النبوي في المدينة، يُزار بعد العمرة.', ur: 'مدینہ میں مسجد نبوی، عمرہ کے بعد زیارت کی جاتی ہے۔', tr: 'Medine’deki Mescid-i Nebevî, Umre’den sonra ziyaret edilir.', de: 'Die Prophetenmoschee in Madinah, nach der Umrah besucht.' },
  },
];

/** The bundled seed — used to populate the DB-backed scene store on first run, and as the
 *  client-safe fallback when no DATABASE_URL is configured. */
export const SCENE_SEED: SceneDef[] = SCENES;

const pick = (m: L, lang: string): string => m[lang] ?? m.en ?? '';

export interface TourScene {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  src: string;
  fallbackSrc: string;
  videoSrc: string;
  /** Optional narration audio for this scene + language; ListenButton falls back to TTS if absent. */
  narrationSrc: string;
}

/** Resolve an arbitrary ordered list of scene defs (e.g. DB-backed) into localized TourScenes,
 *  building the image / video / narration src exactly as before. */
export function resolveScenes(defs: SceneDef[], lang: string): TourScene[] {
  return defs.map((s) => ({
    id: s.id,
    title: pick(s.title, lang),
    subtitle: pick(s.subtitle, lang),
    desc: pick(s.desc, lang),
    src: `${BASE}/img/ritual/tour/${s.file}`,
    fallbackSrc: FALLBACK,
    videoSrc: `${BASE}/video/ritual/tour/${s.id}.mp4`,
    narrationSrc: `${BASE}/audio/ritual/tour/${s.id}.${lang}.mp3`,
  }));
}

export function tourScenes(lang: string): TourScene[] {
  return resolveScenes(SCENE_SEED, lang);
}

// Tour chrome strings (selected-language).
const CHROME: Record<string, { subtitle: string; back: string; hint: string; photo: string; video: string; videoSoon: string }> = {
  en: { subtitle: 'A calm walk-through of the holy places.', back: 'Step-by-step guide', hint: 'Drag to look around', photo: '360° view', video: 'Walkthrough', videoSoon: 'Walkthrough video coming soon' },
  ar: { subtitle: 'جولة هادئة في الأماكن المقدسة.', back: 'الدليل خطوة بخطوة', hint: 'اسحب للنظر حولك', photo: 'منظر 360°', video: 'جولة مرئية', videoSoon: 'فيديو الجولة قريباً' },
  ur: { subtitle: 'مقدس مقامات کی پرسکون سیر۔', back: 'مرحلہ وار رہنمائی', hint: 'دیکھنے کے لیے گھمائیں', photo: '360° منظر', video: 'واک تھرو', videoSoon: 'واک تھرو ویڈیو جلد آ رہی ہے' },
  tr: { subtitle: 'Kutsal mekânlarda sakin bir gezinti.', back: 'Adım adım rehber', hint: 'Bakınmak için sürükleyin', photo: '360° görünüm', video: 'Tanıtım', videoSoon: 'Tanıtım videosu yakında' },
  de: { subtitle: 'Ein ruhiger Rundgang durch die heiligen Stätten.', back: 'Schritt-für-Schritt-Anleitung', hint: 'Zum Umsehen ziehen', photo: '360°-Ansicht', video: 'Rundgang', videoSoon: 'Rundgang-Video folgt bald' },
};
export const tourChrome = (lang: string): (typeof CHROME)['en'] => CHROME[lang] ?? CHROME.en!;
