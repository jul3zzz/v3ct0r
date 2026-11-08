import { h } from '../hud/dom';
import { Dialog } from './overlays';
import { sfx } from '../core/audio';

export interface Command {
  id: string;
  label: string;
  group: string;
  keywords?: string;
  run: () => void;
}

const norm = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

/** Subsequence fuzzy score: higher is better, -1 = no match. */
function score(query: string, target: string): number {
  if (!query) return 0;
  const q = norm(query);
  const t = norm(target);
  const idx = t.indexOf(q);
  if (idx >= 0) return 1000 - idx * 2 - t.length * 0.1;
  let ti = 0;
  let s = 0;
  let streak = 0;
  for (const ch of q) {
    if (ch === ' ') continue;
    const k = t.indexOf(ch, ti);
    if (k < 0) return -1;
    streak = k === ti ? streak + 1 : 0;
    s += 10 + streak * 5 - (k - ti);
    ti = k + 1;
  }
  return s;
}

/** Ctrl+K command palette: jump to any module, view or action. */
export class Palette {
  private dlg: Dialog | null = null;
  constructor(private commands: () => Command[]) {}

  get isOpen(): boolean {
    return !!this.dlg?.isOpen;
  }

  toggle(): void {
    if (this.isOpen) this.dlg!.close();
    else this.open();
  }

  open(): void {
    const all = this.commands();
    const dlg = new Dialog('COMMANDES', { onClose: () => (this.dlg = null) });
    this.dlg = dlg;
    dlg.body.style.padding = '0';
    const input = h('input', { type: 'text', placeholder: 'aller à… (tesseract, julia, π, collatz, export…)', spellcheck: 'false', autocomplete: 'off', 'aria-label': 'Rechercher une commande' }) as HTMLInputElement;
    const list = h('div', { class: 'pal-list', role: 'listbox' });
    dlg.body.append(h('div', { class: 'pal-input' }, h('span', { text: '>' }), input), list);
    dlg.foot.append(h('span', { text: '↑↓ NAVIGUER' }), h('span', { text: '⏎ OUVRIR' }), h('span', { text: 'ÉCHAP FERMER' }));
    let items: Command[] = [];
    let sel = 0;
    const render = () => {
      const q = input.value.trim();
      items = all
        .map((c) => ({ c, s: Math.max(score(q, c.label), score(q, `${c.group} ${c.label} ${c.keywords ?? ''}`) - 50) }))
        .filter((x) => x.s >= 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, 60)
        .map((x) => x.c);
      if (!q) items = all.slice(0, 60);
      sel = Math.min(sel, Math.max(0, items.length - 1));
      list.replaceChildren(
        ...(items.length
          ? items.map((c, i) => {
              const row = h('div', { class: 'pal-item' + (i === sel ? ' sel' : ''), role: 'option' }, h('span', { text: c.label }), h('span', { class: 'g', text: c.group }));
              row.addEventListener('pointerenter', () => {
                sel = i;
                paintSel();
              });
              row.addEventListener('click', () => exec(i));
              return row;
            })
          : [h('div', { class: 'pal-empty', text: '✕ AUCUN RÉSULTAT' })]),
      );
    };
    const paintSel = () => {
      Array.from(list.children).forEach((el, i) => el.classList.toggle('sel', i === sel));
      (list.children[sel] as HTMLElement | undefined)?.scrollIntoView({ block: 'nearest' });
    };
    const exec = (i: number) => {
      const c = items[i];
      if (!c) return;
      dlg.close();
      sfx.confirm();
      c.run();
    };
    input.addEventListener('input', () => {
      sel = 0;
      render();
    });
    input.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'ArrowDown') {
        sel = Math.min(items.length - 1, sel + 1);
        paintSel();
        sfx.tick();
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        sel = Math.max(0, sel - 1);
        paintSel();
        sfx.tick();
        e.preventDefault();
      } else if (e.key === 'Enter') {
        exec(sel);
      } else if (e.key === 'Escape' || (e.key.toLowerCase() === 'k' && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        dlg.close();
      }
    });
    render();
    dlg.open();
    input.focus();
  }
}
