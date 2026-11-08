import type { ModuleDef } from '../../core/types';
import { riemannView } from './riemann-view';
import { ftcView } from './ftc-view';
import { doubleView } from './double-view';
import { tripleView } from './triple-view';
import { hyperView } from './hyper-view';
import { study } from './study';

export const module: ModuleDef = {
  id: 'integrals',
  code: '01',
  title: 'INTÉGRALES',
  kanji: '積分',
  tagline: 'Aire, volume, hypervolume',
  vizs: [riemannView, ftcView, doubleView, tripleView, hyperView],
  study,
  challenges: [
    {
      q: 'Quand on double n, de combien est environ divisée l’erreur de la méthode des trapèzes ?',
      choices: ['2', '4', '8', '16'],
      answer: 1,
      explain: 'L’erreur des trapèzes est en O(1/n²) : doubler n divise l’erreur par 2² = 4.',
    },
    {
      q: 'Et pour la méthode de Simpson ?',
      choices: ['4', '8', '16', '32'],
      answer: 2,
      explain: 'Simpson est en O(1/n⁴) : doubler n divise l’erreur par 16.',
    },
    {
      q: 'Si F(x) = ∫ₐˣ f(t) dt, que vaut F′(x) ?',
      choices: ['F(x)', 'f(x)', 'f′(x)', 'f(x) − f(a)'],
      answer: 1,
      explain: 'C’est le théorème fondamental de l’analyse : l’aire accumulée croît à la vitesse f(x).',
    },
    {
      q: 'Que vaut ∫₀¹ x² dx ?',
      choices: ['1/2', '1/3', '1', '2/3'],
      answer: 1,
      explain: 'Une primitive est x³/3 : 1/3 − 0 = 1/3.',
    },
    {
      q: 'L’erreur d’une estimation Monte-Carlo avec N tirages décroît comme…',
      choices: ['1/N', '1/N²', '1/√N', 'e^(−N)'],
      answer: 2,
      explain: 'L’écart-type de la moyenne est σ/√N, indépendamment de la dimension.',
    },
    {
      q: 'Quel est l’hypervolume de la boule unité de ℝ⁴ ?',
      choices: ['4π/3', 'π²/2', '2π²', 'π⁴'],
      answer: 1,
      explain: 'V₄ = π²R⁴/2, obtenu en intégrant les volumes des tranches 4π(1 − w²)^{3/2}/3.',
    },
    {
      q: 'Dans quelle dimension la boule unité a-t-elle le plus grand volume ?',
      choices: ['3', '4', '5', 'elle grandit sans fin'],
      answer: 2,
      explain: 'V₅ = 8π²/15 ≈ 5,264 est le maximum, puis Vₙ → 0.',
    },
  ],
};
