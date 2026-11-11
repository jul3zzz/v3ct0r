## Le groupe symétrique {#groupe-symetrique}

Le déterminant mesure comment une famille de vecteurs, ou une application linéaire, transforme les aires et les volumes, **avec un signe** qui dit si l'orientation est conservée. Sa formule générale fait intervenir toutes les façons de permuter $n$ objets : c'est pourquoi on étudie d'abord le groupe des permutations. Ce premier chapitre est au programme de MPSI et MP2I ; en PCSI et PTSI, le groupe symétrique est hors programme et l'on peut passer directement à la [[determinants#rem-caracterisation|caractérisation du déterminant]]. Le cours [[algebre-lineaire#determinant]] a donné un premier aperçu des propriétés.

::: définition Permutations, cycles, transpositions {#def-sn}
On note $\mathcal{S}_n$ le groupe des **permutations** de $\{1, \ldots, n\}$ (les bijections de cet ensemble dans lui-même), pour la composition ; il a $n!$ éléments. Pour $p \ge 2$ éléments distincts $a_1, \ldots, a_p$, le **cycle** $(a_1\ a_2\ \cdots\ a_p)$ est la permutation qui envoie $a_1$ sur $a_2$, …, $a_{p-1}$ sur $a_p$, $a_p$ sur $a_1$, et fixe les autres éléments ; $p$ est sa **longueur** et $\{a_1, \ldots, a_p\}$ son **support**. Un cycle de longueur $2$ est une **transposition**.
:::

On écrit aussi une permutation sous forme de tableau, la première ligne donnant les éléments et la seconde leurs images : $\sigma = \begin{pmatrix} 1 & 2 & 3 & 4 & 5 \\ 2 & 3 & 1 & 5 & 4 \end{pmatrix}$. Le produit $\sigma\tau = \sigma \circ \tau$ se lit de droite à gauche : on applique d'abord $\tau$. Le groupe $\mathcal{S}_n$ n'est pas commutatif pour $n \ge 3$ : $(1\ 2)(2\ 3) = (1\ 2\ 3)$ mais $(2\ 3)(1\ 2) = (1\ 3\ 2)$.

::: théorème Décomposition en cycles à supports disjoints {#thm-cycles}
Toute permutation différente de l'identité s'écrit comme produit de cycles à supports deux à deux disjoints ; cette écriture est unique à l'ordre près des facteurs, et ces cycles commutent entre eux.
:::

La démonstration n'est pas exigible, mais il faut savoir **décomposer** : on suit l'orbite de $1$ ($1 \to \sigma(1) \to \sigma^2(1) \to \cdots$) jusqu'à revenir à $1$, ce qui donne un premier cycle, puis on recommence avec un élément non encore atteint. Pour le tableau ci-dessus : $1 \to 2 \to 3 \to 1$ et $4 \to 5 \to 4$, donc $\sigma = (1\ 2\ 3)(4\ 5)$.

::: proposition Décomposition en transpositions {#prop-transpositions}
Toute permutation est un produit de transpositions. Pour un cycle, $(a_1\ a_2\ \cdots\ a_p) = (a_1\ a_2)(a_2\ a_3)\cdots(a_{p-1}\ a_p)$, produit de $p - 1$ transpositions.
:::

L'écriture n'est pas unique, ni même le nombre de transpositions : $(1\ 2\ 3) = (1\ 2)(2\ 3) = (1\ 3)(1\ 2) = (1\ 2)(1\ 3)(2\ 3)(1\ 2)$. Ce qui ne change pas, c'est la **parité** de ce nombre : c'est le théorème de la signature.

::: théorème Signature {#thm-signature}
Il existe un unique morphisme de groupes $\varepsilon : \mathcal{S}_n \to \{-1, 1\}$ qui envoie toute transposition sur $-1$. On l'appelle la **signature**. Si $\sigma$ est un produit de $k$ transpositions, $\varepsilon(\sigma) = (-1)^k$ ; un cycle de longueur $p$ a pour signature $(-1)^{p-1}$.
:::

L'unicité vient de ce que les transpositions engendrent $\mathcal{S}_n$ ; l'existence, plus délicate, se démontre par la formule $\varepsilon(\sigma) = \prod_{i < j} \frac{\sigma(j) - \sigma(i)}{j - i}$ (exercice c1). Une permutation de signature $1$ est **paire**, de signature $-1$ **impaire**.

::: méthode Calculer une signature {#meth-signature}
On décompose $\sigma$ en cycles à supports disjoints et l'on multiplie les $(-1)^{p-1}$. Exemple : $\sigma = (1\ 2\ 3)(4\ 5)$ a pour signature $(+1)(-1) = -1$. Autre méthode : compter les **inversions**, les couples $i < j$ tels que $\sigma(i) > \sigma(j)$ ; leur nombre $N$ donne $\varepsilon(\sigma) = (-1)^N$. Ici les inversions sont $(1, 3)$, $(2, 3)$ et $(4, 5)$ : $N = 3$.
:::

## Formes n-linéaires alternées {#formes-multilineaires}

Dans tout ce chapitre, $E$ est un $\mathbb{K}$-espace vectoriel de dimension $n \ge 1$. Dans le plan, l'aire orientée $A(u, v)$ du parallélogramme construit sur $u$ et $v$ est linéaire en chaque vecteur, change de signe quand on les échange, et s'annule si $u = v$. On prend ces propriétés comme définition.

::: définition Forme n-linéaire alternée {#def-forme-alternee}
Une application $f : E^n \to \mathbb{K}$ est une **forme $n$-linéaire** si elle est linéaire par rapport à chacune de ses $n$ variables, les autres étant fixées. Elle est **alternée** si $f(x_1, \ldots, x_n) = 0$ dès que deux des $x_i$ sont égaux.
:::

::: proposition Antisymétrie, effet d'une permutation {#prop-antisymetrie}
Soit $f$ une forme $n$-linéaire alternée sur $E$.

- Échanger deux vecteurs change $f$ en son opposé ; plus généralement, pour $\sigma \in \mathcal{S}_n$, $f(x_{\sigma(1)}, \ldots, x_{\sigma(n)}) = \varepsilon(\sigma)\, f(x_1, \ldots, x_n)$.
- Si la famille $(x_1, \ldots, x_n)$ est liée, $f(x_1, \ldots, x_n) = 0$.
- Ajouter à un vecteur une combinaison linéaire des **autres** ne change pas la valeur de $f$.
:::

Pour l'échange de $x_i$ et $x_j$, on développe $0 = f(\ldots, x_i + x_j, \ldots, x_i + x_j, \ldots)$ par linéarité : il reste $f(\ldots, x_i, \ldots, x_j, \ldots) + f(\ldots, x_j, \ldots, x_i, \ldots) = 0$. Si la famille est liée, un vecteur est combinaison des autres, et l'on conclut par linéarité et caractère alterné.

::: théorème Déterminant dans une base {#thm-det-base}
Soit $e = (e_1, \ldots, e_n)$ une base de $E$. Il existe une **unique** forme $n$-linéaire alternée $f$ telle que $f(e_1, \ldots, e_n) = 1$ ; on la note $\det_e$. Toute forme $n$-linéaire alternée sur $E$ est un multiple de $\det_e$ : $f = f(e)\, \det_e$. Si $x_j = \sum_{i=1}^{n} a_{ij} e_i$ pour tout $j$,
$$\det\nolimits_e(x_1, \ldots, x_n) = \sum_{\sigma \in \mathcal{S}_n} \varepsilon(\sigma) \prod_{j=1}^{n} a_{\sigma(j)\, j}.$$
:::

La formule s'obtient en développant $f(x_1, \ldots, x_n)$ par multilinéarité : chaque terme $f(e_{i_1}, \ldots, e_{i_n})$ est nul si deux indices sont égaux, et vaut $\varepsilon(\sigma) f(e)$ si $j \mapsto i_j$ est une permutation $\sigma$. Cela prouve l'unicité ; l'existence (vérifier que la formule définit bien une forme alternée) n'est pas exigible. Pour $n = 2$ : $\det_e(x_1, x_2) = a_{11}a_{22} - a_{21}a_{12}$.

::: remarque Caractérisation du déterminant d'une matrice (PCSI, PTSI) {#rem-caracterisation}
En PCSI et PTSI, le vocabulaire des formes multilinéaires et le groupe symétrique sont hors programme. On admet le théorème suivant : il existe une unique application $\det : \mathcal{M}_n(\mathbb{K}) \to \mathbb{K}$ qui est **linéaire par rapport à chaque colonne**, **antisymétrique** par rapport aux colonnes (échanger deux colonnes change le signe), et vérifie $\det(I_n) = 1$. Toutes les propriétés qui suivent s'en déduisent, et se démontrent de la même façon.
:::

::: proposition Bases et changement de base {#prop-base-det}
Une famille $(x_1, \ldots, x_n)$ de $E$ est une base si et seulement si $\det_e(x_1, \ldots, x_n) \neq 0$. Si $e'$ est une autre base, $\det_{e'} = \det_{e'}(e)\, \det_e$, et $\det_{e'}(e)\,\det_e(e') = 1$.
:::

Si la famille est liée, son déterminant est nul ; si c'est une base $e'$, la relation $1 = \det_e(e) = \det_e(e')\det_{e'}(e)$ montre que $\det_e(e') \neq 0$.

::: remarque Aire et volume orientés {#rem-aire}
Dans $\mathbb{R}^2$ (respectivement $\mathbb{R}^3$) muni de sa base canonique, $\det(u, v)$ est l'**aire orientée** du parallélogramme construit sur $u$ et $v$ (respectivement $\det(u, v, w)$ le **volume orienté** du parallélépipède) : sa valeur absolue est l'aire (le volume), et son signe dit si la base $(u, v)$ est directe. Un déterminant nul traduit un parallélogramme aplati, c'est-à-dire des vecteurs liés.
:::

## Propriétés du déterminant {#proprietes-det}

::: définition Déterminant d'un endomorphisme, d'une matrice {#def-det-endo}
Pour $u \in \mathcal{L}(E)$, le scalaire $\det_e\big(u(e_1), \ldots, u(e_n)\big)$ ne dépend pas de la base $e$ : c'est le **déterminant** de $u$, noté $\det u$. Le déterminant d'une matrice $A \in \mathcal{M}_n(\mathbb{K})$ est celui de ses colonnes dans la base canonique de $\mathbb{K}^n$ :
$$\det A = \begin{vmatrix} a_{11} & \cdots & a_{1n} \\ \vdots & & \vdots \\ a_{n1} & \cdots & a_{nn} \end{vmatrix} = \sum_{\sigma \in \mathcal{S}_n} \varepsilon(\sigma) \prod_{j=1}^{n} a_{\sigma(j)\,j}.$$
:::

::: proposition Propriétés du déterminant des matrices {#prop-det-matrice}
Pour $A, B \in \mathcal{M}_n(\mathbb{K})$ et $\lambda \in \mathbb{K}$ :

- $\det(AB) = \det A \det B$, et $\det(\lambda A) = \lambda^n \det A$ ;
- $A$ est inversible si et seulement si $\det A \neq 0$, et alors $\det(A^{-1}) = \frac{1}{\det A}$ ;
- $\det(A^\top) = \det A$ : le déterminant est aussi $n$-linéaire alterné par rapport aux **lignes**.

De même, $\det(u \circ v) = \det u \det v$, et $u$ est un automorphisme si et seulement si $\det u \neq 0$. L'application $\det$ est un morphisme de groupes de $\mathrm{GL}_n(\mathbb{K})$ dans $\mathbb{K}^*$.
:::

Attention, $\det$ n'est pas linéaire : $\det(A + B) \neq \det A + \det B$ en général, et $\det(2I_n) = 2^n$. Deux matrices semblables, $A' = P^{-1}AP$, ont le même déterminant, puisque $\det(P^{-1})\det(P) = 1$ : c'est ce qui rend légitime la définition du déterminant d'un endomorphisme.

## Calculer un déterminant {#calcul-det}

::: proposition Opérations élémentaires et déterminant {#prop-operations-det}
Sur les colonnes (ou les lignes) d'une matrice :

- échanger deux colonnes change le déterminant en son **opposé** ;
- multiplier une colonne par $\lambda$ multiplie le déterminant par $\lambda$ ;
- ajouter à une colonne une combinaison linéaire des **autres** ne change pas le déterminant.
:::

::: proposition Déterminant d'une matrice triangulaire {#prop-det-triangulaire}
Le déterminant d'une matrice triangulaire (supérieure ou inférieure) est le **produit de ses coefficients diagonaux**.
:::

Dans la formule de la somme sur les permutations, seule l'identité donne un produit non nul pour une matrice triangulaire. La méthode la plus efficace est donc celle du [[calcul-matriciel#meth-pivot|pivot de Gauss]] : on se ramène à une matrice triangulaire par des opérations élémentaires, en suivant les changements de signe et les facteurs.

::: théorème Développement selon une ligne ou une colonne {#thm-developpement}
Notons $\Delta_{ij}$ le déterminant de la matrice obtenue en supprimant la ligne $i$ et la colonne $j$ de $A$ (un **mineur**), et $C_{ij} = (-1)^{i+j}\Delta_{ij}$ le **cofacteur** correspondant. Pour tout $j$ et tout $i$,
$$\det A = \sum_{i=1}^{n} a_{ij}\, C_{ij} \quad \text{(selon la colonne } j\text{)},$$
$$\det A = \sum_{j=1}^{n} a_{ij}\, C_{ij} \quad \text{(selon la ligne } i\text{)}.$$
:::

Les signes $(-1)^{i+j}$ forment un damier commençant par $+$ en haut à gauche. On développe selon la ligne ou la colonne qui contient le plus de zéros, après avoir éventuellement créé ces zéros par des opérations élémentaires.

::: proposition Formules en dimension 2 et 3 {#prop-sarrus}
$$\begin{vmatrix} a & b \\ c & d \end{vmatrix} = ad - bc,$$
$$\begin{vmatrix} a & b & c \\ d & e & f \\ g & h & i \end{vmatrix} = aei + bfg + cdh - ceg - afh - bdi.$$
La seconde (règle de Sarrus) ne se généralise pas aux tailles supérieures : en dimension $n$, la somme a $n!$ termes.
:::

::: exemple Déterminant de Vandermonde (MPSI, MP2I) {#ex-vandermonde-det}
Pour $x_1, \ldots, x_n \in \mathbb{K}$,
$$V(x_1, \ldots, x_n) = \begin{vmatrix} 1 & x_1 & \cdots & x_1^{n-1} \\ \vdots & \vdots & & \vdots \\ 1 & x_n & \cdots & x_n^{n-1} \end{vmatrix} = \prod_{1 \le i < j \le n} (x_j - x_i).$$
Il est non nul si et seulement si les $x_i$ sont distincts : c'est l'unicité du [[polynomes#thm-lagrange|polynôme d'interpolation de Lagrange]], vue matriciellement. La preuve par récurrence est faite dans [[algebre-lineaire#ex-vandermonde]].
:::

::: théorème Comatrice et inverse (MPSI, MP2I) {#thm-comatrice}
La **comatrice** de $A$ est la matrice $\operatorname{Com}(A) = (C_{ij})$ de ses cofacteurs. Elle vérifie
$$A\, \operatorname{Com}(A)^\top = \operatorname{Com}(A)^\top A = \det(A)\, I_n.$$
En particulier, si $A$ est inversible, $A^{-1} = \frac{1}{\det A}\operatorname{Com}(A)^\top$.
:::

Le coefficient $(i, k)$ de $A\operatorname{Com}(A)^\top$ est $\sum_j a_{ij}C_{kj}$ : pour $k = i$, c'est le développement de $\det A$ selon la ligne $i$ ; pour $k \neq i$, c'est le développement d'une matrice ayant deux lignes égales (la ligne $i$ recopiée en ligne $k$), donc nul. Pour $n = 2$, on retrouve l'[[calcul-matriciel#prop-inverse-2|inverse d'une matrice 2 × 2]]. La comatrice est hors programme en PCSI et PTSI ; en pratique, pour $n \ge 3$, on inverse plutôt par le pivot.
