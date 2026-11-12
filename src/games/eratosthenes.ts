// L'OMBRE D'ALEXANDRIE (mode histoire, acte I): at noon on the solstice the Sun is at the zenith
// in Syene, and a gnomon in Alexandria casts a shadow. With parallel rays, the shadow angle is the
// angle at the centre of the Earth between the two towns; with their distance, it gives the
// circumference. The player measures the angle by aligning an arm from the top of the gnomon to
// the tip of its shadow.
import { type Box, type GameDef, type GameLogic, type RoundResult, type TouchKey, fr } from './types';

export interface Site {
  label: string;
  /** distance between the two places along the meridian */
  dist: number;
  unit: string;
  /** true angle in degrees */
  angle: number;
}

/** circumference from the measured angle (degrees) and the distance */
export const circumference = (angleDeg: number, dist: number): number => (360 / angleDeg) * dist;

const SITES: Site[][] = [
  [
    { label: 'Syène → Alexandrie (vers −240)', dist: 5000, unit: 'stades', angle: 7.2 },
    { label: 'Syène → Alexandrie, ombre d’un obélisque', dist: 5000, unit: 'stades', angle: 7.2 },
    { label: 'Une ville à 1 110 km au nord du tropique', dist: 1110, unit: 'km', angle: 10 },
    { label: 'Une ville à 610 km au nord du tropique', dist: 610, unit: 'km', angle: 5.5 },
  ],
  [
    { label: 'Dunkerque → Barcelone (Delambre et Méchain, 1792–1798)', dist: 1075, unit: 'km', angle: 9.67 },
    { label: 'Picard (1669–1670) : un degré de méridien, 57 060 toises', dist: 111.2, unit: 'km', angle: 1 },
    { label: 'Laponie : la mesure de Maupertuis (1736–1737)', dist: 107, unit: 'km', angle: 0.958 },
    { label: 'Pérou : l’arc de La Condamine (1735–1744)', dist: 345, unit: 'km', angle: 3.12 },
  ],
  [
    { label: 'Sur la Lune : deux cratères à 303 km', dist: 303, unit: 'km', angle: 10 },
    { label: 'Sur Mars : deux sondes à 474 km', dist: 474, unit: 'km', angle: 8 },
    { label: 'Sur Mercure : deux pôles d’observation à 213 km', dist: 213, unit: 'km', angle: 5 },
    { label: 'Sur Titan : deux points à 225 km', dist: 225, unit: 'km', angle: 5 },
  ],
];

/** tolerated relative error on the angle for a score of 0, by level */
const TOL = [0.25, 0.1, 0.06];

class Eratosthenes implements GameLogic {
  private site: Site = SITES[0][0];
  private level = 0;
  /** measured angle (degrees), set by the arm */
  private arm = 20;
  private box: Box = { x: 0, y: 0, w: 1, h: 1 };
  private dragging = false;

  start(level: number, round: number, r: () => number): void {
    this.level = level;
    const pool = SITES[level];
    this.site = round < pool.length ? pool[round] : pool[Math.floor(r() * pool.length)];
    this.arm = this.site.angle * (1.8 + r() * 1.5);
  }

  prompt(): string {
    return `${this.site.label.toUpperCase()} · MESURE L’ANGLE DE L’OMBRE`;
  }

  controls(): string {
    return 'GLISSER DANS LE ZOOM : POINTER LE BRAS SUR LE BOUT DE L’OMBRE · ← → AJUSTER (MAJ : FIN) · ⏎ VALIDER';
  }

  touchControls(): string {
    return 'GLISSER DANS LE ZOOM : POINTER LE BRAS SUR LE BOUT DE L’OMBRE · ◀ ▶ AJUSTER (◁ ▷ : FIN)';
  }

  touchKeys(): TouchKey[] {
    return [
      { label: '◀', title: 'Ajuster vers la gauche', key: 'ArrowLeft', repeat: true },
      { label: '◁', title: 'Ajuster finement vers la gauche', key: 'ArrowLeft', shift: true, repeat: true },
      { label: '▷', title: 'Ajuster finement vers la droite', key: 'ArrowRight', shift: true, repeat: true },
      { label: '▶', title: 'Ajuster vers la droite', key: 'ArrowRight', repeat: true },
    ];
  }

  /** zoom inset geometry: gnomon foot, height, and the magnification of the angle */
  private inset(): { fx: number; fy: number; hgt: number; zoom: number } {
    const b = this.box;
    // small angles are magnified so that they stay measurable (the scale is shown)
    const zoom = this.level === 0 ? 1 : this.level === 1 ? 3 : 2;
    // narrow play area (phone): the gnomon on the left, the readouts under the ground
    if (this.narrow) return { fx: b.x + b.w * 0.2, fy: b.y + b.h - 110, hgt: Math.min(b.h * 0.5, 240), zoom };
    return { fx: b.x + b.w * 0.6, fy: b.y + b.h - 70, hgt: Math.min(b.h - 140, 300), zoom };
  }

  private get narrow(): boolean {
    return this.box.w > 1 && this.box.w < 520;
  }

  /** screen angle of a real angle (degrees → radians, magnified) */
  private screen(deg: number): number {
    const z = this.inset().zoom;
    return Math.atan(Math.tan((deg * Math.PI) / 180) * z);
  }

  private fromScreen(rad: number): number {
    const z = this.inset().zoom;
    return (Math.atan(Math.tan(rad) / z) * 180) / Math.PI;
  }

  pointer(type: 'move' | 'down' | 'up' | 'wheel', x: number, y: number): void {
    const I = this.inset();
    const tipY = I.fy - I.hgt;
    if (type === 'down' && (this.narrow ? y > tipY - 20 : x > this.box.x + this.box.w * 0.42)) this.dragging = true;
    if (type === 'up') this.dragging = false;
    if ((type === 'down' || type === 'move') && this.dragging && y > tipY + 4) {
      const a = Math.atan2(x - I.fx, y - tipY);
      this.arm = Math.max(0.05, Math.min(60, this.fromScreen(Math.max(0.001, a))));
    }
  }

  key(e: KeyboardEvent): boolean {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return false;
    const step = (e.shiftKey ? 0.01 : 0.1) * (this.level === 0 ? 1 : 0.5);
    this.arm = Math.max(0.05, this.arm + (e.key === 'ArrowLeft' ? -step : step));
    return true;
  }

  submit(timeout: boolean): RoundResult | null {
    const e = Math.abs(this.arm - this.site.angle) / this.site.angle;
    const score = Math.round(100 * Math.max(0, 1 - e / TOL[this.level]));
    const c = circumference(this.arm, this.site.dist);
    return {
      ok: score >= 50,
      score,
      detail: `angle ${fr(this.arm, 2)}° (vrai ${fr(this.site.angle, 2)}°) · tour ≈ ${Math.round(c).toLocaleString('fr-FR')} ${this.site.unit} (avec l’angle vrai : ${Math.round(circumference(this.site.angle, this.site.dist)).toLocaleString('fr-FR')})${timeout ? ' · au temps' : ''}`,
    };
  }

  draw(g: CanvasRenderingContext2D, box: Box, _t: number, phase: 'play' | 'reveal'): void {
    this.box = box;
    const s = this.site;
    g.save();
    g.font = '12px "JetBrains Mono", monospace';
    g.textBaseline = 'middle';
    // left (narrow: top right): the planet in cross-section, the two places, the angle at the centre (not to scale)
    const narrow = this.narrow;
    const R = narrow ? Math.min(box.w * 0.15, 52) : Math.min(box.w * 0.18, box.h * 0.32);
    const cx = box.x + box.w * (narrow ? 0.74 : 0.22);
    const cy = narrow ? box.y + R + 54 : box.y + box.h * 0.55;
    g.strokeStyle = 'rgba(255,255,255,0.8)';
    g.beginPath();
    g.arc(cx, cy, R, 0, Math.PI * 2);
    g.stroke();
    const shown = Math.max(12, Math.min(40, s.angle * 3)) * (Math.PI / 180);
    const pA = [cx, cy - R];
    const pB = [cx + R * Math.sin(shown), cy - R * Math.cos(shown)];
    g.setLineDash([4, 4]);
    g.beginPath();
    g.moveTo(cx, cy);
    g.lineTo(pA[0], pA[1] - 40);
    g.moveTo(cx, cy);
    g.lineTo(cx + (R + 40) * Math.sin(shown), cy - (R + 40) * Math.cos(shown));
    g.stroke();
    g.setLineDash([]);
    // parallel sun rays from the top
    g.strokeStyle = 'rgba(255,255,255,0.3)';
    for (let k = -3; k <= 3; k++) {
      g.beginPath();
      g.moveTo(cx + k * 22, box.y + 8);
      g.lineTo(cx + k * 22, cy - R - 6);
      g.stroke();
    }
    g.fillStyle = '#fff';
    g.beginPath();
    g.arc(pA[0], pA[1], 3, 0, Math.PI * 2);
    g.arc(pB[0], pB[1], 3, 0, Math.PI * 2);
    g.fill();
    g.textAlign = 'center';
    g.fillText(`${s.dist.toLocaleString('fr-FR')} ${s.unit}`, (pA[0] + pB[0]) / 2 + 30, (pA[1] + pB[1]) / 2 - 16);
    g.fillText('θ ?', cx + 18, cy - 34);
    g.fillStyle = 'rgba(255,255,255,0.5)';
    g.fillText('schéma, pas à l’échelle', cx, cy + R + 18);
    // right: the gnomon, its shadow, the measuring arm
    const I = this.inset();
    const tipY = I.fy - I.hgt;
    const sa = this.screen(s.angle);
    const shadow = I.hgt * Math.tan(sa);
    g.strokeStyle = 'rgba(255,255,255,0.4)';
    g.beginPath();
    g.moveTo(I.fx - 60, I.fy);
    g.lineTo(I.fx + Math.max(220, shadow + 80), I.fy);
    g.stroke();
    // shadow on the ground
    g.fillStyle = 'rgba(255,255,255,0.55)';
    g.fillRect(I.fx, I.fy - 4, shadow, 8);
    g.strokeStyle = '#fff';
    g.beginPath();
    g.moveTo(I.fx + shadow, I.fy - 12);
    g.lineTo(I.fx + shadow, I.fy + 12);
    g.stroke();
    g.font = '11px "JetBrains Mono", monospace';
    g.fillStyle = 'rgba(255,255,255,0.8)';
    g.textAlign = 'center';
    g.fillText('bout de l’ombre', I.fx + shadow, I.fy + 24);
    g.font = '12px "JetBrains Mono", monospace';
    // the gnomon
    g.strokeStyle = '#fff';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(I.fx, I.fy);
    g.lineTo(I.fx, tipY);
    g.stroke();
    g.lineWidth = 1;
    // sun rays: parallel, at the true angle, through the top of the gnomon (only at the reveal)
    if (phase === 'reveal') {
      g.strokeStyle = 'rgba(255,255,255,0.5)';
      g.setLineDash([2, 4]);
      g.beginPath();
      g.moveTo(I.fx - Math.tan(sa) * 120, tipY - 120);
      g.lineTo(I.fx + shadow, I.fy);
      g.stroke();
      g.setLineDash([]);
    }
    // the arm
    const am = this.screen(this.arm);
    const len = I.hgt / Math.cos(am);
    g.strokeStyle = '#fff';
    g.beginPath();
    g.moveTo(I.fx, tipY);
    g.lineTo(I.fx + len * Math.sin(am), tipY + len * Math.cos(am));
    g.stroke();
    g.beginPath();
    g.arc(I.fx, tipY, 40, Math.PI / 2 - am, Math.PI / 2);
    g.stroke();
    g.textAlign = 'left';
    // the readouts: next to the arm, or (narrow) under the ground line, smaller
    const rx = narrow ? box.x + 14 : I.fx + 50;
    const ry = narrow ? I.fy + 44 : tipY + 20;
    const lh = narrow ? 16 : 20;
    g.font = narrow ? '14px "JetBrains Mono", monospace' : '16px "JetBrains Mono", monospace';
    g.fillStyle = '#fff';
    g.fillText(`θ mesuré = ${fr(this.arm, 2)}°`, rx, ry);
    g.font = narrow ? '11px "JetBrains Mono", monospace' : '12px "JetBrains Mono", monospace';
    g.fillStyle = 'rgba(255,255,255,0.75)';
    g.fillText(`tour estimé = 360° / θ × ${s.dist.toLocaleString('fr-FR')} = ${Math.round(circumference(this.arm, s.dist)).toLocaleString('fr-FR')} ${s.unit}`, rx, ry + lh + (narrow ? 2 : 4));
    if (I.zoom > 1) g.fillText(`zoom ×${I.zoom} sur la tangente de l’angle`, rx, ry + 2 * lh + (narrow ? 2 : 4));
    if (phase === 'reveal') g.fillText(`angle vrai ${fr(s.angle, 3)}° · un ${Math.round(360 / s.angle)}ᵉ de cercle environ`, rx, ry + 3 * lh + (narrow ? 2 : 4));
    g.restore();
  }
}

export const ERATOSTHENES: GameDef = {
  id: 'eratosthenes',
  title: 'L’ombre d’Alexandrie',
  subtitle: 'Mesurer la Terre avec un bâton, comme Ératosthène.',
  module: 'constants',
  view: 'constants/pi',
  minutes: 7,
  brief:
    'À midi, au solstice d’été, le Soleil est à la verticale de Syène. Au même moment à Alexandrie, un bâton vertical fait une ombre. Mesure l’angle entre le bâton et le rayon qui passe par le bout de l’ombre : c’est aussi l’angle au centre de la Terre entre les deux villes. Avec leur distance, tu as le tour de la Terre.',
  rules: [
    'Glisser dans la partie droite : orienter le bras depuis le haut du gnomon vers le bout de l’ombre. ← → : ajuster (Maj : plus fin). ⏎ : valider.',
    'Score selon l’erreur relative sur l’angle : 25 % au niveau 1, 10 % au niveau 2, 6 % au niveau 3 font tomber le score à zéro.',
    'Les angles petits sont agrandis à l’écran (la tangente est multipliée) ; l’échelle est indiquée.',
  ],
  touchRules: [
    'Glisser dans le zoom du gnomon : orienter le bras depuis le haut du gnomon vers le bout de l’ombre. ◀ ▶ : ajuster (◁ ▷ : plus fin). ✓ VALIDER : valider.',
    'Score selon l’erreur relative sur l’angle : 25 % au niveau 1, 10 % au niveau 2, 6 % au niveau 3 font tomber le score à zéro.',
    'Les angles petits sont agrandis à l’écran (la tangente est multipliée) ; l’échelle est indiquée.',
  ],
  levels: [
    { title: 'Ératosthène', brief: 'Syène et Alexandrie, puis deux villes du tropique', rounds: 4, time: 40 },
    { title: 'Les grandes mesures', brief: 'Picard, Maupertuis, La Condamine, Delambre et Méchain', rounds: 4, time: 40 },
    { title: 'D’autres mondes', brief: 'la Lune, Mars, Mercure, Titan', rounds: 4, time: 40 },
  ],
  theorem: {
    kind: 'proposition',
    title: 'Angle au centre et rayons parallèles',
    body: 'Si les rayons du Soleil sont parallèles, l’angle $\\theta$ que fait un rayon avec la verticale d’un lieu est égal à l’angle au centre entre ce lieu et le point où le Soleil est au zénith (angles alternes-internes). L’arc entre les deux lieux est proportionnel à cet angle : $C = \\frac{360°}{\\theta} \\times d$. Avec $\\theta = 7{,}2°$ (un cinquantième de cercle) et $d = 5\\,000$ stades, Ératosthène obtient $250\\,000$ stades, soit entre $39\\,000$ et $46\\,000$ km selon la valeur du stade. La définition du mètre de 1799, un dix-millionième du quart de méridien, repose sur la même idée, avec l’arc Dunkerque–Barcelone mesuré par Delambre et Méchain.',
  },
  references: ['Cléomède, Le mouvement circulaire des corps célestes, I, 7', 'K. Alder, The Measure of All Things (Free Press, 2002)'],
  make: () => new Eratosthenes(),
};
