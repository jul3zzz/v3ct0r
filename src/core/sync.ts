// Merging the progress of two devices (this one and the account in the cloud). Pure, tested.
// Only progress is synced; device preferences (settings, ship position, calculator) stay local.
// The rule is « nothing earned is lost »: best scores and counters take the maximum, flags are
// OR-ed, sets of ids are united, per-exercise results keep the better one, dated lists are united.

/** localStorage keys (without the `vector-math.` prefix) that follow the account */
export const SYNCED = ['progress.v1', 'learn.v1', 'games.v1', 'story.v1', 'notes.v1'] as const;

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

const isObj = (x: unknown): x is Record<string, Json> => typeof x === 'object' && x !== null && !Array.isArray(x);

/** an exercise result where a solved, non-revealed attempt beats everything else */
const exRank = (o: Record<string, Json>): number => (o.solved === true && o.revealed !== true ? 2 : o.solved === true || o.self === 'ok' ? 1 : 0);

export function deepMerge(a: unknown, b: unknown): Json {
  if (a === undefined || a === null) return (b ?? null) as Json;
  if (b === undefined || b === null) return a as Json;
  if (typeof a === 'number' && typeof b === 'number') return Math.max(a, b);
  if (typeof a === 'boolean' && typeof b === 'boolean') return a || b;
  if (typeof a === 'string' && typeof b === 'string') return a === 'ok' || b === 'ok' ? (a === 'ok' ? a : b) : a;
  if (Array.isArray(a) && Array.isArray(b)) {
    // a set of ids (beacons read…)
    if ([...a, ...b].every((x) => typeof x === 'string')) return [...new Set([...(a as string[]), ...(b as string[])])];
    // a dated list (colles…): union by date, oldest first, capped
    if ([...a, ...b].every((x) => isObj(x) && typeof x.at === 'number')) {
      const byAt = new Map<number, Json>();
      for (const x of [...a, ...b] as Record<string, Json>[]) byAt.set(x.at as number, x);
      return [...byAt.entries()].sort((p, q) => p[0] - q[0]).map((e) => e[1]).slice(-200);
    }
    // a positional list (best score per level, result per exercise)
    return Array.from({ length: Math.max(a.length, b.length) }, (_, i) => deepMerge(a[i], b[i]));
  }
  if (isObj(a) && isObj(b)) {
    if ('solved' in a && 'solved' in b) {
      const ra = exRank(a);
      const rb = exRank(b);
      if (ra !== rb) return ra > rb ? a : b;
    }
    const out: Record<string, Json> = {};
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) out[k] = deepMerge(a[k], b[k]);
    return out;
  }
  // different types: keep this device's value
  return a as Json;
}

/** merge two snapshots of the synced keys */
export function mergeSnapshots(local: Record<string, unknown>, remote: Record<string, unknown>): Record<string, Json> {
  const out: Record<string, Json> = {};
  for (const k of SYNCED) {
    const v = deepMerge(local[k], remote[k]);
    if (v !== null) out[k] = v;
  }
  return out;
}

/** stable comparison of two snapshots */
export const sameSnapshot = (a: unknown, b: unknown): boolean => stable(a) === stable(b);

function stable(x: unknown): string {
  if (Array.isArray(x)) return `[${x.map(stable).join(',')}]`;
  if (isObj(x)) return `{${Object.keys(x).sort().map((k) => `${JSON.stringify(k)}:${stable(x[k])}`).join(',')}}`;
  return JSON.stringify(x ?? null);
}
