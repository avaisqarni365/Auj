import { describe, it, expect } from 'vitest';
import { SCENE_SEED, resolveScenes, tourScenes, type SceneDef } from './scenes';

describe('virtual-tour scenes', () => {
  it('seeds 8 scenes, each with an id/file and EN+AR text (Arabic verbatim)', () => {
    expect(SCENE_SEED).toHaveLength(8);
    for (const s of SCENE_SEED) {
      expect(s.id.trim(), `${s.id} id`).toBeTruthy();
      expect(s.file.trim(), `${s.id} file`).toBeTruthy();
      expect(s.title.en?.trim(), `${s.id} en`).toBeTruthy();
      expect(s.title.ar?.trim(), `${s.id} ar`).toBeTruthy();
    }
  });

  it('resolveScenes localizes text and falls back to EN for a missing language', () => {
    const def: SceneDef = { id: 'x', file: 'x.jpg', title: { en: 'Kaaba', ar: 'الكعبة' }, subtitle: { en: 'sub' }, desc: { en: 'desc' } };
    expect(resolveScenes([def], 'ar')[0]!.title).toBe('الكعبة'); // Arabic picked
    expect(resolveScenes([def], 'fr')[0]!.title).toBe('Kaaba'); // unknown lang → EN fallback
    expect(resolveScenes([def], 'ur')[0]!.subtitle).toBe('sub'); // missing UR subtitle → EN
  });

  it('builds image/video/narration src paths (narration is per-language)', () => {
    const def: SceneDef = { id: 'kaaba', file: 'kaaba.jpg', title: { en: 'K' }, subtitle: { en: '' }, desc: { en: '' } };
    const sc = resolveScenes([def], 'ur')[0]!;
    expect(sc.src).toContain('/img/ritual/tour/kaaba.jpg');
    expect(sc.videoSrc).toContain('/video/ritual/tour/kaaba.mp4');
    expect(sc.narrationSrc).toContain('/audio/ritual/tour/kaaba.ur.mp3');
    expect(sc.fallbackSrc).toContain('/img/scenes/');
  });

  it('tourScenes returns all seed scenes localized for the chosen language', () => {
    const ur = tourScenes('ur');
    expect(ur).toHaveLength(8);
    expect(ur.every((s) => s.title.trim().length > 0)).toBe(true);
  });
});
