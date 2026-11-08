// COLLE mode: a random exercise from the courses you can open, a countdown, then the worked
// solution with its grading grid: tick what you got, the mark out of 20 is saved.
import { h, setText } from '../hud/dom';
import { icon } from '../hud/deco';
import { sfx } from '../core/audio';
import { Dialog, toast } from '../shell/overlays';
import { exerciseCard } from './exercise';
import { clock } from './player';
import type { Course } from './courses';
import type { LearnProgress } from './progress';
import type { CourseExercise } from './types';

export function colleDialog(pool: Course[], progress: LearnProgress, onOpenCourse: (id: string) => void): Dialog | null {
  const items: { c: Course; ex: CourseExercise }[] = pool.flatMap((c) => c.exercises.map((ex) => ({ c, ex })));
  if (!items.length) {
    toast('◇ AUCUN EXERCICE DISPONIBLE — OUVRE D’ABORD UN COURS', 3000);
    return null;
  }
  const d = new Dialog('COLLE', { center: true, width: 820 });
  let timer = 0;
  const stop = () => window.clearInterval(timer);
  d.onClose = stop;

  const draw = () => {
    stop();
    // prefer exercises not yet attempted in a colle
    const tried = new Set(progress.colles.map((x) => `${x.course}/${x.ex}`));
    const fresh = items.filter((x) => !tried.has(`${x.c.meta.id}/${x.ex.id}`));
    const pick = (fresh.length ? fresh : items)[Math.floor(Math.random() * (fresh.length || items.length))];
    const { c, ex } = pick;
    const minutes = Math.max(10, Math.round(ex.minutes * 1.5));
    let left = minutes * 60;
    let started = 0;
    let score = 0;
    const max = ex.solution.reduce((s, x) => s + x.points, 0);
    const tm = h('span', { class: 'lx-timer', text: clock(left) });
    const note = h('span', { class: 'lx-note', text: '— / 20' });
    const body = h('div', { class: 'lx-colle' });
    const head = h('div', { class: 'lx-card-head' }, h('span', { class: 'big', text: 'SUJET' }), h('span', { text: `${c.meta.title} · ${ex.title}` }), h('span', { class: 'spacer' }), tm);
    const statementOnly = h('div', { class: 'lx-colle-q' });
    const card = exerciseCard(ex, {
      state: { solved: false, hints: 0, revealed: false },
      update: () => undefined,
      grading: (s) => {
        score = s;
        setText(note, `${((20 * score) / Math.max(1, max)).toFixed(1).replace('.', ',')} / 20`);
      },
    });
    // during the timer only the statement is visible
    const q = card.querySelector('.lx-ex-q')!.cloneNode(true) as HTMLElement;
    statementOnly.append(h('div', { class: 'lx-ex-title', text: ex.title }), q);
    const start = h('button', { type: 'button', class: 'btn on' }, icon('play'), h('span', { text: `LANCER LE CHRONO (${minutes} MIN)` }));
    const hand = h('button', { type: 'button', class: 'btn' }, icon('diamond'), h('span', { text: 'RENDRE MA COPIE' }));
    const save = h('button', { type: 'button', class: 'btn on' }, h('span', { text: 'ENREGISTRER LA NOTE' }));
    const other = h('button', { type: 'button', class: 'btn' }, icon('reset'), h('span', { text: 'AUTRE SUJET' }));
    const course = h('button', { type: 'button', class: 'btn ghost', text: 'REVOIR LE COURS' });
    hand.style.display = 'none';
    save.style.display = 'none';
    const reveal = () => {
      stop();
      body.replaceChildren(head, card, h('div', { class: 'lx-colle-note' }, h('span', { text: 'NOTE (COCHE LES ÉTAPES OBTENUES) :' }), note));
      card.querySelector<HTMLButtonElement>('.lx-ex-btns .btn.ghost:nth-child(3)')?.click();
      hand.style.display = 'none';
      save.style.display = '';
      sfx.open();
    };
    start.addEventListener('click', () => {
      started = performance.now();
      start.style.display = 'none';
      hand.style.display = '';
      timer = window.setInterval(() => {
        left -= 1;
        setText(tm, left > 0 ? clock(left) : 'TEMPS ÉCOULÉ');
        tm.classList.toggle('over', left <= 0);
        if (left === 0) sfx.error();
      }, 1000);
    });
    hand.addEventListener('click', reveal);
    save.addEventListener('click', () => {
      progress.addColle({ course: c.meta.id, ex: ex.id, score, max, seconds: started ? Math.round((performance.now() - started) / 1000) : 0, at: Date.now() });
      toast(`◆ COLLE ENREGISTRÉE — ${((20 * score) / Math.max(1, max)).toFixed(1).replace('.', ',')} / 20`, 2600);
      save.style.display = 'none';
      sfx.confirm();
    });
    other.addEventListener('click', draw);
    course.addEventListener('click', () => {
      d.close();
      onOpenCourse(c.meta.id);
    });
    body.replaceChildren(head, statementOnly);
    d.body.replaceChildren(body);
    const hist = progress.colles.slice(-5).reverse();
    d.foot.replaceChildren(
      start,
      hand,
      save,
      other,
      course,
      h('span', { class: 'spacer' }),
      h('span', { text: hist.length ? `DERNIÈRES : ${hist.map((x) => ((20 * x.score) / Math.max(1, x.max)).toFixed(1).replace('.', ',')).join(' · ')}` : 'AUCUNE COLLE ENCORE' }),
    );
  };
  draw();
  return d;
}
