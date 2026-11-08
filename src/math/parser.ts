/**
 * Math expression parser: source → AST → JavaScript function | GLSL expression | LaTeX.
 *
 * Grammar (precedence low → high):
 *   expr    := term (('+' | '-') term)*
 *   term    := unary (('*' | '/') unary | <implicit> unary)*
 *   unary   := ('-' | '+') unary | power
 *   power   := primary ('^' unary)?            (right associative)
 *   primary := number | const | var | fn '(' args ')' | '(' expr ')' | '|' expr '|'
 * Implicit multiplication: 2x, 3(x+1), (x+1)(x-1), 2pi, x y, xy (split into known variables).
 */

export type Node =
  | { k: 'num'; v: number }
  | { k: 'const'; name: string }
  | { k: 'var'; name: string }
  | { k: 'neg'; a: Node }
  | { k: 'bin'; op: '+' | '-' | '*' | '/' | '^'; a: Node; b: Node }
  | { k: 'call'; fn: string; args: Node[] };

export class ParseError extends Error {
  constructor(message: string, public pos: number) {
    super(message);
  }
}

export const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
  phi: (1 + Math.sqrt(5)) / 2,
  tau: 2 * Math.PI,
};

interface FnSpec {
  arity: [number, number];
  js: (a: string[]) => string;
  glsl: (a: string[]) => string;
  tex: (a: string[]) => string;
}

const f1 = (js: string, glsl: string, tex: string): FnSpec => ({
  arity: [1, 1],
  js: (a) => `${js}(${a[0]})`,
  glsl: (a) => `${glsl}(${a[0]})`,
  tex: (a) => `${tex}\\left(${a[0]}\\right)`,
});

export const FUNCTIONS: Record<string, FnSpec> = {
  sin: f1('Math.sin', 'sin', '\\sin'),
  cos: f1('Math.cos', 'cos', '\\cos'),
  tan: f1('Math.tan', 'tan', '\\tan'),
  asin: f1('Math.asin', 'asin', '\\arcsin'),
  acos: f1('Math.acos', 'acos', '\\arccos'),
  atan: f1('Math.atan', 'atan', '\\arctan'),
  arcsin: f1('Math.asin', 'asin', '\\arcsin'),
  arccos: f1('Math.acos', 'acos', '\\arccos'),
  arctan: f1('Math.atan', 'atan', '\\arctan'),
  sinh: f1('Math.sinh', 'sinh', '\\sinh'),
  cosh: f1('Math.cosh', 'cosh', '\\cosh'),
  tanh: f1('Math.tanh', 'tanh', '\\tanh'),
  exp: { arity: [1, 1], js: (a) => `Math.exp(${a[0]})`, glsl: (a) => `exp(${a[0]})`, tex: (a) => `e^{${a[0]}}` },
  ln: f1('Math.log', 'log', '\\ln'),
  log: f1('Math.log', 'log', '\\ln'),
  log10: { arity: [1, 1], js: (a) => `Math.log10(${a[0]})`, glsl: (a) => `(log(${a[0]})*0.4342944819032518)`, tex: (a) => `\\log_{10}\\left(${a[0]}\\right)` },
  log2: { arity: [1, 1], js: (a) => `Math.log2(${a[0]})`, glsl: (a) => `log2(${a[0]})`, tex: (a) => `\\log_{2}\\left(${a[0]}\\right)` },
  sqrt: { arity: [1, 1], js: (a) => `Math.sqrt(${a[0]})`, glsl: (a) => `sqrt(${a[0]})`, tex: (a) => `\\sqrt{${a[0]}}` },
  cbrt: { arity: [1, 1], js: (a) => `Math.cbrt(${a[0]})`, glsl: (a) => `vm_cbrt(${a[0]})`, tex: (a) => `\\sqrt[3]{${a[0]}}` },
  abs: { arity: [1, 1], js: (a) => `Math.abs(${a[0]})`, glsl: (a) => `abs(${a[0]})`, tex: (a) => `\\left|${a[0]}\\right|` },
  floor: { arity: [1, 1], js: (a) => `Math.floor(${a[0]})`, glsl: (a) => `floor(${a[0]})`, tex: (a) => `\\lfloor ${a[0]} \\rfloor` },
  ceil: { arity: [1, 1], js: (a) => `Math.ceil(${a[0]})`, glsl: (a) => `ceil(${a[0]})`, tex: (a) => `\\lceil ${a[0]} \\rceil` },
  round: { arity: [1, 1], js: (a) => `Math.round(${a[0]})`, glsl: (a) => `floor(0.5+(${a[0]}))`, tex: (a) => `\\operatorname{round}\\left(${a[0]}\\right)` },
  sign: f1('Math.sign', 'sign', '\\operatorname{sgn}'),
  sec: { arity: [1, 1], js: (a) => `(1/Math.cos(${a[0]}))`, glsl: (a) => `(1.0/cos(${a[0]}))`, tex: (a) => `\\sec\\left(${a[0]}\\right)` },
  csc: { arity: [1, 1], js: (a) => `(1/Math.sin(${a[0]}))`, glsl: (a) => `(1.0/sin(${a[0]}))`, tex: (a) => `\\csc\\left(${a[0]}\\right)` },
  cot: { arity: [1, 1], js: (a) => `(1/Math.tan(${a[0]}))`, glsl: (a) => `(1.0/tan(${a[0]}))`, tex: (a) => `\\cot\\left(${a[0]}\\right)` },
  step: { arity: [1, 1], js: (a) => `((${a[0]})>=0?1:0)`, glsl: (a) => `step(0.0,${a[0]})`, tex: (a) => `H\\left(${a[0]}\\right)` },
  pow: { arity: [2, 2], js: (a) => `Math.pow(${a[0]},${a[1]})`, glsl: (a) => `vm_pow(${a[0]},${a[1]})`, tex: (a) => `{${a[0]}}^{${a[1]}}` },
  mod: { arity: [2, 2], js: (a) => `vm_mod(${a[0]},${a[1]})`, glsl: (a) => `mod(${a[0]},${a[1]})`, tex: (a) => `${a[0]} \\bmod ${a[1]}` },
  atan2: { arity: [2, 2], js: (a) => `Math.atan2(${a[0]},${a[1]})`, glsl: (a) => `atan(${a[0]},${a[1]})`, tex: (a) => `\\operatorname{atan2}\\left(${a[0]},${a[1]}\\right)` },
  min: { arity: [2, 8], js: (a) => `Math.min(${a.join(',')})`, glsl: (a) => a.reduce((x, y) => `min(${x},${y})`), tex: (a) => `\\min\\left(${a.join(',')}\\right)` },
  max: { arity: [2, 8], js: (a) => `Math.max(${a.join(',')})`, glsl: (a) => a.reduce((x, y) => `max(${x},${y})`), tex: (a) => `\\max\\left(${a.join(',')}\\right)` },
  // complex-oriented helpers (real behaviour when used with real numbers)
  re: { arity: [1, 1], js: (a) => `(${a[0]})`, glsl: (a) => `(${a[0]})`, tex: (a) => `\\operatorname{Re}\\left(${a[0]}\\right)` },
  im: { arity: [1, 1], js: () => `0`, glsl: () => `0.0`, tex: (a) => `\\operatorname{Im}\\left(${a[0]}\\right)` },
  conj: { arity: [1, 1], js: (a) => `(${a[0]})`, glsl: (a) => `(${a[0]})`, tex: (a) => `\\overline{${a[0]}}` },
  arg: { arity: [1, 1], js: (a) => `((${a[0]})>=0?0:Math.PI)`, glsl: (a) => `((${a[0]})>=0.0?0.0:3.141592653589793)`, tex: (a) => `\\arg\\left(${a[0]}\\right)` },
};

/** GLSL helpers required by compiled expressions. Prepend to any shader using `toGLSL`. */
export const GLSL_PRELUDE = /* glsl */ `
float vm_pow(float a, float b) {
  if (a >= 0.0) return pow(a, b);
  if (floor(b) == b) { float r = pow(-a, b); return mod(b, 2.0) == 0.0 ? r : -r; }
  return 0.0;
}
float vm_cbrt(float a) { return sign(a) * pow(abs(a), 1.0 / 3.0); }
`;

type Tok = { t: 'num'; v: number; p: number } | { t: 'id'; v: string; p: number } | { t: 'op'; v: string; p: number };

const UNICODE: Record<string, string> = {
  'π': 'pi', 'φ': 'phi', 'τ': 'tau', '·': '*', '×': '*', '÷': '/', '−': '-', '√': 'sqrt', '²': '^2', '³': '^3',
};

function tokenize(src: string): Tok[] {
  const out: Tok[] = [];
  let s = '';
  // map unicode helpers while keeping positions approximately right
  for (const ch of src) s += UNICODE[ch] !== undefined ? (/^[a-z]/.test(UNICODE[ch]) ? ` ${UNICODE[ch]} ` : UNICODE[ch]) : ch;
  s = s.replace(/\*\*/g, '^');
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === ' ' || c === '\t' || c === '\n') { i++; continue; }
    if (/[0-9.]/.test(c)) {
      const m = /^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(s.slice(i));
      if (!m) throw new ParseError(`Nombre invalide`, i);
      out.push({ t: 'num', v: parseFloat(m[0]), p: i });
      i += m[0].length;
      continue;
    }
    if (/[a-zA-Z_]/.test(c)) {
      const m = /^[a-zA-Z_][a-zA-Z0-9_]*/.exec(s.slice(i))!;
      out.push({ t: 'id', v: m[0], p: i });
      i += m[0].length;
      continue;
    }
    if ('+-*/^(),|'.includes(c)) {
      out.push({ t: 'op', v: c, p: i });
      i++;
      continue;
    }
    throw new ParseError(`Symbole inattendu « ${c} »`, i);
  }
  return out;
}

export function parse(src: string, vars: readonly string[]): Node {
  if (!src.trim()) throw new ParseError('Expression vide', 0);
  const toks = tokenize(src);
  let i = 0;
  let absDepth = 0;
  const peek = () => toks[i];
  const isOp = (v: string) => peek()?.t === 'op' && peek()!.v === v;
  const expect = (v: string) => {
    if (!isOp(v)) throw new ParseError(v === ')' ? 'Parenthèse fermante manquante' : `« ${v} » attendu`, peek()?.p ?? src.length);
    i++;
  };

  const startsPrimary = (): boolean => {
    const t = peek();
    if (!t) return false;
    if (t.t === 'num' || t.t === 'id') return true;
    if (t.t === 'op' && t.v === '(') return true;
    if (t.t === 'op' && t.v === '|' && absDepth === 0) return true;
    return false;
  };

  function expr(): Node {
    let a = term();
    while (isOp('+') || isOp('-')) {
      const op = (toks[i++] as { v: '+' | '-' }).v;
      a = { k: 'bin', op, a, b: term() };
    }
    return a;
  }
  function term(): Node {
    let a = unary();
    for (;;) {
      if (isOp('*') || isOp('/')) {
        const op = (toks[i++] as { v: '*' | '/' }).v;
        a = { k: 'bin', op, a, b: unary() };
      } else if (startsPrimary()) {
        a = { k: 'bin', op: '*', a, b: power() };
      } else break;
    }
    return a;
  }
  function unary(): Node {
    if (isOp('-')) { i++; return { k: 'neg', a: unary() }; }
    if (isOp('+')) { i++; return unary(); }
    return power();
  }
  function power(): Node {
    const base = primary();
    if (isOp('^')) { i++; return { k: 'bin', op: '^', a: base, b: unary() }; }
    return base;
  }
  function identifier(name: string, pos: number): Node {
    if (FUNCTIONS[name]) {
      const spec = FUNCTIONS[name];
      if (!isOp('(')) {
        // unary function without parentheses: √2, sin x
        if (spec.arity[0] === 1 && startsPrimary()) return { k: 'call', fn: name, args: [power()] };
        throw new ParseError(`« ${name} » attend des parenthèses : ${name}(…)`, pos);
      }
      i++;
      const args: Node[] = [];
      if (!isOp(')')) {
        args.push(expr());
        while (isOp(',')) { i++; args.push(expr()); }
      }
      expect(')');
      if (args.length < spec.arity[0] || args.length > spec.arity[1]) {
        throw new ParseError(`« ${name} » attend ${spec.arity[0] === spec.arity[1] ? spec.arity[0] : `${spec.arity[0]} à ${spec.arity[1]}`} argument(s)`, pos);
      }
      return { k: 'call', fn: name, args };
    }
    if (vars.includes(name)) return { k: 'var', name };
    if (CONSTANTS[name] !== undefined) return { k: 'const', name };
    // split "xy" / "2xy" style products of single-letter variables and constants
    const parts: Node[] = [];
    let rest = name;
    while (rest.length) {
      const c = ['pi', 'phi', 'tau'].find((k) => rest.startsWith(k));
      if (c) { parts.push({ k: 'const', name: c }); rest = rest.slice(c.length); continue; }
      const v = vars.find((vv) => rest.startsWith(vv));
      if (v) { parts.push({ k: 'var', name: v }); rest = rest.slice(v.length); continue; }
      if (rest[0] === 'e') { parts.push({ k: 'const', name: 'e' }); rest = rest.slice(1); continue; }
      if (isOp('(')) throw new ParseError(`Fonction inconnue « ${name} »`, pos);
      throw new ParseError(`Variable inconnue « ${name} » (autorisées : ${vars.join(', ') || 'aucune'})`, pos);
    }
    return parts.reduce((a, b) => ({ k: 'bin', op: '*', a, b }));
  }
  function primary(): Node {
    const t = peek();
    if (!t) throw new ParseError('Expression incomplète', src.length);
    if (t.t === 'num') { i++; return { k: 'num', v: t.v }; }
    if (t.t === 'id') { i++; return identifier(t.v, t.p); }
    if (t.v === '(') { i++; const e = expr(); expect(')'); return e; }
    if (t.v === '|') {
      i++;
      absDepth++;
      const e = expr();
      absDepth--;
      expect('|');
      return { k: 'call', fn: 'abs', args: [e] };
    }
    throw new ParseError(`« ${t.v} » inattendu`, t.p);
  }

  const node = expr();
  if (i < toks.length) throw new ParseError(`« ${(toks[i] as { v: string | number }).v} » inattendu`, toks[i].p);
  return node;
}

// ── code generation ────────────────────────────────────────────────────

function glslNum(v: number): string {
  if (!Number.isFinite(v)) return '0.0';
  const s = String(v);
  return /[.eE]/.test(s) ? (s.includes('e') && !s.includes('.') ? s.replace('e', '.0e') : s) : s + '.0';
}

export function toJS(n: Node): string {
  switch (n.k) {
    case 'num': return String(n.v);
    case 'const': return `(${CONSTANTS[n.name]})`;
    case 'var': return n.name;
    case 'neg': return `(-${toJS(n.a)})`;
    case 'bin': return n.op === '^' ? `Math.pow(${toJS(n.a)},${toJS(n.b)})` : `(${toJS(n.a)}${n.op}${toJS(n.b)})`;
    case 'call': return FUNCTIONS[n.fn].js(n.args.map(toJS));
  }
}

export function toGLSL(n: Node): string {
  switch (n.k) {
    case 'num': return glslNum(n.v);
    case 'const': return glslNum(CONSTANTS[n.name]);
    case 'var': return n.name;
    case 'neg': return `(-${toGLSL(n.a)})`;
    case 'bin':
      if (n.op === '^') {
        if (n.b.k === 'num' && n.b.v === 2) return `((${toGLSL(n.a)})*(${toGLSL(n.a)}))`;
        return `vm_pow(${toGLSL(n.a)},${toGLSL(n.b)})`;
      }
      return `(${toGLSL(n.a)}${n.op}${toGLSL(n.b)})`;
    case 'call': return FUNCTIONS[n.fn].glsl(n.args.map(toGLSL));
  }
}

const PREC: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2, '^': 4 };
function prec(n: Node): number {
  if (n.k === 'bin') return PREC[n.op];
  if (n.k === 'neg') return 3;
  return 5;
}

export function toTeX(n: Node): string {
  const wrap = (c: Node, min: number) => (prec(c) < min ? `\\left(${toTeX(c)}\\right)` : toTeX(c));
  switch (n.k) {
    case 'num': return String(n.v);
    case 'const': return n.name === 'e' ? 'e' : `\\${n.name}`;
    case 'var': return n.name;
    case 'neg': return `-${wrap(n.a, 3)}`;
    case 'bin':
      switch (n.op) {
        case '+': return `${toTeX(n.a)} + ${toTeX(n.b)}`;
        case '-': return `${toTeX(n.a)} - ${wrap(n.b, 2)}`;
        case '*': {
          const a = wrap(n.a, 2);
          const b = wrap(n.b, 2);
          const needDot = n.b.k === 'num' || (n.a.k === 'num' && n.b.k === 'neg');
          return needDot ? `${a} \\cdot ${b}` : `${a}\\,${b}`;
        }
        case '/': return `\\frac{${toTeX(n.a)}}{${toTeX(n.b)}}`;
        case '^': return `{${wrap(n.a, 5)}}^{${toTeX(n.b)}}`;
      }
      break;
    case 'call': return FUNCTIONS[n.fn].tex(n.args.map(toTeX));
  }
  return '';
}

const vm_mod = (a: number, b: number) => ((a % b) + b) % b;

export interface Compiled {
  ok: true;
  src: string;
  ast: Node;
  fn: (...args: number[]) => number;
  glsl: string;
  tex: string;
}
export interface CompileError {
  ok: false;
  src: string;
  error: string;
  pos: number;
}

/** Compile `src` with the allowed variable names, in order of the resulting JS function arguments. */
export function compile(src: string, vars: readonly string[]): Compiled | CompileError {
  try {
    const ast = parse(src, vars);
    const body = toJS(ast);
    const inner = new Function('vm_mod', ...vars, `"use strict"; return ${body};`) as (...a: unknown[]) => number;
    const fn = (...args: number[]) => inner(vm_mod, ...args);
    // smoke-evaluate to surface runtime errors early
    fn(...vars.map(() => 0.5));
    return { ok: true, src, ast, fn, glsl: toGLSL(ast), tex: toTeX(ast) };
  } catch (e) {
    if (e instanceof ParseError) return { ok: false, src, error: e.message, pos: e.pos };
    return { ok: false, src, error: e instanceof Error ? e.message : String(e), pos: 0 };
  }
}
