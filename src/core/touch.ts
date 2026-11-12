/** A touch screen is the main pointer (phone, tablet): the views show touch controls and speak of taps and
 *  drags instead of keys, the wheel and the mouse. A laptop with a touch screen keeps its mouse wording. */
export const touchScreen = (): boolean => typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;

/** Touch: a double tap on `el` is a double click, so every view keeps its own dblclick (recenter, return home,
 *  open a node of the LEARN graph). A browser that sends its own dblclick after a double tap has it dropped,
 *  so that it counts once. */
export function doubleTap(el: HTMLElement): void {
  let down: { id: number; x: number; y: number; t: number } | null = null;
  let last = { t: -1e9, x: 0, y: 0 };
  let sentAt = -1e9;
  el.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'touch') return;
    // a second finger (pinch) is not a tap
    down = e.isPrimary ? { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now() } : null;
  });
  el.addEventListener('pointerup', (e) => {
    if (!down || e.pointerId !== down.id) return;
    const now = performance.now();
    const tap = now - down.t < 300 && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 10;
    down = null;
    if (!tap) return;
    if (now - last.t < 350 && Math.hypot(e.clientX - last.x, e.clientY - last.y) < 30) {
      last = { t: -1e9, x: 0, y: 0 };
      sentAt = now;
      el.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true, clientX: e.clientX, clientY: e.clientY }));
    } else last = { t: now, x: e.clientX, y: e.clientY };
  });
  el.addEventListener('dblclick', (e) => e.isTrusted && performance.now() - sentAt < 500 && e.stopImmediatePropagation(), { capture: true });
}
