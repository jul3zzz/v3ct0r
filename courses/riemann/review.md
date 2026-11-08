# L'intégrale de Riemann, construite proprement — points à faire vérifier

Relecture humaine demandée avant diffusion. Les points ci-dessous sont ceux où une imprécision passerait facilement inaperçue.

## Choix de construction
- **Approche choisie** : fonctions en escalier + intégrales inférieure/supérieure (présentation de Darboux). Le programme MPSI construit l'intégrale des fonctions continues par morceaux par approximation uniforme par des fonctions en escalier ; les deux approches donnent la même intégrale sur ces fonctions. Vérifier que le vocabulaire (« intégrable au sens de Riemann ») est cohérent avec le cours suivi par l'élève.
- **Bornes $m_i$, $M_i$ prises sur les intervalles ouverts** $]x_{i-1}, x_i[$ (et non fermés). Avec ce choix, la fonction en escalier valant $m_i$ sur l'ouvert et $f(x_i)$ aux nœuds est bien sous $f$, et toute $\varphi \le f$ adaptée à $\sigma$ vérifie $I(\varphi) \le s(f,\sigma)$, d'où $I^-(f) = \sup_\sigma s(f,\sigma)$ exactement. Beaucoup de manuels prennent les fermés : le résultat final est identique, mais l'égalité « $I^-(f) = \sup s$ » demande alors un argument de raffinement. À valider.

## Preuves à relire
- **Lemme d'indépendance** (segment e4) : la récurrence sur le nombre de points ajoutés est seulement évoquée oralement.
- **Raffinement des sommes de Darboux** (d6b) : l'inégalité $\inf_{]x_{i-1},y[} f \ge m_i$ et $\inf_{]y,x_i[} f \ge m_i$ ; le point $y$ lui-même n'intervient pas (intervalles ouverts). OK, mais à vérifier à l'oral.
- **Calcul de la parabole** : $s_n = \frac{(n-1)(2n-1)}{6n^2}$, $S_n = \frac{(n+1)(2n+1)}{6n^2}$, $S_n - s_n = \frac1n$ (vérifié : $\frac{(n+1)(2n+1) - (n-1)(2n-1)}{6n^2} = \frac{6n}{6n^2}$).
- **Continues ⇒ intégrables** : on utilise $M_i - m_i \le \frac{\varepsilon}{b-a}$ à partir de $|f(x) - f(y)| \le \frac{\varepsilon}{b-a}$ pour $x, y$ dans le morceau (passage aux bornes sup/inf). Correct.
- **Linéarité** : seul le cas de la somme est détaillé ; le produit par un scalaire négatif est évoqué (« on échange minorantes et majorantes »).
- **Chasles** : énoncé avec l'équivalence d'intégrabilité ; la preuve est seulement esquissée (« ajouter $c$ aux subdivisions »).
- **Sommes de Riemann** : prouvé pour $f$ continue ; le cas général (Darboux : toute fonction intégrable) est **énoncé sans preuve**, c'est voulu.
- **Erreur pour $f$ $K$-lipschitzienne** : $\frac{K(b-a)^2}{2n}$ (vérifié : $n \cdot \frac{K h^2}{2}$ avec $h = \frac{b-a}{n}$).
- **« Avec les milieux, l'erreur décroît comme $1/n^2$ pour une fonction assez régulière »** : énoncé sans preuve ($f$ de classe $C^2$ suffit). À garder ou à préciser.
- **TFA** : $F$ lipschitzienne si $f$ est bornée par $M$ ; dérivabilité en un point de continuité ; l'unicité de la primitive à constante près utilise le théorème des accroissements finis (mentionné).

## Notations
- $\mathcal{E}([a,b])$ pour les fonctions en escalier, $\mathcal{R}([a,b])$ pour les intégrables, $I(\varphi)$ pour l'intégrale d'une fonction en escalier, $s(f,\sigma)$ / $S(f,\sigma)$ pour les sommes de Darboux, $\delta(\sigma)$ pour le pas. Vérifier la cohérence avec les notations du professeur.

## Formulations orales
- Phrase « une fonction monotone peut avoir une infinité de discontinuités » : vrai (une infinité dénombrable au plus).
- Remarque finale sur la fonction de Dirichlet comme limite simple croissante de fonctions intégrables d'intégrale nulle (indicatrices de parties finies de $\mathbb{Q} \cap [0,1]$) : correcte.

## Références
- Gourdon (Analyse), Rudin (*Principles of Mathematical Analysis*, chap. 6), Monier (Analyse MPSI). Aucune autre référence n'est citée.
