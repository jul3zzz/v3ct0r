# s1 · simple · 10 · Une loi de groupe déguisée
Sur $\mathbb{R}$, on pose $x \star y = x + y - 1$. Montrer que $(\mathbb{R}, \star)$ est un groupe commutatif, déterminer son élément neutre et l'inverse de $5$.
## Indice
Associativité : calculer $(x \star y) \star z$ et $x \star (y \star z)$.
## Indice
Le neutre $e$ vérifie $x + e - 1 = x$ pour tout $x$. L'inverse $x'$ de $x$ vérifie $x + x' - 1 = e$.
## Indice
Remarquer que $f : x \mapsto x - 1$ vérifie $f(x \star y) = f(x) + f(y)$ : c'est un isomorphisme de $(\mathbb{R}, \star)$ sur $(\mathbb{R}, +)$.
## Étape · 1
$(x \star y) \star z = x + y + z - 2 = x \star (y \star z)$ ; la loi est commutative. Le neutre est $e = 1$, puisque $x \star 1 = x$.
## Étape · 1
L'inverse de $x$ est $x' = 2 - x$, car $x \star (2 - x) = 1$. Pour $x = 5$ : $x' = -3$. Tout élément étant inversible, $(\mathbb{R}, \star)$ est un groupe commutatif, isomorphe à $(\mathbb{R}, +)$ par $x \mapsto x - 1$.
## Réponse
num -3 ± 0.001

# m1 · moyen · 30 · Le corps ℚ(√2)
Soit $K = \{a + b\sqrt2 : a, b \in \mathbb{Q}\}$.

1. Montrer que l'écriture $a + b\sqrt2$ d'un élément de $K$ est unique (on admet que $\sqrt2$ est irrationnel).
2. Montrer que $K$ est un sous-anneau de $\mathbb{R}$.
3. Montrer que tout élément non nul de $K$ a son inverse dans $K$ : $K$ est un corps.
4. Écrire l'inverse de $1 + \sqrt2$ sous la forme $a + b\sqrt2$ et donner $a$.
## Indice
Pour 1 : si $a + b\sqrt2 = a' + b'\sqrt2$ avec $b \neq b'$, isoler $\sqrt2$.
## Indice
Pour 2 : $1 \in K$ ; calculer la différence et le produit de deux éléments de $K$.
## Indice
Pour 3 : multiplier par la « quantité conjuguée » $a - b\sqrt2$ ; montrer que $a^2 - 2b^2 \neq 0$ si $(a, b) \neq (0, 0)$, grâce à l'irrationalité de $\sqrt2$.
## Étape · 1
Si $a + b\sqrt2 = a' + b'\sqrt2$ et $b \neq b'$, alors $\sqrt2 = \frac{a - a'}{b' - b} \in \mathbb{Q}$ : contradiction. Donc $b = b'$, puis $a = a'$.
## Étape · 2
$1 = 1 + 0\sqrt2 \in K$ ; $(a + b\sqrt2) - (c + d\sqrt2) = (a - c) + (b - d)\sqrt2 \in K$ et $(a + b\sqrt2)(c + d\sqrt2) = (ac + 2bd) + (ad + bc)\sqrt2 \in K$ : $K$ est un sous-anneau de $\mathbb{R}$, commutatif.
## Étape · 2
Si $a + b\sqrt2 \neq 0$, alors $a^2 - 2b^2 \neq 0$ : sinon, avec $b \neq 0$, $\sqrt2 = \pm\frac ab$ serait rationnel, et avec $b = 0$ on aurait $a = 0$. Alors $\frac{1}{a + b\sqrt2} = \frac{a - b\sqrt2}{a^2 - 2b^2} = \frac{a}{a^2 - 2b^2} - \frac{b}{a^2 - 2b^2}\sqrt2 \in K$.
## Étape · 1
$\frac{1}{1 + \sqrt2} = \frac{1 - \sqrt2}{1 - 2} = -1 + \sqrt2$ : $a = -1$ (et $b = 1$).
## Réponse
num -1 ± 0.001

# c1 · complexe · 60 · Les sous-groupes de ℤ
1. Montrer que, pour tout $n \in \mathbb{N}$, $n\mathbb{Z} = \{nk : k \in \mathbb{Z}\}$ est un sous-groupe de $(\mathbb{Z}, +)$.
2. Soit $H$ un sous-groupe de $(\mathbb{Z}, +)$ non réduit à $\{0\}$. Montrer que $H \cap \mathbb{N}^*$ a un plus petit élément $n$, et que $n\mathbb{Z} \subset H$.
3. Par la division euclidienne, montrer que $H = n\mathbb{Z}$. Conclure : les sous-groupes de $\mathbb{Z}$ sont les $n\mathbb{Z}$, $n \in \mathbb{N}$.
4. Pour $a, b \in \mathbb{Z}$ non tous deux nuls, montrer que $a\mathbb{Z} + b\mathbb{Z} = \{au + bv : u, v \in \mathbb{Z}\}$ est un sous-groupe, égal à $d\mathbb{Z}$ avec $d = a \wedge b$. Retrouver ainsi la relation de Bézout.
5. Déterminer $d$ tel que $12\mathbb{Z} + 18\mathbb{Z} = d\mathbb{Z}$.
## Indice
Pour 2 : $H$ contient un $h \neq 0$, donc aussi $-h$ ; l'un des deux est dans $\mathbb{N}^*$. Toute partie non vide de $\mathbb{N}$ a un plus petit élément. Un sous-groupe stable contenant $n$ contient $n + n$, $-n$…
## Indice
Pour 3 : pour $h \in H$, écrire $h = nq + r$ avec $0 \le r < n$ ; alors $r = h - nq \in H$, et la minimalité de $n$ impose $r = 0$.
## Indice
Pour 4 : $a\mathbb{Z} + b\mathbb{Z} = d\mathbb{Z}$ pour un $d \ge 1$ par 3 ; montrer que $d$ divise $a$ et $b$, et que tout diviseur commun de $a$ et $b$ divise $d$.
## Étape · 1
$0 = n \cdot 0 \in n\mathbb{Z}$, et $nk - nl = n(k - l) \in n\mathbb{Z}$ : par la caractérisation, $n\mathbb{Z}$ est un sous-groupe.
## Étape · 1
Soit $h \in H$ non nul ; $-h \in H$, donc $H \cap \mathbb{N}^*$ est une partie non vide de $\mathbb{N}$ : elle a un plus petit élément $n$. Par stabilité (récurrence) $kn \in H$ pour $k \in \mathbb{N}$, et par passage à l'opposé pour $k < 0$ : $n\mathbb{Z} \subset H$.
## Étape · 2
Soit $h \in H$ et $h = nq + r$, $0 \le r < n$, sa division euclidienne par $n$. Comme $nq \in H$, $r = h - nq \in H$ ; si $r > 0$, ce serait un élément de $H \cap \mathbb{N}^*$ plus petit que $n$. Donc $r = 0$ et $h \in n\mathbb{Z}$ : $H = n\mathbb{Z}$. Avec $\{0\} = 0\mathbb{Z}$, les sous-groupes de $\mathbb{Z}$ sont exactement les $n\mathbb{Z}$.
## Étape · 2
$a\mathbb{Z} + b\mathbb{Z}$ contient $0$ et est stable par différence : c'est un sous-groupe, non nul, donc égal à $d\mathbb{Z}$ avec $d \ge 1$. Comme $a, b \in d\mathbb{Z}$, $d$ divise $a$ et $b$ ; comme $d \in a\mathbb{Z} + b\mathbb{Z}$, $d = au + bv$, et tout diviseur commun de $a$ et $b$ divise $d$. Donc $d$ est le plus grand diviseur commun : $d = a \wedge b$, et $d = au + bv$ est la relation de Bézout.
## Étape · 1
$12\mathbb{Z} + 18\mathbb{Z} = (12 \wedge 18)\mathbb{Z} = 6\mathbb{Z}$ ; par exemple $6 = 18 - 12$.
## Réponse
num 6 ± 0.001
