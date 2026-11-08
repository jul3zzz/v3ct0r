# s1 · simple · 10 · Une limite, et un rang explicite
Soit $u_n = \dfrac{n^2 + 3n}{2n^2 - 1}$ pour $n \ge 1$. Déterminer la limite $\ell$ de $(u_n)$, puis, en revenant à la définition, donner un rang $N$ explicite à partir duquel $|u_n - \ell| \le 10^{-2}$. Répondre en donnant $\ell$.
## Indice
Factoriser numérateur et dénominateur par le terme dominant $n^2$.
## Indice
Calculer $u_n - \frac12 = \dfrac{2(n^2 + 3n) - (2n^2 - 1)}{2(2n^2 - 1)}$ et simplifier le numérateur.
## Indice
Pour $n \ge 1$ : $6n + 1 \le 7n$ et $2n^2 - 1 \ge n^2$. Que devient la majoration ?
## Étape · 1
$u_n = \dfrac{1 + 3/n}{2 - 1/n^2} \to \dfrac12$ par opérations sur les limites.
## Étape · 2
$u_n - \frac12 = \dfrac{6n + 1}{2(2n^2 - 1)}$. Pour $n \ge 1$, $6n + 1 \le 7n$ et $2n^2 - 1 \ge n^2$, donc $0 \le u_n - \frac12 \le \dfrac{7n}{2n^2} = \dfrac{7}{2n}$.
## Étape · 1
$\dfrac{7}{2n} \le 10^{-2}$ dès que $n \ge 350$ : le rang $N = 350$ convient. Ce n'est pas le plus petit rang possible, mais la définition n'en demande qu'un.
## Réponse
num 0.5 ± 0.001

# s2 · simple · 10 · Trois séries, une seule diverge
Déterminer la nature des séries $\displaystyle\sum_{n \ge 1} \frac{n}{n^3 + 1}$, $\displaystyle\sum_{n \ge 1} \frac{1}{\sqrt n + 1}$ et $\displaystyle\sum_{n \ge 1} \sin\!\left(\frac{1}{n^2}\right)$. Laquelle diverge ?
## Indice
Les trois séries sont à termes positifs : chercher un équivalent simple de chaque terme général.
## Indice
$\dfrac{n}{n^3 + 1} \sim \dfrac{1}{n^2}$, $\dfrac{1}{\sqrt n + 1} \sim \dfrac{1}{\sqrt n}$ et $\sin\dfrac{1}{n^2} \sim \dfrac{1}{n^2}$.
## Indice
Séries de Riemann : $\sum \frac{1}{n^\alpha}$ converge si et seulement si $\alpha > 1$.
## Étape · 1
Les trois termes généraux sont strictement positifs ; pour le troisième, $0 < \frac{1}{n^2} \le 1 < \pi$.
## Étape · 2
$\dfrac{n}{n^3 + 1} \sim \dfrac{1}{n^2}$ et $\sin\dfrac{1}{n^2} \sim \dfrac{1}{n^2}$ : par le critère des équivalents pour les séries positives, ces deux séries ont la nature de la série de Riemann d'exposant $2 > 1$ ; elles convergent.
## Étape · 2
$\dfrac{1}{\sqrt n + 1} \sim \dfrac{1}{n^{1/2}}$, d'exposant $\frac12 \le 1$ : la deuxième série diverge.
## Réponse
qcm B
- la première
- la deuxième
- la troisième
- aucune

# s3 · simple · 10 · Une somme télescopique
Vérifier que $\dfrac{1}{n(n+1)} = \dfrac1n - \dfrac{1}{n+1}$ pour $n \ge 1$, puis calculer la somme $\displaystyle\sum_{n=1}^{+\infty} \frac{1}{n(n+1)}$.
## Indice
Réduire le membre de droite au même dénominateur.
## Indice
Écrire la somme partielle $S_N = \sum_{n=1}^{N} \left( \frac1n - \frac{1}{n+1} \right)$ : presque tous les termes se compensent deux à deux.
## Indice
On trouve $S_N = 1 - \frac{1}{N+1}$.
## Étape · 1
$\dfrac1n - \dfrac{1}{n+1} = \dfrac{(n+1) - n}{n(n+1)} = \dfrac{1}{n(n+1)}$.
## Étape · 2
Par télescopage, $S_N = \sum_{n=1}^{N} \frac1n - \sum_{n=2}^{N+1} \frac1n = 1 - \frac{1}{N+1}$.
## Étape · 1
$S_N \to 1$ : la série converge et sa somme vaut $1$.
## Réponse
num 1 ± 0.001

# m1 · moyen · 30 · Le nombre e est irrationnel
Pour $n \ge 1$, on pose $u_n = \displaystyle\sum_{k=0}^{n} \frac{1}{k!}$ et $v_n = u_n + \dfrac{1}{n \cdot n!}$.

1. Montrer que $(u_n)$ et $(v_n)$ sont adjacentes. On admet que leur limite commune est $e$.
2. On suppose $e = \frac{p}{q}$ avec $p, q$ entiers et $q \ge 1$. Montrer que $q!\,u_q < q!\,e < q!\,v_q$, puis aboutir à une contradiction.
3. Donner une valeur approchée de $e$ à $10^{-3}$ près à l'aide de $u_6$ et $v_6$.
## Indice
$u_{n+1} - u_n = \frac{1}{(n+1)!}$. Pour $v$, réduire $v_{n+1} - v_n$ au dénominateur commun $n(n+1)(n+1)!$.
## Indice
Les inégalités strictes viennent de la stricte monotonie. Multiplier par $q!$ : $q!\,u_q$ est un entier, et $q!\,v_q = q!\,u_q + \frac1q$.
## Indice
Si $e = \frac pq$, alors $q!\,e$ est un entier strictement compris entre l'entier $N = q!\,u_q$ et $N + \frac1q \le N + 1$.
## Étape · 1
$u_{n+1} - u_n = \frac{1}{(n+1)!} > 0$ : la suite $(u_n)$ est strictement croissante.
## Étape · 2
$v_{n+1} - v_n = \dfrac{1}{(n+1)!} + \dfrac{1}{(n+1)(n+1)!} - \dfrac{1}{n \cdot n!} = \dfrac{n(n+1) + n - (n+1)^2}{n(n+1)(n+1)!} = \dfrac{-1}{n(n+1)(n+1)!} < 0$. La suite $(v_n)$ est strictement décroissante, et $v_n - u_n = \frac{1}{n \cdot n!} \to 0$ : les deux suites sont adjacentes.
## Étape · 2
Par stricte monotonie, $u_q < u_{q+1} \le e \le v_{q+1} < v_q$. Si $e = \frac pq$, alors $q!\,e = p\,(q-1)!$ est un entier, de même que $N = q!\,u_q = \sum_{k=0}^{q} \frac{q!}{k!}$.
## Étape · 2
On obtient $N < q!\,e < N + \frac1q \le N + 1$ : un entier strictement compris entre deux entiers consécutifs, ce qui est absurde. Donc $e \notin \mathbb{Q}$.
## Étape · 1
$u_6 = 1 + 1 + \frac12 + \frac16 + \frac{1}{24} + \frac{1}{120} + \frac{1}{720} \approx 2{,}71806$ et $v_6 = u_6 + \frac{1}{4320} \approx 2{,}71829$ : $e \approx 2{,}718$ à $10^{-3}$ près.
## Réponse
num 2.718 ± 0.001

# m2 · moyen · 30 · Série harmonique et constante d'Euler
Soit $H_n = \sum_{k=1}^{n} \frac1k$ pour $n \ge 1$.

1. Par comparaison série-intégrale, montrer que $\ln(n+1) \le H_n \le 1 + \ln n$, puis que $H_n \sim \ln n$.
2. On pose $\gamma_n = H_n - \ln n$. Montrer que $(\gamma_n)$ est décroissante et minorée par $0$ ; elle converge vers une limite notée $\gamma$.
3. Montrer que $\gamma_n - \gamma_{n+1} \sim \frac{1}{2n^2}$, puis, par sommation des relations de comparaison, que $\gamma_n - \gamma \sim \frac{1}{2n}$. Donner $\gamma$ à $10^{-3}$ près.
## Indice
Sur $[k, k+1]$, on a $\frac{1}{k+1} \le \frac1t \le \frac1k$ : intégrer, puis sommer sur $k$.
## Indice
$\gamma_n - \gamma_{n+1} = \ln(n+1) - \ln n - \frac{1}{n+1} = -\ln\!\left(1 - \frac{1}{n+1}\right) - \frac{1}{n+1}$.
## Indice
Quand $x \to 0$, $-\ln(1 - x) - x \sim \frac{x^2}{2}$ ; et $\sum_{k \ge n} \frac{1}{k^2} \sim \frac{1}{n}$ (reste d'une série de Riemann).
## Étape · 2
En intégrant $\frac{1}{k+1} \le \frac1t \le \frac1k$ sur $[k, k+1]$ : $\frac{1}{k+1} \le \ln(k+1) - \ln k \le \frac1k$. En sommant l'inégalité de droite pour $k = 1, \dots, n$ : $\ln(n+1) \le H_n$. En sommant celle de gauche pour $k = 1, \dots, n-1$ : $H_n - 1 \le \ln n$. Comme $\ln(n+1) \sim \ln n$, l'encadrement donne $H_n \sim \ln n$.
## Étape · 2
$\gamma_n - \gamma_{n+1} = \ln(n+1) - \ln n - \frac{1}{n+1} \ge 0$ d'après l'encadrement précédent (avec $k = n$) : la suite décroît. Et $\gamma_n \ge \ln(n+1) - \ln n > 0$. Par le théorème de la limite monotone, $\gamma_n$ converge vers un réel $\gamma \ge 0$.
## Étape · 2
Avec $x = \frac{1}{n+1} \to 0$ : $\gamma_n - \gamma_{n+1} = -\ln(1 - x) - x = \frac{x^2}{2} + o(x^2)$, donc $\gamma_n - \gamma_{n+1} \sim \frac{1}{2(n+1)^2} \sim \frac{1}{2n^2}$.
## Étape · 2
Ces termes sont positifs et $\sum \frac{1}{2k^2}$ converge. Par sommation des relations de comparaison (cas convergent) : $\gamma_n - \gamma = \sum_{k \ge n} (\gamma_k - \gamma_{k+1}) \sim \sum_{k \ge n} \frac{1}{2k^2} \sim \frac{1}{2n}$.
## Étape · 1
Numériquement, $\gamma_{100} \approx 0{,}58221$ et $\gamma_{100} - \frac{1}{200} \approx 0{,}57721$ : $\gamma \approx 0{,}577$.
## Réponse
num 0.577 ± 0.001

# m3 · moyen · 35 · Une suite implicite, développée à trois termes
1. Montrer que pour tout entier $n \ge 1$, l'équation $x + \ln x = n$ admet une unique solution $x_n > 0$.
2. Montrer que $1 \le x_n \le n$, que $x_n \to +\infty$, puis que $x_n \sim n$.
3. En déduire $x_n = n - \ln n + o(1)$, puis $x_n = n - \ln n + \dfrac{\ln n}{n} + o\!\left(\dfrac{\ln n}{n}\right)$.
## Indice
La fonction $f(x) = x + \ln x$ est continue et strictement croissante sur $]0, +\infty[$ ; quelles sont ses limites aux bornes ?
## Indice
Comparer $f(x_n) = n$ à $f(1)$ et à $f(n)$. Puis utiliser $x_n = n - \ln x_n$ avec $0 \le \ln x_n \le \ln n$.
## Indice
Écrire $\ln x_n = \ln n + \ln\frac{x_n}{n}$ avec $\frac{x_n}{n} \to 1$. Pour le terme suivant : $\frac{x_n}{n} = 1 - \frac{\ln n}{n} + o\!\left(\frac{1}{n}\right)$, et $\ln(1 + u) \sim u$.
## Étape · 1
$f : x \mapsto x + \ln x$ est continue et strictement croissante sur $]0, +\infty[$, de limite $-\infty$ en $0$ et $+\infty$ en $+\infty$ : c'est une bijection de $]0, +\infty[$ sur $\mathbb{R}$, d'où l'existence et l'unicité de $x_n$.
## Étape · 2
$f(1) = 1 \le n = f(x_n) \le n + \ln n = f(n)$, donc $1 \le x_n \le n$ par croissance de $f$. La suite $(x_n)$ est croissante, puisque $f^{-1}$ l'est. Si elle était majorée par $M$, on aurait $n = x_n + \ln x_n \le M + \ln M$ pour tout $n$ : c'est absurde, donc $x_n \to +\infty$.
## Étape · 2
$x_n = n - \ln x_n$ avec $0 \le \ln x_n \le \ln n = o(n)$, donc $x_n = n + o(n)$, c'est-à-dire $x_n \sim n$.
## Étape · 2
$\ln x_n = \ln n + \ln\frac{x_n}{n} = \ln n + o(1)$, car $\frac{x_n}{n} \to 1$ et $\ln$ est continue en $1$. D'où $x_n = n - \ln n + o(1)$.
## Étape · 2
Alors $\frac{x_n}{n} = 1 - \frac{\ln n}{n} + o\!\left(\frac1n\right)$, donc $\ln\frac{x_n}{n} \sim -\frac{\ln n}{n}$, soit $\ln\frac{x_n}{n} = -\frac{\ln n}{n} + o\!\left(\frac{\ln n}{n}\right)$. Finalement $x_n = n - \ln x_n = n - \ln n + \frac{\ln n}{n} + o\!\left(\frac{\ln n}{n}\right)$.

# c1 · complexe · 90 · La formule de Stirling, de bout en bout
Pour $n \ge 1$, on pose $u_n = \dfrac{n!\,e^n}{n^{n + 1/2}}$ et, pour $n \ge 0$, $W_n = \displaystyle\int_0^{\pi/2} \sin^n t \,dt$ (intégrales de Wallis).

1. Montrer que $\ln u_{n+1} - \ln u_n = 1 - \left(n + \tfrac12\right) \ln\!\left(1 + \tfrac1n\right) = O\!\left(\tfrac{1}{n^2}\right)$, et en déduire que $(u_n)$ converge vers un réel $C > 0$.
2. Par une intégration par parties, montrer que $n W_n = (n-1) W_{n-2}$ pour $n \ge 2$, puis que $W_{2n} = \dfrac{(2n)!}{2^{2n} (n!)^2} \cdot \dfrac{\pi}{2}$.
3. Montrer que $(W_n)$ est décroissante, que $n W_n W_{n-1} = \frac{\pi}{2}$ pour $n \ge 1$, puis que $W_n \sim \sqrt{\dfrac{\pi}{2n}}$.
4. En exprimant $W_{2n}$ à l'aide de $u_n$ et de $u_{2n}$, montrer que $C = \sqrt{2\pi}$, puis donner $C$ à $10^{-3}$ près.
## Indice
Développer $\ln(1 + x) = x - \frac{x^2}{2} + \frac{x^3}{3} + O(x^4)$ avec $x = \frac1n$ : le terme en $\frac1n$ disparaît. Une série télescopique $\sum (\ln u_{n+1} - \ln u_n)$ absolument convergente donne la convergence de $(\ln u_n)$.
## Indice
Écrire $\sin^n t = \sin t \cdot \sin^{n-1} t$, intégrer par parties et utiliser $\cos^2 = 1 - \sin^2$. Pour la décroissance : $0 \le \sin t \le 1$ sur $\left[0, \frac\pi2\right]$. La suite $(n W_n W_{n-1})$ est constante.
## Indice
L'encadrement $W_n \le W_{n-1} \le W_{n-2} = \frac{n}{n-1} W_n$ donne $W_{n-1} \sim W_n$. Remplacer ensuite $n!$ par $u_n\, n^{n + 1/2} e^{-n}$ dans la formule de $W_{2n}$ : les puissances se simplifient.
## Étape · 2
$\ln u_{n+1} - \ln u_n = \ln(n+1) + 1 + \left(n + \tfrac12\right)\ln n - \left(n + \tfrac32\right)\ln(n+1) = 1 - \left(n + \tfrac12\right)\ln\!\left(1 + \tfrac1n\right)$.
## Étape · 2
Avec $\ln\!\left(1 + \frac1n\right) = \frac1n - \frac{1}{2n^2} + \frac{1}{3n^3} + O\!\left(\frac{1}{n^4}\right)$ : $\left(n + \frac12\right)\ln\!\left(1 + \frac1n\right) = 1 + \frac{1}{12n^2} + O\!\left(\frac{1}{n^3}\right)$, donc $\ln u_{n+1} - \ln u_n = -\frac{1}{12n^2} + O\!\left(\frac{1}{n^3}\right) = O\!\left(\frac{1}{n^2}\right)$.
## Étape · 1
La série $\sum (\ln u_{n+1} - \ln u_n)$ est absolument convergente par comparaison à $\sum \frac{1}{n^2}$ ; ses sommes partielles $\ln u_{n} - \ln u_1$ convergent, donc $\ln u_n \to L \in \mathbb{R}$ et $u_n \to C = e^L > 0$.
## Étape · 2
Pour $n \ge 2$ : $W_n = \displaystyle\int_0^{\pi/2} \sin t\, \sin^{n-1} t\,dt = \Big[-\cos t\,\sin^{n-1} t\Big]_0^{\pi/2} + (n-1)\int_0^{\pi/2} \cos^2 t\, \sin^{n-2} t\,dt = (n-1)\,(W_{n-2} - W_n)$, d'où $n W_n = (n-1) W_{n-2}$. Avec $W_0 = \frac\pi2$, une récurrence donne $W_{2n} = \dfrac{(2n-1)(2n-3)\cdots 1}{(2n)(2n-2)\cdots 2} \cdot \dfrac\pi2 = \dfrac{(2n)!}{2^{2n}(n!)^2} \cdot \dfrac\pi2$.
## Étape · 2
Sur $\left[0, \frac\pi2\right]$, $0 \le \sin^n t \le \sin^{n-1} t$ : la suite $(W_n)$ décroît, et elle reste strictement positive. La relation $n W_n = (n-1) W_{n-2}$ donne $n W_n W_{n-1} = (n-1) W_{n-1} W_{n-2}$ : cette suite est constante, égale à $1 \cdot W_1 W_0 = \frac{\pi}{2}$.
## Étape · 2
$W_n \le W_{n-1} \le W_{n-2} = \frac{n}{n-1} W_n$, donc $\frac{W_{n-1}}{W_n} \to 1$. Alors $\frac{\pi}{2} = n W_n W_{n-1} \sim n W_n^2$, c'est-à-dire $W_n \sim \sqrt{\frac{\pi}{2n}}$.
## Étape · 2
Avec $n! = u_n\, n^{n + 1/2} e^{-n}$ et $(2n)! = u_{2n}\, (2n)^{2n + 1/2} e^{-2n}$ : $\dfrac{(2n)!}{2^{2n}(n!)^2} = \dfrac{u_{2n}}{u_n^2} \cdot \dfrac{2^{2n + 1/2}\, n^{2n + 1/2}}{2^{2n}\, n^{2n + 1}} = \dfrac{u_{2n}}{u_n^2} \sqrt{\dfrac{2}{n}}$. Donc $W_{2n} = \dfrac{u_{2n}}{u_n^2} \sqrt{\dfrac2n} \cdot \dfrac\pi2 \sim \dfrac{1}{C} \cdot \dfrac{\pi}{\sqrt{2n}}$.
## Étape · 1
D'après la question 3, $W_{2n} \sim \sqrt{\frac{\pi}{4n}} = \frac{\sqrt\pi}{2\sqrt n}$. En identifiant, $\frac{\pi}{C\sqrt{2n}} \sim \frac{\sqrt\pi}{2\sqrt n}$, d'où $C = \frac{2\pi}{\sqrt{2\pi}} = \sqrt{2\pi} \approx 2{,}507$, et $n! \sim \sqrt{2\pi n}\left(\frac ne\right)^n$.
## Réponse
num 2.5066 ± 0.001

# c2 · complexe · 60 · Quand le produit de Cauchy échoue
Soit $a_n = \dfrac{(-1)^n}{\sqrt{n+1}}$ pour $n \ge 0$.

1. Montrer que $\sum a_n$ converge, mais pas absolument.
2. On note $c_n = \sum_{k=0}^{n} a_k\, a_{n-k}$ le terme général du produit de Cauchy de $\sum a_n$ par elle-même. Montrer que $c_n = (-1)^n \displaystyle\sum_{k=0}^{n} \frac{1}{\sqrt{(k+1)(n-k+1)}}$.
3. À l'aide de l'inégalité $xy \le \left(\frac{x+y}{2}\right)^2$, montrer que $|c_n| \ge \dfrac{2(n+1)}{n+2}$, et conclure que $\sum c_n$ diverge.
4. Pourquoi cela ne contredit-il pas le théorème du produit de Cauchy ? Calculer $|c_{10}|$ à $10^{-2}$ près.
## Indice
Critère spécial des séries alternées pour $\sum a_n$ ; pour la convergence absolue, $|a_n| = \frac{1}{\sqrt{n+1}}$ et les séries de Riemann.
## Indice
$a_k\, a_{n-k} = \dfrac{(-1)^k (-1)^{n-k}}{\sqrt{k+1}\,\sqrt{n-k+1}}$ : le signe ne dépend pas de $k$.
## Indice
Avec $x = k + 1$ et $y = n - k + 1$, on a $x + y = n + 2$ : chacun des $n + 1$ termes de la somme est au moins $\frac{2}{n+2}$.
## Étape · 2
La suite $\left(\frac{1}{\sqrt{n+1}}\right)$ décroît vers $0$ : par le critère spécial des séries alternées, $\sum a_n$ converge. Mais $\sum |a_n| = \sum \frac{1}{(n+1)^{1/2}}$ est une série de Riemann d'exposant $\frac12 \le 1$ : elle diverge.
## Étape · 1
$a_k\, a_{n-k} = \dfrac{(-1)^n}{\sqrt{(k+1)(n-k+1)}}$, d'où la formule : tous les termes de $c_n$ ont le même signe $(-1)^n$.
## Étape · 2
Pour $0 \le k \le n$ : $(k+1)(n-k+1) \le \left(\frac{n+2}{2}\right)^2$, donc $\dfrac{1}{\sqrt{(k+1)(n-k+1)}} \ge \dfrac{2}{n+2}$. En sommant les $n + 1$ termes : $|c_n| \ge \dfrac{2(n+1)}{n+2} \ge 1$.
## Étape · 2
La suite $(c_n)$ ne tend pas vers $0$ : la série $\sum c_n$ diverge grossièrement, alors que $\sum a_n$ converge.
## Étape · 2
Il n'y a pas de contradiction : le théorème suppose les deux séries **absolument** convergentes, ce qui n'est pas le cas ici. Numériquement, $|c_{10}| = \displaystyle\sum_{k=0}^{10} \frac{1}{\sqrt{(k+1)(11-k)}} \approx 2{,}29$ ; on peut d'ailleurs montrer que $|c_n| \to \pi$.
## Réponse
num 2.29 ± 0.01
