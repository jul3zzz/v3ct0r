import type { Study } from '../../core/study';

export const study: Record<string, Study> = {
  polytopes: {
    lesson: {
      objective: 'Découvrir les six polytopes réguliers de la dimension 4 et comprendre comment on les projette dans notre espace.',
      notions: [
        'Une rotation 4D agit dans un plan, pas autour d’un axe : il y a 6 plans (XY, XZ, XW, YZ, YW, ZW).',
        'La projection perspective divise par la distance à l’œil le long de w.',
        'La projection stéréographique conserve les angles : les arêtes deviennent des arcs de cercle.',
        'Relation d’Euler en dimension 4 : S − A + F − C = 0.',
      ],
      observe: [
        'Choisis le TESSERACT et coupe la ROTATION AUTO.',
        'Fais varier PLAN XW : le cube intérieur passe à l’extérieur.',
        'Compare PERSPECTIVE et STÉRÉOGRAPHIQUE sur le 120-CELL.',
      ],
      formula: 'S-A+F-C=0,\\qquad R_{xw}(\\theta):(x,w)\\mapsto(x\\cos\\theta-w\\sin\\theta,\\ x\\sin\\theta+w\\cos\\theta)',
      fact: 'Ludwig Schläfli a découvert les six polytopes réguliers de dimension 4 vers 1852 ; en dimension 5 et au-delà, il n’en reste que trois.',
    },
    exercises: [
      { kind: 'qcm', q: 'Combien d’arêtes possède le tesseract ?', choices: ['16', '24', '32', '64'], answer: 2, hint: '16 sommets, chacun relié à 4 voisins (une arête par axe).', explain: '16 × 4 / 2 = 32.' },
      { kind: 'num', q: 'Le 24-cell a 24 sommets, 96 arêtes et 24 cellules. Combien a-t-il de faces (S − A + F − C = 0) ?', answer: 96, tol: 0.5, hint: 'F = A + C − S.', explain: 'F = 96 + 24 − 24 = 96.' },
      {
        kind: 'task',
        q: 'Affiche le 600-CELL en projection STÉRÉOGRAPHIQUE, rotation automatique coupée.',
        check: (a) => a.pressed('600-CELL') && a.pressed('STÉRÉOGRAPHIQUE') && a.get('ROTATION AUTO') === false,
        uses: ['600-CELL', 'STÉRÉOGRAPHIQUE', 'ROTATION AUTO'],
        hint: 'Les choix sont dans les sections POLYTOPE et PROJECTION 4D → 3D.',
        explain: 'Le 600-cell : 120 sommets, 720 arêtes, 1 200 faces et 600 tétraèdres.',
      },
    ],
  },
  slices: {
    lesson: {
      objective: 'Voir un objet 4D à travers ses coupes par un hyperplan, comme un habitant de Flatland voit une sphère traverser son plan.',
      notions: [
        'La coupe de la 3-sphère par w = c est une sphère de rayon √(1 − c²).',
        'La coupe d’un polytope 4D est un polyèdre 3D.',
        'Elle dépend de l’orientation : par une cellule, une face, une arête ou un sommet.',
        'Chaque coupe vérifie la formule d’Euler des polyèdres S − A + F = 2.',
      ],
      observe: [
        'TESSERACT, orientation CELLULE : la coupe est un cube.',
        'Orientation SOMMET : tétraèdre, puis octaèdre, puis tétraèdre.',
        'Coupe la TRAVERSÉE AUTOMATIQUE et règle w = c à la main.',
      ],
      formula: 'S^3\\cap\\{w=c\\}=S^2\\!\\left(\\sqrt{1-c^2}\\right),\\qquad S-A+F=2',
      fact: 'Edwin Abbott a publié Flatland en 1884 : un carré y découvre la troisième dimension grâce à une sphère qui traverse son monde.',
    },
    exercises: [
      { kind: 'qcm', q: 'Une hypersphère de rayon 1 traverse notre espace. À w = 0, on voit…', choices: ['un point', 'une sphère de rayon 1', 'un cube', 'rien'], answer: 1, hint: 'r = √(1 − c²) avec c = 0.', explain: 'Rayon √1 = 1 : c’est la plus grande coupe.' },
      { kind: 'num', q: 'Rayon de la coupe de la 3-sphère unité à w = 0,8 ?', answer: 0.6, tol: 0.01, hint: '√(1 − 0,64).', explain: '√0,36 = 0,6.' },
      {
        kind: 'task',
        q: 'Tesseract, orientation SOMMET, traversée coupée : trouve une coupe en OCTAÈDRE (6 sommets, 8 faces).',
        check: (a) => a.pressed('TESSERACT') && a.pressed('SOMMET') && a.get('TRAVERSÉE AUTOMATIQUE') === false && a.num('SOMMETS') === 6 && a.num('FACES') === 8,
        uses: ['TESSERACT', 'SOMMET', 'TRAVERSÉE AUTOMATIQUE', 'SOMMETS', 'FACES', 'w = c'],
        hint: 'Place w = c près de 0, au milieu de la traversée.',
        explain: 'Coupé en son milieu perpendiculairement à une grande diagonale, le tesseract donne un octaèdre régulier.',
      },
    ],
  },
  hopf: {
    lesson: {
      objective: 'Découvrir la fibration de Hopf : la 3-sphère remplie de cercles qui s’enlacent tous deux à deux.',
      notions: [
        'S³ = {(z₁, z₂) ∈ ℂ² : |z₁|² + |z₂|² = 1}.',
        'Chaque point de la sphère ordinaire S² correspond à un grand cercle (une fibre) de S³.',
        'Deux fibres distinctes sont enlacées une fois.',
        'Les fibres au-dessus d’un parallèle de S² forment un tore de Clifford.',
      ],
      observe: [
        'Mets PARALLÈLES SUR S² à 1 : un seul tore apparaît.',
        'Augmente FIBRES PAR PARALLÈLE : les cercles se resserrent.',
        'Passe en TORE DE CLIFFORD : les fibres sont des cercles de Villarceau.',
      ],
      formula: 'h(z_1,z_2)=\\big(2z_1\\overline{z_2},\\ |z_1|^2-|z_2|^2\\big)\\in S^2',
      fact: 'Heinz Hopf (1931) a montré que cette application ne peut pas être déformée en une application constante : un résultat fondateur de la topologie.',
    },
    exercises: [
      { kind: 'qcm', q: 'Une fibre de Hopf est…', choices: ['un point', 'un cercle', 'une sphère', 'un tore'], answer: 1, hint: 'h⁻¹(p) ≃ S¹.', explain: 'Chaque fibre est un grand cercle de S³.' },
      { kind: 'num', q: 'Sur le tore de Clifford, |z₁| = |z₂|. Que vaut |z₁|² ?', answer: 0.5, tol: 0.01, hint: '|z₁|² + |z₂|² = 1.', explain: '2|z₁|² = 1, donc |z₁|² = 1/2.' },
      {
        kind: 'task',
        q: 'Mode FIBRATION avec un seul parallèle et au moins 24 fibres.',
        check: (a) => a.pressed('FIBRATION') && Number(a.get('PARALLÈLES SUR S²')) === 1 && Number(a.get('FIBRES PAR PARALLÈLE')) >= 24,
        uses: ['FIBRATION', 'PARALLÈLES SUR S²', 'FIBRES PAR PARALLÈLE'],
        hint: 'Les deux curseurs sont dans la section FIBRES.',
        explain: 'Un seul parallèle de S² donne un tore entièrement tapissé de cercles enlacés.',
      },
    ],
  },
  surfaces: {
    lesson: {
      objective: 'Explorer des surfaces paramétrées et leurs invariants : orientabilité et caractéristique d’Euler χ.',
      notions: [
        'Une surface paramétrée associe à chaque couple (u, v) un point (x, y, z).',
        'Orientable : on peut distinguer deux faces ; le ruban de Möbius et la bouteille de Klein ne le sont pas.',
        'χ = S − A + F vaut 2 pour la sphère, 0 pour le tore et la bouteille de Klein, 1 pour le plan projectif (Boy).',
        'Klein et Boy se recoupent dans ℝ³ : ce sont des immersions.',
      ],
      observe: [
        'MÖBIUS : passe DEMI-TORSIONS à 2, la surface redevient orientable.',
        'Active l’OCCLUSION pour masquer les lignes cachées.',
        'PERSO : essaie les exemples HÉLICOÏDE ou COQUILLAGE, puis tes propres formules.',
      ],
      formula: '\\chi=S-A+F,\\quad \\chi(\\text{sphère})=2,\\ \\chi(\\text{tore})=0,\\ \\chi(\\mathbb RP^2)=1',
      fact: 'August Möbius et Johann Listing ont découvert le ruban indépendamment, la même année : 1858.',
    },
    exercises: [
      { kind: 'qcm', q: 'Laquelle de ces surfaces est orientable ?', choices: ['le ruban de Möbius', 'la bouteille de Klein', 'le tore', 'la surface de Boy'], answer: 2, hint: 'Une seule a un intérieur et un extérieur.', explain: 'Le tore est orientable ; les trois autres ne le sont pas.' },
      { kind: 'num', q: 'Un cube a 8 sommets et 6 faces. Combien a-t-il d’arêtes (χ = 2) ?', answer: 12, tol: 0.5, hint: 'S − A + F = 2.', explain: '8 − A + 6 = 2, donc A = 12.' },
      {
        kind: 'task',
        q: 'Affiche un ruban de MÖBIUS à 3 demi-torsions.',
        check: (a) => a.pressed('MÖBIUS') && Number(a.get('DEMI-TORSIONS')) === 3,
        uses: ['MÖBIUS', 'DEMI-TORSIONS'],
        hint: 'Le curseur DEMI-TORSIONS apparaît quand MÖBIUS est choisi.',
        explain: 'Un nombre impair de demi-torsions donne toujours une surface à une seule face.',
      },
    ],
  },
};
