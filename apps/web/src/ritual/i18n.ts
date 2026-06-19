// Umrah Guide localization. Static (no AI). UI chrome + step titles are drafted in 8 languages and
// flagged for review (assumptions A7); longer step bodies stay English with an honest note until
// reviewed translations are provided. The dua *meanings* already live per-language in ritual-content.
import type { RitualStep } from './ritual-content';

export interface Locale {
  code: string;
  label: string; // shown in the switcher, in its own script
  rtl: boolean;
}

export const RITUAL_LOCALES: Locale[] = [
  { code: 'en', label: 'English', rtl: false },
  { code: 'ar', label: 'العربية', rtl: true },
  { code: 'ur', label: 'اردو', rtl: true },
  { code: 'tr', label: 'Türkçe', rtl: false },
  { code: 'de', label: 'Deutsch', rtl: false },
];

export function isRtlLang(code: string): boolean {
  return RITUAL_LOCALES.find((l) => l.code === code)?.rtl ?? false;
}

interface UIStrings {
  step: string;
  elapsed: string;
  toComplete: string;
  min: string;
  reciteOngoing: string;
  pause: string;
  resume: string;
  back: string;
  virtualTour: string;
  showMeaning: string;
  myDuas: string;
  reflections: string;
  record: string;
  stop: string;
  save: string;
  progressSaved: string;
  langNote: string;
  disclaimer: string;
}

const EN: UIStrings = {
  step: 'Step',
  elapsed: 'elapsed',
  toComplete: 'to complete',
  min: 'min',
  reciteOngoing: 'Recite continuously',
  pause: 'Pause',
  resume: 'Resume',
  back: 'Back',
  virtualTour: 'Virtual tour',
  showMeaning: 'Show meaning in other languages',
  myDuas: 'My personal du‘as',
  reflections: 'Your reflections & practice',
  record: 'Record',
  stop: 'Stop',
  save: 'Save',
  progressSaved: 'Your progress is saved on this device.',
  langNote: 'Detailed instructions are shown in English while other languages are being reviewed.',
  disclaimer: 'Guidance for convenience only — follow your group’s scholar and official sources.',
};

// Drafts — unreviewed (A7). English keys fall through for anything missing.
const UI: Record<string, Partial<UIStrings>> = {
  en: EN,
  ar: {
    step: 'خطوة',
    elapsed: 'منقضٍ',
    toComplete: 'للإتمام',
    min: 'دقيقة',
    reciteOngoing: 'استمر في التلبية',
    pause: 'إيقاف',
    resume: 'استئناف',
    back: 'رجوع',
    virtualTour: 'جولة افتراضية',
    showMeaning: 'إظهار المعنى بلغات أخرى',
    myDuas: 'أدعيتي الشخصية',
    reflections: 'تأملاتك وتدريبك',
    record: 'تسجيل',
    stop: 'إيقاف',
    save: 'حفظ',
    progressSaved: 'تم حفظ تقدمك على هذا الجهاز.',
    langNote: 'تظهر التعليمات التفصيلية بالإنجليزية ريثما تُراجَع الترجمات.',
    disclaimer: 'إرشاد للتيسير فقط — اتبع عالم مجموعتك والمصادر الرسمية.',
  },
  ur: {
    step: 'مرحلہ',
    elapsed: 'گزر گیا',
    toComplete: 'مکمل ہونے میں',
    min: 'منٹ',
    reciteOngoing: 'مسلسل تلبیہ پڑھیں',
    pause: 'روکیں',
    resume: 'جاری رکھیں',
    back: 'واپس',
    virtualTour: 'ورچوئل ٹور',
    showMeaning: 'دوسری زبانوں میں معنی دکھائیں',
    myDuas: 'میری ذاتی دعائیں',
    reflections: 'آپ کے تاثرات اور مشق',
    record: 'ریکارڈ',
    stop: 'روکیں',
    save: 'محفوظ کریں',
    progressSaved: 'آپ کی پیش رفت اس ڈیوائس پر محفوظ ہے۔',
    langNote: 'تفصیلی ہدایات انگریزی میں دکھائی جا رہی ہیں جب تک تراجم کا جائزہ مکمل نہ ہو۔',
    disclaimer: 'صرف آسانی کے لیے رہنمائی — اپنے گروپ کے عالم اور سرکاری ذرائع کی پیروی کریں۔',
  },
  tr: {
    step: 'Adım',
    elapsed: 'geçti',
    toComplete: 'tamamlamak için',
    min: 'dk',
    reciteOngoing: 'Sürekli telbiye getirin',
    pause: 'Duraklat',
    resume: 'Devam et',
    back: 'Geri',
    virtualTour: 'Sanal tur',
    showMeaning: 'Anlamı diğer dillerde göster',
    myDuas: 'Kişisel dualarım',
    reflections: 'Düşünceleriniz ve pratiğiniz',
    record: 'Kaydet',
    stop: 'Durdur',
    save: 'Kaydet',
    progressSaved: 'İlerlemeniz bu cihazda kaydedildi.',
    langNote: 'Çeviriler incelenirken ayrıntılı talimatlar İngilizce gösterilir.',
    disclaimer: 'Yalnızca kolaylık için rehberlik — grubunuzun âlimine ve resmî kaynaklara uyun.',
  },
  de: {
    step: 'Schritt',
    elapsed: 'vergangen',
    toComplete: 'bis fertig',
    min: 'Min',
    reciteOngoing: 'Sprich fortlaufend die Talbiyah',
    pause: 'Pause',
    resume: 'Fortsetzen',
    back: 'Zurück',
    virtualTour: 'Virtuelle Tour',
    showMeaning: 'Bedeutung in anderen Sprachen zeigen',
    myDuas: 'Meine persönlichen Bittgebete',
    reflections: 'Deine Reflexionen & Übung',
    record: 'Aufnehmen',
    stop: 'Stopp',
    save: 'Speichern',
    progressSaved: 'Dein Fortschritt ist auf diesem Gerät gespeichert.',
    langNote: 'Detaillierte Anweisungen erscheinen auf Englisch, bis die Übersetzungen geprüft sind.',
    disclaimer: 'Nur als Hilfe gedacht — folge dem Gelehrten deiner Gruppe und offiziellen Quellen.',
  },
};

export function ui(lang: string): UIStrings {
  return { ...EN, ...(UI[lang] ?? {}) };
}

// Step titles per language (proper terms shared across languages; subtitles/bodies stay EN for now).
const TITLES: Record<string, Partial<Record<string, string>>> = {
  niyyah: { ar: 'النية', ur: 'نیّت', fr: 'Niyyah (Intention)', tr: 'Niyet (Niyyah)', id: 'Niat (Niyyah)', bn: 'নিয়ত', de: 'Niyyah (Absicht)' },
  ihram: { ar: 'الإحرام', ur: 'احرام', fr: 'Ihram', tr: 'İhram', id: 'Ihram', bn: 'ইহরাম', de: 'Ihram' },
  'niyyah-miqat': { ar: 'النية عند الميقات', ur: 'میقات پر نیّت', fr: 'Niyyah au Miqat', tr: 'Mikat’ta Niyet', id: 'Niat di Miqat', bn: 'মীকাতে নিয়ত', de: 'Niyyah am Miqat' },
  talbiyah: { ar: 'التلبية', ur: 'تلبیہ', fr: 'Talbiyah', tr: 'Telbiye', id: 'Talbiyah', bn: 'তালবিয়া', de: 'Talbiyah' },
  'enter-haram': { ar: 'دخول المسجد الحرام', ur: 'مسجد الحرام میں داخلہ', fr: 'Entrer à Masjid al-Haram', tr: 'Mescid-i Haram’a giriş', id: 'Masuk Masjidil Haram', bn: 'মসজিদুল হারামে প্রবেশ', de: 'Masjid al-Haram betreten' },
  'tawaf-start': { ar: 'بدء الطواف', ur: 'طواف کا آغاز', fr: 'Commencer le Tawaf', tr: 'Tavafa başla', id: 'Mulai Tawaf', bn: 'তাওয়াফ শুরু', de: 'Tawaf beginnen' },
  'tawaf-complete': { ar: 'إكمال سبعة أشواط', ur: 'سات چکر مکمل کریں', fr: 'Terminer les 7 tours', tr: '7 turu tamamla', id: 'Selesaikan 7 putaran', bn: '৭ চক্কর সম্পন্ন', de: '7 Runden abschließen' },
  'two-rakahs': { ar: 'صلاة ركعتين', ur: 'دو رکعت نماز', fr: 'Prier 2 Rak‘ahs', tr: '2 rekat namaz', id: 'Salat 2 rakaat', bn: '২ রাকাত নামাজ', de: '2 Rak‘ah beten' },
  'sai-start': { ar: 'السعي بين الصفا والمروة', ur: 'صفا و مروہ کے درمیان سعی', fr: 'Sa‘i entre Safa et Marwah', tr: 'Safa ile Merve arası Sa‘y', id: 'Sa‘i antara Safa dan Marwah', bn: 'সাফা-মারওয়ার মাঝে সাঈ', de: 'Sa‘i zwischen Safa und Marwah' },
  'sai-complete': { ar: 'إكمال السعي', ur: 'سعی مکمل کریں', fr: 'Terminer le Sa‘i', tr: 'Sa‘yi tamamla', id: 'Selesaikan Sa‘i', bn: 'সাঈ সম্পন্ন', de: 'Sa‘i abschließen' },
  halq: { ar: 'الحلق أو التقصير', ur: 'بال منڈوانا یا کٹوانا', fr: 'Raser ou couper les cheveux', tr: 'Saç tıraşı veya kısaltma', id: 'Cukur atau potong rambut', bn: 'চুল কাটা বা মুণ্ডন', de: 'Haare schneiden oder rasieren' },
  'umrah-complete': { ar: 'اكتملت العمرة', ur: 'عمرہ مکمل', fr: 'Omra accomplie', tr: 'Umre tamamlandı', id: 'Umrah selesai', bn: 'উমরাহ সম্পন্ন', de: 'Umrah abgeschlossen' },
  'optional-acts': { ar: 'الأعمال المستحبة', ur: 'مستحب اعمال', fr: 'Actes recommandés', tr: 'Müstehap ameller', id: 'Amalan sunnah', bn: 'ঐচ্ছিক আমল', de: 'Empfohlene Taten' },
  'final-dua': { ar: 'الدعاء الأخير والمغادرة', ur: 'آخری دعا اور روانگی', fr: 'Du‘a finale et départ', tr: 'Son dua ve ayrılış', id: 'Doa terakhir & berangkat', bn: 'শেষ দোয়া ও প্রস্থান', de: 'Letztes Bittgebet & Abreise' },
  'visit-madinah': { ar: 'زيارة المدينة', ur: 'مدینہ کی زیارت', fr: 'Visiter Médine', tr: 'Medine ziyareti', id: 'Mengunjungi Madinah', bn: 'মদিনা ভ্রমণ', de: 'Madinah besuchen' },
};

export function localizedTitle(step: RitualStep, lang: string): string {
  if (lang === 'en') return step.title;
  return TITLES[step.key]?.[lang] ?? step.title;
}
