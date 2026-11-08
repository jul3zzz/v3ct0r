# s1 · simple · 10 · Un maximum sur la sphère
Déterminer le maximum de $x + 2y + 2z$ lorsque $(x, y, z)$ décrit la sphère unité $x^2 + y^2 + z^2 = 1$ de $\mathbb{R}^3$, et le point où il est atteint.
## Indice
Écrire $x + 2y + 2z$ comme un produit scalaire $\langle a, v \rangle$ avec $v = (x, y, z)$.
## Indice
Cauchy-Schwarz : $\langle a, v \rangle \le \|a\|\,\|v\|$.
## Indice
Le cas d'égalité impose que $v$ soit colinéaire à $a$, de même sens.
## Étape · 1
Avec $a = (1, 2, 2)$ : $x + 2y + 2z = \langle a, v \rangle \le \|a\|\,\|v\| = \sqrt{1 + 4 + 4} \times 1 = 3$.
## Étape · 2
Il y a égalité si et seulement si $v = \frac{a}{\|a\|} = \left(\frac13, \frac23, \frac23\right)$, qui est bien sur la sphère : le maximum vaut $3$.
## Réponse
num 3 ± 0.001

# s2 · simple · 10 · Gram-Schmidt dans R³
Orthonormaliser, par le procédé de Gram-Schmidt et pour le produit scalaire canonique, la famille $v_1 = (1, 1, 0)$, $v_2 = (1, 0, 1)$. Donner la troisième coordonnée de $e_2$.
## Indice
$e_1 = \frac{v_1}{\|v_1\|}$.
## Indice
$u_2 = v_2 - \langle v_2, e_1 \rangle e_1$, puis $e_2 = \frac{u_2}{\|u_2\|}$.
## Indice
$\langle v_2, e_1 \rangle = \frac{1}{\sqrt2}$, donc $u_2 = v_2 - \frac12 v_1$.
## Étape · 1
$e_1 = \frac{1}{\sqrt 2}(1, 1, 0)$.
## Étape · 2
$u_2 = (1, 0, 1) - \frac12 (1, 1, 0) = \left(\frac12, -\frac12, 1\right)$, de norme $\sqrt{\frac14 + \frac14 + 1} = \sqrt{\frac32}$.
## Étape · 1
$e_2 = \frac{1}{\sqrt 6}(1, -1, 2)$ ; sa troisième coordonnée vaut $\frac{2}{\sqrt6} \approx 0{,}8165$. Vérification : $\langle e_1, e_2 \rangle = \frac{1 - 1 + 0}{\sqrt{12}} = 0$.
## Réponse
num 0.8165 ± 0.001

# s3 · simple · 10 · Reconnaître une isométrie
Soit $A = \frac13 \begin{pmatrix} 1 & 2 & 2 \\ 2 & 1 & -2 \\ 2 & -2 & 1 \end{pmatrix}$. De quoi s'agit-il ?
## Indice
Vérifier que les colonnes forment une famille orthonormée.
## Indice
$A$ est à la fois orthogonale et symétrique : que vaut $A^2$ ?
## Indice
Calculer la trace et le déterminant : les valeurs propres valent $\pm 1$.
## Étape · 1
Les colonnes sont de norme $\frac{\sqrt{1 + 4 + 4}}{3} = 1$ et deux à deux orthogonales (par exemple $\frac{2 + 2 - 4}{9} = 0$) : $A \in O(3)$.
## Étape · 2
$A$ est symétrique, donc $A^2 = A^{\top} A = I_3$ : c'est une symétrie orthogonale, de valeurs propres $\pm 1$. Sa trace vaut $1$ et son déterminant $-1$, donc ses valeurs propres sont $1, 1, -1$.
## Étape · 1
C'est la réflexion par rapport au plan $\ker(A - I_3)$, c'est-à-dire la symétrie orthogonale par rapport au plan orthogonal au vecteur $(1, -1, -1)$, qui vérifie $A(1, -1, -1)^{\top} = -(1, -1, -1)^{\top}$.
## Réponse
qcm B
- une rotation d’axe une droite
- une réflexion (symétrie orthogonale par rapport à un plan)
- une matrice qui n’est pas orthogonale
- une projection orthogonale

# m1 · moyen · 30 · La meilleure droite pour approcher une parabole
Sur $C([0, 1], \mathbb{R})$ muni de $\langle f, g \rangle = \int_0^1 f(t) g(t)\,dt$, on cherche le polynôme $p \in \mathbb{R}_1[X]$ le plus proche de $f(t) = t^2$.

1. Écrire les conditions d'orthogonalité qui caractérisent $p = a + bt$.
2. Les résoudre, puis calculer la distance $d(f, \mathbb{R}_1[X])$.
## Indice
$f - p$ doit être orthogonal à $1$ et à $t$.
## Indice
$\int_0^1 t^k\,dt = \frac{1}{k+1}$. On obtient un système de deux équations en $a, b$.
## Indice
Comme $f - p$ est orthogonal à $p$, on a $\|f - p\|^2 = \langle f - p, f \rangle$.
## Étape · 2
$\langle t^2 - a - bt, 1 \rangle = \frac13 - a - \frac b2 = 0$ et $\langle t^2 - a - bt, t \rangle = \frac14 - \frac a2 - \frac b3 = 0$.
## Étape · 2
De la première, $a = \frac13 - \frac b2$ ; dans la seconde : $\frac14 - \frac16 + \frac b4 - \frac b3 = \frac{1 - b}{12} = 0$, donc $b = 1$ et $a = -\frac16$. La projection est $p(t) = t - \frac16$.
## Étape · 2
$\|f - p\|^2 = \langle f - p, f \rangle = \int_0^1 \left(t^2 - t + \frac16\right) t^2\,dt = \frac15 - \frac14 + \frac{1}{18} = \frac{1}{180}$.
## Étape · 1
$d(f, \mathbb{R}_1[X]) = \frac{1}{\sqrt{180}} = \frac{1}{6\sqrt5} \approx 0{,}0745$.
## Réponse
num 0.0745 ± 0.0005

# m2 · moyen · 30 · La matrice de Gram
Soient $x_1, \ldots, x_p$ des vecteurs d'un espace préhilbertien et $G = \big(\langle x_i, x_j \rangle\big)_{1 \le i, j \le p}$ leur **matrice de Gram**.

1. Montrer que $G$ est symétrique et que $\Lambda^{\top} G \Lambda = \left\|\sum_i \lambda_i x_i\right\|^2$ pour tout $\Lambda = (\lambda_1, \ldots, \lambda_p)^{\top}$.
2. En déduire que $G$ est positive, et qu'elle est définie positive si et seulement si la famille $(x_1, \ldots, x_p)$ est libre.
3. Pour $p = 2$, retrouver l'inégalité de Cauchy-Schwarz et son cas d'égalité.
## Indice
Développer $\left\langle \sum_i \lambda_i x_i, \sum_j \lambda_j x_j \right\rangle$ par bilinéarité.
## Indice
$\Lambda^{\top} G \Lambda = 0$ si et seulement si $\sum \lambda_i x_i = 0$.
## Indice
Pour $p = 2$, une matrice symétrique positive a un déterminant positif (produit de valeurs propres positives).
## Étape · 1
$\langle x_i, x_j \rangle = \langle x_j, x_i \rangle$ : $G$ est symétrique. Par bilinéarité, $\left\|\sum_i \lambda_i x_i\right\|^2 = \sum_{i,j} \lambda_i \lambda_j \langle x_i, x_j \rangle = \Lambda^{\top} G \Lambda$.
## Étape · 2
Donc $\Lambda^{\top} G \Lambda \ge 0$ : $G$ est positive. Elle est définie positive si et seulement si $\Lambda^{\top} G \Lambda = 0$ entraîne $\Lambda = 0$, c'est-à-dire si $\sum \lambda_i x_i = 0$ entraîne $\lambda = 0$ : c'est la liberté de la famille.
## Étape · 2
Pour $p = 2$ : $\det G = \|x_1\|^2 \|x_2\|^2 - \langle x_1, x_2 \rangle^2 \ge 0$ car c'est le produit des deux valeurs propres, positives. C'est Cauchy-Schwarz. Il y a égalité si et seulement si $\det G = 0$, si et seulement si $G$ n'est pas définie positive, si et seulement si $(x_1, x_2)$ est liée.
## Étape · 1
Plus généralement, $\det G$ est le carré du volume du parallélépipède construit sur les $x_i$ : il est nul exactement quand ce volume s'écrase.

# m3 · moyen · 30 · Réduire une conique
On considère la courbe $\mathcal{C}$ d'équation $5x^2 + 4xy + 2y^2 = 1$ dans le plan euclidien.

1. Écrire la matrice symétrique $A$ de la forme quadratique et la diagonaliser dans une base orthonormée.
2. En déduire la nature de $\mathcal{C}$, ses axes et ses demi-axes.
3. Calculer l'aire du domaine délimité par $\mathcal{C}$.
## Indice
$A = \begin{pmatrix} 5 & 2 \\ 2 & 2 \end{pmatrix}$ : le coefficient de $xy$ se partage en deux.
## Indice
Trace $7$, déterminant $6$ : les valeurs propres sont racines de $\lambda^2 - 7\lambda + 6$.
## Indice
L'ellipse $\frac{X^2}{a^2} + \frac{Y^2}{b^2} = 1$ délimite une aire $\pi a b$, et un changement de base orthonormée conserve les aires.
## Étape · 2
Les valeurs propres sont $1$ et $6$, de vecteurs propres $(1, -2)$ et $(2, 1)$, orthogonaux comme le prévoit le théorème spectral. Base orthonormée : $\frac{1}{\sqrt5}(1, -2)$, $\frac{1}{\sqrt5}(2, 1)$.
## Étape · 2
Dans cette base, l'équation devient $X^2 + 6Y^2 = 1$ : $\mathcal{C}$ est une ellipse de demi-axes $1$ (selon $(1, -2)$) et $\frac{1}{\sqrt6}$ (selon $(2, 1)$).
## Étape · 1
L'aire vaut $\pi \times 1 \times \frac{1}{\sqrt 6} = \frac{\pi}{\sqrt6} \approx 1{,}2825$ ; on retrouve la formule générale $\frac{\pi}{\sqrt{\det A}}$.
## Réponse
num 1.2825 ± 0.001

# c1 · complexe · 70 · Les polynômes de Legendre
On munit $\mathbb{R}[X]$ du produit scalaire $\langle P, Q \rangle = \int_{-1}^{1} P(t) Q(t)\,dt$.

1. Orthogonaliser la famille $(1, X, X^2)$ par Gram-Schmidt (sans normaliser) : on obtient $P_0, P_1, P_2$. Calculer $\|P_2\|^2$.
2. Pour $n \ge 1$, on pose $L_n = \dfrac{d^n}{dX^n}\big((X^2 - 1)^n\big)$. Montrer que $L_n$ est de degré $n$ et que $\langle L_n, Q \rangle = 0$ pour tout $Q \in \mathbb{R}_{n-1}[X]$.
3. En déduire que $L_n$ a $n$ racines réelles distinctes, toutes dans $]-1, 1[$.
## Indice
$X$ est impaire, $1$ et $X^2$ sont paires : beaucoup de produits scalaires sont nuls. $\int_{-1}^{1} t^2 = \frac23$, $\int_{-1}^{1} t^4 = \frac25$.
## Indice
Pour la question 2, intégrer par parties $n$ fois : les dérivées d'ordre $k < n$ de $(X^2 - 1)^n$ s'annulent en $\pm 1$, car $\pm 1$ y est racine d'ordre $n$.
## Indice
Pour la question 3, soient $a_1, \ldots, a_k$ les points de $]-1, 1[$ où $L_n$ change de signe. Si $k < n$, que dire de $\int_{-1}^1 L_n(t) \prod_i (t - a_i)\,dt$ ?
## Étape · 2
$P_0 = 1$, $P_1 = X$ (car $\langle X, 1 \rangle = 0$), $P_2 = X^2 - \frac{\langle X^2, 1 \rangle}{\langle 1, 1 \rangle} = X^2 - \frac{2/3}{2} = X^2 - \frac13$ (car $\langle X^2, X \rangle = 0$).
## Étape · 1
$\|P_2\|^2 = \int_{-1}^{1} \left(t^4 - \frac{2t^2}{3} + \frac19\right) dt = \frac25 - \frac49 + \frac29 = \frac{8}{45} \approx 0{,}1778$.
## Étape · 2
$(X^2 - 1)^n$ est de degré $2n$, donc sa dérivée $n$-ième est de degré $n$, de coefficient dominant $\frac{(2n)!}{n!} \neq 0$. Les nombres $1$ et $-1$ sont racines d'ordre $n$ de $(X^2 - 1)^n$ : ses dérivées d'ordre $k \le n - 1$ s'y annulent.
## Étape · 2
Pour $Q$ de degré au plus $n - 1$, $n$ intégrations par parties successives donnent $\langle L_n, Q \rangle = (-1)^n \int_{-1}^{1} (t^2 - 1)^n Q^{(n)}(t)\,dt$, les termes de bord étant nuls ; et $Q^{(n)} = 0$.
## Étape · 2
Soient $a_1 < \cdots < a_k$ les points de $]-1, 1[$ où $L_n$ change de signe, et $R = \prod_i (X - a_i)$ ($R = 1$ si $k = 0$). Le produit $L_n R$ garde un signe constant sur $[-1, 1]$ et n'est pas identiquement nul, donc $\langle L_n, R \rangle \neq 0$. Si l'on avait $k < n$, $R$ serait de degré au plus $n - 1$ et ce produit scalaire serait nul : contradiction.
## Étape · 1
Donc $L_n$ change de signe en au moins $n$ points de $]-1, 1[$ ; étant de degré $n$, il a exactement ces $n$ racines, simples. Les $L_n$ sont, à des constantes près, les polynômes obtenus par Gram-Schmidt : on retrouve $L_2 = 12X^2 - 4 = 12 P_2$.
## Réponse
num 0.1778 ± 0.001

# c2 · complexe · 75 · Racine carrée d'une matrice symétrique positive
Soit $A \in \mathcal{M}_n(\mathbb{R})$ symétrique positive.

1. Montrer qu'il existe $B$ symétrique positive telle que $B^2 = A$.
2. Soit $B$ symétrique positive telle que $B^2 = A$. Montrer que $B$ commute avec $A$, puis que $B$ laisse stable chaque sous-espace propre $E_\lambda(A)$.
3. Montrer que la restriction de $B$ à $E_\lambda(A)$ est $\sqrt{\lambda}\,\mathrm{id}$. En déduire l'unicité de $B$.
4. Calculer la racine carrée symétrique positive de $\begin{pmatrix} 5 & 4 \\ 4 & 5 \end{pmatrix}$ et donner son coefficient $(1, 1)$.
## Indice
Théorème spectral : $A = P D P^{\top}$ avec $D = \operatorname{diag}(\lambda_1, \ldots, \lambda_n)$, $\lambda_i \ge 0$.
## Indice
Si $B$ commute avec $A$ et $AX = \lambda X$, alors $A(BX) = B(AX) = \lambda BX$.
## Indice
La restriction de $B$ à $E_\lambda(A)$ est un endomorphisme symétrique positif dont le carré est $\lambda\,\mathrm{id}$ : quelles peuvent être ses valeurs propres ?
## Étape · 1
Avec $A = P D P^{\top}$ et $P \in O(n)$, posons $B = P\,\operatorname{diag}(\sqrt{\lambda_1}, \ldots, \sqrt{\lambda_n})\,P^{\top}$ : $B$ est symétrique, de valeurs propres positives, et $B^2 = P D P^{\top} = A$.
## Étape · 2
Si $B^2 = A$, alors $BA = B^3 = AB$. Pour $X \in E_\lambda(A)$, $A(BX) = BAX = \lambda BX$ : $BX \in E_\lambda(A)$. Chaque sous-espace propre de $A$ est stable par $B$.
## Étape · 2
La restriction $B_\lambda$ de $B$ à $E_\lambda(A)$ est symétrique (pour le produit scalaire induit) et positive, donc diagonalisable en base orthonormée de valeurs propres $\mu \ge 0$. Comme $B_\lambda^2 = \lambda\,\mathrm{id}$, chaque $\mu$ vérifie $\mu^2 = \lambda$, donc $\mu = \sqrt\lambda$ : $B_\lambda = \sqrt{\lambda}\,\mathrm{id}$.
## Étape · 1
Les $E_\lambda(A)$ sont supplémentaires (théorème spectral) et $B$ y est imposée : $B$ est unique.
## Étape · 2
$\begin{pmatrix} 5 & 4 \\ 4 & 5 \end{pmatrix}$ a pour valeurs propres $9$ (vecteur $(1, 1)$) et $1$ (vecteur $(1, -1)$). Sa racine est $\frac12\begin{pmatrix} 1 & 1 \\ 1 & -1 \end{pmatrix} \begin{pmatrix} 3 & 0 \\ 0 & 1 \end{pmatrix} \begin{pmatrix} 1 & 1 \\ 1 & -1 \end{pmatrix} = \begin{pmatrix} 2 & 1 \\ 1 & 2 \end{pmatrix}$, et l'on vérifie que son carré vaut $\begin{pmatrix} 5 & 4 \\ 4 & 5 \end{pmatrix}$. Le coefficient $(1, 1)$ vaut $2$.
## Réponse
num 2 ± 0.001
