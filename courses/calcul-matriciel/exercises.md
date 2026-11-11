# s1 · simple · 10 · Deux produits qui diffèrent
Soient $A = \begin{pmatrix} 1 & 2 \\ 0 & 1 \end{pmatrix}$ et $B = \begin{pmatrix} 1 & 0 \\ 3 & 1 \end{pmatrix}$. Calculer $AB$, $BA$, puis le coefficient $(1, 1)$ de $AB - BA$.
## Indice
Coefficient $(i, j)$ du produit : ligne $i$ du premier facteur, colonne $j$ du second.
## Indice
$(AB)_{11} = 1 \cdot 1 + 2 \cdot 3$.
## Indice
$(BA)_{11} = 1 \cdot 1 + 0 \cdot 0$.
## Étape · 1
$AB = \begin{pmatrix} 7 & 2 \\ 3 & 1 \end{pmatrix}$ et $BA = \begin{pmatrix} 1 & 2 \\ 3 & 7 \end{pmatrix}$.
## Étape · 1
$AB - BA = \begin{pmatrix} 6 & 0 \\ 0 & -6 \end{pmatrix}$ : le coefficient $(1, 1)$ vaut $6$, et $AB \neq BA$.
## Réponse
num 6 ± 0.001

# s2 · simple · 10 · Un système par le pivot
Résoudre par la méthode du pivot le système $x + y + z = 6$, $x + 2y + 3z = 14$, $2x + y + z = 7$. Donner $z$.
## Indice
Prendre $x$ dans la première équation comme pivot et l'éliminer des deux autres.
## Indice
$L_2 \leftarrow L_2 - L_1$ et $L_3 \leftarrow L_3 - 2L_1$ donnent un système en $y$ et $z$.
## Indice
Ajouter les deux nouvelles équations élimine $y$.
## Étape · 1
On obtient $y + 2z = 8$ et $-y - z = -5$, puis, en ajoutant, $z = 3$.
## Étape · 1
En remontant : $y = 8 - 6 = 2$ et $x = 6 - 2 - 3 = 1$. Vérification dans les trois équations : $6$, $1 + 4 + 9 = 14$, $2 + 2 + 3 = 7$.
## Réponse
num 3 ± 0.001

# m1 · moyen · 25 · Puissances d'une matrice triangulaire
Soit $A = \begin{pmatrix} 2 & 1 & 0 \\ 0 & 2 & 1 \\ 0 & 0 & 2 \end{pmatrix}$. Écrire $A = 2I_3 + N$, calculer $N^2$ et $N^3$, puis $A^n$ pour $n \ge 2$. Donner le coefficient $(1, 3)$ de $A^5$.
## Indice
$N = E_{12} + E_{23}$ ; calculer $N^2$ avec la règle $E_{ij}E_{kl} = \delta_{jk}E_{il}$.
## Indice
$N^2 = E_{13}$ et $N^3 = 0$. Les matrices $2I_3$ et $N$ commutent : formule du binôme.
## Indice
$A^n = 2^n I_3 + n 2^{n-1} N + \binom{n}{2} 2^{n-2} N^2$.
## Étape · 1
$N = E_{12} + E_{23}$, $N^2 = E_{12}E_{23} = E_{13}$ (les autres produits sont nuls), et $N^3 = E_{13}(E_{12} + E_{23}) = 0$.
## Étape · 2
$2I_3$ commute avec $N$, donc $A^n = \sum_k \binom nk 2^{n-k}N^k = 2^n I_3 + n2^{n-1}N + \frac{n(n-1)}{2}2^{n-2}E_{13}$, soit
$$A^n = \begin{pmatrix} 2^n & n2^{n-1} & n(n-1)2^{n-3} \\ 0 & 2^n & n2^{n-1} \\ 0 & 0 & 2^n \end{pmatrix}.$$
## Étape · 1
Pour $n = 5$ : coefficient $(1, 3)$ égal à $5 \times 4 \times 2^2 = 80$.
## Réponse
num 80 ± 0.001

# m2 · moyen · 30 · Inverser par Gauss-Jordan
Montrer que $A = \begin{pmatrix} 1 & 1 & 0 \\ 0 & 1 & 1 \\ 1 & 0 & 1 \end{pmatrix}$ est inversible et calculer $A^{-1}$ par la méthode de Gauss-Jordan. Donner le coefficient $(1, 2)$ de $A^{-1}$.
## Indice
Écrire le tableau $(A \mid I_3)$ et commencer par $L_3 \leftarrow L_3 - L_1$.
## Indice
Ensuite $L_3 \leftarrow L_3 + L_2$ fait apparaître une ligne $(0\ 0\ 2)$ à gauche : $A$ est inversible.
## Indice
Diviser la dernière ligne par $2$, puis remonter en annulant les coefficients au-dessus des pivots. Contrôler le résultat en calculant $AA^{-1}$.
## Étape · 1
$L_3 \leftarrow L_3 - L_1$ : à gauche $(0, -1, 1)$, à droite $(-1, 0, 1)$. Puis $L_3 \leftarrow L_3 + L_2$ : à gauche $(0, 0, 2)$, à droite $(-1, 1, 1)$. Trois pivots non nuls : $A$ est inversible.
## Étape · 2
$L_3 \leftarrow \frac12 L_3$ : à droite $\frac12(-1, 1, 1)$. $L_2 \leftarrow L_2 - L_3$ : à droite $\frac12(1, 1, -1)$. $L_1 \leftarrow L_1 - L_2$ : à droite $\frac12(1, -1, 1)$. Donc
$$A^{-1} = \frac12\begin{pmatrix} 1 & -1 & 1 \\ 1 & 1 & -1 \\ -1 & 1 & 1 \end{pmatrix}.$$
## Étape · 1
Contrôle : la première ligne de $A$ fois les colonnes de $2A^{-1}$ donne $(2, 0, 0)$, et de même pour les autres lignes. Le coefficient $(1, 2)$ vaut $-\frac12$.
## Réponse
num -0.5 ± 0.001

# m3 · moyen · 20 · Partie symétrique, partie antisymétrique
1. Montrer que toute matrice $M \in \mathcal{M}_n(\mathbb{R})$ s'écrit de façon unique $M = S + A$ avec $S$ symétrique et $A$ antisymétrique.
2. Faire la décomposition pour $M = \begin{pmatrix} 1 & 2 \\ 4 & 3 \end{pmatrix}$ et donner le coefficient $(1, 2)$ de $S$.
## Indice
Raisonner par analyse-synthèse : si $M = S + A$, transposer.
## Indice
On obtient $M^\top = S - A$ ; en déduire $S$ et $A$ en fonction de $M$ et $M^\top$.
## Indice
$S = \frac{M + M^\top}{2}$ et $A = \frac{M - M^\top}{2}$ ; vérifier qu'elles conviennent.
## Étape · 1
Analyse : si $M = S + A$, alors $M^\top = S - A$, d'où $S = \frac{M + M^\top}{2}$ et $A = \frac{M - M^\top}{2}$ : il y a au plus une décomposition.
## Étape · 1
Synthèse : ces matrices conviennent, car $S^\top = \frac{M^\top + M}{2} = S$, $A^\top = \frac{M^\top - M}{2} = -A$ et $S + A = M$.
## Étape · 1
Pour $M = \begin{pmatrix} 1 & 2 \\ 4 & 3 \end{pmatrix}$ : $S = \begin{pmatrix} 1 & 3 \\ 3 & 3 \end{pmatrix}$ et $A = \begin{pmatrix} 0 & -1 \\ 1 & 0 \end{pmatrix}$. Coefficient $(1, 2)$ de $S$ : $3$.
## Réponse
num 3 ± 0.001

# c1 · complexe · 60 · Nilpotentes et triangulaires
1. Soit $N \in \mathcal{M}_n(\mathbb{K})$ telle que $N^r = 0$. Montrer que $I_n - N$ est inversible, d'inverse $I_n + N + \cdots + N^{r-1}$.
2. Montrer qu'une matrice $T$ triangulaire supérieure à diagonale nulle (dite strictement triangulaire supérieure) vérifie $T^n = 0$.
3. Soit $N = E_{12} + E_{23} + \cdots + E_{n-1,n}$. Calculer $(I_n - N)^{-1}$.
4. En déduire qu'une matrice triangulaire supérieure à coefficients diagonaux non nuls est inversible, d'inverse triangulaire supérieure.
5. Pour $n = 4$, quelle est la somme de tous les coefficients de $(I_4 - N)^{-1}$ ?
## Indice
Pour 1 : factorisation de $I_n - N^r$, les matrices $I_n$ et $N$ commutant. Pour 2 : montrer par récurrence sur $k$ que $(T^k)_{ij} = 0$ dès que $j < i + k$.
## Indice
Pour 3 : $N^k = E_{1,1+k} + E_{2,2+k} + \cdots$ (des $1$ sur la $k$-ième surdiagonale) et $N^n = 0$.
## Indice
Pour 4 : écrire $T = D + T'$ avec $D$ diagonale inversible et $T'$ strictement triangulaire, puis $T = D(I_n + D^{-1}T')$.
## Étape · 1
$I_n$ et $N$ commutent, donc $(I_n - N)(I_n + N + \cdots + N^{r-1}) = I_n - N^r = I_n$, et de même dans l'autre ordre : $I_n - N$ est inversible, d'inverse $\sum_{k=0}^{r-1} N^k$.
## Étape · 2
Récurrence : pour $k = 1$, $t_{ij} = 0$ si $j < i + 1$, c'est-à-dire $j \le i$. Si c'est vrai pour $T^k$, alors $(T^{k+1})_{ij} = \sum_m (T^k)_{im} t_{mj}$, et chaque terme est nul : ou bien $m < i + k$ et $(T^k)_{im} = 0$, ou bien $m \ge i + k$, donc $j < i + k + 1 \le m + 1$, soit $j \le m$ et $t_{mj} = 0$. Pour $k = n$, la condition $j < i + n$ est toujours vraie : $T^n = 0$.
## Étape · 1
$N$ est strictement triangulaire supérieure, donc $N^n = 0$, et $(I_n - N)^{-1} = I_n + N + \cdots + N^{n-1}$ : c'est la matrice $U$ triangulaire supérieure dont **tous** les coefficients sur et au-dessus de la diagonale valent $1$.
## Étape · 2
Si $T = D + T'$ avec $D = \operatorname{diag}(t_{11}, \ldots, t_{nn})$ inversible et $T'$ strictement triangulaire, alors $T = D(I_n + M)$ avec $M = D^{-1}T'$ strictement triangulaire supérieure (produit d'une diagonale par une strictement triangulaire), donc nilpotente. Par 1 appliqué à $-M$, $I_n + M$ est inversible, d'inverse $\sum_k (-M)^k$, triangulaire supérieure ; donc $T^{-1} = (I_n + M)^{-1}D^{-1}$ est triangulaire supérieure.
## Étape · 1
Pour $n = 4$, $U$ a $4 + 3 + 2 + 1 = 10$ coefficients égaux à $1$ et les autres nuls : la somme vaut $10$.
## Réponse
num 10 ± 0.001
