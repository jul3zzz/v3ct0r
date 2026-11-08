// Reader of a written course: the text with its statements, then the exercises grouped by length
// (SIMPLE ≈ 10 min, MOYEN ≈ 30 min, COMPLEXE 1 h+), the references, and the way out. The reading
// position is kept (percentage) and the course counts as done once the exercises are reached.
import { h } from '../hud/dom';
import { icon } from '../hud/deco';
import { rich } from './rich';
import { exerciseCard } from './exercise';
import { LEVEL_LABEL, STATEMENT_LABEL } from './types';
import { WRITTEN_LEVELS, readingMinutes } from './written';
import type { Course } from './courses';
import type { LearnProgress } from './progress';

export interface ReaderHooks {
  progress: LearnProgress;
  onChapter: (id: string) => void;
  onDone: () => void;
  sheet: () => void;
  colle: () => void;
  home: () => void;
}

const LEVEL_NAMES = ['', ...WRITTEN_LEVELS.map((l) => l.label)];

export class Reader {
  readonly el: HTMLElement;
  private sections: { id: string; el: HTMLElement }[] = [];
  private exEl: HTMLElement;
  private boxes = new Map<string, HTMLElement>();
  private chapter = '';
  private raf = 0;

  constructor(host: HTMLElement, readonly course: Course, private o: ReaderHooks, startPct = 0) {
    const c = course;
    const w = c.written!;
    const m = c.meta;
    const page = h('article', { class: 'lw-page' });
    const counts = WRITTEN_LEVELS.map((l) => c.exercises.filter((e) => e.level === l.level).length);
    page.append(
      h(
        'header',
        { class: 'lw-head' },
        h('div', { class: 'lw-sys' }, h('span', { text: `LEARN // ${LEVEL_LABEL[m.level]} // COURS ÉCRIT` }), h('span', { text: `LECTURE ≈ ${readingMinutes(w)} MIN` })),
        h('h1', { class: 'lw-title', text: m.title }),
        m.subtitle ? h('div', { class: 'lw-sub', text: m.subtitle }) : null,
        h('div', { class: 'lw-meta', text: `${w.chapters.length} CHAPITRES · ${Object.keys(c.formulas.statements).length} ÉNONCÉS · EXERCICES : ${counts[0]} SIMPLES, ${counts[1]} MOYENS, ${counts[2]} COMPLEXES` }),
      ),
    );
    const toc = h('ol', { class: 'lw-toc' });
    w.chapters.forEach((ch) => {
      const b = h('button', { type: 'button', text: ch.title });
      b.addEventListener('click', () => this.scrollToChapter(ch.id));
      toc.append(h('li', null, b));
    });
    const tocEx = h('button', { type: 'button', text: `Exercices (${c.exercises.length})` });
    tocEx.addEventListener('click', () => this.scrollToExercises());
    toc.append(h('li', { class: 'ex' }, tocEx));
    page.append(h('nav', { class: 'lw-tocwrap', 'aria-label': 'Sommaire' }, h('div', { class: 'lw-k', text: 'SOMMAIRE' }), toc));

    w.chapters.forEach((ch, i) => {
      const sec = h('section', { class: 'lw-ch', id: `lw-${ch.id}` }, h('h2', null, h('span', { class: 'n', text: String(i + 1).padStart(2, '0') }), h('span', { text: ch.title })));
      for (const b of ch.blocks) {
        if (b.t === 'p') sec.append(rich(b.src, 'lw-p rich'));
        else if (b.t === 'h3') sec.append(h('h3', { text: b.text }));
        else {
          const s = c.formulas.statements[b.name];
          if (!s) continue;
          const box = h('div', { class: `lw-st k-${s.kind}`, id: `lw-st-${b.name}` }, h('div', { class: 'lw-st-head' }, h('span', { class: 'kd', text: STATEMENT_LABEL[s.kind] }), h('span', { class: 'tt', text: s.title })), rich(s.body, 'rich'));
          this.boxes.set(b.name, box);
          sec.append(box);
        }
      }
      this.sections.push({ id: ch.id, el: sec });
      page.append(sec);
    });

    // exercises by length
    this.exEl = h('section', { class: 'lw-ch lw-exs', id: 'lw-exercises' }, h('h2', null, h('span', { class: 'n', text: '✎' }), h('span', { text: 'Exercices' })));
    this.exEl.append(h('p', { class: 'lw-note', text: 'Trois indices progressifs, puis la correction étape par étape. Chercher d’abord sur papier : le temps indiqué est celui d’une recherche honnête, rédaction comprise.' }));
    for (const lv of WRITTEN_LEVELS) {
      const list = c.exercises.filter((e) => e.level === lv.level);
      if (!list.length) continue;
      this.exEl.append(h('h3', { class: 'lw-lv' }, h('span', { class: 'kd', text: lv.label }), h('span', { text: lv.time }), h('span', { class: 'ct', text: `${list.length} exercice${list.length > 1 ? 's' : ''}` })));
      for (const ex of list) this.exEl.append(exerciseCard(ex, { state: o.progress.ex(m.id, ex.id), update: (x) => o.progress.updateEx(m.id, ex.id, x), levels: LEVEL_NAMES }));
    }
    page.append(this.exEl);

    if (m.references?.length) page.append(h('section', { class: 'lw-ch lw-refs' }, h('h2', null, h('span', { class: 'n', text: '§' }), h('span', { text: 'Pour aller plus loin' })), h('ul', null, ...m.references.map((r) => h('li', { text: r })))));
    const btn = (label: string, ico: string, fn: () => void) => {
      const b = h('button', { type: 'button', class: 'btn' }, icon(ico), h('span', { text: label }));
      b.addEventListener('click', fn);
      return b;
    };
    page.append(h('footer', { class: 'lw-end' }, h('div', { class: 'lw-k', text: 'FIN DU COURS' }), h('div', { class: 'lw-btns' }, btn('FICHE RÉCAPITULATIVE (PDF)', 'download', () => o.sheet()), btn('COLLE', 'quiz', () => o.colle()), btn('ARBRE DES COURS', 'grid', () => o.home()))));

    this.el = h('div', { class: 'lw', tabindex: '-1' }, page);
    host.append(this.el);
    this.el.addEventListener('scroll', () => {
      if (!this.raf) this.raf = requestAnimationFrame(() => ((this.raf = 0), this.onScroll()));
    });
    if (startPct > 0) requestAnimationFrame(() => (this.el.scrollTop = (startPct / 100) * (this.el.scrollHeight - this.el.clientHeight)));
    this.el.focus({ preventScroll: true });
  }

  get pct(): number {
    const max = this.el.scrollHeight - this.el.clientHeight;
    return max > 0 ? Math.round((this.el.scrollTop / max) * 100) : 100;
  }

  private onScroll(): void {
    const top = this.el.getBoundingClientRect().top;
    const line = top + this.el.clientHeight * 0.3;
    let cur = this.sections[0]?.id ?? '';
    for (const s of this.sections) if (s.el.getBoundingClientRect().top <= line) cur = s.id;
    if (this.exEl.getBoundingClientRect().top <= line) cur = 'exercises';
    if (cur !== this.chapter) {
      this.chapter = cur;
      this.o.onChapter(cur);
    }
    this.o.progress.setPos(this.course.meta.id, this.pct);
    // the text is read once the exercises come into view
    if (this.exEl.getBoundingClientRect().top < top + this.el.clientHeight * 0.85 && !this.o.progress.course(this.course.meta.id).done) {
      this.o.progress.markDone(this.course.meta.id);
      this.o.onDone();
    }
  }

  private scrollTo(el: HTMLElement | undefined): void {
    if (!el) return;
    this.el.scrollTo({ top: el.offsetTop - 24, behavior: 'smooth' });
  }

  scrollToChapter(id: string): void {
    this.scrollTo(this.sections.find((s) => s.id === id)?.el);
  }

  scrollToExercises(): void {
    this.scrollTo(this.exEl);
  }

  scrollToStatement(name: string): void {
    const el = this.boxes.get(name);
    this.scrollTo(el);
    if (el) {
      el.classList.remove('flash');
      void el.offsetWidth;
      el.classList.add('flash');
    }
  }

  /** test hook */
  info(): { course: string; pct: number; chapter: string; sections: number; boxes: number; exercises: number; katex: number } {
    return { course: this.course.meta.id, pct: this.pct, chapter: this.chapter, sections: this.sections.length, boxes: this.boxes.size, exercises: this.exEl.querySelectorAll('.lx-ex').length, katex: this.el.querySelectorAll('.katex').length };
  }

  dispose(): void {
    cancelAnimationFrame(this.raf);
    this.el.remove();
  }
}
