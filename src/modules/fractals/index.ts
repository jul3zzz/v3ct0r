import type { ModuleDef } from '../../core/types';
import { mandelbrotView } from './mandelbrot-view';
import { juliaView } from './julia-view';
import { mandelbulbView } from './mandelbulb-view';
import { sierpinskiView, tetraView } from './sierpinski-view';
import { kochView, hilbertView, treeView } from './curves-view';
import { mengerView } from './menger-view';
import { fernView } from './fern-view';
import { attractorsView } from './attractors-view';
import { study } from './study';

export const module: ModuleDef = {
  id: 'fractals',
  code: '03',
  title: 'FRACTALES',
  kanji: '分形',
  tagline: 'Autosimilarité infinie',
  vizs: [mandelbrotView, juliaView, mandelbulbView, sierpinskiView, tetraView, kochView, mengerView, hilbertView, fernView, treeView, attractorsView],
  study,
  challenges: [
    {
      q: 'Quelle est la dimension de Hausdorff du flocon de Koch ?',
      choices: ['1', 'ln 4 / ln 3 ≈ 1,26', 'ln 3 / ln 2 ≈ 1,58', '2'],
      answer: 1,
      explain: '4 copies réduites d’un facteur 3 : D = ln 4 / ln 3.',
    },
    {
      q: 'Le périmètre du flocon de Koch est…',
      choices: ['fini et égal à 3', 'infini', 'égal à 8/5 du périmètre initial', 'nul'],
      answer: 1,
      explain: 'Il est multiplié par 4/3 à chaque étape : il diverge, alors que l’aire converge vers 8/5 de l’aire du triangle.',
    },
    {
      q: 'Si c appartient à l’ensemble de Mandelbrot, l’ensemble de Julia J_c est…',
      choices: ['vide', 'connexe', 'une poussière de Cantor', 'un cercle'],
      answer: 1,
      explain: 'C’est même la définition équivalente de M : l’ensemble des c pour lesquels J_c est connexe.',
    },
    {
      q: 'Quel est le volume limite de l’éponge de Menger ?',
      choices: ['1', '20/27', '0', 'infini'],
      answer: 2,
      explain: 'Le volume est multiplié par 20/27 à chaque étape : (20/27)ⁿ → 0.',
    },
    {
      q: 'À partir de quelle valeur |zₙ| > R est-on sûr que la suite z ↦ z² + c s’échappe (pour |c| ≤ 2) ?',
      choices: ['R = 1', 'R = 2', 'R = π', 'R = 10'],
      answer: 1,
      explain: 'Dès que |z| > 2 (et |z| ≥ |c|), |z² + c| ≥ |z|² − |c| > |z| : la suite diverge.',
    },
    {
      q: 'La courbe de Hilbert à la limite est…',
      choices: ['de longueur finie', 'une courbe qui remplit le carré', 'discontinue', 'de dimension 1'],
      answer: 1,
      explain: 'Elle est continue et surjective sur le carré : une « courbe » de dimension 2.',
    },
    {
      q: 'L’attracteur de Lorenz illustre surtout…',
      choices: ['la convergence vers un point fixe', 'la périodicité', 'la sensibilité aux conditions initiales', 'la conservation de l’énergie'],
      answer: 2,
      explain: 'Deux trajectoires infiniment proches finissent par se séparer : c’est l’effet papillon.',
    },
    {
      q: 'Le triangle de Sierpinski est formé de 3 copies réduites d’un facteur 2. Sa dimension vaut…',
      choices: ['1,5', 'ln 3 / ln 2', '3/2 · ln 2', 'ln 2 / ln 3'],
      answer: 1,
      explain: 'D = ln N / ln(1/r) = ln 3 / ln 2 ≈ 1,585.',
    },
  ],
};
