# Polynômes (cours écrit) — points à faire vérifier

Relecture humaine demandée avant diffusion. Programmes suivis : « Polynômes et fractions rationnelles » (MPSI-MP2I, 1er semestre), « Polynômes » (PCSI, 1er semestre ; PTSI, 2e semestre), BO 2021.

## Écarts entre filières (vérifiés dans les textes)
- **Arithmétique de $\mathbb{K}[X]$** (PGCD, Bézout, Gauss) : MPSI et MP2I seulement (aucune occurrence de Bézout dans les programmes PCSI et PTSI). Section marquée « (MPSI, MP2I) ».
- **Interpolation de Lagrange** : MPSI et MP2I seulement ; l'exercice m3 propose aussi la résolution par un système.
- **Fractions rationnelles** : théorie (corps $\mathbb{K}(X)$, partie entière, pôles) en MPSI-MP2I ; PCSI et PTSI : « décomposition en éléments simples des fonctions rationnelles, uniquement dans des situations simples ». Le cours le signale.
- Le cours est placé en 1re année, 1er semestre (cas MPSI, MP2I, PCSI) ; en PTSI il est au 2e semestre.

## Choix de présentation
- $\mathbb{K} = \mathbb{R}$ ou $\mathbb{C}$ ; constructions de $\mathbb{K}[X]$ et $\mathbb{K}(X)$ admises (hors programme).
- d'Alembert-Gauss admis (démonstration hors programme) ; note historique : énoncé par d'Alembert (1746), preuve de Gauss (1799) jugée incomplète selon les standards modernes. Formulation prudente à garder.
- Formule de Taylor : preuve par linéarité sur les $(X - a)^j$ (en caractéristique nulle).
- Décomposition en éléments simples : énoncée sans preuve (hors programme), avec la partie réelle pour les facteurs de degré 2.

## Énoncés et preuves à relire
- Division euclidienne : unicité par les degrés, existence par récurrence en éliminant le terme dominant. OK.
- Nombre de racines : factorisation successive par $(X - a_j)$, intégrité. OK.
- Multiplicité exacte $m$ ⟺ $P^{(k)}(a) = 0$ pour $k < m$ et $P^{(m)}(a) \neq 0$ (via Taylor). OK.
- Racines conjuguées de même multiplicité : via $P^{(k)}(\overline z) = \overline{P^{(k)}(z)}$. OK.
- Coefficient d'un pôle simple : $P(a)/Q'(a)$ (car $Q'(a) = Q_1(a)$). Exemple $\frac{1}{X^2 - 1}$. OK.

## Exercices
- **s1** : $X^4 + 1 = (X^2 + X + 1)(X^2 - X) + X + 1$.
- **s2** : $\sigma_1 = 2$, $\sigma_2 = 3$, $\sum x_i^2 = -2$.
- **m1** : $a = -4$, $b = 3$, $P = (X - 1)^2(X^2 + 2X + 3)$ vérifié en développant.
- **m2** : $X^6 - 1 = (X - 1)(X + 1)(X^2 - X + 1)(X^2 + X + 1)$.
- **m3** : $P = X^2 + X + 1$, $P(3) = 13$.
- **c1** : Tchebychev, $T_4 = 8X^4 - 8X^2 + 1$ ; racines $\cos\frac{(2k+1)\pi}{2n}$.
