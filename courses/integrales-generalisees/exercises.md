# s1 · simple · 10 · Une exponentielle sur ℝ₊
Montrer que $\int_0^{+\infty}e^{-2t}\,dt$ converge et calculer sa valeur.
## Indice
Calculer $\int_0^x e^{-2t}\,dt$ pour $x > 0$, puis faire tendre $x$ vers $+\infty$.
## Indice
Une primitive de $e^{-2t}$ est $-\frac12 e^{-2t}$.
## Indice
$e^{-2x} \to 0$ quand $x \to +\infty$.
## Étape · 1
$\int_0^x e^{-2t}\,dt = \frac{1 - e^{-2x}}{2}$.
## Étape · 1
Cette quantité tend vers $\frac12$ : l'intégrale converge et vaut $\frac12$.
## Réponse
num 0.5 ± 0.001

# s2 · simple · 15 · Logarithme sur t²
Montrer que $\int_1^{+\infty}\frac{\ln t}{t^2}\,dt$ converge, puis la calculer par parties.
## Indice
Comparer à une intégrale de Riemann : $\ln t = o(\sqrt t)$ en $+\infty$.
## Indice
$\frac{\ln t}{t^2} = o\left(\frac{1}{t^{3/2}}\right)$, et $\frac32 > 1$.
## Indice
Par parties sur $[1, x]$ avec $u' = \frac{1}{t^2}$, $v = \ln t$.
## Étape · 1
La fonction est positive sur $[1, +\infty[$ et $\frac{\ln t}{t^2} = o\left(t^{-3/2}\right)$ : par comparaison avec une intégrale de Riemann convergente, l'intégrale converge.
## Étape · 1
$\int_1^x\frac{\ln t}{t^2}\,dt = \left[-\frac{\ln t}{t}\right]_1^x + \int_1^x\frac{dt}{t^2} = -\frac{\ln x}{x} + 1 - \frac1x \to 1$.
## Réponse
num 1 ± 0.001

# m1 · moyen · 30 · La fonction Γ prolonge la factorielle
Pour $x > 0$, on pose $\Gamma(x) = \int_0^{+\infty}t^{x-1}e^{-t}\,dt$.

1. Montrer que l'intégrale converge pour tout $x > 0$, et diverge pour $x \le 0$.
2. Montrer que $\Gamma(x + 1) = x\,\Gamma(x)$ pour $x > 0$.
3. En déduire $\Gamma(n + 1)$ pour $n \in \mathbb{N}$, et donner $\Gamma(5)$.
## Indice
Étudier séparément les bornes $0$ et $+\infty$ ; en $0$, $t^{x-1}e^{-t} \sim t^{x-1}$.
## Indice
En $+\infty$, $t^{x-1}e^{-t} = o\left(\frac{1}{t^2}\right)$ par croissances comparées.
## Indice
Pour 2 : par parties sur $[\varepsilon, X]$ avec $u = t^x$ et $v' = e^{-t}$, puis $\varepsilon \to 0$ et $X \to +\infty$.
## Étape · 2
L'intégrande est positif. En $0$ : $t^{x-1}e^{-t} \sim t^{x-1} = \frac{1}{t^{1-x}}$, intégrable sur $]0, 1]$ si et seulement si $1 - x < 1$, c'est-à-dire $x > 0$. En $+\infty$ : $t^{x+1}e^{-t} \to 0$, donc $t^{x-1}e^{-t} = o(t^{-2})$, intégrable. Pour $x \le 0$, l'intégrale diverge en $0$.
## Étape · 2
Sur $[\varepsilon, X]$ : $\int_\varepsilon^X t^x e^{-t}\,dt = \big[-t^xe^{-t}\big]_\varepsilon^X + x\int_\varepsilon^X t^{x-1}e^{-t}\,dt$. Le crochet tend vers $0$ (car $x > 0$), d'où $\Gamma(x + 1) = x\,\Gamma(x)$.
## Étape · 1
$\Gamma(1) = \int_0^{+\infty}e^{-t}\,dt = 1$, puis par récurrence $\Gamma(n + 1) = n!$. Donc $\Gamma(5) = 4! = 24$.
## Réponse
num 24 ± 0.001

# m2 · moyen · 30 · Une intégrale nulle par symétrie
1. Montrer que $\int_0^{+\infty}\frac{dt}{1 + t^2}$ converge et vaut $\frac\pi2$.
2. Montrer que $I = \int_0^{+\infty}\frac{\ln t}{1 + t^2}\,dt$ converge.
3. Par le changement de variable $t = \frac1u$, montrer que $I = 0$.
## Indice
Pour 1 : une primitive est Arctan. Pour 2 : en $0$, $\frac{\ln t}{1 + t^2} \sim \ln t$ ; en $+\infty$, $\frac{\ln t}{1 + t^2} = o(t^{-3/2})$.
## Indice
$|\ln t|$ est intégrable sur $]0, 1]$ : $\int_\varepsilon^1 \ln t\,dt = -1 - \varepsilon\ln\varepsilon + \varepsilon$.
## Indice
Couper en $1$ ; le changement de variable $t = \frac1u$ envoie $[1, +\infty[$ sur $]0, 1]$, avec $dt = -\frac{du}{u^2}$.
## Étape · 1
$\int_0^x\frac{dt}{1 + t^2} = \operatorname{Arctan} x \to \frac\pi2$.
## Étape · 1
En $0$ : $\left|\frac{\ln t}{1 + t^2}\right| \le |\ln t|$, intégrable sur $]0, 1]$. En $+\infty$ : $\frac{\ln t}{1 + t^2} = o(t^{-3/2})$. L'intégrande est intégrable sur $]0, +\infty[$ : $I$ converge.
## Étape · 2
Avec $t = \frac1u$ (bijection $C^1$ strictement décroissante de $]0, 1]$ sur $[1, +\infty[$) : $\int_1^{+\infty}\frac{\ln t}{1 + t^2}\,dt = \int_0^1\frac{-\ln u}{1 + 1/u^2}\cdot\frac{du}{u^2} = -\int_0^1\frac{\ln u}{1 + u^2}\,du$. Donc $I = \int_0^1\frac{\ln t}{1 + t^2}\,dt - \int_0^1\frac{\ln u}{1 + u^2}\,du = 0$.
## Réponse
num 0 ± 0.001

# c1 · complexe · 75 · L'intégrale de Dirichlet
Soit $f(t) = \frac{\sin t}{t}$ pour $t > 0$.

1. Montrer que $f$ se prolonge par continuité en $0$.
2. Par une intégration par parties sur $[1, x]$, montrer que $\int_1^{+\infty}f$ converge. En déduire que $\int_0^{+\infty}f$ converge.
3. Montrer que $|\sin t| \ge \sin^2 t = \frac{1 - \cos(2t)}{2}$, puis que $\int_1^{+\infty}\frac{\cos(2t)}{t}\,dt$ converge.
4. En déduire que $f$ n'est pas intégrable sur $]0, +\infty[$.
5. On admet que $\int_0^{+\infty}\frac{\sin t}{t}\,dt = \frac\pi2$ (calcul par une intégrale à paramètre). Donner une valeur approchée.
## Indice
Pour 1 : $\sin t \sim t$ en $0$. Pour 2 : $u' = \sin t$, $u = -\cos t$, $v = \frac1t$.
## Indice
Après intégration par parties, il reste $\int_1^x\frac{\cos t}{t^2}\,dt$, absolument convergente.
## Indice
Pour 4 : si $\int_1^{+\infty}\frac{|\sin t|}{t}$ convergeait, celle de $\frac{1 - \cos 2t}{2t}$ aussi, donc celle de $\frac{1}{2t}$ (différence de deux intégrales convergentes).
## Étape · 1
$\frac{\sin t}{t} \to 1$ en $0$ : $f$ se prolonge par continuité, et $\int_0^1 f$ est une intégrale usuelle.
## Étape · 2
$\int_1^x\frac{\sin t}{t}\,dt = \left[-\frac{\cos t}{t}\right]_1^x - \int_1^x\frac{\cos t}{t^2}\,dt$. Le crochet tend vers $\cos 1$, et $\left|\frac{\cos t}{t^2}\right| \le \frac{1}{t^2}$ est intégrable sur $[1, +\infty[$. Donc $\int_1^{+\infty} f$ converge, et $\int_0^{+\infty} f = \int_0^1 f + \int_1^{+\infty} f$ aussi.
## Étape · 1
$0 \le |\sin t| \le 1$ donne $\sin^2 t \le |\sin t|$, et $\sin^2 t = \frac{1 - \cos(2t)}{2}$. La même intégration par parties qu'en 2 montre que $\int_1^{+\infty}\frac{\cos(2t)}{t}\,dt$ converge.
## Étape · 2
Si $\int_1^{+\infty}\frac{|\sin t|}{t}\,dt$ convergeait, la comparaison donnerait la convergence de $\int_1^{+\infty}\frac{1 - \cos(2t)}{2t}\,dt$, puis, en ajoutant $\int_1^{+\infty}\frac{\cos(2t)}{2t}\,dt$ (convergente), celle de $\int_1^{+\infty}\frac{dt}{2t}$, qui diverge. Contradiction : $f$ n'est pas intégrable.
## Étape · 1
$\frac\pi2 \approx 1{,}5708$. L'intégrale converge « grâce aux signes », comme la série harmonique alternée.
## Réponse
num 1.5708 ± 0.001
