import type { ModuleDef } from '../../core/types';
import { limitsView, derivativeView, taylorView } from './calculus-views';
import { fourierView } from './fourier-view';
import { complexView } from './complex-view';
import { primesView } from './primes-view';
import { zetaView } from './zeta-view';
import { cantorView } from './cantor-view';
import { linearView } from './linear-view';
import { tilingsView } from './tilings-view';
import { collatzView } from './collatz-view';
import { study } from './study';

export const module: ModuleDef = {
  id: 'principles',
  code: '05',
  title: 'PRINCIPES',
  kanji: '原理',
  tagline: 'Bibliothèque de fiches',
  vizs: [limitsView, derivativeView, taylorView, fourierView, complexView, primesView, zetaView, cantorView, linearView, tilingsView, collatzView],
  study,
  challenges: [
    {
      q: 'Que vaut lim (x → 0) sin(x)/x ?',
      choices: ['0', '1', '∞', 'elle n’existe pas'],
      answer: 1,
      explain: 'sin x ≈ x près de 0, donc le rapport tend vers 1.',
    },
    {
      q: 'La dérivée de f en x est la limite de…',
      choices: ['f(x + h) − f(x)', '(f(x + h) − f(x)) / h', 'f(x) / x', 'h · f(x)'],
      answer: 1,
      explain: 'C’est la pente de la sécante quand h → 0.',
    },
    {
      q: 'Le développement de Taylor de ln(1 + x) en 0 converge pour…',
      choices: ['tout x réel', '|x| < 1 (et x = 1)', 'x > 0 seulement', 'x = 0 seulement'],
      answer: 1,
      explain: 'Son rayon de convergence vaut 1 (singularité en x = −1).',
    },
    {
      q: 'Combien de polygones réguliers pavent le plan seuls ?',
      choices: ['2', '3', '5', 'une infinité'],
      answer: 1,
      explain: 'Triangle, carré et hexagone : il faut que l’angle intérieur divise 360°.',
    },
    {
      q: 'L’ensemble des rationnels ℚ est…',
      choices: ['fini', 'dénombrable', 'non dénombrable', 'de même cardinal que ℝ'],
      answer: 1,
      explain: 'Le parcours en zigzag des fractions p/q les numérote toutes.',
    },
    {
      q: 'Le déterminant d’une matrice 2×2 mesure…',
      choices: ['la longueur des colonnes', 'le facteur d’aire (signé)', 'l’angle de rotation', 'la trace'],
      answer: 1,
      explain: 'Le carré unité devient un parallélogramme d’aire |det A|.',
    },
    {
      q: 'Partant de 6, la suite de Collatz donne…',
      choices: ['6, 3, 10, 5, 16, 8, 4, 2, 1', '6, 3, 1', '6, 12, 24…', '6, 19, 58…'],
      answer: 0,
      explain: '6 pair → 3 ; 3 impair → 10 ; puis 5, 16, 8, 4, 2, 1.',
    },
    {
      q: 'L’hypothèse de Riemann affirme que les zéros non triviaux de ζ ont pour partie réelle…',
      choices: ['0', '1/2', '1', '−2'],
      answer: 1,
      explain: 'Ils seraient tous sur la droite critique Re(s) = 1/2 — c’est l’un des problèmes du millénaire.',
    },
  ],
};
