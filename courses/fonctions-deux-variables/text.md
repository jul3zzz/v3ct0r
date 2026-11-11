## Ouverts et continuité {#ouverts-continuite}

Une fonction de deux variables $f : (x, y) \mapsto f(x, y)$ se représente par une **surface** d'équation $z = f(x, y)$ : un relief au-dessus du plan, dont on lit les pentes, les sommets et les cols. Le point de vue de cette fiche est essentiellement pratique : calculer des dérivées partielles, appliquer la règle de la chaîne, trouver des points critiques. Tout sera repris dans un cadre plus général en seconde année (calcul différentiel). On munit $\mathbb{R}^2$ de la norme euclidienne $\|(x, y)\| = \sqrt{x^2 + y^2}$.

::: définition Boules, ouverts de ℝ² {#def-ouvert-r2}
La **boule ouverte** de centre $a \in \mathbb{R}^2$ et de rayon $r > 0$ est $B(a, r) = \{m \in \mathbb{R}^2 : \|m - a\| < r\}$, le disque sans son bord. Une partie $U$ de $\mathbb{R}^2$ est **ouverte** si, pour tout point $a \in U$, une boule $B(a, r)$ est contenue dans $U$.
:::

Le plan entier, un disque sans bord, un demi-plan $\{x > 0\}$ sont ouverts ; un disque fermé ne l'est pas (aucune boule centrée sur le bord n'y est contenue). Travailler sur un ouvert permet de s'approcher d'un point **dans toutes les directions**, ce qui est nécessaire pour dériver.

::: définition Continuité {#def-continuite-2}
Soit $U$ un ouvert de $\mathbb{R}^2$ et $f : U \to \mathbb{R}$. La fonction $f$ est **continue en $a \in U$** si $\forall \varepsilon > 0,\ \exists \eta > 0,\ \forall m \in U,\ \|m - a\| < \eta \implies |f(m) - f(a)| \le \varepsilon$, et continue sur $U$ si elle l'est en tout point.
:::

Les sommes, produits, quotients et composées de fonctions continues sont continues : les fonctions polynomiales en $x$ et $y$, ou $(x, y) \mapsto e^{xy}\cos(x - y)$, sont continues sur $\mathbb{R}^2$. L'étude de la continuité n'est pas un objectif du programme : la notion sert au calcul différentiel.

## Dérivées partielles et gradient {#derivees-partielles}

::: définition Dérivées partielles {#def-derivees-partielles}
Soit $f : U \to \mathbb{R}$ et $(x_0, y_0) \in U$. La **dérivée partielle** de $f$ par rapport à $x$ en $(x_0, y_0)$ est, si elle existe, la dérivée en $x_0$ de la fonction d'une variable $x \mapsto f(x, y_0)$ :
$$\frac{\partial f}{\partial x}(x_0, y_0) = \lim_{h \to 0}\frac{f(x_0 + h, y_0) - f(x_0, y_0)}{h},$$
et de même pour $\frac{\partial f}{\partial y}(x_0, y_0)$, en fixant $x = x_0$.
:::

En pratique, on dérive par rapport à une variable **en considérant l'autre comme une constante**. Pour $f(x, y) = x^2 y + \sin(xy)$ : $\frac{\partial f}{\partial x} = 2xy + y\cos(xy)$ et $\frac{\partial f}{\partial y} = x^2 + x\cos(xy)$.

::: remarque Dérivées partielles et continuité {#rem-partielles-continuite}
Contrairement au cas d'une variable, l'existence des dérivées partielles **n'entraîne pas** la continuité. La fonction $f(x, y) = \frac{xy}{x^2 + y^2}$, prolongée par $f(0, 0) = 0$, est nulle sur les deux axes, donc a des dérivées partielles nulles en $(0, 0)$ ; mais $f(t, t) = \frac12$ pour $t \neq 0$ : elle n'est pas continue en $(0, 0)$.
:::

::: définition Fonction de classe C¹ {#def-c1-2}
La fonction $f$ est **de classe $C^1$** sur l'ouvert $U$ si ses deux dérivées partielles existent en tout point de $U$ et sont continues sur $U$.
:::

::: théorème Développement limité à l'ordre 1 {#thm-dl1-2}
Si $f$ est de classe $C^1$ sur $U$ et $(x_0, y_0) \in U$, alors, quand $(h, k) \to (0, 0)$, les dérivées partielles étant prises en $(x_0, y_0)$,
$$f(x_0 + h, y_0 + k) = f(x_0, y_0) + \frac{\partial f}{\partial x}\,h + \frac{\partial f}{\partial y}\,k + o\big(\|(h, k)\|\big).$$
En particulier, une fonction de classe $C^1$ est continue.
:::

La démonstration est hors programme. Ce développement dit que, près de $(x_0, y_0)$, la surface ressemble à un plan : le **plan tangent**, d'équation
$$z - z_0 = \frac{\partial f}{\partial x}(x_0, y_0)(x - x_0) + \frac{\partial f}{\partial y}(x_0, y_0)(y - y_0), \qquad z_0 = f(x_0, y_0).$$

::: définition Gradient {#def-gradient}
Le **gradient** de $f$, de classe $C^1$, en $(x_0, y_0)$ est le vecteur
$$\nabla f(x_0, y_0) = \left(\frac{\partial f}{\partial x}(x_0, y_0), \frac{\partial f}{\partial y}(x_0, y_0)\right).$$
Le développement limité s'écrit $f(m_0 + v) = f(m_0) + \langle \nabla f(m_0), v\rangle + o(\|v\|)$, où $\langle \cdot, \cdot \rangle$ est le produit scalaire canonique.
:::

::: proposition Dérivée selon un vecteur {#prop-derivee-vecteur}
Si $f$ est de classe $C^1$ et $u \in \mathbb{R}^2$, la fonction $t \mapsto f(m_0 + tu)$ est dérivable en $0$, de dérivée
$$D_u f(m_0) = \langle \nabla f(m_0), u\rangle.$$
Parmi les vecteurs unitaires $u$, cette dérivée est maximale pour $u$ dirigé selon le gradient (s'il est non nul) : **le gradient indique la direction dans laquelle $f$ croît le plus vite**, et sa norme est la pente dans cette direction.
:::

La dernière affirmation vient de l'inégalité de Cauchy-Schwarz : $\langle \nabla f, u\rangle \le \|\nabla f\|$ pour $\|u\| = 1$, avec égalité pour $u = \frac{\nabla f}{\|\nabla f\|}$.

## Règle de la chaîne et extremums {#chaine-extremums}

::: théorème Règle de la chaîne {#thm-chaine}
Soient $f$ de classe $C^1$ sur $U$, et $x, y$ de classe $C^1$ sur un intervalle $I$, avec $(x(t), y(t)) \in U$ pour tout $t$. Alors $g : t \mapsto f(x(t), y(t))$ est de classe $C^1$ et
$$g'(t) = \frac{\partial f}{\partial x}\big(x(t), y(t)\big)\,x'(t) + \frac{\partial f}{\partial y}\big(x(t), y(t)\big)\,y'(t),$$
c'est-à-dire
$$g'(t) = \big\langle \nabla f(\gamma(t)), \gamma'(t)\big\rangle,$$
où $\gamma(t) = (x(t), y(t))$ et $\gamma'(t) = (x'(t), y'(t))$.
:::

C'est la dérivée de $f$ **le long de la courbe** $\gamma$ : la vitesse de variation de l'altitude pour un marcheur qui suit le chemin $\gamma$.

::: proposition Gradient et lignes de niveau {#prop-lignes-niveau}
Si $\gamma$ est une courbe tracée sur une ligne de niveau de $f$ ($f(\gamma(t)) = c$ pour tout $t$), alors $\langle \nabla f(\gamma(t)), \gamma'(t)\rangle = 0$ : **le gradient est orthogonal aux lignes de niveau**.
:::

Sur une carte topographique, le gradient est perpendiculaire aux courbes de niveau, dirigé vers les altitudes croissantes ; il est d'autant plus long que les courbes sont serrées.

::: proposition Dérivées partielles d'une composée {#prop-composee-2}
Si $f$, $\varphi$ et $\psi$ sont de classe $C^1$ et $g(u, v) = f\big(\varphi(u, v), \psi(u, v)\big)$, alors
$$\frac{\partial g}{\partial u} = \frac{\partial f}{\partial x}\,\frac{\partial \varphi}{\partial u} + \frac{\partial f}{\partial y}\,\frac{\partial \psi}{\partial u}, \qquad \frac{\partial g}{\partial v} = \frac{\partial f}{\partial x}\,\frac{\partial \varphi}{\partial v} + \frac{\partial f}{\partial y}\,\frac{\partial \psi}{\partial v},$$
les dérivées partielles de $f$ étant prises en $\big(\varphi(u, v), \psi(u, v)\big)$.
:::

Exemple, les **coordonnées polaires** : si $g(r, \theta) = f(r\cos\theta, r\sin\theta)$, alors $\frac{\partial g}{\partial r} = \cos\theta\,\frac{\partial f}{\partial x} + \sin\theta\,\frac{\partial f}{\partial y}$ et $\frac{\partial g}{\partial \theta} = -r\sin\theta\,\frac{\partial f}{\partial x} + r\cos\theta\,\frac{\partial f}{\partial y}$ (exercice m1).

::: définition Extremums {#def-extremum-2}
Soit $f$ définie sur une partie $A$ de $\mathbb{R}^2$. Elle a un **maximum global** en $a \in A$ si $f(m) \le f(a)$ pour tout $m \in A$, un **maximum local** si cette inégalité a lieu pour $m \in A$ dans une boule $B(a, r)$ ; de même pour un minimum. Un **point critique** de $f$, de classe $C^1$ sur un ouvert, est un point où $\nabla f = 0$.
:::

::: théorème Un extremum local est un point critique {#thm-extremum-critique}
Si $f$ est de classe $C^1$ sur un **ouvert** $U$ et a un extremum local en $a \in U$, alors $\nabla f(a) = 0$.
:::

Les fonctions d'une variable $x \mapsto f(x, y_0)$ et $y \mapsto f(x_0, y)$ ont un extremum local en un point intérieur : leurs dérivées y sont nulles ([[limites-continuite#prop-extremum]]). La réciproque est fausse : $(x, y) \mapsto x^2 - y^2$ a un point critique en $(0, 0)$ qui n'est pas un extremum, mais un **col** (une selle de cheval).

::: méthode Étudier les points critiques {#meth-points-critiques}
1. Résoudre le système $\frac{\partial f}{\partial x} = 0$, $\frac{\partial f}{\partial y} = 0$ : les extremums locaux sur un ouvert sont parmi ses solutions.
2. En chaque point critique $a$, étudier le signe de $f(a + (h, k)) - f(a)$ pour $(h, k)$ petit : s'il garde un signe constant, c'est un extremum local ; s'il change de signe (par exemple le long de deux droites), ce n'en est pas un.
3. Pour un extremum **global**, comparer les valeurs aux points critiques, et étudier le comportement à l'infini ou sur le bord du domaine.
:::

Exemple : $f(x, y) = x^2 + xy + y^2$ a pour seul point critique $(0, 0)$, et $f(x, y) = \left(x + \frac y2\right)^2 + \frac34 y^2 \ge 0 = f(0, 0)$ : c'est un minimum global. Un exemple plus riche, avec un point critique qui n'est pas un extremum, fait l'objet de l'exercice c1.
