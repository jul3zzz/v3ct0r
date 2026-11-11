## Ensembles dénombrables et espaces probabilisés {#espaces-probabilises}

Le cours [[probabilites-finies]] se limitait aux univers finis. Lancer une pièce jusqu'au premier pile, compter les clients d'un guichet ou les désintégrations d'un atome demandent des univers infinis et des variables qui prennent une infinité de valeurs. On étend tout au cas **dénombrable**, avec les [[familles-sommables]] (ou les séries à termes positifs) comme outil de calcul.

::: définition Ensemble dénombrable {#def-denombrable}
Un ensemble est **dénombrable** s'il est en bijection avec $\mathbb{N}$ ; il est **au plus dénombrable** s'il est fini ou dénombrable, c'est-à-dire si l'on peut en énumérer les éléments en une suite.
:::

::: proposition Exemples d'ensembles dénombrables {#prop-denombrables}
$\mathbb{N}$, $\mathbb{Z}$, $\mathbb{N}^2$ et $\mathbb{Q}$ sont dénombrables ; un produit fini et une réunion au plus dénombrable d'ensembles au plus dénombrables le sont. L'ensemble $\mathbb{R}$ n'est pas dénombrable.
:::

Pour $\mathbb{N}^2$, on énumère par diagonales : $(0, 0), (1, 0), (0, 1), (2, 0), (1, 1), \ldots$ ; pour $\mathbb{Z}$, on alterne $0, 1, -1, 2, -2, \ldots$ La non-dénombrabilité de $\mathbb{R}$ (argument diagonal de Cantor) est admise.

::: définition Tribu, probabilité, espace probabilisé {#def-tribu}
Une **tribu** sur un ensemble $\Omega$ est une partie $\mathcal{A}$ de $\mathcal{P}(\Omega)$ qui contient $\Omega$, est stable par passage au complémentaire et par réunion **dénombrable** ; ses éléments sont les **événements**. Une **probabilité** sur $(\Omega, \mathcal{A})$ est une application $P : \mathcal{A} \to [0, 1]$ telle que $P(\Omega) = 1$ et, pour toute suite $(A_n)$ d'événements deux à deux incompatibles,
$$P\Big(\bigcup_{n=0}^{+\infty} A_n\Big) = \sum_{n=0}^{+\infty} P(A_n) \qquad (\sigma\text{-additivité}).$$
Le triplet $(\Omega, \mathcal{A}, P)$ est un **espace probabilisé**.
:::

Si $\Omega$ est au plus dénombrable, on prend $\mathcal{A} = \mathcal{P}(\Omega)$, et une probabilité est donnée par une famille $(p_\omega)$ de réels positifs de **somme** $1$, au sens des familles sommables. Toutes les règles du cas fini restent vraies : probabilité du contraire, d'une réunion de deux événements, croissance.

::: proposition Continuité monotone {#prop-continuite-monotone}
Si $(A_n)$ est une suite croissante d'événements, $P\big(\bigcup_n A_n\big) = \lim_n P(A_n)$. Si $(A_n)$ est décroissante, $P\big(\bigcap_n A_n\big) = \lim_n P(A_n)$. Pour toute suite d'événements, $P\big(\bigcup_n A_n\big) \le \sum_n P(A_n)$ (sous-additivité).
:::

Exemple : en lançant indéfiniment une pièce équilibrée, l'événement « n'obtenir que des faces » est inclus dans « faces aux $n$ premiers lancers », de probabilité $2^{-n}$ ; il est donc de probabilité nulle. Un événement de probabilité $1$ est **presque sûr**, un événement de probabilité nulle **négligeable** ; un événement négligeable n'est pas forcément vide.

::: théorème Probabilités totales et Bayes, cas dénombrable {#thm-totales-dn}
Si $(A_n)_{n \in \mathbb{N}}$ est un système complet d'événements (deux à deux incompatibles, de réunion $\Omega$), pour tout événement $B$, la série $\sum P(B \mid A_n)P(A_n)$ converge et
$$P(B) = \sum_{n=0}^{+\infty} P(B \mid A_n)\,P(A_n),$$
avec la convention $P(B \mid A_n)P(A_n) = 0$ si $P(A_n) = 0$. La [[probabilites-finies#thm-bayes|formule de Bayes]] s'étend de même.
:::

## Variables discrètes et lois usuelles {#lois-discretes}

::: définition Variable aléatoire discrète {#def-vad}
Une **variable aléatoire discrète** est une application $X : \Omega \to E$ telle que $X(\Omega)$ est au plus dénombrable et que $\{X = x\}$ est un événement pour tout $x \in X(\Omega)$. Sa **loi** est déterminée par la famille $\big(P(X = x)\big)_{x \in X(\Omega)}$, de somme $1$.
:::

::: définition Loi géométrique {#def-geometrique}
Pour $p \in\, ]0, 1[$, la variable $X$ suit la **loi géométrique** de paramètre $p$, notée $X \sim \mathcal{G}(p)$, si $X(\Omega) = \mathbb{N}^*$ et
$$P(X = k) = (1 - p)^{k-1}p \qquad (k \ge 1).$$
C'est la loi du **rang du premier succès** dans une suite d'épreuves de Bernoulli indépendantes de paramètre $p$. On a $P(X > n) = (1 - p)^n$.
:::

::: proposition Absence de mémoire {#prop-sans-memoire}
Si $X \sim \mathcal{G}(p)$, alors pour tous $n, k \in \mathbb{N}$, $P(X > n + k \mid X > n) = P(X > k)$. Réciproquement, une variable à valeurs dans $\mathbb{N}^*$ qui vérifie cette propriété, et $P(X = 1) \in\, ]0, 1[$, suit une loi géométrique.
:::

Avoir attendu $n$ épreuves sans succès ne rapproche pas du succès : $P(X > n + k \mid X > n) = \frac{(1-p)^{n+k}}{(1-p)^n} = (1 - p)^k$.

::: définition Loi de Poisson {#def-poisson}
Pour $\lambda > 0$, la variable $X$ suit la **loi de Poisson** de paramètre $\lambda$, notée $X \sim \mathcal{P}(\lambda)$, si $X(\Omega) = \mathbb{N}$ et
$$P(X = k) = e^{-\lambda}\frac{\lambda^k}{k!} \qquad (k \in \mathbb{N}).$$
:::

La somme vaut $e^{-\lambda}e^\lambda = 1$ par la série de l'exponentielle. La loi de Poisson est la **loi des événements rares** : nombre d'appels reçus en une heure, de fautes de frappe dans une page, de désintégrations en une seconde.

::: proposition Approximation de la loi binomiale {#prop-approximation-poisson}
Si $X_n \sim \mathcal{B}(n, p_n)$ avec $np_n \to \lambda > 0$, alors pour tout $k \in \mathbb{N}$,
$$P(X_n = k) \xrightarrow[n \to +\infty]{} e^{-\lambda}\frac{\lambda^k}{k!}.$$
:::

$\binom nk p_n^k(1 - p_n)^{n-k} = \frac{n(n-1)\cdots(n-k+1)}{n^k}\cdot\frac{(np_n)^k}{k!}\cdot(1 - p_n)^{n-k}$ ; le premier facteur tend vers $1$, le second vers $\frac{\lambda^k}{k!}$, et $(1 - p_n)^{n-k} = \exp\big((n - k)\ln(1 - p_n)\big) \to e^{-\lambda}$.

::: définition Indépendance, cas dénombrable {#def-independance-dn}
Des variables discrètes $X_1, \ldots, X_n$ sont indépendantes si $P(X_1 = x_1, \ldots, X_n = x_n) = \prod_i P(X_i = x_i)$ pour toutes valeurs $x_i$. Une **suite** $(X_n)$ est une suite de variables indépendantes si $X_1, \ldots, X_n$ le sont pour tout $n$. L'existence d'une suite de variables indépendantes de lois données est admise.
:::

## Espérance et variance {#esperance-discrete}

::: définition Espérance d'une variable discrète {#def-esperance-dn}
Une variable discrète réelle **positive** $X$ a pour espérance $E(X) = \sum_{x \in X(\Omega)} x\,P(X = x) \in [0, +\infty]$. Une variable discrète réelle ou complexe $X$ est **d'espérance finie** si la famille $\big(x\,P(X = x)\big)_{x \in X(\Omega)}$ est sommable ; son espérance est alors la somme de cette famille. La **formule de transfert** $E\big(f(X)\big) = \sum_x f(x)P(X = x)$ vaut dès que cette famille est sommable.
:::

La sommabilité garantit que la somme ne dépend pas de l'ordre d'énumération des valeurs. Linéarité, positivité, croissance restent vraies pour les variables d'espérance finie ; si $|X| \le Y$ et $E(Y) < +\infty$, $X$ est d'espérance finie.

::: proposition Espérances et variances usuelles {#prop-esperances-usuelles}
Si $X \sim \mathcal{G}(p)$ : $E(X) = \frac1p$ et $V(X) = \frac{1 - p}{p^2}$. Si $X \sim \mathcal{P}(\lambda)$ : $E(X) = V(X) = \lambda$.
:::

Pour Poisson, $E(X) = \sum_{k \ge 1} k e^{-\lambda}\frac{\lambda^k}{k!} = \lambda e^{-\lambda}\sum_{k \ge 1}\frac{\lambda^{k-1}}{(k-1)!} = \lambda$. Pour la loi géométrique, on dérive la série géométrique, ou l'on utilise la fonction génératrice (exercice m1).

::: proposition Variance, covariance et sommes {#prop-somme-independantes}
Si $X^2$ est d'espérance finie, $X$ l'est, et l'on définit $V(X) = E\big((X - E(X))^2\big) = E(X^2) - E(X)^2$. Si $X$ et $Y$ sont indépendantes et d'espérance finie, $XY$ l'est et $E(XY) = E(X)E(Y)$ ; si de plus elles ont une variance, $V(X + Y) = V(X) + V(Y)$. Plus généralement, $V(X + Y) = V(X) + V(Y) + 2\operatorname{Cov}(X, Y)$.
:::

## Fonctions génératrices et inégalités {#generatrices}

::: définition Fonction génératrice {#def-generatrice}
Pour une variable $X$ à valeurs dans $\mathbb{N}$, la **fonction génératrice** de $X$ est
$$G_X(t) = E\big(t^X\big) = \sum_{n=0}^{+\infty} P(X = n)\,t^n.$$
C'est la somme d'une série entière de rayon au moins $1$, qui converge normalement sur $[-1, 1]$, avec $G_X(1) = 1$.
:::

::: proposition La fonction génératrice détermine la loi et les moments {#prop-generatrice-moments}
- $G_X$ détermine la loi de $X$ : $P(X = n) = \frac{G_X^{(n)}(0)}{n!}$.
- $X$ est d'espérance finie si et seulement si $G_X$ est dérivable en $1$, et alors $E(X) = G'_X(1)$.
- Si $G_X$ est deux fois dérivable en $1$, $E\big(X(X - 1)\big) = G''_X(1)$ et $V(X) = G''_X(1) + G'_X(1) - G'_X(1)^2$.
:::

L'équivalence pour l'espérance utilise l'étude de la série entière au bord du disque de convergence ; les programmes l'énoncent sans exiger la démonstration. En pratique, quand le rayon est strictement supérieur à $1$, tout se déduit de la [[series-entieres]] dérivée terme à terme.

::: proposition Fonction génératrice d'une somme {#prop-generatrice-somme}
Si $X$ et $Y$ sont indépendantes à valeurs dans $\mathbb{N}$, alors $G_{X+Y} = G_X\,G_Y$ sur $[-1, 1]$.
:::

En effet $t^{X+Y} = t^Xt^Y$, et l'espérance d'un produit de variables indépendantes est le produit des espérances. Exemples : $G_X(t) = e^{\lambda(t - 1)}$ pour $\mathcal{P}(\lambda)$, donc la somme de deux variables de Poisson indépendantes de paramètres $\lambda$ et $\mu$ suit $\mathcal{P}(\lambda + \mu)$ (exercice m2) ; $G_X(t) = (1 - p + pt)^n$ pour $\mathcal{B}(n, p)$.

::: théorème Inégalités et loi faible des grands nombres {#thm-lfgn-dn}
Les inégalités de [[probabilites-finies#thm-markov|Markov]] et de [[probabilites-finies#thm-bt|Bienaymé-Tchebychev]] restent vraies pour des variables discrètes (d'espérance finie, respectivement de variance finie). Si $(X_n)$ est une suite de variables indépendantes de même loi, de variance finie, d'espérance $m$, et $S_n = X_1 + \cdots + X_n$, alors pour tout $\varepsilon > 0$,
$$P\left(\left|\frac{S_n}{n} - m\right| \ge \varepsilon\right) \le \frac{V(X_1)}{n\varepsilon^2} \xrightarrow[n \to +\infty]{} 0 \qquad \text{(loi faible des grands nombres)}.$$
:::

La moyenne empirique converge vers l'espérance, au sens où la probabilité d'un écart donné tend vers $0$. La loi **forte** (convergence presque sûre) et le théorème central limite dépassent le programme.
