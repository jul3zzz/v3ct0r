// NOTES: a notebook that behaves like a terminal, docked on the left of every screen (key N).
// One line typed after the prompt, ⏎: the note is saved, stamped with the date and the screen it
// was written on (a click on the tag goes back there). Commands: /aide /cherche /ici /tout
// /efface /exporte. Character shortcuts as in CALC (V3 → ∛, pi → π…). Saved in `notes.v1`,
// which follows the account (src/core/sync.ts).
import { h } from '../hud/dom';
import { icon } from '../hud/deco';
import { sfx } from '../core/audio';
import { store } from '../core/settings';
import { convertAt, flushAt, typeString } from '../calc/mnemonics';
import './notes.css';

export interface NoteEntry {
  /** creation time (ms): also the identity of the note */
  at: number;
  /** where it was written: « 02.01 POLYTOPES 4D », « Suites et séries numériques »… */
  where: string;
  /** the route, to go back there */
  hash: string;
  text: string;
}

interface Saved {
  notes: NoteEntry[];
  /** creation times of the deleted notes (strings, so that devices merge them as a set) */
  deleted: string[];
}

const KEY = 'notes.v1';
const when = (t: number) => new Date(t).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });

function load(): Saved {
  const s = store.get<Saved>(KEY, { notes: [], deleted: [] });
  const notes = Array.isArray(s?.notes) ? s.notes.filter((n) => n && typeof n.at === 'number' && typeof n.text === 'string') : [];
  const deleted = Array.isArray(s?.deleted) ? s.deleted.filter((x) => typeof x === 'string') : [];
  return { notes, deleted };
}

/** the notes still alive, oldest first */
export function liveNotes(s: Saved): NoteEntry[] {
  const dead = new Set(s.deleted);
  return s.notes.filter((n) => !dead.has(String(n.at))).sort((a, b) => a.at - b.at);
}

export class NotesPanel {
  private el: HTMLElement | null = null;
  private log!: HTMLElement;
  private input!: HTMLInputElement;
  private filter: { kind: 'all' } | { kind: 'search'; q: string } | { kind: 'here'; hash: string } = { kind: 'all' };
  private sys: string[] = [];

  constructor(private context: () => { where: string; hash: string }, private onToggle: (open: boolean) => void = () => {}) {}

  get isOpen(): boolean {
    return !!this.el;
  }

  /** number of notes kept (the tutorial waits for one more) */
  count(): number {
    return liveNotes(load()).length;
  }

  toggle(): void {
    if (this.el) this.close();
    else this.open();
  }

  open(): void {
    if (!this.el) this.build();
    this.paint();
    this.input.focus();
  }

  close(): void {
    if (!this.el) return;
    this.el.remove();
    this.el = null;
    this.onToggle(false);
  }

  /** add a note from the current screen (also used by the tests) */
  add(text: string): void {
    const t = text.trim();
    if (!t) return;
    const s = load();
    const ctx = this.context();
    let at = Date.now();
    while (s.notes.some((n) => n.at === at)) at++;
    s.notes.push({ at, where: ctx.where, hash: ctx.hash, text: t });
    store.set(KEY, s);
    if (this.el) this.paint();
  }

  private build(): void {
    const x = h('button', { type: 'button', class: 'nbk-btn', title: 'Fermer (Échap)', 'aria-label': 'Fermer les notes' }, icon('close'));
    x.addEventListener('click', () => this.close());
    this.log = h('div', { class: 'nbk-log', role: 'log' });
    this.input = h('input', { type: 'text', class: 'nbk-in', spellcheck: 'false', autocomplete: 'off', 'aria-label': 'Nouvelle note', placeholder: 'une note, puis ⏎ · /aide' }) as HTMLInputElement;
    this.el = h(
      'aside',
      { class: 'nbk', 'aria-label': 'Notes' },
      h('div', { class: 'nbk-head' }, h('span', { class: 'nbk-title', text: 'NOTES // TERMINAL' }), h('span', { class: 'spacer' }), x),
      this.log,
      h('div', { class: 'nbk-line' }, h('span', { class: 'nbk-prompt', text: 'notes ›' }), this.input),
      h('div', { class: 'nbk-hint', text: '⏎ enregistrer · /aide commandes · Tab convertir un raccourci (V3 → ∛) · Échap fermer' }),
    );
    document.body.append(this.el);
    this.wire();
    this.onToggle(true);
  }

  private wire(): void {
    const inp = this.input;
    inp.addEventListener('input', (e) => {
      const ie = e as InputEvent;
      const caret = inp.selectionStart ?? inp.value.length;
      if (ie.inputType === 'insertText' && ie.data && !inp.value.startsWith('/')) {
        let text = inp.value.slice(0, Math.max(0, caret - ie.data.length));
        const tail = inp.value.slice(caret);
        for (const ch of ie.data) {
          text += ch;
          text = convertAt(text, text.length).text;
        }
        inp.value = text + tail;
        inp.setSelectionRange(text.length, text.length);
      } else if (ie.inputType === 'insertFromPaste' && !inp.value.startsWith('/')) inp.value = typeString(inp.value);
    });
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        this.close();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const r = flushAt(inp.value, inp.selectionStart ?? inp.value.length);
        inp.value = r.text;
        inp.setSelectionRange(r.caret, r.caret);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const line = inp.value.startsWith('/') ? inp.value : flushAt(inp.value, inp.value.length).text;
        inp.value = '';
        this.run(line);
      }
    });
  }

  private say(...lines: string[]): void {
    this.sys = lines;
  }

  private run(line: string): void {
    const t = line.trim();
    if (!t) return;
    if (!t.startsWith('/')) {
      this.add(t);
      this.filter = { kind: 'all' };
      this.say('✓ note enregistrée');
      sfx.tick();
      return this.paint();
    }
    const [cmd, ...rest] = t.slice(1).split(/\s+/);
    const arg = rest.join(' ');
    const s = load();
    const live = liveNotes(s);
    switch (cmd.toLowerCase()) {
      case 'aide':
      case 'help':
        this.say(
          '/cherche mots   n’affiche que les notes qui contiennent ces mots',
          '/ici            les notes écrites sur cet écran',
          '/tout           toutes les notes',
          '/efface n       supprime la note #n',
          '/efface tout oui   supprime toutes les notes',
          '/exporte        télécharge les notes en texte (notes-v3ct0r.txt)',
        );
        break;
      case 'cherche':
        this.filter = arg ? { kind: 'search', q: arg.toLowerCase() } : { kind: 'all' };
        this.say(arg ? `filtre : « ${arg} »` : 'filtre retiré');
        break;
      case 'ici':
        this.filter = { kind: 'here', hash: this.context().hash };
        this.say(`notes écrites ici : ${this.context().where}`);
        break;
      case 'tout':
        this.filter = { kind: 'all' };
        this.say('toutes les notes');
        break;
      case 'efface': {
        if (arg === 'tout oui') {
          s.deleted = [...new Set([...s.deleted, ...live.map((n) => String(n.at))])];
          store.set(KEY, s);
          this.say(`✓ ${live.length} note${live.length > 1 ? 's' : ''} supprimée${live.length > 1 ? 's' : ''}`);
        } else if (arg === 'tout') this.say('pour tout supprimer : /efface tout oui');
        else {
          const k = Number(arg.replace('#', ''));
          const n = live[k - 1];
          if (!Number.isInteger(k) || !n) this.say(`✕ pas de note #${arg || '?'} (numéros de 1 à ${live.length})`);
          else {
            s.deleted.push(String(n.at));
            store.set(KEY, s);
            this.say(`✓ note #${k} supprimée`);
          }
        }
        break;
      }
      case 'exporte': {
        const text = live.map((n, i) => `#${i + 1}  ${when(n.at)}  [${n.where}]\n${n.text}\n`).join('\n');
        const url = URL.createObjectURL(new Blob([`V3CT0R — notes (${live.length})\n\n${text}`], { type: 'text/plain;charset=utf-8' }));
        const a = h('a', { href: url, download: 'notes-v3ct0r.txt' });
        document.body.append(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
        this.say(`✓ ${live.length} note${live.length > 1 ? 's' : ''} exportée${live.length > 1 ? 's' : ''}`);
        break;
      }
      default:
        this.say(`✕ commande inconnue « /${cmd} » — /aide`);
    }
    this.paint();
  }

  private paint(): void {
    if (!this.el) return;
    const live = liveNotes(load());
    const f = this.filter;
    const shown = live.map((n, i) => ({ n, k: i + 1 })).filter(({ n }) => (f.kind === 'all' ? true : f.kind === 'search' ? `${n.text} ${n.where}`.toLowerCase().includes(f.q) : n.hash === f.hash));
    const rows: HTMLElement[] = [];
    if (!live.length) rows.push(h('div', { class: 'nbk-sys', text: 'aucune note pour l’instant. Tape une ligne puis ⏎ : elle est gardée, datée, et marquée avec l’écran où tu es.' }));
    for (const { n, k } of shown) {
      const tag = h('button', { type: 'button', class: 'nbk-tag', title: n.hash ? 'Revenir à cet écran' : '', text: `⟨${n.where}⟩` });
      if (n.hash) tag.addEventListener('click', () => (location.hash = n.hash));
      rows.push(h('div', { class: 'nbk-e' }, h('div', { class: 'nbk-meta' }, h('span', { class: 'nbk-k', text: `#${k}` }), h('span', { text: when(n.at) }), tag), h('div', { class: 'nbk-text', text: n.text })));
    }
    if (live.length && !shown.length) rows.push(h('div', { class: 'nbk-sys', text: 'aucune note ne correspond — /tout' }));
    for (const s of this.sys) rows.push(h('div', { class: 'nbk-sys', text: s }));
    this.sys = [];
    this.log.replaceChildren(...rows);
    this.log.scrollTop = this.log.scrollHeight;
  }
}
