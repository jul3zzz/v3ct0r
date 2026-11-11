# s1 · simple · 15 · Continuité en un bord
Pour $x \ge 0$, on pose $G(x) = \int_0^{+\infty}\frac{e^{-t}}{1 + xt}\,dt$. Montrer que $G$ est définie et continue sur $[0, +\infty[$, puis donner la limite de $G(x)$ quand $x \to 0^+$.
## Indice
Pour $x \ge 0$ et $t \ge 0$, $1 + xt \ge 1$.
## Indice
Domination : $\left|\frac{e^{-t}}{1 + xt}\right| \le e^{-t}$, fonction intégrable indépendante de $x$.
## Indice
La continuité en $0$ donne $\lim_{x \to 0^+} G(x) = G(0)$.
## Étape · 1
Pour tout $t \ge 0$, $x \mapsto \frac{e^{-t}}{1 + xt}$ est continue sur $[0, +\infty[$, et $0 \le \frac{e^{-t}}{1 + xt} \le e^{-t}$, intégrable sur $[0, +\infty[$ : par le théorème de continuité, $G$ est définie et continue sur $[0, +\infty[$.
## Étape · 1
$\lim_{x \to 0^+}G(x) = G(0) = \int_0^{+\infty}e^{-t}\,dt = 1$.
## Réponse
num 1 ± 0.001

# s2 · simple · 15 · Une intégrale par une série alternée
Montrer que $\int_0^1\frac{\ln(1 + t)}{t}\,dt = \sum_{n=1}^{+\infty}\frac{(-1)^{n+1}}{n^2}$, puis en donner la valeur sachant que $\sum\frac{1}{n^2} = \frac{\pi^2}{6}$.
## Indice
Pour $t \in\, ]0, 1]$, $\ln(1 + t) = \sum_{n \ge 1}\frac{(-1)^{n+1}t^n}{n}$ (série entière, convergente en $t = 1$).
## Indice
Avec $f_n(t) = \frac{(-1)^{n+1}t^{n-1}}{n}$ : $\int_0^1|f_n| = \frac{1}{n^2}$.
## Indice
$\sum\frac{(-1)^{n+1}}{n^2} = \sum\frac{1}{n^2} - 2\sum\frac{1}{(2n)^2}$.
## Étape · 1
Sur $]0, 1]$, $\frac{\ln(1+t)}{t} = \sum_{n \ge 1} f_n(t)$, somme continue (prolongeable par $1$ en $0$), et $\sum\int_0^1|f_n| = \sum\frac{1}{n^2} < +\infty$ : on peut intégrer terme à terme.
## Étape · 1
$\int_0^1\frac{\ln(1+t)}{t}dt = \sum\frac{(-1)^{n+1}}{n^2} = \frac{\pi^2}{6} - \frac12\cdot\frac{\pi^2}{6} = \frac{\pi^2}{12} \approx 0{,}8225$.
## Réponse
num 0.8225 ± 0.001

# m1 · moyen · 25 · Une intégrale de physique statistique
Montrer que $\int_0^{+\infty}\frac{t^2}{e^t - 1}\,dt = 2\zeta(3)$, où $\zeta(3) = \sum_{n \ge 1}\frac{1}{n^3} \approx 1{,}2021$. Donner une valeur approchée.
## Indice
Pour $t > 0$, $\frac{1}{e^t - 1} = \frac{e^{-t}}{1 - e^{-t}} = \sum_{n \ge 1}e^{-nt}$.
## Indice
$\int_0^{+\infty}t^2e^{-nt}\,dt = \frac{2}{n^3}$ (changement de variable $u = nt$ et $\Gamma(3) = 2$).
## Indice
Les fonctions $t^2e^{-nt}$ sont positives : il suffit que la série de leurs intégrales converge.
## Étape · 1
Pour $t > 0$ : $\frac{t^2}{e^t - 1} = \sum_{n \ge 1}t^2e^{-nt}$, série de fonctions positives et intégrables sur $]0, +\infty[$.
## Étape · 1
Avec $u = nt$ : $\int_0^{+\infty}t^2e^{-nt}\,dt = \frac{1}{n^3}\int_0^{+\infty}u^2e^{-u}\,du = \frac{\Gamma(3)}{n^3} = \frac{2}{n^3}$.
## Étape · 1
La série $\sum\frac{2}{n^3}$ converge : par intégration terme à terme, l'intégrale vaut $2\zeta(3) \approx 2{,}4041$. Elle apparaît dans la loi de Planck du rayonnement du corps noir.
## Réponse
num 2.4041 ± 0.001

# m2 · moyen · 35 · La transformée de Fourier de la gaussienne
Pour $x \in \mathbb{R}$, on pose $F(x) = \int_0^{+\infty}e^{-t^2}\cos(xt)\,dt$. On admet que $\int_0^{+\infty}e^{-t^2}\,dt = \frac{\sqrt\pi}{2}$.

1. Montrer que $F$ est définie et de classe $C^1$ sur $\mathbb{R}$, et écrire $F'(x)$.
2. Par une intégration par parties, montrer que $F'(x) = -\frac x2F(x)$.
3. En déduire $F(x)$, puis donner $F(2)$.
## Indice
$|e^{-t^2}\cos(xt)| \le e^{-t^2}$ et $\left|\frac{\partial}{\partial x}e^{-t^2}\cos(xt)\right| = |te^{-t^2}\sin(xt)| \le te^{-t^2}$, deux fonctions intégrables sur $\mathbb{R}_+$.
## Indice
Dans $F'(x) = -\int_0^{+\infty}te^{-t^2}\sin(xt)\,dt$, intégrer $-te^{-t^2}$ en $\frac12e^{-t^2}$ et dériver $\sin(xt)$.
## Indice
$F$ est solution de $y' = -\frac x2 y$ : $F(x) = F(0)e^{-x^2/4}$.
## Étape · 1
Pour tout $x$, $t \mapsto e^{-t^2}\cos(xt)$ est intégrable (dominée par $e^{-t^2}$). La dérivée partielle est dominée par $te^{-t^2}$, intégrable, indépendamment de $x$ : $F$ est $C^1$ et $F'(x) = -\int_0^{+\infty}te^{-t^2}\sin(xt)\,dt$.
## Étape · 2
Par parties : $F'(x) = \left[\frac12e^{-t^2}\sin(xt)\right]_0^{+\infty} - \frac x2\int_0^{+\infty}e^{-t^2}\cos(xt)\,dt = -\frac x2F(x)$, le crochet étant nul.
## Étape · 1
L'équation linéaire $y' = -\frac x2y$ a pour solutions $Ce^{-x^2/4}$ ; avec $F(0) = \frac{\sqrt\pi}{2}$ : $F(x) = \frac{\sqrt\pi}{2}e^{-x^2/4}$, et $F(2) = \frac{\sqrt\pi}{2}e^{-1} \approx 0{,}3260$.
## Réponse
num 0.3260 ± 0.001

# c1 · complexe · 90 · L'intégrale de Dirichlet par un paramètre
Pour $x \ge 0$, on pose $F(x) = \int_0^{+\infty}e^{-xt}\frac{\sin t}{t}\,dt$ (on sait que l'intégrale converge pour $x = 0$, cours Intégrales généralisées).

1. Montrer que $F$ est définie sur $[0, +\infty[$, et que $|F(x)| \le \frac1x$ pour $x > 0$.
2. Montrer que $F$ est de classe $C^1$ sur $]0, +\infty[$ et que $F'(x) = -\frac{1}{1 + x^2}$.
3. En déduire $F(x) = \frac\pi2 - \operatorname{Arctan} x$ pour $x > 0$.
4. Pour $A > 0$ et $x \ge 0$, montrer que $\left|\int_A^{+\infty}e^{-xt}\frac{\sin t}{t}\,dt\right| \le \frac2A$.
5. En déduire que $F$ est continue en $0$, puis que $\int_0^{+\infty}\frac{\sin t}{t}\,dt = \frac\pi2$. Donner $F(1)$.
## Indice
Pour 1 : $\left|e^{-xt}\frac{\sin t}{t}\right| \le e^{-xt}$ car $|\sin t| \le t$. Pour 2 : domination sur $[a, +\infty[$ ($a > 0$) de $|e^{-xt}\sin t|$ par $e^{-at}$ ; puis $\int_0^{+\infty}e^{-xt}\sin t\,dt = \operatorname{Im}\int_0^{+\infty}e^{(-x+i)t}dt$.
## Indice
Pour 4 : $g(t) = \frac{e^{-xt}}{t}$ est positive décroissante ; intégrer par parties $\int_A^B \sin t\,g(t)\,dt$ et majorer, en utilisant $\int_A^B|g'| = g(A) - g(B)$.
## Indice
Pour 5 : couper $F(x) - F(0)$ en $\int_0^A$ et $\int_A^{+\infty}$ ; sur $[0, A]$, $\left|(e^{-xt} - 1)\frac{\sin t}{t}\right| \le 1 - e^{-xt} \le xt$.
## Étape · 1
Pour $x > 0$ : $\left|e^{-xt}\frac{\sin t}{t}\right| \le e^{-xt}$, intégrable sur $]0, +\infty[$, et $|F(x)| \le \int_0^{+\infty}e^{-xt}dt = \frac1x$. Pour $x = 0$, c'est l'intégrale de Dirichlet, convergente.
## Étape · 2
Sur $[a, +\infty[$ : $\left|\frac{\partial}{\partial x}e^{-xt}\frac{\sin t}{t}\right| = |e^{-xt}\sin t| \le e^{-at}$, intégrable ; $F$ est $C^1$ sur chaque $[a, +\infty[$, donc sur $]0, +\infty[$, et $F'(x) = -\int_0^{+\infty}e^{-xt}\sin t\,dt = -\operatorname{Im}\frac{1}{x - i} = -\frac{1}{1 + x^2}$.
## Étape · 1
Donc $F(x) = C - \operatorname{Arctan} x$ sur $]0, +\infty[$. Comme $F(x) \to 0$ en $+\infty$ (question 1), $C = \frac\pi2$.
## Étape · 2
Pour $B > A$ : $\int_A^B\sin t\,g(t)\,dt = \big[-\cos t\,g(t)\big]_A^B + \int_A^B\cos t\,g'(t)\,dt$, de module au plus $g(A) + g(B) + \int_A^B|g'(t)|\,dt = 2g(A) \le \frac2A$. On fait tendre $B$ vers $+\infty$.
## Étape · 2
Pour $x > 0$ : $|F(x) - F(0)| \le \int_0^A xt\,dt + \frac2A + \frac2A = \frac{xA^2}{2} + \frac4A$. Étant donné $\varepsilon > 0$, on choisit $A = \frac8\varepsilon$, puis $x$ assez petit pour que $\frac{xA^2}{2} \le \frac\varepsilon2$ : $F$ est continue en $0$, et $F(0) = \lim_{x \to 0^+}\left(\frac\pi2 - \operatorname{Arctan}x\right) = \frac\pi2$.
## Étape · 1
$F(1) = \frac\pi2 - \frac\pi4 = \frac\pi4 \approx 0{,}7854$.
## Réponse
num 0.7854 ± 0.001
