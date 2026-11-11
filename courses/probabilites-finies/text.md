## Univers, événements, probabilités {#espaces}

Ce cours donne une pratique solide des variables aléatoires dans le cadre **fini**. On y décrit une expérience par des variables aléatoires plutôt que par la liste de ses issues : l'univers n'est qu'une source d'aléa suffisante. Les dénombrements nécessaires sont dans la fiche [[denombrement]]. La seconde année étendra tout au cas des univers infinis et des variables discrètes.

::: définition Univers, événements {#def-univers}
L'**univers** $\Omega$ est un ensemble fini non vide, l'ensemble des issues possibles ; un **événement** est une partie de $\Omega$, un événement **élémentaire** un singleton. Le vocabulaire ensembliste se traduit : $A \cup B$ (« $A$ ou $B$ »), $A \cap B$ (« $A$ et $B$ »), $\overline{A}$ (l'événement **contraire**) ; $A$ et $B$ sont **incompatibles** si $A \cap B = \varnothing$. Un **système complet d'événements** est une famille $(A_1, \ldots, A_m)$ d'événements deux à deux incompatibles dont la réunion est $\Omega$.
:::

::: définition Probabilité sur un univers fini {#def-probabilite}
Une **probabilité** sur $\Omega$ est une application $P : \mathcal{P}(\Omega) \to [0, 1]$ telle que $P(\Omega) = 1$ et $P(A \cup B) = P(A) + P(B)$ pour tous événements incompatibles $A$ et $B$. Le couple $(\Omega, P)$ est un **espace probabilisé fini**.
:::

::: proposition Une probabilité est déterminée par ses valeurs sur les singletons {#prop-distribution}
Une **distribution de probabilités** sur un ensemble fini $E$ est une famille $(p_x)_{x \in E}$ de réels positifs de somme $1$. Pour toute distribution $(p_\omega)_{\omega \in \Omega}$, il existe une unique probabilité $P$ sur $\Omega$ telle que $P(\{\omega\}) = p_\omega$ pour tout $\omega$, et alors $P(A) = \sum_{\omega \in A} p_\omega$.
:::

::: proposition Règles de calcul {#prop-proprietes-p}
Pour tous événements $A$ et $B$ :
$$P(\overline{A}) = 1 - P(A), \qquad P(A \setminus B) = P(A) - P(A \cap B),$$
$$P(A \cup B) = P(A) + P(B) - P(A \cap B),$$
et si $A \subset B$, $P(A) \le P(B)$. Si $(A_1, \ldots, A_m)$ est un système complet, $\sum_i P(A_i) = 1$.
:::

Pour plus de deux événements, la formule de la réunion se généralise (formule du crible), mais celle-ci est hors programme ; on passe souvent par le contraire : $P(A_1 \cup \cdots \cup A_m) = 1 - P(\overline{A_1} \cap \cdots \cap \overline{A_m})$.

::: définition Probabilité uniforme {#def-uniforme}
La probabilité **uniforme** sur $\Omega$ donne la même probabilité $\frac{1}{|\Omega|}$ à chaque issue. Alors $P(A) = \frac{|A|}{|\Omega|}$ : « nombre de cas favorables sur nombre de cas possibles ».
:::

Le choix du modèle est une affaire de modélisation : pour deux dés, l'univers $\{1, \ldots, 6\}^2$ muni de la probabilité uniforme (dés équilibrés, discernables) donne $P(\text{somme} = 7) = \frac{6}{36}$, alors que l'ensemble des sommes $\{2, \ldots, 12\}$ muni de la probabilité uniforme serait un mauvais modèle.

## Conditionnement et indépendance {#conditionnement}

::: définition Probabilité conditionnelle {#def-conditionnelle}
Soit $B$ un événement tel que $P(B) > 0$. La **probabilité de $A$ sachant $B$** est
$$P(A \mid B) = P_B(A) = \frac{P(A \cap B)}{P(B)}.$$
L'application $P_B$ est une probabilité sur $\Omega$. Par convention, on pose $P(A \mid B)P(B) = 0$ lorsque $P(B) = 0$.
:::

Conditionner, c'est restreindre l'univers à $B$ et renormaliser. Dans un modèle uniforme, $P(A \mid B) = \frac{|A \cap B|}{|B|}$.

::: théorème Formule des probabilités composées {#thm-composees}
Si $P(A_1 \cap \cdots \cap A_{m-1}) > 0$,
$$P(A_1 \cap \cdots \cap A_m) = P(A_1) \prod_{k=2}^{m} P(A_k \mid A_1 \cap \cdots \cap A_{k-1}),$$
c'est-à-dire $P(A_1)\,P(A_2 \mid A_1) \cdots P(A_m \mid A_1 \cap \cdots \cap A_{m-1})$.
:::

C'est la règle des **arbres** : on multiplie les probabilités le long d'une branche. Exemple : on tire successivement sans remise deux boules d'une urne contenant $3$ rouges et $2$ noires ; $P(R_1 \cap R_2) = \frac35 \cdot \frac24 = \frac{3}{10}$.

::: théorème Formule des probabilités totales {#thm-totales}
Si $(A_1, \ldots, A_m)$ est un système complet d'événements, pour tout événement $B$,
$$P(B) = \sum_{i=1}^{m} P(B \mid A_i)\,P(A_i).$$
:::

::: théorème Formule de Bayes {#thm-bayes}
Si $P(A) > 0$ et $P(B) > 0$, alors $P(A \mid B) = \frac{P(B \mid A)\,P(A)}{P(B)}$. Avec un système complet $(A_1, \ldots, A_m)$ :
$$P(A_j \mid B) = \frac{P(B \mid A_j)\,P(A_j)}{\sum_{i=1}^{m} P(B \mid A_i)\,P(A_i)}.$$
:::

La formule de Bayes « retourne » un conditionnement : elle passe de la probabilité d'un effet sachant la cause à celle de la cause sachant l'effet. Elle explique un paradoxe classique : un test fiable à $99\,\%$ pour une maladie rare donne une majorité de faux positifs (exercice s2).

::: définition Événements indépendants {#def-independance}
Deux événements $A$ et $B$ sont **indépendants** si $P(A \cap B) = P(A)P(B)$ ; si $P(B) > 0$, cela s'écrit $P(A \mid B) = P(A)$. Des événements $A_1, \ldots, A_m$ sont (mutuellement) **indépendants** si, pour toute partie $J \subset \{1, \ldots, m\}$, $P\big(\bigcap_{j \in J} A_j\big) = \prod_{j \in J} P(A_j)$. Si $A$ et $B$ sont indépendants, $A$ et $\overline{B}$ le sont aussi.
:::

::: remarque Indépendance deux à deux, indépendance mutuelle {#rem-deux-a-deux}
L'indépendance deux à deux n'entraîne pas l'indépendance mutuelle. On lance deux pièces équilibrées ; $A$ : « la première donne pile », $B$ : « la seconde donne pile », $C$ : « les deux pièces donnent le même résultat ». Chacun a probabilité $\frac12$, chaque intersection de deux d'entre eux probabilité $\frac14$, mais $P(A \cap B \cap C) = \frac14 \neq \frac18$ (exercice m2).
:::

## Variables aléatoires et lois {#variables}

::: définition Variable aléatoire, loi {#def-va}
Une **variable aléatoire** est une application $X : \Omega \to E$. Pour $A \subset E$, on note $\{X \in A\} = X^{-1}(A)$ et $P(X \in A)$ sa probabilité ; de même $P(X = x)$ et, pour $X$ réelle, $P(X \le x)$. La **loi** de $X$ est la probabilité $P_X : A \mapsto P(X \in A)$ sur $X(\Omega)$ ; elle est déterminée par la distribution $\big(P(X = x)\big)_{x \in X(\Omega)}$. On note $X \sim Y$ si $X$ et $Y$ ont même loi ; alors $f(X) \sim f(Y)$.
:::

::: définition Lois usuelles {#def-lois-usuelles}
- **Uniforme** sur un ensemble fini non vide $E$, notée $\mathcal{U}(E)$ : $P(X = x) = \frac{1}{|E|}$ pour tout $x \in E$.
- **Bernoulli** de paramètre $p \in [0, 1]$, notée $\mathcal{B}(p)$ : $P(X = 1) = p$ et $P(X = 0) = 1 - p$. C'est la loi de l'indicatrice d'un succès.
- **Binomiale** de paramètres $n \in \mathbb{N}^*$ et $p \in [0, 1]$, notée $\mathcal{B}(n, p)$ : $P(X = k) = \binom nk p^k (1 - p)^{n - k}$ pour $0 \le k \le n$.
:::

La somme des probabilités binomiales vaut $(p + 1 - p)^n = 1$ par la [[calculs-algebriques#thm-binome|formule du binôme]]. La **loi conditionnelle** de $X$ sachant un événement $A$ de probabilité non nulle est la loi de $X$ pour la probabilité $P_A$.

::: définition Couple de variables, loi conjointe, lois marginales {#def-couple}
Un couple $(X, Y)$ de variables aléatoires est une variable aléatoire à valeurs dans un produit. Sa loi est la **loi conjointe**, donnée par les $P(X = x, Y = y)$ ; les lois de $X$ et de $Y$ sont les **lois marginales** : $P(X = x) = \sum_{y} P(X = x, Y = y)$. On étend ces notions aux $n$-uplets.
:::

Les lois marginales ne déterminent pas la loi conjointe : si $X \sim \mathcal{B}(\frac12)$, les couples $(X, X)$ et $(X, 1 - X)$ ont les mêmes marginales et des lois conjointes différentes.

::: définition Variables aléatoires indépendantes {#def-va-independantes}
Deux variables $X$ et $Y$ sont **indépendantes** si, pour toutes parties $A$ et $B$, les événements $\{X \in A\}$ et $\{Y \in B\}$ sont indépendants ; cela équivaut à $P(X = x, Y = y) = P(X = x)P(Y = y)$ pour tous $x, y$. Des variables $X_1, \ldots, X_n$ sont indépendantes si $P(X_1 \in A_1, \ldots, X_n \in A_n) = \prod_i P(X_i \in A_i)$ pour toutes parties $A_i$.
:::

::: proposition Somme de Bernoulli indépendantes, coalitions {#prop-binomiale-somme}
Si $X_1, \ldots, X_n$ sont indépendantes de même loi $\mathcal{B}(p)$, alors $X_1 + \cdots + X_n \sim \mathcal{B}(n, p)$ : c'est le nombre de succès dans $n$ expériences indépendantes de probabilité de succès $p$. **Lemme des coalitions** : si $X_1, \ldots, X_n$ sont indépendantes, alors $f(X_1, \ldots, X_m)$ et $g(X_{m+1}, \ldots, X_n)$ le sont aussi.
:::

La modélisation de $n$ expériences aléatoires indépendantes par $n$ variables indépendantes est le cœur de la pratique : on ne construit pas l'univers, on suppose donnée une famille de variables indépendantes de lois prescrites.

## Espérance, variance, inégalités {#esperance}

::: définition Espérance {#def-esperance}
L'**espérance** d'une variable aléatoire réelle ou complexe $X$ est
$$E(X) = \sum_{x \in X(\Omega)} x\,P(X = x) = \sum_{\omega \in \Omega} X(\omega)\,P(\{\omega\}).$$
C'est un indicateur de position, la moyenne des valeurs pondérées par leurs probabilités. $X$ est **centrée** si $E(X) = 0$.
:::

::: proposition Propriétés de l'espérance {#prop-esperance}
L'espérance est **linéaire**, **positive** ($X \ge 0 \Rightarrow E(X) \ge 0$), **croissante**, et $|E(X)| \le E(|X|)$. Pour un événement $A$, $E(\mathbf{1}_A) = P(A)$. Si $X \sim \mathcal{B}(p)$, $E(X) = p$ ; si $X \sim \mathcal{B}(n, p)$, $E(X) = np$.
:::

La linéarité est l'outil le plus puissant : pour la binomiale, on écrit $X$ comme somme de $n$ indicatrices de succès, d'espérance $p$ chacune, sans calculer $\sum k\binom nk p^k(1-p)^{n-k}$. Elle ne suppose **aucune** indépendance (exercice m3).

::: théorème Formule de transfert {#thm-transfert}
Pour toute fonction $f$ définie sur $X(\Omega)$,
$$E\big(f(X)\big) = \sum_{x \in X(\Omega)} f(x)\,P(X = x).$$
Elle s'applique en particulier aux couples : $E\big(f(X, Y)\big) = \sum_{x, y} f(x, y)\,P(X = x, Y = y)$.
:::

On n'a donc pas besoin de la loi de $f(X)$ pour calculer son espérance : celle de $X$ suffit.

::: proposition Espérance d'un produit de variables indépendantes {#prop-esperance-produit}
Si $X$ et $Y$ sont indépendantes, $E(XY) = E(X)E(Y)$. La réciproque est fausse.
:::

::: définition Variance, écart type {#def-variance}
La **variance** d'une variable réelle $X$ est $V(X) = E\big((X - E(X))^2\big)$, et son **écart type** $\sigma(X) = \sqrt{V(X)}$ ; ce sont des indicateurs de dispersion. On a
$$V(X) = E(X^2) - E(X)^2 \quad \text{(formule de König-Huygens)},$$
$$V(aX + b) = a^2 V(X).$$
Si $\sigma(X) > 0$, la variable $\frac{X - E(X)}{\sigma(X)}$ est **centrée réduite**.
:::

::: définition Covariance {#def-covariance}
La **covariance** de deux variables réelles est $\operatorname{Cov}(X, Y) = E\big((X - E(X))(Y - E(Y))\big) = E(XY) - E(X)E(Y)$. Elle est nulle si $X$ et $Y$ sont indépendantes ; deux variables de covariance nulle sont dites **décorrélées**. De plus
$$V(X + Y) = V(X) + V(Y) + 2\operatorname{Cov}(X, Y),$$
et la variance d'une somme de variables deux à deux décorrélées est la somme des variances.
:::

::: proposition Variances usuelles {#prop-variances-usuelles}
Si $X \sim \mathcal{B}(p)$, $V(X) = p(1 - p)$. Si $X \sim \mathcal{B}(n, p)$, $V(X) = np(1 - p)$.
:::

Pour Bernoulli, $X^2 = X$, donc $V(X) = p - p^2$. Pour la binomiale, on écrit $X$ comme somme de $n$ Bernoulli indépendantes, donc décorrélées : les variances s'ajoutent.

::: théorème Inégalité de Markov {#thm-markov}
Si $X$ est une variable aléatoire réelle **positive**, pour tout $a > 0$,
$$P(X \ge a) \le \frac{E(X)}{a}.$$
:::

La preuve tient en une ligne : $a\mathbf{1}_{\{X \ge a\}} \le X$, et l'on prend l'espérance.

::: théorème Inégalité de Bienaymé-Tchebychev {#thm-bt}
Pour toute variable aléatoire réelle $X$ et tout $\varepsilon > 0$,
$$P\big(|X - E(X)| \ge \varepsilon\big) \le \frac{V(X)}{\varepsilon^2}.$$
:::

On applique Markov à la variable positive $(X - E(X))^2$ et à $a = \varepsilon^2$. L'inégalité est souvent grossière, mais elle est universelle : elle ne demande que l'espérance et la variance.

::: corollaire Loi faible des grands nombres, version finie {#cor-lfgn}
Soient $X_1, \ldots, X_n$ des variables indépendantes de même loi, d'espérance $m$ et de variance $\sigma^2$, et $\overline{X}_n = \frac{X_1 + \cdots + X_n}{n}$. Pour tout $\varepsilon > 0$,
$$P\big(|\overline{X}_n - m| \ge \varepsilon\big) \le \frac{\sigma^2}{n\varepsilon^2}.$$
:::

Avec des indicatrices d'un événement de probabilité $p$, $\overline{X}_n$ est la **fréquence** observée : elle s'écarte de $p$ de plus de $\varepsilon$ avec une probabilité qui tend vers $0$. C'est la justification de l'approche fréquentiste des probabilités, avec une estimation explicite du nombre d'expériences nécessaires (exercice c1).
