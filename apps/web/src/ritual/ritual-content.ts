// Umrah Guide — ritual content as data (pure; unit-tested). Ordered to the canonical 15-step flow
// from .claude/skills/Umrah_Performing_wizard_Pilgrim_guide.md, matching the 15 designed step images
// (public/img/scenes/{1..15}). Each step's hero is its full designed infographic; the duas, counters,
// checklists and audio are the live interactive layer on top. English copy + Arabic duas (verbatim)
// with per-language meanings (EN/UR/FR/ID/TR/BN). All ritual text + translations flagged for review
// (/docs/assumptions.md A6/A7).

export type ApproxMin = number | 'ongoing' | null;

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
  step: number;
  phase: string;
  title: string;
  subtitle?: string;
  approxMin: ApproxMin;
  intro?: string;
  checklist?: string[];
  duas?: Dua[];
  counter?: RitualCounter;
  forMen?: string[];
  forWomen?: string[];
  ziyarat?: 'makkah' | 'madinah';
  hadith?: string;
  tip?: string;
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
    phase: 'Before you begin',
    title: 'Niyyah (Intention)',
    subtitle: 'The first and most important step',
    approxMin: 2,
    intro: 'Clear your heart and make the intention to perform Umrah for the sake of Allah. Sincerity is the foundation of every act of worship.',
    duas: [NIYYAH_DUA],
    hadith: '“Actions are but by intentions…” — Sahih Bukhari 1',
    checklist: ['I have prepared my intention'],
    next: 'Prepare for Ihram',
  },
  {
    key: 'ihram',
    step: 2,
    phase: 'Entering Ihram',
    title: 'Ihram (State of Purity)',
    subtitle: 'Prepare yourself to enter the state of Ihram',
    approxMin: 20,
    intro: 'Ihram is not just clothing — it is a state of purity, obedience and humility before Allah.',
    forMen: [
      'Ghusl (ritual bath) — purify yourself.',
      'Wear two white, unstitched sheets.',
      'Simple & modest — no stitched clothing, no head covering.',
      'Avoid restrictions — no perfume, no leather items.',
    ],
    forWomen: [
      'Ghusl (ritual bath) — purify yourself.',
      'Wear normal modest Islamic dress.',
      'Do not cover the face with a veil touching it; no gloves.',
      'You are now ready for Niyyah.',
    ],
    tip: 'Avoid arguments, sin and anything that breaks the sanctity of Ihram.',
    next: 'Make Niyyah at the Miqat',
  },
  {
    key: 'niyyah-miqat',
    step: 3,
    phase: 'Entering Ihram',
    title: 'Niyyah at the Miqat',
    subtitle: 'Make the intention for Umrah',
    approxMin: 1,
    intro: 'At the Miqat (boundary) or before crossing it, make your intention for Umrah for the sake of Allah and say:',
    duas: [NIYYAH_DUA],
    checklist: ['I have made my Niyyah at the Miqat'],
    next: 'Begin the Talbiyah',
  },
  {
    key: 'talbiyah',
    step: 4,
    phase: 'Entering Ihram',
    title: 'Talbiyah',
    subtitle: 'Declare your response to Allah’s call',
    approxMin: 'ongoing',
    intro: 'After making your intention, begin reciting the Talbiyah and continue often until you reach Masjid al-Haram.',
    duas: [TALBIYAH_DUA],
    tip: 'Talbiyah shows love, obedience and eagerness to visit His House.',
    next: 'I have started the Talbiyah',
  },
  {
    key: 'enter-haram',
    step: 5,
    phase: 'Arrival in Makkah',
    title: 'Enter Masjid al-Haram',
    subtitle: 'Arrive at the House of Allah',
    approxMin: null,
    intro: 'Enter with your right foot and the entry du‘a. At your first sight of the Kaaba, pause and make du‘a — a moment when du‘a is hoped to be accepted.',
    duas: [ENTRY_DUA],
    checklist: ['Entered Masjid al-Haram', 'Saw the Kaaba & made du‘a'],
    next: 'Begin Tawaf',
  },
  {
    key: 'tawaf-start',
    step: 6,
    phase: 'Tawaf',
    title: 'Start Tawaf',
    subtitle: 'Begin your seven circles',
    approxMin: 40,
    intro: 'Begin at the Black Stone (Hajar al-Aswad), keep the Kaaba on your left, and circle anti-clockwise. Tap “+1 round” as you complete each circuit.',
    counter: { kind: 'tawaf', total: 7 },
    tip: 'Men: uncover the right shoulder (idtiba‘) and walk briskly (raml) in the first three rounds. Keep the Kaaba on your left and do not push.',
    next: 'I have completed 7 rounds',
  },
  {
    key: 'tawaf-complete',
    step: 7,
    phase: 'Tawaf',
    title: 'Complete 7 Rounds of Tawaf',
    subtitle: 'All seven circuits around the Kaaba',
    approxMin: null,
    intro: 'You have circled the Kaaba seven times, ending at the Black Stone. There is no fixed du‘a — supplicate freely with whatever you know.',
    checklist: ['Completed 7 circuits of Tawaf'],
    next: 'Pray two Rak‘ahs',
  },
  {
    key: 'two-rakahs',
    step: 8,
    phase: 'After Tawaf',
    title: 'Pray 2 Rak‘ahs',
    subtitle: 'Behind Maqam Ibrahim, if possible',
    approxMin: 5,
    intro: 'Offer two units of voluntary prayer behind Maqam Ibrahim if possible — otherwise anywhere in the mosque. Afterwards, drink Zamzam water and make du‘a.',
    checklist: ['Prayed two Rak‘ahs', 'Drank Zamzam water & made du‘a'],
    tip: 'Recite Surah al-Kafirun in the first Rak‘ah and Surah al-Ikhlas in the second (recommended).',
    next: 'Go to Safa for Sa‘i',
  },
  {
    key: 'sai-start',
    step: 9,
    phase: 'Sa‘i',
    title: 'Sa‘i between Safa and Marwah',
    subtitle: 'Begin your seven circuits from Safa',
    approxMin: 35,
    intro: 'Proceed to Safa and recite the verse below. Safa → Marwah is 1, Marwah → Safa is 2, and so on — you finish at Marwah on the seventh. Tap “+1 passage” at each end.',
    duas: [SAFA_DUA],
    counter: { kind: 'sai', total: 7 },
    tip: 'Men walk briskly between the two green markers; everyone walks normally otherwise.',
    next: 'I have completed Sa‘i',
  },
  {
    key: 'sai-complete',
    step: 10,
    phase: 'Sa‘i',
    title: 'Complete Sa‘i',
    subtitle: 'Seven circuits, ending at Marwah',
    approxMin: null,
    intro: 'You have walked between Safa and Marwah seven times. This is the Sa‘i of Umrah — may Allah accept it from you.',
    checklist: ['Finished Sa‘i at Marwah (7 passages)'],
    next: 'Trim or shave hair',
  },
  {
    key: 'halq',
    step: 11,
    phase: 'Completing Umrah',
    title: 'Trim or Shave Hair',
    subtitle: 'The final step of Sa‘i',
    approxMin: 10,
    intro: 'After completing Sa‘i, trim or shave your hair. This marks the completion of the obligatory acts of Umrah.',
    forMen: ['Shave the whole head (Halq, preferred), or trim hair evenly from all of the head (Taqsir).'],
    forWomen: ['Gather the hair and cut a fingertip’s length (about 2–3 cm) from the ends.'],
    checklist: ['Hair trimmed / shaved'],
    next: 'Umrah complete',
  },
  {
    key: 'umrah-complete',
    step: 12,
    phase: 'Umrah Complete',
    title: 'Umrah Complete',
    subtitle: 'Alhamdulillah, your Umrah is complete',
    approxMin: null,
    intro: 'You have completed all the obligatory acts of Umrah — Tawaf, Sa‘i, two Rak‘ahs and trimming/shaving. You have left the state of Ihram. May Allah accept it from you.',
    next: 'Optional acts',
  },
  {
    key: 'optional-acts',
    step: 13,
    phase: 'After Umrah',
    title: 'Optional Acts & Recommended Deeds',
    subtitle: 'Strengthen your connection with Allah',
    approxMin: null,
    intro: 'These acts are not obligatory, but they bring great reward: extra Nawafil, reciting Qur’an, dhikr, sincere du‘a, charity, and visiting important places.',
    ziyarat: 'makkah',
    tip: 'Quality is better than quantity — Allah looks at the heart.',
    next: 'Make final du‘a',
  },
  {
    key: 'final-dua',
    step: 14,
    phase: 'After Umrah',
    title: 'Make Final Du‘a & Depart',
    subtitle: 'A heartfelt farewell with gratitude',
    approxMin: null,
    intro: 'Before leaving Makkah, make heartfelt du‘a, thank Allah for this blessed opportunity, and seek His acceptance. Depart with good manners and a heart full of gratitude.',
    checklist: ['Made my final du‘a'],
    next: 'Visit Madinah',
  },
  {
    key: 'visit-madinah',
    step: 15,
    phase: 'Journey Complete',
    title: 'Visit Madinah & Journey Complete',
    subtitle: 'May Allah accept your Umrah',
    approxMin: null,
    intro: 'If possible, visit Madinah to pray in Masjid an-Nabawi and send salutations upon the Prophet ﷺ (the Rawdah slot is booked in the Nusuk app). Alhamdulillah — your journey is complete.',
    ziyarat: 'madinah',
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
