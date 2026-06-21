import { describe, it, expect } from 'vitest';
import { parseEmbed } from './parse-embed';

describe('parseEmbed', () => {
  it('maps YouTube watch/short/youtu.be links to an embed iframe', () => {
    expect(parseEmbed('https://www.youtube.com/watch?v=abc123XYZ')).toEqual({ kind: 'iframe', url: 'https://www.youtube.com/embed/abc123XYZ' });
    expect(parseEmbed('https://youtu.be/abc123XYZ')).toEqual({ kind: 'iframe', url: 'https://www.youtube.com/embed/abc123XYZ' });
  });

  it('maps Vimeo links to a player iframe', () => {
    expect(parseEmbed('https://vimeo.com/123456789')).toEqual({ kind: 'iframe', url: 'https://player.vimeo.com/video/123456789' });
  });

  it('treats direct media / blob / data URLs as native video', () => {
    expect(parseEmbed('https://cdn.example.com/clip.mp4')).toEqual({ kind: 'video', url: 'https://cdn.example.com/clip.mp4' });
    expect(parseEmbed('blob:abc').kind).toBe('video');
  });

  it('returns null kind for empty or unrecognised input', () => {
    expect(parseEmbed('')).toEqual({ kind: null, url: '' });
    expect(parseEmbed('not a url').kind).toBe(null);
  });
});
