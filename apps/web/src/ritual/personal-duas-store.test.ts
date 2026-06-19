// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { deleteDua, exportDuas, listDuas, saveDua, togglePin } from './personal-duas-store';

describe('Personal duas store', () => {
  beforeEach(() => localStorage.clear());

  it('creates, lists by step, and ignores empty text', () => {
    expect(saveDua({ stepKey: 'niyyah', text: '   ', lang: 'en' })).toBeNull();
    const a = saveDua({ stepKey: 'niyyah', text: 'O Allah accept my Umrah', lang: 'en' });
    expect(a?.id).toBeTruthy();
    saveDua({ stepKey: 'tawaf-start', text: 'For my parents', lang: 'ur' });
    expect(listDuas('niyyah')).toHaveLength(1);
    expect(listDuas()).toHaveLength(2);
  });

  it('updates by id, pins to the top, and deletes', () => {
    const a = saveDua({ stepKey: 'niyyah', text: 'first', lang: 'en' })!;
    const b = saveDua({ stepKey: 'niyyah', text: 'second', lang: 'en' })!;
    const updated = saveDua({ id: a.id, stepKey: 'niyyah', text: 'first edited', lang: 'fr' });
    expect(updated?.text).toBe('first edited');
    expect(updated?.lang).toBe('fr');

    togglePin(a.id);
    expect(listDuas('niyyah')[0]?.id).toBe(a.id); // pinned floats to top

    deleteDua(b.id);
    expect(listDuas('niyyah').map((d) => d.id)).toEqual([a.id]);
  });

  it('exports valid JSON of all duas', () => {
    saveDua({ stepKey: 'niyyah', text: 'x', lang: 'en' });
    const parsed = JSON.parse(exportDuas());
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toHaveLength(1);
  });
});
