// Story mode dialogs: the card of a beacon (log, mission, ship part, links, timeline) and the
// ship's book (JOURNAL · FRISE · HANGAR). DOM only; the state comes from progress.ts.
import { h } from '../hud/dom';
import { icon } from '../hud/deco';
import { Dialog } from '../shell/overlays';
import { rich } from '../learn/rich';
import { grade, type GameDef } from '../games/types';
import { ACTS, CHAPTERS, EVENTS, PARTS, actOf, lastOfAct, type Act, type Chapter } from './data';
import type { StoryState } from './progress';
import './story.css';

export interface StoryHooks {
  state(): StoryState;
  game(id: string): { def: GameDef; best: (number | null)[] } | null;
  play(gameId: string): void;
  view(id: string): void;
  course(id: string): void;
  chapter(id: string): void;
}

const STATE_LABEL = { done: '✓ RESTAURÉE', open: '◆ À RESTAURER', locked: '◇ NOYÉE DANS LE BRUIT', construction: '◌ EN PRÉPARATION' } as const;

/** the « À SUIVRE » card of a restored act */
export const actEnd = (act: Act): HTMLElement =>
  h('section', { class: 'st-suivre' }, h('div', { class: 'st-k', text: `FIN DE L’ACTE ${act.roman} · ${act.title.toUpperCase()}` }), rich(act.end ?? '', 'st-log rich'), h('div', { class: 'st-suivre-t', text: 'À SUIVRE…' }));

const btn = (label: string, ico: string, run: () => void, primary = false): HTMLButtonElement => {
  const b = h('button', { type: 'button', class: primary ? 'btn on' : 'btn' }, icon(ico), h('span', { text: label }));
  b.addEventListener('click', run);
  return b;
};

/** the card of a beacon, opened when the ship lands on it */
export function chapterDialog(c: Chapter, hooks: StoryHooks, close: () => void): Dialog {
  const st = hooks.state();
  const state = st.chapters[c.id];
  const act = actOf(c.act);
  const d = new Dialog(`JOURNAL DE BORD · ${c.code}`, { width: 760 });
  d.body.classList.add('st-card');
  d.body.append(
    h('div', { class: 'st-meta' }, h('span', { text: `ACTE ${act.roman} · ${act.title.toUpperCase()}` }), h('span', { text: `${c.when} · ${c.place}` }), h('span', { class: 'st-state', text: STATE_LABEL[state] })),
    h('h2', { class: 'st-title', text: c.title }),
    h('div', { class: 'st-by', text: 'MNÉMOSYNE, archiviste de bord' }),
    rich(c.log, 'st-log rich'),
  );
  if (act.end && lastOfAct(c.act)?.id === c.id && st.acts[c.act] === 'done') d.body.append(actEnd(act));
  if (state === 'construction') d.body.append(h('div', { class: 'st-note', text: 'Cette balise est visible mais sa mission n’est pas encore construite : elle arrive dans une prochaine mise à jour du mode histoire (voir STORY.md).' }));
  // the mission
  if (c.game && state !== 'construction') {
    const g = hooks.game(c.game);
    if (g) {
      const bests = g.best.map((b, i) => (b === null ? null : `niv. ${i + 1} : ${grade(b)}`)).filter(Boolean);
      const play = btn(`LANCER LA MISSION (≈ ${g.def.minutes} MIN)`, 'play', () => (close(), hooks.play(g.def.id)), true);
      d.body.append(
        h(
          'section',
          { class: 'st-block' },
          h('div', { class: 'st-k', text: 'MISSION' }),
          h('div', { class: 'st-mission' }, h('b', { text: g.def.title }), h('span', { text: ` — ${g.def.subtitle}` })),
          h('div', { class: 'st-dim', text: bests.length ? `meilleures notes : ${bests.join(' · ')} · restaurée dès la note C` : 'restaurée dès la note C, à n’importe quel niveau' }),
          h('div', { class: 'st-btns' }, play),
        ),
      );
      setTimeout(() => play.focus(), 30);
    }
  } else if (state !== 'construction') d.body.append(h('section', { class: 'st-block' }, h('div', { class: 'st-k', text: 'RÉCIT' }), h('div', { class: 'st-dim', text: '✓ Consigné au journal : lire cette balise suffit à la restaurer.' })));
  // the ship part
  if (c.reward) {
    const part = PARTS.find((p) => p.id === c.reward);
    if (part) {
      const owned = st.parts.includes(part.id);
      d.body.append(h('section', { class: 'st-block' }, h('div', { class: 'st-k', text: owned ? 'PIÈCE DU VAISSEAU · OBTENUE' : 'PIÈCE DU VAISSEAU · À OBTENIR' }), h('div', { class: 'st-mission' }, h('b', { text: part.title }), h('span', { text: ` — ${part.effect}${part.live ? '' : ' (bientôt)'}` })), h('div', { class: 'st-dim', text: `l’idée derrière : ${part.idea}` })));
    }
  }
  // links and timeline
  const links: HTMLElement[] = [];
  if (c.view) links.push(btn('VOIR LA VUE DANS L’EXPLORATEUR', 'target', () => (close(), hooks.view(c.view!))));
  if (c.course) links.push(btn('LIRE LE COURS', 'play', () => (close(), hooks.course(c.course!))));
  if (links.length) d.body.append(h('div', { class: 'st-btns' }, ...links));
  const evs = EVENTS.filter((e) => e.chapter === c.id).sort((a, b) => a.year - b.year);
  if (evs.length)
    d.body.append(
      h(
        'section',
        { class: 'st-block' },
        h('div', { class: 'st-k', text: state === 'done' ? 'FRISE · ÉVÉNEMENTS RESTAURÉS' : `FRISE · ${evs.length} ÉVÉNEMENT${evs.length > 1 ? 'S' : ''} À RESTAURER` }),
        state === 'done' ? h('ul', { class: 'st-evs' }, ...evs.map((e) => h('li', null, h('span', { class: 'y', text: e.when }), rich(`**${e.title}** — ${e.text}`, 'inl rich')))) : h('div', { class: 'st-dim', text: evs.map((e) => e.when).join(' · ') }),
      ),
    );
  d.foot.append(h('span', { text: 'J : JOURNAL, FRISE, HANGAR' }), h('span', { text: 'ÉCHAP : RETOUR AU VAISSEAU' }));
  return d;
}

/** the ship's book */
export function journalDialog(hooks: StoryHooks, read: Set<string>, tab: 'journal' | 'frise' | 'hangar' = 'journal'): Dialog {
  const st = hooks.state();
  const d = new Dialog('LA GRANDE ENTROPIE · LIVRE DE BORD', { width: 860 });
  d.body.classList.add('st-book');
  const acts = h(
    'div',
    { class: 'st-acts' },
    ...ACTS.map((a) => {
      const own = CHAPTERS.filter((c) => c.act === a.n);
      const done = own.filter((c) => st.chapters[c.id] === 'done').length;
      const ready = own.filter((c) => c.ready).length;
      return h('div', { class: `st-act s-${st.acts[a.n]}` }, h('b', { text: `${a.roman}` }), h('span', { text: a.title }), h('span', { class: 'n', text: st.acts[a.n] === 'locked' ? '◇' : `${done}/${ready}` }));
    }),
  );
  const tabs = h('div', { class: 'st-tabs', role: 'tablist' });
  const body = h('div', { class: 'st-tabbody' });
  const paint = (t: typeof tab) => {
    for (const b of tabs.children) (b as HTMLElement).classList.toggle('on', (b as HTMLElement).dataset.t === t);
    body.replaceChildren();
    if (t === 'journal') {
      const list = CHAPTERS.filter((c) => read.has(c.id) && c.ready);
      if (!list.length) body.append(h('div', { class: 'st-dim', text: 'Le journal est vide : pose-toi sur une balise ouverte (◆) pour y lire la première entrée.' }));
      for (const c of list) {
        const head = h('button', { type: 'button', class: 'st-entry-h' }, h('span', { class: 'y', text: c.code }), h('span', { text: `${c.title} · ${c.when}` }), h('span', { class: 'st-state', text: STATE_LABEL[st.chapters[c.id]] }));
        head.addEventListener('click', () => hooks.chapter(c.id));
        body.append(h('article', { class: 'st-entry' }, head, rich(c.log, 'st-log rich')));
        const act = actOf(c.act);
        if (act.end && lastOfAct(c.act)?.id === c.id && st.acts[c.act] === 'done') body.append(actEnd(act));
      }
    } else if (t === 'frise') {
      const locked = EVENTS.length - st.events.length;
      body.append(h('div', { class: 'st-dim', text: `${st.events.length} événement${st.events.length > 1 ? 's' : ''} restauré${st.events.length > 1 ? 's' : ''} sur ${EVENTS.length}, de −1800 à 2003 ; ${locked} encore noyé${locked > 1 ? 's' : ''} dans le bruit.` }));
      const ul = h('ol', { class: 'st-frise' });
      for (const e of EVENTS.slice().sort((a, b) => a.year - b.year)) {
        const open = st.events.includes(e);
        ul.append(open ? h('li', { class: `th-${e.theme}` }, h('span', { class: 'y', text: e.when }), h('div', null, rich(`**${e.title}** · ${e.who}`, 'inl rich'), rich(e.text, 'st-dim inl rich'))) : h('li', { class: 'off' }, h('span', { class: 'y', text: e.when }), h('div', { class: 'st-noise', text: '▒▒▒ ░▒▓▒░ ▒▒░▒▓ ░░▒' })));
      }
      body.append(ul);
    } else {
      for (const p of PARTS) {
        const owned = st.parts.includes(p.id);
        body.append(h('div', { class: `st-part${owned ? ' on' : ''}` }, h('b', { text: `${owned ? '■' : '□'} ${p.title}` }), h('span', { text: `acte ${ACTS.find((a) => a.n === p.act)!.roman} · ${p.effect}${p.live ? '' : ' · bientôt'}` }), h('span', { class: 'st-dim', text: p.idea })));
      }
    }
  };
  for (const [t, label] of [
    ['journal', `JOURNAL (${CHAPTERS.filter((c) => read.has(c.id) && c.ready).length})`],
    ['frise', `FRISE (${st.events.length}/${EVENTS.length})`],
    ['hangar', `HANGAR (${st.parts.length}/${PARTS.length})`],
  ] as const) {
    const b = h('button', { type: 'button', role: 'tab', 'data-t': t, text: label });
    b.addEventListener('click', () => paint(t));
    tabs.append(b);
  }
  d.body.append(h('div', { class: 'st-meta' }, h('span', { text: `BALISES RESTAURÉES ${st.restored}/${st.playable} JOUABLES · ${CHAPTERS.length} AU TOTAL` })), acts, tabs, body);
  d.foot.append(h('span', { text: 'ÉCHAP : RETOUR AU VAISSEAU' }));
  paint(tab);
  return d;
}
