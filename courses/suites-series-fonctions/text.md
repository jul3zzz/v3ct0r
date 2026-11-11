## Convergence simple, convergence uniforme {#modes-convergence}

Une série entière définit une fonction par une somme infinie de fonctions simples ([[series-entieres]]) ; une série de Fourier aussi, et bien d'autres objets. La question est toujours la même : la limite d'une suite de fonctions continues est-elle continue ? peut-on intégrer, dériver terme à terme ? La réponse dépend du **mode** de convergence. Dans tout le cours, $I$ est un intervalle de $\mathbb{R}$ et les fonctions sont à valeurs dans $\mathbb{K} = \mathbb{R}$ ou $\mathbb{C}$.

::: définition Convergence simple {#def-cv-simple}
Une suite $(f_n)$ de fonctions définies sur $I$ **converge simplement** vers $f$ si, pour tout $x \in I$, la suite numérique $\big(f_n(x)\big)$ converge vers $f(x)$.
:::

La convergence simple ne préserve presque rien. Sur $[0, 1]$, $f_n(x) = x^n$ converge simplement vers la fonction nulle sur $[0, 1[$ et égale à $1$ en $1$ : des fonctions continues ont une limite discontinue.

::: définition Convergence uniforme {#def-cv-uniforme}
Pour $g$ bornée sur $I$, on note $\|g\|_\infty = \sup_{x \in I}|g(x)|$. La suite $(f_n)$ **converge uniformément** vers $f$ sur $I$ si $f_n - f$ est bornée à partir d'un certain rang et $\|f_n - f\|_\infty \to 0$, c'est-à-dire
$$\forall \varepsilon > 0,\ \exists N \in \mathbb{N},\ \forall n \ge N,\ \forall x \in I,\quad |f_n(x) - f(x)| \le \varepsilon.$$
:::

La différence avec la convergence simple est la place du « $\forall x$ » : ici le rang $N$ ne dépend pas de $x$. Graphiquement, pour $n \ge N$, le graphe de $f_n$ reste dans une bande de largeur $2\varepsilon$ autour de celui de $f$. La convergence uniforme entraîne la convergence simple, vers la même limite.

::: méthode Étudier la convergence uniforme {#meth-cu}
1. Trouver la limite simple $f$ (à $x$ fixé, $n \to +\infty$).
2. **Pour prouver** la convergence uniforme, majorer $|f_n(x) - f(x)|$ par un $\varepsilon_n$ **indépendant de $x$** qui tend vers $0$ ; ou calculer $\|f_n - f\|_\infty$ (étude de fonction).
3. **Pour l'infirmer**, trouver une suite $(x_n)$ de $I$ telle que $|f_n(x_n) - f(x_n)|$ ne tende pas vers $0$.
:::

Pour $f_n(x) = x^n$ sur $[0, 1[$ : avec $x_n = 2^{-1/n}$, $f_n(x_n) = \frac12$, donc pas de convergence uniforme ; mais sur $[0, a]$ avec $a < 1$, $\|f_n\|_\infty = a^n \to 0$. C'est un cas typique : convergence uniforme sur tout segment $[0, a] \subset [0, 1[$, pas sur $[0, 1[$.

## Régularité de la limite {#regularite-limite}

::: théorème Continuité d'une limite uniforme {#thm-continuite-limite}
Si chaque $f_n$ est continue sur $I$ et si $(f_n)$ converge uniformément vers $f$ sur $I$, alors $f$ est continue sur $I$. Il suffit que la convergence soit uniforme sur tout segment inclus dans $I$.
:::

::: preuve Continuité d'une limite uniforme
Soient $a \in I$ et $\varepsilon > 0$. On choisit $n$ tel que $\|f_n - f\|_\infty \le \varepsilon$, puis $\eta > 0$ tel que $|f_n(x) - f_n(a)| \le \varepsilon$ pour $|x - a| \le \eta$. Alors $|f(x) - f(a)| \le |f(x) - f_n(x)| + |f_n(x) - f_n(a)| + |f_n(a) - f(a)| \le 3\varepsilon$. C'est l'« argument en $\frac\varepsilon3$ ».
:::

Contraposée utile : si la limite simple de fonctions continues est discontinue, la convergence n'est pas uniforme (exemple de $x^n$ sur $[0, 1]$).

::: théorème Théorème de la double limite {#thm-double-limite}
Soit $a$ un point de $I$ ou une extrémité de $I$ (éventuellement infinie). Si $(f_n)$ converge uniformément vers $f$ sur $I$ et si chaque $f_n$ a une limite finie $\ell_n$ en $a$, alors la suite $(\ell_n)$ converge, $f$ a une limite en $a$, et
$$\lim_{x \to a}\lim_{n \to +\infty} f_n(x) = \lim_{n \to +\infty}\lim_{x \to a} f_n(x).$$
:::

La démonstration est hors programme. Le théorème autorise à **échanger deux limites**, ce qui est faux en général : pour $f_n(x) = x^n$, la limite en $x \to 1^-$ puis $n \to \infty$ vaut $1$, et dans l'autre ordre $0$.

::: théorème Intégration d'une limite uniforme sur un segment {#thm-integration-segment}
Si les $f_n$ sont continues sur le **segment** $[a, b]$ et convergent uniformément vers $f$ sur $[a, b]$, alors
$$\int_a^b f_n(t)\,dt \xrightarrow[n \to +\infty]{} \int_a^b f(t)\,dt.$$
:::

En effet, $\left|\int_a^b (f_n - f)\right| \le (b - a)\|f_n - f\|_\infty$. Sur un intervalle non borné, c'est faux : $f_n = \frac1n\mathbf{1}_{[0, n]}$, ou une version continue, converge uniformément vers $0$ sur $\mathbb{R}_+$ avec une intégrale égale à $1$. Pour les intervalles quelconques, on utilisera la convergence dominée ([[integrales-parametre#thm-convergence-dominee]]).

::: théorème Dérivation d'une suite de fonctions {#thm-derivation-suite}
Si les $f_n$ sont de classe $C^1$ sur $I$, si $(f_n)$ converge simplement vers $f$ sur $I$ et si $(f'_n)$ converge **uniformément sur tout segment** de $I$ vers une fonction $g$, alors $f$ est de classe $C^1$ sur $I$ et $f' = g$.
:::

C'est la convergence des **dérivées** qui compte. Fixons $a \in I$ : $f_n(x) = f_n(a) + \int_a^x f'_n$, et l'on passe à la limite grâce au théorème précédent : $f(x) = f(a) + \int_a^x g$, avec $g$ continue. La seule convergence uniforme de $(f_n)$ ne suffit pas : $\frac{\sin(nx)}{n}$ converge uniformément vers $0$ sur $\mathbb{R}$, mais $f'_n(x) = \cos(nx)$ ne converge pas (exercice s2). Par récurrence, le théorème s'étend à la classe $C^k$ : il suffit de la convergence simple des $f_n^{(j)}$ pour $j < k$ et uniforme sur tout segment des $f_n^{(k)}$.

## Séries de fonctions {#series-fonctions}

Une série de fonctions $\sum u_n$ est la suite de ses sommes partielles $S_n = \sum_{k=0}^{n} u_k$ ; tout ce qui précède s'y applique. La convergence simple de la série est celle de $\sum u_n(x)$ pour tout $x$ ; elle est uniforme si et seulement si le **reste** $R_n = \sum_{k > n} u_k$ tend uniformément vers $0$.

::: définition Convergence normale {#def-cv-normale}
La série $\sum u_n$ **converge normalement** sur $I$ si chaque $u_n$ est bornée sur $I$ et si la série numérique $\sum \|u_n\|_\infty$ converge. En pratique, on cherche une suite $(\alpha_n)$ indépendante de $x$ telle que $|u_n(x)| \le \alpha_n$ pour tout $x \in I$ et $\sum \alpha_n$ convergente.
:::

::: proposition Normale implique uniforme {#prop-cn-cu}
Une série de fonctions normalement convergente sur $I$ converge uniformément sur $I$, et converge absolument en tout point.
:::

Le reste vérifie $|R_n(x)| \le \sum_{k > n}\|u_k\|_\infty$, qui ne dépend pas de $x$ et tend vers $0$. La réciproque est fausse : $\sum \frac{(-1)^n}{n + x}$ converge uniformément sur $\mathbb{R}_+$ (reste majoré par $\frac{1}{n + 1}$, d'après le [[suites-series#thm-alternee|critère des séries alternées]]) sans converger normalement ($\|u_n\|_\infty = \frac1n$).

::: théorème Régularité de la somme d'une série de fonctions {#thm-regularite-serie}
- **Continuité** : si les $u_n$ sont continues et si $\sum u_n$ converge uniformément sur tout segment de $I$, la somme est continue sur $I$.
- **Double limite** : si $\sum u_n$ converge uniformément sur $I$ et si $u_n(x) \to \ell_n$ quand $x \to a$, alors $\sum \ell_n$ converge et $\lim_{x \to a}\sum u_n(x) = \sum \ell_n$.
- **Intégration terme à terme sur un segment** : si les $u_n$ sont continues sur $[a, b]$ et si $\sum u_n$ converge uniformément sur $[a, b]$, alors $\int_a^b \sum u_n = \sum \int_a^b u_n$.
- **Dérivation terme à terme** : si les $u_n$ sont de classe $C^1$, si $\sum u_n$ converge simplement et si $\sum u'_n$ converge uniformément sur tout segment de $I$, alors la somme est de classe $C^1$ et $\big(\sum u_n\big)' = \sum u'_n$.
:::

::: exemple La fonction ζ de Riemann {#ex-zeta}
Pour $x > 1$, on pose $\zeta(x) = \sum_{n=1}^{+\infty}\frac{1}{n^x}$. Sur $[a, +\infty[$ avec $a > 1$, $\left|\frac{1}{n^x}\right| \le \frac{1}{n^a}$ : la série converge normalement, donc $\zeta$ est continue sur $[a, +\infty[$ pour tout $a > 1$, c'est-à-dire sur $]1, +\infty[$. Les dérivées $\frac{-\ln n}{n^x}$ sont majorées par $\frac{\ln n}{n^a}$ sur $[a, +\infty[$, de série convergente : $\zeta$ est de classe $C^1$, et de même $C^\infty$, avec $\zeta^{(k)}(x) = \sum_{n \ge 1}\frac{(-\ln n)^k}{n^x}$. Elle décroît et tend vers $1$ en $+\infty$ (exercice m2).
:::

La convergence n'est pas normale sur $]1, +\infty[$ tout entier, puisque $\sup_{x > 1}\frac{1}{n^x} = \frac1n$ : c'est pourquoi on travaille sur les $[a, +\infty[$, puis on recolle, la continuité et la dérivabilité étant des propriétés **locales**.

## Approximation uniforme {#approximation}

Cette partie est au programme de MP et MPI.

::: proposition Approximation par des fonctions en escalier {#prop-escalier}
Toute fonction continue par morceaux sur un segment $[a, b]$ est limite uniforme sur $[a, b]$ d'une suite de fonctions en escalier.
:::

C'est le fondement de la construction de l'intégrale ([[riemann]]) : on intègre d'abord les fonctions en escalier, puis on passe à la limite uniforme.

::: théorème Théorème de Weierstrass {#thm-weierstrass}
Toute fonction continue sur un segment $[a, b]$, à valeurs réelles ou complexes, est limite uniforme sur $[a, b]$ d'une suite de fonctions polynomiales.
:::

La démonstration n'est pas exigible. Une preuve constructive utilise les polynômes de Bernstein $B_n(f)(x) = \sum_{k=0}^{n}\binom nk f\big(\frac kn\big) x^k(1 - x)^{n-k}$ sur $[0, 1]$, avec une interprétation probabiliste : $B_n(f)(x) = E\big(f(S_n/n)\big)$ pour $S_n \sim \mathcal{B}(n, x)$, et la [[probabilites-finies#cor-lfgn|loi faible des grands nombres]] concentre $\frac{S_n}{n}$ autour de $x$. Conséquence typique : si $f$ est continue sur $[a, b]$ et si $\int_a^b f(t)t^n\,dt = 0$ pour tout $n$, alors $f = 0$.
