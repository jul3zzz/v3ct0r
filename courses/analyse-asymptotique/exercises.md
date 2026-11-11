# s1 · simple · 10 · Une limite par développement limité
Calculer $\displaystyle\lim_{x \to 0} \frac{e^x - 1 - x}{x^2}$.
## Indice
Forme $\frac00$ : développer le numérateur en $0$.
## Indice
Les termes $1$ et $x$ se simplifient : à quel ordre faut-il développer $e^x$ ?
## Indice
$e^x = 1 + x + \frac{x^2}{2} + o(x^2)$.
## Étape · 1
$e^x - 1 - x = \frac{x^2}{2} + o(x^2)$, donc $e^x - 1 - x \sim \frac{x^2}{2}$ en $0$.
## Étape · 1
Le quotient est équivalent à $\frac12$ : la limite vaut $\frac12$.
## Réponse
num 0.5 ± 0.001

# s2 · simple · 15 · Un produit de développements
Donner le développement limité à l'ordre $3$ en $0$ de $f(x) = e^x\sin x$. Quel est le coefficient de $x^3$ ?
## Indice
$\sin x = x - \frac{x^3}{6} + o(x^3)$ commence par $x$ : à quel ordre suffit-il de développer $e^x$ ?
## Indice
Ordre $2$ : $e^x = 1 + x + \frac{x^2}{2} + o(x^2)$. Multiplier et ne garder que les termes de degré au plus $3$.
## Indice
Le terme en $x^3$ vient de $\frac{x^2}{2} \cdot x$ et de $1 \cdot \left(-\frac{x^3}{6}\right)$.
## Étape · 1
$f(x) = \left(1 + x + \frac{x^2}{2} + o(x^2)\right)\left(x - \frac{x^3}{6} + o(x^3)\right)$, et les produits de termes donnent $x + x^2 + \frac{x^3}{2} - \frac{x^3}{6} + o(x^3)$.
## Étape · 1
$f(x) = x + x^2 + \frac{x^3}{3} + o(x^3)$ : le coefficient de $x^3$ est $\frac13$. Contrôle : par Taylor-Young, $f'''(0) = 2$, et $\frac{2}{3!} = \frac13$.
## Réponse
num 0.3333 ± 0.001

# m1 · moyen · 25 · Une différence de deux infinis
Calculer $\displaystyle\lim_{x \to 0}\left(\frac{1}{\sin^2 x} - \frac{1}{x^2}\right)$.
## Indice
Réduire au même dénominateur : $\frac{x^2 - \sin^2 x}{x^2\sin^2 x}$. Le dénominateur est équivalent à $x^4$.
## Indice
Il faut donc le numérateur à l'ordre $4$ : $\sin x = x - \frac{x^3}{6} + o(x^3)$, donc $\sin^2 x = x^2 - \frac{x^4}{3} + o(x^4)$.
## Indice
Autre voie : $\frac{1}{\sin^2 x} = \frac{1}{x^2}\left(1 - \frac{x^2}{6} + o(x^2)\right)^{-2}$.
## Étape · 1
$\sin^2 x = \left(x - \frac{x^3}{6} + o(x^3)\right)^2 = x^2 - \frac{x^4}{3} + o(x^4)$, donc $x^2 - \sin^2 x = \frac{x^4}{3} + o(x^4)$.
## Étape · 1
Le dénominateur $x^2\sin^2 x \sim x^4$. Le quotient est équivalent à $\frac{x^4/3}{x^4} = \frac13$.
## Étape · 1
La limite vaut $\frac13$. On a même obtenu $\frac{1}{\sin^2 x} = \frac{1}{x^2} + \frac13 + o(1)$.
## Réponse
num 0.3333 ± 0.001

# m2 · moyen · 30 · Asymptote d'une racine carrée
Soit $f(x) = \sqrt{x^2 + x + 1}$. Montrer que le graphe de $f$ a une asymptote en $+\infty$, en donner une équation $y = ax + b$ et préciser la position du graphe. Donner $b$.
## Indice
Factoriser par le terme prépondérant : $f(x) = x\sqrt{1 + u}$ avec $u = \frac1x + \frac1{x^2}$ pour $x > 0$.
## Indice
$\sqrt{1 + u} = 1 + \frac u2 - \frac{u^2}{8} + o(u^2)$, et $u^2 = \frac{1}{x^2} + o\left(\frac1{x^2}\right)$.
## Indice
On trouve $f(x) = x + \frac12 + \frac{c}{x} + o\left(\frac1x\right)$ : calculer $c$ et regarder son signe.
## Étape · 2
Pour $x > 0$ : $\sqrt{1 + u} = 1 + \frac{1}{2x} + \frac{1}{2x^2} - \frac{1}{8x^2} + o\left(\frac1{x^2}\right) = 1 + \frac{1}{2x} + \frac{3}{8x^2} + o\left(\frac1{x^2}\right)$.
## Étape · 1
En multipliant par $x$ : $f(x) = x + \frac12 + \frac{3}{8x} + o\left(\frac1x\right)$. Donc $f(x) - \left(x + \frac12\right) \to 0$ : la droite $y = x + \frac12$ est asymptote.
## Étape · 1
$f(x) - \left(x + \frac12\right) \sim \frac{3}{8x} > 0$ : le graphe est au-dessus de l'asymptote au voisinage de $+\infty$. Ici $b = \frac12$.
## Réponse
num 0.5 ± 0.001

# m3 · moyen · 25 · Quand l'ordre 2 ne suffit pas
Soit $f(x) = \cos x + \frac{x^2}{2}$. Calculer $f'(0)$ et $f''(0)$, puis déterminer la nature du point $0$.
## Indice
$f'(x) = -\sin x + x$ et $f''(x) = -\cos x + 1$ : que valent-elles en $0$ ?
## Indice
Les conditions à l'ordre $2$ ne concluent pas : pousser le développement limité de $\cos$.
## Indice
$\cos x = 1 - \frac{x^2}{2} + \frac{x^4}{24} + o(x^4)$.
## Étape · 1
$f'(0) = 0$ et $f''(0) = 0$ : $0$ est un point critique, et le critère d'ordre $2$ ne permet pas de conclure.
## Étape · 1
$f(x) = 1 + \frac{x^4}{24} + o(x^4)$, donc $f(x) - f(0) \sim \frac{x^4}{24} > 0$ pour $x \neq 0$ voisin de $0$.
## Étape · 1
$f$ a un minimum local strict en $0$. (C'est même un minimum global : $f'(x) = x - \sin x$ a le signe de $x$.)
## Réponse
qcm A
- un minimum local strict
- un maximum local strict
- ni un minimum ni un maximum local

# c1 · complexe · 75 · Les solutions de tan x = x
Pour $n \ge 1$, on note $I_n = \left]n\pi - \frac\pi2, n\pi + \frac\pi2\right[$.

1. Montrer que l'équation $\tan x = x$ a une unique solution $x_n$ dans $I_n$, et que $x_n \in \left]n\pi, n\pi + \frac\pi2\right[$.
2. En déduire $x_n \sim n\pi$.
3. On pose $\varepsilon_n = n\pi + \frac\pi2 - x_n$. Montrer que $\tan \varepsilon_n = \frac{1}{x_n}$, puis que $\varepsilon_n \to 0$ et $\varepsilon_n \sim \frac{1}{n\pi}$.
4. En déduire le développement $x_n = n\pi + \frac\pi2 - \frac{c}{n} + o\left(\frac1n\right)$ et donner $c$.
## Indice
Pour 1 : étudier $g(x) = \tan x - x$ sur $I_n$ ; $g'(x) = \tan^2 x \ge 0$, nulle seulement en $n\pi$. Limites aux bornes de $I_n$. Pour la position : le signe de $\tan x$ et de $x$.
## Indice
Pour 3 : $\tan\left(\frac\pi2 - \varepsilon\right) = \frac{1}{\tan\varepsilon}$, et $\varepsilon_n \in\, ]0, \frac\pi2[$. Comme $x_n \to +\infty$, $\tan\varepsilon_n \to 0$.
## Indice
$\varepsilon_n = \operatorname{Arctan}\frac{1}{x_n} \sim \frac{1}{x_n} \sim \frac{1}{n\pi}$ (Arctan $u \sim u$ en $0$).
## Étape · 2
Sur $I_n$, $g(x) = \tan x - x$ est continue, de dérivée $\tan^2 x \ge 0$ qui ne s'annule qu'en $n\pi$ : $g$ est strictement croissante, et tend vers $-\infty$ et $+\infty$ aux bornes. C'est une bijection de $I_n$ sur $\mathbb{R}$ : $g$ s'annule une seule fois, en $x_n$. Comme $x_n > 0$ (car $n\pi - \frac\pi2 \ge \frac\pi2$), $\tan x_n = x_n > 0$, ce qui place $x_n$ dans $\left]n\pi, n\pi + \frac\pi2\right[$.
## Étape · 1
$n\pi < x_n < n\pi + \frac\pi2$, donc $1 < \frac{x_n}{n\pi} < 1 + \frac{1}{2n}$, et $x_n \sim n\pi$ par encadrement.
## Étape · 2
$\varepsilon_n \in\, ]0, \frac\pi2[$ et $x_n = \frac\pi2 + n\pi - \varepsilon_n$, donc, par $\pi$-périodicité, $\tan x_n = \tan\left(\frac\pi2 - \varepsilon_n\right) = \frac{1}{\tan\varepsilon_n}$. L'équation donne $\tan\varepsilon_n = \frac{1}{x_n} \to 0$, donc $\varepsilon_n = \operatorname{Arctan}\frac{1}{x_n} \to 0$.
## Étape · 2
$\varepsilon_n = \operatorname{Arctan}\frac1{x_n} \sim \frac{1}{x_n} \sim \frac{1}{n\pi}$, c'est-à-dire $\varepsilon_n = \frac{1}{n\pi} + o\left(\frac1n\right)$. Donc $x_n = n\pi + \frac\pi2 - \frac{1}{n\pi} + o\left(\frac1n\right)$ : $c = \frac1\pi \approx 0{,}3183$.
## Étape · 1
Contrôle numérique : pour $n = 10$, la formule donne $x_{10} \approx 32{,}9867 - 0{,}0318 = 32{,}9549$, et la solution, calculée par dichotomie, vaut $x_{10} \approx 32{,}9564$ ; l'écart, environ $1{,}5 \cdot 10^{-3}$, est de l'ordre de $\frac{1}{2\pi n^2}$, le terme suivant du développement.
## Réponse
num 0.3183 ± 0.001
