## Divisibilité, PGCD, Bézout {#divisibilite}

Cette fiche (MPSI, MP2I) étudie la divisibilité des entiers et les congruences d'un point de vue élémentaire, sans le langage des structures algébriques : les anneaux $\mathbb{Z}/n\mathbb{Z}$ sont hors programme en première année. Tout repose sur la division euclidienne ; le même plan servira pour l'arithmétique des [[polynomes#factorisation|polynômes]].

::: définition Divisibilité {#def-divise}
Soient $a, b \in \mathbb{Z}$. On dit que $a$ **divise** $b$, noté $a \mid b$, s'il existe $k \in \mathbb{Z}$ tel que $b = ka$ ; $b$ est un **multiple** de $a$ et $a$ un **diviseur** de $b$. Deux entiers sont **associés** si chacun divise l'autre, c'est-à-dire s'ils ont la même valeur absolue.
:::

Tout entier divise $0$ ; $0$ ne divise que $0$. Si $a$ divise $b$ et $c$, il divise toute combinaison $ub + vc$ avec $u, v \in \mathbb{Z}$ : c'est le ressort de toutes les preuves qui suivent.

::: théorème Division euclidienne {#thm-div-euclide}
Soient $a \in \mathbb{Z}$ et $b \in \mathbb{N}^*$. Il existe un unique couple $(q, r) \in \mathbb{Z}^2$ tel que
$$a = bq + r \qquad \text{et} \qquad 0 \le r < b.$$
:::

On prend $q = \lfloor a/b \rfloor$ : alors $q \le \frac ab < q + 1$, d'où $0 \le a - bq < b$. Pour l'unicité, si $bq + r = bq' + r'$, alors $b|q - q'| = |r' - r| < b$, donc $q = q'$. Ainsi $b \mid a$ si et seulement si le reste est nul ; $-7 = 3 \times (-3) + 2$ (le reste est positif).

::: définition PGCD {#def-pgcd}
Soient $a, b \in \mathbb{N}$ non tous deux nuls. Leur **PGCD**, noté $a \wedge b$, est le plus grand (pour l'ordre usuel) des entiers naturels qui divisent à la fois $a$ et $b$. Pour $a, b \in \mathbb{Z}$, on pose $a \wedge b = |a| \wedge |b|$.
:::

::: proposition Diviseurs communs et PGCD {#prop-pgcd}
Les diviseurs communs à $a$ et $b$ sont exactement les diviseurs de $a \wedge b$ : le PGCD est aussi le plus grand diviseur commun **au sens de la divisibilité**. Pour $k \in \mathbb{N}^*$, $(ka) \wedge (kb) = k\,(a \wedge b)$.
:::

::: méthode Algorithme d'Euclide, étendu {#meth-euclide}
Si $a = bq + r$ est la division euclidienne de $a$ par $b > 0$, les diviseurs communs à $a$ et $b$ sont ceux de $b$ et $r$, donc $a \wedge b = b \wedge r$. On divise successivement ; les restes décroissent strictement, l'algorithme s'arrête, et **le dernier reste non nul est le PGCD**.

En remontant les divisions, on écrit le PGCD comme combinaison de $a$ et $b$ (**algorithme d'Euclide étendu**). Exemple : $1071 = 2 \times 462 + 147$, $462 = 3 \times 147 + 21$, $147 = 7 \times 21$ ; donc $1071 \wedge 462 = 21$, et $21 = 462 - 3 \times 147 = 7 \times 462 - 3 \times 1071$.
:::

::: théorème Relation et théorème de Bézout {#thm-bezout}
Pour tous entiers $a, b$ non tous deux nuls, il existe $u, v \in \mathbb{Z}$ tels que $au + bv = a \wedge b$ (**relation de Bézout**). En particulier, $a$ et $b$ sont **premiers entre eux** ($a \wedge b = 1$) si et seulement s'il existe $u, v \in \mathbb{Z}$ tels que $au + bv = 1$ (**théorème de Bézout**).
:::

L'existence vient de l'algorithme d'Euclide étendu. La réciproque du théorème est immédiate : un diviseur commun à $a$ et $b$ divise $au + bv = 1$. Attention, la relation $au + bv = d$ ne prouve pas que $d = a \wedge b$, sauf si $d = 1$ : on a $2 \times 2 + 3 \times 1 = 7$, et pourtant $2 \wedge 3 = 1$.

::: théorème Lemme de Gauss {#thm-gauss}
Si $a$ divise $bc$ et si $a \wedge b = 1$, alors $a$ divise $c$.
:::

::: preuve Lemme de Gauss
Par Bézout, $au + bv = 1$ pour des entiers $u, v$. En multipliant par $c$ : $c = acu + bcv$. Or $a$ divise $acu$ et $bc$, donc $a$ divise $c$.
:::

Conséquences : si $a$ et $b$ sont premiers entre eux et divisent $n$, alors $ab$ divise $n$ ; si $a$ et $b$ sont premiers à $n$, alors $ab$ est premier à $n$. Tout rationnel s'écrit de façon unique $\frac pq$ avec $q \in \mathbb{N}^*$ et $p \wedge q = 1$ (**forme irréductible**).

::: définition PPCM {#def-ppcm}
Pour $a, b \in \mathbb{Z}$ non nuls, le **PPCM** $a \vee b$ est le plus petit entier strictement positif multiple de $a$ et de $b$. Les multiples communs à $a$ et $b$ sont les multiples de $a \vee b$, et, pour $a, b \in \mathbb{N}^*$, $(a \wedge b)(a \vee b) = ab$.
:::

La notion s'étend à un nombre fini d'entiers : le PGCD de $a_1, \ldots, a_n$ vérifie une relation de Bézout $\sum a_i u_i = a_1 \wedge \cdots \wedge a_n$. Des entiers peuvent être **premiers entre eux dans leur ensemble** sans l'être **deux à deux** : $6$, $10$ et $15$ ont pour PGCD $1$, alors que deux quelconques d'entre eux ont un facteur commun.

## Nombres premiers et congruences {#premiers-congruences}

::: définition Nombre premier {#def-premier}
Un entier $p \ge 2$ est **premier** si ses seuls diviseurs positifs sont $1$ et $p$. Tout entier $n \ge 2$ a au moins un diviseur premier : son plus petit diviseur supérieur ou égal à $2$.
:::

Si $p$ est premier et ne divise pas $a$, alors $p \wedge a = 1$. Avec le lemme de Gauss : **si un nombre premier divise un produit $ab$, il divise $a$ ou $b$** (lemme d'Euclide). Le **crible d'Ératosthène** liste les premiers jusqu'à $N$ en barrant les multiples de $2$, puis de $3$, de $5$… ; il suffit d'aller jusqu'à $\sqrt N$, car un entier composé $n \le N$ a un facteur premier au plus $\sqrt n$.

::: théorème Infinité des nombres premiers {#thm-infinite}
L'ensemble des nombres premiers est infini.
:::

::: preuve Infinité des nombres premiers (Euclide)
Supposons par l'absurde qu'il n'y en ait qu'un nombre fini, $p_1, \ldots, p_k$. L'entier $N = p_1 p_2 \cdots p_k + 1 \ge 2$ a un diviseur premier $p$, qui est l'un des $p_i$. Alors $p$ divise $N$ et $p_1\cdots p_k$, donc leur différence $1$ : contradiction.
:::

::: théorème Décomposition en facteurs premiers {#thm-decomposition}
Tout entier $n \ge 2$ s'écrit $n = p_1^{\alpha_1} \cdots p_k^{\alpha_k}$, avec des nombres premiers $p_1 < \cdots < p_k$ et des exposants $\alpha_i \ge 1$, et cette écriture est **unique**.
:::

L'existence se prouve par récurrence forte : $n$ est premier, ou s'écrit $ab$ avec $2 \le a, b < n$. L'unicité vient du lemme d'Euclide : un premier qui divise un produit de premiers est l'un d'eux. Exemple : $360 = 2^3 \times 3^2 \times 5$.

::: définition Valuation p-adique {#def-valuation}
Pour $p$ premier et $n \in \mathbb{Z}^*$, la **valuation $p$-adique** $v_p(n)$ est l'exposant de $p$ dans la décomposition de $|n|$ (nul si $p$ ne divise pas $n$). On a $v_p(ab) = v_p(a) + v_p(b)$, et $a \mid b$ si et seulement si $v_p(a) \le v_p(b)$ pour tout premier $p$. Le PGCD et le PPCM s'en déduisent :
$$v_p(a \wedge b) = \min\big(v_p(a), v_p(b)\big), \qquad v_p(a \vee b) = \max\big(v_p(a), v_p(b)\big).$$
:::

Exemple : $360 = 2^3 \cdot 3^2 \cdot 5$ et $84 = 2^2 \cdot 3 \cdot 7$, donc $360 \wedge 84 = 2^2 \cdot 3 = 12$ et $360 \vee 84 = 2^3 \cdot 3^2 \cdot 5 \cdot 7 = 2520$.

### Congruences

::: définition Congruence modulo n {#def-congruence}
Soit $n \in \mathbb{N}^*$. Deux entiers $a$ et $b$ sont **congrus modulo $n$**, noté $a \equiv b\ [n]$, si $n$ divise $a - b$, c'est-à-dire s'ils ont le même reste dans la division euclidienne par $n$. C'est une relation d'équivalence sur $\mathbb{Z}$ ([[raisonnement-ensembles#def-equivalence]]).
:::

::: proposition Opérations sur les congruences {#prop-congruences}
Si $a \equiv b\ [n]$ et $c \equiv d\ [n]$, alors $a + c \equiv b + d\ [n]$ et $ac \equiv bd\ [n]$ ; en particulier $a^k \equiv b^k\ [n]$ pour tout $k \in \mathbb{N}$. En revanche, on ne peut pas « simplifier » : $2 \times 3 \equiv 2 \times 0\ [6]$ et $3 \not\equiv 0\ [6]$.
:::

On calcule ainsi de grandes puissances : modulo $7$, $3^3 = 27 \equiv -1$, donc $3^6 \equiv 1$ et $3^{2026} = (3^6)^{337}\cdot 3^4 \equiv 3^4 = 81 \equiv 4\ [7]$. Un entier est divisible par $9$ si et seulement si la somme de ses chiffres l'est, car $10 \equiv 1\ [9]$.

::: méthode Inverse modulo n, résoudre ax ≡ b [n] {#meth-inverse-mod}
Si $a \wedge n = 1$, la relation de Bézout $au + nv = 1$ donne $au \equiv 1\ [n]$ : $u$ est un **inverse de $a$ modulo $n$**. L'équation $ax \equiv b\ [n]$ équivaut alors à $x \equiv ub\ [n]$ (multiplier par $u$ dans un sens, par $a$ dans l'autre). Si $a \wedge n = d > 1$, l'équation n'a de solution que si $d$ divise $b$.
:::

::: théorème Petit théorème de Fermat {#thm-fermat}
Soit $p$ un nombre premier. Pour tout $a \in \mathbb{Z}$, $a^p \equiv a\ [p]$. Si de plus $p$ ne divise pas $a$, alors $a^{p-1} \equiv 1\ [p]$.
:::

La preuve classique utilise la divisibilité des coefficients binomiaux $\binom pk$ par $p$ (exercice c1). La réciproque est fausse : $341 = 11 \times 31$ n'est pas premier, et pourtant $2^{340} \equiv 1\ [341]$, puisque $2^{10} = 1024 = 3 \times 341 + 1$. Le petit théorème de Fermat est au cœur des tests de primalité et du chiffrement RSA.
