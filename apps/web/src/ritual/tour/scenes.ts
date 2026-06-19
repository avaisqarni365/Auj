// Virtual-tour scenes. Lightweight, no 3D dependency: a pannable wide/equirectangular image per
// stop. Drop 360° equirectangular photos in apps/web/public/img/ritual/tour/<id>.jpg; until they
// exist each scene falls back to a real wide Makkah/Madinah photo so the viewer is never empty.

const BASE = (process.env.NEXT_PUBLIC_IMG_BASE ?? '').replace(/\/$/, '');
const FALLBACK = `${BASE}/img/scenes/makkah-madinah.webp`;

interface SceneDef {
  id: string;
  title: string;
  subtitle: string;
  file: string;
}

const SCENES: SceneDef[] = [
  { id: 'miqat', title: 'Miqat & Ihram', subtitle: 'Where the journey begins', file: 'miqat.jpg' },
  { id: 'haram-entrance', title: 'Masjid al-Haram entrance', subtitle: 'Arriving at the House of Allah', file: 'haram-entrance.jpg' },
  { id: 'kaaba', title: 'The Kaaba & Tawaf', subtitle: 'Circling the Sacred House', file: 'kaaba.jpg' },
  { id: 'maqam-ibrahim', title: 'Maqam Ibrahim', subtitle: 'Where two Rak‘ahs are prayed', file: 'maqam-ibrahim.jpg' },
  { id: 'zamzam', title: 'Zamzam', subtitle: 'The blessed well', file: 'zamzam.jpg' },
  { id: 'safa-marwa', title: 'Safa & Marwah', subtitle: 'The walk of Sa‘i', file: 'safa-marwa.jpg' },
  { id: 'completion', title: 'Completion', subtitle: 'Umrah complete', file: 'completion.jpg' },
  { id: 'madinah', title: 'Madinah (optional)', subtitle: 'Masjid an-Nabawi', file: 'madinah.jpg' },
];

export interface TourScene {
  id: string;
  title: string;
  subtitle: string;
  src: string;
  fallbackSrc: string;
}

export function tourScenes(): TourScene[] {
  return SCENES.map((s) => ({
    id: s.id,
    title: s.title,
    subtitle: s.subtitle,
    src: `${BASE}/img/ritual/tour/${s.file}`,
    fallbackSrc: FALLBACK,
  }));
}
