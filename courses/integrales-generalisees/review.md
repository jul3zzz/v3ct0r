# Intégrales généralisées (cours écrit) — points à faire vérifier

Relecture humaine demandée avant diffusion. Programmes suivis (BO 2021, 2e année) : « Intégration sur un intervalle quelconque », paragraphes sur les intégrales généralisées et les fonctions intégrables, en MP-MPI, PC, PSI et PT. La suite de la section (convergence dominée, intégration terme à terme, intégrales à paramètre) est dans le cours Intégrales à paramètre.

## Écarts entre filières
- **Intégration des relations de comparaison** : MP-MPI seulement (« e) Intégration des relations de comparaison » n'apparaît pas en PC, PSI, PT). Énoncé marqué « (MP, MPI) ».
- Fonctions continues par morceaux sur un intervalle : paragraphe explicite en PC et PSI (« a) Fonctions continues par morceaux ») ; supposé connu ailleurs.

## Choix de présentation
- Changement de variable énoncé pour $f$ continue et $\varphi$ bijection $C^1$ strictement monotone (forme du programme).
- Intégration par parties : par passage à la limite depuis un segment, sous l'hypothèse que $uv$ a des limites finies aux bornes.
- Exemple « pics » (série divergente, intégrale convergente) décrit sans formule explicite ; à illustrer par une figure si besoin.
- Équivalent $\int_x^{+\infty}e^{-t^2}dt \sim \frac{e^{-x^2}}{2x}$ via la dérivée de $-\frac{e^{-t^2}}{2t}$, égale à $(1 + \frac{1}{2t^2})e^{-t^2}$. Vérifié.
- $\int_0^{+\infty}\frac{\sin t}{t}dt = \frac\pi2$ admis (calcul classique par l'intégrale à paramètre $\int_0^{+\infty} e^{-xt}\frac{\sin t}{t}dt$).

## Exercices
- **s1** : $\frac12$. **s2** : $1$.
- **m1** : $\Gamma(x + 1) = x\Gamma(x)$, $\Gamma(5) = 24$.
- **m2** : $\int_0^{+\infty}\frac{\ln t}{1 + t^2}dt = 0$ par $t = 1/u$ (calcul refait).
- **c1** : Dirichlet, semi-convergence par $|\sin t| \ge \sin^2 t$.
