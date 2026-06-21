import { describe, it, expect } from 'vitest';
import { textPdf } from './pdf';

const text = (b: Uint8Array): string => Buffer.from(b).toString('latin1');

describe('textPdf', () => {
  it('produces a structurally valid single-page PDF with the content', () => {
    const pdf = textPdf(['AUJ — Certificate', 'Booking: BK-1', 'Customer: Imran Ali']);
    const s = text(pdf);
    expect(s.startsWith('%PDF-1.4')).toBe(true);
    expect(s).toContain('/Type/Catalog');
    expect(s).toContain('xref');
    expect(s.trimEnd().endsWith('%%EOF')).toBe(true);
    expect(s).toContain('(Booking: BK-1)');
  });

  it('escapes parentheses and backslashes in text', () => {
    const s = text(textPdf(['cover (EUR) \\ guarantee']));
    expect(s).toContain('(cover \\(EUR\\) \\\\ guarantee)');
  });
});
