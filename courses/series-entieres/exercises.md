# s1 · simple · 10 · Un rayon par d'Alembert
Déterminer le rayon de convergence de $\displaystyle\sum_{n \ge 0} \frac{n^2}{3^n}\, z^n$.
## Indice
Les coefficients $a_n = \frac{n^2}{3^n}$ sont non nuls pour $n \ge 1$ : calculer $\left|\frac{a_{n+1}}{a_n}\right|$.
## Indice
$\frac{(n+1)^2}{n^2} \to 1$.
## Indice
$R = \frac{1}{\ell}$ où $\ell$ est la limite du quotient.
## Étape · 1
$\left|\frac{a_{n+1}}{a_n}\right| = \frac{(n+1)^2}{n^2} \cdot \frac{3^n}{3^{n+1}} = \frac13\left(1 + \frac1n\right)^2 \to \frac13$.
## Étape · 1
Par la règle de d'Alembert, $R = 3$. On pouvait aussi remarquer que multiplier les coefficients par $n^2$ ne change pas le rayon, qui est celui de $\sum \frac{z^n}{3^n}$.
## Réponse
num 3 ± 0.001

# s2 · simple · 10 · Une série lacunaire
Déterminer le rayon de convergence de $\displaystyle\sum_{n \ge 0} \frac{z^{2n}}{4^n}$.
## Indice
Les coefficients d'indice impair sont nuls : la règle de d'Alembert ne s'applique pas aux coefficients.
## Indice
Poser $w = z^2$, ou appliquer d'Alembert au terme général $u_n = \frac{z^{2n}}{4^n}$.
## Indice
$\left|\frac{u_{n+1}}{u_n}\right| = \frac{|z|^2}{4}$.
## Étape · 1
Pour $z \neq 0$, $\left|\frac{u_{n+1}}{u_n}\right| = \frac{|z|^2}{4}$ : la série converge si $|z| < 2$ et diverge grossièrement si $|z| > 2$.
## Étape · 1
Le rayon vaut donc $R = 2$ ; c'est cohérent avec la somme $\frac{1}{1 - z^2/4} = \frac{4}{4 - z^2}$, qui a des pôles en $\pm 2$.
## Réponse
num 2 ± 0.001

# s3 · simple · 10 · Dériver la série géométrique
Calculer $\displaystyle\sum_{n \ge 1} \frac{n}{2^n}$.
## Indice
Partir de $\sum_{n \ge 0} x^n = \frac{1}{1 - x}$ pour $|x| < 1$.
## Indice
Dériver terme à terme, puis multiplier par $x$.
## Indice
$\sum_{n \ge 1} n x^n = \frac{x}{(1 - x)^2}$ ; prendre $x = \frac12$.
## Étape · 1
En dérivant terme à terme sur $]-1, 1[$ : $\sum_{n \ge 1} n x^{n-1} = \frac{1}{(1 - x)^2}$, donc $\sum_{n \ge 1} n x^n = \frac{x}{(1 - x)^2}$.
## Étape · 1
Avec $x = \frac12$ : $\sum_{n \ge 1} \frac{n}{2^n} = \frac{1/2}{1/4} = 2$.
## Réponse
num 2 ± 0.001

# m1 · moyen · 30 · Le développement de la racine carrée
1. Par la méthode de l'équation différentielle, montrer que pour $|x| < 1$ :
$$\sqrt{1 + x} = 1 + \sum_{n \ge 1} \frac{\frac12\left(\frac12 - 1\right)\cdots\left(\frac12 - n + 1\right)}{n!}\, x^n.$$
2. Calculer les coefficients de $x$, $x^2$ et $x^3$ (réponse attendue : celui de $x^3$).
3. En déduire une valeur approchée de $\sqrt{1{,}1}$ et majorer l'erreur commise en s'arrêtant au terme en $x^3$.
## Indice
$f(x) = (1 + x)^{1/2}$ vérifie $2(1 + x) f'(x) = f(x)$, $f(0) = 1$.
## Indice
En reportant $\sum a_n x^n$ : $a_{n+1} = \frac{\frac12 - n}{n + 1}\, a_n$.
## Indice
La série obtenue est alternée à partir d'un certain rang pour $x > 0$ : le critère spécial majore le reste par le premier terme négligé.
## Étape · 2
$f$ vérifie $(1 + x) f' = \frac12 f$ et $f(0) = 1$. Une série $\sum a_n x^n$ est solution si et seulement si $(n + 1)a_{n+1} + n a_n = \frac12 a_n$, soit $a_{n+1} = \frac{1/2 - n}{n + 1}\, a_n$, avec $a_0 = 1$ : on obtient exactement les coefficients annoncés.
## Étape · 1
Par d'Alembert, $\left|\frac{a_{n+1}}{a_n}\right| = \frac{|n - 1/2|}{n + 1} \to 1$ : le rayon vaut $1$. Sur $]-1, 1[$, la somme et $f$ résolvent le même problème de Cauchy (linéaire du premier ordre, coefficient $1 + x$ ne s'annulant pas) : elles sont égales.
## Étape · 2
$a_1 = \frac12$, $a_2 = \frac{\frac12 \cdot (-\frac12)}{2} = -\frac18$, $a_3 = \frac{\frac12 \cdot (-\frac12) \cdot (-\frac32)}{6} = \frac{1}{16}$.
## Étape · 2
$\sqrt{1{,}1} \approx 1 + 0{,}05 - 0{,}00125 + 0{,}0000625 = 1{,}0488125$. Les termes suivants alternent en signe et décroissent en valeur absolue : l'erreur est majorée par $|a_4| \times 0{,}1^4 = \frac{5}{128} \times 10^{-4} \approx 3{,}9 \times 10^{-6}$. (Valeur exacte : $1{,}0488088\ldots$)
## Réponse
num 0.0625 ± 0.0001

# m2 · moyen · 30 · Arc tangente et deux séries pour π
1. Montrer que $\arctan x = \sum_{n \ge 0} (-1)^n \frac{x^{2n+1}}{2n+1}$ pour $|x| < 1$, et donner le rayon.
2. Avec le théorème radial d'Abel, en déduire la formule de Leibniz $\frac{\pi}{4} = \sum_{n \ge 0} \frac{(-1)^n}{2n+1}$.
3. En prenant $x = \frac{1}{\sqrt 3}$, calculer $\displaystyle\sum_{n \ge 0} \frac{(-1)^n}{(2n+1)\, 3^n}$. Pourquoi cette série est-elle bien plus utile que celle de Leibniz pour calculer $\pi$ ?
## Indice
$\arctan' x = \frac{1}{1 + x^2} = \sum (-1)^n x^{2n}$ pour $|x| < 1$ : intégrer terme à terme.
## Indice
La série de Leibniz converge (critère des séries alternées) ; le théorème d'Abel permet alors de passer à la limite $x \to 1^-$.
## Indice
$\arctan \frac{1}{\sqrt 3} = \frac{\pi}{6}$, et $\left(\frac{1}{\sqrt 3}\right)^{2n+1} = \frac{1}{\sqrt 3\, 3^n}$.
## Étape · 1
Pour $|x| < 1$, $\frac{1}{1 + x^2} = \sum (-1)^n x^{2n}$ ; en intégrant terme à terme sur $[0, x]$ (et $\arctan 0 = 0$) : $\arctan x = \sum (-1)^n \frac{x^{2n+1}}{2n+1}$. Le rayon vaut $1$ (le terme général est borné pour $|x| \le 1$ et non borné pour $|x| > 1$).
## Étape · 2
En $x = 1$, la série $\sum \frac{(-1)^n}{2n+1}$ converge par le critère des séries alternées. Par le théorème radial d'Abel, sa somme est $\lim_{x \to 1^-} \arctan x = \arctan 1 = \frac{\pi}{4}$.
## Étape · 2
Avec $x = \frac{1}{\sqrt 3}$ : $\frac{\pi}{6} = \sum_{n \ge 0} \frac{(-1)^n}{(2n+1)\sqrt3\, 3^n}$, donc $\sum_{n \ge 0} \frac{(-1)^n}{(2n+1)\, 3^n} = \frac{\pi\sqrt3}{6} = \frac{\pi}{2\sqrt3} \approx 0{,}9069$.
## Étape · 1
Le reste est majoré par le premier terme négligé, $\frac{1}{(2n+3)3^{n+1}}$ : chaque terme gagne un facteur $3$, soit environ une décimale tous les deux termes, au lieu des centaines de termes par décimale de la série de Leibniz.
## Réponse
num 0.9069 ± 0.0005

# m3 · moyen · 30 · Une équation différentielle résolue par une série
On cherche les solutions développables en série entière de l'équation $y'' + x y' + y = 0$ avec $y(0) = 1$ et $y'(0) = 0$.

1. Écrire la relation de récurrence vérifiée par les coefficients $a_n$ d'une telle solution.
2. Calculer $a_n$ pour tout $n$ et reconnaître la somme.
3. Donner $a_4$.
## Indice
Reporter $y = \sum a_n x^n$ et identifier le coefficient de $x^n$ dans $y''$, $xy'$ et $y$.
## Indice
Le coefficient de $x^n$ dans $y''$ est $(n+2)(n+1) a_{n+2}$ ; dans $x y'$, c'est $n a_n$.
## Indice
Les coefficients impairs sont nuls ; pour les pairs, comparer avec $e^{-x^2/2} = \sum \frac{(-1)^k x^{2k}}{2^k k!}$.
## Étape · 2
En identifiant le coefficient de $x^n$ : $(n+2)(n+1) a_{n+2} + n a_n + a_n = 0$, soit $a_{n+2} = -\frac{a_n}{n + 2}$.
## Étape · 2
$a_1 = 0$ entraîne $a_{2k+1} = 0$. Avec $a_0 = 1$ : $a_{2k} = \frac{(-1)^k}{2 \cdot 4 \cdots (2k)} = \frac{(-1)^k}{2^k k!}$. La série a un rayon infini, et sa somme est $e^{-x^2/2}$.
## Étape · 1
Vérification directe : $y = e^{-x^2/2}$ donne $y' = -xy$ et $y'' = -y + x^2 y$, d'où $y'' + xy' + y = 0$. Le théorème de Cauchy-Lipschitz linéaire garantit que c'est l'unique solution, et $a_4 = \frac{1}{8}$.
## Réponse
num 0.125 ± 0.001

# c1 · complexe · 60 · La fonction de Cauchy, lisse mais pas analytique
Soit $f(x) = e^{-1/x^2}$ pour $x \neq 0$, et $f(0) = 0$.

1. Montrer par récurrence que, pour tout $n$, il existe un polynôme $P_n$ tel que $f^{(n)}(x) = P_n\!\left(\frac1x\right) e^{-1/x^2}$ pour $x \neq 0$.
2. En déduire que $f^{(n)}(x) \to 0$ quand $x \to 0$, puis que $f$ est de classe $C^\infty$ sur $\mathbb{R}$ avec $f^{(n)}(0) = 0$ pour tout $n$.
3. Conclure que $f$ n'est pas développable en série entière au voisinage de $0$. Calculer $f\left(\frac12\right)$.
## Indice
Dériver $P_n(1/x) e^{-1/x^2}$ : on obtient $\left(-\frac{1}{x^2} P_n'(1/x) + \frac{2}{x^3} P_n(1/x)\right) e^{-1/x^2}$.
## Indice
Avec $u = \frac1x$ : $u^k e^{-u^2} \to 0$ quand $|u| \to \infty$ (croissances comparées). Pour la dérivabilité en $0$, utiliser le théorème de la limite de la dérivée, ou le taux d'accroissement.
## Indice
Si $f$ était développable, ses coefficients seraient les $\frac{f^{(n)}(0)}{n!}$.
## Étape · 1
$P_0 = 1$. Si $f^{(n)}(x) = P_n(1/x)e^{-1/x^2}$, alors $f^{(n+1)}(x) = \left(-\frac{1}{x^2}P_n'(1/x) + \frac{2}{x^3}P_n(1/x)\right)e^{-1/x^2}$, ce qui donne $P_{n+1}(u) = -u^2 P_n'(u) + 2u^3 P_n(u)$.
## Étape · 2
Avec $u = \frac1x$, $|u| \to +\infty$ quand $x \to 0$, et $u^k e^{-u^2} \to 0$ pour tout $k$ : $f^{(n)}(x) \to 0$.
## Étape · 2
Par récurrence : si $f$ est de classe $C^n$ avec $f^{(n)}(0) = 0$, alors $f^{(n)}$ est continue en $0$, dérivable sur $\mathbb{R}^*$, et $f^{(n+1)}(x) \to 0$ quand $x \to 0$ ; le théorème de la limite de la dérivée donne $f^{(n)}$ dérivable en $0$ avec $f^{(n+1)}(0) = 0$, et $f^{(n+1)}$ continue. Donc $f$ est $C^\infty$ et toutes ses dérivées en $0$ sont nulles.
## Étape · 2
Si $f$ était développable en série entière sur $]-r, r[$, ses coefficients seraient $\frac{f^{(n)}(0)}{n!} = 0$, donc $f$ serait nulle sur $]-r, r[$. Or $f(x) > 0$ pour $x \neq 0$ : contradiction.
## Étape · 1
$f\left(\frac12\right) = e^{-4} \approx 0{,}0183$. Cette fonction sert à construire des fonctions « plateau » lisses à support compact, impossibles avec des fonctions développables en série entière.
## Réponse
num 0.0183 ± 0.0002

# c2 · complexe · 75 · Les nombres de Catalan
On définit $C_0 = 1$ et $C_{n+1} = \sum_{k=0}^{n} C_k C_{n-k}$ (nombre de façons de parenthéser un produit, de trianguler un polygone, de chemins de Dyck…).

1. Calculer $C_1, \ldots, C_5$.
2. On pose $D(x) = \frac{1 - \sqrt{1 - 4x}}{2x}$ pour $0 < |x| < \frac14$ et $D(0) = 1$. Montrer que $D$ est développable en série entière de rayon $\frac14$, en utilisant le développement de $\sqrt{1 + u}$, et que $x D(x)^2 - D(x) + 1 = 0$.
3. En déduire que les coefficients $d_n$ de $D$ vérifient la même récurrence que les $C_n$, puis que $C_n = d_n = \frac{1}{n+1}\binom{2n}{n}$.
## Indice
$C_1 = 1$, $C_2 = 2$, $C_3 = 5$.
## Indice
$\sqrt{1 - 4x} = 1 + \sum_{n \ge 1} \binom{1/2}{n}(-4x)^n$, et l'on vérifie que $\binom{1/2}{n}(-4)^n = -\frac{2}{n}\binom{2n-2}{n-1}$ pour $n \ge 1$.
## Indice
Le coefficient de $x^{n+1}$ dans $x D(x)^2$ est $\sum_{k=0}^{n} d_k d_{n-k}$ (produit de Cauchy).
## Étape · 1
$C_1 = 1$, $C_2 = 2$, $C_3 = 5$, $C_4 = 14$, $C_5 = C_0C_4 + C_1C_3 + C_2C_2 + C_3C_1 + C_4C_0 = 14 + 5 + 4 + 5 + 14 = 42$.
## Étape · 2
Pour $|x| < \frac14$, $\sqrt{1 - 4x} = 1 - \sum_{n \ge 1} \frac{2}{n}\binom{2n-2}{n-1} x^n$ (rayon $\frac14$). Donc $\frac{1 - \sqrt{1 - 4x}}{2x} = \sum_{n \ge 1} \frac1n\binom{2n-2}{n-1} x^{n-1} = \sum_{m \ge 0} \frac{1}{m+1}\binom{2m}{m} x^m$, série de rayon $\frac14$ dont la somme vaut $1$ en $0$ : c'est $D$.
## Étape · 1
$y = D(x)$ est la racine de $x y^2 - y + 1 = 0$ qui reste bornée quand $x \to 0$ : on vérifie $x D^2 - D + 1 = 0$ en développant $(1 - \sqrt{1 - 4x})^2 = 2 - 4x - 2\sqrt{1 - 4x}$.
## Étape · 2
En identifiant les coefficients de $x D^2 = D - 1$ : le coefficient de $x^{n+1}$ donne $\sum_{k=0}^{n} d_k d_{n-k} = d_{n+1}$, et $d_0 = 1$. Les suites $(d_n)$ et $(C_n)$ ont même premier terme et même récurrence : elles sont égales.
## Étape · 1
D'où $C_n = \frac{1}{n+1}\binom{2n}{n}$ ; on retrouve $C_5 = \frac{252}{6} = 42$. Par Stirling, $C_n \sim \frac{4^n}{n^{3/2}\sqrt\pi}$, ce qui est cohérent avec le rayon $\frac14$.
## Réponse
num 42 ± 0.001
