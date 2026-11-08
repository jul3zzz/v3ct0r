# Topologie des espaces vectoriels normés (cours écrit) — points à faire vérifier

Relecture humaine demandée avant diffusion.

## Choix de présentation
- Compacité définie par la **propriété de Bolzano-Weierstrass** (suites), conformément au programme MP ; Borel-Lebesgue n'est pas abordé.
- **Compacts de la dimension finie** : preuve esquissée dans $\mathbb{K}^n$ avec $\|\cdot\|_\infty$ (extractions successives).
- **Équivalence des normes en dimension finie** : preuve donnée (continuité de $N$ pour $\|\cdot\|_\infty$, compacité de la sphère unité).
- **Théorème de Weierstrass** (densité des polynômes dans $C([a,b])$ pour $\|\cdot\|_\infty$) : énoncé sans preuve.
- **Connexité par arcs** : $GL_n(\mathbb{R})$ a exactement deux composantes (énoncé sans preuve) ; $GL_n(\mathbb{C})$ connexe par arcs (sans preuve).
- Complétude des espaces de dimension finie : énoncée dans le texte, utilisée dans l'exercice c2.

## Points délicats
- Inégalités entre normes de $\mathbb{K}^n$ : $\|x\|_\infty \le \|x\|_2 \le \|x\|_1 \le n\|x\|_\infty$, $\|x\|_2 \le \sqrt n \|x\|_\infty$, $\|x\|_1 \le \sqrt n \|x\|_2$. Vérifiées.
- $f_n(t) = t^n$ : $\|f_n\|_\infty = 1$, $\|f_n\|_1 = \frac{1}{n+1}$, pas de sous-suite convergente pour $\|\cdot\|_\infty$ (la limite simple est discontinue).
- Dérivation non continue sur $(\mathbb{R}[X], \max_{[0,1]}|\cdot|)$ : $\|X^n\| = 1$, $\|nX^{n-1}\| = n$.
- $GL_n(\mathbb{K})$ ouvert comme image réciproque de $\mathbb{K}^*$ par le déterminant.

## Exercices
- **s1** : constante $\sqrt 3$, égalité pour $(1,1,1)$.
- **s3** : norme subordonnée $3$ (somme maximale des lignes pour $\|\cdot\|_\infty$).
- **m1** : $\|f_n\|_1 = \frac{1}{2n}$ ; $\|f_5\|_1 = 0{,}1$.
- **m3** : $|\sqrt x - \sqrt y| \le \sqrt{|x-y|}$ ; $x_n^2 - y_n^2 = 2 + \frac{1}{n^2}$.
- **c1** : $C_1 = 2$ (atteint par $2X - 1$) ; mention de l'inégalité de Markov $C_n = 2n^2$ sur $[0, 1]$ (atteinte par un polynôme de Tchebychev transporté), énoncée sans preuve — à vérifier par le relecteur.
- **c2** : point fixe de $\cos$ sur $[0, 1]$ : $0{,}739085\ldots$ ; constante de contraction $\sin 1 \approx 0{,}841$.

## Références
- Skandalis (*Topologie et analyse*), Gourdon (*Analyse*), Deschamps, Warusfel et al. (*Mathématiques tout-en-un MP*). Aucune autre référence n'est citée.
