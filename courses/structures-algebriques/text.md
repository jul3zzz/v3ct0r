## Lois de composition et groupes {#groupes}

Cette fiche (MPSI, MP2I) introduit le vocabulaire des groupes, anneaux et corps, pour traiter d'un seul coup des situations que l'on rencontre partout : les nombres, les matrices, les permutations, les racines de l'unité. On évite les lois artificielles : chaque notion est illustrée par des exemples qui serviront.

::: définition Loi de composition interne {#def-loi}
Une **loi de composition interne** sur un ensemble $E$ est une application $E \times E \to E$, notée $(x, y) \mapsto x \star y$. Elle est :

- **associative** si $(x \star y) \star z = x \star (y \star z)$ pour tous $x, y, z$ ;
- **commutative** si $x \star y = y \star x$ pour tous $x, y$ ;
- elle a un **élément neutre** $e$ si $x \star e = e \star x = x$ pour tout $x$.

Si $e$ est neutre, $x$ est **inversible** (ou symétrisable) s'il existe $x'$ avec $x \star x' = x' \star x = e$. Une partie $F \subset E$ est **stable** si $x \star y \in F$ pour tous $x, y \in F$. Une seconde loi $\times$ est **distributive** sur $+$ si $x \times (y + z) = x \times y + x \times z$ et $(y + z) \times x = y \times x + z \times x$.
:::

::: proposition Unicité du neutre et de l'inverse {#prop-neutre}
Un élément neutre, s'il existe, est unique. Si la loi est associative, l'inverse d'un élément inversible est unique, et si $x$ et $y$ sont inversibles, $x \star y$ l'est, d'inverse $y' \star x'$ (l'ordre s'inverse).
:::

Si $e$ et $e'$ sont neutres, $e = e \star e' = e'$. Si $x'$ et $x''$ sont deux inverses de $x$, l'associativité donne $x' = x' \star (x \star x'') = (x' \star x) \star x'' = x''$.

::: définition Groupe {#def-groupe}
Un **groupe** est un ensemble $G$ muni d'une loi interne associative, ayant un élément neutre, et pour laquelle tout élément est inversible. Il est **commutatif** (ou abélien) si la loi l'est. En notation multiplicative, on note $xy$, $1$ ou $e$ le neutre, $x^{-1}$ l'inverse et $x^n$ les puissances ; en notation additive (réservée aux groupes commutatifs), $x + y$, $0$, $-x$ et $nx$.
:::

::: exemple Groupes usuels {#ex-groupes}
- Les groupes additifs $\mathbb{Z}$, $\mathbb{Q}$, $\mathbb{R}$, $\mathbb{C}$ ; les groupes multiplicatifs $\mathbb{Q}^*$, $\mathbb{Q}^*_+$, $\mathbb{R}^*$, $\mathbb{R}^*_+$, $\mathbb{C}^*$, et le cercle $\mathbb{U}$ et les racines $n$-ièmes de l'unité $\mathbb{U}_n$ ([[nombres-complexes#thm-racines-unite]]).
- Le groupe $\mathcal{S}_X$ des **permutations** (bijections) d'un ensemble $X$, pour la composition ; il n'est pas commutatif dès que $X$ a au moins trois éléments.
- Le **groupe produit** $G \times H$ de deux groupes, avec la loi $(g, h)(g', h') = (gg', hh')$.
- Contre-exemples : $(\mathbb{N}, +)$ n'est pas un groupe ($1$ n'a pas d'opposé dans $\mathbb{N}$), ni $(\mathbb{Z}, \times)$ ($2$ n'a pas d'inverse dans $\mathbb{Z}$).
:::

::: définition Sous-groupe {#def-sous-groupe}
Une partie $H$ d'un groupe $G$ est un **sous-groupe** si elle contient le neutre, est stable par la loi et par passage à l'inverse ; c'est alors un groupe pour la loi induite. **Caractérisation** : $H$ est un sous-groupe si et seulement si $H \neq \varnothing$ et $xy^{-1} \in H$ pour tous $x, y \in H$.
:::

Pour montrer qu'un ensemble muni d'une loi est un groupe, il est souvent plus simple de montrer que c'est un **sous-groupe** d'un groupe connu : associativité et neutre sont alors hérités. Ainsi $\mathbb{U}_n$ est un sous-groupe de $\mathbb{U}$, lui-même sous-groupe de $(\mathbb{C}^*, \times)$ ; les $n\mathbb{Z}$ sont des sous-groupes de $(\mathbb{Z}, +)$, et ce sont les seuls (exercice c1).

::: définition Morphisme de groupes, noyau, image {#def-morphisme}
Une application $f : G \to G'$ entre deux groupes est un **morphisme** si $f(xy) = f(x)f(y)$ pour tous $x, y \in G$. Alors $f(e) = e'$ et $f(x^{-1}) = f(x)^{-1}$. L'image directe et l'image réciproque d'un sous-groupe par un morphisme sont des sous-groupes ; en particulier le **noyau** $\operatorname{Ker} f = f^{-1}(\{e'\})$ et l'**image** $\operatorname{Im} f = f(G)$. Un morphisme bijectif est un **isomorphisme** ; sa réciproque est aussi un morphisme.
:::

Exemples : $\exp : (\mathbb{R}, +) \to (\mathbb{R}^*_+, \times)$ est un isomorphisme, de réciproque $\ln$ : il transforme les sommes en produits. L'application $t \mapsto e^{it}$ est un morphisme surjectif de $(\mathbb{R}, +)$ sur $(\mathbb{U}, \times)$, de noyau $2\pi\mathbb{Z}$.

::: proposition Injectivité et noyau {#prop-noyau}
Un morphisme de groupes $f$ est injectif si et seulement si $\operatorname{Ker} f = \{e\}$.
:::

::: preuve Injectivité et noyau
Si $f$ est injective et $f(x) = e' = f(e)$, alors $x = e$. Réciproquement, si $\operatorname{Ker} f = \{e\}$ et $f(x) = f(y)$, alors $f(xy^{-1}) = f(x)f(y)^{-1} = e'$, donc $xy^{-1} = e$ et $x = y$.
:::

## Anneaux et corps {#anneaux-corps}

::: définition Anneau {#def-anneau}
Un **anneau** est un ensemble $A$ muni de deux lois $+$ et $\times$ telles que $(A, +)$ soit un groupe commutatif, que $\times$ soit associative, distributive sur $+$, et ait un élément neutre $1$ (dans ce cours, **tout anneau est unitaire**). L'anneau est commutatif si $\times$ l'est.
:::

Exemples : $\mathbb{Z}$, $\mathbb{Q}$, $\mathbb{R}$, $\mathbb{C}$, l'anneau $\mathbb{K}[X]$ des [[polynomes#anneau|polynômes]], l'anneau $\mathcal{F}(\mathbb{R}, \mathbb{R})$ des fonctions réelles, et l'anneau non commutatif $\mathcal{M}_n(\mathbb{K})$ des [[calcul-matriciel#carrees|matrices carrées]].

::: proposition Calcul dans un anneau {#prop-calcul-anneau}
Dans un anneau $A$, pour tous $a, b$ : $0 \times a = a \times 0 = 0$, $(-a)b = a(-b) = -(ab)$. Si $a$ et $b$ **commutent**, pour tout $n \in \mathbb{N}$,
$$(a + b)^n = \sum_{k=0}^{n}\binom nk a^k b^{n-k}, \qquad a^n - b^n = (a - b)\sum_{k=0}^{n-1} a^k b^{n-1-k}.$$
:::

La règle $0 \times a = 0$ vient de la distributivité : $0 \times a = (0 + 0) \times a = 0 \times a + 0 \times a$, puis on simplifie dans le groupe $(A, +)$. Le binôme se démontre comme dans [[calculs-algebriques#thm-binome]].

::: définition Groupe des inversibles {#def-inversibles}
Un élément $a$ d'un anneau $A$ est **inversible** s'il existe $b \in A$ tel que $ab = ba = 1$. L'ensemble $A^\times$ des inversibles est un groupe pour $\times$, le **groupe des inversibles** de $A$.
:::

Exemples : $\mathbb{Z}^\times = \{-1, 1\}$ ; $\mathbb{K}[X]^\times$ est l'ensemble des constantes non nulles ; le groupe des inversibles de $\mathcal{M}_n(\mathbb{K})$ est le groupe linéaire $\mathrm{GL}_n(\mathbb{K})$.

::: définition Anneau intègre, corps {#def-corps}
Un anneau **commutatif** $A$ non réduit à $\{0\}$ est **intègre** si $ab = 0$ implique $a = 0$ ou $b = 0$ : on peut alors simplifier, $ab = ac$ et $a \neq 0$ entraînent $b = c$. C'est un **corps** si tout élément non nul est inversible ; dans ce programme, les corps sont commutatifs.
:::

Un corps est intègre : si $ab = 0$ et $a \neq 0$, alors $b = a^{-1}ab = 0$. L'anneau $\mathbb{Z}$ est intègre sans être un corps ; $\mathbb{Q}$, $\mathbb{R}$ et $\mathbb{C}$ sont des corps ; $\mathbb{K}[X]$ est intègre ; $\mathcal{M}_n(\mathbb{K})$ ($n \ge 2$) n'est pas intègre, ni d'ailleurs commutatif, et $\mathcal{F}(\mathbb{R}, \mathbb{R})$ n'est pas intègre (deux fonctions non nulles à supports disjoints ont un produit nul).

::: définition Sous-anneau, morphisme d'anneaux {#def-sous-anneau}
Une partie $B$ d'un anneau $A$ est un **sous-anneau** si elle contient $1$, et est stable par différence et par produit. Une application $f : A \to A'$ entre deux anneaux est un **morphisme d'anneaux** si $f(a + b) = f(a) + f(b)$, $f(ab) = f(a)f(b)$ et $f(1) = 1$ ; un **isomorphisme** s'il est de plus bijectif.
:::

La conjugaison $z \mapsto \overline{z}$ est un isomorphisme de l'anneau $\mathbb{C}$ sur lui-même, qui fixe chaque réel. L'ensemble $\mathbb{Z}[i] = \{a + ib : a, b \in \mathbb{Z}\}$ des entiers de Gauss est un sous-anneau de $\mathbb{C}$ ; l'ensemble $\{a + b\sqrt2 : a, b \in \mathbb{Q}\}$ est même un sous-corps de $\mathbb{R}$ (exercice m1).
