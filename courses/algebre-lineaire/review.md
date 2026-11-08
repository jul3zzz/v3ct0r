# Algèbre linéaire (cours écrit) — points à faire vérifier

Relecture humaine demandée avant diffusion.

## Choix de présentation
- $\mathbb{K} = \mathbb{R}$ ou $\mathbb{C}$ uniquement (programme MPSI) ; la caractérisation des symétries utilise $2 \neq 0$, ce qui est signalé dans l'exercice m2.
- **Dimension** : définie pour les espaces engendrés par une famille finie, via le lemme fondamental (toute famille de $n + 1$ vecteurs d'un espace engendré par $n$ vecteurs est liée), démontré par récurrence avec élimination d'un générateur. Vérifier la cohérence avec la progression du professeur (certains passent par le lemme d'échange de Steinitz).
- **Matrice d'une application linéaire** : convention « la colonne $j$ contient les coordonnées de $u(e_j)$ » ; matrice de passage $P$ avec $X = PX'$, formule $A' = P^{-1} A P$. Conventions standard, à confirmer.
- **Déterminant** : existence et unicité de la forme $n$-linéaire alternée **énoncées sans preuve** (la preuve par les permutations est longue) ; formule $\det A = \sum_\sigma \varepsilon(\sigma) \prod_j a_{\sigma(j) j}$.
- **Trace** : introduite dans le chapitre Matrices pour l'exercice c2 (propriété $\operatorname{tr}(AB) = \operatorname{tr}(BA)$ énoncée sans preuve).
- **Forme linéaire, hyperplan** : « en dimension finie $n$, les hyperplans sont exactement les sous-espaces de dimension $n - 1$ » énoncé sans preuve (conséquence du théorème du rang).

## Énoncés et preuves à relire
- Critère de somme directe de deux sous-espaces : $F \cap G = \{0\}$. Remarque sur $p \ge 3$ sous-espaces avec le contre-exemple des trois droites du plan. OK.
- « $F \cup G$ est un sous-espace si et seulement si $F \subset G$ ou $G \subset F$ » : énoncé sans preuve.
- Lemme fondamental : cas où tous les $a_j$ sont nuls traité par l'hypothèse de récurrence appliquée à $v_1, \ldots, v_n$. OK.
- Théorème du rang : preuve par un supplémentaire du noyau (existence d'un supplémentaire en dimension finie, admise via la base incomplète).
- Interpolation : injectivité de $P \mapsto (P(x_0), \ldots, P(x_n))$ par le nombre de racines, puis bijectivité par égalité des dimensions. OK.
- Rang des lignes = rang des colonnes : déduit de l'équivalence à $J_r$, preuve esquissée (choix de bases adaptées).
- Pivot de Gauss : coût « de l'ordre de $n^3$ » opérations. OK.
- Contre-exemple $\det(A + B) \neq \det A + \det B$ avec $A = B = I_2$ : $\det(2I_2) = 4 \neq 2$. OK.
- Vandermonde : énoncé dans le cours, preuve dans l'exercice c1.

## Exercices
- **s2** : $\ker A = \operatorname{Vect}((1, 1, -1))$ vérifié ($A(1,1,-1)^\top = 0$).
- **s3** : $\det = 2 \times 5 - 1 \times 2 = 8$.
- **m1** : $P = \frac{X^3}{3} - \frac{X^2}{2} + \frac{X}{6}$ vérifie $P(X+1) - P(X) = X^2$ ; $\sum_{k=1}^{10} k^2 = 385$.
- **m2** : question 3 utilise $pq + pqp = 0$ et $pqp + qp = 0$, d'où $pq = qp$ puis $pq = 0$ (car $2 \neq 0$).
- **m3** : $B^{-1} = I_3 - \frac14 J$ ; coefficient $(1,1)$ : $\frac34$.
- **c1** : récurrence sur $n$ via le développement selon la dernière ligne ; $V(1,2,3,4) = 12$.
- **c2** : $\varphi_A(E_{ji}) = a_{ij}$ ; isomorphisme $A \mapsto \operatorname{tr}(A\,\cdot)$ entre $\mathcal{M}_n(\mathbb{K})$ et son dual ; la matrice de permutation d'un $n$-cycle a une diagonale nulle pour $n \ge 2$. Résultat classique (voir par exemple Gourdon, Algèbre).

## Références
- Grifone (*Algèbre linéaire*), Gourdon (*Algèbre*), Liret et Martinais (*Algèbre 1re année*). Aucune autre référence n'est citée.
