import { describe, it, expect } from 'vitest';
import { SCENES, sceneSrc, sceneAlt, type SceneName } from './scenes';

const NAMES = Object.keys(SCENES) as SceneName[];

describe('scenes manifest', () => {
  it('every scene has an image file and descriptive alt', () => {
    for (const name of NAMES) {
      expect(SCENES[name].file).toMatch(/\.(svg|webp|jpg|jpeg|png)$/);
      expect(sceneAlt(name).length).toBeGreaterThan(8);
    }
  });

  it('resolves servable /img/scenes paths by default', () => {
    expect(sceneSrc('makkah')).toBe('/img/scenes/makkah.webp');
    expect(sceneSrc('madinah')).toBe('/img/scenes/madinah.webp');
    expect(sceneSrc('ziyarat')).toBe('/img/scenes/ziyarat-iraq.svg');
  });
});
