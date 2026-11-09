// One exercise card: statement, 3 progressive hints, step-by-step solution, answer check or
// self-assessment, optional grading grid (COLLE). Used by the course pause, the EXERCICES tab
// and the COLLE mode.
import { h } from '../hud/dom';
import { sfx } from '../core/audio';
import { parseAnswer } from '../core/study';
import { rich } from './rich';
import type { CourseExercise } from './types';
import type { ExState } from './progress';

export interface ExerciseCardOptions {
  state: ExState;
  update: (patch: Partial<ExState>) => void;
  /** COLLE: tick the steps you got right; called with the score when the grid changes */
  grading?: (score: number, max: number) => void;
  /** start with the solution hidden behind a single button (default true) */
  compact?: boolean;
  /** level names (written courses: SIMPLE, MOYEN, COMPLEXE) */
  levels?: readonly string[];
}

const LEVEL = ['', 'APPLICATION', 'CLASSIQUE', 'DIFFICILE'];
const duration = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} H${m % 60 ? ` ${String(m % 60).padStart(2, '0')}` : ''}` : `${m} MIN`);

export function exerciseCard(ex: CourseExercise, o: ExerciseCardOptions): HTMLElement {
  const st = o.state;
  const status = h('span', { class: 'st' });
  const paint = () => {
    status.textContent = st.solved || st.self === 'ok' ? '✓ RÉUSSI' : st.revealed ? '◆ CORRECTION LUE' : '◇ À FAIRE';
    root.classList.toggle('ok', st.solved || st.self === 'ok');
  };
  // what to do, in one line: how this card is answered
  const todo = ex.answer
    ? ex.answer.kind === 'qcm'
      ? 'lis l’énoncé, puis clique la bonne réponse.'
      : 'cherche sur papier, puis tape le résultat et ⏎ (0,25 · 1/4 · pi/2 · sqrt(2) sont acceptés).'
    : o.grading
      ? `rédige ta solution (≈ ${duration(ex.minutes).toLowerCase()}), puis ouvre la correction étape par étape et coche ce que tu as obtenu.`
      : `cherche sur papier (≈ ${duration(ex.minutes).toLowerCase()}). Bloqué : un INDICE à la fois. Puis VOIR LA CORRECTION, étape par étape, et dis si tu avais réussi.`;
  const root = h(
    'div',
    { class: 'lx-ex' },
    h('div', { class: 'lx-ex-head' }, h('span', { text: `${(o.levels ?? LEVEL)[ex.level] ?? ''} · ≈ ${duration(ex.minutes)}` }), status),
    h('div', { class: 'lx-ex-title', text: ex.title }),
    h('div', { class: 'lx-ex-consigne' }, h('span', { class: 'lx-ex-cl', text: 'CONSIGNE' }), rich(ex.statement, 'lx-ex-q rich')),
    h('div', { class: 'lx-ex-do' }, h('b', { text: '→ À TOI : ' }), todo),
  );
  const fb = h('div', { class: 'lx-ex-fb', role: 'status' });

  // answer check (numeric or multiple choice)
  if (ex.answer) {
    const a = ex.answer;
    const tools = h('div', { class: 'lx-ex-tools' });
    if (a.kind === 'qcm') {
      a.choices.forEach((c, i) => {
        const b = h('button', { type: 'button', class: 'ans' }, h('span', { text: `${'ABCD'[i]}) ` }), rich(c, 'inl rich'));
        b.addEventListener('click', () => {
          if (st.solved) return;
          if (i === a.answer) {
            sfx.confirm();
            o.update({ solved: true });
            fb.textContent = '✓ Bonne réponse.';
          } else {
            sfx.error();
            fb.textContent = `✕ ${'ABCD'[i]} n’est pas la bonne réponse. Un indice peut aider.`;
          }
          paint();
        });
        tools.append(b);
      });
    } else {
      const input = h('input', { type: 'text', spellcheck: 'false', autocomplete: 'off', placeholder: 'ta réponse (0,25 · 1/4 · pi/2 · sqrt(2))', 'aria-label': `Réponse : ${ex.title}` }) as HTMLInputElement;
      const go = h('button', { type: 'button', class: 'btn ans', text: 'VÉRIFIER ⏎' });
      const submit = () => {
        if (st.solved) return;
        const x = parseAnswer(input.value);
        if (!Number.isFinite(x)) {
          fb.textContent = '✕ Je n’ai pas compris ce nombre.';
          return;
        }
        if (Math.abs(x - a.value) <= a.tol) {
          sfx.confirm();
          o.update({ solved: true });
          fb.textContent = '✓ Correct.';
        } else {
          sfx.error();
          fb.textContent = `✕ ${input.value} n’est pas correct.`;
        }
        paint();
      };
      input.addEventListener('keydown', (e) => {
        e.stopPropagation();
        if (e.key === 'Enter') submit();
      });
      go.addEventListener('click', submit);
      tools.append(h('span', { class: 'pr', text: '> ' }), input, go);
    }
    root.append(tools);
  }

  // hints, one level at a time
  const hints = h('div', { class: 'lx-ex-hints' });
  const hintBtn = h('button', { type: 'button', class: 'btn ghost' });
  const paintHints = () => {
    hints.replaceChildren(...ex.hints.slice(0, st.hints).map((x, i) => h('div', { class: 'hint' }, h('span', { class: 'k', text: `INDICE ${i + 1}/3` }), rich(x, 'rich'))));
    hintBtn.textContent = st.hints >= 3 ? 'INDICES : 3/3' : `INDICE ${st.hints + 1}/3`;
    hintBtn.disabled = st.hints >= 3;
  };
  hintBtn.addEventListener('click', () => {
    sfx.click();
    o.update({ hints: Math.min(3, st.hints + 1) });
    paintHints();
  });

  // solution, step by step
  const sol = h('div', { class: 'lx-ex-sol' });
  let shown = 0;
  const max = ex.solution.reduce((s, x) => s + x.points, 0);
  const ticks = new Set<number>();
  const solBtn = h('button', { type: 'button', class: 'btn ghost', text: 'CORRECTION : ÉTAPE 1' });
  const selfRow = h('div', { class: 'lx-ex-self' });
  const paintSol = () => {
    sol.replaceChildren(
      ...ex.solution.slice(0, shown).map((step, i) => {
        const row = h('div', { class: 'step' }, h('span', { class: 'k', text: `ÉTAPE ${i + 1}${o.grading ? ` · ${step.points} PT${step.points > 1 ? 'S' : ''}` : ''}` }), rich(step.text, 'rich'));
        if (o.grading) {
          const cb = h('button', { type: 'button', class: 'tgl', 'aria-pressed': String(ticks.has(i)), text: 'OBTENU' });
          cb.addEventListener('click', () => {
            if (ticks.has(i)) ticks.delete(i);
            else ticks.add(i);
            cb.setAttribute('aria-pressed', String(ticks.has(i)));
            o.grading!([...ticks].reduce((s, k) => s + ex.solution[k].points, 0), max);
          });
          row.append(cb);
        }
        return row;
      }),
    );
    solBtn.textContent = shown >= ex.solution.length ? 'CORRECTION COMPLÈTE' : shown ? `ÉTAPE SUIVANTE (${shown + 1}/${ex.solution.length})` : 'VOIR LA CORRECTION';
    solBtn.disabled = shown >= ex.solution.length;
    selfRow.style.display = shown >= ex.solution.length && !ex.answer && !o.grading ? '' : 'none';
  };
  solBtn.addEventListener('click', () => {
    sfx.click();
    shown = Math.min(ex.solution.length, shown + 1);
    if (!st.solved && !st.revealed) o.update({ revealed: true });
    paintSol();
    paint();
  });
  const allBtn = h('button', { type: 'button', class: 'btn ghost', text: 'TOUT AFFICHER' });
  allBtn.addEventListener('click', () => {
    shown = ex.solution.length;
    if (!st.solved && !st.revealed) o.update({ revealed: true });
    paintSol();
    paint();
  });
  const ok = h('button', { type: 'button', class: 'btn', text: 'J’AVAIS RÉUSSI' });
  const ko = h('button', { type: 'button', class: 'btn', text: 'PAS ENCORE' });
  ok.addEventListener('click', () => (o.update({ self: 'ok' }), paint(), sfx.confirm()));
  ko.addEventListener('click', () => (o.update({ self: 'ko' }), paint()));
  selfRow.append(h('span', { class: 'k', text: 'AUTO-ÉVALUATION :' }), ok, ko);

  root.append(h('div', { class: 'lx-ex-btns' }, hintBtn, solBtn, allBtn), hints, fb, sol, selfRow);
  paint();
  paintHints();
  paintSol();
  if (o.compact === false) allBtn.click();
  return root;
}
