import { describe, it, expect } from 'vitest';
import en from '../messages/en.json';
import lt from '../messages/lt.json';
import ur from '../messages/ur.json';
import ar from '../messages/ar.json';

// Recursively collect the dotted key paths of an object (structure, not values).
function keyPaths(obj: unknown, prefix = ''): string[] {
  if (obj === null || typeof obj !== 'object') return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    keyPaths(v, prefix ? `${prefix}.${k}` : k),
  );
}

describe('smartPlanner i18n', () => {
  const enKeys = keyPaths((en as Record<string, unknown>).smartPlanner).sort();

  it('English catalog has the namespace with the expected shape', () => {
    expect(enKeys.length).toBeGreaterThan(40);
    expect(enKeys).toContain('steps.origin.label');
    expect(enKeys).toContain('routes.evisa.body');
    expect(enKeys).toContain('railValues.paxRooms');
  });

  it.each([
    ['lt', lt],
    ['ur', ur],
    ['ar', ar],
  ])('%s catalog has the exact same smartPlanner keys (no missing/extra)', (_name, cat) => {
    const keys = keyPaths((cat as Record<string, unknown>).smartPlanner).sort();
    expect(keys).toEqual(enKeys);
  });

  it('each locale actually translates a sample value (not the English string)', () => {
    type Sp = { smartPlanner: { back: string; next: string; tabs: { current: string } } };
    const sp = (c: unknown): Sp['smartPlanner'] => (c as Sp).smartPlanner;
    expect(sp(ar).back).not.toBe(sp(en).back);
    expect(sp(ur).tabs.current).not.toBe(sp(en).tabs.current);
    expect(sp(lt).next).not.toBe(sp(en).next);
  });
});
