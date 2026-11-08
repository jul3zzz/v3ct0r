# s1 · simple · 10 · Une charge de condensateur
Résoudre $y' + 2y = 6$ avec $y(0) = 0$, puis calculer $y(1)$.
## Indice
Une solution particulière constante saute aux yeux.
## Indice
Les solutions de l'équation homogène sont $C e^{-2t}$.
## Indice
Ajuster $C$ avec la condition initiale.
## Étape · 1
La constante $3$ est solution ; les solutions sont $y(t) = 3 + C e^{-2t}$.
## Étape · 1
$y(0) = 0$ donne $C = -3$ : $y(t) = 3(1 - e^{-2t})$.
## Étape · 1
$y(1) = 3(1 - e^{-2}) \approx 2{,}594$. La solution tend vers $3$ : c'est la charge d'un condensateur à travers une résistance.
## Réponse
num 2.594 ± 0.001

# s2 · simple · 10 · Deux racines réelles
Résoudre $y'' - 3y' + 2y = 0$ avec $y(0) = 0$ et $y'(0) = 1$, puis calculer $y(1)$.
## Indice
Équation caractéristique : $r^2 - 3r + 2 = 0$.
## Indice
Ses racines sont $1$ et $2$.
## Indice
Résoudre $C_1 + C_2 = 0$ et $C_1 + 2C_2 = 1$.
## Étape · 1
Les racines de $r^2 - 3r + 2$ sont $1$ et $2$ : les solutions sont $C_1 e^{t} + C_2 e^{2t}$.
## Étape · 1
Les conditions initiales donnent $C_1 + C_2 = 0$ et $C_1 + 2C_2 = 1$, soit $C_2 = 1$, $C_1 = -1$.
## Étape · 1
$y(t) = e^{2t} - e^{t}$ et $y(1) = e^2 - e \approx 4{,}6708$.
## Réponse
num 4.6708 ± 0.001

# s3 · simple · 10 · L'exponentielle d'une matrice nilpotente
Soit $A = \begin{pmatrix} 0 & 1 \\ 0 & 0 \end{pmatrix}$. Calculer $e^{tA}$, puis le coefficient en position $(1, 2)$ de $e^{3A}$.
## Indice
Calculer $A^2$.
## Indice
La série $\sum \frac{t^k A^k}{k!}$ s'arrête.
## Indice
$e^{tA} = I_2 + tA$.
## Étape · 1
$A^2 = 0$, donc $e^{tA} = I_2 + tA = \begin{pmatrix} 1 & t \\ 0 & 1 \end{pmatrix}$.
## Étape · 1
Le coefficient $(1, 2)$ de $e^{3A}$ vaut $3$. Interprétation : $X' = AX$ s'écrit $x' = y$, $y' = 0$, d'où $y$ constant et $x(t) = x_0 + t y_0$, un mouvement rectiligne uniforme.
## Réponse
num 3 ± 0.001

# m1 · moyen · 30 · Variation de la constante
Résoudre sur $]0, +\infty[$ l'équation $y' - \frac{y}{t} = t^2$ avec $y(1) = 1$, puis calculer $y(2)$.
## Indice
Une primitive de $-\frac1t$ est $-\ln t$ : les solutions homogènes sont $C t$.
## Indice
Chercher $y = C(t)\, t$ : il reste $C'(t)\, t = t^2$.
## Indice
$C(t) = \frac{t^2}{2} + K$.
## Étape · 1
Équation homogène : $y = C e^{\ln t} = Ct$.
## Étape · 2
Variation de la constante : $y = C(t)\, t$ donne $C'(t)\, t + C(t) - C(t) = t^2$, soit $C'(t) = t$ et $C(t) = \frac{t^2}{2} + K$. Les solutions sont $y(t) = \frac{t^3}{2} + Kt$.
## Étape · 1
$y(1) = \frac12 + K = 1$ donne $K = \frac12$ : $y(t) = \frac{t^3 + t}{2}$, et $y(2) = \frac{8 + 2}{2} = 5$.
## Étape · 1
Vérification : $y' - \frac yt = \frac{3t^2 + 1}{2} - \frac{t^2 + 1}{2} = t^2$.
## Réponse
num 5 ± 0.001

# m2 · moyen · 30 · Un système à diagonaliser
Résoudre $X' = AX$ avec $A = \begin{pmatrix} 1 & 2 \\ 2 & 1 \end{pmatrix}$ et $X(0) = (1, 0)$. Décrire le portrait de phase et calculer la première coordonnée $x(1)$.
## Indice
$A$ est symétrique : elle se diagonalise ; trace $2$, déterminant $-3$.
## Indice
Valeurs propres $3$ et $-1$, vecteurs propres $(1, 1)$ et $(1, -1)$.
## Indice
Décomposer $X(0)$ sur les vecteurs propres : chaque composante évolue avec son exponentielle.
## Étape · 2
Les valeurs propres sont racines de $\lambda^2 - 2\lambda - 3$ : $3$ (vecteur $(1, 1)$) et $-1$ (vecteur $(1, -1)$).
## Étape · 2
$X(0) = \frac12(1, 1) + \frac12(1, -1)$, donc $X(t) = \frac12 e^{3t}(1, 1) + \frac12 e^{-t}(1, -1)$.
## Étape · 1
Les valeurs propres sont de signes opposés : c'est un col. La direction $(1, -1)$ est attirante, la direction $(1, 1)$ repoussante.
## Étape · 1
$x(1) = \frac{e^3 + e^{-1}}{2} \approx 10{,}2267$.
## Réponse
num 10.2267 ± 0.001

# m3 · moyen · 35 · Oscillateur forcé et résonance
On considère $y'' + \omega^2 y = \cos(\Omega t)$ avec $\omega > 0$.

1. Si $\Omega \neq \omega$, chercher une solution particulière de la forme $A \cos(\Omega t)$.
2. Si $\Omega = \omega$, vérifier que $\frac{t \sin(\omega t)}{2\omega}$ est solution. Que se passe-t-il ?
3. Pour $\omega = 2$ et $\Omega = 1$, donner l'amplitude $A$ de la solution particulière.
## Indice
$(A\cos\Omega t)'' = -\Omega^2 A \cos \Omega t$.
## Indice
Pour la question 2, dériver deux fois $t \sin \omega t$.
## Indice
$A = \frac{1}{\omega^2 - \Omega^2}$.
## Étape · 2
Avec $y = A\cos(\Omega t)$ : $(\omega^2 - \Omega^2) A \cos(\Omega t) = \cos(\Omega t)$, donc $A = \frac{1}{\omega^2 - \Omega^2}$. Les solutions sont $\frac{\cos \Omega t}{\omega^2 - \Omega^2} + C_1\cos\omega t + C_2 \sin \omega t$.
## Étape · 2
Pour $y_p = \frac{t\sin\omega t}{2\omega}$ : $y_p'' = \cos \omega t - \frac{\omega t}{2}\sin\omega t$, donc $y_p'' + \omega^2 y_p = \cos\omega t$.
## Étape · 1
L'amplitude de $y_p$ croît linéairement avec $t$ : c'est la **résonance**. Plus $\Omega$ est proche de $\omega$, plus $|A|$ est grand ; avec un amortissement, l'amplitude reste finie mais présente un pic près de $\omega$.
## Étape · 1
Pour $\omega = 2$, $\Omega = 1$ : $A = \frac{1}{4 - 1} = \frac13$.
## Réponse
num 0.3333 ± 0.001

# c1 · complexe · 60 · Quand l'exponentielle ne transforme pas les sommes en produits
1. Montrer que si $A$ et $B$ commutent, $e^{A + B} = e^A e^B$ (produit de Cauchy de deux séries absolument convergentes).
2. Avec $A = \begin{pmatrix} 0 & 1 \\ 0 & 0 \end{pmatrix}$ et $B = \begin{pmatrix} 0 & 0 \\ 1 & 0 \end{pmatrix}$, calculer $e^A$, $e^B$ et $e^A e^B$.
3. Calculer $e^{A + B}$ en remarquant que $(A + B)^2 = I_2$, et comparer avec $e^A e^B$.
4. Vérifier sur cet exemple que $\det(e^{A+B}) = e^{\operatorname{tr}(A + B)}$. Donner $\operatorname{tr}(e^{A+B})$.
## Indice
Si $AB = BA$, la formule du binôme s'applique : $(A + B)^n = \sum_k \binom nk A^k B^{n-k}$.
## Indice
$A^2 = B^2 = 0$.
## Indice
Avec $J = A + B$ et $J^2 = I_2$, séparer les puissances paires et impaires : $e^J = \cosh(1) I_2 + \sinh(1) J$.
## Étape · 2
Si $AB = BA$, $\frac{(A + B)^n}{n!} = \sum_{k=0}^{n} \frac{A^k}{k!}\frac{B^{n-k}}{(n-k)!}$ par le binôme ; c'est le terme général du produit de Cauchy des séries de $e^A$ et $e^B$, absolument convergentes pour une norme d'algèbre : $e^{A+B} = e^A e^B$.
## Étape · 2
$A^2 = B^2 = 0$ donne $e^A = I_2 + A$, $e^B = I_2 + B$, et $e^A e^B = I_2 + A + B + AB = \begin{pmatrix} 2 & 1 \\ 1 & 1 \end{pmatrix}$, car $AB = \begin{pmatrix} 1 & 0 \\ 0 & 0 \end{pmatrix}$.
## Étape · 2
$J = A + B = \begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}$ vérifie $J^2 = I_2$, donc $e^J = \sum_k \frac{1}{(2k)!} I_2 + \sum_k \frac{1}{(2k+1)!} J = \begin{pmatrix} \cosh 1 & \sinh 1 \\ \sinh 1 & \cosh 1 \end{pmatrix}$.
## Étape · 1
$e^{A + B} \neq e^A e^B$ : les coefficients diagonaux $\cosh 1 \approx 1{,}543$ ne valent ni $2$ ni $1$. Ici $AB \neq BA$.
## Étape · 1
$\det(e^{A+B}) = \cosh^2 1 - \sinh^2 1 = 1 = e^0 = e^{\operatorname{tr}(A + B)}$, et $\operatorname{tr}(e^{A+B}) = 2\cosh 1 \approx 3{,}0862$ (alors que $\operatorname{tr}(e^A e^B) = 3$).
## Réponse
num 3.0862 ± 0.001

# c2 · complexe · 75 · L'oscillateur amorti
On étudie $y'' + 2\lambda y' + \omega^2 y = 0$ avec $\omega > 0$ et $\lambda \ge 0$.

1. Écrire le système $X' = MX$ associé, avec $X = (y, y')$, et les valeurs propres de $M$ en fonction de $\lambda$ et $\omega$.
2. Montrer que l'énergie $E = \frac12 y'^2 + \frac12 \omega^2 y^2$ vérifie $E' = -2\lambda y'^2$. Qu'en déduire pour $\lambda = 0$ ?
3. Distinguer les régimes pseudo-périodique ($\lambda < \omega$), critique ($\lambda = \omega$) et apériodique ($\lambda > \omega$), et décrire le portrait de phase dans chaque cas.
4. Montrer que toutes les solutions tendent vers $0$ si et seulement si $\lambda > 0$. Pour $\omega = 1$ et $\lambda = 0{,}1$, calculer la pseudo-période.
## Indice
$M = \begin{pmatrix} 0 & 1 \\ -\omega^2 & -2\lambda \end{pmatrix}$, de polynôme caractéristique $r^2 + 2\lambda r + \omega^2$.
## Indice
Dériver $E$ et utiliser l'équation pour remplacer $y''$.
## Indice
Les valeurs propres sont $-\lambda \pm \sqrt{\lambda^2 - \omega^2}$ ; la pseudo-période est $\frac{2\pi}{\sqrt{\omega^2 - \lambda^2}}$.
## Étape · 1
$X' = \begin{pmatrix} 0 & 1 \\ -\omega^2 & -2\lambda \end{pmatrix} X$ ; les valeurs propres sont les racines de $r^2 + 2\lambda r + \omega^2$, soit $-\lambda \pm \sqrt{\lambda^2 - \omega^2}$.
## Étape · 2
$E' = y' y'' + \omega^2 y y' = y'(y'' + \omega^2 y) = -2\lambda y'^2 \le 0$ : l'énergie décroît. Pour $\lambda = 0$, elle est constante : les trajectoires sont les ellipses $\frac12 y'^2 + \frac12\omega^2 y^2 = E_0$ (un centre).
## Étape · 2
Si $0 < \lambda < \omega$ : valeurs propres $-\lambda \pm i\sqrt{\omega^2 - \lambda^2}$, solutions $e^{-\lambda t}(C_1 \cos \mu t + C_2 \sin \mu t)$ avec $\mu = \sqrt{\omega^2 - \lambda^2}$ : foyer attractif, oscillations amorties.
## Étape · 2
Si $\lambda = \omega$ : racine double $-\omega$, solutions $(C_1 + C_2 t)e^{-\omega t}$ (retour le plus rapide sans oscillation, nœud dégénéré). Si $\lambda > \omega$ : deux racines réelles négatives, nœud attractif, retour lent sans oscillation.
## Étape · 2
Si $\lambda > 0$, les valeurs propres ont une partie réelle strictement négative dans les trois cas : toutes les solutions tendent vers $0$. Si $\lambda = 0$, l'énergie est conservée et une solution non nulle ne tend pas vers $0$.
## Étape · 1
Pour $\omega = 1$, $\lambda = 0{,}1$ : pseudo-période $\frac{2\pi}{\sqrt{0{,}99}} \approx 6{,}3148$, à peine plus longue que la période $2\pi$ sans frottement.
## Réponse
num 6.3148 ± 0.001
