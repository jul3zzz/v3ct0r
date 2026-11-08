// courses/<id>/exercises.md: exercises written in Markdown (LaTeX as is), instead of
// exercises.json. Pure parsing, shared with the tests.
//
//   # ex-id · simple · 10 · Title          (simple ≈ 10 min, moyen ≈ 30 min, complexe ≥ 1 h)
//   Statement (rich text, several paragraphs allowed)
//   ## Indice                               (exactly three, from a nudge to almost the solution)
//   ## Étape · 2                            (worked solution, step by step; · points, default 1)
//   ## Réponse                              (optional) "num 0.5 ± 0.001", or "qcm B" then "- choice" lines
import type { CourseExercise, ExerciseAnswer } from './types';

const LEVELS: Record<string, 1 | 2 | 3> = { simple: 1, moyen: 2, complexe: 3, application: 1, classique: 2, difficile: 3 };

export function parseExercises(md: string): { exercises: CourseExercise[]; errors: string[] } {
  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  const out: CourseExercise[] = [];
  const errors: string[] = [];
  type Part = { kind: 'statement' | 'hint' | 'step' | 'answer'; points: number; lines: string[] };
  let cur: { id: string; title: string; level: 1 | 2 | 3; minutes: number; line: number; parts: Part[] } | null = null;
  const close = () => {
    if (!cur) return;
    const c = cur;
    const text = (p: Part) => p.lines.join('\n').trim();
    const statement = c.parts.filter((p) => p.kind === 'statement').map(text).join('\n\n');
    const hints = c.parts.filter((p) => p.kind === 'hint').map(text);
    const steps = c.parts.filter((p) => p.kind === 'step').map((p) => ({ text: text(p), points: p.points }));
    const where = `${c.id} (ligne ${c.line})`;
    if (!statement) errors.push(`${where} : énoncé vide`);
    if (hints.length !== 3) errors.push(`${where} : ${hints.length} indice(s), 3 attendus`);
    if (hints.some((x) => !x) || steps.some((x) => !x.text)) errors.push(`${where} : indice ou étape vide`);
    if (!steps.length) errors.push(`${where} : aucune étape de correction`);
    let answer: ExerciseAnswer | undefined;
    const ans = c.parts.find((p) => p.kind === 'answer');
    if (ans) {
      const body = ans.lines.map((l) => l.trim()).filter(Boolean);
      const num = /^num\s+(-?[\d.]+(?:e-?\d+)?)\s*(?:±\s*([\d.]+(?:e-?\d+)?))?$/.exec(body[0] ?? '');
      const qcm = /^qcm\s+([A-D])$/.exec(body[0] ?? '');
      if (num) {
        const v = Number(num[1]);
        answer = { kind: 'num', value: v, tol: num[2] ? Number(num[2]) : 1e-3 * Math.max(1, Math.abs(v)) };
      } else if (qcm) {
        const choices = body.slice(1).filter((l) => l.startsWith('- ')).map((l) => l.slice(2));
        const k = 'ABCD'.indexOf(qcm[1]);
        if (choices.length < 2 || k >= choices.length) errors.push(`${where} : QCM mal formé`);
        answer = { kind: 'qcm', choices, answer: k };
      } else errors.push(`${where} : réponse illisible (« num 0.5 ± 0.001 » ou « qcm B » + choix)`);
    }
    out.push({ id: c.id, title: c.title, level: c.level, minutes: c.minutes, statement, hints: hints.slice(0, 3) as [string, string, string], solution: steps, ...(answer ? { answer } : {}) });
    cur = null;
  };
  lines.forEach((raw, i) => {
    const n = i + 1;
    const head = /^#\s+([\w-]+)\s*·\s*(\p{L}+)\s*·\s*(\d+)\s*(?:min)?\s*·\s*(.+?)\s*$/u.exec(raw);
    if (head) {
      close();
      const level = LEVELS[head[2].toLowerCase()];
      if (!level) errors.push(`ligne ${n} : niveau « ${head[2]} » inconnu (simple, moyen, complexe)`);
      if (out.some((e) => e.id === head[1])) errors.push(`ligne ${n} : exercice « ${head[1]} » en double`);
      cur = { id: head[1], title: head[4], level: level ?? 1, minutes: Number(head[3]), line: n, parts: [{ kind: 'statement', points: 0, lines: [] }] };
      return;
    }
    if (/^#\s/.test(raw)) {
      errors.push(`ligne ${n} : en-tête d’exercice illisible (« # id · simple · 10 · Titre »)`);
      return;
    }
    const sec = /^##\s+(\p{L}+)\s*(?:·\s*(\d+))?\s*$/u.exec(raw);
    if (sec && cur) {
      const w = sec[1].toLowerCase();
      const kind = w === 'indice' ? 'hint' : w === 'étape' || w === 'etape' ? 'step' : w === 'réponse' || w === 'reponse' ? 'answer' : null;
      if (!kind) errors.push(`ligne ${n} : section « ${sec[1]} » inconnue (Indice, Étape, Réponse)`);
      else cur.parts.push({ kind, points: sec[2] ? Number(sec[2]) : 1, lines: [] });
      return;
    }
    if (!cur) {
      if (raw.trim() && !raw.startsWith('<!--')) errors.push(`ligne ${n} : texte avant le premier exercice`);
      return;
    }
    cur.parts[cur.parts.length - 1].lines.push(raw);
  });
  close();
  return { exercises: out, errors };
}
