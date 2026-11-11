# s1 · simple · 10 · Gradient et pente maximale
Soit $f(x, y, z) = xy^2 + e^z$. Calculer $\nabla f(1, 1, 0)$ et la pente maximale de $f$ en ce point, c'est-à-dire $\|\nabla f(1, 1, 0)\|$.
## Indice
Dériver par rapport à chaque variable, les autres étant fixées.
## Indice
$\frac{\partial f}{\partial x} = y^2$, $\frac{\partial f}{\partial y} = 2xy$, $\frac{\partial f}{\partial z} = e^z$.
## Indice
La dérivée selon un vecteur unitaire $u$ vaut $\langle \nabla f, u\rangle \le \|\nabla f\|$.
## Étape · 1
$\nabla f(1, 1, 0) = (1, 2, 1)$.
## Étape · 1
La pente maximale est $\|\nabla f(1, 1, 0)\| = \sqrt{1 + 4 + 1} = \sqrt6 \approx 2{,}449$, atteinte dans la direction de $(1, 2, 1)$.
## Réponse
num 2.449 ± 0.001

# s2 · simple · 15 · Vérifier le théorème de Schwarz
Soit $f(x, y) = x^3y^2 + \sin(xy)$. Calculer $\frac{\partial^2 f}{\partial x\partial y}$ et $\frac{\partial^2 f}{\partial y\partial x}$, vérifier qu'elles sont égales, et donner leur valeur en $(1, 1)$.
## Indice
$\frac{\partial f}{\partial x} = 3x^2y^2 + y\cos(xy)$ et $\frac{\partial f}{\partial y} = 2x^3y + x\cos(xy)$.
## Indice
Dériver $\frac{\partial f}{\partial x}$ par rapport à $y$ (produit $y\cos(xy)$) et $\frac{\partial f}{\partial y}$ par rapport à $x$.
## Indice
On trouve $6x^2y + \cos(xy) - xy\sin(xy)$ dans les deux cas.
## Étape · 1
$\frac{\partial}{\partial y}\left(3x^2y^2 + y\cos(xy)\right) = 6x^2y + \cos(xy) - xy\sin(xy)$, et $\frac{\partial}{\partial x}\left(2x^3y + x\cos(xy)\right) = 6x^2y + \cos(xy) - xy\sin(xy)$ : égalité, comme le prévoit Schwarz ($f$ est $C^\infty$).
## Étape · 1
En $(1, 1)$ : $6 + \cos 1 - \sin 1 \approx 6 + 0{,}5403 - 0{,}8415 = 5{,}6988$.
## Réponse
num 5.699 ± 0.001

# m1 · moyen · 25 · Le minimum d'une fonction quadratique
Soit $f(x, y) = x^2 + xy + y^2 - 3x$. Déterminer ses points critiques, leur nature, et montrer que le minimum est global. Donner la valeur du minimum.
## Indice
$\nabla f = (2x + y - 3,\ x + 2y)$.
## Indice
La hessienne est constante : $\begin{pmatrix} 2 & 1 \\ 1 & 2 \end{pmatrix}$, avec $rt - s^2 = 3 > 0$ et $r > 0$.
## Indice
Pour le caractère global : $f(a + h) - f(a) = \frac12 h^\top H h$ exactement, puisque $f$ est polynomiale de degré $2$.
## Étape · 1
$\nabla f = 0$ équivaut à $2x + y = 3$ et $x + 2y = 0$, soit $(x, y) = (2, -1)$ : un seul point critique.
## Étape · 1
$rt - s^2 = 4 - 1 = 3 > 0$ et $r = 2 > 0$ : minimum local strict.
## Étape · 2
Comme $f$ est polynomiale de degré $2$, la formule de Taylor est exacte : $f(a + h) = f(a) + \frac12h^\top Hh$ avec $a = (2, -1)$, et $h^\top Hh = 2h_1^2 + 2h_1h_2 + 2h_2^2 = (h_1 + h_2)^2 + h_1^2 + h_2^2 > 0$ pour $h \neq 0$. Le minimum est global : $f(2, -1) = 4 - 2 + 1 - 6 = -3$.
## Réponse
num -3 ± 0.001

# m2 · moyen · 30 · L'équation des ondes
Soit $c > 0$, $g$ de classe $C^2$ sur $\mathbb{R}^2$, et $f(x, t) = g(x + ct, x - ct)$. On note $u = x + ct$, $v = x - ct$.

1. Exprimer $\frac{\partial^2 f}{\partial x^2}$ et $\frac{\partial^2 f}{\partial t^2}$ à l'aide des dérivées partielles de $g$.
2. Montrer que $\frac{\partial^2 f}{\partial t^2} - c^2\frac{\partial^2 f}{\partial x^2} = k\,\frac{\partial^2 g}{\partial u\partial v}$ pour une constante $k$ à déterminer.
3. En déduire les solutions de classe $C^2$ de l'équation des ondes $\frac{\partial^2 f}{\partial t^2} = c^2\frac{\partial^2 f}{\partial x^2}$. Donner $k$ pour $c = 2$.
## Indice
Règle de la chaîne : $\frac{\partial f}{\partial x} = g_u + g_v$ et $\frac{\partial f}{\partial t} = c\,g_u - c\,g_v$, les dérivées de $g$ étant prises en $(x + ct, x - ct)$.
## Indice
Dériver encore, en utilisant le théorème de Schwarz pour $g_{uv} = g_{vu}$.
## Indice
$\frac{\partial^2 g}{\partial u\partial v} = 0$ signifie que $\frac{\partial g}{\partial v}$ ne dépend que de $v$.
## Étape · 1
$\frac{\partial^2 f}{\partial x^2} = g_{uu} + 2g_{uv} + g_{vv}$ et $\frac{\partial^2 f}{\partial t^2} = c^2(g_{uu} - 2g_{uv} + g_{vv})$.
## Étape · 1
$\frac{\partial^2 f}{\partial t^2} - c^2\frac{\partial^2 f}{\partial x^2} = -4c^2\,g_{uv}$ : $k = -4c^2$.
## Étape · 2
Le changement de variables $(x, t) \mapsto (x + ct, x - ct)$ est bijectif : $f$ est solution si et seulement si $g_{uv} = 0$ sur $\mathbb{R}^2$, c'est-à-dire $g(u, v) = F(u) + G(v)$ avec $F, G$ de classe $C^2$. Les solutions sont les $f(x, t) = F(x + ct) + G(x - ct)$ : deux ondes qui se propagent à la vitesse $c$ en sens opposés. Pour $c = 2$, $k = -16$.
## Réponse
num -16 ± 0.001

# c1 · complexe · 75 · La boîte de volume 1 la moins coûteuse
On cherche, parmi les pavés de dimensions $x, y, z > 0$ et de volume $xyz = 1$, celui dont l'aire totale $S = 2(xy + yz + zx)$ est minimale.

1. En éliminant $z$, se ramener à minimiser $\varphi(x, y) = 2\left(xy + \frac1x + \frac1y\right)$ sur $U = \,]0, +\infty[^2$.
2. Déterminer les points critiques de $\varphi$ et la nature du point trouvé.
3. Montrer que si $\varphi(x, y) \le 7$, alors $(x, y) \in K = \left[\frac27, \frac{49}{4}\right]^2$. En déduire que $\varphi$ atteint un minimum global sur $U$, en un point critique.
4. Conclure, et retrouver le résultat par l'inégalité arithmético-géométrique.
5. (MP, MPI) Retrouver le point optimal par le théorème d'optimisation sous la contrainte $g(x, y, z) = xyz - 1 = 0$.
## Indice
Pour 2 : $\frac{\partial\varphi}{\partial x} = 2\left(y - \frac1{x^2}\right)$ et $\frac{\partial\varphi}{\partial y} = 2\left(x - \frac1{y^2}\right)$.
## Indice
Pour 3 : chacun des trois termes de $\varphi$ est positif et au plus $7$ : $\frac2x \le 7$, $\frac2y \le 7$, $2xy \le 7$. $K$ est compact et $\varphi$ continue.
## Indice
Pour 4 : $\frac{xy + yz + zx}{3} \ge \sqrt[3]{(xy)(yz)(zx)} = \sqrt[3]{(xyz)^2}$. Pour 5 : $\nabla S = \lambda\nabla g$ donne $2(y + z) = \lambda yz$, etc.
## Étape · 1
Avec $z = \frac{1}{xy}$ : $S = 2\left(xy + \frac1x + \frac1y\right) = \varphi(x, y)$, et $(x, y)$ parcourt $U$ (ouvert).
## Étape · 2
$\nabla\varphi = 0$ donne $y = \frac1{x^2}$ et $x = \frac1{y^2}$, d'où $x = x^4$, soit $x = 1$ (car $x > 0$), puis $y = 1$. Hessienne en $(1, 1)$ : $r = \frac{4}{x^3} = 4$, $t = 4$, $s = 2$, donc $rt - s^2 = 12 > 0$ et $r > 0$ : minimum local strict, de valeur $\varphi(1, 1) = 6$.
## Étape · 2
Si $\varphi(x, y) \le 7$ : $\frac2x \le 7$ et $\frac2y \le 7$ donnent $x, y \ge \frac27$ ; $2xy \le 7$ donne $x \le \frac{7}{2y} \le \frac{49}{4}$, de même pour $y$. Sur le compact $K$, $\varphi$ continue atteint un minimum $m \le \varphi(1, 1) = 6$ ; hors de $K$, $\varphi > 7$. Donc $m$ est le minimum global sur $U$, atteint en un point de $U$ ouvert : c'est un point critique, donc $(1, 1)$.
## Étape · 1
Le pavé optimal est le cube $x = y = z = 1$, d'aire $6$. Par l'inégalité arithmético-géométrique, $xy + yz + zx \ge 3\sqrt[3]{(xyz)^2} = 3$, avec égalité si et seulement si $xy = yz = zx$, c'est-à-dire pour le cube.
## Étape · 1
(MP, MPI) $\nabla S = 2(y + z, x + z, x + y)$ et $\nabla g = (yz, xz, xy) \neq 0$ : la colinéarité donne $\frac{y + z}{yz} = \frac{x + z}{xz} = \frac{x + y}{xy}$, soit $\frac1y + \frac1z = \frac1x + \frac1z = \frac1x + \frac1y$, d'où $x = y = z = 1$.
## Réponse
num 6 ± 0.001
