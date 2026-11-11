# s1 · simple · 10 · Tangente à une ellipse
Soit l'ellipse $\mathcal{E} : \frac{x^2}{4} + y^2 = 1$ et le point $M_0 = \left(\sqrt2, \frac{\sqrt2}{2}\right)$. Vérifier que $M_0 \in \mathcal{E}$, puis donner une équation de la tangente en $M_0$ et son ordonnée à l'origine.
## Indice
$f(x, y) = \frac{x^2}{4} + y^2 - 1$ et $\nabla f = \left(\frac x2, 2y\right)$.
## Indice
La tangente est orthogonale à $\nabla f(M_0) = \left(\frac{\sqrt2}{2}, \sqrt2\right)$.
## Indice
Équation $\frac{\sqrt2}{2}(x - \sqrt2) + \sqrt2\left(y - \frac{\sqrt2}{2}\right) = 0$, à simplifier.
## Étape · 1
$\frac{2}{4} + \frac12 = 1$ : $M_0 \in \mathcal{E}$, et $\nabla f(M_0) = \left(\frac{\sqrt2}{2}, \sqrt2\right) \neq 0$ : point régulier.
## Étape · 1
La tangente : $\frac{\sqrt2}{2}x + \sqrt2\,y = 1 + 1 = 2$, soit $x + 2y = 2\sqrt2$. Pour $x = 0$ : $y = \sqrt2 \approx 1{,}4142$. (Formule générale : $\frac{x_0x}{4} + y_0y = 1$.)
## Réponse
num 1.4142 ± 0.001

# m1 · moyen · 30 · Réduire une conique
Soit $\mathcal{C}$ la courbe d'équation $5x^2 + 4xy + 2y^2 = 1$.

1. Diagonaliser la matrice $S = \begin{pmatrix} 5 & 2 \\ 2 & 2 \end{pmatrix}$ dans une base orthonormée.
2. En déduire une équation réduite de $\mathcal{C}$ et sa nature.
3. Calculer les demi-axes et l'excentricité.
## Indice
$\operatorname{tr} S = 7$ et $\det S = 6$ : les valeurs propres sont racines de $\lambda^2 - 7\lambda + 6$.
## Indice
Valeurs propres $1$ et $6$, de vecteurs propres orthogonaux $(1, -2)$ et $(2, 1)$.
## Indice
Ellipse $X^2 + 6Y^2 = 1$ : $a = 1$, $b = \frac{1}{\sqrt6}$, $c^2 = a^2 - b^2$, $e = \frac ca$.
## Étape · 1
Les valeurs propres de $S$ sont $1$ et $6$, de vecteurs propres unitaires $\frac{1}{\sqrt5}(1, -2)$ et $\frac{1}{\sqrt5}(2, 1)$, orthogonaux : $S = PDP^\top$ avec $D = \operatorname{diag}(1, 6)$.
## Étape · 1
Dans le repère orthonormé dirigé par ces vecteurs, de coordonnées $(X, Y)$, l'équation devient $X^2 + 6Y^2 = 1$ : $\mathcal{C}$ est une ellipse, d'axes dirigés par les vecteurs propres.
## Étape · 1
Demi-axes $a = 1$ et $b = \frac{1}{\sqrt6} \approx 0{,}408$ ; $c^2 = 1 - \frac16 = \frac56$, donc $e = \sqrt{\frac56} \approx 0{,}9129$ : une ellipse très allongée.
## Réponse
num 0.9129 ± 0.001

# c1 · complexe · 60 · Une courbe sur la selle
Soient la sphère $\Sigma_1 : x^2 + y^2 + z^2 = 3$, la surface $\Sigma_2 : z = xy$, et $M_0 = (1, 1, 1)$.

1. Vérifier que $M_0$ appartient aux deux surfaces et qu'il y est régulier pour chacune.
2. Donner les plans tangents en $M_0$ à $\Sigma_1$ et $\Sigma_2$.
3. En déduire que la courbe $\Gamma = \Sigma_1 \cap \Sigma_2$ a une tangente en $M_0$, et en donner un vecteur directeur.
4. Montrer que $\Sigma_2$ est une surface réglée, et vérifier que son plan tangent en $M_0$ contient les deux génératrices passant par $M_0$.
5. Donner la cote à l'origine du plan tangent à $\Sigma_2$ en $M_0$ (la valeur de $z$ pour $x = y = 0$).
## Indice
Pour 1 et 2 : $F = x^2 + y^2 + z^2 - 3$ et $G = xy - z$ ; gradients $(2x, 2y, 2z)$ et $(y, x, -1)$.
## Indice
Pour 3 : la tangente est dirigée par $\nabla F(M_0) \wedge \nabla G(M_0)$.
## Indice
Pour 4 : à $x = a$ fixé, $z = ay$ est une droite ; de même à $y$ fixé. Génératrices par $M_0$ : $x = 1$ et $y = 1$.
## Étape · 1
$1 + 1 + 1 = 3$ et $1 = 1 \times 1$. $\nabla F(M_0) = (2, 2, 2)$ et $\nabla G(M_0) = (1, 1, -1)$ sont non nuls : $M_0$ est régulier pour les deux surfaces.
## Étape · 1
Plan tangent à $\Sigma_1$ : $2(x - 1) + 2(y - 1) + 2(z - 1) = 0$, soit $x + y + z = 3$. À $\Sigma_2$ : $(x - 1) + (y - 1) - (z - 1) = 0$, soit $z = x + y - 1$.
## Étape · 2
$\nabla F \wedge \nabla G = (2, 2, 2) \wedge (1, 1, -1) = (-4, 4, 0)$, non nul : les gradients ne sont pas colinéaires, $\Gamma$ a en $M_0$ une tangente dirigée par $(1, -1, 0)$, intersection des deux plans tangents (contrôle : $(1, -1, 0)$ vérifie $1 - 1 + 0 = 0$ et $0 = 1 - 1$).
## Étape · 2
$\Sigma_2$ est la réunion des droites $\{(a, y, ay) : y \in \mathbb{R}\}$ : elle est réglée (et doublement, avec les droites à $y$ fixé). Par $M_0$ passent les génératrices dirigées par $(0, 1, 1)$ ($x = 1$) et $(1, 0, 1)$ ($y = 1$) ; toutes deux vérifient $\Delta z = \Delta x + \Delta y$ : elles sont dans le plan tangent $z = x + y - 1$, qui est donc le plan qu'elles engendrent.
## Étape · 1
Pour $x = y = 0$ dans $z = x + y - 1$ : $z = -1$.
## Réponse
num -1 ± 0.001
