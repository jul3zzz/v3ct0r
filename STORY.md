# V3CT0R · MODE HISTOIRE — « LA GRANDE ENTROPIE »

Document de conception du mode histoire de l'ATLAS. Il fixe la trame, la chronologie, les jeux d'époque, les améliorations du vaisseau, le journal de bord et la frise. Il sert de référence pour l'implémentation (`src/story/`) et pour la relecture historique : **chaque date, chaque attribution doit être exacte** ; les points incertains sont signalés « vers » ou listés en fin de document.

---

## 1. Le pitch

> Le cosmos mathématique se défait. Un bruit blanc, **l'Entropie**, ronge les idées une à une : là où il passe, les théorèmes s'effacent, les constantes perdent leurs décimales, les planètes de l'ATLAS deviennent du grain. Le vaisseau V3CT0R et son archiviste de bord, **MNÉMOSYNE**, remontent le temps des mathématiques pour rallumer chaque découverte à sa source, de la tablette babylonienne à la preuve de Perelman. Chaque idée retrouvée devient une pièce du vaisseau. Et à la fin, on comprend que le bruit n'était pas un ennemi : c'était un **message**.

- **Ton** : sobre, adulte, un peu mystérieux. Pas de héros caricaturaux : les mathématiciens sont présentés par leurs idées, à partir de faits vérifiés, sans citations inventées.
- **Promesse** : en finissant l'histoire, on a traversé 3 800 ans de mathématiques, joué une vingtaine de jeux qui font *faire* les idées, et débloqué une frise chronologique complète, reliée aux vues de l'explorateur et aux cours LEARN.
- **Différent du reste** : l'ATLAS classique est une carte du logiciel ; le mode histoire est une **région à part** de la galaxie, un monde ouvert avec sa propre progression, ses propres jeux et une fin.

---

## 2. Structure : 7 actes, un monde ouvert

La région **LA GRANDE ENTROPIE** est une nébuleuse au centre de la galaxie de l'ATLAS. On y entre comme dans un univers (⏎ à proximité, vitesse lumière). À l'intérieur, la chronologie est **dessinée dans l'espace** : une spirale qui part du centre (−1800) vers l'extérieur (2003). Chaque acte occupe un secteur de la spirale ; chaque chapitre est une **balise** (planète-époque) posée à l'endroit de sa date.

- **Monde ouvert** : on vole librement d'une balise à l'autre (ZQSD, souris, Maj pour le boost). Les actes I à VI s'ouvrent progressivement mais **peuvent être faits dans le désordre** une fois accessibles ; seuls les prérequis logiques bloquent (on ne joue pas Cantor avant d'avoir rencontré l'infini de Zénon).
- **L'Entropie visible** : les secteurs non restaurés sont noyés dans un brouillard de grain (particules bruitées, labels illisibles, glitch). Chaque chapitre réussi repousse le bruit autour de sa balise ; un acte terminé éclaircit tout son secteur.
- **Thèmes mêlés** : la trame suit le temps **et** les thèmes (géométrie, infini, dimensions, hasard, chaos, limites). Les actes se chevauchent dans le temps, comme les idées elles-mêmes.

| Acte | Titre | Période | Thème | Ce que l'Entropie a mangé |
|---|---|---|---|---|
| I | **Les Anciens** | −1800 → 250 | nombre, géométrie, mesure | les nombres irrationnels, la mesure du monde |
| II | **L'Infini** | 1614 → 1891 | calcul, séries, cardinaux | les limites, la vitesse, l'infini |
| III | **Les Dimensions** | 1854 → 1931 | géométries, topologie, 4D | la courbure, les dimensions cachées |
| IV | **Le Hasard** | 1654 → 1933 | probabilités | la loi des grands nombres, la gaussienne |
| V | **Le Chaos** | 1890 → 1980 | systèmes dynamiques, fractales | la prévisibilité, l'autosimilarité |
| VI | **Les Limites** | 1900 → 1936 | logique, calculabilité | la vérité, la démonstration |
| VII | **Le Signal** | 1822 → 2003 | premiers, fréquences, information | — tout : le bruit se met en ordre |

---

## 3. Les personnages

- **MNÉMOSYNE** — l'archiviste de bord (une IA). Elle tient le journal, parle peu, cite des dates. Elle « se souvient » au fur et à mesure que les idées reviennent : ses entrées de journal deviennent plus riches et plus personnelles au fil des actes. Au début de l'acte VII, elle comprend avant le joueur.
- **Le pilote** — le joueur. Jamais nommé.
- **Les mathématiciens** — rencontrés par leurs traces (une tablette, un manuscrit, une lettre, un article). Aucun dialogue inventé : le journal raconte ce qu'ils ont fait et pourquoi c'était nouveau.
- **L'Entropie** — un bruit. Elle ne parle pas, elle brouille. Ses « attaques » sont mathématiques : un paradoxe qui tourne en boucle (acte VI), une sensibilité aux conditions initiales (acte V), une infinité qui ne se laisse pas compter (acte II).

---

## 4. Les chapitres

Chaque chapitre = une balise = **une entrée de journal + une mission** (un jeu d'époque, ou un jeu existant recontextualisé) + des **récompenses** (pièce du vaisseau, événements de la frise, liens vers vues et cours). Note pour réussir une mission : rang C ou mieux.

### ACTE I — LES ANCIENS (−1800 → 250)
*Secteur central de la spirale, le plus dense en grain. Le vaisseau n'a ni boost ni scanner.*

| # | Balise | Date | Mission (jeu) | Récompense |
|---|---|---|---|---|
| I.1 | **La tablette YBC 7289** | vers −1800 | **Racine de Babylone** (nouveau) : approcher $\sqrt2$ par la méthode « babylonienne » (moyenne de $x$ et $2/x$), en base 60, jusqu'aux quatre chiffres de la tablette $1;24,51,10$. | **Calculateur sexagésimal** (affiche les distances au dixième) |
| I.2 | **Le papyrus Rhind** | vers −1650 | **Fractions du scribe** (nouveau, court) : écrire $\frac{2}{n}$ en somme de fractions unitaires distinctes, comme Ahmès. | frise : arithmétique égyptienne |
| I.3 | **Zénon d'Élée** | vers −450 | **Achille et la tortue** (nouveau, court) : additionner la série $\frac12 + \frac14 + \cdots$ en temps limité ; on découvre qu'une infinité d'étapes tient en une distance finie. | prépare l'acte II |
| I.4 | **Les Éléments d'Euclide** | vers −300 | **L'algorithme d'Euclide** (nouveau) : découper un rectangle $a \times b$ en carrés, le plus grand possible à chaque fois. On lit le PGCD, puis la fraction continue de $a/b$. | **Compas d'Euclide** (approche automatique d'une balise ciblée) |
| I.5 | **Ératosthène mesure la Terre** | vers −240 | **L'ombre d'Alexandrie** (nouveau) : régler l'angle de l'ombre d'un gnomon, en déduire la circonférence terrestre à partir des 5 000 stades entre Syène et Alexandrie. | **Gnomon** (télémètre : distance à la cible affichée) |
| I.6 | **Le crible** | vers −240 | **Chasseur de premiers** (jeu existant), en version « crible d'Ératosthène ». | frise : nombres premiers |
| I.7 | **Archimède et le cercle** | vers −250 | **Les polygones d'Archimède** (nouveau) : doubler le nombre de côtés des polygones inscrit et circonscrit pour coincer $\pi$ entre deux bornes, avec un budget de calcul limité. Objectif : $3 + \frac{10}{71} < \pi < 3 + \frac17$. | **Levier d'Archimède** (boost ×1,5) |
| I.8 | **Diophante** | vers 250 | **Équations de l'Arithmetica** (court) : trouver des solutions entières ou rationnelles ; fin de l'acte, ouverture du secteur II. | ouverture des actes II et IV |

### ACTE II — L'INFINI (1614 → 1891)

| # | Balise | Date | Mission | Récompense |
|---|---|---|---|---|
| II.1 | **Les logarithmes de Napier** | 1614 | **La règle à calcul** (nouveau, court) : multiplier en additionnant des longueurs. | **Échelle logarithmique** (la carte zoome sans perdre le détail) |
| II.2 | **Descartes et Fermat** | 1637 | **Coordonnées** (court) : retrouver une courbe à partir de son équation. Mention de la note de Fermat dans la marge de Diophante (fil rouge jusqu'à 1994). | frise : géométrie analytique |
| II.3 | **Le boulet de Newton** | 1687 | **Mise en orbite** (nouveau) : tirer un boulet depuis une montagne avec la bonne vitesse pour qu'il tombe autour de la Terre (gravitation en $1/r^2$, intégration numérique). | **Moteur différentiel** (poussée ×1,5) |
| II.4 | **Le problème de Bâle** | 1734 | **La somme d'Euler** (nouveau) : sommer $\sum 1/n^2$ avec la calculatrice du bord, accélérer la convergence, reconnaître $\frac{\pi^2}{6}$. | **Réserve de Bâle** (le boost se recharge) |
| II.5 | **Les ponts de Königsberg** | 1736 | **Les sept ponts** (nouveau, court) : chercher un chemin qui passe une fois par chaque pont ; comprendre la condition d'Euler sur les degrés. | prépare l'acte III |
| II.6 | **Le duel ε-δ** | 1821 → 1872 | **Duel ε-δ** (jeu existant) : Cauchy puis Weierstrass rendent les limites rigoureuses. | frise : analyse rigoureuse |
| II.7 | **La diagonale de Cantor** | 1891 | **La diagonale** (nouveau) : face à une liste « complète » de réels proposée par l'Entropie, construire en temps limité un réel absent de la liste. | **Saut transfini** (vitesse lumière entre actes) |

### ACTE III — LES DIMENSIONS (1854 → 1931)

| # | Balise | Date | Mission | Récompense |
|---|---|---|---|---|
| III.1 | **L'habilitation de Riemann** | 1854 | **Géodésiques** (nouveau) : relier deux points d'une sphère puis d'une selle par le plus court chemin ; la somme des angles d'un triangle n'est plus 180°. | **Géodésique** (trajet le plus court tracé vers la cible) |
| III.2 | **Le ruban de Möbius** | 1858 | **Recollements** (nouveau) : piloter dans un carré dont les bords sont recollés (tore, ruban, bouteille de Klein) pour atteindre une balise ; comprendre l'orientation. | **Coque de Möbius** (traverse les murs de bruit) |
| III.3 | **Flatland** | 1884 | court récit + **Tranches** : deviner un solide à partir de ses coupes (lien vue 02.02). | frise |
| III.4 | **Le tesseract de Hinton** | 1888 | **Pilote 4D** (jeu existant). | **Vision 4D** (révèle des reliques cachées) |
| III.5 | **Analysis Situs** | 1895 | **Lacets** (court) : un lacet peut-il se resserrer en un point ? Introduction à la conjecture de Poincaré (1904), fil rouge jusqu'en 2003. | frise : topologie |
| III.6 | **La fibration de Hopf** | 1931 | lien vue 02.03 (récit + observation guidée). | fin d'acte |

### ACTE IV — LE HASARD (1654 → 1933)

| # | Balise | Date | Mission | Récompense |
|---|---|---|---|---|
| IV.1 | **Le problème des partis** | 1654 | **Partager les mises** (nouveau) : une partie est interrompue ; proposer le partage équitable, comme Pascal et Fermat dans leur correspondance. | **Dés de Pascal** (caches de reliques signalées) |
| IV.2 | **La loi des grands nombres** | 1713 | **Le pari de Bernoulli** (nouveau, court) : parier sur la fréquence observée après $n$ tirages ; voir la fluctuation se resserrer. | **Stabilisateur** (moins de dérive dans les nuages de bruit) |
| IV.3 | **L'aiguille de Buffon** | 1777 | **Casino de Buffon** (jeu existant). | frise |
| IV.4 | **La planche de Galton** | 1889 | lien vue 06.01 + **Prédire la cloche** (court). | frise : la gaussienne |
| IV.5 | **Le paradoxe de Bertrand** | 1889 | **Trois cordes** (nouveau) : « une corde au hasard » n'a pas de sens tant qu'on ne dit pas comment on la tire ; trouver la probabilité pour chaque méthode. | prépare Kolmogorov |
| IV.6 | **Les axiomes de Kolmogorov** | 1933 | récit + quiz court : le hasard devient une théorie. | fin d'acte |

### ACTE V — LE CHAOS (1890 → 1980)

| # | Balise | Date | Mission | Récompense |
|---|---|---|---|---|
| V.1 | **Le problème des trois corps** | 1890 | **Trois corps** (nouveau) : garder une petite planète stable le plus longtemps possible entre deux étoiles ; une erreur minuscule finit toujours par diverger. | **Stabilisateur de Poincaré** |
| V.2 | **Julia et Fatou** | 1918 | lien vue 03.02 (récit). | frise |
| V.3 | **L'effet papillon** | 1963 | **Les deux papillons** (nouveau) : deux trajectoires de Lorenz partent à $10^{-6}$ l'une de l'autre ; prédire quand elles se séparent. | **Attracteur** (traînée du vaisseau) |
| V.4 | **La suite logistique** | 1976–1978 | **Le doublement de période** (nouveau, court) : régler $r$ pour obtenir 2, 4, 8 cycles ; voir apparaître la constante de Feigenbaum. | frise |
| V.5 | **L'ensemble de Mandelbrot** | 1980 | **Plongée Mandelbrot** (jeu existant). | **Scanner fractal** |

### ACTE VI — LES LIMITES (1900 → 1936)
*L'Entropie y pose des pièges logiques : des balises qui se contredisent.*

| # | Balise | Date | Mission | Récompense |
|---|---|---|---|---|
| VI.1 | **Les 23 problèmes** | 1900 | **Le programme de Hilbert** (court) : relier quelques problèmes à leur sort (résolu, indécidable, ouvert). | frise |
| VI.2 | **Le paradoxe de Russell** | 1901 | **Le catalogue** (nouveau, court) : classer des ensembles ; l'ensemble des ensembles qui ne se contiennent pas casse le jeu. | **Bouclier de types** (immunité aux pièges logiques) |
| VI.3 | **L'incomplétude** | 1931 | **L'énoncé qui parle de lui-même** (nouveau) : énigmes d'auto-référence (chevaliers et fripons) ; l'idée de Gödel en version jouable. | frise |
| VI.4 | **La machine de Turing** | 1936 | **Programmer la machine** (nouveau) : écrire la table de transitions d'une machine qui incrémente un nombre binaire, puis qui recopie un mot ; voir pourquoi on ne peut pas prédire si une machine s'arrête. | **Calculateur de Turing** (déchiffre les entrées codées du journal) |

### ACTE VII — LE SIGNAL (1822 → 2003)
*Le retournement. Le bruit change de nature : en le passant au calculateur de Turing et à l'analyse de Fourier, MNÉMOSYNE y trouve des régularités.*

| # | Balise | Date | Mission | Récompense |
|---|---|---|---|---|
| VII.1 | **Fourier** | 1822 | **Peintre de Fourier** (jeu existant) : décomposer le bruit en fréquences ; il n'est pas blanc. | **Antenne de Fourier** |
| VII.2 | **Riemann et les premiers** | 1859 → 1896 | **Chasseur de premiers** (variante) : les pics du spectre tombent sur des nombres premiers. | frise : théorème des nombres premiers |
| VII.3 | **Shannon** | 1948 | **Coder le bruit** (court) : mesurer l'information d'un message. | frise |
| VII.4 | **Le message d'Arecibo** | 1974 | **1 679 bits** (nouveau) : 1 679 = 23 × 73 ; choisir la largeur de la grille pour que l'image apparaisse. | **La langue** |
| VII.5 | **Fermat, enfin** | 1994 | récit : la note de 1637 trouve sa preuve (Wiles). | frise |
| VII.6 | **Poincaré, enfin** | 2003 | **Final** : toutes les pièces du vaisseau servent ; on « répond » au Signal en lui renvoyant, dans l'ordre, les idées retrouvées. L'Entropie se met en ordre : la nébuleuse devient une galaxie. | **Fin** + frise complète |

**Jeux d'époque nouveaux** (≈ 16) : Racine de Babylone, Fractions du scribe, Achille, L'algorithme d'Euclide, L'ombre d'Alexandrie, Les polygones d'Archimède, La règle à calcul, Mise en orbite, La somme d'Euler, Les sept ponts, La diagonale, Géodésiques, Recollements, Partager les mises, Trois cordes, Trois corps, Les deux papillons, Le doublement de période, Le catalogue, L'énoncé qui parle de lui-même, Programmer la machine, 1 679 bits. **Jeux existants recontextualisés** : Chasseur de premiers, Duel ε-δ, Pilote 4D, Casino de Buffon, Plongée Mandelbrot, Peintre de Fourier.

---

## 5. Le vaisseau qui s'améliore par les maths

Chaque pièce est un **théorème devenu outil**. Elle change réellement le pilotage ou l'interface, et s'affiche dans un écran HANGAR avec l'énoncé qui la justifie.

| Pièce | Acte | Effet en jeu | L'idée derrière |
|---|---|---|---|
| Calculateur sexagésimal | I | distances affichées avec une décimale de plus | une base de numération |
| Compas d'Euclide | I | approche automatique de la balise ciblée | constructions à la règle et au compas |
| Gnomon | I | télémètre : distance à la cible dans le viseur | mesure par les angles |
| Levier d'Archimède | I | boost ×1,5 | méthode d'exhaustion |
| Échelle logarithmique | II | la carte de secteur zoome sans perte | logarithme |
| Moteur différentiel | II | poussée ×1,5, accélération plus douce | dérivée, mouvement |
| Réserve de Bâle | II | le boost se recharge | série convergente |
| Saut transfini | II | vitesse lumière directe vers un acte débloqué | cardinaux |
| Géodésique | III | trajet le plus court tracé vers la cible | courbure |
| Coque de Möbius | III | traverse les murs de bruit | orientabilité |
| Vision 4D | III | révèle les reliques cachées | dimension 4 |
| Dés de Pascal | IV | signale les caches de reliques proches | espérance |
| Stabilisateur | IV | moins de dérive dans les nuages | loi des grands nombres |
| Stabilisateur de Poincaré | V | plus de turbulence dans les tempêtes | stabilité |
| Attracteur | V | traînée en attracteur étrange | chaos déterministe |
| Scanner fractal | V | zoom de détail sur les balises | autosimilarité |
| Bouclier de types | VI | immunité aux pièges logiques | théorie des types (Russell) |
| Calculateur de Turing | VI | déchiffre les entrées codées du journal | calculabilité |
| Antenne de Fourier | VII | entend le Signal | analyse harmonique |

**Reliques** : 30 objets cachés dans le monde ouvert (la tablette, l'os d'Ishango, l'astrolabe, la Pascaline, la machine de Babbage…), visibles avec la Vision 4D ou signalés par les Dés de Pascal. Chacune ajoute une entrée de journal et un événement « bonus » sur la frise.

---

## 6. Le journal de bord

- Une entrée par chapitre (parfois deux), écrite par MNÉMOSYNE, datée de l'époque **et** de la date de bord.
- Structure : **lieu et date**, **la trace** (tablette, manuscrit, article), **l'idée** en deux phrases, **pourquoi l'Entropie l'avait mangée**, **lien** vers la vue de l'explorateur et le cours LEARN correspondants.
- Les entrées codées (actes VI–VII) ne se lisent qu'avec le Calculateur de Turing.
- Accès : touche **J** dans le mode histoire, ou le bouton JOURNAL du HUD.

## 7. La frise chronologique

- De **−1800** (YBC 7289) à **2003** (Perelman), environ 60 événements, débloqués par les chapitres et les reliques.
- Affichage : une frise horizontale à échelle **non linéaire** (les 3 300 premières années compressées), regroupée par thème (couleurs remplacées par des motifs de trait : plein, tirets, pointillés, puisque l'interface est monochrome).
- Chaque événement : année, titre, personne(s), une phrase, et liens vers la vue / le cours / la balise.
- Accès : onglet FRISE du journal (touche **J**).

## 8. Progression, sauvegarde, intégration

- Sauvegarde locale (`story.v1`) : chapitres réussis, pièces, reliques, entrées lues, position dans la région.
- Les missions sont des **leçons-jeux** (moteur `src/games/`) : briefing parlé (plus tard, voix Alice), niveaux, note S–D, théorème exact révélé au débriefing, références réelles. Le mode histoire ajoute le contexte (journal, frise, pièces).
- Les jeux d'époque apparaissent aussi dans LEARN (JEUX · DÉFIS) et dans Ctrl+K une fois débloqués.
- Musique : humeur `story` (générative, plus sombre), qui s'éclaircit d'acte en acte.

## 9. Plan d'implémentation

1. **Socle** : données pures et testées (`src/story/data.ts` : actes, chapitres, événements, pièces), progression (`story.v1`), région GRANDE ENTROPIE dans l'ATLAS (balises sur la spirale du temps, brouillard d'Entropie), fiche de chapitre (journal + mission), JOURNAL et FRISE.
2. **Acte I jouable** : les jeux d'époque Racine de Babylone, L'algorithme d'Euclide, L'ombre d'Alexandrie, Les polygones d'Archimède, plus le Chasseur de premiers recontextualisé.
3. Actes II à VI, un par session, avec leurs jeux et leurs pièces.
4. Acte VII, final, reliques, voix des briefings.

## 10. Points historiques à faire vérifier

- **YBC 7289** : datée d'environ −1800/−1600 ; la valeur $1;24,51,10 = 1{,}41421296\ldots$ est exacte. La méthode « babylonienne » (moyenne de $x$ et $2/x$) est une **reconstruction** : la tablette ne dit pas comment la valeur a été obtenue.
- **Papyrus Rhind** : copié vers −1650 par le scribe Ahmès, d'après un original plus ancien.
- **Euclide** : dates de vie inconnues ; les *Éléments* sont datés « vers −300 ». L'algorithme du PGCD est au livre VII.
- **Ératosthène** : la valeur de 5 000 stades et l'angle de 1/50 de cercle (7,2°) sont rapportés par Cléomède ; la longueur du stade utilisé est discutée.
- **Archimède** : l'encadrement $3 + \frac{10}{71} < \pi < 3 + \frac17$ est dans *La mesure du cercle* (polygones à 96 côtés).
- **Königsberg** : présenté par Euler en 1735, publié en 1741 ; « 1736 » est la date traditionnelle.
- **Bâle** : Euler trouve $\frac{\pi^2}{6}$ en 1734 (publication 1735), la preuve rigoureuse vient plus tard.
- **Cantor** : non-dénombrabilité de $\mathbb{R}$ en 1874, argument diagonal en 1891.
- **Hinton** : *A New Era of Thought* (1888) introduit le mot « tesseract ».
- **Paradoxe de Russell** : 1901, communiqué à Frege en 1902.
- **Arecibo** : message émis le 16 novembre 1974, 1 679 bits (23 × 73).
- **Perelman** : prépublications en 2002–2003, preuve validée ensuite (médaille Fields refusée en 2006).
