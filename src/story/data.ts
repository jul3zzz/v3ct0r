// V3CT0R · mode histoire « LA GRANDE ENTROPIE » (STORY.md). Pure data: acts, chapters (beacons of
// the open world), the ship's log, the timeline and the ship parts. Unit-tested: ids, links to
// games / views / courses, dates inside each act. Facts only; uncertain dates say « vers ».

export type Theme = 'nombre' | 'géométrie' | 'analyse' | 'dimensions' | 'hasard' | 'chaos' | 'logique' | 'signal';

export interface Act {
  n: number;
  roman: string;
  title: string;
  period: string;
  theme: string;
  /** acts that must be restored first */
  after: number[];
  /** what MNÉMOSYNE says when the act opens */
  intro: string;
  /** the « À SUIVRE » card shown once the act is restored (rich text) */
  end?: string;
}

export interface Chapter {
  id: string;
  act: number;
  /** "I.4" */
  code: string;
  title: string;
  /** year for the spiral of time (negative: before our era) */
  year: number;
  /** "vers −300", "1687" */
  when: string;
  place: string;
  /** ship's log entry by MNÉMOSYNE (rich text: paragraphs, $…$) */
  log: string;
  /** the mission: a leçon-jeu (period game or existing game); none: the log is the chapter */
  game?: string;
  /** ship part earned */
  reward?: string;
  view?: string;
  course?: string;
  /** false: beacon visible in the fog, mission not built yet */
  ready: boolean;
}

export interface TimelineEvent {
  id: string;
  year: number;
  when: string;
  title: string;
  who: string;
  text: string;
  theme: Theme;
  /** unlocked when this chapter is restored */
  chapter: string;
}

export interface ShipPart {
  id: string;
  title: string;
  act: number;
  effect: string;
  idea: string;
  /** effect implemented in the ATLAS flight (others are listed as « bientôt ») */
  live: boolean;
}

export const ACTS: Act[] = [
  { n: 1, roman: 'I', title: 'Les Anciens', period: '−1800 → 250', theme: 'nombre, géométrie, mesure', after: [], intro: 'Le secteur central est le plus ancien et le plus abîmé. Ici, l’Entropie a mangé les nombres eux-mêmes : les décimales de $\\sqrt 2$, la taille de la Terre, le rapport du cercle à son diamètre. Commençons par une tablette d’argile.', end: 'Le secteur central est restauré. Les huit balises brillent de nouveau, et la frise couvre deux mille ans, de la tablette YBC 7289 à Diophante. Mais le bruit n’a pas reculé partout : il s’est replié vers l’extérieur de la spirale, là où les idées deviennent plus abstraites.\n\nMNÉMOSYNE : « Deux portes viennent de s’ouvrir. Derrière la première, l’infiniment petit, puis l’infini lui-même : Napier, Newton, Euler, Cantor. Derrière la seconde, une partie de dés interrompue, une aiguille sur un parquet : Pascal, Bernoulli, Buffon, Kolmogorov. Quelque part plus loin, le bruit répète un motif. Je ne sais pas encore lequel. »\n\nDeux balises sont déjà jouables : **le Duel ε-δ (II.6)** et **l’aiguille de Buffon (IV.3)**. Les autres missions des actes II et IV arrivent dans la prochaine mise à jour.' },
  { n: 2, roman: 'II', title: 'L’Infini', period: '1614 → 1891', theme: 'calcul, séries, cardinaux', after: [1], intro: 'Deux mille ans plus tard, on apprend à calculer avec l’infiniment petit, puis à compter l’infini lui-même. L’Entropie s’y est installée là où les raisonnements étaient les plus fragiles.' },
  { n: 3, roman: 'III', title: 'Les Dimensions', period: '1854 → 1931', theme: 'géométries, topologie, 4D', after: [2], intro: 'L’espace n’est plus une évidence : il se courbe, il se recolle, il gagne des dimensions. Les balises de ce secteur ne sont pas toutes là où elles semblent être.' },
  { n: 4, roman: 'IV', title: 'Le Hasard', period: '1654 → 1933', theme: 'probabilités', after: [1], intro: 'Une partie de dés interrompue, une aiguille qui tombe sur un parquet : le hasard devient calculable. Dans ce secteur, l’Entropie ressemble à ce qu’elle combat.' },
  { n: 5, roman: 'V', title: 'Le Chaos', period: '1890 → 1980', theme: 'systèmes dynamiques, fractales', after: [3, 4], intro: 'Des équations simples, des trajectoires imprévisibles. Ici, une erreur d’un millionième finit toujours par tout changer.' },
  { n: 6, roman: 'VI', title: 'Les Limites', period: '1900 → 1936', theme: 'logique, calculabilité', after: [2], intro: 'Les mathématiques se retournent sur elles-mêmes : que peut-on démontrer, que peut-on calculer ? Attention : certaines balises de ce secteur se contredisent.' },
  { n: 7, roman: 'VII', title: 'Le Signal', period: '1822 → 2003', theme: 'premiers, fréquences, information', after: [3, 5, 6], intro: 'Le bruit change de nature. Passé à l’analyse de Fourier, il n’est plus blanc. Il y a quelque chose dedans.' },
];

export const CHAPTERS: Chapter[] = [
  // ── ACTE I ────────────────────────────────────────────────────────────────────────────────────
  {
    id: 'babylone', act: 1, code: 'I.1', title: 'La tablette YBC 7289', year: -1800, when: 'vers −1800', place: 'Mésopotamie',
    log: 'Une petite tablette d’argile ronde, de la taille d’une paume, aujourd’hui conservée à l’université Yale. Un carré, ses deux diagonales, et des nombres écrits en base 60. Sur la diagonale : $1;24,51,10$, c’est-à-dire $1 + \\frac{24}{60} + \\frac{51}{60^2} + \\frac{10}{60^3} \\approx 1{,}414\\,212\\,96$. C’est $\\sqrt 2$ à moins d’un millionième près. Juste dessous, $42;25,35$ : la diagonale d’un carré de côté $30$.\n\nLa tablette ne dit pas comment le scribe a obtenu cette valeur. Une reconstruction plausible : partir d’un rectangle d’aire $2$ et le rendre de plus en plus carré, en remplaçant le côté $x$ par la moyenne de $x$ et de $\\frac{2}{x}$. C’est la méthode de Héron, et c’est déjà la méthode de Newton.\n\nL’Entropie a effacé les chiffres après le point-virgule. Sans eux, $\\sqrt 2$ n’est plus qu’un mot. À toi de les retrouver.',
    game: 'babylon', reward: 'sexagesimal', view: 'constants/sqrt2', ready: true,
  },
  {
    id: 'rhind', act: 1, code: 'I.2', title: 'Le papyrus Rhind', year: -1650, when: 'vers −1650', place: 'Égypte',
    log: 'Un rouleau de plus de cinq mètres, copié vers −1650 par le scribe Ahmès d’après un texte plus ancien, aujourd’hui au British Museum. Plus de quatre-vingts problèmes résolus : partages de pains, volumes de greniers, pentes de pyramides.\n\nLes Égyptiens n’écrivent que des fractions de numérateur $1$ (et $\\frac23$). Le papyrus s’ouvre donc sur une table : $\\frac{2}{n}$ en somme de fractions unitaires distinctes, pour $n$ impair de $5$ à $101$. Par exemple $\\frac25 = \\frac13 + \\frac{1}{15}$. On y trouve aussi l’aire d’un disque de diamètre $9$ calculée comme celle d’un carré de côté $8$, ce qui revient à prendre $\\pi \\approx \\frac{256}{81} \\approx 3{,}16$.\n\nCe chapitre se lit : la mission « Fractions du scribe » viendra plus tard. Consigne-le pour continuer.',
    view: 'constants/pi', ready: true,
  },
  {
    id: 'zenon', act: 1, code: 'I.3', title: 'Zénon d’Élée', year: -450, when: 'vers −450', place: 'Élée, Grande-Grèce',
    log: 'Nous ne connaissons les paradoxes de Zénon que par d’autres, Aristote surtout. Achille court après une tortue partie avec de l’avance. Quand il atteint le point de départ de la tortue, elle a avancé ; quand il atteint ce nouveau point, elle a encore avancé ; et ainsi de suite, une infinité de fois. Comment pourrait-il la rattraper ?\n\nLa réponse mathématique demandera vingt siècles : une infinité d’étapes peut tenir dans une durée finie, parce que $\\frac12 + \\frac14 + \\frac18 + \\cdots = 1$. Il faudra pour cela une définition de la limite d’une suite et de la somme d’une série.\n\nL’Entropie aime ce paradoxe : c’est une porte entrouverte vers l’infini. Le secteur II est derrière.',
    view: 'principles/limits', course: 'suites-series', ready: true,
  },
  {
    id: 'euclide', act: 1, code: 'I.4', title: 'Les Éléments d’Euclide', year: -300, when: 'vers −300', place: 'Alexandrie',
    log: 'De la vie d’Euclide, on ne sait presque rien. Ses *Éléments*, en treize livres, ont été copiés, traduits et enseignés pendant plus de deux mille ans. Pour la première fois, tout part de définitions, de postulats et de notions communes, et chaque proposition est démontrée à partir des précédentes.\n\nLe livre VII commence par un procédé que l’on pratique encore : pour trouver la plus grande mesure commune de deux longueurs, on retranche la plus petite de la plus grande autant de fois que possible, puis on recommence avec le reste. Géométriquement, on découpe un rectangle en carrés, le plus grand possible à chaque fois ; le dernier carré mesure le PGCD. Le livre IX démontre qu’il y a une infinité de nombres premiers.\n\nL’Entropie a brouillé le découpage. Reprends-le, carré par carré.',
    game: 'euclid', reward: 'compas', view: 'principles/primes', ready: true,
  },
  {
    id: 'eratosthene', act: 1, code: 'I.5', title: 'Ératosthène mesure la Terre', year: -240, when: 'vers −240', place: 'Alexandrie et Syène',
    log: 'Ératosthène de Cyrène dirige la bibliothèque d’Alexandrie. Il sait qu’à Syène (Assouan), à midi au solstice d’été, le Soleil est au zénith : un bâton vertical n’y fait pas d’ombre. Le même jour à Alexandrie, plus au nord, l’ombre d’un gnomon fait un angle d’environ un cinquantième de cercle, soit $7{,}2°$.\n\nSi les rayons du Soleil sont parallèles, cet angle est aussi l’angle au centre de la Terre entre les deux villes. Les deux villes étant distantes d’environ $5\\,000$ stades, le tour de la Terre vaut $50 \\times 5\\,000 = 250\\,000$ stades. Selon la longueur du stade, entre $39\\,000$ et $46\\,000$ kilomètres : le bon ordre de grandeur, obtenu avec un bâton et un raisonnement. Le récit nous vient de Cléomède.\n\nL’Entropie a effacé l’ombre. Mesure-la.',
    game: 'eratosthenes', reward: 'gnomon', ready: true,
  },
  {
    id: 'crible', act: 1, code: 'I.6', title: 'Le crible', year: -230, when: 'vers −230', place: 'Alexandrie',
    log: 'Nicomaque de Gérase, vers l’an 100, attribue à Ératosthène un procédé pour trouver les nombres premiers : écrire les nombres à la suite, puis barrer les multiples de $2$, de $3$, de $5$, et ainsi de suite. Ce qui reste est premier. Il suffit de cribler jusqu’à la racine carrée de la borne.\n\nLes nombres premiers sont les atomes de l’arithmétique : tout entier s’écrit de façon unique comme produit de premiers. Euclide a montré qu’il y en a une infinité ; leur répartition reste, aujourd’hui encore, l’un des plus grands mystères des mathématiques.\n\nL’Entropie a semé des faux premiers dans le secteur. Ne tire que sur les vrais.',
    game: 'prime-hunt', view: 'principles/primes', ready: true,
  },
  {
    id: 'archimede', act: 1, code: 'I.7', title: 'Archimède et le cercle', year: -250, when: 'vers −250', place: 'Syracuse',
    log: 'Dans *La mesure du cercle*, Archimède encadre le périmètre d’un cercle entre ceux de deux polygones réguliers, l’un inscrit, l’autre circonscrit. Il part de l’hexagone, double le nombre de côtés quatre fois, et arrive à $96$ côtés : $3 + \\frac{10}{71} < \\pi < 3 + \\frac17$.\n\nLe plus remarquable est la rigueur : chaque racine carrée est arrondie dans le bon sens, pour que les bornes restent des bornes. Aujourd’hui, on écrit le doublement avec deux moyennes : la moyenne **harmonique** donne le nouveau polygone circonscrit, la moyenne **géométrique** le nouveau polygone inscrit.\n\nArchimède meurt en −212, pendant le siège de Syracuse. L’Entropie a confondu les deux polygones : remets chaque moyenne à sa place.',
    game: 'archimedes', reward: 'levier', view: 'constants/pi', ready: true,
  },
  {
    id: 'diophante', act: 1, code: 'I.8', title: 'Diophante', year: 250, when: 'vers 250', place: 'Alexandrie',
    log: 'L’*Arithmetica* de Diophante cherche des solutions entières ou rationnelles à des équations : on les appelle aujourd’hui équations diophantiennes. Sur treize livres, six nous sont parvenus en grec, et quatre autres ont été retrouvés en traduction arabe au XXᵉ siècle.\n\nC’est dans la marge d’une édition latine de ce livre que Pierre de Fermat écrira, vers 1637, qu’il ne peut exister d’entiers non nuls tels que $x^n + y^n = z^n$ pour $n \\ge 3$, et qu’il en a une démonstration que la marge est trop étroite pour contenir. Il faudra attendre 1994.\n\nAvec Diophante, le secteur central est restauré. Deux portes s’ouvrent : l’Infini et le Hasard.',
    ready: true,
  },
  // ── ACTE II ───────────────────────────────────────────────────────────────────────────────────
  { id: 'napier', act: 2, code: 'II.1', title: 'Les logarithmes de Napier', year: 1614, when: '1614', place: 'Édimbourg', log: 'John Napier publie ses tables de logarithmes : multiplier devient additionner. Les astronomes gagnent des années de calcul. Mission « La règle à calcul » en préparation.', ready: false },
  { id: 'descartes', act: 2, code: 'II.2', title: 'Descartes et Fermat', year: 1637, when: '1637', place: 'Leyde', log: '*La Géométrie* de Descartes : une courbe devient une équation. Fermat, de son côté, développe les mêmes idées. Mission « Coordonnées » en préparation.', ready: false },
  { id: 'newton', act: 2, code: 'II.3', title: 'Le boulet de Newton', year: 1687, when: '1687', place: 'Cambridge', log: 'Les *Principia* : une même loi en $\\frac{1}{r^2}$ fait tomber les pommes et tourner la Lune. Mission « Mise en orbite » en préparation.', ready: false },
  { id: 'bale', act: 2, code: 'II.4', title: 'Le problème de Bâle', year: 1734, when: '1734', place: 'Saint-Pétersbourg', log: 'Euler trouve que $\\sum \\frac{1}{n^2} = \\frac{\\pi^2}{6}$. Personne ne l’attendait : que vient faire $\\pi$ dans une somme d’inverses de carrés ? Mission « La somme d’Euler » en préparation.', view: 'constants/zeta3', ready: false },
  { id: 'konigsberg', act: 2, code: 'II.5', title: 'Les ponts de Königsberg', year: 1736, when: '1736', place: 'Königsberg', log: 'Peut-on traverser les sept ponts de la ville une fois chacun ? Euler montre que non, et invente sans le savoir la théorie des graphes. Mission « Les sept ponts » en préparation.', ready: false },
  {
    id: 'cauchy', act: 2, code: 'II.6', title: 'Le duel ε-δ', year: 1821, when: '1821 → 1872', place: 'Paris, Berlin',
    log: 'Pendant un siècle et demi, le calcul infinitésimal fonctionne sans fondement solide : on manipule des quantités « évanouissantes » sans dire ce qu’elles sont. En 1821, le *Cours d’analyse* de Cauchy pose les limites au centre. Weierstrass, dans ses cours à Berlin, leur donne la forme définitive : pour tout $\\varepsilon > 0$, il existe $\\delta > 0$…\n\nEn 1872, il présente une fonction continue partout et dérivable nulle part. L’intuition géométrique ne suffit plus ; seule la définition tient.\n\nL’Entropie joue l’adversaire : elle choisit $\\varepsilon$, tu dois trouver $\\delta$.',
    game: 'duel-eps', view: 'principles/limits', course: 'suites-series', ready: true,
  },
  { id: 'cantor', act: 2, code: 'II.7', title: 'La diagonale de Cantor', year: 1891, when: '1891', place: 'Halle', log: 'Il y a plusieurs infinis. L’ensemble des réels ne peut pas être mis en liste : l’argument diagonal construit toujours un réel absent. Mission « La diagonale » en préparation.', view: 'principles/cantor', ready: false },
  // ── ACTE III ──────────────────────────────────────────────────────────────────────────────────
  { id: 'riemann', act: 3, code: 'III.1', title: 'L’habilitation de Riemann', year: 1854, when: '1854', place: 'Göttingen', log: '« Sur les hypothèses qui servent de fondement à la géométrie » : l’espace peut être courbe, et sa courbure se mesure de l’intérieur. Mission « Géodésiques » en préparation.', ready: false },
  { id: 'mobius', act: 3, code: 'III.2', title: 'Le ruban de Möbius', year: 1858, when: '1858', place: 'Leipzig', log: 'Möbius et Listing découvrent, indépendamment, une surface à un seul côté. Mission « Recollements » en préparation.', ready: false },
  { id: 'flatland', act: 3, code: 'III.3', title: 'Flatland', year: 1884, when: '1884', place: 'Londres', log: 'Edwin Abbott raconte la vie d’un carré dans un monde plat, visité par une sphère : comment percevoir une dimension de plus ? Mission « Tranches » en préparation.', view: '4d/slices', ready: false },
  {
    id: 'hinton', act: 3, code: 'III.4', title: 'Le tesseract de Hinton', year: 1888, when: '1888', place: 'Londres',
    log: 'Charles Howard Hinton publie *A New Era of Thought* et y introduit le mot « tesseract » pour l’hypercube de dimension 4 : seize sommets, trente-deux arêtes, vingt-quatre faces carrées, huit cellules cubiques. Il passe des années à essayer de se le représenter, avec des jeux de cubes colorés.\n\nOn ne voit pas la quatrième dimension ; on la reconstruit par ses projections et ses coupes, comme les habitants de Flatland devinent une sphère à ses cercles successifs.\n\nL’Entropie a caché ses balises le long de l’axe w. Pilote dans les quatre dimensions.',
    game: 'pilot-4d', reward: 'vision4d', view: '4d/polytopes', ready: true,
  },
  { id: 'poincare-topo', act: 3, code: 'III.5', title: 'Analysis Situs', year: 1895, when: '1895', place: 'Paris', log: 'Poincaré fonde la topologie algébrique. En 1904, il pose la question qui restera ouverte un siècle : une variété compacte de dimension 3 où tout lacet se resserre est-elle une sphère ? Mission « Lacets » en préparation.', ready: false },
  { id: 'hopf', act: 3, code: 'III.6', title: 'La fibration de Hopf', year: 1931, when: '1931', place: 'Zurich', log: 'Heinz Hopf découpe la sphère de dimension 3 en cercles, deux à deux enlacés. Récit en préparation.', view: '4d/hopf', ready: false },
  // ── ACTE IV ───────────────────────────────────────────────────────────────────────────────────
  { id: 'partis', act: 4, code: 'IV.1', title: 'Le problème des partis', year: 1654, when: '1654', place: 'Paris, Toulouse', log: 'Pascal et Fermat s’écrivent : comment partager équitablement les mises d’une partie interrompue ? Le calcul des probabilités commence. Mission « Partager les mises » en préparation.', ready: false },
  { id: 'bernoulli', act: 4, code: 'IV.2', title: 'La loi des grands nombres', year: 1713, when: '1713', place: 'Bâle', log: 'L’*Ars Conjectandi* de Jacques Bernoulli, publié après sa mort : la fréquence observée se rapproche de la probabilité. Mission « Le pari de Bernoulli » en préparation.', view: 'probability/lln', ready: false },
  {
    id: 'buffon', act: 4, code: 'IV.3', title: 'L’aiguille de Buffon', year: 1777, when: '1777', place: 'Paris',
    log: 'Georges-Louis Leclerc, comte de Buffon, naturaliste, pose en 1733 une question de jeu : on lance une aiguille sur un parquet de lames parallèles ; quelle est la probabilité qu’elle tombe à cheval sur une rainure ? Il publie la réponse en 1777 dans son *Essai d’arithmétique morale*.\n\nPour une aiguille de longueur $\\ell$ et des lames de largeur $d \\ge \\ell$, la probabilité vaut $\\frac{2\\ell}{\\pi d}$. Le nombre $\\pi$ surgit d’une expérience de hasard : en lançant beaucoup d’aiguilles, on peut l’estimer, très lentement.\n\nL’Entropie truque le parquet. Parie juste.',
    game: 'buffon-casino', view: 'probability/buffon', ready: true,
  },
  { id: 'galton', act: 4, code: 'IV.4', title: 'La planche de Galton', year: 1889, when: '1889', place: 'Londres', log: 'Des billes tombent sur des clous et dessinent une cloche : la loi normale apparaît dès qu’on additionne beaucoup de petits hasards indépendants. Mission « Prédire la cloche » en préparation.', view: 'probability/galton', ready: false },
  { id: 'bertrand', act: 4, code: 'IV.5', title: 'Le paradoxe de Bertrand', year: 1889, when: '1889', place: 'Paris', log: 'Quelle est la probabilité qu’une corde « choisie au hasard » soit plus longue que le côté du triangle équilatéral inscrit ? Trois méthodes, trois réponses. Mission « Trois cordes » en préparation.', ready: false },
  { id: 'kolmogorov', act: 4, code: 'IV.6', title: 'Les axiomes de Kolmogorov', year: 1933, when: '1933', place: 'Moscou', log: 'Andreï Kolmogorov fonde les probabilités sur la théorie de la mesure : le hasard devient une branche des mathématiques comme une autre. Récit en préparation.', ready: false },
  // ── ACTE V ────────────────────────────────────────────────────────────────────────────────────
  { id: 'trois-corps', act: 5, code: 'V.1', title: 'Le problème des trois corps', year: 1890, when: '1890', place: 'Stockholm, Paris', log: 'Le mémoire de Poincaré pour le prix du roi Oscar II révèle des trajectoires d’une complexité inouïe : le chaos est né, soixante-dix ans avant son nom. Mission « Trois corps » en préparation.', ready: false },
  { id: 'julia', act: 5, code: 'V.2', title: 'Julia et Fatou', year: 1918, when: '1918', place: 'Paris', log: 'Gaston Julia et Pierre Fatou étudient l’itération des fractions rationnelles. Leurs ensembles ne seront vus qu’avec les ordinateurs. Récit en préparation.', view: 'fractals/julia', ready: false },
  { id: 'lorenz', act: 5, code: 'V.3', title: 'L’effet papillon', year: 1963, when: '1963', place: 'MIT', log: 'Edward Lorenz relance une simulation météo avec un nombre arrondi : la prévision diverge complètement. Mission « Les deux papillons » en préparation.', view: 'fractals/attractors', ready: false },
  { id: 'logistique', act: 5, code: 'V.4', title: 'La suite logistique', year: 1976, when: '1976 → 1978', place: 'Princeton, Los Alamos', log: 'Robert May montre la richesse de $x \\mapsto r x (1 - x)$ ; Mitchell Feigenbaum découvre une constante universelle dans ses doublements de période. Mission « Le doublement de période » en préparation.', ready: false },
  {
    id: 'mandelbrot', act: 5, code: 'V.5', title: 'L’ensemble de Mandelbrot', year: 1980, when: '1980', place: 'IBM, Yorktown Heights',
    log: 'Benoît Mandelbrot, qui a forgé le mot « fractale » en 1975, obtient en 1980 les premières images de l’ensemble qui porte aujourd’hui son nom : les nombres complexes $c$ pour lesquels la suite $z_{n+1} = z_n^2 + c$, partie de $0$, reste bornée.\n\nUne formule d’une ligne, un bord d’une complexité infinie : chaque zoom révèle de nouvelles copies, jamais tout à fait identiques. Adrien Douady et John Hubbard démontrent en 1982 que l’ensemble est connexe.\n\nL’Entropie s’est réfugiée dans les replis du bord. Plonge.',
    game: 'mandel-dive', reward: 'scanner', view: 'fractals/mandelbrot', ready: true,
  },
  // ── ACTE VI ───────────────────────────────────────────────────────────────────────────────────
  { id: 'hilbert', act: 6, code: 'VI.1', title: 'Les 23 problèmes', year: 1900, when: '1900', place: 'Paris', log: 'Au congrès international de Paris, David Hilbert présente les problèmes qui doivent guider le siècle. Mission « Le programme de Hilbert » en préparation.', ready: false },
  { id: 'russell', act: 6, code: 'VI.2', title: 'Le paradoxe de Russell', year: 1901, when: '1901', place: 'Cambridge', log: 'L’ensemble de tous les ensembles qui ne se contiennent pas eux-mêmes se contient-il ? Les deux réponses mènent à une contradiction. Mission « Le catalogue » en préparation.', ready: false },
  { id: 'godel', act: 6, code: 'VI.3', title: 'L’incomplétude', year: 1931, when: '1931', place: 'Vienne', log: 'Kurt Gödel montre que toute théorie cohérente assez riche pour l’arithmétique contient des énoncés vrais qu’elle ne peut pas démontrer. Mission « L’énoncé qui parle de lui-même » en préparation.', ready: false },
  { id: 'turing', act: 6, code: 'VI.4', title: 'La machine de Turing', year: 1936, when: '1936', place: 'Cambridge', log: 'Alan Turing définit le calcul par une machine imaginaire et prouve qu’aucune machine ne peut décider si une autre s’arrête. Mission « Programmer la machine » en préparation.', ready: false },
  // ── ACTE VII ──────────────────────────────────────────────────────────────────────────────────
  {
    id: 'fourier', act: 7, code: 'VII.1', title: 'Fourier', year: 1822, when: '1822', place: 'Paris',
    log: 'Dans sa *Théorie analytique de la chaleur*, Joseph Fourier affirme qu’une fonction quelconque se décompose en somme de sinusoïdes. L’affirmation, trop générale, mettra un siècle à être précisée ; l’idée, elle, est partout : son, image, signal.\n\nMNÉMOSYNE : « J’ai passé le bruit dans l’analyse de Fourier. Il n’est pas blanc. Certaines fréquences reviennent. »\n\nDessine-les.',
    game: 'fourier-painter', reward: 'antenne', view: 'principles/fourier', ready: true,
  },
  {
    id: 'premiers', act: 7, code: 'VII.2', title: 'Riemann et les premiers', year: 1859, when: '1859 → 1896', place: 'Göttingen, Paris, Louvain',
    log: 'En 1859, dans un article de huit pages, Riemann relie la répartition des nombres premiers aux zéros de la fonction $\\zeta$, et formule l’hypothèse qui porte son nom, toujours ouverte. En 1896, Hadamard et de la Vallée Poussin démontrent indépendamment le théorème des nombres premiers : il y a environ $\\frac{x}{\\ln x}$ premiers inférieurs à $x$.\n\nMNÉMOSYNE : « Les pics du spectre tombent sur des nombres premiers. Ce n’est pas du bruit. C’est un message. »',
    game: 'prime-hunt', view: 'principles/zeta', ready: true,
  },
  { id: 'shannon', act: 7, code: 'VII.3', title: 'Shannon', year: 1948, when: '1948', place: 'Bell Labs', log: 'Claude Shannon mesure l’information d’un message, et la capacité d’un canal bruité. Mission « Coder le bruit » en préparation.', ready: false },
  { id: 'arecibo', act: 7, code: 'VII.4', title: 'Le message d’Arecibo', year: 1974, when: '1974', place: 'Arecibo, Porto Rico', log: 'Le 16 novembre 1974, un message de 1 679 bits est émis vers l’amas M13. 1 679 = 23 × 73 : un produit de deux premiers, pour qu’on sache comment ranger les bits en image. Mission « 1 679 bits » en préparation.', ready: false },
  { id: 'wiles', act: 7, code: 'VII.5', title: 'Fermat, enfin', year: 1994, when: '1994', place: 'Princeton', log: 'Andrew Wiles, avec l’aide de Richard Taylor, démontre le grand théorème de Fermat, trois cent cinquante ans après la note dans la marge. Récit en préparation.', ready: false },
  { id: 'perelman', act: 7, code: 'VII.6', title: 'Poincaré, enfin', year: 2003, when: '2003', place: 'Saint-Pétersbourg', log: 'Grigori Perelman démontre la conjecture de Poincaré. Le Signal attend une réponse. Final en préparation.', ready: false },
];

export const PARTS: ShipPart[] = [
  { id: 'sexagesimal', title: 'Calculateur sexagésimal', act: 1, effect: 'distances affichées au dixième près', idea: 'une base de numération de position', live: true },
  { id: 'compas', title: 'Compas d’Euclide', act: 1, effect: 'touche X : approche automatique de la balise visée', idea: 'constructions à la règle et au compas', live: true },
  { id: 'gnomon', title: 'Gnomon', act: 1, effect: 'télémètre : distance à la cible dans le viseur', idea: 'mesurer par les angles', live: true },
  { id: 'levier', title: 'Levier d’Archimède', act: 1, effect: 'boost ×1,5 dans la Grande Entropie', idea: 'la méthode d’exhaustion', live: true },
  { id: 'vision4d', title: 'Vision 4D', act: 3, effect: 'révèle les reliques cachées', idea: 'la quatrième dimension', live: false },
  { id: 'scanner', title: 'Scanner fractal', act: 5, effect: 'zoom de détail sur les balises', idea: 'l’autosimilarité', live: false },
  { id: 'antenne', title: 'Antenne de Fourier', act: 7, effect: 'entend le Signal', idea: 'l’analyse harmonique', live: false },
];

export const EVENTS: TimelineEvent[] = [
  { id: 'ybc7289', year: -1800, when: 'vers −1800', title: 'La tablette YBC 7289', who: 'scribe babylonien', text: '$\\sqrt2$ en base 60 : $1;24,51,10$, à moins d’un millionième près.', theme: 'nombre', chapter: 'babylone' },
  { id: 'plimpton', year: -1800, when: 'vers −1800', title: 'Plimpton 322', who: 'scribe babylonien', text: 'Une tablette de quinze lignes liées à des triplets pythagoriciens.', theme: 'nombre', chapter: 'babylone' },
  { id: 'rhind', year: -1650, when: 'vers −1650', title: 'Le papyrus Rhind', who: 'Ahmès', text: 'Fractions unitaires, partages, volumes ; $\\pi \\approx \\frac{256}{81}$.', theme: 'nombre', chapter: 'rhind' },
  { id: 'pythagore', year: -530, when: 'vers −530', title: 'L’école pythagoricienne', who: 'Pythagore et ses disciples', text: 'Les nombres comme principe ; la découverte de grandeurs incommensurables est attribuée à l’école.', theme: 'géométrie', chapter: 'zenon' },
  { id: 'zenon', year: -450, when: 'vers −450', title: 'Les paradoxes de Zénon', who: 'Zénon d’Élée', text: 'Achille, la dichotomie, la flèche : l’infini divise le mouvement.', theme: 'analyse', chapter: 'zenon' },
  { id: 'elements', year: -300, when: 'vers −300', title: 'Les Éléments', who: 'Euclide', text: 'Définitions, postulats, démonstrations ; l’algorithme du PGCD (livre VII), l’infinité des premiers (livre IX).', theme: 'géométrie', chapter: 'euclide' },
  { id: 'cercle', year: -250, when: 'vers −250', title: 'La mesure du cercle', who: 'Archimède', text: '$3 + \\frac{10}{71} < \\pi < 3 + \\frac17$, par des polygones à 96 côtés.', theme: 'géométrie', chapter: 'archimede' },
  { id: 'parabole', year: -240, when: 'vers −240', title: 'La quadrature de la parabole', who: 'Archimède', text: 'Un segment de parabole vaut $\\frac43$ du triangle inscrit : une série géométrique avant l’heure.', theme: 'analyse', chapter: 'archimede' },
  { id: 'terre', year: -240, when: 'vers −240', title: 'La circonférence de la Terre', who: 'Ératosthène', text: 'Un cinquantième de cercle entre Syène et Alexandrie : $250\\,000$ stades.', theme: 'géométrie', chapter: 'eratosthene' },
  { id: 'crible', year: -230, when: 'vers −230', title: 'Le crible', who: 'Ératosthène (selon Nicomaque)', text: 'Barrer les multiples ; ce qui reste est premier.', theme: 'nombre', chapter: 'crible' },
  { id: 'arithmetica', year: 250, when: 'vers 250', title: 'L’Arithmetica', who: 'Diophante', text: 'Des équations dont on cherche les solutions entières ou rationnelles.', theme: 'nombre', chapter: 'diophante' },
  { id: 'logarithmes', year: 1614, when: '1614', title: 'Les logarithmes', who: 'John Napier', text: 'Multiplier en additionnant.', theme: 'analyse', chapter: 'napier' },
  { id: 'geometrie', year: 1637, when: '1637', title: 'La Géométrie', who: 'René Descartes', text: 'Les courbes deviennent des équations.', theme: 'géométrie', chapter: 'descartes' },
  { id: 'fermat-note', year: 1637, when: 'vers 1637', title: 'La note de Fermat', who: 'Pierre de Fermat', text: 'Pas de solution entière non nulle à $x^n + y^n = z^n$ pour $n \\ge 3$… « la marge est trop étroite ».', theme: 'nombre', chapter: 'diophante' },
  { id: 'partis', year: 1654, when: '1654', title: 'Le problème des partis', who: 'Blaise Pascal, Pierre de Fermat', text: 'Le partage équitable d’une partie interrompue : naissance du calcul des probabilités.', theme: 'hasard', chapter: 'partis' },
  { id: 'huygens', year: 1657, when: '1657', title: 'Le premier traité de probabilités', who: 'Christiaan Huygens', text: '*De ratiociniis in ludo aleae* : l’espérance d’un jeu.', theme: 'hasard', chapter: 'partis' },
  { id: 'fluxions', year: 1665, when: '1665–1666', title: 'Les fluxions', who: 'Isaac Newton', text: 'Le calcul infinitésimal, développé pendant les années de peste.', theme: 'analyse', chapter: 'newton' },
  { id: 'leibniz', year: 1684, when: '1684', title: 'Nova Methodus', who: 'Gottfried Wilhelm Leibniz', text: 'La première publication du calcul différentiel, avec la notation $dx$.', theme: 'analyse', chapter: 'newton' },
  { id: 'principia', year: 1687, when: '1687', title: 'Les Principia', who: 'Isaac Newton', text: 'La gravitation universelle en $\\frac{1}{r^2}$.', theme: 'analyse', chapter: 'newton' },
  { id: 'ars', year: 1713, when: '1713', title: 'Ars Conjectandi', who: 'Jacques Bernoulli', text: 'La loi des grands nombres, publiée après sa mort.', theme: 'hasard', chapter: 'bernoulli' },
  { id: 'moivre', year: 1733, when: '1733', title: 'La courbe en cloche', who: 'Abraham de Moivre', text: 'L’approximation de la loi binomiale par une gaussienne.', theme: 'hasard', chapter: 'galton' },
  { id: 'bale', year: 1734, when: '1734', title: 'Le problème de Bâle', who: 'Leonhard Euler', text: '$\\sum \\frac{1}{n^2} = \\frac{\\pi^2}{6}$.', theme: 'analyse', chapter: 'bale' },
  { id: 'konigsberg', year: 1736, when: '1736', title: 'Les ponts de Königsberg', who: 'Leonhard Euler', text: 'Aucun chemin ne traverse les sept ponts une fois chacun : premiers pas de la théorie des graphes.', theme: 'dimensions', chapter: 'konigsberg' },
  { id: 'introductio', year: 1748, when: '1748', title: 'Introductio in analysin infinitorum', who: 'Leonhard Euler', text: 'La formule $e^{ix} = \\cos x + i \\sin x$.', theme: 'analyse', chapter: 'bale' },
  { id: 'aiguille', year: 1777, when: '1777', title: 'L’aiguille de Buffon', who: 'Buffon', text: 'Une aiguille sur un parquet : probabilité $\\frac{2\\ell}{\\pi d}$.', theme: 'hasard', chapter: 'buffon' },
  { id: 'laplace', year: 1812, when: '1812', title: 'Théorie analytique des probabilités', who: 'Pierre-Simon Laplace', text: 'Fonctions génératrices, moindres carrés et une première forme du théorème central limite.', theme: 'hasard', chapter: 'galton' },
  { id: 'cours', year: 1821, when: '1821', title: 'Le Cours d’analyse', who: 'Augustin-Louis Cauchy', text: 'Les limites au fondement de l’analyse.', theme: 'analyse', chapter: 'cauchy' },
  { id: 'chaleur', year: 1822, when: '1822', title: 'Théorie analytique de la chaleur', who: 'Joseph Fourier', text: 'Décomposer une fonction en sinusoïdes.', theme: 'signal', chapter: 'fourier' },
  { id: 'habilitation', year: 1854, when: '1854', title: 'Les hypothèses de la géométrie', who: 'Bernhard Riemann', text: 'L’espace peut être courbe.', theme: 'dimensions', chapter: 'riemann' },
  { id: 'mobius', year: 1858, when: '1858', title: 'Le ruban de Möbius', who: 'August Möbius, Johann Listing', text: 'Une surface à un seul côté.', theme: 'dimensions', chapter: 'mobius' },
  { id: 'zeta-riemann', year: 1859, when: '1859', title: 'Sur le nombre des nombres premiers', who: 'Bernhard Riemann', text: 'Les premiers et les zéros de $\\zeta$ ; l’hypothèse de Riemann.', theme: 'signal', chapter: 'premiers' },
  { id: 'weierstrass', year: 1872, when: '1872', title: 'Le monstre de Weierstrass', who: 'Karl Weierstrass', text: 'Une fonction continue partout, dérivable nulle part.', theme: 'analyse', chapter: 'cauchy' },
  { id: 'cantor-1874', year: 1874, when: '1874', title: 'Les réels ne sont pas dénombrables', who: 'Georg Cantor', text: 'Il y a plusieurs tailles d’infini.', theme: 'logique', chapter: 'cantor' },
  { id: 'lindemann', year: 1882, when: '1882', title: '$\\pi$ est transcendant', who: 'Ferdinand von Lindemann', text: 'La quadrature du cercle à la règle et au compas est impossible.', theme: 'nombre', chapter: 'archimede' },
  { id: 'klein', year: 1882, when: '1882', title: 'La bouteille de Klein', who: 'Felix Klein', text: 'Une surface fermée sans intérieur ni extérieur.', theme: 'dimensions', chapter: 'mobius' },
  { id: 'flatland', year: 1884, when: '1884', title: 'Flatland', who: 'Edwin Abbott', text: 'Un roman pour sentir une dimension de plus.', theme: 'dimensions', chapter: 'flatland' },
  { id: 'tesseract', year: 1888, when: '1888', title: 'Le tesseract', who: 'Charles Howard Hinton', text: 'Le mot et l’image de l’hypercube.', theme: 'dimensions', chapter: 'hinton' },
  { id: 'bertrand', year: 1889, when: '1889', title: 'Le paradoxe de Bertrand', who: 'Joseph Bertrand', text: '« Au hasard » n’a de sens qu’une fois la méthode fixée.', theme: 'hasard', chapter: 'bertrand' },
  { id: 'galton', year: 1889, when: '1889', title: 'Natural Inheritance', who: 'Francis Galton', text: 'La planche à clous et la régression vers la moyenne.', theme: 'hasard', chapter: 'galton' },
  { id: 'trois-corps', year: 1890, when: '1890', title: 'Le problème des trois corps', who: 'Henri Poincaré', text: 'Des trajectoires d’une complexité inouïe : le chaos.', theme: 'chaos', chapter: 'trois-corps' },
  { id: 'diagonale', year: 1891, when: '1891', title: 'L’argument diagonal', who: 'Georg Cantor', text: 'Aucune liste ne contient tous les réels.', theme: 'logique', chapter: 'cantor' },
  { id: 'situs', year: 1895, when: '1895', title: 'Analysis Situs', who: 'Henri Poincaré', text: 'La naissance de la topologie algébrique.', theme: 'dimensions', chapter: 'poincare-topo' },
  { id: 'pnt', year: 1896, when: '1896', title: 'Le théorème des nombres premiers', who: 'Jacques Hadamard, Charles-Jean de la Vallée Poussin', text: 'Environ $\\frac{x}{\\ln x}$ premiers inférieurs à $x$.', theme: 'signal', chapter: 'premiers' },
  { id: 'hilbert', year: 1900, when: '1900', title: 'Les 23 problèmes', who: 'David Hilbert', text: 'Le programme d’un siècle.', theme: 'logique', chapter: 'hilbert' },
  { id: 'russell', year: 1901, when: '1901', title: 'Le paradoxe de Russell', who: 'Bertrand Russell', text: 'L’ensemble des ensembles qui ne se contiennent pas.', theme: 'logique', chapter: 'russell' },
  { id: 'conjecture', year: 1904, when: '1904', title: 'La conjecture de Poincaré', who: 'Henri Poincaré', text: 'Une variété où tout lacet se resserre est-elle une sphère ?', theme: 'dimensions', chapter: 'poincare-topo' },
  { id: 'minkowski', year: 1908, when: '1908', title: 'L’espace-temps', who: 'Hermann Minkowski', text: 'Le temps devient une quatrième coordonnée.', theme: 'dimensions', chapter: 'hinton' },
  { id: 'julia', year: 1918, when: '1918', title: 'L’itération des fractions rationnelles', who: 'Gaston Julia', text: 'Les ensembles de Julia, décrits sans être vus.', theme: 'chaos', chapter: 'julia' },
  { id: 'godel', year: 1931, when: '1931', title: 'L’incomplétude', who: 'Kurt Gödel', text: 'Des énoncés vrais et indémontrables.', theme: 'logique', chapter: 'godel' },
  { id: 'hopf', year: 1931, when: '1931', title: 'La fibration de Hopf', who: 'Heinz Hopf', text: 'La sphère $S^3$ découpée en cercles enlacés.', theme: 'dimensions', chapter: 'hopf' },
  { id: 'kolmogorov', year: 1933, when: '1933', title: 'Les fondements des probabilités', who: 'Andreï Kolmogorov', text: 'Le hasard axiomatisé par la théorie de la mesure.', theme: 'hasard', chapter: 'kolmogorov' },
  { id: 'turing', year: 1936, when: '1936', title: 'On Computable Numbers', who: 'Alan Turing', text: 'La machine universelle et le problème de l’arrêt.', theme: 'logique', chapter: 'turing' },
  { id: 'shannon', year: 1948, when: '1948', title: 'Une théorie mathématique de la communication', who: 'Claude Shannon', text: 'L’information se mesure en bits.', theme: 'signal', chapter: 'shannon' },
  { id: 'lorenz', year: 1963, when: '1963', title: 'Deterministic Nonperiodic Flow', who: 'Edward Lorenz', text: 'La sensibilité aux conditions initiales.', theme: 'chaos', chapter: 'lorenz' },
  { id: 'fft', year: 1965, when: '1965', title: 'La transformée de Fourier rapide', who: 'James Cooley, John Tukey', text: 'Le spectre d’un signal en $n \\log n$ opérations.', theme: 'signal', chapter: 'fourier' },
  { id: 'arecibo', year: 1974, when: '1974', title: 'Le message d’Arecibo', who: 'Frank Drake, Carl Sagan et l’équipe d’Arecibo', text: '$1\\,679 = 23 \\times 73$ bits vers l’amas M13.', theme: 'signal', chapter: 'arecibo' },
  { id: 'fractale', year: 1975, when: '1975', title: 'Le mot « fractale »', who: 'Benoît Mandelbrot', text: 'Une géométrie de l’irrégulier.', theme: 'chaos', chapter: 'mandelbrot' },
  { id: 'may', year: 1976, when: '1976', title: 'La suite logistique', who: 'Robert May', text: 'Un modèle simple aux comportements très compliqués.', theme: 'chaos', chapter: 'logistique' },
  { id: 'rsa', year: 1977, when: '1977', title: 'RSA', who: 'Ronald Rivest, Adi Shamir, Leonard Adleman', text: 'Chiffrer avec des produits de grands nombres premiers.', theme: 'signal', chapter: 'shannon' },
  { id: 'feigenbaum', year: 1978, when: '1978', title: 'La constante de Feigenbaum', who: 'Mitchell Feigenbaum', text: '$\\delta \\approx 4{,}669$ : l’universalité des doublements de période.', theme: 'chaos', chapter: 'logistique' },
  { id: 'mandelbrot', year: 1980, when: '1980', title: 'L’ensemble de Mandelbrot', who: 'Benoît Mandelbrot', text: 'Les premières images de l’ensemble.', theme: 'chaos', chapter: 'mandelbrot' },
  { id: 'wiles', year: 1994, when: '1994', title: 'Le grand théorème de Fermat', who: 'Andrew Wiles, Richard Taylor', text: 'La note de 1637 trouve sa preuve.', theme: 'nombre', chapter: 'wiles' },
  { id: 'perelman', year: 2003, when: '2003', title: 'La conjecture de Poincaré démontrée', who: 'Grigori Perelman', text: 'Un siècle après la question.', theme: 'dimensions', chapter: 'perelman' },
];

export const chapterById = (id: string): Chapter | undefined => CHAPTERS.find((c) => c.id === id);
export const actOf = (n: number): Act => ACTS.find((a) => a.n === n)!;
/** the beacon that closes an act (the highest code) */
export const lastOfAct = (n: number): Chapter | undefined =>
  CHAPTERS.filter((c) => c.act === n).sort((a, b) => Number(a.code.split('.')[1]) - Number(b.code.split('.')[1])).pop();
