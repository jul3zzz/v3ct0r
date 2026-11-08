<!--
  L'intégrale de Riemann, construite proprement — prépa MPSI/MP, ≈ 45 min (≈ 24 min de narration + 21 min d'exercices).
  Approche : fonctions en escalier, intégrales inférieure et supérieure (Darboux), critère, continuité, sommes de Riemann, TFA.
-->

# Pourquoi construire l'intégrale ? {#pourquoi}

## p1
{{anim:title text="L'INTÉGRALE DE RIEMANN" kicker="V3CT0R LEARN · PRÉPA MPSI/MP" sub="construite proprement" hold=2}}
Bonjour. Dans cette séance, nous allons construire l'intégrale de Riemann à partir de rien, ou presque : à partir des seules propriétés des nombres réels. Pas d'appel à l'intuition de l'aire, pas de dessin qui tienne lieu de preuve. Le dessin, nous l'aurons, mais il viendra illustrer des énoncés exacts.

## p2
{{anim:axes id=A slot=w x=-0.2,3.3 y=-0.4,2.4 xl=x yl=y}}{{anim:curve on=A id=c fn="1 + 0.6*sin(1.7*x) + 0.15*x" from=0 to=3}}
Tu sais depuis longtemps que l'intégrale d'une fonction positive représente l'aire sous sa courbe. {{anim:area on=A fn="1 + 0.6*sin(1.7*x) + 0.15*x" from=0.4 to=2.7}}Mais qu'est-ce que l'aire d'une région limitée par une courbe quelconque ? Pour un rectangle, la réponse est une définition : base fois hauteur. Pour le reste, il faut une construction.
{{anim:text slot=e text="**Le plan de la séance**\n\n1. Intégrer les fonctions en escalier : là, l'aire est une somme de rectangles.\n2. Encadrer une fonction bornée entre deux fonctions en escalier.\n3. Déclarer intégrable une fonction quand l'encadrement peut être rendu aussi serré que l'on veut."}}
Le plan est simple. Premièrement, on sait intégrer les fonctions en escalier, puisqu'une telle fonction ne dessine que des rectangles. Deuxièmement, on encadre une fonction bornée entre des fonctions en escalier. Troisièmement, on déclare la fonction intégrable lorsque cet encadrement peut être rendu aussi fin que l'on veut. Toute la séance consiste à rendre ces trois phrases rigoureuses, puis à en tirer les théorèmes que tu utilises tous les jours.

# Subdivisions et fonctions en escalier {#escalier}

## e1
{{box:def-subdiv slot=n}}
Fixons un segment $[a,b]$, avec $a < b$. Une subdivision de ce segment est une suite finie de points $\sigma = (x_0, \ldots, x_n)$, strictement croissante, qui commence en $a$ et finit en $b$. {{anim:write eq=subdiv slot=s size=md}}
Le pas de la subdivision, noté $\delta(\sigma)$, est la plus grande des longueurs $x_i - x_{i-1}$. {{anim:write eq=pas slot=s size=md}}
On dit qu'une subdivision $\sigma'$ est plus fine que $\sigma$ lorsqu'elle contient tous ses points, et peut-être d'autres. Retiens surtout ceci : deux subdivisions ont toujours une subdivision commune plus fine que chacune, leur réunion. Ce fait banal fera tout le travail.

## e2
{{anim:clear}}{{box:def-esc slot=n}}
Une fonction $\varphi$ définie sur $[a,b]$ est dite en escalier s'il existe une subdivision telle que $\varphi$ soit constante sur chaque intervalle ouvert $]x_{i-1}, x_i[$. {{anim:write eq=esc slot=s size=md}}On appelle $c_i$ cette constante, et l'on dit que la subdivision est adaptée à $\varphi$. Attention au mot ouvert : aux points de la subdivision eux-mêmes, $\varphi$ peut prendre n'importe quelles valeurs.

## e3
{{anim:clear}}{{anim:axes id=B slot=w x=-0.2,3.3 y=-1.6,4.6 xl=x}}{{anim:segment on=B at=0,2,1,2 bold}}{{anim:segment on=B at=1,-1,2.5,-1 bold}}{{anim:segment on=B at=2.5,4,3,4 bold}}{{anim:point on=B x=1 y=3}}
Voici une fonction en escalier sur $[0,3]$. Elle vaut $2$, puis $-1$, puis $4$, avec une valeur isolée en $1$ qui ne compte pas. Son intégrale est, par définition, la somme des aires algébriques des rectangles. {{anim:write eq=Iesc slot=e id=ie}}
Mais cette définition fait intervenir une subdivision adaptée, et il y en a une infinité : on peut toujours en ajouter des points. Il faut donc vérifier que le résultat n'en dépend pas.

## e4
{{box:lem-refine slot=ne}}
Ajoutons un seul point $y$ entre $x_{i-1}$ et $x_i$. {{anim:morph from=ie to=split slot=se}}Le terme $c_i(x_i - x_{i-1})$ se coupe en deux termes, $c_i(y - x_{i-1})$ et $c_i(x_i - y)$, dont la somme est la même. Par récurrence sur le nombre de points ajoutés, toute subdivision plus fine donne la même somme. Et si l'on dispose de deux subdivisions adaptées, leur réunion est plus fine que chacune : les deux sommes sont égales à celle de la réunion, donc égales entre elles. La quantité $I(\varphi)$ est bien définie.

## e5
{{anim:clear}}{{box:prop-esc slot=c}}
La même idée de subdivision commune montre que la somme de deux fonctions en escalier est en escalier : on prend une subdivision adaptée aux deux. L'ensemble $\mathcal{E}([a,b])$ est donc un espace vectoriel, et $I$ est linéaire. Elle est aussi positive : si $\varphi \ge 0$, toutes les constantes $c_i$ sont positives, donc $I(\varphi) \ge 0$. Par linéarité, $\varphi \le \psi$ entraîne $I(\varphi) \le I(\psi)$. Cette croissance est la seule propriété dont nous aurons besoin pour la suite.
À toi de jouer avec un premier calcul.
{{exercise:ex1 minutes=4}}

# Intégrales inférieure et supérieure {#darboux}

## d1
{{anim:clear}}{{anim:title text="ENCADRER" kicker="CHAPITRE 3" sub="une fonction bornée entre deux fonctions en escalier" hold=1.2}}
Prenons maintenant une fonction $f$ bornée sur $[a,b]$ : il existe $m$ et $M$ tels que $m \le f \le M$. Les constantes $m$ et $M$ sont des fonctions en escalier : il existe donc toujours des fonctions en escalier en dessous de $f$, et au-dessus.

## d2
{{anim:axes id=A slot=w x=-0.05,1.1 y=-0.1,1.1 xl=x yl=y}}{{anim:curve on=A id=c fn="x^2" from=0 to=1}}
Regarde la parabole $y = x^2$ sur $[0,1]$. {{anim:darboux on=A id=lo fn="x^2" from=0 to=1 n=6 kind=lower}}En dessous, les fonctions en escalier qui la minorent. {{anim:darboux on=A id=up fn="x^2" from=0 to=1 n=6 kind=upper}}Au-dessus, celles qui la majorent. On définit l'intégrale inférieure de $f$ comme la borne supérieure des intégrales des fonctions en escalier situées sous $f$, {{anim:write eq=Iminus slot=ne size=md}}et l'intégrale supérieure comme la borne inférieure des intégrales de celles qui sont au-dessus. {{anim:write eq=Iplus slot=se size=md}}

## d3
{{anim:fade slot=ne}}{{anim:fade slot=se}}
Ces deux nombres sont finis, et toujours rangés dans le même ordre. En effet, si $\varphi \le f \le \psi$, la croissance de $I$ donne $I(\varphi) \le I(\psi)$. Fixons $\psi$ et passons à la borne supérieure sur $\varphi$ : $I^-(f) \le I(\psi)$. Puis passons à la borne inférieure sur $\psi$. {{anim:write eq=order slot=e id=o}}On obtient l'encadrement $I^-(f) \le I^+(f)$, et les constantes $m$ et $M$ donnent les bornes extrêmes.

## d4
{{box:def-riemann slot=ne}}{{anim:morph from=o to=def slot=se id=d}}
Voici la définition centrale. On dit que $f$ est intégrable au sens de Riemann lorsque ses intégrales inférieure et supérieure sont égales. {{anim:highlight on=d term=lo}}Leur valeur commune est notée intégrale de $a$ à $b$ de $f$. Remarque de cohérence : si $f$ est elle-même en escalier, elle se minore et se majore elle-même, donc les deux bornes valent $I(f)$, et la nouvelle définition prolonge l'ancienne.

## d5
{{anim:clear}}{{box:thm-crit slot=n}}
En pratique, on n'utilise presque jamais la définition telle quelle, mais le critère suivant : $f$ est intégrable si et seulement si, pour tout $\varepsilon$ strictement positif, on peut glisser $f$ entre deux fonctions en escalier dont les intégrales diffèrent d'au plus $\varepsilon$. {{box:pf-crit slot=s}}La preuve tient en deux lignes. Dans un sens, on approche la borne supérieure et la borne inférieure à $\frac{\varepsilon}{2}$ près. Dans l'autre, l'écart entre $I^+(f)$ et $I^-(f)$ est coincé entre $0$ et $\varepsilon$ pour tout $\varepsilon$ : il est nul.

## d6
{{anim:clear}}{{box:def-subdiv slot=n}}{{anim:write eq=darboux slot=c size=md}}
Pour une subdivision $\sigma$, notons $m_i$ et $M_i$ la borne inférieure et la borne supérieure de $f$ sur l'intervalle ouvert $]x_{i-1}, x_i[$. {{anim:write eq=mi slot=s size=md}}Les sommes $s(f,\sigma)$ et $S(f,\sigma)$ sont les sommes de Darboux. Ce sont les intégrales de deux fonctions en escalier qui encadrent $f$, et ce sont les meilleures possibles pour cette subdivision : toute fonction en escalier sous $f$ adaptée à $\sigma$ a une intégrale inférieure ou égale à $s(f,\sigma)$. Ainsi $I^-(f)$ est la borne supérieure des $s(f,\sigma)$, et $I^+(f)$ la borne inférieure des $S(f,\sigma)$.

## d6b
{{anim:clear}}{{box:lem-darboux slot=n}}{{anim:write eq=refine slot=c size=md}}
Ces sommes ont un comportement très régulier quand on raffine. Ajoutons un point $y$ dans le morceau $]x_{i-1}, x_i[$. La borne inférieure de $f$ sur chacun des deux nouveaux morceaux est au moins égale à $m_i$, puisqu'on prend une borne inférieure sur un ensemble plus petit. La somme inférieure ne peut donc qu'augmenter. Symétriquement, la somme supérieure ne peut que diminuer. Par récurrence, raffiner rapproche les deux sommes. {{anim:write eq=cross slot=s size=md}}Et pour deux subdivisions quelconques, on passe par leur réunion : toute somme inférieure est plus petite que toute somme supérieure. C'est une autre façon de voir que $I^-(f) \le I^+(f)$, et c'est l'outil de calcul le plus commode.

## d7
{{anim:clear}}{{anim:axes id=A slot=w x=-0.05,1.1 y=-0.1,1.1 xl=x yl=y}}{{anim:curve on=A id=c fn="x^2" from=0 to=1}}{{anim:darboux on=A id=bb fn="x^2" from=0 to=1 n=4 kind=both}}
Revenons à la parabole avec la subdivision régulière à $n$ pas. Comme $x \mapsto x^2$ est croissante sur $[0,1]$, $m_k$ est la valeur à gauche et $M_k$ la valeur à droite. La formule de la somme des carrés donne les deux sommes exactement. {{anim:write eq=x2 slot=ne size=sm}}{{anim:tween id=bb n=24 dur=4}}Leur différence vaut exactement $\frac{1}{n}$. {{anim:write eq=gap slot=se size=sm}}Pour $n$ assez grand, l'écart passe sous n'importe quel $\varepsilon$ : le critère s'applique, et l'intégrale vaut un tiers, puisqu'elle est coincée entre deux suites qui tendent vers un tiers.
{{box:ex-x2 slot=e}}

## d8
{{anim:clear}}{{anim:write eq=dirichlet slot=nw size=md}}
Toutes les fonctions bornées ne sont pas intégrables. L'exemple classique est la fonction de Dirichlet, indicatrice des rationnels sur $[0,1]$. Elle vaut $1$ sur les rationnels et $0$ ailleurs. Tout intervalle ouvert, aussi petit soit-il, contient à la fois des rationnels et des irrationnels. Une fonction en escalier sous $f$ est donc négative sur chaque morceau, et une fonction en escalier au-dessus vaut au moins $1$. {{anim:write eq=dirI slot=ne size=md}}{{box:ex-dirichlet slot=s}}L'intégrale inférieure vaut $0$, l'intégrale supérieure vaut $1$ : aucun encadrement ne peut être resserré. Démontre-le toi-même.
{{exercise:ex2 minutes=5}}

# Les fonctions continues sont intégrables {#continues}

## c1
{{anim:clear}}{{box:thm-cont slot=n}}
Voici le premier grand théorème : toute fonction continue sur un segment est intégrable. La preuve repose sur un résultat que tu connais, le théorème de Heine. {{anim:write eq=heine slot=s size=md}}Une fonction continue sur un segment est uniformément continue : le même $\delta$ convient en tout point du segment.

## c1b
{{anim:clear}}{{box:rem-segment slot=e}}{{anim:axes id=H slot=w x=-0.05,1.1 y=-0.5,10.5 xl=x yl=y}}{{anim:curve on=H id=h fn="1/x" from=0.095 to=1}}
Le mot segment est essentiel. Pense à $x \mapsto \frac{1}{x}$ sur $]0,1]$ : elle est continue, mais près de $0$ elle varie de plus en plus vite. Aucun $\delta$ unique ne convient, et la fonction n'est même pas bornée. Elle sort du cadre de cette séance : on la traitera avec les intégrales impropres. Sur un segment, au contraire, la compacité interdit ce genre de fuite : c'est exactement ce qu'exprime le théorème de Heine.

## c2
{{anim:clear}}{{anim:axes id=A slot=w x=-0.1,3.2 y=-0.3,2.3 xl=x yl=y}}{{anim:curve on=A id=c fn="1 + 0.6*sin(2.2*x) + 0.2*x" from=0 to=3}}{{anim:darboux on=A id=bb fn="1 + 0.6*sin(2.2*x) + 0.2*x" from=0 to=3 n=5 kind=both}}
Soit $\varepsilon > 0$. On choisit $\delta$ associé à $\frac{\varepsilon}{b-a}$ par l'uniforme continuité, puis une subdivision de pas inférieur à $\delta$. {{anim:tween id=bb n=40 dur=5}}Sur chaque morceau, deux points quelconques sont à distance au plus $\delta$, donc leurs images diffèrent d'au plus $\frac{\varepsilon}{b-a}$ : l'oscillation $M_i - m_i$ est majorée par $\frac{\varepsilon}{b-a}$. {{anim:write eq=osc slot=e size=sm}}En sommant, la différence des sommes de Darboux est au plus $\varepsilon$. Le critère conclut.
{{box:pf-cont slot=e}}

## c3
{{anim:clear}}{{anim:axes id=A slot=w x=-0.1,3.2 y=-0.2,2.4 xl=x yl=y}}{{anim:curve on=A id=c fn="0.3 + 0.5*floor(1.5*x) + 0.1*x" from=0 to=3}}
Le théorème s'étend sans peine aux fonctions continues par morceaux, en découpant le segment aux points de discontinuité, et aussi aux fonctions monotones, avec un argument différent et très élégant : une somme télescopique. C'est l'objet de l'exercice suivant. Note au passage qu'une fonction monotone peut avoir une infinité de discontinuités, et rester intégrable.
{{exercise:ex3 minutes=6}}

# Propriétés de l'intégrale {#proprietes}

## r1
{{anim:clear}}{{anim:write eq=lin slot=n size=md}}
L'intégrale est linéaire. Pour la somme, si $\varphi_1 \le f \le \psi_1$ et $\varphi_2 \le g \le \psi_2$ avec des écarts d'au plus $\frac{\varepsilon}{2}$, alors $\varphi_1 + \varphi_2 \le f + g \le \psi_1 + \psi_2$, avec un écart d'au plus $\varepsilon$. Donc $f + g$ est intégrable, et son intégrale est coincée dans le même intervalle de longueur $\varepsilon$ que la somme des intégrales. Pour le produit par un réel négatif, on échange simplement le rôle des minorantes et des majorantes.

## r2
{{anim:write eq=chasles slot=c size=md}}
La relation de Chasles s'obtient en ajoutant le point $c$ aux subdivisions. La positivité est immédiate : si $f \ge 0$, la fonction nulle est sous $f$, donc l'intégrale est positive, et par linéarité l'intégrale est croissante. {{anim:write eq=absineq slot=s size=md}}Enfin, la valeur absolue de $f$ est intégrable, car sur chaque morceau, l'oscillation de $|f|$ est inférieure à celle de $f$ ; et comme $-|f| \le f \le |f|$, la croissance donne l'inégalité triangulaire.

## r3
{{anim:clear}}{{box:prop-prop slot=n}}{{box:prop-pos slot=s}}
Un dernier résultat, très utile en exercice : une fonction continue, positive, d'intégrale nulle est identiquement nulle. Si elle prenait une valeur strictement positive en un point, la continuité la maintiendrait au-dessus de la moitié de cette valeur sur tout un petit segment, et la fonction en escalier correspondante forcerait l'intégrale à être strictement positive. Les deux hypothèses comptent : sans continuité, il suffit de modifier la fonction nulle en un point.

## r4
{{anim:clear}}{{anim:axes id=A slot=w x=-0.1,3.2 y=-0.2,2.4 xl=x yl=y}}{{anim:curve on=A id=c fn="1 + 0.6*sin(2.2*x) + 0.2*x" from=0 to=3}}{{anim:area on=A fn="1 + 0.6*sin(2.2*x) + 0.2*x" from=0 to=3}}{{anim:hline on=A y=1.274 dashed label="valeur moyenne"}}
Autre conséquence directe de la croissance : la formule de la moyenne. Si $f$ est continue sur $[a,b]$, elle atteint un minimum $m$ et un maximum $M$. En intégrant l'encadrement $m \le f \le M$, puis en divisant par $b - a$, on obtient que la valeur moyenne de $f$ est comprise entre $m$ et $M$. {{anim:write eq=moy slot=ne size=sm}}Le théorème des valeurs intermédiaires dit alors que cette valeur moyenne est atteinte : il existe $c$ tel que l'intégrale soit égale à $(b-a) f(c)$. Géométriquement, le rectangle de hauteur $f(c)$ a la même aire que la région sous la courbe.
{{box:thm-moy slot=se}}

# Sommes de Riemann {#sommes}

## s1
{{anim:clear}}{{scene:integrals/riemann f="x^2" a=0 b=1 n=4 auto=off GAUCHE}}{{anim:camera x=-0.15,1.25 y=-0.2,1.15 dur=0.8}}
Ouvrons maintenant une scène de l'explorateur. On choisit dans chaque morceau un point $\xi_i$, et l'on forme la somme des $f(\xi_i)$ multipliés par les longueurs. {{anim:write eq=rsum slot=n size=md}}C'est une somme de Riemann. Ici, on prend le point de gauche de chaque morceau.

## s2
{{anim:fade slot=n}}{{box:thm-rsum slot=ne}}
Le théorème affirme que, pour une fonction continue, ces sommes convergent vers l'intégrale quand le pas tend vers zéro, quel que soit le choix des points. {{scene:set n=64 dur=6}}Regarde l'erreur diminuer quand $n$ augmente. La preuve est encore l'uniforme continuité : on découpe l'intégrale grâce à la relation de Chasles, et sur chaque morceau, $f(t)$ et $f(\xi_i)$ diffèrent d'au plus $\frac{\varepsilon}{b-a}$. {{anim:write eq=rerr slot=se size=sm}}On somme, et l'erreur totale est au plus $\varepsilon$.

## s3
{{scene:set MILIEU n=8}}{{anim:fade slot=se}}
Le choix des points ne change pas la limite, mais il change la vitesse. Avec les points de gauche, l'erreur décroît comme $\frac{1}{n}$. Avec les milieux, elle décroît comme $\frac{1}{n^2}$ pour une fonction assez régulière. {{scene:set n=128 dur=5}}C'est le graphe en bas à droite de la scène : la pente des droites donne l'ordre de la méthode.

## s3b
{{scene:set GAUCHE n=16}}{{box:prop-lip slot=ne}}
Démontrons la première affirmation, sous une hypothèse simple : $f$ est $K$-lipschitzienne. Sur le morceau qui commence en $x_k$, l'écart entre $f(t)$ et $f(x_k)$ est au plus $K$ fois $t - x_k$. On intègre cette majoration sur un morceau de longueur $h$ : on obtient $K$ fois $\frac{h^2}{2}$. {{anim:write eq=liperr slot=se size=sm}}Il y a $n$ morceaux, et $h$ vaut $\frac{b-a}{n}$. L'erreur totale est donc au plus $\frac{K(b-a)^2}{2n}$ : elle décroît comme $\frac{1}{n}$, exactement ce que montre la scène. Ce genre de majoration explicite est ce qu'on attend de toi à l'écrit, pas seulement la convergence.

## s4
{{scene:none}}{{anim:clear}}{{anim:write eq=regular slot=n size=md}}
Le cas le plus utilisé est celui de la subdivision régulière : les points sont équidistants et l'on prend, par exemple, les points de gauche. On obtient le corollaire écrit ici. Il sert dans les deux sens : approcher une intégrale par une somme, ou, plus souvent en exercice, calculer la limite d'une somme en reconnaissant une intégrale. {{anim:write eq=ln2 slot=s size=md}}Par exemple, la somme des $\frac{1}{n+k}$ pour $k$ allant de $1$ à $n$ s'écrit $\frac{1}{n}$ fois une somme de valeurs de $x \mapsto \frac{1}{1+x}$ aux points $\frac{k}{n}$. Elle tend donc vers $\ln 2$. À toi d'en faire autant.
{{exercise:ex4 minutes=6}}

# Le théorème fondamental de l'analyse {#fondamental}

## f1
{{anim:clear}}{{scene:integrals/ftc auto=off}}
Dernière étape : relier l'intégrale à la dérivation. Soit $f$ intégrable sur $[a,b]$, bornée par $M$. On pose $F(x)$ égale l'intégrale de $a$ à $x$ de $f$. {{anim:write eq=F slot=n size=md}}D'abord, $F$ est lipschitzienne : la différence $F(y) - F(x)$ est l'intégrale de $f$ entre $x$ et $y$, majorée en valeur absolue par $M$ fois la longueur. {{anim:write eq=lip slot=s size=md}}En particulier $F$ est continue, même si $f$ ne l'est pas.

## f2
{{anim:clear}}{{anim:write eq=taux slot=n size=md id=tx}}
Supposons maintenant $f$ continue en un point $x_0$, et calculons le taux d'accroissement de $F$ en $x_0$. On lui retranche $f(x_0)$, écrit comme l'intégrale de la constante $f(x_0)$ sur un intervalle de longueur $h$, divisée par $h$. Il reste la moyenne de $f(t) - f(x_0)$ sur l'intervalle. {{anim:morph from=tx to=tauxb id=tb}}Cette moyenne est majorée par le plus grand écart entre $f(t)$ et $f(x_0)$ pour $t$ à distance au plus $|h|$, qui tend vers zéro par continuité en $x_0$. {{anim:highlight on=tb term=q label="tend vers f(x₀)"}}Donc $F$ est dérivable en $x_0$, de dérivée $f(x_0)$.

## f3
{{anim:clear}}{{box:thm-ftc slot=n}}{{anim:write eq=newton slot=s size=lg}}
Si $f$ est continue sur tout le segment, $F$ en est une primitive, la seule qui s'annule en $a$. Et comme deux primitives d'une même fonction sur un intervalle diffèrent d'une constante, par le théorème des accroissements finis, pour toute primitive $G$ on obtient la formule que tu utilises depuis toujours : l'intégrale de $a$ à $b$ de $f$ égale $G(b) - G(a)$. Elle est maintenant démontrée.

## f3b
{{anim:clear}}{{box:ex-param slot=n}}{{anim:write eq=param slot=s size=md}}
Ce théorème donne aussi des primitives qu'on ne sait pas écrire avec les fonctions usuelles. La fonction $t \mapsto e^{-t^2}$ est continue, elle a donc une primitive $F$, même si aucune formule élémentaire ne l'exprime. On peut pourtant dériver sans peine $G(x)$, l'intégrale de $x$ à $x^2$ de $e^{-t^2}$ : on écrit $G(x) = F(x^2) - F(x)$, puis on dérive une composée. Retiens enfin que les deux outils de calcul du programme, l'intégration par parties et le changement de variable, découlent directement de ce théorème : on les obtient en intégrant la dérivée d'un produit, et la dérivée d'une composée.

## f4
{{scene:none}}{{anim:clear}}{{box:rem-limits slot=c}}
Concluons. Nous avons construit une intégrale exacte, linéaire, croissante, qui contient les fonctions continues et monotones, qui se calcule par sommes de Riemann et par primitives. Mais elle a des limites. La fonction de Dirichlet est la limite simple d'une suite croissante de fonctions intégrables, chacune d'intégrale nulle, et elle n'est pas intégrable. Pour échanger limite et intégrale, il faut ici une convergence uniforme, ce qui est très restrictif. C'est précisément le point de départ du cours suivant : de Riemann à Lebesgue.

## f5
{{anim:clear}}{{anim:title text="FIN DE LA SÉANCE" kicker="L'INTÉGRALE DE RIEMANN" sub="Fiche récapitulative et colle : boutons à gauche." hold=3}}
Pense à télécharger la fiche récapitulative, et à tenter une colle chronométrée. À bientôt.
