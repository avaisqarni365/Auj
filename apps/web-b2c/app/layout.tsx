import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'AUJ — Pilgrimage & Travel',
  description: 'Umrah, Hajj and general travel for EU travellers and the Pakistani diaspora.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  // The funnel demo is English/LTR by default; the locale switcher on the page
  // sets dir on a wrapper. A full build would drive <html lang/dir> from the route.
  return (
    <html lang="en" dir="ltr">
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
