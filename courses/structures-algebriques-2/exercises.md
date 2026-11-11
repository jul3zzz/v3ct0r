# s1 · simple · 10 · L'ordre d'un élément de ℤ/12ℤ
Dans le groupe $(\mathbb{Z}/12\mathbb{Z}, +)$, quel est l'ordre de $\overline{8}$ ? Quels sont les générateurs du groupe ?
## Indice
L'ordre de $\overline{8}$ est le plus petit $k \ge 1$ tel que $12$ divise $8k$.
## Indice
En général, l'ordre de $\overline{a}$ dans $\mathbb{Z}/n\mathbb{Z}$ est $\frac{n}{a \wedge n}$.
## Indice
Les générateurs sont les $\overline{k}$ avec $k \wedge 12 = 1$.
## Étape · 1
$12 \mid 8k$ équivaut à $3 \mid 2k$, soit $3 \mid k$ : l'ordre est $3 = \frac{12}{8 \wedge 12}$.
## Étape · 1
Les générateurs sont $\overline{1}, \overline{5}, \overline{7}, \overline{11}$ : il y en a $\varphi(12) = 4$.
## Réponse
num 3 ± 0.001

# m1 · moyen · 25 · Un système de congruences
Résoudre le système $x \equiv 2\ [5]$, $x \equiv 3\ [7]$, et donner la solution comprise entre $0$ et $34$.
## Indice
$5 \wedge 7 = 1$ : par le théorème chinois, il y a une unique solution modulo $35$.
## Indice
Relation de Bézout : $3 \times 5 - 2 \times 7 = 1$.
## Indice
$x = 3 \times (3 \times 5) + 2 \times (-2 \times 7)$ convient : le premier terme vaut $3$ modulo $7$ et $0$ modulo $5$, le second $2$ modulo $5$ et $0$ modulo $7$.
## Étape · 1
$u = 3 \times 5 = 15$ vérifie $u \equiv 0\ [5]$ et $u \equiv 1\ [7]$ ; $v = -2 \times 7 = -14$ vérifie $v \equiv 1\ [5]$ et $v \equiv 0\ [7]$.
## Étape · 1
$x = 3u + 2v = 45 - 28 = 17$ : $17 = 3 \times 5 + 2$ et $17 = 2 \times 7 + 3$.
## Étape · 1
Les solutions sont les $17 + 35k$, $k \in \mathbb{Z}$ ; entre $0$ et $34$ : $17$.
## Réponse
num 17 ± 0.001

# c1 · complexe · 60 · Le principe de RSA
Soient $p = 5$ et $q = 11$, $n = pq = 55$, et $e = 3$.

1. Calculer $\varphi(n)$ et vérifier que $e \wedge \varphi(n) = 1$.
2. Trouver $d \in \{1, \ldots, \varphi(n) - 1\}$ tel que $ed \equiv 1\ [\varphi(n)]$.
3. Montrer que $m^{ed} \equiv m\ [n]$ pour tout entier $m$ premier avec $n$ (théorème d'Euler).
4. Montrer que c'est encore vrai pour tout entier $m$, en raisonnant modulo $p$ et modulo $q$ (petit théorème de Fermat et théorème chinois).
5. Chiffrer le message $m = 2$ (calculer $c = m^e$ modulo $55$), puis vérifier que $c^d \equiv 2\ [55]$. Donner $d$.
## Indice
$\varphi(pq) = (p - 1)(q - 1)$ pour $p, q$ premiers distincts. Pour 2, l'algorithme d'Euclide étendu sur $3$ et $40$.
## Indice
Pour 3 : $ed = 1 + k\varphi(n)$, et $m^{\varphi(n)} \equiv 1\ [n]$.
## Indice
Pour 4 : si $p \mid m$, $m^{ed} \equiv 0 \equiv m\ [p]$ ; sinon, Fermat modulo $p$ avec $p - 1 \mid \varphi(n)$. Puis $p$ et $q$ divisent $m^{ed} - m$, donc $pq$ aussi.
## Étape · 1
$\varphi(55) = 4 \times 10 = 40$ et $3 \wedge 40 = 1$.
## Étape · 1
$40 = 13 \times 3 + 1$, donc $1 = 40 - 13 \times 3$, et $3 \times (-13) \equiv 1\ [40]$ : $d = 27$ ($3 \times 27 = 81 = 2 \times 40 + 1$).
## Étape · 1
$ed = 1 + 2 \times 40$, et si $m \wedge 55 = 1$, Euler donne $m^{40} \equiv 1$, donc $m^{ed} = m\,(m^{40})^2 \equiv m\ [55]$.
## Étape · 2
Pour $m$ quelconque : si $p \mid m$, $m^{ed} \equiv 0 \equiv m\ [p]$ ; sinon $m^{p-1} \equiv 1\ [p]$ et, comme $p - 1 \mid ed - 1 = 80$, $m^{ed} \equiv m\ [p]$. De même modulo $q$. Donc $p$ et $q$, premiers entre eux, divisent $m^{ed} - m$, et $pq$ aussi.
## Étape · 1
$c = 2^3 = 8$. Puis $8^{27} = 2^{81} = 2 \cdot (2^{40})^2 \equiv 2\ [55]$ : le message est retrouvé. Ici $d = 27$.
## Réponse
num 27 ± 0.001
