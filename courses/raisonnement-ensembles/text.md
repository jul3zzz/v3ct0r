## Logique et raisonnements {#logique}

Cette fiche rassemble le vocabulaire et les raisonnements qui servent à **rédiger** une démonstration. Le programme se limite aux notions de base : toute étude systématique de la logique ou de la théorie des ensembles est hors programme. Les quantificateurs ne sont pas des abréviations : dans une phrase rédigée, on écrit « pour tout » et « il existe » en toutes lettres.

::: définition Quantificateurs et négation {#def-negation}
« $\forall x \in E,\ P(x)$ » signifie que $P(x)$ est vraie pour tout élément $x$ de $E$ ; « $\exists x \in E,\ P(x)$ », qu'elle l'est pour au moins un. La **négation** échange les deux quantificateurs et nie la propriété :
$$\operatorname{non}\big(\forall x \in E,\ P(x)\big) \iff \exists x \in E,\ \operatorname{non} P(x),$$
$$\operatorname{non}\big(\exists x \in E,\ P(x)\big) \iff \forall x \in E,\ \operatorname{non} P(x).$$
:::

L'**ordre** des quantificateurs compte : « $\forall x \in \mathbb{R},\ \exists y \in \mathbb{R},\ y > x$ » est vrai (prendre $y = x + 1$), mais « $\exists y \in \mathbb{R},\ \forall x \in \mathbb{R},\ y > x$ » est faux. Pour nier une phrase à plusieurs quantificateurs, on applique la règle de gauche à droite. La négation de la [[suites-series#def-limite|définition de la limite]] « $\forall \varepsilon > 0,\ \exists N,\ \forall n \ge N,\ |u_n - \ell| \le \varepsilon$ » est : « il existe $\varepsilon > 0$ tel que, pour tout $N$, il existe $n \ge N$ avec $|u_n - \ell| > \varepsilon$ ».

::: proposition Implication, contraposée, équivalence {#prop-contraposee}
L'implication « $P \implies Q$ » est fausse dans le seul cas où $P$ est vraie et $Q$ fausse. Elle équivaut à sa **contraposée** « $\operatorname{non} Q \implies \operatorname{non} P$ », mais pas à sa **réciproque** « $Q \implies P$ ». Sa négation est « $P$ et $\operatorname{non} Q$ ». L'équivalence « $P \iff Q$ » signifie que l'implication et sa réciproque sont vraies.
:::

Dans « $P \implies Q$ », on dit que $P$ est une **condition suffisante** de $Q$, et $Q$ une **condition nécessaire** de $P$. « $n$ est multiple de $4$ » est une condition suffisante, non nécessaire, pour que $n$ soit pair.

::: méthode Les modes de raisonnement {#meth-raisonnements}
- **Par contraposition** : pour montrer $P \implies Q$, supposer $\operatorname{non} Q$ et en déduire $\operatorname{non} P$.
- **Par l'absurde** : supposer le contraire de ce que l'on veut prouver et aboutir à une contradiction. Exemple : l'[[arithmetique#thm-infinite|infinité des nombres premiers]], ou l'irrationalité de $\sqrt2$.
- **Par disjonction des cas** : découper la situation en cas qui couvrent toutes les possibilités (par exemple $n$ pair, $n$ impair) et conclure dans chacun.
- **Par analyse-synthèse**, pour déterminer les objets vérifiant une propriété : l'**analyse** suppose qu'un objet convient et en déduit des conditions nécessaires, qui le déterminent souvent ; la **synthèse** vérifie que les candidats ainsi trouvés conviennent.
- **Par contre-exemple**, pour montrer qu'une propriété universelle est fausse : un seul exemple qui la met en défaut suffit.
:::

L'analyse-synthèse prouve à la fois l'existence et l'unicité : l'analyse donne l'unicité (il y a au plus le candidat trouvé), la synthèse donne l'existence. L'exemple type est la décomposition d'une fonction en partie paire et partie impaire (exercice m1).

::: théorème Raisonnement par récurrence {#thm-recurrence}
Soit $P(n)$ une propriété de l'entier naturel $n$ et $n_0 \in \mathbb{N}$.

- **Récurrence simple** : si $P(n_0)$ est vraie et si, pour tout $n \ge n_0$, $P(n) \implies P(n + 1)$, alors $P(n)$ est vraie pour tout $n \ge n_0$.
- **Récurrence double** : si $P(n_0)$ et $P(n_0 + 1)$ sont vraies et si, pour tout $n \ge n_0$, ($P(n)$ et $P(n + 1)$) $\implies P(n + 2)$, alors $P(n)$ est vraie pour tout $n \ge n_0$.
- **Récurrence forte** : si $P(n_0)$ est vraie et si, pour tout $n \ge n_0$, ($P(n_0)$, …, $P(n)$ toutes vraies) $\implies P(n + 1)$, alors $P(n)$ est vraie pour tout $n \ge n_0$.
:::

Ces principes reposent sur une propriété de $\mathbb{N}$ que l'on admet : **toute partie non vide de $\mathbb{N}$ a un plus petit élément**. Si $P$ était fausse pour un $n \ge n_0$, le plus petit tel $n$ contredirait l'hérédité. La récurrence double sert pour les suites $u_{n+2} = a u_{n+1} + b u_n$ ; la récurrence forte, pour la décomposition en facteurs premiers. Une récurrence se rédige en trois temps : l'énoncé de $P(n)$, l'initialisation, l'hérédité.

## Ensembles, applications, relations {#ensembles-applications}

::: définition Parties d'un ensemble, opérations {#def-operations-ens}
Une **partie** (ou sous-ensemble) $A$ de $E$ est un ensemble dont tous les éléments sont dans $E$ : $A \subset E$. L'ensemble des parties de $E$ se note $\mathcal{P}(E)$. Pour $A, B \subset E$ : la **réunion** $A \cup B$, l'**intersection** $A \cap B$, la **différence** $A \setminus B = \{x \in A : x \notin B\}$ et le **complémentaire** $\overline{A} = E \setminus A$. Le **produit cartésien** $E \times F$ est l'ensemble des couples $(x, y)$ avec $x \in E$ et $y \in F$.
:::

Deux ensembles sont égaux s'ils ont les mêmes éléments ; on montre $A = B$ par **double inclusion**, $A \subset B$ et $B \subset A$. Par exemple, $\mathcal{P}(\{1, 2\}) = \{\varnothing, \{1\}, \{2\}, \{1, 2\}\}$ a $4$ éléments ; plus généralement, $\mathcal{P}(E)$ a $2^n$ éléments si $E$ en a $n$.

::: proposition Lois de De Morgan, distributivité {#prop-morgan}
Pour $A, B, C \subset E$ :
$$\overline{A \cup B} = \overline{A} \cap \overline{B}, \qquad \overline{A \cap B} = \overline{A} \cup \overline{B},$$
$$A \cap (B \cup C) = (A \cap B) \cup (A \cap C).$$
:::

Les lois de De Morgan sont la version ensembliste de la négation : « ne pas être dans $A$ ou $B$ », c'est n'être ni dans $A$ ni dans $B$.

::: définition Recouvrement disjoint, partition {#def-partition}
Une famille $(A_i)_{i \in I}$ de parties de $E$ est un **recouvrement disjoint** de $E$ si les $A_i$ sont deux à deux disjoints et ont pour réunion $E$ ; c'est une **partition** si de plus aucun $A_i$ n'est vide.
:::

### Applications

::: définition Application, images directe et réciproque {#def-application}
Une **application** $f : E \to F$ associe à tout élément $x$ de $E$ un unique élément $f(x)$ de $F$ ; son **graphe** est $\{(x, f(x)) : x \in E\} \subset E \times F$. On note $\mathcal{F}(E, F)$ ou $F^E$ l'ensemble de ces applications. Pour $A \subset E$ et $B \subset F$ :
$$f(A) = \{f(x) : x \in A\} \quad \text{(image directe)},$$
$$f^{-1}(B) = \{x \in E : f(x) \in B\} \quad \text{(image réciproque)}.$$
La **fonction indicatrice** de $A \subset E$ est $\mathbf{1}_A$, égale à $1$ sur $A$ et à $0$ ailleurs.
:::

La notation $f^{-1}(B)$ ne suppose pas $f$ bijective : l'image réciproque existe toujours. Pour $f = \cos$ et $B = \{0\}$, $f^{-1}(\{0\}) = \frac{\pi}{2} + \pi\mathbb{Z}$.

::: définition Injection, surjection, bijection {#def-injection}
L'application $f : E \to F$ est :

- **injective** si deux éléments distincts ont des images distinctes : $\forall x, x' \in E,\ f(x) = f(x') \implies x = x'$ ;
- **surjective** si tout élément de $F$ a au moins un antécédent : $\forall y \in F,\ \exists x \in E,\ f(x) = y$ ;
- **bijective** si elle est injective et surjective : tout $y \in F$ a un unique antécédent, noté $f^{-1}(y)$. L'application $f^{-1} : F \to E$ est la **réciproque** de $f$, caractérisée par $f^{-1} \circ f = \mathrm{id}_E$ et $f \circ f^{-1} = \mathrm{id}_F$.
:::

Exemples : $x \mapsto x^2$ n'est ni injective ni surjective de $\mathbb{R}$ dans $\mathbb{R}$, mais c'est une bijection de $\mathbb{R}_+$ sur $\mathbb{R}_+$, de réciproque la racine carrée. Pour montrer qu'une application est bijective, on peut résoudre l'équation $f(x) = y$ d'inconnue $x$ : si elle a une unique solution pour tout $y$, on obtient du même coup $f^{-1}$.

::: proposition Composées d'injections, de surjections, de bijections {#prop-composees}
La composée de deux injections est injective, celle de deux surjections est surjective, celle de deux bijections est bijective, et $(g \circ f)^{-1} = f^{-1} \circ g^{-1}$. Si $g \circ f$ est injective, $f$ l'est ; si $g \circ f$ est surjective, $g$ l'est.
:::

### Relations

::: définition Relation d'équivalence, classes {#def-equivalence}
Une relation binaire $\mathcal{R}$ sur $E$ est une **relation d'équivalence** si elle est **réflexive** ($x \mathcal{R} x$), **symétrique** ($x \mathcal{R} y \implies y \mathcal{R} x$) et **transitive** ($x \mathcal{R} y$ et $y \mathcal{R} z \implies x \mathcal{R} z$). La **classe** de $x$ est l'ensemble des $y \in E$ tels que $x \mathcal{R} y$.
:::

::: proposition Les classes d'équivalence forment une partition {#prop-partition}
Les classes d'une relation d'équivalence sur $E$ forment une partition de $E$ : chacune est non vide, deux classes sont égales ou disjointes, et leur réunion est $E$.
:::

L'exemple fondamental est la **congruence** modulo un réel $c$ : $a \equiv b\ [c]$ si $a - b \in c\mathbb{Z}$. Modulo $2\pi$ sur $\mathbb{R}$, elle identifie les mesures d'un même angle ; modulo un entier $n$ sur $\mathbb{Z}$, elle range les entiers selon leur reste dans la division par $n$ ([[arithmetique#def-congruence]]).

::: définition Relation d'ordre {#def-ordre}
Une relation binaire $\preccurlyeq$ sur $E$ est une **relation d'ordre** si elle est réflexive, **antisymétrique** ($x \preccurlyeq y$ et $y \preccurlyeq x \implies x = y$) et transitive. L'ordre est **total** si deux éléments sont toujours comparables, **partiel** sinon.
:::

L'ordre usuel sur $\mathbb{R}$ est total. L'inclusion sur $\mathcal{P}(E)$ et la divisibilité sur $\mathbb{N}$ sont des ordres partiels : $\{1\}$ et $\{2\}$ ne sont pas comparables, ni $2$ et $3$ pour la divisibilité.
