# s1 · simple · 10 · Euclide étendu
Calculer $1071 \wedge 462$ par l'algorithme d'Euclide, puis trouver des entiers $u, v$ tels que $1071u + 462v = 1071 \wedge 462$. Donner le PGCD.
## Indice
Diviser $1071$ par $462$, puis $462$ par le reste, et ainsi de suite.
## Indice
Les restes successifs sont $147$, $21$, puis $0$.
## Indice
Remonter : $21 = 462 - 3 \times 147$, puis remplacer $147$ par $1071 - 2 \times 462$.
## Étape · 1
$1071 = 2 \times 462 + 147$, $462 = 3 \times 147 + 21$, $147 = 7 \times 21 + 0$ : le dernier reste non nul est $21$, donc $1071 \wedge 462 = 21$.
## Étape · 1
$21 = 462 - 3(1071 - 2 \times 462) = 7 \times 462 - 3 \times 1071$ : $u = -3$, $v = 7$. Vérification : $3234 - 3213 = 21$.
## Réponse
num 21 ± 0.001

# m1 · moyen · 25 · Une équation de congruence
Résoudre dans $\mathbb{Z}$ l'équation $7x \equiv 3\ [26]$. Donner la solution comprise entre $0$ et $25$.
## Indice
$7 \wedge 26 = 1$ : $7$ a un inverse modulo $26$, à trouver par l'algorithme d'Euclide étendu.
## Indice
$26 = 3 \times 7 + 5$, $7 = 5 + 2$, $5 = 2 \times 2 + 1$ ; remonter jusqu'à $1 = 3 \times 26 - 11 \times 7$.
## Indice
Un inverse de $7$ est donc $-11 \equiv 15\ [26]$ ; multiplier l'équation par $15$.
## Étape · 2
Euclide étendu : $1 = 5 - 2 \times 2 = 5 - 2(7 - 5) = 3 \times 5 - 2 \times 7 = 3(26 - 3 \times 7) - 2 \times 7 = 3 \times 26 - 11 \times 7$. Donc $7 \times (-11) \equiv 1\ [26]$, et $15$ est un inverse de $7$ modulo $26$ ($7 \times 15 = 105 = 4 \times 26 + 1$).
## Étape · 1
$7x \equiv 3$ implique $x \equiv 15 \times 7x \equiv 45 \equiv 19\ [26]$ ; réciproquement, $7 \times 19 = 133 = 5 \times 26 + 3$.
## Étape · 1
Les solutions sont les $x = 19 + 26k$, $k \in \mathbb{Z}$ ; entre $0$ et $25$ : $x = 19$.
## Réponse
num 19 ± 0.001

# c1 · complexe · 60 · Le petit théorème de Fermat
Soit $p$ un nombre premier.

1. Montrer que $p$ divise $\binom pk$ pour $1 \le k \le p - 1$.
2. En déduire que $(a + 1)^p \equiv a^p + 1\ [p]$ pour tout $a \in \mathbb{Z}$.
3. Démontrer que $a^p \equiv a\ [p]$ pour tout $a \in \mathbb{N}$, puis pour tout $a \in \mathbb{Z}$.
4. En déduire que $a^{p-1} \equiv 1\ [p]$ si $p$ ne divise pas $a$.
5. Calculer le reste de la division de $2^{100}$ par $13$.
## Indice
Pour 1 : $k\binom pk = p\binom{p-1}{k-1}$ ; $p$ est premier avec $k$ quand $1 \le k \le p - 1$, et le lemme de Gauss conclut.
## Indice
Pour 3 : récurrence sur $a \ge 0$ avec 2 ; pour $a$ négatif, remplacer $a$ par son reste $r$ modulo $p$. Pour 4 : $p$ divise $a(a^{p-1} - 1)$.
## Indice
Pour 5 : Fermat donne $2^{12} \equiv 1\ [13]$ ; écrire $100 = 8 \times 12 + 4$.
## Étape · 2
Pour $1 \le k \le p - 1$ : $k\binom pk = \frac{p!}{(k-1)!(p-k)!} = p\binom{p-1}{k-1}$, donc $p$ divise $k\binom pk$. Comme $p$ est premier et $1 \le k < p$, $p \wedge k = 1$, et Gauss donne $p \mid \binom pk$.
## Étape · 1
Par le binôme, $(a + 1)^p = a^p + \sum_{k=1}^{p-1}\binom pk a^k + 1$, et chaque terme de la somme est un multiple de $p$ : $(a + 1)^p \equiv a^p + 1\ [p]$.
## Étape · 2
Récurrence sur $a \in \mathbb{N}$ : $0^p = 0$, et si $a^p \equiv a$, alors $(a + 1)^p \equiv a^p + 1 \equiv a + 1\ [p]$. Pour $a \in \mathbb{Z}$, soit $r \in \{0, \ldots, p - 1\}$ son reste modulo $p$ : $a \equiv r$ donne $a^p \equiv r^p \equiv r \equiv a\ [p]$.
## Étape · 1
Si $p \nmid a$, alors $p \wedge a = 1$ ; comme $p$ divise $a^p - a = a(a^{p-1} - 1)$, le lemme de Gauss donne $p \mid a^{p-1} - 1$.
## Étape · 1
$13$ est premier et ne divise pas $2$ : $2^{12} \equiv 1\ [13]$. Donc $2^{100} = (2^{12})^8 \cdot 2^4 \equiv 16 \equiv 3\ [13]$. Le reste est $3$.
## Réponse
num 3 ± 0.001
