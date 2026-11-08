import type { Study } from '../../core/study';

const norm = (v: unknown) => String(v ?? '').replace(/\s/g, '').replace(/²/g, '^2');

export const study: Record<string, Study> = {
  riemann: {
    lesson: {
      objective: 'Approcher l’aire sous une courbe en la découpant en n bandes, et mesurer la vitesse de convergence de chaque méthode.',
      notions: [
        'Somme de Riemann : Σ f(xᵢ)·h avec h = (b − a)/n.',
        'Rectangles à gauche ou à droite : erreur en 1/n ; milieu et trapèzes : en 1/n².',
        'Simpson remplace la courbe par des arcs de parabole : erreur en 1/n⁴.',
        'L’intégrale est la limite commune de toutes ces sommes quand n → ∞.',
      ],
      observe: [
        'Choisis une méthode, coupe la CONVERGENCE AUTOMATIQUE et fais varier SUBDIVISIONS n.',
        'Lis l’ERREUR dans le panneau et sur le graphe log-log : la pente révèle l’ordre de la méthode.',
        'Tape ta propre fonction dans le champ f(x) =.',
      ],
      formula: '\\int_a^b f(x)\\,dx=\\lim_{n\\to\\infty}\\sum_{i=0}^{n-1} f(x_i)\\,h,\\qquad h=\\frac{b-a}{n}',
      fact: 'Riemann a formalisé cette définition en 1854, mais Archimède calculait déjà l’aire sous une parabole avec des sommes de ce type.',
    },
    exercises: [
      { kind: 'qcm', q: 'Avec la méthode des trapèzes, si on double n, l’erreur est environ…', choices: ['divisée par 2', 'divisée par 4', 'divisée par 16', 'inchangée'], answer: 1, hint: 'L’erreur des trapèzes est proportionnelle à 1/n².', explain: 'Erreur en 1/n² : doubler n divise l’erreur par 2² = 4.' },
      { kind: 'num', q: 'Calcule exactement ∫₀² x² dx.', answer: 8 / 3, tol: 0.01, hint: 'Une primitive de x² est x³/3.', explain: '[x³/3] entre 0 et 2 = 8/3 ≈ 2,667.' },
      {
        kind: 'task',
        q: 'Méthode MILIEU, convergence automatique coupée : règle n pour que l’erreur |Sₙ − I| passe sous 10⁻⁴ (avec la fonction par défaut).',
        check: (a) => a.pressed('MILIEU') && a.get('CONVERGENCE AUTOMATIQUE (n × 2)') === false && a.num('ERREUR |Sₙ − I|') < 1e-4,
        uses: ['MILIEU', 'CONVERGENCE AUTOMATIQUE (n × 2)', 'ERREUR |Sₙ − I|', 'SUBDIVISIONS n'],
        hint: 'L’erreur du point milieu est divisée par 4 quand n double : vise n autour de 110.',
        explain: 'Pour sin(x) + 1,5 sur [0, 4], l’erreur vaut environ 1,1/n² : il faut n ≥ 106 environ.',
      },
    ],
  },
  ftc: {
    lesson: {
      objective: 'Comprendre que l’aire accumulée F(x) = ∫ₐˣ f(t) dt a pour dérivée f(x).',
      notions: [
        'F(x) mesure l’aire signée sous f entre a et x.',
        'Quand x avance de dx, l’aire gagne une fine bande ≈ f(x)·dx.',
        'Donc F′(x) = f(x) : intégrer et dériver sont des opérations inverses.',
        'Conséquence : ∫ₐᵇ f = F(b) − F(a) pour toute primitive F.',
      ],
      observe: [
        'Coupe le BALAYAGE AUTOMATIQUE et déplace POSITION x.',
        'Compare f(x) et la pente estimée F′(x) dans le panneau.',
        'Repère où F est maximale : là où f change de signe.',
      ],
      formula: '\\frac{d}{dx}\\int_a^x f(t)\\,dt=f(x),\\qquad \\int_a^b f=F(b)-F(a)',
      fact: 'Newton et Leibniz ont découvert ce lien indépendamment vers 1670 ; la querelle de priorité a duré plusieurs décennies.',
    },
    exercises: [
      { kind: 'qcm', q: 'Si f(x) > 0 sur un intervalle, alors F(x) = ∫ₐˣ f y est…', choices: ['croissante', 'décroissante', 'constante', 'nulle'], answer: 0, hint: 'F′ = f.', explain: 'F′(x) = f(x) > 0 : F est croissante.' },
      { kind: 'num', q: 'Avec F(x) = ∫₀ˣ cos t dt, que vaut F(π/2) ?', answer: 1, tol: 0.01, hint: 'Une primitive de cos est sin.', explain: 'F(π/2) = sin(π/2) − sin 0 = 1.' },
      {
        kind: 'task',
        q: 'Fais redescendre F : choisis une fonction qui devient négative (par exemple sin(x)), coupe le balayage et place x là où f(x) < 0.',
        check: (a) => a.get('BALAYAGE AUTOMATIQUE') === false && a.num('f(x)') < 0,
        uses: ['BALAYAGE AUTOMATIQUE', 'f(x)', 'f(x) =', 'POSITION x'],
        hint: 'La fonction par défaut est toujours positive : tape sin(x) dans f(x) =, puis place x entre π et 2π.',
        explain: 'Là où f < 0, l’aire accumulée diminue : F décroît.',
      },
    ],
  },
  double: {
    lesson: {
      objective: 'Calculer un volume sous une surface z = f(x, y) en l’approchant par n × n prismes.',
      notions: [
        'Chaque prisme a pour base ΔA = Δx·Δy et pour hauteur la valeur de f en un point de la base.',
        'La somme des volumes converge vers l’intégrale double quand la grille s’affine.',
        'Théorème de Fubini : ∬ f = ∫ ( ∫ f dy ) dx.',
        'Échantillonner au centre est plus précis qu’au coin.',
      ],
      observe: [
        'Coupe le RAFFINEMENT AUTOMATIQUE et augmente GRILLE n × n.',
        'Compare CENTRE et COIN : l’erreur ne décroît pas à la même vitesse.',
        'Tape f(x,y) = 1 : le volume devient l’aire du domaine.',
      ],
      formula: '\\iint_D f\\,dA=\\lim_{n\\to\\infty}\\sum_{i,j} f(x_i^*,y_j^*)\\,\\Delta x\\,\\Delta y',
      fact: 'L’intégrale de e^{−(x²+y²)} sur tout le plan vaut exactement π : c’est ainsi qu’on prouve que ∫ e^{−x²} dx = √π.',
    },
    exercises: [
      { kind: 'qcm', q: 'Que vaut ∬ 1 dA sur le carré [−1, 1]² ?', choices: ['1', '2', '4', 'π'], answer: 2, hint: 'C’est l’aire du carré.', explain: 'Aire = 2 × 2 = 4.' },
      { kind: 'num', q: 'Volume sous z = x + y au-dessus du carré [0, 1]² ?', answer: 1, tol: 0.01, hint: 'Fubini : ∫₀¹ ∫₀¹ (x + y) dy dx.', explain: '∫₀¹ (x + 1/2) dx = 1/2 + 1/2 = 1.' },
      {
        kind: 'task',
        q: 'Échantillonnage CENTRE, raffinement coupé : obtiens une ERREUR inférieure à 10⁻³.',
        check: (a) => a.pressed('CENTRE') && a.get('RAFFINEMENT AUTOMATIQUE') === false && a.num('ERREUR') < 1e-3,
        uses: ['CENTRE', 'RAFFINEMENT AUTOMATIQUE', 'ERREUR', 'GRILLE n × n'],
        hint: 'L’erreur au centre décroît en 1/n² : vise n ≥ 24.',
        explain: 'Au centre, l’erreur décroît comme 1/n² ; au coin, seulement comme 1/n.',
      },
    ],
  },
  triple: {
    lesson: {
      objective: 'Visualiser une densité f(x, y, z) et estimer sa masse ∭ f dV par tirages aléatoires (Monte-Carlo).',
      notions: [
        'Chaque point du nuage est tiré au hasard ; son opacité suit f.',
        'Monte-Carlo : ∭ f ≈ volume du domaine × moyenne de f sur N tirages.',
        'L’erreur décroît en 1/√N, quelle que soit la dimension.',
        'Une tranche z = z₀ montre la densité dans un plan.',
      ],
      observe: [
        'Active TRANCHE z = z₀ et déplace z₀ pour voir l’intérieur.',
        'Compare ESTIMATION et RÉFÉRENCE (SIMPSON) au fil des ÉCHANTILLONS N.',
        'Passe du CUBE à la BOULE.',
      ],
      formula: 'M=\\iiint_V f\\,dV\\approx\\frac{|V|}{N}\\sum_{k=1}^{N} f(\\mathbf p_k)',
      fact: 'La méthode porte le nom du casino de Monaco ; Ulam et von Neumann l’ont développée en 1946 pour des calculs de physique nucléaire.',
    },
    exercises: [
      { kind: 'qcm', q: 'Pour diviser l’erreur Monte-Carlo par 10, il faut multiplier N par…', choices: ['10', '20', '100', '1 000'], answer: 2, hint: 'L’erreur est en 1/√N.', explain: '1/√(100 N) = (1/10) × 1/√N.' },
      { kind: 'num', q: 'Volume de la boule de rayon 1 (∭ 1 dV) ?', answer: (4 * Math.PI) / 3, tol: 0.01, hint: 'V = 4πr³/3.', explain: '4π/3 ≈ 4,189.' },
      {
        kind: 'task',
        q: 'Choisis le domaine BOULE r ≤ L et tape f(x,y,z) = 1 : l’estimation doit donner le volume de la boule.',
        check: (a) => a.pressed('BOULE r ≤ L') && norm(a.get('f(x,y,z) =')) === '1' && Math.abs(a.num('ESTIMATION') - (4 / 3) * Math.PI * Number(a.get('L')) ** 3) < 0.05 * (4 / 3) * Math.PI * Number(a.get('L')) ** 3,
        uses: ['BOULE r ≤ L', 'f(x,y,z) =', 'ESTIMATION', 'L'],
        hint: 'Le choix du domaine est sous la fonction ; f = 1 compte simplement le volume.',
        explain: 'Avec f = 1, ∭ 1 dV est le volume : 4π/3 ≈ 4,19 pour L = 1.',
      },
    ],
  },
  hyper: {
    lesson: {
      objective: 'Intégrer en dimension 4 : par tranches dans le temps, et calculer l’hypervolume de la boule unité de ℝ⁴.',
      notions: [
        'Une fonction f(x, y, z, t) se parcourt tranche par tranche : I(t) = ∭ f dV.',
        'L’intégrale 4D est l’aire sous la courbe I(t).',
        'Chaque tranche w = constante de la boule de ℝ⁴ est une boule 3D de rayon √(1 − w²).',
        'V₄ = π²/2 ≈ 4,935 ; la boule unité est la plus volumineuse en dimension 5.',
      ],
      observe: [
        'En mode HYPERSPHÈRE, suis le rayon de la tranche quand w varie.',
        'Compare MONTE-CARLO V₄ et EXACT π²/2.',
        'En mode f(x, y, z, t), lis I(t) et son intégrale.',
      ],
      formula: 'V_4=\\int_{-1}^{1}\\frac{4}{3}\\pi\\left(1-w^2\\right)^{3/2}dw=\\frac{\\pi^2}{2}',
      fact: 'En dimension 20, la boule unité n’occupe que 0,0000025 % du cube qui l’entoure : presque tout le volume est dans les coins.',
    },
    exercises: [
      { kind: 'qcm', q: 'La tranche w = 0,6 de la boule unité de ℝ⁴ est une boule 3D de rayon…', choices: ['0,4', '0,6', '0,8', '1'], answer: 2, hint: 'r = √(1 − w²).', explain: '√(1 − 0,36) = √0,64 = 0,8.' },
      { kind: 'num', q: 'Hypervolume de la boule unité de ℝ⁴, à 0,01 près ?', answer: Math.PI ** 2 / 2, tol: 0.01, hint: 'V₄ = π²/2.', explain: 'π²/2 ≈ 4,935.' },
      {
        kind: 'task',
        q: 'Mode HYPERSPHÈRE, balayage coupé : place la tranche pour que son volume dépasse 4.',
        check: (a) => a.pressed('HYPERSPHÈRE') && a.get('BALAYAGE AUTOMATIQUE') === false && a.num('VOLUME DE LA TRANCHE') > 4,
        uses: ['HYPERSPHÈRE', 'BALAYAGE AUTOMATIQUE', 'VOLUME DE LA TRANCHE', 'TRANCHE (t OU w)'],
        hint: 'Le volume est maximal au centre, w = 0 : mets le curseur TRANCHE au milieu.',
        explain: 'À w = 0, la tranche est la boule unité de ℝ³, de volume 4π/3 ≈ 4,19.',
      },
    ],
  },
};
