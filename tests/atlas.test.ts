import { describe, expect, it } from 'vitest';
import { buildAtlas, dist, GALAXY, SYSTEM, type AtlasInput } from '../src/atlas/world';
import { MODULES } from '../src/modules/registry';
import { COURSES, TRACKS } from '../src/learn/courses';
import { GAMES } from '../src/games/registry';

const input: AtlasInput = {
  modules: MODULES.map((m) => ({ id: m.id, code: m.code, title: m.title, kanji: m.kanji, tagline: m.tagline, vizs: m.vizs.map((v) => ({ id: v.id, title: v.title, subtitle: v.subtitle })) })),
  tracks: TRACKS.map((t) => ({ id: t.id, title: t.title, courses: t.courses.map((id) => COURSES.get(id)!).map((c) => ({ id: c.meta.id, title: c.meta.title, subtitle: c.meta.subtitle, minutes: c.meta.minutes, ready: c.meta.status === 'ready' && c.hasScript })) })),
  intros: Object.fromEntries(MODULES.map((m) => [m.id, `intro-${m.id}`])),
  games: GAMES.map((g) => ({ id: g.id, module: g.module, title: g.title, sub: g.subtitle })),
};
const atlas = buildAtlas(input);

describe('ATLAS world', () => {
  it('one universe per module, plus the ACADÉMIE', () => {
    expect(atlas.map((u) => u.id)).toEqual([...MODULES.map((m) => m.id), 'learn']);
  });

  it('every explorer view is a planet of its module, every course a planet of the ACADÉMIE, every intro a gate', () => {
    for (const m of MODULES) {
      const u = atlas.find((x) => x.id === m.id)!;
      for (const v of m.vizs) expect(u.bodies.some((b) => b.target.type === 'view' && b.target.id === `${m.id}/${v.id}`), `${m.id}/${v.id}`).toBe(true);
      expect(u.bodies.filter((b) => b.kind === 'gate').map((b) => b.target.id)).toEqual([`intro-${m.id}`]);
    }
    const learn = atlas.find((u) => u.id === 'learn')!;
    for (const t of TRACKS) for (const id of t.courses) expect(learn.bodies.some((b) => b.target.type === 'course' && b.target.id === id), id).toBe(true);
  });

  it('universes are far apart and out of each other’s entry range', () => {
    for (const a of atlas)
      for (const b of atlas) if (a !== b) expect(dist(a.pos, b.pos), `${a.id} ↔ ${b.id}`).toBeGreaterThan(GALAXY.enterRange * 2);
    // the first universe lies straight ahead of the starting ship
    expect(Math.abs(atlas[0].pos[0])).toBeLessThan(1);
    expect(atlas[0].pos[2]).toBeLessThan(GALAXY.start[2]);
  });

  it('in each system, bodies do not overlap and stay inside the system, clear of the star', () => {
    for (const u of atlas) {
      const ids = new Set(u.bodies.map((b) => b.id));
      expect(ids.size, u.id).toBe(u.bodies.length);
      for (const b of u.bodies) {
        const r = Math.hypot(...b.pos);
        expect(r, `${b.id} loin de l'étoile`).toBeGreaterThan(SYSTEM.star + b.radius + 20);
        expect(r, `${b.id} dans le système`).toBeLessThan(SYSTEM.edge - 100);
        for (const c of u.bodies) if (b !== c) expect(dist(b.pos, c.pos), `${b.id} ↔ ${c.id}`).toBeGreaterThan(b.radius + c.radius + 6);
      }
    }
  });
});

describe('ATLAS stations', () => {
  it('every leçon-jeu is a station in the system of its module', () => {
    for (const g of GAMES) {
      const u = atlas.find((x) => x.id === g.module)!;
      expect(u.bodies.some((b) => b.kind === 'station' && b.target.type === 'game' && b.target.id === g.id), g.id).toBe(true);
    }
  });
});
