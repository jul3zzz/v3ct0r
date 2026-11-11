# s1 · simple · 10 · Arctan x + Arctan 1/x
Montrer que $g(x) = \operatorname{Arctan} x + \operatorname{Arctan}\frac1x$ est constante sur $]0, +\infty[$ et donner sa valeur. Que vaut-elle sur $]-\infty, 0[$ ?
## Indice
Calculer $g'(x)$ par la dérivée d'une composée.
## Indice
$\left(\operatorname{Arctan}\frac1x\right)' = -\frac{1}{x^2}\cdot\frac{1}{1 + 1/x^2}$. Sur un **intervalle**, une dérivée nulle donne une constante.
## Indice
Évaluer en $x = 1$, puis en $x = -1$ pour l'autre intervalle.
## Étape · 1
$g'(x) = \frac{1}{1 + x^2} - \frac{1}{x^2}\cdot\frac{x^2}{x^2 + 1} = 0$ sur $]0, +\infty[$, qui est un intervalle : $g$ y est constante.
## Étape · 1
$g(1) = 2\operatorname{Arctan} 1 = \frac\pi2$. Sur $]-\infty, 0[$ (autre intervalle), $g$ est aussi constante, égale à $g(-1) = -\frac\pi2$ : $g$ n'est pas constante sur $\mathbb{R}^*$.
## Réponse
num 1.5708 ± 0.001

# m1 · moyen · 25 · Une intégrale par l'exponentielle complexe
Calculer $I = \int_0^\pi e^x\cos x\,dx$ de deux façons : par deux intégrations par parties, puis en écrivant $e^x\cos x = \operatorname{Re}\big(e^{(1+i)x}\big)$. Donner une valeur approchée de $I$.
## Indice
Première méthode : intégrer deux fois par parties en dérivant toujours $\cos$ puis $\sin$ ; on retombe sur $I$.
## Indice
Deuxième méthode : une primitive de $e^{(1+i)x}$ est $\frac{e^{(1+i)x}}{1 + i}$, et $\frac{1}{1 + i} = \frac{1 - i}{2}$.
## Indice
$e^{(1+i)\pi} = e^\pi e^{i\pi} = -e^\pi$.
## Étape · 2
Par parties ($u' = e^x$, $v = \cos x$) : $I = \big[e^x\cos x\big]_0^\pi + \int_0^\pi e^x\sin x\,dx = -e^\pi - 1 + \big[e^x \sin x\big]_0^\pi - I$, soit $2I = -e^\pi - 1$.
## Étape · 1
Avec l'exponentielle complexe : $\int_0^\pi e^{(1+i)x}\,dx = \frac{1 - i}{2}\big(e^{(1+i)\pi} - 1\big) = \frac{1 - i}{2}(-e^\pi - 1)$, de partie réelle $-\frac{e^\pi + 1}{2}$.
## Étape · 1
$I = -\frac{e^\pi + 1}{2} \approx -12{,}07$. La partie imaginaire donne en prime $\int_0^\pi e^x\sin x\,dx = \frac{e^\pi + 1}{2}$.
## Réponse
num -12.07 ± 0.01

# c1 · complexe · 60 · Les intégrales de Wallis
Pour $n \in \mathbb{N}$, on pose $W_n = \int_0^{\pi/2}\sin^n t\,dt$.

1. Calculer $W_0$ et $W_1$, et montrer que la suite $(W_n)$ est strictement positive et décroissante.
2. Par une intégration par parties, montrer que $(n + 2)W_{n+2} = (n + 1)W_n$.
3. En déduire que $(n + 1)W_{n+1}W_n = \frac\pi2$ pour tout $n$.
4. Montrer que $W_{n+1} \sim W_n$, puis que $W_n \sim \sqrt{\frac{\pi}{2n}}$.
5. Calculer $W_4$.
## Indice
Pour 1 : sur $[0, \frac\pi2]$, $0 \le \sin t \le 1$, donc $\sin^{n+1} t \le \sin^n t$ ; la positivité stricte vient de la continuité et de la positivité de l'intégrande, non identiquement nul.
## Indice
Pour 2 : écrire $\sin^{n+2} t = \sin^{n+1} t \cdot \sin t$, intégrer $\sin t$ en $-\cos t$, puis utiliser $\cos^2 = 1 - \sin^2$. Pour 3 : montrer que $u_n = (n + 1)W_{n+1}W_n$ est constante.
## Indice
Pour 4 : encadrer $W_{n+2} \le W_{n+1} \le W_n$ et diviser par $W_n$ ; puis $W_n^2 \sim W_n W_{n+1}$.
## Étape · 1
$W_0 = \frac\pi2$ et $W_1 = \big[-\cos t\big]_0^{\pi/2} = 1$. Comme $0 \le \sin t \le 1$, $\sin^{n+1} t \le \sin^n t$, donc $W_{n+1} \le W_n$ ; et $W_n > 0$, intégrale d'une fonction continue positive non nulle sur un segment.
## Étape · 2
Par parties avec $u = \sin^{n+1}$ et $v' = \sin$ : $W_{n+2} = \big[-\cos t\,\sin^{n+1} t\big]_0^{\pi/2} + (n + 1)\int_0^{\pi/2}\sin^n t\cos^2 t\,dt = (n + 1)(W_n - W_{n+2})$, d'où $(n + 2)W_{n+2} = (n + 1)W_n$.
## Étape · 1
$u_{n+1} = (n + 2)W_{n+2}W_{n+1} = (n + 1)W_nW_{n+1} = u_n$ : la suite est constante, égale à $u_0 = W_1W_0 = \frac\pi2$.
## Étape · 2
De $W_{n+2} \le W_{n+1} \le W_n$ : $\frac{n+1}{n+2} = \frac{W_{n+2}}{W_n} \le \frac{W_{n+1}}{W_n} \le 1$, donc $\frac{W_{n+1}}{W_n} \to 1$ par encadrement. Alors $W_n^2 \sim W_nW_{n+1} = \frac{\pi}{2(n+1)} \sim \frac{\pi}{2n}$, et, $W_n$ étant positif, $W_n \sim \sqrt{\frac{\pi}{2n}}$.
## Étape · 1
$W_2 = \frac12 W_0 = \frac\pi4$ et $W_4 = \frac34 W_2 = \frac{3\pi}{16} \approx 0{,}589$. Contrôle : $\sqrt{\pi/8} \approx 0{,}627$, du même ordre, et l'équivalent s'améliore quand $n$ grandit.
## Réponse
num 0.589 ± 0.001
