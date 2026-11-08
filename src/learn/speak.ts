// LaTeX → spoken French for the voice-over, driven by an editable dictionary
// (courses/pronunciation.fr.json). Pure: shared by the app and tools/generate-voice.ts.

export interface SpeechDict {
  /** commands and characters read as words: "\\forall": "pour tout", "=": "égale" */
  symbols: Record<string, string>;
  /** named functions, read "<name> de <argument>": "\\sin": "sinus" */
  functions: Record<string, string>;
  /** special exponents: "2": "au carré", "T": "transposée" */
  powers: Record<string, string>;
  /** subscripts of norms: "\\infty": "infinie" */
  normSubs: Record<string, string>;
  /** sentence templates with {placeholders} */
  templates: Record<string, string>;
  /** plain-text replacements (whole words, case-sensitive): "MPSI": "M P S I" */
  words: Record<string, string>;
}

type Node =
  | { k: 'sym'; v: string }
  | { k: 'cmd'; v: string; args: Node[][]; opt?: Node[] }
  | { k: 'group'; c: Node[] }
  | { k: 'script'; base: Node; sub?: Node[]; sup?: Node[] }
  | { k: 'text'; v: string }
  | { k: 'env'; name: string; rows: Node[][][] };

const ARITY: Record<string, number> = {
  '\\frac': 2, '\\dfrac': 2, '\\tfrac': 2, '\\binom': 2, '\\sqrt': 1, '\\mathbb': 1, '\\mathcal': 1, '\\mathrm': 1,
  '\\mathbf': 1, '\\mathscr': 1, '\\mathfrak': 1, '\\boldsymbol': 1, '\\operatorname': 1, '\\overline': 1, '\\bar': 1,
  '\\hat': 1, '\\widehat': 1, '\\tilde': 1, '\\widetilde': 1, '\\vec': 1, '\\underbrace': 1, '\\overbrace': 1, '\\boxed': 1,
  '\\htmlData': 2, '\\htmlClass': 2, '\\mathit': 1, '\\textbf': 1, '\\emph': 1,
};
const TEXTCMD = new Set(['\\text', '\\textrm', '\\textit', '\\mbox']);
const BIGOPS = new Set(['\\sum', '\\prod', '\\int', '\\iint', '\\iiint', '\\oint', '\\lim', '\\limsup', '\\liminf', '\\bigcup', '\\bigcap', '\\sup', '\\inf', '\\max', '\\min', '\\bigoplus']);

// ── tokenizer + parser ─────────────────────────────────────────────────

function lex(src: string): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === '\\') {
      const m = /^\\([a-zA-Z]+)/.exec(src.slice(i));
      if (m) {
        out.push('\\' + m[1]);
        i += m[0].length;
        while (src[i] === ' ') i++;
      } else {
        out.push(src.slice(i, i + 2));
        i += 2;
      }
    } else if (/\s/.test(c)) {
      i++;
    } else if (/[0-9]/.test(c)) {
      const m = /^[0-9]+(?:(?:\{,\}|[.,](?=[0-9]))[0-9]+)?/.exec(src.slice(i))!;
      out.push(m[0].replace('{,}', ','));
      i += m[0].length;
    } else {
      out.push(c);
      i++;
    }
  }
  return out;
}

class Parser {
  i = 0;
  private tk: string[];
  constructor(tk: string[]) {
    this.tk = tk;
  }
  peek(): string | undefined {
    return this.tk[this.i];
  }
  seq(stop?: (t: string) => boolean): Node[] {
    const out: Node[] = [];
    while (this.i < this.tk.length) {
      const t = this.tk[this.i];
      if (t === '}' || (stop && stop(t))) break;
      const atom = this.atom();
      if (!atom) continue;
      out.push(this.scripts(atom));
    }
    return out;
  }
  arg(): Node[] {
    if (this.peek() === '{') {
      this.i++;
      const s = this.seq();
      if (this.peek() === '}') this.i++;
      return s;
    }
    const a = this.atom();
    return a ? [a] : [];
  }
  scripts(base: Node): Node {
    let sub: Node[] | undefined;
    let sup: Node[] | undefined;
    for (;;) {
      const t = this.peek();
      if (t === '_') {
        this.i++;
        sub = this.arg();
      } else if (t === '^') {
        this.i++;
        sup = this.arg();
      } else if (t === "'") {
        this.i++;
        sup = [...(sup ?? []), { k: 'sym', v: "'" }];
      } else break;
    }
    return sub || sup ? { k: 'script', base, sub, sup } : base;
  }
  atom(): Node | null {
    const t = this.tk[this.i++];
    if (t === undefined) return null;
    if (t === '{') {
      const c = this.seq();
      if (this.peek() === '}') this.i++;
      return { k: 'group', c };
    }
    if (t === '\\left' || t === '\\right' || t === '\\big' || t === '\\Big' || t === '\\bigl' || t === '\\bigr' || t === '\\Bigl' || t === '\\Bigr') {
      const d = this.tk[this.i];
      if (d === '.') {
        this.i++;
        return null;
      }
      return null; // the delimiter itself is read as the next atom
    }
    if (TEXTCMD.has(t)) {
      // raw text argument
      let depth = 0;
      let s = '';
      if (this.peek() === '{') {
        this.i++;
        while (this.i < this.tk.length) {
          const x = this.tk[this.i++];
          if (x === '{') depth++;
          if (x === '}') {
            if (depth === 0) break;
            depth--;
          }
          s += x.startsWith('\\') ? '' : x;
        }
      }
      return { k: 'text', v: s };
    }
    if (t === '\\begin') {
      const name = this.rawArg();
      const rows: Node[][][] = [[[]]];
      while (this.i < this.tk.length) {
        const x = this.peek()!;
        if (x === '\\end') {
          this.i++;
          this.rawArg();
          break;
        }
        if (x === '\\\\') {
          this.i++;
          rows.push([[]]);
          continue;
        }
        if (x === '&') {
          this.i++;
          rows[rows.length - 1].push([]);
          continue;
        }
        const cells = rows[rows.length - 1];
        const parts = this.seq((s) => s === '&' || s === '\\\\' || s === '\\end');
        cells[cells.length - 1].push(...parts);
        if (this.peek() === '}') this.i++;
      }
      return { k: 'env', name, rows: rows.filter((r) => r.some((c) => c.length)) };
    }
    if (t.startsWith('\\') && ARITY[t] !== undefined) {
      let opt: Node[] | undefined;
      if (t === '\\sqrt' && this.peek() === '[') {
        this.i++;
        opt = this.seq((s) => s === ']');
        if (this.peek() === ']') this.i++;
      }
      const args: Node[][] = [];
      for (let k = 0; k < ARITY[t]; k++) args.push(this.arg());
      return { k: 'cmd', v: t, args, opt };
    }
    return { k: 'sym', v: t };
  }
  rawArg(): string {
    if (this.peek() !== '{') return '';
    this.i++;
    let s = '';
    while (this.i < this.tk.length && this.tk[this.i] !== '}') s += this.tk[this.i++];
    this.i++;
    return s;
  }
}

// ── speaking ───────────────────────────────────────────────────────────

const fill = (tpl: string, vars: Record<string, string>): string => tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
const tidy = (s: string): string =>
  s
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?)])/g, '$1')
    .replace(/([(])\s+/g, '$1')
    .replace(/,\s*,/g, ',')
    .trim();

/** plain text of a node list (for dictionary lookups like "\\infty", "-1", "T") */
function flat(n: Node[]): string {
  return n
    .map((x) => (x.k === 'sym' ? x.v : x.k === 'group' ? flat(x.c) : x.k === 'cmd' ? x.v + x.args.map((a) => `{${flat(a)}}`).join('') : x.k === 'text' ? x.v : ''))
    .join('');
}

const isSimple = (n: Node[]): boolean => {
  const f = flat(n);
  return n.length === 1 && (/^[A-Za-z0-9]$/.test(f) || /^[0-9]+$/.test(f) || /^\\[a-zA-Z]+$/.test(f));
};

export class Speaker {
  private d: SpeechDict;
  constructor(d: SpeechDict) {
    this.d = d;
  }

  tex(src: string): string {
    const p = new Parser(lex(src));
    const nodes = p.seq();
    return tidy(this.seq(nodes));
  }

  text(s: string): string {
    let out = s;
    for (const [w, r] of Object.entries(this.d.words)) {
      const esc = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      out = out.replace(new RegExp(`(?<![\\p{L}\\p{N}])${esc}(?![\\p{L}\\p{N}])`, 'gu'), r);
    }
    return out;
  }

  private T(name: string, vars: Record<string, string>): string {
    return fill(this.d.templates[name] ?? `{${Object.keys(vars)[0]}}`, vars);
  }

  private seq(nodes: Node[]): string {
    const out: string[] = [];
    // "f : E \to F" reads "f, de E dans F" (not "tend vers")
    const colon = nodes.findIndex((x) => x.k === 'sym' && x.v === ':');
    const signature = colon >= 0 && nodes.slice(colon + 1).some((x) => x.k === 'sym' && x.v === '\\to');
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      if (signature && n.k === 'sym' && (n.v === ':' || n.v === '\\to')) {
        out.push(this.d.templates[n.v === ':' ? 'mapFrom' : 'mapTo'] ?? n.v);
        continue;
      }
      // |x| and \|x\|: read the enclosed part
      if (n.k === 'sym' && (n.v === '|' || n.v === '\\|' || n.v === '\\lvert' || n.v === '\\lVert')) {
        const closeSet = n.v === '|' || n.v === '\\lvert' ? ['|', '\\rvert'] : ['\\|', '\\rVert'];
        let j = i + 1;
        while (j < nodes.length && !this.closes(nodes[j], closeSet)) j++;
        if (j < nodes.length) {
          const inner = this.seq(nodes.slice(i + 1, j));
          const closer = nodes[j];
          const sub = closer.k === 'script' ? closer.sub : undefined;
          const sup = closer.k === 'script' ? closer.sup : undefined;
          let s: string;
          if (closeSet[0] === '|') s = this.T('abs', { arg: inner });
          else if (sub) s = this.T('normSub', { arg: inner, sub: this.d.normSubs[flat(sub)] ?? this.seq(sub) });
          else s = this.T('norm', { arg: inner });
          if (sup) s = this.power(s, sup);
          out.push(s);
          i = j;
          continue;
        }
      }
      // f(x): function application
      const next = nodes[i + 1];
      if (next && next.k === 'sym' && next.v === '(' && this.isFunctionLike(n)) {
        let depth = 0;
        let j = i + 1;
        for (; j < nodes.length; j++) {
          const x = nodes[j];
          if (x.k === 'sym' && x.v === '(') depth++;
          if (x.k === 'sym' && x.v === ')' && --depth === 0) break;
          if (x.k === 'script' && x.base.k === 'sym' && x.base.v === ')' && --depth === 0) break;
        }
        if (j < nodes.length) {
          const arg = this.seq(nodes.slice(i + 2, j));
          let s = this.T('apply', { f: this.node(n), arg });
          const closer = nodes[j];
          if (closer.k === 'script' && closer.sup) s = this.power(s, closer.sup);
          out.push(s);
          i = j;
          continue;
        }
      }
      // big operators read their limits and the following expression
      out.push(this.node(n));
    }
    return out.join(' ');
  }

  private closes(n: Node, set: string[]): boolean {
    if (n.k === 'sym') return set.includes(n.v);
    if (n.k === 'script' && n.base.k === 'sym') return set.includes(n.base.v);
    return false;
  }

  private isFunctionLike(n: Node): boolean {
    const b = n.k === 'script' ? n.base : n;
    if (b.k === 'sym') return /^[a-zA-Z]$/.test(b.v) || /^\\(varphi|phi|psi|chi|gamma|sigma|zeta|Gamma|ell|mu|nu|lambda|pi|theta)$/.test(b.v) || this.d.functions[b.v] !== undefined;
    if (b.k === 'cmd') return b.v === '\\operatorname' || b.v === '\\mathcal' || b.v === '\\mathrm' || b.v === '\\tilde' || b.v === '\\hat' || b.v === '\\overline';
    return false;
  }

  private power(base: string, sup: Node[]): string {
    const f = flat(sup);
    if (/^'+$/.test(f)) return `${base} ${this.d.powers[f] ?? 'prime'}`;
    const named = this.d.powers[f];
    if (named !== undefined) return `${base} ${named}`;
    return this.T('pow', { base, exp: this.seq(sup) });
  }

  private node(n: Node): string {
    switch (n.k) {
      case 'text':
        return this.text(n.v);
      case 'group':
        return this.seq(n.c);
      case 'env': {
        const rows = n.rows.map((r) => r.map((c) => this.seq(c)).join(', '));
        if (/matrix/.test(n.name)) return this.T('matrix', { rows: rows.join(this.d.templates.rowSep ?? ' ; ') });
        if (n.name === 'cases') return rows.join(this.d.templates.caseSep ?? ', ou ');
        return rows.join(' ; ');
      }
      case 'sym': {
        if (this.d.symbols[n.v] !== undefined) return this.d.symbols[n.v];
        if (this.d.functions[n.v] !== undefined) return this.d.functions[n.v];
        if (n.v.startsWith('\\')) return n.v.slice(1);
        return n.v;
      }
      case 'cmd': {
        const a = n.args.map((x) => this.seq(x));
        switch (n.v) {
          case '\\frac':
          case '\\dfrac':
          case '\\tfrac':
            return this.T(isSimple(n.args[0]) && isSimple(n.args[1]) ? 'frac' : 'fracLong', { num: a[0], den: a[1] });
          case '\\binom':
            return this.T('binom', { n: a[0], k: a[1] });
          case '\\sqrt':
            return n.opt ? this.T('root', { n: this.seq(n.opt), arg: a[0] }) : this.T('sqrt', { arg: a[0] });
          case '\\overline':
          case '\\bar':
            return this.T('bar', { arg: a[0] });
          case '\\hat':
          case '\\widehat':
            return this.T('hat', { arg: a[0] });
          case '\\tilde':
          case '\\widetilde':
            return this.T('tilde', { arg: a[0] });
          case '\\vec':
            return this.T('vec', { arg: a[0] });
          case '\\htmlData':
          case '\\htmlClass':
            return a[1];
          case '\\mathbf':
            return flat(n.args[0]) === '1' ? this.T('indicator', {}) : a[0];
          case '\\mathrm':
          case '\\operatorname': {
            // a word, not a product of letters: \mathrm{id}, \operatorname{rg}
            const w = flat(n.args[0]);
            if (/^[A-Za-z]{2,}$/.test(w)) return this.d.functions[`\\${w}`] ?? w;
            return a[0];
          }
          default:
            return a[0] ?? '';
        }
      }
      case 'script':
        return this.script(n);
    }
  }

  private script(n: Extract<Node, { k: 'script' }>): string {
    const b = n.base;
    const bv = b.k === 'sym' ? b.v : '';
    if (BIGOPS.has(bv)) {
      const name = this.d.symbols[bv] ?? bv.slice(1);
      const sub = n.sub ? flat(n.sub) : '';
      if (bv === '\\lim' || bv === '\\limsup' || bv === '\\liminf') return this.T('lim', { op: name, sub: n.sub ? this.seq(n.sub) : '' });
      if (n.sub && n.sup) {
        const eq = /^([^=]+)=(.+)$/.exec(sub);
        if (eq && bv !== '\\int') {
          const p = new Parser(lex(eq[2]));
          return this.T('range', { op: name, v: this.tex(eq[1]), from: this.seq(p.seq()), to: this.seq(n.sup) });
        }
        return this.T('bounds', { op: name, from: this.seq(n.sub), to: this.seq(n.sup) });
      }
      if (n.sub) return this.T('over', { op: name, sub: this.seq(n.sub) });
      return `${name} ${n.sup ? this.seq(n.sup) : ''}`;
    }
    let s = this.node(b);
    if (n.sub) {
      const isLetterBase = b.k === 'sym' || (b.k === 'cmd' && (b.v === '\\mathbb' || b.v === '\\mathcal'));
      s = isSimple(n.sub) || (isLetterBase && flat(n.sub).length <= 3) ? this.T('subShort', { base: s, sub: this.seq(n.sub) }) : this.T('sub', { base: s, sub: this.seq(n.sub) });
    }
    if (n.sup) {
      const setLike = b.k === 'cmd' && (b.v === '\\mathbb' || b.v === '\\mathcal');
      s = setLike && this.d.powers[flat(n.sup)] === undefined ? `${s} ${this.seq(n.sup)}` : this.power(s, n.sup);
    }
    return s;
  }
}
