# Analyse asymptotique (cours écrit) — points à faire vérifier

Relecture humaine demandée avant diffusion. Programme suivi : « Analyse asymptotique » (2e semestre) de MPSI-MP2I, PCSI et PTSI (BO 2021) : fonctions d'abord, puis suites ; développements usuels à tout ordre, tangente à l'ordre 3 ; composée seulement sur des exemples (« aucun résultat général n'est exigible »).

## Choix de présentation
- Définition de $o$, $O$, $\sim$ **par le quotient**, sous l'hypothèse que $g$ ne s'annule pas localement (programme), avec la tolérance $f(a) = g(a) = 0$ au point lui-même ; à harmoniser avec la définition « $f = \varepsilon g$ » si le professeur la préfère.
- Puissances d'équivalents énoncées pour des fonctions positives et un exposant fixé.
- Primitivation : preuve par les accroissements finis esquissée ; Taylor-Young par récurrence via la primitivation (démonstration non exigible).
- Contre-exemple « DL d'ordre 2 sans dérivée seconde » : $x^3\sin(1/x)$, $f'(x) = 3x^2\sin(1/x) - x\cos(1/x)$ non dérivable en $0$. OK.
- Conditions d'extremum à l'ordre 2 énoncées pour $f$ de classe $C^2$ sur un ouvert.
- Les formules de Taylor avec reste intégral et Taylor-Lagrange sont annoncées sans être traitées (elles relèvent de la section Intégration).

## Énoncés à relire
- DL usuels : $\cos$ à $o(x^{2n+1})$, $\sin$ et Arctan à $o(x^{2n+2})$ (parité) ; $\binom{\alpha}{k}$ généralisé. OK.
- $e^x\sin x = x + x^2 + \frac{x^3}{3} + o(x^3)$ ; contrôle $f'''(0) = \operatorname{Im}((1 + i)^3) = 2$. OK.
- $\sqrt{x^2 + x + 1} = x + \frac12 + \frac{3}{8x} + o(1/x)$. OK.

## Exercices
- **s1** : $\frac12$. **s2** : $\frac13$. **m1** : $\frac13$. **m2** : $b = \frac12$, graphe au-dessus.
- **m3** : $\cos x + \frac{x^2}{2} = 1 + \frac{x^4}{24} + o(x^4)$ : minimum local strict.
- **c1** : $x_n = n\pi + \frac\pi2 - \frac{1}{n\pi} + o(1/n)$ ; contrôle numérique (dichotomie) $x_{10} \approx 32{,}95639$ contre $32{,}95489$ par la formule ; écart $\approx 1{,}5 \cdot 10^{-3} \approx \frac{1}{2\pi n^2}$, cohérent avec le terme suivant ($-\frac{1}{n\pi + \pi/2}$ au lieu de $-\frac{1}{n\pi}$).
