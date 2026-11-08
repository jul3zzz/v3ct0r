// Turns a parsed script into audio clips (spoken text + marker offsets + subtitle cues), then
// into a timed course. Pure: shared by the app (timing, subtitles) and tools/generate-voice.ts
// (what to send to the voice API and what is cached).
import type { Alignment, Clip, Marker, ParsedScript, Token } from './types.ts';
import { hashText } from './script.ts';
import type { Speaker } from './speak.ts';

/** synthetic reading speed (spoken characters per second at 1×) when no audio exists */
export const CPS = 15;
/** silence between two segments (s) */
export const SEG_GAP = 0.6;
const SENTENCE = /([.!?…])(\s+|$)/g;

export function buildClips(script: ParsedScript, sp: Speaker): Clip[] {
  const clips: Clip[] = [];
  for (const seg of script.segments) {
    let part = 0;
    let cur = newClip(seg.id, seg.chapter, part);
    let cue: { from: number; tokens: Token[] } = { from: 0, tokens: [] };
    let cueLen = 0;
    const append = (s: string) => {
      let piece = s.replace(/\s+/g, ' ');
      if (!piece) return;
      if ((cur.spoken === '' || cur.spoken.endsWith(' ')) && piece.startsWith(' ')) piece = piece.slice(1);
      if (/^[.,;:!?)]/.test(piece) && cur.spoken.endsWith(' ')) {
        // no space before punctuation; keep offsets recorded at the removed space valid
        cur.spoken = cur.spoken.slice(0, -1);
        const n = cur.spoken.length;
        for (const mk of cur.marks) mk.at = Math.min(mk.at, n);
        cue.from = Math.min(cue.from, n);
      }
      cur.spoken += piece;
    };
    const closeCue = () => {
      const to = cur.spoken.replace(/\s+$/, '').length;
      if (cue.tokens.some((t) => t.t === 'math' || (t.t === 'text' && t.s.trim()))) cur.cues.push({ from: cue.from, to, tokens: trimTokens(cue.tokens) });
      cue = { from: cur.spoken.length, tokens: [] };
      cueLen = 0;
    };
    const closeClip = (waitAfter: number, segEnd: boolean) => {
      closeCue();
      cur.spoken = cur.spoken.trim();
      cur.waitAfter = waitAfter;
      cur.segEnd = segEnd;
      cur.hash = hashText(cur.spoken);
      if (cur.spoken || cur.marks.length) clips.push(cur);
      part++;
      cur = newClip(seg.id, seg.chapter, part);
      cue = { from: 0, tokens: [] };
    };
    for (const tok of seg.tokens) {
      if (tok.t === 'mark') {
        if (tok.m.kind === 'wait') {
          closeClip(Number(tok.m.name) || 1, false);
          continue;
        }
        cur.marks.push({ at: cur.spoken.length, m: tok.m });
        continue;
      }
      if (tok.t === 'para') {
        closeCue();
        append(' ');
        continue;
      }
      if (tok.t === 'math') {
        append(' ');
        append(tok.say ?? sp.tex(tok.tex));
        append(' ');
        cue.tokens.push(tok);
        cueLen += Math.ceil(tok.tex.length / 2);
        continue;
      }
      // text: split at sentence ends (and at commas in long sentences)
      let rest = tok.s;
      while (rest) {
        SENTENCE.lastIndex = 0;
        const m = SENTENCE.exec(rest);
        const comma = cueLen > 90 ? /,\s+/.exec(rest) : null;
        const cut = m && (!comma || m.index <= comma.index) ? m.index + m[1].length : comma ? comma.index + 1 : -1;
        if (cut < 0) {
          append(sp.text(rest));
          cue.tokens.push({ t: 'text', s: rest });
          cueLen += rest.length;
          break;
        }
        const head = rest.slice(0, cut);
        append(sp.text(head));
        cue.tokens.push({ t: 'text', s: head });
        closeCue();
        rest = rest.slice(cut);
      }
    }
    closeClip(0, true);
  }
  return clips;
}

function newClip(seg: string, chapter: string, part: number): Clip {
  return { key: part ? `${seg}.${part}` : seg, segment: seg, chapter, spoken: '', hash: '', marks: [], cues: [], waitAfter: 0, segEnd: false };
}

function trimTokens(t: Token[]): Token[] {
  const out = t.map((x) => ({ ...x }));
  const first = out[0];
  if (first && first.t === 'text') first.s = first.s.replace(/^\s+/, '');
  const last = out[out.length - 1];
  if (last && last.t === 'text') last.s = last.s.replace(/\s+$/, '');
  return out.filter((x) => !(x.t === 'text' && !x.s));
}

// ── timing ─────────────────────────────────────────────────────────────

export interface TimedClip {
  clip: Clip;
  t0: number;
  dur: number;
  /** audio file relative to index.html, when a matching alignment exists */
  audio?: string;
}

export interface TimedEvent {
  t: number;
  m: Marker;
  chapter: string;
  segment: string;
  /** index in the sorted event list */
  i: number;
}

export interface Cue {
  t0: number;
  t1: number;
  tokens: Token[];
  segment: string;
  chapter: string;
}

export interface Timeline {
  clips: TimedClip[];
  events: TimedEvent[];
  cues: Cue[];
  chapters: { id: string; title: string; t: number }[];
  duration: number;
}

/** time (s, from the clip start) at which the character `at` of the clip is spoken */
export function timeAt(c: Clip, al: Alignment | undefined, at: number): number {
  if (!al) return at / CPS;
  const w = al.w;
  let ms = 0;
  for (let k = 0; k < w.length; k += 2) {
    if (w[k] > at) break;
    ms = w[k + 1];
  }
  return ms / 1000;
}

export function buildTimeline(script: ParsedScript, clips: Clip[], alignments: (key: string) => Alignment | undefined, audioUrl: (key: string) => string): Timeline {
  const out: Timeline = { clips: [], events: [], cues: [], chapters: [], duration: 0 };
  let t = 0;
  const seenChapter = new Set<string>();
  for (const c of clips) {
    const found = alignments(c.key);
    const al = found && found.hash === c.hash ? found : undefined;
    if (!seenChapter.has(c.chapter)) {
      seenChapter.add(c.chapter);
      const ch = script.chapters.find((x) => x.id === c.chapter);
      out.chapters.push({ id: c.chapter, title: ch?.title ?? c.chapter, t });
    }
    const dur = al ? al.duration : c.spoken.length / CPS + (c.spoken ? 0.25 : 0);
    out.clips.push({ clip: c, t0: t, dur, audio: al ? audioUrl(c.key) : undefined });
    for (const mk of c.marks) out.events.push({ t: t + Math.min(dur, timeAt(c, al, mk.at)), m: mk.m, chapter: c.chapter, segment: c.segment, i: 0 });
    for (const q of c.cues) {
      const t0 = t + timeAt(c, al, q.from);
      const t1 = t + (q.to >= c.spoken.length ? dur : timeAt(c, al, q.to));
      out.cues.push({ t0, t1: Math.max(t0 + 0.4, t1), tokens: q.tokens, segment: c.segment, chapter: c.chapter });
    }
    t += dur + c.waitAfter + (c.segEnd ? SEG_GAP : 0);
  }
  out.duration = t;
  out.events.sort((a, b) => a.t - b.t);
  out.events.forEach((e, i) => (e.i = i));
  return out;
}
