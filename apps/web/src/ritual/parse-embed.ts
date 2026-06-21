// Parse a user-supplied video URL into an embeddable form.
// YouTube/Vimeo → iframe embed URL; direct media/blob/data → native <video>.
export type Embed = { kind: 'iframe' | 'video' | null; url: string };

export function parseEmbed(raw: string | undefined | null): Embed {
  const s = (raw || '').trim();
  if (!s) return { kind: null, url: '' };
  let m: RegExpMatchArray | null;
  if ((m = s.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{6,})/i))) {
    return { kind: 'iframe', url: `https://www.youtube.com/embed/${m[1]}` };
  }
  if ((m = s.match(/vimeo\.com\/(?:video\/)?(\d+)/i))) {
    return { kind: 'iframe', url: `https://player.vimeo.com/video/${m[1]}` };
  }
  if (/^(https?:|blob:|data:)/i.test(s)) return { kind: 'video', url: s };
  return { kind: null, url: '' };
}
