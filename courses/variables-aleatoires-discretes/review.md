# Variables aléatoires discrètes (cours écrit) — points à faire vérifier

Relecture humaine demandée avant diffusion. Programmes suivis (BO 2021, 2e année) : « Variables aléatoires discrètes » (MP-MPI), « Variables aléatoires discrètes, B et C » (PC, PSI), « Variables aléatoires discrètes » (PT). Fonctions génératrices et lois géométrique et de Poisson présentes dans les quatre textes (vérifié).

## Écarts entre filières
- **Familles sommables** : MP-MPI, PC, PSI ; PT n'en a pas. En PT, l'espérance d'une variable discrète se définit par la convergence absolue de la série $\sum x_n P(X = x_n)$ ; la formulation « famille sommable » du cours est à adapter pour PT.
- **Tribus** : vocabulaire présent dans les programmes (espaces probabilisés) ; le cours en donne la définition sans développement théorique.

## Choix de présentation
- Non-dénombrabilité de $\mathbb{R}$ admise ; existence d'une suite de variables indépendantes de lois données admise (programme).
- Lien « espérance finie ⟺ $G_X$ dérivable en $1$ » : énoncé sans preuve (étude au bord du disque de convergence) ; à vérifier selon la filière (certains programmes ne demandent que le sens utilisé en pratique).
- Loi forte et théorème central limite : mentionnés comme hors programme.

## Exercices
- **s1** : $P(X \ge 3) = \frac14$.
- **s2** : $e^{-2} \approx 0{,}135335$.
- **m1** : $G_X(t) = \frac{pt}{1 - qt}$, $V(X) = \frac{q}{p^2}$, $12$ pour $p = \frac14$.
- **m2** : $\mathcal{P}(\lambda + \mu)$ ; $P(X + Y = 2) = 4{,}5\,e^{-3} \approx 0{,}224042$ (vérifié par convolution).
- **c1** : collectionneur, $E(N) = nH_n$ ; $V(N) \le \frac{\pi^2}{6}n^2$ ; $n = 6$ : $14{,}7$. L'indépendance des $T_k$ est admise.
