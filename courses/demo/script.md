<!-- Démo du moteur LEARN (≈ 2 min, sans voix). Montre chaque primitive au moins une fois. -->

# L'aire sous la parabole {#aire}

## d1
{{anim:title text="L'AIRE SOUS LA PARABOLE" kicker="V3CT0R LEARN · DÉMO" sub="Deux minutes, sans voix : sous-titres seuls." hold=1.5}}
Bienvenue dans V3CT0R LEARN. Cette démonstration montre le moteur de cours : formules, tracés, scènes de l'explorateur et exercices.

## d2
{{anim:axes id=A slot=w x=-0.1,1.15 y=-0.12,1.1 xl=x yl=y}}
Question : quelle est l'aire sous la courbe de $x \mapsto x^2$ entre $0$ et $1$ ? {{anim:curve on=A id=c fn="x^2" from=0 to=1 label="y = x²"}}
Découpons le segment en $n$ morceaux de même longueur, et posons des rectangles sous la courbe. {{anim:darboux on=A id=R fn="x^2" from=0 to=1 n=4 kind=lower}}
Leur aire totale est une somme. {{anim:write eq=sum slot=e}}

## d3
{{anim:tween id=R n=32 dur=4}}Plus $n$ grandit, plus les rectangles épousent la courbe.
La somme des carrés des premiers entiers est connue : la somme se calcule exactement. {{anim:morph to=closed}}
Quand $n$ tend vers l'infini, elle tend vers un tiers. {{anim:morph to=limit}}{{anim:highlight term=third label="la limite"}}

## d4
{{box:thm-area slot=e}}
Archimède obtenait déjà un résultat équivalent au troisième siècle avant notre ère, par la méthode d'exhaustion.

# Dans l'explorateur {#scene}

## d5
{{scene:integrals/riemann f="x^2" a=0 b=1 n=4 auto=off GAUCHE}}{{anim:camera x=-0.15,1.25 y=-0.2,1.15 dur=0.8}}
Les cours pilotent les vues de l'explorateur. Voici la vue Sommes de Riemann, avec la même fonction.
{{scene:set n=64 dur=5}}On augmente $n$ en direct : l'erreur décroît comme $\frac{1}{n}$.
{{anim:camera x=0.55,1.05 y=0.25,1.1 dur=2.5}}On peut aussi zoomer sur un détail de la scène.

## d6
{{scene:none}}
{{anim:grid id=G slot=e m=2,1,1,2 dur=3 eig}}
Le moteur sait aussi déformer le plan par une application linéaire et faire apparaître ses directions propres.
{{anim:text slot=w text="Les droites en pointillés sont **stables** : sur chacune, l'application agit comme une simple multiplication, par $3$ ou par $1$."}}

# À toi {#toi}

## d7
Avant chaque exercice, le cours se met en pause et lance un minuteur. Essaie !
{{exercise:ex1 minutes=2}}

## d8
{{anim:title text="FIN DE LA DÉMO" sub="Ouvre l'arbre des cours pour commencer un vrai cours." hold=3}}
Fin de la démonstration. Les trois cours pilotes t'attendent dans l'arbre.
