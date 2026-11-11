## Relations de comparaison {#comparaison}

Calculer une limite, c'est souvent comparer des vitesses : qui de $x^2$ ou de $e^x$ l'emporte, de combien $\sin x$ diffère de $x$ près de $0$. L'analyse asymptotique donne à ces comparaisons un langage précis ($o$, $O$, $\sim$) et un outil de calcul, les **développements limités**. Le cours [[suites-series#def-comparaison|Suites et séries]] a posé ce langage pour les suites ; on le reprend ici pour les fonctions, qui passent en premier, puisque c'est sur elles que l'on calcule. Les fonctions sont définies au voisinage d'un point $a \in \overline{\mathbb{R}}$ ([[limites-continuite#def-voisinage]]), à valeurs réelles ou complexes.

::: définition Domination, négligeabilité, équivalence {#def-comparaison-f}
Soient $f$ et $g$ définies au voisinage de $a$, et $g$ ne s'annulant pas au voisinage de $a$ (sauf peut-être en $a$, où l'on suppose alors $f(a) = g(a) = 0$). On dit que :

- $f$ est **dominée** par $g$ en $a$, noté $f(x) = O(g(x))$, si $\frac fg$ est bornée au voisinage de $a$ ;
- $f$ est **négligeable** devant $g$ en $a$, noté $f(x) = o(g(x))$, si $\frac{f(x)}{g(x)} \to 0$ quand $x \to a$ ;
- $f$ est **équivalente** à $g$ en $a$, noté $f(x) \sim g(x)$, si $\frac{f(x)}{g(x)} \to 1$ quand $x \to a$.

On précise le point en écrivant $f(x) \underset{x \to a}{=} o(g(x))$ ou $f(x) \underset{x \to a}{\sim} g(x)$.
:::

Ainsi $x^2 = o(x)$ en $0$ mais $x = o(x^2)$ en $+\infty$ : une relation de comparaison n'a de sens qu'en un point précisé. Écrire $f = o(1)$ signifie que $f$ tend vers $0$ ; écrire $f = O(1)$, que $f$ est bornée au voisinage du point.

::: proposition Liens entre les relations {#prop-liens}
En un point $a$ : $f \sim g$ si et seulement si $f = g + o(g)$. Une fonction négligeable devant $g$ est dominée par $g$, et si $f \sim g$, alors $f = O(g)$ et $g = O(f)$. La relation $\sim$ est réflexive, symétrique et transitive.
:::

La forme $f = g + o(g)$ est celle qui sert dans les calculs : elle se manipule comme une égalité. Par exemple $\sin x \sim x$ en $0$ s'écrit $\sin x = x + o(x)$.

::: proposition Règles de calcul sur les équivalents et les o {#prop-regles-equiv}
En un point $a$ :

- **produits, quotients, puissances** : si $f_1 \sim g_1$ et $f_2 \sim g_2$, alors $f_1 f_2 \sim g_1 g_2$, $\frac{f_1}{f_2} \sim \frac{g_1}{g_2}$, et $f_1^\alpha \sim g_1^\alpha$ pour $\alpha$ réel fixé (fonctions positives) ;
- **pour les $o$** : $o(g) + o(g) = o(g)$, $\lambda\, o(g) = o(g)$, $o(g)\cdot h = o(gh)$, et si $f = o(g)$ et $g = o(h)$, alors $f = o(h)$ ;
- **attention** : on n'additionne pas des équivalents, et l'on ne compose pas un équivalent par une fonction quelconque.
:::

Contre-exemples à retenir : en $+\infty$, $x + 1 \sim x$ et $-x \sim -x$, mais leur somme $1$ n'est pas équivalente à $0$ ; et $x + 1 \sim x$, alors que $e^{x+1} = e\,e^x$ n'est pas équivalent à $e^x$. Pour sommer, on revient aux développements : $f = g + o(g)$, puis on additionne.

::: proposition Équivalent par encadrement {#prop-encadrement-equiv}
Si $f$, $g$, $h$ sont réelles, si $f \le g \le h$ au voisinage de $a$ et si $f \sim h$ en $a$, alors $g \sim f$ en $a$.
:::

::: proposition Ce qu'un équivalent conserve {#prop-conservees}
Si $f \sim g$ en $a$ (fonctions réelles), alors $f$ et $g$ ont le **même signe** au voisinage de $a$, et si $g$ a une limite en $a$ (finie ou infinie), $f$ a la **même limite**.
:::

C'est pourquoi chercher un équivalent simple est la première étape de tout calcul de limite. Les **croissances comparées** ([[techniques-calcul#prop-croissances-f]]) se réécrivent : pour $\alpha, \beta > 0$, $(\ln x)^\beta = o(x^\alpha)$ et $x^\alpha = o(e^{\beta x})$ en $+\infty$, et $|\ln x|^\beta = o(x^{-\alpha})$ en $0^+$.

::: remarque Le cas des suites {#rem-suites}
Les définitions et règles s'adaptent sans changement aux suites, en $+\infty$ : $u_n = O(v_n)$, $u_n = o(v_n)$, $u_n \sim v_n$. Elles servent à comparer des séries ([[suites-series#thm-positive]]) et à estimer des vitesses de convergence.
:::

## Développements limités {#developpements}

::: définition Développement limité {#def-dl}
Soit $f$ définie au voisinage de $a \in \mathbb{R}$ et $n \in \mathbb{N}$. On dit que $f$ admet un **développement limité à l'ordre $n$** en $a$ s'il existe des scalaires $c_0, \ldots, c_n$ tels que
$$f(a + h) = c_0 + c_1 h + \cdots + c_n h^n + o(h^n) \qquad (h \to 0).$$
Le polynôme $c_0 + c_1 X + \cdots + c_n X^n$ est la **partie régulière** du développement.
:::

On se ramène toujours en $0$ en posant $x = a + h$. Le terme $o(h^n)$ s'écrit aussi $h^n \varepsilon(h)$ avec $\varepsilon(h) \to 0$.

::: proposition Unicité, troncature {#prop-unicite-dl}
Si $f$ admet un développement limité à l'ordre $n$ en $a$, ses coefficients sont **uniques**. En supprimant les termes de degré supérieur à $p \le n$, on obtient le développement à l'ordre $p$ (**troncature**).
:::

Pour l'unicité, si $\sum c_k h^k - \sum c'_k h^k = o(h^n)$ avec $c \neq c'$, soit $k_0$ le plus petit indice où ils diffèrent : en divisant par $h^{k_0}$ et en faisant tendre $h$ vers $0$, on obtient $c_{k_0} - c'_{k_0} = 0$, contradiction.

::: proposition Parité {#prop-parite-dl}
Si $f$ est paire (respectivement impaire) et admet un développement limité en $0$, sa partie régulière ne contient que des puissances paires (respectivement impaires).
:::

En effet, $f(-x)$ a pour développement $\sum c_k (-1)^k x^k$ ; l'unicité donne $c_k = (-1)^k c_k$ pour $f$ paire.

::: proposition Développement limité et dérivabilité {#prop-dl-derivable}
$f$ admet un développement limité à l'ordre $0$ en $a$ si et seulement si elle a une limite finie en $a$ (elle est alors prolongeable par continuité), et à l'ordre $1$ si et seulement si elle est (prolongeable en une fonction) dérivable en $a$ : $f(a + h) = f(a) + f'(a)h + o(h)$.
:::

C'est la [[limites-continuite#prop-dl1|caractérisation de la dérivabilité]] vue au premier semestre. Au-delà de l'ordre $1$, l'existence d'un développement à l'ordre $2$ n'entraîne pas que $f$ soit deux fois dérivable : $f(x) = x^3 \sin\frac1x$ (prolongée par $0$) vérifie $f(x) = o(x^2)$ en $0$, mais $f'$ n'est pas dérivable en $0$.

::: proposition Primitivation d'un développement limité {#prop-primitivation}
Si $f$ est dérivable au voisinage de $a$ et si $f'$ admet un développement limité à l'ordre $n$ en $a$, $f'(a + h) = \sum_{k=0}^{n} c_k h^k + o(h^n)$, alors $f$ admet un développement à l'ordre $n + 1$ :
$$f(a + h) = f(a) + \sum_{k=0}^{n} \frac{c_k}{k + 1} h^{k+1} + o(h^{n+1}).$$
:::

On ne peut pas dériver un développement limité en général, mais on peut toujours **primitiver** : c'est ce qui donne les développements de $\ln(1 + x)$ et d'Arctan à partir de ceux de $\frac{1}{1 + x}$ et $\frac{1}{1 + x^2}$. La preuve applique les accroissements finis à $f(a + h) - P(h)$, où $P$ est la primitive attendue.

::: théorème Formule de Taylor-Young {#thm-taylor-young}
Si $f$ est de classe $C^n$ sur un intervalle $I$ contenant $a$, alors $f$ admet un développement limité à l'ordre $n$ en $a$, donné par
$$f(a + h) = \sum_{k=0}^{n} \frac{f^{(k)}(a)}{k!} h^k + o(h^n).$$
:::

La preuve se fait par récurrence sur $n$, en appliquant la primitivation à $f'$, de classe $C^{n-1}$. La formule de Taylor-Young est locale : elle dit ce qui se passe quand $h \to 0$, sans majorer l'erreur pour un $h$ fixé. La majoration viendra avec les formules de Taylor avec reste intégral et l'inégalité de Taylor-Lagrange.

## Calculer un développement limité {#calcul-dl}

::: proposition Développements limités usuels en 0 {#prop-dl-usuels}
Pour tout $n \in \mathbb{N}$, quand $x \to 0$ :
$$e^x = \sum_{k=0}^{n} \frac{x^k}{k!} + o(x^n), \qquad \frac{1}{1 - x} = \sum_{k=0}^{n} x^k + o(x^n),$$
$$\ln(1 + x) = \sum_{k=1}^{n} \frac{(-1)^{k+1}x^k}{k} + o(x^n),$$
$$\cos x = \sum_{k=0}^{n} \frac{(-1)^k x^{2k}}{(2k)!} + o(x^{2n+1}),$$
$$\sin x = \sum_{k=0}^{n} \frac{(-1)^k x^{2k+1}}{(2k+1)!} + o(x^{2n+2}),$$
les mêmes sans les signes $(-1)^k$ pour $\operatorname{ch}$ et $\operatorname{sh}$, puis
$$(1 + x)^\alpha = \sum_{k=0}^{n} \binom{\alpha}{k} x^k + o(x^n), \qquad \text{où}$$
$$\binom{\alpha}{k} = \frac{\alpha(\alpha - 1)\cdots(\alpha - k + 1)}{k!},$$
$$\operatorname{Arctan} x = \sum_{k=0}^{n} \frac{(-1)^k x^{2k+1}}{2k+1} + o(x^{2n+2}),$$
et enfin $\tan x = x + \frac{x^3}{3} + o(x^3)$.
:::

Les cinq premiers viennent de Taylor-Young (ou, pour $\frac{1}{1-x}$, de la somme géométrique : $\frac{1}{1 - x} - \sum_{k=0}^n x^k = \frac{x^{n+1}}{1 - x}$) ; $\ln(1 + x)$ et Arctan, par primitivation de $\frac{1}{1 + x}$ et $\frac{1}{1 + x^2}$. Le petit $o$ de $\cos$ est d'ordre $2n + 1$ et non $2n$ : le terme suivant, de degré $2n + 1$, est nul par parité. Exemples : $\sqrt{1 + x} = 1 + \frac x2 - \frac{x^2}{8} + o(x^2)$ ($\alpha = \frac12$) et $\frac{1}{1 + x} = 1 - x + x^2 + o(x^2)$.

::: proposition Opérations sur les développements limités {#prop-operations-dl}
Si $f$ et $g$ ont des développements à l'ordre $n$ en $0$, de parties régulières $P$ et $Q$ :

- $\lambda f + \mu g$ a pour partie régulière $\lambda P + \mu Q$ ;
- $fg$ a pour partie régulière le produit $PQ$ **tronqué** au degré $n$ ;
- si $g(0) \neq 0$, $\frac{1}{g}$ se développe en écrivant $g = g(0)(1 + u)$ avec $u(x) \to 0$, puis $\frac{1}{1 + u} = 1 - u + u^2 - \cdots$ ;
- pour une **composée** $g \circ u$ avec $u(x) \to 0$, on substitue le développement de $u$ dans celui de $g$ et l'on tronque.
:::

La règle pour la composée se pratique sur des exemples ; aucun énoncé général n'est au programme. Il faut seulement contrôler l'ordre : si $u(x) = O(x)$, alors $u^k = O(x^k)$, et un terme $o(u^n)$ est un $o(x^n)$.

::: méthode Mener un calcul de développement limité {#meth-dl}
1. **Prévoir les ordres** : factoriser chaque morceau par son terme prépondérant. Si $f = x^2 \varphi(x)$ avec $\varphi(0) \neq 0$ et que l'on veut $\frac{1}{f}$ à $o(1)$ près, il faut $\varphi$ à l'ordre $2$.
2. Écrire les développements usuels **à l'ordre suffisant**, sans plus : chaque terme inutile alourdit le calcul.
3. Multiplier en ne gardant que les termes de degré au plus $n$, et regrouper.
4. Contrôler par un cas particulier, une parité ou un calcul numérique.
:::

Exemple : $e^x \sin x = \left(1 + x + \frac{x^2}{2} + o(x^2)\right)\left(x - \frac{x^3}{6} + o(x^3)\right) = x + x^2 + \frac{x^3}{3} + o(x^3)$ ; le terme en $x^3$ vient de $\frac{x^2}{2}\cdot x$ et de $1 \cdot \left(-\frac{x^3}{6}\right)$. Comme $\sin$ commence par $x$, il suffisait de développer l'exponentielle à l'ordre $2$.

## Études locales et asymptotiques {#applications}

::: méthode Limites et équivalents par développement limité {#meth-limites-dl}
Pour une forme indéterminée en $a$, on développe numérateur et dénominateur jusqu'au premier terme non nul : le développement limité donne un **équivalent**, qui donne la limite. Exemple : $\frac{e^x - 1 - x}{x^2} = \frac{\frac{x^2}{2} + o(x^2)}{x^2} \to \frac12$. Pour $a = \pm\infty$, on pose $x = \frac1h$ et l'on développe en $h \to 0$.
:::

::: proposition Position par rapport à la tangente {#prop-tangente}
Si $f(a + h) = f(a) + f'(a)h + c_p h^p + o(h^p)$ avec $p \ge 2$ et $c_p \neq 0$, le signe de $f(a + h) - f(a) - f'(a)h$ au voisinage de $0$ est celui de $c_p h^p$. Si $p$ est pair, le graphe est d'un seul côté de sa tangente (au-dessus si $c_p > 0$) ; si $p$ est impair, il la traverse : c'est un **point d'inflexion**.
:::

::: méthode Asymptotes {#meth-asymptote}
Pour étudier $f$ en $+\infty$, on cherche un développement asymptotique $f(x) = ax + b + \frac{c}{x} + o\left(\frac1x\right)$ en factorisant par le terme prépondérant et en développant en $\frac1x$. La droite $y = ax + b$ est alors **asymptote** au graphe, et le signe de $\frac cx$ (si $c \neq 0$) donne la position du graphe par rapport à elle.
:::

Exemple : $\sqrt{x^2 + x + 1} = x\sqrt{1 + \frac1x + \frac1{x^2}} = x + \frac12 + \frac{3}{8x} + o\left(\frac1x\right)$ en $+\infty$ : asymptote $y = x + \frac12$, graphe au-dessus (exercice m2).

::: théorème Extremums : conditions à l'ordre 2 {#thm-extremum-2}
Soit $f$ de classe $C^2$ sur un intervalle ouvert $I$ et $a \in I$.

- **Condition nécessaire** : si $f$ a un minimum local en $a$, alors $f'(a) = 0$ et $f''(a) \ge 0$.
- **Condition suffisante** : si $f'(a) = 0$ et $f''(a) > 0$, alors $f$ a un minimum local **strict** en $a$.

Mêmes énoncés pour un maximum en changeant les signes.
:::

Par Taylor-Young, $f(a + h) - f(a) = \frac{f''(a)}{2}h^2 + o(h^2)$ quand $f'(a) = 0$ : si $f''(a) > 0$, c'est strictement positif pour $h \neq 0$ petit. Si $f''(a) = 0$, on ne peut pas conclure à l'ordre $2$ : $x^3$, $x^4$ et $-x^4$ ont tous trois $f'(0) = f''(0) = 0$, avec respectivement ni extremum, un minimum et un maximum. On pousse alors le développement (exercice m3).

::: exemple Une suite définie implicitement {#ex-implicite}
Pour $n \ge 1$, l'équation $\tan x = x$ a une unique solution $x_n$ dans $]n\pi - \frac\pi2, n\pi + \frac\pi2[$. On montre successivement $x_n \sim n\pi$, puis $x_n = n\pi + \frac\pi2 - \frac{1}{n\pi} + o\left(\frac1n\right)$ : chaque étape utilise la précédente pour gagner un terme (exercice c1, et [[suites-series#meth-implicite]]).
:::
