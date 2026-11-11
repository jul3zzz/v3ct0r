# s1 · simple · 10 · Une somme double géométrique
Montrer que la famille $\left(\frac{1}{2^{p+q}}\right)_{(p,q) \in \mathbb{N}^2}$ est sommable et calculer sa somme.
## Indice
La famille est positive : on peut sommer par paquets sans justification préalable.
## Indice
Sommer d'abord en $q$ à $p$ fixé (théorème de Fubini positif).
## Indice
$\sum_{q=0}^{+\infty}\frac{1}{2^q} = 2$.
## Étape · 1
Famille positive : par Fubini positif, $\sum_{(p,q)}\frac{1}{2^{p+q}} = \sum_{p}\frac{1}{2^p}\sum_q \frac{1}{2^q} = \sum_p \frac{2}{2^p}$.
## Étape · 1
$= 2 \times 2 = 4 < +\infty$ : la famille est sommable, de somme $4$. (C'est aussi le produit de deux familles sommables.)
## Réponse
num 4 ± 0.001

# m1 · moyen · 30 · La somme des ζ(n) − 1
On note $\zeta(n) = \sum_{k=1}^{+\infty}\frac{1}{k^n}$ pour $n \ge 2$. Montrer que $\sum_{n=2}^{+\infty}\big(\zeta(n) - 1\big) = 1$.
## Indice
$\zeta(n) - 1 = \sum_{k \ge 2}\frac{1}{k^n}$ : c'est une somme double de termes positifs $u_{n,k} = \frac{1}{k^n}$, $n \ge 2$, $k \ge 2$.
## Indice
Échanger l'ordre de sommation (Fubini positif) et sommer d'abord en $n$, à $k$ fixé : série géométrique de raison $\frac1k$.
## Indice
$\frac{1}{k(k-1)} = \frac{1}{k-1} - \frac1k$ : télescopage.
## Étape · 1
La famille $\left(\frac{1}{k^n}\right)_{n \ge 2,\, k \ge 2}$ est positive ; par Fubini positif, $\sum_{n \ge 2}\big(\zeta(n) - 1\big) = \sum_{n \ge 2}\sum_{k \ge 2}\frac{1}{k^n} = \sum_{k \ge 2}\sum_{n \ge 2}\frac{1}{k^n}$.
## Étape · 2
À $k \ge 2$ fixé : $\sum_{n \ge 2}\frac{1}{k^n} = \frac{1/k^2}{1 - 1/k} = \frac{1}{k(k - 1)}$.
## Étape · 1
$\sum_{k \ge 2}\frac{1}{k(k-1)} = \sum_{k \ge 2}\left(\frac{1}{k-1} - \frac1k\right) = 1$ par télescopage. Le calcul montre en même temps que la famille est sommable.
## Réponse
num 1 ± 0.001

# c1 · complexe · 60 · Sommabilité de 1/(p + q)^α
Soit $\alpha > 0$ et $u_{p,q} = \frac{1}{(p + q)^\alpha}$ pour $(p, q) \in (\mathbb{N}^*)^2$.

1. Pour $n \ge 2$, combien y a-t-il de couples $(p, q) \in (\mathbb{N}^*)^2$ tels que $p + q = n$ ?
2. En sommant par paquets selon $p + q = n$, montrer que $\sum_{(p,q)} u_{p,q} = \sum_{n \ge 2}\frac{n - 1}{n^\alpha}$.
3. En déduire que la famille est sommable si et seulement si $\alpha > 2$.
4. Pour $\alpha = 3$, exprimer la somme à l'aide de $\zeta(2)$ et $\zeta(3)$, puis en donner une valeur approchée ($\zeta(2) = \frac{\pi^2}{6}$, $\zeta(3) \approx 1{,}2021$).
## Indice
Pour 1 : $p$ varie de $1$ à $n - 1$, et $q = n - p$ est alors déterminé.
## Indice
Pour 2 : la famille est positive, la sommation par paquets s'applique dans $[0, +\infty]$ sans hypothèse. Pour 3 : $\frac{n-1}{n^\alpha} \sim \frac{1}{n^{\alpha - 1}}$, et les séries de Riemann.
## Indice
Pour 4 : $\frac{n - 1}{n^3} = \frac{1}{n^2} - \frac{1}{n^3}$, et la somme commence à $n = 2$ (le terme $n = 1$ serait nul).
## Étape · 1
Les couples de somme $n$ sont $(p, n - p)$ pour $1 \le p \le n - 1$ : il y en a $n - 1$.
## Étape · 1
Les parties $I_n = \{(p, q) : p + q = n\}$, $n \ge 2$, forment une partition de $(\mathbb{N}^*)^2$. La famille étant positive, $\sum_{(p,q)} u_{p,q} = \sum_{n \ge 2}\sum_{(p,q) \in I_n}\frac{1}{n^\alpha} = \sum_{n \ge 2}\frac{n - 1}{n^\alpha}$ dans $[0, +\infty]$.
## Étape · 2
$\frac{n - 1}{n^\alpha} \sim \frac{1}{n^{\alpha-1}}$, termes positifs : la série converge si et seulement si $\alpha - 1 > 1$ ([[suites-series#cor-riemann|séries de Riemann]]). La famille est sommable si et seulement si $\alpha > 2$.
## Étape · 1
Pour $\alpha = 3$ : $\sum_{n \ge 2}\left(\frac{1}{n^2} - \frac{1}{n^3}\right) = \big(\zeta(2) - 1\big) - \big(\zeta(3) - 1\big) = \zeta(2) - \zeta(3)$, les deux séries convergeant.
## Étape · 1
$\zeta(2) - \zeta(3) \approx 1{,}6449 - 1{,}2021 = 0{,}4429$.
## Réponse
num 0.4429 ± 0.001
