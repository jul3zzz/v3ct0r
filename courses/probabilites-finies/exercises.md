# s1 · simple · 10 · La somme de deux dés
On lance deux dés équilibrés. Quelle est la probabilité que la somme des faces vaille $7$ ? Est-ce la somme la plus probable ?
## Indice
Modèle : l'univers $\{1, \ldots, 6\}^2$ (dés discernables) muni de la probabilité uniforme.
## Indice
Lister les couples $(a, b)$ tels que $a + b = 7$.
## Indice
Pour une somme $s \in \{2, \ldots, 12\}$, le nombre de couples est $6 - |s - 7|$.
## Étape · 1
$|\Omega| = 36$, et les couples de somme $7$ sont $(1, 6), (2, 5), \ldots, (6, 1)$ : il y en a $6$. Donc $P = \frac{6}{36} = \frac16$.
## Étape · 1
Le nombre de couples de somme $s$ est $6 - |s - 7|$, maximal pour $s = 7$ : c'est bien la somme la plus probable.
## Réponse
num 0.1667 ± 0.001

# s2 · simple · 15 · Un test de dépistage
Une maladie touche $1\,\%$ d'une population. Un test est positif chez $99\,\%$ des malades et chez $2\,\%$ des personnes saines. Une personne prise au hasard a un test positif : quelle est la probabilité qu'elle soit malade ?
## Indice
Noter $M$ : « malade » et $T$ : « test positif ». On cherche $P(M \mid T)$.
## Indice
Probabilités totales avec le système complet $(M, \overline{M})$ pour calculer $P(T)$.
## Indice
Bayes : $P(M \mid T) = \frac{P(T \mid M)P(M)}{P(T)}$.
## Étape · 1
$P(T) = P(T \mid M)P(M) + P(T \mid \overline{M})P(\overline{M}) = 0{,}99 \times 0{,}01 + 0{,}02 \times 0{,}99 = 0{,}0297$.
## Étape · 1
$P(M \mid T) = \frac{0{,}0099}{0{,}0297} = \frac13$. Deux positifs sur trois sont des faux positifs : la maladie est trop rare pour que le test suffise seul.
## Réponse
num 0.3333 ± 0.001

# m1 · moyen · 25 · Espérance et variance d'une binomiale
Soit $X \sim \mathcal{B}(n, p)$.

1. Montrer que $X$ a même loi que $X_1 + \cdots + X_n$, avec $X_1, \ldots, X_n$ indépendantes de loi $\mathcal{B}(p)$.
2. En déduire $E(X) = np$ et $V(X) = np(1 - p)$.
3. Vérifier $E(X)$ directement à partir de la loi, et donner $V(X)$ pour $n = 10$, $p = 0{,}3$.
## Indice
L'espérance et la variance ne dépendent que de la loi : on peut travailler avec la somme de Bernoulli.
## Indice
Linéarité de l'espérance ; variance d'une somme de variables indépendantes, donc décorrélées.
## Indice
Pour le calcul direct, $k\binom nk = n\binom{n-1}{k-1}$.
## Étape · 1
La somme de $n$ Bernoulli indépendantes de paramètre $p$ suit $\mathcal{B}(n, p)$ (nombre de succès) : elle a même loi que $X$, donc même espérance et même variance.
## Étape · 2
$E(X) = \sum E(X_i) = np$. Les $X_i$ étant indépendantes, elles sont deux à deux décorrélées : $V(X) = \sum V(X_i) = np(1 - p)$.
## Étape · 1
Directement : $E(X) = \sum_{k} k\binom nk p^k(1-p)^{n-k} = np\sum_{j=0}^{n-1}\binom{n-1}{j}p^j(1-p)^{n-1-j} = np$. Pour $n = 10$, $p = 0{,}3$ : $V(X) = 10 \times 0{,}3 \times 0{,}7 = 2{,}1$.
## Réponse
num 2.1 ± 0.001

# m2 · moyen · 25 · Indépendants deux à deux, pas mutuellement
On lance deux pièces équilibrées, modélisées par l'univers $\{P, F\}^2$ muni de la probabilité uniforme. Soient $A$ : « la première pièce donne pile », $B$ : « la seconde donne pile », $C$ : « les deux pièces donnent le même résultat ». Ces trois événements sont-ils indépendants deux à deux ? mutuellement ?
## Indice
Écrire chaque événement comme une partie de l'univers à quatre éléments.
## Indice
$A \cap C = \{(P, P)\}$ ; calculer les trois intersections deux à deux.
## Indice
Pour l'indépendance mutuelle, comparer $P(A \cap B \cap C)$ et $P(A)P(B)P(C)$.
## Étape · 1
$P(A) = P(B) = P(C) = \frac12$, et $A \cap B = A \cap C = B \cap C = \{(P, P)\}$, de probabilité $\frac14 = \frac12 \cdot \frac12$ : indépendance deux à deux.
## Étape · 1
$A \cap B \cap C = \{(P, P)\}$, de probabilité $\frac14 \neq \frac18$ : les trois événements ne sont pas mutuellement indépendants. Connaître $A$ et $B$ détermine $C$.
## Réponse
qcm B
- indépendants deux à deux et mutuellement
- indépendants deux à deux, mais pas mutuellement
- ni l'un ni l'autre

# m3 · moyen · 30 · Les points fixes d'une permutation au hasard
On choisit une permutation $\sigma$ de $\{1, \ldots, n\}$ selon la loi uniforme sur $\mathcal{S}_n$, et l'on note $N$ son nombre de points fixes.

1. Pour $i$ fixé, calculer $P(\sigma(i) = i)$.
2. En écrivant $N$ comme une somme d'indicatrices, calculer $E(N)$.
3. Les indicatrices sont-elles indépendantes ? Le calcul de la question 2 en dépend-il ?
## Indice
Les permutations qui fixent $i$ sont en bijection avec les permutations des $n - 1$ autres éléments.
## Indice
$N = \sum_{i=1}^{n}\mathbf{1}_{\{\sigma(i) = i\}}$ et $E(\mathbf{1}_A) = P(A)$.
## Indice
Pour $n = 2$, comparer $P(\sigma(1) = 1, \sigma(2) = 2)$ et le produit des probabilités.
## Étape · 1
$P(\sigma(i) = i) = \frac{(n-1)!}{n!} = \frac1n$.
## Étape · 1
Par linéarité, $E(N) = \sum_{i=1}^{n} P(\sigma(i) = i) = n \cdot \frac1n = 1$, quel que soit $n$.
## Étape · 1
Elles ne sont pas indépendantes : pour $n = 2$, $P(\sigma(1) = 1, \sigma(2) = 2) = \frac12 \neq \frac14$. Mais la linéarité de l'espérance ne demande aucune indépendance : $E(N) = 1$ reste vrai.
## Réponse
num 1 ± 0.001

# c1 · complexe · 60 · Combien de lancers pour estimer une probabilité ?
On répète $n$ fois, de façon indépendante, une expérience dont la probabilité de succès $p \in [0, 1]$ est inconnue. On note $S_n$ le nombre de succès et $F_n = \frac{S_n}{n}$ la fréquence observée.

1. Calculer $E(F_n)$ et $V(F_n)$.
2. Montrer que $p(1 - p) \le \frac14$ pour tout $p \in [0, 1]$.
3. Montrer que $P\big(|F_n - p| \ge \varepsilon\big) \le \frac{1}{4n\varepsilon^2}$ pour tout $\varepsilon > 0$.
4. Quel nombre $n$ de répétitions garantit, quel que soit $p$, que la fréquence approche $p$ à $0{,}05$ près avec une probabilité au moins $0{,}95$ ?
5. Que vaudrait la borne de Bienaymé-Tchebychev si l'on savait que $p \le 0{,}1$ ?
## Indice
$S_n \sim \mathcal{B}(n, p)$ : utiliser l'espérance et la variance de la binomiale et $V(aX) = a^2V(X)$.
## Indice
$\frac14 - p(1 - p) = \left(p - \frac12\right)^2$.
## Indice
Pour 4 : on veut $P(|F_n - p| \ge 0{,}05) \le 0{,}05$ ; il suffit que $\frac{1}{4n \times 0{,}0025} \le 0{,}05$.
## Étape · 1
$E(F_n) = \frac{np}{n} = p$ et $V(F_n) = \frac{np(1-p)}{n^2} = \frac{p(1-p)}{n}$.
## Étape · 1
$\frac14 - p(1 - p) = p^2 - p + \frac14 = \left(p - \frac12\right)^2 \ge 0$, avec égalité pour $p = \frac12$.
## Étape · 1
Par Bienaymé-Tchebychev : $P(|F_n - p| \ge \varepsilon) \le \frac{V(F_n)}{\varepsilon^2} = \frac{p(1-p)}{n\varepsilon^2} \le \frac{1}{4n\varepsilon^2}$.
## Étape · 2
Avec $\varepsilon = 0{,}05$ : $\frac{1}{4n \times 0{,}0025} = \frac{100}{n}$, et $\frac{100}{n} \le 0{,}05$ équivaut à $n \ge 2000$. Il suffit de $2000$ répétitions, quel que soit $p$.
## Étape · 1
Si $p \le 0{,}1$, alors $p(1 - p) \le 0{,}09$ (la fonction $p \mapsto p(1-p)$ croît sur $[0, \frac12]$), et la borne devient $\frac{0{,}09}{n \times 0{,}0025} = \frac{36}{n}$ : $n \ge 720$ suffit. L'inégalité est grossière : des outils plus fins (inégalités de concentration, théorème central limite, au-delà du programme) donnent des estimations bien meilleures.
## Réponse
num 2000 ± 1
