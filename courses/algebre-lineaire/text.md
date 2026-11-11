## Espaces et sous-espaces vectoriels {#espaces}

L'algèbre linéaire étudie tout ce qui peut s'additionner et se multiplier par un nombre : vecteurs du plan, polynômes, fonctions, suites, solutions d'équations différentielles linéaires. Elle a une propriété rare en mathématiques : presque toutes ses questions en dimension finie se résolvent par un calcul, et ce calcul est toujours le même, le pivot de Gauss. Dans tout le cours, $\mathbb{K}$ désigne $\mathbb{R}$ ou $\mathbb{C}$.

::: définition Espace vectoriel {#def-ev}
Un **espace vectoriel** sur $\mathbb{K}$ est un ensemble $E$ muni d'une addition $E \times E \to E$ et d'une multiplication par les scalaires $\mathbb{K} \times E \to E$ telles que $(E, +)$ soit un groupe commutatif, d'élément neutre noté $0_E$, et que pour tous $\lambda, \mu \in \mathbb{K}$ et $x, y \in E$ :
$$\lambda(x + y) = \lambda x + \lambda y, \qquad (\lambda + \mu)x = \lambda x + \mu x,$$
$$\lambda(\mu x) = (\lambda\mu)x, \qquad 1 \cdot x = x.$$
:::

Les exemples sont partout : $\mathbb{K}^n$, l'espace $\mathbb{K}[X]$ des polynômes, l'espace $\mathcal{M}_{n,p}(\mathbb{K})$ des matrices, l'espace $\mathcal{F}(I, \mathbb{R})$ des fonctions d'un intervalle $I$ dans $\mathbb{R}$, l'espace $\mathbb{K}^{\mathbb{N}}$ des suites. Des axiomes découlent les règles de calcul attendues : $0 \cdot x = 0_E$, $(-1) x = -x$, et $\lambda x = 0_E$ si et seulement si $\lambda = 0$ ou $x = 0_E$.

::: définition Sous-espace vectoriel {#def-sev}
Une partie $F$ de $E$ est un **sous-espace vectoriel** si elle contient $0_E$ et si elle est stable par combinaison linéaire : pour tous $x, y \in F$ et $\lambda, \mu \in \mathbb{K}$, $\lambda x + \mu y \in F$. Muni des lois de $E$, un sous-espace est lui-même un espace vectoriel.
:::

C'est la façon la plus économique de prouver qu'un ensemble est un espace vectoriel : le voir comme sous-espace d'un espace connu. L'ensemble des solutions d'un système linéaire **homogène**, celui des fonctions de classe $C^1$ sur $I$, celui $\mathbb{K}_n[X]$ des polynômes de degré au plus $n$ sont des sous-espaces. En revanche, la droite affine $\{(x, y) : x + y = 1\}$ n'en est pas un, puisqu'elle ne contient pas $0$, et la réunion de deux droites distinctes du plan non plus : la somme d'un vecteur de chacune en sort.

::: proposition Intersection et sous-espace engendré {#prop-vect}
Une intersection de sous-espaces vectoriels est un sous-espace vectoriel. Pour une partie $A$ de $E$, le **sous-espace engendré** $\operatorname{Vect}(A)$ est le plus petit sous-espace contenant $A$ : c'est l'ensemble des combinaisons linéaires finies d'éléments de $A$, et $\operatorname{Vect}(\emptyset) = \{0\}$.
:::

Une réunion de sous-espaces n'est en général pas un sous-espace : on peut montrer que $F \cup G$ en est un si et seulement si $F \subset G$ ou $G \subset F$. La bonne opération est la somme.

::: définition Somme, somme directe, supplémentaires {#def-somme}
La **somme** de deux sous-espaces $F$ et $G$ est $F + G = \{x + y : x \in F,\ y \in G\}$ ; c'est $\operatorname{Vect}(F \cup G)$. Elle est **directe**, et l'on écrit $F \oplus G$, si tout vecteur de $F + G$ s'écrit de manière **unique** $x + y$ avec $x \in F$ et $y \in G$. Les sous-espaces $F$ et $G$ sont **supplémentaires** dans $E$ si $E = F \oplus G$.
:::

::: proposition Critère de somme directe {#prop-directe}
La somme $F + G$ est directe si et seulement si $F \cap G = \{0\}$.
:::

::: preuve Critère de somme directe
Si la somme est directe et si $z \in F \cap G$, alors $z = z + 0 = 0 + z$ donne deux écritures, donc $z = 0$. Réciproquement, si $F \cap G = \{0\}$ et si $x + y = x' + y'$ avec $x, x' \in F$ et $y, y' \in G$, le vecteur $x - x' = y' - y$ appartient à $F \cap G$ : il est nul, et les deux écritures coïncident.
:::

Dans le plan, deux droites distinctes passant par l'origine sont supplémentaires. Dans $\mathcal{F}(\mathbb{R}, \mathbb{R})$, les fonctions paires et les fonctions impaires sont supplémentaires : $f(x) = \frac{f(x) + f(-x)}{2} + \frac{f(x) - f(-x)}{2}$, et une fonction à la fois paire et impaire est nulle. Un supplémentaire n'est jamais unique, sauf dans les cas triviaux : toute droite du plan non confondue avec $F$ est un supplémentaire de la droite $F$.

::: remarque Plus de deux sous-espaces {#rem-plusieurs}
Pour $p \ge 3$ sous-espaces, la somme $F_1 + \cdots + F_p$ est directe si la décomposition de tout vecteur est unique, c'est-à-dire si $x_1 + \cdots + x_p = 0$ avec $x_i \in F_i$ entraîne $x_1 = \cdots = x_p = 0$. Il **ne suffit pas** que les intersections deux à deux soient nulles : trois droites distinctes du plan se coupent deux à deux en $\{0\}$, mais leur somme n'est pas directe.
:::

## Familles et dimension {#dimension}

Une base est un système de coordonnées : elle permet de remplacer un vecteur abstrait par une liste de nombres. Le théorème central de ce chapitre affirme que toutes les bases d'un espace ont le même nombre d'éléments ; ce nombre, la dimension, est le premier invariant de l'algèbre linéaire.

::: définition Famille libre, génératrice, base {#def-base}
Une famille finie $(e_1, \ldots, e_n)$ de vecteurs de $E$ est :

- **libre** si $\lambda_1 e_1 + \cdots + \lambda_n e_n = 0$ entraîne $\lambda_1 = \cdots = \lambda_n = 0$ ; sinon elle est **liée** ;
- **génératrice** si $\operatorname{Vect}(e_1, \ldots, e_n) = E$ ;
- une **base** si elle est libre et génératrice. Tout vecteur s'écrit alors de manière unique $x = x_1 e_1 + \cdots + x_n e_n$, et les $x_i$ sont ses **coordonnées**.
:::

Les bases canoniques sont celles que l'on écrit sans réfléchir : $(1, 0, \ldots, 0), \ldots, (0, \ldots, 0, 1)$ dans $\mathbb{K}^n$, $(1, X, \ldots, X^n)$ dans $\mathbb{K}_n[X]$, les matrices élémentaires $E_{ij}$ dans $\mathcal{M}_{n,p}(\mathbb{K})$. Une famille est liée si et seulement si l'un de ses vecteurs est combinaison linéaire des autres ; en particulier, une famille qui contient le vecteur nul, ou deux fois le même vecteur, est liée. Une famille de polynômes non nuls de degrés deux à deux distincts est libre : regarder le terme de plus haut degré.

::: lemme Lemme fondamental {#lem-steinitz}
Dans un espace engendré par $n$ vecteurs, toute famille de $n + 1$ vecteurs est liée.
:::

::: preuve Par récurrence sur n
Pour $n = 0$, l'espace est $\{0\}$ et une famille d'un vecteur est liée. Supposons le résultat vrai au rang $n - 1$, et soient $E = \operatorname{Vect}(g_1, \ldots, g_n)$ et $v_1, \ldots, v_{n+1} \in E$. Écrivons $v_j = a_j g_n + w_j$ avec $w_j \in F = \operatorname{Vect}(g_1, \ldots, g_{n-1})$.

Si tous les $a_j$ sont nuls, les $v_j$ sont dans $F$, et l'hypothèse de récurrence montre que $v_1, \ldots, v_n$ sont déjà liés. Sinon, quitte à renuméroter, $a_{n+1} \neq 0$, et les $n$ vecteurs $u_j = v_j - \frac{a_j}{a_{n+1}} v_{n+1}$, pour $j \le n$, sont dans $F$ : ils sont liés. Une relation $\sum_{j \le n} \mu_j u_j = 0$ non triviale fournit une relation entre $v_1, \ldots, v_{n+1}$ dont les coefficients de $v_1, \ldots, v_n$ sont les $\mu_j$, non tous nuls.
:::

::: théorème Existence des bases et dimension {#thm-dimension}
Soit $E$ un espace engendré par une famille finie. Alors :

- (**base incomplète**) toute famille libre de $E$ peut être complétée en une base de $E$ avec des vecteurs pris dans une famille génératrice donnée ;
- de toute famille génératrice on peut extraire une base ;
- toutes les bases de $E$ ont le même nombre d'éléments, appelé **dimension** de $E$ et noté $\dim E$.
:::

La base incomplète se démontre en ajoutant un à un des vecteurs de la famille génératrice : si $L$ est libre et $g \notin \operatorname{Vect}(L)$, la famille $L \cup \{g\}$ reste libre ; on s'arrête quand tous les vecteurs générateurs sont dans $\operatorname{Vect}(L)$, qui est alors $E$. L'égalité des cardinaux découle du lemme fondamental : une famille libre a au plus autant d'éléments qu'une famille génératrice, et une base est les deux à la fois. On a $\dim \mathbb{K}^n = n$, $\dim \mathbb{K}_n[X] = n + 1$ et $\dim \mathcal{M}_{n,p}(\mathbb{K}) = np$. L'espace $\mathbb{K}[X]$ tout entier n'est engendré par aucune famille finie : il est de dimension infinie.

::: corollaire Familles en dimension n {#cor-n}
Si $\dim E = n$, une famille libre a au plus $n$ vecteurs, une famille génératrice au moins $n$, et une famille d'exactement $n$ vecteurs est une base dès qu'elle est libre **ou** génératrice.
:::

Ce corollaire divise le travail par deux : pour montrer que $n$ vecteurs d'un espace de dimension $n$ forment une base, il suffit de prouver qu'ils sont libres. Ainsi les polynômes $1, X - a, (X - a)^2, \ldots, (X - a)^n$, de degrés distincts, forment une base de $\mathbb{K}_n[X]$ ; les coordonnées d'un polynôme dans cette base sont données par la formule de Taylor.

::: proposition Sous-espaces en dimension finie {#prop-sev-dim}
Si $E$ est de dimension finie et $F$ un sous-espace de $E$, alors $F$ est de dimension finie, $\dim F \le \dim E$, avec égalité si et seulement si $F = E$. Tout sous-espace $F$ admet un supplémentaire $G$, et alors $\dim E = \dim F + \dim G$.
:::

::: théorème Formule de Grassmann {#thm-grassmann}
Pour deux sous-espaces $F$ et $G$ d'un espace de dimension finie,
$$\dim(F + G) = \dim F + \dim G - \dim(F \cap G).$$
:::

Pour la démontrer, on part d'une base de $F \cap G$, que l'on complète d'une part en une base de $F$, d'autre part en une base de $G$ ; la réunion de ces trois paquets est une base de $F + G$. La formule a des conséquences immédiates : deux plans de $\mathbb{R}^3$ passant par l'origine se coupent au moins selon une droite, puisque $\dim(F \cap G) \ge 2 + 2 - 3 = 1$. Et $F$ et $G$ sont supplémentaires si et seulement si $F \cap G = \{0\}$ et $\dim F + \dim G = \dim E$.

::: définition Rang d'une famille {#def-rang-famille}
Le **rang** d'une famille finie $(v_1, \ldots, v_p)$ est la dimension de $\operatorname{Vect}(v_1, \ldots, v_p)$. Il vaut au plus $p$, avec égalité si et seulement si la famille est libre.
:::

## Applications linéaires {#lineaires}

::: définition Application linéaire {#def-lin}
Une application $u : E \to F$ entre deux espaces vectoriels sur $\mathbb{K}$ est **linéaire** si $u(\lambda x + \mu y) = \lambda u(x) + \mu u(y)$ pour tous $x, y \in E$ et $\lambda, \mu \in \mathbb{K}$. On note $\mathcal{L}(E, F)$ l'ensemble de ces applications et $\mathcal{L}(E)$ celui des **endomorphismes** de $E$. Une application linéaire bijective est un **isomorphisme** ; sa réciproque est alors linéaire.
:::

La dérivation $P \mapsto P'$ sur $\mathbb{K}[X]$, l'intégrale $f \mapsto \int_a^b f$ sur les fonctions continues, la transposition des matrices, l'évaluation $P \mapsto P(a)$, l'application $X \mapsto AX$ pour une matrice $A$ fixée sont linéaires. L'application $x \mapsto x + 1$ ne l'est pas : une application linéaire envoie toujours $0$ sur $0$.

::: définition Forme linéaire, hyperplan {#def-forme}
Une **forme linéaire** sur $E$ est une application linéaire de $E$ dans $\mathbb{K}$. Un **hyperplan** est le noyau d'une forme linéaire non nulle ; en dimension finie $n$, ce sont exactement les sous-espaces de dimension $n - 1$.
:::

::: proposition Noyau et image {#prop-ker-im}
Pour $u \in \mathcal{L}(E, F)$, le **noyau** $\ker u = u^{-1}(\{0\})$ est un sous-espace de $E$ et l'**image** $\operatorname{Im} u = u(E)$ un sous-espace de $F$. De plus,
$$u \text{ est injective} \iff \ker u = \{0\},$$
$$u \text{ est surjective} \iff \operatorname{Im} u = F.$$
:::

Le critère d'injectivité vient de ce que $u(x) = u(y)$ équivaut à $x - y \in \ker u$ : l'ensemble des solutions de $u(x) = b$, s'il n'est pas vide, est $x_0 + \ker u$ pour n'importe quelle solution particulière $x_0$. C'est le principe qui régit les systèmes linéaires et les équations différentielles linéaires : solution générale = solution particulière + solution générale de l'équation homogène.

::: proposition Une application linéaire est déterminée par l'image d'une base {#prop-base-image}
Si $(e_1, \ldots, e_n)$ est une base de $E$ et $f_1, \ldots, f_n$ des vecteurs quelconques de $F$, il existe une **unique** application linéaire $u : E \to F$ telle que $u(e_i) = f_i$ pour tout $i$. Elle est injective, resp. surjective, resp. bijective, si et seulement si la famille $(f_1, \ldots, f_n)$ est libre, resp. génératrice de $F$, resp. une base de $F$.
:::

Deux espaces de dimension finie sont donc isomorphes si et seulement s'ils ont la même dimension : tout espace de dimension $n$ est une copie de $\mathbb{K}^n$, l'isomorphisme étant donné par le choix d'une base. C'est ce qui permet de tout ramener à des calculs sur des colonnes de nombres.

::: théorème Théorème du rang {#thm-rang}
Soit $u \in \mathcal{L}(E, F)$ avec $E$ de dimension finie. Alors $\operatorname{Im} u$ est de dimension finie, et en notant $\operatorname{rg} u = \dim \operatorname{Im} u$ :
$$\dim E = \dim \ker u + \operatorname{rg} u.$$
:::

::: preuve Par un supplémentaire du noyau
Soit $S$ un supplémentaire de $\ker u$ dans $E$. La restriction de $u$ à $S$, vue comme application de $S$ dans $\operatorname{Im} u$, est injective, car son noyau est $S \cap \ker u = \{0\}$. Elle est surjective : si $y = u(x)$ et $x = k + s$ avec $k \in \ker u$ et $s \in S$, alors $y = u(s)$. C'est donc un isomorphisme, et $\operatorname{rg} u = \dim S = \dim E - \dim \ker u$.
:::

::: corollaire En dimension égale {#cor-bij}
Si $E$ et $F$ ont la même dimension finie et si $u \in \mathcal{L}(E, F)$, alors $u$ est injective si et seulement si elle est surjective, si et seulement si elle est bijective. En particulier, un endomorphisme d'un espace de dimension finie est bijectif dès qu'il est injectif.
:::

Ce corollaire est faux en dimension infinie : sur $\mathbb{K}[X]$, la dérivation est surjective sans être injective (elle tue les constantes), et la multiplication par $X$ est injective sans être surjective (son image ne contient pas $1$). Il permet aussi de montrer des existences sans rien construire : pour des réels $x_0 < x_1 < \cdots < x_n$, l'application $P \mapsto (P(x_0), \ldots, P(x_n))$ de $\mathbb{R}_n[X]$ dans $\mathbb{R}^{n+1}$ est injective, car un polynôme de degré au plus $n$ qui a $n + 1$ racines est nul ; elle est donc bijective, et il existe un unique polynôme d'interpolation de degré au plus $n$ prenant des valeurs données aux $x_i$.

### Projecteurs et symétries

::: définition Projecteur et symétrie {#def-proj}
Supposons $E = F \oplus G$, et écrivons tout vecteur $x = x_F + x_G$. Le **projecteur** sur $F$ parallèlement à $G$ est $p : x \mapsto x_F$ ; la **symétrie** par rapport à $F$ parallèlement à $G$ est $s : x \mapsto x_F - x_G$.
:::

::: proposition Caractérisation des projecteurs et des symétries {#prop-proj}
Un endomorphisme $p$ de $E$ est un projecteur si et seulement si $p \circ p = p$ ; c'est alors le projecteur sur $\operatorname{Im} p$ parallèlement à $\ker p$, et $E = \operatorname{Im} p \oplus \ker p$. Un endomorphisme $s$ est une symétrie si et seulement si $s \circ s = \mathrm{id}_E$ ; c'est la symétrie par rapport à $\ker(s - \mathrm{id}_E)$ parallèlement à $\ker(s + \mathrm{id}_E)$. On passe de l'un à l'autre par $s = 2p - \mathrm{id}_E$.
:::

Pour un projecteur, la décomposition s'écrit explicitement $x = p(x) + (x - p(x))$, avec $p(x) \in \operatorname{Im} p$ et $x - p(x) \in \ker p$ puisque $p(x - p(x)) = p(x) - p^2(x) = 0$. Les vecteurs de $\operatorname{Im} p$ sont exactement ceux que $p$ laisse fixes. Cette idée, décomposer l'espace en morceaux sur lesquels un endomorphisme agit simplement, sera au cœur de la réduction.

## Matrices {#matrices}

::: définition Matrice d'une application linéaire {#def-mat}
Soient $\mathcal{B} = (e_1, \ldots, e_p)$ une base de $E$ et $\mathcal{C} = (f_1, \ldots, f_n)$ une base de $F$. La **matrice** de $u \in \mathcal{L}(E, F)$ dans ces bases est la matrice $A = \operatorname{Mat}_{\mathcal{B}, \mathcal{C}}(u) \in \mathcal{M}_{n,p}(\mathbb{K})$ dont la $j$-ième colonne contient les coordonnées de $u(e_j)$ dans $\mathcal{C}$ :
$$u(e_j) = \sum_{i=1}^{n} a_{ij}\, f_i.$$
:::

La règle à retenir : **la colonne $j$ est l'image du $j$-ième vecteur de base**. Si $X$ est la colonne des coordonnées de $x$ dans $\mathcal{B}$ et $Y$ celle de $u(x)$ dans $\mathcal{C}$, alors $Y = AX$. Par exemple, la dérivation de $\mathbb{R}_3[X]$ dans la base $(1, X, X^2, X^3)$ a pour matrice
$$\begin{pmatrix} 0 & 1 & 0 & 0 \\ 0 & 0 & 2 & 0 \\ 0 & 0 & 0 & 3 \\ 0 & 0 & 0 & 0 \end{pmatrix},$$
puisque la dérivée de $X^j$ est $j X^{j-1}$.

::: proposition Produit et composition {#prop-produit}
Si $\mathcal{B}$, $\mathcal{C}$, $\mathcal{D}$ sont des bases de $E$, $F$, $G$, et $u \in \mathcal{L}(E, F)$, $v \in \mathcal{L}(F, G)$, alors
$$\operatorname{Mat}_{\mathcal{B}, \mathcal{D}}(v \circ u) = \operatorname{Mat}_{\mathcal{C}, \mathcal{D}}(v)\, \operatorname{Mat}_{\mathcal{B}, \mathcal{C}}(u).$$
En particulier, $u$ est un isomorphisme si et seulement si sa matrice (carrée) est inversible, et la matrice de $u^{-1}$ est alors l'inverse de celle de $u$.
:::

C'est la raison d'être de la définition du produit matriciel : il traduit la composition. Elle en explique aussi les surprises. Le produit n'est pas commutatif, puisque la composition ne l'est pas ; et un produit de deux matrices non nulles peut être nul : avec $A = \begin{pmatrix} 0 & 1 \\ 0 & 0 \end{pmatrix}$, on a $A^2 = 0$, car $A$ envoie $e_2$ sur $e_1$ et $e_1$ sur $0$.

::: définition Matrice de passage {#def-passage}
La **matrice de passage** d'une base $\mathcal{B}$ à une base $\mathcal{B}'$ de $E$ est la matrice $P$ dont les colonnes sont les coordonnées des vecteurs de $\mathcal{B}'$ dans $\mathcal{B}$. Elle est inversible, et si $X$ et $X'$ sont les coordonnées d'un même vecteur dans $\mathcal{B}$ et dans $\mathcal{B}'$, alors $X = P X'$.
:::

::: théorème Formule de changement de base {#thm-changement}
Si $u \in \mathcal{L}(E)$ a pour matrice $A$ dans la base $\mathcal{B}$ et $A'$ dans la base $\mathcal{B}'$, et si $P$ est la matrice de passage de $\mathcal{B}$ à $\mathcal{B}'$, alors
$$A' = P^{-1} A P.$$
Plus généralement, pour $u \in \mathcal{L}(E, F)$, on a $A' = Q^{-1} A P$, où $P$ et $Q$ sont les matrices de passage dans $E$ et dans $F$.
:::

Deux matrices carrées $A$ et $A'$ telles que $A' = P^{-1} A P$ pour une matrice inversible $P$ sont dites **semblables** : elles représentent le même endomorphisme dans deux bases. Deux matrices de même taille telles que $A' = Q^{-1} A P$ sont dites **équivalentes**. Toute la théorie de la réduction cherche, parmi les matrices semblables à $A$, la plus simple possible.

::: proposition Trace {#prop-trace}
La **trace** d'une matrice carrée est la somme de ses coefficients diagonaux. Elle est linéaire et vérifie $\operatorname{tr}(AB) = \operatorname{tr}(BA)$ pour $A \in \mathcal{M}_{n,p}(\mathbb{K})$ et $B \in \mathcal{M}_{p,n}(\mathbb{K})$. Deux matrices semblables ont donc la même trace, ce qui permet de définir la trace d'un endomorphisme.
:::

::: définition Rang d'une matrice {#def-rang-mat}
Le **rang** d'une matrice $A \in \mathcal{M}_{n,p}(\mathbb{K})$ est le rang de la famille de ses colonnes, c'est-à-dire le rang de l'application linéaire $X \mapsto AX$ de $\mathbb{K}^p$ dans $\mathbb{K}^n$.
:::

::: théorème Rang et matrices équivalentes {#thm-rang-mat}
Une matrice $A \in \mathcal{M}_{n,p}(\mathbb{K})$ est de rang $r$ si et seulement si elle est équivalente à la matrice $J_r = \begin{pmatrix} I_r & 0 \\ 0 & 0 \end{pmatrix}$. Par conséquent, deux matrices de même taille sont équivalentes si et seulement si elles ont le même rang, et $\operatorname{rg}(A^{\top}) = \operatorname{rg}(A)$ : le rang des lignes est égal au rang des colonnes.
:::

La preuve consiste à choisir des bases adaptées : une base de $E$ formée d'une base d'un supplémentaire $S$ du noyau, puis d'une base du noyau ; dans $F$, les images des vecteurs de $S$, qui forment une famille libre, complétées en une base. Dans ces bases, la matrice de $u$ est exactement $J_r$. L'égalité des rangs des lignes et des colonnes, qui n'a rien d'évident, en découle en transposant $Q^{-1} A P = J_r$.

### Le pivot de Gauss

::: méthode Pivot de Gauss {#meth-gauss}
Les opérations élémentaires sur les lignes (échanger deux lignes, multiplier une ligne par un scalaire non nul, ajouter à une ligne un multiple d'une autre) reviennent à multiplier à gauche par une matrice inversible : elles conservent le rang et l'ensemble des solutions de $AX = 0$. Pour calculer un rang, résoudre un système ou inverser une matrice :

1. choisir un coefficient non nul (le pivot) dans la première colonne non nulle et l'amener en première ligne ;
2. annuler les coefficients situés sous le pivot par des opérations $L_i \leftarrow L_i - \frac{a_{i1}}{a_{11}} L_1$ ;
3. recommencer sur la sous-matrice qui reste ;
4. le rang est le nombre de pivots ; pour inverser, appliquer les mêmes opérations à $(A \mid I_n)$ jusqu'à obtenir $(I_n \mid A^{-1})$.
:::

Le pivot de Gauss coûte de l'ordre de $n^3$ opérations pour une matrice $n \times n$. C'est l'algorithme que les ordinateurs exécutent, sous des formes raffinées, chaque fois qu'ils résolvent un système linéaire, de la météo à l'imagerie médicale.

## Déterminant {#determinant}

Le déterminant mesure comment une application linéaire transforme les volumes. En dimension $2$, $\det\begin{pmatrix} a & c \\ b & d \end{pmatrix} = ad - bc$ est l'aire orientée du parallélogramme construit sur les colonnes ; en dimension $3$, c'est le volume orienté du parallélépipède. Il est nul exactement quand le volume s'écrase, c'est-à-dire quand les colonnes sont liées.

::: théorème Existence et unicité du déterminant {#thm-det}
Soient $E$ un espace de dimension $n$ et $\mathcal{B}$ une base de $E$. Il existe une **unique** forme $n$-linéaire alternée $\det_{\mathcal{B}} : E^n \to \mathbb{K}$ telle que $\det_{\mathcal{B}}(\mathcal{B}) = 1$, et toute forme $n$-linéaire alternée sur $E$ lui est proportionnelle. Pour une matrice carrée $A = (a_{ij})$, le déterminant de ses colonnes dans la base canonique est
$$\det A = \sum_{\sigma \in \mathfrak{S}_n} \varepsilon(\sigma)\, a_{\sigma(1) 1}\, a_{\sigma(2) 2} \cdots a_{\sigma(n) n}.$$
:::

« Alternée » signifie que la forme s'annule dès que deux vecteurs sont égaux ; elle change alors de signe quand on en échange deux. La formule avec les permutations compte $n!$ termes : elle sert à démontrer, presque jamais à calculer. En dimension $3$, elle donne la règle de Sarrus, qui **ne se généralise pas** aux dimensions supérieures.

::: proposition Propriétés du déterminant {#prop-det}
Pour $A, B \in \mathcal{M}_n(\mathbb{K})$ et $\lambda \in \mathbb{K}$ :

- $\det(AB) = \det A \cdot \det B$ et $\det(\lambda A) = \lambda^n \det A$ ;
- $\det(A^{\top}) = \det A$ : tout ce qui vaut pour les colonnes vaut pour les lignes ;
- $A$ est inversible si et seulement si $\det A \neq 0$, et alors $\det(A^{-1}) = \frac{1}{\det A}$ ;
- échanger deux colonnes change le signe ; ajouter à une colonne une combinaison linéaire des autres ne change rien ;
- le déterminant d'une matrice triangulaire est le produit de ses coefficients diagonaux.
:::

Attention : le déterminant n'est pas linéaire, $\det(A + B) \neq \det A + \det B$ en général (essayer $A = B = I_2$). Comme deux matrices semblables ont le même déterminant, par multiplicativité, on définit le déterminant d'un endomorphisme comme celui de sa matrice dans n'importe quelle base. En pratique, on calcule un déterminant en se ramenant à une matrice triangulaire par des opérations sur les lignes et les colonnes, en suivant les changements de signe et les facteurs.

::: théorème Développement selon une colonne {#thm-developpement}
Notons $\Delta_{ij}$ le déterminant de la matrice obtenue en supprimant la ligne $i$ et la colonne $j$ de $A$ (le **mineur**), et $C_{ij} = (-1)^{i+j} \Delta_{ij}$ le **cofacteur**. Pour toute colonne $j$,
$$\det A = \sum_{i=1}^{n} a_{ij}\, C_{ij},$$
et de même pour toute ligne.
:::

::: proposition Comatrice et inverse {#prop-comatrice}
La **comatrice** $\operatorname{Com}(A) = (C_{ij})_{i,j}$ vérifie $A\, \operatorname{Com}(A)^{\top} = \operatorname{Com}(A)^{\top} A = \det(A)\, I_n$. Si $A$ est inversible, $A^{-1} = \frac{1}{\det A} \operatorname{Com}(A)^{\top}$.
:::

Pour $n = 2$ on retrouve la formule à connaître par cœur : $\begin{pmatrix} a & b \\ c & d \end{pmatrix}^{-1} = \frac{1}{ad - bc} \begin{pmatrix} d & -b \\ -c & a \end{pmatrix}$. Au-delà, la comatrice est un outil théorique, par exemple pour voir que les coefficients de $A^{-1}$ dépendent continûment de ceux de $A$ ; pour calculer, on utilise le pivot de Gauss.

::: exemple Déterminant de Vandermonde {#ex-vandermonde}
Pour $x_1, \ldots, x_n \in \mathbb{K}$,
$$V(x_1, \ldots, x_n) = \det \begin{pmatrix} 1 & x_1 & \cdots & x_1^{n-1} \\ 1 & x_2 & \cdots & x_2^{n-1} \\ \vdots & \vdots & & \vdots \\ 1 & x_n & \cdots & x_n^{n-1} \end{pmatrix} = \prod_{1 \le i < j \le n} (x_j - x_i).$$
Il est non nul si et seulement si les $x_i$ sont deux à deux distincts.
:::

Ce déterminant est la matrice de l'application $P \mapsto (P(x_1), \ldots, P(x_n))$ de $\mathbb{K}_{n-1}[X]$ dans $\mathbb{K}^n$ dans les bases canoniques : sa non-nullité redonne l'existence et l'unicité du polynôme d'interpolation de Lagrange, vue plus haut avec le théorème du rang. L'exercice complexe correspondant en demande la preuve.
