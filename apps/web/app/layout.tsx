import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'AUJ — Pilgrimage & travel',
  description: 'Umrah, Hajj & Ziyarat for the EU and the Pakistani diaspora — one cart, e-Visa guidance, EUR/PKR pricing.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
