# Arithmétique dans ℤ (fiche) — points à faire vérifier

Relecture humaine demandée avant diffusion. Programme suivi : « Arithmétique dans l'ensemble des entiers relatifs » de MPSI-MP2I (BO 2021, 1er semestre). Cette section n'existe pas en PCSI ni en PTSI (vérifié : « l'arithmétique est hors programme » dans leur section Raisonnement) : la fiche est étiquetée MPSI, MP2I seulement.

## Choix de présentation
- Approche **élémentaire**, sans structures algébriques ; $\mathbb{Z}/n\mathbb{Z}$ hors programme (non mentionné sauf pour le dire).
- PGCD défini comme le plus grand diviseur commun **pour l'ordre usuel**, comme dans le programme ; la caractérisation par la divisibilité est énoncée sans preuve (elle découle d'Euclide ou de Bézout).
- Division euclidienne : preuve par la partie entière (existence) et l'encadrement (unicité).
- Décomposition en facteurs premiers : existence par récurrence forte, unicité par le lemme d'Euclide, esquissées.
- PPCM et $(a \wedge b)(a \vee b) = ab$ énoncés sans preuve.

## Énoncés et exemples à relire
- $-7 = 3 \times (-3) + 2$. OK.
- $1071 \wedge 462 = 21 = 7 \times 462 - 3 \times 1071$. OK.
- $360 \wedge 84 = 12$, $360 \vee 84 = 2520$ ($12 \times 2520 = 360 \times 84 = 30240$). OK.
- $3^{2026} \equiv 4\ [7]$ ($2026 = 6 \times 337 + 4$). OK.
- $341 = 11 \times 31$, $2^{10} = 1024 = 3 \times 341 + 1$, donc $2^{340} \equiv 1\ [341]$ (plus petit pseudo-premier de Fermat en base 2). OK.

## Exercices
- **s1** : PGCD $21$, $u = -3$, $v = 7$.
- **m1** : inverse de $7$ modulo $26$ : $15$ ; $x \equiv 19\ [26]$.
- **c1** : Fermat par les binomiaux ; $2^{100} \equiv 3\ [13]$.
