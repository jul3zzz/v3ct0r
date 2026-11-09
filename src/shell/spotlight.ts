// Exercise spotlight: the controls a manipulation exercise needs are lit in the panel (white outline
// and a soft pulsing halo), the rest of the panel is dimmed (still usable). Monochrome: light is white.
import { uiElement } from '../hud/ui';

const panelBody = () => document.querySelector<HTMLElement>('#app > .panel:not(.lpanel) .panel-body');
let lit: HTMLElement[] = [];

function clear(): void {
  document.querySelectorAll('.ex-lit, .ex-litwrap, .ex-dim').forEach((e) => e.classList.remove('ex-lit', 'ex-litwrap', 'ex-dim'));
  lit = [];
}

/** light these labels (null or empty: lights off); true when at least one control was found */
export function spotlight(labels: readonly string[] | null): boolean {
  clear();
  const root = panelBody();
  if (!labels?.length || !root) return false;
  lit = [...new Set(labels.map((l) => uiElement(l)).filter((e): e is HTMLElement => !!e && root.contains(e)))];
  if (!lit.length) return false;
  for (const e of lit) e.classList.add('ex-lit');
  for (const child of Array.from(root.children) as HTMLElement[]) {
    if (lit.includes(child)) continue;
    child.classList.add(lit.some((e) => child.contains(e)) ? 'ex-litwrap' : 'ex-dim');
  }
  lit[0].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  return true;
}

/** the lit controls are still on screen (the panel is rebuilt when the view changes) */
export function spotlightAlive(): boolean {
  return lit.length > 0 && lit.every((e) => e.isConnected);
}

/** a chip of the instruction was clicked: bring its control into view and flash it */
export function flashControl(label: string): void {
  const e = uiElement(label);
  if (!e) return;
  e.scrollIntoView({ block: 'center', behavior: 'smooth' });
  e.classList.remove('ex-flash');
  void e.offsetWidth;
  e.classList.add('ex-flash');
  setTimeout(() => e.classList.remove('ex-flash'), 1300);
}
