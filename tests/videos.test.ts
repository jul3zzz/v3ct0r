import { describe, expect, it } from 'vitest';
import { VIDEOS, videoUrl } from '../src/shell/videos';
import { MODULES } from '../src/modules/registry';

const views = MODULES.flatMap((m) => m.vizs.map((v) => `${m.id}/${v.id}`));

describe('YouTube suggestions (src/modules/videos.json)', () => {
  it('every explorer view has 1 to 3 videos, and every entry is a real view', () => {
    for (const v of views) {
      const n = VIDEOS[v]?.length ?? 0;
      expect(n, v).toBeGreaterThanOrEqual(1);
      expect(n, v).toBeLessThanOrEqual(3);
    }
    for (const k of Object.keys(VIDEOS)) expect(views, k).toContain(k);
  });

  it('entries are complete: YouTube id, language, title and channel checked by videos:check', () => {
    for (const [view, list] of Object.entries(VIDEOS)) {
      expect(new Set(list.map((x) => x.id)).size, `${view}: doublon`).toBe(list.length);
      for (const x of list) {
        expect(x.id, view).toMatch(/^[\w-]{11}$/);
        expect(['fr', 'en'], `${view} ${x.id}`).toContain(x.lang);
        expect(x.title?.length ?? 0, `${view} ${x.id}: titre (npm run videos:check -- --write)`).toBeGreaterThan(3);
        expect(x.channel?.length ?? 0, `${view} ${x.id}: chaîne`).toBeGreaterThan(1);
        if (x.len) expect(x.len, `${view} ${x.id}`).toMatch(/^(\d+:)?\d{1,2}:\d{2}$/);
      }
    }
  });

  it('links point to youtube.com/watch only', () => {
    expect(videoUrl('R6ge0QBu3Nk')).toBe('https://www.youtube.com/watch?v=R6ge0QBu3Nk');
  });
});
