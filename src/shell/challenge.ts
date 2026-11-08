import { h } from '../hud/dom';
import { icon } from '../hud/deco';
import { Dialog } from './overlays';
import { sfx } from '../core/audio';
import { store } from '../core/settings';
import type { ModuleDef } from '../core/types';

function shuffle<T>(a: T[]): T[] {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

/** DÉFI mode: a short multiple-choice quiz on a module (5 questions). Best score is kept locally. */
export function openChallenge(mod: ModuleDef, all: ModuleDef[]): Dialog {
  const pool = mod.challenges.length ? mod.challenges : all.flatMap((m) => m.challenges);
  const qs = shuffle(pool).slice(0, Math.min(5, pool.length));
  const dlg = new Dialog(`DÉFI — ${mod.code} ${mod.title}`, { center: true, width: 620 });
  const bestKey = `challenge.${mod.id}`;
  let best = store.get<number>(bestKey, 0);
  let i = 0;
  let score = 0;
  const progress = h('span');
  const scoreEl = h('span');
  const bestEl = h('span');
  dlg.foot.append(progress, scoreEl, bestEl);

  const paintFoot = () => {
    progress.textContent = `QUESTION ${Math.min(i + 1, qs.length)}/${qs.length}`;
    scoreEl.textContent = `SCORE ${score}`;
    bestEl.textContent = `RECORD ${best}/${qs.length}`;
  };

  const show = () => {
    paintFoot();
    dlg.body.replaceChildren();
    if (i >= qs.length) {
      if (score > best) {
        best = score;
        store.set(bestKey, best);
      }
      paintFoot();
      const verdict = score === qs.length ? 'SANS FAUTE.' : score >= qs.length * 0.6 ? 'SOLIDE.' : 'À REVOIR : rouvre les vues du module.';
      const again = h('button', { type: 'button', class: 'btn' }, icon('reset'), h('span', { text: 'REJOUER' }));
      again.addEventListener('click', () => {
        dlg.close();
        openChallenge(mod, all).open();
      });
      dlg.body.append(
        h('div', { class: 'display', style: 'font-size:22px;margin:6px 0 10px', text: `${score} / ${qs.length}` }),
        h('div', { class: 'quiz-x', text: verdict }),
        h('div', { style: 'margin-top:14px' }, again),
      );
      score === qs.length ? sfx.confirm() : sfx.beep();
      return;
    }
    const q = qs[i];
    const choices = h('div', { class: 'quiz-c' });
    const explain = h('div', { class: 'quiz-x' });
    let answered = false;
    q.choices.forEach((c, k) => {
      const b = h('button', { type: 'button', text: `${String.fromCharCode(65 + k)} — ${c}` });
      b.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        const ok = k === q.answer;
        if (ok) score++;
        ok ? sfx.confirm() : sfx.error();
        (choices.children[q.answer] as HTMLElement).classList.add('ok');
        if (!ok) b.classList.add('ko');
        explain.textContent = `${ok ? '✓ EXACT. ' : '✕ NON. '}${q.explain}`;
        const next = h('button', { type: 'button', class: 'btn', style: 'margin-top:12px' }, h('span', { text: i + 1 < qs.length ? 'SUIVANT' : 'RÉSULTAT' }), h('span', { class: 'k', text: '⏎' }));
        next.addEventListener('click', () => {
          i++;
          show();
        });
        explain.after(next);
        next.focus();
        paintFoot();
      });
      choices.append(b);
    });
    dlg.body.append(h('div', { class: 'quiz-q', text: q.q }), choices, explain);
  };
  show();
  return dlg;
}
