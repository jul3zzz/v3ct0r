## Intégrales généralisées {#definition-ig}

L'[[riemann|intégrale de Riemann]] est définie pour une fonction bornée sur un **segment**. Or les intégrales utiles débordent : $\int_0^{+\infty}e^{-t}\,dt$, $\int_0^1\frac{dt}{\sqrt t}$, la fonction $\Gamma$, les lois de probabilité à densité. On les définit comme **limites** d'intégrales sur des segments, exactement comme une série est la limite de ses sommes partielles ; le parallèle avec les [[suites-series#series|séries]] guide tout le cours.

::: définition Fonction continue par morceaux sur un intervalle {#def-cpm}
Une fonction $f : I \to \mathbb{K}$ est **continue par morceaux** sur un intervalle $I$ si sa restriction à tout segment inclus dans $I$ est continue par morceaux. Pour une telle fonction, $\int_c^d f$ est définie pour tous $c, d \in I$.
:::

::: définition Intégrale convergente sur [a, +∞[ {#def-ig}
Soit $f$ continue par morceaux sur $[a, +\infty[$. L'intégrale $\int_a^{+\infty} f(t)\,dt$ **converge** si $x \mapsto \int_a^x f(t)\,dt$ a une limite finie quand $x \to +\infty$ ; cette limite est la valeur de l'intégrale. Sinon, elle **diverge**. On définit de même $\int_a^b f$ pour $f$ continue par morceaux sur $[a, b[$, avec $b$ réel, par la limite en $b^-$.
:::

Si $f$ est continue par morceaux sur le segment $[a, b]$, l'intégrale généralisée sur $[a, b[$ converge et coïncide avec l'intégrale usuelle : c'est le cas des fonctions **prolongeables par continuité**. Ainsi $\int_0^1\frac{\sin t}{t}\,dt$ ne pose aucun problème en $0$.

::: exemple Intégrales de référence {#ex-riemann-ig}
- $\int_1^{+\infty}\frac{dt}{t^\alpha}$ converge si et seulement si $\alpha > 1$ ; elle vaut alors $\frac{1}{\alpha - 1}$.
- $\int_0^1\frac{dt}{t^\alpha}$ converge si et seulement si $\alpha < 1$ ; elle vaut alors $\frac{1}{1 - \alpha}$.
- Pour $\lambda > 0$, $\int_0^{+\infty}e^{-\lambda t}\,dt$ converge et vaut $\frac1\lambda$ ; $\int_0^1\ln t\,dt$ converge et vaut $-1$.
:::

Pour $\alpha \neq 1$, $\int_1^x\frac{dt}{t^\alpha} = \frac{x^{1-\alpha} - 1}{1 - \alpha}$, qui a une limite finie en $+\infty$ si et seulement si $\alpha > 1$ ; pour $\alpha = 1$, $\ln x \to +\infty$. Aucune intégrale $\int_0^{+\infty}\frac{dt}{t^\alpha}$ ne converge : il faudrait $\alpha > 1$ en $+\infty$ et $\alpha < 1$ en $0$.

::: définition Intervalle ouvert {#def-ig-quelconque}
Soit $f$ continue par morceaux sur $]a, b[$, avec $-\infty \le a < b \le +\infty$. L'intégrale $\int_a^b f$ **converge** si, pour un (ou, de façon équivalente, pour tout) $c \in\, ]a, b[$, les deux intégrales $\int_a^c f$ et $\int_c^b f$ convergent ; on pose alors $\int_a^b f = \int_a^c f + \int_c^b f$.
:::

Attention à l'erreur classique : $\int_{-x}^{x} t\,dt = 0$ pour tout $x$, et pourtant $\int_{-\infty}^{+\infty} t\,dt$ diverge, car $\int_0^{+\infty} t\,dt$ diverge. Les deux bornes doivent converger **indépendamment**.

::: proposition Propriétés des intégrales convergentes {#prop-ig-proprietes}
Sur l'ensemble des fonctions dont l'intégrale converge, l'intégrale est **linéaire** ; la relation de **Chasles** est vraie ; si $f \le g$ et si les deux intégrales convergent, $\int_a^b f \le \int_a^b g$ (**croissance**). Si $f$ est **continue**, **positive** et d'intégrale nulle sur $]a, b[$, alors $f = 0$.
:::

## Fonctions positives et comparaison {#positives-ig}

::: théorème Intégrale d'une fonction positive {#thm-ig-positive}
Si $f$ est continue par morceaux et **positive** sur $[a, b[$, l'intégrale $\int_a^b f$ converge si et seulement si $x \mapsto \int_a^x f$ est **majorée** sur $[a, b[$.
:::

La fonction $F : x \mapsto \int_a^x f$ est croissante : par le [[limites-continuite#thm-limite-monotone|théorème de la limite monotone]], elle a une limite en $b$, finie si et seulement si $F$ est majorée. C'est la version continue du critère des séries à termes positifs.

::: théorème Comparaison pour les fonctions positives {#thm-comparaison-ig}
Soient $f$ et $g$ continues par morceaux et **positives** sur $[a, b[$.

- Si $0 \le f \le g$ et si $\int_a^b g$ converge, alors $\int_a^b f$ converge ; si $\int_a^b f$ diverge, $\int_a^b g$ diverge.
- Si $f(t) = O(g(t))$ quand $t \to b$ et si $\int_a^b g$ converge, alors $\int_a^b f$ converge.
- Si $f(t) \sim g(t)$ quand $t \to b$, les deux intégrales sont **de même nature**.
:::

On se ramène presque toujours à une intégrale de Riemann. Exemple : $\frac{1}{\sqrt{t}(1 + t)} \sim \frac{1}{\sqrt t}$ en $0$ et $\sim \frac{1}{t^{3/2}}$ en $+\infty$, donc $\int_0^{+\infty}\frac{dt}{\sqrt t(1 + t)}$ converge. Autre exemple : $t^{10}e^{-t} = O\left(\frac{1}{t^2}\right)$ en $+\infty$ par croissances comparées, donc $\int_0^{+\infty} t^{10}e^{-t}\,dt$ converge.

::: remarque Séries et intégrales {#rem-serie-integrale}
Pour $f$ positive et décroissante sur $[1, +\infty[$, la série $\sum f(n)$ et l'intégrale $\int_1^{+\infty} f$ sont de même nature ([[suites-series#thm-serie-integrale]]). Sans la monotonie, c'est faux : une fonction positive faite de pics de largeur $\frac{1}{n^3}$ et de hauteur $n$ aux entiers a une intégrale convergente, alors que $\sum f(n)$ diverge ; et une intégrale convergente n'impose pas $f(t) \to 0$.
:::

## Fonctions intégrables {#integrables}

::: définition Convergence absolue, fonction intégrable {#def-integrable}
L'intégrale $\int_I f$ est **absolument convergente** si $\int_I |f|$ converge. On dit alors que $f$ est **intégrable** sur $I$. L'ensemble des fonctions continues par morceaux et intégrables sur $I$ est un espace vectoriel.
:::

::: proposition L'absolue convergence entraîne la convergence {#prop-abs-cv}
Si $f$ est intégrable sur $I$, l'intégrale $\int_I f$ converge et $\left|\int_I f\right| \le \int_I |f|$.
:::

Pour $f$ réelle, on écrit $f = f^+ - f^-$ avec $0 \le f^\pm \le |f|$, et l'on applique la comparaison ; pour $f$ complexe, on traite parties réelle et imaginaire. Le critère pratique est la **domination** : si $|f(t)| \le g(t)$ ou $f(t) = O(g(t))$ au voisinage des bornes, avec $g$ intégrable, alors $f$ est intégrable.

::: exemple Une intégrale semi-convergente {#ex-dirichlet}
L'intégrale $\int_0^{+\infty}\frac{\sin t}{t}\,dt$ converge, mais $t \mapsto \frac{\sin t}{t}$ n'est pas intégrable sur $]0, +\infty[$ : la convergence est due aux compensations entre arches positives et négatives (exercice c1). Sa valeur est $\frac\pi2$.
:::

Comme pour les séries semi-convergentes, on manipule ces intégrales avec prudence : les théorèmes d'interversion (convergence dominée, intégration terme à terme, [[integrales-parametre]]) demandent l'intégrabilité.

## Calculer une intégrale généralisée {#calcul-ig}

::: théorème Changement de variable {#thm-cdv-ig}
Soient $f$ continue sur $]a, b[$ et $\varphi : ]\alpha, \beta[ \to\, ]a, b[$ une bijection de classe $C^1$ **strictement croissante**. Alors les intégrales $\int_a^b f(x)\,dx$ et $\int_\alpha^\beta f(\varphi(t))\,\varphi'(t)\,dt$ sont de même nature, et égales si elles convergent. Pour $\varphi$ strictement décroissante, on échange les bornes.
:::

Exemple : avec $t = \frac1u$, $\int_1^{+\infty}\frac{\ln t}{1 + t^2}\,dt = \int_0^1 \frac{-\ln u}{1 + u^2}\,du$, ce qui montre que $\int_0^{+\infty}\frac{\ln t}{1 + t^2}\,dt = 0$ (exercice m2).

::: méthode Intégrer par parties {#meth-ipp-ig}
On intègre par parties **sur un segment** $[a, x]$, puis on fait tendre $x$ vers la borne. Si $u$ et $v$ sont de classe $C^1$ et si $uv$ a une limite finie aux bornes, les intégrales $\int u'v$ et $\int uv'$ sont de même nature, et
$$\int_a^b u'v = \big[uv\big]_a^b - \int_a^b uv', \qquad \big[uv\big]_a^b = \lim_{b^-} uv - \lim_{a^+} uv.$$
:::

Exemple : $\int_1^{+\infty}\frac{\ln t}{t^2}\,dt = \left[-\frac{\ln t}{t}\right]_1^{+\infty} + \int_1^{+\infty}\frac{dt}{t^2} = 0 + 1 = 1$.

::: théorème Intégration des relations de comparaison (MP, MPI) {#thm-relations-ig}
Soient $f$ continue par morceaux et $g$ continue par morceaux, positive, sur $[a, b[$.

- Si $g$ est intégrable et $f(t) = o(g(t))$ (respectivement $O$, $\sim$) en $b$, alors $\int_x^b f = o\left(\int_x^b g\right)$ (respectivement $O$, $\sim$) quand $x \to b$ : on compare les **restes**.
- Si $g$ n'est pas intégrable et $f(t) = o(g(t))$ (respectivement $O$, $\sim$) en $b$, alors $\int_a^x f = o\left(\int_a^x g\right)$ (respectivement $O$, $\sim$) : on compare les **intégrales partielles**.
:::

Exemple : $\int_x^{+\infty}e^{-t^2}\,dt \sim \frac{e^{-x^2}}{2x}$ en $+\infty$, en comparant à $\int_x^{+\infty}\left(1 + \frac{1}{2t^2}\right)e^{-t^2}dt = \frac{e^{-x^2}}{2x}$, dont l'intégrande est équivalent à $e^{-t^2}$.

::: exemple La fonction Γ d'Euler {#ex-gamma}
Pour $x > 0$, l'intégrale $\Gamma(x) = \int_0^{+\infty} t^{x-1}e^{-t}\,dt$ converge : l'intégrande est équivalent à $t^{x-1}$ en $0$ (intégrable car $x - 1 > -1$) et est $O\left(\frac{1}{t^2}\right)$ en $+\infty$. Par parties, $\Gamma(x + 1) = x\,\Gamma(x)$, et $\Gamma(1) = 1$, donc $\Gamma(n + 1) = n!$ : la fonction $\Gamma$ prolonge la factorielle (exercice m1).
:::
