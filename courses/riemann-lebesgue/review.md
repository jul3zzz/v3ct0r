# De Riemann à Lebesgue — points à faire vérifier

## Résultats admis (volontairement)
- Existence et unicité de la mesure de Lebesgue sur $\mathcal{B}(\mathbb{R})$ (Carathéodory, classes monotones).
- Mesurabilité des limites simples de fonctions mesurables ; indépendance de l'écriture pour l'intégrale d'une fonction étagée.
- Critère de Lebesgue (Riemann-intégrable ⇔ discontinuités négligeables).
- Complétude de $L^p$ (Riesz-Fischer), Fubini-Tonelli.
- Le cours le dit à chaque fois à l'oral ; vérifier que ces mentions sont assez visibles pour un public de master.

## Preuves à relire
- **Défaut 1** : $\mathbf{1}_{\{r_1,\ldots,r_n\}} \uparrow \mathbf{1}_{\mathbb{Q}\cap[0,1]}$, chaque terme étant en escalier d'intégrale nulle. Correct.
- **Bosse** $f_n = n^2 x (1-x)^n$ : $\int_0^1 f_n = \frac{n^2}{(n+1)(n+2)}$ (vérifié par $t = 1-x$). Équivalent $\sup_n f_n(x) \gtrsim \frac{1}{ex}$ en $0$ : on a seulement montré une **minoration** asymptotique via $n = \lfloor 1/x \rfloor$, ce qui suffit pour exclure une domination intégrable. La formule `nodom` écrit « $f_{\lfloor 1/x\rfloor}(x) \sim \frac{1}{ex}$ » : à vérifier (oui : $n^2 x \sim 1/x$ et $(1-x)^n \to e^{-1}$).
- **Non-complétude** : $\varphi_n$ affine par morceaux, $\|\varphi_n - \mathbf{1}_{[1/2,1]}\|_1 = \frac{1}{2n}$ (aire d'un triangle de base $\frac1n$ et de hauteur 1). L'argument « aucune fonction continue n'est égale p.p. à l'indicatrice » est donné à l'oral sans détail.
- **Vitali** : la preuve normalise implicitement $\mu([0,1]) = 1$ (« comprise entre 1 et 3 ») ; l'énoncé, lui, parle d'une mesure finie non nulle sur $[0,1]$. Cohérent mais à préciser à l'oral : $\mu([0,1]) \le \sum c \le \mu([-1,2]) \le 3\mu([0,1])$.
- **Dénombrables négligeables** : recouvrement par des intervalles de longueur $\varepsilon/2^{k+1}$ ; somme $= \varepsilon$. Correct.
- **Cantor** : le texte parle d'une **surjection** de $K$ sur $[0,1]$ (développements ternaires à chiffres 0 et 2 lus en base 2), ce qui suffit pour l'indénombrabilité ; on évite le mot « bijection », faux tel quel à cause des réels à deux développements (ex. $1/3$, $2/3$ donnent la même image $1/2$). La bijection existe (Cantor-Bernstein) mais n'est pas démontrée ici.
- **Continuité de la mesure le long des suites croissantes** : découpage en tranches disjointes, correct.
- **Beppo Levi** : preuve classique (Rudin, Th. 1.26), avec $E_n = \{f_n \ge c\,s\}$ ; l'argument « $E_n$ croît vers $\Omega$ » utilise $f_n \uparrow f \ge s$ et $c < 1$ (si $s(x) > 0$, $f(x) > c\,s(x)$). Correct.
- **Fatou, convergence dominée** : preuves standard.
- **Markov** et « $\int|f| = 0 \Rightarrow f = 0$ p.p. » : correct.
- **Interversion série-intégrale** : MCT sur $\sum |f_n|$ puis convergence dominée. Correct.
- **Exercice 4** : $\ln(1-t) \le -t$ donne $(1-x/n)^n \le e^{-x}$ sur $[0,n]$ ; calcul exact $\frac{n}{n+1}$. Correct.

## Formulations historiques
- L'image des **pièces de monnaie** est attribuée à Lebesgue sans date ni source (elle figure dans une conférence de Lebesgue sur le développement de la notion d'intégrale) : **vérifier la référence exacte avant de la citer plus précisément**. Le script se contente de « Lebesgue lui-même expliquait… ».
- Beppo Levi nommé pour le théorème de convergence monotone : usage courant en France.

## Notations
- $\lambda$ pour la mesure de Lebesgue, $\mathcal{T}$ pour une tribu, $\mathcal{B}(\mathbb{R})$, « p.p. » pour presque partout, $f^+$, $f^-$, $L^1$.

## Références
- Rudin (*Real and Complex Analysis*, chap. 1-2), Briane-Pagès (*Théorie de l'intégration*), Lebesgue (*Leçons sur l'intégration…*, 1904). Aucune autre.
