import { describe, expect, it } from 'vitest';
import { parseMarker, parseScript, tokenize } from '../src/learn/script';
import { Speaker, type SpeechDict } from '../src/learn/speak';
import { buildClips, buildTimeline, CPS } from '../src/learn/clips';
import dict from '../courses/pronunciation.fr.json';

const sp = new Speaker(dict as unknown as SpeechDict);

describe('script markers', () => {
  it('parses kind, name, args and flags', () => {
    const m = parseMarker('{{anim:write eq=darboux slot=n dur=2.5 key title="Un titre \\"cité\\""}}')!;
    expect(m.kind).toBe('anim');
    expect(m.name).toBe('write');
    expect(m.args).toEqual({ eq: 'darboux', slot: 'n', dur: '2.5', title: 'Un titre "cité"' });
    expect(m.flags).toEqual(['key']);
    expect(parseMarker('{{wait:1.5}}')!.name).toBe('1.5');
    // quoted values keep braces and LaTeX backslashes
    const t = parseMarker('{{anim:text slot=n text="de $\\mathbb{R}$ :\\n- $x \\neq 0$"}} suite')!;
    expect(t.args.text).toBe('de $\\mathbb{R}$ :\\n- $x \\neq 0$');
    expect(t.raw.endsWith('}}')).toBe(true);
    expect(parseMarker('{{scene:integrals/riemann n=4}}')!.name).toBe('integrals/riemann');
  });

  it('tokenizes math, markers, say and paragraphs', () => {
    const { tokens, errors } = tokenize('Soit $f$ {{say:"f majuscule"}} sur $[a,b]$.\n\nAlors {{anim:clear}} $$\\int_a^b f$$');
    expect(errors).toEqual([]);
    expect(tokens.map((t) => t.t)).toEqual(['text', 'math', 'text', 'math', 'text', 'para', 'text', 'mark', 'text', 'math']);
    const f = tokens[1];
    expect(f.t === 'math' && f.say).toBe('f majuscule');
    const d = tokens[9];
    expect(d.t === 'math' && d.display).toBe(true);
  });

  it('parses chapters and segments, and reports structure errors', () => {
    const s = parseScript('# Un {#ch1}\n## s1\nBonjour.\n<!-- note -->\n## s2\nSuite.\n# Deux {#ch2}\n## s3\nFin.\n## s1\nDoublon.');
    expect(s.chapters.map((c) => c.id)).toEqual(['ch1', 'ch2']);
    expect(s.segments.map((x) => `${x.chapter}/${x.id}`)).toEqual(['ch1/s1', 'ch1/s2', 'ch2/s3', 'ch2/s1']);
    expect(s.errors.some((e) => e.includes('double'))).toBe(true);
  });
});

describe('LaTeX → spoken French', () => {
  const cases: [string, string][] = [
    ['\\int_a^b f(x)\\,dx', 'intégrale de a à b de f de x d x'],
    ['\\sum_{k=0}^{n} a_k', 'somme pour k allant de 0 à n de a k'],
    ['\\lim_{n\\to+\\infty} u_n', 'limite quand n tend vers plus l\'infini de u n'],
    ['\\forall \\varepsilon > 0, \\exists \\delta > 0', 'pour tout epsilon supérieur à 0, il existe delta supérieur à 0'],
    ['x^2 + y^3', 'x au carré plus y au cube'],
    ['\\frac{1}{n}', '1 sur n'],
    ['\\frac{b-a}{n}', 'b moins a, le tout sur n'],
    ['\\|f\\|_\\infty', 'norme infinie de f'],
    ['|x - y|', 'valeur absolue de x moins y'],
    ['f : [a,b] \\to \\mathbb{R}', 'f, de a, b dans R'],
    ['\\sqrt{2}', 'racine de 2'],
    ['A^{-1}', 'A inverse'],
    ['\\mathbb{R}^n', 'R n'],
    ["f'(x)", 'f prime de x'],
    ['\\ker(u - \\lambda \\mathrm{id})', 'noyau de u moins lambda id'],
    ['\\chi_u(X) = \\det(X I_n - A)', 'khi u de X égale déterminant de X I n moins A'],
  ];
  for (const [tex, said] of cases) it(`${tex} → ${said}`, () => expect(sp.tex(tex)).toBe(said));

  it('applies whole-word text replacements', () => {
    expect(sp.text('En MPSI et en MP, i.e. en prépa')).toBe('En M P S I et en M P, c\'est-à-dire en prépa');
  });
});

describe('clips and timeline', () => {
  const script = parseScript(
    '# Intro {#c1}\n## a\nPremière phrase avec $x^2$. {{anim:write eq=e1}}Deuxième phrase {{wait:2}} Après la pause.\n## b\n{{exercise:ex1 minutes=5}}Dernier segment.',
  );
  const clips = buildClips(script, sp);

  it('splits at {{wait}} and keeps marker offsets in the spoken text', () => {
    expect(clips.map((c) => c.key)).toEqual(['a', 'a.1', 'b']);
    expect(clips[0].spoken).toBe('Première phrase avec x au carré. Deuxième phrase');
    expect(clips[0].waitAfter).toBe(2);
    const mk = clips[0].marks[0];
    expect(clips[0].spoken.slice(mk.at).trim().startsWith('Deuxième')).toBe(true);
    expect(clips[0].cues).toHaveLength(2);
    expect(clips[2].marks[0].m.kind).toBe('exercise');
  });

  it('times events from alignments, or from the synthetic reading speed', () => {
    const tl = buildTimeline(script, clips, () => undefined, (k) => `courses/x/audio/${k}.mp3`);
    expect(tl.clips[0].t0).toBe(0);
    expect(tl.clips[1].t0).toBeCloseTo(clips[0].spoken.length / CPS + 0.25 + 2, 5);
    expect(tl.events[0].m.name).toBe('write');
    expect(tl.chapters).toEqual([{ id: 'c1', title: 'Intro', t: 0 }]);
    // with an alignment whose hash matches, the clip uses the real duration and word times
    const c0 = clips[0];
    const at = c0.marks[0].at;
    const tl2 = buildTimeline(script, clips, (k) => (k === 'a' ? { v: 1, key: 'a', hash: c0.hash, voice: 'v', duration: 4, w: [0, 0, at, 2500] } : undefined), (k) => k);
    expect(tl2.clips[0].dur).toBe(4);
    expect(tl2.clips[0].audio).toBe('a');
    expect(tl2.events[0].t).toBeCloseTo(2.5);
    // stale alignment (text changed): ignored
    const tl3 = buildTimeline(script, clips, () => ({ v: 1, key: 'a', hash: 'other', voice: 'v', duration: 4, w: [] }), (k) => k);
    expect(tl3.clips[0].audio).toBeUndefined();
  });
});
