# s1 · simple · 10 · Sous-espace ou pas ?
Parmi les parties suivantes de $\mathbb{R}^3$, laquelle **n'est pas** un sous-espace vectoriel ?

A) $\{(x, y, z) : x + y + z = 0\}$ ; B) $\{(x, y, z) : x = 2y\}$ ; C) $\{(x, y, z) : xy = 0\}$ ; D) $\{(t, 2t, 3t) : t \in \mathbb{R}\}$.
## Indice
Un sous-espace contient $0$ et est stable par somme et par multiplication par un scalaire. Les ensembles définis par des équations linéaires homogènes le sont toujours.
## Indice
Pour l'ensemble défini par $xy = 0$, chercher deux vecteurs de l'ensemble dont la somme n'y est pas.
## Indice
Essayer $(1, 0, 0)$ et $(0, 1, 0)$.
## Étape · 1
A et B sont des noyaux de formes linéaires (équations linéaires homogènes) ; D est la droite $\operatorname{Vect}\big((1, 2, 3)\big)$ : ce sont des sous-espaces.
## Étape · 2
C contient $(1, 0, 0)$ et $(0, 1, 0)$, mais pas leur somme $(1, 1, 0)$, puisque $1 \times 1 \neq 0$ : ce n'est pas un sous-espace (c'est la réunion des plans $x = 0$ et $y = 0$).
## Réponse
qcm C
- $x + y + z = 0$
- $x = 2y$
- $xy = 0$
- la droite dirigée par $(1, 2, 3)$

# s2 · simple · 10 · Le rang d'une matrice
Calculer le rang de la matrice $A = \begin{pmatrix} 1 & 2 & 3 \\ 2 & 4 & 6 \\ 1 & 0 & 1 \end{pmatrix}$.
## Indice
Comparer les deux premières lignes.
## Indice
$L_2 = 2 L_1$. Les lignes $L_1$ et $L_3$ sont-elles proportionnelles ?
## Indice
Le rang des lignes est égal au rang des colonnes.
## Étape · 1
$L_2 = 2L_1$, donc le rang est au plus $2$ : l'espace engendré par les lignes est $\operatorname{Vect}(L_1, L_3)$.
## Étape · 1
$L_1 = (1, 2, 3)$ et $L_3 = (1, 0, 1)$ ne sont pas proportionnelles : elles sont libres, et le rang des lignes vaut $2$.
## Étape · 1
Comme le rang des lignes égale le rang des colonnes, $\operatorname{rg} A = 2$. Par le théorème du rang, le noyau de $X \mapsto AX$ est une droite : on trouve $\ker A = \operatorname{Vect}\big((1, 1, -1)\big)$.
## Réponse
num 2 ± 0.001

# s3 · simple · 10 · Un déterminant 3 × 3
Calculer $\det \begin{pmatrix} 2 & 1 & 0 \\ 1 & 3 & 1 \\ 0 & 1 & 2 \end{pmatrix}$.
## Indice
Développer selon la première ligne, en tenant compte des signes $+, -, +$.
## Indice
Le troisième coefficient de la première ligne est nul : il ne reste que deux mineurs $2 \times 2$.
## Indice
$\det = 2 \cdot \det\begin{pmatrix} 3 & 1 \\ 1 & 2 \end{pmatrix} - 1 \cdot \det\begin{pmatrix} 1 & 1 \\ 0 & 2 \end{pmatrix}$.
## Étape · 1
Développement selon la première ligne : $\det = 2\,(3 \cdot 2 - 1 \cdot 1) - 1\,(1 \cdot 2 - 1 \cdot 0) + 0$.
## Étape · 1
$\det = 2 \times 5 - 2 = 8$. La matrice est donc inversible.
## Réponse
num 8 ± 0.001

# m1 · moyen · 30 · Une application linéaire qui somme les carrés
Soit $u : \mathbb{R}_3[X] \to \mathbb{R}_3[X]$ définie par $u(P) = P(X + 1) - P(X)$.

1. Montrer que $u$ est linéaire et que son image est contenue dans $\mathbb{R}_2[X]$.
2. Déterminer $\ker u$, puis, par le théorème du rang, $\operatorname{Im} u$.
3. Trouver $P$ tel que $P(X + 1) - P(X) = X^2$ et $P(0) = 0$. En déduire une formule pour $\sum_{k=0}^{n-1} k^2$, puis calculer $\sum_{k=1}^{10} k^2$.
## Indice
Si $P$ est de degré $d \ge 1$ et de coefficient dominant $a$, développer $(X + 1)^d - X^d$ : que devient le terme de degré $d$ ?
## Indice
Si $P(X + 1) = P(X)$, alors $P - P(0)$ s'annule en $0, 1, 2, \ldots$ : combien de racines a-t-il ?
## Indice
Chercher $P = aX^3 + bX^2 + cX$ et identifier les coefficients ; puis sommer $P(k + 1) - P(k) = k^2$ pour $k = 0, \ldots, n-1$ (télescopage).
## Étape · 1
La linéarité découle de celle de $P \mapsto P(X + 1)$. Si $P = \sum_{j \le 3} a_j X^j$, le terme de degré $j$ de $P(X+1) - P(X)$ vient de $a_j\big((X + 1)^j - X^j\big)$, qui est de degré $j - 1$ : $u(P) \in \mathbb{R}_2[X]$.
## Étape · 2
Si $u(P) = 0$, alors $P(k) = P(0)$ pour tout entier $k \ge 0$ : le polynôme $P - P(0)$ a une infinité de racines, il est nul. Donc $\ker u$ est l'ensemble des constantes, de dimension $1$.
## Étape · 2
Par le théorème du rang, $\operatorname{rg} u = 4 - 1 = 3 = \dim \mathbb{R}_2[X]$. Comme $\operatorname{Im} u \subset \mathbb{R}_2[X]$, on a $\operatorname{Im} u = \mathbb{R}_2[X]$ : tout polynôme de degré au plus $2$ s'écrit $P(X + 1) - P(X)$.
## Étape · 2
Avec $P = aX^3 + bX^2 + cX$ : $P(X+1) - P(X) = 3aX^2 + (3a + 2b)X + (a + b + c)$. Identifier à $X^2$ donne $a = \frac13$, $b = -\frac12$, $c = \frac16$, soit $P = \frac{X^3}{3} - \frac{X^2}{2} + \frac{X}{6}$.
## Étape · 2
En sommant $P(k+1) - P(k) = k^2$ pour $k = 0, \ldots, n-1$ : $\sum_{k=0}^{n-1} k^2 = P(n) - P(0) = \frac{n^3}{3} - \frac{n^2}{2} + \frac{n}{6} = \frac{(n-1)n(2n-1)}{6}$. Avec $n = 11$ : $\sum_{k=1}^{10} k^2 = \frac{10 \times 11 \times 21}{6} = 385$.
## Réponse
num 385 ± 0.5

# m2 · moyen · 30 · Projecteurs qui commutent
Soit $E$ un espace vectoriel et $p, q \in \mathcal{L}(E)$ deux projecteurs ($p^2 = p$, $q^2 = q$).

1. Montrer que $E = \operatorname{Im} p \oplus \ker p$ et que $\operatorname{Im} p = \{x \in E : p(x) = x\}$.
2. On suppose $p \circ q = q \circ p$. Montrer que $p \circ q$ est un projecteur et que $\operatorname{Im}(p \circ q) = \operatorname{Im} p \cap \operatorname{Im} q$.
3. Montrer que $p + q$ est un projecteur si et seulement si $p \circ q = q \circ p = 0$.
## Indice
Pour la question 1, écrire $x = p(x) + (x - p(x))$.
## Indice
Pour la question 2, calculer $(pq)^2 = pqpq$ en utilisant la commutation. Pour l'inclusion réciproque, prendre $y \in \operatorname{Im} p \cap \operatorname{Im} q$ et calculer $pq(y)$.
## Indice
Pour la question 3, développer $(p + q)^2 = p + q + pq + qp$. Si $pq + qp = 0$, composer à gauche puis à droite par $p$.
## Étape · 2
$x = p(x) + (x - p(x))$ avec $p(x - p(x)) = p(x) - p^2(x) = 0$ : $E = \operatorname{Im} p + \ker p$. Si $y \in \operatorname{Im} p \cap \ker p$, alors $y = p(z)$ et $y = p(z) = p^2(z) = p(y) = 0$ : la somme est directe. De même $y = p(z)$ entraîne $p(y) = y$, et réciproquement $p(x) = x$ entraîne $x \in \operatorname{Im} p$.
## Étape · 2
$(pq)^2 = p(qp)q = p(pq)q = p^2 q^2 = pq$ : c'est un projecteur. Son image est dans $\operatorname{Im} p$ (car $pq(x) = p(q(x))$) et dans $\operatorname{Im} q$ (car $pq(x) = q(p(x))$).
## Étape · 1
Si $y \in \operatorname{Im} p \cap \operatorname{Im} q$, alors $q(y) = y$ et $p(y) = y$, donc $pq(y) = y \in \operatorname{Im}(pq)$. D'où l'égalité.
## Étape · 2
$(p + q)^2 = p + q + pq + qp$ : $p + q$ est un projecteur si et seulement si $pq + qp = 0$. Si $pq = qp = 0$, c'est vrai. Réciproquement, si $pq + qp = 0$, composer à gauche par $p$ donne $pq + pqp = 0$, et à droite par $p$ : $pqp + qp = 0$. En soustrayant, $pq = qp$, puis $2pq = 0$, donc $pq = qp = 0$.
## Étape · 1
On a utilisé $2 \neq 0$ dans $\mathbb{K}$ : c'est vrai pour $\mathbb{R}$ et $\mathbb{C}$.

# m3 · moyen · 25 · Inverser par le pivot de Gauss
Inverser par la méthode du pivot de Gauss les matrices
$$A = \begin{pmatrix} 1 & 1 & 1 \\ 0 & 1 & 1 \\ 0 & 0 & 1 \end{pmatrix} \qquad \text{et} \qquad B = \begin{pmatrix} 2 & 1 & 1 \\ 1 & 2 & 1 \\ 1 & 1 & 2 \end{pmatrix}.$$
Donner le coefficient en position $(1, 1)$ de $B^{-1}$.
## Indice
Écrire $(A \mid I_3)$ et éliminer de bas en haut : $A$ est déjà triangulaire.
## Indice
Pour $B$, on peut remarquer que $B = I_3 + J$, où $J$ est la matrice dont tous les coefficients valent $1$, et que $J^2 = 3J$.
## Indice
Chercher $B^{-1}$ sous la forme $aI_3 + bJ$ et développer $(I_3 + J)(aI_3 + bJ) = I_3$.
## Étape · 2
Pour $A$ : $L_2 \leftarrow L_2 - L_3$, puis $L_1 \leftarrow L_1 - L_2 - L_3$ dans $(A \mid I_3)$, ce qui donne $A^{-1} = \begin{pmatrix} 1 & -1 & 0 \\ 0 & 1 & -1 \\ 0 & 0 & 1 \end{pmatrix}$. Vérification : $A A^{-1} = I_3$.
## Étape · 2
Pour $B = I_3 + J$ avec $J^2 = 3J$ : $(I_3 + J)(aI_3 + bJ) = aI_3 + (a + b + 3b)J$. Il faut $a = 1$ et $a + 4b = 0$, soit $b = -\frac14$.
## Étape · 1
$B^{-1} = I_3 - \frac14 J = \frac14 \begin{pmatrix} 3 & -1 & -1 \\ -1 & 3 & -1 \\ -1 & -1 & 3 \end{pmatrix}$ ; le coefficient $(1, 1)$ vaut $\frac34$. Le pivot de Gauss sur $(B \mid I_3)$ donne évidemment le même résultat.
## Réponse
num 0.75 ± 0.001

# c1 · complexe · 60 · Le déterminant de Vandermonde et l'interpolation
Pour $x_1, \ldots, x_n \in \mathbb{K}$, on note $V(x_1, \ldots, x_n)$ le déterminant de la matrice $\big(x_i^{\,j-1}\big)_{1 \le i, j \le n}$.

1. On fixe $x_1, \ldots, x_{n-1}$ et l'on pose $Q(X) = V(x_1, \ldots, x_{n-1}, X)$. Montrer que $Q$ est un polynôme de degré au plus $n - 1$, de coefficient de $X^{n-1}$ égal à $V(x_1, \ldots, x_{n-1})$, qui s'annule en $x_1, \ldots, x_{n-1}$.
2. En déduire par récurrence que $V(x_1, \ldots, x_n) = \prod_{1 \le i < j \le n} (x_j - x_i)$.
3. Montrer que, si les $x_i$ sont deux à deux distincts, pour tous $y_1, \ldots, y_n$ il existe un unique $P \in \mathbb{K}_{n-1}[X]$ tel que $P(x_i) = y_i$ pour tout $i$.
4. Calculer $V(1, 2, 3, 4)$.
## Indice
Développer le déterminant selon sa dernière ligne $(1, X, X^2, \ldots, X^{n-1})$ : chaque cofacteur ne dépend pas de $X$.
## Indice
Si $X = x_i$ avec $i \le n - 1$, la matrice a deux lignes égales. Un polynôme de degré au plus $n - 1$ qui a $n - 1$ racines distinctes connues s'écrit $c \prod (X - x_i)$ ; et s'il y a deux $x_i$ égaux, que vaut $V$ ?
## Indice
Pour la question 3, la matrice de $P \mapsto (P(x_1), \ldots, P(x_n))$ dans les bases canoniques est exactement la matrice de Vandermonde.
## Étape · 2
En développant selon la dernière ligne $(1, X, \ldots, X^{n-1})$, $Q(X) = \sum_{j=1}^{n} C_{nj} X^{j-1}$, où les cofacteurs $C_{nj}$ ne dépendent pas de $X$ : $Q$ est un polynôme de degré au plus $n - 1$. Le coefficient de $X^{n-1}$ est $C_{nn} = (-1)^{2n} V(x_1, \ldots, x_{n-1}) = V(x_1, \ldots, x_{n-1})$.
## Étape · 1
Pour $X = x_i$ ($i \le n-1$), la matrice a deux lignes égales : $Q(x_i) = 0$.
## Étape · 2
Si les $x_1, \ldots, x_{n-1}$ sont distincts, $Q$ est de degré au plus $n - 1$ avec $n - 1$ racines distinctes et coefficient de $X^{n-1}$ égal à $V(x_1, \ldots, x_{n-1})$ : $Q(X) = V(x_1, \ldots, x_{n-1}) \prod_{i=1}^{n-1} (X - x_i)$. En évaluant en $x_n$ : $V(x_1, \ldots, x_n) = V(x_1, \ldots, x_{n-1}) \prod_{i < n} (x_n - x_i)$.
## Étape · 1
S'il y a deux $x_i$ égaux parmi $x_1, \ldots, x_{n-1}$, les deux membres de la formule sont nuls (deux lignes égales d'un côté, un facteur nul de l'autre). La récurrence, initialisée par $V(x_1) = 1$, donne la formule du produit.
## Étape · 2
L'application $\varphi : P \mapsto (P(x_1), \ldots, P(x_n))$ est linéaire de $\mathbb{K}_{n-1}[X]$ dans $\mathbb{K}^n$, deux espaces de dimension $n$. Sa matrice dans les bases canoniques est la matrice de Vandermonde, de déterminant non nul quand les $x_i$ sont distincts : $\varphi$ est bijective, ce qui est exactement l'existence et l'unicité de $P$.
## Étape · 1
$V(1, 2, 3, 4) = (2 - 1)(3 - 1)(4 - 1)(3 - 2)(4 - 2)(4 - 3) = 1 \times 2 \times 3 \times 1 \times 2 \times 1 = 12$.
## Réponse
num 12 ± 0.001

# c2 · complexe · 75 · Tout hyperplan de M_n(K) contient une matrice inversible
Soit $n \ge 2$. Le but est de montrer que tout hyperplan $H$ de $\mathcal{M}_n(\mathbb{K})$ contient une matrice inversible.

1. Pour $A \in \mathcal{M}_n(\mathbb{K})$, on note $\varphi_A$ la forme linéaire $M \mapsto \operatorname{tr}(AM)$. Calculer $\varphi_A(E_{ji})$, et en déduire que $A \mapsto \varphi_A$ est injective, puis que toute forme linéaire sur $\mathcal{M}_n(\mathbb{K})$ est de la forme $\varphi_A$.
2. Soit $H = \ker \varphi_A$ un hyperplan ($A \neq 0$), et $r = \operatorname{rg} A \ge 1$. Écrire $A = P J_r Q$ avec $P, Q$ inversibles, et montrer que $\varphi_A(M) = \operatorname{tr}(J_r\, Q M P)$.
3. Soit $N$ la matrice de permutation du cycle $(1\,2\,\cdots\,n)$, de coefficients $N_{i+1, i} = 1$ pour $i < n$ et $N_{1, n} = 1$, les autres nuls. Montrer que $N$ est inversible et que $\operatorname{tr}(J_r N) = 0$.
4. Conclure, en exhibant une matrice inversible de $H$.
## Indice
$AE_{ji}$ a pour seule colonne non nulle la colonne $i$, égale à la colonne $j$ de $A$ : sa trace est $a_{ij}$. Comparer ensuite les dimensions de $\mathcal{M}_n(\mathbb{K})$ et de l'espace des formes linéaires.
## Indice
$\operatorname{tr}(P J_r Q M) = \operatorname{tr}(J_r Q M P)$ par la propriété $\operatorname{tr}(XY) = \operatorname{tr}(YX)$. Chercher $M$ sous la forme $Q^{-1} N P^{-1}$.
## Indice
La matrice $N$ n'a que des zéros sur sa diagonale, et $J_r N$ est formée des $r$ premières lignes de $N$ : sa diagonale est nulle.
## Étape · 2
$A E_{ji}$ a pour seule colonne non nulle sa colonne $i$, égale à la colonne $j$ de $A$ ; son coefficient diagonal en position $(i, i)$ est $a_{ij}$, donc $\varphi_A(E_{ji}) = a_{ij}$. Si $\varphi_A = 0$, tous les $a_{ij}$ sont nuls : $A \mapsto \varphi_A$ est injective.
## Étape · 1
Cette application linéaire va de $\mathcal{M}_n(\mathbb{K})$, de dimension $n^2$, dans l'espace des formes linéaires sur $\mathcal{M}_n(\mathbb{K})$, de dimension $n^2$ aussi : injective entre espaces de même dimension, elle est bijective. Toute forme linéaire non nulle est donc un $\varphi_A$ avec $A \neq 0$.
## Étape · 2
D'après le théorème sur le rang, $A$ de rang $r$ est équivalente à $J_r$ : $A = P J_r Q$ avec $P, Q$ inversibles. Alors $\varphi_A(M) = \operatorname{tr}(P J_r Q M) = \operatorname{tr}(J_r Q M P)$.
## Étape · 2
$N$ envoie $e_i$ sur $e_{i+1}$ (indices modulo $n$) : elle permute la base canonique, donc elle est inversible. Ses coefficients diagonaux sont nuls car $n \ge 2$, et $J_r N$ est la matrice formée des $r$ premières lignes de $N$ complétées par des zéros : sa diagonale est nulle, donc $\operatorname{tr}(J_r N) = 0$.
## Étape · 2
Posons $M = Q^{-1} N P^{-1}$, produit de matrices inversibles, donc inversible. Alors $\varphi_A(M) = \operatorname{tr}(J_r Q Q^{-1} N P^{-1} P) = \operatorname{tr}(J_r N) = 0$ : $M \in H$. Tout hyperplan de $\mathcal{M}_n(\mathbb{K})$ contient donc une matrice inversible.
## Étape · 1
Pour $n = 1$, le résultat est faux : le seul hyperplan de $\mathcal{M}_1(\mathbb{K}) = \mathbb{K}$ est $\{0\}$.
