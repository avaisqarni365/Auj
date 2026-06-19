// Image manifest for the Umrah Guide. Each screen maps to a file under /img/ritual/ with a scene
// fallback, so a missing file never renders broken. Mirrors scenes.ts (incl. the CDN base override).
// Drop files in apps/web/public/img/ritual/ — see that folder's README for exact filenames.
import { sceneSrc, type SceneName } from '../scenes';

const BASE = (process.env.NEXT_PUBLIC_IMG_BASE ?? '').replace(/\/$/, '');

interface RitualImg {
  file: string;
  fallback: SceneName;
  alt: string;
}

const RITUAL_IMAGES: Record<string, RitualImg> = {
  welcome: { file: 'welcome.webp', fallback: 'makkah', alt: 'Pilgrims at Masjid al-Haram' },
  travel: { file: 'travel.webp', fallback: 'makkah', alt: 'Beginning the journey for Umrah' },
  miqat: { file: 'miqat.webp', fallback: 'makkah', alt: 'Approaching the Miqat' },
  ihram: { file: 'ihram.webp', fallback: 'makkah', alt: 'The white cloths of Ihram' },
  niyyah: { file: 'niyyah.webp', fallback: 'makkah', alt: 'Making the intention for Umrah' },
  talbiyah: { file: 'talbiyah.webp', fallback: 'makkah', alt: 'Reciting the Talbiyah' },
  'kaaba-arrival': { file: 'kaaba-arrival.webp', fallback: 'makkah', alt: 'First sight of the Kaaba' },
  tawaf: { file: 'tawaf.webp', fallback: 'makkah', alt: 'Tawaf around the Kaaba' },
  'maqam-ibrahim': { file: 'maqam-ibrahim.webp', fallback: 'makkah', alt: 'Praying near Maqam Ibrahim' },
  zamzam: { file: 'zamzam.webp', fallback: 'makkah', alt: 'Zamzam water' },
  safa: { file: 'safa.webp', fallback: 'makkah', alt: 'Mount Safa' },
  sai: { file: 'sai.webp', fallback: 'makkah', alt: 'Sa‘i between Safa and Marwah' },
  halq: { file: 'halq.webp', fallback: 'makkah', alt: 'Hair-cutting to complete Umrah' },
  'end-ihram': { file: 'end-ihram.webp', fallback: 'makkah', alt: 'Exiting the state of Ihram' },
  'visit-makkah': { file: 'visit-makkah.webp', fallback: 'makkah', alt: 'Places of ziyarah in Makkah' },
  'make-dua': { file: 'make-dua.webp', fallback: 'makkah', alt: 'Making du‘a' },
  'visit-madinah': { file: 'visit-madinah.webp', fallback: 'madinah', alt: 'Masjid an-Nabawi, Madinah' },
  'good-deeds': { file: 'good-deeds.webp', fallback: 'madinah', alt: 'Continuing good deeds' },
  'umrah-complete': { file: 'umrah-complete.webp', fallback: 'madinah', alt: 'Umrah complete' },
  complete: { file: 'complete.webp', fallback: 'madinah', alt: 'Umrah complete' },
  ziyarat: { file: 'ziyarat.webp', fallback: 'madinah', alt: 'Places of ziyarah' },
};

export interface ResolvedImage {
  src: string;
  fallbackSrc: string;
  alt: string;
}

export function ritualImage(key: string): ResolvedImage {
  const entry = RITUAL_IMAGES[key];
  if (!entry) {
    const s = sceneSrc('makkah');
    return { src: s, fallbackSrc: s, alt: '' };
  }
  return { src: `${BASE}/img/ritual/${entry.file}`, fallbackSrc: sceneSrc(entry.fallback), alt: entry.alt };
}

export function ziyaratImage(city: 'makkah' | 'madinah', slug: string): ResolvedImage {
  return {
    src: `${BASE}/img/ritual/ziyarat/${city}/${slug}.webp`,
    fallbackSrc: sceneSrc(city),
    alt: '',
  };
}

/** URL for an optional dua audio asset (player is hidden until the file exists). */
export function ritualAudioSrc(key: string): string {
  return `${BASE}/audio/ritual/${key}.mp3`;
}

// The full designed infographic per step (uploaded under public/img/scenes — filenames are as
// provided, hence the mixed casing). Each wizard step shows this as its hero. Step keys match
// RITUAL_STEPS in ritual-content.ts.
const STEP_DESIGN: Record<string, string> = {
  niyyah: '1_Umrah.webp',
  ihram: '2_Umrah.webp',
  'niyyah-miqat': '3_Umrah.webp',
  talbiyah: '4_umrah.webp',
  'enter-haram': '5_Umrah.webp',
  'tawaf-start': 'Umrah_6.webp',
  'tawaf-complete': 'Umrah_7.webp',
  'two-rakahs': 'Umrah_8.webp',
  'sai-start': 'Umrah_9.webp',
  'sai-complete': 'Umrah_10.webp',
  halq: '11_Umrah.webp',
  'umrah-complete': '12_Umrah.webp',
  'optional-acts': '13_umrah.webp',
  'final-dua': '14_Umrah.webp',
  'visit-madinah': '15_Umrah.webp',
};

/** Full designed step image URL (or null if none mapped — then the wizard shows no poster). */
export function stepDesignImage(key: string): string | null {
  const f = STEP_DESIGN[key];
  return f ? `${BASE}/img/scenes/${encodeURIComponent(f)}` : null;
}
