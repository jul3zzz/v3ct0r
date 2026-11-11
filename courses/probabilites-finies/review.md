# Probabilités sur un univers fini (cours écrit) — points à faire vérifier

Relecture humaine demandée avant diffusion. Programme suivi : « Probabilités » (2e semestre) de MPSI-MP2I, PCSI et PTSI (BO 2021), identique dans les trois textes pour les notions traitées (coalitions, Markov, Bienaymé-Tchebychev vérifiés présents dans les trois).

## Choix de présentation
- Univers fini uniquement ; la construction d'un univers portant un $n$-uplet de variables indépendantes de lois données est admise (« ne constitue pas un objectif du programme »).
- Formule du crible hors programme : seulement mentionnée.
- Convention $P(A \mid B)P(B) = 0$ si $P(B) = 0$ (programme).
- Indépendance de $A$ et $\overline{B}$, lemme des coalitions, $E(XY) = E(X)E(Y)$ : énoncés sans preuve.
- Loi faible des grands nombres en version non asymptotique (programme : « approche non asymptotique »).
- Références : Delmas (Presses de l'ENSTA) et Feller vol. 1 ; à confirmer pour le niveau.

## Énoncés et exemples à relire
- Urne $3R + 2N$, deux tirages sans remise : $P(R_1 \cap R_2) = \frac35 \cdot \frac24 = \frac{3}{10}$. OK.
- Marginales identiques, lois conjointes différentes : $(X, X)$ et $(X, 1 - X)$ pour $X \sim \mathcal{B}(1/2)$. OK.
- Markov par $a\mathbf{1}_{\{X \ge a\}} \le X$ ; Bienaymé-Tchebychev par Markov sur $(X - E(X))^2$. OK.

## Exercices
- **s1** : $P(\text{somme} = 7) = \frac16$, maximale (nombre de couples $6 - |s - 7|$).
- **s2** : $P(T) = 0{,}0297$, $P(M \mid T) = \frac13$.
- **m1** : $V(X) = 2{,}1$ pour $\mathcal{B}(10, 0{,}3)$.
- **m2** : indépendance deux à deux sans indépendance mutuelle ($\frac14 \neq \frac18$).
- **m3** : $E(N) = 1$ ; indicatrices non indépendantes ($n = 2$ : $\frac12 \neq \frac14$).
- **c1** : $n \ge 2000$ ; si $p \le 0{,}1$ : $n \ge 720$ ($0{,}09/(0{,}0025\, n) = 36/n \le 0{,}05$).
