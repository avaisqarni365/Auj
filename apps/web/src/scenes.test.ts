import { describe, it, expect } from 'vitest';
import { SCENES, sceneSrc, sceneAlt, type SceneName } from './scenes';

const NAMES = Object.keys(SCENES) as SceneName[];

describe('scenes manifest', () => {
  it('every scene has a file and descriptive alt', () => {
    for (const name of NAMES) {
      expect(SCENES[name].file).toMatch(/\.svg$/);
      expect(sceneAlt(name).length).toBeGreaterThan(8);
    }
  });

  it('resolves servable /img/scenes paths by default', () => {
    expect(sceneSrc('makkah')).toBe('/img/scenes/makkah-haram.svg');
    expect(sceneSrc('madinah')).toBe('/img/scenes/madinah-nabawi.svg');
    expect(sceneSrc('ziyarat')).toBe('/img/scenes/ziyarat-iraq.svg');
  });
});
