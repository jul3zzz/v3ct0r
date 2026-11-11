## Cardinal d'un ensemble fini {#cardinal}

Le dénombrement est introduit surtout pour les [[probabilites-finies|probabilités]] : dans un modèle uniforme, calculer une probabilité, c'est compter. Toute formalisation excessive est exclue : les propriétés les plus intuitives des cardinaux sont admises, et l'on raisonne par des choix successifs.

::: définition Cardinal {#def-cardinal}
Un ensemble $E$ est **fini** s'il est vide ou en bijection avec $\{1, \ldots, n\}$ pour un entier $n \ge 1$ ; cet entier, unique, est le **cardinal** de $E$, noté $|E|$ ou $\operatorname{Card}(E)$, et $|\varnothing| = 0$.
:::

::: proposition Cardinal d'une partie {#prop-partie}
Toute partie $A$ d'un ensemble fini $E$ est finie, et $|A| \le |E|$, avec égalité si et seulement si $A = E$.
:::

::: proposition Applications entre ensembles de même cardinal {#prop-meme-cardinal}
Soient $E$ et $F$ finis de **même cardinal** et $f : E \to F$. Alors $f$ est bijective si et seulement si elle est injective, si et seulement si elle est surjective.
:::

C'est le principe des tiroirs, sous une autre forme : si l'on range $n + 1$ chaussettes dans $n$ tiroirs, un tiroir en contient au moins deux, car une application de $\{1, \ldots, n + 1\}$ dans $\{1, \ldots, n\}$ n'est pas injective.

::: proposition Opérations sur les cardinaux {#prop-operations-card}
Pour des ensembles finis :

- $|A \cup B| = |A| + |B|$ si $A$ et $B$ sont **disjoints**, et en général $|A \cup B| = |A| + |B| - |A \cap B|$ ;
- $|E \setminus A| = |E| - |A|$ pour $A \subset E$, et $|A \setminus B| = |A| - |A \cap B|$ ;
- $|E \times F| = |E|\,|F|$, et plus généralement $|E_1 \times \cdots \times E_p| = |E_1| \cdots |E_p|$.
:::

La formule pour trois ensembles ou plus (formule du crible) est hors programme. Le produit cartésien traduit le **principe multiplicatif** : si un choix se fait en deux étapes, avec $a$ possibilités pour la première et $b$ pour la seconde (quel que soit le premier choix), il y a $ab$ choix au total.

::: proposition Applications, parties {#prop-applications-parties}
Si $|E| = p$ et $|F| = n$, l'ensemble $F^E$ des applications de $E$ dans $F$ a $n^p$ éléments. L'ensemble $\mathcal{P}(E)$ des parties de $E$ a $2^p$ éléments.
:::

Une application est la donnée d'une image pour chacun des $p$ éléments de $E$ : $n$ choix à chaque fois. Une partie $A$ de $E$ est déterminée par sa fonction indicatrice $\mathbf{1}_A$, application de $E$ dans $\{0, 1\}$ : d'où $2^p$.

## Listes et combinaisons {#listes-combinaisons}

Dans toute la suite, $E$ est un ensemble à $n$ éléments. Pour compter, on se demande d'abord si **l'ordre** compte et si les **répétitions** sont permises.

::: définition Listes, arrangements, permutations {#def-listes}
Une **$p$-liste** (ou $p$-uplet) d'éléments de $E$ est un élément $(x_1, \ldots, x_p)$ de $E^p$ : l'ordre compte, les répétitions sont permises. Une $p$-liste d'éléments **distincts** est aussi appelée arrangement. Une **permutation** de $E$ est une bijection de $E$ dans lui-même, ou, ce qui revient au même, une $n$-liste d'éléments distincts de $E$.
:::

::: proposition Nombre de listes {#prop-nombre-listes}
- Il y a $n^p$ $p$-listes d'éléments de $E$.
- Pour $0 \le p \le n$, il y a $n(n-1)\cdots(n - p + 1) = \frac{n!}{(n - p)!}$ $p$-listes d'éléments **distincts** ; c'est aussi le nombre d'applications **injectives** d'un ensemble à $p$ éléments dans $E$. Pour $p > n$, il n'y en a aucune.
- Il y a $n!$ permutations de $E$.
:::

Pour une liste d'éléments distincts, on choisit $x_1$ parmi $n$, puis $x_2$ parmi les $n - 1$ restants, etc. Exemple : il y a $10 \times 9 \times 8 = 720$ podiums possibles pour une course de dix coureurs.

::: définition Combinaisons {#def-combinaisons}
Une **$p$-combinaison** de $E$ est une partie de $E$ à $p$ éléments : l'ordre ne compte pas, il n'y a pas de répétition.
:::

::: proposition Nombre de combinaisons {#prop-nombre-combinaisons}
Pour $0 \le p \le n$, le nombre de parties à $p$ éléments d'un ensemble à $n$ éléments est
$$\binom{n}{p} = \frac{n!}{p!\,(n - p)!}.$$
:::

Chaque partie à $p$ éléments donne $p!$ listes d'éléments distincts, en ordonnant ses éléments de toutes les façons possibles : le nombre de parties est donc $\frac{n!}{(n-p)!}$ divisé par $p!$. Cette interprétation donne leur sens aux [[calculs-algebriques#def-binom|coefficients binomiaux]] définis par les factorielles.

::: méthode Démonstrations combinatoires {#meth-combinatoire}
On prouve une identité en **comptant de deux façons** un même ensemble.

- **Symétrie** $\binom np = \binom{n}{n-p}$ : choisir les $p$ éléments retenus, c'est choisir les $n - p$ exclus.
- **Pascal** $\binom np = \binom{n-1}{p-1} + \binom{n-1}{p}$ : on fixe $a \in E$ ; une partie à $p$ éléments contient $a$ (il reste $p - 1$ éléments à choisir parmi $n - 1$) ou ne le contient pas ($p$ éléments parmi $n - 1$).
- **Binôme** : en développant $(a + b)^n = (a + b)\cdots(a + b)$, le terme $a^k b^{n-k}$ apparaît autant de fois qu'il y a de façons de choisir les $k$ facteurs qui fournissent $a$, soit $\binom nk$.
- $\sum_{p=0}^{n}\binom np = 2^n$ : on compte toutes les parties de $E$, rangées selon leur cardinal.
:::

::: méthode Choisir le bon modèle {#meth-modele}
Tirer $p$ boules **successivement avec remise** parmi $n$ : $p$-listes, $n^p$ issues. **Successivement sans remise** : listes d'éléments distincts, $\frac{n!}{(n-p)!}$ issues. **Simultanément** : combinaisons, $\binom np$ issues. Pour des comptages plus complexes, on décompose en choix successifs et l'on vérifie que chaque objet est compté **une seule fois** ; si chacun l'est exactement $k$ fois, on divise par $k$.
:::

Exemple : les anagrammes du mot $\mathrm{ANANAS}$ s'obtiennent en choisissant les places des trois A ($\binom63 = 20$ façons), puis des deux N parmi les trois places restantes ($\binom32 = 3$), le S prenant la dernière : $60$ anagrammes, soit $\frac{6!}{3!\,2!\,1!}$.
