## Forme algébrique, conjugué, module {#forme-algebrique}

Les nombres complexes sont nés au XVIe siècle d'un embarras : les formules de Cardan pour les équations du troisième degré passaient, même quand toutes les solutions étaient réelles, par des racines carrées de nombres négatifs. Bombelli osa calculer avec ces quantités « impossibles » et retomba sur les bonnes réponses. Il fallut attendre Gauss et Argand pour voir dans $\mathbb{C}$ ce qu'il est vraiment : le plan, muni d'une multiplication qui fait tourner et dilater. Ce cours suit ce fil, du calcul algébrique à la géométrie. La construction de $\mathbb{C}$ est hors programme : on admet son existence et ses règles de calcul.

::: définition Nombre complexe, parties réelle et imaginaire {#def-complexe}
Il existe un ensemble $\mathbb{C}$ contenant $\mathbb{R}$, muni d'une addition et d'une multiplication qui prolongent celles de $\mathbb{R}$, et un élément $i$ vérifiant $i^2 = -1$, tels que tout $z \in \mathbb{C}$ s'écrive de façon **unique** $z = a + ib$ avec $a, b \in \mathbb{R}$.

Le réel $a$ est la **partie réelle** de $z$, notée $\operatorname{Re} z$ ; le réel $b$ est sa **partie imaginaire**, notée $\operatorname{Im} z$. Un complexe de partie réelle nulle est dit **imaginaire pur**.
:::

L'unicité de l'écriture est ce qui permet d'**identifier** : $a + ib = a' + ib'$ si et seulement si $a = a'$ et $b = b'$. On identifie $\mathbb{C}$ au plan muni d'un repère orthonormé direct : le complexe $a + ib$ est l'**affixe** du point de coordonnées $(a, b)$, et aussi du vecteur $(a, b)$. Additionner deux complexes, c'est additionner les vecteurs.

::: proposition Règles de calcul dans ℂ {#prop-calcul}
L'addition et la multiplication de $\mathbb{C}$ sont associatives, commutatives, la multiplication est distributive sur l'addition ; $0$ et $1$ sont neutres ; tout $z \neq 0$ a un inverse : si $z = a + ib$, alors
$$\frac{1}{z} = \frac{a - ib}{a^2 + b^2}.$$

Les identités de calcul de $\mathbb{R}$ restent vraies : pour $z, w \in \mathbb{C}$ et $n \in \mathbb{N}$,
$$(z + w)^n = \sum_{k=0}^{n} \binom{n}{k} z^k w^{n-k}, \qquad z^n - w^n = (z - w) \sum_{k=0}^{n-1} z^k w^{n-1-k},$$
et, pour $z \neq 1$, $\displaystyle\sum_{k=0}^{n} z^k = \frac{1 - z^{n+1}}{1 - z}$.
:::

Ces formules ne demandent que les règles de calcul d'un ensemble où la multiplication est commutative : leurs preuves sont celles du cas réel ([[calculs-algebriques#thm-binome|formule du binôme]], télescopage). En revanche, il n'y a **pas d'ordre** compatible avec les opérations sur $\mathbb{C}$ : écrire $z \le w$ pour des complexes non réels n'a pas de sens. Toute inégalité portera sur des réels : modules, parties réelles.

### Conjugaison

::: définition Conjugué {#def-conjugue}
Le **conjugué** de $z = a + ib$ est $\overline{z} = a - ib$. Dans le plan, le point d'affixe $\overline{z}$ est le symétrique du point d'affixe $z$ par rapport à l'axe réel.
:::

::: proposition Propriétés de la conjugaison {#prop-conjugue}
Pour tous $z, w \in \mathbb{C}$ : $\overline{z + w} = \overline{z} + \overline{w}$, $\overline{zw} = \overline{z}\,\overline{w}$, $\overline{\overline{z}} = z$, et $\overline{1/z} = 1/\overline{z}$ si $z \neq 0$. De plus
$$\operatorname{Re} z = \frac{z + \overline{z}}{2}, \qquad \operatorname{Im} z = \frac{z - \overline{z}}{2i},$$
donc $z$ est réel si et seulement si $\overline{z} = z$, et imaginaire pur si et seulement si $\overline{z} = -z$.
:::

### Module

::: définition Module {#def-module}
Le **module** de $z = a + ib$ est le réel positif $|z| = \sqrt{a^2 + b^2}$. C'est la distance du point d'affixe $z$ à l'origine ; plus généralement, $|z - w|$ est la distance entre les points d'affixes $z$ et $w$. Pour $z$ réel, le module est la valeur absolue.
:::

::: proposition Propriétés du module {#prop-module}
Pour tous $z, w \in \mathbb{C}$ :

- $|z|^2 = z\overline{z}$, et $|z| = 0$ si et seulement si $z = 0$ ;
- $|zw| = |z|\,|w|$ et, si $w \neq 0$, $\left|\frac{z}{w}\right| = \frac{|z|}{|w|}$ ;
- $|\operatorname{Re} z| \le |z|$ et $|\operatorname{Im} z| \le |z|$.
:::

La relation $|z|^2 = z\overline{z}$ est l'outil central : elle transforme un module en produit, que l'on sait développer. Ainsi $|zw|^2 = zw\,\overline{z}\,\overline{w} = (z\overline{z})(w\overline{w})$, et l'inverse s'écrit $\frac1z = \frac{\overline{z}}{|z|^2}$. Le cercle de centre $\omega$ et de rayon $r$ est l'ensemble des $z$ tels que $|z - \omega| = r$ ; le disque fermé, celui des $z$ tels que $|z - \omega| \le r$.

::: théorème Inégalité triangulaire {#thm-triangulaire}
Pour tous $z, w \in \mathbb{C}$,
$$\big|\,|z| - |w|\,\big| \le |z + w| \le |z| + |w|.$$
L'inégalité de droite est une égalité si et seulement si $z$ et $w$ sont **positivement liés** : $w = 0$, ou $z = \lambda w$ avec $\lambda \in \mathbb{R}_+$.
:::

::: preuve Inégalité triangulaire
On développe : $|z + w|^2 = (z + w)(\overline{z} + \overline{w}) = |z|^2 + |w|^2 + 2\operatorname{Re}(z\overline{w})$, et $(|z| + |w|)^2 = |z|^2 + |w|^2 + 2|z\overline{w}|$. Comme $\operatorname{Re}(z\overline{w}) \le |z\overline{w}|$, on obtient $|z + w| \le |z| + |w|$. L'égalité a lieu si et seulement si $\operatorname{Re}(z \overline{w}) = |z\overline{w}|$, c'est-à-dire si $z\overline{w}$ est un réel positif. Si $w \neq 0$, cela s'écrit $z = \frac{z\overline{w}}{|w|^2}\, w$ avec $\frac{z\overline{w}}{|w|^2} \in \mathbb{R}_+$. L'inégalité de gauche s'obtient en appliquant celle de droite à $z = (z + w) + (-w)$, puis en échangeant les rôles de $z$ et $w$.
:::

Géométriquement : dans un triangle, un côté est plus court que la somme des deux autres, et il n'y a égalité que pour un triangle aplati, le troisième sommet étant **entre** les deux autres.

## Module 1, exponentielle et trigonométrie {#exponentielle}

Les complexes de module $1$ forment le cercle trigonométrique. Ils vont porter toute la trigonométrie, et transformer les formules d'addition, qu'il fallait apprendre, en une seule règle de calcul.

::: définition Le cercle 𝕌 et l'exponentielle e^it {#def-eit}
On note $\mathbb{U} = \{z \in \mathbb{C} : |z| = 1\}$. Pour $t \in \mathbb{R}$, on pose
$$e^{it} = \cos t + i \sin t.$$
Le point d'affixe $e^{it}$ est le point du cercle trigonométrique repéré par l'angle $t$ ; tout élément de $\mathbb{U}$ s'écrit $e^{it}$ pour un réel $t$, unique à un multiple de $2\pi$ près.
:::

::: proposition Exponentielle d'une somme {#prop-eit-somme}
Pour tous réels $s$ et $t$, $e^{i(s + t)} = e^{is} e^{it}$. En particulier $e^{i \cdot 0} = 1$, $\frac{1}{e^{it}} = e^{-it} = \overline{e^{it}}$, et $e^{is} = e^{it}$ si et seulement si $s - t \in 2\pi\mathbb{Z}$.
:::

La preuve est un simple développement : $e^{is}e^{it} = (\cos s \cos t - \sin s \sin t) + i(\sin s \cos t + \cos s \sin t)$, et l'on reconnaît $\cos(s + t) + i\sin(s + t)$ par les [[calculs-algebriques#prop-addition|formules d'addition]]. Le chemin s'inverse ensuite : de la règle $e^{i(s+t)} = e^{is}e^{it}$, on **retrouve** toutes les formules de trigonométrie.

::: proposition Formules d'Euler et de Moivre {#prop-euler-moivre}
Pour tout $t \in \mathbb{R}$ et tout $n \in \mathbb{Z}$ :
$$\cos t = \frac{e^{it} + e^{-it}}{2}, \qquad \sin t = \frac{e^{it} - e^{-it}}{2i},$$
$$(\cos t + i \sin t)^n = \cos(nt) + i \sin(nt).$$
:::

La formule de Moivre donne $\cos(nt)$ et $\sin(nt)$ en fonction de $\cos t$ et $\sin t$ : on développe $(\cos t + i\sin t)^n$ par le binôme et l'on sépare parties réelle et imaginaire. Pour $n = 3$ : $\cos(3t) = \cos^3 t - 3\cos t \sin^2 t = 4\cos^3 t - 3 \cos t$. Les formules d'Euler font le chemin inverse.

::: méthode Linéariser, factoriser par l'angle moitié {#meth-angle-moitie}
**Linéariser** $\cos^p t \sin^q t$ (l'écrire comme combinaison de $\cos(kt)$ et $\sin(kt)$) : remplacer $\cos t$ et $\sin t$ par les formules d'Euler, développer par le binôme, puis regrouper $e^{ikt}$ et $e^{-ikt}$. Exemple : $\cos^3 t = \frac{1}{8}(e^{it} + e^{-it})^3 = \frac{1}{8}(e^{3it} + 3e^{it} + 3e^{-it} + e^{-3it}) = \frac{\cos(3t) + 3\cos t}{4}$.

**Angle moitié** : on met en facteur l'exponentielle de la demi-somme,
$$e^{ip} + e^{iq} = e^{i\frac{p+q}{2}}\left(e^{i\frac{p-q}{2}} + e^{-i\frac{p-q}{2}}\right) = 2\cos\!\Big(\frac{p-q}{2}\Big)\, e^{i\frac{p+q}{2}},$$
et de même $e^{ip} - e^{iq} = 2i\sin\!\big(\frac{p-q}{2}\big)\, e^{i\frac{p+q}{2}}$. Avec $q = 0$ : $1 + e^{it} = 2\cos\frac t2\, e^{i\frac t2}$ et $e^{it} - 1 = 2i \sin \frac t2\, e^{i \frac t2}$. En prenant les parties réelles et imaginaires, on retrouve $\cos p + \cos q = 2 \cos\frac{p+q}{2} \cos \frac{p-q}{2}$ et les trois formules analogues.
:::

L'angle moitié sert aussi à calculer des sommes : $\sum_{k=0}^{n} e^{ikt}$ est une somme géométrique de raison $e^{it}$, dont on factorise numérateur et dénominateur ; ses parties réelle et imaginaire donnent $\sum \cos(kt)$ et $\sum \sin(kt)$ (exercice m1).

### Forme trigonométrique

::: définition Forme trigonométrique, argument {#def-argument}
Tout complexe $z \neq 0$ s'écrit $z = r e^{i\theta}$ avec $r = |z| > 0$ et $\theta \in \mathbb{R}$. Un tel réel $\theta$ est **un argument** de $z$ ; les arguments de $z$ sont exactement les $\theta + 2k\pi$, $k \in \mathbb{Z}$. L'unique argument dans $]-\pi, \pi]$ est l'**argument principal**. Le complexe $0$ n'a pas d'argument.
:::

En effet, $\frac{z}{|z|}$ est de module $1$, donc s'écrit $e^{i\theta}$. Géométriquement, $r$ est la distance à l'origine et $\theta$ une mesure de l'angle orienté entre l'axe réel et le vecteur d'affixe $z$. Par exemple $1 + i = \sqrt2\, e^{i\pi/4}$ et $-2 = 2e^{i\pi}$.

::: proposition Arguments d'un produit, d'un quotient {#prop-arg}
Si $z = re^{i\theta}$ et $w = \rho e^{i\varphi}$ sont non nuls, alors $zw = r\rho\, e^{i(\theta + \varphi)}$ et $\frac{z}{w} = \frac{r}{\rho}\, e^{i(\theta - \varphi)}$. Autrement dit, $\arg(zw) \equiv \arg z + \arg w \ [2\pi]$ et $\arg(z/w) \equiv \arg z - \arg w \ [2\pi]$.
:::

C'est la clé géométrique : **multiplier par $re^{i\theta}$, c'est dilater d'un facteur $r$ et tourner d'un angle $\theta$**. Multiplier par $i = e^{i\pi/2}$ fait tourner d'un quart de tour.

::: méthode Écrire a cos t + b sin t sous la forme A cos(t − φ) {#meth-acos}
Soient $a, b$ réels non tous deux nuls. On écrit $a + ib = A e^{i\varphi}$ avec $A = \sqrt{a^2 + b^2}$. Alors
$$a\cos t + b \sin t = \operatorname{Re}\big((a - ib)e^{it}\big) = \operatorname{Re}\big(A e^{i(t - \varphi)}\big) = A \cos(t - \varphi).$$
Exemple : $\cos t + \sqrt3 \sin t = 2\cos\big(t - \frac{\pi}{3}\big)$, puisque $1 + i\sqrt3 = 2e^{i\pi/3}$. Cette écriture résout immédiatement $\cos t + \sqrt3\sin t = 1$ : $\cos(t - \frac\pi3) = \frac12$, soit $t \equiv 0$ ou $t \equiv \frac{2\pi}{3} \ [2\pi]$.
:::

En physique, c'est la superposition de deux oscillations de même pulsation : on obtient une oscillation unique, d'amplitude $A$ et de phase $\varphi$.

## Équations algébriques et racines n-ièmes {#equations}

Une **fonction polynomiale** à coefficients complexes est une fonction $P : z \mapsto \sum_{k=0}^{n} a_k z^k$, avec $a_0, \ldots, a_n \in \mathbb{C}$. Résoudre $P(z) = 0$ est le problème qui a fait naître les complexes. Le cours [[polynomes]] en fera la théorie ; on en pose ici les premiers outils.

::: proposition Factorisation par z − a {#prop-factor}
Si $P$ est une fonction polynomiale de degré $n \ge 1$ et si $P(a) = 0$, il existe une fonction polynomiale $Q$ de degré $n - 1$ telle que, pour tout $z \in \mathbb{C}$, $P(z) = (z - a)\,Q(z)$.
:::

La preuve tient dans la factorisation de $z^k - a^k$ par $z - a$ : $P(z) = P(z) - P(a) = \sum_{k=1}^{n} a_k (z^k - a^k)$, et chaque terme est un multiple de $z - a$. En répétant l'argument, un polynôme de degré $n$ qui a $n$ racines distinctes $a_1, \ldots, a_n$ s'écrit $a_n (z - a_1)\cdots(z - a_n)$, et il n'en a pas d'autre.

::: méthode Racines carrées sous forme algébrique {#meth-racines-carrees}
Pour trouver les $z = x + iy$ tels que $z^2 = a + ib$, on écrit trois équations réelles :
$$x^2 - y^2 = a, \qquad 2xy = b, \qquad x^2 + y^2 = \sqrt{a^2 + b^2},$$
la troisième venant de $|z|^2 = |a + ib|$. Les première et troisième donnent $x^2$ et $y^2$ ; le signe de $b$ (donné par $2xy = b$) dit si $x$ et $y$ sont de même signe. Exemple : $z^2 = 3 + 4i$ donne $x^2 = 4$, $y^2 = 1$, $xy > 0$, soit $z = \pm(2 + i)$.
:::

Tout complexe non nul a exactement **deux** racines carrées, opposées. Sous forme trigonométrique c'est immédiat : celles de $re^{i\theta}$ sont $\pm \sqrt r\, e^{i\theta/2}$. Il n'y a pas de « racine carrée positive » privilégiée : la notation $\sqrt{z}$ est réservée aux réels positifs.

::: théorème Équation du second degré dans ℂ {#thm-second-degre}
Soient $a, b, c \in \mathbb{C}$ avec $a \neq 0$, et $\Delta = b^2 - 4ac$. Si $\delta$ est une racine carrée de $\Delta$ (c'est-à-dire $\delta^2 = \Delta$), les solutions de $az^2 + bz + c = 0$ sont
$$z_1 = \frac{-b + \delta}{2a}, \qquad z_2 = \frac{-b - \delta}{2a},$$
distinctes si $\Delta \neq 0$, confondues (racine double $-\frac{b}{2a}$) si $\Delta = 0$.
:::

La preuve est la mise sous forme canonique : $az^2 + bz + c = a\left[\left(z + \frac{b}{2a}\right)^2 - \frac{\Delta}{4a^2}\right] = a\left(z + \frac{b}{2a} - \frac{\delta}{2a}\right)\left(z + \frac{b}{2a} + \frac{\delta}{2a}\right)$, et un produit de complexes est nul si et seulement si l'un des facteurs l'est. Quand $a, b, c$ sont réels et $\Delta < 0$, on prend $\delta = i\sqrt{-\Delta}$ : les deux racines sont conjuguées.

::: proposition Somme et produit des racines {#prop-somme-produit}
Les racines $z_1, z_2$ de $az^2 + bz + c = 0$ (comptées avec multiplicité) vérifient $z_1 + z_2 = -\frac{b}{a}$ et $z_1 z_2 = \frac{c}{a}$. Réciproquement, deux complexes de somme $s$ et de produit $p$ sont les racines de $z^2 - sz + p = 0$.
:::

### Racines n-ièmes

::: théorème Racines n-ièmes de l'unité {#thm-racines-unite}
Soit $n \ge 1$. Les solutions de $z^n = 1$ sont les $n$ complexes distincts
$$\omega_k = e^{2ik\pi/n}, \qquad k = 0, 1, \ldots, n - 1.$$
On note $\mathbb{U}_n$ leur ensemble. Dans le plan, ce sont les sommets du polygone régulier à $n$ côtés inscrit dans le cercle unité, dont l'un des sommets est $1$.
:::

::: preuve Racines n-ièmes de l'unité
Si $z^n = 1$, alors $|z|^n = 1$, donc $|z| = 1$ et $z = e^{i\theta}$. L'équation devient $e^{in\theta} = 1$, c'est-à-dire $n\theta \in 2\pi\mathbb{Z}$, soit $\theta = \frac{2k\pi}{n}$ avec $k \in \mathbb{Z}$. Deux tels nombres $e^{2ik\pi/n}$ et $e^{2il\pi/n}$ sont égaux si et seulement si $\frac{2(k - l)\pi}{n} \in 2\pi \mathbb{Z}$, c'est-à-dire si $n$ divise $k - l$ : les valeurs $k = 0, \ldots, n-1$ donnent toutes les solutions, chacune une fois.
:::

Pour $n = 3$, on note $j = e^{2i\pi/3} = -\frac12 + i\frac{\sqrt3}{2}$ : $\mathbb{U}_3 = \{1, j, j^2\}$, avec $j^2 = \overline{j}$ et $1 + j + j^2 = 0$. Pour $n = 4$, $\mathbb{U}_4 = \{1, i, -1, -i\}$.

::: proposition Racines n-ièmes d'un complexe non nul {#prop-racines-n}
Soit $a = re^{i\theta}$ avec $r > 0$. Les solutions de $z^n = a$ sont les $n$ complexes
$$z_k = r^{1/n} e^{i\theta/n}\, e^{2ik\pi/n}, \qquad k = 0, \ldots, n - 1.$$
Ce sont les produits d'une solution particulière $z_0$ par les racines $n$-ièmes de l'unité.
:::

En effet, $z^n = a = z_0^n$ équivaut à $\left(\frac{z}{z_0}\right)^n = 1$. Ce principe (une solution particulière fois les solutions de l'équation « homogène ») reviendra pour les équations différentielles et les systèmes linéaires.

::: exemple Somme des racines n-ièmes de l'unité {#ex-somme-racines}
Pour $n \ge 2$, $\sum_{k=0}^{n-1} \omega_k = 0$ : c'est une somme géométrique de raison $\omega_1 \neq 1$, égale à $\frac{1 - \omega_1^n}{1 - \omega_1} = 0$. Géométriquement, le centre de gravité des sommets d'un polygone régulier est son centre.
:::

## Exponentielle complexe et géométrie {#geometrie}

::: définition Exponentielle complexe {#def-exp}
Pour $z \in \mathbb{C}$, on pose $e^z = \exp(z) = e^{\operatorname{Re} z}\, e^{i\operatorname{Im} z}$. Ainsi $|e^z| = e^{\operatorname{Re} z}$, et $\operatorname{Im} z$ est un argument de $e^z$ ; en particulier $e^z \neq 0$.
:::

Cette définition prolonge à la fois l'exponentielle réelle ($z$ réel) et $e^{it}$ ($z$ imaginaire pur), et conserve la règle fondamentale : $e^{z + w} = e^z e^w$ pour tous $z, w \in \mathbb{C}$, conséquence de la même règle pour l'exponentielle réelle et pour $e^{it}$. Le cours [[series-entieres#def-exp]] en donnera une autre construction, par une série entière.

::: proposition Égalité de deux exponentielles {#prop-exp-egal}
Pour tous $z, w \in \mathbb{C}$, $e^z = e^w$ si et seulement si $z - w \in 2i\pi\mathbb{Z}$.
:::

L'exponentielle complexe n'est donc pas injective : elle est périodique de période $2i\pi$. Pour la preuve, $e^z = e^w$ équivaut à $e^{z - w} = 1$, puis à $e^{\operatorname{Re}(z - w)} = 1$ (modules) et $e^{i\operatorname{Im}(z-w)} = 1$ (arguments), soit $\operatorname{Re}(z - w) = 0$ et $\operatorname{Im}(z - w) \in 2\pi\mathbb{Z}$.

::: méthode Résoudre exp(z) = a {#meth-exp-a}
Si $a = 0$, il n'y a pas de solution. Si $a = re^{i\theta}$ avec $r > 0$, on cherche $z = x + iy$ : l'équation équivaut à $e^x = r$ et $y \equiv \theta \ [2\pi]$, soit
$$z = \ln r + i(\theta + 2k\pi), \qquad k \in \mathbb{Z}.$$
Exemple : $e^z = -1$ a pour solutions les $(2k + 1)i\pi$, $k \in \mathbb{Z}$.
:::

### Géométrie du plan complexe

Soient $A, B, C$ trois points d'affixes $a, b, c$, avec $A \neq B$ et $A \neq C$. Le complexe $\frac{c - a}{b - a}$ code tout ce qui concerne l'angle en $A$ du triangle.

::: proposition Module et argument de (c − a)/(b − a) {#prop-geom}
Le module de $\frac{c - a}{b - a}$ est le rapport des longueurs $\frac{AC}{AB}$, et ses arguments sont les mesures de l'angle orienté $(\overrightarrow{AB}, \overrightarrow{AC})$. En conséquence :

- $A, B, C$ sont **alignés** si et seulement si $\frac{c - a}{b - a}$ est réel ;
- les droites $(AB)$ et $(AC)$ sont **perpendiculaires** si et seulement si $\frac{c - a}{b - a}$ est imaginaire pur.
:::

Exemple : le triangle $ABC$ est équilatéral direct si et seulement si $c - a = e^{i\pi/3}(b - a)$, ce qui s'écrit aussi $a + jb + j^2 c = 0$ (exercice m3).

::: proposition Les applications z ↦ az + b {#prop-similitude}
Soient $a \in \mathbb{C}^*$ et $b \in \mathbb{C}$, et $f : z \mapsto az + b$.

- Si $a = 1$, $f$ est la **translation** de vecteur d'affixe $b$.
- Si $a \neq 1$, $f$ a un unique point fixe $\omega = \frac{b}{1 - a}$, et $f(z) - \omega = a(z - \omega)$ : $f$ est la composée, commutative, de la **rotation** de centre $\omega$ et d'angle $\arg a$ et de l'**homothétie** de centre $\omega$ et de rapport $|a|$.

On appelle **similitudes directes** ces applications : elles conservent les angles orientés et multiplient les distances par $|a|$.
:::

::: remarque La conjugaison est une symétrie {#rem-conj}
L'application $z \mapsto \overline{z}$ est la symétrie orthogonale par rapport à l'axe réel. Elle conserve les distances mais **renverse** les angles orientés : $\overline{z}$ ne s'écrit pas $az + b$. Composée avec une similitude directe, elle donne les similitudes indirectes, hors programme.
:::

On retiendra la traduction : un problème de géométrie plane (alignement, angle droit, rotation) devient un calcul sur des complexes. Inversement, un calcul de complexes (une somme de racines de l'unité, un produit de facteurs $1 - \omega_k$) se lit comme une propriété de figures.
