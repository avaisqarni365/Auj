'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { PublicUser } from '@auj/auth';
import { logoutAction } from './actions';

const ROLE_LABEL: Record<PublicUser['role'], string> = {
  PILGRIM: 'Pilgrim',
  AGENT: 'Travel agent',
  SUB_AGENT: 'Sub-agent',
  ADMIN: 'Administrator',
};

export function AccountMenu({ user }: { user: PublicUser }) {
  const [open, setOpen] = useState(false);
  const initials = user.displayName
    .split(' ')
    .map((s) => s.charAt(0))
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const isAgent = user.role === 'AGENT' || user.role === 'SUB_AGENT';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-green-800 text-[12.5px] font-semibold text-white"
      >
        {initials || '·'}
      </button>
      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-sand-200 bg-white py-1 shadow-[0_18px_44px_-18px_rgba(42,38,32,0.4)]">
          <div className="border-b border-sand-100 px-4 py-2.5">
            <div className="truncate text-sm font-semibold text-sand-ink">{user.displayName}</div>
            <div className="truncate text-[12px] text-sand-500">{user.email}</div>
            <div className="mt-1 inline-block rounded-full bg-sand-100 px-2 py-0.5 text-[11px] font-semibold text-sand-700">
              {ROLE_LABEL[user.role]}
              {isAgent && user.agentStatus !== 'ACTIVE' ? ` · ${user.agentStatus?.toLowerCase()}` : ''}
            </div>
          </div>
          <MenuLink href="/book">Book a journey</MenuLink>
          <MenuLink href="/journey">My journey</MenuLink>
          {isAgent ? <MenuLink href="/agent">Agent portal</MenuLink> : null}
          {user.role === 'ADMIN' ? <MenuLink href="/admin">Admin console</MenuLink> : null}
          <form action={logoutAction} className="border-t border-sand-100">
            <button type="submit" className="block w-full px-4 py-2.5 text-left text-sm font-medium text-danger-fg hover:bg-sand-50">
              Log out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function MenuLink({ href, children }: { href: string; children: string }) {
  return (
    <Link href={href} className="block px-4 py-2.5 text-sm font-medium text-sand-700 hover:bg-sand-50">
      {children}
    </Link>
  );
}
