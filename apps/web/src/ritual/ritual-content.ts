// Umrah Guide — ritual content as data (pure; unit-tested). Ordered along the master design grid
// (0_complete.png) with Talbiyah and "Enter Masjid al-Haram" restored as their own screens (they were
// prominent in the detailed uploads 4_Umrah / 5_Umrah): Niyyah → Ihram → Talbiyah → Enter al-Haram →
// Tawaf → … → Umrah complete. English copy + Arabic duas (verbatim) with per-language meanings
// (EN/UR/FR/ID/TR/BN). All ritual text + translations flagged for review (/docs/assumptions.md A6/A7).

export type ApproxMin = number | 'ongoing' | null;

/** A short piece of text in one language, for the multilingual cards. */
export interface LangText {
  code: string;
  label: string;
  text: string;
}

export interface Dua {
  /** Sacred Arabic text — shown verbatim, RTL, never translated away. */
  arabic: string;
  translit: string;
  /** Meaning per language (EN/UR/FR/ID/TR/BN). Arabic is shown in `arabic`. */
  translations: LangText[];
  source: string;
  /** Optional audio key → /audio/ritual/<audio>.mp3 (player hidden if the file is absent). */
  audio?: string;
}

export interface RitualCounter {
  kind: 'tawaf' | 'sai';
  total: number;
}

export interface RitualStep {
  key: string;
  /** Display number (matches the step bar in the design). */
  step: number;
  phase: string;
  title: string;
  subtitle?: string;
  approxMin: ApproxMin;
  intro?: string;
  instructions?: string[];
  forMen?: string[];
  forWomen?: string[];
  checklist?: string[];
  duas?: Dua[];
  counter?: RitualCounter;
  /** Renders the ziyarat place grid for this city. */
  ziyarat?: 'makkah' | 'madinah';
  /** A hadith / Qur'an citation line. */
  hadith?: string;
  tip?: string;
  /** Image manifest key (resolved by ritual-images.ts, with a scene fallback). */
  image: string;
  next: string;
}

const NIYYAH_DUA: Dua = {
  arabic: 'لَبَّيْكَ اللَّهُمَّ عُمْرَةً',
  translit: 'Labbayka Allāhumma ‘Umrah',
  source: 'Reported from the Prophet ﷺ — Sahih Muslim.',
  audio: 'niyyah',
  translations: [
    { code: 'en', label: 'English', text: 'Here I am, O Allah, (in answer to Your call) for Umrah.' },
    { code: 'ur', label: 'اردو', text: 'میں حاضر ہوں اے اللہ، عمرہ کے لیے۔' },
    { code: 'fr', label: 'Français', text: 'Me voici, ô Allah, pour la Omra.' },
    { code: 'id', label: 'Indonesia', text: 'Aku penuhi panggilan-Mu ya Allah, untuk Umrah.' },
    { code: 'tr', label: 'Türkçe', text: 'Buyur Allah’ım, Umre için emrindeyim.' },
    { code: 'bn', label: 'বাংলা', text: 'আমি হাজির, হে আল্লাহ, উমরাহর জন্য।' },
  ],
};

const TALBIYAH_DUA: Dua = {
  arabic:
    'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيكَ لَكَ',
  translit:
    'Labbayka Allāhumma labbayk, labbayka lā sharīka laka labbayk, innal-ḥamda wan-ni‘mata laka wal-mulk, lā sharīka lak',
  source: 'Bukhari & Muslim.',
  audio: 'talbiyah',
  translations: [
    {
      code: 'en',
      label: 'English',
      text: 'Here I am, O Allah, here I am. You have no partner, here I am. Truly all praise, grace and dominion are Yours. You have no partner.',
    },
    { code: 'ur', label: 'اردو', text: 'میں حاضر ہوں اے اللہ، تیرا کوئی شریک نہیں۔ تمام تعریف، نعمت اور بادشاہی تیری ہی ہے، تیرا کوئی شریک نہیں۔' },
    { code: 'fr', label: 'Français', text: 'Me voici, ô Allah. Tu n’as pas d’associé. À Toi la louange, le bienfait et la royauté. Tu n’as pas d’associé.' },
    { code: 'id', label: 'Indonesia', text: 'Aku penuhi panggilan-Mu ya Allah. Tiada sekutu bagi-Mu. Segala puji, nikmat dan kerajaan milik-Mu. Tiada sekutu bagi-Mu.' },
    { code: 'tr', label: 'Türkçe', text: 'Buyur Allah’ım. Senin ortağın yoktur. Hamd, nimet ve mülk Senindir. Senin ortağın yoktur.' },
    { code: 'bn', label: 'বাংলা', text: 'আমি হাজির, হে আল্লাহ। তোমার কোনো শরিক নেই। সমস্ত প্রশংসা, নিয়ামত ও রাজত্ব তোমারই। তোমার কোনো শরিক নেই।' },
  ],
};

const ENTRY_DUA: Dua = {
  arabic: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
  translit: 'Allāhumma-ftaḥ lī abwāba raḥmatik',
  source: 'Mosque-entry supplication — Sahih Muslim.',
  translations: [
    { code: 'en', label: 'English', text: 'O Allah, open for me the doors of Your mercy.' },
    { code: 'ur', label: 'اردو', text: 'اے اللہ، میرے لیے اپنی رحمت کے دروازے کھول دے۔' },
    { code: 'fr', label: 'Français', text: 'Ô Allah, ouvre-moi les portes de Ta miséricorde.' },
    { code: 'id', label: 'Indonesia', text: 'Ya Allah, bukakanlah untukku pintu-pintu rahmat-Mu.' },
    { code: 'tr', label: 'Türkçe', text: 'Allah’ım, bana rahmet kapılarını aç.' },
    { code: 'bn', label: 'বাংলা', text: 'হে আল্লাহ, আমার জন্য তোমার রহমতের দরজাসমূহ খুলে দাও।' },
  ],
};

const SAFA_DUA: Dua = {
  arabic: 'إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَائِرِ اللَّهِ',
  translit: 'Inna ṣ-Ṣafā wal-Marwata min sha‘ā’irillāh',
  source: 'Qur’an 2:158.',
  translations: [
    { code: 'en', label: 'English', text: 'Indeed, Safa and Marwah are among the symbols of Allah.' },
    { code: 'ur', label: 'اردو', text: 'بے شک صفا اور مروہ اللہ کی نشانیوں میں سے ہیں۔' },
    { code: 'fr', label: 'Français', text: 'As-Safa et al-Marwah font partie des symboles d’Allah.' },
    { code: 'id', label: 'Indonesia', text: 'Sesungguhnya Safa dan Marwah termasuk syiar-syiar Allah.' },
    { code: 'tr', label: 'Türkçe', text: 'Şüphesiz Safa ile Merve, Allah’ın işaretlerindendir.' },
    { code: 'bn', label: 'বাংলা', text: 'নিশ্চয় সাফা ও মারওয়া আল্লাহর নিদর্শনসমূহের অন্তর্ভুক্ত।' },
  ],
};

export const RITUAL_STEPS: RitualStep[] = [
  {
    key: 'niyyah',
    step: 1,
    phase: 'Entering Ihram',
    title: 'Niyyah (Intention)',
    subtitle: 'The first and most important step',
    approxMin: 2,
    intro: 'At or just before the Miqat, make the intention for Umrah in your heart and say the words below.',
    duas: [NIYYAH_DUA],
    checklist: ['I have made my intention (Niyyah) for Umrah'],
    hadith: '“Actions are but by intentions, and every person shall have but that which they intended.” — Sahih Bukhari 1',
    tip: 'Sincerity is hidden in the heart. Make your Niyyah only for Allah, seeking His pleasure and reward.',
    image: 'niyyah',
    next: 'I have made my Niyyah',
  },
  {
    key: 'ihram',
    step: 2,
    phase: 'Entering Ihram',
    title: 'Ihram (State of Purity)',
    subtitle: 'Prepare yourself to enter the state of Ihram',
    approxMin: 20,
    intro: 'Purify, dress and enter the sacred state. Ihram is not just clothing — it is a state of purity and humility before Allah.',
    forMen: [
      'Ghusl (ritual bath) — purify yourself.',
      'Wear two clean, white, unstitched sheets (izar + rida).',
      'Simple & modest — no stitched clothing, no head covering.',
      'Avoid restrictions — no perfume, no leather items, no cutting hair/nails.',
    ],
    forWomen: [
      'Ghusl (ritual bath) — purify yourself.',
      'Wear normal modest Islamic dress (any colour).',
      'Do not cover the face with a veil touching it, and do not wear gloves.',
      'You are now ready to begin Umrah.',
    ],
    tip: 'Avoid arguments, sin and anything that breaks the sanctity of Ihram.',
    image: 'ihram',
    next: 'I have prepared for Ihram',
  },
  {
    key: 'talbiyah',
    step: 3,
    phase: 'Entering Ihram',
    title: 'Talbiyah',
    subtitle: 'Declare your response to Allah’s call',
    approxMin: 'ongoing',
    intro:
      'After making your intention, begin reciting the Talbiyah and continue often (men raising the voice) until you reach Masjid al-Haram in Makkah.',
    duas: [TALBIYAH_DUA],
    tip: 'Talbiyah is your declaration that you have answered Allah’s call — recite it with love, humility and eagerness.',
    image: 'talbiyah',
    next: 'I have started the Talbiyah',
  },
  {
    key: 'enter-haram',
    step: 4,
    phase: 'Arrival in Makkah',
    title: 'Enter Masjid al-Haram',
    subtitle: 'Arrive at the House of Allah',
    approxMin: null,
    intro:
      'Enter with respect and humility. Step in with your right foot and recite the entry du‘a. At your first sight of the Kaaba, pause — a moment when du‘a is hoped to be accepted.',
    duas: [ENTRY_DUA],
    instructions: [
      'First sight of the Kaaba — look with love and awe.',
      'Raise your hands and make du‘a for yourself, your family and the Ummah.',
      'Stay calm and grateful; maintain adab — speak softly and avoid crowding.',
    ],
    checklist: ['Entered Masjid al-Haram', 'Saw the Kaaba & made du‘a'],
    tip: 'You have reached the House of Allah. Every step here is an act of worship.',
    image: 'kaaba-arrival',
    next: 'Begin Tawaf',
  },
  {
    key: 'tawaf',
    step: 5,
    phase: 'Tawaf',
    title: 'Tawaf (Circumambulation)',
    subtitle: 'Walk around the Kaaba 7 times',
    approxMin: 40,
    intro:
      'Begin Tawaf at the Black Stone (Hajar al-Aswad) corner, keeping the Kaaba on your left, anti-clockwise. Tap “+1 round” for each circuit. Time varies a lot with the crowd.',
    instructions: [
      'Face / gesture to the Black Stone to begin, saying “Bismillah, Allāhu Akbar”.',
      'Men: uncover the right shoulder (idtiba‘) and walk briskly (raml) in the first three rounds.',
      'Keep the Kaaba on your left; walk at a normal pace; do not push or harm others.',
      'There is no fixed du‘a — supplicate freely throughout.',
    ],
    counter: { kind: 'tawaf', total: 7 },
    tip: 'You will pray two Rak‘ahs after completing Tawaf.',
    image: 'tawaf',
    next: 'I have completed Tawaf',
  },
  {
    key: 'maqam-ibrahim',
    step: 6,
    phase: 'In Masjid al-Haram',
    title: 'Prayer behind Maqam Ibrahim',
    subtitle: 'Pray two Rak‘ahs',
    approxMin: 5,
    intro: 'After Tawaf, pray two short Rak‘ahs — behind Maqam Ibrahim if you can reach it without crowding, otherwise anywhere in the mosque.',
    instructions: ['Recite Surah al-Kafirun in the first Rak‘ah and Surah al-Ikhlas in the second (recommended).'],
    checklist: ['Completed two Rak‘ahs'],
    image: 'maqam-ibrahim',
    next: 'I have prayed two Rak‘ahs',
  },
  {
    key: 'zamzam',
    step: 7,
    phase: 'In Masjid al-Haram',
    title: 'Drink Zamzam Water',
    subtitle: 'Drink and make du‘a',
    approxMin: 5,
    intro: 'Drink your fill of Zamzam water and make du‘a — Zamzam is for whatever it is drunk for.',
    checklist: ['Drank Zamzam water', 'Made du‘a'],
    image: 'zamzam',
    next: 'Go to Safa',
  },
  {
    key: 'safa',
    step: 8,
    phase: 'Sa‘i',
    title: 'Go to Safa',
    subtitle: 'Begin from Mount Safa',
    approxMin: 2,
    intro: 'Proceed to Mount Safa to begin Sa‘i. As you approach, recite the verse below; at Safa, face the Kaaba, raise your hands, praise Allah and make du‘a.',
    duas: [SAFA_DUA],
    checklist: ['Reached Safa'],
    image: 'safa',
    next: 'Begin Sa‘i',
  },
  {
    key: 'sai',
    step: 9,
    phase: 'Sa‘i',
    title: 'Sa‘i (between Safa & Marwah)',
    subtitle: 'Walk seven times between the two hills',
    approxMin: 35,
    intro:
      'Walk between Safa and Marwah seven times. Safa → Marwah is 1, Marwah → Safa is 2, and so on — you finish at Marwah on the seventh. Tap “+1 passage” at each end.',
    instructions: [
      'Men: walk briskly between the two green markers; everyone walks normally otherwise.',
      'Supplicate freely throughout; there is no fixed du‘a for the walk.',
    ],
    counter: { kind: 'sai', total: 7 },
    image: 'sai',
    next: 'I have completed Sa‘i',
  },
  {
    key: 'complete-sai',
    step: 10,
    phase: 'Sa‘i',
    title: 'Complete Sa‘i',
    subtitle: 'Confirm your seven passages',
    approxMin: null,
    intro: 'You have completed seven passages, ending at Marwah. Make du‘a and prepare for the final rite of Umrah.',
    checklist: ['I finished Sa‘i at Marwah (7 passages)'],
    image: 'sai',
    next: 'Continue to hair-cutting',
  },
  {
    key: 'halq',
    step: 11,
    phase: 'Completing Umrah',
    title: 'Hair Cutting / Shaving',
    subtitle: 'Halq or Taqsir',
    approxMin: 10,
    intro: 'The final rite. After this you leave the state of Ihram.',
    forMen: ['Shave the whole head (Halq, preferred) — or trim hair evenly from all of the head (Taqsir).'],
    forWomen: ['Gather the hair and cut a fingertip’s length (about 2–3 cm) from the ends.'],
    checklist: ['Hair cut completed'],
    image: 'halq',
    next: 'End of Ihram',
  },
  {
    key: 'end-ihram',
    step: 12,
    phase: 'Completing Umrah',
    title: 'End of Ihram',
    subtitle: 'The restrictions are lifted',
    approxMin: null,
    intro: 'You may now exit Ihram. All restrictions of Ihram are lifted — you may change into normal clothes, and what was forbidden in Ihram is permitted again. Alhamdulillah.',
    checklist: ['Exited the state of Ihram'],
    image: 'end-ihram',
    next: 'Visit important places',
  },
  {
    key: 'visit-makkah',
    step: 13,
    phase: 'After Umrah',
    title: 'Visit Important Places (Makkah)',
    subtitle: 'Ziyarah around Makkah',
    approxMin: null,
    intro: 'Notable places to visit and pray at in and around Makkah. Always respect local etiquette and guidance.',
    ziyarat: 'makkah',
    image: 'visit-makkah',
    next: 'Make du‘a',
  },
  {
    key: 'make-dua',
    step: 14,
    phase: 'After Umrah',
    title: 'Make Du‘a',
    subtitle: 'For yourself, your family and the Ummah',
    approxMin: null,
    intro: 'Make plenty of du‘a for yourself, your family, and the whole Muslim Ummah. These are blessed days — do not let them pass without asking Allah.',
    tip: 'Keep your heart attached to the mosque; pray in congregation and recite Qur’an while you can.',
    image: 'make-dua',
    next: 'Visit Madinah (optional)',
  },
  {
    key: 'visit-madinah',
    step: 15,
    phase: 'After Umrah',
    title: 'Optional: Visit Madinah',
    subtitle: 'The City of the Prophet ﷺ',
    approxMin: null,
    intro:
      'If possible, travel to Madinah to pray in Masjid an-Nabawi and send salutations upon the Prophet ﷺ. Note: the Rawdah visit slot is booked in the Nusuk app — we guide, we don’t issue it.',
    ziyarat: 'madinah',
    image: 'visit-madinah',
    next: 'Continue good deeds',
  },
  {
    key: 'good-deeds',
    step: 16,
    phase: 'After Umrah',
    title: 'Continue Good Deeds',
    subtitle: 'Keep the spirit of Umrah alive',
    approxMin: null,
    intro: 'Continue righteous deeds and keep the spirit of Umrah alive after you return — prayer, charity, kindness, and remembrance of Allah.',
    tip: 'The sign of an accepted act is another good act after it.',
    image: 'good-deeds',
    next: 'Finish',
  },
  {
    key: 'umrah-complete',
    step: 17,
    phase: 'Umrah Complete',
    title: 'Umrah Complete',
    subtitle: 'May Allah accept your Umrah',
    approxMin: null,
    intro: 'Alhamdulillah — your Umrah is complete. Add a personal note to remember this day, and may Allah accept it from you and grant you His blessings.',
    image: 'umrah-complete',
    next: 'Done',
  },
];

export interface ZiyaratPlace {
  slug: string;
  name: string;
  note: string;
}

export const ZIYARAT: { makkah: ZiyaratPlace[]; madinah: ZiyaratPlace[] } = {
  makkah: [
    { slug: 'kaaba', name: 'The Kaaba', note: 'The Sacred House, the qibla of the Muslims.' },
    { slug: 'maqam-ibrahim', name: 'Maqam Ibrahim', note: 'The station of Prophet Ibrahim, near the Kaaba.' },
    { slug: 'hateem', name: 'Al-Hateem (Hijr Ismail)', note: 'The semi-circular area; praying here is praying inside the Kaaba.' },
    { slug: 'multazam', name: 'Al-Multazam', note: 'Between the Black Stone and the door — a place for du‘a.' },
    { slug: 'safa', name: 'Mount Safa', note: 'The starting point of Sa‘i.' },
    { slug: 'marwah', name: 'Mount Marwah', note: 'The end point of Sa‘i.' },
    { slug: 'jabal-al-noor', name: 'Jabal al-Noor (Cave Hira)', note: 'Where the first revelation came to the Prophet ﷺ.' },
    { slug: 'jabal-thawr', name: 'Jabal Thawr', note: 'The cave where the Prophet ﷺ sheltered during the Hijrah.' },
    { slug: 'mina', name: 'Mina', note: 'The valley of the Hajj rites (tents and Jamarat).' },
    { slug: 'muzdalifah', name: 'Muzdalifah', note: 'Where pilgrims gather on the night of Hajj.' },
    { slug: 'arafat', name: 'Arafat', note: 'The plain of standing on the Day of Arafah.' },
  ],
  madinah: [
    { slug: 'masjid-nabawi', name: 'Masjid an-Nabawi', note: 'The Prophet’s Mosque — prayer here is greatly rewarded.' },
    { slug: 'rawdah', name: 'Ar-Rawdah', note: 'A garden of Paradise. Note: book the visit slot in the Nusuk app.' },
    { slug: 'green-dome', name: 'The Green Dome', note: 'Over the resting place of the Prophet ﷺ and his two companions.' },
    { slug: 'jannat-al-baqi', name: 'Jannat al-Baqi', note: 'The historic cemetery of Madinah.' },
    { slug: 'masjid-quba', name: 'Masjid Quba', note: 'The first mosque in Islam; two Rak‘ahs here equal an Umrah in reward.' },
    { slug: 'masjid-qiblatain', name: 'Masjid al-Qiblatain', note: 'Where the qibla changed to the Kaaba.' },
    { slug: 'mount-uhud', name: 'Mount Uhud', note: 'The site of the Battle of Uhud.' },
    { slug: 'martyrs-of-uhud', name: 'Martyrs of Uhud', note: 'The resting place of the martyrs, including Hamzah (ra).' },
  ],
};
