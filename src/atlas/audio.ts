// ATLAS sounds, synthesized (no file): the engine follows the speed, a ping when a target locks,
// a riser and a boom for light speed, a dive for landings, a dry buzz when access is refused.
// Follows the app's SON setting (toggled with M).

export class AtlasAudio {
  private ctx: AudioContext | null = null;
  private out: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private engine: { osc: OscillatorNode; sub: OscillatorNode; lp: BiquadFilterNode; gain: GainNode; air: GainNode; airF: BiquadFilterNode } | null = null;

  constructor(private enabled: () => boolean) {}

  /** create the context on a user gesture */
  wake(): void {
    if (!this.enabled()) return;
    if (!this.ctx) {
      try {
        const ctx = new AudioContext();
        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -16;
        comp.ratio.value = 6;
        const out = ctx.createGain();
        out.gain.value = 0.5;
        out.connect(comp).connect(ctx.destination);
        const len = ctx.sampleRate;
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        this.ctx = ctx;
        this.out = out;
        this.noise = buf;
        this.startEngine();
      } catch {
        return;
      }
    }
    void this.ctx.resume().catch(() => undefined);
  }

  private startEngine(): void {
    const ctx = this.ctx!;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 300;
    lp.Q.value = 3;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = 42;
    const sub = ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.value = 42;
    osc.connect(lp);
    sub.connect(lp);
    lp.connect(gain).connect(this.out!);
    // air: filtered noise, louder with speed
    const n = ctx.createBufferSource();
    n.buffer = this.noise;
    n.loop = true;
    const airF = ctx.createBiquadFilter();
    airF.type = 'bandpass';
    airF.frequency.value = 600;
    airF.Q.value = 0.6;
    const air = ctx.createGain();
    air.gain.value = 0;
    n.connect(airF).connect(air).connect(this.out!);
    osc.start();
    sub.start();
    n.start();
    this.engine = { osc, sub, lp, gain, air, airF };
  }

  /** every frame: speed in [0, 1] of the max, boost on/off, thrust in [0, 1] */
  engineAt(speed: number, thrust: number, boost: boolean): void {
    const e = this.engine;
    const ctx = this.ctx;
    if (!e || !ctx) return;
    const on = this.enabled() ? 1 : 0;
    const t = ctx.currentTime;
    const k = 0.08;
    e.osc.frequency.setTargetAtTime(38 + speed * 70 + (boost ? 25 : 0), t, k);
    e.sub.frequency.setTargetAtTime(38 + speed * 70 + (boost ? 25 : 0), t, k);
    e.lp.frequency.setTargetAtTime(220 + thrust * 500 + speed * 900, t, k);
    e.gain.gain.setTargetAtTime(on * (0.05 + thrust * 0.12 + speed * 0.05), t, k);
    e.air.gain.setTargetAtTime(on * speed * (boost ? 0.32 : 0.16), t, k);
    e.airF.frequency.setTargetAtTime(400 + speed * 2200, t, k);
  }

  private env(t0: number, peak: number, a: number, r: number): GainNode {
    const g = this.ctx!.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + r);
    g.connect(this.out!);
    return g;
  }

  private tone(type: OscillatorType, f0: number, f1: number, t0: number, dur: number, into: AudioNode): void {
    const o = this.ctx!.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, t0);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    o.connect(into);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  }

  private hiss(t0: number, dur: number, f0: number, f1: number, into: AudioNode, q = 0.8): void {
    const ctx = this.ctx!;
    const s = ctx.createBufferSource();
    s.buffer = this.noise;
    s.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = q;
    f.frequency.setValueAtTime(f0, t0);
    f.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    s.connect(f).connect(into);
    s.start(t0);
    s.stop(t0 + dur + 0.05);
  }

  private ready(): number | null {
    if (!this.enabled() || !this.ctx) return null;
    return this.ctx.currentTime + 0.01;
  }

  /** a target is locked */
  lock(): void {
    const t = this.ready();
    if (t === null) return;
    this.tone('sine', 1320, 1320, t, 0.08, this.env(t, 0.12, 0.003, 0.08));
    this.tone('sine', 1980, 1980, t + 0.07, 0.1, this.env(t + 0.07, 0.1, 0.003, 0.1));
  }

  /** access refused (locked view) */
  deny(): void {
    const t = this.ready();
    if (t === null) return;
    this.tone('square', 110, 90, t, 0.25, this.env(t, 0.12, 0.005, 0.25));
  }

  /** boost kicks in */
  boost(): void {
    const t = this.ready();
    if (t === null) return;
    this.hiss(t, 0.6, 300, 2400, this.env(t, 0.3, 0.05, 0.55));
  }

  /** light speed: riser to the jump at +0.9 s, then a deep boom */
  warp(): void {
    const t = this.ready();
    if (t === null) return;
    const g = this.ctx!.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.5, t + 0.88);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
    g.connect(this.out!);
    this.hiss(t, 1.1, 200, 7000, g, 1.2);
    this.tone('sawtooth', 70, 600, t, 0.9, g);
    const b = t + 0.9;
    this.tone('sine', 140, 30, b, 1.6, this.env(b, 0.9, 0.005, 1.6));
    this.hiss(b, 1.2, 3000, 200, this.env(b, 0.35, 0.005, 1.1));
  }

  /** dive towards a planet */
  land(): void {
    const t = this.ready();
    if (t === null) return;
    this.hiss(t, 1.1, 2400, 300, this.env(t, 0.35, 0.3, 0.8));
    this.tone('sine', 300, 60, t + 0.8, 0.6, this.env(t + 0.8, 0.6, 0.005, 0.6));
  }

  dispose(): void {
    void this.ctx?.close().catch(() => undefined);
    this.ctx = null;
    this.engine = null;
  }
}
