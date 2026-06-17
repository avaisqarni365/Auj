'use client';

import type { ReactNode } from 'react';
import type { PublicUser } from '@auj/auth';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';

// Standard page frame: shared header + footer with the page body between them. Used by
// every public/account page so the chrome is identical. `center` vertically centres the
// body (auth/redeem cards); otherwise the body fills the remaining height.
export function SitePage({
  user,
  children,
  center = false,
}: {
  user?: PublicUser;
  children: ReactNode;
  center?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-sand-50">
      <SiteHeader user={user} />
      <main className={`flex-1 ${center ? 'grid place-items-center' : ''}`}>{children}</main>
      <SiteFooter />
    </div>
  );
}
