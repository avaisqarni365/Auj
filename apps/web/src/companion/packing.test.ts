import { describe, it, expect } from 'vitest';
import { build, totalItems } from './packing';

const find = (s: ReturnType<typeof build>, id: string) => s.flatMap((x) => x.items).find((i) => i.id === id);

describe('packing organizer', () => {
  it('quantities scale with stay length', () => {
    const d11 = build('Men', 11);
    const d30 = build('Men', 30);
    expect(find(d11, 'underwear')!.qty).toBe(11); // per:1
    expect(find(d30, 'underwear')!.qty).toBe(30);
    expect(find(d30, 'socks')!.qty).toBe(Math.ceil(30 / 2));
  });

  it('Diabetic profile adds its supplies; Men do not get them', () => {
    const dia = build('Diabetic', 21);
    const men = build('Men', 21);
    expect(find(dia, 'glucometer')).toBeTruthy();
    expect(find(dia, 'insulin')).toBeTruthy();
    expect(find(men, 'glucometer')).toBeUndefined();
  });

  it('profile gating: abaya for Women/Family, ihram for Men/Family', () => {
    expect(find(build('Women', 11), 'abaya')).toBeTruthy();
    expect(find(build('Women', 11), 'ihram')).toBeUndefined();
    expect(find(build('Men', 11), 'ihram')).toBeTruthy();
    expect(totalItems(build('Family', 11))).toBeGreaterThan(totalItems(build('Men', 11)));
  });
});
