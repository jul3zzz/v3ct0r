// V3CT0R ATLAS — the map of the whole software as a space to fly through. Pure data and layout
// (no three.js, no DOM): unit-tested. Two levels: the GALAXY (one universe per explorer module,
// plus the ACADÉMIE for the LEARN courses) and, inside each universe, a SYSTEM (a central star,
// one planet per view or course, and the gate of the module intro).

export type Vec3 = [number, number, number];

/** what entering a body does */
export type AtlasTarget =
  | { type: 'universe'; id: string }
  | { type: 'view'; id: string }
  | { type: 'course'; id: string }
  | { type: 'intro'; id: string }
  | { type: 'game'; id: string }
  | { type: 'chapter'; id: string };

/** wireframe emblem of a planet: echoes what the view shows */
export type Emblem = 'grid' | 'icosa' | 'torus' | 'tesseract' | 'cube' | 'tetra' | 'knot' | 'points' | 'rings' | 'spiral' | 'lorenz' | 'octa' | 'station';

export interface AtlasBody {
  id: string;
  kind: 'universe' | 'planet' | 'gate' | 'station';
  /** "03.06", "PRÉPA"… */
  code: string;
  title: string;
  sub: string;
  pos: Vec3;
  /** visual radius */
  radius: number;
  emblem: Emblem;
  target: AtlasTarget;
  /** orbit radius around the system star (planets) */
  orbit?: number;
}

export interface AtlasUniverse {
  id: string;
  code: string;
  title: string;
  kanji: string;
  tagline: string;
  /** position in the galaxy */
  pos: Vec3;
  /** spiral arms of its galaxy (0: ring galaxy) */
  arms: number;
  seed: number;
  /** system content */
  bodies: AtlasBody[];
  /** orbit rings to draw (radii), and their labels */
  rings: { r: number; label?: string }[];
}

export interface AtlasInput {
  modules: { id: string; code: string; title: string; kanji: string; tagline: string; vizs: { id: string; title: string; subtitle: string }[] }[];
  /** curriculum levels, inner to outer, with their courses (intros excluded) */
  tracks: { id: string; title: string; courses: { id: string; title: string; subtitle?: string; minutes: number; ready: boolean }[] }[];
  /** module id → intro course id */
  intros: Record<string, string>;
  /** leçons-jeux: stations in the system of their module */
  games?: { id: string; module: string; title: string; sub: string }[];
  /** the story mode (STORY.md): its acts and its beacons, placed on the spiral of time */
  story?: { acts: { n: number; roman: string; title: string }[]; chapters: { id: string; code: string; title: string; sub: string; year: number; act: number }[] };
}

/** the region of the story mode, below the hub of the galaxy */
export const STORY_POS: Vec3 = [0, -230, -120];
const ACT_EMBLEM: Record<number, Emblem> = { 1: 'tetra', 2: 'rings', 3: 'tesseract', 4: 'points', 5: 'lorenz', 6: 'cube', 7: 'knot' };

/** beacons on a spiral: the oldest near the core, 2003 on the outside */
export function storyBodies(story: NonNullable<AtlasInput['story']>): { bodies: AtlasBody[]; rings: AtlasUniverse['rings'] } {
  const chs = [...story.chapters].sort((a, b) => a.year - b.year || a.code.localeCompare(b.code));
  const n = chs.length;
  const bodies = chs.map((c, i): AtlasBody => {
    const r = 70 + (n > 1 ? (i / (n - 1)) * 340 : 0);
    const a = i * 0.62;
    const h = hash01(c.id);
    return {
      id: `chapter:${c.id}`,
      kind: 'planet',
      code: c.code,
      title: c.title,
      sub: c.sub,
      pos: [r * Math.cos(a), Math.sin(i * 0.9) * 14 + (h - 0.5) * 10, r * Math.sin(a)],
      radius: 6 + h * 3,
      emblem: ACT_EMBLEM[c.act] ?? 'icosa',
      target: { type: 'chapter', id: c.id },
    };
  });
  // one ring per act, at the mean radius of its beacons
  const rings = story.acts.flatMap((act) => {
    const own = bodies.filter((b, i) => chs[i].act === act.n);
    if (!own.length) return [];
    const r = own.reduce((sum, b) => sum + Math.hypot(b.pos[0], b.pos[2]), 0) / own.length;
    return [{ r: Math.round(r), label: `ACTE ${act.roman} · ${act.title.toUpperCase()}` }];
  });
  return { bodies, rings };
}

export const GALAXY = {
  /** radius of the ring of universes */
  ring: 700,
  /** visual radius of a universe's galaxy */
  uniRadius: 110,
  /** distance under which a universe can be entered (⏎) */
  enterRange: 230,
  /** where the ship starts, looking towards −z */
  start: [0, 20, 260] as Vec3,
};

export const SYSTEM = {
  /** central star */
  star: 18,
  /** ship arrival point, looking towards −z (the star) */
  start: [0, 16, 560] as Vec3,
  /** gate of the module intro, on the way in */
  gate: [0, 0, 470] as Vec3,
  /** beyond this distance from the star, the ship leaves the system */
  edge: 760,
};

/** deterministic hash → [0, 1) */
export function hash01(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return ((h >>> 0) % 100000) / 100000;
}

const EMBLEMS: Record<string, Emblem> = {
  'integrals/riemann': 'grid',
  'integrals/ftc': 'rings',
  'integrals/double': 'grid',
  'integrals/triple': 'cube',
  'integrals/hyper': 'icosa',
  '4d/polytopes': 'tesseract',
  '4d/slices': 'cube',
  '4d/hopf': 'knot',
  '4d/surfaces': 'torus',
  'fractals/mandelbrot': 'points',
  'fractals/julia': 'points',
  'fractals/mandelbulb': 'icosa',
  'fractals/sierpinski': 'tetra',
  'fractals/sierpinski3d': 'tetra',
  'fractals/koch': 'icosa',
  'fractals/menger': 'cube',
  'fractals/hilbert': 'grid',
  'fractals/fern': 'points',
  'fractals/tree': 'octa',
  'fractals/attractors': 'lorenz',
  'constants/pi': 'rings',
  'constants/phi': 'spiral',
  'constants/sqrt2': 'cube',
  'constants/e': 'grid',
  'constants/i': 'rings',
  'constants/gamma': 'icosa',
  'constants/zeta3': 'points',
  'constants/ln2': 'grid',
  'constants/compare': 'rings',
  'constants/walk': 'points',
  'constants/euler': 'rings',
  'principles/limits': 'grid',
  'principles/derivative': 'rings',
  'principles/taylor': 'grid',
  'principles/fourier': 'rings',
  'principles/complex': 'knot',
  'principles/primes': 'points',
  'principles/zeta': 'knot',
  'principles/cantor': 'points',
  'principles/linear': 'cube',
  'principles/tilings': 'icosa',
  'principles/collatz': 'octa',
  'probability/galton': 'tetra',
  'probability/lln': 'rings',
  'probability/clt': 'grid',
  'probability/buffon': 'points',
};

/** spiral arms per module (the look of its galaxy from afar) */
const ARMS: Record<string, number> = { integrals: 2, '4d': 4, fractals: 5, constants: 3, principles: 6, probability: 2 };

const GOLDEN = Math.PI * (3 - Math.sqrt(5));

/** planets of a module system: spread on orbits from 80 to 400, golden-angle around the star */
function modulePlanets(m: AtlasInput['modules'][number]): AtlasBody[] {
  const n = m.vizs.length;
  return m.vizs.map((v, i) => {
    const id = `${m.id}/${v.id}`;
    const orbit = 80 + (n > 1 ? (i / (n - 1)) * 320 : 0);
    const a = i * GOLDEN + hash01(m.id) * Math.PI * 2;
    const h = hash01(id);
    return {
      id,
      kind: 'planet',
      code: `${m.code}.${String(i + 1).padStart(2, '0')}`,
      title: v.title,
      sub: v.subtitle,
      pos: [orbit * Math.cos(a), (h - 0.5) * 50, orbit * Math.sin(a)],
      radius: 5.5 + h * 6,
      emblem: EMBLEMS[id] ?? (['grid', 'icosa', 'rings', 'points'] as Emblem[])[Math.floor(h * 4)],
      target: { type: 'view', id },
      orbit,
    } satisfies AtlasBody;
  });
}

/** Build the whole atlas from the modules and the curriculum. */
export function buildAtlas(input: AtlasInput): AtlasUniverse[] {
  const out: AtlasUniverse[] = [];
  const count = input.modules.length + 1;
  const place = (k: number): Vec3 => {
    // first universe straight ahead of the starting ship (−z), the others around the ring
    const a = -Math.PI / 2 + (k / count) * Math.PI * 2;
    return [GALAXY.ring * Math.cos(a), Math.sin(k * 1.7) * 70, GALAXY.ring * Math.sin(a)];
  };
  input.modules.forEach((m, k) => {
    const bodies = modulePlanets(m);
    const intro = input.intros[m.id];
    if (intro)
      bodies.push({
        id: `gate:${m.id}`,
        kind: 'gate',
        code: 'INTRO',
        title: `Intro · ${m.title.charAt(0)}${m.title.slice(1).toLowerCase()}`,
        sub: '30 s de motion design avec voix off et bruitages.',
        pos: [...SYSTEM.gate],
        radius: 16,
        emblem: 'rings',
        target: { type: 'intro', id: intro },
      });
    // leçons-jeux: stations on an outer orbit of the module system
    const games = (input.games ?? []).filter((g) => g.module === m.id);
    games.forEach((g, i) => {
      const a = Math.PI * 0.75 + i * 0.9;
      bodies.push({
        id: `game:${g.id}`,
        kind: 'station',
        code: 'JEU',
        title: g.title,
        sub: g.sub,
        pos: [455 * Math.cos(a), 30, 455 * Math.sin(a)],
        radius: 9,
        emblem: 'station',
        target: { type: 'game', id: g.id },
        orbit: 455,
      });
    });
    out.push({
      id: m.id,
      code: m.code,
      title: m.title,
      kanji: m.kanji,
      tagline: m.tagline,
      pos: place(k),
      arms: ARMS[m.id] ?? 3,
      seed: Math.floor(hash01(m.id) * 1e6),
      bodies,
      rings: bodies.filter((b) => b.orbit).map((b) => ({ r: b.orbit! })),
    });
  });
  // the ACADÉMIE: one ring per curriculum level, one planet per course
  const bodies: AtlasBody[] = [];
  const rings: AtlasUniverse['rings'] = [];
  input.tracks.forEach((tr, li) => {
    const r = tr.courses.length === 1 && li === 0 ? 0 : 110 + li * 105;
    if (r) rings.push({ r, label: tr.title });
    tr.courses.forEach((c, i) => {
      const a = (i / tr.courses.length) * Math.PI * 2 + li * 0.7;
      const h = hash01(c.id);
      const pos: Vec3 = r ? [r * Math.cos(a), (h - 0.5) * 24, r * Math.sin(a)] : [0, 0, 380];
      bodies.push({
        id: `course:${c.id}`,
        kind: 'planet',
        code: ({ demo: 'DÉMO', prepa: 'PRÉPA', master: 'MASTER', doctorat: 'DOCTORAT' } as Record<string, string>)[tr.id] ?? tr.title,
        title: c.title,
        sub: c.subtitle ?? '',
        pos,
        radius: c.ready ? 10 : 5,
        emblem: c.ready ? 'icosa' : 'octa',
        target: { type: 'course', id: c.id },
        orbit: r || undefined,
      });
    });
  });
  out.push({ id: 'learn', code: 'L', title: 'ACADÉMIE', kanji: '学', tagline: 'Cours de la prépa au doctorat', pos: place(input.modules.length), arms: 0, seed: 4242, bodies, rings });
  if (input.story?.chapters.length) {
    const st = storyBodies(input.story);
    out.push({ id: 'story', code: 'H', title: 'LA GRANDE ENTROPIE', kanji: '歴史', tagline: 'Mode histoire · 3 800 ans de mathématiques', pos: [...STORY_POS], arms: 1, seed: 1800, bodies: st.bodies, rings: st.rings });
  }
  return out;
}

export const dist = (a: Vec3, b: Vec3): number => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
