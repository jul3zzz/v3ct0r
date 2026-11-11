## Dérivées partielles et différentielle {#differentiabilite}

La fiche [[fonctions-deux-variables]] a posé, en première année, les dérivées partielles, le gradient et la règle de la chaîne pour deux variables. On passe ici à $p$ variables, et l'on ajoute l'ordre $2$, qui décide de la nature des points critiques. Dans tout le cours, $U$ est un **ouvert** de $\mathbb{R}^p$ (au sens de [[topologie-evn#def-ouvert]]), et $f : U \to \mathbb{R}$, sauf mention contraire. En MP et MPI, le programme travaille plus généralement entre espaces vectoriels normés de dimension finie ; on s'en tient ici à $\mathbb{R}^p$, ce qui ne change pas les énoncés.

::: définition Dérivée selon un vecteur, dérivées partielles {#def-derivee-directionnelle}
Soient $a \in U$ et $v \in \mathbb{R}^p$. La **dérivée de $f$ en $a$ selon $v$** est, si elle existe, la dérivée en $0$ de $t \mapsto f(a + tv)$ :
$$D_v f(a) = \lim_{t \to 0}\frac{f(a + tv) - f(a)}{t}.$$
Les **dérivées partielles** $\frac{\partial f}{\partial x_j}(a)$ sont les dérivées selon les vecteurs $e_j$ de la base canonique.
:::

::: définition Différentielle (MP, MPI) {#def-differentielle}
La fonction $f$ est **différentiable** en $a$ s'il existe une application linéaire $L : \mathbb{R}^p \to \mathbb{R}$ telle que
$$f(a + h) = f(a) + L(h) + o(\|h\|) \qquad (h \to 0).$$
$L$ est alors unique ; c'est la **différentielle** de $f$ en $a$, notée $df(a)$.
:::

::: proposition Différentielle et dérivées partielles {#prop-differentielle}
Si $f$ est différentiable en $a$, elle est continue en $a$, elle a une dérivée selon tout vecteur, $D_v f(a) = df(a)(v)$, et
$$df(a)(h) = \sum_{j=1}^{p}\frac{\partial f}{\partial x_j}(a)\,h_j.$$
:::

La réciproque est fausse : l'existence de toutes les dérivées selon des vecteurs n'entraîne même pas la continuité ([[fonctions-deux-variables#rem-partielles-continuite]]). La notion qui fonctionne en pratique est la suivante.

::: théorème Fonctions de classe C¹ {#thm-c1-dl}
La fonction $f$ est **de classe $C^1$** sur $U$ si ses $p$ dérivées partielles existent et sont continues sur $U$. Alors $f$ admet en tout point $a \in U$ un développement limité à l'ordre $1$ :
$$f(a + h) = f(a) + \sum_{j=1}^{p}\frac{\partial f}{\partial x_j}(a)\,h_j + o(\|h\|).$$
En particulier, $f$ est continue, et (MP, MPI) différentiable en tout point.
:::

La démonstration (en MP, MPI) applique les accroissements finis variable par variable. Les sommes, produits, quotients et composées de fonctions $C^1$ sont $C^1$ ; les fonctions polynomiales en les coordonnées sont $C^\infty$.

## Règle de la chaîne et gradient {#chaine-gradient}

::: théorème Règle de la chaîne {#thm-chaine-p}
Si $f$ est de classe $C^1$ sur $U$ et si $\gamma : I \to U$ est de classe $C^1$ sur un intervalle $I$, alors $f \circ \gamma$ est $C^1$ et
$$(f \circ \gamma)'(t) = \sum_{j=1}^{p}\frac{\partial f}{\partial x_j}\big(\gamma(t)\big)\,\gamma_j'(t).$$
Plus généralement, si $g(u) = f\big(\varphi_1(u), \ldots, \varphi_p(u)\big)$ avec des $\varphi_j$ de classe $C^1$ sur un ouvert de $\mathbb{R}^q$, alors $\frac{\partial g}{\partial u_i} = \sum_j \frac{\partial f}{\partial x_j}\,\frac{\partial \varphi_j}{\partial u_i}$.
:::

::: définition Matrice jacobienne {#def-jacobienne}
Pour $F = (F_1, \ldots, F_n) : U \to \mathbb{R}^n$ de classe $C^1$, la **matrice jacobienne** en $a$ est $J_F(a) = \left(\frac{\partial F_i}{\partial x_j}(a)\right)_{i, j} \in \mathcal{M}_{n,p}(\mathbb{R})$. La règle de la chaîne s'écrit $J_{G \circ F}(a) = J_G\big(F(a)\big)\,J_F(a)$ : la jacobienne d'une composée est le **produit** des jacobiennes.
:::

C'est la forme la plus mémorable de la règle de la chaîne : dériver une composée, c'est multiplier des matrices, comme on composait des applications linéaires. Le passage en coordonnées polaires $(r, \theta) \mapsto (r\cos\theta, r\sin\theta)$ a pour jacobienne $\begin{pmatrix} \cos\theta & -r\sin\theta \\ \sin\theta & r\cos\theta \end{pmatrix}$, de déterminant $r$.

::: définition Gradient {#def-gradient-p}
Pour $f$ de classe $C^1$, le **gradient** en $a$ est le vecteur $\nabla f(a) = \left(\frac{\partial f}{\partial x_1}(a), \ldots, \frac{\partial f}{\partial x_p}(a)\right)$ ; c'est l'unique vecteur tel que $df(a)(h) = \langle \nabla f(a), h\rangle$ pour tout $h$, pour le produit scalaire canonique.
:::

::: proposition Gradient et ensembles de niveau {#prop-gradient-niveau}
Si $\gamma$ est une courbe $C^1$ tracée sur l'ensemble de niveau $\{f = c\}$, alors $\langle \nabla f(\gamma(t)), \gamma'(t)\rangle = 0$. Si $\nabla f(a) \neq 0$, la surface d'équation $f(x, y, z) = c$ a en $a$ un **plan tangent**, orthogonal à $\nabla f(a)$, d'équation $\langle \nabla f(a), M - a\rangle = 0$.
:::

Le gradient indique la direction de plus forte croissance ; il est orthogonal aux lignes de niveau dans le plan, aux surfaces de niveau dans l'espace. Exemple : la sphère $x^2 + y^2 + z^2 = R^2$ a en $a$ le gradient $2a$ : le plan tangent est orthogonal au rayon.

## Dérivées d'ordre 2 et matrice hessienne {#ordre-2}

::: définition Fonctions de classe C² {#def-c2}
La fonction $f$ est **de classe $C^2$** sur $U$ si ses dérivées partielles existent et sont de classe $C^1$ sur $U$. On note $\frac{\partial^2 f}{\partial x_i \partial x_j} = \frac{\partial}{\partial x_i}\left(\frac{\partial f}{\partial x_j}\right)$ les dérivées partielles d'ordre $2$.
:::

::: théorème Théorème de Schwarz {#thm-schwarz}
Si $f$ est de classe $C^2$ sur $U$, alors pour tous $i, j$,
$$\frac{\partial^2 f}{\partial x_i \partial x_j} = \frac{\partial^2 f}{\partial x_j \partial x_i}.$$
:::

L'ordre des dérivations n'importe pas pour une fonction $C^2$. L'hypothèse est nécessaire : pour $f(x, y) = \frac{xy(x^2 - y^2)}{x^2 + y^2}$ (prolongée par $0$), les deux dérivées croisées en $(0, 0)$ valent $-1$ et $1$.

::: définition Matrice hessienne {#def-hessienne}
Pour $f$ de classe $C^2$, la **matrice hessienne** en $a$ est $H_f(a) = \left(\frac{\partial^2 f}{\partial x_i \partial x_j}(a)\right)_{i,j} \in \mathcal{M}_p(\mathbb{R})$. Par le théorème de Schwarz, elle est **symétrique**.
:::

::: proposition Formule de Taylor-Young à l'ordre 2 {#prop-taylor-2}
Si $f$ est de classe $C^2$ sur $U$ et $a \in U$, quand $h \to 0$,
$$f(a + h) = f(a) + \langle \nabla f(a), h\rangle + \frac12\,h^\top H_f(a)\,h + o(\|h\|^2).$$
:::

On l'obtient en appliquant la formule de Taylor-Young d'une variable à $t \mapsto f(a + th)$, dont la dérivée seconde en $0$ est $h^\top H_f(a)h$ par la règle de la chaîne. Le terme d'ordre $2$ est une **forme quadratique**, et la hessienne symétrique se diagonalise en base orthonormée ([[endomorphismes-euclidiens#thm-spectral-2|théorème spectral]]).

## Optimisation {#optimisation}

::: théorème Condition nécessaire du premier ordre {#thm-cn1}
Si $f$, de classe $C^1$ sur l'**ouvert** $U$, admet un extremum local en $a \in U$, alors $\nabla f(a) = 0$ : $a$ est un **point critique**.
:::

Sur un ensemble qui n'est pas ouvert, un extremum peut être atteint sur le bord sans que le gradient s'annule : $(x, y) \mapsto x$ sur le disque unité fermé atteint son maximum en $(1, 0)$, où le gradient vaut $(1, 0)$. Pour une fonction continue sur un **compact**, l'existence d'extremums globaux est assurée ([[topologie-evn#def-compact]]) ; on les cherche parmi les points critiques intérieurs et sur le bord.

::: théorème Conditions du second ordre {#thm-ordre2-extremum}
Soit $f$ de classe $C^2$ sur l'ouvert $U$ et $a$ un point critique.

- **Condition nécessaire** : si $f$ a un minimum local en $a$, alors $H_f(a)$ est **positive** (toutes ses valeurs propres sont $\ge 0$).
- **Condition suffisante** : si $H_f(a)$ est **définie positive** (toutes ses valeurs propres sont $> 0$), alors $f$ a un minimum local strict en $a$.
- Si $H_f(a)$ a une valeur propre $> 0$ et une valeur propre $< 0$, $a$ n'est pas un extremum : c'est un **point col** (ou point selle).

Énoncés symétriques pour un maximum.
:::

Par Taylor-Young à l'ordre $2$ et les [[endomorphismes-euclidiens#prop-rayleigh|valeurs extrêmes de la forme quadratique]] : si $\lambda_{\min} > 0$ est la plus petite valeur propre de $H_f(a)$, $f(a + h) - f(a) \ge \frac{\lambda_{\min}}{2}\|h\|^2 + o(\|h\|^2) > 0$ pour $h \neq 0$ petit. Si une valeur propre est nulle, on ne peut pas conclure à l'ordre $2$.

::: méthode Le cas de deux variables {#meth-rt-s2}
Pour $f(x, y)$ de classe $C^2$ et un point critique $a$, on note $r = \frac{\partial^2 f}{\partial x^2}(a)$, $s = \frac{\partial^2 f}{\partial x\partial y}(a)$, $t = \frac{\partial^2 f}{\partial y^2}(a)$. Le déterminant de la hessienne est $rt - s^2$, produit des deux valeurs propres, et sa trace est $r + t$ :

- si $rt - s^2 > 0$ et $r > 0$ : minimum local strict ; si $rt - s^2 > 0$ et $r < 0$ : maximum local strict ;
- si $rt - s^2 < 0$ : point col ;
- si $rt - s^2 = 0$ : on ne peut pas conclure à l'ordre $2$.
:::

Exemple : $f(x, y) = x^2 - y^2$ a un point col en $(0, 0)$ ($rt - s^2 = -4$) ; $f(x, y) = x^4 + y^4$ et $g(x, y) = x^4 - y^4$ ont toutes deux une hessienne nulle en $(0, 0)$, avec un minimum pour $f$ et un col pour $g$.

::: théorème Optimisation sous une contrainte (MP, MPI) {#thm-lagrange-contrainte}
Soient $f$ et $g$ de classe $C^1$ sur l'ouvert $U$, et $X = \{x \in U : g(x) = 0\}$. Si la restriction de $f$ à $X$ a un extremum local en $a \in X$ et si $\nabla g(a) \neq 0$, alors $\nabla f(a)$ est **colinéaire** à $\nabla g(a)$ : il existe un réel $\lambda$ (multiplicateur de Lagrange) tel que $\nabla f(a) = \lambda\,\nabla g(a)$.
:::

Les démonstrations ne sont pas exigibles. Géométriquement, en un extremum sous contrainte, la ligne de niveau de $f$ est **tangente** à la contrainte : leurs gradients sont colinéaires.

::: exemple Un produit maximal sur un cercle {#ex-contrainte}
Maximiser $f(x, y) = xy$ sur le cercle $g(x, y) = x^2 + y^2 - 2 = 0$. Le cercle est compact et $f$ continue : le maximum est atteint. La condition $\nabla f = \lambda\nabla g$ s'écrit $y = 2\lambda x$ et $x = 2\lambda y$, d'où $x^2 = y^2$, et avec la contrainte $(x, y) = (\pm1, \pm1)$. Le maximum vaut $1$, atteint en $(1, 1)$ et $(-1, -1)$ ; en toutes filières, on le retrouve en paramétrant le cercle : $xy = \sin(2\theta)$ pour $(x, y) = \sqrt2(\cos\theta, \sin\theta)$.
:::
