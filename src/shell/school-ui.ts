// Pieces of a school key (trial or licence) shared by the way in (welcome.ts) and the COMPTE dialog
// (account.ts): the code field, the school's logo, name and status, what is open, the contact, the
// badge of the top bar, the notice of the last days.
import { h } from '../hud/dom';
import { icon } from '../hud/deco';
import { school } from '../school/school';
import { dayStamp, keyLabel, seatsLine, warnToday, type TrialInfo, type TrialState } from '../school/trial';
import { store } from '../core/settings';
import './trial.css';

/** set at build time (repository variable VITE_CONTACT_EMAIL): who to write to after a trial */
const CONTACT = ((import.meta.env.VITE_CONTACT_EMAIL as string | undefined) ?? '').trim();
const CONTACT_OK = /^[^@\s<>"]+@[^@\s<>"]+\.[^@\s<>"]+$/.test(CONTACT);
const mailto = () => `mailto:${CONTACT}?subject=${encodeURIComponent('V3CT0R pour mon établissement')}`;

/** a school key, checked by the server; `onOk` once it is kept on this device */
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

/** the school's logo (an <img>: an SVG shown this way runs no script), a title and, under it, a status line */
export function schoolHead(info: TrialInfo, title = info.school, status = ''): HTMLElement {
  return h(
    'div',
    { class: 'sc-head' },
    info.logo ? h('img', { class: 'sc-logo', src: info.logo, alt: '' }) : h('div', { class: 'sc-logo sc-logo-none', 'aria-hidden': 'true', text: info.school.slice(0, 1).toUpperCase() }),
    h('div', { class: 'sc-titles' }, h('h1', { class: 'wl-title', text: title }), status ? h('div', { class: 'sc-status', text: status }) : null),
  );
}

/** « ESSAI · jusqu’au 12 décembre 2026 (encore 21 jours) · 12 / 30 postes » */
export function statusLine(info: TrialInfo, now = Date.now()): string {
  const l = keyLabel(info, now);
  return [l.badge, l.until, seatsLine(info)].filter(Boolean).join(' · ');
}

/** what a running key opens, in five cells */
export function openGrid(): HTMLElement {
  const cell = (big: string, small: string) => h('div', { class: 'sc-cell' }, h('b', { text: big }), h('span', { text: small }));
  return h('div', { class: 'sc-open', role: 'list' }, cell('46', 'VUES'), cell('ATLAS', 'GALAXIE'), cell('COURS', 'LEARN'), cell('JEUX', 'LEÇONS-JEUX'), cell('HISTOIRE', 'RÉCIT'));
}

/** after a key: who to write to (a button when the address is known) */
export function contactLine(): HTMLElement {
  if (!CONTACT_OK) return h('p', { text: 'Pour continuer avec V3CT0R dans ton établissement (classe pilote ou licence), contacte la personne qui t’a envoyé le lien.' });
  return h(
    'div',
    { class: 'sc-contact' },
    h('p', {}, 'Pour continuer avec V3CT0R dans ton établissement (classe pilote ou licence), écris à ', h('a', { class: 'sc-mail', href: mailto(), text: CONTACT }), '.'),
    h('a', { class: 'btn on sc-mail-btn', href: mailto() }, icon('play'), h('span', { text: `ÉCRIRE À ${CONTACT}` })),
  );
}

/** the badge of the top bar: logo, name, ESSAI or LICENCE, days left (hidden without a running key) */
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
  const l = keyLabel(info, Date.now());
  el.style.display = '';
  el.title = `${l.Noun} de V3CT0R pour ${info.school}, ${l.until}${seatsLine(info) ? ` · ${seatsLine(info)}` : ''}`;
  const days = l.short.split(' · ')[1] ?? '';
  el.replaceChildren(
    ...(info.logo ? [h('img', { class: 'sc-badge-logo', src: info.logo, alt: '' })] : []),
    h('span', { class: 'sc-badge-name', text: info.school }),
    h('span', { class: 'sc-badge-k', text: l.badge }),
    ...(days ? [h('span', { class: 'sc-badge-d', text: days })] : []),
  );
}

const WARNED = 'school.warned';

/** the last days of a key: one notice a day, not blocking (`toast` of the app) */
export function warnLastDays(toast: (text: string, ms: number) => void): void {
  const info = school.info;
  if (!info) return;
  const now = Date.now();
  const d = warnToday(info, now, store.get<string | null>(WARNED, null));
  if (d === null) return;
  store.set(WARNED, dayStamp(now));
  const l = keyLabel(info, now);
  const when = d <= 1 ? 'D’ICI DEMAIN' : `DANS ${d} JOURS`;
  toast(`◇ ${l.badge === 'LICENCE' ? 'LA LICENCE' : 'L’ESSAI'} SE TERMINE ${when}${CONTACT_OK ? ` — POUR CONTINUER : ${CONTACT}` : ''}`, 6000);
}
