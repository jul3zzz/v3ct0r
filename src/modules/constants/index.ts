import type { ModuleDef } from '../../core/types';
import { piView } from './pi-view';
import { phiView } from './phi-view';
import { sqrt2View } from './sqrt2-view';
import { eView } from './e-view';
import { iView } from './i-view';
import { gammaView } from './gamma-view';
import { zeta3View } from './zeta3-view';
import { ln2View } from './ln2-view';
import { compareView } from './compare-view';
import { walkView } from './walk-view';
import { eulerView } from './euler-view';
import { study } from './study';

export const module: ModuleDef = {
  id: 'constants',
  code: '04',
  title: 'CONSTANTES',
  kanji: '定数',
  tagline: 'Nombres exceptionnels',
  vizs: [piView, phiView, sqrt2View, eView, iView, gammaView, zeta3View, ln2View, compareView, walkView, eulerView],
  study,
  challenges: [
    {
      q: 'Quelle est la fraction continue du nombre d’or φ ?',
      choices: ['[1; 2, 2, 2, …]', '[1; 1, 1, 1, …]', '[2; 1, 2, 1, 1, 4, …]', '[3; 7, 15, 1, …]'],
      answer: 1,
      explain: 'φ = 1 + 1/φ, donc tous les termes valent 1 : c’est le nombre le plus « mal approchable » par des fractions.',
    },
    {
      q: 'Vers quoi tend (1 + 1/n)ⁿ ?',
      choices: ['1', '2', 'e', '+∞'],
      answer: 2,
      explain: 'C’est la définition « intérêts composés » de e ≈ 2,71828.',
    },
    {
      q: 'Avec un hexagone puis 12, 24, 48, 96 côtés, Archimède obtient…',
      choices: ['π = 3,14159', '223/71 < π < 22/7', 'π = 355/113', '3 < π < 4'],
      answer: 1,
      explain: 'À 96 côtés : 3,1408 < π < 3,1429.',
    },
    {
      q: 'Quelle constante n’est pas encore prouvée irrationnelle ?',
      choices: ['√2', 'e', 'ζ(3)', 'γ'],
      answer: 3,
      explain: 'On ignore si la constante d’Euler-Mascheroni γ est rationnelle. ζ(3) est irrationnel (Apéry, 1978).',
    },
    {
      q: 'Que vaut i³ ?',
      choices: ['1', 'i', '−1', '−i'],
      answer: 3,
      explain: 'i³ = i² · i = −i : trois quarts de tour.',
    },
    {
      q: 'La probabilité que trois entiers au hasard soient premiers entre eux vaut…',
      choices: ['1/2', '6/π²', '1/ζ(3)', 'ln 2'],
      answer: 2,
      explain: '1/ζ(3) ≈ 0,832. Pour deux entiers, c’est 1/ζ(2) = 6/π².',
    },
    {
      q: 'La série 1 − 1/2 + 1/3 − 1/4 + … converge vers…',
      choices: ['π/4', 'ln 2', 'γ', 'elle diverge'],
      answer: 1,
      explain: 'C’est la série harmonique alternée : elle vaut ln 2, très lentement.',
    },
    {
      q: 'Dans e^{iπ} + 1 = 0, multiplier par e^{iπ} revient à…',
      choices: ['doubler la longueur', 'un quart de tour', 'un demi-tour', 'ne rien faire'],
      answer: 2,
      explain: 'e^{iθ} est une rotation d’angle θ ; θ = π est un demi-tour, qui envoie 1 sur −1.',
    },
  ],
};
