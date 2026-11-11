## Sommes, produits, binôme {#sommes}

Cette fiche est une boîte à outils : elle complète le lycée sur les calculs qui reviennent partout ensuite (sommes, coefficients binomiaux, inégalités, trigonométrie). La résolution de petits systèmes linéaires par le pivot, qui fait aussi partie de cette section du programme, est traitée dans le cours [[calcul-matriciel#meth-pivot|Calcul matriciel]].

::: définition Notations Σ et Π {#def-somme}
Pour une famille finie $(a_i)_{i \in I}$ de réels ou de complexes, $\sum_{i \in I} a_i$ désigne leur somme et $\prod_{i \in I} a_i$ leur produit ; on écrit $\sum_{i=1}^{n} a_i$ quand $I = \{1, \ldots, n\}$. Par convention, une somme vide vaut $0$ et un produit vide vaut $1$. L'indice est **muet** : $\sum_{i=1}^{n} a_i = \sum_{k=1}^{n} a_k$.
:::

Les changements d'indice décalent ou retournent la sommation : $\sum_{k=1}^{n} a_k = \sum_{j=0}^{n-1} a_{j+1}$ (avec $j = k - 1$) et $\sum_{k=0}^{n} a_k = \sum_{k=0}^{n} a_{n-k}$. Le second donne la somme de Gauss : en ajoutant $\sum_{k=0}^{n} k$ et $\sum_{k=0}^{n} (n - k)$, on obtient $n(n + 1)$.

::: proposition Télescopage {#prop-telescopage}
Pour toute suite $(a_k)$ et tous $m \le n$,
$$\sum_{k=m}^{n} (a_{k+1} - a_k) = a_{n+1} - a_m, \qquad \prod_{k=m}^{n} \frac{a_{k+1}}{a_k} = \frac{a_{n+1}}{a_m} \quad (a_k \neq 0).$$
:::

Exemple : $\frac{1}{k(k+1)} = \frac1k - \frac{1}{k+1}$, donc $\sum_{k=1}^{n} \frac{1}{k(k+1)} = 1 - \frac{1}{n+1}$. Tout l'art est de **reconnaître** une différence $a_{k+1} - a_k$.

::: proposition Sommes usuelles {#prop-sommes-usuelles}
Pour $n \in \mathbb{N}$ :
$$\sum_{k=1}^{n} k = \frac{n(n+1)}{2}, \qquad \sum_{k=1}^{n} k^2 = \frac{n(n+1)(2n+1)}{6},$$
$$\sum_{k=0}^{n} x^k = \frac{1 - x^{n+1}}{1 - x} \quad (x \neq 1).$$
:::

Les deux premières se prouvent par récurrence ou par télescopage (par exemple $(k + 1)^3 - k^3 = 3k^2 + 3k + 1$, sommé de $k = 1$ à $n$). La somme géométrique vient de $(1 - x)(1 + x + \cdots + x^n) = 1 - x^{n+1}$, autre télescopage.

::: proposition Factorisation de aⁿ − bⁿ {#prop-an-bn}
Pour tous réels ou complexes $a, b$ et tout $n \ge 1$,
$$a^n - b^n = (a - b)\sum_{k=0}^{n-1} a^k b^{n-1-k} = (a - b)(a^{n-1} + a^{n-2}b + \cdots + b^{n-1}).$$
:::

### Coefficients binomiaux

::: définition Factorielle, coefficients binomiaux {#def-binom}
Pour $n \in \mathbb{N}$, $n! = \prod_{k=1}^{n} k$ (avec $0! = 1$). Pour $0 \le k \le n$, on pose
$$\binom{n}{k} = \frac{n!}{k!\,(n-k)!},$$
et, par convention, $\binom nk = 0$ si $k < 0$ ou $k > n$.
:::

::: proposition Symétrie et relation de Pascal {#prop-pascal}
Pour $0 \le k \le n$, $\binom{n}{k} = \binom{n}{n-k}$, et pour $n \ge 1$ et tout entier $k$,
$$\binom{n}{k} = \binom{n-1}{k-1} + \binom{n-1}{k}.$$
En particulier, les $\binom nk$ sont des entiers : c'est le triangle de Pascal.
:::

La relation de Pascal se vérifie en réduisant au même dénominateur $k!(n - k)!$. Au second semestre, le dénombrement donnera son sens à $\binom nk$ : le nombre de parties à $k$ éléments d'un ensemble à $n$ éléments.

::: théorème Formule du binôme de Newton {#thm-binome}
Pour tous réels ou complexes $a, b$ et tout $n \in \mathbb{N}$,
$$(a + b)^n = \sum_{k=0}^{n} \binom{n}{k} a^k b^{n-k}.$$
:::

::: preuve Formule du binôme
Récurrence sur $n$. Pour $n = 0$, les deux membres valent $1$. Si la formule est vraie au rang $n$, alors
$$(a + b)^{n+1} = (a + b)\sum_{k=0}^{n}\binom nk a^k b^{n-k} = \sum_{k=0}^{n}\binom nk a^{k+1}b^{n-k} + \sum_{k=0}^{n}\binom nk a^k b^{n+1-k}.$$
Dans la première somme on pose $j = k + 1$ ; en regroupant les termes en $a^j b^{n+1-j}$, on obtient $\sum_{j=0}^{n+1}\Big[\binom{n}{j-1} + \binom{n}{j}\Big] a^j b^{n+1-j} = \sum_{j=0}^{n+1}\binom{n+1}{j} a^j b^{n+1-j}$, par la relation de Pascal (et les conventions aux bords).
:::

La preuve n'utilise que $ab = ba$ : la formule reste vraie dans tout anneau pour deux éléments qui **commutent**, en particulier pour des matrices ([[calcul-matriciel#thm-binome-m]]). Avec $a = b = 1$ : $\sum_k \binom nk = 2^n$ ; avec $a = -1$, $b = 1$ : $\sum_k (-1)^k\binom nk = 0$ pour $n \ge 1$.

::: méthode Sommes doubles {#meth-sommes-doubles}
Une somme indexée par un ensemble fini de couples se calcule en sommant d'abord sur un indice, puis sur l'autre, dans l'ordre que l'on veut :
$$\sum_{1 \le i \le j \le n} a_{ij} = \sum_{j=1}^{n}\sum_{i=1}^{j} a_{ij} = \sum_{i=1}^{n}\sum_{j=i}^{n} a_{ij}.$$
Le produit de deux sommes est une somme double : $\big(\sum_{i} a_i\big)\big(\sum_j b_j\big) = \sum_{i,j} a_i b_j$. Exemple : $\sum_{1 \le i \le j \le n} 1 = \sum_{j=1}^{n} j = \frac{n(n+1)}{2}$, nombre de cases d'un triangle.
:::

## Inégalités et partie entière {#inegalites}

On ne manipule d'inégalités qu'entre réels. On peut ajouter un même réel aux deux membres, multiplier par un réel **positif** (un négatif renverse l'inégalité), et additionner deux inégalités de même sens ; on ne peut ni les soustraire ni les diviser membre à membre. Pour étudier le signe d'une expression, on la **factorise** et l'on dresse un tableau de signes.

::: proposition Valeur absolue, inégalité triangulaire {#prop-triangulaire-r}
Pour tous réels $x, y$ : $|xy| = |x|\,|y|$ et
$$\big|\,|x| - |y|\,\big| \le |x + y| \le |x| + |y|.$$
Pour $a \in \mathbb{R}$ et $r \ge 0$, $|x - a| \le r$ équivaut à $a - r \le x \le a + r$ : la distance de $x$ à $a$ est au plus $r$.
:::

::: définition Majorant, maximum {#def-majorant}
Une partie $A$ de $\mathbb{R}$ est **majorée** s'il existe $M$ tel que $x \le M$ pour tout $x \in A$ : un tel $M$ est un **majorant**. Si un majorant appartient à $A$, c'est le **maximum** (ou plus grand élément) de $A$, noté $\max A$ ; il est unique. Mêmes définitions pour minorant et minimum. Une partie majorée et minorée est **bornée**.
:::

L'intervalle $[0, 1[$ est borné, a un minimum $0$ mais pas de maximum : tout $x < 1$ est dépassé par $\frac{x + 1}{2}$, qui est encore dans l'intervalle. Le plus petit des majorants, $1$, est sa **borne supérieure**, étudiée dans le cours [[suites-series]].

::: définition Partie entière {#def-partie-entiere}
Pour tout réel $x$, il existe un unique entier $n$ tel que $n \le x < n + 1$ : c'est la **partie entière** de $x$, notée $\lfloor x \rfloor$. Ainsi $\lfloor x \rfloor \le x < \lfloor x \rfloor + 1$, et $x - 1 < \lfloor x \rfloor \le x$.
:::

Exemples : $\lfloor 2{,}7 \rfloor = 2$, $\lfloor -2{,}7 \rfloor = -3$ (et non $-2$). L'encadrement $x - 1 < \lfloor x \rfloor \le x$ sert à étudier les limites : $\frac{\lfloor nx \rfloor}{n} \to x$ par encadrement.

## Trigonométrie {#trigonometrie}

Le cercle trigonométrique est le cercle de centre $O$ et de rayon $1$ ; le point associé au réel $t$ a pour coordonnées $(\cos t, \sin t)$. Deux réels $a$ et $b$ repèrent le même point si et seulement si $a \equiv b\ [2\pi]$, c'est-à-dire $a - b \in 2\pi\mathbb{Z}$. On lit sur le cercle les symétries : $\cos(-t) = \cos t$, $\cos(\pi - t) = -\cos t$, $\cos(\frac\pi2 - t) = \sin t$, et les valeurs aux angles usuels $\frac\pi6, \frac\pi4, \frac\pi3$.

::: proposition Formules d'addition {#prop-addition}
Pour tous réels $a$ et $b$ :
$$\cos(a + b) = \cos a\cos b - \sin a\sin b, \qquad \sin(a + b) = \sin a\cos b + \cos a \sin b,$$
et, lorsque les tangentes sont définies, $\tan(a + b) = \frac{\tan a + \tan b}{1 - \tan a\tan b}$. On en déduit les formules pour $a - b$ en changeant $b$ en $-b$.
:::

Une justification géométrique : la rotation d'angle $a$ envoie le point d'angle $b$ sur le point d'angle $a + b$ ; ses coordonnées s'obtiennent par la matrice de la rotation. Avec les nombres complexes, tout se ramène à $e^{i(a+b)} = e^{ia}e^{ib}$ ([[nombres-complexes#prop-euler-moivre]]). Les produits se transforment en sommes : $\cos a \cos b = \frac12\big(\cos(a + b) + \cos(a - b)\big)$, et de même pour $\sin a \sin b$ et $\sin a\cos b$.

::: proposition Duplication et tangente de l'angle moitié {#prop-duplication}
$\cos(2a) = \cos^2 a - \sin^2 a = 2\cos^2 a - 1 = 1 - 2\sin^2 a$ et $\sin(2a) = 2\sin a\cos a$. Si $t \not\equiv \pi\ [2\pi]$, en posant $u = \tan\frac t2$ :
$$\cos t = \frac{1 - u^2}{1 + u^2}, \qquad \sin t = \frac{2u}{1 + u^2}.$$
:::

::: méthode Résoudre une équation trigonométrique {#meth-trigo}
On se ramène à une équation du type $\cos x = \cos a$, $\sin x = \sin a$ ou $\tan x = \tan a$, et l'on lit les solutions sur le cercle :
$$\cos x = \cos a \iff x \equiv a \text{ ou } x \equiv -a\ [2\pi],$$
$$\sin x = \sin a \iff x \equiv a \text{ ou } x \equiv \pi - a\ [2\pi],$$
et $\tan x = \tan a \iff x \equiv a\ [\pi]$. Pour une inéquation, on repère l'arc du cercle où la condition est vraie. Exemple : $\cos(2x) = \frac12 = \cos\frac\pi3$ équivaut à $2x \equiv \pm\frac\pi3\ [2\pi]$, soit $x \equiv \pm\frac\pi6\ [\pi]$.
:::

::: proposition Comparer sinus et angle {#prop-sin-x}
Pour tout réel $x$, $|\sin x| \le |x|$.
:::

Pour $0 \le x \le \frac\pi2$, l'aire du triangle de sommets $O$, $(1, 0)$ et $(\cos x, \sin x)$, qui vaut $\frac{\sin x}{2}$, est au plus celle du secteur angulaire, $\frac x2$. Pour $x > \frac\pi2$, $|\sin x| \le 1 < |x|$, et le cas $x < 0$ s'en déduit par imparité. Cette inégalité donne la continuité du sinus et du cosinus, puis leurs dérivées : $\frac{\sin x}{x} \to 1$ en $0$.
