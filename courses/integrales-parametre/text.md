## Convergence dominée {#convergence-dominee}

Le cours [[suites-series-fonctions#thm-integration-segment|Suites et séries de fonctions]] permet de passer à la limite sous l'intégrale sur un **segment**, par convergence uniforme. Sur un intervalle quelconque, la convergence uniforme ne suffit plus, et elle est souvent trop exigeante. Le bon outil est la **domination** : une seule fonction intégrable qui majore toute la suite. Dans ce cours, $I$ est un intervalle de $\mathbb{R}$, et les fonctions sont continues par morceaux sur $I$ (on vérifie en pratique les hypothèses de convergence et de domination, sans expliciter celles de continuité par morceaux). Ce premier chapitre est au programme de MP, MPI, PC et PSI ; en PT, on passe directement à l'intégration terme à terme.

::: théorème Théorème de convergence dominée {#thm-convergence-dominee}
Soit $(f_n)$ une suite de fonctions continues par morceaux sur $I$ qui converge simplement sur $I$ vers une fonction $f$ continue par morceaux. S'il existe une fonction $\varphi$ **intégrable** sur $I$, **indépendante de $n$**, telle que $|f_n| \le \varphi$ pour tout $n$ (hypothèse de **domination**), alors les $f_n$ et $f$ sont intégrables sur $I$ et
$$\int_I f_n(t)\,dt \xrightarrow[n \to +\infty]{} \int_I f(t)\,dt.$$
:::

La démonstration est hors programme (elle relève de l'intégrale de Lebesgue, [[riemann-lebesgue]]). L'intégrabilité de $f_n$ et $f$ découle de $|f_n| \le \varphi$ et, par passage à la limite, $|f| \le \varphi$.

::: exemple Une limite d'intégrales {#ex-cd}
Pour $f_n(t) = \left(1 - \frac tn\right)^n$ sur $[0, n]$ et $0$ au-delà : $f_n(t) \to e^{-t}$ pour tout $t \ge 0$, et $0 \le f_n(t) \le e^{-t}$, car $\ln(1 - u) \le -u$. La domination par $e^{-t}$, intégrable sur $\mathbb{R}_+$, donne $\int_0^n\left(1 - \frac tn\right)^n dt \to \int_0^{+\infty}e^{-t}\,dt = 1$.
:::

::: remarque Sans domination, rien ne va {#rem-domination}
Pour $f_n = n\,\mathbf{1}_{]0, 1/n]}$ sur $]0, 1]$ (ou une version continue en forme de triangle), $f_n \to 0$ simplement, mais $\int f_n = 1$ pour tout $n$ : la masse se concentre. Aucune fonction intégrable ne majore toutes les $f_n$, puisque $\sup_n f_n(t)$ est de l'ordre de $\frac1t$, non intégrable en $0$. La domination interdit exactement ce phénomène : la masse ne peut ni se concentrer, ni s'échapper à l'infini.
:::

## Intégration terme à terme {#terme-a-terme}

::: théorème Intégration terme à terme {#thm-terme-a-terme}
Soit $(f_n)$ une suite de fonctions continues par morceaux et **intégrables** sur $I$, telle que la série $\sum f_n$ converge simplement vers une fonction $S$ continue par morceaux sur $I$. Si la série numérique $\sum_n \int_I |f_n(t)|\,dt$ **converge**, alors $S$ est intégrable sur $I$ et
$$\int_I \sum_{n=0}^{+\infty} f_n(t)\,dt = \sum_{n=0}^{+\infty}\int_I f_n(t)\,dt.$$
:::

La démonstration est hors programme. Pour des fonctions **positives**, l'hypothèse est simplement la convergence de la série des intégrales, et c'est souvent le cas le plus utile (exercice m1). En PT, le programme énonce le théorème avec $S$ continue.

::: exemple Une intégrale qui vaut ζ(2) {#ex-terme}
Pour $t > 0$, $\frac{t}{e^t - 1} = \sum_{n \ge 1} t e^{-nt}$ (série géométrique de raison $e^{-t} < 1$). Les fonctions $t \mapsto te^{-nt}$ sont positives, d'intégrale $\frac{1}{n^2}$ sur $]0, +\infty[$, et $\sum\frac{1}{n^2}$ converge. Donc
$$\int_0^{+\infty}\frac{t}{e^t - 1}\,dt = \sum_{n=1}^{+\infty}\frac{1}{n^2} = \frac{\pi^2}{6}.$$
:::

::: remarque Quand la série des intégrales de |fₙ| diverge {#rem-sommes-partielles}
Le théorème ne s'applique pas toujours : pour $\int_0^1\frac{dt}{1 + t} = \sum_{n \ge 0}\int_0^1(-1)^n t^n\,dt$, on a $\sum\int_0^1 t^n\,dt = \sum\frac{1}{n + 1}$, divergente. On applique alors la **convergence dominée aux sommes partielles** : $\left|\sum_{k=0}^{n}(-t)^k\right| = \left|\frac{1 - (-t)^{n+1}}{1 + t}\right| \le 2$, intégrable sur $[0, 1]$, d'où $\ln 2 = \sum_{n \ge 0}\frac{(-1)^n}{n + 1}$ (MP, MPI, PC, PSI).
:::

## Continuité d'une intégrale à paramètre {#continuite-param}

On étudie maintenant $F(x) = \int_I f(x, t)\,dt$, où $x$ parcourt une partie $A$ de $\mathbb{R}$ (un intervalle), et $f : A \times I \to \mathbb{K}$.

::: théorème Continuité sous le signe intégrale {#thm-continuite-param}
Supposons que :

- pour tout $t \in I$, $x \mapsto f(x, t)$ est continue sur $A$ ;
- pour tout $x \in A$, $t \mapsto f(x, t)$ est continue par morceaux sur $I$ ;
- (**domination**) il existe $\varphi$ intégrable sur $I$ telle que $|f(x, t)| \le \varphi(t)$ pour tous $(x, t) \in A \times I$.

Alors $F : x \mapsto \int_I f(x, t)\,dt$ est définie et continue sur $A$.
:::

Avec la caractérisation séquentielle de la continuité, c'est une conséquence de la convergence dominée (en MP, MPI, PC, PSI) ; en PT la démonstration est hors programme.

::: remarque Domination locale {#rem-domination-locale}
La continuité est une propriété **locale** : il suffit que l'hypothèse de domination soit vraie sur tout segment $[a, b]$ inclus dans $A$ (avec une fonction $\varphi_{a,b}$ qui peut dépendre du segment). C'est indispensable dès que la domination globale échoue : pour $\Gamma(x) = \int_0^{+\infty}t^{x-1}e^{-t}dt$, on domine sur $[a, b] \subset\, ]0, +\infty[$ par $\varphi(t) = t^{a-1}e^{-t}$ pour $t \le 1$ et $t^{b-1}e^{-t}$ pour $t \ge 1$. Le passage par une domination locale fait l'objet d'une question explicite dans les sujets.
:::

## Dérivation d'une intégrale à paramètre {#derivation-param}

::: théorème Dérivation sous le signe intégrale {#thm-derivation-param}
Soit $A$ un intervalle. Supposons que :

- pour tout $x \in A$, $t \mapsto f(x, t)$ est continue par morceaux et **intégrable** sur $I$ ;
- pour tout $t \in I$, $x \mapsto f(x, t)$ est de classe $C^1$ sur $A$ ;
- pour tout $x \in A$, $t \mapsto \frac{\partial f}{\partial x}(x, t)$ est continue par morceaux sur $I$ ;
- (**domination**) il existe $\varphi$ intégrable sur $I$ telle que $\left|\frac{\partial f}{\partial x}(x, t)\right| \le \varphi(t)$ pour tous $(x, t)$.

Alors $F$ est de classe $C^1$ sur $A$ et, pour tout $x \in A$,
$$F'(x) = \int_I \frac{\partial f}{\partial x}(x, t)\,dt \qquad \text{(formule de Leibniz)}.$$
:::

C'est encore une conséquence de la convergence dominée, appliquée aux taux d'accroissement grâce aux accroissements finis. La domination locale (sur les segments de $A$) suffit. Par récurrence, on obtient la **classe $C^k$** : si les dérivées partielles jusqu'à l'ordre $k$ existent, les $\frac{\partial^j f}{\partial x^j}(x, \cdot)$ sont intégrables pour $j < k$, et la dérivée $k$-ième est dominée.

::: méthode Étudier une intégrale à paramètre {#meth-param}
1. **Domaine** : pour quels $x$ la fonction $t \mapsto f(x, t)$ est-elle intégrable ?
2. **Continuité** : majorer $|f(x, t)|$ par une fonction de $t$ seule, sur $A$ ou sur ses segments.
3. **Dérivabilité** : calculer $\frac{\partial f}{\partial x}$ et la dominer de même ; écrire $F'$.
4. **Calculer** : souvent, $F'$ s'exprime à l'aide de $F$ (intégration par parties), et l'on résout une équation différentielle, ou bien $F'$ se calcule explicitement.
5. **Limites aux bornes** : convergence dominée (ou majoration directe).
:::

::: exemple La fonction Γ est de classe C^∞ {#ex-gamma-ck}
Sur $]0, +\infty[$, $\frac{\partial^k}{\partial x^k}\big(t^{x-1}e^{-t}\big) = (\ln t)^k t^{x-1}e^{-t}$. Sur tout $[a, b] \subset\, ]0, +\infty[$, elle est dominée par $|\ln t|^k\big(t^{a-1} + t^{b-1}\big)e^{-t}$, intégrable sur $]0, +\infty[$. Donc la [[integrales-generalisees#ex-gamma|fonction Γ]] est de classe $C^\infty$, avec $\Gamma^{(k)}(x) = \int_0^{+\infty}(\ln t)^k t^{x-1}e^{-t}\,dt$. En particulier $\Gamma'' > 0$ : $\Gamma$ est convexe.
:::

::: exemple La transformée de la gaussienne {#ex-gaussienne}
Pour $F(x) = \int_0^{+\infty}e^{-t^2}\cos(xt)\,dt$, la dérivée partielle $-te^{-t^2}\sin(xt)$ est dominée par $te^{-t^2}$, intégrable : $F$ est $C^1$, et une intégration par parties donne $F'(x) = -\frac x2 F(x)$. Avec l'**intégrale de Gauss** $\int_0^{+\infty}e^{-t^2}\,dt = \frac{\sqrt\pi}{2}$ (admise ici), on obtient $F(x) = \frac{\sqrt\pi}{2}e^{-x^2/4}$ (exercice m2).
:::
