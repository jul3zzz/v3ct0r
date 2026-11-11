## Familles de réels positifs {#positives}

Une série additionne des termes **dans un ordre** : $u_0$, puis $u_1$, puis $u_2$… Pour des doubles sommes $\sum_{p,q} u_{p,q}$, ou des sommes indexées par des ensembles sans ordre naturel, on veut sommer « en vrac », dans l'ordre que l'on veut, et regrouper les termes à sa guise. Les familles sommables donnent ce cadre. Cette fiche correspond à la fin des « procédés sommatoires discrets » de MPSI et MP2I ; en MP, MPI, PC et PSI, la notion est reprise en seconde année, avec les ensembles dénombrables, au service des probabilités. Elle prolonge le cours [[suites-series#series|sur les séries]].

Dans cette fiche, $I$ est un ensemble quelconque d'indices (en pratique $\mathbb{N}$, $\mathbb{Z}$, $\mathbb{N}^2$…). On calcule dans $[0, +\infty]$ avec les conventions $x + (+\infty) = +\infty$ et $x \le +\infty$ ; toute partie de $[0, +\infty]$ a une borne supérieure, éventuellement $+\infty$.

::: définition Somme d'une famille de réels positifs {#def-somme-positive}
Soit $(u_i)_{i \in I}$ une famille d'éléments de $[0, +\infty]$. Sa **somme** est
$$\sum_{i \in I} u_i = \sup\Big\{\sum_{i \in F} u_i : F \text{ partie finie de } I\Big\} \in [0, +\infty].$$
La famille est **sommable** si cette somme est finie.
:::

::: proposition Lien avec les séries, invariance par permutation {#prop-lien-series}
Si $I = \mathbb{N}$ et $u_n \ge 0$, la somme de la famille $(u_n)$ est la somme de la série $\sum u_n$, égale à $+\infty$ si la série diverge. La somme d'une famille positive ne dépend pas de l'ordre : pour toute bijection $\sigma$ de $I$, $\sum_{i} u_{\sigma(i)} = \sum_i u_i$.
:::

Les opérations sont les attendues : $\sum (u_i + v_i) = \sum u_i + \sum v_i$, $\sum \lambda u_i = \lambda \sum u_i$ pour $\lambda \ge 0$, et si $u_i \le v_i$ pour tout $i$, $\sum u_i \le \sum v_i$.

::: théorème Sommation par paquets, cas positif {#thm-paquets-positif}
Soit $(u_i)_{i \in I}$ une famille d'éléments de $[0, +\infty]$, et $I = \bigcup_{j \in J} I_j$ une partition de $I$. Alors
$$\sum_{i \in I} u_i = \sum_{j \in J}\Big(\sum_{i \in I_j} u_i\Big),$$
**sans aucune hypothèse** : l'égalité a lieu dans $[0, +\infty]$, et la famille est sommable si et seulement si le membre de droite est fini.
:::

La démonstration est hors programme. Le point essentiel est pratique : pour une famille **positive**, on calcule d'abord, en regroupant comme on veut, et le calcul **décide** de la sommabilité.

::: corollaire Théorème de Fubini positif {#cor-fubini-positif}
Pour une famille $(u_{p,q})_{(p,q) \in \mathbb{N}^2}$ de réels positifs,
$$\sum_{(p,q) \in \mathbb{N}^2} u_{p,q} = \sum_{p=0}^{+\infty}\sum_{q=0}^{+\infty} u_{p,q} = \sum_{q=0}^{+\infty}\sum_{p=0}^{+\infty} u_{p,q}.$$
On peut aussi sommer par « diagonales » : $\sum_{n=0}^{+\infty}\sum_{p + q = n} u_{p,q}$.
:::

Exemple : $\sum_{(p,q) \in \mathbb{N}^2} \frac{1}{2^{p+q}} = \Big(\sum_p \frac{1}{2^p}\Big)\Big(\sum_q \frac{1}{2^q}\Big) = 4$ (exercice s1). Exemple de sommation par diagonales : $\sum_{(p,q) \in (\mathbb{N}^*)^2} \frac{1}{(p+q)^\alpha} = \sum_{n \ge 2} \frac{n - 1}{n^\alpha}$, finie si et seulement si $\alpha > 2$ (exercice c1).

## Familles sommables de complexes {#complexes-sommables}

::: définition Famille sommable de complexes {#def-sommable}
Une famille $(u_i)_{i \in I}$ de nombres complexes est **sommable** si $\sum_{i \in I} |u_i| < +\infty$. On note $\ell^1(I)$ l'ensemble de ces familles. Pour une famille sommable de réels, on pose $\sum u_i = \sum u_i^+ - \sum u_i^-$, où $u_i^+ = \max(u_i, 0)$ et $u_i^- = \max(-u_i, 0)$ ; pour des complexes, $\sum u_i = \sum \operatorname{Re} u_i + i\sum\operatorname{Im} u_i$.
:::

Pour $I = \mathbb{N}$, une famille est sommable si et seulement si la série $\sum u_n$ est **absolument convergente**, et les deux sommes coïncident. Une série semi-convergente, comme $\sum \frac{(-1)^n}{n + 1}$, ne définit pas une famille sommable : sa somme dépend de l'ordre des termes.

::: proposition Domination, sous-familles, linéarité {#prop-domination}
- Si $|u_i| \le v_i$ pour tout $i$ et si $(v_i)$ est une famille sommable de réels positifs, alors $(u_i)$ est sommable.
- Toute sous-famille d'une famille sommable est sommable.
- La somme est **linéaire** sur $\ell^1(I)$ et invariante par permutation des indices.
- Si $(u_i)$ est sommable, pour tout $\varepsilon > 0$, il existe une partie finie $F$ de $I$ telle que $\big|\sum_{i \in I} u_i - \sum_{i \in F} u_i\big| \le \varepsilon$.
:::

::: théorème Sommation par paquets, cas sommable {#thm-paquets}
Si $(u_i)_{i \in I}$ est **sommable** et si $I = \bigcup_{j \in J} I_j$ est une partition, chaque $(u_i)_{i \in I_j}$ est sommable, la famille $\big(\sum_{i \in I_j} u_i\big)_{j \in J}$ est sommable, et
$$\sum_{i \in I} u_i = \sum_{j \in J}\Big(\sum_{i \in I_j} u_i\Big).$$
En particulier (**Fubini**), pour une famille sommable indexée par $\mathbb{N}^2$, les deux sommes itérées sont égales à la somme de la famille.
:::

La démarche préconisée : on **justifie la sommabilité** en appliquant le cas positif aux $|u_i|$ (calcul « formel » dans $[0, +\infty]$), puis on calcule la somme en regroupant comme on veut. Sans sommabilité, les sommes itérées peuvent exister et être **différentes**.

::: proposition Produit de deux familles sommables {#prop-produit-familles}
Si $(a_i)_{i \in I}$ et $(b_k)_{k \in K}$ sont sommables, la famille $(a_i b_k)_{(i,k) \in I \times K}$ est sommable et
$$\sum_{(i,k) \in I \times K} a_i b_k = \Big(\sum_{i \in I} a_i\Big)\Big(\sum_{k \in K} b_k\Big).$$
:::

En sommant par paquets selon $i + k = n$, on retrouve le [[suites-series#thm-produit-cauchy|produit de Cauchy]] de deux séries absolument convergentes : $\big(\sum a_n\big)\big(\sum b_n\big) = \sum_n c_n$ avec $c_n = \sum_{k=0}^{n} a_k b_{n-k}$. Appliqué à $a_n = \frac{z^n}{n!}$ et $b_n = \frac{w^n}{n!}$, il donne $e^z e^w = e^{z + w}$ : l'exponentielle complexe, définie par sa série, est un morphisme de $(\mathbb{C}, +)$ dans $(\mathbb{C}^*, \times)$.

::: remarque Seconde année {#rem-seconde-annee}
En MP, MPI, PC et PSI, on reprend ces résultats avec la notion d'**ensemble dénombrable** (en bijection avec $\mathbb{N}$) : un univers probabilisé dénombrable est décrit par une famille sommable de probabilités de somme $1$, et l'espérance d'une variable discrète est la somme d'une famille, quand elle est sommable.
:::
