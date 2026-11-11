# s1 · simple · 10 · Dérivées partielles et plan tangent
Soit $f(x, y) = x^2 y + e^{xy}$. Calculer $\frac{\partial f}{\partial x}$ et $\frac{\partial f}{\partial y}$, puis l'équation du plan tangent à la surface $z = f(x, y)$ au point $(1, 0)$. Donner $\frac{\partial f}{\partial y}(1, 0)$.
## Indice
Pour $\frac{\partial f}{\partial x}$, traiter $y$ comme une constante : la dérivée de $e^{xy}$ par rapport à $x$ est $y e^{xy}$.
## Indice
$f(1, 0) = 0 + e^0 = 1$.
## Indice
Plan tangent : $z - f(1, 0) = \frac{\partial f}{\partial x}(1, 0)(x - 1) + \frac{\partial f}{\partial y}(1, 0)(y - 0)$.
## Étape · 1
$\frac{\partial f}{\partial x} = 2xy + ye^{xy}$ et $\frac{\partial f}{\partial y} = x^2 + xe^{xy}$ ; en $(1, 0)$ : $0$ et $1 + 1 = 2$.
## Étape · 1
$f$ est de classe $C^1$ (dérivées partielles continues), et le plan tangent en $(1, 0)$ a pour équation $z = 1 + 2y$.
## Réponse
num 2 ± 0.001

# m1 · moyen · 25 · Passage en coordonnées polaires
Soit $f$ de classe $C^1$ sur $\mathbb{R}^2$ et $g(r, \theta) = f(r\cos\theta, r\sin\theta)$.

1. Exprimer $\frac{\partial g}{\partial r}$ et $\frac{\partial g}{\partial \theta}$ à l'aide des dérivées partielles de $f$.
2. Vérifier ces formules pour $f(x, y) = xy$ en calculant $g$ directement, et donner $\frac{\partial g}{\partial \theta}(2, 0)$.
## Indice
Règle de la chaîne avec $\varphi(r, \theta) = r\cos\theta$ et $\psi(r, \theta) = r\sin\theta$.
## Indice
$\frac{\partial \varphi}{\partial \theta} = -r\sin\theta$ et $\frac{\partial \psi}{\partial \theta} = r\cos\theta$.
## Indice
Pour $f(x, y) = xy$ : $g(r, \theta) = r^2\cos\theta\sin\theta = \frac{r^2}{2}\sin(2\theta)$.
## Étape · 1
$\frac{\partial g}{\partial r} = \cos\theta\,\frac{\partial f}{\partial x} + \sin\theta\,\frac{\partial f}{\partial y}$ et $\frac{\partial g}{\partial \theta} = -r\sin\theta\,\frac{\partial f}{\partial x} + r\cos\theta\,\frac{\partial f}{\partial y}$, les dérivées de $f$ étant prises en $(r\cos\theta, r\sin\theta)$.
## Étape · 1
Pour $f = xy$ : $\frac{\partial f}{\partial x} = y$ et $\frac{\partial f}{\partial y} = x$, donc $\frac{\partial g}{\partial \theta} = -r\sin\theta \cdot r\sin\theta + r\cos\theta \cdot r\cos\theta = r^2\cos(2\theta)$.
## Étape · 1
Directement, $g = \frac{r^2}{2}\sin(2\theta)$ donne $\frac{\partial g}{\partial \theta} = r^2\cos(2\theta)$ : les deux calculs concordent. En $(r, \theta) = (2, 0)$ : $4$.
## Réponse
num 4 ± 0.001

# c1 · complexe · 60 · Les points critiques de x³ + y³ − 3xy
Soit $f(x, y) = x^3 + y^3 - 3xy$ sur $\mathbb{R}^2$.

1. Déterminer les points critiques de $f$.
2. Montrer que $(0, 0)$ n'est pas un extremum local.
3. Montrer que, pour $(h, k)$ voisin de $(0, 0)$, $f(1 + h, 1 + k) - f(1, 1) = 3(h^2 - hk + k^2) + h^3 + k^3$, puis que $(1, 1)$ est un minimum local strict.
4. Ce minimum est-il global ? Donner la valeur de $f$ en ce point.
## Indice
Pour 1 : $\frac{\partial f}{\partial x} = 3x^2 - 3y$ et $\frac{\partial f}{\partial y} = 3y^2 - 3x$ ; en déduire $x = x^4$.
## Indice
Pour 2 : regarder $f$ le long de l'axe des abscisses. Pour 3 : $h^2 - hk + k^2 \ge \frac{h^2 + k^2}{2}$, et $|h^3 + k^3| \le \rho\,(h^2 + k^2)$ avec $\rho = \sqrt{h^2 + k^2}$.
## Indice
Pour 4 : que vaut $f(x, 0)$ quand $x \to -\infty$ ?
## Étape · 2
Le gradient est nul si et seulement si $y = x^2$ et $x = y^2$, donc $x = x^4$, soit $x = 0$ ou $x = 1$ (les solutions réelles de $x(x^3 - 1) = 0$). Les points critiques sont $(0, 0)$ et $(1, 1)$.
## Étape · 1
$f(x, 0) = x^3$ prend des valeurs strictement positives et strictement négatives aussi près de $0$ que l'on veut, alors que $f(0, 0) = 0$ : $(0, 0)$ n'est pas un extremum local.
## Étape · 2
En développant : $f(1 + h, 1 + k) = 2 + 3h + 3h^2 + h^3 + 3k + 3k^2 + k^3 - 3(1 + h + k + hk) = -1 + 3h^2 - 3hk + 3k^2 + h^3 + k^3$, et $f(1, 1) = -1$. Comme $h^2 + k^2 \ge 2hk$, $h^2 - hk + k^2 \ge \frac{h^2 + k^2}{2}$.
## Étape · 2
Avec $\rho = \|(h, k)\|$ : $|h^3 + k^3| \le |h|^3 + |k|^3 \le \rho\,(h^2 + k^2)$. Donc $f(1 + h, 1 + k) - f(1, 1) \ge \left(\frac32 - \rho\right)\rho^2 > 0$ pour $0 < \rho < \frac32$ : minimum local strict.
## Étape · 1
$f(x, 0) = x^3 \to -\infty$ quand $x \to -\infty$ : le minimum n'est pas global. La valeur au minimum local est $f(1, 1) = -1$.
## Réponse
num -1 ± 0.001
