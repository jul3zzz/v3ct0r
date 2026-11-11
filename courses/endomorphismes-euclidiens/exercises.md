# s1 · simple · 15 · Une matrice orthogonale symétrique
Soit $A = \frac13\begin{pmatrix} 1 & 2 & 2 \\ 2 & 1 & -2 \\ 2 & -2 & 1 \end{pmatrix}$. Montrer que $A \in O(3)$, calculer $\det A$, et reconnaître l'isométrie de $\mathbb{R}^3$ canoniquement associée. Donner $\det A$.
## Indice
Vérifier que les colonnes sont unitaires et deux à deux orthogonales.
## Indice
$A$ est orthogonale et symétrique, donc $A^2 = A^\top A = I_3$ : c'est une symétrie orthogonale.
## Indice
Ses valeurs propres sont $\pm 1$ ; la trace vaut $1$. Chercher le sous-espace propre de $-1$.
## Étape · 1
Les colonnes $\frac13(1, 2, 2)$, $\frac13(2, 1, -2)$, $\frac13(2, -2, 1)$ sont de norme $1$ et deux à deux orthogonales ($2 + 2 - 4 = 0$, etc.) : $A \in O(3)$.
## Étape · 2
$A$ symétrique et orthogonale : $A^2 = I_3$, symétrie orthogonale de valeurs propres $\pm1$. Comme $\operatorname{tr} A = 1$, les valeurs propres sont $1, 1, -1$ et $\det A = -1$. Le sous-espace propre de $-1$ est la droite dirigée par $(1, -1, -1)$ : $A$ est la **réflexion** par rapport au plan $x - y - z = 0$.
## Réponse
num -1 ± 0.001

# s2 · simple · 10 · L'angle d'une rotation du plan
Montrer que $R = \frac15\begin{pmatrix} 3 & -4 \\ 4 & 3 \end{pmatrix}$ est la matrice d'une rotation de $\mathbb{R}^2$ et donner son angle $\theta \in\, ]-\pi, \pi]$ (en radians).
## Indice
Une matrice de $SO(2)$ s'écrit $\begin{pmatrix} \cos\theta & -\sin\theta \\ \sin\theta & \cos\theta \end{pmatrix}$.
## Indice
Identifier $\cos\theta = \frac35$ et $\sin\theta = \frac45$.
## Indice
$\theta = \operatorname{Arccos}\frac35$, puisque $\sin\theta > 0$.
## Étape · 1
$\left(\frac35\right)^2 + \left(\frac45\right)^2 = 1$ et $R$ a la forme de $R(\theta)$ avec $\cos\theta = \frac35$, $\sin\theta = \frac45$ : $R \in SO(2)$ ($\det R = 1$).
## Étape · 1
$\sin\theta > 0$ donne $\theta \in\, ]0, \pi[$, et $\theta = \operatorname{Arccos}\frac35 \approx 0{,}9273$ rad (environ $53{,}13°$). Vu dans $\mathbb{C}$, c'est la multiplication par $\frac{3 + 4i}{5}$.
## Réponse
num 0.9273 ± 0.001

# m1 · moyen · 25 · Diagonaliser une matrice symétrique en base orthonormée
Soit $S = \begin{pmatrix} 2 & 1 & 1 \\ 1 & 2 & 1 \\ 1 & 1 & 2 \end{pmatrix}$. Déterminer une matrice $P \in O(3)$ et une matrice diagonale $D$ telles que $S = PDP^\top$. Quelle est la plus grande valeur propre de $S$ ?
## Indice
$S = I_3 + J$, où $J$ est la matrice dont tous les coefficients valent $1$ ; $J$ est de rang $1$.
## Indice
$J(1, 1, 1)^\top = 3(1, 1, 1)^\top$, et $\operatorname{Ker} J$ est le plan $x + y + z = 0$.
## Indice
Dans le plan $x + y + z = 0$, choisir une base orthonormée, par exemple $\frac{1}{\sqrt2}(1, -1, 0)$ et $\frac{1}{\sqrt6}(1, 1, -2)$.
## Étape · 1
Les valeurs propres de $J$ sont $3$ (vecteur $(1, 1, 1)$) et $0$ (plan $x + y + z = 0$, de dimension $2$) ; celles de $S = I_3 + J$ sont $4$ et $1$ (double).
## Étape · 2
Les sous-espaces propres sont orthogonaux, comme le prévoit le théorème spectral. Avec $P$ de colonnes $\frac{1}{\sqrt3}(1, 1, 1)$, $\frac{1}{\sqrt2}(1, -1, 0)$, $\frac{1}{\sqrt6}(1, 1, -2)$ (base orthonormée) et $D = \operatorname{diag}(4, 1, 1)$ : $S = PDP^\top$. La plus grande valeur propre est $4$.
## Réponse
num 4 ± 0.001

# m2 · moyen · 30 · La matrice AᵀA
1. Soit $A \in \mathcal{M}_{n,p}(\mathbb{R})$. Montrer que $A^\top A$ est symétrique positive, et que $\operatorname{Ker}(A^\top A) = \operatorname{Ker} A$.
2. En déduire que $A^\top A$ est définie positive si et seulement si $\operatorname{rg} A = p$.
3. Pour $A = \begin{pmatrix} 1 & 1 \\ 0 & 1 \end{pmatrix}$, calculer $A^\top A$ et sa plus grande valeur propre $\lambda$. Interpréter $\sqrt\lambda$.
## Indice
$x^\top A^\top Ax = \|Ax\|^2$.
## Indice
Si $A^\top Ax = 0$, alors $x^\top A^\top Ax = 0$.
## Indice
Pour 3 : $\lambda = \max_{\|x\| = 1}\|Ax\|^2$ (valeurs extrêmes de la forme quadratique).
## Étape · 1
$(A^\top A)^\top = A^\top A$, et $x^\top(A^\top A)x = \|Ax\|^2 \ge 0$ : symétrique positive. Si $A^\top Ax = 0$, alors $\|Ax\|^2 = 0$, donc $Ax = 0$ ; la réciproque est claire.
## Étape · 1
$A^\top A$ est définie positive si et seulement si son noyau est nul, c'est-à-dire si $\operatorname{Ker} A = \{0\}$, soit $\operatorname{rg} A = p$ (théorème du rang).
## Étape · 2
$A^\top A = \begin{pmatrix} 1 & 1 \\ 1 & 2 \end{pmatrix}$, de polynôme caractéristique $X^2 - 3X + 1$ : $\lambda = \frac{3 + \sqrt5}{2} \approx 2{,}618$. Et $\sqrt\lambda = \max_{\|x\| = 1}\|Ax\|$ est la norme subordonnée de $A$ pour la norme euclidienne (ici le nombre d'or $\frac{1 + \sqrt5}{2}$).
## Réponse
num 2.618 ± 0.001

# c1 · complexe · 75 · Les rotations de l'espace
1. Soit $A \in SO(3)$. Montrer que $\det(A - I_3) = 0$, en écrivant $A - I_3 = A(I_3 - A^\top)$.
2. En déduire que $A$ a un vecteur propre unitaire $w$ de valeur propre $1$, que le plan $w^\perp$ est stable par $A$, et que $A$ induit sur $w^\perp$ une rotation plane.
3. Montrer que $\operatorname{tr} A = 1 + 2\cos\theta$, où $\theta$ est l'angle de cette rotation.
4. Soit $A = \frac13\begin{pmatrix} 2 & -1 & 2 \\ 2 & 2 & -1 \\ -1 & 2 & 2 \end{pmatrix}$. Vérifier que $A \in SO(3)$, puis déterminer son axe et son angle (l'axe orienté par le vecteur trouvé). Donner $\cos\theta$.
## Indice
Pour 1 : $\det(I_3 - A^\top) = \det(I_3 - A)$ (transposée), et en dimension $3$, $\det(-M) = -\det M$.
## Indice
Pour 2 : une isométrie conserve l'orthogonalité, et $A$ est inversible ; la restriction à $w^\perp$ est une isométrie de déterminant $1$. Pour 3 : base orthonormée adaptée $(e_1, e_2, w)$, invariance de la trace.
## Indice
Pour 4 : résoudre $AX = X$ ; puis $\cos\theta = \frac{\operatorname{tr}A - 1}{2}$, et le signe de $\sin\theta$ par $\det(w, x, Ax)$ pour $x \perp w$.
## Étape · 2
$\det(A - I_3) = \det A \cdot \det(I_3 - A^\top) = 1 \cdot \det\big((I_3 - A)^\top\big) = \det(I_3 - A) = -\det(A - I_3)$, car la dimension est impaire. Donc $\det(A - I_3) = 0$.
## Étape · 2
Il existe donc $w$ unitaire avec $Aw = w$. Si $x \perp w$, $\langle Ax, w\rangle = \langle Ax, Aw\rangle = \langle x, w\rangle = 0$ : le plan $w^\perp$ est stable. La restriction de $A$ y est une isométrie, de déterminant $\frac{\det A}{1} = 1$ (matrice par blocs dans une base adaptée) : c'est une rotation plane d'angle $\theta$.
## Étape · 1
Dans une base orthonormée $(e_1, e_2, w)$, la matrice est $\begin{pmatrix} R(\theta) & 0 \\ 0 & 1 \end{pmatrix}$, de trace $2\cos\theta + 1$ ; la trace ne dépend pas de la base.
## Étape · 2
Les colonnes de $3A$, $(2, 2, -1)$, $(-1, 2, 2)$, $(2, -1, 2)$, sont de norme $3$ et deux à deux orthogonales, et $\det(3A) = 27$, donc $A \in SO(3)$. $AX = X$ donne l'axe dirigé par $w = \frac{1}{\sqrt3}(1, 1, 1)$. $\operatorname{tr}A = 2$, donc $\cos\theta = \frac12$. Avec $x = (1, -1, 0) \perp w$ : $Ax = (1, 0, -1)$ et $\det\big((1, 1, 1), (1, -1, 0), (1, 0, -1)\big) = 3 > 0$, donc $\sin\theta > 0$ : $\theta = \frac\pi3$.
## Réponse
num 0.5 ± 0.001
