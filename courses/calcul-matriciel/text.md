## Opérations sur les matrices {#operations}

Une matrice est un tableau de nombres. Ce point de vue modeste suffit au premier semestre : on y apprend à calculer, à résoudre des systèmes, à inverser. Le second semestre ([[algebre-lineaire#matrices]]) dira ce que représente une matrice, une application linéaire écrite dans des bases, et expliquera pourquoi le produit est défini comme il l'est. Dans tout le cours, $\mathbb{K}$ désigne $\mathbb{R}$ ou $\mathbb{C}$.

::: définition Matrices, matrices élémentaires {#def-matrice}
Une **matrice** à $n$ lignes et $p$ colonnes à coefficients dans $\mathbb{K}$ est une famille $A = (a_{ij})_{1 \le i \le n,\, 1 \le j \le p}$ d'éléments de $\mathbb{K}$, présentée en tableau ; $a_{ij}$ est le coefficient de la ligne $i$ et de la colonne $j$. On note $\mathcal{M}_{n,p}(\mathbb{K})$ leur ensemble, $\mathcal{M}_n(\mathbb{K})$ si $n = p$ (matrices **carrées**). On additionne deux matrices et l'on multiplie une matrice par un scalaire coefficient par coefficient.

La **matrice élémentaire** $E_{ij}$ a un $1$ en position $(i, j)$ et des $0$ ailleurs. Toute matrice est combinaison linéaire des matrices élémentaires : $A = \sum_{i,j} a_{ij} E_{ij}$.
:::

::: définition Produit matriciel {#def-produit}
Si $A \in \mathcal{M}_{n,p}(\mathbb{K})$ et $B \in \mathcal{M}_{p,q}(\mathbb{K})$, le produit $AB \in \mathcal{M}_{n,q}(\mathbb{K})$ est défini par
$$(AB)_{ij} = \sum_{k=1}^{p} a_{ik} b_{kj}.$$
Le produit n'est défini que si le nombre de colonnes de $A$ est égal au nombre de lignes de $B$.
:::

On le calcule « ligne fois colonne » : le coefficient $(i, j)$ de $AB$ combine la ligne $i$ de $A$ et la colonne $j$ de $B$. Par exemple
$$\begin{pmatrix} 1 & 2 \\ 0 & 1 \end{pmatrix}\begin{pmatrix} 1 & 0 \\ 3 & 1 \end{pmatrix} = \begin{pmatrix} 7 & 2 \\ 3 & 1 \end{pmatrix}, \qquad \begin{pmatrix} 1 & 0 \\ 3 & 1 \end{pmatrix}\begin{pmatrix} 1 & 2 \\ 0 & 1 \end{pmatrix} = \begin{pmatrix} 1 & 2 \\ 3 & 7 \end{pmatrix}.$$

::: proposition Propriétés du produit {#prop-produit-m}
Le produit matriciel est **associatif**, $(AB)C = A(BC)$, et **bilinéaire** : $A(\lambda B + \mu C) = \lambda AB + \mu AC$ et $(\lambda A + \mu B)C = \lambda AC + \mu BC$. La matrice identité $I_n$ (des $1$ sur la diagonale, des $0$ ailleurs) vérifie $I_n A = A$ et $A I_p = A$ pour $A \in \mathcal{M}_{n,p}(\mathbb{K})$.
:::

L'associativité se vérifie en écrivant le coefficient $(i, l)$ des deux côtés : $\sum_{k}\sum_{m} a_{ik} b_{km} c_{ml}$ dans les deux cas. En revanche, le produit **n'est pas commutatif**, comme le montre l'exemple ci-dessus.

::: proposition Produit de matrices élémentaires {#prop-elementaires}
Avec les matrices élémentaires de tailles compatibles, et le symbole de Kronecker $\delta_{jk}$ (égal à $1$ si $j = k$, à $0$ sinon) :
$$E_{ij} E_{kl} = \delta_{jk}\, E_{il}.$$
:::

Cette règle, qui se lit « les indices intérieurs doivent se rencontrer », suffit pour calculer tout produit par bilinéarité. Elle donne aussi les premiers exemples étonnants : $E_{12}E_{21} = E_{11}$ mais $E_{21}E_{12} = E_{22}$, et $E_{12}^2 = 0$.

::: remarque Lire un produit par les colonnes {#rem-colonnes}
Si $X$ est la colonne de coefficients $x_1, \ldots, x_p$ et si $C_1, \ldots, C_p$ sont les colonnes de $A$, alors $AX = x_1 C_1 + \cdots + x_p C_p$ : **$AX$ est une combinaison linéaire des colonnes de $A$**. De même, la colonne $j$ de $AB$ est $A$ fois la colonne $j$ de $B$, et la ligne $i$ de $AB$ est la ligne $i$ de $A$ fois $B$.
:::

::: définition Transposée {#def-transposee}
La **transposée** de $A = (a_{ij}) \in \mathcal{M}_{n,p}(\mathbb{K})$ est la matrice $A^\top \in \mathcal{M}_{p,n}(\mathbb{K})$ de coefficients $(A^\top)_{ij} = a_{ji}$ : les lignes de $A$ deviennent les colonnes de $A^\top$.
:::

::: proposition Transposée d'une combinaison, d'un produit {#prop-transposee}
$(\lambda A + \mu B)^\top = \lambda A^\top + \mu B^\top$, $(A^\top)^\top = A$, et $(AB)^\top = B^\top A^\top$ : l'ordre des facteurs s'inverse.
:::

En effet, $\big((AB)^\top\big)_{ij} = (AB)_{ji} = \sum_k a_{jk} b_{ki} = \sum_k (B^\top)_{ik} (A^\top)_{kj}$.

## Systèmes linéaires et pivot de Gauss {#systemes}

::: définition Opérations élémentaires sur les lignes {#def-operations}
On appelle **opérations élémentaires** sur les lignes d'une matrice :

- l'échange de deux lignes, noté $L_i \leftrightarrow L_j$ ;
- la multiplication d'une ligne par un scalaire **non nul**, $L_i \leftarrow \lambda L_i$ ($\lambda \neq 0$) ;
- l'ajout à une ligne d'un multiple d'une **autre** ligne, $L_i \leftarrow L_i + \lambda L_j$ ($i \neq j$).

On définit de même les opérations sur les colonnes.
:::

::: proposition Opérations élémentaires et produits matriciels {#prop-op-matrices}
Effectuer une opération élémentaire sur les lignes de $A \in \mathcal{M}_{n,p}(\mathbb{K})$ revient à multiplier $A$ **à gauche** par la matrice obtenue en effectuant la même opération sur $I_n$. Une opération sur les colonnes revient à multiplier **à droite** par la matrice obtenue à partir de $I_p$. Ces matrices sont inversibles, et l'inverse correspond à l'opération inverse.
:::

Par exemple, $L_2 \leftarrow L_2 + \lambda L_1$ correspond à $I_n + \lambda E_{21}$, et l'opération inverse $L_2 \leftarrow L_2 - \lambda L_1$ à $I_n - \lambda E_{21}$ ; on vérifie $(I_n + \lambda E_{21})(I_n - \lambda E_{21}) = I_n - \lambda^2 E_{21}^2 = I_n$.

::: définition Système linéaire {#def-systeme-lin}
Un **système linéaire** de $n$ équations à $p$ inconnues s'écrit
$$\begin{cases} a_{11}x_1 + \cdots + a_{1p}x_p = b_1 \\ \quad\vdots \\ a_{n1}x_1 + \cdots + a_{np}x_p = b_n \end{cases} \qquad\text{soit}\qquad AX = B,$$
avec $A = (a_{ij}) \in \mathcal{M}_{n,p}(\mathbb{K})$, $X$ la colonne des inconnues et $B$ celle des seconds membres. Le système est **homogène** si $B = 0$ ; le système homogène associé à $AX = B$ est $AX = 0$. Il est **compatible** s'il a au moins une solution, c'est-à-dire si $B$ est une combinaison linéaire des colonnes de $A$.
:::

Avec deux inconnues, chaque équation décrit une droite du plan et résoudre le système, c'est intersecter ces droites ; avec trois inconnues, ce sont des plans de l'espace. Deux plans non parallèles se coupent selon une droite : un système de deux équations à trois inconnues a en général une infinité de solutions.

::: proposition Structure de l'ensemble des solutions {#prop-structure}
Si le système $AX = B$ est compatible et si $X_0$ en est une solution particulière, ses solutions sont exactement les $X_0 + Y$, où $Y$ parcourt l'ensemble des solutions du système homogène $AY = 0$.
:::

La preuve est une ligne : $AX = B = AX_0$ équivaut à $A(X - X_0) = 0$. On retrouve le principe déjà vu pour les racines $n$-ièmes d'un complexe et pour les équations différentielles linéaires : **solution particulière plus solutions de l'équation homogène**.

::: méthode Algorithme du pivot de Gauss {#meth-pivot}
Les opérations élémentaires sur les lignes de la matrice complète $(A \mid B)$ ne changent pas l'ensemble des solutions, puisqu'elles sont réversibles. On les utilise pour **échelonner** le système :

1. choisir dans la première colonne non nulle un coefficient non nul, le **pivot**, et l'amener en première ligne par un échange ;
2. annuler les coefficients situés sous le pivot par des opérations $L_i \leftarrow L_i - \frac{a_i}{a_1} L_1$ ;
3. recommencer avec les lignes suivantes, en ignorant la première.

Le système échelonné se résout en remontant, de la dernière équation à la première. Une équation $0 = c$ avec $c \neq 0$ signale un système incompatible ; les inconnues qui ne portent pas de pivot sont des **paramètres** libres.
:::

::: exemple Un système 3 × 3 {#ex-pivot}
Pour $x + y + z = 6$, $x + 2y + 3z = 14$, $2x + y + z = 7$ : les opérations $L_2 \leftarrow L_2 - L_1$ et $L_3 \leftarrow L_3 - 2L_1$ donnent $y + 2z = 8$ et $-y - z = -5$, puis $L_3 \leftarrow L_3 + L_2$ donne $z = 3$. En remontant : $y = 8 - 2z = 2$ et $x = 6 - y - z = 1$. Les trois plans se coupent en un seul point, $(1, 2, 3)$.
:::

Le nombre d'opérations du pivot sur un système $n \times n$ est de l'ordre de $n^3$ : c'est la méthode qu'utilisent, sous des formes perfectionnées, tous les logiciels de calcul. Le cours [[algebre-lineaire#meth-gauss]] reprend l'algorithme pour calculer des rangs.

## L'anneau des matrices carrées {#carrees}

Muni de l'addition et du produit, $\mathcal{M}_n(\mathbb{K})$ est un **anneau** ([[structures-algebriques#def-anneau]]), d'élément neutre $I_n$ pour le produit. Mais il se comporte très différemment de $\mathbb{R}$.

::: proposition Un anneau non commutatif, non intègre {#prop-anneau-mn}
Pour $n \ge 2$ :

- le produit n'est pas commutatif : $E_{12}E_{21} = E_{11} \neq E_{22} = E_{21}E_{12}$ ;
- il existe des **diviseurs de zéro**, matrices non nulles $A$ et $B$ telles que $AB = 0$ : par exemple $E_{11}E_{22} = 0$ ;
- il existe des matrices **nilpotentes** non nulles, dont une puissance est nulle : $E_{12}^2 = 0$.

En conséquence, $AB = AC$ n'entraîne pas $B = C$, et $A^2 = 0$ n'entraîne pas $A = 0$.
:::

::: définition Matrices remarquables {#def-types}
Une matrice carrée $A = (a_{ij})$ est :

- **scalaire** si $A = \lambda I_n$ ; **diagonale** si $a_{ij} = 0$ pour $i \neq j$, notée $\operatorname{diag}(d_1, \ldots, d_n)$ ;
- **triangulaire supérieure** si $a_{ij} = 0$ pour $i > j$, **triangulaire inférieure** si $a_{ij} = 0$ pour $i < j$ ;
- **symétrique** si $A^\top = A$, **antisymétrique** si $A^\top = -A$ ; on note $\mathcal{S}_n(\mathbb{K})$ et $\mathcal{A}_n(\mathbb{K})$ leurs ensembles.
:::

::: proposition Produits de matrices diagonales, triangulaires {#prop-triangulaires}
Le produit de deux matrices diagonales est diagonale, $\operatorname{diag}(d_i)\operatorname{diag}(d'_i) = \operatorname{diag}(d_i d'_i)$ ; en particulier $\operatorname{diag}(d_i)^m = \operatorname{diag}(d_i^m)$. Le produit de deux matrices triangulaires supérieures est triangulaire supérieure, et ses coefficients diagonaux sont les produits des coefficients diagonaux. De même pour les triangulaires inférieures.
:::

Pour deux triangulaires supérieures $T$ et $T'$ et $i > j$, chaque terme $t_{ik}t'_{kj}$ de $(TT')_{ij}$ est nul : si $k < i$, $t_{ik} = 0$, et si $k \ge i > j$, $t'_{kj} = 0$.

::: théorème Formule du binôme pour des matrices qui commutent {#thm-binome-m}
Si $A, B \in \mathcal{M}_n(\mathbb{K})$ **commutent** ($AB = BA$), alors pour tout $m \in \mathbb{N}$
$$(A + B)^m = \sum_{k=0}^{m} \binom{m}{k} A^k B^{m-k},$$
$$A^m - B^m = (A - B)\sum_{k=0}^{m-1} A^k B^{m-1-k}.$$
:::

La preuve est celle de la [[calculs-algebriques#thm-binome|formule du binôme]], qui n'utilise la commutativité qu'à un endroit : pour regrouper les termes $A^k B^{m-k}$. Sans elle, la formule est fausse : $(A + B)^2 = A^2 + AB + BA + B^2$.

::: méthode Calculer des puissances par le binôme {#meth-puissances}
Si $A = \lambda I_n + N$ avec $N$ nilpotente ($N^r = 0$), les matrices $\lambda I_n$ et $N$ commutent, et la somme du binôme s'arrête :
$$A^m = \sum_{k=0}^{r-1} \binom{m}{k} \lambda^{m-k} N^k \qquad (m \ge r - 1).$$
Exemple : $A = \begin{pmatrix} 2 & 1 \\ 0 & 2 \end{pmatrix} = 2I_2 + E_{12}$ avec $E_{12}^2 = 0$, donc $A^m = 2^m I_2 + m 2^{m-1} E_{12} = \begin{pmatrix} 2^m & m 2^{m-1} \\ 0 & 2^m \end{pmatrix}$.
:::

## Matrices inversibles {#inverses}

::: définition Matrice inversible, groupe linéaire {#def-inversible}
Une matrice $A \in \mathcal{M}_n(\mathbb{K})$ est **inversible** s'il existe $B \in \mathcal{M}_n(\mathbb{K})$ telle que $AB = BA = I_n$. Une telle matrice $B$ est unique : c'est l'**inverse** $A^{-1}$. L'ensemble des matrices inversibles est le **groupe linéaire** $\mathrm{GL}_n(\mathbb{K})$.
:::

L'unicité est un calcul d'une ligne : si $B$ et $B'$ conviennent, $B = B I_n = B(AB') = (BA)B' = B'$. Une matrice qui a une ligne nulle, une colonne nulle, ou qui est un diviseur de zéro, n'est pas inversible : si $AB = 0$ avec $B \neq 0$ et si $A$ était inversible, on aurait $B = A^{-1}AB = 0$.

::: proposition Inverse d'un produit, d'une transposée {#prop-inverse-produit}
Si $A$ et $B$ sont inversibles, $AB$ l'est et $(AB)^{-1} = B^{-1}A^{-1}$ ; $A^\top$ l'est et $(A^\top)^{-1} = (A^{-1})^\top$. Une matrice diagonale $\operatorname{diag}(d_1, \ldots, d_n)$ est inversible si et seulement si tous les $d_i$ sont non nuls, et son inverse est $\operatorname{diag}(d_1^{-1}, \ldots, d_n^{-1})$.
:::

Comme pour la transposée, l'ordre s'inverse : on enlève d'abord la dernière chaussette enfilée. On vérifie $(AB)(B^{-1}A^{-1}) = A(BB^{-1})A^{-1} = I_n$, et de même dans l'autre sens.

::: théorème Inversibilité et systèmes linéaires {#thm-inversibilite}
Pour $A \in \mathcal{M}_n(\mathbb{K})$, les propriétés suivantes sont équivalentes :

1. $A$ est inversible ;
2. le système homogène $AX = 0$ n'a que la solution $X = 0$ ;
3. pour toute colonne $Y$, le système $AX = Y$ a au moins une solution ;
4. on peut transformer $A$ en $I_n$ par des opérations élémentaires sur les lignes.

Dans ce cas, pour toute colonne $Y$, l'unique solution de $AX = Y$ est $X = A^{-1}Y$. De plus, s'il existe $B$ telle que $AB = I_n$ **ou** $BA = I_n$, alors $A$ est inversible et $B = A^{-1}$.
:::

::: preuve Inversibilité et systèmes (esquisse)
L'algorithme du pivot, poursuivi jusqu'à annuler aussi les coefficients **au-dessus** des pivots et à rendre les pivots égaux à $1$, transforme $A$ en une matrice échelonnée réduite $R = EA$, où $E$ est un produit de matrices d'opérations élémentaires, donc inversible. Ou bien $R$ a $n$ pivots, et alors $R = I_n$ ; ou bien elle en a moins, et sa dernière ligne est nulle. Si 2 ou 3 est vraie, le second cas est impossible : une ligne nulle laisserait une inconnue libre (contredisant 2), ou rendrait incompatible le système $RX = Z$ où $Z$ a un $1$ en dernière position, c'est-à-dire $AX = E^{-1}Z$ (contredisant 3). Donc $EA = I_n$, et $A = E^{-1}$ est inversible, d'inverse $E$. Les implications 1 ⇒ 2, 1 ⇒ 3 et 4 ⇒ 1 sont immédiates. Enfin, si $AB = I_n$, alors $A(BY) = Y$ pour tout $Y$ (propriété 3) ; si $BA = I_n$, alors $AX = 0$ entraîne $X = BAX = 0$ (propriété 2).
:::

::: méthode Inverser une matrice par la méthode de Gauss-Jordan {#meth-gauss-jordan}
On écrit côte à côte $A$ et $I_n$, et l'on effectue sur les lignes du tableau $(A \mid I_n)$ les opérations qui transforment $A$ en $I_n$. Le bloc de droite devient $A^{-1}$ : si $EA = I_n$, alors $E I_n = E = A^{-1}$. Si l'on obtient une ligne nulle à gauche, $A$ n'est pas inversible. Variante : résoudre le système $AX = Y$ pour une colonne $Y$ quelconque ; la solution s'écrit $X = A^{-1}Y$, et l'on lit $A^{-1}$ sur les coefficients.
:::

::: proposition Inverse d'une matrice 2 × 2 {#prop-inverse-2}
La matrice $A = \begin{pmatrix} a & b \\ c & d \end{pmatrix}$ est inversible si et seulement si $ad - bc \neq 0$, et alors
$$A^{-1} = \frac{1}{ad - bc}\begin{pmatrix} d & -b \\ -c & a \end{pmatrix}.$$
:::

On vérifie $\begin{pmatrix} a & b \\ c & d \end{pmatrix}\begin{pmatrix} d & -b \\ -c & a \end{pmatrix} = (ad - bc) I_2$. Si $ad - bc = 0$, ce produit est nul avec un second facteur non nul (sauf si $A = 0$, évidemment non inversible) : $A$ est un diviseur de zéro. Le nombre $ad - bc$ est le **déterminant** de $A$, étudié au second semestre.

::: proposition Matrices triangulaires inversibles {#prop-tri-inv}
Une matrice triangulaire est inversible si et seulement si tous ses coefficients diagonaux sont non nuls. L'inverse d'une matrice triangulaire supérieure inversible est triangulaire supérieure (de même pour inférieure), de coefficients diagonaux les inverses des coefficients diagonaux.
:::

Si les coefficients diagonaux sont non nuls, le système $TX = 0$ se résout en remontant et n'a que la solution nulle ; si l'un d'eux est nul, la méthode du pivot fait apparaître une ligne nulle. Une preuve directe de la forme de l'inverse, par les matrices nilpotentes, fait l'objet de l'exercice c1.
