import type { Study } from '../../core/study';

const norm = (v: unknown) => String(v ?? '').replace(/\s/g, '').replace(/²/g, '^2');

export const study: Record<string, Study> = {
  limits: {
    lesson: {
      objective: 'Comprendre la définition ε–δ de la limite : rendre « aussi proche que l’on veut » parfaitement précis.',
      notions: [
        'lim f(x) = L quand x → a : pour tout ε > 0, il existe δ > 0 tel que |x − a| < δ ⇒ |f(x) − L| < ε.',
        'f n’a pas besoin d’être définie en a : seul le voisinage compte.',
        'Si les limites à gauche et à droite diffèrent, la limite n’existe pas.',
        'f est continue en a si et seulement si lim f(x) = f(a).',
      ],
      observe: [
        'Fais décroître ε (MARGE VERTICALE) : δ doit rétrécir pour suivre.',
        'Essaie x sin(1/x) en a = 0 : la fonction oscille, mais la limite existe.',
        'Essaie abs(x)/x : à gauche −1, à droite +1.',
      ],
      formula: '\\forall\\varepsilon>0,\\ \\exists\\delta>0,\\ 0<|x-a|<\\delta\\Rightarrow|f(x)-L|<\\varepsilon',
      fact: 'Cauchy utilisait déjà ces idées vers 1821, mais c’est Weierstrass qui a fixé l’écriture ε–δ vers 1860.',
    },
    exercises: [
      { kind: 'qcm', q: 'Quelle est la limite de (eˣ − 1)/x quand x → 0 ?', choices: ['0', '1', 'e', 'elle n’existe pas'], answer: 1, hint: 'C’est la dérivée de eˣ en 0.', explain: '(eˣ − 1)/x → (exp)′(0) = 1.' },
      { kind: 'num', q: 'Limite de (x² − 1)/(x − 1) quand x → 1 ?', answer: 2, tol: 0.001, hint: 'Factorise x² − 1.', explain: '(x − 1)(x + 1)/(x − 1) = x + 1 → 2.' },
      {
        kind: 'task',
        q: 'Trouve une fonction et un point où la limite n’existe pas (LIMITE L = ∄).',
        check: (a) => a.text('LIMITE L') === '∄',
        uses: ['LIMITE L', 'f(x) =', 'POINT a'],
        hint: 'Un préréglage du champ f(x) a deux limites latérales différentes en 0.',
        explain: 'abs(x)/x vaut −1 à gauche et +1 à droite de 0 : aucun L ne convient pour ε < 1.',
      },
    ],
  },
  derivative: {
    lesson: {
      objective: 'Voir la dérivée comme la limite de la pente d’une sécante qui devient tangente.',
      notions: [
        'Pente de la sécante : (f(x + h) − f(x))/h.',
        'Quand h → 0, elle tend vers f′(x), la pente de la tangente.',
        'abs(x) n’est pas dérivable en 0 : pente −1 à gauche, +1 à droite.',
        'Tracée au fil de x, la pente dessine la courbe de f′.',
      ],
      observe: [
        'Réduis l’ÉCART h : la sécante se colle à la tangente.',
        'Fais glisser POINT x et regarde la COURBE DE f′.',
        'Essaie abs(x) en x = 0.',
      ],
      formula: "f'(x)=\\lim_{h\\to0}\\frac{f(x+h)-f(x)}{h}",
      fact: 'Newton et Leibniz ont inventé le calcul différentiel indépendamment vers 1670 ; on utilise encore la notation dy/dx de Leibniz.',
    },
    exercises: [
      { kind: 'qcm', q: 'Pour f(x) = |x| en 0, les pentes des sécantes à gauche et à droite valent…', choices: ['0 et 0', '−1 et +1', '+∞', '1 et 1'], answer: 1, hint: '|h|/h selon le signe de h.', explain: '−1 à gauche, +1 à droite : pas de dérivée en 0.' },
      { kind: 'num', q: 'Dérivée de x³ en x = √2 ?', answer: 6, tol: 0.01, hint: '(x³)′ = 3x².', explain: '3 × (√2)² = 6.' },
      {
        kind: 'task',
        q: 'Avec f(x) = x², animation coupée, place le point où la tangente a une pente de 2.',
        check: (a) => norm(a.get('f(x) =')) === 'x^2' && a.get('ANIMATION (h → 0 PUIS x GLISSE)') === false && Math.abs(a.num('f′(x) EXACTE') - 2) < 0.02,
        uses: ['f(x) =', 'ANIMATION (h → 0 PUIS x GLISSE)', 'f′(x) EXACTE', 'POINT x'],
        hint: 'Tape x^2 dans le champ f(x), puis cherche x tel que 2x = 2 (flèches ← → pour affiner).',
        explain: 'f′(x) = 2x = 2 en x = 1.',
      },
    ],
  },
  taylor: {
    lesson: {
      objective: 'Approcher une fonction par des polynômes et découvrir le rayon de convergence.',
      notions: [
        'Le polynôme de Taylor d’ordre n reproduit f et ses n premières dérivées en a.',
        'Pour sin, cos ou exp, il converge sur toute la droite réelle.',
        'Ailleurs, il ne converge que dans un disque de rayon R.',
        'R est la distance de a à la singularité complexe la plus proche, même invisible sur ℝ.',
      ],
      observe: [
        'Coupe l’AJOUT AUTOMATIQUE et monte ORDRE n.',
        'Choisis 1/(1+25x^2) : la courbe est lisse, et pourtant ça diverge.',
        'Déplace le CENTRE a et lis le RAYON DE CONVERGENCE.',
      ],
      formula: 'f(x)=\\sum_{k\\ge0}\\frac{f^{(k)}(a)}{k!}(x-a)^k,\\qquad R=\\frac1{\\limsup|c_k|^{1/k}}',
      fact: 'Brook Taylor a publié sa formule en 1715 ; Colin Maclaurin l’a rendue célèbre dans le cas a = 0.',
    },
    exercises: [
      { kind: 'qcm', q: 'Terme d’ordre 3 du développement de sin x en 0 ?', choices: ['x³/3', '−x³/6', 'x³/6', '−x³/3'], answer: 1, hint: 'sin x = x − x³/3! + …', explain: '−x³/3! = −x³/6.' },
      { kind: 'num', q: 'Valeur en x = 2 du polynôme de Taylor d’ordre 2 de eˣ en 0 ?', answer: 5, tol: 0.001, hint: '1 + x + x²/2.', explain: '1 + 2 + 2 = 5 (pour e² ≈ 7,39 : l’ordre 2 est encore loin).' },
      {
        kind: 'task',
        q: 'Fonction de Runge 1/(1+25x^2) centrée en 0, ajout automatique coupé, ordre ≥ 20 : vérifie que R ≈ 0,2.',
        check: (a) => String(a.get('f(x) =') ?? '').includes('25') && a.get('AJOUT AUTOMATIQUE DES TERMES') === false && Number(a.get('ORDRE n')) >= 20 && Math.abs(a.num('RAYON DE CONVERGENCE ≈') - 0.2) < 0.03,
        uses: ['f(x) =', 'AJOUT AUTOMATIQUE DES TERMES', 'ORDRE n', 'RAYON DE CONVERGENCE ≈', 'CENTRE a'],
        hint: 'Le préréglage est dans la liste du champ f(x) ; garde le CENTRE a à 0.',
        explain: 'Les pôles ±i/5 sont à distance 0,2 de l’origine : au-delà, le polynôme explose.',
      },
    ],
  },
  fourier: {
    lesson: {
      objective: 'Redessiner n’importe quelle courbe fermée avec des cercles qui tournent : les épicycles de Fourier.',
      notions: [
        'Une courbe fermée z(t) se décompose en Σ cₖ e^{2iπkt}.',
        'Chaque terme est un cercle de rayon |cₖ| qui tourne k fois par tour.',
        'Les grands cercles donnent la forme, les petits les détails.',
        'L’énergie Σ|cₖ|² mesure la part de la courbe déjà captée.',
      ],
      observe: [
        'Réduis le NOMBRE DE CERCLES : la forme s’arrondit.',
        'Le CARRÉ a besoin de beaucoup de cercles pour ses coins.',
        'Dessine ta propre courbe avec ✎ DESSIN LIBRE.',
      ],
      formula: 'z(t)=\\sum_{k}c_k\\,e^{2i\\pi kt},\\qquad c_k=\\int_0^1z(t)\\,e^{-2i\\pi kt}\\,dt',
      fact: 'Joseph Fourier a présenté sa théorie en 1807 pour étudier la propagation de la chaleur ; elle sert aujourd’hui à compresser le son (MP3) et les images (JPEG).',
    },
    exercises: [
      { kind: 'qcm', q: 'Combien de cercles faut-il pour tracer exactement un carré ?', choices: ['4', '8', '100', 'une infinité'], answer: 3, hint: 'Les coins sont des cassures.', explain: 'Un nombre fini de cercles donne une courbe lisse : il en faut une infinité pour les coins.' },
      { kind: 'num', q: 'Un cercle de fréquence k fait k tours pendant que le dessin en fait un. Pour qu’il fasse 3 tours, k = ?', answer: 3, tol: 0.001, hint: 'Lis la définition.', explain: 'k = 3 (k = −3 tournerait dans l’autre sens).' },
      {
        kind: 'task',
        q: 'TRÈFLE avec 3 cercles au plus, et plus de 99 % de l’énergie captée.',
        check: (a) => a.pressed('TRÈFLE') && Number(a.get('NOMBRE DE CERCLES')) <= 3 && a.num('ÉNERGIE CAPTÉE') > 99,
        uses: ['TRÈFLE', 'NOMBRE DE CERCLES', 'ÉNERGIE CAPTÉE'],
        hint: 'Le trèfle est une courbe très simple : baisse le nombre de cercles.',
        explain: 'Le trèfle est presque exactement la somme de 2 ou 3 rotations : quelques cercles suffisent.',
      },
    ],
  },
  complex: {
    lesson: {
      objective: 'Voir une fonction complexe comme une déformation du plan.',
      notions: [
        'f : ℂ → ℂ envoie chaque point z sur f(z).',
        'Une fonction dérivable au sens complexe (holomorphe) conserve les angles : la grille reste à angles droits.',
        'z² double les angles et élève les modules au carré.',
        'exp transforme les droites verticales en cercles.',
      ],
      observe: [
        'Fais varier INTERPOLATION t de l’identité vers f.',
        'Passe en LIGNES DE NIVEAU.',
        'Tape ta propre fonction de z.',
      ],
      formula: 'f(z)=u(x,y)+i\\,v(x,y),\\qquad u_x=v_y,\\ u_y=-v_x',
      fact: 'Riemann (1851) a montré que toute région simplement connexe du plan, sauf le plan entier, peut être envoyée sur le disque en conservant les angles.',
    },
    exercises: [
      { kind: 'qcm', q: 'Que fait z ↦ z² à l’argument (l’angle) d’un nombre ?', choices: ['le conserve', 'le double', 'le divise par 2', 'l’annule'], answer: 1, hint: '(re^{iθ})² = r²e^{2iθ}.', explain: 'Les angles sont doublés, les modules élevés au carré.' },
      { kind: 'num', q: 'Module de (1 + i)² ?', answer: 2, tol: 0.001, hint: '|z²| = |z|².', explain: '|1 + i|² = (√2)² = 2.' },
      {
        kind: 'task',
        q: 'Affiche exp(z) en LIGNES DE NIVEAU.',
        check: (a) => norm(a.get('f(z) =')) === 'exp(z)' && a.pressed('LIGNES DE NIVEAU'),
        uses: ['f(z) =', 'LIGNES DE NIVEAU'],
        hint: 'exp(z) est dans la liste du champ f(z) ; le rendu est dans la section RENDU.',
        explain: 'exp(x + iy) = eˣ e^{iy} : le module ne dépend que de x, l’argument que de y.',
      },
    ],
  },
  primes: {
    lesson: {
      objective: 'Observer la répartition des nombres premiers sur la spirale d’Ulam et la comparer à N / ln N.',
      notions: [
        'Un nombre premier n’a que deux diviseurs : 1 et lui-même.',
        'Il y en a une infinité (Euclide).',
        'Le théorème des nombres premiers : π(N) ~ N / ln N.',
        'Sur la spirale d’Ulam, ils s’alignent sur des diagonales, liées à des polynômes comme n² + n + 41.',
      ],
      observe: [
        'Dézoome jusqu’à LOIN : les diagonales apparaissent.',
        'Compare π(N) et N / ln N.',
        'Zoome au plus près pour lire les NUMÉROS.',
      ],
      formula: '\\pi(N)\\sim\\frac{N}{\\ln N}',
      fact: 'Stanisław Ulam a découvert sa spirale en 1963 en griffonnant pendant une conférence ennuyeuse.',
    },
    exercises: [
      { kind: 'qcm', q: 'Combien y a-t-il de nombres premiers inférieurs à 30 ?', choices: ['8', '9', '10', '11'], answer: 2, hint: '2, 3, 5, 7, 11, 13, …', explain: '2, 3, 5, 7, 11, 13, 17, 19, 23, 29 : 10.' },
      { kind: 'num', q: 'Estime π(1000) avec N / ln N (à l’unité près).', answer: 1000 / Math.log(1000), tol: 5, hint: 'ln 1000 ≈ 6,91.', explain: '≈ 145 (la vraie valeur est 168).' },
      {
        kind: 'task',
        q: 'Dézoome pour afficher plus de 100 000 entiers.',
        check: (a) => a.num('ENTIERS VISIBLES ≤ N') > 100000,
        uses: ['ENTIERS VISIBLES ≤ N'],
        hint: 'Molette vers l’arrière, ou bouton LOIN.',
        explain: 'À cette échelle, les diagonales riches en premiers sautent aux yeux.',
      },
    ],
  },
  zeta: {
    lesson: {
      objective: 'Suivre ζ(s) le long de la droite critique et voir ses zéros.',
      notions: [
        'ζ(s) = Σ 1/nˢ pour Re(s) > 1, prolongée ensuite à tout le plan complexe.',
        'Hypothèse de Riemann : les zéros non triviaux ont tous une partie réelle 1/2.',
        'Sur la droite critique, la courbe ζ(1/2 + it) passe par l’origine à chaque zéro.',
        'Le premier zéro est à t ≈ 14,1347.',
      ],
      observe: [
        'Coupe le PARCOURS AUTOMATIQUE et fais varier HAUTEUR t.',
        'Écarte σ de 0,5 : la courbe évite l’origine.',
        'Repère les passages par 0.',
      ],
      formula: '\\zeta(s)=\\sum_{n\\ge1}\\frac1{n^s},\\qquad \\zeta\\big(\\tfrac12+it\\big)=0\\ \\Rightarrow\\ t\\approx14{,}1347,\\ 21{,}022,\\ldots',
      fact: 'L’hypothèse de Riemann (1859) est l’un des sept problèmes du millénaire : un million de dollars pour qui la démontre.',
    },
    exercises: [
      { kind: 'qcm', q: 'Que vaut ζ(2) ?', choices: ['π/2', 'π²/6', '2', 'e'], answer: 1, hint: 'Le problème de Bâle.', explain: 'Euler, 1734 : ζ(2) = π²/6.' },
      { kind: 'num', q: 'Hauteur t du premier zéro non trivial (à 0,01 près) ?', answer: 14.1347, tol: 0.01, hint: 'Lis-le dans la leçon ou trouve-le dans la vue.', explain: 't ≈ 14,1347.' },
      {
        kind: 'task',
        q: 'Sur la droite critique, parcours coupé, place-toi sur le premier zéro.',
        check: (a) => Math.abs(Number(a.get('σ (PARTIE RÉELLE)')) - 0.5) < 0.005 && a.get('PARCOURS AUTOMATIQUE') === false && Math.abs(Number(a.get('HAUTEUR t')) - 14.1347) < 0.08,
        uses: ['σ (PARTIE RÉELLE)', 'PARCOURS AUTOMATIQUE', 'HAUTEUR t'],
        hint: 'σ = 0,500, puis t ≈ 14,13 : clique le curseur et affine avec les flèches ← →.',
        explain: 'La courbe passe exactement par l’origine : ζ(1/2 + 14,1347 i) = 0.',
      },
    ],
  },
  cantor: {
    lesson: {
      objective: 'Comparer des infinis : dénombrable, indénombrable, et un ensemble de mesure nulle qui a autant de points que [0, 1].',
      notions: [
        'Deux ensembles ont le même cardinal s’il existe une bijection entre eux.',
        'ℕ, les entiers pairs et ℚ sont dénombrables.',
        'L’argument diagonal montre que ℝ ne l’est pas.',
        'L’ensemble de Cantor a une longueur nulle mais autant de points que [0, 1].',
      ],
      observe: [
        'DIAGONALE : regarde le nombre construit échapper à la liste.',
        'ℕ ↔ ℚ : suis le parcours en zigzag des fractions.',
        'ENSEMBLE DE CANTOR : compte ce qui reste de longueur.',
      ],
      formula: '|\\mathbb N|=|\\mathbb Q|=\\aleph_0<|\\mathbb R|=2^{\\aleph_0},\\qquad \\text{long}(C_n)=\\left(\\tfrac23\\right)^n',
      fact: 'Cantor a publié l’argument diagonal en 1891 ; ses idées sur l’infini ont été violemment combattues par Kronecker.',
    },
    exercises: [
      { kind: 'qcm', q: 'Quelle bijection relie ℕ aux entiers pairs ?', choices: ['n ↦ n + 2', 'n ↦ 2n', 'n ↦ n²', 'il n’y en a pas'], answer: 1, hint: 'Il faut atteindre chaque pair exactement une fois.', explain: 'n ↦ 2n : il y a « autant » de pairs que d’entiers.' },
      { kind: 'num', q: 'Longueur restante de l’ensemble de Cantor après 3 étapes ?', answer: 8 / 27, tol: 0.001, hint: '(2/3)ⁿ.', explain: '(2/3)³ = 8/27 ≈ 0,296.' },
      { kind: 'qcm', q: 'L’ensemble de Cantor a le même cardinal que…', choices: ['ℕ', 'un ensemble fini', '[0, 1]', 'ℚ'], answer: 2, hint: 'Ses points s’écrivent en base 3 avec seulement des 0 et des 2.', explain: 'Remplacer les 2 par des 1 donne tous les réels de [0, 1] en base 2.' },
    ],
  },
  linear: {
    lesson: {
      objective: 'Voir une matrice 2 × 2 comme une transformation du plan.',
      notions: [
        'Les colonnes de A sont les images des vecteurs de base e₁ et e₂.',
        'Le déterminant mesure le facteur d’aire (et d’orientation).',
        'Les vecteurs propres gardent leur direction : A v = λ v.',
        'det A = 0 : le plan s’écrase sur une droite ou un point.',
      ],
      observe: [
        'Fais varier a, b, c, d et suis l’image du carré unité.',
        'Essaie ROTATION 45° puis PROJECTION.',
        'Lis DÉTERMINANT, TRACE et VALEURS PROPRES.',
      ],
      formula: 'A=\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix},\\quad \\det A=ad-bc,\\quad \\lambda^2-(\\operatorname{tr}A)\\lambda+\\det A=0',
      fact: 'Le mot « matrice » a été introduit par James Sylvester en 1850 ; Cayley a défini leur produit quelques années plus tard.',
    },
    exercises: [
      { kind: 'qcm', q: 'Déterminant d’une rotation ?', choices: ['0', '1', '−1', 'dépend de l’angle'], answer: 1, hint: 'Une rotation conserve aire et orientation.', explain: 'cos² θ + sin² θ = 1.' },
      { kind: 'num', q: 'Déterminant de la matrice (a, b, c, d) = (2, 1, 1, 2) ?', answer: 3, tol: 0.001, hint: 'ad − bc.', explain: '4 − 1 = 3.' },
      {
        kind: 'task',
        q: 'Construis une matrice non nulle qui écrase le plan : déterminant nul.',
        check: (a) => Math.abs(a.num('DÉTERMINANT')) < 0.05 && ['a', 'b', 'c', 'd'].some((k) => Math.abs(Number(a.get(k))) > 0.1),
        uses: ['DÉTERMINANT', 'a', 'b', 'c', 'd'],
        hint: 'Rends les deux colonnes proportionnelles, ou choisis PROJECTION.',
        explain: 'Avec det A = 0, l’image du plan est une droite : A n’est plus inversible.',
      },
    ],
  },
  tilings: {
    lesson: {
      objective: 'Paver le plan : pavages réguliers, puis le pavage apériodique de Penrose.',
      notions: [
        'Seuls trois polygones réguliers pavent le plan : triangle, carré, hexagone.',
        'Le symbole {p, q} : des p-gones, q autour de chaque sommet.',
        'Penrose : deux losanges, aucune période, mais une symétrie d’ordre 5.',
        'Le rapport épais / fins tend vers φ.',
      ],
      observe: [
        'Compare les trois pavages réguliers.',
        'PENROSE P3 : augmente les GÉNÉRATIONS.',
        'Lis ÉPAIS / FINS.',
      ],
      formula: '\\{p,q\\}\\ \\text{pave le plan}\\iff\\frac1p+\\frac1q=\\frac12,\\qquad \\frac{N_{\\text{épais}}}{N_{\\text{fins}}}\\to\\varphi',
      fact: 'En 2023, David Smith a découvert « le chapeau » : une seule tuile qui pave le plan uniquement de façon apériodique.',
    },
    exercises: [
      { kind: 'qcm', q: 'Pourquoi le pentagone régulier ne pave-t-il pas le plan ?', choices: ['ses angles de 108° ne divisent pas 360°', 'il a un nombre impair de côtés', 'il n’est pas convexe', 'il le pave'], answer: 0, hint: 'Autour d’un sommet, les angles doivent faire 360°.', explain: '360/108 ≈ 3,33 n’est pas entier.' },
      { kind: 'num', q: 'Combien d’hexagones réguliers se rencontrent en chaque sommet du pavage {6, 3} ?', answer: 3, tol: 0.001, hint: 'Angle intérieur : 120°.', explain: '3 × 120° = 360°.' },
      {
        kind: 'task',
        q: 'Pavage PENROSE P3 avec au moins 5 générations.',
        check: (a) => a.pressed('PENROSE P3') && Number(a.get('GÉNÉRATIONS (PENROSE)')) >= 5,
        uses: ['PENROSE P3', 'GÉNÉRATIONS (PENROSE)'],
        hint: 'Choisis le pavage puis monte le curseur.',
        explain: 'À chaque génération, chaque losange est découpé en losanges plus petits : le rapport épais / fins approche φ.',
      },
    ],
  },
  collatz: {
    lesson: {
      objective: 'Explorer la conjecture de Syracuse : une règle très simple, un comportement imprévisible.',
      notions: [
        'Si n est pair, n ↦ n/2 ; sinon n ↦ 3n + 1.',
        'Conjecture : toute trajectoire finit par atteindre 1.',
        'Le temps de vol est le nombre d’étapes nécessaires.',
        'Vérifiée par ordinateur jusqu’à plus de 2⁶⁸, mais toujours pas démontrée.',
      ],
      observe: [
        'TRAJECTOIRE : essaie n = 27.',
        'CORAIL : les trajectoires inversées dessinent une algue.',
        'Joue avec ANGLE PAIR et ANGLE IMPAIR.',
      ],
      formula: 'T(n)=\\begin{cases}n/2 & n\\ \\text{pair}\\\\ 3n+1 & n\\ \\text{impair}\\end{cases}',
      fact: 'Paul Erdős disait des mathématiques qu’elles n’étaient « pas encore prêtes pour de tels problèmes ».',
    },
    exercises: [
      { kind: 'qcm', q: 'Que vaut T(7) ?', choices: ['3,5', '14', '22', '21'], answer: 2, hint: '7 est impair.', explain: '3 × 7 + 1 = 22.' },
      { kind: 'num', q: 'Temps de vol de 6 (nombre d’étapes pour atteindre 1) ?', answer: 8, tol: 0.001, hint: '6 → 3 → 10 → 5 → …', explain: '6, 3, 10, 5, 16, 8, 4, 2, 1 : 8 étapes.' },
      {
        kind: 'task',
        q: 'Mode TRAJECTOIRE, départ n = 27.',
        check: (a) => a.pressed('TRAJECTOIRE') && Number(a.get('DÉPART n (TRAJECTOIRE)')) === 27,
        uses: ['TRAJECTOIRE', 'DÉPART n (TRAJECTOIRE)'],
        hint: 'Le curseur est logarithmique : affine avec les flèches ← →.',
        explain: '27 met 111 étapes à retomber sur 1 et monte jusqu’à 9 232.',
      },
    ],
  },
};
