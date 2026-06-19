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
