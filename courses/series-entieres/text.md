## Rayon de convergence {#rayon}

Une série entière est un « polynôme de degré infini » : $\sum a_n z^n$. Ces séries représentent la plupart des fonctions usuelles, se dérivent terme à terme et permettent de résoudre des équations différentielles ou de compter des objets. Leur premier mystère est géométrique : l'ensemble des $z$ où elles convergent est, à son bord près, un disque.

::: définition Série entière {#def-se}
Une **série entière** est une série de fonctions de la forme $\sum_{n \ge 0} a_n z^n$, où $(a_n)$ est une suite de nombres complexes et $z$ une variable complexe (ou réelle, et l'on écrit alors $x$).
:::

::: lemme Lemme d'Abel {#lem-abel}
Si la suite $(a_n z_0^n)$ est bornée pour un certain $z_0 \neq 0$, alors la série $\sum a_n z^n$ converge absolument pour tout $z$ tel que $|z| < |z_0|$.
:::

::: preuve Comparaison géométrique
Si $|a_n z_0^n| \le M$ pour tout $n$, alors $|a_n z^n| = |a_n z_0^n| \left|\frac{z}{z_0}\right|^n \le M q^n$ avec $q = \left|\frac{z}{z_0}\right| < 1$ : la série est dominée par une série géométrique convergente.
:::

::: définition Rayon de convergence {#def-rayon}
Le **rayon de convergence** de $\sum a_n z^n$ est
$$R = \sup\{r \ge 0 : (a_n r^n) \text{ est bornée}\} \in [0, +\infty].$$
:::

::: théorème Disque de convergence {#thm-disque}
Soit $R$ le rayon de convergence de $\sum a_n z^n$.

- Si $|z| < R$, la série converge absolument.
- Si $|z| > R$, la suite $(a_n z^n)$ n'est pas bornée et la série diverge grossièrement.
- Sur le cercle $|z| = R$, tout peut arriver.
:::

Les trois séries $\sum z^n$, $\sum \frac{z^n}{n}$ et $\sum \frac{z^n}{n^2}$ ont toutes pour rayon $1$. La première diverge en tout point du cercle unité, puisque son terme général est de module $1$ ; la deuxième diverge en $1$ (série harmonique) et converge en $-1$ (série alternée) ; la troisième converge absolument sur tout le cercle. Le rayon décrit donc le comportement à l'intérieur et à l'extérieur, jamais sur le bord.

::: proposition Calcul du rayon {#prop-calcul-rayon}
- (**d'Alembert**) Si $a_n \neq 0$ à partir d'un certain rang et $\left|\frac{a_{n+1}}{a_n}\right| \to \ell \in [0, +\infty]$, alors $R = \frac{1}{\ell}$ (avec $\frac10 = +\infty$ et $\frac{1}{\infty} = 0$).
- (**comparaison**) Si $|a_n| \le |b_n|$ à partir d'un certain rang, alors $R_a \ge R_b$ ; si $a_n \sim b_n$, ou plus généralement si $|a_n|$ et $|b_n|$ sont équivalents, les rayons sont égaux.
- Les séries $\sum a_n z^n$ et $\sum n a_n z^n$ ont le même rayon.
:::

La [[suites-series#thm-dalembert|règle de d'Alembert]] s'applique à la série $\sum |a_n| r^n$ : son quotient tend vers $\ell r$. On en tire que $\sum \frac{z^n}{n!}$ a un rayon infini et que $\sum n! z^n$ a un rayon nul. Quand des puissances manquent, comme dans $\sum \frac{z^{2n}}{4^n}$, on ne peut pas appliquer la règle aux coefficients ; on l'applique au terme général, ou l'on pose $w = z^2$. La dernière propriété dit que dériver terme à terme ne change pas le rayon.

::: proposition Opérations {#prop-operations-se}
Si $\sum a_n z^n$ et $\sum b_n z^n$ ont pour rayons $R_a$ et $R_b$, la somme $\sum (a_n + b_n) z^n$ et le [[suites-series#thm-produit-cauchy|produit de Cauchy]] $\sum c_n z^n$, avec $c_n = \sum_{k=0}^{n} a_k b_{n-k}$, ont un rayon au moins égal à $\min(R_a, R_b)$, et pour $|z| < \min(R_a, R_b)$ :
$$\sum (a_n + b_n) z^n = \sum a_n z^n + \sum b_n z^n, \qquad \sum c_n z^n = \Big(\sum a_n z^n\Big)\Big(\sum b_n z^n\Big).$$
:::

::: théorème Convergence normale sur les disques fermés {#thm-normale}
Pour tout $r$ tel que $0 \le r < R$, la série $\sum a_n z^n$ converge **normalement** sur le disque fermé $\{|z| \le r\}$ : $\sup_{|z| \le r} |a_n z^n| = |a_n| r^n$ et $\sum |a_n| r^n$ converge.
:::

## Régularité de la somme {#regularite}

::: théorème Continuité {#thm-continuite-se}
La somme $S(z) = \sum_{n=0}^{+\infty} a_n z^n$ est continue sur le disque ouvert de convergence $\{|z| < R\}$.
:::

Chaque point du disque ouvert est contenu dans un disque fermé $\{|z| \le r\}$ avec $r < R$, sur lequel la convergence est normale, donc uniforme : la somme d'une série uniformément convergente de fonctions continues est continue. Attention, la convergence n'est en général pas uniforme sur tout le disque ouvert : pour $\sum z^n$, la somme $\frac{1}{1 - z}$ n'est pas bornée.

::: théorème Dérivation et intégration terme à terme {#thm-derivation}
Sur $]-R, R[$, la somme $S(x) = \sum_{n \ge 0} a_n x^n$ est de classe $C^\infty$, et ses dérivées et primitives s'obtiennent terme à terme, avec le même rayon :
$$S'(x) = \sum_{n \ge 1} n a_n x^{n-1}, \qquad \int_0^x S(t)\,dt = \sum_{n \ge 0} \frac{a_n}{n+1} x^{n+1}.$$
En particulier $a_n = \frac{S^{(n)}(0)}{n!}$ : les coefficients sont déterminés par la somme.
:::

Ce théorème transforme des identités simples en développements. En intégrant $\frac{1}{1 - t} = \sum t^n$ sur $[0, x]$, on obtient $-\ln(1 - x) = \sum_{n \ge 1} \frac{x^n}{n}$ pour $|x| < 1$. En dérivant la série géométrique, $\frac{1}{(1 - x)^2} = \sum_{n \ge 1} n x^{n-1}$, d'où par exemple $\sum_{n \ge 1} \frac{n}{2^n} = 2$.

::: théorème Théorème radial d'Abel {#thm-abel-radial}
Si la série $\sum a_n R^n$ converge (avec $0 < R < +\infty$), alors $S(x) \to \sum_{n \ge 0} a_n R^n$ quand $x \to R^-$.
:::

Il permet de calculer des sommes au bord du disque. Comme $\ln(1 + x) = \sum_{n \ge 1} (-1)^{n+1} \frac{x^n}{n}$ sur $]-1, 1[$ et que la série alternée converge en $x = 1$, on obtient $\sum_{n \ge 1} \frac{(-1)^{n+1}}{n} = \ln 2$. La réciproque est fausse : $\sum (-1)^n x^n = \frac{1}{1 + x} \to \frac12$ quand $x \to 1^-$, alors que la série de Grandi $\sum (-1)^n$ diverge.

## Développements en série entière {#developpements}

::: définition Fonction développable en série entière {#def-dse}
Une fonction $f$ définie au voisinage de $0$ est **développable en série entière** sur $]-r, r[$ s'il existe une série entière de rayon au moins $r$ telle que $f(x) = \sum_{n \ge 0} a_n x^n$ pour tout $x \in \left]-r, r\right[$. Le développement est alors unique : c'est la **série de Taylor** de $f$, $a_n = \frac{f^{(n)}(0)}{n!}$.
:::

::: remarque Une fonction lisse n'est pas forcément développable {#rem-cauchy}
Être de classe $C^\infty$ ne suffit pas. La fonction de Cauchy $f(x) = e^{-1/x^2}$ pour $x \neq 0$, $f(0) = 0$, est de classe $C^\infty$ sur $\mathbb{R}$ avec $f^{(n)}(0) = 0$ pour tout $n$ : sa série de Taylor est nulle, mais $f$ ne l'est sur aucun voisinage de $0$. L'exercice complexe correspondant le démontre.
:::

::: proposition Développements usuels {#prop-dse-usuels}
Pour tout $x \in \mathbb{R}$ :
$$e^x = \sum_{n \ge 0} \frac{x^n}{n!}, \qquad \cos x = \sum_{n \ge 0} (-1)^n \frac{x^{2n}}{(2n)!}, \qquad \sin x = \sum_{n \ge 0} (-1)^n \frac{x^{2n+1}}{(2n+1)!}.$$
Pour $|x| < 1$ :
$$\frac{1}{1 - x} = \sum_{n \ge 0} x^n, \qquad \ln(1 + x) = \sum_{n \ge 1} (-1)^{n+1} \frac{x^n}{n}, \qquad \arctan x = \sum_{n \ge 0} (-1)^n \frac{x^{2n+1}}{2n+1},$$
$$(1 + x)^\alpha = 1 + \sum_{n \ge 1} \frac{\alpha(\alpha - 1)\cdots(\alpha - n + 1)}{n!}\, x^n \quad (\alpha \in \mathbb{R}).$$
:::

Pour l'exponentielle, on majore le reste de Taylor : $\left|e^x - \sum_{k \le n} \frac{x^k}{k!}\right| \le \frac{|x|^{n+1}}{(n+1)!} e^{|x|} \to 0$. Pour $\ln(1 + x)$ et $\arctan x$, on intègre les séries géométriques de $\frac{1}{1 + t}$ et $\frac{1}{1 + t^2}$. Pour $(1 + x)^\alpha$, la méthode suivante est la plus efficace.

::: méthode La méthode de l'équation différentielle {#meth-edo}
Pour développer une fonction $f$ en série entière :

1. trouver une équation différentielle linéaire simple vérifiée par $f$, avec ses conditions initiales ;
2. chercher une solution $\sum a_n x^n$ de rayon $R > 0$ : l'équation devient une relation de récurrence entre les $a_n$ ;
3. résoudre la récurrence, puis calculer le rayon de la série obtenue ;
4. conclure par unicité de la solution du problème de Cauchy ([[equations-differentielles#thm-cl]]) sur $]-R, R[$.
:::

Exemple : $f(x) = (1 + x)^\alpha$ vérifie $(1 + x) f'(x) = \alpha f(x)$ et $f(0) = 1$. En reportant $\sum a_n x^n$, on trouve $(n + 1) a_{n+1} + n a_n = \alpha a_n$, soit $a_{n+1} = \frac{\alpha - n}{n + 1} a_n$ ; la série a pour rayon $1$ si $\alpha \notin \mathbb{N}$, par d'Alembert, et sa somme, solution du même problème de Cauchy, est $f$.

## L'exponentielle complexe {#exponentielle}

::: définition Exponentielle complexe {#def-exp}
Pour $z \in \mathbb{C}$, on pose $\exp(z) = \sum_{n \ge 0} \frac{z^n}{n!}$ ; cette série entière a un rayon infini.
:::

::: théorème Propriété de morphisme {#thm-morphisme}
Pour tous $a, b \in \mathbb{C}$, $\exp(a + b) = \exp(a)\exp(b)$. En conséquence, $\exp(z) \neq 0$ et $\exp(-z) = \frac{1}{\exp(z)}$ pour tout $z$.
:::

La preuve est un produit de Cauchy de deux séries absolument convergentes : le terme de degré $n$ vaut $\sum_{k=0}^{n} \frac{a^k}{k!}\frac{b^{n-k}}{(n-k)!} = \frac{(a + b)^n}{n!}$ par la formule du binôme. C'est l'origine de toutes les propriétés de l'exponentielle.

::: proposition Formules d'Euler {#prop-euler}
Pour $\theta \in \mathbb{R}$, en séparant les termes pairs et impairs de la série,
$$e^{i\theta} = \cos\theta + i \sin\theta, \qquad \cos\theta = \frac{e^{i\theta} + e^{-i\theta}}{2}, \qquad \sin\theta = \frac{e^{i\theta} - e^{-i\theta}}{2i},$$
et $|e^{i\theta}| = 1$. Pour $z = x + iy$, $e^z = e^x(\cos y + i \sin y)$.
:::

On peut prendre ces formules comme **définitions** de $\cos$ et $\sin$ ; les propriétés de la trigonométrie (formules d'addition, $\cos^2 + \sin^2 = 1$) découlent alors du morphisme. La vue « Séries de Taylor » de l'explorateur montre les sommes partielles de ces séries s'enrouler autour des fonctions qu'elles approchent : de plus en plus loin de $0$ à mesure que le degré augmente, jamais au-delà du rayon de convergence.
