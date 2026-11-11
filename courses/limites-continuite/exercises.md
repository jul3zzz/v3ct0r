# s1 · simple · 10 · Une limite qui est un nombre dérivé
Calculer $\displaystyle\lim_{x \to 0} \frac{\sqrt{1 + x} - 1}{x}$.
## Indice
Forme indéterminée $\frac00$ : reconnaître un taux d'accroissement.
## Indice
Poser $g(x) = \sqrt{1 + x}$ : le quotient vaut $\frac{g(x) - g(0)}{x - 0}$.
## Indice
Autre méthode : multiplier numérateur et dénominateur par la quantité conjuguée $\sqrt{1 + x} + 1$.
## Étape · 1
Avec $g(x) = \sqrt{1 + x}$, dérivable en $0$, le quotient est le taux d'accroissement de $g$ en $0$ ; il tend vers $g'(0) = \frac{1}{2\sqrt{1}} = \frac12$.
## Étape · 1
Vérification par la quantité conjuguée : $\frac{\sqrt{1+x} - 1}{x} = \frac{(1 + x) - 1}{x(\sqrt{1 + x} + 1)} = \frac{1}{\sqrt{1 + x} + 1} \to \frac12$.
## Réponse
num 0.5 ± 0.001

# s2 · simple · 15 · Une racine par dichotomie
Montrer que l'équation $x^5 + x - 1 = 0$ a une unique solution réelle $\alpha$, que $\alpha \in\, ]0, 1[$, et en donner une valeur approchée à $10^{-2}$ près par dichotomie.
## Indice
Étudier $f(x) = x^5 + x - 1$ : sa dérivée, ses limites en $\pm\infty$.
## Indice
$f$ est continue et strictement croissante sur $\mathbb{R}$ : bijection de $\mathbb{R}$ sur quel intervalle ? Calculer $f(0)$ et $f(1)$.
## Indice
Dichotomie : $f(0{,}5) < 0$, $f(0{,}75) < 0$, $f(0{,}875) > 0$… Continuer jusqu'à un intervalle de longueur inférieure à $0{,}02$.
## Étape · 1
$f'(x) = 5x^4 + 1 > 0$ : $f$ est continue et strictement croissante, avec $f \to \pm\infty$ en $\pm\infty$. C'est une bijection de $\mathbb{R}$ sur $\mathbb{R}$ : $0$ a un unique antécédent $\alpha$.
## Étape · 1
$f(0) = -1 < 0 < f(1) = 1$ : par le théorème des valeurs intermédiaires (ou la stricte croissance), $\alpha \in\, ]0, 1[$.
## Étape · 1
Dichotomie : $f(0{,}75) \approx -0{,}013 < 0$ et $f(0{,}76) \approx 0{,}014 > 0$, donc $\alpha \in [0{,}75 ; 0{,}76]$, et $\alpha \approx 0{,}755$ à $10^{-2}$ près (en fait $\alpha \approx 0{,}7549$).
## Réponse
num 0.755 ± 0.01

# m1 · moyen · 25 · Encadrer le logarithme par les accroissements finis
1. Montrer que, pour tout $x > 0$, $\frac{x}{1 + x} < \ln(1 + x) < x$.
2. En déduire $\displaystyle\lim_{n \to +\infty} n \ln\Big(1 + \frac1n\Big)$, puis la limite de $\left(1 + \frac1n\right)^n$.
## Indice
Appliquer l'égalité des accroissements finis à $\ln$ sur $[1, 1 + x]$.
## Indice
On obtient $\ln(1 + x) = \frac{x}{c}$ avec $1 < c < 1 + x$ : encadrer $\frac1c$.
## Indice
Prendre $x = \frac1n$, multiplier par $n$, encadrer ; puis écrire $\left(1 + \frac1n\right)^n = \exp\big(n\ln(1 + \frac1n)\big)$ et utiliser la continuité de l'exponentielle.
## Étape · 1
$\ln$ est continue sur $[1, 1 + x]$ et dérivable sur $]1, 1 + x[$ : il existe $c \in\, ]1, 1 + x[$ tel que $\ln(1 + x) - \ln 1 = \frac{1}{c}\, x$.
## Étape · 1
Comme $1 < c < 1 + x$, $\frac{1}{1 + x} < \frac1c < 1$, et en multipliant par $x > 0$ : $\frac{x}{1 + x} < \ln(1 + x) < x$.
## Étape · 1
Avec $x = \frac1n$ : $\frac{1}{n + 1} < \ln(1 + \frac1n) < \frac1n$, donc $\frac{n}{n + 1} < n\ln(1 + \frac1n) < 1$. Par encadrement, la limite vaut $1$.
## Étape · 1
Par continuité de l'exponentielle en $1$ (composition des limites), $\left(1 + \frac1n\right)^n = e^{n\ln(1 + 1/n)} \to e$.
## Réponse
num 1 ± 0.001

# m2 · moyen · 30 · Dérivable, mais pas de classe C¹
Soit $f$ définie sur $\mathbb{R}$ par $f(x) = x^2 \sin\frac1x$ pour $x \neq 0$ et $f(0) = 0$.

1. Montrer que $f$ est continue sur $\mathbb{R}$.
2. Montrer que $f$ est dérivable en $0$ et calculer $f'(0)$.
3. Calculer $f'(x)$ pour $x \neq 0$ et montrer que $f'$ n'a pas de limite en $0$.

Quelle affirmation est exacte ?
## Indice
Pour 1 et 2, encadrer à l'aide de $\left|\sin\frac1x\right| \le 1$.
## Indice
Le taux d'accroissement en $0$ vaut $x\sin\frac1x$.
## Indice
Pour 3 : $f'(x) = 2x\sin\frac1x - \cos\frac1x$ ; utiliser les suites $\frac{1}{2n\pi}$ et $\frac{1}{(2n+1)\pi}$.
## Étape · 1
Sur $\mathbb{R}^*$, $f$ est continue (produit et composée). En $0$ : $|f(x)| \le x^2 \to 0 = f(0)$.
## Étape · 1
$\left|\frac{f(x) - f(0)}{x}\right| = \left|x\sin\frac1x\right| \le |x| \to 0$ : $f$ est dérivable en $0$ et $f'(0) = 0$.
## Étape · 2
Pour $x \neq 0$ : $f'(x) = 2x\sin\frac1x - \cos\frac1x$. Avec $x_n = \frac{1}{2n\pi} \to 0$ : $f'(x_n) = -1$. Avec $y_n = \frac{1}{(2n+1)\pi} \to 0$ : $f'(y_n) = 1$. Par la caractérisation séquentielle, $f'$ n'a pas de limite en $0$.
## Étape · 1
Donc $f$ est dérivable sur $\mathbb{R}$ mais $f'$ n'est pas continue en $0$ : $f$ n'est pas de classe $C^1$. La réciproque du théorème de la limite de la dérivée est fausse.
## Réponse
qcm B
- $f$ est dérivable en $0$ et $f'$ est continue en $0$
- $f$ est dérivable en $0$ mais $f'$ n'est pas continue en $0$
- $f$ n'est pas dérivable en $0$

# m3 · moyen · 35 · Jensen et l'inégalité arithmético-géométrique
1. Soit $f$ convexe sur un intervalle $I$. Démontrer par récurrence sur $n \ge 2$ l'inégalité de Jensen : pour $x_1, \ldots, x_n \in I$ et $\lambda_1, \ldots, \lambda_n \ge 0$ de somme $1$, $f\big(\sum \lambda_i x_i\big) \le \sum \lambda_i f(x_i)$.
2. En déduire, pour $x_1, \ldots, x_n > 0$ : $\sqrt[n]{x_1 \cdots x_n} \le \frac{x_1 + \cdots + x_n}{n}$.
3. Parmi les réels $x, y, z > 0$ tels que $x + y + z = 3$, quelle est la plus grande valeur de $xyz$ ?
## Indice
Pour l'hérédité, si $\lambda_{n+1} < 1$, écrire $\sum_{i=1}^{n+1} \lambda_i x_i = (1 - \lambda_{n+1})\, y + \lambda_{n+1} x_{n+1}$ avec $y = \sum_{i=1}^{n} \frac{\lambda_i}{1 - \lambda_{n+1}} x_i$.
## Indice
Le point $y$ est une moyenne pondérée de points de $I$ : il est compris entre leur minimum et leur maximum, donc dans $I$. Pour 2, utiliser la concavité du logarithme.
## Indice
Pour 3, appliquer 2 avec $n = 3$ et regarder le cas d'égalité $x = y = z$.
## Étape · 1
Pour $n = 2$, c'est la définition. Supposons le résultat vrai au rang $n$. Si $\lambda_{n+1} = 1$, les autres $\lambda_i$ sont nuls et l'inégalité est une égalité. Sinon, on pose $\mu_i = \frac{\lambda_i}{1 - \lambda_{n+1}}$ pour $i \le n$ : ce sont des réels positifs de somme $1$, et $y = \sum_{i \le n} \mu_i x_i \in I$.
## Étape · 2
Par convexité : $f\big((1 - \lambda_{n+1})y + \lambda_{n+1}x_{n+1}\big) \le (1 - \lambda_{n+1}) f(y) + \lambda_{n+1} f(x_{n+1})$, et par hypothèse de récurrence $f(y) \le \sum_{i \le n} \mu_i f(x_i)$. En multipliant par $1 - \lambda_{n+1} \ge 0$, on obtient l'inégalité au rang $n + 1$.
## Étape · 2
Le logarithme est concave ($\ln'' = -\frac{1}{x^2} < 0$) : avec $\lambda_i = \frac1n$, $\ln\Big(\frac{x_1 + \cdots + x_n}{n}\Big) \ge \frac1n\sum \ln x_i = \ln \sqrt[n]{x_1 \cdots x_n}$, et la croissance de l'exponentielle conclut.
## Étape · 1
Pour 3 : $xyz \le \left(\frac{x + y + z}{3}\right)^3 = 1$, avec égalité pour $x = y = z = 1$. La plus grande valeur est $1$.
## Réponse
num 1 ± 0.001

# c1 · complexe · 75 · Le point fixe du cosinus
On définit la suite $(u_n)$ par $u_0 \in [0, 1]$ et $u_{n+1} = \cos u_n$.

1. Montrer que $[0, 1]$ est stable par $\cos$ : $u_n \in [0, 1]$ pour tout $n$.
2. Montrer que l'équation $\cos x = x$ a une unique solution $\alpha$ dans $[0, 1]$.
3. Montrer que $|\cos x - \cos y| \le k|x - y|$ pour $x, y \in [0, 1]$, avec $k = \sin 1 < 1$.
4. En déduire que $|u_n - \alpha| \le k^n$ pour tout $n$, et que $(u_n)$ converge vers $\alpha$.
5. Quel nombre d'itérations $n$ garantit, par cette majoration, $|u_n - \alpha| \le 10^{-6}$ ? On donne $\ln(\sin 1) \approx -0{,}1726$ et $\ln 10 \approx 2{,}3026$.
## Indice
Pour 1 : $\cos$ est décroissante sur $[0, \pi]$, qui contient $[0, 1]$. Que vaut $\cos([0, 1])$ ? Pour 2 : étudier $g(x) = \cos x - x$.
## Indice
Pour 3 : inégalité des accroissements finis, avec $|\cos'| = |\sin|$ et la croissance du sinus sur $[0, 1]$.
## Indice
Pour 4 : $|u_{n+1} - \alpha| = |\cos u_n - \cos \alpha|$, puis récurrence ; $|u_0 - \alpha| \le 1$. Pour 5 : résoudre $k^n \le 10^{-6}$ en passant au logarithme (attention, $\ln k < 0$).
## Étape · 1
Le cosinus est décroissant sur $[0, 1] \subset [0, \pi]$, donc $\cos([0, 1]) = [\cos 1, 1] \subset [0, 1]$ car $\cos 1 > 0$ (puisque $1 < \frac\pi2$). Par récurrence, $u_n \in [0, 1]$ pour tout $n$.
## Étape · 2
$g(x) = \cos x - x$ est continue et strictement décroissante sur $[0, 1]$ (somme de deux fonctions décroissantes, dont une strictement), avec $g(0) = 1 > 0$ et $g(1) = \cos 1 - 1 < 0$. Par le théorème de la bijection continue, $g$ s'annule en un unique $\alpha \in\, ]0, 1[$.
## Étape · 2
Sur $[0, 1]$, $|\cos'(x)| = \sin x \le \sin 1 = k$, et $k < 1$ car $1 < \frac\pi2$. L'inégalité des accroissements finis donne $|\cos x - \cos y| \le k|x - y|$.
## Étape · 2
Comme $\cos\alpha = \alpha$ et $u_n, \alpha \in [0, 1]$ : $|u_{n+1} - \alpha| = |\cos u_n - \cos\alpha| \le k|u_n - \alpha|$. Par récurrence, $|u_n - \alpha| \le k^n |u_0 - \alpha| \le k^n$, et $k^n \to 0$ car $0 \le k < 1$ : $u_n \to \alpha$ par encadrement.
## Étape · 2
$k^n \le 10^{-6}$ équivaut à $n\ln k \le -6\ln 10$, soit (en divisant par $\ln k < 0$) $n \ge \frac{6\ln 10}{-\ln k} \approx \frac{13{,}8155}{0{,}1726} \approx 80{,}04$. Il suffit de $n = 81$ itérations. En pratique la convergence est plus rapide : près de $\alpha \approx 0{,}7391$, le facteur réel est $\sin\alpha \approx 0{,}674$.
## Réponse
num 81 ± 1
