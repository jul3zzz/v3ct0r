# Groupe symétrique et déterminants (cours écrit) — points à faire vérifier

Relecture humaine demandée avant diffusion. Programmes suivis (BO 2021, 2e semestre) : « Groupe symétrique et déterminants » (MPSI-MP2I) et « Matrices et déterminants, B - Déterminants » (PCSI, PTSI).

## Écarts entre filières (vérifiés dans les textes)
- **Groupe symétrique, signature, formes $n$-linéaires alternées** : MPSI et MP2I seulement. En PTSI : « le vocabulaire des formes multilinéaires alternées, le groupe symétrique et les formules de Cramer sont hors programme » ; PCSI : aucune occurrence de « signature ». Le cours le signale et donne, pour PCSI et PTSI, la caractérisation admise du déterminant (linéaire en chaque colonne, antisymétrique, $\det I_n = 1$).
- **Comatrice** : MPSI et MP2I ; « hors programme » en PCSI et PTSI. **Vandermonde** : MPSI et MP2I seulement. Sections marquées.
- PTSI : la formule de changement de base pour un déterminant est hors programme ; le cours l'énonce (MPSI) sans le préciser pour PTSI. À signaler aux élèves de PTSI.

## Choix de présentation
- Décomposition en cycles disjoints et signature : démonstrations non exigibles ; l'existence de la signature est démontrée dans l'exercice c1 (formule produit).
- Déterminant dans une base : unicité démontrée par développement multilinéaire, existence admise (non exigible).
- Indépendance de $\det u$ vis-à-vis de la base : justifiée par $\det(P^{-1}AP) = \det A$.

## Énoncés et exemples à relire
- $(1\ 2)(2\ 3) = (1\ 2\ 3)$ et $(2\ 3)(1\ 2) = (1\ 3\ 2)$ (convention : $\sigma\tau = \sigma \circ \tau$). Vérifié par calcul.
- $(1\ 2\ 3) = (1\ 2)(2\ 3) = (1\ 3)(1\ 2) = (1\ 2)(1\ 3)(2\ 3)(1\ 2)$. Vérifié par calcul.
- $\sigma = (1\ 2\ 3)(4\ 5)$ : 3 inversions, signature $-1$. Vérifié.
- Sarrus : $aei + bfg + cdh - ceg - afh - bdi$. OK.

## Exercices
- **s1** : $(1\ 2\ 3\ 4)(5\ 6)$, signature $+1$.
- **s2** : $-3$ (pivot et Sarrus : $230 - 233$).
- **m1** : $D_n = n + 1$, $D_5 = 6$ (récurrence $D_n = 2D_{n-1} - D_{n-2}$).
- **m2** : $\det = (a + (n-1)b)(a - b)^{n-1}$, soit $48$.
- **m3** : $\det A = 4$, $A^{-1} = \frac14\begin{pmatrix} 3 & -2 & 1 \\ -2 & 4 & -2 \\ 1 & -2 & 3 \end{pmatrix}$ vérifié par $AA^{-1} = I_3$.
- **c1** : existence de la signature par $\prod_{i<j}\frac{\sigma(j) - \sigma(i)}{j - i}$.
