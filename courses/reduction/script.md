<!--
  Réduction des endomorphismes — prépa MP, ≈ 1 h (≈ 30 min de narration + 28 min d'exercices).
  Cadre : E est un K-espace vectoriel de dimension finie n ≥ 1 (K = R ou C), u ∈ L(E).
-->

# Pourquoi réduire ? {#pourquoi}

## p1
{{anim:title text="RÉDUCTION DES ENDOMORPHISMES" kicker="V3CT0R LEARN · PRÉPA MP" sub="trouver la base où un endomorphisme devient simple" hold=2}}
Bonjour. Le sujet de cette séance est l'un des plus importants de l'algèbre linéaire de prépa : la réduction. L'idée tient en une phrase. Un endomorphisme est d'autant plus facile à comprendre que sa matrice est simple, et la matrice dépend de la base. Réduire, c'est choisir la base qui rend la matrice la plus simple possible : diagonale si l'on peut, triangulaire sinon.

## p2
{{scene:principles/linear a=2 b=1 c=1 d=2 t=0 auto=off}}{{scene:set t=1 dur=4}}
Regarde cette application linéaire du plan, de matrice $A$ égale à deux, un, un, deux. Elle déforme le carré unité en un parallélogramme, et la plupart des vecteurs changent de direction. Mais pas tous. {{anim:write eq=A21 slot=n size=sm}}Le vecteur $(1,1)$ est simplement multiplié par $3$, et le vecteur $(1,-1)$ est inchangé. Dans la base formée de ces deux vecteurs, l'application agit coordonnée par coordonnée : elle dilate d'un facteur $3$ dans une direction, et ne fait rien dans l'autre. Sa matrice y est diagonale.

## p3
{{scene:none}}{{anim:clear}}{{anim:grid id=G slot=e m=2,1,1,2 dur=4 eig}}
Voici la même application sur une grille. Les deux droites en pointillés sont stables : ce sont les directions propres. Une fois ces directions trouvées, tout devient calculable. Les puissances $A^k$, d'abord, qui interviennent dans les suites récurrentes linéaires comme Fibonacci. Puis les exponentielles de matrices, qui résolvent les systèmes différentiels linéaires. {{anim:text slot=w text="**Le fil de la séance**\n\n1. Éléments propres\n2. Polynôme caractéristique\n3. Critères de diagonalisation\n4. Polynômes annulateurs, Cayley-Hamilton\n5. Trigonalisation"}}Dans toute la séance, $E$ est un espace vectoriel de dimension finie $n$ sur $\mathbb{K}$, égal à $\mathbb{R}$ ou $\mathbb{C}$, et $u$ est un endomorphisme de $E$.

# Éléments propres {#propres}

## v1
{{anim:clear}}{{box:def-vp slot=n}}
Un scalaire $\lambda$ est une valeur propre de $u$ s'il existe un vecteur $x$ non nul tel que $u(x) = \lambda x$. {{anim:write eq=eig slot=s size=lg}}Le vecteur $x$ est alors un vecteur propre. L'exigence $x$ non nul est essentielle : sinon, tout scalaire conviendrait, avec le vecteur nul.

## v2
{{anim:clear}}{{anim:write eq=Elam slot=n size=md}}
L'ensemble des vecteurs qui vérifient $u(x) = \lambda x$, vecteur nul compris, est le noyau de $u - \lambda\,\mathrm{id}_E$. C'est un sous-espace vectoriel, le sous-espace propre $E_\lambda(u)$. Dire que $\lambda$ est valeur propre, c'est dire que ce noyau n'est pas réduit au vecteur nul, c'est-à-dire que $u - \lambda\,\mathrm{id}_E$ n'est pas injectif. {{anim:write eq=vpdet slot=s size=sm}}En dimension finie, cela équivaut à dire que $u - \lambda\,\mathrm{id}_E$ n'est pas inversible, et donc que son déterminant est nul. Cette équivalence va nous donner un moyen de calcul.

## v3
{{anim:clear}}{{box:prop-somme slot=n}}
Premier résultat de structure : des sous-espaces propres associés à des valeurs propres distinctes sont en somme directe. La preuve est une récurrence élégante. Supposons que $x_1 + \cdots + x_p = 0$, avec chaque $x_i$ dans $E_{\lambda_i}$. {{anim:write eq=direct slot=s size=md}}Appliquons $u - \lambda_p\,\mathrm{id}$ : le dernier terme disparaît, et chacun des autres est multiplié par $\lambda_i - \lambda_p$, qui n'est pas nul. L'hypothèse de récurrence force ces vecteurs à être nuls, donc $x_1, \ldots, x_{p-1}$ sont nuls, puis $x_p$ aussi.

## v3b
{{anim:clear}}{{box:prop-comm slot=n}}{{anim:write eq=comm slot=s size=md}}
Une remarque que l'on utilise sans cesse en exercice : si deux endomorphismes $u$ et $v$ commutent, les sous-espaces propres de l'un sont stables par l'autre. La preuve tient en une ligne : si $u(x) = \lambda x$, alors $u$ appliqué à $v(x)$ vaut $v$ appliqué à $u(x)$, c'est-à-dire $\lambda\,v(x)$. Donc $v(x)$ est encore dans le sous-espace propre. C'est le point de départ de la codiagonalisation : deux endomorphismes diagonalisables qui commutent se diagonalisent dans une même base.

## v4
{{anim:clear}}{{anim:write eq=rot slot=n size=md}}
Conséquence immédiate : une famille de vecteurs propres associés à des valeurs propres distinctes est libre, et $u$ possède au plus $n$ valeurs propres. Il peut aussi n'en avoir aucune. La rotation d'angle $\theta$ du plan réel, pour $\theta$ non multiple de $\pi$, ne laisse aucune droite stable : elle n'a pas de valeur propre réelle. {{anim:grid id=R slot=s m=0.5,-0.866,0.866,0.5 dur=3}}Le corps compte : sur $\mathbb{C}$, cette même matrice a deux valeurs propres, $e^{i\theta}$ et $e^{-i\theta}$. À toi de trouver les éléments propres d'une première matrice.
{{exercise:ex1 minutes=5}}

# Polynôme caractéristique {#caracteristique}

## c1
{{anim:clear}}{{box:def-chi slot=n}}
Pour une matrice carrée $A$ de taille $n$, le polynôme caractéristique est le déterminant de $X I_n - A$, où $X$ est une indéterminée. {{anim:write eq=chi slot=s size=md}}C'est un polynôme unitaire de degré $n$. Son coefficient de degré $n - 1$ est l'opposé de la trace, et son coefficient constant vaut $(-1)^n$ fois le déterminant. Ses racines dans $\mathbb{K}$ sont exactement les valeurs propres de $A$, d'après l'équivalence que nous venons de voir.

## c2
{{anim:clear}}{{anim:write eq=chi2 slot=n size=md}}
En dimension $2$, c'est la formule à connaître par cœur : $X^2 - \operatorname{tr}(A) X + \det(A)$. Pour la matrice de l'introduction, la trace vaut $4$ et le déterminant $3$ : on retrouve les racines $1$ et $3$. {{anim:write eq=simil slot=s size=md}}Deux matrices semblables ont le même polynôme caractéristique : il suffit de factoriser $X I_n - P^{-1} A P$ et d'utiliser la multiplicativité du déterminant. On peut donc parler du polynôme caractéristique de l'endomorphisme $u$, en prenant sa matrice dans n'importe quelle base.

## c3
{{anim:clear}}{{box:prop-chi slot=n}}
Chaque valeur propre $\lambda$ a une multiplicité $m_\lambda$, sa multiplicité comme racine de $\chi_u$. Elle est à comparer avec la dimension du sous-espace propre. {{anim:write eq=dimineq slot=s size=lg}}La dimension est toujours comprise entre $1$ et $m_\lambda$. Elle vaut au moins $1$ puisque $\lambda$ est valeur propre. Pour la majoration, voici l'argument.

## c4
{{anim:clear}}{{box:prop-dim slot=n}}{{anim:write eq=block slot=s size=md}}
Soit $d$ la dimension de $E_\lambda$. On choisit une base de $E_\lambda$ et on la complète en une base de $E$. Les $d$ premiers vecteurs sont propres : la matrice de $u$ commence par le bloc $\lambda I_d$, avec des zéros en dessous. Le déterminant d'une matrice triangulaire par blocs est le produit des déterminants des blocs diagonaux : $\chi_u$ est divisible par $(X - \lambda)^d$, donc $d$ est au plus $m_\lambda$. Note que le cas où la dimension est strictement plus petite existe vraiment, comme tu vas le voir.
{{exercise:ex2 minutes=6}}

# Diagonalisation {#diagonalisation}

## d1
{{anim:clear}}{{box:def-diag slot=n}}
L'endomorphisme $u$ est diagonalisable s'il existe une base de $E$ formée de vecteurs propres. Dans une telle base, la matrice de $u$ est diagonale, et ses coefficients diagonaux sont les valeurs propres. Pour une matrice, cela s'écrit $A = P D P^{-1}$, où les colonnes de $P$ sont les vecteurs propres.

## d2
{{anim:clear}}{{box:thm-diag slot=n}}
Voici le théorème central. Quatre assertions sont équivalentes. Un : $u$ est diagonalisable. Deux : $E$ est la somme directe des sous-espaces propres. Trois : la somme de leurs dimensions vaut $n$. Quatre : le polynôme caractéristique est scindé, et pour chaque valeur propre, la dimension du sous-espace propre est égale à la multiplicité. {{anim:write eq=diagcns slot=s size=sm}}La quatrième est la plus utile en pratique, car elle se vérifie par le calcul.

## d3
{{anim:clear}}{{box:pf-diag slot=n}}{{anim:write eq=chain slot=s size=md}}
La preuve est un enchaînement d'arguments déjà vus. Une base de vecteurs propres montre que $E$ est la somme des sous-espaces propres, et cette somme est directe : c'est le premier résultat de la séance. En réunissant des bases des sous-espaces propres, on obtient une famille libre, et si sa taille est $n$, c'est une base. Enfin, la somme des dimensions est majorée par la somme des multiplicités, elle-même majorée par le degré de $\chi_u$, égal à $n$. Il y a égalité si et seulement si le polynôme est scindé et si chaque dimension atteint sa multiplicité.

## d4
{{anim:clear}}{{box:cor-simple slot=n}}
Le cas le plus fréquent en exercice est celui-ci : si $\chi_u$ a $n$ racines distinctes, $u$ est diagonalisable, sans autre calcul. En effet, chaque sous-espace propre a une dimension au moins égale à $1$, et il y en a $n$. Attention, la réciproque est fausse : l'identité est diagonalisable, et sa seule valeur propre est de multiplicité $n$. {{anim:write eq=jordan2 slot=s size=md}}À l'inverse, la matrice $N$ ci-dessous a une valeur propre double mais un sous-espace propre de dimension $1$ : elle n'est pas diagonalisable.

## d4b
{{anim:clear}}{{anim:write eq=m3 slot=n size=md}}
Faisons une diagonalisation complète, comme à l'oral. Prenons la matrice $A$ de taille $3$ dont tous les coefficients valent $1$, sauf la diagonale, qui est nulle. Plutôt que de développer un déterminant, observons que $A + I$ a toutes ses colonnes égales : elle est de rang $1$. Son noyau, c'est-à-dire $E_{-1}$, est donc de dimension $2$, par le théorème du rang. Ainsi $-1$ est valeur propre de multiplicité au moins $2$. La trace de $A$ est nulle, et c'est la somme des valeurs propres : la troisième vaut $2$. {{anim:write eq=m3b slot=s size=md}}Le sous-espace $E_2$ est la droite engendrée par $(1,1,1)$, et $E_{-1}$ est le plan d'équation $x + y + z = 0$. Les dimensions font $1 + 2 = 3$ : $A$ est diagonalisable. Retiens la méthode : chercher d'abord les sous-espaces propres évidents, puis compléter avec la trace.
{{box:ex-m3 slot=c}}

## d5
{{anim:clear}}{{anim:write eq=PDP slot=n size=md}}
À quoi sert une diagonalisation ? D'abord à calculer les puissances. Si $A = P D P^{-1}$, les facteurs $P^{-1} P$ se simplifient dans le produit, et $A^k = P D^k P^{-1}$. Or $D^k$ s'obtient en élevant chaque coefficient diagonal à la puissance $k$. {{anim:write eq=Ak slot=s size=md}}Pour notre matrice $A$, on obtient la formule explicite écrite ici. Vérifie-la pour $k = 1$ : on retrouve bien deux, un, un, deux.

## d6
{{anim:clear}}{{box:ex-fib slot=n}}{{anim:write eq=fib slot=sw size=sm}}
Même idée pour les suites récurrentes linéaires. La suite de Fibonacci s'écrit comme les itérés d'une matrice $2 \times 2$. Son polynôme caractéristique est $X^2 - X - 1$, dont les racines sont le nombre d'or $\varphi$ et son conjugué. Elles sont distinctes : la matrice est diagonalisable. {{anim:write eq=binet slot=se size=sm}}On en déduit la formule de Binet. Comme le conjugué de $\varphi$ est de valeur absolue strictement inférieure à $1$, $F_n$ est l'entier le plus proche de $\frac{\varphi^n}{\sqrt5}$. À toi de calculer une puissance.
{{exercise:ex3 minutes=7}}

# Polynômes annulateurs {#annulateurs}

## a1
{{anim:clear}}{{anim:write eq=poly slot=n size=md}}
Changeons de point de vue. Pour un polynôme $P$, on peut évaluer $P$ en $u$ : on remplace $X^k$ par la composée $u^k$, et la constante par un multiple de l'identité. Cette évaluation respecte les sommes et les produits, et deux polynômes en $u$ commutent toujours. Un polynôme annulateur de $u$ est un polynôme $P$ tel que $P(u) = 0$.

## a2
Il en existe toujours un non nul. En effet, l'espace des endomorphismes de $E$ est de dimension $n^2$, donc les $n^2 + 1$ endomorphismes $\mathrm{id}, u, \ldots, u^{n^2}$ forment une famille liée. Une relation de dépendance non triviale fournit un polynôme annulateur. Les polynômes annulateurs forment un idéal de $\mathbb{K}[X]$ ; son générateur unitaire est le polynôme minimal $\pi_u$. {{anim:write eq=annul slot=s size=sm}}Et voici le lien avec le spectre : si $P$ annule $u$ et si $x$ est un vecteur propre pour $\lambda$, alors $P(u)(x) = P(\lambda) x$. Ce vecteur est nul alors que $x$ ne l'est pas : $P(\lambda) = 0$. Toute valeur propre est racine de tout polynôme annulateur.

## a2b
{{anim:clear}}{{box:def-min slot=n}}{{anim:write eq=minpoly slot=s size=md}}
Précisons le polynôme minimal. L'ensemble des polynômes qui annulent $u$ est stable par somme, et par produit par n'importe quel polynôme : c'est un idéal de $\mathbb{K}[X]$. Comme $\mathbb{K}[X]$ est principal, cet idéal est formé des multiples d'un unique polynôme unitaire, le polynôme minimal. Concrètement : $P$ annule $u$ si et seulement si $\pi_u$ divise $P$. Pour la matrice $N$ vue tout à l'heure, $N - I$ n'est pas nulle mais son carré l'est. Le polynôme minimal est donc $(X - 1)^2$, qui a une racine double. Garde cet exemple en tête : il va illustrer le critère suivant.

## a3
{{anim:clear}}{{box:lem-noyaux slot=n}}
L'outil clé est le lemme des noyaux. Si $P$ et $Q$ sont premiers entre eux, le noyau de $PQ$ évalué en $u$ est la somme directe des noyaux de $P(u)$ et de $Q(u)$. {{anim:write eq=noyaux slot=s size=md id=nk}}La preuve repose sur l'identité de Bézout.

## a4
{{anim:clear}}{{anim:write eq=bezout slot=n size=md}}
Bézout fournit deux polynômes $U$ et $V$ avec $UP + VQ = 1$. On l'évalue en $u$, et on l'applique à un vecteur $x$ du noyau de $PQ$. Le premier terme est annulé par $Q(u)$, car $Q(u) U(u) P(u)$ est égal à $U(u)$ composé avec $PQ$ évalué en $u$, qui annule $x$. Le second terme est annulé par $P(u)$, pour la même raison. Ainsi $x$ est somme d'un élément de chaque noyau. Et si $x$ est dans les deux noyaux à la fois, la même identité montre que $x$ est nul : la somme est directe. Par récurrence, le lemme s'étend à un nombre quelconque de polynômes deux à deux premiers entre eux.

## a5
{{anim:clear}}{{box:thm-annul slot=n}}
On obtient alors un critère d'une grande efficacité : $u$ est diagonalisable si et seulement s'il est annulé par un polynôme scindé à racines simples. {{anim:write eq=diagpoly slot=s size=sm}}Si $P$ est le produit des $X - \lambda_i$, avec des $\lambda_i$ distincts, les facteurs sont deux à deux premiers entre eux. Le lemme des noyaux écrit alors $E$, qui est le noyau de $P(u)$, comme somme directe des noyaux des $u - \lambda_i\,\mathrm{id}$ : ce sont des sous-espaces propres, ou le sous-espace nul. Réciproquement, si $u$ est diagonalisable, le produit des $X - \lambda$ sur son spectre s'annule sur une base de vecteurs propres.

## a6
{{anim:clear}}{{anim:write eq=proj slot=n size=md}}
Exemple typique : un projecteur vérifie $p \circ p = p$. Le polynôme $X(X - 1)$ l'annule, et il est scindé à racines simples : tout projecteur est diagonalisable, de spectre contenu dans $\{0, 1\}$. De même, une symétrie vérifie $s^2 = \mathrm{id}$ : elle est annulée par $(X - 1)(X + 1)$. Aucun polynôme caractéristique n'est nécessaire. Vérifie-le toi-même.
{{exercise:ex4 minutes=5}}

## a7
{{anim:clear}}{{box:thm-ch slot=n}}{{anim:write eq=ch slot=s size=xl}}
Reste une question naturelle : connaît-on un polynôme annulateur pour tout endomorphisme ? Oui, et c'est le théorème de Cayley-Hamilton : le polynôme caractéristique annule $u$. Attention au piège classique : on ne peut pas remplacer $X$ par $A$ dans le déterminant de $X I_n - A$, car $X$ y multiplie des scalaires, pas des matrices. Il faut une vraie preuve.

## a8
{{anim:clear}}{{box:pf-ch slot=n}}{{anim:write eq=comat slot=s size=sm}}
On utilise la comatrice. Le produit de $X I_n - A$ par la transposée de sa comatrice vaut son déterminant fois l'identité, c'est-à-dire $\chi_A(X) I_n$. Les coefficients de la comatrice sont des déterminants de taille $n - 1$, donc des polynômes de degré au plus $n - 1$ : on peut l'écrire comme un polynôme à coefficients matriciels $B_k$. {{anim:write eq=coef slot=sw size=sm}}On identifie les coefficients de chaque puissance de $X$ : $a_k I_n = B_{k-1} - A B_k$. {{anim:write eq=telesc slot=se size=sm}}On multiplie la relation d'indice $k$ à gauche par $A^k$, et l'on somme : à gauche apparaît $\chi_A(A)$, à droite une somme télescopique, qui vaut zéro. Conséquence : le polynôme minimal divise le polynôme caractéristique, et tous deux ont pour racines les valeurs propres.

## a8b
{{anim:clear}}{{box:ex-inv slot=n}}{{anim:write eq=inv2 slot=s size=md}}
Une application immédiate : le calcul de l'inverse. En dimension $2$, Cayley-Hamilton s'écrit $A^2 - \operatorname{tr}(A) A + \det(A) I_2 = 0$. Si le déterminant n'est pas nul, on isole le terme constant, on factorise par $A$, et l'on obtient l'inverse sans aucun calcul de comatrice. En dimension quelconque, le même argument montre que l'inverse d'une matrice inversible est un polynôme en cette matrice : c'est utile pour montrer qu'un sous-espace stable par $A$ l'est aussi par $A^{-1}$.

# Trigonalisation {#trigonalisation}

## t1
{{anim:clear}}{{box:thm-trig slot=n}}
Toutes les matrices ne sont pas diagonalisables. Que peut-on faire de mieux ? Les rendre triangulaires. Le théorème est simple : $u$ est trigonalisable si et seulement si son polynôme caractéristique est scindé. Sur $\mathbb{C}$, d'après le théorème de d'Alembert-Gauss, c'est toujours le cas : toute matrice complexe est trigonalisable.

## t2
{{anim:clear}}{{box:pf-trig slot=n}}{{anim:write eq=trig slot=s size=md}}
Le sens direct est immédiat : le polynôme caractéristique d'une matrice triangulaire est le produit des $X - t_{ii}$. Pour la réciproque, on raisonne par récurrence sur la dimension. Le polynôme étant scindé, il a une racine $\lambda$ ; on prend un vecteur propre, que l'on complète en une base. La matrice prend la forme écrite ici, et le polynôme caractéristique de $A'$ est encore scindé, puisqu'il divise $\chi_u$. L'hypothèse de récurrence trigonalise $A'$, et une matrice de passage par blocs conclut.

## t2b
{{anim:clear}}{{box:prop-nilp slot=n}}{{anim:write eq=nilp slot=s size=md}}
Cas particulier important : les endomorphismes nilpotents, ceux dont une puissance est nulle. Si $N^k = 0$ et si $\lambda$ est une valeur propre complexe, de vecteur propre $x$, alors $N^k x = \lambda^k x$ est nul, donc $\lambda = 0$. Le polynôme caractéristique, scindé sur $\mathbb{C}$ avec $0$ pour seule racine, est $X^n$, et Cayley-Hamilton donne aussitôt $N^n = 0$ : un nilpotent devient nul dès la puissance $n$. Un nilpotent non nul n'est jamais diagonalisable, car une matrice diagonalisable de seule valeur propre $0$ est nulle. On peut le trigonaliser avec une diagonale nulle. C'est l'ingrédient de base de la décomposition de Dunford, que tu verras plus tard : tout endomorphisme à polynôme caractéristique scindé est la somme d'un diagonalisable et d'un nilpotent qui commutent.

## t3
{{anim:clear}}{{anim:write eq=trdet slot=n size=md}}
Conséquence très utile : dans une base où la matrice est triangulaire, la diagonale porte les valeurs propres, chacune répétée selon sa multiplicité. La trace étant invariante par similitude, elle est la somme des valeurs propres comptées avec multiplicité, et le déterminant en est le produit. Sur $\mathbb{C}$, cela vaut pour toute matrice. Un dernier exercice pour t'en servir.
{{exercise:ex5 minutes=5}}

# Bilan {#bilan}

## b1
{{anim:clear}}{{box:rem-bilan slot=c}}
Faisons le bilan sous forme de méthode. Si la matrice a $n$ valeurs propres distinctes, elle est diagonalisable, c'est fini. Si tu vois un polynôme annulateur évident, regarde s'il est scindé à racines simples. Sinon, calcule le polynôme caractéristique, puis compare la dimension de chaque sous-espace propre à la multiplicité, pour les valeurs propres multiples seulement. Et si la diagonalisation échoue, la trigonalisation reste possible dès que le polynôme est scindé, en particulier toujours sur $\mathbb{C}$.

## b1b
{{anim:clear}}{{anim:write eq=expo slot=n size=sm}}
Deux remarques pour finir. D'abord, le corps compte : la rotation du début n'est pas diagonalisable sur $\mathbb{R}$, mais elle l'est sur $\mathbb{C}$, car ses deux valeurs propres complexes sont distinctes. Ensuite, voici pourquoi les physiciens et les ingénieurs tiennent tant à la réduction. Pour un système différentiel linéaire $X' = AX$ avec $A$ diagonalisable, on change de variable avec $P$ : le système se découple en $n$ équations scalaires $y_i' = \lambda_i y_i$, que l'on résout par des exponentielles. Le signe des parties réelles des valeurs propres dit alors si les solutions explosent ou s'éteignent. {{anim:grid id=E slot=s m=1.6,0,0,0.5 dur=3 eig}}

## b2
{{anim:clear}}{{anim:grid id=G slot=c m=2,1,1,2 dur=3 eig}}
La suite naturelle de ce cours est double. D'un côté, les espaces euclidiens et le théorème spectral : une matrice symétrique réelle se diagonalise dans une base orthonormée. De l'autre, les systèmes différentiels linéaires, que la réduction permet de résoudre via l'exponentielle de matrice. Pense à la fiche récapitulative et à la colle. À bientôt.
{{anim:title text="FIN DE LA SÉANCE" kicker="RÉDUCTION DES ENDOMORPHISMES" sub="Fiche récapitulative et colle : boutons à gauche." hold=3}}
