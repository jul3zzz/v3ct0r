# Convergence dominée et intégrales à paramètre (cours écrit) — points à faire vérifier

Relecture humaine demandée avant diffusion. Programmes suivis (BO 2021, 2e année) : fin de la section « Intégration sur un intervalle quelconque » en MP-MPI (f) convergence dominée, g) intégration terme à terme, h) intégrales à paramètre), PC et PSI (e) suites et séries de fonctions intégrables, f) intégrales à paramètre), PT (d) intégration terme à terme, e) intégrales à paramètre).

## Écarts entre filières (vérifiés dans les textes)
- **Convergence dominée** : MP-MPI, PC, PSI ; absente de PT (PT : seulement l'intégration terme à terme et les théorèmes de continuité et de dérivation avec domination, « démonstration hors programme »). Chapitre 1 marqué ; les exercices s1, s2, m1, m2 n'utilisent pas la convergence dominée et conviennent à PT. L'exercice c1 non plus, sauf la mention du cours.
- PT : le théorème d'intégration terme à terme suppose la somme $S$ **continue** (énoncé reproduit).
- Le programme précise : on vérifie les hypothèses de convergence et de domination sans expliciter la continuité par morceaux, et « le passage éventuel par une domination locale doit faire l'objet d'une question intermédiaire ».

## Choix de présentation
- Démonstrations hors programme (convergence dominée, terme à terme) ; continuité et dérivation présentées comme conséquences de la convergence dominée, sauf en PT.
- Intégrale de Gauss admise ; $\sum 1/n^2 = \pi^2/6$ admis.

## Exercices
- **s1** : $G(0) = 1$, domination par $e^{-t}$.
- **s2** : $\int_0^1\frac{\ln(1+t)}{t}dt = \frac{\pi^2}{12} \approx 0{,}822467$.
- **m1** : $\int_0^\infty\frac{t^2}{e^t - 1}dt = 2\zeta(3) \approx 2{,}404114$.
- **m2** : $F(x) = \frac{\sqrt\pi}{2}e^{-x^2/4}$, $F(2) \approx 0{,}886227 \times 0{,}367879 = 0{,}326025$.
- **c1** : $F(x) = \frac\pi2 - \operatorname{Arctan} x$ ; majoration uniforme du reste par $\frac2A$ (IPP avec $g$ décroissante) ; continuité en $0$ ; $F(1) = \frac\pi4$. Vérifier la rédaction de la majoration $|F(x) - F(0)| \le \frac{xA^2}{2} + \frac4A$.
