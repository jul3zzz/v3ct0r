# s1 · simple · 10 · Distance d'un point à une droite
Dans un repère orthonormé du plan, calculer la distance du point $M_0 = (1, 2)$ à la droite $\mathcal{D}$ d'équation $3x + 4y - 1 = 0$, puis les coordonnées du projeté orthogonal $H$ de $M_0$ sur $\mathcal{D}$.
## Indice
Formule $\frac{|ax_0 + by_0 + c|}{\sqrt{a^2 + b^2}}$.
## Indice
$H = M_0 + \lambda\vec n$ avec $\vec n = (3, 4)$ ; trouver $\lambda$ pour que $H \in \mathcal{D}$.
## Indice
$3(1 + 3\lambda) + 4(2 + 4\lambda) - 1 = 0$.
## Étape · 1
$d = \frac{|3 + 8 - 1|}{\sqrt{9 + 16}} = \frac{10}{5} = 2$.
## Étape · 1
$10 + 25\lambda = 0$ donne $\lambda = -\frac25$ et $H = \left(1 - \frac65, 2 - \frac85\right) = \left(-\frac15, \frac25\right)$. Contrôle : $M_0H = \frac25\|\vec n\| = 2$.
## Réponse
num 2 ± 0.001

# m1 · moyen · 25 · Produit vectoriel, aire et plan
Soient $A = (1, 0, 0)$, $B = (2, 2, 3)$, $C = (5, 5, 6)$ dans un repère orthonormé direct de l'espace.

1. Calculer $\vec u = \overrightarrow{AB}$, $\vec v = \overrightarrow{AC}$ et $\vec u \wedge \vec v$.
2. En déduire que $A$, $B$, $C$ ne sont pas alignés, l'aire du triangle $ABC$, et une équation du plan $(ABC)$.
## Indice
$\vec u = (1, 2, 3)$ et $\vec v = (4, 5, 6)$.
## Indice
$\vec u \wedge \vec v = (2 \cdot 6 - 3 \cdot 5,\ 3 \cdot 4 - 1 \cdot 6,\ 1 \cdot 5 - 2 \cdot 4)$.
## Indice
L'aire du triangle est la moitié de celle du parallélogramme ; $\vec u \wedge \vec v$ est normal au plan.
## Étape · 1
$\vec u \wedge \vec v = (-3, 6, -3)$, non nul : $\vec u$ et $\vec v$ ne sont pas colinéaires, les points ne sont pas alignés.
## Étape · 1
Aire du parallélogramme : $\|\vec u \wedge \vec v\| = \sqrt{9 + 36 + 9} = \sqrt{54} = 3\sqrt6 \approx 7{,}348$ ; aire du triangle : $\frac{3\sqrt6}{2} \approx 3{,}674$.
## Étape · 1
Vecteur normal $(-3, 6, -3)$, ou $(1, -2, 1)$ : le plan a une équation $x - 2y + z = d$, et $A$ donne $d = 1$ : $x - 2y + z = 1$. Contrôle avec $B$ : $2 - 4 + 3 = 1$, avec $C$ : $5 - 10 + 6 = 1$.
## Réponse
num 7.348 ± 0.001

# c1 · complexe · 60 · Distance entre deux droites non coplanaires
Soient $\mathcal{D}_1$ la droite passant par $A = (1, 0, 0)$ dirigée par $\vec u = (1, 1, 0)$, et $\mathcal{D}_2$ la droite passant par $B = (0, 0, 2)$ dirigée par $\vec v = (0, 1, 1)$.

1. Calculer $\vec n = \vec u \wedge \vec v$ et le produit mixte $[\vec u, \vec v, \overrightarrow{AB}]$. En déduire que les droites ne sont ni parallèles ni sécantes.
2. Montrer que, pour tous $M \in \mathcal{D}_1$ et $N \in \mathcal{D}_2$, $\overrightarrow{MN} \cdot \vec n = \overrightarrow{AB} \cdot \vec n$, puis que $MN \ge \frac{|\overrightarrow{AB} \cdot \vec n|}{\|\vec n\|}$.
3. Déterminer les points $P \in \mathcal{D}_1$ et $Q \in \mathcal{D}_2$ tels que $\overrightarrow{PQ}$ soit colinéaire à $\vec n$ (perpendiculaire commune).
4. En déduire la distance entre les deux droites.
## Indice
Deux droites sont coplanaires si et seulement si $\vec u$, $\vec v$ et $\overrightarrow{AB}$ sont coplanaires, c'est-à-dire si leur produit mixte est nul.
## Indice
Pour 2 : $\overrightarrow{MN} = \overrightarrow{AB} + t\vec v - s\vec u$, et $\vec n$ est orthogonal à $\vec u$ et à $\vec v$. Puis l'inégalité de Cauchy-Schwarz $|\overrightarrow{MN} \cdot \vec n| \le MN\,\|\vec n\|$.
## Indice
Pour 3 : écrire $P = A + s\vec u$, $Q = B + t\vec v$ et résoudre $\overrightarrow{PQ} = \lambda \vec n$ (trois équations, trois inconnues $s, t, \lambda$).
## Étape · 1
$\vec n = (1 \cdot 1 - 0 \cdot 1,\ 0 \cdot 0 - 1 \cdot 1,\ 1 \cdot 1 - 1 \cdot 0) = (1, -1, 1)$, non nul : les droites ne sont pas parallèles. Avec $\overrightarrow{AB} = (-1, 0, 2)$ : $[\vec u, \vec v, \overrightarrow{AB}] = \vec n \cdot \overrightarrow{AB} = -1 + 0 + 2 = 1 \neq 0$ : elles ne sont pas coplanaires, donc pas sécantes.
## Étape · 2
Pour $M = A + s\vec u$ et $N = B + t\vec v$ : $\overrightarrow{MN} \cdot \vec n = \overrightarrow{AB} \cdot \vec n + t\,\vec v \cdot \vec n - s\,\vec u \cdot \vec n = \overrightarrow{AB} \cdot \vec n = 1$. Par Cauchy-Schwarz, $1 \le MN\,\|\vec n\| = \sqrt3\, MN$, soit $MN \ge \frac{1}{\sqrt3}$.
## Étape · 2
$\overrightarrow{PQ} = (-1 - s,\ t - s,\ 2 + t) = \lambda(1, -1, 1)$ donne $-1 - s = 2 + t$, donc $s = -3 - t$, puis $t - s = 2t + 3 = -(2 + t)$, d'où $t = -\frac53$, $s = -\frac43$, $\lambda = \frac13$. Ainsi $P = \left(-\frac13, -\frac43, 0\right)$ et $Q = \left(0, -\frac53, \frac13\right)$.
## Étape · 1
$PQ = \frac13\|\vec n\| = \frac{\sqrt3}{3}$ : la minoration de la question 2 est atteinte, et la distance entre les droites vaut $\frac{1}{\sqrt3} \approx 0{,}5774$.
## Réponse
num 0.5774 ± 0.001
