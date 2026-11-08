# Réduction des endomorphismes — points à faire vérifier

## Conventions
- **Polynôme caractéristique** : $\chi_A = \det(X I_n - A)$, unitaire (convention du programme actuel). Certains ouvrages anciens utilisent $\det(A - X I_n)$, qui diffère du facteur $(-1)^n$. Vérifier la convention du professeur.
- Cadre : $E$ de dimension finie $n \ge 1$, $\mathbb{K} = \mathbb{R}$ ou $\mathbb{C}$. Le cours n'aborde pas les corps quelconques.

## Preuves à relire
- **Somme directe des sous-espaces propres** (v3) : récurrence sur $p$ en appliquant $u - \lambda_p\,\mathrm{id}$. Correcte ; l'initialisation ($p = 1$) est implicite.
- **$\dim E_\lambda \le m_\lambda$** (c4) : complétion d'une base de $E_\lambda$ et déterminant triangulaire par blocs. Correcte.
- **Critères de diagonalisabilité** (d3) : enchaînement (1 ⇒ 2 ⇒ 3 ⇒ 1) et (3 ⇔ 4) via $\sum \dim E_\lambda \le \sum m_\lambda \le n$.
- **Exemple 3 × 3** (d4b) : $A + I$ de rang 1 ⇒ $\dim E_{-1} = 2$ ⇒ $m_{-1} \ge 2$ (par $\dim \le m$), puis trace nulle ⇒ troisième valeur propre $2$. L'argument « $m_{-1} \ge 2$ » utilise la proposition $\dim E_\lambda \le m_\lambda$ ; à souligner à l'oral.
- **Existence d'un polynôme annulateur** (a2) : famille $(\mathrm{id}, u, \ldots, u^{n^2})$ liée car $\dim \mathcal{L}(E) = n^2$. Correct.
- **Lemme des noyaux** (a3-a4) : preuve avec Bézout pour deux facteurs ; extension à $r$ facteurs « par récurrence » seulement mentionnée (l'argument utilise que $P_1$ est premier avec $P_2 \cdots P_r$).
- **Diagonalisable ⇔ annulé par un polynôme scindé à racines simples** : preuve complète dans l'énoncé `thm-annul`.
- **Cayley-Hamilton par la comatrice** (a8) : identification des coefficients dans $\mathcal{M}_n(\mathbb{K})[X] \simeq \mathcal{M}_n(\mathbb{K}[X])$, puis somme télescopique en multipliant **à gauche** par $A^k$. C'est la preuve classique ; vérifier qu'aucune étape ne substitue $A$ à $X$ dans un produit non commutatif (ici, on n'évalue jamais l'identité polynomiale en $A$ : on manipule seulement les relations entre coefficients).
- **Trigonalisation** (t2) : récurrence avec la matrice de passage par blocs $\mathrm{diag}(1, Q)$. Le passage « $\chi_{A'}$ scindé car il divise $\chi_u$ » est correct.
- **Nilpotents** (t2b) : $\chi_N = X^n$ quel que soit $\mathbb{K}$ (le polynôme caractéristique ne dépend pas du corps où l'on travaille). La décomposition de Dunford est **énoncée sans preuve**.

## Affirmations orales à vérifier
- « $F_n$ est l'entier le plus proche de $\varphi^n / \sqrt5$ » : vrai pour tout $n \ge 0$ car $|\bar\varphi^{\,n}/\sqrt5| < 1/2$.
- « Deux endomorphismes diagonalisables qui commutent se codiagonalisent » : énoncé sans preuve.
- « Le signe des parties réelles des valeurs propres dit si les solutions explosent ou s'éteignent » : formulation volontairement informelle (cas diagonalisable).

## Notations
- $\mathrm{Sp}(u)$, $E_\lambda(u)$, $m_\lambda$, $\pi_u$, $\chi_u$ : notations françaises standard.

## Références
- Gourdon (Algèbre), Grifone (Algèbre linéaire), Ramis-Deschamps-Odoux (tome 1). Aucune autre.
