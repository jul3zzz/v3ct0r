/**
 * Complex compilation of parser expressions: f(z) with the imaginary unit i.
 * Same grammar as the real parser; `z` is the variable and `i` the imaginary unit.
 * Produces a JS function [re, im] → [re, im], a GLSL vec2 expression and LaTeX.
 */
import { CONSTANTS, ParseError, parse, toTeX, type Node } from './parser';

export type C = [number, number];

const cadd = (a: C, b: C): C => [a[0] + b[0], a[1] + b[1]];
const csub = (a: C, b: C): C => [a[0] - b[0], a[1] - b[1]];
const cmul = (a: C, b: C): C => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const cdiv = (a: C, b: C): C => {
  const d = b[0] * b[0] + b[1] * b[1];
  return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d];
};
const cexp = (a: C): C => {
  const e = Math.exp(a[0]);
  return [e * Math.cos(a[1]), e * Math.sin(a[1])];
};
const clog = (a: C): C => [Math.log(Math.hypot(a[0], a[1])), Math.atan2(a[1], a[0])];
const cpow = (a: C, b: C): C => (a[0] === 0 && a[1] === 0 ? [0, 0] : cexp(cmul(b, clog(a))));
const cpowi = (a: C, n: number): C => {
  let r: C = [1, 0];
  let p = a;
  let k = Math.abs(n);
  while (k) {
    if (k & 1) r = cmul(r, p);
    p = cmul(p, p);
    k >>= 1;
  }
  return n < 0 ? cdiv([1, 0], r) : r;
};
const csin = ([x, y]: C): C => [Math.sin(x) * Math.cosh(y), Math.cos(x) * Math.sinh(y)];
const ccos = ([x, y]: C): C => [Math.cos(x) * Math.cosh(y), -Math.sin(x) * Math.sinh(y)];
const csinh = ([x, y]: C): C => [Math.sinh(x) * Math.cos(y), Math.cosh(x) * Math.sin(y)];
const ccosh = ([x, y]: C): C => [Math.cosh(x) * Math.cos(y), Math.sinh(x) * Math.sin(y)];
const csqrt = (a: C): C => {
  const r = Math.sqrt(Math.hypot(a[0], a[1]));
  const t = Math.atan2(a[1], a[0]) / 2;
  return [r * Math.cos(t), r * Math.sin(t)];
};

const LIB = {
  add: cadd,
  sub: csub,
  mul: cmul,
  div: cdiv,
  neg: (a: C): C => [-a[0], -a[1]],
  exp: cexp,
  log: clog,
  pow: cpow,
  powi: cpowi,
  sin: csin,
  cos: ccos,
  tan: (a: C): C => cdiv(csin(a), ccos(a)),
  sinh: csinh,
  cosh: ccosh,
  tanh: (a: C): C => cdiv(csinh(a), ccosh(a)),
  sqrt: csqrt,
  abs: (a: C): C => [Math.hypot(a[0], a[1]), 0],
  re: (a: C): C => [a[0], 0],
  im: (a: C): C => [a[1], 0],
  conj: (a: C): C => [a[0], -a[1]],
  arg: (a: C): C => [Math.atan2(a[1], a[0]), 0],
};

const JS_FN: Record<string, string> = {
  exp: 'exp', ln: 'log', log: 'log', sqrt: 'sqrt', sin: 'sin', cos: 'cos', tan: 'tan',
  sinh: 'sinh', cosh: 'cosh', tanh: 'tanh', abs: 'abs', re: 're', im: 'im', conj: 'conj', arg: 'arg',
};

/** GLSL complex helpers (vec2 = re + i·im). Prepend to shaders using `toComplexGLSL`. */
export const COMPLEX_GLSL = /* glsl */ `
vec2 c_mul(vec2 a, vec2 b) { return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x); }
vec2 c_div(vec2 a, vec2 b) { float d = dot(b, b); return vec2(a.x * b.x + a.y * b.y, a.y * b.x - a.x * b.y) / d; }
vec2 c_exp(vec2 a) { return exp(a.x) * vec2(cos(a.y), sin(a.y)); }
vec2 c_log(vec2 a) { return vec2(log(length(a)), atan(a.y, a.x)); }
vec2 c_pow(vec2 a, vec2 b) { return dot(a, a) == 0.0 ? vec2(0.0) : c_exp(c_mul(b, c_log(a))); }
vec2 c_powi(vec2 a, int n) {
  vec2 r = vec2(1.0, 0.0);
  int k = n < 0 ? -n : n;
  for (int j = 0; j < 64; j++) { if (j >= k) break; r = c_mul(r, a); }
  return n < 0 ? c_div(vec2(1.0, 0.0), r) : r;
}
vec2 c_sin(vec2 a) { return vec2(sin(a.x) * cosh(a.y), cos(a.x) * sinh(a.y)); }
vec2 c_cos(vec2 a) { return vec2(cos(a.x) * cosh(a.y), -sin(a.x) * sinh(a.y)); }
vec2 c_tan(vec2 a) { return c_div(c_sin(a), c_cos(a)); }
vec2 c_sinh(vec2 a) { return vec2(sinh(a.x) * cos(a.y), cosh(a.x) * sin(a.y)); }
vec2 c_cosh(vec2 a) { return vec2(cosh(a.x) * cos(a.y), sinh(a.x) * sin(a.y)); }
vec2 c_tanh(vec2 a) { return c_div(c_sinh(a), c_cosh(a)); }
vec2 c_sqrt(vec2 a) { float r = sqrt(length(a)); float t = atan(a.y, a.x) * 0.5; return r * vec2(cos(t), sin(t)); }
vec2 c_abs(vec2 a) { return vec2(length(a), 0.0); }
vec2 c_re(vec2 a) { return vec2(a.x, 0.0); }
vec2 c_im(vec2 a) { return vec2(a.y, 0.0); }
vec2 c_conj(vec2 a) { return vec2(a.x, -a.y); }
vec2 c_arg(vec2 a) { return vec2(atan(a.y, a.x), 0.0); }
`;

const glslNum = (v: number) => {
  const s = String(v);
  return /[.eE]/.test(s) ? s : s + '.0';
};

function smallInt(n: Node): number | null {
  if (n.k === 'num' && Number.isInteger(n.v) && Math.abs(n.v) <= 64) return n.v;
  if (n.k === 'neg' && n.a.k === 'num' && Number.isInteger(n.a.v) && n.a.v <= 64) return -n.a.v;
  return null;
}

function toCJS(n: Node): string {
  switch (n.k) {
    case 'num': return `[${n.v},0]`;
    case 'const': return `[${CONSTANTS[n.name]},0]`;
    case 'var': return n.name === 'i' ? '[0,1]' : 'z';
    case 'neg': return `C.neg(${toCJS(n.a)})`;
    case 'bin': {
      const a = toCJS(n.a);
      if (n.op === '^') {
        const k = smallInt(n.b);
        return k !== null ? `C.powi(${a},${k})` : `C.pow(${a},${toCJS(n.b)})`;
      }
      const b = toCJS(n.b);
      return `C.${({ '+': 'add', '-': 'sub', '*': 'mul', '/': 'div' } as const)[n.op]}(${a},${b})`;
    }
    case 'call': {
      if (n.fn === 'pow') {
        const k = smallInt(n.args[1]);
        return k !== null ? `C.powi(${toCJS(n.args[0])},${k})` : `C.pow(${toCJS(n.args[0])},${toCJS(n.args[1])})`;
      }
      const f = JS_FN[n.fn];
      if (!f) throw new ParseError(`« ${n.fn} » n’existe pas en mode complexe`, 0);
      return `C.${f}(${toCJS(n.args[0])})`;
    }
  }
}

function toCGLSL(n: Node): string {
  switch (n.k) {
    case 'num': return `vec2(${glslNum(n.v)},0.0)`;
    case 'const': return `vec2(${glslNum(CONSTANTS[n.name])},0.0)`;
    case 'var': return n.name === 'i' ? 'vec2(0.0,1.0)' : 'z';
    case 'neg': return `(-${toCGLSL(n.a)})`;
    case 'bin': {
      const a = toCGLSL(n.a);
      if (n.op === '^') {
        const k = smallInt(n.b);
        return k !== null ? `c_powi(${a},${k})` : `c_pow(${a},${toCGLSL(n.b)})`;
      }
      const b = toCGLSL(n.b);
      if (n.op === '+' || n.op === '-') return `(${a}${n.op}${b})`;
      return n.op === '*' ? `c_mul(${a},${b})` : `c_div(${a},${b})`;
    }
    case 'call': {
      if (n.fn === 'pow') {
        const k = smallInt(n.args[1]);
        return k !== null ? `c_powi(${toCGLSL(n.args[0])},${k})` : `c_pow(${toCGLSL(n.args[0])},${toCGLSL(n.args[1])})`;
      }
      const f = JS_FN[n.fn];
      if (!f) throw new ParseError(`« ${n.fn} » n’existe pas en mode complexe`, 0);
      return `c_${f}(${toCGLSL(n.args[0])})`;
    }
  }
}

export interface ComplexCompiled {
  ok: true;
  src: string;
  ast: Node;
  fn: (z: C) => C;
  glsl: string;
  tex: string;
}

export function compileComplex(src: string): ComplexCompiled | { ok: false; src: string; error: string; pos: number } {
  try {
    const ast = parse(src, ['z', 'i']);
    const body = toCJS(ast);
    const inner = new Function('C', 'z', `"use strict"; return ${body};`) as (c: typeof LIB, z: C) => C;
    const fn = (z: C) => inner(LIB, z);
    fn([0.3, 0.2]);
    return { ok: true, src, ast, fn, glsl: toCGLSL(ast), tex: toTeX(ast) };
  } catch (e) {
    if (e instanceof ParseError) return { ok: false, src, error: e.message, pos: e.pos };
    return { ok: false, src, error: e instanceof Error ? e.message : String(e), pos: 0 };
  }
}
