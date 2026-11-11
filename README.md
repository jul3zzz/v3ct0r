# V3CT0R

Logiciel web d'exploration mathématique en esthétique HUD monochrome (noir #000 / blanc #FFF).
46 visualisations interactives en 6 modules : intégrales, dimensions 3D/4D, fractales, constantes, principes, probabilités.
Chaque vue a sa leçon (affichée comme un terminal) et 3 exercices corrigés ; les vues se débloquent au fil de la progression.
Un tuto interactif et des parcours guidés. **V3CT0R LEARN** : des cours de la prépa au doctorat, animés et commentés.
Fonctionne **hors ligne**, sans serveur : un fichier `index.html` (plus, pour la voix off des cours, un dossier `courses/` de MP3).

## Lancer l'application

- **En ligne** : le site GitHub Pages du dépôt ([jul3zzz.github.io/v3ct0r](https://jul3zzz.github.io/v3ct0r/)), mis à jour à chaque push sur
  `main` (`.github/workflows/pages.yml`). À l'arrivée, le site propose d'abord de **télécharger** la version hors ligne
  (en cas de « non », une icône TÉLÉCHARGER reste dans la barre d'état), puis demande de **créer un compte** ou de se
  connecter (e-mail + mot de passe) : la progression et les notes suivent le compte sur tous les appareils.
- **App Windows** : sur Windows, le bouton **TÉLÉCHARGER** du site donne `V3CT0R-Setup.exe` (≈ 118 Mo, joint à chaque
  release). Un double-clic l'installe sans droits administrateur : **V3CT0R apparaît sur le bureau** et dans le menu
  Démarrer, s'ouvre dans sa propre fenêtre, hors ligne, et se désinstalle depuis les paramètres de Windows
  (*Applications*). L'installeur n'est pas signé : au premier lancement, Windows peut afficher « Windows a protégé votre
  ordinateur » → *Informations complémentaires* → *Exécuter quand même*.
- **Téléchargeable (zip, tous systèmes)** : `V3CT0R.zip` (bouton TÉLÉCHARGER hors Windows, Ctrl+K « version zip », ou
  les *Releases* du dépôt, une par tag `v*`, `.github/workflows/release.yml`).

Version téléchargée :

1. Dézipper `V3CT0R.zip` (garder `index.html` et le dossier `courses/` côte à côte).
2. Double-cliquer sur `index.html` (Chrome, Edge ou Firefox récents ; WebGL2 requis).
3. L'application s'ouvre sur l'**ATLAS** : un vaisseau à piloter à travers tout le logiciel (voir ci-dessous).
   Onglets en haut à gauche : **ATLAS**, **EXPLORER** (les 46 vues, menus classiques), **LEARN** (les cours).
   Fenêtre de moins de 1200 px de large : la colonne des modules (ou des cours) se replie en tiroir, ouvert par
   le bouton ≡ MODULES, pour laisser à la vue au moins 630 px.
4. Un compte est demandé à la première ouverture (internet nécessaire cette fois-là) ; un appareil déjà connecté
   s'ouvre ensuite sans internet. Puis l'application propose le **tuto** (≈ 13 min, 17 étapes), qui se relance avec `T`.

Aucun réseau n'est utilisé, sauf pour le compte (connexion à la première ouverture, puis synchro de la progression) : polices, KaTeX, Three.js, les 10 000 décimales de chaque constante et le contenu des cours
sont embarqués dans le fichier. Sans les MP3, les cours se jouent avec sous-titres seuls.

## Comptes et synchro de la progression

La progression (vues validées, cours, leçons-jeux, mode histoire) et les notes suivent un compte, via un projet
**Supabase** gratuit. Quand le build est configuré (étapes ci-dessous), un compte est **obligatoire** pour ouvrir
l'application, en ligne comme en version téléchargée (`src/shell/welcome.ts`) : un appareil connecté une fois garde sa
session et s'ouvre ensuite hors ligne ; si le serveur ne répond pas, l'écran d'accueil propose RÉESSAYER et, sur le
site, de télécharger la version hors ligne. Sans configuration, pas de compte : tout reste dans le navigateur. Les
réglages (son, qualité, musique) et la position du vaisseau restent propres à chaque appareil.

1. Créer un projet sur [supabase.com](https://supabase.com) (offre gratuite).
2. *SQL Editor* → coller `supabase/schema.sql` → *Run* : la table `progress`, protégée (chaque joueur ne lit et
   n'écrit que sa ligne).
3. *Project Settings → API* : copier l'URL et la clé **anon public** dans `.env.local` (modèle : `.env.example`),
   jamais la clé `service_role`. Pour le site en ligne, les mêmes valeurs en variables du dépôt GitHub
   (*Settings → Secrets and variables → Actions → Variables*) : `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
4. *Authentication → URL Configuration* : mettre l'adresse du site GitHub Pages en *Site URL* (lien de confirmation des
   e-mails). Pour se passer de la confirmation : *Authentication → Providers → Email → Confirm email* désactivé.

Fusion entre appareils (`src/core/sync.ts`, testée) : rien de gagné ne se perd — meilleures notes et compteurs au
maximum, balises lues et vues validées réunies, pour chaque exercice le meilleur résultat. La synchro se fait à la
connexion, au démarrage, quelques secondes après chaque progrès et quand l'onglet passe en arrière-plan.

## V3CT0R ATLAS

Tout le logiciel en espace à parcourir, façon arcade, en fil de fer noir et blanc (`src/atlas/`).

- **La galaxie V3CT0R** : une station au centre et 7 univers (galaxies spirales de points) — un par module
  de l'explorateur, plus l'**ACADÉMIE** (galaxie en anneaux) pour les cours LEARN. Routes en pointillés depuis la
  station, chevrons au bord de l'écran vers les univers hors champ, radar.
- **Vitesse lumière** : `⏎` près d'un univers (ou foncer en son cœur) → traînées d'étoiles, champ de vision qui
  s'ouvre, flash, et l'arrivée dans son **système** : une étoile, une **planète par vue** (orbites), la **porte**
  de l'intro du module. Chaque planète est un emblème de sa vue : tesseract, tore, nœud de Hopf, tétraèdre de
  Sierpiński, courbe de Lorenz, spirale d'or, nuage de points… Validée : un anneau tourne autour ; verrouillée :
  éteinte et l'atterrissage est refusé. Dans l'ACADÉMIE : une planète par cours, un anneau par niveau.
- **Atterrir** : `⏎` sur la planète visée (crochets, fiche à droite) → plongée, flash, la vue s'ouvre. Au retour
  (onglet ATLAS), le vaisseau attend en orbite de la planète. `Échap` (ou sortir du système) → retour en galaxie.
- **Pilotage** : `Z Q S D` (touches physiques : `W A S D` en QWERTY, libellés adaptés au clavier), `A`/`E`
  monter/descendre, `↑`/`↓` tangage, `Maj` ou `Espace` boost (traînée du réacteur, tremblement), `Tab` menus
  classiques, `Ctrl+K` « atlas » pour sauter directement dans un système.
- **Visée souris, comme un avion** : la souris oriente la caméra (le réticule central) ; le vaisseau vire pour
  rattraper ce point en s'inclinant dans le virage, et une croix montre où pointe son nez. Un clic capture la souris
  pour tourner sans limite (Échap la libère). **Ctrl gauche maintenu** : souris libre (le curseur revient, le
  vaisseau ne tourne plus : cliquer un onglet, un bouton) ; relâché, la souris dirige de nouveau (et se recapture si
  elle l'était, sauf si tu as cliqué ailleurs entre-temps). La cible est ce que tu vises.
- **Stations** : chaque leçon-jeu est une station orbitale dans le système de son module ; accoster lance la partie.
- **Son** (bouton SON / `M`) : réacteur qui suit la vitesse, souffle du boost, bip de verrouillage, montée et boum de
  la vitesse lumière, plongée d'atterrissage.
- La position du vaisseau est mémorisée (localStorage). `npm test` vérifie la carte (toutes les vues, cours et
  intros présents, aucun chevauchement) ; le smoke pilote le vaisseau, saute en vitesse lumière, atterrit, et
  vérifie le refus sur une planète verrouillée.

### Mode histoire : LA GRANDE ENTROPIE

Une région à part de la galaxie, sous la station (`Ctrl+K` « histoire ») : un monde ouvert où la chronologie des
mathématiques est dessinée en spirale, de la tablette YBC 7289 (−1800) au centre jusqu'à Perelman (2003) au bord.
Conception complète, trame des 7 actes, jeux d'époque, pièces du vaisseau et points historiques à vérifier :
[STORY.md](STORY.md).

- **42 balises** (une par chapitre) sur la spirale, un anneau par acte. L'Entropie (le bruit) noie les balises non
  restaurées : `◆` à restaurer, `◇` noyée, `◌` en préparation (visible, mission pas encore construite).
- **Atterrir sur une balise** ouvre sa fiche : l'entrée du **journal de bord** écrite par MNÉMOSYNE (faits datés,
  formules), la **mission** (un jeu d'époque ou une leçon-jeu existante), la **pièce du vaisseau** à gagner, les liens
  vers la vue et le cours, les événements de la frise. Une balise est restaurée quand sa fiche a été lue et sa
  mission réussie (note C ou mieux, à n'importe quel niveau) ; une balise de récit se restaure en la lisant.
- **Progression** : l'acte I s'ouvre sur la tablette, puis toutes ses balises ; la dernière (Diophante) ferme l'acte et
  ouvre les actes II et IV ; les autres suivent STORY.md (dérivé et testé : `src/story/progress.ts`).
- **Jeux d'époque de l'acte I** (`src/games/`, `STORY_GAMES`) : *Racine de Babylone* (rendre un rectangle carré en
  base 60, puis un cube : Héron et Newton), *L'algorithme d'Euclide* (découper un rectangle en carrés : PGCD, fraction
  continue, Fibonacci), *L'ombre d'Alexandrie* (l'angle du gnomon, puis Picard, Maupertuis, Delambre et Méchain,
  d'autres mondes), *Les polygones d'Archimède* (moyennes harmonique et géométrique, arrondis prudents). Après une
  mission, « RETOUR AU VAISSEAU » ramène à la balise.
- **Pièces du vaisseau** : *Calculateur sexagésimal* (distance au dixième), *Gnomon* (cap vers la cible),
  *Levier d'Archimède* (boost ×1,5 dans la région), *Compas d'Euclide* (`X` : vol direct vers la balise visée).
- `J` : **livre de bord** — JOURNAL (entrées lues), FRISE (63 événements de −1800 à 2003, débloqués balise par
  balise), HANGAR (pièces). Musique : humeur `story`.
- `npm test` vérifie les données (liens vers jeux, vues, cours ; dates dans leur acte ; formules KaTeX), la
  progression et la mathématique des jeux ; le smoke entre dans la région, ouvre la tablette, **joue la mission**
  (clics sur la règle), revient au vaisseau et vérifie la balise restaurée et la pièce obtenue.

## V3CT0R LEARN

Cours de mathématiques de la prépa scientifique (toutes filières : MPSI, PCSI, PTSI, MP2I puis MP, PC, PSI, PT, MPI)
jusqu'au doctorat, en séances de 30 min à 1 h : énoncés, théorie,
démonstrations, exemples, exercices progressifs, corrections détaillées. Les explications sont du **motion design**
synchronisé avec une voix off (ElevenLabs, générée à l'avance) : équations écrites symbole par symbole, transformées
l'une en l'autre, encadrés THÉORÈME / DÉFINITION / PREUVE / REMARQUE, tracés, grilles déformées par une application
linéaire… et les **vues de l'explorateur pilotées comme des scènes** (n qui augmente, zoom, options).

| Cours | Niveau | Durée | Contenu |
|---|---|---|---|
| Démo · L'aire sous la parabole | démo | ≈ 3 min | toutes les primitives, sans voix (sous-titres seuls) |
| **L'intégrale de Riemann, construite proprement** | prépa | ≈ 45 min | escalier, Darboux, critère, continues ⇒ intégrables, propriétés, sommes de Riemann, TFA ; 4 exercices |
| **Réduction des endomorphismes** | prépa | ≈ 50 min | éléments propres, χ, critères, lemme des noyaux, Cayley-Hamilton (preuve par la comatrice), trigonalisation ; 5 exercices |
| **De Riemann à Lebesgue** | master | ≈ 50 min | défauts de Riemann, idée de Lebesgue, tribus, mesure, Cantor, Vitali, Beppo Levi, Fatou, convergence dominée ; 4 exercices |
| 18 autres cours | prépa → doctorat | — | **EN CONSTRUCTION** : plan détaillé et références dans le panneau |
| **6 intros de module** | intro | 30 s chacune | une par module de l'explorateur (voir ci-dessous) |

### Intros de module (30 s, voix off)

Chaque module de l'explorateur a une intro en motion design de 30 s : titre en glitch, mots-clés en typographie
cinétique, rideau de transition entre les scènes, et les vraies vues du module qui s'animent (rectangles de Riemann,
tesseract, fibration de Hopf, plongée dans Mandelbrot, attracteur de Lorenz, planche de Galton…). Elles passent par
le même moteur et la même voix que les cours, sous-titres compris.

- **Où** : `▶ INTRO · 30 S` en tête de la liste des vues de chaque module (rail de l'explorateur), groupe
  « INTROS · 30 S » de l'accueil LEARN, Ctrl+K « intro ». Un clic lance la lecture ; l'écran de fin propose
  **EXPLORER LE MODULE →**.
- **Fichiers** : `courses/intro-<module>/` (`lesson.json` avec `"level": "intro"`, `"module"`, `"minutes": 0.5` ;
  `script.md` ; `review.md` ; `formulas.json` si une formule est écrite). Hors du graphe des cours et de
  `curriculum.json` ; pas d'exercice. `npm test` vérifie une intro par module, des scènes du module, 24 à 36 s.
- **Bruitages au premier plan** (`"soundtrack": true`, `src/learn/soundtrack.ts`) : nappe grave continue, glitch et
  impact sur le titre, « whoosh » panoramique à chaque rideau, impact sourd à chaque changement de vue, clics des
  lettres et impact des mots géants, clics d'écriture des formules, montée en tension (`rise`) avant le mot final.
  Et surtout **une texture par vue**, ce que la vue montre, entendu (`sceneSound`) : billes sur les clous (Galton),
  pièces qui tombent (grands nombres), dés (TCL), aiguilles sur le parquet (Buffon), plongée sans fond en son de
  Shepard (Mandelbrot), une cloche par itération du flocon de Koch, chaos modulé (Lorenz), coupes des tiers (Cantor),
  l'orbite de 27 jouée note à note (Collatz), harmoniques qui gonflent comme les cercles (Fourier), côtés qui doublent
  d'octave en octave (π), carrés d'or en intervalles φ, son qui tourne sur le cercle unité (Euler)…
- **À la suite** : « ▶ TOUTES À LA SUITE » (accueil LEARN) ou Ctrl+K « intros » enchaîne les 6 intros (≈ 3 min) ;
  aller ailleurs arrête l'enchaînement.
  Tout est synthétisé en WebAudio (aucun fichier son, hors ligne) ; les sons ne partent qu'en lecture (jamais en
  déplaçant le curseur). Voix en retrait (`"voiceVolume": 0.6`), narration courte avec des silences (`{{wait}}`).
  Bouton **SFX** de la barre ou touche `B` pour couper les bruitages (mémorisé).
- **Voix** (Alice) : `npm run voice -- --dry-run --course=intro-*` → 1 752 crédits, puis `--yes` pour générer les intros
  seules. `npm run voice:sample -- --voices=Nom:voice_id,… [--yes]` fait lire une phrase par plusieurs voix
  (`voice-samples/`, hors du zip) pour choisir à l'oreille.

### Leçons-jeux (pour adultes)

Des défis de précision et de raisonnement, chronométrés et notés (S, A, B, C, D), chacun construit sur un énoncé
exact, dévoilé au débrief (`src/games/`). Accueil LEARN → **JEUX · DÉFIS**, Ctrl+K « jeu », ou une station de l'ATLAS.
Briefing animé **lu par Alice** (le texte s’écrit au rythme de la voix), 3 niveaux de 5 manches, la bonne réponse montrée après chaque manche, record personnel par niveau
(localStorage), le théorème dans le panneau après le premier niveau terminé, liens vers la vue et le cours.

| Jeu | Le principe | Le théorème |
|---|---|---|
| **Duel ε-δ** | La machine nomme ε, tu réponds δ (le plus grand qui marche : score = δ/δ\*) ; au niveau 3 les rôles s'inversent sur des fonctions sans limite : choisis ε, puis bats chaque δ de la machine en cliquant un contre-exemple | définition de la limite, et sa lecture comme un jeu à deux (Hintikka) |
| **Chasseur de directions propres** | Oriente v à la souris, regarde Av, verrouille les directions où Av reste sur la droite de v, au degré près ; pièges : cisaillement (une seule), rotation (aucune), homothétie (toutes) | directions propres d'une matrice 2 × 2 selon le discriminant, théorème spectral |
| **Peintre de Fourier** | Redessine une courbe fermée avec K cercles : choisis leurs fréquences (−10 à +10), ta courbe et ses épicycles s'affichent en direct ; score = énergie captée / optimum ; niveau 3 à l'aveugle, en lisant les fréquences dans la symétrie de la figure | meilleure approximation (projection orthogonale), égalité de Parseval, symétrie d'ordre k ⇒ n ≡ 1 (mod k) |
| **Pilote 4D** | Amène un tesseract sur une silhouette en le tournant dans les plans XW, YW, ZW (touches maintenues Q/D, Z/S, A/E — positions physiques ; Maj pour la précision) ; verrou automatique sous 1 % d'écart | rotations de ℝ⁴ dans des plans, dim SO(4) = 6, non-commutativité, forme normale à deux angles |
| **Plongée Mandelbrot** | Trouve un c dont l'orbite de 0 tombe sur un cycle de période p : glisse, zoome (molette), sonde (clic) ; l'orbite se dessine et sa période s'affiche ; périodes 1 à 16, il faut plonger. Rendu par un shader (GPU) | cycles attractifs (Fatou : au plus un pour z² + c), cardioïde et disque de période 2, bourgeons de toutes les périodes |
| **Casino de Buffon** | La cote (estimer 2ℓ/(πd)), le pari (intervalle pour le nombre d'aiguilles qui coupent sur 100), encadrer π à partir d'un vrai lancer de 400 aiguilles ; étroit paie, rater ne paie rien | Buffon, loi binomiale, intervalle à 95 % (TCL), estimateur de π et méthode delta |
| **Chasseur de premiers** | Des nombres tombent : tire sur les premiers, laisse passer les composés ; sous 100, 1 000, puis 10 000 avec le test de Fermat affiché… et les nombres de Carmichael qui le trompent | petit théorème de Fermat, pseudo-premiers, critère de Korselt, infinité des Carmichael |

`npm test` vérifie la mathématique de chaque jeu : δ\* exact contre les valeurs calculées à la main, contre-exemples
toujours trouvables au niveau 3 du Duel, directions propres exactes, Parseval numérique, optimum du Peintre contre
300 choix au hasard, symétrie des figures, rotations orthogonales et (non-)commutativité, cibles du Pilote
atteignables, périodes de Mandelbrot aux centres connus et trouvables jusqu’à 16, couverture réelle de l’intervalle
à 95 % et méthode delta, nombres de Carmichael (Korselt) et pseudo-premiers. Le smoke joue un niveau complet du Duel
et une manche de chacun des six autres.

### Vidéos YouTube par vue

Le panneau de chaque vue de l'explorateur se termine par un bloc **VIDÉOS YOUTUBE** : 1 à 3 vidéos réelles par vue
(94 liens pour les 46 vues ; français d'abord : Micmaths, El Jj, ScienceEtonnante, ARTE, Science4All, films
*Dimensions* et *Chaos*… ; anglais sinon : 3Blue1Brown, Numberphile, Mathologer, Veritasium…). Ce sont de simples liens
qui s'ouvrent dans le navigateur (connexion requise) : l'application reste hors ligne et n'intègre aucun lecteur.

- Liste : `src/modules/videos.json` (`id` YouTube, `lang`, `title`, `channel`, `len`, `note` facultative).
- `npm run videos:check` revérifie chaque lien auprès de YouTube (oEmbed : la vidéo existe, titre et chaîne
  inchangés) ; `-- --write` met à jour titres, chaînes et durées. Liste vérifiée le 2026-11-08.
- Ajouter une vidéo : son `id` et sa `lang` dans la vue voulue, puis `npm run videos:check -- --write`.

- **Accueil : le graphe des cours**, en 3D, à la manière du graphe d'Obsidian. Un point par cours (icosaèdre fil de
  fer), par chapitre (anneau) et par énoncé (disque : théorème, proposition ; anneau fin : définition ; losange :
  méthode). Les traits : appartenance (énoncé → chapitre → cours), prérequis entre cours, et **renvois** entre
  énoncés (pointillés). Disposition déterministe (chaque cours forme un amas ; la prépa en bas, le doctorat en
  haut). Survol = le nœud et ses voisins s'allument, le reste s'éteint ; clic = sa fiche dans le panneau (un énoncé
  s'y lit en entier, avec « RENVOIE À » et « CITÉ PAR ») ; double-clic ou `⏎` = l'ouvrir dans son cours (au bon
  chapitre, au bon énoncé) ; double-clic dans le vide = recadrer. Luminosité = progression.
- **Rail** : recherche (cours, chapitres, énoncés, accents ignorés ; la caméra vole vers le résultat), filtres
  **filière** (une parmi les 9, ou toutes), niveaux, chapitres et énoncés (mémorisés), puis la liste des cours par
  année (PRÉPA · 1re ANNÉE / 2e ANNÉE, ou la filière choisie), accessible au clavier.
- **Renvois** : dans tout texte de cours (hors formules), `[[cours]]`, `[[cours#id]]` (un chapitre ou un énoncé,
  par son `{#id}`) ou `[[cours#id|texte affiché]]` devient un lien cliquable et une arête du graphe ; sans texte,
  le lien affiche le titre de la cible. `npm test` vérifie que chaque renvoi pointe quelque part.
- **Déblocage** : un cours s'ouvre quand ses prérequis *disponibles* sont terminés (les prérequis en construction ne
  bloquent pas). Le mode libre de l'explorateur (Ctrl+K) ouvre tout.
- **Lecteur** : lecture/pause, vitesses 0,75× à 2×, barre de temps avec chapitres et exercices, chapitres cliquables,
  sous-titres, **transcription complète** cliquable, onglet EXERCICES, pause automatique avant chaque exercice
  (« À TOI. PRENDS 5 MIN. » + minuteur HUD), indices progressifs (3 niveaux), correction étape par étape.
- **Mode COLLE** : un exercice tiré au hasard parmi les cours ouverts, chronométré, puis la correction avec barème :
  on coche les étapes obtenues, la note sur 20 est enregistrée.
- **Fiche récapitulative** : énoncés du cours par chapitre, formules clés, exercices → boîte d'impression,
  « Enregistrer en PDF » (noir sur blanc, hors ligne).
- **Liens** : depuis une vue de l'explorateur, le bouton **→ LEARN** ouvre le cours qui l'utilise, au bon moment ;
  dans un cours, « Ouvrir la scène dans l'explorateur ». Ctrl+K cherche aussi les cours, chapitres, théorèmes et
  définitions et ouvre le cours à l'instant où l'énoncé apparaît.
- **Progression** (localStorage) : position, temps passé, exercices réussis, cours terminés, notes de colle.
- Chaque cours a un `review.md` : les points à faire vérifier par un humain (preuves délicates, notations).

| Touche (LEARN) | Action |
|---|---|
| `Espace` | Lecture / pause (et reprise après un exercice) |
| `←` `→` | −5 s / +5 s |
| `<` `>` | Vitesse |
| `C` | Sous-titres |
| `B` | Bruitages on/off (intros) |
| `F` | Plein écran |
| `Échap` | Fermer l'exercice / retour au graphe |

### Ajouter un cours

1. Créer `courses/<id>/` et l'ajouter dans `courses/curriculum.json` (niveau et ordre).
2. `lesson.json` : `id`, `title`, `level` (`prepa` · `master` · `doctorat`), `minutes`, `prerequisites`, `tags`,
   `status` (`ready` ou `construction`), `chapters` (`id`, `title`), `plan` (obligatoire en construction),
   `references` (ouvrages classiques réels uniquement). Prépa : `filieres` (celles dont le programme officiel
   couvre le cours, dans l'ordre MPSI, PCSI, PTSI, MP2I, MP, PC, PSI, PT, MPI ; l'année s'en déduit : 1re si une
   filière de 1re année l'a) et `depth` (`complete`, ou `fiche` : énoncés, méthodes et un exercice de chaque
   longueur).
3. `formulas.json` : `eq` (formules LaTeX nommées ; `[[clé:…]]` marque un terme pour la transformation et le
   surlignage), `statements` (`kind` : definition, theorem, proposition, lemma, corollary, proof, remark, example,
   method ; `title` ; `body` en Markdown + `$…$` / `$$…$$`), `recap` (formules de la fiche).
4. `exercises.json` : `id`, `title`, `level` (1-3), `minutes`, `statement`, `hints` (3), `solution` (étapes avec
   `points`), `answer` facultative (`num` avec tolérance, ou `qcm`).
5. `script.md` : `# Titre du chapitre {#id}` puis `## id-du-segment` ; texte de la voix off avec `$…$` et des
   marqueurs, déclenchés au moment où la voix les atteint :

| Marqueur | Effet |
|---|---|
| `{{anim:title text="…" kicker="…" sub="…" hold=2}}` | carton de titre |
| `{{anim:word text="CHAOS" sub="…" slot=n hold=1.6 rise}}` | mot-clé en grand, lettres qui tombent en place (typographie cinétique) ; `rise` : montée sonore avant l'impact |
| `{{anim:wipe label="03.06 · FLOCON DE KOCH" dur=0.8}}` | rideau noir à bord lumineux, centré sur l'instant du marqueur : cache le changement de scène qui suit et efface tout ce qui était affiché |
| `{{anim:write eq=id slot=c size=md id=x}}` | écrit une formule symbole par symbole (`slot` : c n s w e nw ne sw se full) |
| `{{anim:morph from=x to=id}}` | transforme une formule en une autre (les termes `[[clé:…]]` communs se déplacent) |
| `{{anim:highlight on=x term=clé label="…"}}` | crochets autour d'un terme (`underline`, `fill`) |
| `{{anim:arrow from=x:clé to=y label="…"}}` | flèche entre deux objets ou termes |
| `{{box:id-énoncé slot=n}}` | encadré THÉORÈME / DÉFINITION / PREUVE… (et entrée de la fiche, de Ctrl+K) |
| `{{anim:text slot=s text="… \n …"}}` | texte enrichi |
| `{{anim:axes id=A x=a,b y=c,d}}` puis `curve`, `area`, `darboux` (n, kind=lower/upper/both/left/right/mid), `lebesgue`, `point`, `vline`, `hline`, `segment` avec `on=A` | tracés |
| `{{anim:grid m=a,b,c,d eig det}}` | déformation linéaire d'une grille, directions propres |
| `{{anim:tween id=x n=32 dur=4}}` | anime un paramètre numérique d'un objet |
| `{{anim:fade id=x}}` · `{{anim:clear}}` | retire un objet / tout (chaque chapitre repart à vide) |
| `{{scene:integrals/riemann n=4 auto=off GAUCHE}}` · `{{scene:set n=64 dur=5}}` · `{{scene:none}}` | pilote une vue de l'explorateur (alias dans `src/learn/scene.ts`) |
| `{{anim:camera x=a,b y=c,d dur=1.5}}` | zoom caméra sur une scène 2D |
| `{{exercise:ex1 minutes=5}}` | pause automatique + exercice |
| `{{wait:1.5}}` | silence (coupe le clip audio) |
| `$…${{say:"…"}}` | prononciation imposée pour une formule |

`npm test` vérifie chaque cours (références des marqueurs, exercices complets et proposés, scènes et contrôles
connus, durée annoncée cohérente avec narration + exercices) ; `npm run smoke` les joue dans le navigateur.

### Cours écrits (texte + exercices par durée)

Un cours peut être **écrit** au lieu d'être narré : `"format": "written"` dans `lesson.json`. Il se lit à l'écran à
son rythme (sommaire qui suit la lecture, énoncés encadrés, position de lecture mémorisée) ; il compte comme lu quand
on arrive aux exercices. Les exercices sont regroupés par durée : **SIMPLE ≈ 10 min** (`level: 1`, 5 à 15 min),
**MOYEN ≈ 30 min** (`level: 2`, 20 à 45 min), **COMPLEXE 1 h et plus** (`level: 3`, au moins 60 min), chacun avec
trois indices et une correction étape par étape.

- `text.md` : `## Titre du chapitre {#id}` (ids et ordre de `lesson.json`), `### Sous-titre`, paragraphes
  (Markdown, `$…$`, `$$…$$`, listes), et les énoncés **écrits en place**, LaTeX tel quel :
  `::: théorème Bolzano-Weierstrass {#thm-bw}` … `:::` (définition, théorème, proposition, lemme, corollaire,
  preuve, remarque, exemple, méthode). `{{box:id}}` reprend un énoncé de `formulas.json`.
- `exercises.md` (remplace `exercises.json`) : `# id · simple · 10 · Titre`, l'énoncé, trois `## Indice`, des
  `## Étape · points`, et une `## Réponse` facultative (`num 0.5 ± 0.001`, ou `qcm B` suivi des choix `- …`).
- `npm test` : structure, chapitres et énoncés cohérents, **chaque formule compilée par KaTeX**, titres sans LaTeX,
  durées par niveau, temps de lecture annoncé (±40 %), références et `review.md`.
- Cours écrits disponibles (prépa, 8 exercices chacun, de 10 min à 1 h 30, corrigés pas à pas) : **Suites et séries numériques**, **Algèbre linéaire**, **Espaces préhilbertiens**, **Topologie des espaces vectoriels normés**, **Séries entières**, **Équations différentielles linéaires**. Restent en construction : les 12 cours de licence/master et de doctorat.

### Générer les voix (ElevenLabs)

La voix est générée **à l'avance**, jamais dans le navigateur : la clé API ne se retrouve jamais dans l'application.

1. `copy .env.example .env`, puis coller la clé après `ELEVENLABS_API_KEY=` (le fichier `.env` est ignoré par git et
   exclu du zip). Ne jamais la coller dans le code ni dans un chat.
2. `npm run voice:list` liste les voix du compte (★ = français vérifié) et les crédits restants, sans rien consommer.
   Choisir la voix et ses réglages dans `tools/voice.config.json` (`voice_id`, `model_id` = `eleven_multilingual_v2`,
   `stability`, `similarity_boost`, `style`, `speed`, `output_format`).
3. `npm run voice -- --dry-run` : nombre de caractères, crédits, coût estimé selon l'abonnement. Rien n'est envoyé.
4. `npm run voice -- --yes` (option `--course=<id>` — ou `--course=a,b`, `--course=intro-*` —, `--limit=N` pour
   essayer une voix, `--force`, `--revoice`).
   Pour chaque clip : `courses/<id>/audio/<clip>.mp3` + `.json` (horodatage des mots, endpoint *with-timestamps*).
5. `npm run build` (embarque les alignements, copie les MP3 dans `dist/courses/`) puis `npm run package`.

**Cache** : un clip n'est régénéré que si son texte prononcé a changé (empreinte) ; changer de voix ne régénère que
avec `--revoice`. **Prononciation** : `courses/pronunciation.fr.json` convertit le LaTeX en français parlé
(`\int_0^1 f` → « intégrale de 0 à 1 de f », `\forall` → « pour tout »…) ; dictionnaire modifiable, `{{say:"…"}}` pour
un cas isolé. Les pauses (`{{wait}}`) sont gérées par la timeline (les balises `<break>` ne sont pas documentées par
l'API).

## Modules

| Module | Vues |
|---|---|
| **01 // INTÉGRALES** 積分 | Sommes de Riemann (gauche, droite, milieu, trapèzes, Simpson, erreur et convergence log-log) · Théorème fondamental · Intégrale double (prismes) · Intégrale triple (nuage de densité GPU + Monte-Carlo) · Intégrale 4D (tranches f(x,y,z,t), hypervolume de la 3-sphère) |
| **02 // DIMENSIONS** 次元 | Polytopes 4D (5-cell, tesseract, 16-, 24-, 120-, 600-cell ; 6 plans de rotation ; projections perspective et stéréographique dans le vertex shader) · Coupes 4D (hypersphère, polytopes, analogie Flatland) · Fibration de Hopf & tore de Clifford · Surfaces 3D (tore, Möbius, Klein ×2, Boy, paramétrage libre) |
| **03 // FRACTALES** 分形 | Mandelbrot (GPU ; au-delà de ×10⁶, perturbation autour d'une orbite de référence BigInt avec rebasage : zoom jusqu'à ~10³⁰ ; points de Misiurewicz affinés par Newton à ~96 chiffres) · Julia (c suit la souris sur la carte) · Mandelbulb (ray-marching) · Sierpinski 2D/3D · Koch · Menger · Hilbert · Fougère de Barnsley · Arbre · Attracteurs (Lorenz, Rössler, Aizawa). Dimension de Hausdorff affichée ou estimée en direct (box-counting). |
| **04 // CONSTANTES** 定数 | π (Archimède, Monte-Carlo) · φ (spirale, Fibonacci) · √2 (diagonale, preuve d'irrationalité, Héron) · e (intérêts composés, série) · i · γ · ζ(3) · ln 2 · Comparaison (flux de décimales, fractions continues, convergence) · Marche des décimales · Identité d'Euler |
| **05 // PRINCIPES** 原理 | Limites (ε, δ) · Dérivée · Taylor (coefficients exacts par différentiation automatique, rayon de convergence estimé) · Fourier (épicycles, dessin libre) · Nombres complexes (f(z) libre : grille déformée et lignes de niveau GPU) · Premiers (spirale d'Ulam sur GPU) · Zêta de Riemann · Infini & cardinalité · Vecteurs & matrices · Pavages (Penrose) · Collatz |
| **06 // PROBABILITÉS** 確率 | Planche de Galton (binomiale → Gauss) · Loi des grands nombres (et le contre-exemple de Cauchy) · Théorème central limite · Aiguille de Buffon |

Chaque vue propose un bouton **Σ** (formule KaTeX + explication) et ses paramètres dans le panneau de droite.

**Tape ta propre fonction** partout où un champ « f(x) = … » apparaît (intégrales, limites, dérivée, Taylor, surfaces) :
`sin cos tan exp ln sqrt abs floor pow mod min max…`, constantes `pi e phi tau`, multiplication implicite (`2x`, `x y`), `^`, `√`, `π`.
Dans *Nombres complexes*, le champ « f(z) = » accepte `z`, `i` et `exp ln sqrt sin cos tan sinh cosh tanh abs re im conj arg`.

## Leçons, exercices et progression

- **Leçon** (`E` ou bouton LEÇON) : un terminal s'ouvre à gauche de la vue et « tape » la leçon :
  OBJECTIF, NOTIONS, À FAIRE DANS LA VUE, FORMULE (KaTeX), LE SAVAIS-TU ? Un clic dans le terminal termine la frappe.
- **3 exercices par vue** (138 au total), corrigés automatiquement :
  QCM (clic ou lettre A–D), CALCUL (réponse tapée : `0,25`, `1/4`, `pi/2`, `√2`, `2^10`… avec une tolérance),
  MANIPULATION (atteindre un état précis dans la vue : vérifié en direct).
  Essais illimités ; l'indice apparaît après une erreur, le bouton SOLUTION reste disponible, mais une solution
  affichée ne compte plus.
- **Déblocage** : seule la première vue de chaque module est ouverte au départ. Réussir **2 exercices sur 3**
  valide la vue et débloque la suivante du module. Les vues verrouillées restent visibles (◇) ; les vues validées
  portent ✓. Le mode cinématique s'ouvre à **10 vues validées** ; chaque parcours guidé s'ouvre quand toutes ses
  vues sont débloquées. Le tuto est toujours accessible.
- **Rang** affiché dans le rail : RECRUE → CADET (3) → NAVIGATEUR (8) → ANALYSTE (16) → ARCHITECTE (28) →
  MAÎTRE DES DIMENSIONS (46).
- **Mode libre** (Ctrl+K → « mode libre », avec confirmation) : tout débloquer d'un coup. **Réinitialiser la
  progression** : Ctrl+K → « réinitialiser ».
- La progression est enregistrée dans le navigateur (localStorage) : elle est propre à ce navigateur et disparaît
  si l'on efface les données de navigation.

Le contenu est déclaratif : `src/modules/<module>/study.ts` (une entrée par vue : leçon + 3 exercices).
Un exercice MANIPULATION déclare dans `uses` les libellés exacts des contrôles qu'il lit ; le smoke test vérifie
qu'ils existent dans la vue.

## Tuto et parcours guidés

| Visite | Durée | Contenu |
|---|---|---|
| **Tuto · Prise en main** (`T`) | ≈ 13 min | 17 étapes interactives : navigation, changement de module, manipulation 3D, panneau, Σ, saisie d'une fonction, Ctrl+K, leçon et déblocages, calculatrice (`V3(27)` → 3), carnet de notes, onglet LEARN, cours écrit, leçons-jeux, onglet ATLAS, mode histoire, musique / compte / téléchargement, raccourcis. Il reste actif d'un onglet à l'autre (`crossMode`) |
| **Du cercle à e^(iπ)** | ≈ 4 min | π d'Archimède → i → e^(iθ) → (1 + iπ/n)ⁿ → Fourier → e^z |
| **La 4ᵉ dimension** | ≈ 4 min | Flatland → coupes du tesseract → projections → 120-cell → Hopf → hypervolume |
| **Le chaos et l'infini** | ≈ 4 min | Lorenz → Koch → plongée ×10³⁰ → Julia → Collatz → TCL |

`G` ouvre le menu des parcours. Les parcours avancent seuls (pause possible) ; le tuto attend que tu fasses l'action demandée. `Échap` quitte.

## Raccourcis

| Touche | Action |
|---|---|
| `Ctrl+K` | Palette de commandes (aller à n'importe quelle vue, action ou visite) |
| `?` | Panneau KEYMAP |
| `T` / `G` | Tuto / parcours guidés |
| `1` … `6` / `←` `→` | Module / vue précédente-suivante (les vues verrouillées sont sautées) |
| `E` | Leçon + exercices de la vue (terminal) |
| `S` | Formule Σ |
| `Espace` | Pause |
| `C` | Mode CINÉMATIQUE (visite automatique, sans interface ; débloqué à 10 vues validées) — `Échap` pour quitter |
| `D` | Mode DÉFI (quiz du module) |
| `P` / `R` | Export PNG haute résolution / enregistrement WebM |
| `Q` | Qualité LOW / MED / HIGH / **AUTO** (par défaut : la résolution s'adapte au FPS) |
| `M` / `L` / `H` / `F` | Sons / scanlines / masquer l'interface / plein écran |
| `=` | **CALC** : calculatrice et raccourcis de caractères (partout, aussi dans l'ATLAS et LEARN) |
| `N` | **NOTES** : carnet façon terminal, gardé dans le navigateur et sur le compte (chaque note retient sa vue ; `/aide`, `/cherche`, `/ici`, `/efface n`, `/exporte` ; `Tab` convertit un raccourci de caractère) |
| `J` / `X` | Mode histoire : livre de bord / compas d'Euclide |

Souris : glisser = orbite ou déplacement, molette = zoom, clic droit = déplacement 3D, double-clic = recentrer.

### Musique de fond

Musique **générative** (WebAudio, aucun fichier) : une humeur par zone — ATLAS (lydien, lent), EXPLORER (dorien),
LEARN (éolien, calme), jeux (phrygien, pulsé), mode histoire (plus sombre). Fondu enchaîné au changement de zone ;
elle s'efface (ducking) pendant une voix off ou un briefing. Bouton **MUSIQUE** (clic : on/off ; clic droit : volume
25 / 50 / 75 / 100 %). Elle ne démarre qu'après un premier geste (politique des navigateurs).

### Calculatrice et raccourcis de caractères (CALC, touche `=`)

Panneau à droite, utilisable sur tous les écrans. Les **raccourcis** se tapent tels quels et deviennent des symboles
au caractère suivant (ou `Tab`) : `V` → √, `V3` → ∛, `V2` → √2, `pi` → π, `inf` → ∞, `<=` → ≤, `!=` → ≠,
`->` → →, `=>` → ⇒, `AA` → ∀, `EE` → ∃, `in` → ∈, `RR` → ℝ, `int` → ∫, `sum` → Σ, `alpha` → α,
`x^2` → x², `u_n` → uₙ… (≈ 150, liste complète et recherche dans le panneau ; `⌫` juste après une conversion la
défait). Le calcul comprend : multiplication implicite, `n!`, `%`, `°`, `±` (toutes les valeurs), comparaisons
(vrai/faux), variables et fonctions (`f(x) = x² + 1`, `f'(2)`), `ans`, RAD/DEG, et
`sum`/`prod` (bornes infinies : extrapolation d'Aitken puis de Richardson), `int` (quadrature tanh-sinh, bornes
infinies), `der`, `lim`, `solve`, `gcd`, `lcm`, `factor`, `divisors`, `isprime` (Miller-Rabin exact
jusqu'à 2⁵³), `prime`, `primepi`, `totient`, `fib`, `binom`, `gamma`, `zeta`, `erf`… Chaque résultat
indique une **forme reconnue** quand elle existe (3/4, π/6, √2/2, π²/6, (1 + √5)/2, ln 2). Historique, variables et
fonctions sont gardés (localStorage). Code pur et testé : `src/calc/` (les exemples de la liste des fonctions sont
évalués par les tests).

## Développement

```bash
npm install
npm run dev        # serveur de développement Vite
npm run typecheck  # tsc --noEmit
npm test           # Vitest : parser réel/complexe, différentiation automatique, polytopes, décimales,
                   # intégration, zêta, précision BigInt, points de Misiurewicz, contenu des 46 leçons
                   # (3 exercices bien formés par vue), lecture des réponses, règles de déblocage
npm run build      # dist/index.html (fichier unique, vite-plugin-singlefile)
npm run smoke      # dist/index.html en file:// dans Edge headless : visite les 46 vues (0 erreur console,
                   # libellés des exercices présents), teste palette, Σ, défi, PNG, WebM, qualité, sons,
                   # cinématique, joue le tuto avec de vraies actions, les 3 parcours, les verrous sur un profil
                   # neuf (exercices résolus dans le terminal → vue suivante débloquée), l'invitation de 1ʳᵉ visite
                   # + LEARN (cours et intros parcourus, pause exercice, intro depuis le rail), vidéos de chaque vue
npm run check      # typecheck + tests + build + smoke
npm run voice -- --dry-run   # voix off LEARN : estimation (rien n'est envoyé) ; --yes pour générer
npm run voice:list # voix du compte ElevenLabs (★ = français) et crédits restants ; ne consomme rien
npm run videos:check  # revérifie les 94 liens YouTube (réseau) ; -- --write met à jour titres et durées
npm run package    # build + ../V3CT0R.zip (application + MP3 + source/, jamais .env)
npm run app        # build + ouvre V3CT0R dans sa fenêtre d'app de bureau (Electron, electron/main.cjs)
npm run app:win    # build + release/V3CT0R-Setup.exe (installeur Windows, electron-builder.yml)
npm run icons      # build/icon.ico + icon.png + favicon depuis src/assets/logo/v3ct0r-icon*.svg
npm run digits     # régénère src/data/digits.ts (BigInt, double vérification)
npm run fonts      # retélécharge les sous-ensembles de polices (réseau, une seule fois)
```

Le smoke test utilise `playwright-core` avec le Microsoft Edge installé (aucun navigateur téléchargé).
Options : `--only=fractals`, `--shots=<dossier>`, `--wait=1500`, `--headed`, `--file=<index.html>`.

## Architecture

```
src/
├─ main.ts            entrée : sonde WebGL2, écran de boot, démarrage
├─ core/              app (routeur #/module/vue, boucle, qualité AUTO, capture PNG/WebM, cinématique, clavier),
│                     types (contrat VizDef), settings, audio (Web Audio), study (types leçon/exercices),
│                     progress (déblocages, rangs, localStorage)
├─ gfx/               stage3d (Three.js + orbite), shader-stage (quad plein écran), escape-time
│                     (texture flottante, rendu progressif par bandes), panzoom, plot2d, frame2d, materials
├─ math/              parser (texte → AST → JS | GLSL | LaTeX), complex (f(z) → JS | GLSL), jet (séries de
│                     Taylor tronquées), bigfixed (BigInt, orbites de référence, Newton), numeric, linalg4, …
├─ hud/               tokens.css, hud.css, composants (ui.ts + registre des contrôles), effets, déco, logo
├─ shell/             boot, layout, viewport-hud, palette, overlays, challenge, tour (moteur), tours (contenu),
│                     terminal (leçons et exercices)
├─ assets/logo/       logo « orbite et vecteur » : icône d’app (v3ct0r-icon.svg, -small ≤ 24 px), symbole (SVG)
├─ data/digits.ts     10 000 décimales de π, e, φ, √2, ln 2, ζ(3), γ (scripts/gen-digits.mjs)
├─ modules/
│  ├─ integrals/  4d/  fractals/  constants/  principles/  probability/
│  │     (chaque module : index.ts, ses vues *-view.ts, study.ts)
└─ learn/             V3CT0R LEARN : types, script (parseur de script.md), speak (LaTeX → français parlé),
                      clips (clips audio, sous-titres, timeline), courses (chargement au build), stage
                      (primitives d'animation, pures en fonction du temps), scene (pilotage des vues),
                      player (horloge calée sur la voix, barre, pauses exercice), graph (graphe des cours,
                      pur, testé), layout (disposition 3D déterministe), graph-view (rendu), refs ([[renvois]]), exercise,
                      colle, sheet (fiche PDF), progress, learn (contrôleur), learn.css
courses/              un dossier par cours + curriculum.json + pronunciation.fr.json
electron/             main.cjs : l’app de bureau (fenêtre, liens vers le navigateur) ; electron-builder.yml : installeur
build/                icon.ico, icon.png (npm run icons)
tools/                generate-voice.ts (ElevenLabs, cache, --dry-run), voice.config.json
```

**Logo** : un V tracé comme deux vecteurs partant de la même origine, dans des crochets de visée HUD
(`src/hud/logo.ts`, master `src/assets/logo/v3ct0r-symbol.svg`). Le nom en haut à gauche est animé :
les lettres flottent et « buggent » par salves (glyphes brouillés, décalages, tranches de glitch) ; le survol
déclenche une salve. Les animations s'arrêtent si le système demande moins de mouvement.

Chaque visualisation est un objet `VizDef` (`id`, `title`, `stage: '2d' | '3d' | 'shader'`, `formula`,
`create(ctx) → { update, resize?, dispose?, cinematic? }`). La palette, le mode cinématique, le bouton Σ,
l'export, le défi et les parcours se branchent automatiquement sur ce contrat. Les parcours pilotent les vues
par les **libellés** de leurs contrôles (registre de `hud/ui.ts`) : renommer un libellé impose de mettre à jour
`shell/tours.ts` (le smoke test le détecte).

Choix techniques :
- **Un seul contexte WebGL2** partagé (Three.js) + un canvas 2D superposé pour le HUD et les vues 2D.
- **Calcul GPU** pour tout ce qui est lourd : fractales, polytopes 4D et fibres de Hopf (rotation 4×4 et
  projection dans le vertex shader), nuages de densité et lignes de niveau complexes (la fonction saisie est
  compilée en GLSL), spirale d'Ulam (test de primalité par pixel).
- **Parser maison** compilant la même expression en JavaScript, GLSL réel ou complexe, LaTeX et séries de Taylor.
- **Zoom profond** : orbite de référence en BigInt (jusqu'à 320 bits), écarts en float32 sur GPU, rebasage de Zhuoran.
- **Décimales** calculées en BigInt et vérifiées par deux formules indépendantes.

## Limites connues

- Zoom Mandelbrot : la perturbation en float32 va jusqu'à ~10³⁰ ; au-delà, les écarts sortent de la plage des
  flottants 32 bits (il faudrait des exposants étendus).
- Enregistrement WebM : Chrome, Edge et Firefox (pas Safari).
- Qualité AUTO : réduit la résolution si le FPS passe sous ~48 ; sur GPU très faible, choisir LOW (`Q`).

## Licences

Code : © 2026, usage personnel. Bibliothèques et polices : voir `LICENSES.md`
(Three.js et KaTeX sous MIT ; JetBrains Mono, Michroma, Noto Sans JP sous SIL OFL 1.1).
