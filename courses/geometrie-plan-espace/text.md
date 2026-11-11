## Géométrie du plan {#plan}

Cette fiche (PTSI) reprend la géométrie du lycée avec les outils de l'algèbre : produit scalaire, produit mixte, produit vectoriel. Elle illustre les [[calcul-matriciel#def-systeme-lin|systèmes linéaires]] (intersections de droites et de plans) et prépare l'algèbre linéaire. Le plan est muni d'un repère orthonormé direct $(O, \vec{\imath}, \vec{\jmath})$ ; les démonstrations des propriétés géométriques ne sont pas exigibles.

::: définition Coordonnées polaires {#def-polaires}
Tout point $M \neq O$ du plan s'écrit $M = O + r(\cos\theta\,\vec{\imath} + \sin\theta\,\vec{\jmath})$ avec $r > 0$ et $\theta \in \mathbb{R}$ défini modulo $2\pi$ : $(r, \theta)$ est un couple de **coordonnées polaires** de $M$. On passe aux coordonnées cartésiennes par $x = r\cos\theta$, $y = r\sin\theta$, et inversement $r = \sqrt{x^2 + y^2}$.
:::

C'est l'écriture $z = re^{i\theta}$ de l'affixe de $M$ ([[nombres-complexes#def-argument]]).

::: définition Produit scalaire {#def-scalaire-plan}
Pour deux vecteurs non nuls, $\vec u \cdot \vec v = \|\vec u\|\,\|\vec v\|\cos(\vec u, \vec v)$, et $\vec u \cdot \vec v = 0$ si l'un est nul. Dans une base orthonormée, si $\vec u = (x, y)$ et $\vec v = (x', y')$,
$$\vec u \cdot \vec v = xx' + yy', \qquad \|\vec u\| = \sqrt{x^2 + y^2}.$$
:::

::: proposition Propriétés du produit scalaire {#prop-scalaire}
Le produit scalaire est **bilinéaire** et **symétrique** ; $\|\vec u + \vec v\|^2 = \|\vec u\|^2 + \|\vec v\|^2 + 2\,\vec u \cdot \vec v$, d'où la **polarisation** $\vec u \cdot \vec v = \frac12\big(\|\vec u + \vec v\|^2 - \|\vec u\|^2 - \|\vec v\|^2\big)$. Deux vecteurs sont **orthogonaux** si et seulement si leur produit scalaire est nul.
:::

Si $\vec u$ est unitaire, $\vec u \cdot \vec v$ est la mesure algébrique de la **projection orthogonale** de $\vec v$ sur la droite dirigée par $\vec u$.

::: définition Produit mixte dans le plan orienté {#def-mixte-plan}
Pour deux vecteurs non nuls, $[\vec u, \vec v] = \|\vec u\|\,\|\vec v\|\sin(\vec u, \vec v)$, et $[\vec u, \vec v] = 0$ si l'un est nul. Dans une base orthonormée directe, $[\vec u, \vec v] = xy' - x'y = \det(\vec u, \vec v)$.
:::

Le produit mixte est bilinéaire et **antisymétrique** ; $|[\vec u, \vec v]|$ est l'aire du parallélogramme construit sur $\vec u$ et $\vec v$, et son signe dit si $(\vec u, \vec v)$ est directe. Deux vecteurs sont **colinéaires** si et seulement si leur produit mixte est nul.

::: proposition Droites du plan {#prop-droites-plan}
La droite passant par $A$ et dirigée par $\vec u \neq \vec 0$ est $A + \operatorname{Vect}(\vec u) = \{A + t\vec u : t \in \mathbb{R}\}$ (**paramétrage**). Elle a une **équation cartésienne** $ax + by + c = 0$ avec $(a, b) \neq (0, 0)$, où $\vec n = (a, b)$ est un **vecteur normal** (orthogonal à $\vec u$) et $(-b, a)$ un vecteur directeur. Le point $M$ est sur la droite si et seulement si $[\vec u, \overrightarrow{AM}] = 0$, ou encore $\vec n \cdot \overrightarrow{AM} = 0$.
:::

::: proposition Distance d'un point à une droite {#prop-distance-droite}
La distance du point $M_0 = (x_0, y_0)$ à la droite $\mathcal{D}$ d'équation $ax + by + c = 0$ est
$$d(M_0, \mathcal{D}) = \frac{|ax_0 + by_0 + c|}{\sqrt{a^2 + b^2}} = \frac{|\vec n \cdot \overrightarrow{AM_0}|}{\|\vec n\|} = \frac{|[\vec u, \overrightarrow{AM_0}]|}{\|\vec u\|},$$
où $A$ est un point de $\mathcal{D}$. Elle est atteinte au **projeté orthogonal** $H$ de $M_0$ sur $\mathcal{D}$.
:::

La formule vient de ce que $\overrightarrow{HM_0}$ est colinéaire à $\vec n$ : $\vec n \cdot \overrightarrow{AM_0} = \vec n \cdot \overrightarrow{HM_0} = \pm\|\vec n\|\,HM_0$.

::: proposition Cercles {#prop-cercles}
Le cercle de centre $\Omega = (a, b)$ et de rayon $R > 0$ a pour équation $(x - a)^2 + (y - b)^2 = R^2$ et pour paramétrage $t \mapsto (a + R\cos t, b + R\sin t)$. Une équation $x^2 + y^2 - 2ax - 2by + c = 0$ décrit un cercle, un point ou l'ensemble vide, selon le signe de $a^2 + b^2 - c$. Le cercle de diamètre $[AB]$ est l'ensemble des points $M$ tels que $\overrightarrow{MA} \cdot \overrightarrow{MB} = 0$.
:::

## Géométrie de l'espace {#espace}

L'espace est muni d'un repère orthonormé direct $(O, \vec\imath, \vec\jmath, \vec k)$ ; la notion d'orientation, qui repose sur les conventions physiques usuelles (règle de la main droite), est admise.

::: définition Coordonnées cylindriques {#def-cylindriques}
Un point $M$ de l'espace s'écrit $M = O + r\cos\theta\,\vec\imath + r\sin\theta\,\vec\jmath + z\,\vec k$ : $(r, \theta, z)$ sont des **coordonnées cylindriques** de $M$, coordonnées polaires du projeté de $M$ sur le plan $(O, \vec\imath, \vec\jmath)$ complétées par la cote $z$.
:::

Le produit scalaire de l'espace se définit et se calcule comme dans le plan : $\vec u \cdot \vec v = xx' + yy' + zz'$ dans une base orthonormée.

::: définition Produit vectoriel {#def-vectoriel}
Si $\vec u$ et $\vec v$ ne sont pas colinéaires, leur **produit vectoriel** $\vec u \wedge \vec v$ est le vecteur orthogonal au plan $\operatorname{Vect}(\vec u, \vec v)$, de norme $\|\vec u\|\,\|\vec v\|\,|\sin(\vec u, \vec v)|$, tel que $(\vec u, \vec v, \vec u \wedge \vec v)$ soit directe ; si $\vec u$ et $\vec v$ sont colinéaires, $\vec u \wedge \vec v = \vec 0$. Dans une base orthonormée directe,
$$(x, y, z) \wedge (x', y', z') = (yz' - zy',\ zx' - xz',\ xy' - yx').$$
:::

::: proposition Propriétés du produit vectoriel {#prop-vectoriel}
Le produit vectoriel est **bilinéaire** et **antisymétrique** ($\vec v \wedge \vec u = -\vec u \wedge \vec v$). Deux vecteurs sont colinéaires si et seulement si leur produit vectoriel est nul. La norme $\|\vec u \wedge \vec v\|$ est l'aire du parallélogramme construit sur $\vec u$ et $\vec v$. Par exemple $\vec\imath \wedge \vec\jmath = \vec k$, $\vec\jmath \wedge \vec k = \vec\imath$, $\vec k \wedge \vec\imath = \vec\jmath$.
:::

Le produit vectoriel n'est pas associatif : $(\vec\imath \wedge \vec\imath) \wedge \vec\jmath = \vec 0$, mais $\vec\imath \wedge (\vec\imath \wedge \vec\jmath) = \vec\imath \wedge \vec k = -\vec\jmath$. En physique, il donne le moment d'une force et la force de Lorentz.

::: définition Produit mixte dans l'espace {#def-mixte-espace}
Le **produit mixte** de trois vecteurs est $[\vec u, \vec v, \vec w] = (\vec u \wedge \vec v) \cdot \vec w$. Il est trilinéaire et antisymétrique ; dans une base orthonormée directe, c'est le déterminant $\det(\vec u, \vec v, \vec w)$ des coordonnées.
:::

$|[\vec u, \vec v, \vec w]|$ est le **volume** du parallélépipède construit sur les trois vecteurs ; ils sont **coplanaires** si et seulement si leur produit mixte est nul (voir aussi [[determinants#rem-aire]]).

::: proposition Plans de l'espace {#prop-plans}
Un plan est défini par un point et deux vecteurs non colinéaires ($A + \operatorname{Vect}(\vec u, \vec v)$, **paramétrage** $A + s\vec u + t\vec v$), par trois points non alignés, ou par un point $A$ et un **vecteur normal** $\vec n \neq \vec 0$. Il a une équation cartésienne $ax + by + cz = d$, où $\vec n = (a, b, c)$ est normal ; on peut prendre $\vec n = \vec u \wedge \vec v$. Le point $M$ est dans le plan si et seulement si $[\vec u, \vec v, \overrightarrow{AM}] = 0$.
:::

::: proposition Distance d'un point à un plan {#prop-distance-plan}
La distance du point $M_0 = (x_0, y_0, z_0)$ au plan $\mathcal{P}$ d'équation $ax + by + cz = d$ est
$$d(M_0, \mathcal{P}) = \frac{|ax_0 + by_0 + cz_0 - d|}{\sqrt{a^2 + b^2 + c^2}}.$$
:::

::: proposition Droites de l'espace {#prop-droites-espace}
La droite passant par $A$ et dirigée par $\vec u \neq \vec 0$ a pour paramétrage $A + t\vec u$ ; elle peut aussi être définie comme l'intersection de deux plans non parallèles, par un système de deux équations cartésiennes. La distance d'un point $M_0$ à cette droite est
$$d(M_0, \mathcal{D}) = \frac{\|\overrightarrow{AM_0} \wedge \vec u\|}{\|\vec u\|}.$$
:::

Deux droites de l'espace peuvent être sécantes, parallèles, ou **non coplanaires** : elles ne se coupent pas sans être parallèles. Dans ce dernier cas, elles ont une unique **perpendiculaire commune**, qui réalise la distance entre elles (exercice c1).
