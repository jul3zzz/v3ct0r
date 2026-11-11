## Produit scalaire {#produit-scalaire}

L'algèbre linéaire ne sait mesurer ni des longueurs ni des angles. Le produit scalaire les ajoute, et avec eux la géométrie d'Euclide : orthogonalité, projections, distances, rotations. L'intérêt est que tout cela fonctionne aussi dans des espaces de fonctions, où « distance » veut dire « erreur d'approximation ». Dans tout le cours, les espaces sont réels.

::: définition Produit scalaire {#def-ps}
Un **produit scalaire** sur un espace vectoriel réel $E$ est une application $\langle \cdot, \cdot \rangle : E \times E \to \mathbb{R}$ :

- **bilinéaire** : linéaire par rapport à chacune des deux variables ;
- **symétrique** : $\langle x, y \rangle = \langle y, x \rangle$ ;
- **définie positive** : $\langle x, x \rangle \ge 0$ pour tout $x$, avec égalité si et seulement si $x = 0$.

Un espace muni d'un produit scalaire est **préhilbertien** ; s'il est de dimension finie, il est **euclidien**.
:::

Trois exemples reviennent sans cesse. Sur $\mathbb{R}^n$, le produit scalaire canonique $\langle x, y \rangle = \sum_{i} x_i y_i = X^{\top} Y$. Sur l'espace $C([a, b], \mathbb{R})$ des fonctions continues, $\langle f, g \rangle = \int_a^b f(t) g(t)\,dt$ : la positivité stricte vient de ce qu'une fonction continue positive d'intégrale nulle est nulle. Sur $\mathcal{M}_n(\mathbb{R})$, $\langle A, B \rangle = \operatorname{tr}(A^{\top} B) = \sum_{i,j} a_{ij} b_{ij}$.

::: théorème Inégalité de Cauchy-Schwarz {#thm-cs}
Pour tous $x, y \in E$,
$$|\langle x, y \rangle| \le \sqrt{\langle x, x \rangle}\, \sqrt{\langle y, y \rangle},$$
avec égalité si et seulement si $x$ et $y$ sont colinéaires.
:::

::: preuve Par un trinôme
Si $y = 0$, tout est nul. Sinon, la fonction $t \mapsto \langle x + t y, x + t y \rangle = \langle y, y \rangle t^2 + 2 \langle x, y \rangle t + \langle x, x \rangle$ est un trinôme du second degré positif sur $\mathbb{R}$ : son discriminant est négatif ou nul, ce qui est exactement l'inégalité. Il y a égalité si et seulement si le discriminant est nul, c'est-à-dire si le trinôme s'annule en un $t_0$ : alors $x + t_0 y = 0$ par la positivité stricte, et $x$ et $y$ sont colinéaires.
:::

Appliquée aux exemples, l'inégalité donne d'un coup $\left(\sum x_i y_i\right)^2 \le \sum x_i^2 \sum y_i^2$ et $\left(\int_a^b fg\right)^2 \le \int_a^b f^2 \int_a^b g^2$. Elle permet de définir l'angle non orienté $\theta \in [0, \pi]$ entre deux vecteurs non nuls par $\cos\theta = \frac{\langle x, y \rangle}{\|x\|\,\|y\|}$, dans n'importe quel espace préhilbertien.

::: proposition Norme euclidienne {#prop-norme}
L'application $\|x\| = \sqrt{\langle x, x \rangle}$ est une norme : $\|x\| = 0$ si et seulement si $x = 0$, $\|\lambda x\| = |\lambda|\,\|x\|$, et l'**inégalité triangulaire** $\|x + y\| \le \|x\| + \|y\|$ est vérifiée, avec égalité si et seulement si $x$ et $y$ sont colinéaires de même sens.
:::

L'inégalité triangulaire découle de Cauchy-Schwarz : $\|x + y\|^2 = \|x\|^2 + 2\langle x, y \rangle + \|y\|^2 \le \|x\|^2 + 2\|x\|\,\|y\| + \|y\|^2 = (\|x\| + \|y\|)^2$.

::: proposition Identités remarquables {#prop-identites}
Pour tous $x, y \in E$ :

- **Pythagore** : $\|x + y\|^2 = \|x\|^2 + \|y\|^2$ si et seulement si $\langle x, y \rangle = 0$ ;
- **parallélogramme** : $\|x + y\|^2 + \|x - y\|^2 = 2\|x\|^2 + 2\|y\|^2$ ;
- **polarisation** : $\langle x, y \rangle = \frac14\left(\|x + y\|^2 - \|x - y\|^2\right)$.
:::

La polarisation dit que le produit scalaire se reconstruit à partir de la norme : une application qui conserve les normes conserve donc les produits scalaires. L'identité du parallélogramme caractérise les normes qui proviennent d'un produit scalaire ; la norme $\|x\|_\infty = \max_i |x_i|$ ne la vérifie pas, et ne vient donc d'aucun produit scalaire.

## Orthogonalité {#orthogonalite}

::: définition Orthogonalité, familles orthonormées {#def-orth}
Deux vecteurs sont **orthogonaux** si $\langle x, y \rangle = 0$. Une famille $(e_1, \ldots, e_n)$ est **orthogonale** si ses vecteurs sont deux à deux orthogonaux, **orthonormée** si de plus ils sont de norme $1$, c'est-à-dire $\langle e_i, e_j \rangle = \delta_{ij}$. Une famille orthogonale de vecteurs non nuls est libre.
:::

La liberté se voit en faisant le produit scalaire d'une relation $\sum \lambda_i e_i = 0$ avec $e_j$ : il reste $\lambda_j \|e_j\|^2 = 0$. Dans une base orthonormée, les calculs deviennent des sommes de produits de coordonnées.

::: proposition Coordonnées dans une base orthonormée {#prop-coord}
Si $(e_1, \ldots, e_n)$ est une base orthonormée de $E$, alors pour tous $x, y \in E$ :
$$x = \sum_{i=1}^{n} \langle x, e_i \rangle\, e_i, \qquad \langle x, y \rangle = \sum_{i=1}^{n} x_i y_i, \qquad \|x\|^2 = \sum_{i=1}^{n} \langle x, e_i \rangle^2.$$
:::

Les coordonnées s'obtiennent donc par de simples produits scalaires, sans résoudre de système. Encore faut-il disposer d'une base orthonormée : le procédé suivant en fabrique une à partir de n'importe quelle base.

::: théorème Procédé de Gram-Schmidt {#thm-gs}
Soit $(v_1, \ldots, v_n)$ une famille libre de $E$. Il existe une unique famille orthonormée $(e_1, \ldots, e_n)$ telle que, pour tout $k$, $\operatorname{Vect}(e_1, \ldots, e_k) = \operatorname{Vect}(v_1, \ldots, v_k)$ et $\langle v_k, e_k \rangle > 0$. Elle se calcule de proche en proche :
$$u_k = v_k - \sum_{i=1}^{k-1} \langle v_k, e_i \rangle\, e_i, \qquad e_k = \frac{u_k}{\|u_k\|}.$$
:::

On retire à $v_k$ ses composantes selon les vecteurs déjà construits ; ce qui reste, $u_k$, est orthogonal à $e_1, \ldots, e_{k-1}$, et non nul puisque $v_k \notin \operatorname{Vect}(v_1, \ldots, v_{k-1})$. Conséquence immédiate : tout espace euclidien possède une base orthonormée, et toute famille orthonormée se complète en une base orthonormée. Appliqué à $(1, X, X^2, \ldots)$ avec $\langle P, Q \rangle = \int_{-1}^{1} PQ$, le procédé produit, à des facteurs près, les **polynômes de Legendre**.

::: définition Orthogonal d'une partie {#def-perp}
L'**orthogonal** d'une partie $A$ de $E$ est $A^{\perp} = \{x \in E : \langle x, a \rangle = 0 \text{ pour tout } a \in A\}$. C'est un sous-espace vectoriel, et $F \cap F^{\perp} = \{0\}$ pour tout sous-espace $F$.
:::

::: théorème Supplémentaire orthogonal {#thm-supp-orth}
Si $F$ est un sous-espace de **dimension finie** de $E$, alors $E = F \oplus F^{\perp}$. Si de plus $E$ est de dimension finie, $\dim F^{\perp} = \dim E - \dim F$ et $(F^{\perp})^{\perp} = F$.
:::

::: définition Projection orthogonale {#def-proj-orth}
Si $E = F \oplus F^{\perp}$, la **projection orthogonale** sur $F$ est le projecteur $p_F$ sur $F$ parallèlement à $F^{\perp}$. Si $(e_1, \ldots, e_k)$ est une base orthonormée de $F$,
$$p_F(x) = \sum_{i=1}^{k} \langle x, e_i \rangle\, e_i.$$
:::

::: théorème Distance à un sous-espace {#thm-distance}
Soit $F$ un sous-espace de dimension finie et $x \in E$. Le vecteur $p_F(x)$ est l'**unique** élément de $F$ le plus proche de $x$ :
$$d(x, F) = \min_{y \in F} \|x - y\| = \|x - p_F(x)\|, \qquad \|x - y\|^2 = \|x - p_F(x)\|^2 + \|p_F(x) - y\|^2 \ \text{ pour tout } y \in F.$$
:::

L'égalité de droite est Pythagore, puisque $x - p_F(x) \in F^{\perp}$ et $p_F(x) - y \in F$. Elle dit tout : la meilleure approximation de $x$ par un élément de $F$ est sa projection, et elle se caractérise par le fait que l'erreur est orthogonale à $F$. Ce principe est celui des **moindres carrés** : ajuster une droite à un nuage de points, c'est projeter le vecteur des mesures sur le plan engendré par $(1, \ldots, 1)$ et $(t_1, \ldots, t_n)$. Avec $\langle f, g \rangle = \int fg$, c'est approcher une fonction par un polynôme en minimisant l'erreur quadratique.

::: proposition Inégalité de Bessel {#prop-bessel}
Si $(e_1, \ldots, e_k)$ est une famille orthonormée, alors pour tout $x \in E$,
$$\sum_{i=1}^{k} \langle x, e_i \rangle^2 = \|p_F(x)\|^2 \le \|x\|^2, \quad \text{où } F = \operatorname{Vect}(e_1, \ldots, e_k).$$
:::

C'est l'inégalité qui, appliquée à la famille orthonormée des fonctions trigonométriques, contrôle les coefficients de Fourier d'une fonction.

## Endomorphismes remarquables {#endomorphismes}

Dans ce chapitre, $E$ est euclidien de dimension $n$.

::: proposition Adjoint {#prop-adjoint}
Pour tout $u \in \mathcal{L}(E)$, il existe un unique $u^* \in \mathcal{L}(E)$, l'**adjoint** de $u$, tel que $\langle u(x), y \rangle = \langle x, u^*(y) \rangle$ pour tous $x, y$. Si $A$ est la matrice de $u$ dans une base **orthonormée**, celle de $u^*$ est $A^{\top}$.
:::

::: définition Endomorphisme symétrique {#def-sym}
Un endomorphisme $u$ est **symétrique** (ou autoadjoint) si $u^* = u$, c'est-à-dire si $\langle u(x), y \rangle = \langle x, u(y) \rangle$ pour tous $x, y$. Cela équivaut à : sa matrice dans une base orthonormée est symétrique.
:::

Les projections orthogonales sont symétriques ; un projecteur est une projection orthogonale si et seulement s'il est symétrique. Attention : la condition porte sur la matrice dans une base **orthonormée** ; dans une base quelconque, la matrice d'un endomorphisme symétrique n'a aucune raison d'être symétrique.

::: définition Isométrie, matrice orthogonale {#def-ortho}
Un endomorphisme $u$ est une **isométrie** (ou endomorphisme orthogonal) s'il conserve la norme : $\|u(x)\| = \|x\|$ pour tout $x$. Une matrice $A \in \mathcal{M}_n(\mathbb{R})$ est **orthogonale** si $A^{\top} A = I_n$. On note $O(n)$ le groupe des matrices orthogonales et $SO(n)$ le sous-groupe de celles de déterminant $1$.
:::

::: théorème Caractérisations des isométries {#thm-isometries}
Pour $u \in \mathcal{L}(E)$, les propriétés suivantes sont équivalentes :

- $u$ conserve la norme ;
- $u$ conserve le produit scalaire : $\langle u(x), u(y) \rangle = \langle x, y \rangle$ ;
- $u$ envoie une (toute) base orthonormée sur une base orthonormée ;
- la matrice de $u$ dans une base orthonormée est orthogonale ;
- $u^* \circ u = \mathrm{id}_E$.

Une isométrie est alors bijective, $u^{-1} = u^*$, et $\det u = \pm 1$.
:::

La polarisation donne le passage de la norme au produit scalaire. Une matrice est orthogonale si et seulement si ses colonnes forment une base orthonormée de $\mathbb{R}^n$, et alors ses lignes aussi. Le déterminant vaut $\pm 1$ car $\det(A^{\top} A) = (\det A)^2 = 1$.

::: proposition Isométries du plan et de l'espace {#prop-o2-o3}
Les matrices de $SO(2)$ sont les rotations $R_\theta = \begin{pmatrix} \cos\theta & -\sin\theta \\ \sin\theta & \cos\theta \end{pmatrix}$ ; celles de $O(2) \setminus SO(2)$ sont les réflexions $\begin{pmatrix} \cos\theta & \sin\theta \\ \sin\theta & -\cos\theta \end{pmatrix}$, symétries orthogonales par rapport à une droite. Tout élément de $SO(3)$ est une rotation autour d'un axe : il existe une base orthonormée dans laquelle sa matrice est
$$\begin{pmatrix} 1 & 0 & 0 \\ 0 & \cos\theta & -\sin\theta \\ 0 & \sin\theta & \cos\theta \end{pmatrix},$$
et l'angle vérifie $1 + 2\cos\theta = \operatorname{tr} A$.
:::

Les rotations du plan commutent entre elles ($R_\alpha R_\beta = R_{\alpha + \beta}$), celles de l'espace non : tourner un livre de $90°$ autour de deux axes différents, dans un ordre puis dans l'autre, ne donne pas la même position. Toute isométrie du plan ou de l'espace est une composée de réflexions (au plus $2$, resp. $3$).

## Le théorème spectral {#spectral}

::: théorème Théorème spectral {#thm-spectral}
Tout endomorphisme symétrique d'un espace euclidien se [[reduction#def-diag|diagonalise]] dans une base **orthonormée**. Matriciellement : pour toute matrice symétrique réelle $A$, il existe $P \in O(n)$ et $D$ diagonale réelle telles que
$$A = P D P^{\top} = P D P^{-1}.$$
Ses valeurs propres sont réelles et ses sous-espaces propres sont deux à deux orthogonaux.
:::

::: preuve Idée de la preuve
Les valeurs propres de $A$ symétrique réelle sont réelles : si $AZ = \lambda Z$ avec $Z \in \mathbb{C}^n$ non nul, alors $\overline{Z}^{\top} A Z = \lambda \|Z\|^2$, et ce nombre est réel car égal à son conjugué. Soit donc $e_1$ un vecteur propre unitaire de $u$. L'orthogonal $H = e_1^{\perp}$ est stable par $u$ : si $\langle x, e_1 \rangle = 0$, alors $\langle u(x), e_1 \rangle = \langle x, u(e_1) \rangle = \lambda \langle x, e_1 \rangle = 0$. La restriction de $u$ à $H$ est encore symétrique, et une récurrence sur la dimension conclut. Deux vecteurs propres associés à des valeurs propres distinctes $\lambda \neq \mu$ sont orthogonaux, car $\lambda \langle x, y \rangle = \langle u(x), y \rangle = \langle x, u(y) \rangle = \mu \langle x, y \rangle$.
:::

C'est l'un des théorèmes les plus utilisés des mathématiques appliquées : en mécanique (axes principaux d'inertie), en statistique (analyse en composantes principales d'une matrice de covariance), en physique quantique (observables). L'hypothèse de symétrie est essentielle : $\begin{pmatrix} 1 & 1 \\ 0 & 1 \end{pmatrix}$ n'est pas diagonalisable, et une matrice de rotation d'angle $\frac{\pi}{2}$ n'a aucune valeur propre réelle.

::: définition Matrices positives et définies positives {#def-positive}
Une matrice symétrique réelle $A$ est **positive** si $X^{\top} A X \ge 0$ pour tout $X \in \mathbb{R}^n$, **définie positive** si de plus $X^{\top} A X > 0$ pour tout $X \neq 0$.
:::

::: proposition Caractérisation spectrale {#prop-positive}
Une matrice symétrique réelle est positive si et seulement si toutes ses valeurs propres sont positives, définie positive si et seulement si elles sont toutes strictement positives. Pour toute matrice $M \in \mathcal{M}_{n,p}(\mathbb{R})$, la matrice $M^{\top} M$ est symétrique positive, et définie positive si et seulement si $M$ est de rang $p$.
:::

En écrivant $A = P D P^{\top}$ et $Y = P^{\top} X$, on obtient $X^{\top} A X = \sum_i \lambda_i y_i^2$, ce qui donne la caractérisation. C'est aussi la clé de la réduction des formes quadratiques.

::: méthode Réduire une forme quadratique {#meth-quadratique}
Pour étudier $q(X) = X^{\top} A X$ avec $A$ symétrique (par exemple une conique $q(x, y) = 1$) :

1. écrire la matrice symétrique $A$ ; le coefficient de $xy$ se partage en deux moitiés ;
2. calculer ses valeurs propres $\lambda_i$ et une base orthonormée de vecteurs propres ;
3. dans cette base, $q = \sum_i \lambda_i Y_i^2$ : les signes des $\lambda_i$ donnent la nature (ellipse si tous sont strictement positifs, hyperbole si deux sont de signes opposés en dimension $2$), les vecteurs propres donnent les axes.
:::

Exemple : la conique $5x^2 + 4xy + 2y^2 = 1$ a pour matrice $\begin{pmatrix} 5 & 2 \\ 2 & 2 \end{pmatrix}$, de trace $7$ et de déterminant $6$, donc de valeurs propres $1$ et $6$, de vecteurs propres $(1, -2)$ et $(2, 1)$. Dans la base orthonormée correspondante, son équation est $X^2 + 6Y^2 = 1$ : c'est une ellipse de demi-axes $1$ et $\frac{1}{\sqrt 6}$, inclinée selon ces directions.
