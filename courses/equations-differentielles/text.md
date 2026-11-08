## Équations du premier ordre {#premier-ordre}

Une équation différentielle relie une fonction inconnue à ses dérivées. Les équations **linéaires** sont celles que l'on sait résoudre complètement : leurs solutions forment un espace affine, dont on connaît la dimension, et dans le cas des coefficients constants, on les écrit explicitement grâce à l'exponentielle de matrice. Elles décrivent aussi, au premier ordre, le comportement de n'importe quel système près d'un équilibre. Dans tout le cours, $I$ est un intervalle de $\mathbb{R}$ et $\mathbb{K} = \mathbb{R}$ ou $\mathbb{C}$.

::: définition Équation linéaire du premier ordre {#def-edl1}
Une **équation différentielle linéaire du premier ordre** est une équation $y' + a(t)\, y = b(t)$, où $a, b : I \to \mathbb{K}$ sont continues. Une **solution** est une fonction $y : I \to \mathbb{K}$ dérivable qui la vérifie en tout point de $I$. L'équation **homogène** associée est $y' + a(t)\, y = 0$.
:::

::: théorème Solutions de l'équation homogène {#thm-homogene1}
Si $A$ est une primitive de $a$ sur $I$, les solutions de $y' + a(t)\, y = 0$ sur $I$ sont exactement les fonctions $t \mapsto C\, e^{-A(t)}$, $C \in \mathbb{K}$. Elles forment une droite vectorielle.
:::

::: preuve Par le facteur intégrant
Si $y$ est solution, la fonction $z(t) = y(t)\, e^{A(t)}$ a pour dérivée $(y' + a y) e^{A} = 0$ : elle est constante sur l'intervalle $I$, égale à un certain $C$, et $y = C e^{-A}$. Réciproquement, ces fonctions sont solutions.
:::

::: théorème Structure des solutions {#thm-structure1}
Si $y_p$ est une solution particulière de $y' + a y = b$, les solutions sont exactement les fonctions $y_p + C e^{-A}$. Pour tout $t_0 \in I$ et tout $y_0 \in \mathbb{K}$, il existe une **unique** solution telle que $y(t_0) = y_0$ (**problème de Cauchy**).
:::

L'ensemble des solutions est donc une droite affine : une solution particulière plus toutes les solutions de l'équation homogène. Ce principe vaut pour toutes les équations linéaires, de tout ordre, et c'est lui qui guide la résolution. Il reste à trouver une solution particulière.

::: méthode Variation de la constante {#meth-variation}
Pour trouver une solution particulière de $y' + a y = b$ :

1. résoudre l'équation homogène : $y_h = C e^{-A}$ ;
2. chercher une solution de la forme $y = C(t)\, e^{-A(t)}$, où la constante est devenue une fonction ;
3. en reportant, les termes en $C(t)$ se simplifient et il reste $C'(t)\, e^{-A(t)} = b(t)$ ;
4. intégrer : $C(t) = \int b(t) e^{A(t)}\,dt$.
:::

Exemple : pour $y' + 2t\, y = t$, on a $A(t) = t^2$, et $C'(t) = t e^{t^2}$ donne $C(t) = \frac12 e^{t^2}$ : la fonction constante $\frac12$ est solution, et les solutions sont $\frac12 + C e^{-t^2}$. On pouvait le deviner, mais la méthode marche aussi quand rien ne se devine. Pour un second membre polynomial, exponentiel ou trigonométrique et des coefficients constants, on cherche plutôt directement une solution de même forme.

## Systèmes linéaires {#systemes}

::: définition Système différentiel linéaire {#def-systeme}
Un **système différentiel linéaire** d'ordre $1$ et de taille $n$ est une équation $X'(t) = A(t)\, X(t) + B(t)$, où $A : I \to \mathcal{M}_n(\mathbb{K})$ et $B : I \to \mathbb{K}^n$ sont continues et l'inconnue $X : I \to \mathbb{K}^n$ est dérivable.
:::

Une équation scalaire d'ordre $n$, $y^{(n)} + a_{n-1}(t) y^{(n-1)} + \cdots + a_0(t) y = b(t)$, se ramène à un tel système en posant $X = (y, y', \ldots, y^{(n-1)})$ : tout ce qui suit s'applique donc aussi aux équations d'ordre supérieur, avec des conditions initiales portant sur $y(t_0), y'(t_0), \ldots, y^{(n-1)}(t_0)$.

::: théorème Théorème de Cauchy-Lipschitz linéaire {#thm-cl}
Pour tout $t_0 \in I$ et tout $X_0 \in \mathbb{K}^n$, le système $X' = A(t) X + B(t)$ admet une **unique** solution définie sur **tout** $I$ telle que $X(t_0) = X_0$.
:::

Deux points méritent d'être soulignés. L'unicité interdit à deux trajectoires de se croiser : si deux solutions coïncident en un instant, elles coïncident toujours. Et la solution existe sur tout l'intervalle où les coefficients sont continus, ce qui est propre au cas linéaire : la solution de l'équation non linéaire $y' = y^2$, $y(0) = 1$, à savoir $\frac{1}{1 - t}$, explose en $t = 1$.

::: théorème Espace des solutions {#thm-espace}
Les solutions du système homogène $X' = A(t) X$ sur $I$ forment un espace vectoriel de dimension $n$, et pour tout $t_0 \in I$, l'application $X \mapsto X(t_0)$ est un isomorphisme de cet espace sur $\mathbb{K}^n$. Les solutions du système complet sont les $X_p + X_h$, où $X_p$ est une solution particulière et $X_h$ décrit les solutions homogènes.
:::

L'isomorphisme est la traduction du théorème de Cauchy-Lipschitz : la linéarité vient de celle de l'équation, la bijectivité de l'existence et de l'unicité. Pour une équation scalaire d'ordre $2$, l'espace des solutions homogènes est donc un plan : il suffit de trouver deux solutions indépendantes.

::: définition Système fondamental, wronskien {#def-wronskien}
Une base $(X_1, \ldots, X_n)$ de l'espace des solutions homogènes est un **système fondamental de solutions**. Le **wronskien** de $n$ solutions est $W(t) = \det\big(X_1(t), \ldots, X_n(t)\big)$ ; pour deux solutions $y_1, y_2$ d'une équation scalaire d'ordre $2$, c'est $W = y_1 y_2' - y_1' y_2$.
:::

::: proposition Le wronskien ne s'annule jamais ou toujours {#prop-wronskien}
Pour $n$ solutions du système homogène, les propriétés suivantes sont équivalentes : la famille $(X_1, \ldots, X_n)$ est une base de l'espace des solutions ; $W(t_0) \neq 0$ pour un $t_0 \in I$ ; $W(t) \neq 0$ pour tout $t \in I$. De plus, le wronskien vérifie l'équation de **Liouville** $W' = \operatorname{tr}(A(t))\, W$, de sorte que $W(t) = W(t_0) \exp\left(\int_{t_0}^{t} \operatorname{tr} A\right)$.
:::

## Coefficients constants {#coefficients-constants}

Quand la matrice $A$ ne dépend pas du temps, le système $X' = AX$ est l'analogue vectoriel de $y' = ay$, dont la solution est $e^{at} y_0$. Il suffit de donner un sens à l'exponentielle d'une matrice.

::: définition Exponentielle de matrice {#def-expm}
Pour $M \in \mathcal{M}_n(\mathbb{K})$, la série $\sum_{k \ge 0} \frac{M^k}{k!}$ converge (absolument, pour une norme d'algèbre) ; sa somme est l'**exponentielle** de $M$, notée $e^M$ ou $\exp(M)$.
:::

::: proposition Propriétés de l'exponentielle de matrice {#prop-expm}
Pour $A, B \in \mathcal{M}_n(\mathbb{K})$ et $s, t \in \mathbb{R}$ :

- si $AB = BA$, alors $e^{A + B} = e^A e^B$ ; en particulier $e^{(s+t)A} = e^{sA} e^{tA}$ et $e^A$ est inversible d'inverse $e^{-A}$ ;
- $t \mapsto e^{tA}$ est dérivable et $\frac{d}{dt} e^{tA} = A\, e^{tA} = e^{tA} A$ ;
- $e^{P^{-1} A P} = P^{-1} e^A P$ et $\det(e^A) = e^{\operatorname{tr} A}$.
:::

L'hypothèse de commutation est indispensable ; l'exercice complexe correspondant donne deux matrices pour lesquelles $e^{A + B} \neq e^A e^B$. La relation $\det(e^A) = e^{\operatorname{tr} A}$ est un cas particulier de l'équation de Liouville.

::: théorème Solution d'un système à coefficients constants {#thm-solution-cc}
La solution de $X' = AX$, $X(t_0) = X_0$, est $X(t) = e^{(t - t_0)A} X_0$. Pour le système complet $X' = AX + B(t)$, c'est
$$X(t) = e^{(t - t_0)A} X_0 + \int_{t_0}^{t} e^{(t - s)A}\, B(s)\,ds \qquad \text{(formule de Duhamel)}.$$
:::

::: méthode Calculer e^(tA) {#meth-calcul-expm}
Pour calculer $e^{tA}$ :

1. si $A$ est diagonalisable, $A = P D P^{-1}$ avec $D = \operatorname{diag}(\lambda_i)$, alors $e^{tA} = P \operatorname{diag}(e^{\lambda_i t}) P^{-1}$ ; les solutions sont des combinaisons de $e^{\lambda_i t} V_i$, où $V_i$ est un vecteur propre ;
2. si $A = \lambda I_n + N$ avec $N$ nilpotente ($N^m = 0$), alors, $\lambda I_n$ et $N$ commutant, $e^{tA} = e^{\lambda t} \sum_{k < m} \frac{t^k N^k}{k!}$ : des polynômes en $t$ apparaissent ;
3. dans le cas général, on trigonalise (ou l'on utilise la décomposition de Dunford) et l'on combine les deux cas précédents.
:::

::: théorème Équation scalaire d'ordre 2 à coefficients constants {#thm-ordre2}
Soient $a, b \in \mathbb{R}$ et $r_1, r_2$ les racines de l'**équation caractéristique** $r^2 + ar + b = 0$. Les solutions réelles de $y'' + a y' + b y = 0$ sont :

- si $r_1 \neq r_2$ sont réelles : $C_1 e^{r_1 t} + C_2 e^{r_2 t}$ ;
- si $r_1 = r_2 = r$ (racine double) : $(C_1 + C_2 t)\, e^{rt}$ ;
- si $r_{1,2} = \alpha \pm i\beta$ avec $\beta \neq 0$ : $e^{\alpha t}\big(C_1 \cos(\beta t) + C_2 \sin(\beta t)\big)$.
:::

L'équation caractéristique est celle des valeurs propres de la matrice $\begin{pmatrix} 0 & 1 \\ -b & -a \end{pmatrix}$ du système associé. L'oscillateur harmonique $y'' + \omega^2 y = 0$ a pour solutions $C_1 \cos \omega t + C_2 \sin \omega t$. Amorti, $y'' + 2\lambda y' + \omega^2 y = 0$ avec $0 < \lambda < \omega$, il oscille avec une amplitude qui décroît comme $e^{-\lambda t}$ et une pseudo-période $\frac{2\pi}{\sqrt{\omega^2 - \lambda^2}}$. Forcé à sa propre fréquence, $y'' + \omega^2 y = \cos \omega t$, il entre en **résonance** : une solution particulière est $\frac{t \sin \omega t}{2\omega}$, dont l'amplitude croît sans limite.

## Ouverture : portraits de phase {#ouverture}

En dimension $2$, on peut dessiner toutes les trajectoires de $X' = AX$ dans le plan : c'est le **portrait de phase**. Il ne dépend, à déformation linéaire près, que des valeurs propres de $A$.

::: théorème Classification des portraits de phase {#thm-portraits}
Soit $A \in \mathcal{M}_2(\mathbb{R})$ inversible, de valeurs propres $\lambda_1, \lambda_2$.

- **Nœud** : $\lambda_1, \lambda_2$ réelles de même signe ; les trajectoires convergent vers $0$ (si négatives) ou s'en éloignent (si positives).
- **Col** : $\lambda_1 < 0 < \lambda_2$ ; deux directions privilégiées, l'une attirante, l'autre repoussante, et les autres trajectoires sont des branches d'hyperbole déformées.
- **Foyer** : $\lambda_{1,2} = \alpha \pm i\beta$ avec $\alpha \neq 0$ et $\beta \neq 0$ ; les trajectoires sont des spirales, convergentes si $\alpha < 0$.
- **Centre** : $\lambda_{1,2} = \pm i\beta$ ; les trajectoires sont des ellipses fermées.

Toutes les solutions tendent vers $0$ si et seulement si les deux valeurs propres ont une partie réelle strictement négative.
:::

Le dernier critère est le fondement de l'étude de la **stabilité** : près d'un équilibre, un système non linéaire $X' = F(X)$ se comporte en général comme son linéarisé $X' = DF(X^*)\,(X - X^*)$, et l'équilibre est stable si toutes les valeurs propres de la jacobienne ont une partie réelle strictement négative (théorème de Liapounov, hors programme). Mais les systèmes non linéaires réservent des comportements impossibles dans le cas linéaire : cycles limites isolés, et en dimension $3$, attracteurs étranges comme celui de Lorenz, que la vue « Attracteurs étranges » de l'explorateur permet de suivre. Aucun système linéaire n'est chaotique : ses solutions sont des combinaisons explicites d'exponentielles, de polynômes et de sinusoïdes.
