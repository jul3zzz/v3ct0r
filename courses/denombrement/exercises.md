# s1 · simple · 10 · Des mains de cinq cartes
D'un jeu de $32$ cartes (dont $4$ as), on tire simultanément $5$ cartes. Combien de mains contiennent exactement deux as ?
## Indice
Tirage simultané : une main est une partie à $5$ éléments.
## Indice
Choisir séparément les deux as parmi les quatre, et les trois autres cartes parmi les $28$ qui ne sont pas des as.
## Indice
Principe multiplicatif : multiplier les deux nombres de choix.
## Étape · 1
Choix des as : $\binom42 = 6$. Choix des trois autres cartes parmi $28$ : $\binom{28}{3} = \frac{28 \times 27 \times 26}{6} = 3276$.
## Étape · 1
Nombre de mains : $6 \times 3276 = 19656$, sur $\binom{32}{5} = 201376$ mains en tout (probabilité $\approx 0{,}098$).
## Réponse
num 19656 ± 0.5

# m1 · moyen · 20 · Les anagrammes de MISSISSIPPI
Combien de mots (avec ou sans signification) peut-on écrire en permutant les lettres du mot MISSISSIPPI ?
## Indice
Le mot a $11$ lettres : $1$ M, $4$ I, $4$ S et $2$ P.
## Indice
Choisir d'abord les places des I, puis celles des S parmi les places restantes, puis celles des P.
## Indice
Ou : les $11!$ permutations des lettres comptent chaque mot $4!\,4!\,2!$ fois.
## Étape · 2
Places des I : $\binom{11}{4} = 330$ ; des S parmi les $7$ restantes : $\binom74 = 35$ ; des P parmi les $3$ restantes : $\binom32 = 3$ ; le M occupe la dernière.
## Étape · 1
Total : $330 \times 35 \times 3 = 34650 = \frac{11!}{4!\,4!\,2!\,1!}$.
## Réponse
num 34650 ± 0.5

# c1 · complexe · 60 · Compter des surjections
Soient $n \ge 1$, $E$ un ensemble à $n + 1$ éléments et $F$ un ensemble à $n$ éléments.

1. Montrer qu'une application $f : E \to F$ est surjective si et seulement si exactement un élément de $F$ a deux antécédents, et tous les autres un seul.
2. En déduire que le nombre de surjections de $E$ sur $F$ est $\binom{n+1}{2}\, n! = \frac{n\,(n+1)!}{2}$.
3. Vérifier la formule pour $n = 2$ en listant les surjections, et calculer le nombre de surjections d'un ensemble à $4$ éléments sur un ensemble à $3$ éléments.
## Indice
Pour 1 : la somme sur $y \in F$ des nombres d'antécédents de $y$ vaut $|E| = n + 1$. Si $f$ est surjective, chaque terme est au moins $1$.
## Indice
Pour 2 : une surjection est déterminée par la paire $\{a, b\}$ des deux éléments de $E$ qui ont la même image, puis par une bijection entre les $n$ « classes » (la paire et les $n - 1$ singletons) et $F$.
## Indice
Vérifier que chaque surjection est obtenue une seule fois : la paire est déterminée par $f$.
## Étape · 2
$\sum_{y \in F} |f^{-1}(\{y\})| = |E| = n + 1$. Si $f$ est surjective, les $n$ termes sont au moins $1$ et leur somme dépasse $n$ de $1$ : un seul terme vaut $2$, les autres $1$. La réciproque est claire.
## Étape · 2
Une surjection détermine la paire $\{a, b\} \subset E$ des deux éléments de même image : $\binom{n+1}{2}$ choix. Les $n$ parties $\{a, b\}$ et $\{x\}$ ($x \notin \{a, b\}$) doivent être envoyées bijectivement sur $F$ : $n!$ choix. Chaque surjection est obtenue une seule fois.
## Étape · 1
Nombre de surjections : $\binom{n+1}{2}\, n! = \frac{(n+1)n}{2}\, n! = \frac{n\,(n+1)!}{2}$.
## Étape · 1
Pour $n = 2$ : $\binom32 \cdot 2! = 6$ ; en effet, parmi les $2^3 = 8$ applications de $\{1, 2, 3\}$ dans $\{a, b\}$, seules les deux constantes ne sont pas surjectives. Pour $n = 3$ : $\binom42 \cdot 3! = 36$ (contrôle : $3^4 - 3 \times 2^4 + 3 = 36$, par le crible, hors programme).
## Réponse
num 36 ± 0.5
