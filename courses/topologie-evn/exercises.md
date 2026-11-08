# s1 · simple · 10 · La meilleure constante entre deux normes
Déterminer la plus petite constante $C$ telle que $\|x\|_1 \le C\,\|x\|_2$ pour tout $x \in \mathbb{R}^3$, et un vecteur pour lequel il y a égalité.
## Indice
$\|x\|_1 = \sum_i |x_i| \cdot 1$ : c'est un produit scalaire.
## Indice
Cauchy-Schwarz avec les vecteurs $(|x_1|, |x_2|, |x_3|)$ et $(1, 1, 1)$.
## Indice
Le cas d'égalité de Cauchy-Schwarz impose la colinéarité.
## Étape · 1
$\|x\|_1 = \sum_i |x_i| \times 1 \le \sqrt{\sum_i |x_i|^2}\,\sqrt{3} = \sqrt3\, \|x\|_2$.
## Étape · 2
Pour $x = (1, 1, 1)$ : $\|x\|_1 = 3$ et $\|x\|_2 = \sqrt 3$, d'où $\|x\|_1 = \sqrt3\, \|x\|_2$ : la constante $\sqrt 3 \approx 1{,}732$ ne peut pas être améliorée.
## Réponse
num 1.732 ± 0.001

# s2 · simple · 10 · Ouvert, fermé, ni l'un ni l'autre
Parmi les parties suivantes de $\mathbb{R}^2$, laquelle est **fermée mais pas ouverte** ?

A) $\{(x, y) : x^2 + y^2 < 1\}$ ; B) $\{(x, y) : xy \ge 1\}$ ; C) $\mathbb{Q} \times \mathbb{Q}$ ; D) $\mathbb{R}^2$.
## Indice
Utiliser les images réciproques d'ouverts ou de fermés par des fonctions continues.
## Indice
$\mathbb{Q} \times \mathbb{Q}$ est dense dans $\mathbb{R}^2$, et son complémentaire aussi.
## Indice
$\mathbb{R}^2$ est à la fois ouvert et fermé.
## Étape · 1
A est ouvert (image réciproque de $]-\infty, 1[$ par $(x, y) \mapsto x^2 + y^2$), et non fermé car $(1, 0)$ est dans son adhérence sans lui appartenir.
## Étape · 2
B est fermé (image réciproque de $[1, +\infty[$ par $(x, y) \mapsto xy$). Il n'est pas ouvert : $(1, 1) \in B$, mais $(1 - \varepsilon, 1) \notin B$ pour tout $\varepsilon > 0$.
## Étape · 1
C n'est ni ouvert ni fermé (son adhérence est $\mathbb{R}^2$, son intérieur est vide) ; D est ouvert et fermé.
## Réponse
qcm B
- le disque ouvert
- $xy \ge 1$
- $\mathbb{Q} \times \mathbb{Q}$
- $\mathbb{R}^2$

# s3 · simple · 10 · Une norme subordonnée
On munit $\mathbb{R}^2$ de la norme $\|\cdot\|_\infty$ et l'on considère $u(x, y) = (2x + y,\ x + 2y)$. Calculer $|||u|||$.
## Indice
Majorer $|2x + y|$ et $|x + 2y|$ à l'aide de $\|(x, y)\|_\infty$.
## Indice
Pour la norme $\|\cdot\|_\infty$, la norme subordonnée d'une matrice est le maximum des sommes des valeurs absolues des lignes.
## Indice
Chercher un vecteur de norme $1$ qui réalise la borne.
## Étape · 1
$|2x + y| \le 2|x| + |y| \le 3\|(x, y)\|_\infty$, et de même pour $|x + 2y|$ : $|||u||| \le 3$.
## Étape · 1
Pour $(1, 1)$, de norme $1$, $u(1, 1) = (3, 3)$, de norme $3$ : $|||u||| = 3$.
## Réponse
num 3 ± 0.001

# m1 · moyen · 30 · Une forme linéaire continue pour une norme, pas pour l'autre
Sur $E = C([0, 1], \mathbb{R})$, on considère la forme linéaire $\varphi(f) = f(0)$.

1. Montrer que $\varphi$ est continue pour $\|\cdot\|_\infty$ et calculer sa norme subordonnée.
2. Pour $n \ge 1$, soit $f_n(t) = \max(0, 1 - nt)$. Calculer $\|f_n\|_1$ et $\varphi(f_n)$.
3. En déduire que $\varphi$ n'est pas continue pour $\|\cdot\|_1$, puis que les normes $\|\cdot\|_1$ et $\|\cdot\|_\infty$ ne sont pas équivalentes. Donner $\|f_5\|_1$.
## Indice
$|f(0)| \le \max_{[0,1]} |f|$.
## Indice
$f_n$ est un triangle de hauteur $1$ et de base $\frac1n$.
## Indice
Une forme linéaire continue vérifie $|\varphi(f)| \le C\, \|f\|$ pour une constante $C$.
## Étape · 1
$|\varphi(f)| = |f(0)| \le \|f\|_\infty$ : $\varphi$ est continue, de norme au plus $1$, et la fonction constante $1$ montre que $|||\varphi||| = 1$.
## Étape · 1
$\|f_n\|_1 = \int_0^{1/n} (1 - nt)\,dt = \frac{1}{2n}$ et $\varphi(f_n) = 1$.
## Étape · 2
Si l'on avait $|\varphi(f)| \le C\, \|f\|_1$, on aurait $1 \le \frac{C}{2n}$ pour tout $n$ : impossible. Donc $\varphi$ n'est pas continue pour $\|\cdot\|_1$.
## Étape · 2
Si les normes étaient équivalentes, une application continue pour l'une le serait pour l'autre : elles ne le sont pas. On a seulement $\|f\|_1 \le \|f\|_\infty$. Enfin $\|f_5\|_1 = \frac{1}{10}$.
## Réponse
num 0.1 ± 0.001

# m2 · moyen · 30 · Les matrices inversibles, ouvertes et denses
On munit $\mathcal{M}_n(\mathbb{R})$ d'une norme quelconque (elles sont toutes équivalentes).

1. Montrer que $GL_n(\mathbb{R})$ est un ouvert de $\mathcal{M}_n(\mathbb{R})$.
2. Soit $A \in \mathcal{M}_n(\mathbb{R})$. Montrer que $A - \frac1k I_n$ est inversible pour tout entier $k$ assez grand. En déduire que $GL_n(\mathbb{R})$ est dense.
3. Montrer que $GL_n(\mathbb{R})$ n'est pas connexe par arcs.
## Indice
Le déterminant est une fonction polynomiale des coefficients.
## Indice
$A - \frac1k I_n$ n'est pas inversible si et seulement si $\frac1k$ est valeur propre de $A$. Combien $A$ a-t-elle de valeurs propres ?
## Indice
Utiliser le théorème des valeurs intermédiaires pour $t \mapsto \det \gamma(t)$ le long d'un chemin $\gamma$.
## Étape · 1
$\det$ est polynomial en les coefficients, donc continu ; $GL_n(\mathbb{R}) = \det^{-1}(\mathbb{R}^*)$ est l'image réciproque d'un ouvert : c'est un ouvert.
## Étape · 2
$A$ a au plus $n$ valeurs propres réelles ; pour $k$ assez grand, $\frac1k$ est strictement plus petit que toutes les valeurs propres strictement positives de $A$, donc n'en est pas une, et $A - \frac1k I_n$ est inversible.
## Étape · 2
Comme $A - \frac1k I_n \to A$, toute matrice est limite de matrices inversibles : $GL_n(\mathbb{R})$ est dense dans $\mathcal{M}_n(\mathbb{R})$.
## Étape · 2
Si un chemin continu $\gamma$ reliait $I_n$ (déterminant $1$) à $\operatorname{diag}(-1, 1, \ldots, 1)$ (déterminant $-1$) dans $GL_n(\mathbb{R})$, la fonction continue $t \mapsto \det \gamma(t)$ s'annulerait d'après le théorème des valeurs intermédiaires : contradiction.
## Étape · 1
Application typique : pour montrer une identité continue en $A$ (comme $\chi_{AB} = \chi_{BA}$), il suffit de la prouver pour $A$ inversible, puis de passer à la limite.

# m3 · moyen · 25 · Continuité uniforme : deux contre-exemples
1. Montrer que $|\sqrt x - \sqrt y| \le \sqrt{|x - y|}$ pour $x, y \ge 0$, et en déduire que $x \mapsto \sqrt x$ est uniformément continue sur $\mathbb{R}_+$.
2. Montrer qu'elle n'est pas lipschitzienne sur $\mathbb{R}_+$.
3. Avec $x_n = n + \frac1n$ et $y_n = n$, montrer que $x \mapsto x^2$ n'est pas uniformément continue sur $\mathbb{R}$. Que vaut $\lim (x_n^2 - y_n^2)$ ?
## Indice
Pour $x \ge y \ge 0$, comparer $(\sqrt x - \sqrt y)^2$ et $x - y$.
## Indice
Le quotient $\frac{\sqrt x - \sqrt 0}{x - 0}$ est-il borné quand $x \to 0^+$ ?
## Indice
Uniformément continue signifierait que $|x_n - y_n| \to 0$ entraîne $|x_n^2 - y_n^2| \to 0$.
## Étape · 2
Pour $x \ge y \ge 0$ : $(\sqrt x - \sqrt y)^2 = x + y - 2\sqrt{xy} \le x + y - 2y = x - y$, car $\sqrt{xy} \ge y$. Donc $|\sqrt x - \sqrt y| \le \sqrt{|x - y|}$, et $\delta = \varepsilon^2$ convient pour tous les points à la fois.
## Étape · 1
$\frac{\sqrt x}{x} = \frac{1}{\sqrt x} \to +\infty$ quand $x \to 0^+$ : aucun rapport $k$ ne convient, la fonction n'est pas lipschitzienne.
## Étape · 2
$x_n - y_n = \frac1n \to 0$ mais $x_n^2 - y_n^2 = 2 + \frac{1}{n^2} \to 2$. Si $x \mapsto x^2$ était uniformément continue, $\varepsilon = 1$ fournirait un $\delta$ tel que $|x - y| \le \delta$ entraîne $|x^2 - y^2| \le 1$, ce qui est faux pour $n$ assez grand.
## Réponse
num 2 ± 0.001

# c1 · complexe · 60 · Dérivée en 0 et norme du maximum
Sur $E_n = \mathbb{R}_n[X]$, on pose $\|P\| = \max_{[0,1]} |P|$.

1. Montrer que c'est une norme sur $E_n$, puis qu'il existe une constante $C_n$ telle que $|P'(0)| \le C_n \|P\|$ pour tout $P \in E_n$. On note $C_n$ la plus petite.
2. Montrer que $C_1 = 2$.
3. Sur $\mathbb{R}[X]$ tout entier muni de la même norme, montrer que $P \mapsto P'(0)$ n'est pas continue, en utilisant $P_k(X) = (1 - X)^k$.
## Indice
Un polynôme nul sur $[0, 1]$ a une infinité de racines. Pour l'existence de $C_n$ : une forme linéaire sur un espace de dimension finie est continue.
## Indice
Pour $P = a + bX$ : $P'(0) = b = P(1) - P(0)$, et $|P(1)|, |P(0)| \le \|P\|$. Chercher un cas d'égalité.
## Indice
$\|(1 - X)^k\| = 1$ et la dérivée de $(1 - X)^k$ en $0$ vaut $-k$.
## Étape · 1
Séparation : si $\max_{[0,1]} |P| = 0$, alors $P$ a une infinité de racines, donc $P = 0$. Homogénéité et inégalité triangulaire viennent de celles de la valeur absolue.
## Étape · 2
$P \mapsto P'(0)$ est une forme linéaire sur $E_n$, de dimension finie $n + 1$ : elle est continue pour n'importe quelle norme (équivalence des normes en dimension finie), d'où l'existence de $C_n$.
## Étape · 2
Pour $P = a + bX$ : $|P'(0)| = |b| = |P(1) - P(0)| \le 2\|P\|$, donc $C_1 \le 2$. Pour $P = 2X - 1$ : $\|P\| = 1$ et $P'(0) = 2$, donc $C_1 = 2$.
## Étape · 2
Sur $\mathbb{R}[X]$ : $P_k = (1 - X)^k$ vérifie $\|P_k\| = 1$ (maximum atteint en $0$) et $P_k'(0) = -k$. Aucune constante $C$ ne donne $k \le C$ pour tout $k$ : la forme $P \mapsto P'(0)$ n'est pas continue en dimension infinie.
## Étape · 1
En particulier $C_n \ge n$ pour tout $n$ et $C_n \to +\infty$. (L'inégalité des frères Markov donne la valeur exacte de l'ordre de grandeur : $C_n = 2n^2$ sur $[0, 1]$, atteint par un polynôme de Tchebychev.)
## Réponse
num 2 ± 0.001

# c2 · complexe · 75 · Le théorème du point fixe de Banach
Soit $F$ une partie fermée non vide de $\mathbb{R}^n$ (muni d'une norme quelconque) et $f : F \to F$ une application **contractante** : il existe $q \in [0, 1[$ tel que $\|f(x) - f(y)\| \le q\,\|x - y\|$ pour tous $x, y \in F$.

1. Soit $x_0 \in F$ et $x_{k+1} = f(x_k)$. Montrer que $\|x_{k+1} - x_k\| \le q^k \|x_1 - x_0\|$, puis que $(x_k)$ est de Cauchy.
2. En déduire que $(x_k)$ converge vers un point $a \in F$ tel que $f(a) = a$, et que ce point fixe est unique.
3. Montrer l'estimation d'erreur $\|x_k - a\| \le \dfrac{q^k}{1 - q}\,\|x_1 - x_0\|$.
4. Application : montrer que $\cos$ envoie $[0, 1]$ dans lui-même et y est contractante, et donner à $10^{-3}$ près l'unique solution de $\cos x = x$ dans $[0, 1]$.
## Indice
Pour $p > k$, $\|x_p - x_k\| \le \sum_{j=k}^{p-1} \|x_{j+1} - x_j\|$ : une série géométrique.
## Indice
$\mathbb{R}^n$ est complet ; $F$ est fermé donc contient la limite. Passer à la limite dans $x_{k+1} = f(x_k)$ ($f$ est lipschitzienne, donc continue).
## Indice
Sur $[0, 1]$, $|\cos'| = |\sin| \le \sin 1 < 1$, et $\cos 1 \approx 0{,}54$.
## Étape · 2
Par récurrence, $\|x_{k+1} - x_k\| = \|f(x_k) - f(x_{k-1})\| \le q\,\|x_k - x_{k-1}\| \le \cdots \le q^k \|x_1 - x_0\|$. Pour $p > k$ : $\|x_p - x_k\| \le \sum_{j \ge k} q^j \|x_1 - x_0\| = \frac{q^k}{1 - q}\|x_1 - x_0\| \to 0$ : la suite est de Cauchy.
## Étape · 2
$\mathbb{R}^n$ est complet (dimension finie), donc $x_k \to a$, et $a \in F$ car $F$ est fermé. Comme $f$ est continue, $f(a) = \lim f(x_k) = \lim x_{k+1} = a$. Si $f(b) = b$ aussi, $\|a - b\| = \|f(a) - f(b)\| \le q\,\|a - b\|$, donc $a = b$.
## Étape · 1
En faisant tendre $p \to \infty$ dans l'inégalité de la première étape : $\|a - x_k\| \le \frac{q^k}{1 - q}\|x_1 - x_0\|$.
## Étape · 2
Pour $x \in [0, 1]$ : $\cos x \in [\cos 1, 1] \subset [0, 1]$, et par l'inégalité des accroissements finis, $|\cos x - \cos y| \le \sin(1)\,|x - y|$ avec $q = \sin 1 \approx 0{,}84 < 1$. Le théorème s'applique sur le fermé $[0, 1]$.
## Étape · 1
En itérant depuis $x_0 = 0$, la suite converge (lentement, avec $q \approx 0{,}84$) vers $a \approx 0{,}7391$. Une méthode de Newton y arriverait en quatre itérations.
## Réponse
num 0.7391 ± 0.0005
