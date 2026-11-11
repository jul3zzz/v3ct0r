# Fonctions usuelles, dérivées et primitives (fiche) — points à faire vérifier

Relecture humaine demandée avant diffusion. Programme suivi : « Techniques fondamentales de calcul différentiel et intégral » de MPSI-MP2I, PCSI et PTSI (BO 2021), dont le point de vue est explicitement pratique (« la mise en place rigoureuse des notions abordées fait l'objet de sections ultérieures »).

## Choix de présentation
- Format **fiche** ; les résultats sur la dérivation sont rappelés sans démonstration, comme le prévoit le programme à ce stade (ils sont démontrés dans le cours Limites, continuité, dérivabilité).
- $\ln$ défini comme la primitive de $1/x$ s'annulant en $1$ (cohérent avec le théorème « primitives et intégrales », admis ici et renvoyé au cours Riemann) ; l'exponentielle comme sa réciproque. D'autres progressions partent de l'exponentielle (lycée) : à harmoniser.
- Puissances $x^\alpha$ pour $x > 0$, prolongées en $0$ si $\alpha > 0$ ; puissances entières seules sur $\mathbb{R}^*_-$ (programme).
- Réciproques des fonctions hyperboliques hors programme (non traitées) ; seule formule exigible : $\operatorname{ch}^2 - \operatorname{sh}^2 = 1$.
- Les équations différentielles linéaires de la même section du programme sont renvoyées au cours Équations différentielles (chapitre Premier ordre et théorème d'ordre 2 à coefficients constants).

## Énoncés à relire
- Contre-exemple « deux primitives de $1/x$ sur $\mathbb{R}^*$ qui ne diffèrent pas d'une constante ». OK.
- $\int_0^1\sqrt{1 - x^2}\,dx = \frac\pi4$ par $x = \sin t$. OK.
- Primitive de $e^x\cos x$ : $\frac{e^x(\cos x + \sin x)}{2}$. OK.
- Primitive de $\frac{1}{x^2 + 2x + 5}$ : $\frac12\operatorname{Arctan}\frac{x+1}{2}$. OK.

## Exercices
- **s1** : $\operatorname{Arctan} x + \operatorname{Arctan}\frac1x = \frac\pi2$ sur $]0, +\infty[$, $-\frac\pi2$ sur $]-\infty, 0[$.
- **m1** : $\int_0^\pi e^x\cos x\,dx = -\frac{e^\pi + 1}{2} \approx -12{,}0703$.
- **c1** : Wallis ; $(n + 1)W_{n+1}W_n = \frac\pi2$ ; $W_n \sim \sqrt{\pi/(2n)}$ ; $W_4 = \frac{3\pi}{16} \approx 0{,}5890$. L'exercice utilise la notion d'équivalent (cours Suites et séries).
