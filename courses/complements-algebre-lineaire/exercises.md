# s1 · simple · 10 · La trace d'un projecteur
Dans $\mathbb{R}^3$, soit $p$ le projecteur sur le plan $P : x + y + z = 0$ parallèlement à la droite $D = \operatorname{Vect}\big((1, 0, 0)\big)$. Calculer $\operatorname{tr} p$ sans écrire sa matrice dans la base canonique.
## Indice
Vérifier d'abord que $\mathbb{R}^3 = P \oplus D$.
## Indice
La trace ne dépend pas de la base : choisir une base adaptée à $P \oplus D$.
## Indice
La trace d'un projecteur est son rang.
## Étape · 1
$(1, 0, 0) \notin P$ (car $1 \neq 0$), donc $P \cap D = \{0\}$, et $\dim P + \dim D = 3$ : $\mathbb{R}^3 = P \oplus D$.
## Étape · 1
Dans une base adaptée, la matrice de $p$ est $\operatorname{diag}(1, 1, 0)$ : $\operatorname{tr} p = \operatorname{rg} p = \dim P = 2$.
## Réponse
num 2 ± 0.001

# m1 · moyen · 20 · Un commutateur ne vaut jamais l'identité
1. Montrer que, pour toutes matrices $A, B \in \mathcal{M}_n(\mathbb{K})$, $\operatorname{tr}(AB - BA) = 0$.
2. En déduire qu'il n'existe pas de matrices $A, B$ telles que $AB - BA = I_n$. Peut-on avoir $AB - BA = I_3$ ?
3. Donner un exemple de matrices $2 \times 2$ avec $AB - BA \neq 0$.
## Indice
$\operatorname{tr}(AB) = \operatorname{tr}(BA)$ et la linéarité de la trace.
## Indice
$\operatorname{tr}(I_n) = n \neq 0$ (sur $\mathbb{R}$ ou $\mathbb{C}$).
## Indice
Essayer $A = E_{12}$ et $B = E_{21}$.
## Étape · 1
$\operatorname{tr}(AB - BA) = \operatorname{tr}(AB) - \operatorname{tr}(BA) = 0$.
## Étape · 1
Si $AB - BA = I_n$, alors $0 = \operatorname{tr}(I_n) = n$ : impossible. En particulier, pas pour $n = 3$.
## Étape · 1
$E_{12}E_{21} - E_{21}E_{12} = E_{11} - E_{22} = \operatorname{diag}(1, -1)$, non nulle, de trace nulle comme prévu.
## Réponse
qcm B
- oui, par exemple avec des matrices triangulaires
- non, car la trace d'un commutateur est nulle
- non, mais seulement parce que $3$ est impair

# c1 · complexe · 60 · Un endomorphisme tel que u³ = u
Soit $E$ un espace de dimension finie et $u \in \mathcal{L}(E)$ tel que $u^3 = u$. On note $E_0 = \operatorname{Ker} u$, $E_1 = \operatorname{Ker}(u - \mathrm{id})$, $E_{-1} = \operatorname{Ker}(u + \mathrm{id})$.

1. Pour $x \in E$, on pose $x_1 = \frac12(u^2 + u)(x)$, $x_{-1} = \frac12(u^2 - u)(x)$ et $x_0 = x - u^2(x)$. Montrer que $x_0 \in E_0$, $x_1 \in E_1$, $x_{-1} \in E_{-1}$ et $x = x_0 + x_1 + x_{-1}$.
2. Montrer que $E = E_0 \oplus E_1 \oplus E_{-1}$, et écrire la matrice de $u$ dans une base adaptée.
3. Exprimer $\operatorname{tr} u$ et $\operatorname{rg} u$ à l'aide de $a = \dim E_1$ et $b = \dim E_{-1}$.
4. On suppose $\dim E = 5$, $\operatorname{tr} u = 1$ et $\operatorname{rg} u = 3$. Déterminer $\dim E_1$, $\dim E_{-1}$ et $\dim E_0$.
## Indice
Pour 1 : appliquer $u$ et utiliser $u^3 = u$. Pour l'unicité en 2 : si $x_0 + x_1 + x_{-1} = 0$, appliquer $u$ puis $u^2$.
## Indice
Pour 2 : en appliquant $u$ et $u^2$, on obtient $x_1 - x_{-1} = 0$ et $x_1 + x_{-1} = 0$.
## Indice
Pour 3 : dans la base adaptée, $u$ a pour matrice $\operatorname{diag}(0, \ldots, 0, 1, \ldots, 1, -1, \ldots, -1)$.
## Étape · 2
$u(x_0) = u(x) - u^3(x) = 0$ ; $u(x_1) = \frac12(u^3 + u^2)(x) = \frac12(u + u^2)(x) = x_1$ ; $u(x_{-1}) = \frac12(u^3 - u^2)(x) = \frac12(u - u^2)(x) = -x_{-1}$. Et $x_0 + x_1 + x_{-1} = x - u^2(x) + u^2(x) = x$.
## Étape · 2
Si $x_0 + x_1 + x_{-1} = 0$ avec $x_\lambda \in E_\lambda$, en appliquant $u$ : $x_1 - x_{-1} = 0$ ; en appliquant $u^2$ : $x_1 + x_{-1} = 0$. Donc $x_1 = x_{-1} = 0$, puis $x_0 = 0$ : la somme est directe, et égale à $E$ par 1. Dans une base adaptée, la matrice est $\operatorname{diag}(0_{c}, I_a, -I_b)$ avec $c = \dim E_0$.
## Étape · 1
$\operatorname{tr} u = a - b$ et $\operatorname{rg} u = a + b$ (le rang d'une matrice diagonale est le nombre de coefficients non nuls).
## Étape · 1
$a - b = 1$ et $a + b = 3$ donnent $a = 2$, $b = 1$, et $\dim E_0 = 5 - 3 = 2$. Ainsi $u$ est diagonalisable : c'est le lemme des noyaux pour $X^3 - X = X(X - 1)(X + 1)$.
## Réponse
num 2 ± 0.001
