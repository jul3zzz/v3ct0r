# s1 · simple · 10 · Attendre le premier pile
On lance une pièce équilibrée jusqu'à obtenir pile ; $X$ est le nombre de lancers. Quelle est la loi de $X$ ? Calculer $P(X \ge 3)$.
## Indice
Le premier succès d'épreuves de Bernoulli indépendantes de paramètre $\frac12$.
## Indice
$P(X \ge 3) = P(X > 2)$ : les deux premiers lancers donnent face.
## Indice
$P(X > n) = (1 - p)^n$.
## Étape · 1
$X \sim \mathcal{G}\left(\frac12\right)$ : $P(X = k) = \frac{1}{2^k}$ pour $k \ge 1$.
## Étape · 1
$P(X \ge 3) = P(X > 2) = \left(\frac12\right)^2 = \frac14$.
## Réponse
num 0.25 ± 0.001

# s2 · simple · 10 · Une loi de Poisson
Le nombre d'appels reçus par un standard en une minute suit la loi de Poisson de paramètre $\lambda = 2$. Quelle est la probabilité de ne recevoir aucun appel pendant une minute ? Quel est le nombre moyen d'appels ?
## Indice
$P(X = k) = e^{-\lambda}\frac{\lambda^k}{k!}$.
## Indice
Pour $k = 0$ : $e^{-\lambda}$.
## Indice
L'espérance d'une loi de Poisson est son paramètre.
## Étape · 1
$P(X = 0) = e^{-2} \approx 0{,}1353$.
## Étape · 1
$E(X) = \lambda = 2$ appels par minute en moyenne.
## Réponse
num 0.1353 ± 0.001

# m1 · moyen · 25 · Moments de la loi géométrique
Soit $X \sim \mathcal{G}(p)$, $p \in\, ]0, 1[$, et $q = 1 - p$.

1. Calculer $G_X(t)$ pour $|t| < \frac1q$.
2. En déduire $E(X)$ et $V(X)$.
3. Donner $V(X)$ pour $p = \frac14$.
## Indice
$G_X(t) = \sum_{k \ge 1}q^{k-1}p\,t^k = pt\sum_{j \ge 0}(qt)^j$.
## Indice
Le rayon est $\frac1q > 1$ : $G_X$ est dérivable à tout ordre en $1$.
## Indice
$V(X) = G''_X(1) + G'_X(1) - G'_X(1)^2$.
## Étape · 1
$G_X(t) = \frac{pt}{1 - qt}$ pour $|t| < \frac1q$.
## Étape · 2
$G'_X(t) = \frac{p}{(1 - qt)^2}$ et $G''_X(t) = \frac{2pq}{(1 - qt)^3}$, donc $E(X) = G'_X(1) = \frac1p$ et $V(X) = \frac{2q}{p^2} + \frac1p - \frac1{p^2} = \frac{2q + p - 1}{p^2} = \frac{q}{p^2}$.
## Étape · 1
Pour $p = \frac14$ : $V(X) = \frac{3/4}{1/16} = 12$ (et $E(X) = 4$).
## Réponse
num 12 ± 0.001

# m2 · moyen · 25 · Somme de deux variables de Poisson
Soient $X \sim \mathcal{P}(\lambda)$ et $Y \sim \mathcal{P}(\mu)$ indépendantes.

1. Calculer $G_X$.
2. En déduire la loi de $X + Y$.
3. Pour $\lambda = 1$ et $\mu = 2$, calculer $P(X + Y = 2)$, et vérifier le résultat par un calcul direct.
## Indice
$G_X(t) = \sum_k e^{-\lambda}\frac{\lambda^k}{k!}t^k$ : reconnaître une exponentielle.
## Indice
La fonction génératrice d'une somme de variables indépendantes est le produit, et elle détermine la loi.
## Indice
Calcul direct : $P(X + Y = 2) = \sum_{k=0}^{2}P(X = k)P(Y = 2 - k)$.
## Étape · 1
$G_X(t) = e^{-\lambda}e^{\lambda t} = e^{\lambda(t - 1)}$ pour tout $t$ réel.
## Étape · 1
$G_{X+Y}(t) = e^{\lambda(t-1)}e^{\mu(t-1)} = e^{(\lambda + \mu)(t - 1)}$ : c'est la fonction génératrice de $\mathcal{P}(\lambda + \mu)$, qui détermine la loi, donc $X + Y \sim \mathcal{P}(\lambda + \mu)$.
## Étape · 2
$P(X + Y = 2) = e^{-3}\frac{3^2}{2} \approx 0{,}2240$. Directement : $e^{-1}e^{-2}\left(\frac{2^2}{2} + 1 \cdot 2 + \frac12\right) = e^{-3} \cdot 4{,}5$.
## Réponse
num 0.2240 ± 0.001

# c1 · complexe · 75 · Le collectionneur de vignettes
Une marque de céréales glisse dans chaque paquet une vignette, choisie uniformément parmi $n$ modèles, indépendamment d'un paquet à l'autre. On note $N$ le nombre de paquets à acheter pour obtenir les $n$ modèles, et, pour $1 \le k \le n$, $T_k$ le nombre de paquets supplémentaires nécessaires pour passer de $k - 1$ à $k$ modèles distincts.

1. Montrer que $T_k$ suit la loi géométrique de paramètre $p_k = \frac{n - k + 1}{n}$.
2. En admettant que $T_1, \ldots, T_n$ sont indépendantes, calculer $E(N)$ et montrer que $E(N) = nH_n$, où $H_n = \sum_{j=1}^{n}\frac1j$.
3. Montrer que $V(N) \le \frac{\pi^2}{6}n^2$.
4. En déduire, par Bienaymé-Tchebychev, une majoration de $P\big(|N - nH_n| \ge n\sqrt{\ln n}\big)$ qui tend vers $0$.
5. Calculer $E(N)$ pour $n = 6$.
## Indice
Pour 1 : une fois $k - 1$ modèles obtenus, chaque nouveau paquet apporte un modèle nouveau avec probabilité $\frac{n - (k-1)}{n}$, indépendamment des précédents.
## Indice
Pour 2 : $N = T_1 + \cdots + T_n$ et la linéarité. Pour 3 : $V(T_k) = \frac{1 - p_k}{p_k^2} \le \frac{1}{p_k^2} = \frac{n^2}{(n - k + 1)^2}$.
## Indice
Pour 3, sommer avec $j = n - k + 1$ : $\sum_j\frac{1}{j^2} \le \frac{\pi^2}{6}$. Pour 4 : $\varepsilon = n\sqrt{\ln n}$.
## Étape · 1
Après avoir obtenu $k - 1$ modèles, les paquets suivants apportent un modèle nouveau avec probabilité $p_k = \frac{n - k + 1}{n}$ chacun, indépendamment : $T_k$ est le rang du premier succès, $T_k \sim \mathcal{G}(p_k)$ (et $T_1 = 1$).
## Étape · 2
$N = \sum_{k=1}^{n}T_k$, donc $E(N) = \sum_{k=1}^{n}\frac{n}{n - k + 1} = n\sum_{j=1}^{n}\frac1j = nH_n$.
## Étape · 2
Par indépendance, $V(N) = \sum_k V(T_k) \le \sum_k\frac{n^2}{(n - k + 1)^2} = n^2\sum_{j=1}^{n}\frac{1}{j^2} \le \frac{\pi^2}{6}n^2$.
## Étape · 1
Bienaymé-Tchebychev : $P\big(|N - nH_n| \ge n\sqrt{\ln n}\big) \le \frac{V(N)}{n^2\ln n} \le \frac{\pi^2}{6\ln n} \to 0$. Comme $H_n \sim \ln n$, $N$ est de l'ordre de $n\ln n$ avec grande probabilité.
## Étape · 1
Pour $n = 6$ : $E(N) = 6\left(1 + \frac12 + \frac13 + \frac14 + \frac15 + \frac16\right) = 6 \times 2{,}45 = 14{,}7$ paquets en moyenne pour un dé à six faces.
## Réponse
num 14.7 ± 0.01
