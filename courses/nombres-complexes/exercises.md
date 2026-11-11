# s1 · simple · 10 · Une puissance par la forme trigonométrique
Calculer $(1 + i\sqrt3)^{10}$ sous forme algébrique. Donner sa partie réelle.
## Indice
Calculer directement par le binôme serait long : passer par la forme trigonométrique.
## Indice
$|1 + i\sqrt3| = 2$ et $1 + i\sqrt3 = 2\left(\frac12 + i\frac{\sqrt3}{2}\right)$ : quel argument ?
## Indice
$1 + i\sqrt3 = 2e^{i\pi/3}$, donc la puissance dixième vaut $2^{10} e^{10i\pi/3}$ ; réduire l'angle modulo $2\pi$.
## Étape · 1
$1 + i\sqrt3 = 2e^{i\pi/3}$, d'où $(1 + i\sqrt3)^{10} = 1024\, e^{10i\pi/3}$.
## Étape · 1
$\frac{10\pi}{3} = 4\pi - \frac{2\pi}{3}$, donc $e^{10i\pi/3} = e^{-2i\pi/3} = -\frac12 - i\frac{\sqrt3}{2}$, et $(1 + i\sqrt3)^{10} = -512 - 512\sqrt3\, i$. La partie réelle vaut $-512$.
## Réponse
num -512 ± 0.5

# s2 · simple · 10 · Racines carrées de −3 + 4i
Déterminer les racines carrées de $-3 + 4i$ sous forme algébrique. Donner la partie imaginaire de celle dont la partie réelle est positive.
## Indice
Chercher $z = x + iy$ avec $z^2 = -3 + 4i$ et identifier parties réelles et imaginaires.
## Indice
Ajouter l'équation sur les modules : $x^2 + y^2 = |-3 + 4i|$.
## Indice
On trouve $x^2 = 1$ et $y^2 = 4$ ; le produit $xy$ a le signe de $4$.
## Étape · 1
$z^2 = -3 + 4i$ équivaut à $x^2 - y^2 = -3$ et $2xy = 4$. Les modules donnent $x^2 + y^2 = \sqrt{9 + 16} = 5$.
## Étape · 1
Donc $x^2 = 1$, $y^2 = 4$, et $xy = 2 > 0$ : $x$ et $y$ ont le même signe. Les racines carrées sont $1 + 2i$ et $-1 - 2i$ ; vérification : $(1 + 2i)^2 = 1 + 4i - 4 = -3 + 4i$. Réponse : $2$.
## Réponse
num 2 ± 0.001

# m1 · moyen · 25 · Sommes de cosinus
Soient $t \in \mathbb{R} \setminus 2\pi\mathbb{Z}$ et $n \in \mathbb{N}$. On pose $C_n = \sum_{k=0}^{n} \cos(kt)$ et $S_n = \sum_{k=0}^{n} \sin(kt)$.

1. Calculer $C_n + iS_n$ à l'aide d'une somme géométrique.
2. Factoriser numérateur et dénominateur par l'angle moitié et en déduire
$$C_n = \frac{\sin\big(\frac{(n+1)t}{2}\big)\cos\big(\frac{nt}{2}\big)}{\sin\big(\frac t2\big)}.$$
3. Vérifier la formule pour $n = 4$ et $t = \frac{\pi}{3}$ en calculant directement $C_4$, que l'on donnera.
## Indice
$C_n + i S_n = \sum_{k=0}^{n} e^{ikt}$, somme géométrique de raison $e^{it}$. Pourquoi $e^{it} \neq 1$ ?
## Indice
$e^{i(n+1)t} - 1 = 2i\sin\big(\frac{(n+1)t}{2}\big)e^{i(n+1)t/2}$ et $e^{it} - 1 = 2i\sin\big(\frac t2\big) e^{it/2}$.
## Indice
Le quotient vaut $\frac{\sin((n+1)t/2)}{\sin(t/2)}\, e^{int/2}$ ; prendre la partie réelle.
## Étape · 1
Comme $t \notin 2\pi\mathbb{Z}$, $e^{it} \neq 1$ et $C_n + iS_n = \sum_{k=0}^n (e^{it})^k = \frac{e^{i(n+1)t} - 1}{e^{it} - 1}$.
## Étape · 2
Par l'angle moitié, le quotient vaut $\frac{2i\sin((n+1)t/2)\, e^{i(n+1)t/2}}{2i\sin(t/2)\, e^{it/2}} = \frac{\sin((n+1)t/2)}{\sin(t/2)}\, e^{int/2}$, où $\sin(t/2) \neq 0$ car $t \notin 2\pi\mathbb{Z}$.
## Étape · 1
Le facteur $\frac{\sin((n+1)t/2)}{\sin(t/2)}$ est réel : la partie réelle donne la formule de $C_n$ (et la partie imaginaire, $S_n = \frac{\sin((n+1)t/2)\sin(nt/2)}{\sin(t/2)}$).
## Étape · 1
Pour $n = 4$, $t = \frac\pi3$ : directement, $C_4 = 1 + \frac12 - \frac12 - 1 - \frac12 = -\frac12$. Par la formule : $\frac{\sin(5\pi/6)\cos(2\pi/3)}{\sin(\pi/6)} = \frac{\frac12 \cdot (-\frac12)}{\frac12} = -\frac12$.
## Réponse
num -0.5 ± 0.001

# m2 · moyen · 30 · Une équation du second degré à coefficients complexes
Résoudre dans $\mathbb{C}$ l'équation $z^2 - (5 + 3i)z + 4 + 7i = 0$. Donner la somme des parties réelles des deux solutions, puis le produit de leurs modules.
## Indice
Calculer le discriminant $\Delta = (5 + 3i)^2 - 4(4 + 7i)$.
## Indice
On trouve $\Delta = 2i$ ; chercher une racine carrée de $2i$ (méthode algébrique ou forme trigonométrique).
## Indice
$(1 + i)^2 = 2i$. Pour la dernière question, la somme et le produit des racines suffisent.
## Étape · 1
$\Delta = 25 + 30i - 9 - 16 - 28i = 2i$, et $\delta = 1 + i$ vérifie $\delta^2 = 2i$.
## Étape · 2
Les solutions sont $\frac{5 + 3i + 1 + i}{2} = 3 + 2i$ et $\frac{5 + 3i - 1 - i}{2} = 2 + i$. Vérification par la somme $5 + 3i$ et le produit $(3 + 2i)(2 + i) = 4 + 7i$.
## Étape · 1
La somme des parties réelles vaut $5$, la partie réelle de la somme des racines $5 + 3i$. Le produit des modules est le module du produit : $|4 + 7i| = \sqrt{65}$.
## Réponse
num 5 ± 0.001

# m3 · moyen · 30 · Triangle équilatéral et racines cubiques
On note $j = e^{2i\pi/3}$. Soient $A, B, C$ trois points distincts d'affixes $a, b, c$. Le triangle $ABC$ est dit **équilatéral direct** si $C$ est l'image de $B$ par la rotation de centre $A$ et d'angle $\frac{\pi}{3}$.

1. Vérifier que $1 + j + j^2 = 0$ et que $e^{i\pi/3} = -j^2$.
2. Montrer que $ABC$ est équilatéral direct si et seulement si $a + jb + j^2c = 0$.
3. Les points d'affixes $0$, $2$ et $1 + i\sqrt3$ forment-ils un triangle équilatéral direct ?
## Indice
$j$ est une racine cubique de l'unité différente de $1$ : utiliser la somme des racines $n$-ièmes. Pour $-j^2$, écrire $-1 = e^{i\pi}$.
## Indice
La rotation de centre $A$ et d'angle $\frac\pi3$ s'écrit $z \mapsto a + e^{i\pi/3}(z - a)$.
## Indice
Remplacer $e^{i\pi/3}$ par $-j^2$, puis $1 + j^2$ par $-j$, et multiplier par $j^2$ (rappel : $j^3 = 1$).
## Étape · 1
$1 + j + j^2 = \frac{1 - j^3}{1 - j} = 0$ car $j^3 = 1$ et $j \neq 1$. Et $-j^2 = e^{i\pi}e^{4i\pi/3} = e^{7i\pi/3} = e^{i\pi/3}$.
## Étape · 2
$ABC$ équilatéral direct équivaut à $c - a = e^{i\pi/3}(b - a) = -j^2(b - a)$, soit $c + j^2 b - (1 + j^2)a = 0$, c'est-à-dire $c + j^2 b + ja = 0$.
## Étape · 1
En multipliant par $j^2$ (qui est non nul, et $j^3 = 1$, $j^4 = j$) : $j^2 c + jb + a = 0$. Les opérations sont réversibles (multiplier par $j$ ramène à la forme précédente), d'où l'équivalence.
## Étape · 1
Avec $a = 0$, $b = 2$, $c = 1 + i\sqrt3$ : $a + jb + j^2c = 2j + j^2(1 + i\sqrt3) = 2j + 2j^2 e^{i\pi/3} = 2j + 2e^{5i\pi/3}$. Or $2j = -1 + i\sqrt3$ et $2e^{5i\pi/3} = 1 - i\sqrt3$ : la somme est nulle. Le triangle est équilatéral direct.
## Réponse
qcm A
- oui
- non, il est équilatéral mais indirect
- non, il n'est pas équilatéral

# c1 · complexe · 60 · Le produit des sinus
Soit $n \ge 2$ et $\omega_k = e^{2ik\pi/n}$ pour $k = 0, \ldots, n-1$.

1. Montrer que, pour tout $z \in \mathbb{C}$, $z^n - 1 = \prod_{k=0}^{n-1} (z - \omega_k)$.
2. En déduire que $\prod_{k=1}^{n-1}(z - \omega_k) = \sum_{j=0}^{n-1} z^j$ pour $z \neq 1$, puis pour tout $z$.
3. Montrer que $|1 - e^{i\theta}| = 2\left|\sin\frac{\theta}{2}\right|$ pour tout réel $\theta$.
4. Démontrer la formule
$$\prod_{k=1}^{n-1} \sin\Big(\frac{k\pi}{n}\Big) = \frac{n}{2^{n-1}}.$$
5. Calculer ce produit pour $n = 6$ et vérifier la valeur directement.
## Indice
Pour 1 : les $\omega_k$ sont $n$ racines distinctes du polynôme $z^n - 1$, de degré $n$ et de coefficient dominant $1$ (factorisation répétée par $z - a$).
## Indice
Pour 2 : diviser par $z - \omega_0 = z - 1$ et reconnaître une somme géométrique ; les deux membres sont des fonctions polynomiales qui coïncident sur $\mathbb{C} \setminus \{1\}$, et sont continues. Pour 3 : l'angle moitié.
## Indice
Pour 4 : évaluer l'égalité de la question 2 en $z = 1$, puis prendre les modules ; pour $1 \le k \le n - 1$, $\frac{k\pi}{n} \in\, ]0, \pi[$, donc le sinus est positif.
## Étape · 1
Les $\omega_k$, $0 \le k \le n-1$, sont $n$ racines distinctes de $P(z) = z^n - 1$. En factorisant successivement par $z - \omega_0$, puis $z - \omega_1$, etc., on obtient $P(z) = \prod_{k=0}^{n-1}(z - \omega_k) \cdot Q(z)$ avec $Q$ de degré $0$, donc constant ; en comparant les termes de degré $n$, $Q = 1$.
## Étape · 1
Pour $z \neq 1$ : $\prod_{k=1}^{n-1}(z - \omega_k) = \frac{z^n - 1}{z - 1} = \sum_{j=0}^{n-1} z^j$. Les deux membres sont des fonctions polynomiales, donc continues ; elles coïncident sur $\mathbb{C} \setminus \{1\}$, donc aussi en $1$ (en faisant tendre $z$ vers $1$ le long des réels).
## Étape · 1
Par l'angle moitié, $1 - e^{i\theta} = -2i\sin\frac\theta2\, e^{i\theta/2}$, de module $2\left|\sin\frac\theta2\right|$.
## Étape · 2
En $z = 1$ : $\prod_{k=1}^{n-1}(1 - \omega_k) = n$. En prenant les modules et en appliquant 3 avec $\theta = \frac{2k\pi}{n}$ : $\prod_{k=1}^{n-1} 2\left|\sin\frac{k\pi}{n}\right| = n$. Pour $1 \le k \le n-1$, $\sin\frac{k\pi}{n} > 0$ : on enlève les valeurs absolues, et $2^{n-1}\prod_{k=1}^{n-1}\sin\frac{k\pi}{n} = n$.
## Étape · 1
Pour $n = 6$ : $\frac{6}{2^5} = \frac{3}{16} = 0{,}1875$. Directement : $\sin\frac\pi6 \sin\frac\pi3 \sin\frac\pi2 \sin\frac{2\pi}3 \sin\frac{5\pi}6 = \frac12 \cdot \frac{\sqrt3}2 \cdot 1 \cdot \frac{\sqrt3}2 \cdot \frac12 = \frac{3}{16}$.
## Réponse
num 0.1875 ± 0.0001
