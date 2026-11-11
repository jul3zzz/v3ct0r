# s1 · simple · 10 · Une division euclidienne
Effectuer la division euclidienne de $A = X^4 + 1$ par $B = X^2 + X + 1$. Quel est le reste ?
## Indice
Éliminer d'abord le terme $X^4$ en retranchant $X^2 B$.
## Indice
Après la première étape, il reste $-X^3 - X^2 + 1$ : éliminer $-X^3$ avec $-XB$.
## Indice
On s'arrête quand le reste est de degré strictement inférieur à $2$.
## Étape · 1
$A - X^2 B = -X^3 - X^2 + 1$, puis $(-X^3 - X^2 + 1) + XB = X + 1$, de degré $1 < 2$.
## Étape · 1
Donc $A = B(X^2 - X) + (X + 1)$ : quotient $X^2 - X$, reste $X + 1$. Vérification : $(X^2 - X)(X^2 + X + 1) = X^4 - X$, et $X^4 - X + X + 1 = X^4 + 1$.
## Réponse
qcm B
- $1$
- $X + 1$
- $X - 1$
- $2X + 1$

# s2 · simple · 10 · Une somme de carrés de racines
Soient $x_1, x_2, x_3$ les racines complexes (comptées avec multiplicité) de $P = X^3 - 2X^2 + 3X - 4$. Calculer $x_1^2 + x_2^2 + x_3^2$ sans calculer les racines.
## Indice
$P$ est scindé sur $\mathbb{C}$ par le théorème de d'Alembert-Gauss : les relations coefficients-racines s'appliquent.
## Indice
$\sigma_1 = x_1 + x_2 + x_3$ et $\sigma_2 = x_1x_2 + x_1x_3 + x_2x_3$ se lisent sur les coefficients.
## Indice
$x_1^2 + x_2^2 + x_3^2 = \sigma_1^2 - 2\sigma_2$.
## Étape · 1
Ici $a_3 = 1$, $a_2 = -2$, $a_1 = 3$ : $\sigma_1 = -\frac{a_2}{a_3} = 2$ et $\sigma_2 = \frac{a_1}{a_3} = 3$.
## Étape · 1
$\sum x_i^2 = \sigma_1^2 - 2\sigma_2 = 4 - 6 = -2$. Une somme de carrés négative : au moins deux racines ne sont pas réelles (elles sont conjuguées).
## Réponse
num -2 ± 0.001

# m1 · moyen · 25 · Imposer une racine double
Déterminer les réels $a$ et $b$ tels que $(X - 1)^2$ divise $P = X^4 + aX + b$, puis factoriser $P$ dans $\mathbb{R}[X]$. Donner $b$.
## Indice
$(X - 1)^2 \mid P$ signifie que $1$ est racine de multiplicité au moins $2$.
## Indice
Caractérisation par les dérivées : $P(1) = 0$ et $P'(1) = 0$.
## Indice
Pour factoriser, diviser $P$ par $(X - 1)^2 = X^2 - 2X + 1$ et étudier le discriminant du quotient.
## Étape · 2
$P(1) = 1 + a + b = 0$ et $P'(1) = 4 + a = 0$, d'où $a = -4$ et $b = 3$.
## Étape · 1
$X^4 - 4X + 3 = (X^2 - 2X + 1)(X^2 + 2X + 3)$, vérifié en développant.
## Étape · 1
Le discriminant de $X^2 + 2X + 3$ vaut $4 - 12 = -8 < 0$ : ce facteur est irréductible dans $\mathbb{R}[X]$, et $P = (X - 1)^2(X^2 + 2X + 3)$.
## Réponse
num 3 ± 0.001

# m2 · moyen · 25 · Factoriser X⁶ − 1 dans ℝ[X]
Factoriser $X^6 - 1$ en produit d'irréductibles de $\mathbb{C}[X]$, puis de $\mathbb{R}[X]$. Combien de facteurs irréductibles a-t-on dans $\mathbb{R}[X]$ ?
## Indice
Les racines sont les racines sixièmes de l'unité $e^{ik\pi/3}$, $k = 0, \ldots, 5$.
## Indice
Deux d'entre elles sont réelles ; les autres se groupent par paires conjuguées.
## Indice
$(X - e^{i\theta})(X - e^{-i\theta}) = X^2 - 2\cos\theta\, X + 1$.
## Étape · 1
Dans $\mathbb{C}[X]$ : $X^6 - 1 = \prod_{k=0}^{5}(X - e^{ik\pi/3})$, six facteurs de degré $1$.
## Étape · 2
Les racines réelles sont $1$ et $-1$ ($k = 0$ et $k = 3$). Les paires conjuguées $e^{\pm i\pi/3}$ et $e^{\pm 2i\pi/3}$ donnent $X^2 - X + 1$ et $X^2 + X + 1$, de discriminant $-3 < 0$.
## Étape · 1
Dans $\mathbb{R}[X]$ : $X^6 - 1 = (X - 1)(X + 1)(X^2 - X + 1)(X^2 + X + 1)$, soit $4$ facteurs irréductibles. Contrôle : $(X^3 - 1)(X^3 + 1)$ avec $X^3 - 1 = (X - 1)(X^2 + X + 1)$.
## Réponse
num 4 ± 0.001

# m3 · moyen · 20 · Une parabole par trois points
Déterminer le polynôme $P$ de degré au plus $2$ tel que $P(0) = 1$, $P(1) = 3$ et $P(2) = 7$ (par la formule de Lagrange, ou en résolvant un système). Calculer $P(3)$.
## Indice
Unicité : deux tels polynômes ont une différence de degré au plus $2$ qui s'annule en trois points.
## Indice
Formule de Lagrange avec $x_1 = 0$, $x_2 = 1$, $x_3 = 2$ : $L_1 = \frac{(X - 1)(X - 2)}{2}$, $L_2 = -X(X - 2)$, $L_3 = \frac{X(X - 1)}{2}$.
## Indice
Ou bien : $P = aX^2 + bX + c$ avec $c = 1$, $a + b = 2$ et $4a + 2b = 6$.
## Étape · 2
$P = 1 \cdot \frac{(X-1)(X-2)}{2} - 3X(X - 2) + 7 \cdot \frac{X(X - 1)}{2} = \frac{X^2 - 3X + 2 - 6X^2 + 12X + 7X^2 - 7X}{2} = X^2 + X + 1$.
## Étape · 1
Vérification : $P(0) = 1$, $P(1) = 3$, $P(2) = 7$. Et $P(3) = 13$.
## Réponse
num 13 ± 0.001

# c1 · complexe · 75 · Les polynômes de Tchebychev
1. Montrer qu'il existe une suite de polynômes $(T_n)_{n \ge 0}$ de $\mathbb{R}[X]$ telle que $T_n(\cos\theta) = \cos(n\theta)$ pour tout réel $\theta$, définie par $T_0 = 1$, $T_1 = X$ et $T_{n+1} = 2XT_n - T_{n-1}$.
2. Montrer que $T_n$ est le seul polynôme vérifiant cette propriété.
3. Montrer que, pour $n \ge 1$, $T_n$ est de degré $n$ et de coefficient dominant $2^{n-1}$.
4. Déterminer les racines de $T_n$ ($n \ge 1$) et en déduire la factorisation de $T_n$ dans $\mathbb{R}[X]$.
5. Calculer $T_4$ et donner son coefficient de $X^2$.
## Indice
Pour 1 : $\cos((n+1)\theta) + \cos((n-1)\theta) = 2\cos\theta\cos(n\theta)$ (formule d'addition, ou angle moitié). Récurrence double.
## Indice
Pour 2 : deux polynômes qui coïncident sur $[-1, 1]$ (une infinité de points) sont égaux. Pour 3 : récurrence sur la relation $T_{n+1} = 2XT_n - T_{n-1}$.
## Indice
Pour 4 : $\cos(n\theta) = 0$ pour $\theta = \frac{(2k + 1)\pi}{2n}$ ; ces angles, pour $0 \le k \le n - 1$, sont dans $]0, \pi[$, où le cosinus est injectif. On a $n$ racines distinctes d'un polynôme de degré $n$.
## Étape · 2
Définissons $T_n$ par la récurrence ; par récurrence double, $T_n(\cos\theta) = \cos(n\theta)$ : c'est vrai pour $n = 0, 1$, et si c'est vrai aux rangs $n - 1$ et $n$, alors $T_{n+1}(\cos\theta) = 2\cos\theta\cos(n\theta) - \cos((n-1)\theta) = \cos((n+1)\theta)$, par la formule $\cos(a + b) + \cos(a - b) = 2\cos a\cos b$.
## Étape · 1
Si $Q(\cos\theta) = \cos(n\theta)$ pour tout $\theta$, alors $Q - T_n$ s'annule sur $\cos(\mathbb{R}) = [-1, 1]$, ensemble infini : $Q = T_n$.
## Étape · 2
Par récurrence double : $T_1 = X$ ; $T_2 = 2X^2 - 1$ ; si $T_n$ est de degré $n$ de coefficient dominant $2^{n-1}$ et $T_{n-1}$ de degré $n - 1$, alors $2XT_n$ est de degré $n + 1$, de coefficient dominant $2^n$, et $-T_{n-1}$ ne change pas ce terme.
## Étape · 2
Pour $x_k = \cos\frac{(2k+1)\pi}{2n}$, $0 \le k \le n - 1$ : $T_n(x_k) = \cos\frac{(2k+1)\pi}{2} = 0$. Les angles $\frac{(2k+1)\pi}{2n}$ sont distincts dans $]0, \pi[$, où $\cos$ est strictement décroissant : les $x_k$ sont $n$ racines distinctes de $T_n$, de degré $n$. Ce sont toutes les racines, et $T_n = 2^{n-1}\prod_{k=0}^{n-1}\Big(X - \cos\frac{(2k+1)\pi}{2n}\Big)$.
## Étape · 1
$T_3 = 2X(2X^2 - 1) - X = 4X^3 - 3X$ et $T_4 = 2X(4X^3 - 3X) - (2X^2 - 1) = 8X^4 - 8X^2 + 1$. Le coefficient de $X^2$ vaut $-8$ (contrôle : $T_4(\cos\theta) = \cos 4\theta = 2\cos^2 2\theta - 1$).
## Réponse
num -8 ± 0.001
