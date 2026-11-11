# Calcul différentiel et optimisation (cours écrit) — points à faire vérifier

Relecture humaine demandée avant diffusion. Programmes suivis (BO 2021, 2e année) : « Calcul différentiel et optimisation » (MP-MPI) ; « Calcul différentiel, B - Fonctions de plusieurs variables » (PC) ; « Calcul différentiel, C » (PSI) ; « Équations différentielles et calcul différentiel, B - Fonctions de deux ou trois variables » (PT).

## Écarts entre filières (vérifiés)
- **Différentielle** : MP-MPI (« b) Différentielle ») ; en PC, PSI, PT, on travaille avec les dérivées partielles et la classe $C^1$ définie par leur continuité. Définition marquée « (MP, MPI) ».
- **Vecteurs tangents, optimisation sous contrainte** : MP-MPI seulement (« Théorème d'optimisation sous une contrainte », démonstrations non exigibles).
- **Hessienne, Schwarz** : présents dans les quatre textes.
- **PT** : fonctions de deux ou trois variables seulement, et « fonctions de $\mathbb{R}^p$ dans $\mathbb{R}^n$ ($p, n \le 3$) » pour les jacobiennes ; le cours, écrit pour $\mathbb{R}^p$, s'y applique.
- PSI : « applications géométriques » (plan tangent à une surface de niveau) ; présent ici dans la proposition sur le gradient.

## Choix de présentation
- On reste dans $\mathbb{R}^p$ (le programme MP permet des espaces normés de dimension finie).
- Taylor-Young à l'ordre 2 justifié par la restriction à une droite (esquisse).
- Contre-exemple à Schwarz : $\frac{xy(x^2 - y^2)}{x^2 + y^2}$, dérivées croisées $-1$ et $1$ en $(0, 0)$.

## Exercices
- **s1** : $\nabla f = (1, 2, 1)$, $\sqrt6$. **s2** : $6 + \cos 1 - \sin 1 \approx 5{,}6988$.
- **m1** : minimum global $-3$ en $(2, -1)$ (forme quadratique $(h_1 + h_2)^2 + h_1^2 + h_2^2$).
- **m2** : $\partial_{tt}f - c^2\partial_{xx}f = -4c^2 g_{uv}$ ; $k = -16$ pour $c = 2$.
- **c1** : cube de côté $1$, aire $6$ ; compacité via $\{\varphi \le 7\} \subset [2/7, 49/4]^2$ ; hessienne en $(1, 1)$ : $r = t = 4$, $s = 2$.
