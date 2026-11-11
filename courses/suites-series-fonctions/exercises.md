# s1 · simple · 10 · Une bosse qui ne s'aplatit pas
Soit $f_n(x) = nxe^{-nx}$ sur $[0, +\infty[$. Déterminer la limite simple de $(f_n)$, puis calculer $\|f_n\|_\infty$. Y a-t-il convergence uniforme sur $[0, +\infty[$ ? Donner $\|f_n\|_\infty$.
## Indice
À $x > 0$ fixé, $nxe^{-nx} \to 0$ par croissances comparées ; et $f_n(0) = 0$.
## Indice
Étudier $f_n$ : $f'_n(x) = n(1 - nx)e^{-nx}$ s'annule en $x = \frac1n$.
## Indice
$\|f_n\|_\infty = f_n\left(\frac1n\right)$ ne dépend pas de $n$.
## Étape · 1
La limite simple est la fonction nulle : $f_n(0) = 0$, et pour $x > 0$, $nxe^{-nx} = \frac{nx}{e^{nx}} \to 0$.
## Étape · 1
$f_n$ croît sur $[0, \frac1n]$ et décroît ensuite : $\|f_n\|_\infty = f_n(\frac1n) = e^{-1} \approx 0{,}368$, qui ne tend pas vers $0$. Pas de convergence uniforme sur $[0, +\infty[$ ; mais sur $[a, +\infty[$ avec $a > 0$, $\|f_n\|_\infty = nae^{-na} \to 0$ dès que $\frac1n \le a$.
## Réponse
num 0.3679 ± 0.001

# s2 · simple · 10 · Converger uniformément sans que les dérivées suivent
Soit $f_n(x) = \frac{\sin(nx)}{n}$ sur $\mathbb{R}$. Quelle affirmation est exacte ?
## Indice
Majorer $|f_n(x)|$ indépendamment de $x$.
## Indice
Calculer $f'_n(x)$ et regarder, par exemple, $x = \pi$ ou $x = \frac{\pi}{2}$.
## Indice
Le théorème de dérivation demande la convergence uniforme des **dérivées**.
## Étape · 1
$|f_n(x)| \le \frac1n$ pour tout $x$ : $(f_n)$ converge uniformément vers $0$ sur $\mathbb{R}$.
## Étape · 1
$f'_n(x) = \cos(nx)$ ; en $x = \pi$, $\cos(n\pi) = (-1)^n$ ne converge pas. La suite des dérivées ne converge même pas simplement : la limite ($0$) est dérivable, mais pas comme limite des $f'_n$.
## Réponse
qcm B
- $(f_n)$ et $(f'_n)$ convergent uniformément vers $0$
- $(f_n)$ converge uniformément vers $0$, mais pas $(f'_n)$
- $(f_n)$ ne converge pas uniformément sur $\mathbb{R}$

# m1 · moyen · 25 · La série des xⁿ/n²
Soit $S(x) = \sum_{n=1}^{+\infty}\frac{x^n}{n^2}$.

1. Montrer que la série converge normalement sur $[-1, 1]$ et que $S$ est continue sur $[-1, 1]$.
2. Montrer que $S$ est de classe $C^1$ sur $]-1, 1[$ et exprimer $xS'(x)$ à l'aide d'un logarithme.
3. Donner $S(1)$.
## Indice
$\left|\frac{x^n}{n^2}\right| \le \frac{1}{n^2}$ sur $[-1, 1]$.
## Indice
Les dérivées $\frac{x^{n-1}}{n}$ ne sont pas normalement sommables sur $]-1, 1[$, mais elles le sont sur tout $[-a, a]$ avec $a < 1$.
## Indice
$\sum_{n \ge 1}\frac{x^n}{n} = -\ln(1 - x)$ pour $|x| < 1$ ; et $S(1) = \zeta(2) = \frac{\pi^2}{6}$.
## Étape · 1
$\left\|\frac{x^n}{n^2}\right\|_{\infty, [-1,1]} = \frac{1}{n^2}$, terme d'une série convergente : convergence normale, donc uniforme, et $S$ est continue sur $[-1, 1]$ comme somme uniforme de fonctions continues.
## Étape · 2
Sur $[-a, a]$ ($0 < a < 1$), $\left|\frac{x^{n-1}}{n}\right| \le a^{n-1}$ : la série dérivée converge normalement sur tout segment de $]-1, 1[$, donc $S$ est $C^1$ sur $]-1, 1[$ et $xS'(x) = \sum_{n \ge 1}\frac{x^n}{n} = -\ln(1 - x)$.
## Étape · 1
$S(1) = \sum \frac{1}{n^2} = \frac{\pi^2}{6} \approx 1{,}6449$ (résultat d'Euler, admis ici).
## Réponse
num 1.6449 ± 0.001

# m2 · moyen · 25 · La limite de ζ en +∞
On rappelle que $\zeta(x) = \sum_{n \ge 1} n^{-x}$ est continue et décroissante sur $]1, +\infty[$. Montrer de deux façons que $\zeta(x) \to 1$ quand $x \to +\infty$ : par le théorème de la double limite, puis par une majoration directe. Donner la limite.
## Indice
Sur $[2, +\infty[$, la série converge normalement ; chaque terme $n^{-x}$ a une limite quand $x \to +\infty$ : laquelle ?
## Indice
Majoration directe : pour $n \ge 2$ et $x \ge 2$, $n^{-x} = n^{-2}n^{-(x-2)} \le n^{-2}2^{-(x-2)}$.
## Indice
On obtient $0 \le \zeta(x) - 1 \le 2^{2-x}\big(\zeta(2) - 1\big)$.
## Étape · 1
Double limite : la convergence est normale, donc uniforme, sur $[2, +\infty[$ ; la limite de $n^{-x}$ en $+\infty$ vaut $1$ pour $n = 1$ et $0$ pour $n \ge 2$. Donc $\zeta(x) \to 1 + 0 + 0 + \cdots = 1$.
## Étape · 2
Directement : pour $x \ge 2$, $0 \le \zeta(x) - 1 = \sum_{n \ge 2}n^{-x} \le 2^{2-x}\sum_{n \ge 2}n^{-2} = 2^{2-x}\big(\zeta(2) - 1\big) \to 0$. La limite vaut $1$.
## Réponse
num 1 ± 0.001

# c1 · complexe · 75 · Une série de fonctions rationnelles
Pour $x \ge 0$, on pose $S(x) = \sum_{n=1}^{+\infty}\frac{1}{n(n + x)}$.

1. Montrer que $S$ est définie et continue sur $[0, +\infty[$.
2. Montrer que $S$ est de classe $C^1$ et décroissante sur $[0, +\infty[$.
3. Calculer $S(0)$, $S(1)$ et $S(2)$.
4. Montrer que $S(x) \to 0$ quand $x \to +\infty$.
5. Plus finement, montrer que $S(x) \le \frac{3 + \ln x}{x}$ pour $x \ge 1$.
## Indice
Pour 1 et 2 : majorer $\frac{1}{n(n + x)}$ et sa dérivée en $x$ par des termes indépendants de $x$.
## Indice
Pour 3 : $\frac{1}{n(n + k)} = \frac1k\left(\frac1n - \frac{1}{n + k}\right)$ pour $k$ entier, télescopage. Pour 4 : double limite, ou couper la somme en deux.
## Indice
Pour 5 : avec $N = \lfloor x \rfloor$, $\frac{1}{n(n + x)} \le \frac{1}{nx}$ pour $n \le N$ et $\le \frac{1}{n^2}$ pour $n > N$ ; comparer $\sum_{n \le N}\frac1n$ à $1 + \ln N$ et $\sum_{n > N}\frac{1}{n^2}$ à $\int_N^{+\infty}\frac{dt}{t^2}$.
## Étape · 1
Pour $x \ge 0$ : $0 < \frac{1}{n(n + x)} \le \frac{1}{n^2}$, série convergente indépendante de $x$ : convergence normale sur $[0, +\infty[$, donc $S$ est définie et continue.
## Étape · 2
$\frac{\partial}{\partial x}\frac{1}{n(n + x)} = -\frac{1}{n(n + x)^2}$, de valeur absolue au plus $\frac{1}{n^3}$ : la série dérivée converge normalement, donc $S$ est $C^1$ et $S'(x) = -\sum\frac{1}{n(n + x)^2} < 0$ : $S$ est décroissante.
## Étape · 2
$S(0) = \zeta(2) = \frac{\pi^2}{6}$. Pour $k \in \mathbb{N}^*$, $S(k) = \frac1k\sum_{n \ge 1}\left(\frac1n - \frac{1}{n + k}\right) = \frac1k\left(1 + \frac12 + \cdots + \frac1k\right)$ par télescopage. Donc $S(1) = 1$ et $S(2) = \frac12 \cdot \frac32 = \frac34$.
## Étape · 1
Double limite : la convergence est normale sur $[0, +\infty[$ et chaque terme tend vers $0$ quand $x \to +\infty$, donc $S(x) \to 0$.
## Étape · 2
Pour $x \ge 1$, soit $N = \lfloor x \rfloor \ge 1$. Par comparaison série-intégrale ($\frac1n \le \int_{n-1}^{n}\frac{dt}{t}$ pour $n \ge 2$), $\sum_{n=1}^{N}\frac{1}{n(n + x)} \le \frac1x\sum_{n=1}^{N}\frac1n \le \frac{1 + \ln N}{x} \le \frac{1 + \ln x}{x}$. De même, $\sum_{n > N}\frac{1}{n(n + x)} \le \sum_{n \ge N + 1}\frac{1}{n^2} \le \int_N^{+\infty}\frac{dt}{t^2} = \frac1N \le \frac2x$, car $N \ge \frac x2$ pour $x \ge 1$. Donc $S(x) \le \frac{3 + \ln x}{x}$, et $S(x) = O\left(\frac{\ln x}{x}\right)$ en $+\infty$.
## Réponse
num 0.75 ± 0.001
