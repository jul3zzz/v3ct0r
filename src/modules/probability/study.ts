import type { Study } from '../../core/study';

export const study: Record<string, Study> = {
  galton: {
    lesson: {
      objective: 'Voir la loi binomiale se construire bille après bille, puis devenir une courbe de Gauss.',
      notions: [
        'À chaque clou, la bille part à droite avec la probabilité p.',
        'Le nombre de rebonds à droite suit la loi binomiale B(n, p).',
        'Moyenne np, variance np(1 − p).',
        'Pour n grand, la binomiale ressemble à une gaussienne.',
      ],
      observe: [
        'Ajoute + 1 000 BILLES et compare à la COURBE DE GAUSS.',
        'Change la PROBABILITÉ DROITE p : la cloche se décale.',
        'Lis MOYENNE (np) et VARIANCE (np(1−p)).',
      ],
      formula: 'P(X=k)=\\binom nk p^k(1-p)^{n-k},\\qquad E[X]=np,\\quad V[X]=np(1-p)',
      fact: 'Francis Galton a construit sa planche en 1873 pour illustrer la « loi des erreurs » ; il l’appelait le quincunx.',
    },
    exercises: [
      { kind: 'qcm', q: 'Avec 10 rangées et p = 1/2, quelle case reçoit le plus de billes ?', choices: ['0', '3', '5', '10'], answer: 2, hint: 'La case la plus probable est proche de np.', explain: 'np = 5 : la case centrale.' },
      { kind: 'num', q: 'Variance du nombre de rebonds à droite pour n = 12 et p = 1/2 ?', answer: 3, tol: 0.001, hint: 'np(1 − p).', explain: '12 × 0,5 × 0,5 = 3.' },
      {
        kind: 'task',
        q: 'Règle p = 0,30 et lance au moins 2 000 billes.',
        check: (a) => Math.abs(Number(a.get('PROBABILITÉ DROITE p')) - 0.3) < 0.006 && a.num('BILLES') >= 2000,
        uses: ['PROBABILITÉ DROITE p', 'BILLES'],
        hint: 'Change p d’abord (cela vide la planche), puis utilise + 1 000 BILLES.',
        explain: 'La cloche se décale vers la gauche, centrée sur np, et reste bien décrite par une gaussienne.',
      },
    ],
  },
  lln: {
    lesson: {
      objective: 'Voir la moyenne des tirages se stabiliser : la loi des grands nombres, et sa limite.',
      notions: [
        'La moyenne de n tirages indépendants tend vers l’espérance.',
        'L’écart typique décroît comme σ/√n.',
        'Il faut une espérance finie : la loi de Cauchy n’en a pas.',
        'Avec Cauchy, la moyenne ne se stabilise jamais.',
      ],
      observe: [
        'PIÈCE : les moyennes convergent vers 1/2.',
        'DÉ À 6 FACES : vers 3,5.',
        'CAUCHY : de grands sauts réapparaissent sans cesse.',
      ],
      formula: '\\bar X_n=\\frac1n\\sum_{k=1}^nX_k\\ \\xrightarrow[n\\to\\infty]{}\\ E[X],\\qquad \\sigma(\\bar X_n)=\\frac{\\sigma}{\\sqrt n}',
      fact: 'Jacques Bernoulli a mis 20 ans à démontrer la première loi des grands nombres, publiée en 1713 après sa mort.',
    },
    exercises: [
      { kind: 'qcm', q: 'Espérance d’un dé équilibré à 6 faces ?', choices: ['3', '3,5', '4', '6'], answer: 1, hint: '(1 + 2 + … + 6)/6.', explain: '21/6 = 3,5.' },
      { kind: 'num', q: 'Écart-type de la moyenne de 10 000 lancers de pièce (σ = 0,5) ?', answer: 0.005, tol: 0.0005, hint: 'σ/√n.', explain: '0,5/100 = 0,005.' },
      {
        kind: 'task',
        q: 'Lance le contre-exemple de CAUCHY.',
        check: (a) => a.pressed('CAUCHY (CONTRE-EXEMPLE)'),
        uses: ['CAUCHY (CONTRE-EXEMPLE)'],
        hint: 'C’est dans la liste des expériences.',
        explain: 'Sans espérance finie, la moyenne de n tirages de Cauchy suit encore une loi de Cauchy : elle ne converge pas.',
      },
    ],
  },
  clt: {
    lesson: {
      objective: 'Voir le théorème central limite : additionner des hasards quelconques fait apparaître la courbe de Gauss.',
      notions: [
        'On additionne n variables indépendantes de même loi, puis on centre et on réduit.',
        'La distribution obtenue tend vers la loi normale N(0, 1).',
        'L’asymétrie tend vers 0 et le kurtosis vers 3.',
        'Il suffit d’une variance finie.',
      ],
      observe: [
        'Coupe n AUGMENTE AUTOMATIQUEMENT et règle NOMBRE DE TERMES n.',
        'Compare UNIFORME [0,1], EXPONENTIELLE et BIMODALE.',
        'Lis ASYMÉTRIE (→ 0) et KURTOSIS (→ 3).',
      ],
      formula: '\\frac{S_n-n\\mu}{\\sigma\\sqrt n}\\ \\xrightarrow{\\ \\mathcal L\\ }\\ \\mathcal N(0,1)',
      fact: 'Laplace a énoncé le théorème en 1810 ; Lyapunov en a donné une démonstration rigoureuse en 1901.',
    },
    exercises: [
      { kind: 'qcm', q: 'Quelle est la loi de la somme de 2 uniformes indépendantes sur [0, 1] ?', choices: ['uniforme sur [0, 2]', 'triangulaire', 'normale', 'exponentielle'], answer: 1, hint: 'Les sommes proches de 1 sont plus fréquentes.', explain: 'Sa densité est un triangle de sommet en 1.' },
      { kind: 'num', q: 'Écart-type de la somme de 100 uniformes sur [0, 1] (variance 1/12 chacune) ?', answer: Math.sqrt(100 / 12), tol: 0.01, hint: 'Les variances s’additionnent.', explain: '√(100/12) ≈ 2,887.' },
      {
        kind: 'task',
        q: 'EXPONENTIELLE, n ≥ 30 à la main, avec une asymétrie inférieure à 0,4.',
        check: (a) => a.pressed('EXPONENTIELLE') && a.get('n AUGMENTE AUTOMATIQUEMENT') === false && Number(a.get('NOMBRE DE TERMES n')) >= 30 && a.num('ASYMÉTRIE (→ 0)') < 0.4,
        uses: ['EXPONENTIELLE', 'n AUGMENTE AUTOMATIQUEMENT', 'NOMBRE DE TERMES n', 'ASYMÉTRIE (→ 0)'],
        hint: 'Coupe l’automatique et laisse l’histogramme se remplir quelques secondes.',
        explain: 'L’asymétrie de la somme de n exponentielles vaut 2/√n : environ 0,37 pour n = 30.',
      },
    ],
  },
  buffon: {
    lesson: {
      objective: 'Estimer π en lançant des aiguilles sur un parquet.',
      notions: [
        'Des lattes de largeur d, une aiguille de longueur ℓ ≤ d lancée au hasard.',
        'Elle croise une ligne avec la probabilité 2ℓ/(πd).',
        'Donc π ≈ 2ℓN/(dC) après N lancers et C croisements.',
        'L’erreur décroît comme 1/√N : très lentement.',
      ],
      observe: [
        'Augmente AIGUILLES / IMAGE.',
        'Suis π ≈ 2ℓN / dC et son ERREUR.',
        'Change LONGUEUR ℓ / d puis RELANCER.',
      ],
      formula: 'P(\\text{croisement})=\\frac{2\\ell}{\\pi d}\\ \\Rightarrow\\ \\pi\\approx\\frac{2\\ell N}{dC}',
      fact: 'Le comte de Buffon a posé le problème en 1733 : c’est l’une des premières questions de probabilité géométrique.',
    },
    exercises: [
      { kind: 'qcm', q: 'Avec ℓ = d, la probabilité de croiser une ligne vaut…', choices: ['1/2', '1/π', '2/π', 'π/4'], answer: 2, hint: '2ℓ/(πd).', explain: '2/π ≈ 0,637.' },
      { kind: 'num', q: 'Avec ℓ = d, 1 000 lancers et 637 croisements, quelle estimation de π ?', answer: 2000 / 637, tol: 0.002, hint: '2N/C.', explain: '2000/637 ≈ 3,1397.' },
      {
        kind: 'task',
        q: 'Obtiens une erreur inférieure à 0,01 avec plus de 1 000 lancers.',
        check: (a) => a.num('ERREUR') < 0.01 && a.num('LANCERS N') > 1000,
        uses: ['ERREUR', 'LANCERS N'],
        hint: 'Monte AIGUILLES / IMAGE et patiente quelques secondes.',
        explain: 'Pour gagner un chiffre de précision, il faut 100 fois plus de lancers.',
      },
    ],
  },
};
