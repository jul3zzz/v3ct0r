import type { Study } from '../../core/study';

export const study: Record<string, Study> = {
  pi: {
    lesson: {
      objective: 'Encadrer π comme Archimède, puis l’estimer au hasard.',
      notions: [
        'π est le rapport entre le périmètre d’un cercle et son diamètre.',
        'Archimède encadre le cercle entre deux polygones à 6·2ᵏ côtés.',
        'Monte-Carlo : la proportion de points tombés dans le disque vaut π/4.',
        'π est transcendant (Lindemann, 1882) : il n’est racine d’aucun polynôme à coefficients entiers.',
      ],
      observe: [
        'Coupe le DOUBLEMENT AUTOMATIQUE et règle CÔTÉS 6·2ᵏ.',
        'Lis BORNE INF. et BORNE SUP.',
        'Passe en MONTE-CARLO et regarde l’estimation se stabiliser.',
      ],
      formula: 'n\\sin\\frac\\pi n<\\pi<n\\tan\\frac\\pi n',
      fact: 'Quarante décimales de π suffisent pour calculer le périmètre de l’univers observable à la taille d’un atome près.',
    },
    exercises: [
      { kind: 'qcm', q: 'Avec un hexagone inscrit dans un cercle de rayon 1, Archimède obtient la borne inférieure…', choices: ['2', '3', '3,14', '2√3'], answer: 1, hint: 'Le côté de l’hexagone inscrit est égal au rayon.', explain: 'Demi-périmètre de l’hexagone inscrit : 6 × 1 / 2 = 3.' },
      { kind: 'num', q: 'Monte-Carlo : 7 854 points sur 10 000 tombent dans le disque. Estimation de π ?', answer: 3.1416, tol: 0.0005, hint: 'π ≈ 4 × proportion.', explain: '4 × 0,7854 = 3,1416.' },
      {
        kind: 'task',
        q: 'Méthode ARCHIMÈDE à 96 côtés, doublement automatique coupé.',
        check: (a) => a.pressed('ARCHIMÈDE') && a.get('DOUBLEMENT AUTOMATIQUE') === false && Number(a.get('CÔTÉS 6·2ᵏ')) === 4,
        uses: ['ARCHIMÈDE', 'DOUBLEMENT AUTOMATIQUE', 'CÔTÉS 6·2ᵏ'],
        hint: '96 = 6 × 2⁴ : règle k = 4.',
        explain: '3,1410 < π < 3,1427 : c’est l’encadrement d’Archimède, 223/71 < π < 22/7.',
      },
    ],
  },
  phi: {
    lesson: {
      objective: 'Découvrir le nombre d’or, sa spirale et son lien avec la suite de Fibonacci.',
      notions: [
        'φ = (1 + √5)/2 ≈ 1,618 est la solution positive de x² = x + 1.',
        'Les quotients Fₙ₊₁/Fₙ convergent vers φ en oscillant.',
        'Sa fraction continue [1; 1, 1, 1, …] en fait le nombre le plus « irrationnel ».',
        'Un rectangle d’or privé d’un carré redonne un rectangle d’or.',
      ],
      observe: [
        'Coupe la CONSTRUCTION AUTOMATIQUE et règle CARRÉS.',
        'Passe en Fₙ₊₁ / Fₙ : observe l’oscillation autour de φ.',
        'Lis 1/φ = φ − 1.',
      ],
      formula: '\\varphi=\\frac{1+\\sqrt5}{2},\\qquad \\varphi^2=\\varphi+1,\\qquad \\frac{F_{n+1}}{F_n}\\to\\varphi',
      fact: 'Les têtes de tournesol portent souvent 34 et 55 spirales : deux nombres de Fibonacci consécutifs.',
    },
    exercises: [
      { kind: 'qcm', q: 'Que vaut 1/φ ?', choices: ['φ + 1', 'φ − 1', '2φ', 'φ²'], answer: 1, hint: 'Divise φ² = φ + 1 par φ.', explain: 'φ = 1 + 1/φ, donc 1/φ = φ − 1 ≈ 0,618.' },
      { kind: 'num', q: 'Calcule F₁₀/F₉ (avec F₁ = F₂ = 1).', answer: 55 / 34, tol: 0.0005, hint: '1, 1, 2, 3, 5, 8, 13, 21, 34, 55.', explain: '55/34 ≈ 1,6176.' },
      {
        kind: 'task',
        q: 'Vue Fₙ₊₁ / Fₙ, construction coupée, avec au moins 12 carrés.',
        check: (a) => a.pressed('Fₙ₊₁ / Fₙ') && a.get('CONSTRUCTION AUTOMATIQUE') === false && Number(a.get('CARRÉS')) >= 12,
        uses: ['Fₙ₊₁ / Fₙ', 'CONSTRUCTION AUTOMATIQUE', 'CARRÉS'],
        hint: 'Choisis la vue, coupe l’automatique, puis règle CARRÉS.',
        explain: 'À n = 12, 144/89 ≈ 1,61798 : déjà 4 décimales exactes de φ.',
      },
    ],
  },
  sqrt2: {
    lesson: {
      objective: 'Prouver que √2 est irrationnel, puis le calculer très vite par la méthode de Héron.',
      notions: [
        '√2 est la longueur de la diagonale du carré unité (Pythagore).',
        'Si √2 = p/q, alors (2q − p)/(p − q) aussi, avec des entiers plus petits : descente infinie.',
        'Héron : xₙ₊₁ = (xₙ + 2/xₙ)/2 double le nombre de décimales exactes à chaque pas.',
        'Les fractions de Pell p/q vérifient p² − 2q² = ±1.',
      ],
      observe: [
        'IRRATIONALITÉ : suis la preuve en 6 étapes.',
        'HÉRON : compte les décimales exactes à chaque itération.',
        'Lis PELL 577/408.',
      ],
      formula: '\\frac pq=\\sqrt2\\Rightarrow\\frac{2q-p}{p-q}=\\sqrt2,\\qquad x_{n+1}=\\frac12\\Big(x_n+\\frac2{x_n}\\Big)',
      fact: 'Selon la légende, le pythagoricien Hippase de Métaponte aurait péri en mer pour avoir divulgué l’irrationalité de √2.',
    },
    exercises: [
      { kind: 'qcm', q: 'Que donne un pas de Héron depuis x₀ = 1 ?', choices: ['1,4', '1,5', '2', '1,41'], answer: 1, hint: '(1 + 2/1)/2.', explain: '(1 + 2)/2 = 3/2 = 1,5.' },
      { kind: 'num', q: 'Pour la fraction de Pell 17/12, que vaut p² − 2q² ?', answer: 1, tol: 0.01, hint: '17² = 289 et 2 × 12² = 288.', explain: '289 − 288 = 1.' },
      { kind: 'qcm', q: 'La descente de Tennenbaum transforme p/q = 7/5 en…', choices: ['3/2', '5/3', '2/1', '4/3'], answer: 0, hint: '(2q − p)/(p − q).', explain: '(10 − 7)/(7 − 5) = 3/2 : on redescend la suite de Pell.' },
    ],
  },
  e: {
    lesson: {
      objective: 'Obtenir e par les intérêts composés, puis par la série Σ 1/k!.',
      notions: [
        '(1 + 1/n)ⁿ croît vers e ≈ 2,71828 quand on compose de plus en plus souvent.',
        'L’erreur de (1 + 1/n)ⁿ vaut environ e/(2n) : convergence lente.',
        'La série Σ 1/k! converge extrêmement vite.',
        'e est transcendant (Hermite, 1873).',
      ],
      observe: [
        'Coupe la PROGRESSION AUTOMATIQUE et règle FRÉQUENCE.',
        'Passe en SÉRIE Σ 1/k! et règle TERMES DE LA SÉRIE.',
        'Compare le nombre de décimales exactes des deux méthodes.',
      ],
      formula: 'e=\\lim_{n\\to\\infty}\\Big(1+\\frac1n\\Big)^n=\\sum_{k\\ge0}\\frac1{k!}',
      fact: 'Jacques Bernoulli a rencontré e en 1683 en étudiant justement les intérêts composés.',
    },
    exercises: [
      { kind: 'qcm', q: 'Capital au bout d’un an pour 1 € à 100 %, composé deux fois (50 % puis 50 %) ?', choices: ['2 €', '2,25 €', '2,5 €', 'e €'], answer: 1, hint: '(1 + 1/2)².', explain: '1,5² = 2,25.' },
      { kind: 'num', q: 'Somme des 5 premiers termes : 1 + 1 + 1/2 + 1/6 + 1/24 ?', answer: 65 / 24, tol: 0.001, hint: 'Réduis au dénominateur 24.', explain: '65/24 ≈ 2,7083.' },
      {
        kind: 'task',
        q: 'Série Σ 1/k! avec au moins 10 termes, progression automatique coupée.',
        check: (a) => a.pressed('SÉRIE Σ 1/k!') && a.get('PROGRESSION AUTOMATIQUE') === false && Number(a.get('TERMES DE LA SÉRIE')) >= 10,
        uses: ['SÉRIE Σ 1/k!', 'PROGRESSION AUTOMATIQUE', 'TERMES DE LA SÉRIE'],
        hint: 'Choisis la vue SÉRIE puis règle le curseur TERMES.',
        explain: 'Avec 10 termes, on a déjà 6 décimales exactes de e.',
      },
    ],
  },
  i: {
    lesson: {
      objective: 'Comprendre i comme un quart de tour dans le plan complexe.',
      notions: [
        'i² = −1 : deux quarts de tour font un demi-tour.',
        'Multiplier par i : (a + bi)·i = −b + ai.',
        'Les puissances de i forment un cycle de longueur 4 : 1, i, −1, −i.',
        '|i| = 1 et arg(i) = π/2.',
      ],
      observe: [
        'Règle PARTIE RÉELLE a et PARTIE IMAGINAIRE b.',
        'Regarde le « F » tourner de 90° à chaque multiplication.',
        'Lis z et i · z dans le panneau.',
      ],
      formula: 'i^2=-1,\\qquad i\\,(a+bi)=-b+ai',
      fact: 'Les nombres imaginaires sont apparus au XVIᵉ siècle (Cardan, Bombelli) pour résoudre des équations du 3ᵉ degré… dont les solutions étaient réelles.',
    },
    exercises: [
      { kind: 'qcm', q: 'Que vaut i¹⁰ ?', choices: ['1', 'i', '−1', '−i'], answer: 2, hint: '10 = 4 × 2 + 2.', explain: 'i¹⁰ = i² = −1.' },
      { kind: 'num', q: 'Partie réelle de i · (3 + 4i) ?', answer: -4, tol: 0.001, hint: 'i(a + bi) = −b + ai.', explain: 'i(3 + 4i) = −4 + 3i.' },
      {
        kind: 'task',
        q: 'Règle z = i, c’est-à-dire a = 0 et b = 1.',
        check: (a) => Math.abs(Number(a.get('PARTIE RÉELLE a'))) < 0.01 && Math.abs(Number(a.get('PARTIE IMAGINAIRE b')) - 1) < 0.01,
        uses: ['PARTIE RÉELLE a', 'PARTIE IMAGINAIRE b'],
        hint: 'Deux curseurs dans la section NOMBRE z = a + bi.',
        explain: 'z = i, donc i · z = i² = −1 : le vecteur pointe vers la gauche.',
      },
    ],
  },
  gamma: {
    lesson: {
      objective: 'Voir la constante γ comme l’aire des petits morceaux compris entre l’escalier 1/k et la courbe 1/x.',
      notions: [
        'Hₙ = 1 + 1/2 + … + 1/n diverge, à peu près comme ln n.',
        'Hₙ − ln n converge vers γ ≈ 0,5772.',
        'Glissés dans le carré unité, les morceaux en remplissent environ 57,7 %.',
        'On ignore toujours si γ est rationnel.',
      ],
      observe: [
        'Règle MORCEAUX n.',
        'Regarde les morceaux glisser vers le carré unité.',
        'Lis Hₙ − ln(n+1) dans le panneau.',
      ],
      formula: '\\gamma=\\lim_{n\\to\\infty}\\Big(\\sum_{k=1}^n\\frac1k-\\ln n\\Big)',
      fact: 'Euler a calculé γ avec 16 décimales en 1781 ; Mascheroni en a publié 32 en 1790… dont plusieurs fausses.',
    },
    exercises: [
      { kind: 'qcm', q: 'La série harmonique Σ 1/k…', choices: ['converge vers γ', 'converge vers 1', 'diverge', 'converge vers ln 2'], answer: 2, hint: 'Hₙ ≈ ln n + γ.', explain: 'Elle diverge, comme ln n, très lentement.' },
      { kind: 'num', q: 'Calcule H₄ = 1 + 1/2 + 1/3 + 1/4.', answer: 25 / 12, tol: 0.001, hint: 'Dénominateur commun : 12.', explain: '25/12 ≈ 2,0833.' },
      {
        kind: 'task',
        q: 'Règle au moins 30 morceaux.',
        check: (a) => Number(a.get('MORCEAUX n')) >= 30,
        uses: ['MORCEAUX n'],
        hint: 'Le curseur MORCEAUX n est dans la section CONSTRUCTION.',
        explain: 'Avec 30 morceaux, Hₙ − ln(n+1) ≈ 0,561 : on approche γ par en dessous.',
      },
    ],
  },
  zeta3: {
    lesson: {
      objective: 'Découvrir ζ(3) = Σ 1/n³ et sa lecture en probabilités.',
      notions: [
        'ζ(3) ≈ 1,2020569 ; aucune formule fermée n’est connue.',
        'Roger Apéry a prouvé son irrationalité en 1978.',
        'Trois entiers pris au hasard sont premiers entre eux avec la probabilité 1/ζ(3) ≈ 83 %.',
        'Pour deux entiers, la probabilité vaut 1/ζ(2) = 6/π² ≈ 61 %.',
      ],
      observe: [
        'Regarde la colonne Σ 1/n³ s’empiler.',
        'Suis le pourcentage de triplets premiers entre eux.',
        'Compare-le à 1/ζ(3).',
      ],
      formula: '\\zeta(3)=\\sum_{n\\ge1}\\frac1{n^3},\\qquad P(\\mathrm{pgcd}(a,b,c)=1)=\\frac1{\\zeta(3)}',
      fact: 'On sait qu’au moins un des nombres ζ(5), ζ(7), ζ(9), ζ(11) est irrationnel (Zudilin, 2001), sans savoir lequel.',
    },
    exercises: [
      { kind: 'qcm', q: 'Les nombres 6, 10 et 15 sont-ils premiers entre eux (pgcd des trois) ?', choices: ['oui', 'non, pgcd = 2', 'non, pgcd = 5', 'non, pgcd = 3'], answer: 0, hint: 'Cherche un diviseur commun aux trois à la fois.', explain: 'pgcd(6, 10, 15) = 1, même si chaque paire a un facteur commun.' },
      { kind: 'num', q: 'Somme des trois premiers termes 1 + 1/8 + 1/27, à 0,001 près ?', answer: 1 + 1 / 8 + 1 / 27, tol: 0.001, hint: '1/8 = 0,125 et 1/27 ≈ 0,037.', explain: '≈ 1,162.' },
      { kind: 'qcm', q: 'Que vaut ζ(2) = Σ 1/n² ?', choices: ['π/2', 'π²/6', 'e', '1,2020…'], answer: 1, hint: 'C’est le problème de Bâle, résolu par Euler en 1734.', explain: 'ζ(2) = π²/6 ≈ 1,645.' },
    ],
  },
  ln2: {
    lesson: {
      objective: 'Calculer ln 2 comme une aire et comme une série, et comparer leurs vitesses.',
      notions: [
        'ln 2 = ∫₁² dx/x : l’aire sous l’hyperbole entre 1 et 2.',
        'La série alternée 1 − 1/2 + 1/3 − … converge lentement, en zigzag.',
        'La série Σ 1/(k·2ᵏ) gagne environ un chiffre binaire par terme.',
        'Règle de 70 : un capital placé à r % double en environ 70/r ans.',
      ],
      observe: [
        'Suis le zigzag de la série alternée autour de ln 2.',
        'Compare l’erreur des deux séries dans le panneau.',
        'Lis la règle de 70.',
      ],
      formula: '\\ln 2=\\int_1^2\\frac{dx}x=\\sum_{k\\ge1}\\frac{(-1)^{k+1}}k=\\sum_{k\\ge1}\\frac1{k\\,2^k}',
      fact: 'En réordonnant les termes de la série alternée, on peut la faire converger vers n’importe quel nombre (théorème de Riemann).',
    },
    exercises: [
      { kind: 'qcm', q: 'Une substance a une demi-vie de 10 ans. Quelle fraction reste-t-il après 30 ans ?', choices: ['1/3', '1/6', '1/8', '1/9'], answer: 2, hint: 'Trois demi-vies.', explain: '(1/2)³ = 1/8.' },
      { kind: 'num', q: 'En combien d’années environ un capital double-t-il à 7 % par an (règle de 70) ?', answer: 10, tol: 0.6, hint: '70 / r.', explain: '70/7 = 10 ans (calcul exact : ln 2 / ln 1,07 ≈ 10,2).' },
      { kind: 'num', q: 'Somme alternée des 4 premiers termes : 1 − 1/2 + 1/3 − 1/4 ?', answer: 7 / 12, tol: 0.001, hint: 'Dénominateur commun : 12.', explain: '7/12 ≈ 0,583, encore loin de ln 2 ≈ 0,693.' },
    ],
  },
  compare: {
    lesson: {
      objective: 'Comparer les constantes : développements décimaux, fractions continues et vitesse de convergence.',
      notions: [
        'Fraction continue : x = a₀ + 1/(a₁ + 1/(a₂ + …)), notée [a₀; a₁, a₂, …].',
        'Un nombre est rationnel si et seulement si sa fraction continue est finie.',
        'Un irrationnel quadratique (φ, √2) a une fraction continue périodique.',
        'La vitesse de convergence d’une série se lit comme une pente sur un graphe logarithmique.',
      ],
      observe: [
        'Décoche des constantes pour alléger la vue.',
        'Accélère DÉCIMALES / SECONDE.',
        'Compare les pentes du graphe de convergence.',
      ],
      formula: 'x=a_0+\\cfrac1{a_1+\\cfrac1{a_2+\\cdots}}=[a_0;a_1,a_2,\\ldots]',
      fact: '355/113, tiré de la fraction continue de π, donne 6 décimales exactes : Zu Chongzhi le connaissait au Vᵉ siècle.',
    },
    exercises: [
      { kind: 'qcm', q: 'Laquelle a une fraction continue périodique ?', choices: ['π', 'e', '√2', 'γ'], answer: 2, hint: 'Pense aux irrationnels quadratiques.', explain: '√2 = [1; 2, 2, 2, …].' },
      { kind: 'num', q: 'Que vaut la fraction continue [1; 2] ?', answer: 1.5, tol: 0.001, hint: '1 + 1/2.', explain: '3/2.' },
      { kind: 'qcm', q: 'Sur le graphe de convergence, la série la plus rapide est…', choices: ['Leibniz pour π', 'Σ 1/k! pour e', 'Hₙ − ln n pour γ', 'la série alternée pour ln 2'], answer: 1, hint: 'La factorielle grandit plus vite que toute puissance.', explain: 'Σ 1/k! gagne de plus en plus de décimales à chaque terme.' },
    ],
  },
  walk: {
    lesson: {
      objective: 'Transformer les décimales d’une constante en marche aléatoire pour tester leur « hasard ».',
      notions: [
        'Chaque chiffre d ∈ {0, …, 9} donne un pas dans la direction d × 36°.',
        'Une vraie marche aléatoire s’éloigne en moyenne comme √N.',
        'Le test du χ² compare la fréquence de chaque chiffre à 1/10.',
        'On conjecture que π est « normal », sans l’avoir démontré.',
      ],
      observe: [
        'Compare la marche de π à un vrai hasard (en gris).',
        'Change de constante.',
        'Lis χ² et DISTANCE / √N.',
      ],
      formula: '\\chi^2=\\sum_{d=0}^9\\frac{(N_d-N/10)^2}{N/10}',
      fact: 'Le nombre de Champernowne 0,123456789101112… est prouvé normal en base 10 ; pour π, e ou √2, c’est toujours une conjecture.',
    },
    exercises: [
      { kind: 'qcm', q: 'Après N pas aléatoires de longueur 1, la distance typique au point de départ vaut…', choices: ['N', 'N/2', '√N', 'ln N'], answer: 2, hint: 'La variance de la position croît comme N.', explain: 'Distance typique ≈ √N.' },
      { kind: 'num', q: 'Dans 10 000 chiffres parfaitement équilibrés, combien de 7 attend-on ?', answer: 1000, tol: 0.5, hint: 'N/10.', explain: '1 000.' },
      { kind: 'qcm', q: 'Avec 9 degrés de liberté, un χ² « normal » vaut en moyenne…', choices: ['0', '1', '9', '100'], answer: 2, hint: 'L’espérance d’un χ² égale son nombre de degrés de liberté.', explain: 'En moyenne 9 : une valeur bien plus grande signalerait un déséquilibre.' },
    ],
  },
  euler: {
    lesson: {
      objective: 'Comprendre e^{iπ} + 1 = 0 comme un demi-tour sur le cercle unité.',
      notions: [
        'Formule d’Euler : e^{iθ} = cos θ + i sin θ.',
        'Multiplier par e^{iθ} revient à tourner d’un angle θ.',
        'θ = π : un demi-tour, qui envoie 1 sur −1.',
        '(1 + iπ/n)ⁿ tend vers −1 : n petits pas presque tangents au cercle.',
      ],
      observe: [
        'Coupe l’ANIMATION et règle ANGLE θ.',
        'Passe en (1 + iπ/n)ⁿ et augmente PAS n.',
        'Lis le POINT atteint.',
      ],
      formula: 'e^{i\\theta}=\\cos\\theta+i\\sin\\theta\\ \\Rightarrow\\ e^{i\\pi}+1=0',
      fact: 'À 14 ans, Richard Feynman l’a notée dans son carnet comme « la formule la plus remarquable des mathématiques ».',
    },
    exercises: [
      { kind: 'qcm', q: 'Que vaut e^{iπ/2} ?', choices: ['1', 'i', '−1', '−i'], answer: 1, hint: 'C’est un quart de tour.', explain: 'cos(π/2) + i sin(π/2) = i.' },
      { kind: 'num', q: 'Partie réelle de e^{iπ/3} ?', answer: 0.5, tol: 0.001, hint: 'cos(π/3).', explain: 'cos(π/3) = 1/2.' },
      {
        kind: 'task',
        q: 'Animation coupée : place θ = π (à 0,01 près) pour atteindre −1.',
        check: (a) => a.get('ANIMATION') === false && Math.abs(Number(a.get('ANGLE θ')) - Math.PI) < 0.01,
        uses: ['ANIMATION', 'ANGLE θ'],
        hint: 'Le curseur ANGLE θ est gradué en multiples de π : vise 1,000 π (clique le curseur puis affine avec les flèches ← →).',
        explain: 'e^{iπ} = −1 : on a fait exactement un demi-tour.',
      },
    ],
  },
};
