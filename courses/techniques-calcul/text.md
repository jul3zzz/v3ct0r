## Fonctions usuelles {#fonctions-usuelles}

Le point de vue de cette fiche est **pratique** : en s'appuyant sur le lycée, on rassemble les fonctions et les techniques de calcul qui servent ensuite partout. Leur mise en place rigoureuse vient plus tard : la continuité et la dérivabilité dans [[limites-continuite]], l'intégrale dans [[riemann]].

::: définition Logarithme, exponentielle, puissances {#def-puissances}
Le **logarithme népérien** $\ln$ est la primitive de $x \mapsto \frac1x$ sur $]0, +\infty[$ qui s'annule en $1$ ; l'**exponentielle** est sa réciproque, de $\mathbb{R}$ sur $]0, +\infty[$. Pour $x > 0$ et $\alpha \in \mathbb{R}$, on pose $x^\alpha = e^{\alpha\ln x}$ ; si $\alpha > 0$, on prolonge par $0^\alpha = 0$. Alors
$$(xy)^\alpha = x^\alpha y^\alpha, \qquad x^{\alpha + \beta} = x^\alpha x^\beta,$$
$$(x^\alpha)^\beta = x^{\alpha\beta}, \qquad (x^\alpha)' = \alpha x^{\alpha - 1}.$$
Le logarithme en base $b$ est $\log_b x = \frac{\ln x}{\ln b}$ ; en particulier le logarithme décimal ($b = 10$) et en base $2$.
:::

Seules les puissances **entières** se définissent aussi pour $x < 0$ : $(-8)^{1/3}$ n'a pas de sens avec cette définition, même si $-2$ est l'unique réel dont le cube vaut $-8$.

::: proposition Croissances comparées {#prop-croissances-f}
Pour $\alpha > 0$ et $\beta > 0$ :
$$\frac{(\ln x)^\beta}{x^\alpha} \xrightarrow[x \to +\infty]{} 0, \qquad \frac{x^\alpha}{e^{\beta x}} \xrightarrow[x \to +\infty]{} 0, \qquad x^\alpha |\ln x|^\beta \xrightarrow[x \to 0^+]{} 0.$$
:::

« L'exponentielle l'emporte sur les puissances, qui l'emportent sur le logarithme. » Ce sont les versions continues des [[suites-series#prop-croissances|croissances comparées des suites]].

::: proposition Deux inégalités fondamentales {#prop-inegalites-exp}
Pour tout réel $x$, $e^x \ge 1 + x$ ; pour tout $x > -1$, $\ln(1 + x) \le x$. Il y a égalité seulement en $x = 0$.
:::

Ce sont des inégalités de tangente : l'exponentielle est convexe et le logarithme concave ([[limites-continuite#meth-convexite]]). On les prouve aussi en étudiant $x \mapsto e^x - 1 - x$, de dérivée $e^x - 1$, minimale en $0$.

::: définition Fonctions circulaires réciproques {#def-arc}
- $\operatorname{Arcsin} : [-1, 1] \to [-\frac\pi2, \frac\pi2]$ est la réciproque de la restriction de $\sin$ à $[-\frac\pi2, \frac\pi2]$ ;
- $\operatorname{Arccos} : [-1, 1] \to [0, \pi]$ est la réciproque de la restriction de $\cos$ à $[0, \pi]$ ;
- $\operatorname{Arctan} : \mathbb{R} \to\, ]-\frac\pi2, \frac\pi2[$ est la réciproque de la restriction de $\tan$ à $]-\frac\pi2, \frac\pi2[$.
:::

Ces restrictions sont continues et strictement monotones : c'est le [[limites-continuite#thm-bijection|théorème de la bijection]]. Attention : $\operatorname{Arcsin}(\sin x) = x$ seulement pour $x \in [-\frac\pi2, \frac\pi2]$ ; par exemple $\operatorname{Arcsin}(\sin \pi) = 0$.

::: proposition Dérivées des fonctions circulaires réciproques {#prop-derivees-arc}
Arcsin et Arccos sont dérivables sur $]-1, 1[$, Arctan sur $\mathbb{R}$, et
$$\operatorname{Arcsin}'(x) = \frac{1}{\sqrt{1 - x^2}}, \qquad \operatorname{Arccos}'(x) = -\frac{1}{\sqrt{1 - x^2}},$$
$$\operatorname{Arctan}'(x) = \frac{1}{1 + x^2}.$$
En particulier $\operatorname{Arcsin} x + \operatorname{Arccos} x = \frac\pi2$ pour tout $x \in [-1, 1]$.
:::

Par la dérivée d'une réciproque : $\operatorname{Arcsin}'(x) = \frac{1}{\cos(\operatorname{Arcsin} x)}$, et $\cos(\operatorname{Arcsin} x) = \sqrt{1 - x^2}$ car ce cosinus est positif (l'angle est dans $[-\frac\pi2, \frac\pi2]$). Arcsin n'est pas dérivable en $\pm 1$ : tangentes verticales.

::: définition Fonctions hyperboliques {#def-hyperboliques}
Pour $x \in \mathbb{R}$ :
$$\operatorname{ch} x = \frac{e^x + e^{-x}}{2}, \qquad \operatorname{sh} x = \frac{e^x - e^{-x}}{2}, \qquad \operatorname{th} x = \frac{\operatorname{sh} x}{\operatorname{ch} x}.$$
On a $\operatorname{ch}^2 x - \operatorname{sh}^2 x = 1$, $\operatorname{ch}' = \operatorname{sh}$, $\operatorname{sh}' = \operatorname{ch}$ et $\operatorname{th}' = 1 - \operatorname{th}^2 = \frac{1}{\operatorname{ch}^2}$.
:::

$\operatorname{ch}$ est paire, $\operatorname{sh}$ et $\operatorname{th}$ impaires : ce sont les parties paire et impaire de l'exponentielle. Le graphe de $\operatorname{ch}$ est la **chaînette**, forme d'un fil pesant suspendu par ses extrémités. Les réciproques des fonctions hyperboliques sont hors programme.

## Dérivées et étude de fonctions {#derivation-pratique}

::: proposition Dérivées usuelles {#prop-derivees-usuelles}
Sur les intervalles où elles sont définies :

- $(x^\alpha)' = \alpha x^{\alpha - 1}$, $(e^{ax})' = a e^{ax}$, $(\ln|x|)' = \frac1x$ ;
- $\sin' = \cos$, $\cos' = -\sin$, $\tan' = 1 + \tan^2 = \frac{1}{\cos^2}$ ;
- $(u \circ v)' = v' \cdot u' \circ v$, d'où $(e^{u})' = u'e^u$, $(\ln|u|)' = \frac{u'}{u}$, $(u^\alpha)' = \alpha u' u^{\alpha - 1}$.
:::

::: méthode Étudier une fonction {#meth-etude}
1. Déterminer l'**ensemble de définition**, et le réduire grâce à la parité, l'imparité ou la périodicité (un graphe pair est symétrique par rapport à l'axe des ordonnées, un graphe impair par rapport à l'origine).
2. Étudier la **dérivabilité**, calculer $f'$ et son signe : sur un intervalle, $f' \ge 0$ équivaut à $f$ croissante.
3. Dresser le **tableau de variations**, avec les limites aux bornes et les valeurs remarquables.
4. Tracer le graphe : tangentes horizontales aux points critiques, asymptotes.

Ce plan sert aussi à démontrer des **inégalités** ($f \ge g$ revient à étudier le signe de $f - g$) et à chercher des **extremums**.
:::

Le graphe d'une fonction transformée se lit sur celui de $f$ : $x \mapsto f(x + a)$ est translaté horizontalement de $-a$, $x \mapsto f(x) + b$ verticalement de $b$, $x \mapsto f(ax)$ est contracté horizontalement d'un facteur $a$. Celui de $f^{-1}$ est le symétrique de celui de $f$ par rapport à la droite $y = x$.

::: proposition Fonctions à valeurs complexes, dérivée de e^φ {#prop-exp-phi}
Une fonction $f : I \to \mathbb{C}$ est dérivable si $\operatorname{Re} f$ et $\operatorname{Im} f$ le sont, et $f' = (\operatorname{Re} f)' + i(\operatorname{Im} f)'$. Les règles pour une somme, un produit et un quotient restent vraies. Si $\varphi : I \to \mathbb{C}$ est dérivable, $x \mapsto e^{\varphi(x)}$ l'est et
$$\big(e^{\varphi}\big)' = \varphi'\, e^{\varphi}.$$
En particulier, pour $\lambda \in \mathbb{C}$, $(e^{\lambda x})' = \lambda e^{\lambda x}$.
:::

## Primitives et calcul d'intégrales {#primitives}

::: théorème Primitives et intégrales {#thm-primitive}
Soit $f$ continue sur un **intervalle** $I$, à valeurs réelles ou complexes, et $a \in I$. La fonction $F : x \mapsto \int_a^x f(t)\,dt$ est l'unique primitive de $f$ sur $I$ qui s'annule en $a$. Les primitives de $f$ sur $I$ sont les $F + C$, $C$ constante, et pour toute primitive $G$,
$$\int_a^b f(t)\,dt = G(b) - G(a) = \big[G\big]_a^b.$$
:::

Ce théorème est admis à ce stade ; c'est le [[riemann#thm-ftc|théorème fondamental de l'analyse]]. Le mot **intervalle** compte : sur $\mathbb{R}^*$, $x \mapsto \ln|x|$ et la fonction égale à $\ln|x|$ sur $]-\infty, 0[$ et à $\ln|x| + 1$ sur $]0, +\infty[$ sont deux primitives de $\frac1x$ qui ne diffèrent pas d'une constante.

::: théorème Intégration par parties {#thm-ipp}
Si $u$ et $v$ sont de classe $C^1$ sur $[a, b]$,
$$\int_a^b u'(t)v(t)\,dt = \big[uv\big]_a^b - \int_a^b u(t)v'(t)\,dt.$$
:::

On l'utilise pour faire disparaître un facteur polynomial en le dérivant ($\int x e^x\,dx$), ou pour faire apparaître une dérivée simple ($\int \ln x\,dx = x\ln x - x$, avec $u' = 1$ et $v = \ln$). Répétée, elle donne des relations de récurrence (exercice c1).

::: théorème Changement de variable {#thm-cdv}
Si $\varphi$ est de classe $C^1$ sur $[\alpha, \beta]$ et si $f$ est continue sur un intervalle contenant $\varphi([\alpha, \beta])$,
$$\int_\alpha^\beta f\big(\varphi(t)\big)\varphi'(t)\,dt = \int_{\varphi(\alpha)}^{\varphi(\beta)} f(x)\,dx.$$
:::

En pratique on écrit $x = \varphi(t)$, $dx = \varphi'(t)\,dt$, et l'on change les bornes. Exemple : avec $x = \sin t$, $\int_0^1 \sqrt{1 - x^2}\,dx = \int_0^{\pi/2}\cos^2 t\,dt = \frac\pi4$, l'aire d'un quart de disque.

::: méthode Primitives de e^(ax) cos(bx) et e^(ax) sin(bx) {#meth-eax}
Pour $\lambda = a + ib \neq 0$, une primitive de $x \mapsto e^{\lambda x}$ est $x \mapsto \frac{e^{\lambda x}}{\lambda}$. Comme $e^{ax}\cos(bx) = \operatorname{Re}\big(e^{\lambda x}\big)$ et $e^{ax}\sin(bx) = \operatorname{Im}\big(e^{\lambda x}\big)$, on obtient leurs primitives en prenant les parties réelle et imaginaire de
$$\frac{e^{\lambda x}}{\lambda} = \frac{(a - ib)\,e^{ax}\big(\cos(bx) + i\sin(bx)\big)}{a^2 + b^2}.$$
Exemple : une primitive de $e^x\cos x$ est $\frac{e^x(\cos x + \sin x)}{2}$.
:::

::: méthode Primitives de 1/(ax² + bx + c) {#meth-trinome}
On met le trinôme sous forme canonique, selon le signe de $\Delta = b^2 - 4ac$ :

- si $\Delta > 0$, le trinôme a deux racines $x_1 \neq x_2$ et l'on décompose $\frac{1}{a(x - x_1)(x - x_2)} = \frac{1}{a(x_1 - x_2)}\Big(\frac{1}{x - x_1} - \frac{1}{x - x_2}\Big)$, ce qui donne des logarithmes ;
- si $\Delta = 0$, $\frac{1}{a(x - x_0)^2}$ a pour primitive $-\frac{1}{a(x - x_0)}$ ;
- si $\Delta < 0$, on se ramène à $\frac{1}{u^2 + k^2}$, de primitive $\frac1k\operatorname{Arctan}\frac uk$.

Exemple : $\frac{1}{x^2 + 2x + 5} = \frac{1}{(x + 1)^2 + 4}$ a pour primitive $\frac12\operatorname{Arctan}\frac{x + 1}{2}$. De même, $\frac{1}{\sqrt{1 - x^2}}$ a pour primitive Arcsin.
:::

::: remarque Équations différentielles linéaires {#rem-ed}
Cette section du programme se termine par les équations différentielles linéaires du premier ordre $y' + a(x)y = b(x)$ et du second ordre à coefficients constants $y'' + ay' + by = f(x)$ : résolution de l'équation homogène, principe de superposition, solution particulière par la méthode de la variation de la constante, problème de Cauchy. Elles sont traitées dans le cours [[equations-differentielles]] : son chapitre [[equations-differentielles#premier-ordre]] et le [[equations-differentielles#thm-ordre2|théorème sur l'ordre 2 à coefficients constants]] relèvent de la première année, le reste (systèmes, exponentielle de matrice) de la seconde.
:::
