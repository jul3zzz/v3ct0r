// Sound design of the LEARN videos that ask for it (lesson.json "soundtrack": true — the module
// intros): a low drone under the whole video, and glitches, hits, whooshes, risers and ticks tied
// to the animations. Everything is synthesized with WebAudio: no sound file, works offline.
// Cues are computed from the timeline; they fire only while playing, when the clock crosses them
// (never while scrubbing), so a seek never replays a pile of sounds.
import type { Timeline } from './clips';
import { DEFAULT_DUR } from './stage';

export type SoundKind =
  // motion design (titles, words, wipes, formulas)
  | 'glitch' | 'boom' | 'hit' | 'thump' | 'whoosh' | 'ticks' | 'type' | 'riser'
  // textures of the scenes (one-shot notes)
  | 'pluck' | 'ping' | 'chime' | 'snip' | 'tink' | 'coin' | 'rattle' | 'blip' | 'shepard'
  // a continuous layer under a whole scene (stopped on pause, resumed on play)
  | 'bed';

/** continuous layers, one per kind of scene */
export type BedKind = 'hum' | 'scan' | 'shimmer' | 'ice' | 'swirl' | 'deep' | 'grow' | 'orbit' | 'harmonics' | 'resonance';

export interface SoundCue {
  t: number;
  kind: SoundKind;
  dur: number;
  /** number of clicks (ticks, type) */
  n?: number;
  /** pitch (Hz) of a note */
  f?: number;
  /** level of a note (0..1, before the master gain) */
  g?: number;
  /** stereo position −1..1 */
  pan?: number;
  bed?: BedKind;
}

const num = (s: string | undefined, d: number): number => {
  const v = Number(s);
  return s !== undefined && s !== '' && Number.isFinite(v) ? v : d;
};

/** minor pentatonic from A3: notes never clash, whatever the random choice */
const PENTA = [0, 3, 5, 7, 10, 12, 15, 17, 19, 22, 24, 27, 29].map((s) => 220 * 2 ** (s / 12));
const PHI = (1 + Math.sqrt(5)) / 2;

/** Sound texture of an explorer view used as a scene, over [t0, t1): what the view shows,
 *  heard (marbles on nails, needles on a floor, an endless dive, the notes of a Collatz orbit…). */
export function sceneSound(view: string, t0: number, t1: number, sets: number[], seed: number): SoundCue[] {
  const r = rng(seed * 2654435761 + 97);
  const out: SoundCue[] = [];
  const span = Math.max(0, t1 - t0);
  const bed = (b: BedKind, delay = 0.15) => span > delay + 0.3 && out.push({ t: t0 + delay, kind: 'bed', bed: b, dur: span - delay });
  /** notes at a steady rate (with a little swing) */
  const every = (kind: SoundKind, gap: number, from: number, to: number, note: (k: number) => Partial<SoundCue>) => {
    let k = 0;
    for (let t = from; t < to; t += gap * (0.85 + r() * 0.3), k++) out.push({ t, kind, dur: 0.6, ...note(k) });
  };
  /** notes at random times, `rate` per second */
  const rain = (kind: SoundKind, rate: number, note: () => Partial<SoundCue>) => {
    for (let t = t0 + 0.2 - Math.log(1 - r()) / rate; t < t1 - 0.1; t += -Math.log(1 - r()) / rate) out.push({ t, kind, dur: 0.4, ...note() });
  };
  const penta = (lo: number, hi: number) => PENTA[lo + Math.floor(r() * (hi - lo + 1))];
  switch (view) {
    case 'integrals/riemann': {
      // more and more rectangles: plucks climbing the scale, faster and faster
      let t = t0 + 0.3;
      for (let k = 0, gap = 0.34; t < t1 - 0.2; k++, gap = Math.max(0.07, gap * 0.9), t += gap) out.push({ t, kind: 'pluck', dur: 0.5, f: PENTA[k % PENTA.length], g: 0.11, pan: ((k % 7) - 3) / 4 });
      break;
    }
    case 'integrals/ftc':
      bed('scan');
      break;
    case 'integrals/double':
      every('pluck', 0.24, t0 + 0.3, t1 - 0.2, () => ({ f: penta(0, 5) / 2, g: 0.13, pan: r() * 1.2 - 0.6 }));
      break;
    case 'integrals/hyper':
      bed('shimmer');
      rain('ping', 1.2, () => ({ f: penta(6, 12) * 2, g: 0.04, pan: r() * 1.6 - 0.8 }));
      break;
    case '4d/polytopes':
      bed('hum');
      every('ping', 0.62, t0 + 0.5, t1 - 0.2, (k) => ({ f: PENTA[(k * 3) % 8] * 4, g: 0.035, pan: Math.sin(k) * 0.7 }));
      break;
    case '4d/slices':
      bed('scan');
      every('blip', 0.5, t0 + 0.4, t1 - 0.2, () => ({ f: 880, g: 0.035 }));
      break;
    case '4d/hopf':
      bed('shimmer');
      break;
    case '4d/surfaces':
      every('chime', 0.9, t0 + 0.3, t1 - 0.3, () => ({ f: penta(3, 9), g: 0.06, pan: r() * 1.2 - 0.6 }));
      break;
    case 'fractals/mandelbrot':
      // a Shepard tone: voices gliding down for ever, the sound of a dive with no bottom
      for (let t = t0 - 6.4; t < t1; t += 1.6) {
        const s = Math.max(t, t0);
        out.push({ t: s, kind: 'shepard', dur: Math.min(t + 8, t1 + 0.6) - s, f: 1600 * 2 ** (-(s - t) / 1.6), g: 0.07 });
      }
      break;
    case 'fractals/koch': {
      // one ice-clear chime per iteration of the snowflake
      bed('ice', 0.1);
      const steps = sets.length ? sets : [t0 + 0.5, t0 + 1.2, t0 + 1.9, t0 + 2.6, t0 + 3.3];
      steps.forEach((t, k) => out.push({ t, kind: 'chime', dur: 1.6, f: PENTA[Math.min(PENTA.length - 1, 4 + k * 2)] * 2, g: 0.09, pan: (k - 2) / 3 }));
      break;
    }
    case 'fractals/attractors':
      bed('swirl');
      break;
    case 'fractals/mandelbulb':
      bed('deep', 0.05);
      break;
    case 'constants/pi':
      // the number of sides doubles: 6, 12, 24, 48, 96 — the pitch climbs an octave each time
      every('blip', 0.7, t0 + 0.3, t1 - 0.2, (k) => ({ f: 165 * 2 ** (k % 5), g: 0.07 }));
      break;
    case 'constants/phi': {
      // a chime per new square, pitches in golden-ratio steps
      const steps = sets.length ? sets : [t0 + 0.8];
      steps.forEach((t, k) => {
        let f = 330 * PHI ** k;
        while (f > 1320) f /= 2;
        out.push({ t, kind: 'chime', dur: 1.6, f, g: 0.085, pan: (k % 2 ? 0.4 : -0.4) });
      });
      break;
    }
    case 'constants/e':
      bed('grow');
      break;
    case 'constants/euler':
      bed('orbit');
      break;
    case 'principles/fourier':
      bed('harmonics');
      break;
    case 'principles/zeta':
      bed('resonance');
      every('ping', 1.3, t0 + 0.8, t1 - 0.3, () => ({ f: 220, g: 0.05 }));
      break;
    case 'principles/collatz': {
      // the orbit of 27 (111 steps, peak 9 232), played note by note
      let v = 27;
      let t = t0 + 0.3;
      for (let k = 0; t < t1 - 0.15 && v !== 1; k++, t += 0.13) {
        out.push({ t, kind: 'pluck', dur: 0.35, f: 110 * 2 ** ((Math.log2(v) / Math.log2(9232)) * 4), g: 0.075, pan: v % 2 ? 0.35 : -0.35 });
        v = v % 2 ? 3 * v + 1 : v / 2;
      }
      break;
    }
    case 'principles/cantor': {
      // remove the middle thirds: 1, 2, 4, 8 cuts per level
      let t = t0 + 0.4;
      for (let lvl = 0; lvl < 5 && t < t1 - 0.3; lvl++) {
        const n = 2 ** lvl;
        for (let k = 0; k < n; k++) out.push({ t: t + (k * 0.6) / n, kind: 'snip', dur: 0.1, f: 3000 + lvl * 900, g: 0.09, pan: (k / Math.max(1, n - 1)) * 1.2 - 0.6 });
        t += 0.8;
      }
      break;
    }
    case 'probability/galton':
      rain('ping', 16, () => ({ f: 1500 + r() * 2200, g: 0.025 + r() * 0.03, pan: r() * 1.4 - 0.7 }));
      break;
    case 'probability/lln':
      every('coin', 0.28, t0 + 0.3, t1 - 0.2, () => ({ f: r() < 0.5 ? 2600 : 3100, g: 0.06, pan: r() * 0.8 - 0.4 }));
      break;
    case 'probability/clt':
      every('rattle', 0.9, t0 + 0.3, t1 - 0.4, () => ({ g: 0.08, pan: r() * 0.8 - 0.4 }));
      break;
    case 'probability/buffon':
      rain('tink', 7, () => ({ f: 3200 + r() * 2400, g: 0.035 + r() * 0.03, pan: r() * 1.4 - 0.7 }));
      break;
  }
  return out;
}

/** Sound cues of a timeline (pure: unit-tested). */
export function soundCues(tl: Timeline): SoundCue[] {
  const out: SoundCue[] = [];
  // scene spans → their textures
  const scenes = tl.events.filter((e) => e.m.kind === 'scene' && e.m.name !== 'set');
  scenes.forEach((e, i) => {
    if (e.m.name === 'none') return;
    const t1 = scenes[i + 1]?.t ?? tl.duration;
    const sets: number[] = [];
    for (const s of tl.events) {
      if (s.m.kind !== 'scene' || s.m.name !== 'set' || s.t < e.t || s.t >= t1) continue;
      const dur = num(s.m.args.dur, 0);
      const to = Number(Object.entries(s.m.args).find(([k]) => k !== 'dur')?.[1]);
      // a tween of an integer control (n = 0 → 5): one step per unit
      if (dur > 0 && Number.isFinite(to)) for (let k = 1; k <= to; k++) sets.push(s.t + (dur * k) / to);
      else sets.push(s.t);
    }
    out.push(...sceneSound(e.m.name, e.t, t1, sets, i + 1));
  });
  for (const e of tl.events) {
    const m = e.m;
    if (m.kind === 'scene' && m.name !== 'set' && m.name !== 'none') {
      out.push({ t: e.t, kind: 'thump', dur: 0.6 });
      continue;
    }
    if (m.kind !== 'anim') continue;
    const dur = num(m.args.dur, DEFAULT_DUR[m.name] ?? 1);
    if (m.name === 'title') out.push({ t: e.t, kind: 'glitch', dur }, { t: e.t + dur, kind: 'boom', dur: 1.4 });
    else if (m.name === 'word') {
      const letters = [...(m.args.text ?? '')].filter((c) => c.trim()).length;
      const land = e.t + dur * 0.55;
      if (m.flags.includes('rise')) out.push({ t: Math.max(0, land - 1.8), kind: 'riser', dur: Math.min(1.8, land) });
      out.push({ t: e.t, kind: 'ticks', dur: dur * 0.55, n: Math.max(1, letters) }, { t: land, kind: 'hit', dur: 1 });
    } else if (m.name === 'wipe') out.push({ t: e.t - dur / 2, kind: 'whoosh', dur });
    else if (m.name === 'write') out.push({ t: e.t, kind: 'type', dur, n: 12 });
  }
  return out.filter((c) => c.t >= 0).sort((a, b) => a.t - b.t);
}

/** 16-bit PCM WAV file of a rendered buffer (sound design preview) */
export function toWav(buf: AudioBuffer): Uint8Array {
  const ch = buf.numberOfChannels;
  const n = buf.length;
  const bytes = new Uint8Array(44 + n * ch * 2);
  const v = new DataView(bytes.buffer);
  const str = (o: number, s: string) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  str(0, 'RIFF');
  v.setUint32(4, 36 + n * ch * 2, true);
  str(8, 'WAVEfmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, ch, true);
  v.setUint32(24, buf.sampleRate, true);
  v.setUint32(28, buf.sampleRate * ch * 2, true);
  v.setUint16(32, ch * 2, true);
  v.setUint16(34, 16, true);
  str(36, 'data');
  v.setUint32(40, n * ch * 2, true);
  const data = Array.from({ length: ch }, (_, c) => buf.getChannelData(c));
  let o = 44;
  for (let i = 0; i < n; i++)
    for (let c = 0; c < ch; c++) {
      const s = Math.max(-1, Math.min(1, data[c][i]));
      v.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      o += 2;
    }
  return bytes;
}

/** deterministic pseudo-random numbers (same sounds at every playback) */
function rng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

export class Soundtrack {
  muted: boolean;
  /** cues actually played (smoke test) */
  fired = 0;
  /** live or offline context (synthesis); `live` is the real-time one, for resume/close */
  private ctx: BaseAudioContext | null = null;
  private live: AudioContext | null = null;
  private out: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private drone: { gain: GainNode; nodes: AudioScheduledSourceNode[] } | null = null;
  /** sounding layers (beds, Shepard voices): faded out on pause and on seek */
  private long: { gain: GainNode; nodes: AudioScheduledSourceNode[]; end: number }[] = [];

  constructor(
    readonly cues: SoundCue[],
    muted = false,
  ) {
    this.muted = muted;
  }

  /** output chain (gain → compressor) and the shared noise buffer */
  private setup(ctx: BaseAudioContext): void {
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 8;
    comp.attack.value = 0.002;
    const out = ctx.createGain();
    out.gain.value = 0.62;
    out.connect(comp).connect(ctx.destination);
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    const r = rng(7);
    for (let i = 0; i < len; i++) d[i] = r() * 2 - 1;
    this.ctx = ctx;
    this.out = out;
    this.noise = buf;
    this.drone = null;
  }

  private ensure(): BaseAudioContext | null {
    if (this.live) return this.live;
    try {
      this.live = new AudioContext();
      this.setup(this.live);
    } catch {
      return null;
    }
    return this.live;
  }

  /** playback starts at time `from` (a user gesture is on the stack: the context may resume);
   *  cues sitting exactly on the playhead (t = 0: the title) play now */
  start(from = 0): void {
    if (this.muted) return;
    if (!this.ensure()) return;
    void this.live!.resume().catch(() => undefined);
    this.startDrone();
    this.resumeBeds(from);
    this.cross(from - 0.03, from);
  }

  /** the playhead jumped while playing: silence the layers of the old position, resume the new
   *  ones once the jumps stop (dragging the scrub bar seeks on every pointer move) */
  seek(to: number, playing: boolean): void {
    this.stopLong();
    clearTimeout(this.resync);
    if (!playing || this.muted || !this.live) return;
    const at = performance.now();
    this.resync = setTimeout(() => this.resumeBeds(to + (performance.now() - at) / 1000), 160);
  }
  private resync: ReturnType<typeof setTimeout> | undefined;

  /** layers whose scene is under way at `from` restart for the time that is left */
  private resumeBeds(from: number): void {
    this.cues.forEach((c, i) => {
      if (c.kind === 'bed' && c.t < from - 0.03 && c.t + c.dur > from + 0.3) this.safePlay({ ...c, dur: c.t + c.dur - from }, i);
    });
  }

  private stopLong(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime;
    for (const l of this.long) {
      if (l.end <= t) continue;
      l.gain.gain.cancelScheduledValues(t);
      l.gain.gain.setValueAtTime(Math.max(0.0001, l.gain.gain.value), t);
      l.gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
      for (const n of l.nodes) n.stop(t + 0.3);
    }
    this.long = [];
  }

  /** The whole sound design of a video, rendered offline (preview file, tests): drone from 0 to
   *  `duration`, every cue at its time. Uses its own context; the live one is untouched. */
  async render(duration: number, sampleRate = 44100, voice: { t: number; mp3: ArrayBuffer }[] = [], voiceGain = 1): Promise<AudioBuffer> {
    const keep = { ctx: this.ctx, out: this.out, noise: this.noise, drone: this.drone };
    const off = new OfflineAudioContext(2, Math.ceil(duration * sampleRate), sampleRate);
    this.setup(off);
    this.startDrone(0);
    this.stopDrone(Math.max(0, duration - 0.5));
    this.cues.forEach((c, i) => this.safePlay(c, i, c.t));
    // the voice clips, mixed at their level outside the sound-design compressor (as in the player)
    const vg = off.createGain();
    vg.gain.value = voiceGain;
    vg.connect(off.destination);
    for (const v of voice) {
      const src = off.createBufferSource();
      src.buffer = await off.decodeAudioData(v.mp3);
      src.connect(vg);
      src.start(v.t);
    }
    const buf = await off.startRendering();
    Object.assign(this, keep);
    return buf;
  }

  stop(): void {
    this.stopDrone();
    this.stopLong();
    clearTimeout(this.resync);
  }

  /** the clock moved forward from a to b while playing: play the cues in (a, b] */
  cross(a: number, b: number): void {
    if (this.muted || b <= a || b - a > 0.5) return;
    const ctx = this.ensure();
    if (!ctx) return;
    for (let i = 0; i < this.cues.length; i++) {
      const c = this.cues[i];
      if (c.t <= a) continue;
      if (c.t > b) break;
      this.fired++;
      this.safePlay(c, i);
    }
  }

  setMuted(m: boolean, playing: boolean): void {
    this.muted = m;
    if (m) this.stop();
    else if (playing && this.ensure()) {
      void this.live!.resume().catch(() => undefined);
      this.startDrone();
    }
  }

  dispose(): void {
    this.stop();
    void this.live?.close().catch(() => undefined);
    this.live = null;
    this.ctx = null;
  }

  // ── synthesis ────────────────────────────────────────────────────────

  private env(t0: number, peak: number, attack: number, release: number): GainNode {
    const g = this.ctx!.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + release);
    return g;
  }

  private noiseSrc(t0: number, dur: number): AudioBufferSourceNode {
    const s = this.ctx!.createBufferSource();
    s.buffer = this.noise;
    s.loop = true;
    s.start(t0, (t0 * 0.618) % 1.5);
    s.stop(t0 + dur + 0.05);
    return s;
  }

  private filter(type: BiquadFilterType, freq: number, q = 1): BiquadFilterNode {
    const f = this.ctx!.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    return f;
  }

  private osc(type: OscillatorType, f0: number, f1: number, t0: number, dur: number): OscillatorNode {
    const o = this.ctx!.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, t0);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
    return o;
  }

  /** a faulty cue is skipped (and reported), never allowed to stop the player's frame loop */
  private safePlay(c: SoundCue, seed: number, at?: number): void {
    try {
      this.play(c, seed, at);
    } catch (e) {
      console.warn('[learn] bruitage ignoré', c, e);
    }
  }

  private panner(p: number): AudioNode {
    const s = this.ctx!.createStereoPanner();
    s.pan.value = Math.max(-1, Math.min(1, p));
    s.connect(this.out!);
    return s;
  }

  /** slow modulation of a parameter (depth around its current value) */
  private lfo(rate: number, depth: number, target: AudioParam, t0: number, dur: number, type: OscillatorType = 'sine'): OscillatorNode {
    const o = this.ctx!.createOscillator();
    o.type = type;
    o.frequency.value = rate;
    const d = this.ctx!.createGain();
    d.gain.value = depth;
    o.connect(d).connect(target);
    o.start(t0);
    o.stop(t0 + dur + 0.1);
    return o;
  }

  /** a layer that lasts the whole scene; registered so that pause and seek can silence it */
  private hold(gain: GainNode, nodes: AudioScheduledSourceNode[], t0: number, dur: number): void {
    if (this.ctx === this.live) this.long.push({ gain, nodes, end: t0 + dur });
  }

  private bed(kind: BedKind, t0: number, dur: number, level: number): void {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    const fade = Math.min(0.6, dur / 3);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(level, t0 + fade);
    g.gain.setValueAtTime(level, t0 + dur - fade);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    g.connect(this.out!);
    const nodes: AudioScheduledSourceNode[] = [];
    const tone = (type: OscillatorType, f: number, gain: number, into: AudioNode = g) => {
      const o = this.osc(type, f, f, t0, dur);
      const a = ctx.createGain();
      a.gain.value = gain;
      o.connect(a).connect(into);
      nodes.push(o);
      return { o, a };
    };
    const mod = (rate: number, depth: number, p: AudioParam, type: OscillatorType = 'sine') => nodes.push(this.lfo(rate, depth, p, t0, dur, type));
    switch (kind) {
      case 'hum': {
        // a 4D object turning: two close saws through a filter that opens and closes
        const lp = this.filter('lowpass', 320, 2);
        lp.connect(g);
        tone('sawtooth', 55, 0.5, lp);
        tone('sawtooth', 55.4, 0.5, lp);
        mod(0.33, 180, lp.frequency);
        break;
      }
      case 'scan': {
        // scanner: a sine sliding up and down through the object
        const { o } = tone('sine', 330, 1);
        mod(0.33, 110, o.frequency, 'triangle');
        tone('sine', 990, 0.12);
        break;
      }
      case 'shimmer':
      case 'ice': {
        // high partials breathing at different rates, spread left and right (circles, crystals)
        const fs = kind === 'shimmer' ? [880, 1108.7, 1318.5, 1661.2] : [2093, 2637, 3136];
        fs.forEach((f, k) => {
          const p = ctx.createStereoPanner();
          p.connect(g);
          mod(0.07 + k * 0.05, 0.9, p.pan);
          const { a } = tone('sine', f, 0.25, p);
          mod(0.2 + k * 0.13, 0.2, a.gain);
        });
        break;
      }
      case 'swirl': {
        // chaos: a carrier pushed around by two incommensurate modulators, and wind
        const bp = this.filter('bandpass', 500, 2.5);
        bp.connect(g);
        const { o } = tone('sawtooth', 110, 0.6, bp);
        mod(0.37, 40, o.frequency);
        mod(1.13, 25, o.frequency);
        mod(0.23, 300, bp.frequency);
        const wind = this.filter('bandpass', 900, 0.7);
        wind.connect(g);
        const n = this.noiseSrc(t0, dur);
        const wa = ctx.createGain();
        wa.gain.value = 0.35;
        n.connect(wa).connect(wind);
        nodes.push(n);
        mod(0.17, 500, wind.frequency);
        break;
      }
      case 'deep': {
        // a massive object: low cluster, slow pulse
        const lp = this.filter('lowpass', 240, 1);
        const pulse = ctx.createGain();
        lp.connect(pulse).connect(g);
        tone('sine', 41.2, 0.6, lp);
        tone('sine', 61.7, 0.4, lp);
        tone('sine', 82.4, 0.3, lp);
        tone('sawtooth', 41.2, 0.25, lp);
        mod(0.5, 0.4, pulse.gain);
        break;
      }
      case 'grow': {
        // compound interest: a tone climbing exponentially for the whole scene
        const o = this.osc('triangle', 110, 880, t0, dur);
        const a = ctx.createGain();
        a.gain.value = 0.8;
        o.connect(a).connect(g);
        nodes.push(o);
        tone('sine', 55, 0.4);
        break;
      }
      case 'orbit': {
        // a point running round the unit circle: the sound turns from left to right
        const p = ctx.createStereoPanner();
        p.connect(g);
        mod(0.5, 0.9, p.pan);
        tone('sine', 440, 0.6, p);
        tone('sine', 660, 0.2, p);
        break;
      }
      case 'harmonics': {
        // Fourier: the first six harmonics of A2, each swelling at its own pace (the circles)
        for (let k = 1; k <= 6; k++) {
          const { a } = tone('sine', 110 * k, 0.5 / k);
          mod(0.11 * k, 0.4 / k, a.gain);
        }
        break;
      }
      case 'resonance': {
        // zêta: a resonant filter sweeping noise up and down the critical line
        const bp = this.filter('bandpass', 600, 14);
        bp.connect(g);
        const n = this.noiseSrc(t0, dur);
        const a = ctx.createGain();
        a.gain.value = 1.6;
        n.connect(a).connect(bp);
        nodes.push(n);
        mod(0.12, 450, bp.frequency, 'triangle');
        break;
      }
    }
    this.hold(g, nodes, t0, dur);
  }

  private play(c: SoundCue, seed: number, at?: number): void {
    const ctx = this.ctx!;
    const out = this.out!;
    const t0 = at ?? ctx.currentTime + 0.005;
    const r = rng(seed * 7919 + 13);
    const dest = c.pan ? this.panner(c.pan) : out;
    const g = c.g ?? (c.kind === 'bed' ? 0.05 : 0.08);
    const f = c.f ?? 440;
    switch (c.kind) {
      case 'bed':
        if (c.bed) this.bed(c.bed, t0, c.dur, g);
        break;
      case 'pluck':
        // wooden mallet: sine body and a brief octave
        this.osc('sine', f, f, t0, 0.6).connect(this.env(t0, g, 0.004, 0.5)).connect(dest);
        this.osc('triangle', f * 2, f * 2, t0, 0.2).connect(this.env(t0, g * 0.3, 0.002, 0.15)).connect(dest);
        break;
      case 'ping':
        // a marble on a nail: bright sine and a tiny click
        this.osc('sine', f, f * 0.995, t0, 0.3).connect(this.env(t0, g, 0.002, 0.24)).connect(dest);
        this.noiseSrc(t0, 0.012).connect(this.filter('highpass', 4000)).connect(this.env(t0, g * 0.5, 0.001, 0.01)).connect(dest);
        break;
      case 'chime':
        // bell: inharmonic partials, the higher ones dying first
        [
          [1, 1, 1.6],
          [2.76, 0.45, 0.9],
          [5.4, 0.22, 0.5],
          [8.93, 0.1, 0.3],
        ].forEach(([m, a, d]) => this.osc('sine', f * m, f * m, t0, d).connect(this.env(t0, g * a, 0.003, d)).connect(dest));
        break;
      case 'snip':
        // scissors: two short bright bursts
        for (const dt of [0, 0.035]) this.noiseSrc(t0 + dt, 0.02).connect(this.filter('highpass', f)).connect(this.env(t0 + dt, g, 0.001, 0.018)).connect(dest);
        break;
      case 'tink':
        // a needle on wood: metallic resonance, very short
        this.osc('square', f, f, t0, 0.06).connect(this.filter('bandpass', f, 9)).connect(this.env(t0, g * 2, 0.001, 0.05)).connect(dest);
        this.osc('sine', f * 1.5, f * 1.5, t0, 0.12).connect(this.env(t0, g * 0.5, 0.001, 0.1)).connect(dest);
        break;
      case 'coin':
        // a flipped coin landing: two ringing partials and a click
        this.osc('sine', f, f, t0, 0.4).connect(this.env(t0, g, 0.002, 0.35)).connect(dest);
        this.osc('sine', f * 1.34, f * 1.34, t0, 0.3).connect(this.env(t0, g * 0.6, 0.002, 0.25)).connect(dest);
        this.noiseSrc(t0, 0.01).connect(this.filter('highpass', 3000)).connect(this.env(t0, g * 0.6, 0.001, 0.008)).connect(dest);
        break;
      case 'rattle':
        // dice in a cup: a burst of irregular wooden clicks
        for (let k = 0, t = t0; k < 7; k++, t += 0.02 + r() * 0.05)
          this.noiseSrc(t, 0.015).connect(this.filter('bandpass', 1600 + r() * 2200, 5)).connect(this.env(t, g * (1 - k / 9), 0.001, 0.014)).connect(dest);
        break;
      case 'blip':
        this.osc('sine', f, f, t0, 0.1).connect(this.env(t0, g, 0.003, 0.08)).connect(dest);
        this.osc('square', f * 2, f * 2, t0, 0.04).connect(this.filter('lowpass', 3000)).connect(this.env(t0, g * 0.15, 0.002, 0.03)).connect(dest);
        break;
      case 'shepard': {
        // one voice of an endless descent: one octave down every 1.6 s, loudest mid-way
        const dur = c.dur;
        const o = this.osc('sine', f, f * 2 ** (-dur / 1.6), t0, dur);
        const a = ctx.createGain();
        const n = 32;
        const curve = new Float32Array(n);
        const pos0 = Math.log2(1600 / f) / 5;
        for (let k = 0; k < n; k++) {
          const pos = Math.min(1, pos0 + ((k / (n - 1)) * dur) / 1.6 / 5);
          curve[k] = Math.max(0.0001, g * Math.sin(Math.PI * pos));
        }
        a.gain.setValueCurveAtTime(curve, t0, dur);
        const fader = ctx.createGain();
        o.connect(a).connect(fader).connect(dest);
        this.hold(fader, [o], t0, dur);
        break;
      }
      case 'glitch': {
        // stuttering digital bursts while the title scrambles
        const n = 9;
        for (let k = 0; k < n; k++) {
          const t = t0 + (k / n) * c.dur * 0.9 + r() * 0.03;
          const len = 0.02 + r() * 0.05;
          this.noiseSrc(t, len).connect(this.filter('bandpass', 700 + r() * 4300, 4)).connect(this.env(t, 0.32, 0.003, len)).connect(out);
          if (r() < 0.5) this.osc('square', 180 + r() * 900, 120 + r() * 300, t, len).connect(this.env(t, 0.05, 0.002, len)).connect(out);
        }
        break;
      }
      case 'boom':
      case 'hit':
      case 'thump': {
        // sub impact: a sine dropping in pitch, plus a short filtered click for the attack
        const [f0, f1, peak, rel] = c.kind === 'boom' ? [120, 34, 0.95, 1.3] : c.kind === 'hit' ? [170, 48, 0.8, 0.8] : [80, 36, 0.55, 0.5];
        this.osc('sine', f0, f1, t0, rel).connect(this.env(t0, peak, 0.006, rel)).connect(out);
        this.noiseSrc(t0, 0.08).connect(this.filter('lowpass', c.kind === 'hit' ? 2600 : 1200, 0.7)).connect(this.env(t0, c.kind === 'thump' ? 0.12 : 0.3, 0.002, 0.07)).connect(out);
        break;
      }
      case 'whoosh': {
        // filtered noise sweeping up then down, panned left → right with the curtain
        const f = this.filter('bandpass', 260, 0.9);
        f.frequency.setValueAtTime(260, t0);
        f.frequency.exponentialRampToValueAtTime(2800, t0 + c.dur * 0.5);
        f.frequency.exponentialRampToValueAtTime(520, t0 + c.dur);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.55, t0 + c.dur * 0.5);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + c.dur);
        const p = ctx.createStereoPanner();
        p.pan.setValueAtTime(-0.8, t0);
        p.pan.linearRampToValueAtTime(0.8, t0 + c.dur);
        this.noiseSrc(t0, c.dur).connect(f).connect(g).connect(p).connect(out);
        break;
      }
      case 'ticks':
      case 'type': {
        // one click per letter (or per written symbol)
        const n = c.n ?? 8;
        for (let k = 0; k < n; k++) {
          const t = t0 + (n > 1 ? (k / (n - 1)) * c.dur : 0);
          const f = (c.kind === 'ticks' ? 2200 : 1500) + r() * 900;
          this.osc('square', f, f, t, 0.014).connect(this.filter('highpass', 900)).connect(this.env(t, c.kind === 'ticks' ? 0.08 : 0.05, 0.001, 0.012)).connect(out);
        }
        break;
      }
      case 'riser': {
        // tension before the final word: noise and a saw climbing together
        const f = this.filter('bandpass', 300, 1.2);
        f.frequency.setValueAtTime(300, t0);
        f.frequency.exponentialRampToValueAtTime(6000, t0 + c.dur);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.3, t0 + c.dur);
        g.gain.linearRampToValueAtTime(0, t0 + c.dur + 0.04);
        this.noiseSrc(t0, c.dur).connect(f).connect(g).connect(out);
        const g2 = ctx.createGain();
        g2.gain.setValueAtTime(0.0001, t0);
        g2.gain.exponentialRampToValueAtTime(0.05, t0 + c.dur);
        g2.gain.linearRampToValueAtTime(0, t0 + c.dur + 0.04);
        this.osc('sawtooth', 90, 360, t0, c.dur).connect(this.filter('lowpass', 1400)).connect(g2).connect(out);
        break;
      }
    }
  }

  private startDrone(at?: number): void {
    if (this.drone || !this.ctx || !this.out) return;
    const ctx = this.ctx;
    const t0 = at ?? ctx.currentTime;
    const lp = this.filter('lowpass', 420, 0.8);
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.12;
    const depth = ctx.createGain();
    depth.gain.value = 140;
    lfo.connect(depth).connect(lp.frequency);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.06, t0 + 1.2);
    lp.connect(gain).connect(this.out);
    const nodes: AudioScheduledSourceNode[] = [lfo];
    for (const [type, f] of [['triangle', 55], ['sine', 82.41], ['sine', 110.3]] as const) {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = f;
      o.connect(lp);
      nodes.push(o);
    }
    for (const n of nodes) n.start(t0);
    this.drone = { gain, nodes };
  }

  private stopDrone(at?: number): void {
    const d = this.drone;
    if (!d || !this.ctx) return;
    this.drone = null;
    const t = at ?? this.ctx.currentTime;
    if (at === undefined) {
      d.gain.gain.cancelScheduledValues(t);
      d.gain.gain.setValueAtTime(Math.max(0.0001, d.gain.gain.value), t);
    } else d.gain.gain.setValueAtTime(0.06, t); // offline: the fade-in is long over
    d.gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    for (const n of d.nodes) n.stop(t + 0.4);
  }
}
