## Dériver et intégrer une fonction vectorielle {#derivation-vectorielle}

Une fonction vectorielle $f : I \to \mathbb{R}^n$ décrit, par exemple, la position d'un mobile en fonction du temps. Tout se fait **coordonnée par coordonnée** : $f = (f_1, \ldots, f_n)$ est continue, dérivable, de classe $C^k$ si et seulement si chaque $f_i$ l'est. On reprend donc rapidement [[limites-continuite|l'analyse d'une variable]], en signalant ce qui change. En MP et MPI, le programme considère plus généralement des fonctions à valeurs dans un espace normé de dimension finie ; en PC et PSI, cette partie ouvre le calcul différentiel.

::: définition Dérivée d'une fonction vectorielle {#def-derivee-fv}
La fonction $f : I \to \mathbb{R}^n$ est **dérivable** en $a$ si $\frac{f(a + h) - f(a)}{h}$ a une limite quand $h \to 0$ ; cette limite $f'(a)$ est le **vecteur dérivé**. Cinématiquement, $f'(t)$ est le vecteur vitesse, $f''(t)$ l'accélération.
:::

::: proposition Opérations sur les dérivées {#prop-operations-fv}
Les combinaisons linéaires de fonctions dérivables sont dérivables. Si $\varphi : J \to I$ est dérivable, $(f \circ \varphi)' = \varphi' \cdot f' \circ \varphi$. Si $B$ est bilinéaire, $B(f, g)$ est dérivable et
$$B(f, g)' = B(f', g) + B(f, g').$$
Cela s'applique au produit $\lambda f$ par une fonction numérique, au produit scalaire $\langle f, g\rangle$, au produit vectoriel $f \wedge g$ dans $\mathbb{R}^3$, au déterminant $\det(f, g)$ dans $\mathbb{R}^2$.
:::

::: proposition Fonction de norme constante {#prop-norme-constante}
Si $f$ est dérivable et $\|f\|$ constante (norme euclidienne), alors $\langle f(t), f'(t)\rangle = 0$ pour tout $t$ : la vitesse d'un mouvement sur une sphère est tangente à la sphère.
:::

On dérive $\langle f, f\rangle$, constante : $2\langle f, f'\rangle = 0$. La **formule de Leibniz** s'étend aux fonctions $C^k$ : $(\lambda f)^{(k)} = \sum_j \binom kj \lambda^{(j)} f^{(k-j)}$.

::: théorème Intégrale sur un segment {#thm-integrale-fv}
Pour $f$ continue par morceaux sur $[a, b]$, on pose $\int_a^b f = \left(\int_a^b f_1, \ldots, \int_a^b f_n\right)$. Cette intégrale est linéaire, vérifie Chasles, et $\left\|\int_a^b f\right\| \le \int_a^b \|f\|$ ($a \le b$). Si $f$ est continue, $x \mapsto \int_a^x f$ est l'unique primitive de $f$ nulle en $a$.
:::

::: remarque L'égalité des accroissements finis tombe {#rem-taf-vectoriel}
Pour $f(t) = (\cos t, \sin t)$ sur $[0, 2\pi]$, $f(2\pi) - f(0) = 0$, mais $f'(t)$ ne s'annule jamais : il n'y a pas de « $c$ » tel que $f(b) - f(a) = (b - a)f'(c)$. En revanche l'**inégalité** des accroissements finis reste vraie pour $f$ de classe $C^1$ : $\|f(b) - f(a)\| = \left\|\int_a^b f'\right\| \le (b - a)\sup_{[a,b]}\|f'\|$.
:::

::: théorème Formules de Taylor {#thm-taylor-fv}
Soit $f$ de classe $C^{n+1}$ sur $I$ et $a, b \in I$.

- (MP, MPI) **Reste intégral** : $f(b) = \sum_{k=0}^{n}\frac{(b - a)^k}{k!}f^{(k)}(a) + \int_a^b\frac{(b - t)^n}{n!}f^{(n+1)}(t)\,dt$.
- (MP, MPI) **Inégalité de Taylor-Lagrange** : $\left\|f(b) - \sum_{k=0}^{n}\frac{(b - a)^k}{k!}f^{(k)}(a)\right\| \le \frac{|b - a|^{n+1}}{(n + 1)!}\sup\|f^{(n+1)}\|$, le sup étant pris entre $a$ et $b$.
- **Taylor-Young**, pour $f$ de classe $C^n$ : $f(a + h) = \sum_{k=0}^{n}\frac{h^k}{k!}f^{(k)}(a) + o(h^n)$.
:::

La formule avec reste intégral s'obtient par récurrence et intégrations par parties ; elle donne l'inégalité de Taylor-Lagrange par majoration de l'intégrale, et Taylor-Young à l'ordre $n$. Exemple : pour $f = \exp$ sur $[0, 1]$, $\left|e - \sum_{k=0}^{n}\frac{1}{k!}\right| \le \frac{e}{(n+1)!}$, d'où $e = \sum_{k \ge 0}\frac{1}{k!}$.

## Courbes paramétrées (PT) {#courbes-parametrees}

Ce chapitre est au programme de PT ; il illustre aussi les fonctions vectorielles pour les autres filières. On considère une **courbe paramétrée** $t \mapsto M(t)$ de classe $C^k$ ($k \ge 1$) à valeurs dans le plan ou l'espace.

::: définition Point régulier, tangente {#def-courbe}
Le point $M(t_0)$ est **régulier** si $M'(t_0) \neq \vec 0$, **stationnaire** sinon. En un point régulier, la **tangente** est la droite passant par $M(t_0)$ dirigée par $M'(t_0)$. La courbe est régulière si tous ses points le sont.
:::

Plus généralement, la tangente est la position limite de la corde $\big(M(t_0)M(t)\big)$ quand elle existe. Exemple : l'astroïde $(\cos^3 t, \sin^3 t)$ a des points stationnaires en $t = k\frac\pi2$, où elle présente des pointes.

::: méthode Étude locale en un point {#meth-etude-locale}
On cherche les deux premiers entiers $p < q$ tels que $M^{(p)}(t_0)$ soit non nul et $M^{(q)}(t_0)$ ne soit pas colinéaire à $M^{(p)}(t_0)$. Par Taylor-Young, près de $t_0$, $M(t) - M(t_0) \approx \frac{(t - t_0)^p}{p!}M^{(p)}(t_0) + \frac{(t - t_0)^q}{q!}M^{(q)}(t_0)$. La tangente est dirigée par $M^{(p)}(t_0)$ et la parité de $p$ et $q$ donne l'allure :

- $p$ impair, $q$ pair : point **ordinaire** (la courbe ne traverse pas sa tangente) ;
- $p$ impair, $q$ impair : point d'**inflexion** ;
- $p$ pair, $q$ impair : **rebroussement de première espèce** ;
- $p$ pair, $q$ pair : rebroussement de seconde espèce.
:::

::: définition Longueur, abscisse curviligne {#def-longueur}
La **longueur** d'une courbe régulière de classe $C^1$ entre les paramètres $a$ et $b$ est $L = \int_a^b\|M'(t)\|\,dt$. Une **abscisse curviligne** est une fonction $s$ telle que $s'(t) = \|M'(t)\|$ ; c'est une bijection croissante, qui permet de reparamétrer la courbe « à vitesse $1$ ».
:::

Pour un cercle de rayon $R$ paramétré par $(R\cos t, R\sin t)$, $\|M'\| = R$ et la longueur du cercle est $2\pi R$.

::: définition Repère de Frenet, courbure {#def-courbure}
Pour une courbe plane régulière de classe $C^2$ paramétrée par une abscisse curviligne $s$, on note $\vec T = \frac{dM}{ds}$ le vecteur tangent unitaire et $\vec N$ le vecteur unitaire directement orthogonal : $(M, \vec T, \vec N)$ est le **repère de Frenet**. En écrivant $\vec T = \cos\alpha\,\vec\imath + \sin\alpha\,\vec\jmath$, la **courbure** est $\gamma = \frac{d\alpha}{ds}$, et les **formules de Frenet** s'écrivent
$$\frac{d\vec T}{ds} = \gamma\,\vec N, \qquad \frac{d\vec N}{ds} = -\gamma\,\vec T.$$
En un point **birégulier** ($\gamma \neq 0$), $R = \frac1\gamma$ est le **rayon de courbure**, et $M + R\vec N$ le **centre de courbure**.
:::

La courbure mesure la vitesse à laquelle la direction de la tangente tourne quand on avance d'une unité de longueur ; son signe dit si la courbe tourne à gauche ou à droite. Un cercle de rayon $R$ parcouru dans le sens direct a pour courbure constante $\frac1R$ ; une droite, une courbure nulle. Le **cercle de courbure** est le cercle qui épouse le mieux la courbe au point ; l'ensemble des centres de courbure est la **développée**.

::: définition Enveloppe d'une famille de droites {#def-enveloppe}
Une famille de droites $D_t$ passant par $A(t)$ et dirigée par $\vec u(t)$ ($A$ et $\vec u$ de classe $C^1$) a pour **enveloppe** une courbe $t \mapsto M(t)$, $M(t) \in D_t$, tangente en chaque point à la droite $D_t$. On la cherche sous la forme $M(t) = A(t) + \lambda(t)\vec u(t)$ en imposant que $M'(t)$ soit colinéaire à $\vec u(t)$.
:::

Exemple : les normales à une courbe birégulière enveloppent sa développée.
