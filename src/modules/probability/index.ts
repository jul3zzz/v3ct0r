import type { ModuleDef } from '../../core/types';
import { galtonView } from './galton-view';
import { llnView } from './lln-view';
import { cltView } from './clt-view';
import { buffonView } from './buffon-view';
import { study } from './study';

export const module: ModuleDef = {
  id: 'probability',
  code: '06',
  title: 'PROBABILITÉS',
  kanji: '確率',
  tagline: 'Hasard et lois limites',
  vizs: [galtonView, llnView, cltView, buffonView],
  study,
  challenges: [
    {
      q: 'Dans une planche de Galton à n rangées (p = 1/2), le numéro de la case d’arrivée suit…',
      choices: ['une loi uniforme', 'une loi binomiale B(n, 1/2)', 'une loi de Poisson', 'une loi exponentielle'],
      answer: 1,
      explain: 'C’est le nombre de rebonds à droite parmi n rebonds indépendants.',
    },
    {
      q: 'L’écart typique entre la moyenne de n tirages et l’espérance décroît comme…',
      choices: ['1/n', '1/√n', 'e^(−n)', 'il ne décroît pas'],
      answer: 1,
      explain: 'L’écart-type de la moyenne vaut σ/√n.',
    },
    {
      q: 'Pour quelle loi la loi des grands nombres ne s’applique-t-elle pas ?',
      choices: ['Bernoulli', 'uniforme', 'Cauchy', 'binomiale'],
      answer: 2,
      explain: 'La loi de Cauchy n’a pas d’espérance : la moyenne empirique ne converge pas.',
    },
    {
      q: 'Le théorème central limite affirme que la somme normalisée de variables i.i.d. de variance finie tend vers…',
      choices: ['une loi uniforme', 'la loi normale', 'la loi de départ', '0'],
      answer: 1,
      explain: 'Quelle que soit la loi de départ, (Sₙ − nμ)/(σ√n) converge en loi vers N(0, 1).',
    },
    {
      q: 'Dans l’expérience de Buffon avec ℓ = d, une aiguille croise une ligne avec la probabilité…',
      choices: ['1/2', '2/π', 'π/4', '1/π'],
      answer: 1,
      explain: 'P = 2ℓ/(πd) = 2/π ≈ 0,637.',
    },
    {
      q: 'Quelle est la variance du résultat d’un dé équilibré à 6 faces ?',
      choices: ['3,5', '35/12', '1', '6'],
      answer: 1,
      explain: 'E[X²] = 91/6, E[X] = 7/2 : Var = 91/6 − 49/4 = 35/12 ≈ 2,92.',
    },
  ],
};
