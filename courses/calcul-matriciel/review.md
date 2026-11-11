# Calcul matriciel et systèmes linéaires (cours écrit) — points à faire vérifier

Relecture humaine demandée avant diffusion. Programme suivi : « Calcul matriciel et systèmes linéaires » (1er semestre) de MPSI-MP2I, PCSI et PTSI, avec la partie « Résolution de petits systèmes linéaires par la méthode du pivot » des « Compléments de calcul algébrique » (BO 2021).

## Choix de présentation
- Point de vue **calculatoire** du 1er semestre : aucune notion d'espace vectoriel ni de dimension ; le renvoi vers le cours Algèbre linéaire annonce l'interprétation géométrique (2e semestre).
- **Caractérisations de l'inversibilité** (homogène injectif, surjectivité de $X \mapsto AX$, réduction à $I_n$, inverse à gauche ou à droite suffit) démontrées par l'algorithme du pivot (réduction échelonnée admise comme algorithme). Le programme dit « toute technicité est exclue » : la preuve est présentée comme une esquisse. Vérifier qu'elle convient à la progression (certains professeurs attendent le second semestre pour « inverse à gauche suffit »).
- Le déterminant $2 \times 2$ ($ad - bc$) est donné avec l'inverse ; les déterminants sont au 2e semestre.
- Triangulaires inversibles : caractérisation justifiée par la remontée et le pivot ; forme de l'inverse démontrée dans l'exercice c1 (nilpotence).

## Énoncés et preuves à relire
- $E_{ij}E_{kl} = \delta_{jk}E_{il}$. OK.
- Opérations élémentaires = multiplication à gauche par la matrice obtenue sur $I_n$ ; exemple $(I_n + \lambda E_{21})(I_n - \lambda E_{21}) = I_n$ (car $E_{21}^2 = 0$). OK.
- Produit de triangulaires supérieures : argument sur $t_{ik}t'_{kj}$ pour $i > j$. OK.
- Binôme pour des matrices qui commutent, contre-exemple $(A + B)^2$. OK.
- Exemple du pivot : $(x, y, z) = (1, 2, 3)$. OK.

## Exercices
- **s1** : $AB - BA = \operatorname{diag}(6, -6)$.
- **s2** : $z = 3$, solution $(1, 2, 3)$.
- **m1** : $(A^n)_{13} = n(n-1)2^{n-3}$, soit $80$ pour $n = 5$.
- **m2** : $A^{-1} = \frac12\begin{pmatrix} 1 & -1 & 1 \\ 1 & 1 & -1 \\ -1 & 1 & 1 \end{pmatrix}$, vérifié par $AA^{-1} = I_3$.
- **m3** : $S = \begin{pmatrix} 1 & 3 \\ 3 & 3 \end{pmatrix}$, $A = \begin{pmatrix} 0 & -1 \\ 1 & 0 \end{pmatrix}$.
- **c1** : récurrence « $(T^k)_{ij} = 0$ si $j < i + k$ » ; inverse de $I_4 - N$ : la triangulaire supérieure de $1$, somme des coefficients $10$.
