# Suites et séries de fonctions (cours écrit) — points à faire vérifier

Relecture humaine demandée avant diffusion. Programmes suivis (BO 2021, 2e année) : « Suites et séries de fonctions, séries entières, A » (MP-MPI) ; « Suites et séries de fonctions, B » (PC, PSI). Absent du programme PT (qui n'a que les séries entières) : étiquettes MP, PC, PSI, MPI.

## Écarts entre filières (vérifiés)
- Théorème de la double limite : MP-MPI, PC et PSI (« la démonstration est hors programme » en PC, PSI).
- Convergence normale : MP-MPI, PC, PSI.
- **Approximation uniforme** (escalier, Weierstrass) : MP-MPI seulement (aucune occurrence de « Weierstrass » en PC, PSI, PT). Chapitre marqué « (MP, MPI) ».

## Choix de présentation
- Fonctions à valeurs dans $\mathbb{K}$ (le programme MP permet un espace normé de dimension finie ; non traité).
- Continuité d'une limite uniforme démontrée (argument en $\varepsilon/3$) ; double limite et Weierstrass admis ; dérivation justifiée via $f_n(x) = f_n(a) + \int_a^x f'_n$.
- Bernstein et la loi faible des grands nombres : mention, sans preuve.

## Exercices
- **s1** : $\|nxe^{-nx}\|_\infty = e^{-1}$, pas de convergence uniforme sur $\mathbb{R}_+$.
- **s2** : $\frac{\sin(nx)}{n} \to 0$ uniformément, $\cos(nx)$ diverge en $x = \pi$.
- **m1** : $\sum \frac{x^n}{n^2}$ normale sur $[-1, 1]$ ; $xS'(x) = -\ln(1 - x)$ ; $S(1) = \frac{\pi^2}{6}$ (admis).
- **m2** : $0 \le \zeta(x) - 1 \le 2^{2-x}(\zeta(2) - 1)$ pour $x \ge 2$.
- **c1** : $S(k) = \frac{H_k}{k}$ (télescopage) : $S(1) = 1$, $S(2) = \frac34$ ; $S(x) \le \frac{3 + \ln x}{x}$ pour $x \ge 1$ (avec $N = \lfloor x\rfloor \ge x/2$).
