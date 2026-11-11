## Compléments sur les groupes {#groupes-2}

Cette fiche (MP, MPI) prolonge [[structures-algebriques]] et [[arithmetique]] : le calcul modulo $n$ devient un calcul dans un anneau, $\mathbb{Z}/n\mathbb{Z}$, et les groupes les plus simples, les groupes cycliques, se révèlent être tous des $\mathbb{Z}/n\mathbb{Z}$. Les groupes sont notés multiplicativement, de neutre $e$.

::: définition Sous-groupe engendré {#def-engendre}
Soit $G$ un groupe et $A \subset G$. L'intersection de tous les sous-groupes de $G$ contenant $A$ est un sous-groupe, le plus petit contenant $A$ : c'est le **sous-groupe engendré** par $A$, noté $\langle A\rangle$. Pour un élément $x$, $\langle x\rangle = \{x^k : k \in \mathbb{Z}\}$.
:::

::: définition Groupes monogènes et cycliques {#def-monogene}
Un groupe est **monogène** s'il est engendré par un seul élément, **cyclique** s'il est de plus fini. Exemples : $(\mathbb{Z}, +) = \langle 1\rangle$ ; $(\mathbb{U}_n, \times) = \langle e^{2i\pi/n}\rangle$ ; $(\mathbb{Z}/n\mathbb{Z}, +) = \langle \overline{1}\rangle$.
:::

::: définition Ordre d'un élément {#def-ordre-element}
Un élément $x$ de $G$ est d'**ordre fini** s'il existe $k \ge 1$ tel que $x^k = e$ ; son **ordre** est alors le plus petit tel $k$, égal au cardinal de $\langle x\rangle$. Dans ce cas, $x^m = e$ si et seulement si l'ordre de $x$ divise $m$.
:::

L'ensemble $\{m \in \mathbb{Z} : x^m = e\}$ est un [[structures-algebriques#def-sous-groupe|sous-groupe]] de $\mathbb{Z}$, donc de la forme $d\mathbb{Z}$ (les sous-groupes de $\mathbb{Z}$ sont les $n\mathbb{Z}$ : exercice c1 de la fiche Structures algébriques, ou le théorème sur les idéaux ci-dessous), où $d$ est l'ordre de $x$.

::: théorème Ordre d'un élément d'un groupe fini {#thm-ordre-divise}
Dans un groupe fini $G$, l'ordre de tout élément divise le cardinal de $G$. En particulier, $x^{|G|} = e$ pour tout $x \in G$.
:::

Le programme demande la preuve dans le cas **commutatif** : si $G = \{g_1, \ldots, g_n\}$, l'application $g \mapsto xg$ est une bijection de $G$, donc $\prod_i (xg_i) = \prod_i g_i$, soit $x^n\prod g_i = \prod g_i$ et $x^n = e$. Le cas général est le théorème de Lagrange.

::: proposition Structure des groupes monogènes {#prop-structure-monogene}
Un groupe monogène infini est isomorphe à $(\mathbb{Z}, +)$ ; un groupe cyclique de cardinal $n$ est isomorphe à $(\mathbb{Z}/n\mathbb{Z}, +)$. Les générateurs de $\mathbb{Z}/n\mathbb{Z}$ sont les $\overline{k}$ avec $k \wedge n = 1$.
:::

Si $G = \langle x\rangle$, le morphisme $k \mapsto x^k$ de $\mathbb{Z}$ sur $G$ a pour noyau $d\mathbb{Z}$, où $d$ est l'ordre de $x$ (ou $\{0\}$ si $x$ est d'ordre infini). Ainsi $\mathbb{U}_n$ est cyclique, et ses générateurs sont les racines **primitives** $e^{2ik\pi/n}$ avec $k \wedge n = 1$.

## Idéaux et anneaux ℤ/nℤ {#anneaux-zn}

::: définition Idéal {#def-ideal}
Un **idéal** d'un anneau commutatif $A$ est un sous-groupe $I$ de $(A, +)$ tel que $ax \in I$ pour tous $a \in A$ et $x \in I$. Le noyau d'un morphisme d'anneaux est un idéal. Pour $x \in A$, $xA = \{xa : a \in A\}$ est l'idéal engendré par $x$.
:::

::: théorème Idéaux de ℤ et de K[X] {#thm-ideaux}
Les idéaux de $\mathbb{Z}$ sont les $n\mathbb{Z}$, $n \in \mathbb{N}$. Les idéaux de $\mathbb{K}[X]$ sont les $P\,\mathbb{K}[X]$, où $P$ est nul ou unitaire, unique. Pour $a, b$ entiers, $a\mathbb{Z} + b\mathbb{Z} = (a \wedge b)\mathbb{Z}$ et $a\mathbb{Z} \cap b\mathbb{Z} = (a \vee b)\mathbb{Z}$.
:::

Ces deux énoncés reposent sur la division euclidienne ; ils redonnent la relation de Bézout. Le **polynôme minimal** d'un endomorphisme est le générateur unitaire de l'idéal de ses polynômes annulateurs ([[reduction]]).

::: définition L'anneau ℤ/nℤ {#def-zn}
Pour $n \ge 1$, on note $\mathbb{Z}/n\mathbb{Z}$ l'ensemble des classes de congruence modulo $n$, $\overline{a} = a + n\mathbb{Z}$. Les opérations $\overline{a} + \overline{b} = \overline{a + b}$ et $\overline{a}\,\overline{b} = \overline{ab}$ sont bien définies (elles ne dépendent pas des représentants), et font de $\mathbb{Z}/n\mathbb{Z}$ un anneau commutatif à $n$ éléments.
:::

La compatibilité des [[arithmetique#prop-congruences|congruences avec les opérations]] est exactement ce qui rend ces définitions correctes. L'application $a \mapsto \overline{a}$ est un morphisme d'anneaux surjectif de noyau $n\mathbb{Z}$.

::: théorème Inversibles de ℤ/nℤ, corps ℤ/pℤ {#thm-inversibles-zn}
La classe $\overline{a}$ est inversible dans $\mathbb{Z}/n\mathbb{Z}$ si et seulement si $a \wedge n = 1$. L'anneau $\mathbb{Z}/n\mathbb{Z}$ est un corps si et seulement si $n$ est premier ; on le note alors $\mathbb{F}_p$.
:::

L'inverse se calcule par l'algorithme d'Euclide étendu, comme dans [[arithmetique#meth-inverse-mod]]. Si $n = ab$ avec $1 < a, b < n$, alors $\overline{a}\,\overline{b} = \overline{0}$ : l'anneau n'est pas intègre.

::: définition Indicatrice d'Euler {#def-euler}
L'**indicatrice d'Euler** $\varphi(n)$ est le nombre d'entiers $k \in \{1, \ldots, n\}$ premiers avec $n$, c'est-à-dire le cardinal du groupe $(\mathbb{Z}/n\mathbb{Z})^\times$ des inversibles. Pour $p$ premier et $\alpha \ge 1$, $\varphi(p^\alpha) = p^\alpha - p^{\alpha - 1}$.
:::

::: théorème Théorème chinois {#thm-chinois}
Si $m$ et $n$ sont premiers entre eux, l'application $\overline{a} \mapsto (\dot{a}, \hat{a})$ (classes modulo $m$ et modulo $n$) est un isomorphisme d'anneaux de $\mathbb{Z}/mn\mathbb{Z}$ sur $\mathbb{Z}/m\mathbb{Z} \times \mathbb{Z}/n\mathbb{Z}$. En conséquence, le système $x \equiv a\ [m]$, $x \equiv b\ [n]$ a une solution, unique modulo $mn$, et $\varphi(mn) = \varphi(m)\varphi(n)$.
:::

L'injectivité vient de ce que $m$ et $n$ divisent $a$ implique $mn \mid a$ (Gauss) ; la surjectivité, de l'égalité des cardinaux. Une solution s'obtient par Bézout : si $mu + nv = 1$, alors $x = bmu + anv$ convient. On en tire $\varphi(n) = n\prod_{p \mid n}\left(1 - \frac1p\right)$.

::: théorème Théorème d'Euler {#thm-euler}
Si $a \wedge n = 1$, alors $a^{\varphi(n)} \equiv 1\ [n]$. Pour $n = p$ premier, on retrouve le [[arithmetique#thm-fermat|petit théorème de Fermat]].
:::

C'est le théorème sur l'ordre d'un élément, appliqué au groupe commutatif $(\mathbb{Z}/n\mathbb{Z})^\times$ de cardinal $\varphi(n)$. Il fonde le chiffrement RSA.

::: définition Algèbres {#def-algebre}
Une **$\mathbb{K}$-algèbre** est un ensemble muni d'une structure d'anneau et d'espace vectoriel sur $\mathbb{K}$, avec $\lambda(xy) = (\lambda x)y = x(\lambda y)$. Exemples : $\mathbb{K}[X]$, $\mathcal{M}_n(\mathbb{K})$, $\mathcal{L}(E)$, $\mathcal{F}(I, \mathbb{K})$. Les sous-algèbres et morphismes d'algèbres sont ceux qui respectent les trois lois et l'unité.
:::

Pour $u \in \mathcal{L}(E)$, l'application $P \mapsto P(u)$ est un morphisme d'algèbres de $\mathbb{K}[X]$ dans $\mathcal{L}(E)$ ; son image $\mathbb{K}[u]$ est une sous-algèbre commutative, et son noyau l'idéal des polynômes annulateurs.
