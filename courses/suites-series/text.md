## Suites réelles et complexes {#suites}

Une suite est une liste infinie de nombres $u_0, u_1, u_2, \dots$, c'est-à-dire une application $n \mapsto u_n$ de $\mathbb{N}$ dans $\mathbb{R}$ ou $\mathbb{C}$. Toute l'analyse repose sur une seule idée : dire précisément ce que signifie « $u_n$ se rapproche de $\ell$ quand $n$ grandit ». La définition qui suit a mis près de deux siècles à être formulée (Cauchy, puis Weierstrass) ; elle remplace l'image vague du mouvement par un jeu à deux joueurs.

### La définition de la limite

::: définition Limite d'une suite {#def-limite}
Soit $(u_n)_{n \in \mathbb{N}}$ une suite réelle et $\ell \in \mathbb{R}$. On dit que $(u_n)$ **converge vers** $\ell$ si
$$\forall \varepsilon > 0,\ \exists N \in \mathbb{N},\ \forall n \ge N,\quad |u_n - \ell| \le \varepsilon.$$

On dit que $(u_n)$ **tend vers** $+\infty$ si $\forall A \in \mathbb{R},\ \exists N \in \mathbb{N},\ \forall n \ge N,\ u_n \ge A$, et de même pour $-\infty$. Une suite qui ne converge pas est dite **divergente**.
:::

Il faut lire la définition comme un défi. Un adversaire choisit une précision $\varepsilon$, aussi petite qu'il le souhaite ; on doit lui répondre par un rang $N$ au-delà duquel tous les termes sont à distance au plus $\varepsilon$ de $\ell$. Le rang dépend de $\varepsilon$ : plus la précision exigée est fine, plus il faut aller loin. L'ordre des quantificateurs est essentiel, et c'est lui qu'il faut vérifier en premier dans toute preuve.

Pour $u_n = \frac1n$ et $\ell = 0$ : si $\varepsilon > 0$ est donné, tout entier $N \ge \frac1\varepsilon$ convient, car $n \ge N$ entraîne $\frac1n \le \frac1N \le \varepsilon$. Remarquons que remplacer $\le \varepsilon$ par $< \varepsilon$ ne change rien, puisque $\varepsilon$ est arbitraire. On dit aussi que la propriété $|u_n - \ell| \le \varepsilon$ est vraie **à partir d'un certain rang**.

::: proposition Unicité de la limite {#prop-unicite}
Si $(u_n)$ converge vers $\ell$ et vers $\ell'$, alors $\ell = \ell'$. On note alors $\ell = \lim u_n$, ou $u_n \to \ell$.
:::

::: preuve Unicité de la limite
Supposons $\ell \neq \ell'$ et posons $\varepsilon = \frac{|\ell - \ell'|}{3} > 0$. Il existe $N_1$ tel que $|u_n - \ell| \le \varepsilon$ pour $n \ge N_1$, et $N_2$ tel que $|u_n - \ell'| \le \varepsilon$ pour $n \ge N_2$. Pour $n = \max(N_1, N_2)$, l'inégalité triangulaire donne $|\ell - \ell'| \le |\ell - u_n| + |u_n - \ell'| \le 2\varepsilon < |\ell - \ell'|$ : contradiction.
:::

::: proposition Une suite convergente est bornée {#prop-bornee}
Si $u_n \to \ell$, il existe un réel $M$ tel que $|u_n| \le M$ pour tout $n$. La réciproque est fausse : la suite $\big((-1)^n\big)$ est bornée et diverge.
:::

La preuve tient en une ligne : avec $\varepsilon = 1$, on a $|u_n| \le |\ell| + 1$ pour $n \ge N$, et il ne reste qu'un nombre fini de termes $u_0, \dots, u_{N-1}$, dont on prend le maximum des valeurs absolues. Ce principe, « à partir d'un certain rang, plus un nombre fini de termes », revient sans cesse.

::: proposition Opérations sur les limites {#prop-operations}
Si $u_n \to \ell$ et $v_n \to \ell'$ (limites finies) et $\lambda \in \mathbb{R}$, alors $u_n + v_n \to \ell + \ell'$, $\lambda u_n \to \lambda \ell$ et $u_n v_n \to \ell \ell'$. Si de plus $\ell' \neq 0$, alors $v_n \neq 0$ à partir d'un certain rang et $\frac{u_n}{v_n} \to \frac{\ell}{\ell'}$.

Avec des limites infinies, les mêmes règles s'appliquent, sauf dans les **formes indéterminées** $\infty - \infty$, $0 \times \infty$, $\frac{\infty}{\infty}$ et $\frac00$.
:::

Pour le produit, on écrit $u_n v_n - \ell \ell' = u_n (v_n - \ell') + \ell' (u_n - \ell)$. La suite $(u_n)$ est bornée par un certain $M$, donc $|u_n v_n - \ell\ell'| \le M |v_n - \ell'| + |\ell'|\,|u_n - \ell|$, et le membre de droite se rend aussi petit que l'on veut. Les formes indéterminées ne sont pas des impossibilités : elles signifient seulement que le résultat dépend des suites. Par exemple $n^2 - n \to +\infty$, alors que $(n + 1) - n \to 1$, et pourtant les deux sont de la forme $\infty - \infty$.

::: théorème Théorème d'encadrement {#thm-encadrement}
Si $v_n \le u_n \le w_n$ à partir d'un certain rang et si $(v_n)$ et $(w_n)$ convergent vers la **même** limite $\ell$, alors $(u_n)$ converge vers $\ell$.

Si $u_n \ge v_n$ à partir d'un certain rang et $v_n \to +\infty$, alors $u_n \to +\infty$.
:::

::: remarque Passage à la limite dans une inégalité {#rem-inegalite}
Si $u_n \le v_n$ à partir d'un certain rang et si les deux suites convergent, alors $\lim u_n \le \lim v_n$. Les inégalités **strictes ne passent pas** à la limite : $\frac1n > 0$ pour tout $n \ge 1$, mais $\lim \frac1n = 0$.
:::

### Suites monotones et suites adjacentes

Jusqu'ici, pour montrer qu'une suite converge, il fallait connaître sa limite à l'avance. Le résultat suivant, le premier vraiment profond, affirme l'existence d'une limite sans la donner. Il repose sur la propriété fondamentale de $\mathbb{R}$ : toute partie non vide et majorée admet une borne supérieure.

::: théorème Théorème de la limite monotone {#thm-monotone}
Toute suite réelle croissante et majorée converge, vers $\sup_{n} u_n$. Toute suite croissante non majorée tend vers $+\infty$. Symétriquement, une suite décroissante converge si elle est minorée et tend vers $-\infty$ sinon.
:::

::: preuve Limite monotone
Soit $(u_n)$ croissante et majorée, et $s = \sup \{ u_n : n \in \mathbb{N} \}$, qui existe par la propriété de la borne supérieure. Soit $\varepsilon > 0$ : le réel $s - \varepsilon$ ne majore pas la suite, donc il existe $N$ avec $u_N > s - \varepsilon$. Pour $n \ge N$, la croissance donne $s - \varepsilon < u_N \le u_n \le s$, donc $|u_n - s| \le \varepsilon$.
:::

Dans $\mathbb{Q}$, ce théorème est faux : les approximations décimales par défaut de $\sqrt 2$, à savoir $1$, $1{,}4$, $1{,}41$, $1{,}414$, forment une suite croissante de rationnels, majorée par $2$, qui n'a pas de limite rationnelle. C'est exactement ce « trou » que les réels viennent combler. Le corollaire le plus utile en pratique est le suivant.

::: définition Suites adjacentes {#def-adjacentes}
Deux suites réelles $(u_n)$ et $(v_n)$ sont **adjacentes** si $(u_n)$ est croissante, $(v_n)$ est décroissante et $v_n - u_n \to 0$.
:::

::: théorème Théorème des suites adjacentes {#thm-adjacentes}
Deux suites adjacentes convergent vers une même limite $\ell$, et $u_n \le \ell \le v_n$ pour tout $n$.
:::

La suite $w_n = v_n - u_n$ est décroissante (différence d'une suite décroissante et d'une suite croissante) et tend vers $0$, donc elle reste positive : $u_n \le v_n \le v_0$. Ainsi $(u_n)$ est croissante et majorée par $v_0$, donc converge vers un réel $\ell$, et $v_n = u_n + w_n$ converge aussi vers $\ell$. L'encadrement $u_n \le \ell \le v_n$ découle de la monotonie. L'intérêt est double : on obtient une limite, et un encadrement d'erreur explicite à chaque rang. L'exercice sur l'irrationalité de $e$ exploite précisément cet encadrement.

### Suites extraites et théorème de Bolzano-Weierstrass

::: définition Suite extraite {#def-extraite}
Une **suite extraite** (ou sous-suite) de $(u_n)$ est une suite $\big(u_{\varphi(n)}\big)$, où $\varphi : \mathbb{N} \to \mathbb{N}$ est strictement croissante. On a alors $\varphi(n) \ge n$ pour tout $n$, et toute suite extraite d'une suite convergente converge vers la même limite.
:::

Les suites extraites servent d'abord à prouver qu'une suite diverge : si $u_{2n} \to 1$ et $u_{2n+1} \to -1$, comme pour $u_n = (-1)^n$, la suite ne peut pas converger, puisque toutes ses suites extraites devraient avoir la même limite. Réciproquement, si $u_{2n}$ et $u_{2n+1}$ convergent vers une **même** limite $\ell$, alors $u_n \to \ell$ : le rang commun s'obtient en prenant le plus grand des deux rangs.

::: théorème Théorème de Bolzano-Weierstrass {#thm-bw}
De toute suite réelle **bornée** on peut extraire une suite convergente.
:::

::: preuve Par dichotomie
Supposons $u_n \in [a_0, b_0]$ pour tout $n$. On construit des segments emboîtés $[a_k, b_k]$, de longueur $\frac{b_0 - a_0}{2^k}$, contenant chacun $u_n$ pour une infinité d'indices $n$ : si $[a_k, b_k]$ convient, l'une au moins de ses deux moitiés convient encore, et on la garde. On pose $\varphi(0) = 0$ puis on choisit $\varphi(k) > \varphi(k-1)$ tel que $u_{\varphi(k)} \in [a_k, b_k]$, ce qui est possible puisque les indices disponibles sont en nombre infini. Les suites $(a_k)$ et $(b_k)$ sont adjacentes, de limite commune $\ell$, et $a_k \le u_{\varphi(k)} \le b_k$ : par encadrement, $u_{\varphi(k)} \to \ell$.
:::

Le théorème ne dit rien de la limite obtenue, ni de son unicité : la suite $(-1)^n$ a des sous-suites qui tendent vers $1$ et d'autres vers $-1$. C'est un résultat de **compacité** : un segment de $\mathbb{R}$ est compact, et cette notion structurera toute la topologie des espaces vectoriels normés.

### Suites de Cauchy

::: définition Suite de Cauchy {#def-cauchy}
Une suite $(u_n)$ est **de Cauchy** si
$$\forall \varepsilon > 0,\ \exists N \in \mathbb{N},\ \forall p, q \ge N,\quad |u_p - u_q| \le \varepsilon.$$
:::

Une suite de Cauchy est une suite dont les termes finissent par être tous proches **les uns des autres**, sans référence à une limite. Ce critère est intrinsèque : on peut le vérifier sans rien deviner, et c'est ce qui le rend si précieux pour les séries.

::: théorème Complétude de ℝ {#thm-cauchy}
Une suite réelle converge si et seulement si elle est de Cauchy.
:::

::: preuve Une suite de Cauchy converge
Le sens direct découle de $|u_p - u_q| \le |u_p - \ell| + |\ell - u_q|$. Réciproquement, une suite de Cauchy est bornée (prendre $\varepsilon = 1$ comme pour une suite convergente). Par Bolzano-Weierstrass, elle admet une suite extraite $u_{\varphi(k)} \to \ell$. Soit $\varepsilon > 0$ et $N$ donné par la définition. Comme $\varphi(k) \ge k$, on peut choisir $k$ assez grand pour que $\varphi(k) \ge N$ et $|u_{\varphi(k)} - \ell| \le \varepsilon$. Pour tout $n \ge N$ : $|u_n - \ell| \le |u_n - u_{\varphi(k)}| + |u_{\varphi(k)} - \ell| \le 2\varepsilon$.
:::

### Suites complexes

::: remarque Suites complexes {#rem-complexes}
Pour une suite $(z_n)$ de nombres complexes, la définition de la limite est la même, avec le module : $|z_n - \ell| \le \varepsilon$. On a $z_n \to \ell$ si et seulement si $\operatorname{Re} z_n \to \operatorname{Re} \ell$ et $\operatorname{Im} z_n \to \operatorname{Im} \ell$. Tout ce qui n'utilise pas l'ordre reste vrai : opérations, suites bornées, Bolzano-Weierstrass, critère de Cauchy. Les énoncés de monotonie et d'encadrement n'ont en revanche pas de sens dans $\mathbb{C}$.
:::

::: exemple Suites géométriques {#ex-geometrique}
Pour $q \in \mathbb{C}$ : si $|q| < 1$, alors $q^n \to 0$ ; si $q = 1$, la suite est constante ; si $|q| \ge 1$ et $q \neq 1$, la suite $(q^n)$ diverge.

Le cas délicat est $|q| = 1$, $q \neq 1$ : si l'on avait $q^n \to \ell$, alors $|\ell| = 1$ et $q^{n+1} - q^n = q^n (q - 1)$ tendrait à la fois vers $\ell - \ell = 0$ et vers $\ell (q - 1) \neq 0$.
:::

## Relations de comparaison {#comparaison}

Savoir qu'une suite tend vers l'infini ne suffit souvent pas : il faut savoir **à quelle vitesse**. Les relations de comparaison, dues à Landau et à Hardy, donnent un langage précis pour cela. Elles sont l'outil principal de l'étude des séries.

::: définition Négligeable, dominée, équivalente {#def-comparaison}
Soit $(v_n)$ une suite qui ne s'annule pas à partir d'un certain rang. On écrit :

- $u_n = o(v_n)$, et l'on dit que $u_n$ est **négligeable** devant $v_n$, si $\frac{u_n}{v_n} \to 0$ ;
- $u_n = O(v_n)$, et l'on dit que $u_n$ est **dominée** par $v_n$, si la suite $\left(\frac{u_n}{v_n}\right)$ est bornée ;
- $u_n \sim v_n$, et l'on dit que $u_n$ est **équivalente** à $v_n$, si $\frac{u_n}{v_n} \to 1$, c'est-à-dire $u_n = v_n + o(v_n)$.
:::

La notation $o(v_n)$ désigne une suite, et non un nombre : l'égalité $u_n = o(v_n)$ se lit dans un seul sens, et $o(v_n) + o(v_n) = o(v_n)$ ne permet pas de simplifier. La relation $\sim$ est une relation d'équivalence. Deux suites équivalentes ont la même limite, quand l'une en a une, et le même signe à partir d'un certain rang. C'est ce qui rend les équivalents si commodes pour les limites et pour les séries à termes positifs.

::: proposition Règles de calcul sur les équivalents {#prop-equivalents}
Les équivalents se **multiplient**, se **divisent** et s'élèvent à une puissance fixée : si $u_n \sim v_n$ et $u'_n \sim v'_n$, alors $u_n u'_n \sim v_n v'_n$, $\frac{u_n}{u'_n} \sim \frac{v_n}{v'_n}$, et $u_n^\alpha \sim v_n^\alpha$ pour des suites positives.

En revanche, on **ne somme pas** les équivalents, et on ne compose pas par une fonction quelconque : $n + 1 \sim n$ et $-n \sim -n + \sqrt n$, mais la somme $(n + 1) - n = 1$ n'est pas équivalente à $n - n + \sqrt n = \sqrt n$ ; de même $n + 1 \sim n$, mais $e^{n+1} = e \cdot e^n$ n'est pas équivalent à $e^n$.
:::

Quand une somme pose problème, on revient aux développements avec des $o$, qui eux s'additionnent sans danger. Les équivalents de base proviennent des développements limités usuels en $0$.

::: proposition Équivalents usuels {#prop-usuels}
Si $x_n \to 0$, avec $x_n \neq 0$ :
$$\sin x_n \sim x_n, \qquad \tan x_n \sim x_n,$$
$$\ln(1 + x_n) \sim x_n, \qquad e^{x_n} - 1 \sim x_n,$$
$$1 - \cos x_n \sim \frac{x_n^2}{2}, \qquad (1 + x_n)^\alpha - 1 \sim \alpha\, x_n \quad (\alpha \neq 0).$$
:::

::: proposition Croissances comparées {#prop-croissances}
Pour tous $\alpha > 0$, $\beta > 0$ et $q > 1$ :
$$(\ln n)^\beta = o(n^\alpha), \qquad n^\alpha = o(q^n), \qquad q^n = o(n!), \qquad n! = o(n^n).$$
:::

Les deux derniers résultats se voient directement. Pour $n \ge 2q$, le quotient de deux termes consécutifs de $\frac{q^n}{n!}$ vaut $\frac{q}{n+1} \le \frac12$ : à partir de ce rang, la suite décroît au moins aussi vite qu'une suite géométrique de raison $\frac12$. Et $\frac{n!}{n^n} = \frac{1}{n} \cdot \frac{2}{n} \cdots \frac{n}{n} \le \frac1n$, puisque chaque facteur est au plus $1$. Retenir la hiérarchie : logarithmes, puissances, exponentielles, factorielle, $n^n$.

### Développements asymptotiques

Un **développement asymptotique** écrit une suite comme une somme de termes de plus en plus petits, par exemple $u_n = n - \ln n + \frac{\ln n}{n} + o\!\left(\frac{\ln n}{n}\right)$. Chaque terme est négligeable devant le précédent. La méthode la plus fréquente concerne les suites définies implicitement, comme solution d'une équation.

::: méthode Développer une suite définie implicitement {#meth-implicite}
Pour une suite $(x_n)$ définie comme solution d'une équation qui dépend de $n$ :

1. justifier l'existence et l'unicité de $x_n$, en général par stricte monotonie et théorème des valeurs intermédiaires ;
2. trouver la limite ou un premier équivalent, souvent par encadrement ;
3. écrire $x_n$ = (premier terme) + $y_n$, avec $y_n$ négligeable, reporter dans l'équation et en déduire un équivalent de $y_n$ ;
4. recommencer autant de fois que nécessaire.
:::

Exemple classique. Pour $n \ge 1$, la fonction $f(x) = \tan x - x$ est continue et strictement croissante sur $\left]n\pi - \frac\pi2, n\pi + \frac\pi2\right[$ (sa dérivée $\tan^2 x$ ne s'y annule qu'en $n\pi$), de limites $-\infty$ et $+\infty$ aux bornes. L'équation $\tan x = x$ y admet donc une unique solution $x_n$. Comme $\tan x_n = x_n > 0$, on a $x_n \in \left]n\pi, n\pi + \frac\pi2\right[$, d'où $x_n \sim n\pi$.

Posons $x_n = n\pi + \frac\pi2 - y_n$, avec $y_n \in \left]0, \frac\pi2\right[$. Alors $\tan x_n = \tan\left(\frac\pi2 - y_n\right) = \frac{1}{\tan y_n}$, donc $\tan y_n = \frac{1}{x_n} \to 0$, puis $y_n \to 0$ et $y_n \sim \tan y_n = \frac{1}{x_n} \sim \frac{1}{n\pi}$. Finalement :
$$x_n = n\pi + \frac\pi2 - \frac{1}{n\pi} + o\!\left(\frac1n\right).$$

## Séries numériques {#series}

Additionner une infinité de nombres n'a pas de sens a priori. Le paradoxe de Zénon, $\frac12 + \frac14 + \frac18 + \cdots = 1$, et la série de Grandi, $1 - 1 + 1 - 1 + \cdots$, dont Leibniz pensait que la somme valait $\frac12$, montrent qu'il faut une définition. Elle se ramène entièrement aux suites.

::: définition Série, sommes partielles, somme {#def-serie}
Soit $(u_n)$ une suite réelle ou complexe. La **série** $\sum u_n$ est la suite des **sommes partielles** $S_n = \sum_{k=0}^{n} u_k$. Elle **converge** si la suite $(S_n)$ converge, et sa limite est alors la **somme** de la série, notée $\sum_{n=0}^{+\infty} u_n$.

Si la série converge, son **reste** $R_n = \sum_{k=n+1}^{+\infty} u_k$ est bien défini et $R_n = S - S_n \to 0$.
:::

La **nature** d'une série (convergente ou divergente) ne dépend pas de ses premiers termes ; sa somme, si. Deux familles de séries se calculent exactement. La **série géométrique** $\sum q^n$ converge si et seulement si $|q| < 1$, et alors $\sum_{n=0}^{+\infty} q^n = \frac{1}{1 - q}$, puisque $S_n = \frac{1 - q^{n+1}}{1 - q}$ pour $q \neq 1$. Une **série télescopique** $\sum (a_n - a_{n+1})$ a pour sommes partielles $a_0 - a_{n+1}$ : elle converge si et seulement si $(a_n)$ converge, et sa somme vaut alors $a_0 - \lim a_n$.

::: proposition Divergence grossière {#prop-grossiere}
Si $\sum u_n$ converge, alors $u_n \to 0$, car $u_n = S_n - S_{n-1}$. Par contraposée, si $(u_n)$ ne tend pas vers $0$, la série **diverge grossièrement**.

La réciproque est fausse : la série harmonique $\sum \frac1n$ diverge, alors que $\frac1n \to 0$.
:::

Pour la série harmonique, on a $S_{2n} - S_n = \sum_{k=n+1}^{2n} \frac1k \ge n \cdot \frac{1}{2n} = \frac12$ : les sommes partielles ne forment pas une suite de Cauchy, donc elles divergent. Comme elles croissent, elles tendent vers $+\infty$, mais très lentement : il faut plus de $10^{43}$ termes pour dépasser $100$.

### Séries à termes positifs

::: théorème Séries à termes positifs {#thm-positive}
Si $u_n \ge 0$ pour tout $n$, la suite $(S_n)$ est croissante : la série $\sum u_n$ converge si et seulement si $(S_n)$ est majorée. On en déduit les critères de comparaison, pour $0 \le u_n \le v_n$ à partir d'un certain rang :

- si $\sum v_n$ converge, alors $\sum u_n$ converge ;
- si $\sum u_n$ diverge, alors $\sum v_n$ diverge.

Si $v_n \ge 0$ et $u_n = O(v_n)$ avec $\sum v_n$ convergente, alors $\sum u_n$ converge (absolument). Si $v_n \ge 0$ et $u_n \sim v_n$, les séries $\sum u_n$ et $\sum v_n$ sont de **même nature**.
:::

Toute la méthode d'étude d'une série à termes positifs est là : trouver un équivalent simple du terme général, puis le comparer à une série de référence, géométrique ou de Riemann. Le signe constant est indispensable.

::: remarque Le signe compte {#rem-signe}
Le critère des équivalents exige un **signe constant**. Avec $v_n = \frac{(-1)^n}{\sqrt n}$ et $u_n = v_n + \frac1n$, on a bien $u_n \sim v_n$ ; pourtant $\sum v_n$ converge, par le critère des séries alternées vu plus bas, tandis que $\sum u_n$ diverge, comme somme d'une série convergente et de la série harmonique.
:::

::: théorème Règle de d'Alembert {#thm-dalembert}
Soit $u_n > 0$ tel que $\frac{u_{n+1}}{u_n} \to \ell \in [0, +\infty]$. Si $\ell < 1$, la série $\sum u_n$ converge ; si $\ell > 1$, elle diverge grossièrement ; si $\ell = 1$, on ne peut pas conclure.
:::

Si $\ell < 1$, on choisit $q$ strictement entre $\ell$ et $1$ : à partir d'un rang $N$, $u_{n+1} \le q\, u_n$, donc $u_n \le u_N\, q^{n - N}$, et l'on compare à une série géométrique convergente. Si $\ell > 1$, la suite $(u_n)$ finit par croître et ne tend pas vers $0$. Le cas $\ell = 1$ est réellement indécis : $\sum \frac1n$ diverge et $\sum \frac{1}{n^2}$ converge, avec dans les deux cas un quotient qui tend vers $1$. La règle est faite pour les termes généraux qui contiennent des factorielles ou des exponentielles : $\sum \frac{x^n}{n!}$ converge pour tout $x > 0$, car le quotient vaut $\frac{x}{n+1} \to 0$.

::: théorème Comparaison série-intégrale {#thm-serie-integrale}
Soit $f : [n_0, +\infty[ \to \mathbb{R}_+$ continue et **décroissante**. Pour tout entier $k \ge n_0 + 1$,
$$\int_k^{k+1} f(t)\,dt \;\le\; f(k) \;\le\; \int_{k-1}^{k} f(t)\,dt.$$

Par conséquent, la série $\sum f(n)$ converge si et seulement si $\int_{n_0}^{x} f(t)\,dt$ admet une limite finie quand $x \to +\infty$.
:::

L'encadrement s'obtient en intégrant $f(k+1) \le f(t) \le f(k)$ sur $[k, k+1]$. En le sommant, on encadre les sommes partielles, ou les restes, par des intégrales que l'on sait souvent calculer. C'est ainsi que l'on traite la famille de séries de référence la plus importante.

::: corollaire Séries de Riemann {#cor-riemann}
La série $\sum_{n \ge 1} \frac{1}{n^\alpha}$ converge si et seulement si $\alpha > 1$.
:::

Si $\alpha \le 0$, le terme général ne tend pas vers $0$. Si $\alpha > 0$, la fonction $t \mapsto t^{-\alpha}$ est continue, positive et décroissante, et $\int_1^x t^{-\alpha}\,dt$ vaut $\frac{x^{1-\alpha} - 1}{1 - \alpha}$ pour $\alpha \neq 1$ et $\ln x$ pour $\alpha = 1$ : elle a une limite finie si et seulement si $\alpha > 1$. Le même encadrement donne, pour la série harmonique, $\ln(n+1) \le \sum_{k=1}^{n} \frac1k \le 1 + \ln n$, et pour $\alpha > 1$ un équivalent du reste : $\sum_{k > n} \frac{1}{k^\alpha} \sim \frac{1}{(\alpha - 1)\, n^{\alpha - 1}}$. La même technique montre que la série de Bertrand $\sum \frac{1}{n (\ln n)^\beta}$ converge si et seulement si $\beta > 1$.

### Convergence absolue

::: définition Convergence absolue {#def-absolue}
Une série réelle ou complexe $\sum u_n$ est **absolument convergente** si la série à termes positifs $\sum |u_n|$ converge.
:::

::: théorème La convergence absolue entraîne la convergence {#thm-absolue}
Si $\sum |u_n|$ converge, alors $\sum u_n$ converge, et
$$\left| \sum_{n=0}^{+\infty} u_n \right| \le \sum_{n=0}^{+\infty} |u_n|.$$
:::

::: preuve Par le critère de Cauchy
Notons $T_n$ les sommes partielles de $\sum |u_k|$. Pour $q > p$ : $|S_q - S_p| = \left| \sum_{k=p+1}^{q} u_k \right| \le \sum_{k=p+1}^{q} |u_k| = T_q - T_p$. Comme $(T_n)$ converge, elle est de Cauchy, donc $(S_n)$ aussi, et $(S_n)$ converge par complétude de $\mathbb{R}$ (de $\mathbb{C}$ pour une série complexe, en raisonnant sur les parties réelle et imaginaire). L'inégalité s'obtient en passant à la limite dans $|S_n| \le T_n$.
:::

Ce théorème ramène l'étude de nombreuses séries de signe quelconque à celle de séries positives, pour lesquelles on dispose des critères de comparaison. Une série qui converge sans converger absolument est dite **semi-convergente** ; la plus célèbre est $\sum \frac{(-1)^{n+1}}{n}$, dont la somme vaut $\ln 2$.

### Séries alternées

::: théorème Critère spécial des séries alternées {#thm-alternee}
Soit $(a_n)$ une suite réelle **décroissante** de limite nulle (donc positive). Alors la série $\sum (-1)^n a_n$ converge, et son reste $R_n = \sum_{k=n+1}^{+\infty} (-1)^k a_k$ vérifie
$$|R_n| \le a_{n+1},$$
et $R_n$ a le signe de son premier terme $(-1)^{n+1} a_{n+1}$.
:::

::: preuve Par les suites adjacentes
Les suites $(S_{2n})$ et $(S_{2n+1})$ sont adjacentes : $S_{2n+2} - S_{2n} = a_{2n+2} - a_{2n+1} \le 0$, $S_{2n+3} - S_{2n+1} = a_{2n+2} - a_{2n+3} \ge 0$ et $S_{2n} - S_{2n+1} = a_{2n+1} \to 0$. Elles convergent vers une même limite $S$, donc $S_n \to S$, et $S_{2n+1} \le S \le S_{2n}$ pour tout $n$.

On en tire $0 \le S - S_{2n+1} \le S_{2n+2} - S_{2n+1} = a_{2n+2}$ et $0 \le S_{2n} - S \le S_{2n} - S_{2n+1} = a_{2n+1}$ : c'est la majoration du reste, avec son signe.
:::

La majoration du reste est très concrète : elle dit combien de termes calculer pour obtenir une précision donnée. Pour la série de Leibniz $\sum_{n \ge 0} \frac{(-1)^n}{2n+1} = \frac\pi4$, la majoration $|R_n| \le \frac{1}{2n+3}$ demande environ cinq cents termes pour garantir une erreur inférieure à $10^{-3}$ : la convergence est lente, ce qui est typique des séries semi-convergentes.

## Compléments {#complements}

### Produit de Cauchy

Pour multiplier deux sommes infinies, il est naturel de regrouper les produits $a_k b_l$ selon la valeur de $k + l$, comme on le fait pour multiplier deux polynômes.

::: théorème Produit de Cauchy {#thm-produit-cauchy}
Si $\sum a_n$ et $\sum b_n$ sont **absolument convergentes**, la série de terme général $c_n = \sum_{k=0}^{n} a_k\, b_{n-k}$ est absolument convergente, et
$$\sum_{n=0}^{+\infty} c_n = \left( \sum_{n=0}^{+\infty} a_n \right) \left( \sum_{n=0}^{+\infty} b_n \right).$$
:::

Voici l'idée de la preuve. D'une part $\sum_{n \le N} |c_n| \le \sum_{k + l \le N} |a_k|\,|b_l| \le \left(\sum |a_k|\right) \left(\sum |b_l|\right)$, ce qui donne la convergence absolue. D'autre part, la différence entre le produit des sommes partielles $\left(\sum_{k \le N} a_k\right)\left(\sum_{l \le N} b_l\right)$ et $\sum_{n \le N} c_n$ ne contient que des produits $a_k b_l$ avec $k + l > N$, donc avec $k > \frac{N}{2}$ ou $l > \frac N2$ ; sa valeur absolue est majorée par $\left(\sum_k |a_k|\right)\left(\sum_{l > N/2} |b_l|\right) + \left(\sum_{k > N/2} |a_k|\right)\left(\sum_l |b_l|\right)$, qui tend vers $0$.

L'application la plus importante est la relation $e^{a} e^{b} = e^{a + b}$ pour l'exponentielle définie par $e^z = \sum \frac{z^n}{n!}$ : le terme $c_n$ vaut $\sum_{k=0}^{n} \frac{a^k}{k!} \frac{b^{n-k}}{(n-k)!} = \frac{(a + b)^n}{n!}$ par la formule du binôme. L'hypothèse de convergence absolue ne peut pas être supprimée : l'exercice complexe correspondant construit une série convergente dont le carré de Cauchy diverge.

### Sommation des relations de comparaison

::: théorème Sommation des relations de comparaison {#thm-sommation}
Soit $(v_n)$ une suite de réels **positifs**.

- *Cas convergent.* Si $\sum v_n$ converge et si $u_n = o(v_n)$, resp. $O(v_n)$, resp. $u_n \sim v_n$, alors $\sum u_n$ converge et les restes vérifient $\sum_{k > n} u_k = o\big(\sum_{k > n} v_k\big)$, resp. $O$, resp. $\sim$.
- *Cas divergent.* Si $\sum v_n$ diverge et si $u_n = o(v_n)$, resp. $O(v_n)$, resp. $u_n \sim v_n$, alors les sommes partielles vérifient $\sum_{k \le n} u_k = o\big(\sum_{k \le n} v_k\big)$, resp. $O$, resp. $\sim$.
:::

On transporte ainsi un équivalent du terme général vers un équivalent des sommes partielles ou des restes. Deux exemples. Comme $\frac1k \sim \ln(k+1) - \ln k$, termes positifs d'une série divergente, on obtient $\sum_{k=1}^{n} \frac1k \sim \ln(n+1) \sim \ln n$. Comme $\frac{1}{k^2} \sim \frac{1}{k-1} - \frac1k$ pour $k \ge 2$, termes positifs d'une série convergente, on obtient $\sum_{k > n} \frac{1}{k^2} \sim \sum_{k > n} \left(\frac{1}{k-1} - \frac1k\right) = \frac1n$.

### La constante d'Euler

::: exemple Constante d'Euler {#ex-euler}
La suite $\gamma_n = H_n - \ln n$, où $H_n = \sum_{k=1}^{n} \frac1k$, converge. Sa limite $\gamma \approx 0{,}5772$ est la **constante d'Euler** :
$$H_n = \ln n + \gamma + o(1).$$
:::

En effet, $\gamma_n - \gamma_{n+1} = \ln(n+1) - \ln n - \frac{1}{n+1} = -\ln\!\left(1 - \frac{1}{n+1}\right) - \frac{1}{n+1}$, et le développement $-\ln(1 - x) - x \sim \frac{x^2}{2}$ montre que ce terme est positif et équivalent à $\frac{1}{2n^2}$. La série télescopique $\sum (\gamma_n - \gamma_{n+1})$ converge donc, ce qui équivaut à la convergence de $(\gamma_n)$. On ignore encore aujourd'hui si $\gamma$ est rationnel.

### La formule de Stirling

::: théorème Formule de Stirling {#thm-stirling}
$$n! \sim \sqrt{2\pi n}\, \left( \frac{n}{e} \right)^n.$$
:::

Pour comprendre d'où vient cette formule, on compare $\ln n! = \sum_{k=1}^{n} \ln k$ à l'intégrale $\int_1^n \ln t\,dt = n \ln n - n + 1$. On pose $u_n = \frac{n!\, e^n}{n^{n + 1/2}}$ ; un calcul de développement limité donne $\ln u_{n+1} - \ln u_n = -\frac{1}{12 n^2} + O\!\left(\frac{1}{n^3}\right)$, de sorte que $(u_n)$ converge vers une constante $C > 0$. Il reste à identifier $C = \sqrt{2\pi}$, ce que l'on fait grâce aux intégrales de Wallis. L'exercice complexe correspondant mène cette preuve jusqu'au bout. La formule est remarquablement précise : pour $n = 10$, elle donne $3\,598\,696$ au lieu de $10! = 3\,628\,800$, soit une erreur relative inférieure à $1\,\%$, qui se comporte comme $\frac{1}{12n}$.
