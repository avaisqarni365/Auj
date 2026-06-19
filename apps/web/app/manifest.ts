import type { MetadataRoute } from 'next';

// Web app manifest → makes AUJ installable (Add to Home Screen) and enables offline use of the
// Umrah Guide while travelling. Served at /manifest.webmanifest and auto-linked by Next.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AUJ — Pilgrimage & travel',
    short_name: 'AUJ',
    description: 'Umrah, Hajj & travel — step-by-step Umrah Guide, packages, e-Visa guidance.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#ECE7DD',
    theme_color: '#0f5132',
    icons: [
      { src: '/img/brand/auj-logo.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/img/brand/auj-logo.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/img/brand/auj-logo.png', sizes: 'any', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
