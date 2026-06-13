import type { ReactNode } from 'react';
import { IBM_Plex_Mono, IBM_Plex_Sans, IBM_Plex_Sans_Arabic, IBM_Plex_Serif } from 'next/font/google';
import './globals.css';

const sans = IBM_Plex_Sans({ subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600', '700'], variable: '--font-sans', display: 'swap' });
const serif = IBM_Plex_Serif({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-serif', display: 'swap' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono', display: 'swap' });
const arabic = IBM_Plex_Sans_Arabic({ subsets: ['arabic'], weight: ['400', '500', '600', '700'], variable: '--font-arabic', display: 'swap' });

export const metadata = {
  title: 'AUJ — Pilgrimage & Travel',
  description: 'Umrah, Hajj and general travel for EU travellers and the Pakistani diaspora.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${sans.variable} ${serif.variable} ${mono.variable} ${arabic.variable}`}>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
