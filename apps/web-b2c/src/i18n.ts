export const LOCALES = ['en', 'lt', 'ur', 'ar'] as const;
export type Locale = (typeof LOCALES)[number];

/** Arabic and Urdu are right-to-left. */
export function dir(locale: Locale): 'ltr' | 'rtl' {
  return locale === 'ar' || locale === 'ur' ? 'rtl' : 'ltr';
}

export type MessageKey =
  | 'brand'
  | 'search'
  | 'results'
  | 'build_package'
  | 'pilgrims'
  | 'continue'
  | 'checkout'
  | 'pay'
  | 'my_booking'
  | 'visa_route'
  | 'visa_evisa'
  | 'visa_agent'
  | 'per_pilgrim'
  | 'total';

type Dict = Record<MessageKey, string>;

const en: Dict = {
  brand: 'AUJ',
  search: 'Search packages',
  results: 'Results',
  build_package: 'Build package',
  pilgrims: 'Pilgrims',
  continue: 'Continue',
  checkout: 'Checkout',
  pay: 'Pay securely',
  my_booking: 'My booking',
  visa_route: 'Visa route',
  visa_evisa: 'e-Visa',
  visa_agent: 'Agent channel',
  per_pilgrim: 'per pilgrim',
  total: 'Total',
};

const lt: Dict = {
  brand: 'AUJ',
  search: 'Ieškoti paketų',
  results: 'Rezultatai',
  build_package: 'Sudaryti paketą',
  pilgrims: 'Piligrimai',
  continue: 'Tęsti',
  checkout: 'Apmokėjimas',
  pay: 'Mokėti saugiai',
  my_booking: 'Mano užsakymas',
  visa_route: 'Vizos kelias',
  visa_evisa: 'e. viza',
  visa_agent: 'Agento kanalas',
  per_pilgrim: 'vienam piligrimui',
  total: 'Iš viso',
};

const ur: Dict = {
  brand: 'اوج',
  search: 'پیکجز تلاش کریں',
  results: 'نتائج',
  build_package: 'پیکیج بنائیں',
  pilgrims: 'زائرین',
  continue: 'جاری رکھیں',
  checkout: 'ادائیگی',
  pay: 'محفوظ ادائیگی',
  my_booking: 'میری بکنگ',
  visa_route: 'ویزا کا راستہ',
  visa_evisa: 'ای ویزا',
  visa_agent: 'ایجنٹ چینل',
  per_pilgrim: 'فی زائر',
  total: 'کل',
};

const ar: Dict = {
  brand: 'أوج',
  search: 'ابحث عن الباقات',
  results: 'النتائج',
  build_package: 'إنشاء الباقة',
  pilgrims: 'المعتمرون',
  continue: 'متابعة',
  checkout: 'الدفع',
  pay: 'ادفع بأمان',
  my_booking: 'حجزي',
  visa_route: 'مسار التأشيرة',
  visa_evisa: 'تأشيرة إلكترونية',
  visa_agent: 'قناة الوكيل',
  per_pilgrim: 'لكل معتمر',
  total: 'الإجمالي',
};

const DICTS: Record<Locale, Dict> = { en, lt, ur, ar };

export function t(locale: Locale, key: MessageKey): string {
  return DICTS[locale][key] ?? en[key];
}
