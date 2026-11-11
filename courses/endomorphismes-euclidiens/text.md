## Adjoint d'un endomorphisme {#adjoint}

Le cours [[prehilbertiens]] a posé le produit scalaire, l'orthogonalité et un premier énoncé du théorème spectral. On étudie ici, en seconde année, les endomorphismes qui interagissent bien avec le produit scalaire : ceux qui le conservent (les **isométries**) et ceux qui sont « symétriques » par rapport à lui (les **autoadjoints**). Dans tout le cours, $E$ est un espace euclidien (de dimension finie $n \ge 1$), de produit scalaire $\langle \cdot, \cdot \rangle$. Ce premier chapitre est au programme de MP et MPI ; ailleurs, on peut le lire comme une préparation au chapitre 4.

::: définition Adjoint (MP, MPI) {#def-adjoint}
Pour $u \in \mathcal{L}(E)$, il existe un unique endomorphisme $u^*$ de $E$, appelé **adjoint** de $u$, tel que
$$\forall x, y \in E,\quad \langle u(x), y\rangle = \langle x, u^*(y)\rangle.$$
:::

L'existence vient de la représentation des formes linéaires : à $y$ fixé, $x \mapsto \langle u(x), y\rangle$ est une forme linéaire, donc de la forme $\langle \cdot, z\rangle$ pour un unique $z$, que l'on note $u^*(y)$ ([[prehilbertiens#prop-adjoint]]).

::: proposition Propriétés de l'adjoint {#prop-adjoint-props}
L'application $u \mapsto u^*$ est linéaire, $(u^*)^* = u$ et $(u \circ v)^* = v^* \circ u^*$. Si $e$ est une base **orthonormée** et $A = \operatorname{Mat}_e(u)$, alors $\operatorname{Mat}_e(u^*) = A^\top$. De plus $\operatorname{Ker} u^* = (\operatorname{Im} u)^\perp$ et $\operatorname{Im} u^* = (\operatorname{Ker} u)^\perp$.
:::

La matrice d'un adjoint n'est la transposée que dans une base orthonormée : c'est la traduction de $\langle Ax, y\rangle = (Ax)^\top y = x^\top(A^\top y)$ pour le produit scalaire canonique.

::: proposition Sous-espaces stables et orthogonal {#prop-stable-orth}
Si un sous-espace $F$ est stable par $u$, alors $F^\perp$ est stable par $u^*$.
:::

Pour $y \in F^\perp$ et $x \in F$ : $\langle x, u^*(y)\rangle = \langle u(x), y\rangle = 0$, puisque $u(x) \in F$. C'est l'argument qui fera marcher toutes les réductions : un sous-espace stable par $u$ **et** par $u^*$ découpe $E$ en deux morceaux stables, $F$ et $F^\perp$.

## Isométries et matrices orthogonales {#isometries}

::: définition Isométrie vectorielle {#def-isometrie}
Un endomorphisme $u$ de $E$ est une **isométrie** (ou automorphisme orthogonal) s'il conserve la norme : $\|u(x)\| = \|x\|$ pour tout $x$. Les propriétés suivantes sont équivalentes :

- $u$ est une isométrie ;
- $u$ conserve le produit scalaire : $\langle u(x), u(y)\rangle = \langle x, y\rangle$ ;
- $u$ envoie une (toute) base orthonormée sur une base orthonormée ;
- (MP, MPI) $u^* \circ u = \mathrm{id}_E$.

Les isométries forment un groupe, le **groupe orthogonal** $O(E)$.
:::

La conservation de la norme entraîne celle du produit scalaire par polarisation : $\langle x, y\rangle = \frac14\big(\|x + y\|^2 - \|x - y\|^2\big)$. Une isométrie est injective, donc bijective en dimension finie.

::: définition Matrices orthogonales {#def-on}
Une matrice $M \in \mathcal{M}_n(\mathbb{R})$ est **orthogonale** si $M^\top M = I_n$, c'est-à-dire si ses colonnes (de façon équivalente, ses lignes) forment une base orthonormée de $\mathbb{R}^n$. Leur ensemble est le groupe $O(n)$ ; on a $M^{-1} = M^\top$ et $\det M = \pm 1$. Les matrices orthogonales de déterminant $1$ forment le sous-groupe $SO(n)$.
:::

::: proposition Isométries et matrices {#prop-iso-matrice}
Un endomorphisme $u$ est une isométrie si et seulement si sa matrice dans **une** base orthonormée est orthogonale. Une matrice de passage entre deux bases orthonormées est orthogonale. Une isométrie de déterminant $1$ est dite **positive** (ou rotation) ; leur ensemble est $SO(E)$.
:::

Attention : une matrice orthogonale n'est pas une matrice dont les colonnes sont seulement deux à deux orthogonales ; elles doivent aussi être **unitaires**.

::: définition Symétries orthogonales, réflexions {#def-reflexion}
La **symétrie orthogonale** par rapport à un sous-espace $F$ est la symétrie par rapport à $F$ parallèlement à $F^\perp$ ; c'est une isométrie. Lorsque $F$ est un hyperplan, c'est une **réflexion** : si $a$ est un vecteur unitaire normal à $F$, la réflexion est $x \mapsto x - 2\langle x, a\rangle a$, de déterminant $-1$.
:::

Une symétrie (quelconque) est une isométrie si et seulement si elle est orthogonale, ce qui équivaut à ce que sa matrice en base orthonormée soit **symétrique**.

## Isométries en dimension 2 et 3 {#dim-2-3}

::: théorème Le groupe orthogonal du plan {#thm-o2}
Les matrices de $SO(2)$ sont les matrices de rotation
$$R(\theta) = \begin{pmatrix} \cos\theta & -\sin\theta \\ \sin\theta & \cos\theta \end{pmatrix}, \qquad \theta \in \mathbb{R},$$
avec $R(\theta)R(\theta') = R(\theta + \theta')$ : le groupe $SO(2)$ est **commutatif**. Les matrices de $O(2)$ de déterminant $-1$ sont les $\begin{pmatrix} \cos\theta & \sin\theta \\ \sin\theta & -\cos\theta \end{pmatrix}$ : ce sont les matrices des réflexions par rapport à une droite.
:::

Une colonne unitaire de $\mathbb{R}^2$ s'écrit $(\cos\theta, \sin\theta)$, et la seconde colonne, unitaire et orthogonale, est $\pm(-\sin\theta, \cos\theta)$. Dans le plan orienté, une rotation a la même matrice $R(\theta)$ dans **toutes** les bases orthonormées directes : $\theta$ est son **angle**, défini modulo $2\pi$. Identifié à $\mathbb{C}$, $R(\theta)$ est la multiplication par $e^{i\theta}$ ([[nombres-complexes#prop-similitude]]).

::: théorème Rotations de l'espace {#thm-so3}
Soit $E$ euclidien orienté de dimension $3$ et $u \in SO(E)$, $u \neq \mathrm{id}$. Il existe un vecteur unitaire $w$, unique au signe près, tel que $u(w) = w$ : la droite $\mathbb{R}w$ est l'**axe** de $u$. Dans une base orthonormée directe $(e_1, e_2, w)$, la matrice de $u$ est
$$\begin{pmatrix} \cos\theta & -\sin\theta & 0 \\ \sin\theta & \cos\theta & 0 \\ 0 & 0 & 1 \end{pmatrix},$$
où $\theta$ est l'**angle** de la rotation, l'axe étant orienté par $w$. On a $\operatorname{tr} u = 1 + 2\cos\theta$.
:::

La valeur propre $1$ vient de $\det(u - \mathrm{id}) = 0$ (exercice c1) ; le plan $w^\perp$ est stable, et $u$ y induit une rotation plane. Les isométries de déterminant $-1$ en dimension $3$ sont les composées d'une rotation et de la réflexion par rapport au plan orthogonal à son axe (en particulier les réflexions).

::: méthode Trouver l'axe et l'angle d'une rotation {#meth-axe-angle}
Soit $A \in SO(3)$, $A \neq I_3$.

1. **Axe** : résoudre $AX = X$ ; on obtient une droite dirigée par un vecteur $w$ que l'on norme.
2. **Cosinus** : $\cos\theta = \frac{\operatorname{tr}A - 1}{2}$.
3. **Signe de $\sin\theta$** : prendre $x$ non nul orthogonal à $w$ ; $\sin\theta$ a le signe de $\det(w, x, Ax)$ (dans la base canonique, supposée directe).
:::

::: théorème Réduction des isométries (MP, MPI) {#thm-reduction-isometries}
Pour toute isométrie $u$ de $E$, il existe une base orthonormée de $E$ dans laquelle la matrice de $u$ est diagonale par blocs, avec des blocs $(1)$, $(-1)$ et des blocs de rotation $R(\theta)$, $\theta \notin \pi\mathbb{Z}$. Matriciellement : toute $M \in O(n)$ s'écrit $P D P^\top$ avec $P \in O(n)$ et $D$ de cette forme.
:::

La preuve procède par récurrence : $u$ a une droite ou un plan stable (on regarde un facteur irréductible d'un polynôme annulateur, de degré $1$ ou $2$), dont l'orthogonal est stable par $u^* = u^{-1}$, donc par $u$ ; on conclut avec les isométries en dimension $1$ et $2$.

## Endomorphismes autoadjoints {#autoadjoints}

::: définition Endomorphisme autoadjoint {#def-autoadjoint}
Un endomorphisme $u$ de $E$ est **autoadjoint** (ou symétrique) si $\langle u(x), y\rangle = \langle x, u(y)\rangle$ pour tous $x, y$ (en MP, MPI : $u^* = u$). C'est le cas si et seulement si sa matrice dans une base orthonormée est **symétrique**. Les projections orthogonales et les symétries orthogonales sont autoadjointes.
:::

::: proposition Éléments propres d'un autoadjoint {#prop-propres-orth}
Si $u$ est autoadjoint, ses sous-espaces propres sont deux à deux **orthogonaux**, et l'orthogonal d'un sous-espace stable par $u$ est stable par $u$.
:::

Si $u(x) = \lambda x$ et $u(y) = \mu y$ avec $\lambda \neq \mu$ : $\lambda\langle x, y\rangle = \langle u(x), y\rangle = \langle x, u(y)\rangle = \mu\langle x, y\rangle$, donc $\langle x, y\rangle = 0$.

::: théorème Théorème spectral {#thm-spectral-2}
Un endomorphisme autoadjoint d'un espace euclidien est diagonalisable dans une base **orthonormée** : $E$ est la somme directe orthogonale de ses sous-espaces propres. Matriciellement, toute matrice symétrique réelle $S$ s'écrit $S = PDP^\top$ avec $P \in O(n)$ et $D$ diagonale réelle.
:::

C'est le [[prehilbertiens#thm-spectral|théorème spectral]] déjà énoncé ; sa preuve repose sur l'existence d'une valeur propre **réelle** (le polynôme caractéristique d'une matrice symétrique réelle est scindé sur $\mathbb{R}$), puis sur la stabilité de l'orthogonal. Il est faux pour une matrice symétrique complexe : $\begin{pmatrix} 1 & i \\ i & -1 \end{pmatrix}$ est nilpotente non nulle.

::: définition Endomorphismes positifs, définis positifs {#def-positif}
Un endomorphisme autoadjoint $u$ est **positif** si $\langle u(x), x\rangle \ge 0$ pour tout $x$, **défini positif** si de plus $\langle u(x), x\rangle > 0$ pour $x \neq 0$. On note $\mathcal{S}_n^+(\mathbb{R})$ et $\mathcal{S}_n^{++}(\mathbb{R})$ les ensembles de matrices correspondants. (Au programme de MP, MPI, PC et PSI.)
:::

::: proposition Caractérisation spectrale de la positivité {#prop-positif-spectre}
Un endomorphisme autoadjoint est positif (respectivement défini positif) si et seulement si toutes ses valeurs propres sont positives (respectivement strictement positives). Pour toute $A \in \mathcal{M}_{n,p}(\mathbb{R})$, la matrice $A^\top A$ est symétrique positive, définie positive si et seulement si $A$ est de rang $p$.
:::

Dans une base orthonormée de vecteurs propres, $\langle u(x), x\rangle = \sum_i \lambda_i x_i^2$. Pour $A^\top A$ : $x^\top A^\top A x = \|Ax\|^2 \ge 0$, nul si et seulement si $Ax = 0$.

::: proposition Valeurs extrêmes de la forme quadratique {#prop-rayleigh}
Si $u$ est autoadjoint de valeurs propres $\lambda_1 \le \cdots \le \lambda_n$, alors pour tout $x$, $\lambda_1\|x\|^2 \le \langle u(x), x\rangle \le \lambda_n\|x\|^2$, avec égalité pour un vecteur propre associé. Ainsi $\lambda_n = \max_{\|x\| = 1}\langle u(x), x\rangle$ et $\lambda_1 = \min_{\|x\| = 1}\langle u(x), x\rangle$.
:::

C'est le lien avec l'**optimisation** : chercher le maximum d'une forme quadratique sur la sphère unité, c'est chercher la plus grande valeur propre. On retrouvera ces matrices comme matrices hessiennes dans [[calcul-differentiel]], et dans les axes principaux d'inertie d'un solide.
