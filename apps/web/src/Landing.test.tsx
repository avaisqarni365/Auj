// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { PublicUser } from '@auj/auth';
import Landing from './Landing';

afterEach(cleanup);

const href = (el: HTMLElement | null): string | null => el?.getAttribute('href') ?? null;

const pilgrim: PublicUser = { id: '1', email: 'aisha@auj.example', displayName: 'Aisha Khan', role: 'PILGRIM', createdAt: 't' };
const agent: PublicUser = { id: '2', email: 'ops@hajjexpress.example', displayName: 'Hajj Express', role: 'AGENT', agentStatus: 'ACTIVE', createdAt: 't' };
const admin: PublicUser = { id: '3', email: 'admin@auj.example', displayName: 'Site Admin', role: 'ADMIN', createdAt: 't' };

describe('Landing — navigation (logged out)', () => {
  it('shows Log in → /login and Sign up → /signup', () => {
    render(<Landing />);
    expect(href(screen.getByRole('link', { name: 'Log in' }))).toBe('/login');
    expect(href(screen.getByRole('link', { name: 'Sign up' }))).toBe('/signup');
    expect(screen.queryByRole('button', { name: /Aisha|account/i })).toBeNull();
  });

  it('hero search links to /book with the default city + pax', () => {
    render(<Landing />);
    const cta = screen.getByRole('link', { name: /Search \d+ Umrah/ });
    expect(href(cta)).toBe('/book?city=MAKKAH&pax=4');
  });

  it('changing the destination updates the search link', async () => {
    const user = userEvent.setup();
    render(<Landing />);
    await user.selectOptions(screen.getByLabelText('Destination'), 'Madinah');
    expect(href(screen.getByRole('link', { name: /Search \d+ Umrah/ }))).toBe('/book?city=MADINAH&pax=4');
  });

  it('the pax stepper changes the search link', async () => {
    const user = userEvent.setup();
    render(<Landing />);
    await user.click(screen.getByLabelText('Increase'));
    expect(href(screen.getByRole('link', { name: /Search \d+ Umrah/ }))).toBe('/book?city=MAKKAH&pax=5');
  });

  it('switching the journey tab updates the count + destination label in the CTA', async () => {
    const user = userEvent.setup();
    render(<Landing />);
    await user.click(screen.getByRole('button', { name: 'Hajj' })); // tab is a button; nav "Hajj" is a link
    expect(screen.getByRole('link', { name: /Search 12 Hajj/ })).toBeTruthy();
  });

  it('the language toggle cycles EN → LT', async () => {
    const user = userEvent.setup();
    render(<Landing />);
    const btn = screen.getByLabelText('Switch language');
    expect(btn.textContent).toContain('EN');
    await user.click(btn);
    expect(btn.textContent).toContain('LT');
  });

  it('FAQ accordion reveals an answer on click', async () => {
    const user = userEvent.setup();
    render(<Landing />);
    await user.click(screen.getByRole('button', { name: /What currency am I charged in/ }));
    expect(screen.getByText(/Always EUR/)).toBeTruthy();
  });

  it('renders the primary nav links', () => {
    render(<Landing />);
    for (const label of ['Umrah', 'Hajj', 'Ziyarat', 'Packages', 'Track booking']) {
      expect(screen.getByRole('link', { name: label })).toBeTruthy();
    }
  });
});

describe('Landing — navigation (logged in)', () => {
  it('pilgrim: shows Book now → /book + account menu, hides Log in', () => {
    render(<Landing user={pilgrim} />);
    expect(href(screen.getByRole('link', { name: 'Book now' }))).toBe('/book');
    expect(screen.queryByRole('link', { name: 'Log in' })).toBeNull();
    expect(screen.getByRole('button', { name: 'AK' })).toBeTruthy(); // initials avatar
  });

  it('pilgrim account menu: Book a journey, My journey, Log out — no agent/admin', async () => {
    const user = userEvent.setup();
    render(<Landing user={pilgrim} />);
    await user.click(screen.getByRole('button', { name: 'AK' }));
    expect(href(screen.getByRole('link', { name: 'Book a journey' }))).toBe('/book');
    expect(href(screen.getByRole('link', { name: 'My journey' }))).toBe('/journey');
    expect(href(screen.getByRole('link', { name: 'Log out' }))).toBe('/logout'); // robust no-JS logout
    expect(screen.queryByRole('link', { name: 'Agent portal' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Admin console' })).toBeNull();
  });

  it('agent account menu exposes the Agent portal → /agent', async () => {
    const user = userEvent.setup();
    render(<Landing user={agent} />);
    await user.click(screen.getByRole('button', { name: 'HE' }));
    expect(href(screen.getByRole('link', { name: 'Agent portal' }))).toBe('/agent');
    expect(screen.queryByRole('link', { name: 'Admin console' })).toBeNull();
  });

  it('admin account menu exposes the Admin console → /admin (+ logout)', async () => {
    const user = userEvent.setup();
    render(<Landing user={admin} />);
    await user.click(screen.getByRole('button', { name: 'SA' }));
    expect(href(screen.getByRole('link', { name: 'Admin console' }))).toBe('/admin');
    expect(href(screen.getByRole('link', { name: 'Log out' }))).toBe('/logout');
    // admin is not an "agent", so the Agent-portal shortcut is not shown (the /agent
    // route guard still allows ADMIN by URL).
    expect(screen.queryByRole('link', { name: 'Agent portal' })).toBeNull();
  });
});
