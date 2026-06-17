import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { NextIntlClientProvider } from 'next-intl';
import { Shell } from './Shell';
import en from '../../../messages/en.json';
import ar from '../../../messages/ar.json';

const render = (locale: string, messages: Record<string, unknown>): string =>
  renderToStaticMarkup(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Shell agencyName="Al Noor" walletLabel="€6,000.00">
        <div />
      </Shell>
    </NextIntlClientProvider>,
  );

describe('agent shell chrome localizes', () => {
  it('renders English nav + greeting by default', () => {
    const html = render('en', en);
    expect(html).toContain('Home'); // nav
    expect(html).toContain('Salaam, Al Noor'); // greeting with name
    expect(html).toContain('+ New booking');
  });

  it('renders Arabic chrome under the ar catalog', () => {
    const html = render('ar', ar);
    expect(html).toContain('الرئيسية'); // nav "home"
    expect(html).toContain('السلام عليكم، Al Noor'); // greeting interpolates the name
    expect(html).not.toContain('+ New booking'); // English chrome is gone
  });
});
