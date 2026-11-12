// Pieces of the school trial shared by the way in (welcome.ts) and the COMPTE dialog
// (account.ts): the code field, the school's logo and name, the contact line.
import { h } from '../hud/dom';
import { icon } from '../hud/deco';
import { school } from '../school/school';
import type { TrialInfo, TrialState } from '../school/trial';
import './trial.css';

/** set at build time (repository variable VITE_CONTACT_EMAIL): who to write to after a trial */
const CONTACT = ((import.meta.env.VITE_CONTACT_EMAIL as string | undefined) ?? '').trim();
const CONTACT_OK = /^[^@\s<>"]+@[^@\s<>"]+\.[^@\s<>"]+$/.test(CONTACT);

/** a trial key, checked by the server; `onOk` once it is kept on this device */
export function codeForm(onOk: (state: TrialState) => void, o: { label?: string; value?: string; button?: string; focus?: boolean } = {}): HTMLElement {
  const msg = h('div', { class: 'acc-msg', role: 'status' });
  const say = (text: string, bad = false) => {
    msg.textContent = text;
    msg.classList.toggle('bad', bad);
  };
  const field = h('input', { type: 'text', autocomplete: 'off', spellcheck: 'false', placeholder: 'XXXXX-XXXXX-XXXXX-XXXXX', 'aria-label': o.label ?? 'Code', class: 'sc-input' }) as HTMLInputElement;
  field.value = o.value ?? '';
  const ok = h('button', { type: 'button', class: 'btn on' }, icon('play'), h('span', { text: o.button ?? 'VALIDER' })) as HTMLButtonElement;
  const go = async () => {
    if (!field.value.trim()) return say('✕ Colle ou tape le code reçu', true);
    ok.disabled = true;
    say('Vérification…');
    const r = await school.redeem(field.value);
    ok.disabled = false;
    if (!r.ok) return say(`✕ ${r.message}`, true);
    say('');
    onOk(r.state);
  };
  ok.addEventListener('click', () => void go());
  field.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') void go();
  });
  if (o.focus !== false) setTimeout(() => field.focus(), 30);
  return h('div', { class: 'acc sc-code' }, h('label', { class: 'acc-f' }, h('span', { text: o.label ?? 'CODE' }), field), h('div', { class: 'acc-btns' }, ok), msg);
}

/** the school's logo (an <img>: an SVG shown this way runs no script) and a title */
export function schoolHead(info: TrialInfo, title = info.school): HTMLElement {
  return h('div', { class: 'sc-head' }, info.logo ? h('img', { class: 'sc-logo', src: info.logo, alt: '' }) : null, h('h1', { class: 'wl-title', text: title }));
}

/** after a trial: who to write to */
export function contactLine(): HTMLElement {
  if (!CONTACT_OK) return h('p', { text: 'Pour continuer avec V3CT0R dans ton établissement (classe pilote ou licence), contacte la personne qui t’a envoyé le lien.' });
  return h('p', {}, 'Pour continuer avec V3CT0R dans ton établissement (classe pilote ou licence), écris à ', h('a', { class: 'sc-mail', href: `mailto:${CONTACT}?subject=${encodeURIComponent('V3CT0R pour mon établissement')}`, text: CONTACT }), '.');
}

/** the badge of the top bar: logo, name, days left (hidden without a running trial) */
export function paintBadge(el: HTMLElement): void {
  const info = school.info;
  const on = !!info && school.active;
  // `on`: phone.css gives the badge the place of the V3CT0R symbol
  el.classList.toggle('on', on);
  if (!info || !on) {
    el.style.display = 'none';
    el.replaceChildren();
    return;
  }
  el.style.display = '';
  el.title = `Essai de V3CT0R pour ${info.school}, ${school.until()}`;
  el.replaceChildren(...(info.logo ? [h('img', { class: 'sc-badge-logo', src: info.logo, alt: '' })] : []), h('span', { class: 'sc-badge-name', text: info.school }), h('span', { class: 'sc-badge-k', text: 'ESSAI' }));
}
