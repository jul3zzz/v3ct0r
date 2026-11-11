# s1 · simple · 10 · Signature d'une permutation
Soit $\sigma \in \mathcal{S}_6$ donnée par $\sigma(1) = 2$, $\sigma(2) = 3$, $\sigma(3) = 4$, $\sigma(4) = 1$, $\sigma(5) = 6$, $\sigma(6) = 5$. Décomposer $\sigma$ en cycles à supports disjoints et calculer sa signature.
## Indice
Suivre l'orbite de $1$ : $1 \to 2 \to \cdots$ jusqu'au retour en $1$.
## Indice
On trouve un cycle de longueur $4$ et une transposition.
## Indice
Un cycle de longueur $p$ a pour signature $(-1)^{p-1}$, et la signature est un morphisme.
## Étape · 1
$\sigma = (1\ 2\ 3\ 4)(5\ 6)$, cycles à supports disjoints.
## Étape · 1
$\varepsilon(\sigma) = (-1)^{3} \cdot (-1)^{1} = 1$ : $\sigma$ est paire.
## Réponse
num 1 ± 0.001

# s2 · simple · 15 · Un déterminant 3 × 3
Calculer $D = \begin{vmatrix} 1 & 2 & 3 \\ 4 & 5 & 6 \\ 7 & 8 & 10 \end{vmatrix}$.
## Indice
Créer des zéros dans la première colonne par $L_2 \leftarrow L_2 - 4L_1$ et $L_3 \leftarrow L_3 - 7L_1$.
## Indice
Il reste à développer selon la première colonne un déterminant $2 \times 2$.
## Indice
Contrôle : par Sarrus, $50 + 84 + 96 - 105 - 48 - 80$.
## Étape · 1
Après les opérations, $D = \begin{vmatrix} 1 & 2 & 3 \\ 0 & -3 & -6 \\ 0 & -6 & -11 \end{vmatrix}$ (ces opérations ne changent pas le déterminant).
## Étape · 1
En développant selon la première colonne : $D = (-3)(-11) - (-6)(-6) = 33 - 36 = -3$. Sarrus donne bien $230 - 233 = -3$.
## Réponse
num -3 ± 0.001

# m1 · moyen · 30 · Un déterminant tridiagonal
Pour $n \ge 1$, soit $D_n$ le déterminant de taille $n$ dont les coefficients diagonaux valent $2$, ceux immédiatement au-dessus et au-dessous de la diagonale valent $-1$, et les autres $0$.

1. Calculer $D_1$ et $D_2$.
2. En développant selon la première ligne, montrer que $D_n = 2D_{n-1} - D_{n-2}$ pour $n \ge 3$.
3. En déduire $D_n$ pour tout $n$, puis $D_5$.
## Indice
$D_1 = 2$ et $D_2 = 4 - 1$.
## Indice
Le développement selon la première ligne donne $2D_{n-1}$ plus un second terme ; développer ce second mineur selon sa première colonne.
## Indice
La suite $(D_n)$ vérifie une récurrence linéaire d'ordre $2$ dont l'équation caractéristique a une racine double : $D_n - D_{n-1}$ est constant.
## Étape · 1
$D_1 = 2$, $D_2 = 2 \times 2 - (-1)(-1) = 3$.
## Étape · 2
Selon la première ligne : $D_n = 2D_{n-1} - (-1)\Delta_{12}$, où le mineur $\Delta_{12}$ a pour première colonne $(-1, 0, \ldots, 0)$ ; en le développant selon cette colonne, $\Delta_{12} = -D_{n-2}$. Donc $D_n = 2D_{n-1} - D_{n-2}$.
## Étape · 2
$D_n - D_{n-1} = D_{n-1} - D_{n-2} = \cdots = D_2 - D_1 = 1$, donc $D_n = n + 1$ (récurrence). En particulier $D_5 = 6$.
## Réponse
num 6 ± 0.001

# m2 · moyen · 30 · Le déterminant de a sur la diagonale et b ailleurs
Soient $a, b \in \mathbb{K}$ et $n \ge 2$. On note $M$ la matrice de taille $n$ dont les coefficients diagonaux valent $a$ et tous les autres $b$. Calculer $\det M$, puis sa valeur pour $n = 4$, $a = 3$, $b = 1$.
## Indice
Ajouter à la première colonne la somme de toutes les autres : chaque coefficient de la première colonne devient $a + (n-1)b$.
## Indice
Mettre $a + (n-1)b$ en facteur, puis retrancher la première ligne à chacune des autres.
## Indice
On obtient une matrice triangulaire dont les coefficients diagonaux sont $1, a - b, \ldots, a - b$.
## Étape · 1
$C_1 \leftarrow C_1 + C_2 + \cdots + C_n$ ne change pas le déterminant et remplit la première colonne de $a + (n-1)b$, que l'on met en facteur.
## Étape · 2
Les opérations $L_i \leftarrow L_i - L_1$ ($i \ge 2$) donnent une matrice triangulaire supérieure de diagonale $(1, a - b, \ldots, a - b)$ : $\det M = \big(a + (n-1)b\big)(a - b)^{n-1}$.
## Étape · 1
Pour $n = 4$, $a = 3$, $b = 1$ : $\det M = 6 \times 2^3 = 48$. La matrice est inversible si et seulement si $a \neq b$ et $a \neq -(n-1)b$.
## Réponse
num 48 ± 0.001

# m3 · moyen · 30 · Inverser par la comatrice
Soit $A = \begin{pmatrix} 2 & 1 & 0 \\ 1 & 2 & 1 \\ 0 & 1 & 2 \end{pmatrix}$. Calculer $\det A$, la comatrice de $A$, puis $A^{-1}$ (méthode de MPSI et MP2I ; en PCSI et PTSI, inverser par le pivot). Donner le coefficient $(1, 1)$ de $A^{-1}$.
## Indice
$\det A$ par développement selon la première ligne.
## Indice
Cofacteur $C_{ij} = (-1)^{i+j}\Delta_{ij}$ ; ici $A$ est symétrique, donc sa comatrice aussi.
## Indice
$A^{-1} = \frac{1}{\det A}\operatorname{Com}(A)^\top$ ; vérifier en calculant $AA^{-1}$.
## Étape · 1
$\det A = 2(4 - 1) - 1(2 - 0) + 0 = 4$.
## Étape · 2
Cofacteurs : $C_{11} = 3$, $C_{12} = -2$, $C_{13} = 1$, $C_{21} = -2$, $C_{22} = 4$, $C_{23} = -2$, $C_{31} = 1$, $C_{32} = -2$, $C_{33} = 3$. Donc $A^{-1} = \frac14\begin{pmatrix} 3 & -2 & 1 \\ -2 & 4 & -2 \\ 1 & -2 & 3 \end{pmatrix}$.
## Étape · 1
Contrôle : la première ligne de $A$ fois les colonnes de $4A^{-1}$ donne $(4, 0, 0)$, de même pour les autres lignes. Le coefficient $(1, 1)$ vaut $\frac34$.
## Réponse
num 0.75 ± 0.001

# c1 · complexe · 75 · Existence de la signature
Pour $\sigma \in \mathcal{S}_n$ ($n \ge 2$), on pose $\displaystyle\varepsilon(\sigma) = \prod_{1 \le i < j \le n} \frac{\sigma(j) - \sigma(i)}{j - i}$.

1. Montrer que $\varepsilon(\sigma) \in \{-1, 1\}$, et que $\varepsilon(\sigma) = (-1)^{N(\sigma)}$, où $N(\sigma)$ est le nombre d'inversions de $\sigma$.
2. Montrer que $\varepsilon(\sigma\tau) = \varepsilon(\sigma)\varepsilon(\tau)$.
3. Montrer que $\varepsilon\big((1\ 2)\big) = -1$, puis que $\varepsilon(\tau) = -1$ pour toute transposition $\tau$.
4. En déduire le théorème de la signature (existence et unicité).
5. Calculer $\varepsilon(\sigma)$ pour $\sigma = \begin{pmatrix} 1 & 2 & 3 & 4 & 5 \\ 2 & 3 & 1 & 5 & 4 \end{pmatrix}$ par les inversions, et contrôler par les cycles.
## Indice
Pour 1 : quand $\{i, j\}$ parcourt les paires de $\{1, \ldots, n\}$, $\{\sigma(i), \sigma(j)\}$ les parcourt aussi ; un facteur est négatif exactement pour une inversion.
## Indice
Pour 2 : écrire $\frac{\sigma\tau(j) - \sigma\tau(i)}{j - i} = \frac{\sigma(\tau(j)) - \sigma(\tau(i))}{\tau(j) - \tau(i)} \cdot \frac{\tau(j) - \tau(i)}{j - i}$ ; le quotient $\frac{\sigma(b) - \sigma(a)}{b - a}$ est symétrique en $(a, b)$.
## Indice
Pour 3 : pour $(1\ 2)$, seul le couple $(1, 2)$ est une inversion. Toute transposition $(a\ b)$ s'écrit $\pi (1\ 2) \pi^{-1}$ pour une permutation $\pi$ convenable.
## Étape · 2
Le numérateur $\prod_{i<j}(\sigma(j) - \sigma(i))$ a la même valeur absolue que $\prod_{i<j}(j - i)$, car $\{\sigma(i), \sigma(j)\}$ parcourt toutes les paires. Donc $|\varepsilon(\sigma)| = 1$, et le signe est $(-1)^{N(\sigma)}$, chaque inversion donnant un facteur négatif.
## Étape · 2
En décomposant chaque facteur de $\varepsilon(\sigma\tau)$ comme dans l'indice, le second produit vaut $\varepsilon(\tau)$. Le premier est le produit de $\frac{\sigma(b) - \sigma(a)}{b - a}$ sur les paires $\{a, b\} = \{\tau(i), \tau(j)\}$, qui parcourent toutes les paires ; comme ce quotient ne dépend pas de l'ordre de $a$ et $b$, ce produit vaut $\varepsilon(\sigma)$.
## Étape · 2
Pour $(1\ 2)$, les couples $(1, j)$ et $(2, j)$ avec $j \ge 3$ ne sont pas des inversions, et $(1, 2)$ en est une : $\varepsilon = -1$. Si $\pi(1) = a$ et $\pi(2) = b$, alors $(a\ b) = \pi(1\ 2)\pi^{-1}$, et par 2, $\varepsilon((a\ b)) = \varepsilon(\pi)(-1)\varepsilon(\pi)^{-1} = -1$.
## Étape · 1
Par 2 et 3, $\varepsilon$ est un morphisme de $\mathcal{S}_n$ dans $\{-1, 1\}$ valant $-1$ sur les transpositions : c'est l'existence. Comme toute permutation est un produit de transpositions, deux tels morphismes coïncident : c'est l'unicité.
## Étape · 1
Inversions de $\sigma$ : $(1, 3)$, $(2, 3)$, $(4, 5)$, donc $\varepsilon(\sigma) = (-1)^3 = -1$. Par les cycles : $\sigma = (1\ 2\ 3)(4\ 5)$, de signature $(+1)(-1) = -1$.
## Réponse
num -1 ± 0.001
