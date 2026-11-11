# Nombres complexes (cours écrit) — points à faire vérifier

Relecture humaine demandée avant diffusion. Programme suivi : section « Nombres complexes » de MPSI-MP2I, PCSI et PTSI (identique dans les trois textes, BO 2021).

## Choix de présentation
- **Construction de ℂ admise** (hors programme) : la définition énonce l'existence d'un ensemble contenant ℝ, d'un $i$ avec $i^2 = -1$ et l'unicité de l'écriture $a + ib$.
- $e^{it}$ est **défini** par $\cos t + i\sin t$ ; la propriété $e^{i(s+t)} = e^{is}e^{it}$ est prouvée par les formules d'addition (vues au lycée et dans la fiche Calculs algébriques), puis sert à les retrouver. Pas de cercle vicieux, mais le signaler aux élèves.
- « Tout élément de $\mathbb{U}$ s'écrit $e^{it}$ » est admis (paramétrisation du cercle par cosinus et sinus, programme « Compléments de calcul algébrique et de trigonométrie »).
- **Exponentielle complexe** définie par $e^{\operatorname{Re} z} e^{i \operatorname{Im} z}$, comme dans le programme ; le renvoi vers le cours Séries entières signale l'autre construction (2e année).
- Factorisation par $z - a$ faite pour les **fonctions** polynomiales (le cours Polynômes reprend la théorie des polynômes formels).
- Les similitudes directes $z \mapsto az + b$ : l'étude générale des similitudes est hors programme, seule la décomposition rotation-homothétie de centre le point fixe est donnée.

## Énoncés et preuves à relire
- Inégalité triangulaire : cas d'égalité « $w = 0$ ou $z = \lambda w$ avec $\lambda \ge 0$ » via $z\overline{w} \in \mathbb{R}_+$. OK.
- Angle moitié : $e^{ip} - e^{iq} = 2i\sin\frac{p-q}{2}\, e^{i\frac{p+q}{2}}$. OK.
- $a\cos t + b\sin t = A\cos(t - \varphi)$ avec $a + ib = Ae^{i\varphi}$ : via $\operatorname{Re}((a - ib)e^{it})$. Exemple $\cos t + \sqrt3\sin t = 2\cos(t - \pi/3)$. OK.
- Second degré : forme canonique, $\delta$ racine carrée quelconque de $\Delta$.
- Racines $n$-ièmes : $e^{2ik\pi/n} = e^{2il\pi/n} \iff n \mid k - l$. OK.

## Exercices
- **s1** : $(1 + i\sqrt3)^{10} = 1024\, e^{-2i\pi/3} = -512 - 512\sqrt3\, i$.
- **s2** : racines carrées de $-3 + 4i$ : $\pm(1 + 2i)$.
- **m1** : $C_4$ pour $t = \pi/3$ : $1 + \frac12 - \frac12 - 1 - \frac12 = -\frac12$, conforme à la formule.
- **m2** : racines $3 + 2i$ et $2 + i$ (somme $5 + 3i$, produit $4 + 7i$, $\Delta = 2i = (1 + i)^2$).
- **m3** : convention « équilatéral direct » = $C$ image de $B$ par la rotation de centre $A$ d'angle $+\pi/3$ ; caractérisation $a + jb + j^2c = 0$. Exemple $(0, 2, 1 + i\sqrt3)$ vérifié.
- **c1** : $\prod_{k=1}^{n-1}\sin\frac{k\pi}{n} = \frac{n}{2^{n-1}}$ ; pour $n = 6$ : $\frac{3}{16}$. Le passage de $z \neq 1$ à $z = 1$ utilise la continuité des fonctions polynomiales (ou l'égalité de deux polynômes sur une infinité de points, cours Polynômes).
