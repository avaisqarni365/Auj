// Imagery seam. Every visual "photo" slot in the app resolves through this manifest, so
// swapping the on-brand SVG artwork for real photography is a one-line change here (or a
// drop-in file replacement under public/img/scenes), with NO component edits.
//
// Today these point at committed, license-free SVG scene illustrations (Makkah, Madinah,
// Najaf/Karbala) so nothing renders as a "missing image". To ship real photography:
//   - replace public/img/scenes/<file> with a .jpg/.webp and update `file` below, OR
//   - set NEXT_PUBLIC_IMG_BASE to a CDN/origin that mirrors the same file names.
// Charged-in-EUR / visa rules etc. live elsewhere; this module is purely presentational.

export type SceneName = 'makkah' | 'madinah' | 'ziyarat';

interface Scene {
  file: string;
  /** Default alt text; callers may override for context. */
  alt: string;
}

export const SCENES: Record<SceneName, Scene> = {
  makkah: { file: 'makkah.webp', alt: 'Masjid al-Haram, Makkah — the Kaaba at dusk' },
  madinah: { file: 'madinah.webp', alt: 'Masjid an-Nabawi, Madinah — the green dome at sunset' },
  ziyarat: { file: 'ziyarat-iraq.svg', alt: 'Ziyarat — the golden shrine domes of Najaf and Karbala' },
};

const BASE = (process.env.NEXT_PUBLIC_IMG_BASE ?? '').replace(/\/$/, '');

/** Resolve a scene name to a servable URL (CDN base when configured, else /public). */
export function sceneSrc(name: SceneName): string {
  return `${BASE}/img/scenes/${SCENES[name].file}`;
}

export function sceneAlt(name: SceneName): string {
  return SCENES[name].alt;
}
