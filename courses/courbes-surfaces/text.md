## Courbes implicites et coniques {#courbes-implicites}

Cette fiche (PT) termine la géométrie différentielle de la seconde année : après les [[fonctions-vectorielles#courbes-parametrees|courbes paramétrées]], les courbes données par une **équation**, puis les surfaces. Le gradient y joue le rôle central ([[calcul-differentiel#prop-gradient-niveau]]). Le plan et l'espace sont munis d'un repère orthonormé.

::: définition Courbe définie par une équation cartésienne {#def-courbe-implicite}
Soit $f$ de classe $C^1$ sur un ouvert de $\mathbb{R}^2$ et $\mathcal{C} = \{(x, y) : f(x, y) = 0\}$. Un point $M_0 \in \mathcal{C}$ est **régulier** si $\nabla f(M_0) \neq 0$. En un point régulier, $\mathcal{C}$ a une tangente, la droite passant par $M_0$ et **orthogonale** à $\nabla f(M_0)$ :
$$\frac{\partial f}{\partial x}(M_0)(x - x_0) + \frac{\partial f}{\partial y}(M_0)(y - y_0) = 0.$$
:::

Si $\gamma$ est une courbe paramétrée tracée sur $\mathcal{C}$, la règle de la chaîne donne $\langle \nabla f(\gamma(t)), \gamma'(t)\rangle = 0$ : la vitesse est orthogonale au gradient. Au voisinage d'un point régulier, la courbe est le graphe d'une fonction $C^1$ (théorème admis).

::: définition Coniques {#def-conique}
Soient $F$ un point (le **foyer**), $D$ une droite ne passant pas par $F$ (la **directrice**) et $e > 0$ (l'**excentricité**). La **conique** de foyer $F$, de directrice $D$ et d'excentricité $e$ est l'ensemble des points $M$ tels que $MF = e \cdot d(M, D)$.
:::

::: proposition Classification et équations réduites {#prop-classification-coniques}
Dans un repère orthonormé adapté, une conique a une équation réduite :

- **ellipse** ($e < 1$) : $\frac{x^2}{a^2} + \frac{y^2}{b^2} = 1$ avec $a > b > 0$, foyers $(\pm c, 0)$ où $c^2 = a^2 - b^2$, et $e = \frac ca$ ;
- **parabole** ($e = 1$) : $y^2 = 2px$, foyer $\left(\frac p2, 0\right)$, directrice $x = -\frac p2$ ;
- **hyperbole** ($e > 1$) : $\frac{x^2}{a^2} - \frac{y^2}{b^2} = 1$, foyers $(\pm c, 0)$ où $c^2 = a^2 + b^2$, $e = \frac ca$, asymptotes $y = \pm\frac bax$.

Le cercle s'obtient comme cas limite de l'ellipse ($a = b$, « $e = 0$ »), sans foyer-directrice.
:::

Les formules de calcul des éléments géométriques ne sont pas exigibles ; il faut savoir les retrouver à partir de la définition, pour une équation réduite. L'ellipse a deux axes de symétrie et un centre ; son grand axe mesure $2a$, son petit axe $2b$.

::: proposition Paramétrages {#prop-param-coniques}
L'ellipse $\frac{x^2}{a^2} + \frac{y^2}{b^2} = 1$ est paramétrée par $t \mapsto (a\cos t, b\sin t)$, $t \in [0, 2\pi[$. La branche $x > 0$ de l'hyperbole $\frac{x^2}{a^2} - \frac{y^2}{b^2} = 1$ est paramétrée par $t \mapsto (a\operatorname{ch} t, b\operatorname{sh} t)$, $t \in \mathbb{R}$ ; l'autre branche par $(-a\operatorname{ch} t, b\operatorname{sh} t)$.
:::

Ces paramétrages reposent sur $\cos^2 + \sin^2 = 1$ et $\operatorname{ch}^2 - \operatorname{sh}^2 = 1$. L'équation $xy = k$ ($k \neq 0$) définit une hyperbole dont les asymptotes sont les axes.

::: méthode Réduire une équation du second degré {#meth-reduction-conique}
Une équation $ax^2 + 2bxy + cy^2 + dx + ey + f = 0$, avec $(a, b, c) \neq (0, 0, 0)$, définit une conique, éventuellement dégénérée (vide, point, droites).

1. Diagonaliser la matrice symétrique $S = \begin{pmatrix} a & b \\ b & c \end{pmatrix}$ dans une base orthonormée ([[endomorphismes-euclidiens#thm-spectral-2|théorème spectral]]) : dans le nouveau repère, la forme quadratique devient $\lambda X^2 + \mu Y^2$, sans terme en $XY$.
2. Éliminer les termes du premier degré par **mise sous forme canonique** (translation).
3. Lire le type : $\lambda\mu > 0$ donne une ellipse (ou un point, ou le vide), $\lambda\mu < 0$ une hyperbole (ou deux droites), $\lambda\mu = 0$ une parabole (ou des droites).

Les vecteurs propres de $S$ dirigent les **axes** de la conique.
:::

## Surfaces {#surfaces}

::: définition Surface paramétrée, plan tangent {#def-surface-param}
Une **surface paramétrée** est l'image d'une application $(u, v) \mapsto M(u, v)$ de classe $C^1$ sur un ouvert de $\mathbb{R}^2$, à valeurs dans $\mathbb{R}^3$. Le point $M(u_0, v_0)$ est **régulier** si les vecteurs $\frac{\partial M}{\partial u}$ et $\frac{\partial M}{\partial v}$ y sont non colinéaires ; le **plan tangent** est alors le plan passant par ce point et dirigé par ces deux vecteurs, de vecteur normal $\frac{\partial M}{\partial u} \wedge \frac{\partial M}{\partial v}$.
:::

::: définition Surface définie par une équation cartésienne {#def-surface-cart}
Pour $F$ de classe $C^1$ sur un ouvert de $\mathbb{R}^3$, la surface $\Sigma = \{F = 0\}$ a pour points réguliers ceux où $\nabla F \neq 0$. Le plan tangent en un point régulier $M_0$ est le plan passant par $M_0$ et **orthogonal à $\nabla F(M_0)$**. Toute courbe régulière tracée sur $\Sigma$ a, en chaque point, un vecteur tangent contenu dans le plan tangent.
:::

Exemple : la sphère $x^2 + y^2 + z^2 = R^2$ a pour gradient $2\overrightarrow{OM}$ : le plan tangent est orthogonal au rayon. Le graphe $z = f(x, y)$ d'une fonction $C^1$ est la surface $F(x, y, z) = f(x, y) - z = 0$ ; son plan tangent est horizontal exactement aux **points critiques** de $f$.

::: exemple Surfaces réglées, surfaces de révolution {#ex-surfaces}
- Une **surface réglée** est une réunion de droites, ses **génératrices** : $M(u, v) = A(u) + v\,\vec w(u)$. En un point régulier, le plan tangent contient la génératrice. Exemples : cylindres, cônes, la selle $z = xy$ (génératrices $x = \text{cste}$ et $y = \text{cste}$).
- Une **surface de révolution** est engendrée par la rotation d'une courbe (la **méridienne**) autour d'un axe ; les **parallèles** sont des cercles d'axe l'axe de révolution. Pour l'axe $(Oz)$ et une méridienne $(r(t), z(t))$ dans le plan $xOz$ : $M(t, \theta) = (r(t)\cos\theta, r(t)\sin\theta, z(t))$, ou une équation de la forme $F\big(\sqrt{x^2 + y^2}, z\big) = 0$.
:::

::: proposition Courbes de l'espace définies par deux équations {#prop-courbe-espace}
Soit $\Gamma$ l'intersection des surfaces $F = 0$ et $G = 0$ ($F$, $G$ de classe $C^1$). En un point $M_0$ de $\Gamma$ où $\nabla F(M_0)$ et $\nabla G(M_0)$ ne sont pas colinéaires, $\Gamma$ a une tangente, intersection des deux plans tangents, dirigée par $\nabla F(M_0) \wedge \nabla G(M_0)$.
:::

Exemple : le cercle intersection de la sphère $x^2 + y^2 + z^2 = 1$ et du plan $z = \frac12$ a, au point $\left(\frac{\sqrt3}{2}, 0, \frac12\right)$, la tangente dirigée par $(\sqrt3, 0, 1) \wedge (0, 0, 1) = (0, -\sqrt3, 0)$, c'est-à-dire par $\vec\jmath$, comme attendu pour un cercle horizontal.
