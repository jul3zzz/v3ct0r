import { describe, expect, it } from 'vitest';
import { splitLabels } from '../src/shell/consigne';
import { MODULES } from '../src/modules/registry';

const chips = (text: string, labels: string[]) => splitLabels(text, labels).filter((s) => s.label).map((s) => s.label);

describe('exercise instruction: control labels become chips', () => {
  it('cuts around each label, in order, and keeps the whole text', () => {
    const q = 'Affiche le 600-CELL en projection STÉRÉOGRAPHIQUE, rotation automatique coupée.';
    const segs = splitLabels(q, ['600-CELL', 'STÉRÉOGRAPHIQUE', 'ROTATION AUTO']);
    expect(segs.map((s) => s.text).join('')).toBe(q);
    expect(chips(q, ['600-CELL', 'STÉRÉOGRAPHIQUE', 'ROTATION AUTO'])).toEqual(['600-CELL', 'STÉRÉOGRAPHIQUE']);
  });

  it('whole words only, longest label first', () => {
    expect(chips('Choisis TESSERACTS puis TESSERACT.', ['TESSERACT'])).toEqual(['TESSERACT']);
    expect(chips('Coche PLONGÉE AUTOMATIQUE.', ['PLONGÉE', 'PLONGÉE AUTOMATIQUE'])).toEqual(['PLONGÉE AUTOMATIQUE']);
    expect(chips('Mets w = c près de 0.', ['w = c'])).toEqual(['w = c']);
  });

  it('labels with symbols are matched literally', () => {
    expect(chips('Choisis (1 + iπ/n)ⁿ puis M ANTENNE (∞).', ['(1 + iπ/n)ⁿ', 'M ANTENNE (∞)'])).toEqual(['(1 + iπ/n)ⁿ', 'M ANTENNE (∞)']);
  });

  it('no labels: the text as it is', () => {
    expect(splitLabels('Combien de faces ?', [])).toEqual([{ text: 'Combien de faces ?' }]);
  });

  it('every manipulation exercise of the 46 views can be cut without losing text', () => {
    let tasks = 0;
    for (const m of MODULES)
      for (const v of m.vizs)
        for (const ex of m.study?.[v.id]?.exercises ?? [])
          if (ex.kind === 'task') {
            tasks++;
            expect(splitLabels(ex.q, ex.uses).map((s) => s.text).join('')).toBe(ex.q);
          }
    expect(tasks).toBeGreaterThan(20);
  });
});
