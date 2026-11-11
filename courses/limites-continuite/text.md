## Limite d'une fonction {#limites}

Le cours [[suites-series]] a défini la limite d'une suite. On passe ici aux fonctions d'une variable réelle : la variable ne grandit plus par sauts entiers, elle s'approche d'un point. Les idées sont les mêmes, et la **caractérisation séquentielle** permettra de ramener beaucoup de preuves au cas des suites. Dans tout le cours, $I$ est un intervalle de $\mathbb{R}$ non vide et non réduit à un point, et $f : I \to \mathbb{R}$. Les points $a$ considérés sont des éléments de $I$ ou des extrémités de $I$, éventuellement $\pm\infty$ ; on note $\overline{\mathbb{R}} = \mathbb{R} \cup \{-\infty, +\infty\}$.

::: définition Propriété vraie au voisinage d'un point {#def-voisinage}
Une propriété portant sur $f$ est vraie **au voisinage de $a$** si elle est vraie sur l'intersection de $I$ avec un intervalle $]a - \eta, a + \eta[$ ($\eta > 0$) lorsque $a$ est réel, avec un intervalle $]A, +\infty[$ lorsque $a = +\infty$, avec un intervalle $]-\infty, A[$ lorsque $a = -\infty$.
:::

::: définition Limite d'une fonction en un point {#def-limite-f}
Soient $a \in \overline{\mathbb{R}}$ un point de $I$ ou une extrémité de $I$, et $\ell \in \mathbb{R}$.

- Pour $a$ réel : $f$ **tend vers $\ell$ en $a$** si $\forall \varepsilon > 0,\ \exists \eta > 0,\ \forall x \in I,\ |x - a| \le \eta \implies |f(x) - \ell| \le \varepsilon$.
- Pour $a = +\infty$ : $\forall \varepsilon > 0,\ \exists A \in \mathbb{R},\ \forall x \in I,\ x \ge A \implies |f(x) - \ell| \le \varepsilon$.
- Limite infinie, pour $a$ réel : $f$ tend vers $+\infty$ en $a$ si $\forall M \in \mathbb{R},\ \exists \eta > 0,\ \forall x \in I,\ |x - a| \le \eta \implies f(x) \ge M$.

Les autres cas ($a = -\infty$, limite $-\infty$) s'écrivent de même. On note $f(x) \xrightarrow[x \to a]{} \ell$ ou $\lim_{x \to a} f(x) = \ell$.
:::

Les huit combinaisons ont la même structure : pour toute « tolérance » autour de la limite, il existe un voisinage de $a$ sur lequel $f$ reste dans cette tolérance. Comme pour les suites, la limite est unique quand elle existe.

::: proposition Premières propriétés de la limite {#prop-unicite-f}
Si $f$ a une limite en $a$, elle est unique. Si $f$ est **définie en $a$** et a une limite en $a$, cette limite est $f(a)$. Si $f$ a une limite finie en $a$, $f$ est bornée au voisinage de $a$.
:::

Le deuxième point vient de ce que la définition laisse $x = a$ dans le voisinage : $|f(a) - \ell| \le \varepsilon$ pour tout $\varepsilon > 0$. C'est pourquoi on introduit les limites qui ne regardent qu'un côté, ou qui excluent le point.

::: définition Limite à gauche, à droite {#def-limite-cote}
Soit $a$ un réel. La **limite à droite** de $f$ en $a$, notée $\lim_{x \to a^+} f(x)$ ou $\lim_{x \to a,\, x > a} f(x)$, est la limite en $a$ de la restriction de $f$ à $I \cap\, ]a, +\infty[$ ; la limite à gauche se définit avec $I \cap\, ]-\infty, a[$. Si $a \in I$, on considère aussi la limite de $f$ restreinte à $I \setminus \{a\}$, notée $\lim_{x \to a,\, x \neq a} f(x)$.
:::

Exemple : la partie entière vérifie $\lim_{x \to 1^-} \lfloor x \rfloor = 0$ et $\lim_{x \to 1^+} \lfloor x \rfloor = 1$ : elle n'a pas de limite en $1$, ni même sur $\mathbb{R} \setminus \{1\}$.

::: théorème Caractérisation séquentielle de la limite {#thm-sequentielle}
Soient $a$ et $\ell$ dans $\overline{\mathbb{R}}$. La fonction $f$ tend vers $\ell$ en $a$ si et seulement si, pour **toute** suite $(u_n)$ d'éléments de $I$ qui tend vers $a$, la suite $\big(f(u_n)\big)$ tend vers $\ell$.
:::

::: preuve Caractérisation séquentielle (a et ℓ réels)
Sens direct : soit $\varepsilon > 0$ et $\eta$ associé. Comme $u_n \to a$, il existe $N$ tel que $|u_n - a| \le \eta$ pour $n \ge N$, donc $|f(u_n) - \ell| \le \varepsilon$ pour $n \ge N$.

Réciproque, par contraposée : si $f$ ne tend pas vers $\ell$, la négation de la définition donne un $\varepsilon > 0$ tel que, pour tout $\eta > 0$, il existe $x \in I$ avec $|x - a| \le \eta$ et $|f(x) - \ell| > \varepsilon$. Avec $\eta = \frac{1}{n + 1}$, on obtient $u_n \in I$ tel que $|u_n - a| \le \frac{1}{n+1}$ et $|f(u_n) - \ell| > \varepsilon$ : la suite $(u_n)$ tend vers $a$, mais $\big(f(u_n)\big)$ ne tend pas vers $\ell$.
:::

Ce théorème sert surtout à **montrer qu'une limite n'existe pas** : il suffit de deux suites tendant vers $a$ dont les images ont des limites différentes. Pour $x \mapsto \sin\frac1x$ en $0$, les suites $\frac{1}{2n\pi}$ et $\frac{1}{2n\pi + \pi/2}$ donnent les limites $0$ et $1$.

::: proposition Opérations sur les limites {#prop-operations-f}
Si $f \to \ell$ et $g \to \ell'$ en $a$, alors $f + g \to \ell + \ell'$, $\lambda f \to \lambda \ell$, $fg \to \ell\ell'$, et $\frac{f}{g} \to \frac{\ell}{\ell'}$ si $\ell' \neq 0$, avec les mêmes conventions et les mêmes formes indéterminées que pour les suites. **Composition** : si $f$ tend vers $b$ en $a$, si $f(I) \subset J$ et si $g : J \to \mathbb{R}$ tend vers $\ell$ en $b$, alors $g \circ f$ tend vers $\ell$ en $a$.
:::

Toutes ces règles se déduisent de celles des suites, par la caractérisation séquentielle ([[suites-series#prop-operations]]).

::: théorème Inégalités et limites {#thm-encadrement-f}
- **Passage à la limite** : si $f \le g$ au voisinage de $a$ et si $f \to \ell$, $g \to \ell'$ en $a$, alors $\ell \le \ell'$.
- **Encadrement** : si $g \le f \le h$ au voisinage de $a$ et si $g$ et $h$ tendent vers le **même** réel $\ell$ en $a$, alors $f$ tend vers $\ell$.
- **Minoration** : si $f \ge g$ au voisinage de $a$ et si $g \to +\infty$, alors $f \to +\infty$ ; de même pour une majoration et $-\infty$.
:::

Attention : le passage à la limite conserve les inégalités **larges** seulement. On a $\frac1x > 0$ sur $]0, +\infty[$, et pourtant la limite en $+\infty$ est $0$.

::: théorème Théorème de la limite monotone {#thm-limite-monotone}
Soient $a < b$ dans $\overline{\mathbb{R}}$ et $f$ croissante sur $]a, b[$. Alors $f$ a une limite en $b$ : c'est $\sup_{]a, b[} f$ si $f$ est majorée, et $+\infty$ sinon. De même, $f$ a une limite en $a$, égale à $\inf_{]a,b[} f$ si $f$ est minorée et $-\infty$ sinon. Résultats analogues pour une fonction décroissante.
:::

La preuve suit celle du [[suites-series#thm-monotone|théorème de la limite monotone pour les suites]] : si $S = \sup f$ et $\varepsilon > 0$, il existe $x_0$ tel que $f(x_0) \ge S - \varepsilon$, et la croissance donne $S - \varepsilon \le f(x) \le S$ pour tout $x \in [x_0, b[$. En particulier, une fonction monotone a en tout point intérieur une limite à gauche et une limite à droite, finies.

## Continuité {#continuite}

::: définition Continuité en un point, prolongement {#def-continuite}
Soit $a \in I$. La fonction $f$ est **continue en $a$** si $f(x) \to f(a)$ quand $x \to a$, **continue à droite** (à gauche) en $a$ si sa restriction à $I \cap [a, +\infty[$ (à $I \cap\, ]-\infty, a]$) l'est. Elle est **continue sur $I$** si elle est continue en tout point de $I$.

Si $f$ est définie sur $I \setminus \{a\}$ et a une limite finie $\ell$ en $a$, la fonction égale à $f$ sur $I \setminus \{a\}$ et à $\ell$ en $a$ est continue en $a$ : c'est le **prolongement par continuité** de $f$ en $a$.
:::

Par la caractérisation séquentielle, $f$ est continue en $a$ si et seulement si $f(u_n) \to f(a)$ pour toute suite $u_n \to a$ d'éléments de $I$ ; sommes, produits, quotients (dénominateur non nul) et composées de fonctions continues sont continues. La fonction $x \mapsto \frac{\sin x}{x}$, définie sur $\mathbb{R}^*$, se prolonge par continuité en $0$ par la valeur $1$.

::: théorème Théorème des valeurs intermédiaires {#thm-tvi}
Soit $f$ continue sur un intervalle $I$, et $a, b \in I$. Tout réel $y$ compris entre $f(a)$ et $f(b)$ est atteint : il existe $c$ entre $a$ et $b$ tel que $f(c) = y$.
:::

::: preuve Valeurs intermédiaires, par dichotomie
Supposons $a < b$ et $f(a) \le y \le f(b)$ (l'autre cas s'en déduit en remplaçant $f$ par $-f$). On pose $a_0 = a$, $b_0 = b$, puis, $m$ désignant le milieu de $[a_n, b_n]$ : si $f(m) \le y$, $a_{n+1} = m$ et $b_{n+1} = b_n$ ; sinon $a_{n+1} = a_n$ et $b_{n+1} = m$. Par récurrence, $f(a_n) \le y \le f(b_n)$ et $a \le a_n \le b_n \le b$ pour tout $n$, avec $b_n - a_n = \frac{b - a}{2^n}$. Les suites $(a_n)$ et $(b_n)$ sont adjacentes ([[suites-series#thm-adjacentes]]) : elles convergent vers un même $c \in [a, b]$. Par continuité, $f(a_n) \to f(c)$ et $f(b_n) \to f(c)$, et le passage à la limite donne $f(c) \le y \le f(c)$.
:::

Cette preuve est aussi un **algorithme** : chaque étape divise par deux l'intervalle qui contient une solution de $f(x) = y$. Pour une précision $10^{-6}$ sur un intervalle de longueur $1$, vingt étapes suffisent, puisque $2^{20} > 10^6$.

::: corollaire Image d'un intervalle {#cor-image-intervalle}
L'image d'un intervalle par une fonction continue est un intervalle. En particulier, une fonction continue sur un intervalle qui ne s'annule pas y garde un signe constant.
:::

::: théorème Théorème des bornes atteintes {#thm-bornes}
Une fonction continue sur un **segment** $[a, b]$ est bornée et atteint ses bornes : il existe $c, d \in [a, b]$ tels que $f(c) = \min_{[a,b]} f$ et $f(d) = \max_{[a,b]} f$. L'image d'un segment par une fonction continue est donc un segment.
:::

::: preuve Bornes atteintes
Soit $M = \sup_{[a,b]} f \in\, ]-\infty, +\infty]$. Il existe une suite $(x_n)$ de $[a, b]$ telle que $f(x_n) \to M$ (avec $f(x_n) \ge n$ si $M = +\infty$). La suite $(x_n)$ est bornée : par le [[suites-series#thm-bw|théorème de Bolzano-Weierstrass]], une suite extraite $(x_{\varphi(n)})$ converge vers un réel $d$, qui est dans $[a, b]$ par passage à la limite dans $a \le x_{\varphi(n)} \le b$. Par continuité, $f(x_{\varphi(n)}) \to f(d)$, réel ; donc $M = f(d)$ est fini et atteint. Même raisonnement pour la borne inférieure.
:::

Les deux hypothèses comptent : sur l'intervalle non fermé $]0, 1]$, $x \mapsto \frac1x$ est continue et non bornée ; sur $[0, 1]$, la fonction égale à $x$ sur $[0, 1[$ et à $0$ en $1$ est bornée mais n'atteint pas sa borne supérieure $1$, faute de continuité.

::: théorème Bijection continue strictement monotone {#thm-bijection}
Soit $f$ continue et strictement monotone sur un intervalle $I$. Alors $J = f(I)$ est un intervalle, $f$ réalise une bijection de $I$ sur $J$, et sa réciproque $f^{-1} : J \to I$ est continue et strictement monotone, de même sens que $f$.
:::

C'est ce théorème qui définit les fonctions réciproques usuelles : $\sqrt{\cdot}$ comme réciproque de $x \mapsto x^2$ sur $\mathbb{R}_+$, le logarithme comme réciproque de l'exponentielle, Arcsin, Arccos et Arctan (fiche [[techniques-calcul]]). Les extrémités de $J$ s'obtiennent par le théorème de la limite monotone.

::: proposition Continue et injective implique strictement monotone {#prop-injective}
Une fonction continue et injective sur un intervalle est strictement monotone.
:::

L'idée : si $f$ n'était pas strictement monotone, on trouverait $x < y < z$ avec $f(y)$ hors de l'intervalle d'extrémités $f(x)$ et $f(z)$, et le théorème des valeurs intermédiaires ferait prendre deux fois une même valeur. La continuité est indispensable : sur $[0, 2]$, la fonction égale à $x$ sur $[0, 1[$ et à $3 - x$ sur $[1, 2]$ est injective sans être monotone.

::: remarque Fonctions à valeurs complexes {#rem-complexes-f}
Pour $f : I \to \mathbb{C}$, on définit limite et continuité avec le module à la place de la valeur absolue. Alors $f$ tend vers $\ell$ si et seulement si $\operatorname{Re} f \to \operatorname{Re} \ell$ et $\operatorname{Im} f \to \operatorname{Im}\ell$, car $|\operatorname{Re} z| \le |z| \le |\operatorname{Re} z| + |\operatorname{Im} z|$. Les théorèmes qui utilisent l'ordre (valeurs intermédiaires, bornes atteintes, limite monotone) n'ont pas de sens pour des valeurs complexes ; celui des bornes atteintes reste vrai pour $|f|$.
:::

## Dérivabilité {#derivabilite}

::: définition Dérivabilité en un point {#def-derivable}
Soit $a \in I$. La fonction $f$ est **dérivable en $a$** si le taux d'accroissement $\frac{f(x) - f(a)}{x - a}$ a une limite **finie** quand $x \to a$, $x \neq a$. Cette limite est le **nombre dérivé** $f'(a)$. On définit de même la dérivabilité à gauche et à droite, de nombres dérivés $f'_g(a)$ et $f'_d(a)$. La fonction $f$ est dérivable sur $I$ si elle l'est en tout point ; $f' : x \mapsto f'(x)$ est sa **dérivée**.
:::

::: proposition Développement limité à l'ordre 1 {#prop-dl1}
La fonction $f$ est dérivable en $a$ si et seulement s'il existe un réel $\ell$ et une fonction $\varepsilon$ tendant vers $0$ en $0$ tels que, pour $a + h \in I$,
$$f(a + h) = f(a) + \ell h + h\,\varepsilon(h).$$
Alors $\ell = f'(a)$. En particulier, une fonction dérivable en $a$ est continue en $a$.
:::

Géométriquement, la droite d'équation $y = f(a) + f'(a)(x - a)$ est la **tangente** au graphe : c'est la meilleure approximation affine de $f$ près de $a$. Cinématiquement, si $f(t)$ est une position, $f'(t)$ est la vitesse instantanée. La réciproque de « dérivable implique continue » est fausse : $x \mapsto |x|$ est continue en $0$, avec $f'_g(0) = -1$ et $f'_d(0) = 1$.

::: proposition Opérations sur les dérivées {#prop-derivees}
Si $f$ et $g$ sont dérivables en $a$ : $(f + g)'(a) = f'(a) + g'(a)$, $(fg)'(a) = f'(a)g(a) + f(a)g'(a)$, et, si $g(a) \neq 0$, $\left(\frac fg\right)'(a) = \frac{f'(a)g(a) - f(a)g'(a)}{g(a)^2}$.

**Composée** : si $f$ est dérivable en $a$ et $g$ dérivable en $f(a)$, alors $(g \circ f)'(a) = g'\big(f(a)\big)\, f'(a)$.

**Réciproque** : si $f$ est continue et strictement monotone sur $I$, dérivable en $a$ avec $f'(a) \neq 0$, alors $f^{-1}$ est dérivable en $b = f(a)$ et $(f^{-1})'(b) = \frac{1}{f'(a)} = \frac{1}{f'\big(f^{-1}(b)\big)}$.
:::

Si $f'(a) = 0$, la tangente au graphe de $f^{-1}$ en $b$ est verticale : $x \mapsto x^3$ a pour réciproque $x \mapsto \sqrt[3]{x}$, non dérivable en $0$. La dérivée de Arctan, réciproque de $\tan$, en découle : $\operatorname{Arctan}'(y) = \frac{1}{1 + \tan^2(\operatorname{Arctan} y)} = \frac{1}{1 + y^2}$.

::: proposition Extremum local et point critique {#prop-extremum}
Si $f$ a un extremum local en un point $a$ **intérieur** à $I$ et si $f$ est dérivable en $a$, alors $f'(a) = 0$ : $a$ est un **point critique**.
:::

Pour un maximum en $a$, le taux d'accroissement est positif à gauche et négatif à droite ; en passant à la limite, $f'(a) \ge 0$ et $f'(a) \le 0$. Les deux réserves comptent : $x \mapsto x$ sur $[0, 1]$ a un maximum en $1$ (non intérieur) avec $f'(1) = 1$, et $x \mapsto x^3$ a un point critique en $0$ sans extremum.

::: définition Classe C^k {#def-ck}
La fonction $f$ est **de classe $C^1$** sur $I$ si elle est dérivable et si $f'$ est continue. Par récurrence, $f$ est de classe $C^k$ si elle est $k$ fois dérivable et si $f^{(k)}$ est continue ; elle est de classe $C^\infty$ si elle est de classe $C^k$ pour tout $k$.
:::

::: proposition Formule de Leibniz {#prop-leibniz}
Si $f$ et $g$ sont $n$ fois dérivables sur $I$, alors $fg$ aussi, et
$$(fg)^{(n)} = \sum_{k=0}^{n} \binom{n}{k} f^{(k)} g^{(n-k)}.$$
Les classes $C^k$ sont stables par combinaison linéaire, produit, quotient (dénominateur non nul), composition et réciproque (dérivée non nulle).
:::

La preuve de Leibniz est celle du binôme : une récurrence sur $n$ avec la relation de Pascal. Exemple : $(x^2 e^x)^{(n)} = \big(x^2 + 2n x + n(n - 1)\big)e^x$, seuls trois termes de la somme étant non nuls.

## Rolle et accroissements finis {#accroissements}

::: théorème Théorème de Rolle {#thm-rolle}
Soit $f$ continue sur $[a, b]$ ($a < b$), dérivable sur $]a, b[$, avec $f(a) = f(b)$. Il existe $c \in\, ]a, b[$ tel que $f'(c) = 0$.
:::

::: preuve Théorème de Rolle
Par le théorème des bornes atteintes, $f$ a un minimum $m$ et un maximum $M$ sur $[a, b]$. Si $m = M$, $f$ est constante et tout $c \in\, ]a, b[$ convient. Sinon, l'une des deux valeurs est différente de $f(a) = f(b)$ ; elle est atteinte en un point $c$ qui n'est ni $a$ ni $b$, donc intérieur. C'est un extremum, et $f'(c) = 0$.
:::

Géométriquement : entre deux points du graphe à la même hauteur, il y a une tangente horizontale. Cinématiquement : un mobile qui revient à son point de départ a eu, à un instant, une vitesse nulle.

::: théorème Égalité des accroissements finis {#thm-taf}
Si $f$ est continue sur $[a, b]$ et dérivable sur $]a, b[$, il existe $c \in\, ]a, b[$ tel que
$$f(b) - f(a) = f'(c)\,(b - a).$$
:::

On applique Rolle à $g(x) = f(x) - \frac{f(b) - f(a)}{b - a}(x - a)$, qui vérifie $g(a) = g(b) = f(a)$. Interprétation : il existe une tangente parallèle à la corde ; un trajet de 100 km parcouru en une heure a connu un instant à 100 km/h exactement.

::: définition Fonction lipschitzienne {#def-lipschitz-f}
La fonction $f$ est **$K$-lipschitzienne** sur $I$ ($K \ge 0$) si $|f(x) - f(y)| \le K |x - y|$ pour tous $x, y \in I$. Une fonction lipschitzienne est continue.
:::

::: corollaire Inégalité des accroissements finis {#cor-iaf}
Si $f$ est dérivable sur l'intervalle $I$ et si $|f'| \le K$ sur $I$, alors $f$ est $K$-lipschitzienne sur $I$.
:::

C'est l'outil des suites récurrentes $u_{n+1} = f(u_n)$ : si $f$ envoie un intervalle $J$ dans lui-même, y a un point fixe $\alpha$ et vérifie $|f'| \le k < 1$, alors $|u_{n+1} - \alpha| = |f(u_n) - f(\alpha)| \le k|u_n - \alpha|$ et $|u_n - \alpha| \le k^n |u_0 - \alpha|$ : la convergence est géométrique (exercice c1).

::: proposition Monotonie et signe de la dérivée {#prop-monotonie}
Soit $f$ dérivable sur l'intervalle $I$.

- $f$ est constante sur $I$ si et seulement si $f' = 0$ sur $I$.
- $f$ est croissante sur $I$ si et seulement si $f' \ge 0$ sur $I$.
- $f$ est strictement croissante sur $I$ si et seulement si $f' \ge 0$ sur $I$ et $f'$ n'est identiquement nulle sur aucun intervalle non réduit à un point inclus dans $I$. C'est le cas si $f' > 0$ sauf en un nombre fini de points.
:::

Le sens « $f' \ge 0$ implique $f$ croissante » vient des accroissements finis : $f(y) - f(x) = f'(c)(y - x) \ge 0$ pour $x < y$. Le mot **intervalle** est essentiel : $x \mapsto -\frac1x$ a une dérivée strictement positive sur $\mathbb{R}^*$ et n'y est pas croissante. Exemple de stricte croissance avec dérivée qui s'annule : $x \mapsto x^3$.

::: théorème Limite de la dérivée {#thm-limite-derivee}
Soit $f$ continue sur $I$, dérivable sur $I \setminus \{a\}$, et telle que $f'(x) \to \ell$ quand $x \to a$, $x \neq a$. Si $\ell$ est réel, $f$ est dérivable en $a$, $f'(a) = \ell$, et $f'$ est continue en $a$. Si $\ell = \pm\infty$, le taux d'accroissement tend vers $\ell$ en $a$ : $f$ n'est pas dérivable en $a$ et son graphe a une tangente verticale.
:::

Pour $x \neq a$, les accroissements finis donnent $\frac{f(x) - f(a)}{x - a} = f'(c_x)$ avec $c_x$ strictement entre $a$ et $x$ ; quand $x \to a$, $c_x \to a$ et $f'(c_x) \to \ell$. Attention, la réciproque est fausse : une fonction peut être dérivable en $a$ sans que $f'$ ait de limite en $a$ (exercice m2).

::: remarque Fonctions à valeurs complexes {#rem-rolle-complexe}
Pour $f : I \to \mathbb{C}$, on définit la dérivée par les parties réelle et imaginaire : $f' = (\operatorname{Re} f)' + i(\operatorname{Im} f)'$. Les opérations et la formule de Leibniz restent vraies. **Le théorème de Rolle est faux** : $t \mapsto e^{it}$ prend la même valeur en $0$ et $2\pi$, mais sa dérivée $ie^{it}$ ne s'annule jamais. L'inégalité des accroissements finis reste vraie pour $f$ de classe $C^1$ : elle découle de $f(b) - f(a) = \int_a^b f'$ et d'une majoration de l'intégrale.
:::

## Convexité {#convexite}

Cette partie est au programme de MPSI, MP2I et PCSI (l'inégalité de Jensen seulement en MPSI et MP2I) ; elle n'est pas au programme de PTSI.

::: définition Fonction convexe {#def-convexe}
La fonction $f$ est **convexe** sur $I$ si, pour tous $x, y \in I$ et tout $\lambda \in [0, 1]$,
$$f\big((1 - \lambda)x + \lambda y\big) \le (1 - \lambda) f(x) + \lambda f(y).$$
Elle est **concave** si $-f$ est convexe.
:::

Géométriquement : sur $[x, y]$, le graphe est **sous la corde** qui joint $(x, f(x))$ à $(y, f(y))$. Les fonctions affines sont à la fois convexes et concaves ; $x \mapsto x^2$, $|\cdot|$ et l'exponentielle sont convexes ; le logarithme et la racine carrée sont concaves.

::: proposition Inégalité de Jensen {#prop-jensen}
Si $f$ est convexe sur $I$, pour tous $x_1, \ldots, x_n \in I$ et tous réels positifs $\lambda_1, \ldots, \lambda_n$ de somme $1$,
$$f\Big(\sum_{i=1}^{n} \lambda_i x_i\Big) \le \sum_{i=1}^{n} \lambda_i f(x_i).$$
:::

La preuve est une récurrence sur $n$ (exercice m3). Appliquée au logarithme, concave, avec $\lambda_i = \frac1n$, elle donne l'**inégalité arithmético-géométrique** : $\sqrt[n]{x_1 \cdots x_n} \le \frac{x_1 + \cdots + x_n}{n}$ pour des réels strictement positifs.

::: proposition Croissance des pentes {#prop-pentes}
La fonction $f$ est convexe sur $I$ si et seulement si, pour tout $a \in I$, la fonction pente $x \mapsto \frac{f(x) - f(a)}{x - a}$ est croissante sur $I \setminus \{a\}$. Le graphe d'une fonction convexe est alors **au-dessus** de ses cordes en dehors de l'intervalle qu'elles joignent.
:::

Pour $x < y < z$ dans $I$, cela s'écrit $\frac{f(y) - f(x)}{y - x} \le \frac{f(z) - f(x)}{z - x} \le \frac{f(z) - f(y)}{z - y}$ : les pentes des cordes augmentent quand on se déplace vers la droite.

::: théorème Convexité et dérivées {#thm-convexe-derivee}
Soit $f$ dérivable sur $I$. Alors $f$ est convexe sur $I$ si et seulement si $f'$ est croissante sur $I$ ; dans ce cas, le graphe de $f$ est **au-dessus de toutes ses tangentes** : $f(x) \ge f(a) + f'(a)(x - a)$ pour tous $a, x \in I$. Si $f$ est deux fois dérivable, $f$ est convexe sur $I$ si et seulement si $f'' \ge 0$ sur $I$.
:::

::: méthode Inégalités de convexité {#meth-convexite}
Une fonction convexe est au-dessus de ses tangentes et au-dessous de ses cordes ; une fonction concave, l'inverse. On en tire, en choisissant la tangente ou la corde :

- $e^x \ge 1 + x$ pour tout $x$ réel (tangente en $0$ à l'exponentielle, convexe) ;
- $\ln x \le x - 1$ pour tout $x > 0$ (tangente en $1$ au logarithme, concave) ;
- $\frac{2}{\pi}x \le \sin x \le x$ pour $x \in [0, \frac\pi2]$ (le sinus est concave sur $[0, \pi]$ : il est au-dessus de sa corde entre $0$ et $\frac{\pi}{2}$ et au-dessous de sa tangente en $0$).
:::

Ces inégalités, que l'on démontrait au lycée en étudiant une fonction différence, deviennent des lectures de graphe. Elles serviront sans cesse pour encadrer des suites, des intégrales et des sommes.
