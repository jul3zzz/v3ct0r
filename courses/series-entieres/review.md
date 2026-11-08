# Séries entières (cours écrit) — points à faire vérifier

Relecture humaine demandée avant diffusion.

## Choix de présentation
- Rayon défini par $R = \sup\{r \ge 0 : (a_n r^n) \text{ bornée}\}$ (définition du programme), lemme d'Abel démontré.
- **Régularité** : continuité sur le disque ouvert (convergence normale sur les disques fermés), dérivation et intégration terme à terme sur $]-R, R[$ énoncées sans preuve détaillée.
- **Théorème radial d'Abel** : énoncé sans preuve (hors programme strict dans certaines filières, à signaler) ; utilisé pour $\ln 2$ et la formule de Leibniz.
- Méthode de l'équation différentielle : la conclusion repose sur l'unicité du problème de Cauchy linéaire (cours d'équations différentielles).
- Exponentielle complexe : morphisme par produit de Cauchy ; $\cos$ et $\sin$ peuvent être définis par les formules d'Euler.

## Points délicats
- Exemples sur le cercle de convergence : $\sum z^n$ (diverge partout), $\sum z^n/n$ (diverge en $1$, converge en $-1$), $\sum z^n/n^2$ (converge partout). OK.
- Règle « $|a_n| \sim |b_n|$ ⇒ même rayon » : OK.
- Rayon de $(1 + x)^\alpha$ égal à $1$ si $\alpha \notin \mathbb{N}$ (polynôme sinon). OK.
- Contre-exemple à la réciproque d'Abel : $\sum (-1)^n x^n \to \frac12$, série de Grandi divergente. OK.
- Fonction de Cauchy $e^{-1/x^2}$ : traitée dans l'exercice c1.

## Exercices
- **s1** : $R = 3$. **s2** : $R = 2$ (série lacunaire). **s3** : $\sum n/2^n = 2$.
- **m1** : $a_3 = \frac1{16}$, $a_4 = -\frac{5}{128}$ ; $\sqrt{1{,}1} \approx 1{,}0488125$ (exact $1{,}04880885$), erreur $\le 3{,}9 \cdot 10^{-6}$.
- **m2** : $\sum \frac{(-1)^n}{(2n+1)3^n} = \frac{\pi}{2\sqrt3} \approx 0{,}906900$.
- **m3** : $a_{n+2} = -\frac{a_n}{n+2}$, solution $e^{-x^2/2}$, $a_4 = \frac18$.
- **c1** : récurrence $P_{n+1}(u) = -u^2 P_n'(u) + 2u^3 P_n(u)$ ; $f(1/2) = e^{-4}$.
- **c2** : Catalan, $C_5 = 42$ ; identité $\binom{1/2}{n}(-4)^n = -\frac2n\binom{2n-2}{n-1}$ admise (à vérifier par récurrence si demandé) ; équivalent $C_n \sim \frac{4^n}{n^{3/2}\sqrt\pi}$.

## Références
- Gourdon (*Analyse*), Rudin (*Principles of Mathematical Analysis*, chap. 8), Monier (*Analyse MP*). Aucune autre référence n'est citée.
