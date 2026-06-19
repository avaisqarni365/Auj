// Umrah Guide — ritual content as data (pure; unit-tested). English copy for v1, flagged for
// scholarly review (see /docs/assumptions.md). Arabic dua text renders verbatim regardless of UI
// locale. Translations to LT/UR/AR are a later drop-in (content lives here, not in components).

export type ApproxMin = number | 'ongoing' | null;

export interface Dua {
  /** Sacred Arabic text — shown verbatim, RTL, never translated away. */
  arabic: string;
  translit: string;
  translation: string;
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
  phase: string;
  title: string;
  /** Minutes (point estimate), 'ongoing' (recite continuously), or null (no time badge). */
  approxMin: ApproxMin;
  intro?: string;
  instructions?: string[];
  forMen?: string[];
  forWomen?: string[];
  checklist?: string[];
  dua?: Dua;
  counter?: RitualCounter;
  /** Image manifest key (resolved by ritual-images.ts, with a scene fallback). */
  image: string;
  /** Primary button label. */
  next: string;
}

export const RITUAL_STEPS: RitualStep[] = [
  {
    key: 'welcome',
    phase: 'Before you begin',
    title: 'Welcome to your Umrah Guide',
    approxMin: null,
    intro:
      'This guide walks you through Umrah one step at a time — with the supplications, simple checklists, and counters for Tawaf and Sa’i. Move at your own pace; your progress is saved on this device, so you can close the app and resume.',
    instructions: [
      'Each screen shows one action and roughly how long it takes.',
      'A timer starts when you begin and shows your total time at the end.',
      'This is guidance for convenience — always follow your group’s scholar and official sources.',
    ],
    image: 'welcome',
    next: 'Begin',
  },
  {
    key: 'plan',
    phase: 'Phase 1 · Before travel',
    title: 'Plan your Umrah',
    approxMin: 2,
    intro: 'A quick readiness check before you set off. Tick what is ready.',
    checklist: [
      'Flights booked (departure country & arrival airport)',
      'Travel dates confirmed',
      'Hotel booked in Makkah / Madinah',
      'Travelling as a group or individually decided',
    ],
    instructions: ['Next we explain the Miqat — the boundary where you enter the state of Ihram.'],
    image: 'travel',
    next: 'Continue to Miqat',
  },
  {
    key: 'miqat',
    phase: 'Phase 1 · Before travel',
    title: 'The Miqat',
    approxMin: 3,
    intro:
      'The Miqat is the appointed boundary. You must enter Ihram (intention + dress) before crossing it. If you fly into Jeddah, you usually enter Ihram before landing (the crew announces the Miqat).',
    instructions: [
      'Dhul-Hulayfah (Abyar Ali) — for those coming from / via Madinah.',
      'Yalamlam — for those coming from Yemen / many flights from the south & east.',
      'Qarn al-Manazil (As-Sayl) — for those from Najd / Taif.',
      'Al-Juhfah (Rabigh) — for those from the direction of Syria, Egypt, the Maghreb.',
      'Dhat Irq — for those from Iraq.',
    ],
    image: 'miqat',
    next: 'Prepare for Ihram',
  },
  {
    key: 'ihram',
    phase: 'Phase 2 · Entering Ihram',
    title: 'Prepare for Ihram',
    approxMin: 20,
    intro: 'Purify, dress, and ready yourself to make the intention.',
    forMen: [
      'Perform Ghusl (a full ritual bath) if able.',
      'Wear two clean, white, unstitched cloths (izar + rida).',
      'No stitched clothing, no head covering, no perfume after Ihram.',
    ],
    forWomen: [
      'Wear normal modest Islamic dress (any colour).',
      'Do not cover the face with a veil that touches the face, and do not wear gloves.',
      'Perform Ghusl if able.',
    ],
    checklist: ['Performed Ghusl', 'Wearing Ihram', 'Ready for Niyyah'],
    image: 'ihram',
    next: 'Make my intention',
  },
  {
    key: 'niyyah',
    phase: 'Phase 2 · Entering Ihram',
    title: 'Make the Niyyah (intention)',
    approxMin: 1,
    intro: 'At or just before the Miqat, make the intention for Umrah and say:',
    dua: {
      arabic: 'لَبَّيْكَ اللَّهُمَّ عُمْرَةً',
      translit: 'Labbayka Allāhumma ‘Umrah',
      translation: 'Here I am, O Allah, (in answer to Your call) for Umrah.',
      source: 'Reported from the Prophet ﷺ — Sahih Muslim.',
      audio: 'niyyah',
    },
    checklist: ['I have made my intention for Umrah'],
    image: 'niyyah',
    next: 'Begin the Talbiyah',
  },
  {
    key: 'talbiyah',
    phase: 'Phase 2 · Entering Ihram',
    title: 'Recite the Talbiyah',
    approxMin: 'ongoing',
    intro: 'Begin reciting the Talbiyah and continue, often, until you reach Masjid al-Haram.',
    dua: {
      arabic:
        'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيكَ لَكَ',
      translit:
        'Labbayka Allāhumma labbayk, labbayka lā sharīka laka labbayk, innal-ḥamda wan-ni‘mata laka wal-mulk, lā sharīka lak',
      translation:
        'Here I am, O Allah, here I am. Here I am, You have no partner, here I am. Truly all praise, grace and dominion are Yours. You have no partner.',
      source: 'Bukhari & Muslim.',
      audio: 'talbiyah',
    },
    image: 'talbiyah',
    next: 'I have reached the Haram',
  },
  {
    key: 'kaaba-arrival',
    phase: 'Phase 3 · Arrival in Makkah',
    title: 'Enter Masjid al-Haram',
    approxMin: null,
    intro:
      'Enter with your right foot and the entry supplication. At your first sight of the Kaaba, pause — this is a moment when supplication is hoped to be accepted. Make your personal du‘a.',
    checklist: ['Entered the mosque', 'First sight of the Kaaba', 'Made personal du‘a'],
    image: 'kaaba-arrival',
    next: 'Begin Tawaf',
  },
  {
    key: 'tawaf',
    phase: 'Phase 4 · Tawaf',
    title: 'Tawaf — seven circuits',
    approxMin: 40,
    intro:
      'Start at the Black Stone (Hajar al-Aswad) corner and circle the Kaaba anti-clockwise, seven times. Tap “+1 round” as you complete each circuit. Time varies a lot with the crowd.',
    instructions: [
      'Face / gesture to the Black Stone to begin, saying “Bismillah, Allahu Akbar”.',
      'Men: uncover the right shoulder (idtiba‘) and walk briskly (raml) in the first three rounds.',
      'There is no fixed du‘a — supplicate freely; between the Yemeni corner and the Black Stone, “Rabbana atina fid-dunya hasanah…” is recommended.',
    ],
    counter: { kind: 'tawaf', total: 7 },
    image: 'tawaf',
    next: 'Pray two Rak‘ahs',
  },
  {
    key: 'maqam-ibrahim',
    phase: 'Phase 4 · Tawaf',
    title: 'Pray two Rak‘ahs',
    approxMin: 5,
    intro:
      'After Tawaf, pray two short Rak‘ahs — behind Maqam Ibrahim if you can reach it without crowding, otherwise anywhere in the mosque.',
    instructions: [
      'Recite Surah al-Kafirun in the first Rak‘ah and Surah al-Ikhlas in the second (recommended).',
    ],
    checklist: ['Completed two Rak‘ahs'],
    image: 'maqam-ibrahim',
    next: 'Drink Zamzam',
  },
  {
    key: 'zamzam',
    phase: 'Phase 4 · Tawaf',
    title: 'Drink Zamzam',
    approxMin: 5,
    intro: 'Drink your fill of Zamzam water and make du‘a — Zamzam is for whatever it is drunk for.',
    checklist: ['Drank Zamzam water', 'Made du‘a'],
    image: 'zamzam',
    next: 'Go to Safa',
  },
  {
    key: 'safa',
    phase: 'Phase 5 · Sa‘i',
    title: 'Go to Safa',
    approxMin: 2,
    intro: 'Proceed to Mount Safa to begin Sa‘i. As you approach, recite:',
    dua: {
      arabic: 'إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَائِرِ اللَّهِ',
      translit: 'Inna ṣ-Ṣafā wal-Marwata min sha‘ā’irillāh',
      translation: 'Indeed, Safa and Marwah are among the symbols of Allah.',
      source: 'Qur’an 2:158.',
    },
    instructions: ['At Safa, face the Kaaba, raise your hands, praise Allah and make du‘a.'],
    checklist: ['Reached Safa'],
    image: 'safa',
    next: 'Begin Sa‘i',
  },
  {
    key: 'sai',
    phase: 'Phase 5 · Sa‘i',
    title: 'Sa‘i — seven passages',
    approxMin: 35,
    intro:
      'Walk between Safa and Marwah seven times. Safa → Marwah is 1, Marwah → Safa is 2, and so on — you finish at Marwah on the seventh. Tap “+1 passage” at each end.',
    instructions: [
      'Men: walk briskly between the two green markers; everyone walks normally otherwise.',
      'Supplicate freely throughout; there is no fixed du‘a for the walk.',
    ],
    counter: { kind: 'sai', total: 7 },
    image: 'sai',
    next: 'Hair-cutting',
  },
  {
    key: 'halq',
    phase: 'Phase 6 · Complete Umrah',
    title: 'Hair-cutting (Halq / Taqsir)',
    approxMin: 10,
    intro: 'The final rite. After this you leave the state of Ihram.',
    forMen: ['Shave the whole head (Halq, preferred) — or trim hair evenly from all of the head (Taqsir).'],
    forWomen: ['Gather the hair and cut a fingertip’s length (about 2–3 cm) from the ends.'],
    checklist: ['Hair cut completed'],
    image: 'halq',
    next: 'Complete my Umrah',
  },
  {
    key: 'complete',
    phase: 'Phase 6 · Complete Umrah',
    title: 'Your Umrah is complete',
    approxMin: null,
    intro:
      'May Allah accept your Umrah. You have left the state of Ihram and its restrictions are lifted. Add a personal note to remember this day, then explore the places of ziyarah.',
    image: 'complete',
    next: 'View the Ziyarat guide',
  },
  {
    key: 'ziyarat',
    phase: 'Optional · Ziyarat',
    title: 'Ziyarat guide',
    approxMin: null,
    intro: 'Notable places to visit in Makkah and Madinah. Always respect local etiquette and guidance.',
    image: 'ziyarat',
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
