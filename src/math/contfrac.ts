/** Continued fraction [a0; a1, a2, …] of a number given as a decimal string. Only terms that
 *  are guaranteed by the available precision are returned (convergent denominators² < 10^digits). */
export function continuedFraction(decimal: string, maxTerms = 40): number[] {
  const [ip, fp = ''] = decimal.split('.');
  let p = BigInt(ip + fp);
  let q = 10n ** BigInt(fp.length);
  const limit = 10n ** BigInt(Math.max(2, fp.length - 6));
  const out: number[] = [];
  let k0 = 0n;
  let k1 = 1n;
  for (let i = 0; i < maxTerms && q !== 0n; i++) {
    const a = p / q;
    const k2 = a * k1 + k0;
    if (i > 0 && k2 * k2 > limit) break;
    out.push(Number(a));
    [p, q] = [q, p - a * q];
    k0 = k1;
    k1 = k2;
  }
  return out;
}

/** Convergents p/q of a continued fraction, as floats. */
export function convergents(cf: number[]): [number, number][] {
  const out: [number, number][] = [];
  let h0 = 1;
  let h1 = cf[0];
  let k0 = 0;
  let k1 = 1;
  out.push([h1, k1]);
  for (let i = 1; i < cf.length; i++) {
    const h2 = cf[i] * h1 + h0;
    const k2 = cf[i] * k1 + k0;
    out.push([h2, k2]);
    h0 = h1;
    h1 = h2;
    k0 = k1;
    k1 = k2;
  }
  return out;
}
