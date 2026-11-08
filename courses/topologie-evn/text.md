## Normes {#normes}

Pour parler de limites, de continuité ou d'approximation dans un espace de vecteurs, de matrices ou de fonctions, il faut d'abord savoir mesurer la taille d'un vecteur. Une norme fait exactement cela, et toute la topologie du cours en découle. Ici $\mathbb{K} = \mathbb{R}$ ou $\mathbb{C}$.

::: définition Norme {#def-norme}
Une **norme** sur un $\mathbb{K}$-espace vectoriel $E$ est une application $N : E \to \mathbb{R}_+$ telle que, pour tous $x, y \in E$ et $\lambda \in \mathbb{K}$ :

- **séparation** : $N(x) = 0$ si et seulement si $x = 0$ ;
- **homogénéité** : $N(\lambda x) = |\lambda|\, N(x)$ ;
- **inégalité triangulaire** : $N(x + y) \le N(x) + N(y)$.

La **distance** associée est $d(x, y) = N(x - y)$ ; la **boule ouverte** de centre $a$ et de rayon $r > 0$ est $B(a, r) = \{x : N(x - a) < r\}$, la boule fermée $\overline{B}(a, r)$ est définie avec $\le$.
:::

Sur $\mathbb{K}^n$, les trois normes usuelles sont $\|x\|_1 = \sum_i |x_i|$, $\|x\|_2 = \sqrt{\sum_i |x_i|^2}$ et $\|x\|_\infty = \max_i |x_i|$. Dans le plan, leurs boules unités sont un losange, un disque et un carré. Sur l'espace $C([a, b], \mathbb{K})$ des fonctions continues, on utilise la **norme de la convergence uniforme** $\|f\|_\infty = \max_{[a,b]} |f|$ et la norme $\|f\|_1 = \int_a^b |f|$. On déduit de l'inégalité triangulaire que $|N(x) - N(y)| \le N(x - y)$ : une norme est $1$-lipschitzienne.

::: définition Normes équivalentes {#def-equiv}
Deux normes $N$ et $N'$ sur $E$ sont **équivalentes** s'il existe des constantes $\alpha, \beta > 0$ telles que $\alpha N \le N' \le \beta N$.
:::

::: proposition Les normes usuelles de K^n {#prop-normes-kn}
Pour tout $x \in \mathbb{K}^n$,
$$\|x\|_\infty \le \|x\|_2 \le \|x\|_1 \le n\, \|x\|_\infty, \qquad \|x\|_2 \le \sqrt n\, \|x\|_\infty, \qquad \|x\|_1 \le \sqrt n\, \|x\|_2.$$
Ces trois normes sont donc équivalentes.
:::

La dernière inégalité est Cauchy-Schwarz appliqué à $(|x_1|, \ldots, |x_n|)$ et $(1, \ldots, 1)$. Des normes équivalentes ont les mêmes suites convergentes, les mêmes parties bornées et, on le verra, les mêmes ouverts : pour la topologie, elles sont interchangeables. En dimension infinie, ce n'est plus vrai : sur $C([0, 1], \mathbb{R})$, la fonction $f_n(t) = t^n$ vérifie $\|f_n\|_\infty = 1$ et $\|f_n\|_1 = \frac{1}{n+1}$, donc aucune constante $\beta$ ne donne $\|f\|_\infty \le \beta \|f\|_1$.

::: définition Suites convergentes {#def-cv}
Une suite $(x_k)$ de $E$ **converge** vers $\ell \in E$ pour la norme $N$ si $N(x_k - \ell) \to 0$. Dans $\mathbb{K}^n$ muni de l'une des normes usuelles, cela équivaut à la convergence de chaque coordonnée.
:::

## Ouverts, fermés, adhérence {#topologie}

::: définition Ouverts et fermés {#def-ouvert}
Une partie $U$ de $E$ est **ouverte** si pour tout $a \in U$ il existe $r > 0$ tel que $B(a, r) \subset U$. Une partie est **fermée** si son complémentaire est ouvert.
:::

Une boule ouverte est ouverte, une boule fermée est fermée. Une réunion quelconque d'ouverts est ouverte, une intersection **finie** d'ouverts est ouverte ; dualement pour les fermés. La finitude est nécessaire : $\bigcap_{k \ge 1} \left]-\frac1k, \frac1k\right[ = \{0\}$ n'est pas ouvert. Attention, « fermé » n'est pas le contraire d'« ouvert » : $E$ et $\emptyset$ sont les deux à la fois, et un intervalle $[0, 1[$ n'est ni l'un ni l'autre dans $\mathbb{R}$.

::: définition Intérieur, adhérence, frontière {#def-adherence}
L'**intérieur** $\mathring{A}$ de $A$ est l'ensemble des points $a$ tels qu'une boule $B(a, r)$ soit contenue dans $A$ ; c'est le plus grand ouvert contenu dans $A$. L'**adhérence** $\overline{A}$ est l'ensemble des points $x$ dont toute boule $B(x, r)$ rencontre $A$ ; c'est le plus petit fermé contenant $A$. La **frontière** est $\overline{A} \setminus \mathring{A}$.
:::

::: théorème Caractérisation séquentielle {#thm-sequentielle}
Un point $x$ appartient à $\overline{A}$ si et seulement s'il est limite d'une suite d'éléments de $A$. En conséquence, $A$ est fermée si et seulement si la limite de toute suite convergente d'éléments de $A$ appartient à $A$.
:::

C'est la caractérisation la plus utile en pratique : pour montrer qu'une partie est fermée, on prend une suite qui converge et on vérifie que la propriété passe à la limite. L'ensemble des matrices de déterminant nul, celui des matrices symétriques, celui des fonctions positives sont fermés pour cette raison (ou parce qu'ils sont des images réciproques de fermés par des applications continues, comme on le verra).

::: définition Partie dense {#def-dense}
Une partie $A$ de $E$ est **dense** si $\overline{A} = E$ : tout élément de $E$ est limite d'une suite d'éléments de $A$.
:::

$\mathbb{Q}$ et $\mathbb{R} \setminus \mathbb{Q}$ sont denses dans $\mathbb{R}$. Le **théorème de Weierstrass** affirme que les fonctions polynomiales sont denses dans $C([a, b], \mathbb{R})$ pour la norme $\|\cdot\|_\infty$ : toute fonction continue sur un segment est limite uniforme de polynômes. La densité permet de démontrer une propriété sur des objets simples puis de l'étendre par continuité.

## Continuité {#continuite}

::: définition Limite et continuité {#def-continuite}
Soient $(E, \|\cdot\|_E)$, $(F, \|\cdot\|_F)$ deux espaces normés, $A \subset E$, $f : A \to F$ et $a \in \overline{A}$. On dit que $f(x) \to \ell$ quand $x \to a$ si
$$\forall \varepsilon > 0,\ \exists \delta > 0,\ \forall x \in A,\quad \|x - a\|_E \le \delta \implies \|f(x) - \ell\|_F \le \varepsilon.$$
L'application $f$ est **continue** en $a \in A$ si $f(x) \to f(a)$, et continue sur $A$ si elle l'est en tout point.
:::

::: théorème Caractérisation séquentielle de la continuité {#thm-cont-seq}
L'application $f$ est continue en $a$ si et seulement si, pour toute suite $(x_k)$ de $A$ qui converge vers $a$, la suite $f(x_k)$ converge vers $f(a)$.
:::

::: proposition Images réciproques {#prop-reciproque}
Si $f : E \to F$ est continue, l'image réciproque d'un ouvert de $F$ est un ouvert de $E$, et l'image réciproque d'un fermé est un fermé.
:::

C'est la façon la plus rapide de reconnaître ouverts et fermés : $\{(x, y) : x^2 + y^2 < 1\}$ est ouvert comme image réciproque de $]-\infty, 1[$ par une fonction continue, $\{(x, y) : xy \ge 1\}$ est fermé, et le groupe $GL_n(\mathbb{K})$ des matrices inversibles est ouvert dans $\mathcal{M}_n(\mathbb{K})$, car c'est l'image réciproque de $\mathbb{K}^*$ par le déterminant, qui est polynomial donc continu.

::: définition Applications lipschitziennes et uniformément continues {#def-lipschitz}
L'application $f : A \to F$ est **$k$-lipschitzienne** si $\|f(x) - f(y)\|_F \le k\,\|x - y\|_E$ pour tous $x, y \in A$. Elle est **uniformément continue** si
$$\forall \varepsilon > 0,\ \exists \delta > 0,\ \forall x, y \in A,\quad \|x - y\|_E \le \delta \implies \|f(x) - f(y)\|_F \le \varepsilon.$$
Lipschitzienne implique uniformément continue, qui implique continue.
:::

La différence avec la continuité est l'ordre des quantificateurs : dans la continuité uniforme, $\delta$ ne dépend pas du point. La fonction $x \mapsto x^2$ est continue mais pas uniformément continue sur $\mathbb{R}$ ; $x \mapsto \sqrt x$ est uniformément continue sur $\mathbb{R}_+$ sans être lipschitzienne. L'exercice correspondant le vérifie.

::: théorème Continuité des applications linéaires {#thm-lin-continue}
Pour une application linéaire $u : E \to F$, les propriétés suivantes sont équivalentes : $u$ est continue ; $u$ est continue en $0$ ; il existe $C \ge 0$ tel que $\|u(x)\|_F \le C\,\|x\|_E$ pour tout $x \in E$ ; $u$ est lipschitzienne.
:::

::: définition Norme subordonnée {#def-subordonnee}
Pour $u$ linéaire continue, la **norme subordonnée** est
$$|||u||| = \sup_{x \neq 0} \frac{\|u(x)\|_F}{\|x\|_E} = \sup_{\|x\|_E = 1} \|u(x)\|_F.$$
C'est la plus petite constante $C$ du théorème ; elle vérifie $|||v \circ u||| \le |||v|||\;|||u|||$.
:::

En dimension infinie, une application linéaire peut ne pas être continue. Sur $\mathbb{R}[X]$ muni de $\|P\| = \max_{[0,1]} |P|$, la dérivation n'est pas continue : $\|X^n\| = 1$ alors que $\|(X^n)'\| = n$. Le théorème suivant montre que ce phénomène est impossible en dimension finie.

## Compacité et dimension finie {#compacite}

::: définition Partie compacte {#def-compact}
Une partie $K$ de $E$ est **compacte** si toute suite d'éléments de $K$ admet une suite extraite qui converge vers un élément de $K$.
:::

::: proposition Compact implique fermé borné {#prop-compact-ferme}
Une partie compacte est fermée et bornée. Une partie fermée d'un compact est compacte.
:::

::: théorème Compacts de la dimension finie {#thm-compact-dimfinie}
Dans un espace vectoriel normé de dimension finie, une partie est compacte si et seulement si elle est fermée et bornée.
:::

Dans $\mathbb{K}^n$ muni de $\|\cdot\|_\infty$, c'est le théorème de Bolzano-Weierstrass appliqué coordonnée par coordonnée : on extrait une sous-suite dont la première coordonnée converge, puis une sous-suite de celle-ci dont la deuxième converge, et ainsi de suite. En dimension infinie, la boule unité fermée n'est jamais compacte : dans $C([0,1])$ muni de $\|\cdot\|_\infty$, la suite $f_n(t) = t^n$, de norme $1$, n'a aucune sous-suite convergente.

::: théorème Image continue d'un compact {#thm-image-compact}
L'image d'un compact par une application continue est compacte. En particulier, une fonction continue $f : K \to \mathbb{R}$ sur un compact non vide est **bornée et atteint ses bornes**.
:::

::: théorème Théorème de Heine {#thm-heine}
Une application continue sur un compact y est uniformément continue.
:::

::: théorème Équivalence des normes en dimension finie {#thm-equiv-dimfinie}
Sur un espace vectoriel de dimension finie, toutes les normes sont équivalentes.
:::

::: preuve Par la compacité de la sphère
On se ramène à $\mathbb{K}^n$ par le choix d'une base, et il suffit de comparer une norme $N$ quelconque à $\|\cdot\|_\infty$. D'une part, $N(x) = N\left(\sum x_i e_i\right) \le \sum |x_i|\, N(e_i) \le \beta \|x\|_\infty$ avec $\beta = \sum_i N(e_i)$ ; en particulier $N$ est continue pour $\|\cdot\|_\infty$. D'autre part, la sphère $S = \{x : \|x\|_\infty = 1\}$ est fermée et bornée, donc compacte : la fonction continue $N$ y atteint son minimum $\alpha$, qui est strictement positif car $N$ ne s'annule pas sur $S$. Par homogénéité, $N(x) \ge \alpha \|x\|_\infty$ pour tout $x$.
:::

Les conséquences sont nombreuses : en dimension finie, la notion de convergence ne dépend pas de la norme ; toute application linéaire définie sur un espace de dimension finie est continue ; tout sous-espace de dimension finie d'un espace normé est fermé ; et un espace normé de dimension finie est **complet** : toute suite de Cauchy y converge, ce qui fonde les théorèmes de point fixe.

::: définition Connexité par arcs {#def-connexe}
Une partie $A$ est **connexe par arcs** si deux points quelconques $a, b \in A$ peuvent être reliés par un chemin continu $\gamma : [0, 1] \to A$ avec $\gamma(0) = a$ et $\gamma(1) = b$. Les parties convexes, en particulier les boules, sont connexes par arcs (chemin $t \mapsto (1 - t)a + tb$).
:::

::: théorème Théorème des valeurs intermédiaires généralisé {#thm-tvi}
L'image d'une partie connexe par arcs par une application continue est connexe par arcs. En particulier, si $A$ est connexe par arcs et $f : A \to \mathbb{R}$ est continue, $f(A)$ est un intervalle : $f$ prend toutes les valeurs comprises entre deux de ses valeurs.
:::

Les parties connexes par arcs de $\mathbb{R}$ sont exactement les intervalles. Le groupe $GL_n(\mathbb{R})$ n'est pas connexe par arcs : le déterminant, continu, y prend des valeurs positives et négatives mais jamais $0$. On peut montrer qu'il a exactement deux « morceaux », les matrices de déterminant positif et celles de déterminant négatif, alors que $GL_n(\mathbb{C})$ est connexe par arcs.
