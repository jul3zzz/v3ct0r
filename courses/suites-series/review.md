# Suites et séries numériques (cours écrit) — points à faire vérifier

Relecture humaine demandée avant diffusion. Les points ci-dessous sont ceux où une imprécision passerait facilement inaperçue.

## Choix de présentation
- **Limite avec $\le \varepsilon$** (et non $< \varepsilon$) : les deux définitions sont équivalentes ; le texte le signale.
- **Complétude** : le cours part de la propriété de la borne supérieure (axiome de $\mathbb{R}$), en déduit la limite monotone, les suites adjacentes, Bolzano-Weierstrass (par dichotomie) puis le critère de Cauchy. Ordre conforme au programme MPSI ; vérifier qu'il correspond à celui du professeur.
- **Suites complexes** : traitées par une remarque (parties réelle et imaginaire), sans refaire les preuves.
- **Relations de comparaison** : définies pour $v_n$ non nul à partir d'un certain rang (définition par quotient). Le programme récent les définit parfois avec $u_n = \varepsilon_n v_n$, ce qui évite l'hypothèse ; les deux coïncident ici.

## Énoncés et preuves à relire
- **Unicité de la limite** : $\varepsilon = |\ell - \ell'|/3$ donne $2\varepsilon < |\ell - \ell'|$. OK.
- **Bolzano-Weierstrass** : la construction de $\varphi$ utilise qu'à chaque étape une moitié contient $u_n$ pour une infinité d'indices ; les segments sont adjacents via leurs bornes. OK.
- **Cauchy ⇒ convergente** : on choisit $k$ avec $\varphi(k) \ge N$ et $|u_{\varphi(k)} - \ell| \le \varepsilon$, possible car $\varphi(k) \ge k$. OK.
- **Géométriques, cas $|q| = 1$, $q \ne 1$** : argument par $q^{n+1} - q^n = q^n(q-1)$. OK.
- **Règles sur les équivalents** : contre-exemple de somme $n + 1 \sim n$ et $-n \sim -n + \sqrt n$ (somme $1$ contre $\sqrt n$), contre-exemple de composition $e^{n+1} \not\sim e^n$. Vérifiés.
- **Croissances comparées** : seules $q^n = o(n!)$ et $n! = o(n^n)$ sont justifiées dans le texte ; les deux premières sont admises (supposées vues en terminale / début de MPSI).
- **Suite implicite $\tan x = x$** : $x_n \in ]n\pi, n\pi + \pi/2[$, $x_n = n\pi + \frac\pi2 - y_n$, $\tan y_n = 1/x_n$, d'où $x_n = n\pi + \frac\pi2 - \frac{1}{n\pi} + o(1/n)$. Vérifié.
- **Série harmonique** : « plus de $10^{43}$ termes pour dépasser $100$ » : $H_n \approx \ln n + \gamma > 100$ pour $n \gtrsim 1{,}5 \cdot 10^{43}$. OK.
- **Critère des équivalents** : énoncé pour $v_n \ge 0$ ; contre-exemple de signe non constant $v_n = (-1)^n/\sqrt n$, $u_n = v_n + 1/n$. OK.
- **Comparaison série-intégrale** : encadrement pour $k \ge n_0 + 1$ ; équivalent du reste de Riemann $\sum_{k>n} k^{-\alpha} \sim \frac{1}{(\alpha - 1) n^{\alpha - 1}}$ énoncé sans preuve détaillée. Séries de Bertrand : énoncé sans preuve.
- **Séries alternées** : signe et majoration du reste déduits de $S_{2n+1} \le S \le S_{2n}$. Vérifié pour $n$ pair et impair.
- **Série de Leibniz** : « environ cinq cents termes pour une erreur $< 10^{-3}$ » d'après la majoration $|R_n| \le 1/(2n+3)$. OK (c'est une garantie, l'erreur réelle est du même ordre).
- **Produit de Cauchy** : preuve esquissée (majoration de la différence par les restes) ; la formule $e^a e^b = e^{a+b}$ donnée en application.
- **Sommation des relations de comparaison** : énoncée pour $v_n \ge 0$ ; exemples $H_n \sim \ln n$ et $\sum_{k>n} 1/k^2 \sim 1/n$ vérifiés.
- **Constante d'Euler** : $\gamma_n - \gamma_{n+1} \sim \frac{1}{2n^2}$ ; « on ignore si $\gamma$ est rationnel » : vrai à ce jour.
- **Stirling** : $\ln u_{n+1} - \ln u_n = -\frac{1}{12 n^2} + O(n^{-3})$ ; valeur numérique pour $n = 10$ : $3\,598\,696$ contre $3\,628\,800$ (erreur relative $\approx 0{,}83\,\%$, cohérente avec $\frac{1}{12n}$).

## Exercices
- **s1** : majoration $0 \le u_n - \frac12 \le \frac{7}{2n}$ pour $n \ge 1$ ; rang $N = 350$ (non optimal, ce qui est dit).
- **m1** : calcul de $v_{n+1} - v_n = \frac{-1}{n(n+1)(n+1)!}$ vérifié ; $u_6 \approx 2{,}718056$, $v_6 \approx 2{,}718287$.
- **m2** : $\gamma_{100} = 0{,}582207\ldots$, $\gamma_{100} - \frac{1}{200} = 0{,}577207\ldots$ ($\gamma = 0{,}577216\ldots$).
- **m3** : développement $x_n = n - \ln n + \frac{\ln n}{n} + o(\frac{\ln n}{n})$ ; l'équivalent $\ln\frac{x_n}{n} \sim -\frac{\ln n}{n}$ utilise $o(1/n) = o(\ln n / n)$.
- **c1** : Wallis : $n W_n = (n-1)W_{n-2}$, $n W_n W_{n-1} = \pi/2$ ; identification $C = \sqrt{2\pi} \approx 2{,}50663$.
- **c2** : $|c_n| \ge \frac{2(n+1)}{n+2}$ ; $|c_{10}| \approx 2{,}2934$ (calculé terme à terme) ; « $|c_n| \to \pi$ » : affirmé sans preuve (somme de Riemann d'une intégrale impropre, à justifier si on le demande).

## Références
- Gourdon (Analyse), Rudin (*Principles of Mathematical Analysis*, chap. 3), Monier (Analyse MPSI). Aucune autre référence n'est citée.
