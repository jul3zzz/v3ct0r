// V3CT0R ATLAS: the whole software as a space to fly through, arcade style. The GALAXY holds one
// universe per explorer module (plus the ACADÉMIE of the LEARN courses); entering one is a jump
// at light speed into its SYSTEM, where every planet is a view (or a course) and a gate plays the
// module intro. Landing on a planet opens it. Z Q S D (W A S D in QWERTY: physical keys), A / E to
// climb and dive, Shift or Space to boost, the mouse (click to capture) to aim, ⏎ to enter.
import * as THREE from 'three';
import './atlas.css';
import { h } from '../hud/dom';
import type { VizContext, VizDef, VizInstance } from '../core/types';
import { store } from '../core/settings';
import { buildAtlas, GALAXY, SYSTEM, type AtlasBody, type AtlasInput, type AtlasTarget, type AtlasUniverse, type Vec3 } from './world';
import { Dust, Trail, emblem, galaxy, lineMat, rng, ship, starField } from './objects';
import { AtlasAudio } from './audio';

export type BodyState = 'locked' | 'open' | 'done' | 'construction';

export interface AtlasHost {
  input(): AtlasInput;
  state(t: AtlasTarget): BodyState;
  /** [validated, total] views of a module; [done, ready] courses for the ACADÉMIE */
  progress(universe: string): [number, number];
  /** open what a body leads to; a string is the reason it is refused */
  enter(t: AtlasTarget): true | string;
  /** classic menus (Tab) */
  menus(): void;
  sound(): boolean;
  /** a dialog or the palette is open: keys are not for the ship */
  blocked(): boolean;
  /** ship parts earned in the story mode (STORY.md §5) */
  parts?(): string[];
  /** the ship arrived in a universe (null: the galaxy) */
  entered?(uni: string | null): void;
  /** story mode: open the ship's log (J) */
  journal?(): void;
}

interface Saved {
  level: 'galaxy' | 'system';
  uni: string | null;
  pos: Vec3;
  yaw: number;
  pitch: number;
}

const SAVE_KEY = 'atlas.v1';
const fresh = (): Saved => ({ level: 'galaxy', uni: null, pos: [...GALAXY.start], yaw: 0, pitch: 0 });
const systemStart = (uni: string): Saved => ({ level: 'system', uni, pos: [...SYSTEM.start], yaw: 0, pitch: 0 });

/** flight model per level: speeds in units / s */
const FLIGHT = {
  galaxy: { max: 150, boost: 460, accel: 90, vert: 60 },
  system: { max: 70, boost: 210, accel: 55, vert: 32 },
};
const WARP_TIME = 1.9;
const LAND_TIME = 1.25;

/** a thing the ship can target */
interface Item {
  id: string;
  kind: 'universe' | 'planet' | 'gate' | 'station';
  code: string;
  title: string;
  sub: string;
  pos: THREE.Vector3;
  radius: number;
  range: number;
  target: AtlasTarget;
  state: BodyState;
  /** its 3D object (pulses while targeted) */
  obj?: THREE.Object3D;
}

export class Atlas {
  active = false;
  saved: Saved;
  private world: AtlasUniverse[] | null = null;
  run: AtlasRun | null = null;

  constructor(readonly host: AtlasHost) {
    const s = store.get<Saved>(SAVE_KEY, fresh());
    this.saved = s && Array.isArray(s.pos) && s.pos.length === 3 ? s : fresh();
  }

  universes(): AtlasUniverse[] {
    this.world ??= buildAtlas(this.host.input());
    if (this.saved.uni && !this.world.some((u) => u.id === this.saved.uni)) this.saved = fresh();
    return this.world;
  }

  leave(): void {
    this.active = false;
    this.persist();
  }

  persist(): void {
    store.set(SAVE_KEY, this.saved);
  }

  /** jump to a system (null: back to the galaxy), from Ctrl+K or the tests */
  goTo(uni: string | null): void {
    if (this.run) this.run.warpTo(uni);
    else this.saved = uni ? systemStart(uni) : fresh();
  }

  viz(): VizDef {
    const self = this;
    return {
      id: 'atlas',
      title: 'ATLAS',
      subtitle: '',
      stage: '3d',
      noCinematic: true,
      formula: { tex: '', note: '' },
      create(ctx) {
        const r = new AtlasRun(ctx, self);
        self.run = r;
        ctx.onDispose(() => {
          if (self.run === r) self.run = null;
        });
        return r;
      },
    };
  }

  info(): ReturnType<AtlasRun['info']> | null {
    return this.run?.info() ?? null;
  }
}

class AtlasRun implements VizInstance {
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private content = new THREE.Group();
  private spinners: { o: THREE.Object3D; ax: 'x' | 'y' | 'z'; w: number }[] = [];
  private ship: ReturnType<typeof ship>;
  private trail = new Trail(480);
  private dust = new Dust(520, 300);
  private stars = starField(2600, 2800);
  private pos = new THREE.Vector3();
  private vel = new THREE.Vector3();
  private yaw = 0;
  private pitch = 0;
  private speed = 0;
  private vert = 0;
  private bank = 0;
  private yawRate = 0;
  private thrust = 0;
  private boosting = false;
  private keys = new Set<string>();
  private mouse = { dx: 0, dy: 0 };
  private level: 'galaxy' | 'system' = 'galaxy';
  private uni: AtlasUniverse | null = null;
  private items: Item[] = [];
  private target: Item | null = null;
  private warp: { t: number; to: string | null; swapped: boolean } | null = null;
  private land: { t: number; item: Item; from: THREE.Vector3 } | null = null;
  private msg: { text: string; until: number } | null = null;
  private card: HTMLElement;
  private audio: AtlasAudio;
  private r = rng(9);
  private clock = 0;
  private camPos = new THREE.Vector3();
  private labels: Record<string, string> = { KeyW: 'Z', KeyA: 'Q', KeyS: 'S', KeyD: 'D', KeyQ: 'A', KeyE: 'E' };
  private q = new THREE.Quaternion();
  private euler = new THREE.Euler(0, 0, 0, 'YXZ');

  constructor(
    private ctx: VizContext,
    private atlas: Atlas,
  ) {
    this.camera = new THREE.PerspectiveCamera(62, ctx.width / Math.max(1, ctx.height), 0.1, 7000);
    this.scene.add(this.stars, this.dust.lines, this.trail.points, this.content);
    this.ship = ship();
    this.scene.add(this.ship.group);
    this.card = h('div', { class: 'atlas-card', 'aria-live': 'polite' });
    this.card.hidden = true;
    ctx.input.parentElement!.append(this.card);
    this.audio = new AtlasAudio(() => atlas.host.sound());
    ctx.input.classList.add('atlas-input');
    ctx.input.setAttribute('aria-label', 'ATLAS : vaisseau à piloter au clavier (ZQSD, A/E, Maj, Entrée)');

    const s = atlas.saved;
    atlas.universes();
    this.enterLevel(s.level, s.uni);
    this.pos.set(...s.pos);
    this.yaw = s.yaw;
    this.pitch = s.pitch;
    this.placeCameraNow();

    // keyboard: physical keys (KeyW is Z on AZERTY, W on QWERTY)
    const nav = navigator as Navigator & { keyboard?: { getLayoutMap?: () => Promise<Map<string, string>> } };
    void nav.keyboard
      ?.getLayoutMap?.()
      .then((m) => {
        for (const code of Object.keys(this.labels)) {
          const l = m.get(code);
          if (l) this.labels[code] = l.toUpperCase();
        }
      })
      .catch(() => undefined);
    ctx.listen(window, 'keydown', (e: KeyboardEvent) => this.onKey(e, true));
    ctx.listen(window, 'keyup', (e: KeyboardEvent) => this.onKey(e, false));
    ctx.listen(window, 'blur', () => this.keys.clear());
    ctx.listen(ctx.input, 'click', () => {
      this.audio.wake();
      if (document.pointerLockElement !== ctx.input) void (ctx.input.requestPointerLock?.() as unknown as Promise<void> | undefined)?.catch?.(() => undefined);
    });
    // mouse aim, like a plane: moving the mouse turns the camera, the ship banks round to follow.
    // Works over the view; a click captures the mouse for unlimited turns.
    ctx.listen(document, 'mousemove', (e: MouseEvent) => {
      if (document.pointerLockElement !== ctx.input && e.target !== ctx.input) return;
      this.mouse.dx += e.movementX;
      this.mouse.dy += e.movementY;
    });
    ctx.onDispose(() => {
      if (document.pointerLockElement === ctx.input) document.exitPointerLock();
      ctx.input.classList.remove('atlas-input');
      this.card.remove();
      this.audio.dispose();
      this.save();
      atlas.persist();
      this.content.clear();
      this.scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else mat?.dispose?.();
      });
    });
    if (!store.get('atlas.help', false)) {
      this.say(`PILOTE : ${this.keyset()} · ${this.labels.KeyQ}/${this.labels.KeyE} MONTER/DESCENDRE · MAJ BOOST · ⏎ ENTRER`, 7);
      store.set('atlas.help', true);
    }
  }

  // ── input ──────────────────────────────────────────────────────────────

  private keyset(): string {
    return `${this.labels.KeyW} ${this.labels.KeyA} ${this.labels.KeyS} ${this.labels.KeyD}`;
  }

  private onKey(e: KeyboardEvent, down: boolean): void {
    if (!this.atlas.active) return;
    const tgt = e.target as HTMLElement | null;
    if (tgt && (tgt.tagName === 'INPUT' || tgt.tagName === 'TEXTAREA')) return;
    if (down && this.atlas.host.blocked()) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const c = e.code;
    const flight = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight', 'Space'];
    if (flight.includes(c)) {
      if (down) {
        this.keys.add(c);
        this.audio.wake();
      } else this.keys.delete(c);
      e.preventDefault();
      return;
    }
    if (!down) return;
    if (c === 'Enter' || c === 'NumpadEnter') {
      e.preventDefault();
      this.audio.wake();
      this.enterTarget();
    } else if (c === 'Escape') {
      if (this.level === 'system' && !this.warp && !this.land) this.warpTo(null);
    } else if (c === 'Tab') {
      e.preventDefault();
      this.atlas.host.menus();
    } else if (c === 'KeyJ' && this.uni?.id === 'story') {
      e.preventDefault();
      this.atlas.host.journal?.();
    } else if (c === 'KeyX' && this.uni?.id === 'story') {
      e.preventDefault();
      this.compass();
    }
  }

  // ── levels ─────────────────────────────────────────────────────────────

  private enterLevel(level: 'galaxy' | 'system', uniId: string | null): void {
    const unis = this.atlas.universes();
    const uni = level === 'system' ? (unis.find((u) => u.id === uniId) ?? null) : null;
    this.level = uni ? 'system' : 'galaxy';
    this.uni = uni;
    for (const c of [...this.content.children]) this.content.remove(c);
    this.spinners = [];
    this.items = [];
    this.target = null;
    this.paintCard();
    this.scene.fog = this.level === 'galaxy' ? new THREE.Fog(0x000000, 420, 1900) : new THREE.Fog(0x000000, 260, 1250);
    if (this.level === 'galaxy') this.buildGalaxy(unis);
    else this.buildSystem(uni!);
  }

  private spin(o: THREE.Object3D, ax: 'x' | 'y' | 'z', w: number): THREE.Object3D {
    this.spinners.push({ o, ax, w });
    return o;
  }

  private buildGalaxy(unis: AtlasUniverse[]): void {
    const host = this.atlas.host;
    // the V3CT0R station at the centre
    const station = new THREE.Group();
    station.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(9, 0)), lineMat(0.9)));
    for (const [rad, rx, w] of [
      [18, 0.3, 0.3],
      [24, 1.2, -0.22],
      [30, 2.1, 0.15],
    ] as const) {
      const ring = this.ring(rad, 0.5);
      ring.rotation.x = rx;
      station.add(this.spin(ring, 'y', w));
    }
    this.content.add(station);
    for (const u of unis) {
      const g = galaxy(GALAXY.uniRadius, u.arms, u.seed);
      g.position.set(...u.pos);
      g.rotation.x = (rng(u.seed)() - 0.5) * 0.9;
      this.content.add(this.spin(g, 'y', 0.03 * (u.seed % 2 ? 1 : -1)));
      // route from the station
      const route = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(...u.pos)]), new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 6, gapSize: 14, transparent: true, opacity: 0.22 }));
      route.computeLineDistances();
      this.content.add(route);
      const [done, total] = host.progress(u.id);
      this.items.push({
        id: `uni:${u.id}`,
        kind: 'universe',
        code: u.id === 'learn' ? 'LEARN' : u.id === 'story' ? 'HISTOIRE' : `MODULE ${u.code}`,
        title: u.title,
        sub: u.id === 'story' ? `${u.tagline} · ${u.bodies.length} balises · ${done}/${total} restaurées` : `${u.tagline} · ${u.bodies.filter((b) => b.kind === 'planet').length} ${u.id === 'learn' ? 'cours' : 'vues'} · ${done}/${total} ${u.id === 'learn' ? 'terminés' : 'validées'}`,
        pos: new THREE.Vector3(...u.pos),
        radius: GALAXY.uniRadius,
        range: GALAXY.enterRange,
        target: { type: 'universe', id: u.id },
        state: 'open',
      });
    }
  }

  private ring(r: number, opacity: number, n = 96): THREE.LineLoop {
    const pts = Array.from({ length: n }, (_, i) => new THREE.Vector3(r * Math.cos((i / n) * Math.PI * 2), 0, r * Math.sin((i / n) * Math.PI * 2)));
    return new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), lineMat(opacity));
  }

  private buildSystem(u: AtlasUniverse): void {
    const host = this.atlas.host;
    // the star
    const star = new THREE.Group();
    star.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(SYSTEM.star, 2)), lineMat(0.55)));
    star.add(this.spin(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(SYSTEM.star * 0.55, 0)), lineMat(1)), 'y', 0.4));
    const corona = this.ring(SYSTEM.star * 1.6, 0.35);
    corona.rotation.x = Math.PI / 2;
    star.add(this.spin(corona, 'z', 0.2));
    this.content.add(this.spin(star, 'y', 0.05));
    for (const ring of u.rings) this.content.add(this.ring(ring.r, ring.label ? 0.16 : 0.08, 160));
    for (const b of u.bodies) {
      const state = host.state(b.target);
      const g = b.kind === 'gate' ? this.gate(b) : emblem(b.emblem, b.radius);
      g.position.set(...b.pos);
      const dim = state === 'locked' ? 0.22 : state === 'construction' ? 0.3 : 1;
      if (dim < 1)
        g.traverse((o) => {
          const m = (o as THREE.Line).material as THREE.LineBasicMaterial | undefined;
          if (m && 'opacity' in m) {
            m.transparent = true;
            m.opacity *= dim;
          }
        });
      if (state === 'done') {
        const halo = this.ring(b.radius * 1.9, 0.9, 64);
        halo.rotation.x = Math.PI / 2 - 0.3;
        g.add(this.spin(halo, 'z', 0.5));
      }
      this.content.add(b.kind === 'gate' ? g : this.spin(g, 'y', 0.15 + (b.radius % 3) * 0.08));
      this.items.push({
        id: b.id,
        kind: b.kind,
        code: b.code,
        title: b.title,
        sub: b.sub,
        pos: new THREE.Vector3(...b.pos),
        radius: b.radius,
        range: b.kind === 'gate' ? 170 : b.radius * 4 + 110,
        target: b.target,
        state,
        obj: g,
      });
    }
    // the gate points at the star
    const gate = u.bodies.find((b) => b.kind === 'gate');
    if (gate) {
      const route = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...gate.pos), new THREE.Vector3()]), new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 4, gapSize: 10, transparent: true, opacity: 0.25 }));
      route.computeLineDistances();
      this.content.add(route);
    }
  }

  private gate(b: AtlasBody): THREE.Group {
    const g = new THREE.Group();
    for (const [k, w] of [
      [1, 0.4],
      [0.74, -0.6],
      [0.5, 0.9],
    ] as const) {
      const ring = this.ring(b.radius * k, k === 1 ? 1 : 0.6, 64);
      ring.rotation.x = Math.PI / 2;
      g.add(this.spin(ring, 'z', w));
    }
    // four struts
    const seg: number[] = [];
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      seg.push(Math.cos(a) * b.radius, Math.sin(a) * b.radius, 0, Math.cos(a) * b.radius * 1.35, Math.sin(a) * b.radius * 1.35, 0);
    }
    g.add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(seg, 3)), lineMat(0.8)));
    return g;
  }

  // ── actions ────────────────────────────────────────────────────────────

  /** jump at light speed: into a system, or (null) back to the galaxy */
  warpTo(uni: string | null): void {
    if (this.warp || this.land) return;
    this.warp = { t: 0, to: uni, swapped: false };
    this.keys.clear();
    this.audio.wake();
    this.audio.warp();
  }

  enterTarget(): void {
    const t = this.target;
    if (!t || this.warp || this.land) return;
    if (t.kind === 'universe') {
      this.warpTo(t.target.id);
      return;
    }
    if (t.state === 'locked') {
      this.audio.deny();
      this.say(t.target.type === 'chapter' ? '◇ BALISE NOYÉE DANS LE BRUIT — RESTAURE D’ABORD LES BALISES OUVERTES DE L’ACTE' : '◇ VERROUILLÉ — VALIDE D’ABORD LA VUE PRÉCÉDENTE (2 EXERCICES SUR 3)', 3);
      return;
    }
    this.land = { t: 0, item: t, from: this.pos.clone() };
    this.audio.land();
  }

  private say(text: string, seconds: number): void {
    this.msg = { text, until: this.clock + seconds };
  }

  // ── frame ──────────────────────────────────────────────────────────────

  private forward(out = new THREE.Vector3()): THREE.Vector3 {
    return out.set(0, 0, -1).applyQuaternion(this.q);
  }

  private orient(): void {
    this.euler.set(this.pitch, this.yaw, 0, 'YXZ');
    this.q.setFromEuler(this.euler);
  }

  /** face a direction */
  private face(d: THREE.Vector3): void {
    const n = d.clone().normalize();
    this.yaw = Math.atan2(-n.x, -n.z);
    this.pitch = Math.asin(Math.max(-1, Math.min(1, n.y)));
    this.aimYaw = this.yaw;
    this.aimPitch = this.pitch;
  }

  /** where the mouse aims (the camera looks there; the ship turns towards it) */
  private aimYaw = 0;
  private aimPitch = 0;
  private qa = new THREE.Quaternion();

  private aimQuat(): THREE.Quaternion {
    return this.qa.setFromEuler(new THREE.Euler(this.aimPitch, this.aimYaw, 0, 'YXZ'));
  }

  private placeCameraNow(): void {
    this.orient();
    this.aimYaw = this.yaw;
    this.aimPitch = this.pitch;
    this.camPos.copy(new THREE.Vector3(0, 3.4, 12).applyQuaternion(this.q).add(this.pos));
  }

  update(_t: number, dtIn: number): void {
    const dt = Math.min(0.05, dtIn);
    this.clock += dt;
    const lvl = FLIGHT[this.level];
    let stretch = 0.12;
    let fovAdd = 0;
    let flash = 0;

    if (this.warp) {
      // charge, jump (scene swap at mid-way), arrival
      const w = this.warp;
      w.t += dt;
      const p = w.t / WARP_TIME;
      const half = Math.min(1, p * 2);
      const out = p < 0.5 ? half * half : 1 - (p - 0.5) * 2;
      stretch = 0.2 + out * 9;
      fovAdd = out * 48;
      flash = Math.max(0, 1 - Math.abs(p - 0.5) * 7);
      this.speed = lvl.max * (0.4 + out * 3);
      if (!w.swapped && p >= 0.5) {
        w.swapped = true;
        const from = this.uni;
        this.enterLevel(w.to ? 'system' : 'galaxy', w.to);
        if (w.to) {
          this.pos.set(...SYSTEM.start);
          this.yaw = 0;
          this.pitch = 0;
        } else {
          // back out next to the universe we left, facing the station
          const u = from ? new THREE.Vector3(...from.pos) : new THREE.Vector3(...GALAXY.start);
          const toHub = u.clone().negate().normalize();
          this.pos.copy(u.clone().add(toHub.clone().multiplyScalar(GALAXY.enterRange + 40)));
          this.face(toHub);
        }
        this.placeCameraNow();
        this.save();
      }
      if (p >= 1) {
        this.warp = null;
        this.speed = lvl.max * 0.35;
        this.atlas.host.entered?.(this.uni?.id ?? null);
        this.say(this.level === 'system' ? `SYSTÈME ${this.uni!.code} · ${this.uni!.title}` : 'GALAXIE V3CT0R', 2.6);
      }
    } else if (this.land) {
      // auto-pilot to the planet, then open it
      const L = this.land;
      L.t += dt;
      const p = Math.min(1, L.t / LAND_TIME);
      const e = p * p * (3 - 2 * p);
      const aim = L.item.pos.clone();
      this.face(aim.clone().sub(this.pos));
      const stop = aim.clone().add(L.from.clone().sub(aim).normalize().multiplyScalar(L.item.radius * 1.4));
      this.pos.lerpVectors(L.from, stop, e);
      this.speed = 0;
      stretch = 0.2 + e * 3;
      fovAdd = e * 22;
      flash = Math.max(0, (p - 0.75) * 4);
      if (p >= 1) {
        const item = L.item;
        this.land = null;
        // leave the ship parked outside the planet for the way back, facing the star
        const out = this.pos.clone().sub(item.pos).normalize();
        this.pos.copy(item.pos.clone().add(out.multiplyScalar(item.radius * 3 + 30)));
        this.face(new THREE.Vector3().sub(this.pos));
        this.save();
        setTimeout(() => {
          const res = this.atlas.host.enter(item.target);
          if (res !== true) {
            this.say(res, 3);
            this.audio.deny();
          }
        }, 0);
      }
    } else this.fly(dt, lvl);

    this.orient();
    // ship transform, banking, engine
    this.ship.group.position.copy(this.pos);
    this.ship.group.quaternion.copy(this.q);
    this.bank += (-this.yawRate * 0.55 - this.bank) * Math.min(1, dt * 5);
    this.ship.group.rotateZ(this.bank);
    this.ship.group.rotateX(-this.vert * 0.004);
    const fl = this.ship.flame.material as THREE.PointsMaterial;
    fl.size = 4 + this.thrust * 6 + (this.boosting ? 6 : 0) + Math.sin(this.clock * 40) * 1.2;
    fl.opacity = 0.35 + this.thrust * 0.65;
    if (this.thrust > 0.05 || this.warp) {
      this.ship.group.updateMatrixWorld();
      const m = this.ship.group.matrixWorld;
      for (const n of this.ship.nozzles) this.trail.emit(n.clone().applyMatrix4(m), this.boosting || this.warp ? 3 : 1, 0.25, this.r);
    }
    this.trail.update(dt, this.boosting ? 1.1 : 0.7);
    this.vel.copy(this.forward()).multiplyScalar(this.speed);
    this.vel.y += this.vert;

    // chase camera, looking where the mouse aims (during jumps and landings: where the ship goes)
    if (this.warp || this.land) {
      this.aimYaw = this.yaw;
      this.aimPitch = this.pitch;
    }
    const qa = this.aimQuat();
    const aimFwd = new THREE.Vector3(0, 0, -1).applyQuaternion(qa);
    const speedK = Math.min(1, Math.abs(this.speed) / lvl.boost);
    const back = new THREE.Vector3(0, 3.2 + speedK * 0.8, 11 + speedK * 6).applyQuaternion(qa).add(this.pos);
    this.camPos.lerp(back, 1 - Math.exp(-dt * (this.warp || this.land ? 12 : 9)));
    this.camera.position.copy(this.camPos);
    if (this.boosting || this.warp) this.camera.position.add(new THREE.Vector3((this.r() - 0.5) * 0.12, (this.r() - 0.5) * 0.12, 0));
    this.camera.lookAt(aimFwd.multiplyScalar(30).add(this.pos));
    this.camera.rotateZ(this.bank * 0.25);
    this.camera.fov = 62 + speedK * 16 + fovAdd;
    this.camera.aspect = this.ctx.width / Math.max(1, this.ctx.height);
    this.camera.updateProjectionMatrix();
    this.stars.position.copy(this.camera.position);

    this.dust.update(this.camera.position, this.warp ? this.forward().multiplyScalar(lvl.max * 3) : this.vel, stretch, this.warp ? 1 : 0.25 + speedK * 0.75);
    for (const s of this.spinners) s.o.rotation[s.ax] += s.w * dt;
    // the targeted planet breathes
    for (const it of this.items) if (it.obj && it.kind !== 'universe') it.obj.scale.setScalar(it === this.target ? 1 + 0.06 * Math.sin(this.clock * 5) + 0.06 : 1);

    if (!this.warp && !this.land) this.pickTarget();
    this.ctx.renderer.render(this.scene, this.camera);
    this.drawHud(flash, speedK);
    this.audio.engineAt(Math.min(1, Math.abs(this.speed) / lvl.boost), this.thrust, this.boosting);
  }

  private fly(dt: number, lvl: (typeof FLIGHT)['galaxy']): void {
    const k = this.keys;
    const fwd = k.has('KeyW') ? 1 : 0;
    const brake = k.has('KeyS') ? 1 : 0;
    const turn = (k.has('KeyA') || k.has('ArrowLeft') ? 1 : 0) - (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0);
    const pitchIn = (k.has('ArrowDown') ? 1 : 0) - (k.has('ArrowUp') ? 1 : 0);
    const up = (k.has('KeyE') ? 1 : 0) - (k.has('KeyQ') ? 1 : 0);
    const boost = (k.has('ShiftLeft') || k.has('ShiftRight') || k.has('Space')) && fwd > 0;
    if (boost && !this.boosting) this.audio.boost();
    this.boosting = boost;
    // steering: the mouse (and Q/D, ↑/↓) move the aim; the ship chases it at a plane's turn rate,
    // banking into the turn
    const mx = this.mouse.dx;
    const my = this.mouse.dy;
    this.mouse.dx = this.mouse.dy = 0;
    this.aimYaw += turn * 1.4 * dt - mx * 0.0024;
    this.aimPitch = Math.max(-1.2, Math.min(1.2, this.aimPitch + pitchIn * 1.0 * dt - my * 0.0024));
    let errYaw = this.aimYaw - this.yaw;
    errYaw = Math.atan2(Math.sin(errYaw), Math.cos(errYaw));
    // keep the aim within reach of the nose (the camera cannot swing behind the ship)
    if (Math.abs(errYaw) > 1.4) this.aimYaw = this.yaw + Math.sign(errYaw) * 1.4;
    const wantYaw = Math.max(-1.6, Math.min(1.6, errYaw * 2.6));
    this.yawRate += (wantYaw - this.yawRate) * Math.min(1, dt * 5);
    this.yaw += this.yawRate * dt;
    const wantPitch = Math.max(-1.2, Math.min(1.2, (this.aimPitch - this.pitch) * 2.6));
    this.pitch = Math.max(-1.2, Math.min(1.2, this.pitch + wantPitch * dt));
    // throttle
    const lever = this.uni?.id === 'story' && this.hasPart('levier') ? 1.5 : 1;
    const max = boost ? lvl.boost * lever : lvl.max;
    this.thrust += ((fwd ? (boost ? 1 : 0.75) : 0) - this.thrust) * Math.min(1, dt * 5);
    if (fwd) this.speed = Math.min(max, this.speed + lvl.accel * (boost ? 3 : 1) * dt);
    else if (brake) this.speed = Math.max(-lvl.max * 0.3, this.speed - lvl.accel * 1.4 * dt);
    else this.speed *= Math.exp(-dt * 0.6);
    if (!boost && this.speed > lvl.max) this.speed += (lvl.max - this.speed) * Math.min(1, dt * 1.5);
    this.vert += (up * lvl.vert - this.vert) * Math.min(1, dt * 4);
    this.orient();
    this.pos.add(this.forward().multiplyScalar(this.speed * dt));
    this.pos.y += this.vert * dt;

    // solid bodies: never fly through a planet or the star
    const solids = this.level === 'system' ? [...this.items.filter((i) => i.kind === 'planet' || i.kind === 'station').map((i) => [i.pos, i.radius + 2.5] as const), [new THREE.Vector3(), SYSTEM.star + 4] as const] : [[new THREE.Vector3(), 14] as const];
    for (const [c, rad] of solids) {
      const d = this.pos.distanceTo(c);
      if (d < rad) {
        this.pos.copy(c.clone().add(this.pos.clone().sub(c).normalize().multiplyScalar(rad)));
        this.speed *= 0.4;
      }
    }
    // edges: leave a system, bounce off the galaxy rim
    if (this.level === 'system' && this.pos.length() > SYSTEM.edge) this.warpTo(null);
    if (this.level === 'galaxy') {
      const L = this.pos.length();
      if (L > 1500) {
        this.pos.multiplyScalar(1500 / L);
        this.speed *= 0.5;
        this.say('LIMITE DE LA GALAXIE — FAIS DEMI-TOUR', 1.6);
      }
      // flying into the heart of a universe takes you in
      for (const it of this.items) if (it.kind === 'universe' && this.pos.distanceTo(it.pos) < 55) this.warpTo(it.target.id);
    }
  }

  private pickTarget(): void {
    // the target is what you aim at (the camera axis), as in a cockpit
    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(this.aimQuat());
    let best: Item | null = null;
    let score = Infinity;
    for (const it of this.items) {
      const d = it.pos.distanceTo(this.pos);
      if (d > it.range) continue;
      const dot = it.pos.clone().sub(this.pos).normalize().dot(fwd);
      const close = d < it.radius * 2.2 + 30;
      if (dot < 0.55 && !close) continue;
      const s = d * (1.7 - Math.max(0, dot));
      if (s < score) {
        score = s;
        best = it;
      }
    }
    if (best !== this.target) {
      this.target = best;
      if (best) this.audio.lock();
      this.paintCard();
    }
  }

  private paintCard(): void {
    const t = this.target;
    this.card.hidden = !t;
    if (!t) return;
    const stateText = t.kind === 'universe' ? 'SYSTÈME' : t.state === 'locked' ? '◇ VERROUILLÉE' : t.state === 'done' ? '✓ VALIDÉE' : t.state === 'construction' ? '▲ EN CONSTRUCTION' : '● DISPONIBLE';
    const action = t.kind === 'universe' ? '⏎ VITESSE LUMIÈRE' : t.kind === 'gate' ? '⏎ LANCER L’INTRO (30 S)' : t.kind === 'station' ? '⏎ ACCOSTER : LEÇON-JEU' : t.state === 'locked' ? 'VERROUILLÉE' : t.target.type === 'course' ? (t.state === 'construction' ? '⏎ VOIR LE PLAN' : '⏎ ENTRER EN COURS') : '⏎ ATTERRIR';
    this.card.replaceChildren(
      h('div', { class: 'ac-top' }, h('span', { text: t.code }), h('span', { class: 'st', text: stateText })),
      h('div', { class: 'ac-title', text: t.title }),
      ...(t.sub ? [h('div', { class: 'ac-sub', text: t.sub })] : []),
      h('div', { class: `ac-go${t.state === 'locked' ? ' off' : ''}`, text: action }),
    );
  }

  private save(): void {
    this.atlas.saved = { level: this.level, uni: this.uni?.id ?? null, pos: [this.pos.x, this.pos.y, this.pos.z], yaw: this.yaw, pitch: this.pitch };
  }

  // ── HUD (overlay canvas) ───────────────────────────────────────────────

  private project(p: THREE.Vector3): [number, number, boolean] {
    const v = p.clone().project(this.camera);
    const behind = p.clone().applyMatrix4(this.camera.matrixWorldInverse).z > 0;
    return [(v.x * 0.5 + 0.5) * this.ctx.width, (-v.y * 0.5 + 0.5) * this.ctx.height, !behind && v.z < 1];
  }

  private drawHud(flash: number, speedK: number): void {
    const g = this.ctx.g;
    const W = this.ctx.width;
    const H = this.ctx.height;
    const font = (px: number) => `${px}px "JetBrains Mono", ui-monospace, monospace`;
    const white = (a: number) => `rgba(255,255,255,${a})`;
    g.save();
    g.lineWidth = 1;
    g.textBaseline = 'middle';

    // labels of bodies: the target first, then the nearest; full title when close, code only
    // when far; a label that would overlap one already drawn is skipped
    g.font = font(10);
    g.textAlign = 'left';
    const far = this.level === 'galaxy' ? 2400 : 900;
    const near = this.level === 'galaxy' ? 2400 : 230;
    const taken: [number, number, number, number][] = [];
    const order = [...this.items].sort((p, q) => (p === this.target ? -1 : q === this.target ? 1 : p.pos.distanceTo(this.pos) - q.pos.distanceTo(this.pos)));
    for (const it of order) {
      const d = it.pos.distanceTo(this.pos);
      if (d > far) continue;
      const [x, y, vis] = this.project(it.pos);
      if (!vis || x < -50 || x > W + 50 || y < -50 || y > H + 50) continue;
      const text = it === this.target || d < near ? `${it.code} ${it.title}` : it.code;
      const w = g.measureText(text).width;
      const box: [number, number, number, number] = [x + 20, y - 21, x + 26 + w, y - 7];
      if (taken.some((b) => box[0] < b[2] && box[2] > b[0] && box[1] < b[3] && box[3] > b[1])) continue;
      taken.push(box);
      const a = Math.max(0.2, Math.min(0.9, 1 - d / far)) * (it.state === 'locked' ? 0.5 : 1) * (it === this.target ? 1.2 : 1);
      g.fillStyle = white(Math.min(1, a));
      g.strokeStyle = white(a * 0.6);
      g.beginPath();
      g.moveTo(x + 4, y - 4);
      g.lineTo(x + 14, y - 14);
      g.lineTo(x + 20, y - 14);
      g.stroke();
      g.fillText(text, x + 23, y - 14);
    }
    // off-screen universes: chevrons on the edges (the compass of the galaxy)
    if (this.level === 'galaxy') {
      for (const it of this.items) {
        const [x, y, vis] = this.project(it.pos);
        if (vis && x > 0 && x < W && y > 0 && y < H) continue;
        const rel = it.pos.clone().applyMatrix4(this.camera.matrixWorldInverse);
        const ang = Math.atan2(-rel.y, rel.x);
        const cx = W / 2 + Math.cos(ang) * (W / 2 - 34);
        const cy = H / 2 + Math.sin(ang) * (H / 2 - 34);
        g.save();
        g.translate(cx, cy);
        g.rotate(ang);
        g.strokeStyle = white(0.7);
        g.beginPath();
        g.moveTo(-5, -6);
        g.lineTo(3, 0);
        g.lineTo(-5, 6);
        g.stroke();
        g.restore();
        g.fillStyle = white(0.55);
        g.textAlign = 'center';
        g.fillText(it.code.replace('MODULE ', ''), cx - Math.cos(ang) * 16, cy - Math.sin(ang) * 16);
      }
    }
    // target brackets
    const t = this.target;
    if (t) {
      const [x, y, vis] = this.project(t.pos);
      if (vis) {
        const d = t.pos.distanceTo(this.camera.position);
        const s = Math.max(16, Math.min(160, (t.radius / Math.max(1, d)) * (H / (2 * Math.tan((this.camera.fov * Math.PI) / 360))) * 1.25));
        const k = 8 + Math.sin(this.clock * 6) * 2;
        g.strokeStyle = white(t.state === 'locked' ? 0.45 : 1);
        g.beginPath();
        for (const [sx, sy] of [
          [-1, -1],
          [1, -1],
          [1, 1],
          [-1, 1],
        ]) {
          g.moveTo(x + sx * s, y + sy * (s - k));
          g.lineTo(x + sx * s, y + sy * s);
          g.lineTo(x + sx * (s - k), y + sy * s);
        }
        g.stroke();
        g.fillStyle = white(0.9);
        g.textAlign = 'center';
        const dist = t.pos.distanceTo(this.pos);
        const story = this.uni?.id === 'story';
        let read = story && this.hasPart('sexagesimal') ? `${dist.toFixed(1).replace('.', ',')} u` : `${Math.round(dist)} u`;
        if (story && this.hasPart('gnomon')) {
          const off = t.pos.clone().sub(this.pos).normalize().angleTo(this.forward());
          read += ` · cap ${((off * 180) / Math.PI).toFixed(1).replace('.', ',')}°`;
        }
        g.fillText(read, x, y + s + 12);
      }
    }
    // reticle
    g.strokeStyle = white(0.55);
    g.beginPath();
    g.arc(W / 2, H / 2, 9, 0, Math.PI * 2);
    g.moveTo(W / 2 - 18, H / 2);
    g.lineTo(W / 2 - 12, H / 2);
    g.moveTo(W / 2 + 12, H / 2);
    g.lineTo(W / 2 + 18, H / 2);
    g.stroke();
    // where the nose points (the ship lags behind the aim, like a plane)
    const [nx, ny, nvis] = this.project(this.forward().multiplyScalar(400).add(this.pos));
    if (nvis && Math.hypot(nx - W / 2, ny - H / 2) > 6) {
      g.strokeStyle = white(0.8);
      g.beginPath();
      g.moveTo(nx - 6, ny);
      g.lineTo(nx + 6, ny);
      g.moveTo(nx, ny - 6);
      g.lineTo(nx, ny + 6);
      g.stroke();
      g.strokeStyle = white(0.25);
      g.setLineDash([3, 4]);
      g.beginPath();
      g.moveTo(nx, ny);
      g.lineTo(W / 2, H / 2);
      g.stroke();
      g.setLineDash([]);
    }

    // location and coordinates
    g.textAlign = 'left';
    g.font = font(11);
    g.fillStyle = white(0.9);
    const where = this.level === 'galaxy' ? 'ATLAS // GALAXIE V3CT0R' : `ATLAS // SYSTÈME ${this.uni!.code} · ${this.uni!.title} ${this.uni!.kanji}`;
    g.fillText(where, 16, 20);
    g.fillStyle = white(0.5);
    g.font = font(10);
    g.fillText(`X ${this.pos.x.toFixed(0).padStart(5)}  Y ${this.pos.y.toFixed(0).padStart(4)}  Z ${this.pos.z.toFixed(0).padStart(5)}`, 16, 36);

    // speed gauge
    const gx = 16;
    const gy = H - 46;
    g.fillStyle = white(0.6);
    g.fillText(this.boosting ? 'VITESSE · BOOST' : 'VITESSE', gx, gy - 12);
    g.strokeStyle = white(0.4);
    g.strokeRect(gx, gy, 180, 8);
    g.fillStyle = white(0.9);
    g.fillRect(gx + 1, gy + 1, Math.max(0, 178 * speedK), 6);
    g.fillStyle = white(0.8);
    g.fillText(`${(Math.abs(this.speed) / (this.level === 'galaxy' ? 500 : 230)).toFixed(2)} c`, gx + 190, gy + 4);

    // radar (top view around the ship, heading up)
    const R = 54;
    const rx = W - R - 18;
    const ry = H - R - 18;
    g.strokeStyle = white(0.35);
    g.beginPath();
    g.arc(rx, ry, R, 0, Math.PI * 2);
    g.moveTo(rx, ry - R);
    g.lineTo(rx, ry + R);
    g.moveTo(rx - R, ry);
    g.lineTo(rx + R, ry);
    g.stroke();
    const range = this.level === 'galaxy' ? 1400 : 650;
    const cy = Math.cos(this.yaw);
    const sy = Math.sin(this.yaw);
    for (const it of this.items) {
      const dx = it.pos.x - this.pos.x;
      const dz = it.pos.z - this.pos.z;
      // rotate so that the heading points up
      const px = dx * cy - dz * sy;
      const pz = dx * sy + dz * cy;
      let ux = (px / range) * R;
      let uy = (pz / range) * R;
      const L = Math.hypot(ux, uy);
      if (L > R) {
        ux *= R / L;
        uy *= R / L;
      }
      g.fillStyle = white(it === t ? 1 : it.state === 'locked' ? 0.3 : 0.7);
      g.fillRect(rx + ux - (it === t ? 2.5 : 1.5), ry + uy - (it === t ? 2.5 : 1.5), it === t ? 5 : 3, it === t ? 5 : 3);
    }
    g.fillStyle = white(1);
    g.beginPath();
    g.moveTo(rx, ry - 5);
    g.lineTo(rx - 3.5, ry + 4);
    g.lineTo(rx + 3.5, ry + 4);
    g.closePath();
    g.fill();

    // controls
    g.textAlign = 'center';
    g.font = font(10);
    g.fillStyle = white(0.45);
    const hint = this.uni?.id === 'story' ? `J JOURNAL${this.hasPart('compas') ? ' · X COMPAS' : ''} · ÉCHAP QUITTER` : this.level === 'system' ? 'ÉCHAP QUITTER LE SYSTÈME' : 'TAB MENUS CLASSIQUES';
    g.fillText(`${this.keyset()} PILOTER · ${this.labels.KeyQ}/${this.labels.KeyE} MONTER/DESCENDRE · MAJ BOOST · SOURIS DIRIGER (CLIC : CAPTURER) · ⏎ ENTRER · ${hint}`, W / 2, H - 14);

    // message
    if (this.msg && this.msg.until > this.clock) {
      const a = Math.min(1, (this.msg.until - this.clock) / 0.5);
      g.font = font(12);
      const w = g.measureText(this.msg.text).width + 28;
      g.fillStyle = `rgba(0,0,0,${0.75 * a})`;
      g.fillRect(W / 2 - w / 2, 54, w, 26);
      g.strokeStyle = white(0.6 * a);
      g.strokeRect(W / 2 - w / 2 + 0.5, 54.5, w - 1, 25);
      g.fillStyle = white(a);
      g.fillText(this.msg.text, W / 2, 67.5);
    }

    // light speed
    if (this.warp) {
      const p = this.warp.t / WARP_TIME;
      g.font = `${Math.round(Math.min(W, 1400) / 26)}px Michroma, sans-serif`;
      g.fillStyle = white(Math.min(1, Math.sin(Math.PI * p) * 1.4));
      const txt = 'VITESSE LUMIÈRE';
      const n = Math.ceil(Math.min(1, p * 3) * txt.length);
      g.fillText(txt.slice(0, n) + (n < txt.length ? '#%&'.charAt(Math.floor(this.clock * 30) % 3) : ''), W / 2, H / 2 - 70);
      g.font = font(11);
      const dest = this.warp.to ? this.atlas.universes().find((u) => u.id === this.warp!.to) : null;
      g.fillText(dest ? `→ SYSTÈME ${dest.code} · ${dest.title}` : '→ GALAXIE V3CT0R', W / 2, H / 2 - 40);
    }
    if (flash > 0) {
      g.fillStyle = white(Math.min(1, flash));
      g.fillRect(0, 0, W, H);
    }
    g.restore();
  }

  resize(): void {
    this.camera.aspect = this.ctx.width / Math.max(1, this.ctx.height);
    this.camera.updateProjectionMatrix();
  }

  dispose(): void {
    /* released by ctx.onDispose */
  }

  info() {
    return {
      level: this.level,
      uni: this.uni?.id ?? null,
      pos: [this.pos.x, this.pos.y, this.pos.z] as Vec3,
      speed: this.speed,
      yaw: this.yaw,
      target: this.target?.id ?? null,
      items: this.items.length,
      warp: !!this.warp,
      land: !!this.land,
    };
  }

  /** tests: put the ship in front of a body, ready to enter it */
  /** rebuild the bodies of the current level (their states changed), the ship stays where it is */
  refresh(): void {
    if (this.warp || this.land) return;
    this.enterLevel(this.level, this.uni?.id ?? null);
    this.pickTarget();
  }

  private hasPart(id: string): boolean {
    return this.atlas.host.parts?.().includes(id) ?? false;
  }

  /** compass of Euclid: fly to the beacon closest to the aim, however far */
  private compass(): void {
    if (!this.hasPart('compas')) {
      this.say('◇ LE COMPAS D’EUCLIDE S’OBTIENT EN RESTAURANT LES ÉLÉMENTS (I.4)', 3);
      this.audio.deny();
      return;
    }
    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(this.aimQuat());
    let best: Item | null = null;
    let dot = -2;
    for (const it of this.items) {
      const d = it.pos.clone().sub(this.pos).normalize().dot(fwd);
      if (d > dot) {
        dot = d;
        best = it;
      }
    }
    if (best && this.approach(best.id)) {
      this.say(`COMPAS D’EUCLIDE → ${best.code} ${best.title}`, 2.4);
      this.audio.lock();
    }
  }

  approach(id: string): boolean {
    const it = this.items.find((i) => i.id === id);
    if (!it || this.warp || this.land) return false;
    const from = it.pos.clone().add(new THREE.Vector3(0, 6, it.radius * 2 + 40));
    this.pos.copy(from);
    this.face(it.pos.clone().sub(from));
    this.speed = 0;
    this.placeCameraNow();
    this.pickTarget();
    return this.target === it;
  }
}
