// School codes: trial keys now, teacher / principal / class codes later (docs/ECOLES.md).
// Crockford base32, typed loosely: anything but ASCII letters and digits is dropped, then upper
// case, O → 0, I and L → 1. The server stores sha256 of the normalized code and applies the same
// rule (school.norm_code in supabase/migrations/20261111120000_school_trial.sql).
// Pure, no DOM: shared with tools/school.ts.

export const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

/** characters per kind of code (5 bits each): trial key 100 bits, staff 80 bits, class 60 bits */
export const CODE_LENGTH = { trial: 20, staff: 16, class: 12 } as const;

export function normCode(s: string): string {
  return s.replace(/[^0-9A-Za-z]/g, '').toUpperCase().replace(/O/g, '0').replace(/[IL]/g, '1');
}

/** a normalized code made of the alphabet only */
export const isCode = (s: string): boolean => s.length > 0 && [...s].every((c) => ALPHABET.includes(c));

export const isTrialKey = (s: string): boolean => {
  const n = normCode(s);
  return n.length === CODE_LENGTH.trial && isCode(n);
};

/** groups for reading aloud and typing: XXXXX-XXXXX-XXXXX-XXXXX */
export function formatCode(s: string, group = 5): string {
  const n = normCode(s);
  const parts: string[] = [];
  for (let i = 0; i < n.length; i += group) parts.push(n.slice(i, i + group));
  return parts.join('-');
}

/** a random code: 256 is a multiple of 32, so `byte & 31` is uniform */
export function newCode(length: number, random: (n: number) => Uint8Array = (n) => crypto.getRandomValues(new Uint8Array(n))): string {
  return [...random(length)].map((b) => ALPHABET[b & 31]).join('');
}

/** sha256 of the normalized code, in hex (what the admin script sends to the server) */
export async function codeHash(s: string): Promise<string> {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(normCode(s)));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
