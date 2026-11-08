import type { ModuleDef } from '../../core/types';
import { polytopesView } from './polytopes-view';
import { slicesView } from './slices-view';
import { surfacesView } from './surfaces-view';
import { hopfView } from './hopf-view';
import { study } from './study';

export const module: ModuleDef = {
  id: '4d',
  code: '02',
  title: 'DIMENSIONS',
  kanji: '次元',
  tagline: '3D & 4D interactives',
  vizs: [polytopesView, slicesView, hopfView, surfacesView],
  study,
  challenges: [
    {
      q: 'Combien de sommets possède un tesseract (hypercube de dimension 4) ?',
      choices: ['8', '16', '24', '32'],
      answer: 1,
      explain: 'Chaque coordonnée vaut ±1 : 2⁴ = 16 sommets.',
    },
    {
      q: 'Combien de cellules cubiques forment le bord du tesseract ?',
      choices: ['6', '8', '12', '16'],
      answer: 1,
      explain: 'Deux cubes par axe (x = ±1, y = ±1, z = ±1, w = ±1) : 4 × 2 = 8 cellules.',
    },
    {
      q: 'Combien de plans de rotation indépendants existe-t-il en dimension 4 ?',
      choices: ['3', '4', '6', '8'],
      answer: 2,
      explain: 'Une rotation élémentaire agit dans un plan défini par deux axes : C(4,2) = 6 plans (XY, XZ, XW, YZ, YW, ZW).',
    },
    {
      q: 'Une hypersphère qui traverse notre espace 3D nous apparaît comme…',
      choices: ['un cube qui tourne', 'une sphère qui grandit puis rétrécit', 'un cercle fixe', 'un tore'],
      answer: 1,
      explain: 'La coupe de S³ par l’hyperplan w = c est une sphère de rayon √(1 − c²).',
    },
    {
      q: 'Quel polytope régulier convexe de dimension 4 n’a aucun équivalent en dimension 3 ?',
      choices: ['Le 5-cell', 'Le 16-cell', 'Le 24-cell', 'Le tesseract'],
      answer: 2,
      explain: 'Le 24-cell {3,4,3} est autodual et n’a pas d’analogue parmi les solides de Platon.',
    },
    {
      q: 'La bouteille de Klein est une surface…',
      choices: ['orientable de genre 1', 'non orientable, χ = 0', 'non orientable, χ = 2', 'à bord'],
      answer: 1,
      explain: 'Elle n’a ni intérieur ni extérieur, et sa caractéristique d’Euler vaut 0.',
    },
    {
      q: 'La surface de Boy est une immersion dans ℝ³ de…',
      choices: ['la sphère', 'le tore', 'le plan projectif réel', 'la bouteille de Klein'],
      answer: 2,
      explain: 'Boy (1901) a montré qu’on peut immerger ℝP² dans ℝ³ sans point singulier.',
    },
    {
      q: 'Combien de faces possède un ruban de Möbius ?',
      choices: ['1', '2', '3', 'aucune'],
      answer: 0,
      explain: 'Une seule face et un seul bord : une fourmi en fait le tour complet sans franchir le bord.',
    },
  ],
};
