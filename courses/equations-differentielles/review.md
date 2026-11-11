# Équations différentielles linéaires (cours écrit) — points à faire vérifier

Relecture humaine demandée avant diffusion.

## Choix de présentation
- **Prérequis** : « Riemann » seulement, pour que le cours s'ouvre en 1re année. Les systèmes et l'exponentielle de matrice utilisent la diagonalisation, vue en 2e année : le texte renvoie à [[reduction#def-diag]] au lieu de verrouiller tout le cours.
- **Cauchy-Lipschitz linéaire** : énoncé sans preuve (la preuve classique passe par un point fixe ou les approximations de Picard).
- **Wronskien** : équivalence « nul en un point ⟺ nul partout ⟺ famille liée » et formule de Liouville $W' = \operatorname{tr}(A)\,W$ énoncées sans preuve.
- **Exponentielle de matrice** : convergence pour une norme d'algèbre admise ; $\det(e^A) = e^{\operatorname{tr} A}$ énoncé sans preuve (trigonalisation dans $\mathbb{C}$, ou Liouville).
- **Formule de Duhamel** énoncée sans preuve (variation de la constante matricielle).
- **Portraits de phase** : classification énoncée pour $A$ inversible ; les cas dégénérés (valeur propre double non diagonalisable, valeur propre nulle) ne sont pas détaillés. Théorème de Liapounov cité comme hors programme.

## Points délicats
- Exemple non linéaire $y' = y^2$, $y(0) = 1$ : solution $\frac{1}{1 - t}$, explosion en $t = 1$. OK.
- Exemple $y' + 2ty = t$ : solutions $\frac12 + Ce^{-t^2}$. OK.
- Pseudo-période de l'oscillateur amorti $\frac{2\pi}{\sqrt{\omega^2 - \lambda^2}}$ pour $y'' + 2\lambda y' + \omega^2 y = 0$. OK.
- Résonance : $\frac{t \sin \omega t}{2\omega}$ solution de $y'' + \omega^2 y = \cos \omega t$ (vérifié dans m3).
- « Aucun système linéaire n'est chaotique » : formulation volontairement informelle (les solutions sont explicites).

## Exercices
- **s1** : $y(1) = 3(1 - e^{-2}) \approx 2{,}5940$. **s2** : $y(1) = e^2 - e \approx 4{,}6708$. **s3** : $e^{3A} = I + 3A$.
- **m1** : $y = \frac{t^3 + t}{2}$, $y(2) = 5$.
- **m2** : $x(1) = \frac{e^3 + e^{-1}}{2} \approx 10{,}2267$ ; col.
- **m3** : $A = \frac{1}{\omega^2 - \Omega^2} = \frac13$ pour $\omega = 2$, $\Omega = 1$.
- **c1** : $e^Ae^B = \begin{pmatrix} 2 & 1 \\ 1 & 1 \end{pmatrix}$, $e^{A+B} = \begin{pmatrix} \cosh 1 & \sinh 1 \\ \sinh 1 & \cosh 1 \end{pmatrix}$, trace $2\cosh 1 \approx 3{,}0862$.
- **c2** : pseudo-période $\frac{2\pi}{\sqrt{0{,}99}} \approx 6{,}3148$ ; régime critique décrit comme « nœud dégénéré ».

## Références
- Arnold (*Équations différentielles ordinaires*), Demailly (*Analyse numérique et équations différentielles*), Gourdon (*Analyse*). Aucune autre référence n'est citée.
