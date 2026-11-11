## Sommes directes et matrices par blocs {#sommes-blocs}

Cette fiche rassemble les outils de première année que la seconde année généralise avant la [[reduction]] : découper un espace en morceaux, écrire une matrice par blocs, étudier ce qu'un endomorphisme laisse stable. Elle correspond aux « compléments » qui ouvrent l'algèbre linéaire de seconde année en MP, MPI, PC, PSI et PT. Les espaces sont des $\mathbb{K}$-espaces vectoriels, de dimension finie quand on parle de dimension ou de matrices.

::: définition Produit d'espaces vectoriels {#def-produit-ev}
Le produit $E_1 \times \cdots \times E_p$ d'espaces vectoriels est un espace vectoriel pour les opérations composante par composante. Si les $E_i$ sont de dimension finie, $\dim(E_1 \times \cdots \times E_p) = \dim E_1 + \cdots + \dim E_p$.
:::

::: définition Somme directe de plusieurs sous-espaces {#def-somme-directe-p}
La somme $F_1 + \cdots + F_p$ de sous-espaces de $E$ est l'ensemble des $x_1 + \cdots + x_p$ avec $x_i \in F_i$. Elle est **directe**, notée $F_1 \oplus \cdots \oplus F_p$, si tout élément de la somme s'y décompose de façon **unique**, ce qui équivaut à : $x_1 + \cdots + x_p = 0$ avec $x_i \in F_i$ implique $x_1 = \cdots = x_p = 0$.
:::

Pour $p \ge 3$, il ne suffit pas que les intersections deux à deux soient nulles : trois droites distinctes du plan ont des intersections deux à deux nulles, et leur somme n'est pas directe ([[algebre-lineaire#rem-plusieurs]]).

::: proposition Somme directe et dimension {#prop-somme-directe-dim}
En dimension finie, $\dim(F_1 + \cdots + F_p) \le \dim F_1 + \cdots + \dim F_p$, avec égalité si et seulement si la somme est directe. La somme est directe si et seulement si la concaténation de bases des $F_i$ est une famille libre ; si de plus $E = F_1 \oplus \cdots \oplus F_p$, c'est une **base adaptée** à la décomposition.
:::

L'application $(x_1, \ldots, x_p) \mapsto x_1 + \cdots + x_p$ de $F_1 \times \cdots \times F_p$ sur la somme est linéaire surjective ; elle est injective exactement quand la somme est directe, et le théorème du rang donne l'inégalité.

::: proposition Définir une application linéaire morceau par morceau {#prop-definir-restrictions}
Si $E = F_1 \oplus \cdots \oplus F_p$ et si $u_i \in \mathcal{L}(F_i, G)$ pour chaque $i$, il existe une unique $u \in \mathcal{L}(E, G)$ dont la restriction à chaque $F_i$ est $u_i$.
:::

C'est ainsi que l'on définit un projecteur ou une symétrie, et plus généralement un endomorphisme par ses restrictions à des sous-espaces : en base adaptée, sa matrice est **diagonale par blocs**.

::: définition Matrices par blocs {#def-blocs}
Une matrice découpée en blocs $A = \begin{pmatrix} A_{11} & A_{12} \\ A_{21} & A_{22} \end{pmatrix}$ se multiplie par une matrice découpée de façon compatible comme une matrice $2 \times 2$, les blocs jouant le rôle de coefficients (dans le bon ordre, car ils ne commutent pas) :
$$\begin{pmatrix} A & B \\ C & D \end{pmatrix}\begin{pmatrix} A' & B' \\ C' & D' \end{pmatrix} = \begin{pmatrix} AA' + BC' & AB' + BD' \\ CA' + DC' & CB' + DD' \end{pmatrix}.$$
:::

Le déterminant d'une matrice triangulaire par blocs est le produit des déterminants des blocs diagonaux : $\det\begin{pmatrix} A & B \\ 0 & D \end{pmatrix} = \det A \det D$ pour $A$ et $D$ carrées.

## Sous-espaces stables, trace, polynômes d'endomorphismes {#stables-trace}

::: définition Sous-espace stable, endomorphisme induit {#def-stable}
Un sous-espace $F$ est **stable** par $u \in \mathcal{L}(E)$ si $u(F) \subset F$ ; la restriction de $u$ à $F$ est alors un endomorphisme de $F$, l'**endomorphisme induit** $u_F$. Si $(e_1, \ldots, e_n)$ est une base de $E$ dont les $k$ premiers vecteurs forment une base de $F$, $F$ est stable si et seulement si la matrice de $u$ est **triangulaire par blocs** $\begin{pmatrix} A & B \\ 0 & D \end{pmatrix}$, $A$ étant la matrice de $u_F$.
:::

::: proposition Endomorphismes qui commutent {#prop-commutent-stables}
Si $u$ et $v$ commutent, le noyau et l'image de $v$ sont stables par $u$. En particulier, les sous-espaces propres de $v$ sont stables par $u$.
:::

Si $v(x) = 0$, alors $v(u(x)) = u(v(x)) = 0$ ; et $u(v(y)) = v(u(y)) \in \operatorname{Im} v$.

::: définition Trace {#def-trace}
La **trace** d'une matrice carrée est la somme de ses coefficients diagonaux. Elle est linéaire, et $\operatorname{tr}(AB) = \operatorname{tr}(BA)$ pour $A \in \mathcal{M}_{n,p}(\mathbb{K})$ et $B \in \mathcal{M}_{p,n}(\mathbb{K})$. Deux matrices semblables ont la même trace ; la trace d'un endomorphisme est donc définie comme celle de sa matrice dans n'importe quelle base. La trace d'un **projecteur** est égale à son **rang**.
:::

On a $\operatorname{tr}(P^{-1}AP) = \operatorname{tr}(APP^{-1}) = \operatorname{tr}A$. Pour un projecteur $p$, une base adaptée à $E = \operatorname{Im} p \oplus \operatorname{Ker} p$ donne la matrice $\operatorname{diag}(1, \ldots, 1, 0, \ldots, 0)$, avec $\operatorname{rg} p$ coefficients égaux à $1$. Attention : $\operatorname{tr}(ABC) \neq \operatorname{tr}(BAC)$ en général ; seules les permutations circulaires conservent la trace.

::: définition Hyperplans {#def-hyperplan}
En dimension finie $n$, un **hyperplan** est un sous-espace de dimension $n - 1$ ; c'est exactement le noyau d'une forme linéaire non nulle. Dans une base, un hyperplan a une équation $a_1x_1 + \cdots + a_nx_n = 0$ avec $(a_1, \ldots, a_n) \neq 0$, unique à un facteur non nul près.
:::

Deux formes linéaires non nulles ont le même noyau si et seulement si elles sont proportionnelles. L'intersection de $m$ hyperplans est de dimension au moins $n - m$.

::: définition Polynômes d'endomorphismes {#def-polynome-endo}
Pour $u \in \mathcal{L}(E)$ et $P = \sum a_k X^k \in \mathbb{K}[X]$, on pose $P(u) = \sum a_k u^k$, avec $u^0 = \mathrm{id}_E$ ; de même $P(A)$ pour une matrice. L'application $P \mapsto P(u)$ est linéaire et vérifie $(PQ)(u) = P(u) \circ Q(u)$ : deux polynômes en $u$ commutent. Un polynôme $P$ tel que $P(u) = 0$ est un **polynôme annulateur** de $u$.
:::

Tout endomorphisme d'un espace de dimension finie $n$ a un polynôme annulateur non nul, car la famille $(\mathrm{id}, u, \ldots, u^{n^2})$ de $\mathcal{L}(E)$, de dimension $n^2$, est liée. Exemples : un projecteur annule $X^2 - X$, une symétrie $X^2 - 1$, un endomorphisme nilpotent une puissance $X^k$.

::: proposition Noyaux et images de polynômes en u {#prop-ker-pu}
Pour tout polynôme $P$, $\operatorname{Ker} P(u)$ et $\operatorname{Im} P(u)$ sont stables par $u$. Si $P$ est annulateur de $u$ et $\lambda$ une valeur propre de $u$, alors $P(\lambda) = 0$.
:::

La stabilité vient de ce que $u$ et $P(u)$ commutent. Pour la seconde affirmation, si $u(x) = \lambda x$ avec $x \neq 0$, alors $P(u)(x) = P(\lambda)x = 0$. Le lemme des noyaux, qui décompose $E$ à l'aide d'un polynôme annulateur, est l'objet du cours [[reduction]] (exercice c1 pour un cas particulier).

::: remarque Interpolation de Lagrange {#rem-lagrange}
En PC et PSI, cette partie du programme rappelle l'[[polynomes#thm-lagrange|interpolation de Lagrange]] : elle permet notamment de construire des polynômes d'endomorphisme valant $1$ sur un sous-espace propre et $0$ sur les autres (projecteurs spectraux d'un endomorphisme diagonalisable).
:::
