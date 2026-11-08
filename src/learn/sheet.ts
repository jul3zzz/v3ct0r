// Printable summary sheet ("Enregistrer en PDF" from the print dialog, offline): statements in
// order of appearance, key formulas, exercise statements. Printed black on white.
import { h } from '../hud/dom';
import { rich, tex } from './rich';
import { LEVEL_LABEL, STATEMENT_LABEL } from './types';
import type { Course, Compiled } from './courses';

export function printSheet(course: Course, compiled: Compiled | null): void {
  const m = course.meta;
  const root = document.getElementById('print-root') ?? document.body.appendChild(h('div', { id: 'print-root' }));
  root.replaceChildren();
  const order: string[] = [];
  if (compiled)
    for (const e of compiled.timeline.events) if (e.m.kind === 'box' && !order.includes(e.m.name)) order.push(e.m.name);
  for (const k of Object.keys(course.formulas.statements)) if (!order.includes(k)) order.push(k);
  const byChapter = new Map<string, string[]>();
  if (compiled)
    for (const e of compiled.timeline.events)
      if (e.m.kind === 'box') {
        const list = byChapter.get(e.chapter) ?? [];
        if (!list.includes(e.m.name)) list.push(e.m.name);
        byChapter.set(e.chapter, list);
      }
  root.append(
    h('header', { class: 'ps-head' }, h('div', { class: 'ps-brand', text: 'V3CT0R LEARN · FICHE RÉCAPITULATIVE' }), h('h1', { text: m.title }), h('div', { class: 'ps-meta', text: `${LEVEL_LABEL[m.level]} · ≈ ${m.minutes} min · ${new Date().toLocaleDateString('fr-FR')}` })),
  );
  const stm = (id: string) => {
    const s = course.formulas.statements[id];
    if (!s) return null;
    return h('section', { class: `ps-st k-${s.kind}` }, h('div', { class: 'ps-k' }, h('b', { text: STATEMENT_LABEL[s.kind] }), h('span', { text: ` — ${s.title}` })), rich(s.body, 'rich'));
  };
  const done = new Set<string>();
  // written course: statements in the order of its chapters
  for (const ch of course.written?.chapters ?? []) {
    const list = ch.blocks.flatMap((b) => (b.t === 'box' && !done.has(b.name) ? [b.name] : []));
    if (!list.length) continue;
    root.append(h('h2', { text: ch.title }));
    for (const id of list) {
      const el = stm(id);
      if (el) root.append(el);
      done.add(id);
    }
  }
  if (compiled && byChapter.size) {
    for (const ch of compiled.timeline.chapters) {
      const list = byChapter.get(ch.id);
      if (!list?.length) continue;
      root.append(h('h2', { text: ch.title }));
      for (const id of list) {
        const el = stm(id);
        if (el) root.append(el);
        done.add(id);
      }
    }
  }
  const rest = order.filter((id) => !done.has(id));
  if (rest.length) {
    root.append(h('h2', { text: 'Énoncés' }));
    for (const id of rest) {
      const el = stm(id);
      if (el) root.append(el);
    }
  }
  const recap = course.formulas.recap ?? [];
  if (recap.length) {
    root.append(h('h2', { text: 'Formules clés' }));
    const grid = h('div', { class: 'ps-eqs' });
    for (const k of recap) if (course.formulas.eq[k]) grid.append(tex(h('div', { class: 'ps-eq' }), course.formulas.eq[k], true));
    root.append(grid);
  }
  if (course.exercises.length) {
    root.append(h('h2', { text: 'Exercices' }));
    course.exercises.forEach((ex, i) => root.append(h('section', { class: 'ps-ex' }, h('div', { class: 'ps-k' }, h('b', { text: `Exercice ${i + 1}` }), h('span', { text: ` — ${ex.title} (${course.written ? ['', 'simple', 'moyen', 'complexe'][ex.level] + ', ' : ''}≈ ${ex.minutes} min)` })), rich(ex.statement, 'rich'))));
  }
  if (m.references?.length) {
    root.append(h('h2', { text: 'Pour aller plus loin' }));
    root.append(h('ul', {}, ...m.references.map((r) => h('li', { text: r }))));
  }
  document.body.classList.add('printing');
  const done2 = () => {
    document.body.classList.remove('printing');
    window.removeEventListener('afterprint', done2);
  };
  window.addEventListener('afterprint', done2);
  // let KaTeX lay out before the print snapshot
  setTimeout(() => window.print(), 60);
}
