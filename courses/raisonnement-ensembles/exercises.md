# s1 · simple · 10 · Nier « f est bornée »
Soit $f : \mathbb{R} \to \mathbb{R}$. La phrase « $f$ est bornée » s'écrit $\exists M \in \mathbb{R},\ \forall x \in \mathbb{R},\ |f(x)| \le M$. Quelle est sa négation ?
## Indice
La négation échange $\exists$ et $\forall$, de gauche à droite.
## Indice
Puis on nie la propriété finale $|f(x)| \le M$.
## Indice
La négation de $|f(x)| \le M$ est $|f(x)| > M$, pas $|f(x)| \ge M$.
## Étape · 1
$\operatorname{non}(\exists M,\ \forall x,\ |f(x)| \le M) \iff \forall M,\ \operatorname{non}(\forall x,\ |f(x)| \le M) \iff \forall M,\ \exists x,\ |f(x)| > M$.
## Étape · 1
Autrement dit, $f$ n'est pas bornée si, pour tout réel $M$, il existe un point où $|f|$ dépasse $M$. Exemple : $x \mapsto x$, avec $x = |M| + 1$.
## Réponse
qcm C
- $\exists M \in \mathbb{R},\ \forall x \in \mathbb{R},\ |f(x)| > M$
- $\forall M \in \mathbb{R},\ \forall x \in \mathbb{R},\ |f(x)| > M$
- $\forall M \in \mathbb{R},\ \exists x \in \mathbb{R},\ |f(x)| > M$
- $\exists x \in \mathbb{R},\ \forall M \in \mathbb{R},\ |f(x)| > M$

# m1 · moyen · 25 · Partie paire, partie impaire
Montrer par analyse-synthèse que toute fonction $f : \mathbb{R} \to \mathbb{R}$ s'écrit de façon unique $f = p + i$ avec $p$ paire et $i$ impaire. Déterminer $p$ et $i$ pour $f = \exp$, et donner $p(0)$.
## Indice
Analyse : si $f = p + i$, écrire $f(-x)$ en fonction de $p(x)$ et $i(x)$.
## Indice
On obtient le système $f(x) = p(x) + i(x)$, $f(-x) = p(x) - i(x)$ : le résoudre.
## Indice
Synthèse : vérifier que les fonctions trouvées sont paire et impaire, de somme $f$. Pour $\exp$, on reconnaît $\operatorname{ch}$ et $\operatorname{sh}$.
## Étape · 2
Analyse : si $f = p + i$ avec $p$ paire et $i$ impaire, alors $f(-x) = p(x) - i(x)$, d'où $p(x) = \frac{f(x) + f(-x)}{2}$ et $i(x) = \frac{f(x) - f(-x)}{2}$. Il y a donc au plus une décomposition.
## Étape · 1
Synthèse : ces deux fonctions sont respectivement paire et impaire, et leur somme vaut $f(x)$ : la décomposition existe.
## Étape · 1
Pour $f = \exp$ : $p = \operatorname{ch} : x \mapsto \frac{e^x + e^{-x}}{2}$ et $i = \operatorname{sh} : x \mapsto \frac{e^x - e^{-x}}{2}$. Donc $p(0) = 1$.
## Réponse
num 1 ± 0.001

# c1 · complexe · 60 · Injections, surjections et composées
Soient $f : E \to F$ et $g : F \to G$ deux applications.

1. Montrer que, pour toutes parties $A, B$ de $E$, $f(A \cap B) \subset f(A) \cap f(B)$, avec égalité si $f$ est injective.
2. Réciproquement, montrer que si $f(A \cap B) = f(A) \cap f(B)$ pour toutes parties $A, B$, alors $f$ est injective.
3. Montrer que si $g \circ f$ est injective, alors $f$ est injective, et que si $g \circ f$ est surjective, alors $g$ est surjective.
4. On prend $E = F = G = \mathbb{N}$, $f(n) = n + 1$ et $g(n) = \max(n - 1, 0)$. Calculer $g \circ f$. Quelle affirmation est exacte ?
## Indice
Pour 1 : prendre $y \in f(A \cap B)$, écrire $y = f(x)$. Pour l'égalité, prendre $y \in f(A) \cap f(B)$ : il s'écrit $f(a)$ et $f(b)$ avec $a \in A$, $b \in B$.
## Indice
Pour 2 : si $f(x) = f(x')$, appliquer l'hypothèse aux singletons $A = \{x\}$ et $B = \{x'\}$.
## Indice
Pour 3 : si $f(x) = f(x')$, appliquer $g$. Si $z \in G$, il a un antécédent $x$ par $g \circ f$ : que dire de $f(x)$ ? Pour 4 : un seul contre-exemple suffit à montrer qu'une implication réciproque est fausse.
## Étape · 1
Si $y \in f(A \cap B)$, $y = f(x)$ avec $x \in A$ et $x \in B$, donc $y \in f(A)$ et $y \in f(B)$. Si $f$ est injective et $y \in f(A) \cap f(B)$, alors $y = f(a) = f(b)$ avec $a \in A$, $b \in B$ ; l'injectivité donne $a = b \in A \cap B$, donc $y \in f(A \cap B)$.
## Étape · 2
Si $f(x) = f(x')$, alors avec $A = \{x\}$, $B = \{x'\}$ : $f(A) \cap f(B) = \{f(x)\}$ est non vide, donc $f(A \cap B)$ aussi, donc $A \cap B \neq \varnothing$, c'est-à-dire $x = x'$.
## Étape · 2
Si $g \circ f$ est injective et $f(x) = f(x')$, alors $g(f(x)) = g(f(x'))$, d'où $x = x'$. Si $g \circ f$ est surjective, pour tout $z \in G$ il existe $x$ avec $g(f(x)) = z$ : $f(x)$ est un antécédent de $z$ par $g$.
## Étape · 2
$g(f(n)) = \max(n, 0) = n$ : $g \circ f = \mathrm{id}_{\mathbb{N}}$, bijective. Pourtant $f$ n'est pas surjective ($0$ n'a pas d'antécédent) et $g$ n'est pas injective ($g(0) = g(1) = 0$). Les conclusions de la question 3 sont les seules possibles en général.
## Réponse
qcm B
- $f$ et $g$ sont bijectives
- $f$ est injective non surjective, $g$ est surjective non injective
- $f$ est surjective non injective, $g$ est injective non surjective
- $g \circ f$ n'est pas bijective
