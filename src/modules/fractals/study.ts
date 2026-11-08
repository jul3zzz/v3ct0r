import type { Study } from '../../core/study';

export const study: Record<string, Study> = {
  mandelbrot: {
    lesson: {
      objective: 'Explorer l’ensemble de Mandelbrot : les nombres c pour lesquels la suite zₙ₊₁ = zₙ² + c reste bornée.',
      notions: [
        'Dès que |zₙ| dépasse 2, la suite s’échappe vers l’infini.',
        'Le niveau de gris compte les itérations avant l’échappement.',
        'Le bord est infiniment détaillé ; sa dimension de Hausdorff vaut 2.',
        'Au-delà de ×10⁶, le calcul passe en perturbation autour d’une orbite haute précision.',
      ],
      observe: [
        'Molette pour zoomer au curseur, glisser pour te déplacer, double-clic pour revenir.',
        'Choisis M ANTENNE (∞) puis active la PLONGÉE AUTOMATIQUE.',
        'Regarde la MÉTHODE passer de FLOAT32 à PERTURBATION.',
      ],
      formula: 'z_0=0,\\quad z_{n+1}=z_n^2+c,\\qquad c\\in M\\iff |z_n|\\le 2\\ \\text{pour tout } n',
      fact: 'Benoît Mandelbrot a publié les premières images de l’ensemble en 1980 ; Douady et Hubbard ont prouvé en 1982 qu’il est connexe.',
    },
    exercises: [
      { kind: 'qcm', q: 'Le point c = −1 appartient-il à l’ensemble de Mandelbrot ?', choices: ['oui : la suite boucle 0, −1, 0, −1…', 'non : elle s’échappe', 'on ne peut pas savoir', 'seulement pour n pair'], answer: 0, hint: 'Calcule z₁, z₂, z₃ avec c = −1.', explain: '0 → −1 → 0 → −1 : la suite est bornée, donc −1 ∈ M.' },
      { kind: 'num', q: 'Pour c = 1, calcule z₃ (avec z₀ = 0).', answer: 5, tol: 0.01, hint: 'z₁ = 1, z₂ = 1² + 1 = 2…', explain: 'z₁ = 1, z₂ = 2, z₃ = 5 : la suite s’échappe, 1 ∉ M.' },
      {
        kind: 'task',
        q: 'Atteins un zoom calculé en PERTURBATION (au-delà de ×10⁶).',
        check: (a) => a.text('MÉTHODE') === 'PERTURBATION',
        uses: ['MÉTHODE'],
        hint: 'Choisis une cible marquée (∞) puis la PLONGÉE AUTOMATIQUE, ou zoome longtemps à la molette.',
        explain: 'Au-delà de ~×10⁶, le float32 ne suffit plus : chaque pixel suit son écart à une orbite de référence calculée à ~96 chiffres.',
      },
    ],
  },
  julia: {
    lesson: {
      objective: 'Comprendre les ensembles de Julia et leur lien avec l’ensemble de Mandelbrot.',
      notions: [
        'On fixe c et on fait varier le point de départ z₀.',
        'J_c est la frontière entre les points dont la suite reste bornée et ceux qui s’échappent.',
        'c ∈ M ⟺ J_c est connexe (d’un seul tenant).',
        'Sinon, J_c est une poussière de Cantor.',
      ],
      observe: [
        'Survole la carte en médaillon : c suit la souris.',
        'Clique sur la carte pour verrouiller c.',
        'Essaie LAPIN DE DOUADY, BASILIQUE puis POUSSIÈRE.',
      ],
      formula: 'J_c=\\partial\\{z_0\\in\\mathbb C : (z_n)\\ \\text{bornée}\\},\\qquad c\\in M\\iff J_c\\ \\text{connexe}',
      fact: 'Gaston Julia et Pierre Fatou ont étudié ces ensembles vers 1918, sans ordinateur pour les dessiner.',
    },
    exercises: [
      { kind: 'qcm', q: 'Si c est hors de l’ensemble de Mandelbrot, J_c est…', choices: ['connexe', 'une poussière de Cantor', 'un cercle', 'vide'], answer: 1, hint: 'C’est la dichotomie de Fatou et Julia.', explain: 'Hors de M, J_c est totalement déconnecté : une poussière.' },
      { kind: 'num', q: 'Pour c = 0, J_c est le cercle |z| = r. Que vaut r ?', answer: 1, tol: 0.001, hint: 'Avec z ↦ z², quand |z| reste-t-il borné ?', explain: '|z|ⁿ reste borné si et seulement si |z| ≤ 1 : J₀ est le cercle unité.' },
      {
        kind: 'task',
        q: 'Choisis le préréglage POUSSIÈRE : J_c n’est plus connexe.',
        check: (a) => a.pressed('POUSSIÈRE') && a.text('J_c').startsWith('POUSSIÈRE'),
        uses: ['POUSSIÈRE', 'J_c'],
        hint: 'Les préréglages sont dans la section PARAMÈTRE c.',
        explain: 'c = 0,45 + 0,1428i est hors de M : l’ensemble se pulvérise.',
      },
    ],
  },
  mandelbulb: {
    lesson: {
      objective: 'Voir un analogue 3D de l’ensemble de Mandelbrot, rendu pixel par pixel sur le GPU par ray-marching.',
      notions: [
        'Il n’existe pas de « complexes 3D » : on élève un point en multipliant ses angles sphériques par n.',
        'Pour chaque pixel, le rayon avance d’une distance sûre donnée par un estimateur.',
        'La puissance n change le nombre de bulbes.',
        'Sa dimension de Hausdorff n’est pas connue.',
      ],
      observe: [
        'Coupe FAIRE VARIER n et règle PUISSANCE n.',
        'Active la COUPE pour voir l’intérieur.',
        'Change le rendu : OMBRÉ, ORBITES, NUAGE.',
      ],
      formula: '(r,\\theta,\\varphi)\\mapsto(r^n,\\ n\\theta,\\ n\\varphi),\\qquad \\mathbf z\\mapsto\\mathbf z^n+\\mathbf c',
      fact: 'Daniel White et Paul Nylander ont trouvé cette formule en 2009 ; la puissance 8 est devenue la plus célèbre.',
    },
    exercises: [
      { kind: 'qcm', q: 'Le ray-marching avance le long d’un rayon de…', choices: ['1 pixel à la fois', 'la distance estimée à la surface', 'une longueur aléatoire', 'toute la longueur du rayon'], answer: 1, hint: 'C’est le rôle de l’estimateur de distance.', explain: 'On avance d’une distance sûre jusqu’à toucher la surface.' },
      { kind: 'num', q: 'Élever à la puissance 8 un point de rayon 0,5 donne quel rayon ?', answer: 1 / 256, tol: 0.0005, hint: 'r ↦ rⁿ.', explain: '0,5⁸ = 1/256 ≈ 0,0039.' },
      {
        kind: 'task',
        q: 'Coupe la variation automatique et règle la puissance n = 2.',
        check: (a) => a.get('FAIRE VARIER n') === false && Math.abs(Number(a.get('PUISSANCE n')) - 2) < 0.05,
        uses: ['FAIRE VARIER n', 'PUISSANCE n'],
        hint: 'PUISSANCE n est le premier curseur du panneau.',
        explain: 'À n = 2, la forme ressemble à une pomme presque lisse, bien moins riche qu’à n = 8.',
      },
    ],
  },
  sierpinski: {
    lesson: {
      objective: 'Construire le triangle de Sierpinski et mesurer sa dimension fractale.',
      notions: [
        'On retire le triangle central, puis on recommence dans chacun des 3 restants.',
        '3 copies à l’échelle 1/2 : dimension ln 3 / ln 2 ≈ 1,585.',
        'L’aire tend vers 0 et le périmètre vers l’infini.',
        'Le jeu du chaos converge vers le même ensemble.',
      ],
      observe: [
        'Coupe la CONSTRUCTION AUTOMATIQUE et règle la PROFONDEUR n.',
        'Passe au JEU DU CHAOS.',
        'Zoome : chaque morceau est une copie de l’ensemble entier.',
      ],
      formula: 'D=\\frac{\\ln 3}{\\ln 2},\\qquad \\text{aire}_n=\\left(\\tfrac34\\right)^n',
      fact: 'Wacław Sierpiński l’a décrit en 1915, mais le motif orne déjà des pavements d’églises italiennes du XIIIᵉ siècle.',
    },
    exercises: [
      { kind: 'qcm', q: 'Combien de triangles à l’étape n = 4 ?', choices: ['12', '27', '64', '81'], answer: 3, hint: 'Chaque triangle en donne 3 à l’étape suivante : 3ⁿ.', explain: '3⁴ = 81.' },
      { kind: 'num', q: 'Quelle fraction de l’aire initiale reste à l’étape 2 ?', answer: 0.5625, tol: 0.001, hint: '(3/4)ⁿ.', explain: '(3/4)² = 9/16 = 0,5625.' },
      {
        kind: 'task',
        q: 'Construction récursive à la profondeur n = 6, construction automatique coupée.',
        check: (a) => a.get('CONSTRUCTION AUTOMATIQUE') === false && Number(a.get('PROFONDEUR n')) === 6,
        uses: ['CONSTRUCTION AUTOMATIQUE', 'PROFONDEUR n'],
        hint: 'Coupe l’automatique, puis règle le curseur.',
        explain: '729 triangles, et il ne reste que (3/4)⁶ ≈ 17,8 % de l’aire.',
      },
    ],
  },
  sierpinski3d: {
    lesson: {
      objective: 'Passer en 3D : quatre tétraèdres deux fois plus petits à chaque étape.',
      notions: [
        '4 copies à l’échelle 1/2 : dimension ln 4 / ln 2 = 2.',
        'Le volume est divisé par 2 à chaque étape.',
        'La surface totale reste constante.',
        'Un objet de l’espace… de dimension exactement 2.',
      ],
      observe: [
        'Coupe la construction automatique et règle la PROFONDEUR n.',
        'Tourne autour : les trous traversent l’objet de part en part.',
        'Compare le volume et le nombre de tétraèdres.',
      ],
      formula: 'D=\\frac{\\ln 4}{\\ln 2}=2,\\qquad V_n=\\frac{V_0}{2^n}',
      fact: 'Vu dans certaines directions, le tétraèdre de Sierpinski projette une ombre parfaitement carrée, sans trou.',
    },
    exercises: [
      { kind: 'qcm', q: 'Sa dimension de similarité vaut…', choices: ['1,5', '2', '2,5', '3'], answer: 1, hint: 'ln N / ln(1/r) avec N = 4 et r = 1/2.', explain: 'ln 4 / ln 2 = 2.' },
      { kind: 'num', q: 'Volume restant à l’étape 5, en fraction de V₀ ?', answer: 1 / 32, tol: 0.0005, hint: '(1/2)ⁿ.', explain: '1/2⁵ = 1/32 = 0,03125.' },
      {
        kind: 'task',
        q: 'Profondeur n = 4, construction automatique coupée.',
        check: (a) => a.get('CONSTRUCTION AUTOMATIQUE') === false && Number(a.get('PROFONDEUR n')) === 4,
        uses: ['CONSTRUCTION AUTOMATIQUE', 'PROFONDEUR n'],
        hint: 'Coupe l’automatique, puis règle le curseur.',
        explain: '4⁴ = 256 tétraèdres, et 1/16 du volume initial.',
      },
    ],
  },
  koch: {
    lesson: {
      objective: 'Construire le flocon de Koch : un périmètre infini autour d’une aire finie.',
      notions: [
        'Chaque segment devient 4 segments 3 fois plus courts.',
        'Le périmètre est multiplié par 4/3 à chaque étape : il diverge.',
        'L’aire converge vers 8/5 de celle du triangle de départ.',
        'Dimension ln 4 / ln 3 ≈ 1,262.',
      ],
      observe: [
        'Coupe la CONSTRUCTION AUTOMATIQUE et règle l’ÉTAPE n.',
        'Compare FLOCON et ANTI-FLOCON.',
        'Lis PÉRIMÈTRE / P₀ et AIRE / A₀.',
      ],
      formula: 'P_n=P_0\\left(\\tfrac43\\right)^n,\\qquad A_\\infty=\\tfrac85A_0',
      fact: 'Helge von Koch (1904) cherchait une courbe continue sans tangente en aucun point, pour défier l’intuition des physiciens.',
    },
    exercises: [
      { kind: 'qcm', q: 'Combien de segments compte le flocon à l’étape 2 ?', choices: ['12', '36', '48', '64'], answer: 2, hint: '3 × 4ⁿ.', explain: '3 × 16 = 48.' },
      { kind: 'num', q: 'Rapport du périmètre à l’étape 3 sur le périmètre initial ?', answer: (4 / 3) ** 3, tol: 0.01, hint: '(4/3)ⁿ.', explain: '64/27 ≈ 2,370.' },
      {
        kind: 'task',
        q: 'ANTI-FLOCON à l’étape 4, construction automatique coupée.',
        check: (a) => a.pressed('ANTI-FLOCON') && a.get('CONSTRUCTION AUTOMATIQUE') === false && Number(a.get('ÉTAPE n')) === 4,
        uses: ['ANTI-FLOCON', 'CONSTRUCTION AUTOMATIQUE', 'ÉTAPE n'],
        hint: 'Choisis la variante, coupe l’automatique, puis règle l’étape.',
        explain: 'Les bosses rentrent vers l’intérieur ; l’aire tend vers 2/5 de l’aire du triangle.',
      },
    ],
  },
  menger: {
    lesson: {
      objective: 'Construire l’éponge de Menger : un volume nul pour une surface infinie.',
      notions: [
        'On garde 20 des 27 sous-cubes à chaque étape.',
        'Le volume est multiplié par 20/27 : il tend vers 0.',
        'Dimension ln 20 / ln 3 ≈ 2,727.',
        'Chaque face est un tapis de Sierpinski.',
      ],
      observe: [
        'Règle NIVEAU n de 0 à 3.',
        'Coupe l’OCCLUSION pour voir toutes les arêtes.',
        'Compare CUBES et VOLUME.',
      ],
      formula: 'N=20,\\ r=\\tfrac13\\Rightarrow D=\\frac{\\ln 20}{\\ln 3},\\qquad V_n=\\left(\\tfrac{20}{27}\\right)^n',
      fact: 'En 2014, le projet MegaMenger a réuni des milliers de bénévoles pour plier un million de cartes de visite en éponges de niveau 3.',
    },
    exercises: [
      { kind: 'qcm', q: 'Combien de cubes au niveau 2 ?', choices: ['40', '400', '729', '8 000'], answer: 1, hint: '20ⁿ.', explain: '20² = 400.' },
      { kind: 'num', q: 'Fraction du volume restant au niveau 2 ?', answer: 400 / 729, tol: 0.001, hint: '(20/27)².', explain: '400/729 ≈ 0,549.' },
      {
        kind: 'task',
        q: 'Niveau 2 ou plus, avec l’occlusion coupée.',
        check: (a) => Number(a.get('NIVEAU n')) >= 2 && a.get('OCCLUSION (LIGNES CACHÉES)') === false,
        uses: ['NIVEAU n', 'OCCLUSION (LIGNES CACHÉES)'],
        hint: 'Le curseur NIVEAU n et la case OCCLUSION sont dans le panneau.',
        explain: 'Sans occlusion, on voit toutes les arêtes des 400 (ou 8 000) cubes en transparence.',
      },
    ],
  },
  hilbert: {
    lesson: {
      objective: 'Suivre la courbe de Hilbert : une ligne qui, à la limite, remplit tout le carré.',
      notions: [
        'À l’ordre n, la courbe visite les 4ⁿ cases d’une grille 2ⁿ × 2ⁿ.',
        'Sa longueur 2ⁿ − 2⁻ⁿ tend vers l’infini.',
        'La limite est continue et passe par tous les points du carré : dimension 2.',
        'Deux points proches sur la courbe sont proches dans le carré.',
      ],
      observe: [
        'Coupe le TRACÉ AUTOMATIQUE et règle ORDRE n.',
        'Active la GRILLE 2ⁿ × 2ⁿ.',
        'Ralentis la VITESSE DE TRACÉ pour suivre le parcours.',
      ],
      formula: 'L_n=2^n-2^{-n},\\qquad H:[0,1]\\to[0,1]^2\\ \\text{continue et surjective}',
      fact: 'Peano a trouvé la première courbe qui remplit le plan en 1890 ; Hilbert en a donné cette version géométrique l’année suivante.',
    },
    exercises: [
      { kind: 'qcm', q: 'Combien de cases visite la courbe d’ordre 3 ?', choices: ['9', '16', '64', '512'], answer: 2, hint: 'Chaque case est découpée en 4 à l’ordre suivant : 4ⁿ.', explain: '4³ = 64.' },
      { kind: 'num', q: 'Longueur de la courbe d’ordre 3 dans le carré unité ?', answer: 8 - 1 / 8, tol: 0.01, hint: '2ⁿ − 1/2ⁿ.', explain: '8 − 0,125 = 7,875.' },
      {
        kind: 'task',
        q: 'Ordre 5, tracé automatique coupé, grille affichée.',
        check: (a) => a.get('TRACÉ AUTOMATIQUE') === false && Number(a.get('ORDRE n')) === 5 && a.get('GRILLE 2ⁿ × 2ⁿ') === true,
        uses: ['TRACÉ AUTOMATIQUE', 'ORDRE n', 'GRILLE 2ⁿ × 2ⁿ'],
        hint: 'Coupe l’automatique avant de régler l’ordre.',
        explain: 'À l’ordre 5, la courbe visite 1 024 cases sans jamais se croiser.',
      },
    ],
  },
  fern: {
    lesson: {
      objective: 'Dessiner une fougère avec quatre transformations affines tirées au hasard.',
      notions: [
        'Un système de fonctions itérées (IFS) : x ↦ Aᵢx + bᵢ.',
        'Chaque transformation est choisie avec sa propre probabilité.',
        'Le nuage converge vers l’attracteur, quel que soit le point de départ.',
        'Sa dimension se mesure par comptage de boîtes.',
      ],
      observe: [
        'Modifie la COURBURE DE LA FRONDE.',
        'Augmente POINTS PAR IMAGE.',
        'Zoome sur une foliole : c’est une petite fougère.',
      ],
      formula: '\\mathbf x_{k+1}=A_i\\mathbf x_k+\\mathbf b_i\\quad\\text{avec probabilité } p_i',
      fact: 'Michael Barnsley a présenté cette fougère en 1988 dans Fractals Everywhere : 24 nombres suffisent à la coder entièrement.',
    },
    exercises: [
      { kind: 'qcm', q: 'La transformation la plus fréquente (85 %) dessine…', choices: ['la tige', 'la fronde qui se répète', 'la foliole gauche', 'la foliole droite'], answer: 1, hint: 'C’est elle qui fait « monter » la fougère.', explain: 'Presque une similitude, elle reproduit la fronde entière un peu plus haut et plus petite.' },
      { kind: 'num', q: 'Avec les probabilités 0,01 ; 0,85 ; 0,07 ; 0,07, combien de points sur 10 000 viennent en moyenne de la tige ?', answer: 100, tol: 0.5, hint: 'p × N.', explain: '0,01 × 10 000 = 100.' },
      {
        kind: 'task',
        q: 'Courbe la fronde d’au moins 3°, dans un sens ou dans l’autre.',
        check: (a) => Math.abs(Number(a.get('COURBURE DE LA FRONDE'))) >= (3 * Math.PI) / 180 - 1e-4,
        uses: ['COURBURE DE LA FRONDE'],
        hint: 'Le curseur est gradué en degrés.',
        explain: 'Tourner légèrement la transformation principale courbe toute la fougère, à toutes les échelles.',
      },
    ],
  },
  tree: {
    lesson: {
      objective: 'Faire pousser un arbre fractal et relier son aspect à sa dimension de similarité.',
      notions: [
        'Chaque branche porte deux copies d’elle-même réduites d’un facteur r.',
        'Dimension de similarité : ln 2 / ln(1/r).',
        'Pour r = 1/√2 ≈ 0,707, elle vaut 2 : la canopée remplit le plan.',
        'La longueur totale n’est finie que si r < 1/2.',
      ],
      observe: [
        'Règle le RAPPORT r et lis la dimension.',
        'Change l’ANGLE et l’ASYMÉTRIE.',
        'Coupe le VENT pour figer la figure.',
      ],
      formula: 'D_s=\\frac{\\ln 2}{\\ln(1/r)},\\qquad L=\\ell_0\\sum_{k\\ge0}(2r)^k',
      fact: 'On retrouve ces ramifications dans les bronches, les rivières et les éclairs : elles remplissent un espace avec très peu de matière.',
    },
    exercises: [
      { kind: 'qcm', q: 'Pour quel rapport r la dimension de similarité vaut-elle 1 ?', choices: ['1/4', '1/2', '1/√2', '1'], answer: 1, hint: 'ln 2 / ln(1/r) = 1.', explain: 'ln(1/r) = ln 2, donc r = 1/2.' },
      { kind: 'num', q: 'Longueur totale d’un arbre infini avec r = 0,4 et un tronc de longueur 1 ?', answer: 5, tol: 0.01, hint: 'Série géométrique de raison 2r = 0,8.', explain: '1/(1 − 0,8) = 5.' },
      {
        kind: 'task',
        q: 'Règle r pour que la dimension de similarité dépasse 1,8.',
        check: (a) => a.num('DIM. SIMILARITÉ') > 1.8,
        uses: ['DIM. SIMILARITÉ', 'RAPPORT r'],
        hint: 'Il faut r > 2^(−1/1,8) ≈ 0,68.',
        explain: 'Plus r approche 1/√2, plus la canopée devient dense.',
      },
    ],
  },
  attractors: {
    lesson: {
      objective: 'Observer le chaos déterministe : des équations simples dont les trajectoires ne se répètent jamais.',
      notions: [
        'Un attracteur étrange attire les trajectoires sans être ni un point ni un cycle.',
        'Sensibilité aux conditions initiales : l’écart entre deux trajectoires grandit exponentiellement.',
        'Les trajectoires sont calculées par la méthode de Runge-Kutta d’ordre 4.',
        'L’attracteur de Lorenz a une dimension d’environ 2,06.',
      ],
      observe: [
        'Réduis l’ÉCART INITIAL (LOG) : les trajectoires restent groupées plus longtemps.',
        'Pour LORENZ, baisse ρ sous 24 : le chaos disparaît.',
        'Compare RÖSSLER et AIZAWA.',
      ],
      formula: '\\dot x=\\sigma(y-x),\\quad \\dot y=x(\\rho-z)-y,\\quad \\dot z=xy-\\beta z',
      fact: 'Lorenz a découvert l’effet papillon en 1961 en relançant une simulation météo avec des valeurs arrondies à 3 décimales au lieu de 6.',
    },
    exercises: [
      { kind: 'qcm', q: 'Deux trajectoires partant de points distants de 10⁻⁹ finissent…', choices: ['toujours identiques', 'par se séparer complètement', 'par se croiser périodiquement', 'par s’arrêter'], answer: 1, hint: 'C’est l’effet papillon.', explain: 'L’écart croît exponentiellement jusqu’à la taille de l’attracteur.' },
      { kind: 'num', q: 'Valeur de σ dans le système de Lorenz classique ?', answer: 10, tol: 0.01, hint: 'Les paramètres classiques sont 10, 28 et 8/3.', explain: 'σ = 10, ρ = 28, β = 8/3.' },
      {
        kind: 'task',
        q: 'Système LORENZ avec ρ ramené sous 20 : les trajectoires tombent sur un point fixe.',
        check: (a) => a.pressed('LORENZ') && Number(a.get('ρ')) < 20,
        uses: ['LORENZ', 'ρ'],
        hint: 'Le curseur ρ est dans la section PARAMÈTRES.',
        explain: 'Pour ρ < 24,74, les deux points fixes deviennent stables : plus de chaos à long terme.',
      },
    ],
  },
};
