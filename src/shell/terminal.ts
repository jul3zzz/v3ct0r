import { h } from '../hud/dom';
import { icon } from '../hud/deco';
import { renderTeX } from '../hud/ui';
import { reducedMotion } from '../hud/fx';
import { sfx } from '../core/audio';
import { parseAnswer, type Exercise, type Study, type TaskApi } from '../core/study';
import { NEEDED, type Progress } from '../core/progress';
import { splitLabels } from './consigne';
import { flashControl, spotlight, spotlightAlive } from './spotlight';

export interface TermView {
  id: string; // "mod/viz"
  code: string; // "02.01"
  title: string;
  study?: Study;
}

const KIND: Record<Exercise['kind'], string> = { qcm: 'QCM', num: 'CALCUL', task: 'MANIPULATION' };

/** what to do, in one line, for each kind of exercise */
const TODO = (ex: Exercise): string =>
  ex.kind === 'qcm'
    ? 'clique la bonne réponse, ou tape sa lettre puis ⏎.'
    : ex.kind === 'num'
      ? `calcule, puis tape ta réponse et ⏎${ex.unit ? ` (en ${ex.unit})` : ''} — 0,25 ou 1/4 sont acceptés.`
      : 'fais-le dans la vue. Les réglages à utiliser sont éclairés dans le panneau de droite (clique une étiquette pour y aller). Vérification automatique.';

/** Terminal-style lesson + 3 auto-corrected exercises for the current view, docked over the left half of the
 *  viewport so the figure stays usable. Typed output, prompt input, hints, live-checked manipulations. */
export class StudyTerminal {
  private el: HTMLElement | null = null;
  private body: HTMLElement | null = null;
  private view: TermView | null = null;
  private typing: { el: HTMLElement; text: string }[] = [];
  private typingRaf = 0;
  private liveChecks: { k: number; ex: Extract<Exercise, { kind: 'task' }>; mark: () => void }[] = [];
  private checkAcc = 0;
  private minimized = false;
  private scoreEl: HTMLElement | null = null;
  /** the manipulation exercise whose controls are lit ("view:k"), '' when none */
  private spotKey = '';

  constructor(
    private host: HTMLElement,
    private progress: Progress,
    private api: TaskApi,
    private onValidated: (id: string) => void,
  ) {}

  get isOpen(): boolean {
    return !!this.el;
  }

  toggle(v: TermView): void {
    if (this.el && this.view?.id === v.id) this.close();
    else this.open(v);
  }

  open(v: TermView): void {
    this.close(false);
    this.view = v;
    this.minimized = false;
    const head = h(
      'div',
      { class: 'term-head' },
      h('span', { text: `TERMINAL // v3ct0r@${v.code} // ${v.title}` }),
      h('span', { class: 'spacer' }),
    );
    const mini = h('button', { type: 'button', class: 'term-btn', title: 'Réduire / agrandir' }, h('span', { text: '▁' }));
    const x = h('button', { type: 'button', class: 'term-btn', title: 'Fermer (E)' }, icon('close'));
    mini.addEventListener('click', () => {
      this.minimized = !this.minimized;
      this.el?.classList.toggle('min', this.minimized);
      sfx.click();
    });
    x.addEventListener('click', () => this.close());
    head.append(mini, x);
    const body = h('div', { class: 'term-body' });
    body.addEventListener('pointerdown', (e) => {
      if ((e.target as HTMLElement).closest('input,button')) return;
      this.flush();
    });
    this.el = h('div', { class: 'term', role: 'dialog', 'aria-label': `Leçon : ${v.title}` }, head, body);
    this.body = body;
    this.host.append(this.el);
    this.render();
    sfx.open();
  }

  close(sound = true): void {
    cancelAnimationFrame(this.typingRaf);
    this.typing = [];
    this.liveChecks = [];
    this.spotKey = '';
    spotlight(null);
    this.el?.remove();
    this.el = null;
    this.body = null;
    if (sound) sfx.close();
  }

  /** The view changed: follow it if open. */
  follow(v: TermView): void {
    if (this.el) this.open(v);
  }

  // ── rendering ───────────────────────────────────────────────────────

  private line(text: string, cls = '', typed = true): HTMLElement {
    const el = h('div', { class: `tl ${cls}` });
    this.body!.append(el);
    if (typed && !reducedMotion()) {
      this.typing.push({ el, text });
      this.startTyping();
    } else el.textContent = text;
    return el;
  }

  private startTyping(): void {
    if (this.typingRaf) return;
    let last = performance.now();
    const step = (now: number) => {
      let budget = Math.max(1, Math.round(((now - last) / 1000) * 1400));
      last = now;
      while (budget > 0 && this.typing.length) {
        const cur = this.typing[0];
        const have = cur.el.textContent?.length ?? 0;
        const take = Math.min(budget, cur.text.length - have);
        cur.el.textContent = cur.text.slice(0, have + take);
        budget -= take;
        if (cur.el.textContent.length >= cur.text.length) this.typing.shift();
      }
      if (this.typing.length) this.typingRaf = requestAnimationFrame(step);
      else this.typingRaf = 0;
    };
    this.typingRaf = requestAnimationFrame(step);
  }

  private flush(): void {
    for (const t of this.typing) t.el.textContent = t.text;
    this.typing = [];
  }

  private prompt(cmd: string): void {
    const el = this.line('', 'cmd', false);
    el.append(h('span', { class: 'pr', text: `v3ct0r@${this.view!.code}:~$ ` }), h('span', { text: cmd }));
  }

  private render(): void {
    const v = this.view!;
    const body = this.body!;
    body.replaceChildren();
    this.liveChecks = [];
    this.prompt('cat lecon.txt');
    if (!v.study) {
      this.line('⚠ aucune leçon pour cette vue.', 'warn');
      return;
    }
    const L = v.study.lesson;
    this.line(`┌─ ${v.title} ${'─'.repeat(Math.max(4, 44 - v.title.length))}`, 'box');
    this.line('│ OBJECTIF', 'sec');
    this.line(`│   ${L.objective}`);
    this.line('│ NOTIONS', 'sec');
    for (const n of L.notions) this.line(`│   • ${n}`);
    this.line('│ À FAIRE DANS LA VUE', 'sec');
    for (const o of L.observe) this.line(`│   ▸ ${o}`);
    this.line('│ FORMULE', 'sec');
    const tex = h('div', { class: 'term-tex' });
    renderTeX(tex, L.formula, true);
    body.append(tex);
    this.line('│ LE SAVAIS-TU ?', 'sec');
    this.line(`│   ${L.fact}`);
    this.line(`└${'─'.repeat(48)}`, 'box');
    this.progress.markRead(v.id);
    this.prompt(`./exercices --vue ${v.code}`);
    v.study.exercises.forEach((ex, k) => this.exercise(ex, k));
    this.scoreEl = this.line('', 'score', false);
    this.paintScore(false);
  }

  private exercise(ex: Exercise, k: number): void {
    const v = this.view!;
    const id = v.id;
    const state = () => this.progress.entry(id).ex[k];
    const block = h('div', { class: 'ex' });
    const status = h('span', { class: 'st' });
    block.append(h('div', { class: 'ex-head' }, h('span', { text: `[EX ${k + 1}/3 · ${KIND[ex.kind]}]` }), status));
    // the instruction, in bold; the control labels it names are chips that lead to the control
    const q = h('div', { class: 'ex-q' });
    for (const s of splitLabels(ex.q, ex.kind === 'task' ? ex.uses : [])) {
      if (!s.label) q.append(s.text);
      else {
        const label = s.label;
        const chip = h('button', { type: 'button', class: 'ex-chip', title: 'Montrer ce réglage', text: label });
        chip.addEventListener('click', () => {
          sfx.click();
          flashControl(label);
        });
        q.append(chip);
      }
    }
    block.append(h('div', { class: 'ex-consigne' }, h('span', { class: 'ex-cl', text: 'CONSIGNE' }), q), h('div', { class: 'ex-do' }, h('b', { text: '→ À TOI : ' }), TODO(ex)));
    const fb = h('div', { class: 'ex-fb' });
    const mark = () => {
      const s = state();
      status.textContent = s.solved ? '✓ RÉUSSI' : s.revealed ? '◆ SOLUTION VUE' : '◇ À FAIRE';
      block.classList.toggle('ok', s.solved);
      if (s.solved) {
        fb.textContent = `✓ ${ex.explain}`;
        block.querySelectorAll('input,button.ans').forEach((e) => ((e as HTMLInputElement).disabled = true));
      }
    };
    const success = () => {
      const was = this.progress.validated(id);
      this.progress.record(id, k, true);
      sfx.confirm();
      mark();
      this.paintScore(!was && this.progress.validated(id));
    };
    const fail = (msg: string) => {
      this.progress.record(id, k, false);
      sfx.error();
      const n = state().attempts;
      fb.textContent = `✕ ${msg}${n >= 1 ? `  INDICE : ${ex.hint}` : ''}${n >= 2 ? '  (bouton SOLUTION disponible)' : ''}`;
    };
    if (ex.kind === 'qcm') {
      const list = h('div', { class: 'ex-choices' });
      ex.choices.forEach((c, i) => {
        const b = h('button', { type: 'button', class: 'ans', text: `${'ABCD'[i]}) ${c}` });
        b.addEventListener('click', () => {
          if (state().solved) return;
          i === ex.answer ? success() : fail(`${'ABCD'[i]} n’est pas la bonne réponse.`);
        });
        list.append(b);
      });
      block.append(list);
    }
    const tools = h('div', { class: 'ex-tools' });
    if (ex.kind !== 'task') {
      const input = h('input', { type: 'text', spellcheck: 'false', autocomplete: 'off', placeholder: ex.kind === 'qcm' ? 'A, B, C ou D' : `ta réponse${ex.unit ? ` (${ex.unit})` : ''}`, 'aria-label': `Réponse à l’exercice ${k + 1}` }) as HTMLInputElement;
      const go = h('button', { type: 'button', class: 'btn ans', text: 'VALIDER ⏎' });
      const submit = () => {
        if (state().solved) return;
        const val = input.value.trim();
        if (!val) return;
        if (ex.kind === 'qcm') {
          const i = 'ABCD'.indexOf(val.toUpperCase()[0]);
          if (i < 0) return fail('réponds par A, B, C ou D.');
          i === ex.answer ? success() : fail(`${val.toUpperCase()[0]} n’est pas la bonne réponse.`);
        } else {
          const x = parseAnswer(val);
          if (!Number.isFinite(x)) return fail('je n’ai pas compris ce nombre (essaie 0,25 ou 1/4).');
          Math.abs(x - ex.answer) <= ex.tol ? success() : fail(`${val} n’est pas correct.`);
        }
      };
      input.addEventListener('keydown', (e) => {
        e.stopPropagation();
        if (e.key === 'Enter') submit();
        if (e.key === 'Escape') input.blur();
      });
      go.addEventListener('click', submit);
      tools.append(h('span', { class: 'pr', text: '> ' }), input, go);
    } else {
      tools.append(h('span', { class: 'live', text: '◇ VÉRIFICATION EN DIRECT DANS LA VUE' }));
      this.liveChecks.push({ k, ex, mark: () => (state().solved ? undefined : success()) });
    }
    const hintB = h('button', { type: 'button', class: 'btn ghost', text: 'INDICE' });
    hintB.addEventListener('click', () => {
      sfx.click();
      if (!state().solved) fb.textContent = `INDICE : ${ex.hint}`;
    });
    const solB = h('button', { type: 'button', class: 'btn ghost', text: 'SOLUTION' });
    solB.addEventListener('click', () => {
      sfx.click();
      if (state().solved) return;
      this.progress.reveal(id, k);
      const ans = ex.kind === 'qcm' ? `réponse ${'ABCD'[ex.answer]}. ` : ex.kind === 'num' ? `réponse ≈ ${String(+ex.answer.toPrecision(6)).replace('.', ',')}${ex.unit ? ' ' + ex.unit : ''}. ` : '';
      fb.textContent = `◆ SOLUTION : ${ans}${ex.explain}  (cet exercice ne compte plus pour la validation)`;
      mark();
      this.paintScore(false);
    });
    tools.append(hintB, solB);
    block.append(tools, fb);
    this.body!.append(block);
    mark();
  }

  private paintScore(justValidated: boolean): void {
    if (!this.scoreEl || !this.view) return;
    const id = this.view.id;
    const s = this.progress.score(id);
    const ok = this.progress.validated(id);
    this.scoreEl.textContent = ok ? `■ SCORE ${s}/3 — VUE VALIDÉE ✓` : `□ SCORE ${s}/3 — ${NEEDED} RÉUSSITES REQUISES POUR VALIDER ET DÉBLOQUER LA SUITE`;
    this.scoreEl.classList.toggle('ok', ok);
    if (justValidated) this.onValidated(id);
  }

  /** Called every frame: live-check manipulation exercises. */
  tick(dt: number): void {
    if (!this.el || !this.liveChecks.length) return;
    this.checkAcc += dt;
    if (this.checkAcc < 0.25) return;
    this.checkAcc = 0;
    // spotlight: the controls of the first manipulation still to do (relit if the panel was rebuilt)
    const todo = this.liveChecks.find((c) => {
      const e = this.progress.entry(this.view!.id).ex[c.k];
      return !e.solved && !e.revealed;
    });
    const key = todo ? `${this.view!.id}:${todo.k}` : '';
    if (key !== this.spotKey || (key && !spotlightAlive())) {
      this.spotKey = key;
      spotlight(todo ? todo.ex.uses : null);
    }
    for (const c of this.liveChecks) {
      const e = this.progress.entry(this.view!.id).ex[c.k];
      if (e.solved || e.revealed) continue;
      let ok = false;
      try {
        ok = c.ex.check(this.api);
      } catch {
        ok = false;
      }
      if (ok) c.mark();
    }
  }
}
