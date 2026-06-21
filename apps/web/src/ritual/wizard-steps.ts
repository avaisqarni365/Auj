// Step-video wizard seed content (migration 11), transcribed from the prototypes.
import type { WizardDef, WizardSlug } from './wizard-steps-types';

export const WIZARDS: Record<WizardSlug, WizardDef> = {
  airport: {
    slug: 'airport',
    title: 'Airport wizard',
    subtitle: 'Vilnius → Jeddah / Madinah',
    icon: '✈️',
    steps: [
      {
        short: 'Check-in',
        label: 'DEPARTURE · CHECK-IN',
        text: {
          en: { t: 'Check-in & bag drop', b: 'Arrive about 3 hours early at Vilnius. Drop your checked bags, collect boarding passes, and keep your passport and Ihram bag in hand.' },
          ur: { t: 'چیک اِن اور بیگ ڈراپ', b: 'ولنیئس ایئرپورٹ پر تقریباً 3 گھنٹے پہلے پہنچیں۔ سامان جمع کرائیں، بورڈنگ پاس لیں اور پاسپورٹ و احرام بیگ ساتھ رکھیں۔' },
          ar: { t: 'تسجيل الوصول وتسليم الأمتعة', b: 'احضر إلى مطار فيلنيوس قبل نحو ٣ ساعات. سلّم أمتعتك واستلم بطاقات الصعود واحتفظ بجواز السفر وحقيبة الإحرام معك.' },
          de: { t: 'Check-in & Gepäckabgabe', b: 'Seien Sie etwa 3 Stunden früher in Vilnius. Geben Sie Ihr Gepäck ab, holen Sie die Bordkarten und behalten Sie Pass und Ihram-Tasche bei sich.' },
        },
        items: ['Passport & visa', 'Booking reference', 'Bags weighed', 'Ihram bag in hand'],
        tip: 'Tip: weigh your bag at home — usually 23 kg checked, 7 kg cabin.',
      },
      {
        short: 'Security',
        label: 'SECURITY · PASSPORT',
        text: {
          en: { t: 'Security & passport control', b: 'Pass security and exit immigration. Liquids stay under 100 ml; place phones, belts and coins in the tray.' },
          ur: { t: 'سیکیورٹی اور پاسپورٹ کنٹرول', b: 'سیکیورٹی اور امیگریشن سے گزریں۔ مائعات 100 ملی لیٹر سے کم رکھیں؛ فون، بیلٹ اور سکے ٹرے میں رکھیں۔' },
          ar: { t: 'التفتيش الأمني وجوازات السفر', b: 'اجتز التفتيش الأمني والجوازات. اجعل السوائل أقل من ١٠٠ مل، وضع الهاتف والحزام والنقود في الصينية.' },
          de: { t: 'Sicherheit & Passkontrolle', b: 'Passieren Sie Sicherheit und Ausreise. Flüssigkeiten unter 100 ml; Handy, Gürtel und Münzen ins Fach.' },
        },
        items: ['Boarding pass', 'Liquids under 100 ml', 'Electronics out', 'Belt & coins in tray'],
        tip: 'Tip: enter Ihram before or at the Miqat — ask your AUJ guide when.',
      },
      {
        short: 'Boarding',
        label: 'BOARDING',
        text: {
          en: { t: 'Boarding the flight', b: 'Board by zone when your group is called. Find your seat, stow the cabin bag overhead, and settle in calmly.' },
          ur: { t: 'فلائٹ میں سوار ہونا', b: 'اپنے زون کی باری پر سوار ہوں۔ نشست تلاش کریں، کیبن بیگ اوپر رکھیں اور سکون سے بیٹھ جائیں۔' },
          ar: { t: 'الصعود إلى الطائرة', b: 'اصعد حسب المجموعة عند النداء. اعثر على مقعدك وضع حقيبة اليد في الأعلى واستقر بهدوء.' },
          de: { t: 'Einsteigen', b: 'Steigen Sie nach Zone ein, wenn Ihre Gruppe aufgerufen wird. Suchen Sie Ihren Sitz, verstauen Sie das Handgepäck und kommen Sie an.' },
        },
        items: ['Boarding pass / zone', 'Seat number', 'Stow cabin bag', 'Calm & seated'],
        tip: 'Tip: keep your documents in the seat pocket — you will need them on arrival.',
      },
      {
        short: 'In-flight',
        label: 'IN-FLIGHT · TO KSA',
        text: {
          en: { t: 'Flight to Jeddah / Madinah', b: 'Rest and drink water. The crew hands out arrival cards — fill them in before landing and set your watch to KSA time.' },
          ur: { t: 'جدہ / مدینہ کی پرواز', b: 'آرام کریں اور پانی پیتے رہیں۔ عملہ آمد کارڈ دے گا — لینڈنگ سے پہلے بھر لیں اور گھڑی سعودی وقت پر کر لیں۔' },
          ar: { t: 'الرحلة إلى جدة / المدينة', b: 'استرح واشرب الماء. سيوزّع الطاقم بطاقات الوصول — املأها قبل الهبوط واضبط ساعتك على توقيت السعودية.' },
          de: { t: 'Flug nach Jeddah / Madinah', b: 'Ruhen und trinken Sie. Die Crew verteilt Ankunftskarten — füllen Sie sie vor der Landung aus und stellen Sie die Uhr auf KSA-Zeit.' },
        },
        items: ['Arrival card filled', 'Hydrate', 'Watch on KSA time', 'Rest'],
        tip: 'Tip: KSA time is UTC+3 — adjust your watch and phone on board.',
      },
      {
        short: 'Immigration',
        label: 'ARRIVAL · IMMIGRATION',
        text: {
          en: { t: 'Immigration & biometrics', b: 'At Jeddah or Madinah, follow the “Hajj / Umrah” signs. Give your fingerprints and a photo at the counter.' },
          ur: { t: 'امیگریشن اور بایومیٹرکس', b: 'جدہ یا مدینہ میں ’حج/عمرہ‘ کے نشانات پر چلیں۔ کاؤنٹر پر فنگرپرنٹ اور تصویر دیں۔' },
          ar: { t: 'الجوازات والبصمات', b: 'في جدة أو المدينة، اتبع لافتات «الحج/العمرة». قدّم بصماتك وصورتك عند المنفذ.' },
          de: { t: 'Einreise & Biometrie', b: 'In Jeddah oder Madinah den „Hadsch/Umrah“-Schildern folgen. Geben Sie Fingerabdrücke und ein Foto am Schalter ab.' },
        },
        items: ['Hajj / Umrah signs', 'Fingerprints', 'Photo at counter', 'BRN ready'],
        tip: 'Tip: have your booking reference (BRN) ready on your phone.',
      },
      {
        short: 'Baggage',
        label: 'BAGGAGE · CUSTOMS',
        text: {
          en: { t: 'Baggage claim & customs', b: 'Collect your checked bags from the belt for your flight number, then walk through the green customs channel.' },
          ur: { t: 'سامان اور کسٹمز', b: 'اپنی فلائٹ نمبر والی بیلٹ سے سامان لیں، پھر سبز کسٹمز چینل سے گزریں۔' },
          ar: { t: 'استلام الأمتعة والجمارك', b: 'استلم أمتعتك من السير الخاص برقم رحلتك، ثم اعبر من ممر الجمارك الأخضر.' },
          de: { t: 'Gepäck & Zoll', b: 'Holen Sie Ihr Gepäck vom Band Ihrer Flugnummer und gehen Sie durch den grünen Zollkanal.' },
        },
        items: ['Correct flight belt', 'Free trolley', 'All bags collected', 'Green customs channel'],
        tip: 'Tip: trolleys are free — keep small change handy for a porter.',
      },
      {
        short: 'Transfer',
        label: 'TRANSFER · TO HOTEL',
        text: {
          en: { t: 'Meet, SIM & transfer', b: 'Find your AUJ representative at the meeting point. Collect your local SIM and board the transfer to your hotel.' },
          ur: { t: 'استقبال، سم اور ٹرانسفر', b: 'ملاقات کے مقام پر AUJ نمائندے سے ملیں۔ لوکل سم لیں اور ہوٹل کی ٹرانسفر میں بیٹھ جائیں۔' },
          ar: { t: 'الاستقبال والشريحة والتوصيل', b: 'قابل مندوب AUJ عند نقطة اللقاء. استلم شريحتك المحلية واركب وسيلة النقل إلى فندقك.' },
          de: { t: 'Empfang, SIM & Transfer', b: 'Treffen Sie Ihren AUJ-Vertreter am Treffpunkt. Holen Sie Ihre lokale SIM und fahren Sie zum Hotel.' },
        },
        items: ['Find AUJ rep', 'Collect local SIM', 'Board transfer', 'Hotel address ready'],
        tip: 'Tip: your driver holds an AUJ sign with your booking name.',
      },
    ],
  },
  luggage: {
    slug: 'luggage',
    title: 'Luggage & customs',
    subtitle: 'Check-in → check-out · Saudi rules',
    icon: '🧳',
    steps: [
      {
        short: 'Baggage',
        label: 'BEFORE YOU PACK · BAGGAGE',
        text: {
          en: { t: 'Baggage & weight limits', b: 'Most carriers allow 2 × 23 kg checked and 1 × 7 kg cabin — confirm on your ticket. Pack light; you will carry bags through crowds.' },
          ur: { t: 'سامان اور وزن کی حد', b: 'زیادہ تر ایئرلائنز 2 × 23 کلو چیکڈ اور 7 کلو کیبن کی اجازت دیتی ہیں — ٹکٹ پر تصدیق کریں۔' },
          ar: { t: 'الأمتعة وحدود الوزن', b: 'تسمح معظم شركات الطيران بـ ٢ × ٢٣ كجم مسجّلة و ٧ كجم للمقصورة — تحقّق من تذكرتك، وخفّف أمتعتك.' },
          de: { t: 'Gepäck & Gewichtsgrenzen', b: 'Die meisten Airlines erlauben 2 × 23 kg aufgegeben und 7 kg Kabine — prüfen Sie Ihr Ticket. Packen Sie leicht.' },
        },
        items: [
          { label: '2 × 23 kg checked', status: 'ok' },
          { label: '7 kg cabin bag', status: 'ok' },
          { label: 'Overweight bags', status: 'permit' },
          { label: 'Extra suitcase', status: 'permit' },
        ],
        tip: 'Tip: leave room for Zamzam and gifts on the way home.',
      },
      {
        short: 'Ihram',
        label: 'PACK · IHRAM & CLOTHING',
        text: {
          en: { t: 'Ihram & clothing', b: 'Men: two white unstitched Ihram sheets. Women: modest, loose clothing. Pack a spare set and comfortable sandals.' },
          ur: { t: 'احرام اور لباس', b: 'مرد: دو سفید غیر سلی احرام کی چادریں۔ خواتین: باحیا ڈھیلا لباس۔ ایک اضافی جوڑا ساتھ رکھیں۔' },
          ar: { t: 'الإحرام والملابس', b: 'للرجال: قطعتا إحرام بيضاوان غير مخيطتين. للنساء: ملابس محتشمة وفضفاضة. خذ طقماً إضافياً ونعلاً مريحاً.' },
          de: { t: 'Ihram & Kleidung', b: 'Männer: zwei weiße, ungenähte Ihram-Tücher. Frauen: bescheidene, weite Kleidung. Packen Sie ein Ersatzset und bequeme Sandalen.' },
        },
        items: [
          { label: '2 Ihram sheets (men)', status: 'ok' },
          { label: 'Modest dress (women)', status: 'ok' },
          { label: 'Belt & sandals', status: 'ok' },
          { label: 'Stitched dress in Ihram', status: 'prohibited' },
        ],
        tip: 'Tip: a money belt worn under Ihram keeps documents safe.',
      },
      {
        short: 'Toiletries',
        label: 'PACK · TOILETRIES & HEALTH',
        text: {
          en: { t: 'Toiletries & medicines', b: 'In Ihram use unscented soap and fragrance-free toiletries. Bring personal medicine with a doctor note and keep it in cabin baggage.' },
          ur: { t: 'لوازمات اور ادویات', b: 'احرام میں بین خوشبو صابن اور لوازمات استعمال کریں۔ ذاتی ادویات ڈاکٹر کے پرچے کے ساتھ کیبن میں رکھیں۔' },
          ar: { t: 'مستلزمات النظافة والأدوية', b: 'في الإحرام استخدم صابوناً بلا رائحة. أحضر أدويتك مع تقرير الطبيب واحتفظ بها في حقيبة اليد.' },
          de: { t: 'Toiletten & Medikamente', b: 'Im Ihram parfümfreie Seife und Pflegeartikel verwenden. Persönliche Medikamente mit Attest im Handgepäck mitführen.' },
        },
        items: [
          { label: 'Unscented soap', status: 'ok' },
          { label: 'Medicine + doctor note', status: 'ok' },
          { label: 'Perfume during Ihram', status: 'prohibited' },
          { label: 'Narcotic medicines', status: 'permit' },
        ],
        tip: 'Tip: scented products are not allowed once you are in Ihram.',
      },
      {
        short: 'Documents',
        label: 'PACK · DOCUMENTS & VACCINES',
        text: {
          en: { t: 'Documents & vaccination', b: 'Carry your passport, visa, and the meningococcal (ACWY) certificate — required for entry. Keep printed and digital copies.' },
          ur: { t: 'دستاویزات اور ویکسین', b: 'پاسپورٹ، ویزا اور مننجائٹس (ACWY) سرٹیفیکیٹ ساتھ رکھیں — داخلے کے لیے لازمی۔' },
          ar: { t: 'الوثائق والتطعيمات', b: 'احمل جواز سفرك والتأشيرة وشهادة لقاح الحمى الشوكية (ACWY) — مطلوبة للدخول. احتفظ بنسخ ورقية ورقمية.' },
          de: { t: 'Dokumente & Impfung', b: 'Pass, Visum und das Meningokokken-Zertifikat (ACWY) mitführen — für die Einreise erforderlich. Papier- und Digitalkopien bereithalten.' },
        },
        items: [
          { label: 'Passport + visa', status: 'ok' },
          { label: 'Meningitis ACWY cert.', status: 'ok' },
          { label: 'Vaccination card', status: 'ok' },
          { label: 'Photocopies', status: 'ok' },
        ],
        tip: 'Tip: take the ACWY vaccine at least 10 days before you travel.',
      },
      {
        short: 'Allowed',
        label: 'RULES · ALLOWED TO BRING',
        text: {
          en: { t: 'What you can bring', b: 'Personal clothing, electronics, sealed personal food, a Quran and religious books, and personal-use toiletries are all fine.' },
          ur: { t: 'جو لا سکتے ہیں', b: 'ذاتی لباس، الیکٹرانکس، بند ذاتی کھانا، قرآن اور دینی کتب — سب اجازت یافتہ ہیں۔' },
          ar: { t: 'المسموح إحضاره', b: 'الملابس الشخصية والإلكترونيات والأطعمة المغلّفة والمصحف والكتب الدينية — كلها مسموحة.' },
          de: { t: 'Was Sie mitnehmen dürfen', b: 'Persönliche Kleidung, Elektronik, versiegelte Lebensmittel, Koran und religiöse Bücher sowie Pflegeartikel sind erlaubt.' },
        },
        items: [
          { label: 'Phone, laptop, camera', status: 'ok' },
          { label: 'Sealed personal food', status: 'ok' },
          { label: 'Quran & books', status: 'ok' },
          { label: 'Personal toiletries', status: 'ok' },
        ],
        tip: 'Tip: keep electronics in cabin baggage for security checks.',
      },
      {
        short: 'Restricted',
        label: 'RULES · RESTRICTED — DECLARE',
        text: {
          en: { t: 'Restricted — declare or permit', b: 'Some items are allowed only with a declaration or permit: large cash, extra tobacco, drones, and certain plants or seeds.' },
          ur: { t: 'محدود — اعلان کریں', b: 'کچھ اشیا صرف اعلان یا پرمٹ پر جائز ہیں: بڑی رقم، زائد تمباکو، ڈرون، اور پودے یا بیج۔' },
          ar: { t: 'مقيّد — يتطلب تصريحاً', b: 'بعض الأشياء مسموحة فقط بإقرار أو تصريح: المبالغ الكبيرة والتبغ الزائد والطائرات المسيّرة وبعض النباتات.' },
          de: { t: 'Eingeschränkt — anmelden', b: 'Manche Dinge sind nur mit Anmeldung oder Genehmigung erlaubt: große Bargeldsummen, zusätzlicher Tabak, Drohnen und bestimmte Pflanzen.' },
        },
        items: [
          { label: 'Cash over ~SAR 60,000', status: 'permit' },
          { label: 'Tobacco over 200 cigs', status: 'permit' },
          { label: 'Drones', status: 'permit' },
          { label: 'Plants & seeds', status: 'permit' },
        ],
        tip: 'Tip: declare cash above the limit at the red customs channel.',
      },
      {
        short: 'Prohibited',
        label: 'RULES · PROHIBITED — NEVER PACK',
        text: {
          en: { t: 'Prohibited — never pack', b: 'These are strictly banned: alcohol, narcotics, pork, weapons, and any immoral or anti-faith material. Penalties are severe.' },
          ur: { t: 'ممنوع — کبھی نہ رکھیں', b: 'یہ سخت ممنوع ہیں: شراب، منشیات، خنزیر، اسلحہ، اور غیر اخلاقی مواد۔ سزائیں سخت ہیں۔' },
          ar: { t: 'ممنوع — لا تحضره أبداً', b: 'هذه ممنوعة منعاً باتاً: الكحول والمخدرات ولحم الخنزير والأسلحة وأي مواد منافية. العقوبات شديدة.' },
          de: { t: 'Verboten — niemals einpacken', b: 'Streng verboten: Alkohol, Drogen, Schweinefleisch, Waffen und unmoralisches oder glaubensfeindliches Material. Hohe Strafen.' },
        },
        items: [
          { label: 'Alcohol', status: 'prohibited' },
          { label: 'Narcotics & drugs', status: 'prohibited' },
          { label: 'Pork products', status: 'prohibited' },
          { label: 'Weapons & ammo', status: 'prohibited' },
        ],
        tip: 'Tip: even small amounts mean arrest — when unsure, leave it out.',
      },
      {
        short: 'Check-out',
        label: 'CHECK-IN → CHECK-OUT · RETURN',
        text: {
          en: { t: 'Check-in, customs & check-out', b: 'At bag drop, weigh in and keep documents in hand. At arrival use the green channel if you carry nothing to declare. On return, sealed Zamzam is usually allowed — repack and check out calmly.' },
          ur: { t: 'چیک ان، کسٹمز اور چیک آؤٹ', b: 'بیگ ڈراپ پر وزن کرائیں۔ آمد پر اگر اعلان کے لئے کچھ نہیں تو سبز چینل سے گزریں۔ واپسی پر بند آبِ زمزم عام طور پر جائز ہے۔' },
          ar: { t: 'الوصول والجمارك والمغادرة', b: 'عند تسليم الحقائب زن أمتعتك واحتفظ بالوثائق. عند الوصول اسلك الممر الأخضر إن لم يكن لديك ما تُعلنه. وعند العودة يُسمح عادة بماء زمزم المختوم.' },
          de: { t: 'Check-in, Zoll & Check-out', b: 'Beim Bag-Drop wiegen und Dokumente bereithalten. Bei Ankunft den grünen Kanal nutzen, wenn nichts zu verzollen ist. Bei Rückkehr ist versiegeltes Zamzam meist erlaubt — ruhig umpacken und auschecken.' },
        },
        items: [
          { label: 'Weigh at bag drop', status: 'ok' },
          { label: 'Green channel (nothing to declare)', status: 'ok' },
          { label: 'Sealed Zamzam (return)', status: 'ok' },
          { label: 'Loose Zamzam in bag', status: 'prohibited' },
        ],
        tip: 'Tip: airlines usually allow a sealed 5 L Zamzam container on the return.',
      },
    ],
  },
  'makkah-ziyarat': {
    slug: 'makkah-ziyarat',
    title: 'Makkah Ziyarat',
    subtitle: 'Sacred sites of Makkah',
    icon: '🕋',
    steps: [
      {
        short: 'Al-Haram',
        label: 'GRAND MOSQUE',
        text: {
          en: { t: 'Masjid al-Haram', b: 'The Grand Mosque of Makkah, surrounding the Kaaba. The holiest site in Islam and the centre of every Umrah and Hajj.' },
          ar: { t: 'المسجد الحرام', b: 'أكبر مساجد الإسلام ويحيط بالكعبة المشرفة، وهو محور العمرة والحج.' },
        },
        items: ['Tawaf', 'Open 24/7', 'Multiple gates'],
        tip: 'Etiquette: enter with the right foot and make the dua for entering the mosque.',
      },
      {
        short: 'Kaaba',
        label: 'QIBLA',
        text: {
          en: { t: 'The Kaaba & Black Stone', b: 'The cube draped in the kiswah, toward which Muslims pray worldwide. The Hajar al-Aswad sits in its eastern corner.' },
          ar: { t: 'الكعبة والحجر الأسود', b: 'البيت المكسو بالكسوة وقبلة المسلمين، وفي ركنه الشرقي الحجر الأسود.' },
        },
        items: ['Hajar al-Aswad', 'Multazam', 'Rukn Yamani'],
        tip: 'Etiquette: point or face the Black Stone at the start of each tawaf circuit; do not push the crowd.',
      },
      {
        short: 'Maqam',
        label: 'STATION',
        text: {
          en: { t: 'Maqam Ibrahim', b: 'The station of Ibrahim, holding the stone he stood upon while raising the Kaaba. Pray two rak’ah behind it after tawaf.' },
          ar: { t: 'مقام إبراهيم', b: 'فيه الحجر الذي وقف عليه إبراهيم عند بناء الكعبة. صلّ ركعتين خلفه بعد الطواف.' },
        },
        items: ['Two rak’ah', 'After tawaf'],
        tip: 'Tip: if crowded, you may pray the two rak’ah anywhere in the mosque.',
      },
      {
        short: 'Safa & Marwah',
        label: 'SA’I',
        text: {
          en: { t: 'Safa & Marwah', b: 'The two hills walked between in Sa’i, recalling Hajar’s search for water for Ismail. Seven circuits complete the rite.' },
          ar: { t: 'الصفا والمروة', b: 'جبلان يُسعى بينهما سبعة أشواط إحياءً لسعي هاجر بحثاً عن الماء لإسماعيل.' },
        },
        items: ['7 circuits', 'Green-light jog (men)', 'Inside the mosque'],
        tip: 'Tip: Sa’i begins at Safa and ends at Marwah — each one-way walk counts as a circuit.',
      },
      {
        short: 'Zamzam',
        label: 'WELL',
        text: {
          en: { t: 'The Well of Zamzam', b: 'The blessed spring that has flowed beside the Kaaba for millennia. Drink freely; coolers are throughout the mosque.' },
          ar: { t: 'بئر زمزم', b: 'العين المباركة التي تتدفّق بجوار الكعبة منذ آلاف السنين. اشرب منها وادعُ بما شئت.' },
        },
        items: ['Drink & dua', 'Coolers everywhere'],
        tip: 'Tip: face the Qibla, drink in three breaths, and make your dua — Zamzam is for whatever it is drunk for.',
      },
      {
        short: 'Jabal al-Nour',
        label: 'MOUNTAIN',
        text: {
          en: { t: 'Jabal al-Nour & Hira', b: 'The Mountain of Light, holding the Cave of Hira where the first revelation came to the Prophet ﷺ.' },
          ar: { t: 'جبل النور وغار حراء', b: 'فيه غار حراء الذي نزل فيه الوحي أول مرة على النبي صلى الله عليه وسلم.' },
        },
        items: ['Cave of Hira', 'Steep climb', 'Historic'],
        tip: 'Tip: the climb is long and steep — go early, carry water, and it is optional, not part of Umrah.',
      },
      {
        short: 'Jabal Thawr',
        label: 'MOUNTAIN',
        text: {
          en: { t: 'Jabal Thawr', b: 'The mountain whose cave sheltered the Prophet ﷺ and Abu Bakr during the Hijrah to Madinah.' },
          ar: { t: 'جبل ثور', b: 'الجبل الذي آوى غارَه النبي صلى الله عليه وسلم وأبو بكر أثناء الهجرة.' },
        },
        items: ['Cave of Thawr', 'Historic', 'South of Makkah'],
        tip: 'Tip: a demanding climb — visited for reflection, not a ritual of Umrah or Hajj.',
      },
      {
        short: 'Mina',
        label: 'HAJJ SITE',
        text: {
          en: { t: 'Mina', b: 'The valley of tents where pilgrims stay during Hajj and perform the stoning of the Jamarat.' },
          ar: { t: 'منى', b: 'وادي الخيام حيث يبيت الحجاج أيام الحج ويرمون الجمرات.' },
        },
        items: ['Tent city', 'Jamarat', 'Days of Tashriq'],
        tip: 'Tip: Mina is part of the Hajj rites — visited in Dhul-Hijjah, not during a normal Umrah.',
      },
      {
        short: 'Arafat',
        label: 'HAJJ SITE',
        text: {
          en: { t: 'Arafat & Jabal al-Rahmah', b: 'The plain where pilgrims stand on the 9th of Dhul-Hijjah — the essence of Hajj — beside the Mount of Mercy.' },
          ar: { t: 'عرفات وجبل الرحمة', b: 'الصعيد الذي يقف فيه الحجاج يوم التاسع من ذي الحجة — ركن الحج الأعظم — بجانب جبل الرحمة.' },
        },
        items: ['Day of Arafah', 'Mount of Mercy', 'Hajj pillar'],
        tip: 'Tip: “Hajj is Arafah.” Spend the day in dua — it is the greatest day of the year.',
      },
      {
        short: 'Muzdalifah',
        label: 'HAJJ SITE',
        text: {
          en: { t: 'Muzdalifah', b: 'The open plain where pilgrims spend the night after Arafat, gathering pebbles for the stoning at Mina.' },
          ar: { t: 'مزدلفة', b: 'المشعر الذي يبيت فيه الحجاج بعد عرفات ويجمعون الحصى لرمي الجمرات.' },
        },
        items: ['Overnight stay', 'Gather pebbles', 'After Arafat'],
        tip: 'Tip: combine Maghrib and Isha here, and rest — it is a Hajj rite in Dhul-Hijjah.',
      },
      {
        short: 'Mu’alla',
        label: 'CEMETERY',
        text: {
          en: { t: 'Jannat al-Mu’alla', b: 'The historic cemetery of Makkah, resting place of Khadijah رضي الله عنها and many of the Prophet’s family.' },
          ar: { t: 'جنة المعلاة', b: 'مقبرة مكة التاريخية ومدفن السيدة خديجة رضي الله عنها وكثير من آل البيت.' },
        },
        items: ['Khadijah RA', 'Historic graves'],
        tip: 'Etiquette: greet the people of the graves and make dua for them; visiting is for remembrance.',
      },
      {
        short: 'Masjid Aisha',
        label: 'MIQAT',
        text: {
          en: { t: 'Masjid Aisha (Tan’im)', b: 'The nearest Miqat outside the Haram boundary, where Makkah residents and visitors enter Ihram for a new Umrah.' },
          ar: { t: 'مسجد عائشة (التنعيم)', b: 'أقرب ميقات خارج حدود الحرم، يحرم منه أهل مكة والزائرون لعمرة جديدة.' },
        },
        items: ['Miqat', 'Enter Ihram', 'For new Umrah'],
        tip: 'Tip: come here to enter Ihram if you wish to perform an additional Umrah from Makkah.',
      },
      {
        short: 'Makkah Museum',
        label: 'MUSEUM',
        text: {
          en: { t: 'Makkah Museum', b: 'The Exhibition of the Architecture of the Two Holy Mosques — the history, art and great expansions of the Haramain, shown in rich detail.' },
          ar: { t: 'متحف مكة', b: 'معرض عمارة الحرمين الشريفين الذي يعرض تاريخ وفن وتوسعات الحرمين بتفصيل بديع.' },
        },
        items: ['Haramain history', 'Models & relics', 'Umm al-Joud'],
        tip: 'Tip: located in Umm al-Joud; allow an hour for the scale models of the expansions.',
      },
      {
        short: 'Hira District',
        label: 'CULTURAL',
        text: {
          en: { t: 'Hira Cultural District', b: 'A modern cultural centre at the foot of Jabal al-Nour, with the Revelation Exhibition telling the story of the first revelation.' },
          ar: { t: 'حي حراء الثقافي', b: 'مركز ثقافي حديث عند سفح جبل النور، يضم معرض الوحي الذي يروي قصة بدء الوحي.' },
        },
        items: ['Revelation Gallery', 'Cafes & library', 'Near Jabal al-Nour'],
        tip: 'Tip: a calm, family-friendly stop before or after visiting the Cave of Hira.',
      },
      {
        short: 'Kiswa Factory',
        label: 'CRAFT',
        text: {
          en: { t: 'The Kaaba Kiswa Factory', b: 'The King Abdulaziz Complex where the black-and-gold kiswa of the Kaaba is woven anew each year by master craftsmen.' },
          ar: { t: 'مصنع كسوة الكعبة', b: 'مجمع الملك عبدالعزيز لكسوة الكعبة المشرفة حيث تُنسج كسوتها كل عام على أيدي حرفيين مهرة.' },
        },
        items: ['Gold embroidery', 'Annual kiswa', 'Umm al-Joud'],
        tip: 'Tip: see the gold-thread embroidery of the Quranic calligraphy up close.',
      },
      {
        short: 'Clock Tower',
        label: 'LANDMARK',
        text: {
          en: { t: 'Clock Tower Museum', b: 'Inside the Makkah Royal Clock Tower: galleries on timekeeping and astronomy, and a top-floor observation deck over the Haram.' },
          ar: { t: 'متحف برج الساعة', b: 'داخل برج الساعة الملكي بمكة: قاعات عن المواقيت والفلك، وإطلالة من الأعلى على الحرم.' },
        },
        items: ['Observation deck', 'Astronomy halls', 'Over the Haram'],
        tip: 'Tip: visit near Maghrib for a stunning view of the Haram lighting up.',
      },
    ],
  },
  'madina-ziyarat': {
    slug: 'madina-ziyarat',
    title: 'Madinah Ziyarat',
    subtitle: 'Sacred sites of Madinah',
    icon: '🕌',
    steps: [
      {
        short: 'An-Nabawi',
        label: 'PROPHET MOSQUE',
        text: {
          en: { t: 'Masjid an-Nabawi', b: 'The Prophet’s Mosque, second holiest in Islam, built by the Prophet ﷺ himself and crowned by the Green Dome over his resting place.' },
          ar: { t: 'المسجد النبوي', b: 'مسجد النبي صلى الله عليه وسلم، ثاني الحرمين، بناه النبي بنفسه، وتعلوه القبة الخضراء فوق مرقده الشريف.' },
        },
        items: ['Green Dome', 'Open 24/7', 'Rawdah inside'],
        tip: 'Etiquette: send salah upon the Prophet ﷺ abundantly, and greet him and his two companions.',
      },
      {
        short: 'Ar-Rawdah',
        label: 'THE GARDEN',
        text: {
          en: { t: 'Ar-Rawdah ash-Sharifah', b: 'The blessed area between the Prophet’s pulpit and his chamber — “a garden from the gardens of Paradise.” Pray and make dua here.' },
          ar: { t: 'الروضة الشريفة', b: 'ما بين منبر النبي صلى الله عليه وسلم وبيته، «روضة من رياض الجنة». صلّ وادعُ فيها.' },
        },
        items: ['Permit via Nusuk', 'Pray 2 rak’ah', 'Timed entry'],
        tip: 'Tip: book a Rawdah slot in advance through the Nusuk app; entry is timed and busy.',
      },
      {
        short: 'Al-Baqi',
        label: 'CEMETERY',
        text: {
          en: { t: 'Jannat al-Baqi', b: 'The principal cemetery of Madinah, beside the mosque, resting place of many Companions and family of the Prophet ﷺ.' },
          ar: { t: 'جنة البقيع', b: 'مقبرة المدينة الكبرى بجوار المسجد، مدفن كثير من الصحابة وآل بيت النبي صلى الله عليه وسلم.' },
        },
        items: ['Companions', 'Family of Prophet', 'Beside the mosque'],
        tip: 'Etiquette: greet the people of the graves and make dua for them.',
      },
      {
        short: 'Quba',
        label: 'FIRST MOSQUE',
        text: {
          en: { t: 'Masjid Quba', b: 'The first mosque built in Islam. A prayer here, after making wudu at home, carries the reward of an Umrah.' },
          ar: { t: 'مسجد قباء', b: 'أول مسجد بُني في الإسلام. من تطهّر في بيته ثم صلّى فيه ركعتين كان له أجر عمرة.' },
        },
        items: ['First mosque', 'Reward of Umrah', 'South Madinah'],
        tip: 'Tip: make wudu at your hotel, then pray two rak’ah at Quba for the great reward.',
      },
      {
        short: 'Qiblatayn',
        label: 'TWO QIBLAS',
        text: {
          en: { t: 'Masjid al-Qiblatayn', b: 'The Mosque of the Two Qiblas, where the command came to turn from Jerusalem to the Kaaba mid-prayer.' },
          ar: { t: 'مسجد القبلتين', b: 'المسجد الذي نزل فيه الأمر بتحويل القبلة من بيت المقدس إلى الكعبة أثناء الصلاة.' },
        },
        items: ['Qibla change', 'Historic', 'North-west'],
        tip: 'Tip: a short visit to reflect on the change of the Qibla; pray if you can.',
      },
      {
        short: 'Uhud',
        label: 'MOUNTAIN',
        text: {
          en: { t: 'Mount Uhud', b: 'The mountain of the Battle of Uhud, of which the Prophet ﷺ said: “Uhud is a mountain that loves us and we love it.”' },
          ar: { t: 'جبل أحد', b: 'جبل غزوة أحد، قال عنه النبي صلى الله عليه وسلم: «أُحُدٌ جبلٌ يحبّنا ونحبّه».' },
        },
        items: ['Battle of Uhud', 'Martyrs nearby', 'North Madinah'],
        tip: 'Tip: visit early; the resting place of the martyrs lies at the foot of the mountain.',
      },
      {
        short: 'Martyrs',
        label: 'MARTYRS',
        text: {
          en: { t: 'Martyrs of Uhud', b: 'The resting place of the seventy martyrs of Uhud, including Hamza رضي الله عنه, the Prophet’s uncle.' },
          ar: { t: 'شهداء أحد', b: 'مدفن شهداء أحد السبعين، ومنهم حمزة رضي الله عنه عم النبي صلى الله عليه وسلم.' },
        },
        items: ['Hamza RA', '70 martyrs', 'At Uhud'],
        tip: 'Etiquette: greet the martyrs and make dua; honour the place quietly.',
      },
      {
        short: 'Seven Mosques',
        label: 'AL-KHANDAQ',
        text: {
          en: { t: 'The Seven Mosques', b: 'Small historic mosques near the site of the Battle of the Trench (al-Khandaq), where the Confederates were repelled.' },
          ar: { t: 'المساجد السبعة', b: 'مساجد تاريخية صغيرة قرب موقع غزوة الخندق حيث رُدّ الأحزاب عن المدينة.' },
        },
        items: ['Battle of Trench', 'Historic', 'West Madinah'],
        tip: 'Tip: a brief, reflective stop on the history of the Ahzab campaign.',
      },
      {
        short: 'Al-Ghamamah',
        label: 'HISTORIC MOSQUE',
        text: {
          en: { t: 'Masjid al-Ghamamah', b: 'A historic mosque near the Haram, traditionally the place where the Prophet ﷺ prayed for rain and the Eid prayer.' },
          ar: { t: 'مسجد الغمامة', b: 'مسجد تاريخي قرب الحرم، يُروى أن النبي صلى الله عليه وسلم صلّى فيه الاستسقاء والعيد.' },
        },
        items: ['Near the Haram', 'Ottoman style', 'Eid & rain prayer'],
        tip: 'Tip: a short walk from Masjid an-Nabawi; admire the early architecture.',
      },
      {
        short: 'Ajwa Dates',
        label: 'SUNNAH',
        text: {
          en: { t: 'The Date Market · Ajwa', b: 'Madinah is famed for its dates, especially the Ajwa praised by the Prophet ﷺ. Visit the date market near Quba.' },
          ar: { t: 'سوق التمور · العجوة', b: 'تشتهر المدينة بتمورها وخاصة العجوة التي أثنى عليها النبي صلى الله عليه وسلم. زر سوق التمور قرب قباء.' },
        },
        items: ['Ajwa dates', 'Near Quba', 'Gifts to carry'],
        tip: 'Tip: seven Ajwa dates in the morning is a known Sunnah — and a lovely gift to take home.',
      },
      {
        short: 'Seerah Museum',
        label: 'MUSEUM',
        text: {
          en: { t: 'Exhibition of the Prophet’s Biography', b: 'The grand As-Salam exhibition on the life, character and legacy of the Prophet ﷺ, with immersive multimedia halls beside the Haram.' },
          ar: { t: 'معرض السيرة النبوية', b: 'معرض السلام الكبير عن حياة النبي صلى الله عليه وسلم وأخلاقه وأثره، بقاعات تفاعلية قرب الحرم.' },
        },
        items: ['Immersive halls', 'Seerah & character', 'Near the Haram'],
        tip: 'Tip: entry is free; the multimedia halls are excellent for families and children.',
      },
      {
        short: 'Dar Al Madinah',
        label: 'MUSEUM',
        text: {
          en: { t: 'Dar Al Madinah Museum', b: 'A heritage museum tracing the urban and social history of Madinah, with detailed scale models of the old city and its mosques.' },
          ar: { t: 'متحف دار المدينة', b: 'متحف تراثي يروي التاريخ العمراني والاجتماعي للمدينة، مع مجسمات دقيقة للمدينة القديمة ومساجدها.' },
        },
        items: ['City models', 'Heritage', 'Near Quba road'],
        tip: 'Tip: great for understanding how Madinah grew around the Prophet’s Mosque.',
      },
      {
        short: 'Quran Exhibition',
        label: 'EXHIBITION',
        text: {
          en: { t: 'Exhibition of the Holy Quran', b: 'A museum dedicated to the revelation, preservation and arts of the Quran, a short walk from Masjid an-Nabawi.' },
          ar: { t: 'معرض القرآن الكريم', b: 'متحف مخصص لنزول القرآن وحفظه وفنونه، على مقربة من المسجد النبوي.' },
        },
        items: ['Manuscripts', 'Revelation story', 'Near an-Nabawi'],
        tip: 'Tip: a quiet, reflective visit on the history of the Mushaf.',
      },
      {
        short: 'Hijaz Railway',
        label: 'MUSEUM',
        text: {
          en: { t: 'Hijaz Railway Museum', b: 'The restored Ottoman railway station and museum, telling the story of the historic line from Damascus to Madinah.' },
          ar: { t: 'متحف سكة حديد الحجاز', b: 'محطة سكة حديد الحجاز العثمانية المرممة ومتحفها، يروي قصة الخط التاريخي من دمشق إلى المدينة.' },
        },
        items: ['Ottoman station', 'Old locomotives', 'Restored'],
        tip: 'Tip: see the original locomotives and the beautifully restored station hall.',
      },
    ],
  },
};

export const WIZARD_SLUGS: WizardSlug[] = ['airport', 'luggage', 'makkah-ziyarat', 'madina-ziyarat'];
