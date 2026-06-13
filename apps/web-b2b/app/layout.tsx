import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'AUJ — Agent Portal',
  description: 'B2B agent portal: wallet, multi-passenger bookings, markups, quotations.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
