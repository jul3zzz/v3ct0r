<!--
  De Riemann à Lebesgue — licence/master, ≈ 1 h (≈ 33 min de narration + 23 min d'exercices).
  Prérequis : le cours « L'intégrale de Riemann, construite proprement ».
  Les théorèmes de construction (Carathéodory, unicité) sont admis ; les théorèmes de convergence sont démontrés.
-->

# Trois défauts de l'intégrale de Riemann {#defauts}

## l1
{{anim:title text="DE RIEMANN À LEBESGUE" kicker="V3CT0R LEARN · LICENCE / MASTER" sub="pourquoi il fallait une nouvelle intégrale" hold=2}}
Bonjour. L'intégrale de Riemann est une construction solide : elle intègre les fonctions continues, se calcule par primitives, se justifie par des sommes. Alors pourquoi, au début du vingtième siècle, a-t-on ressenti le besoin d'en construire une autre ? Parce qu'elle se comporte mal dès qu'on passe à la limite, et que l'analyse moderne passe son temps à passer à la limite. Commençons par trois défauts précis.

## l2
{{anim:write eq=dir slot=n size=md}}
Premier défaut. Numérotons les rationnels de $[0,1]$ : $r_1, r_2, r_3$, et ainsi de suite. L'indicatrice de l'ensemble fini $\{r_1, \ldots, r_n\}$ est une fonction en escalier, d'intégrale nulle : elle ne diffère de la fonction nulle qu'en un nombre fini de points. Quand $n$ augmente, ces fonctions croissent, et leur limite simple est l'indicatrice de $\mathbb{Q} \cap [0,1]$, la fonction de Dirichlet. Or nous avons montré qu'elle n'est pas intégrable au sens de Riemann. Une suite croissante de fonctions intégrables, toutes d'intégrale nulle, peut donc avoir une limite qui échappe à la théorie. {{anim:text slot=s text="La classe des fonctions Riemann-intégrables n'est **pas stable par limite croissante**, même quand les intégrales restent bornées."}}

## l3
{{anim:clear}}{{anim:axes id=A slot=w x=-0.03,1.05 y=-0.3,5 xl=x yl=y}}{{anim:curve on=A id=c fn="4*x*(1-x)^4" from=0 to=1 label="n = 2"}}
Deuxième défaut : échanger limite et intégrale. Regarde la suite $f_n(x) = n^2 x (1-x)^n$ sur $[0,1]$. {{anim:curve on=A id=c2 fn="25*x*(1-x)^5" from=0 to=1 label="n = 5"}}{{anim:curve on=A id=c3 fn="100*x*(1-x)^10" from=0 to=1 label="n = 10"}}Chaque $f_n$ est une bosse qui se décale vers $0$, de plus en plus haute et de plus en plus étroite. En chaque point fixé $x$, la suite $f_n(x)$ tend vers zéro. Et pourtant l'intégrale de $f_n$ tend vers $1$. {{anim:write eq=fn slot=e size=sm}}La limite des intégrales n'est pas l'intégrale de la limite. Ce n'est pas un défaut de Riemann en particulier : aucune théorie raisonnable ne peut échanger les deux ici. Mais il faut une hypothèse qui dise quand l'échange est permis.

## l4
{{anim:clear}}{{anim:axes id=A slot=w x=-0.03,1.05 y=-0.1,1.1 xl=x yl=y}}{{anim:curve on=A id=g1 fn="x" from=0 to=1}}{{anim:curve on=A id=g2 fn="x^4" from=0 to=1}}{{anim:curve on=A id=g3 fn="x^16" from=0 to=1}}{{anim:curve on=A id=g4 fn="x^64" from=0 to=1}}
Or l'intégrale de Riemann ne fournit qu'une seule hypothèse générale : la convergence uniforme. Prenons $g_n(x) = x^n$. Elle tend vers zéro sur $[0,1[$, et vers $1$ en $x = 1$. {{anim:write eq=xn slot=e size=sm}}La convergence n'est pas uniforme, la limite n'est même pas continue, et pourtant les intégrales tendent bien vers zéro, l'intégrale de la limite. Le théorème de Riemann est muet ici : il faudrait des calculs particuliers. On voudrait un théorème qui dise simplement : les fonctions restent sous la constante $1$, donc on peut passer à la limite.

## l5
{{anim:clear}}{{box:rem-defauts slot=n}}
Troisième défaut, plus profond. Sur l'espace des fonctions continues, la quantité $\int |f|$ est une norme. {{anim:write eq=riesz slot=s size=md}}Mais pour cette norme, l'espace n'est pas complet : il existe des suites de Cauchy qui ne convergent vers aucune fonction continue, ni même vers aucune fonction Riemann-intégrable. C'est très gênant : l'analyse fonctionnelle, les séries de Fourier, les équations aux dérivées partielles ont besoin d'espaces complets. 

## l5b
{{anim:clear}}{{anim:axes id=A slot=w x=-0.05,1.05 y=-0.15,1.15 xl=x yl=y}}{{anim:curve on=A id=p1 fn="min(1, max(0, 1 + 4*(x - 0.5)))" from=0 to=1 label="n = 4"}}{{anim:curve on=A id=p2 fn="min(1, max(0, 1 + 16*(x - 0.5)))" from=0 to=1 label="n = 16"}}
Voici un exemple explicite. Soit $\varphi_n$ la fonction continue nulle jusqu'à $\frac12 - \frac1n$, égale à $1$ à partir de $\frac12$, et affine entre les deux. Sa distance pour la norme $\int |f|$ à l'indicatrice de $[\frac12, 1]$ est l'aire d'un petit triangle, $\frac{1}{2n}$. {{anim:write eq=l1cauchy slot=e size=sm}}Par l'inégalité triangulaire, la suite $(\varphi_n)$ est de Cauchy. Mais sa seule limite possible est cette indicatrice, qui n'est égale presque partout à aucune fonction continue : elle sauterait de $0$ à $1$ en $\frac12$. Dans l'espace des fonctions continues, la suite de Cauchy n'a pas de limite. Avant de voir comment Lebesgue résout tout cela, vérifie toi-même le comportement de la bosse.
{{exercise:ex1 minutes=6}}

# L'idée de Lebesgue : découper les valeurs {#idee}

## i1
{{anim:clear}}{{anim:axes id=A slot=w x=-0.1,3.2 y=-0.3,2.4 xl=x yl=y}}{{anim:curve on=A id=c fn="1 + 0.7*sin(2.4*x) + 0.15*x" from=0 to=3}}{{anim:darboux on=A id=r fn="1 + 0.7*sin(2.4*x) + 0.15*x" from=0 to=3 n=12 kind=lower}}
Rappelle-toi comment procède Riemann : il découpe l'axe des abscisses, et sur chaque morceau, il regarde la hauteur du graphe. Si la fonction oscille violemment sur chaque petit intervalle, comme la fonction de Dirichlet, aucune subdivision ne permet de l'approcher.

## i2
{{anim:fade id=r}}{{anim:lebesgue on=A id=L fn="1 + 0.7*sin(2.4*x) + 0.15*x" from=0 to=3 n=4}}
Lebesgue renverse le point de vue : il découpe l'axe des ordonnées. Pour chaque tranche de valeurs, il regarde l'ensemble des points $x$ où $f(x)$ tombe dans cette tranche, et il en mesure la taille. {{anim:tween id=L n=12 dur=5}}Ici, chaque couche horizontale repose sur l'ensemble des $x$ tels que $f(x)$ dépasse un certain niveau : ce sont les traits épais sous l'axe. Ces ensembles ne sont plus forcément des intervalles : ce sont des réunions d'intervalles, et pour des fonctions plus sauvages, des ensembles bien plus compliqués. {{anim:write eq=leb slot=ne size=md}}La somme de Lebesgue additionne chaque niveau multiplié par la mesure de l'ensemble correspondant.

## i3
{{box:rem-idee slot=se}}
Lebesgue lui-même expliquait la différence avec une image de pièces de monnaie : pour compter une somme, on peut additionner les pièces dans l'ordre où elles arrivent, c'est la méthode de Riemann, ou bien les trier d'abord par valeur, compter combien il y a de pièces de chaque sorte, puis faire le total. C'est la méthode de Lebesgue. Le résultat est le même pour une somme finie, mais la seconde méthode supporte beaucoup mieux le passage à la limite.

## i3b
{{anim:clear}}{{anim:write eq=dirsum slot=n size=md}}
Appliquons tout de suite cette idée à la fonction de Dirichlet. Elle ne prend que deux valeurs : $0$ et $1$. La méthode de Lebesgue ne demande que deux nombres : la taille de l'ensemble où elle vaut $0$, les irrationnels de $[0,1]$, et la taille de l'ensemble où elle vaut $1$, les rationnels de $[0,1]$. Si l'on sait mesurer ces deux ensembles, l'intégrale est immédiate. Peu importe que ces ensembles soient emmêlés de façon inextricable sur l'axe : on ne regarde plus l'ordre des points, seulement la taille des ensembles. Il reste à donner un sens précis à la taille de l'ensemble des rationnels. Nous verrons qu'elle est nulle.

## i4
{{anim:clear}}{{anim:write eq=cake slot=n size=md}}
Pour une fonction positive, cette idée conduit à la formule écrite ici : l'intégrale de $f$ est l'intégrale, sur les niveaux $t$, de la mesure de l'ensemble où $f$ dépasse $t$. C'est la formule de l'empilement de couches. Toute la difficulté est désormais déplacée : il faut savoir mesurer des ensembles de réels qui ne sont pas des intervalles. C'est l'objet de la théorie de la mesure.

# Mesurer des ensembles {#mesure}

## m1
{{anim:clear}}{{anim:text slot=n text="**Cahier des charges** pour une « longueur » $\lambda$ des parties de $\mathbb{R}$ :\n\n- $\lambda([a,b]) = b - a$ ;\n- $\lambda(A + x) = \lambda(A)$ (invariance par translation) ;\n- si les $A_n$ sont deux à deux disjoints, $\lambda(\bigcup A_n) = \sum \lambda(A_n)$ (**σ-additivité**)."}}
Écrivons le cahier des charges. On veut une fonction $\lambda$ qui associe une longueur à des parties de $\mathbb{R}$. Elle doit donner aux intervalles leur longueur habituelle, être invariante par translation, et surtout être additive pour une famille dénombrable de parties deux à deux disjointes. C'est cette additivité dénombrable, la σ-additivité, qui fera fonctionner les passages à la limite. L'additivité finie ne suffirait pas.

## m2
{{box:thm-vitali slot=s}}
Mauvaise nouvelle : il est impossible de définir une telle longueur sur toutes les parties de $\mathbb{R}$. C'est le théorème de Vitali. L'idée : on regroupe les réels de $[0,1]$ en classes, deux réels étant dans la même classe si leur différence est rationnelle, et l'on choisit un représentant par classe. {{anim:write eq=vitali slot=c size=sm}}Les translatés de l'ensemble $V$ obtenu par les rationnels de $[-1,1]$ sont disjoints, ils recouvrent $[0,1]$ et restent dans $[-1,2]$. Par σ-additivité et invariance par translation, la longueur de cette réunion serait une somme infinie de termes tous égaux : nulle, ou infinie. Elle ne peut pas être comprise entre $1$ et $3$. Il faut donc renoncer à mesurer toutes les parties, et se restreindre à une famille raisonnable.

## m3
{{anim:clear}}{{box:def-tribu slot=n}}{{anim:write eq=tribu slot=s size=sm}}
Cette famille raisonnable s'appelle une tribu. C'est une famille de parties qui contient l'ensemble tout entier, et qui est stable par complémentaire et par réunion dénombrable. Elle est donc aussi stable par intersection dénombrable et par différence. La tribu borélienne de $\mathbb{R}$ est la plus petite tribu qui contient les intervalles. Elle contient les ouverts, les fermés, les ensembles dénombrables, et à peu près tout ce que l'on rencontre en pratique, sauf des ensembles construits avec l'axiome du choix, comme celui de Vitali.

## m4
{{anim:clear}}{{box:def-mesure slot=n}}{{anim:write eq=sigma slot=s size=md}}
Une mesure est alors une fonction définie sur une tribu, à valeurs positives et éventuellement infinies, nulle sur l'ensemble vide, et σ-additive. Il en découle aussitôt qu'elle est croissante pour l'inclusion, sous-additive pour une réunion dénombrable quelconque, et continue le long des suites croissantes d'ensembles : la mesure de la réunion est la limite des mesures. Cette dernière propriété est le moteur des théorèmes de convergence.

## m4b
{{anim:clear}}{{anim:write eq=mono slot=n size=md}}
Vérifions ces deux propriétés, car elles reviendront sans cesse. Si $A$ est inclus dans $B$, $B$ est la réunion disjointe de $A$ et de $B \setminus A$. L'additivité donne la mesure de $B$ comme somme de deux termes positifs : elle est au moins celle de $A$. Pour la continuité, soit $(A_n)$ une suite croissante de réunion $A$. On découpe $A$ en tranches disjointes : la première, puis ce que chaque $A_n$ ajoute au précédent. {{anim:write eq=disj slot=s size=sm}}La σ-additivité écrit la mesure de $A$ comme la somme de la série des mesures des tranches. Or les sommes partielles valent exactement les mesures des $A_N$, par additivité finie. La mesure de $A$ est donc la limite des mesures des $A_N$. Remarque l'endroit précis où sert l'additivité dénombrable : passer d'une somme partielle à la série.

## m5
{{anim:clear}}{{box:thm-lebesgue slot=n}}{{anim:write eq=lambda slot=s size=md}}
Le théorème fondamental de la théorie, que nous admettrons, est l'existence et l'unicité de la mesure de Lebesgue : une mesure sur la tribu borélienne, qui donne à chaque intervalle sa longueur. Elle est automatiquement invariante par translation. La construction passe par une mesure extérieure et par le théorème de Carathéodory ; l'unicité découle du lemme des classes monotones.

## m6
{{anim:clear}}{{box:prop-denombrable slot=n}}{{anim:write eq=countable slot=s size=sm}}
Premier calcul : tout ensemble dénombrable est de mesure nulle. On enferme le $k$-ième point dans un intervalle de longueur $\frac{\varepsilon}{2^{k+1}}$. Par sous-additivité, la mesure de l'ensemble est au plus la somme de ces longueurs, qui vaut $\varepsilon$. Comme $\varepsilon$ est arbitraire, la mesure est nulle. En particulier, les rationnels, pourtant denses dans $\mathbb{R}$, forment un ensemble négligeable.

## m7
{{anim:clear}}{{scene:principles/cantor "ENSEMBLE DE CANTOR"}}
Mais les ensembles négligeables ne sont pas tous dénombrables. Voici l'ensemble de Cantor : on part du segment $[0,1]$, on retire le tiers central ouvert, puis le tiers central de chacun des deux segments restants, et ainsi de suite. {{anim:write eq=cantor slot=n size=md}}Après $n$ étapes, il reste $2^n$ segments de longueur $3^{-n}$, soit une longueur totale $(2/3)^n$, qui tend vers zéro. {{box:ex-cantor slot=s}}L'ensemble limite est donc de mesure nulle. Et pourtant, il n'est pas dénombrable. Ses points sont les réels qui admettent une écriture en base trois avec les seuls chiffres $0$ et $2$. En remplaçant chaque $2$ par un $1$ et en lisant le résultat en base deux, on atteint tous les réels de $[0,1]$ : l'ensemble de Cantor se projette sur le segment tout entier, il est donc au moins aussi gros que lui. Mesure nulle ne veut pas dire petit au sens du cardinal.
{{exercise:ex2 minutes=5}}

# Fonctions mesurables et intégrale {#integrale}

## n1
{{scene:none}}{{anim:clear}}{{box:def-mesurable slot=n}}
Revenons aux fonctions. Pour que l'idée de Lebesgue ait un sens, il faut pouvoir mesurer les ensembles $\{f > a\}$. On dit que $f$ est mesurable lorsque tous ces ensembles appartiennent à la tribu. Les fonctions continues sont mesurables, car $\{f > a\}$ est alors un ouvert. Les fonctions monotones aussi, car cet ensemble est un intervalle. Et surtout, une limite simple de fonctions mesurables est mesurable : la classe est stable par passage à la limite, ce qui n'était pas le cas pour Riemann.

## n2
{{anim:clear}}{{anim:write eq=simple slot=n size=md}}
On commence par les fonctions étagées : des combinaisons linéaires finies d'indicatrices d'ensembles mesurables. Ce sont les analogues des fonctions en escalier, mais les ensembles ne sont plus des intervalles. Leur intégrale est définie de la seule façon raisonnable : chaque valeur multipliée par la mesure de l'ensemble où elle est prise. On vérifie, comme pour les fonctions en escalier, que le résultat ne dépend pas de l'écriture choisie. {{anim:write eq=intdef slot=s size=md}}Pour une fonction mesurable positive, l'intégrale est la borne supérieure des intégrales des fonctions étagées qui la minorent. Elle peut valoir $+\infty$. Remarque : on n'a besoin ici que d'une approximation par en dessous.

## n3
{{anim:clear}}{{anim:axes id=A slot=w x=-0.05,1.05 y=-0.1,1.1 xl=x yl=y}}{{anim:curve on=A id=c fn="0.5 + 0.45*sin(5*x)" from=0 to=1}}{{anim:lebesgue on=A id=L fn="0.5 + 0.45*sin(5*x)" from=0 to=1 n=2}}
Toute fonction mesurable positive est d'ailleurs la limite d'une suite croissante de fonctions étagées. {{anim:write eq=dyad slot=e size=md}}On tronque à la hauteur $n$, et l'on arrondit vers le bas à un multiple de $2^{-n}$. {{anim:tween id=L n=16 dur=5}}Chaque étape raffine la précédente en coupant chaque tranche de valeurs en deux. C'est exactement l'image des couches horizontales qui s'affinent.

## n4
{{anim:clear}}{{box:def-integrale slot=n}}{{anim:write eq=L1 slot=s size=md}}
Pour une fonction de signe quelconque, on la décompose en partie positive et partie négative. Elle est dite intégrable si l'intégrale de sa valeur absolue est finie, et son intégrale est alors la différence des deux. On note $L^1$ l'ensemble de ces fonctions. Un point clé : modifier une fonction sur un ensemble de mesure nulle ne change pas son intégrale. On raisonne donc presque partout, c'est-à-dire en dehors d'un ensemble négligeable.

## n4b
{{anim:clear}}{{anim:write eq=markov slot=n size=md}}
Le lien entre intégrale et presque partout passe par l'inégalité de Markov. Pour $t > 0$, la fonction $|f|$ est minorée par $t$ fois l'indicatrice de l'ensemble où elle dépasse $t$. En intégrant, la mesure de cet ensemble est au plus l'intégrale de $|f|$ divisée par $t$. Conséquence : si l'intégrale de $|f|$ est nulle, chacun des ensembles $\{|f| > \frac{1}{k}\}$ est de mesure nulle, et leur réunion dénombrable aussi. Donc $f$ est nulle presque partout. C'est la version de Lebesgue du résultat que nous avions démontré pour les fonctions continues positives. Ici aucune continuité n'est nécessaire, mais la conclusion n'est plus « partout » : elle est « presque partout ». C'est pourquoi les éléments de $L^1$ sont des classes de fonctions égales presque partout, et c'est sur ces classes que $\int |f|$ est une vraie norme.

## n5
{{anim:clear}}{{anim:write eq=dirleb slot=n size=lg}}
La fonction de Dirichlet, qui résistait à Riemann, est maintenant une simple fonction étagée : l'indicatrice d'un ensemble de mesure nulle. Son intégrale de Lebesgue vaut zéro, comme l'intuition le suggérait : elle est nulle presque partout. À toi d'intégrer une fonction partout discontinue.
{{exercise:ex3 minutes=5}}

# Les théorèmes de convergence {#convergence}

## t1
{{anim:clear}}{{anim:title text="LES TROIS THÉORÈMES" kicker="CHAPITRE 5" sub="convergence monotone · Fatou · convergence dominée" hold=1.2}}
Voici la récompense de tout ce travail : trois théorèmes qui disent quand on peut passer à la limite sous le signe intégrale, avec des hypothèses simples à vérifier.

## t2
{{box:thm-mct slot=n}}{{anim:write eq=mct slot=s size=md}}
Le premier est le théorème de convergence monotone, dû à Beppo Levi. Si une suite de fonctions mesurables positives croît vers $f$, alors les intégrales croissent vers l'intégrale de $f$. Aucune hypothèse d'uniformité, aucune hypothèse de domination : seulement la monotonie et la positivité.

## t3
{{anim:clear}}{{anim:write eq=mctpf slot=n size=md}}
La preuve est un modèle du genre. Les intégrales des $f_n$ forment une suite croissante, majorée par l'intégrale de $f$ : elle a une limite, au plus égale à l'intégrale de $f$. Pour l'inégalité inverse, on fixe une fonction étagée $s$ sous $f$, et un réel $c$ entre $0$ et $1$. L'ensemble des points où $f_n$ dépasse $c$ fois $s$ croît, et sa réunion est l'espace entier, puisque $f_n(x)$ finit par dépasser $c\,s(x)$ dès que $s(x)$ est non nul. Par continuité de la mesure le long des suites croissantes, l'intégrale de $f_n$ finit par dépasser presque $c$ fois l'intégrale de $s$. On fait tendre $c$ vers $1$, puis on prend la borne supérieure sur $s$. {{box:thm-mct slot=s}}

## t4
{{anim:clear}}{{anim:write eq=dir slot=n size=md}}
Application immédiate au premier défaut : les indicatrices des ensembles $\{r_1, \ldots, r_n\}$ croissent vers l'indicatrice de $\mathbb{Q} \cap [0,1]$. Le théorème de convergence monotone donne l'intégrale de la limite : c'est la limite des intégrales, c'est-à-dire zéro. Le premier défaut a disparu.

## t5
{{anim:clear}}{{box:lem-fatou slot=n}}{{anim:write eq=fatou slot=s size=md}}
Le deuxième résultat est le lemme de Fatou : pour des fonctions positives, l'intégrale de la limite inférieure est majorée par la limite inférieure des intégrales. On l'obtient en appliquant la convergence monotone aux bornes inférieures $\inf_{n \ge k} f_n$, qui croissent avec $k$. L'inégalité peut être stricte : c'est exactement ce qui arrive avec la bosse $f_n$, dont la limite est nulle alors que les intégrales tendent vers $1$.

## t6
{{anim:clear}}{{box:thm-dct slot=n}}{{anim:write eq=dct slot=s size=sm}}
Enfin, le théorème de convergence dominée, l'outil le plus utilisé de toute l'analyse. Si $f_n$ converge presque partout vers $f$, et si toutes les $f_n$ sont majorées en valeur absolue par une même fonction intégrable $g$, alors on peut passer à la limite sous l'intégrale. La preuve est courte : la fonction $2g - |f_n - f|$ est positive, et le lemme de Fatou appliqué à cette suite donne exactement que l'intégrale de $|f_n - f|$ tend vers zéro.

## t7
{{anim:clear}}{{anim:axes id=A slot=w x=-0.03,1.05 y=-0.1,1.1 xl=x yl=y}}{{anim:curve on=A id=g1 fn="x^3" from=0 to=1}}{{anim:curve on=A id=g2 fn="x^20" from=0 to=1}}{{anim:hline on=A y=1 dashed label="g = 1"}}
Reprenons nos exemples. Pour $g_n(x) = x^n$, toutes les fonctions restent sous la constante $1$, intégrable sur $[0,1]$. La convergence dominée s'applique : les intégrales tendent vers zéro, sans aucun calcul. {{anim:write eq=nodom slot=e size=sm}}Pour la bosse, au contraire, aucune domination intégrable n'existe : la borne supérieure des $f_n(x)$ se comporte comme $\frac{1}{ex}$ près de zéro, qui n'est pas intégrable. Le théorème ne s'applique pas, et heureusement, puisque la conclusion serait fausse. Les hypothèses du théorème sont exactement celles qu'il faut.

## t7b
{{anim:clear}}{{anim:write eq=series slot=n size=md}}
Deux conséquences d'usage constant. D'abord les séries : si la série des intégrales des $|f_n|$ converge, on peut intégrer terme à terme. En effet, la convergence monotone appliquée aux sommes partielles des $|f_n|$ montre que la fonction $\sum |f_n|$ est intégrable, donc finie presque partout. Elle domine toutes les sommes partielles de la série des $f_n$, et la convergence dominée conclut. Ensuite les intégrales à paramètre : la continuité et la dérivation sous le signe intégrale se démontrent par convergence dominée, en vérifiant une domination indépendante du paramètre. C'est là que la théorie de Lebesgue se montre la plus efficace au quotidien. À toi d'en faire usage.
{{exercise:ex4 minutes=7}}

# Riemann et Lebesgue réconciliés {#reconcilies}

## z1
{{anim:clear}}{{box:thm-critere slot=n}}{{anim:write eq=critleb slot=s size=md}}
Que deviennent les intégrales de Riemann dans cette théorie ? Le critère de Lebesgue répond complètement : une fonction bornée sur un segment est Riemann-intégrable si et seulement si l'ensemble de ses points de discontinuité est négligeable, et dans ce cas, les deux intégrales coïncident. Tout ce que tu as appris reste vrai. Une fonction monotone, par exemple, n'a qu'un ensemble dénombrable de discontinuités : elle est intégrable au sens de Riemann, comme nous l'avions démontré autrement. La fonction de Dirichlet, discontinue partout, ne l'est pas.

## z2
{{anim:clear}}{{anim:write eq=sinc slot=n size=md}}
Une nuance pour les intégrales impropres. Celles qui convergent absolument sont des intégrales de Lebesgue. Mais une intégrale seulement semi-convergente, comme celle de $\frac{\sin x}{x}$ sur $[1, +\infty[$, n'en est pas une : sa valeur absolue n'est pas intégrable. L'intégrale impropre reste alors une limite d'intégrales sur des segments, et l'on n'a pas droit aux théorèmes de convergence.

## z3
{{anim:clear}}{{box:rem-gains slot=n}}{{anim:write eq=esp slot=s size=lg}}
Faisons le bilan des gains. Des théorèmes d'interversion simples. Un espace $L^1$ complet, c'est le théorème de Riesz-Fischer, et de même pour les espaces $L^p$. Une seule théorie pour les intégrales multiples, avec le théorème de Fubini, pour les séries, en prenant la mesure qui compte les points, et pour les probabilités, où l'espérance d'une variable aléatoire n'est rien d'autre que son intégrale par rapport à une mesure de probabilité. C'est le langage de toute l'analyse et de toutes les probabilités modernes.

## z3b
{{anim:clear}}{{anim:write eq=fubini slot=n size=md}}
Un mot sur l'intégration en plusieurs variables, qui est l'autre grand bénéfice. Sur un produit d'espaces mesurés, on construit une mesure produit, et le théorème de Fubini permet d'intégrer successivement par rapport à chaque variable, dans l'ordre que l'on veut. Il suffit que la fonction soit positive, c'est la version de Tonelli, ou intégrable pour la mesure produit. Avec Riemann, l'échange de deux intégrales demandait de la continuité et des domaines simples. Ici, il ne demande qu'une hypothèse d'intégrabilité, que l'on vérifie souvent par Tonelli sur la valeur absolue.

## z4
{{anim:clear}}{{anim:title text="FIN DE LA SÉANCE" kicker="DE RIEMANN À LEBESGUE" sub="Suite : Théorie de la mesure et intégrale de Lebesgue." hold=3}}
La suite naturelle est le cours complet de théorie de la mesure : la construction de la mesure de Lebesgue, les intégrales à paramètre, Fubini et les espaces $L^p$. Pense à la fiche récapitulative et à la colle. À bientôt.
