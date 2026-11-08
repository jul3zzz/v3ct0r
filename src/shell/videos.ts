// "VIDÉOS YOUTUBE" block of the explorer panel: real videos suggested for each view, listed in
// src/modules/videos.json (checked against YouTube by `npm run videos:check`). They are plain
// links that open in the browser: the app itself stays offline and never embeds a player.
import { h } from '../hud/dom';
import { store } from '../core/settings';
import data from '../modules/videos.json';

export interface Video {
  id: string;
  lang: 'fr' | 'en';
  title: string;
  channel: string;
  /** length as shown by YouTube (m:ss or h:mm:ss) */
  len?: string;
  /** context when the title alone is unclear (film chapter…) */
  note?: string;
}

export const VIDEOS = (data as unknown as { views: Record<string, Video[]> }).views;

export const videoUrl = (id: string): string => `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`;

const OPEN_KEY = 'panel.videos.open';

/** Fill `el` with the suggestions of `view` ("module/view"); hidden when there are none. */
export function paintVideos(el: HTMLElement, view: string): void {
  const list = VIDEOS[view] ?? [];
  el.hidden = !list.length;
  if (!list.length) {
    el.replaceChildren();
    return;
  }
  const det = h('details', { class: 'vids' });
  det.open = store.get(OPEN_KEY, true);
  det.addEventListener('toggle', () => store.set(OPEN_KEY, det.open));
  det.append(
    h('summary', {}, h('span', { text: 'VIDÉOS YOUTUBE' }), h('span', { class: 'n', text: String(list.length).padStart(2, '0') })),
    ...list.map((v) =>
      h(
        'a',
        { class: 'vid', href: videoUrl(v.id), target: '_blank', rel: 'noopener noreferrer', title: `Ouvrir sur YouTube : ${v.title}` },
        h('span', { class: 'lg', text: v.lang.toUpperCase(), title: v.lang === 'fr' ? 'En français' : 'En anglais' }),
        h('span', { class: 'tx' }, h('span', { class: 'tt', text: v.title }), h('span', { class: 'mt', text: [v.channel, v.len].filter(Boolean).join(' · ') }), v.note ? h('span', { class: 'nt', text: v.note }) : null),
        h('span', { class: 'go', text: '↗', 'aria-hidden': 'true' }),
      ),
    ),
    h('div', { class: 'vids-foot', text: 'S’ouvre dans le navigateur · connexion requise' }),
  );
  el.replaceChildren(det);
}
