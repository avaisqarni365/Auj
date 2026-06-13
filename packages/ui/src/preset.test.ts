import { describe, it, expect } from 'vitest';
import { aujPreset } from './preset';

describe('aujPreset', () => {
  it('exposes the brand green and the full palette', () => {
    const { colors } = aujPreset.theme.extend;
    expect(colors.green['800']).toBe('#0F5132'); // brand
    expect(colors.green['500']).toBe('#2A9468'); // dark-mode primary
    expect(colors.sand.ink).toBe('#2A2620');
    expect(colors.accent['600']).toBe('#2F6F8F');
    expect(colors.gold).toBe('#C8A24A');
  });

  it('carries status tones with fg/bg pairs', () => {
    expect(aujPreset.theme.extend.colors.success).toEqual({ DEFAULT: '#1C7A4F', fg: '#156440', bg: '#DCEDE4' });
  });

  it('defines the IBM Plex superfamily and the type scale', () => {
    expect(aujPreset.theme.extend.fontFamily.serif[0]).toBe('"IBM Plex Serif"');
    expect(aujPreset.theme.extend.fontFamily.arabic[0]).toBe('"IBM Plex Sans Arabic"');
    expect(aujPreset.theme.extend.fontSize.base[0]).toBe('16px');
  });

  it('ships purposeful motion utilities (fast, soft-out)', () => {
    expect(aujPreset.theme.extend.transitionDuration.fast).toBe('140ms');
    expect(aujPreset.theme.extend.transitionTimingFunction['out-soft']).toContain('cubic-bezier');
    expect(Object.keys(aujPreset.theme.extend.animation)).toEqual(['fade-in', 'rise', 'pop']);
  });
});
