## L'anneau K[X] {#anneau}

Un polynôme est d'abord une **liste de coefficients** ; la fonction qu'il définit vient ensuite. Cette distinction, qui semble pédante, permet de dériver, de diviser et de factoriser des polynômes comme des nombres entiers, avec une arithmétique qui ressemble à celle de $\mathbb{Z}$. Le [[nombres-complexes#prop-factor|cours sur les complexes]] a ouvert le sujet pour les fonctions polynomiales. Dans tout ce cours, $\mathbb{K}$ désigne $\mathbb{R}$ ou $\mathbb{C}$.

::: définition Polynôme, degré, coefficient dominant {#def-polynome}
Un **polynôme** à coefficients dans $\mathbb{K}$ s'écrit $P = \sum_{k=0}^{n} a_k X^k$, avec $a_0, \ldots, a_n \in \mathbb{K}$ ; deux polynômes sont égaux si et seulement s'ils ont les mêmes coefficients. On note $\mathbb{K}[X]$ leur ensemble (sa construction est hors programme), et $\mathbb{K}_n[X]$ l'ensemble des polynômes de degré au plus $n$.

Si $P \neq 0$, son **degré** $\deg P$ est le plus grand $k$ tel que $a_k \neq 0$, et $a_{\deg P}$ est son **coefficient dominant** ; $P$ est **unitaire** si ce coefficient vaut $1$. Par convention, $\deg 0 = -\infty$.
:::

L'addition et la multiplication se font comme on l'imagine : $\left(\sum a_k X^k\right)\left(\sum b_l X^l\right) = \sum_m \big(\sum_{k + l = m} a_k b_l\big) X^m$. On compose aussi les polynômes : si $P = \sum a_k X^k$ et $Q \in \mathbb{K}[X]$, $P \circ Q = \sum a_k Q^k$, noté aussi $P(Q)$.

::: proposition Degré d'une somme, d'un produit {#prop-degre}
Pour $P, Q \in \mathbb{K}[X]$ :
$$\deg(P + Q) \le \max(\deg P, \deg Q), \qquad \deg(PQ) = \deg P + \deg Q.$$
En particulier, $PQ = 0$ implique $P = 0$ ou $Q = 0$ : l'anneau $\mathbb{K}[X]$ est **intègre**. Les polynômes inversibles sont les constantes non nulles.
:::

Le coefficient dominant de $PQ$ est le produit des coefficients dominants, non nul puisque $\mathbb{K}$ est un corps. Pour la somme, l'inégalité peut être stricte : $(X^2 + X) + (-X^2) = X$.

### Divisibilité et division euclidienne

::: définition Divisibilité {#def-divisibilite-p}
Soient $A, B \in \mathbb{K}[X]$. On dit que $A$ **divise** $B$, noté $A \mid B$, s'il existe $Q \in \mathbb{K}[X]$ tel que $B = AQ$. Deux polynômes sont **associés** si chacun divise l'autre ; cela revient à $B = \lambda A$ avec $\lambda \in \mathbb{K}^*$.
:::

::: théorème Division euclidienne {#thm-division}
Soient $A, B \in \mathbb{K}[X]$ avec $B \neq 0$. Il existe un unique couple $(Q, R)$ de polynômes tels que
$$A = BQ + R \qquad \text{et} \qquad \deg R < \deg B.$$
$Q$ est le **quotient** et $R$ le **reste** ; $B$ divise $A$ si et seulement si $R = 0$.
:::

::: preuve Division euclidienne
**Unicité** : si $BQ + R = BQ' + R'$, alors $B(Q - Q') = R' - R$. Le membre de droite est de degré $< \deg B$ ; si $Q \neq Q'$, celui de gauche est de degré $\ge \deg B$. Donc $Q = Q'$, puis $R = R'$.

**Existence**, par récurrence sur le degré de $A$ : si $\deg A < \deg B$, on prend $Q = 0$ et $R = A$. Sinon, soient $a X^n$ et $b X^p$ les termes dominants de $A$ et $B$ ($n \ge p$) ; le polynôme $A_1 = A - \frac{a}{b} X^{n-p} B$ est de degré $< n$, et s'écrit $BQ_1 + R$ par hypothèse de récurrence. Alors $A = B\big(Q_1 + \frac ab X^{n-p}\big) + R$.
:::

La preuve est l'algorithme que l'on pose « comme à l'école » : on élimine le terme dominant, puis on recommence. Exemple : $X^4 + 1 = (X^2 + X + 1)(X^2 - X) + X + 1$.

## Racines et relations coefficients-racines {#racines}

À un polynôme $P = \sum a_k X^k$ on associe la **fonction polynomiale** $\tilde P : x \mapsto \sum a_k x^k$ de $\mathbb{K}$ dans $\mathbb{K}$, que l'on note encore $P$. Un **zéro** ou **racine** de $P$ est un $a \in \mathbb{K}$ tel que $P(a) = 0$.

::: proposition Racine et divisibilité par X − a {#prop-racine-div}
Le reste de la division euclidienne de $P$ par $X - a$ est la constante $P(a)$. Par conséquent, $a$ est racine de $P$ si et seulement si $X - a$ divise $P$.
:::

Le reste est de degré $< 1$, donc constant : $P = (X - a)Q + c$, et l'évaluation en $a$ donne $c = P(a)$.

::: théorème Nombre de racines {#thm-nb-racines}
Un polynôme non nul de degré $n$ a au plus $n$ racines distinctes. En conséquence, un polynôme de $\mathbb{K}_n[X]$ qui s'annule en $n + 1$ points distincts est nul.
:::

Si $a_1, \ldots, a_k$ sont des racines distinctes de $P$, on factorise successivement : $(X - a_1)\cdots(X - a_k)$ divise $P$ (à chaque étape, $a_{j+1}$ est racine du quotient, puisque $a_{j+1} - a_i \neq 0$ et que $\mathbb{K}$ est intègre). Le degré de ce produit, $k$, est donc au plus $n$.

::: corollaire Un polynôme est déterminé par sa fonction {#cor-fonction}
Si deux polynômes $P$ et $Q$ prennent la même valeur en une infinité de points (en particulier, s'ils définissent la même fonction sur $\mathbb{K}$), alors $P = Q$. On peut donc **identifier les coefficients** de deux polynômes qui coïncident comme fonctions.
:::

C'est ce qui justifie l'identification des coefficients dans les calculs : si $\sum a_k x^k = \sum b_k x^k$ pour tout réel $x$, alors $a_k = b_k$ pour tout $k$.

::: méthode Méthode de Horner {#meth-horner}
Pour évaluer $P = a_n X^n + \cdots + a_1 X + a_0$ en $x$, on calcule
$$P(x) = \Big(\big((a_n x + a_{n-1})x + a_{n-2}\big)x + \cdots + a_1\Big)x + a_0,$$
soit $n$ multiplications et $n$ additions, au lieu d'environ $2n$ multiplications en calculant les puissances. Les valeurs intermédiaires sont les coefficients du quotient de $P$ par $X - x$.
:::

### Multiplicité et polynômes scindés

::: définition Multiplicité, polynôme scindé {#def-multiplicite}
Soit $P \neq 0$ et $a$ une racine de $P$. La **multiplicité** de $a$ est le plus grand entier $m$ tel que $(X - a)^m$ divise $P$ ; on parle de racine simple si $m = 1$, double si $m = 2$, etc.

Le polynôme $P$ est **scindé** sur $\mathbb{K}$ s'il s'écrit $P = c\prod_{i=1}^{k} (X - a_i)^{m_i}$ avec $c \in \mathbb{K}^*$ et $a_1, \ldots, a_k \in \mathbb{K}$ distincts ; alors $m_1 + \cdots + m_k = \deg P$.
:::

$X^2 + 1$ n'est pas scindé sur $\mathbb{R}$ (il n'a pas de racine réelle) mais l'est sur $\mathbb{C}$ : $X^2 + 1 = (X - i)(X + i)$.

::: proposition Relations entre coefficients et racines {#prop-viete}
Soit $P = a_n X^n + a_{n-1} X^{n-1} + \cdots + a_0$ un polynôme scindé de degré $n \ge 1$, et $x_1, \ldots, x_n$ ses racines, chacune répétée autant de fois que sa multiplicité. Alors $P = a_n \prod_{i=1}^{n}(X - x_i)$ et, pour $1 \le k \le n$,
$$\sigma_k = \sum_{1 \le i_1 < \cdots < i_k \le n} x_{i_1} \cdots x_{i_k} = (-1)^k\, \frac{a_{n-k}}{a_n}.$$
En particulier, $x_1 + \cdots + x_n = -\frac{a_{n-1}}{a_n}$ et $x_1 \cdots x_n = (-1)^n \frac{a_0}{a_n}$.
:::

On développe $\prod (X - x_i)$ : le coefficient de $X^{n-k}$ s'obtient en choisissant $-x_i$ dans $k$ facteurs et $X$ dans les autres. Pour $n = 2$, on retrouve [[nombres-complexes#prop-somme-produit|la somme et le produit des racines]]. Ces formules permettent de calculer des expressions **symétriques** des racines sans les connaître : $\sum x_i^2 = \sigma_1^2 - 2\sigma_2$ (exercice s2).

## Dérivation, Taylor et multiplicité {#derivation}

::: définition Dérivée formelle {#def-derivee-formelle}
La **dérivée** de $P = \sum_{k=0}^{n} a_k X^k$ est le polynôme $P' = \sum_{k=1}^{n} k a_k X^{k-1}$. On définit par récurrence les dérivées successives $P^{(j)}$.
:::

Pour $\mathbb{K} = \mathbb{R}$, la fonction polynomiale associée à $P'$ est la dérivée de la fonction associée à $P$ : la définition formelle prolonge le calcul de l'analyse, sans limite. Si $\deg P = n \ge 1$, $\deg P' = n - 1$, et $P^{(n+1)} = 0$.

::: proposition Règles de dérivation {#prop-leibniz-p}
La dérivation est linéaire, $(PQ)' = P'Q + PQ'$, et plus généralement
$$(PQ)^{(n)} = \sum_{k=0}^{n} \binom{n}{k} P^{(k)} Q^{(n-k)} \qquad \text{(formule de Leibniz)}.$$
:::

::: théorème Formule de Taylor polynomiale {#thm-taylor-p}
Pour $P \in \mathbb{K}[X]$ de degré au plus $n$ et $a \in \mathbb{K}$,
$$P = \sum_{k=0}^{n} \frac{P^{(k)}(a)}{k!}\,(X - a)^k.$$
:::

Par linéarité, il suffit de le vérifier pour $P = (X - a)^j$ (ces polynômes, $0 \le j \le n$, permettent d'écrire tout polynôme de degré au plus $n$, en développant $X^j = ((X - a) + a)^j$) : la dérivée $k$-ième de $(X - a)^j$ en $a$ vaut $j!$ si $k = j$ et $0$ sinon. La formule de Taylor donne les coefficients de $P$ **dans la base des puissances de $X - a$** : c'est un changement de centre.

::: théorème Multiplicité et dérivées successives {#thm-mult-derivees}
Soient $P \neq 0$, $a \in \mathbb{K}$ et $m \ge 1$. Le réel ou complexe $a$ est racine de $P$ de multiplicité **exactement** $m$ si et seulement si
$$P(a) = P'(a) = \cdots = P^{(m-1)}(a) = 0 \qquad \text{et} \qquad P^{(m)}(a) \neq 0.$$
:::

Par la formule de Taylor, $P = \sum_{k \ge 0} \frac{P^{(k)}(a)}{k!}(X - a)^k$, et $(X - a)^m$ divise $P$ exactement quand les $m$ premiers coefficients sont nuls. Ainsi une racine double est une racine commune à $P$ et $P'$ : graphiquement, pour $\mathbb{K} = \mathbb{R}$, le graphe est tangent à l'axe des abscisses.

## Factorisation et arithmétique {#factorisation}

::: théorème Théorème de d'Alembert-Gauss {#thm-dalembert-gauss}
Tout polynôme non constant de $\mathbb{C}[X]$ a au moins une racine dans $\mathbb{C}$.
:::

La démonstration est hors programme : toutes les preuves connues utilisent de l'analyse (continuité et minimum du module sur un disque, ou analyse complexe). Énoncé par d'Alembert en 1746, le théorème reçut de Gauss en 1799 une démonstration, encore incomplète au regard des exigences d'aujourd'hui.

::: théorème Factorisation dans ℂ[X] {#thm-factor-c}
Tout polynôme non constant de $\mathbb{C}[X]$ est scindé : il s'écrit de façon unique, à l'ordre près des facteurs,
$$P = c \prod_{i=1}^{k}(X - a_i)^{m_i}, \qquad c \in \mathbb{C}^*,\ a_i \text{ distincts},\ m_i \ge 1.$$
Les polynômes **irréductibles** de $\mathbb{C}[X]$ (ceux dont les seuls diviseurs sont les constantes non nulles et leurs associés) sont les polynômes de degré $1$. Un polynôme $A$ divise $B$ si et seulement si toute racine de $A$ est racine de $B$ avec une multiplicité au moins égale.
:::

Par récurrence sur le degré : d'Alembert-Gauss fournit une racine $a$, on factorise par $X - a$ et l'on recommence avec le quotient.

::: proposition Racines conjuguées d'un polynôme réel {#prop-conjuguees}
Si $P \in \mathbb{R}[X]$ et si $z \in \mathbb{C}$ est racine de $P$ de multiplicité $m$, alors $\overline{z}$ est aussi racine de $P$, de même multiplicité $m$.
:::

Les coefficients étant réels, $P(\overline{z}) = \overline{P(z)}$, et de même pour toutes les dérivées : on conclut par la caractérisation de la multiplicité par les dérivées.

::: théorème Factorisation dans ℝ[X] {#thm-factor-r}
Les polynômes irréductibles de $\mathbb{R}[X]$ sont les polynômes de degré $1$ et ceux de degré $2$ de discriminant strictement négatif. Tout polynôme non constant de $\mathbb{R}[X]$ s'écrit de façon unique (à l'ordre près)
$$P = c \prod_{i}(X - a_i)^{m_i} \prod_{j}\big(X^2 + p_j X + q_j\big)^{n_j},$$
avec $c \in \mathbb{R}^*$, les $a_i$ réels distincts et les $X^2 + p_j X + q_j$ distincts, à discriminant $p_j^2 - 4q_j < 0$.
:::

On factorise $P$ dans $\mathbb{C}[X]$ et l'on regroupe chaque racine non réelle $z$ avec sa conjuguée : $(X - z)(X - \overline{z}) = X^2 - 2\operatorname{Re}(z)X + |z|^2$ est réel, de discriminant $-4(\operatorname{Im} z)^2 < 0$.

::: exemple Factorisation de Xⁿ − 1 {#ex-xn-1}
Dans $\mathbb{C}[X]$, $X^n - 1 = \prod_{k=0}^{n-1}\big(X - e^{2ik\pi/n}\big)$, par les [[nombres-complexes#thm-racines-unite|racines n-ièmes de l'unité]]. Dans $\mathbb{R}[X]$, on groupe $e^{2ik\pi/n}$ et $e^{-2ik\pi/n}$ :
$$X^6 - 1 = (X - 1)(X + 1)(X^2 - X + 1)(X^2 + X + 1),$$
les deux derniers facteurs venant de $e^{\pm i\pi/3}$ et $e^{\pm 2i\pi/3}$, puisque $X^2 - 2\cos\theta\, X + 1 = (X - e^{i\theta})(X - e^{-i\theta})$.
:::

### Arithmétique de K[X] (MPSI, MP2I)

L'arithmétique de $\mathbb{K}[X]$ suit le plan de celle de $\mathbb{Z}$ ([[arithmetique]]) : la division euclidienne remplace celle des entiers, le degré joue le rôle de la valeur absolue. Cette partie est au programme de MPSI et MP2I seulement.

::: définition PGCD de deux polynômes {#def-pgcd-p}
Soient $A, B \in \mathbb{K}[X]$ non tous deux nuls. Un **PGCD** de $A$ et $B$ est un diviseur commun de degré maximal. Les diviseurs communs à $A$ et $B$ sont exactement les diviseurs de l'un de leurs PGCD ; tous les PGCD sont associés, et un seul est unitaire : on le note $A \wedge B$. Les polynômes $A$ et $B$ sont **premiers entre eux** si $A \wedge B = 1$.
:::

On calcule $A \wedge B$ par l'**algorithme d'Euclide** : si $A = BQ + R$, les diviseurs communs à $A$ et $B$ sont ceux de $B$ et $R$ ; on divise successivement, et le dernier reste non nul, rendu unitaire, est le PGCD.

::: théorème Bézout et Gauss pour les polynômes {#thm-bezout-p}
Soient $A, B$ non tous deux nuls.

- **Relation de Bézout** : il existe $U, V \in \mathbb{K}[X]$ tels que $AU + BV = A \wedge B$ ; on les obtient par l'algorithme d'Euclide étendu.
- **Théorème de Bézout** : $A$ et $B$ sont premiers entre eux si et seulement s'il existe $U, V$ tels que $AU + BV = 1$.
- **Lemme de Gauss** : si $A$ divise $BC$ et si $A \wedge B = 1$, alors $A$ divise $C$.

Dans $\mathbb{C}[X]$, deux polynômes sont premiers entre eux si et seulement s'ils n'ont aucune racine commune.
:::

## Interpolation et fractions rationnelles {#interpolation}

::: théorème Interpolation de Lagrange {#thm-lagrange}
Soient $x_1, \ldots, x_n \in \mathbb{K}$ **distincts** et $y_1, \ldots, y_n \in \mathbb{K}$. Il existe un unique polynôme $P \in \mathbb{K}_{n-1}[X]$ tel que $P(x_i) = y_i$ pour tout $i$ :
$$P = \sum_{i=1}^{n} y_i L_i, \qquad L_i = \prod_{j \neq i} \frac{X - x_j}{x_i - x_j}.$$
Les polynômes $Q$ tels que $Q(x_i) = y_i$ pour tout $i$ sont les $P + A\prod_{i=1}^{n}(X - x_i)$, $A \in \mathbb{K}[X]$.
:::

::: preuve Interpolation de Lagrange
Chaque $L_i$ est de degré $n - 1$ et vérifie $L_i(x_i) = 1$ et $L_i(x_j) = 0$ pour $j \neq i$ : le polynôme $P$ convient. Si $P_1$ convient aussi, $P - P_1$ est de degré au plus $n - 1$ et s'annule en $n$ points distincts : il est nul. Enfin $Q$ convient si et seulement si $Q - P$ s'annule en tous les $x_i$, c'est-à-dire s'il est divisible par $\prod (X - x_i)$, les $x_i$ étant distincts.
:::

L'interpolation de Lagrange (MPSI, MP2I) reconstruit un polynôme à partir de ses valeurs : par deux points passe une droite, par trois points d'abscisses distinctes une parabole (ou une droite). Elle est à la base de l'approximation numérique des fonctions et des méthodes de quadrature.

::: définition Fraction rationnelle, pôles {#def-fraction}
Une **fraction rationnelle** est un quotient $F = \frac{P}{Q}$ de polynômes, $Q \neq 0$ ; on note $\mathbb{K}(X)$ leur ensemble (construction hors programme), qui est un corps. Toute fraction a une **forme irréductible** $\frac PQ$ avec $P \wedge Q = 1$ et $Q$ unitaire. Les racines de $P$ sont les **zéros** de $F$, celles de $Q$ ses **pôles**, avec leurs multiplicités ; $\deg F = \deg P - \deg Q$. La **partie entière** de $F$ est le quotient $E$ de la division euclidienne de $P$ par $Q$.
:::

::: théorème Décomposition en éléments simples {#thm-des}
Soit $F = \frac{P}{Q}$ sous forme irréductible, avec $Q = \prod_{i}(X - a_i)^{m_i}$ scindé sur $\mathbb{K}$. Il existe une unique famille de scalaires $c_{i,k}$ telle que
$$F = E + \sum_{i} \sum_{k=1}^{m_i} \frac{c_{i,k}}{(X - a_i)^k},$$
où $E$ est la partie entière de $F$. Sur $\mathbb{R}$, les facteurs irréductibles $(X^2 + pX + q)^n$ de $Q$ ajoutent des termes $\frac{b_k X + c_k}{(X^2 + pX + q)^k}$, $1 \le k \le n$.
:::

La démonstration est hors programme. En PCSI et PTSI, la décomposition n'est pratiquée que dans des situations simples ; son usage principal est le **calcul de primitives** : chaque élément simple a une primitive connue.

::: méthode Coefficient d'un pôle simple {#meth-pole-simple}
Si $a$ est un pôle simple de $F = \frac PQ$, avec $Q = (X - a)Q_1$ et $Q_1(a) \neq 0$, le coefficient de $\frac{1}{X - a}$ dans la décomposition est
$$c = \frac{P(a)}{Q_1(a)} = \frac{P(a)}{Q'(a)}.$$
On multiplie $F$ par $X - a$ et l'on évalue en $a$ : tous les autres termes s'annulent. Exemple : $\frac{1}{X^2 - 1} = \frac{1/2}{X - 1} - \frac{1/2}{X + 1}$, d'où une primitive $\frac12\ln\left|\frac{x - 1}{x + 1}\right|$ de $\frac{1}{x^2 - 1}$ sur chaque intervalle où elle est définie.
:::

::: proposition Décomposition de P′/P {#prop-p-prime}
Si $P = c\prod_{i}(X - a_i)^{m_i}$ est scindé, avec des $a_i$ distincts, alors
$$\frac{P'}{P} = \sum_{i} \frac{m_i}{X - a_i}.$$
:::

C'est la « dérivée logarithmique » : on dérive le produit, puis on divise par $P$. Elle relie les racines d'un polynôme à celles de sa dérivée, et donne par exemple, pour $P$ scindé à racines simples, $\sum_i \frac{1}{x - a_i} = \frac{P'(x)}{P(x)}$ en tout $x$ qui n'est pas racine.
