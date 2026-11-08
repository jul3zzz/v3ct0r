// Character shortcuts of the calculator: short mnemonics typed as they are, turned into symbols.
// Words (V3, pi, alpha, NN…) convert when a non-letter follows them (or Tab); symbol sequences
// (<=, ->, +-…) convert as soon as they cannot grow into a longer one; ^digits and _digits become
// superscripts and subscripts. Pure (no DOM): unit-tested.

export interface Mnemonic {
  /** what you type */
  k: string;
  /** what you get */
  s: string;
  /** French name */
  n: string;
  c: Category;
}

export type Category = 'Racines et puissances' | 'Constantes' | 'Opérateurs' | 'Relations' | 'Logique' | 'Flèches' | 'Ensembles' | 'Analyse' | 'Grec minuscule' | 'Grec majuscule' | 'Géométrie' | 'Divers';

const M = (c: Category, list: [string, string, string][]): Mnemonic[] => list.map(([k, s, n]) => ({ k, s, n, c }));

export const MNEMONICS: Mnemonic[] = [
  ...M('Racines et puissances', [
    ['V', '√', 'racine carrée'],
    ['V3', '∛', 'racine cubique'],
    ['V4', '∜', 'racine quatrième'],
    ['^2', '²', 'carré'],
    ['^3', '³', 'cube'],
    ['^n', 'ⁿ', 'puissance n'],
    ['^-1', '⁻¹', 'inverse'],
    ['^T', 'ᵀ', 'transposée'],
    ['^12', '¹²', 'tout exposant chiffré (^-1, ^2n…)'],
    ['_0', '₀', 'indice 0 (et _1 … _9)'],
    ['_n', 'ₙ', 'indice n'],
    ['_k', 'ₖ', 'indice k'],
  ]),
  ...M('Constantes', [
    ['pi', 'π', 'pi'],
    ['tau', 'τ', 'tau = 2π'],
    ['phi', 'φ', 'nombre d’or'],
    ['inf', '∞', 'infini'],
    ['hbar', 'ℏ', 'h barre'],
    ['aleph', 'ℵ', 'aleph'],
  ]),
  ...M('Opérateurs', [
    ['+-', '±', 'plus ou moins'],
    ['-+', '∓', 'moins ou plus'],
    ['xx', '×', 'multiplié par'],
    ['..', '·', 'point médian (produit)'],
    ['div', '÷', 'divisé par'],
    ['ox', '⊗', 'produit tensoriel'],
    ['o+', '⊕', 'somme directe'],
    ['comp', '∘', 'composée'],
    ['star', '⋆', 'étoile (convolution)'],
  ]),
  ...M('Relations', [
    ['<=', '≤', 'inférieur ou égal'],
    ['>=', '≥', 'supérieur ou égal'],
    ['!=', '≠', 'différent'],
    ['~=', '≈', 'environ égal'],
    ['==', '≡', 'congru, identique'],
    ['<<', '≪', 'très inférieur'],
    ['>>', '≫', 'très supérieur'],
    ['prop', '∝', 'proportionnel à'],
    ['sim', '∼', 'équivalent à'],
    ['cong', '≅', 'isomorphe à'],
    ['def=', '≔', 'défini par'],
    ['perp', '⊥', 'orthogonal'],
    ['para', '∥', 'parallèle'],
    ['divides', '∣', 'divise'],
  ]),
  ...M('Logique', [
    ['AA', '∀', 'pour tout'],
    ['EE', '∃', 'il existe'],
    ['!EE', '∄', 'il n’existe pas'],
    ['EE!', '∃!', 'il existe un unique'],
    ['and', '∧', 'et'],
    ['or', '∨', 'ou'],
    ['not', '¬', 'non'],
    ['xor', '⊻', 'ou exclusif'],
    ['=>', '⇒', 'implique'],
    ['<=>', '⇔', 'équivaut à'],
    ['vdash', '⊢', 'démontre'],
    ['models', '⊨', 'modèle de'],
    ['top', '⊤', 'vrai'],
    ['bot', '⊥', 'faux'],
    ['qed', '∎', 'fin de preuve'],
  ]),
  ...M('Flèches', [
    ['->', '→', 'tend vers, va dans'],
    ['<-', '←', 'flèche gauche'],
    ['<->', '↔', 'double flèche'],
    ['|->', '↦', 'associe'],
    ['-->', '⟶', 'longue flèche'],
    ['up', '↑', 'flèche haut (croît)'],
    ['down', '↓', 'flèche bas (décroît)'],
    ['>->', '↪', 'injection'],
    ['->>', '↠', 'surjection'],
  ]),
  ...M('Ensembles', [
    ['NN', 'ℕ', 'entiers naturels'],
    ['ZZ', 'ℤ', 'entiers relatifs'],
    ['QQ', 'ℚ', 'rationnels'],
    ['RR', 'ℝ', 'réels'],
    ['CC', 'ℂ', 'complexes'],
    ['KK', '𝕂', 'corps ℝ ou ℂ'],
    ['in', '∈', 'appartient à'],
    ['!in', '∉', 'n’appartient pas à'],
    ['sub', '⊂', 'inclus dans'],
    ['sube', '⊆', 'inclus ou égal'],
    ['sup', '⊃', 'contient'],
    ['cup', '∪', 'union'],
    ['cap', '∩', 'intersection'],
    ['Cup', '⋃', 'grande union'],
    ['Cap', '⋂', 'grande intersection'],
    ['minus', '∖', 'privé de'],
    ['empty', '∅', 'ensemble vide'],
    ['card', '#', 'cardinal'],
  ]),
  ...M('Analyse', [
    ['int', '∫', 'intégrale'],
    ['iint', '∬', 'intégrale double'],
    ['iiint', '∭', 'intégrale triple'],
    ['oint', '∮', 'intégrale curviligne'],
    ['sum', 'Σ', 'somme'],
    ['prod', '∏', 'produit'],
    ['part', '∂', 'dérivée partielle'],
    ['nabla', '∇', 'gradient'],
    ['lap', 'Δ', 'laplacien'],
    ['deg', '°', 'degré'],
    ['prime', '′', 'prime (dérivée)'],
    ['dprime', '″', 'seconde'],
    ['norm', '‖', 'norme'],
    ['lfl', '⌊', 'partie entière (gauche)'],
    ['rfl', '⌋', 'partie entière (droite)'],
    ['lce', '⌈', 'partie entière sup. (gauche)'],
    ['rce', '⌉', 'partie entière sup. (droite)'],
    ['lang', '⟨', 'crochet gauche (produit scalaire)'],
    ['rang', '⟩', 'crochet droit'],
  ]),
  ...M('Grec minuscule', [
    ['alpha', 'α', 'alpha'],
    ['beta', 'β', 'bêta'],
    ['gamma', 'γ', 'gamma'],
    ['delta', 'δ', 'delta'],
    ['eps', 'ε', 'epsilon'],
    ['zeta', 'ζ', 'zêta'],
    ['eta', 'η', 'êta'],
    ['theta', 'θ', 'thêta'],
    ['iota', 'ι', 'iota'],
    ['kappa', 'κ', 'kappa'],
    ['lambda', 'λ', 'lambda'],
    ['mu', 'μ', 'mu'],
    ['nu', 'ν', 'nu'],
    ['xi', 'ξ', 'xi'],
    ['rho', 'ρ', 'rhô'],
    ['sigma', 'σ', 'sigma'],
    ['ups', 'υ', 'upsilon'],
    ['chi', 'χ', 'khi'],
    ['psi', 'ψ', 'psi'],
    ['omega', 'ω', 'oméga'],
    ['vphi', 'ϕ', 'phi (variante)'],
    ['veps', 'ϵ', 'epsilon (variante)'],
  ]),
  ...M('Grec majuscule', [
    ['GAMMA', 'Γ', 'Gamma'],
    ['DELTA', 'Δ', 'Delta'],
    ['THETA', 'Θ', 'Thêta'],
    ['LAMBDA', 'Λ', 'Lambda'],
    ['XI', 'Ξ', 'Xi'],
    ['PI', 'Π', 'Pi'],
    ['SIGMA', 'Σ', 'Sigma'],
    ['PHI', 'Φ', 'Phi'],
    ['PSI', 'Ψ', 'Psi'],
    ['OMEGA', 'Ω', 'Oméga'],
  ]),
  ...M('Géométrie', [
    ['angle', '∠', 'angle'],
    ['tri', '△', 'triangle'],
    ['square', '□', 'carré'],
    ['circ', '○', 'cercle'],
    ['arc', '⌒', 'arc'],
  ]),
  ...M('Divers', [
    ['...', '…', 'points de suspension'],
    ['cdots', '⋯', 'points médians'],
    ['vdots', '⋮', 'points verticaux'],
    ['ddots', '⋱', 'points diagonaux'],
    ['therefore', '∴', 'donc'],
    ['because', '∵', 'car'],
    ['permil', '‰', 'pour mille'],
    ['dag', '†', 'dague'],
  ]),
];

const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻', '+': '⁺', n: 'ⁿ', i: 'ⁱ' };
const SUB: Record<string, string> = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉', n: 'ₙ', k: 'ₖ', i: 'ᵢ', j: 'ⱼ' };

const isWordChar = (c: string) => /[A-Za-z0-9]/.test(c);
const WORDS = new Map(MNEMONICS.filter((m) => /^[A-Za-z0-9!]+$/.test(m.k) && /[A-Za-z]/.test(m.k)).map((m) => [m.k, m.s]));
/** ^digits and _digits are handled by a rule, not listed one by one */
const SCRIPT_KEY = /^[\^_][-+]?[0-9nkij]+$/;
const SYMS = MNEMONICS.filter((m) => !WORDS.has(m.k) && !SCRIPT_KEY.test(m.k)).sort((a, b) => b.k.length - a.k.length);
/** a sequence that waits for the next character because a longer one starts with it (<= → <=>) */
const waits = (k: string) => SYMS.some((o) => o.k.length > k.length && o.k.startsWith(k));
/** a sequence starting with a letter (o+, def=) only counts at the start of a word */
const atWord = (str: string, k: string) => !/[A-Za-z]/.test(k[0]) || !/[A-Za-z0-9]/.test(str.slice(-k.length - 1, -k.length));

/** the symbol of a word mnemonic (V3, pi, alpha…), or null */
export const wordSymbol = (w: string): string | null => WORDS.get(w) ?? null;

/**
 * One editing step: `text` just received the character before `caret`. Returns the text with any
 * mnemonic completed by that character converted, and the new caret.
 */
export function convertAt(text: string, caret: number): { text: string; caret: number } {
  const before = text.slice(0, caret);
  const after = text.slice(caret);
  const c = before.slice(-1);
  if (!c) return { text, caret };
  const head = before.slice(0, -1);
  const trigger = !isWordChar(c) && c !== '.';
  // ^digits / _digits (^-1, ^2n, _k…): converted once something else than a letter or digit follows
  const scr = /([\^_])([-+]?[0-9ni]+|[nkij])$/.exec(head);
  if (scr && trigger) {
    const map = scr[1] === '^' ? SUP : SUB;
    if ([...scr[2]].every((ch) => map[ch])) {
      const rep = [...scr[2]].map((ch) => map[ch]).join('');
      const nh = head.slice(0, -scr[0].length) + rep;
      return convertAt(nh + c + after, nh.length + 1);
    }
  }
  // a word mnemonic (the whole run of letters and digits) followed by a non-word character
  if (!isWordChar(c)) {
    const m = /(!?[A-Za-z][A-Za-z0-9]*!?)$/.exec(head);
    if (m) {
      let w = m[1];
      let sym = wordSymbol(w);
      if (!sym && w.startsWith('!')) sym = wordSymbol((w = w.slice(1)));
      // V2, V5, V16… : square roots of a number (V3 and V4 are the cube and fourth roots)
      if (!sym && /^V\d+$/.test(w)) sym = '√' + w.slice(1);
      if (sym && sym !== w) {
        const nh = head.slice(0, -w.length) + sym;
        return convertAt(nh + c + after, nh.length + 1);
      }
    }
  }
  // symbol sequences: the longest one ending at the caret, unless a longer one may follow
  for (const s of SYMS) {
    if (!before.endsWith(s.k) || !atWord(before, s.k)) continue;
    if (waits(s.k)) break;
    const nb = before.slice(0, -s.k.length) + s.s;
    return { text: nb + after, caret: nb.length };
  }
  // a sequence that was waiting for a longer form, broken by this character
  for (const s of SYMS) {
    if (!waits(s.k) || !head.endsWith(s.k) || !atWord(head, s.k)) continue;
    if (SYMS.some((o) => o.k.startsWith(s.k + c))) break;
    const nh = head.slice(0, -s.k.length) + s.s;
    return { text: nh + c + after, caret: nh.length + 1 };
  }
  return { text, caret };
}

/** Tab, ⏎: convert whatever mnemonic ends at the caret (a word or a waiting sequence) */
export function flushAt(text: string, caret: number): { text: string; caret: number } {
  const r = convertAt(text.slice(0, caret) + ' ' + text.slice(caret), caret + 1);
  // remove the helper space
  const t = r.text.slice(0, r.caret - 1) + r.text.slice(r.caret);
  return { text: t, caret: r.caret - 1 };
}

/** type a string character by character, as the input field does */
export function typeString(s: string): string {
  let text = '';
  for (const ch of s) {
    text += ch;
    text = convertAt(text, text.length).text;
  }
  return flushAt(text, text.length).text;
}
