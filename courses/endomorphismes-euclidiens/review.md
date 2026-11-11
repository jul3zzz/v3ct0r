# Endomorphismes des espaces euclidiens (cours écrit) — points à faire vérifier

Relecture humaine demandée avant diffusion. Programmes suivis (BO 2021, 2e année) : « Endomorphismes d'un espace euclidien » (MP-MPI), « Endomorphismes des espaces euclidiens » (PC), « Espaces préhilbertiens réels, espaces euclidiens, B » (PSI), « Espaces préhilbertiens et euclidiens, B - Isométries d'un espace euclidien » (PT).

## Écarts entre filières (vérifiés sur les sommaires)
- **Adjoint** : section explicite en MP-MPI seulement (« a) Adjoint d'un endomorphisme ») ; ailleurs, « autoadjoint » est défini directement par $\langle u(x), y\rangle = \langle x, u(y)\rangle$. Chapitre 1 marqué.
- **Réduction des isométries** (forme par blocs) : MP-MPI seulement.
- **Isométries en dimension 3** : MP-MPI (via la réduction), PSI (« e) Isométries d'un espace euclidien de dimension 3 »), PT (« d) Isométries vectorielles en dimension 3 ») ; pas de paragraphe dédié en PC (dimension 2 seulement).
- **Autoadjoints positifs** : MP-MPI, PC, PSI (« introduit les endomorphismes autoadjoints positifs en vue de l'optimisation ») ; absents de PT, qui a « Matrices symétriques réelles » (théorème spectral matriciel).
- Le cours Espaces préhilbertiens contient déjà des énoncés proches (adjoint, symétriques, isométries du plan et de l'espace, théorème spectral, positivité) : ce cours les reprend en les approfondissant ; vérifier la cohérence des notations entre les deux.

## Choix de présentation
- Théorème des rotations de l'espace : vecteur fixe par $\det(A - I_3) = 0$ (exercice c1).
- Réduction des isométries : preuve esquissée (droite ou plan stable par un facteur irréductible d'un polynôme annulateur).
- Valeurs extrêmes de la forme quadratique (quotient de Rayleigh) : énoncé ajouté comme application (non listé explicitement dans les programmes), utile pour l'optimisation.

## Exercices
- **s1** : réflexion par rapport au plan $x - y - z = 0$, $\det = -1$ (calcul refait).
- **s2** : $\theta = \operatorname{Arccos}(3/5) \approx 0{,}927295$.
- **m1** : $S = I + J$, valeurs propres $4, 1, 1$, base orthonormée explicite.
- **m2** : $A^\top A = \begin{pmatrix} 1 & 1 \\ 1 & 2 \end{pmatrix}$, $\lambda = \frac{3 + \sqrt5}{2}$, $\sqrt\lambda = \frac{1 + \sqrt5}{2}$.
- **c1** : axe $(1, 1, 1)$, $\cos\theta = \frac12$, $\sin\theta > 0$ par $\det = 3$ : $\theta = \frac\pi3$ (calculs refaits).
