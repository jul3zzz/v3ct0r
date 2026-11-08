# Espaces préhilbertiens et euclidiens (cours écrit) — points à faire vérifier

Relecture humaine demandée avant diffusion.

## Choix de présentation
- Espaces **réels** uniquement (le cas hermitien n'est pas traité ; à signaler si le professeur l'aborde).
- Le cours est volontairement dense en énoncés (23) et plus court en texte : temps de lecture estimé ≈ 30 min, hors exercices.
- **Supplémentaire orthogonal** : énoncé pour $F$ de dimension finie dans $E$ quelconque ; preuve non détaillée (via une base orthonormée de $F$ et la formule de projection).
- **Adjoint** : existence en dimension finie admise (représentation des formes linéaires par le produit scalaire).
- **Isométries de $\mathbb{R}^3$** : « tout élément de $SO(3)$ est une rotation autour d'un axe » énoncé sans preuve ; relation $1 + 2\cos\theta = \operatorname{tr} A$. Composées de réflexions : au plus $n$ en dimension $n$ (Cartan-Dieudonné), énoncé sans preuve.
- **Théorème spectral** : preuve esquissée (valeurs propres réelles via $\overline{Z}^\top A Z$, stabilité de l'orthogonal d'un vecteur propre, récurrence).

## Points délicats
- Polarisation : $\langle x, y \rangle = \frac14(\|x + y\|^2 - \|x - y\|^2)$ (cas réel). OK.
- La norme $\|\cdot\|_\infty$ ne vérifie pas l'identité du parallélogramme : avec $x = (1, 0)$, $y = (0, 1)$ : $1 + 1 \neq 2 + 2$. OK.
- Projecteur symétrique ⟺ projection orthogonale : énoncé sans preuve.
- Moindres carrés : présenté comme une projection (droite de régression).
- Conique $5x^2 + 4xy + 2y^2 = 1$ : valeurs propres $1$ et $6$, vecteurs propres $(1, -2)$ et $(2, 1)$ (vérifiés).

## Exercices
- **s2** : $e_2 = \frac{1}{\sqrt6}(1, -1, 2)$.
- **s3** : $A(1,-1,-1)^\top = -(1,-1,-1)^\top$ vérifié ; trace $1$, déterminant $-1$.
- **m1** : $p(t) = t - \frac16$, $d^2 = \frac{1}{180}$.
- **m3** : aire $\frac{\pi}{\sqrt 6} = \frac{\pi}{\sqrt{\det A}}$.
- **c1** : $\|X^2 - \frac13\|^2 = \frac{8}{45}$ ; $L_2 = 12X^2 - 4$ ; argument des changements de signe.
- **c2** : unicité de la racine carrée par la stabilité des sous-espaces propres ; racine de $\begin{pmatrix} 5 & 4 \\ 4 & 5 \end{pmatrix}$ égale à $\begin{pmatrix} 2 & 1 \\ 1 & 2 \end{pmatrix}$.

## Références
- Gourdon (*Algèbre*), Grifone (*Algèbre linéaire*), M. Audin (*Géométrie*, EDP Sciences). Aucune autre référence n'est citée.
