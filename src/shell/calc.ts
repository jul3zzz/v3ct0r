import { h } from '../hud/dom';
import { icon } from '../hud/deco';
import { sfx } from '../core/audio';
import { MNEMONICS, convertAt, flushAt, typeString, type Mnemonic } from '../calc/mnemonics';
import { FN_DOCS, type FnDoc } from '../calc/docs';
import { evaluate, preview, formatResult, identify, plainNumber, newState, type CalcState, type CalcResult } from '../calc/engine';
import '../calc/calc.css';

const STORE = 'calc.v1';
const MAX_HIST = 120;

interface Entry {
  src: string;
  out: string;
  err?: boolean;
  approx?: boolean;
  form?: string;
  notes?: string[];
  /** single numeric value, inserted back on click */
  val?: number;
}

/** rules that are not single mnemonics, shown first in the list */
const RULES: { k: string; s: string; n: string }[] = [
  { k: 'x^2  ·  x^-1  ·  2^10', s: 'x²  x⁻¹  2¹⁰', n: 'exposants : ^ puis chiffres, convertis au caractère suivant' },
  { k: 'u_0  ·  u_n', s: 'u₀  uₙ', n: 'indices : _ puis chiffres ou n, k, i, j' },
  { k: 'V2  ·  V16', s: '√2  √16', n: 'V suivi d’un nombre : sa racine carrée (V3 et V4 : racines cubique et 4e)' },
  { k: 'Tab', s: '⇥', n: 'convertir tout de suite le raccourci sous le curseur' },
  { k: '⌫', s: '↶', n: 'juste après une conversion : la défaire (garder le texte tapé)' },
];

const norm = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

function load(): { st: CalcState; hist: Entry[] } {
  try {
    const raw = localStorage.getItem(STORE);
    if (raw) {
      const d = JSON.parse(raw) as { st?: Partial<CalcState>; hist?: Entry[] };
      const st = newState();
      if (d.st?.vars && typeof d.st.vars === 'object') for (const [k, v] of Object.entries(d.st.vars)) if (typeof v === 'number') st.vars[k] = v;
      if (d.st?.fns && typeof d.st.fns === 'object') for (const [k, v] of Object.entries(d.st.fns)) if (v && Array.isArray(v.params) && typeof v.body === 'string') st.fns[k] = v;
      if (typeof d.st?.ans === 'number') st.ans = d.st.ans;
      if (d.st?.angle === 'deg') st.angle = 'deg';
      const hist = Array.isArray(d.hist) ? d.hist.filter((e) => e && typeof e.src === 'string' && typeof e.out === 'string').slice(-MAX_HIST) : [];
      return { st, hist };
    }
  } catch {
    /* storage unavailable or corrupt: start fresh */
  }
  return { st: newState(), hist: [] };
}

/**
 * CALC: a calculator docked on the right, usable over every screen (ATLAS, EXPLORER, LEARN).
 * Mnemonics typed as they are become symbols (V3 → ∛, pi → π, <= → ≤…); the complete,
 * searchable list sits under the console, with the functions the engine understands.
 */
export class CalcPanel {
  private el: HTMLElement | null = null;
  private input!: HTMLInputElement;
  private log!: HTMLElement;
  private live!: HTMLElement;
  private chips!: HTMLElement;
  private refList!: HTMLElement;
  private search!: HTMLInputElement;
  private angleBtn!: HTMLButtonElement;
  private st: CalcState;
  private hist: Entry[];
  private recall = -1;
  private draft = '';
  private undo: { raw: string; rawCaret: number; conv: string; caret: number } | null = null;
  private tab: 'keys' | 'fns' = 'keys';
  private timer = 0;

  constructor(private host: HTMLElement, private onToggle: (open: boolean) => void = () => {}) {
    const d = load();
    this.st = d.st;
    this.hist = d.hist;
  }

  get isOpen(): boolean {
    return !!this.el;
  }

  toggle(tab?: 'keys' | 'fns'): void {
    if (this.el && !tab) this.close();
    else this.open(tab);
  }

  open(tab?: 'keys' | 'fns'): void {
    if (tab) this.tab = tab;
    if (!this.el) this.build();
    this.paintRef();
    this.input.focus();
  }

  close(): void {
    if (!this.el) return;
    this.el.remove();
    this.el = null;
    window.clearTimeout(this.timer);
    this.onToggle(false);
  }

  /** test hooks */
  debug(): { open: boolean; input: string; last: Entry | null; vars: Record<string, number>; angle: string; shortcuts: number } {
    return { open: this.isOpen, input: this.el ? this.input.value : '', last: this.hist[this.hist.length - 1] ?? null, vars: { ...this.st.vars }, angle: this.st.angle, shortcuts: MNEMONICS.length };
  }

  private save(): void {
    try {
      localStorage.setItem(STORE, JSON.stringify({ st: this.st, hist: this.hist.slice(-MAX_HIST) }));
    } catch {
      /* private mode: keep in memory */
    }
  }

  private build(): void {
    const x = h('button', { type: 'button', class: 'cx-btn', title: 'Fermer (Échap)', 'aria-label': 'Fermer la calculatrice' }, icon('close'));
    x.addEventListener('click', () => this.close());
    this.angleBtn = h('button', { type: 'button', class: 'cx-btn', title: 'Unité d’angle des fonctions trigonométriques' });
    this.angleBtn.addEventListener('click', () => {
      this.st.angle = this.st.angle === 'rad' ? 'deg' : 'rad';
      this.paintAngle();
      this.save();
      this.schedulePreview();
      this.input.focus();
    });
    const copy = h('button', { type: 'button', class: 'cx-btn', title: 'Copier la ligne (ou le dernier résultat)', text: 'COPIER' });
    copy.addEventListener('click', () => {
      const last = this.hist[this.hist.length - 1];
      const text = this.input.value || (last ? last.out : '');
      if (text) void navigator.clipboard?.writeText(text).then(() => this.flash(copy, 'COPIÉ'), () => this.flash(copy, 'IMPOSSIBLE'));
      this.input.focus();
    });
    const clear = h('button', { type: 'button', class: 'cx-btn', title: 'Effacer l’historique (les variables restent)', text: 'EFFACER' });
    clear.addEventListener('click', () => {
      this.hist = [];
      this.save();
      this.paintLog();
      this.input.focus();
    });
    const head = h('div', { class: 'cx-head' }, h('span', { class: 'cx-title', text: 'CALCULATRICE' }), h('span', { class: 'spacer' }), this.angleBtn, copy, clear, x);

    this.log = h('div', { class: 'cx-log', role: 'log', 'aria-live': 'polite' });
    this.input = h('input', { type: 'text', class: 'cx-in', spellcheck: 'false', autocomplete: 'off', 'aria-label': 'Expression à calculer', placeholder: 'V3 27 · sum(1/k^2, k, 1, inf) · f(x) = x^2' }) as HTMLInputElement;
    this.live = h('div', { class: 'cx-live' });
    const line = h('div', { class: 'cx-line' }, h('span', { class: 'cx-prompt', text: '›' }), this.input);
    const hint = h('div', { class: 'cx-hint', text: '⏎ calculer · Tab convertir · ↑↓ historique · ⌫ défait une conversion · Échap fermer' });
    this.chips = h('div', { class: 'cx-chips' });

    this.search = h('input', { type: 'text', class: 'cx-search', spellcheck: 'false', autocomplete: 'off', placeholder: 'chercher : racine, flèche, ≤, intégrale, alpha…', 'aria-label': 'Chercher un raccourci ou une fonction' }) as HTMLInputElement;
    this.search.addEventListener('input', () => this.paintRef());
    this.search.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        if (this.search.value) {
          this.search.value = '';
          this.paintRef();
        } else this.input.focus();
      }
    });
    const tabKeys = h('button', { type: 'button', class: 'cx-tab', 'data-tab': 'keys', text: `RACCOURCIS (${MNEMONICS.length + RULES.length})` });
    const tabFns = h('button', { type: 'button', class: 'cx-tab', 'data-tab': 'fns', text: `FONCTIONS (${FN_DOCS.length})` });
    for (const b of [tabKeys, tabFns])
      b.addEventListener('click', () => {
        this.tab = b.dataset.tab as 'keys' | 'fns';
        this.paintRef();
      });
    this.refList = h('div', { class: 'cx-ref', role: 'list' });
    const ref = h('div', { class: 'cx-refwrap' }, h('div', { class: 'cx-tabs' }, tabKeys, tabFns, this.search), this.refList);

    this.el = h('aside', { class: 'cx', 'aria-label': 'Calculatrice' }, head, this.log, h('div', { class: 'cx-console' }, line, this.live, hint, this.chips), ref);
    this.host.append(this.el);
    this.wireInput();
    this.paintAngle();
    this.paintLog();
    this.paintChips();
    this.onToggle(true);
  }

  private flash(b: HTMLElement, text: string): void {
    const old = b.textContent;
    b.textContent = text;
    window.setTimeout(() => (b.textContent = old), 900);
  }

  private paintAngle(): void {
    this.angleBtn.textContent = this.st.angle === 'rad' ? 'RAD' : 'DEG';
    this.angleBtn.classList.toggle('on', this.st.angle === 'deg');
  }

  private wireInput(): void {
    const inp = this.input;
    inp.addEventListener('input', (e) => {
      const ie = e as InputEvent;
      const caret = inp.selectionStart ?? inp.value.length;
      if (ie.inputType === 'insertText' && ie.data && [...ie.data].length === 1) {
        const r = convertAt(inp.value, caret);
        if (r.text !== inp.value) {
          this.undo = { raw: inp.value, rawCaret: caret, conv: r.text, caret: r.caret };
          inp.value = r.text;
          inp.setSelectionRange(r.caret, r.caret);
          sfx.tick();
        } else this.undo = null;
      } else if (ie.inputType === 'insertText' && ie.data) {
        // several characters at once (IME, autocompletion): converted one by one
        let text = inp.value.slice(0, Math.max(0, caret - ie.data.length));
        const tail = inp.value.slice(caret);
        for (const ch of ie.data) {
          text += ch;
          text = convertAt(text, text.length).text;
        }
        inp.value = text + tail;
        inp.setSelectionRange(text.length, text.length);
        this.undo = null;
      } else if (ie.inputType === 'insertFromPaste' || ie.inputType === 'insertFromDrop') {
        // pasted text is converted as if it had been typed
        inp.value = typeString(inp.value);
        inp.setSelectionRange(inp.value.length, inp.value.length);
        this.undo = null;
      } else this.undo = null;
      this.recall = -1;
      this.schedulePreview();
    });
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.preventDefault();
        this.close();
        return;
      }
      if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        const c = inp.selectionStart ?? inp.value.length;
        const r = flushAt(inp.value, c);
        if (r.text !== inp.value) {
          this.undo = { raw: inp.value, rawCaret: c, conv: r.text, caret: r.caret };
          inp.value = r.text;
          inp.setSelectionRange(r.caret, r.caret);
          this.schedulePreview();
        }
        return;
      }
      if (e.key === 'Backspace' && this.undo && inp.value === this.undo.conv && inp.selectionStart === this.undo.caret && inp.selectionEnd === this.undo.caret) {
        e.preventDefault();
        inp.value = this.undo.raw;
        inp.setSelectionRange(this.undo.rawCaret, this.undo.rawCaret);
        this.undo = null;
        this.schedulePreview();
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        this.run();
        return;
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        const srcs = this.hist.map((x) => x.src);
        if (!srcs.length) return;
        e.preventDefault();
        if (this.recall === -1) this.draft = inp.value;
        if (e.key === 'ArrowUp') this.recall = this.recall === -1 ? srcs.length - 1 : Math.max(0, this.recall - 1);
        else this.recall = this.recall === -1 ? -1 : this.recall + 1;
        if (this.recall >= srcs.length) this.recall = -1;
        inp.value = this.recall === -1 ? this.draft : srcs[this.recall];
        inp.setSelectionRange(inp.value.length, inp.value.length);
        this.undo = null;
        this.schedulePreview();
      }
    });
  }

  private schedulePreview(): void {
    window.clearTimeout(this.timer);
    this.timer = window.setTimeout(() => this.paintPreview(), 160);
  }

  private paintPreview(): void {
    if (!this.el) return;
    const src = this.input.value.trim();
    if (!src) {
      this.live.textContent = '';
      return;
    }
    const r = preview(flushAt(src, src.length).text, this.st);
    this.live.textContent = r.ok && r.kind !== 'define' && r.kind !== 'assign' ? `${r.ok && 'approx' in r && r.approx ? '≈' : '='} ${formatResult(r)}` : '';
  }

  /** evaluate the line (also used by the smoke test) */
  run(text?: string): CalcResult | null {
    if (!this.el) return null;
    if (text !== undefined) this.input.value = typeString(text);
    const flushed = flushAt(this.input.value, this.input.value.length).text.trim();
    if (!flushed) return null;
    const r = evaluate(flushed, this.st);
    const e: Entry = { src: flushed, out: formatResult(r) };
    if (!r.ok) e.err = true;
    else {
      if ('approx' in r && r.approx) e.approx = true;
      if (r.notes.length) e.notes = r.notes;
      const v = r.kind === 'num' && r.values.length === 1 ? r.values[0] : r.kind === 'assign' ? r.value : undefined;
      if (v !== undefined && Number.isFinite(v)) {
        e.val = v;
        const f = identify(v, e.approx ? 1e-9 : 1e-11);
        if (f) e.form = f;
      }
      if (r.kind === 'num' && r.values.some(Number.isNaN)) e.notes = [...(e.notes ?? []), 'non défini dans ℝ (hors du domaine)'];
    }
    this.hist.push(e);
    if (this.hist.length > MAX_HIST) this.hist.splice(0, this.hist.length - MAX_HIST);
    this.save();
    this.input.value = '';
    this.live.textContent = '';
    this.undo = null;
    this.recall = -1;
    this.paintLog();
    this.paintChips();
    if (e.err) sfx.error();
    else sfx.click();
    return r;
  }

  private insert(text: string): void {
    const inp = this.input;
    const a = inp.selectionStart ?? inp.value.length;
    const b = inp.selectionEnd ?? a;
    inp.value = inp.value.slice(0, a) + text + inp.value.slice(b);
    inp.setSelectionRange(a + text.length, a + text.length);
    inp.focus();
    this.undo = null;
    this.schedulePreview();
  }

  private paintLog(): void {
    const rows = this.hist.map((e) => {
      const inEl = h('button', { type: 'button', class: 'cx-src', title: 'Reprendre cette ligne', text: e.src });
      inEl.addEventListener('click', () => {
        this.input.value = e.src;
        this.input.focus();
        this.schedulePreview();
      });
      const outEl = h('button', { type: 'button', class: 'cx-out' + (e.err ? ' err' : ''), title: e.val !== undefined ? 'Insérer ce nombre' : '' }, h('span', { class: 'cx-eq', text: e.err ? '!' : e.approx ? '≈' : '=' }), h('span', { text: e.out }));
      if (e.val !== undefined) outEl.addEventListener('click', () => this.insert(plainNumber(e.val!)));
      return h(
        'div',
        { class: 'cx-e' },
        inEl,
        outEl,
        e.form ? h('div', { class: 'cx-form', text: `forme reconnue : ${e.form}` }) : null,
        e.notes?.length ? h('div', { class: 'cx-note', text: e.notes.join(' · ') }) : null,
      );
    });
    if (!rows.length) rows.push(h('div', { class: 'cx-empty', text: 'Tape une expression puis ⏎. Les raccourcis (V3, pi, <=, alpha…) deviennent des symboles au caractère suivant ; la liste complète est en bas.' }));
    this.log.replaceChildren(...rows);
    this.log.scrollTop = this.log.scrollHeight;
  }

  private paintChips(): void {
    const items: HTMLElement[] = [];
    if (this.st.ans !== null) items.push(this.chip('ans', `ans = ${plainNumber(this.st.ans)}`));
    for (const [k, v] of Object.entries(this.st.vars)) items.push(this.chip(k, `${k} = ${plainNumber(v)}`));
    for (const [k, f] of Object.entries(this.st.fns)) items.push(this.chip(`${k}(`, `${k}(${f.params.join(', ')})`));
    if (Object.keys(this.st.vars).length || Object.keys(this.st.fns).length) {
      const forget = h('button', { type: 'button', class: 'cx-chip dim', title: 'Oublier variables et fonctions', text: '× oublier' });
      forget.addEventListener('click', () => {
        this.st.vars = {};
        this.st.fns = {};
        this.save();
        this.paintChips();
        this.input.focus();
      });
      items.push(forget);
    }
    this.chips.replaceChildren(...items);
  }

  private chip(insert: string, label: string): HTMLElement {
    const b = h('button', { type: 'button', class: 'cx-chip', title: `Insérer ${insert}`, text: label });
    b.addEventListener('click', () => this.insert(insert));
    return b;
  }

  private paintRef(): void {
    if (!this.el) return;
    for (const b of this.el.querySelectorAll<HTMLElement>('.cx-tab')) b.classList.toggle('on', b.dataset.tab === this.tab);
    const q = norm(this.search.value.trim());
    const hit = (...fields: string[]) => !q || fields.some((f) => norm(f).includes(q));
    const out: HTMLElement[] = [];
    if (this.tab === 'keys') {
      const rules = RULES.filter((r) => hit(r.k, r.s, r.n));
      if (rules.length) out.push(h('div', { class: 'cx-group', text: 'Règles' }), ...rules.map((r) => this.rule(r.k, r.s, r.n)));
      const groups = new Map<string, Mnemonic[]>();
      for (const m of MNEMONICS) if (hit(m.k, m.s, m.n, m.c)) groups.set(m.c, [...(groups.get(m.c) ?? []), m]);
      for (const [g, list] of groups) out.push(h('div', { class: 'cx-group', text: `${g} · ${list.length}` }), ...list.map((m) => this.row(m.k, m.s, m.n, m.s)));
    } else {
      const groups = new Map<string, FnDoc[]>();
      for (const d of FN_DOCS) if (hit(d.sig, d.desc, d.ex, d.group)) groups.set(d.group, [...(groups.get(d.group) ?? []), d]);
      for (const [g, list] of groups)
        out.push(
          h('div', { class: 'cx-group', text: g }),
          ...list.map((d) => {
            const b = h('button', { type: 'button', class: 'cx-fn', title: `Essayer : ${d.ex}` }, h('span', { class: 'cx-sig', text: d.sig }), h('span', { class: 'cx-desc', text: d.desc }), h('span', { class: 'cx-ex', text: `${d.ex}  →  ${d.res}` }));
            b.addEventListener('click', () => {
              this.input.value = d.ex;
              this.input.focus();
              this.schedulePreview();
            });
            return b;
          }),
        );
    }
    if (!out.length) out.push(h('div', { class: 'cx-empty', text: 'Rien ne correspond. Essaie un nom (racine, union), un symbole (∫, ≤) ou un raccourci (V3).' }));
    this.refList.replaceChildren(...out);
  }

  private rule(k: string, s: string, n: string): HTMLElement {
    return h('div', { class: 'cx-rule', role: 'listitem' }, h('div', { class: 'cx-rk' }, h('kbd', { class: 'kbd', text: k }), h('span', { class: 'cx-arrow', text: '→' }), h('span', { class: 'cx-s', text: s })), h('div', { class: 'cx-n', text: n }));
  }

  private row(k: string, s: string, n: string, insert: string | null): HTMLElement {
    const b = h('button', { type: 'button', class: 'cx-row', role: 'listitem', title: insert ? `Insérer ${insert}` : n }, h('kbd', { class: 'kbd cx-k', text: k }), h('span', { class: 'cx-s', text: s }), h('span', { class: 'cx-n', text: n }));
    if (insert) b.addEventListener('click', () => this.insert(insert));
    else b.disabled = true;
    return b;
  }
}
