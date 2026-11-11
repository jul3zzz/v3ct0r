# s1 · simple · 10 · La longueur d'une spire d'hélice
Soit $M(t) = (\cos t, \sin t, t)$. Calculer $M'(t)$, $\|M'(t)\|$, et la longueur de l'arc pour $t \in [0, 2\pi]$.
## Indice
Dériver coordonnée par coordonnée.
## Indice
$\|M'(t)\|^2 = \sin^2 t + \cos^2 t + 1$.
## Indice
$L = \int_0^{2\pi}\|M'(t)\|\,dt$.
## Étape · 1
$M'(t) = (-\sin t, \cos t, 1)$, de norme constante $\sqrt2$ : la courbe est régulière, parcourue à vitesse constante.
## Étape · 1
$L = 2\pi\sqrt2 \approx 8{,}886$.
## Réponse
num 8.886 ± 0.001

# m1 · moyen · 25 · Une arche de cycloïde
La cycloïde est la courbe décrite par un point d'un cercle de rayon $1$ qui roule sans glisser sur une droite : $M(t) = (t - \sin t, 1 - \cos t)$.

1. Déterminer les points stationnaires.
2. Montrer que $\|M'(t)\| = 2\left|\sin\frac t2\right|$.
3. Calculer la longueur d'une arche ($t \in [0, 2\pi]$).
## Indice
$M'(t) = (1 - \cos t, \sin t)$ s'annule quand $\cos t = 1$ et $\sin t = 0$.
## Indice
$(1 - \cos t)^2 + \sin^2 t = 2 - 2\cos t = 4\sin^2\frac t2$.
## Indice
Sur $[0, 2\pi]$, $\sin\frac t2 \ge 0$.
## Étape · 1
$M'(t) = 0$ si et seulement si $t \in 2\pi\mathbb{Z}$ : ce sont les points où le point du cercle touche la droite (rebroussements).
## Étape · 1
$\|M'(t)\|^2 = 2 - 2\cos t = 4\sin^2\frac t2$, donc $\|M'(t)\| = 2\left|\sin\frac t2\right|$.
## Étape · 1
$L = \int_0^{2\pi}2\sin\frac t2\,dt = \left[-4\cos\frac t2\right]_0^{2\pi} = 8$ : quatre fois le diamètre du cercle (résultat de Wren, 1658).
## Réponse
num 8 ± 0.001

# c1 · complexe · 60 · La courbure d'une parabole
On paramètre la parabole $y = x^2$ par $M(t) = (t, t^2)$.

1. Calculer $M'(t)$, la dérivée $\frac{ds}{dt}$ d'une abscisse curviligne, et le vecteur tangent unitaire $\vec T$.
2. On écrit $\vec T = \cos\alpha\,\vec\imath + \sin\alpha\,\vec\jmath$. Montrer que l'on peut prendre $\alpha(t) = \operatorname{Arctan}(2t)$.
3. En déduire la courbure $\gamma = \frac{d\alpha}{ds} = \frac{\alpha'(t)}{s'(t)}$ en fonction de $t$.
4. Donner le rayon de courbure et le centre de courbure au sommet $t = 0$.
5. Où la courbure est-elle maximale ?
## Indice
$M'(t) = (1, 2t)$ et $s'(t) = \sqrt{1 + 4t^2}$.
## Indice
$\vec T = \frac{(1, 2t)}{\sqrt{1 + 4t^2}}$ a une première coordonnée positive, donc $\alpha \in\, ]-\frac\pi2, \frac\pi2[$ et $\tan\alpha = 2t$.
## Indice
$\alpha'(t) = \frac{2}{1 + 4t^2}$. Au sommet, $\vec N = (0, 1)$.
## Étape · 1
$M'(t) = (1, 2t) \neq 0$ : la courbe est régulière, $s'(t) = \sqrt{1 + 4t^2}$ et $\vec T = \frac{1}{\sqrt{1 + 4t^2}}(1, 2t)$.
## Étape · 1
$\cos\alpha = \frac{1}{\sqrt{1 + 4t^2}} > 0$ et $\tan\alpha = 2t$ : la fonction $\alpha = \operatorname{Arctan}(2t)$, de classe $C^1$, convient.
## Étape · 2
$\gamma(t) = \frac{\alpha'(t)}{s'(t)} = \frac{2}{(1 + 4t^2)^{3/2}}$, strictement positive : la parabole tourne toujours vers la gauche quand $t$ croît (elle est convexe).
## Étape · 2
Au sommet : $\gamma(0) = 2$, rayon $R = \frac12$. Le vecteur normal $\vec N$, directement orthogonal à $\vec T = (1, 0)$, vaut $(0, 1)$ : le centre de courbure est $M(0) + R\vec N = \left(0, \frac12\right)$.
## Étape · 1
$\gamma(t)$ décroît avec $|t|$ : la courbure est maximale au sommet, et tend vers $0$ à l'infini (la parabole « se redresse »).
## Réponse
num 0.5 ± 0.001
