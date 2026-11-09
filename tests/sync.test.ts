import { describe, expect, it } from 'vitest';
import { deepMerge, mergeSnapshots, sameSnapshot, SYNCED } from '../src/core/sync';

describe('progress merge between devices', () => {
  it('keeps the best of both for games, story and explorer', () => {
    const local = {
      'games.v1': { babylon: { best: [100, null, null], plays: 2 }, euclid: { best: [40, 70, null], plays: 3 } },
      'story.v1': { read: ['babylone', 'rhind'] },
      'progress.v1': { free: false, views: { 'a/b': { ex: [{ solved: true, attempts: 1, revealed: false }, { solved: false, attempts: 3, revealed: true }], read: true } } },
      'settings.v1': { music: false },
    };
    const remote = {
      'games.v1': { euclid: { best: [90, null, 55], plays: 1 }, duel: { best: [30, null, null], plays: 1 } },
      'story.v1': { read: ['rhind', 'zenon'] },
      'progress.v1': { free: true, views: { 'a/b': { ex: [{ solved: false, attempts: 4, revealed: true }, { solved: true, attempts: 2, revealed: false }], read: false } } },
    };
    const m = mergeSnapshots(local, remote) as Record<string, any>;
    expect(Object.keys(m).sort()).toEqual(['games.v1', 'progress.v1', 'story.v1']);
    expect(m['games.v1'].euclid).toEqual({ best: [90, 70, 55], plays: 3 });
    expect(m['games.v1'].babylon.best).toEqual([100, null, null]);
    expect(m['games.v1'].duel.best).toEqual([30, null, null]);
    expect(m['story.v1'].read).toEqual(['babylone', 'rhind', 'zenon']);
    expect(m['progress.v1'].free).toBe(true);
    // a solved, non-revealed attempt beats a revealed one, on either side
    expect(m['progress.v1'].views['a/b'].ex[0]).toEqual({ solved: true, attempts: 1, revealed: false });
    expect(m['progress.v1'].views['a/b'].ex[1]).toEqual({ solved: true, attempts: 2, revealed: false });
    expect(m['progress.v1'].views['a/b'].read).toBe(true);
  });

  it('unites dated lists and keeps « ok » self-assessments', () => {
    const a = { courses: { riemann: { pos: 120, done: false, ex: { e1: { solved: false, hints: 1, revealed: true, self: 'ko' } } } }, colles: [{ at: 1, score: 3 }, { at: 3, score: 5 }] };
    const b = { courses: { riemann: { pos: 300, done: true, ex: { e1: { solved: false, hints: 2, revealed: true, self: 'ok' } } } }, colles: [{ at: 2, score: 4 }, { at: 3, score: 5 }] };
    const m = deepMerge(a, b) as any;
    expect(m.courses.riemann.pos).toBe(300);
    expect(m.courses.riemann.done).toBe(true);
    expect(m.courses.riemann.ex.e1.self).toBe('ok');
    expect(m.colles.map((c: { at: number }) => c.at)).toEqual([1, 2, 3]);
  });

  it('merges notes from two devices and keeps deletions', () => {
    const local = { 'notes.v1': { notes: [{ at: 1, where: 'A', hash: '#/a', text: 'un' }, { at: 3, where: 'C', hash: '#/c', text: 'trois' }], deleted: ['3'] } };
    const remote = { 'notes.v1': { notes: [{ at: 2, where: 'B', hash: '#/b', text: 'deux' }, { at: 3, where: 'C', hash: '#/c', text: 'trois' }], deleted: [] } };
    const m = mergeSnapshots(local, remote) as any;
    expect(m['notes.v1'].notes.map((n: { at: number }) => n.at)).toEqual([1, 2, 3]);
    expect(m['notes.v1'].deleted).toEqual(['3']);
  });

  it('is idempotent and symmetric on what matters', () => {
    const a = { 'games.v1': { x: { best: [10, 20, null], plays: 1 } }, 'story.v1': { read: ['a'] } };
    const b = { 'games.v1': { x: { best: [15, null, 5], plays: 4 } }, 'story.v1': { read: ['b'] } };
    const ab = mergeSnapshots(a, b);
    expect(sameSnapshot(mergeSnapshots(ab, b), ab)).toBe(true);
    expect(sameSnapshot(mergeSnapshots(ab, ab), ab)).toBe(true);
    const ba = mergeSnapshots(b, a) as any;
    expect(ba['games.v1'].x).toEqual((ab as any)['games.v1'].x);
    expect(new Set(ba['story.v1'].read)).toEqual(new Set((ab as any)['story.v1'].read));
    expect(SYNCED).not.toContain('settings.v1');
  });
});
