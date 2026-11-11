# s1 · simple · 10 · Une somme de produits consécutifs
Calculer $S_n = \sum_{k=1}^{n} k(k + 1)$ en fonction de $n$, puis $S_{10}$.
## Indice
Développer $k(k + 1) = k^2 + k$ et utiliser les sommes usuelles.
## Indice
$\sum k^2 = \frac{n(n+1)(2n+1)}{6}$ et $\sum k = \frac{n(n+1)}{2}$ : mettre $\frac{n(n+1)}{6}$ en facteur.
## Indice
Autre voie : $k(k+1) = \frac{k(k+1)(k+2) - (k-1)k(k+1)}{3}$, puis télescoper.
## Étape · 1
$S_n = \frac{n(n+1)(2n+1)}{6} + \frac{n(n+1)}{2} = \frac{n(n+1)}{6}(2n + 1 + 3) = \frac{n(n+1)(n+2)}{3}$.
## Étape · 1
$S_{10} = \frac{10 \times 11 \times 12}{3} = 440$ (contrôle : $385 + 55$).
## Réponse
num 440 ± 0.001

# m1 · moyen · 25 · La somme des k fois k parmi n
Pour $n \ge 1$, calculer $T_n = \sum_{k=0}^{n} k\binom{n}{k}$, puis $T_{10}$.
## Indice
Montrer d'abord que $k\binom nk = n\binom{n-1}{k-1}$ pour $1 \le k \le n$, à partir des factorielles.
## Indice
Le terme $k = 0$ est nul ; après la substitution, changer d'indice $j = k - 1$.
## Indice
$\sum_{j=0}^{n-1}\binom{n-1}{j} = 2^{n-1}$ par la formule du binôme avec $a = b = 1$.
## Étape · 1
Pour $1 \le k \le n$ : $k\binom nk = \frac{k \cdot n!}{k!(n-k)!} = \frac{n \cdot (n-1)!}{(k-1)!\,(n-k)!} = n\binom{n-1}{k-1}$.
## Étape · 2
Donc $T_n = \sum_{k=1}^{n} n\binom{n-1}{k-1} = n\sum_{j=0}^{n-1}\binom{n-1}{j} = n\,2^{n-1}$.
## Étape · 1
$T_{10} = 10 \times 2^9 = 5120$. Autre preuve : dériver $x \mapsto (1 + x)^n = \sum\binom nk x^k$ et évaluer en $x = 1$.
## Réponse
num 5120 ± 0.001

# c1 · complexe · 60 · La somme des carrés des coefficients binomiaux
Soit $n \in \mathbb{N}$.

1. Développer $(1 + x)^n(1 + x)^n$ comme une somme double, et l'écrire comme fonction polynomiale de $x$.
2. En identifiant le coefficient de $x^n$ dans $(1 + x)^{2n}$, démontrer que
$$\sum_{k=0}^{n} \binom{n}{k}^2 = \binom{2n}{n}.$$
3. Plus généralement, démontrer la formule de Vandermonde : $\sum_{k=0}^{m}\binom{p}{k}\binom{q}{m-k} = \binom{p + q}{m}$ pour $p, q, m \in \mathbb{N}$.
4. Vérifier la formule de la question 2 pour $n = 5$ ; quelle est la valeur commune ?
## Indice
$(1 + x)^n = \sum_{i=0}^{n}\binom ni x^i$ par le binôme ; le produit de deux sommes est la somme des produits $\binom ni\binom nj x^{i+j}$.
## Indice
Regrouper les termes selon $m = i + j$ : le coefficient de $x^m$ est $\sum_{i}\binom ni\binom{n}{m-i}$. Deux fonctions polynomiales égales sur $\mathbb{R}$ ont les mêmes coefficients.
## Indice
Pour $m = n$, utiliser la symétrie $\binom{n}{n-i} = \binom ni$. Pour 3, faire le même calcul avec $(1 + x)^p(1 + x)^q$.
## Étape · 1
Par le binôme, $(1 + x)^n(1 + x)^n = \sum_{i=0}^{n}\sum_{j=0}^{n}\binom ni\binom nj x^{i+j} = \sum_{m=0}^{2n}\Big(\sum_{i + j = m}\binom ni\binom nj\Big)x^m$.
## Étape · 1
Le membre de gauche vaut aussi $(1 + x)^{2n} = \sum_{m=0}^{2n}\binom{2n}{m}x^m$. Deux fonctions polynomiales égales en tout réel ont les mêmes coefficients ([[polynomes#cor-fonction]]) : pour tout $m$, $\sum_{i+j=m}\binom ni\binom nj = \binom{2n}{m}$.
## Étape · 2
Pour $m = n$ : $\sum_{i=0}^{n}\binom ni\binom{n}{n-i} = \binom{2n}{n}$, et la symétrie $\binom{n}{n-i} = \binom ni$ donne $\sum_{i=0}^n \binom ni^2 = \binom{2n}{n}$.
## Étape · 2
Le même calcul avec $(1 + x)^p(1 + x)^q = (1 + x)^{p+q}$ donne, pour le coefficient de $x^m$, $\sum_{k}\binom pk\binom{q}{m-k} = \binom{p+q}{m}$ ; la convention $\binom ab = 0$ si $b > a$ ou $b < 0$ permet de sommer sur $0 \le k \le m$ sans précaution.
## Étape · 1
Pour $n = 5$ : $1 + 25 + 100 + 100 + 25 + 1 = 252 = \binom{10}{5}$.
## Réponse
num 252 ± 0.001
