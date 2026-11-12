// V3CT0R Lycée from the website (docs/ECOLES.md, « deux apps »): the school key is checked first
// (key_check: no visit, no seat), then V3CT0R-Lycee-Setup.exe downloads, then OUVRIR V3CT0R LYCÉE hands the
// key to the installed app through a v3ct0r-lycee:// link (electron/link.cjs), the key also shown to paste.
// Shared by the way in (welcome.ts) and the TÉLÉCHARGER button (app.ts).
import { h } from '../hud/dom';
import { icon } from '../hud/deco';
import { school } from '../school/school';
import { formatCode } from '../school/codes';
import { lyceeLink } from '../core/edition';

const button = (label: string, ico: string, run: () => void, primary = false) => {
  const b = h('button', { type: 'button', class: primary ? 'btn on' : 'btn' }, icon(ico), h('span', { text: label })) as HTMLButtonElement;
  b.addEventListener('click', run);
  return b;
};

/** the key, then the download, then the link; `auto`: a key already known (trial link), checked at once */
export function lyceePanel(o: { key?: string; auto?: boolean; download: () => void; onDone?: () => void; doneLabel?: string }): HTMLElement {
  const box = h('div', { class: 'ly' });

  const ask = (value = o.key ?? '', problem = '') => {
    const msg = h('div', { class: `acc-msg${problem ? ' bad' : ''}`, role: 'status', text: problem ? `✕ ${problem}` : '' });
    const field = h('input', { type: 'text', autocomplete: 'off', spellcheck: 'false', placeholder: 'XXXXX-XXXXX-XXXXX-XXXXX', 'aria-label': 'Clé d’établissement', class: 'sc-input' }) as HTMLInputElement;
    field.value = value;
    const go = button('VÉRIFIER ET TÉLÉCHARGER', 'download', () => void run(field.value, go, msg), true);
    field.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') void run(field.value, go, msg);
    });
    box.replaceChildren(
      h('p', { text: 'V3CT0R Lycée est l’app des établissements, pour Windows : elle s’ouvre avec la clé d’essai ou de licence de ton établissement, tout débloqué et à ses couleurs.' }),
      h('div', { class: 'acc sc-code' }, h('label', { class: 'acc-f' }, h('span', { text: 'CLÉ D’ÉTABLISSEMENT' }), field), h('div', { class: 'acc-btns' }, go), msg),
    );
    setTimeout(() => field.focus(), 30);
  };

  const run = async (raw: string, go?: HTMLButtonElement, msg?: HTMLElement) => {
    if (!raw.trim()) return ask('', 'Colle ou tape la clé reçue de ton établissement');
    if (go) go.disabled = true;
    if (msg) msg.textContent = 'Vérification…';
    const r = await school.check(raw);
    if (!r.ok) return ask(raw, r.message);
    o.download();
    done(r.key, r.kind, r.school);
  };

  const done = (key: string, kind: 'trial' | 'licence', name: string) => {
    const open = h('a', { class: 'btn on ly-open', href: lyceeLink(key) }, icon('play'), h('span', { text: 'OUVRIR V3CT0R LYCÉE' }));
    const copy = button('COPIER LA CLÉ', 'target', () => {
      void navigator.clipboard?.writeText(formatCode(key)).then(
        () => (copy.lastElementChild!.textContent = 'CLÉ COPIÉE'),
        () => undefined,
      );
    });
    box.replaceChildren(
      h('p', { text: `Clé acceptée : ${kind === 'licence' ? 'licence' : 'essai'} de ${name}. Le téléchargement de V3CT0R-Lycee-Setup.exe commence.` }),
      h(
        'ol',
        { class: 'ly-steps' },
        h('li', { text: 'Ouvre V3CT0R-Lycee-Setup.exe : V3CT0R Lycée s’installe et s’ouvre. Si Windows avertit : Informations complémentaires, puis Exécuter quand même.' }),
        h('li', { text: 'Reviens ici et touche OUVRIR V3CT0R LYCÉE : la clé passe dans l’app (le navigateur demande d’ouvrir V3CT0R Lycée).' }),
      ),
      h('div', { class: 'wl-btns' }, open, ...(o.onDone ? [button(o.doneLabel ?? 'CONTINUER EN LIGNE', 'play', o.onDone)] : [])),
      h('p', { class: 'wl-dim' }, 'Ou colle la clé dans l’app : ', h('span', { class: 'ly-key', text: formatCode(key) }), ' ', copy),
    );
  };

  if (o.auto && o.key) void run(o.key);
  else ask();
  return box;
}
