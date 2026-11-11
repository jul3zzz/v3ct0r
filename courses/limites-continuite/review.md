# Limites, continuité, dérivabilité (cours écrit) — points à faire vérifier

Relecture humaine demandée avant diffusion. Programme suivi : « Fonctions d'une variable réelle : limites et continuité, dérivabilité (convexité) » de MPSI-MP2I, PCSI et PTSI (BO 2021).

## Choix de présentation
- **Définitions avec inégalités larges**, et $x$ parcourant $I$ tout entier (point $a$ compris), comme le demande le programme : d'où « si $f$ est définie en $a$ et a une limite en $a$, cette limite est $f(a)$ », et l'introduction de la limite sur $I \setminus \{a\}$ pour le taux d'accroissement.
- Seuls trois cas de la définition de limite sont écrits ; les autres « s'écrivent de même ». La caractérisation séquentielle est prouvée pour $a$ et $\ell$ réels seulement.
- **Convexité** : au programme de MPSI, MP2I et PCSI, pas de PTSI (vérifié dans les trois textes) ; Jensen : MPSI et MP2I seulement (PCSI : « L'inégalité de Jensen et les développements généraux sur les barycentres sont hors programme »). L'exercice m3 fait démontrer Jensen, donc reste accessible en PCSI comme exercice.
- Croissance des pentes et caractérisation des convexes dérivables énoncées sans preuve.
- « Continue et injective implique strictement monotone » : idée de preuve seulement.
- Stricte monotonie : caractérisation exacte « $f' \ge 0$ et $f'$ non identiquement nulle sur un intervalle non trivial », plus la condition suffisante « $f' > 0$ sauf en un nombre fini de points ».

## Énoncés et preuves à relire
- TVI par dichotomie : invariant $f(a_n) \le y \le f(b_n)$, suites adjacentes. OK.
- Bornes atteintes : suite maximisante + Bolzano-Weierstrass ; cas $M = +\infty$ traité par $f(x_n) \ge n$. OK.
- Rolle : extremum atteint en un point intérieur quand $f$ n'est pas constante. OK.
- Limite de la dérivée : via les accroissements finis ($c_x$ entre $a$ et $x$). Cas $\ell = \pm\infty$ : tangente verticale.
- Inégalité des accroissements finis pour une fonction complexe de classe $C^1$ : renvoyée à la majoration d'intégrale (comme dans le programme).
- Inégalités de convexité : $\frac{2}{\pi}x \le \sin x \le x$ sur $[0, \frac\pi2]$ (corde et tangente du sinus, concave sur $[0, \pi]$). OK.
- Formule de Leibniz : exemple $(x^2e^x)^{(n)} = (x^2 + 2nx + n(n-1))e^x$. OK.

## Exercices
- **s1** : limite $\frac12$ (taux d'accroissement de $\sqrt{1 + x}$ en $0$ et quantité conjuguée).
- **s2** : $f(0{,}75) \approx -0{,}0127$, $f(0{,}76) \approx 0{,}0136$ ; $\alpha \approx 0{,}7549$.
- **m1** : TAF sur $[1, 1 + x]$ ; $n\ln(1 + 1/n) \to 1$ et $(1 + 1/n)^n \to e$.
- **m2** : $f(x) = x^2\sin(1/x)$, $f'(0) = 0$, $f'(1/(2n\pi)) = -1$ et $f'(1/((2n+1)\pi)) = 1$.
- **m3** : récurrence de Jensen avec $\mu_i = \lambda_i/(1 - \lambda_{n+1})$ ; maximum de $xyz$ sous $x + y + z = 3$ : $1$.
- **c1** : $k = \sin 1 \approx 0{,}8415$, $\ln k \approx -0{,}17260$ ; $n \ge 13{,}8155/0{,}17260 \approx 80{,}04$, donc $81$ itérations ; $\alpha \approx 0{,}739085$.
