// What the calculator understands, shown in its panel. Every example is evaluated by
// tests/calc.test.ts against its expected display, so the list cannot drift from the engine.

export interface FnDoc {
  /** syntax as typed (mnemonics allowed) */
  sig: string;
  desc: string;
  /** a working example and the expected first line of the result */
  ex: string;
  res: string;
  group: string;
}

export const FN_DOCS: FnDoc[] = [
  // bases
  { group: 'Bases', sig: '2(3+4)  ·  3x  ·  x(x+1)', desc: 'multiplication implicite', ex: '2(3+4)', res: '14' },
  { group: 'Bases', sig: 'a^b  ·  a²  ·  a⁻¹', desc: 'puissances (^2 s’écrit ²)', ex: '2^10', res: '1024' },
  { group: 'Bases', sig: 'V x  ·  V3 x  ·  root(x, n)', desc: 'racines carrée, cubique, n-ième', ex: 'root(-32, 5)', res: '−2' },
  { group: 'Bases', sig: 'n!', desc: 'factorielle (Γ(n+1) hors des entiers)', ex: '10!', res: '3 628 800' },
  { group: 'Bases', sig: 'x %  ·  x ‰', desc: 'pour cent, pour mille', ex: '200*15%', res: '30' },
  { group: 'Bases', sig: 'a mod b', desc: 'reste (toujours ≥ 0 si b > 0)', ex: '-7 mod 3', res: '2' },
  { group: 'Bases', sig: '|x|  ·  abs(x)', desc: 'valeur absolue', ex: '|3-8|', res: '5' },
  { group: 'Bases', sig: 'a ± b', desc: 'les deux valeurs (jusqu’à 4 ±)', ex: '(-2 ± V(4+12))/2', res: '1 ; −3' },
  { group: 'Bases', sig: 'floor  ceil  round(x, n)  trunc  fpart', desc: 'parties entières, arrondi à n décimales', ex: 'round(pi, 4)', res: '3.1416' },
  { group: 'Bases', sig: 'min  max  mean  hypot', desc: 'listes d’arguments', ex: 'hypot(3, 4)', res: '5' },
  // variables
  { group: 'Variables et fonctions', sig: 'a = 3', desc: 'variable (gardée entre les sessions)', ex: 'a = 3', res: 'a = 3' },
  { group: 'Variables et fonctions', sig: 'f(x) = x² + 1', desc: 'fonction (plusieurs paramètres : g(x, y) = …)', ex: 'f(x) = x^2 + 1', res: 'f(x) = x² + 1' },
  { group: 'Variables et fonctions', sig: 'f′(a)  ·  f″(a)', desc: 'dérivées 1re et 2e d’une fonction (prime, dprime)', ex: "sin'(0)", res: '1' },
  { group: 'Variables et fonctions', sig: 'ans', desc: 'résultat précédent ; une ligne qui commence par + × / ^ part de ans', ex: 'ans', res: '1' },
  { group: 'Variables et fonctions', sig: 'a < b  ·  a ≤ b  ·  a ≠ b  ·  a ≈ b', desc: 'comparaisons (vrai / faux)', ex: 'pi^2 < 10', res: 'vrai' },
  // trig
  { group: 'Trigonométrie', sig: 'sin cos tan cot sec csc', desc: 'angle en RAD ou DEG (bouton du panneau) ; x° convertit', ex: 'sin(30°)', res: '0.5' },
  { group: 'Trigonométrie', sig: 'asin acos atan atan2(y, x)', desc: 'réciproques (aussi arcsin, arccos, arctan)', ex: 'atan(1)', res: '0.785398163397' },
  { group: 'Trigonométrie', sig: 'sinh cosh tanh · sh ch th · asinh argch…', desc: 'hyperboliques et réciproques', ex: 'ch(0)', res: '1' },
  { group: 'Trigonométrie', sig: 'todeg(x)  torad(x)', desc: 'conversions d’angle', ex: 'todeg(pi)', res: '180' },
  // analysis
  { group: 'Analyse', sig: 'exp  ln  log(x)  log(x, b)  log2', desc: 'log = log₁₀ ; log(x, b) en base b', ex: 'log(8, 2)', res: '3' },
  { group: 'Analyse', sig: 'sum(expr, k, a, b)  ·  Σ', desc: 'somme ; b peut être ∞ (convergence ou extrapolation)', ex: 'sum(1/k^2, k, 1, inf)', res: '1.64493406685' },
  { group: 'Analyse', sig: 'prod(expr, k, a, b)  ·  ∏', desc: 'produit (fini ou infini)', ex: 'prod(k, k, 1, 6)', res: '720' },
  { group: 'Analyse', sig: 'int(expr, x, a, b)  ·  ∫', desc: 'intégrale (tanh-sinh) ; bornes infinies et singularités aux bornes', ex: 'int(e^(-x^2), x, -inf, inf)', res: '1.77245385091' },
  { group: 'Analyse', sig: 'der(expr, x, a)  ·  der(expr, x, a, 2)', desc: 'dérivée numérique en a (ordre 1 ou 2)', ex: 'der(x^3, x, 2)', res: '12' },
  { group: 'Analyse', sig: 'lim(expr, x, a)', desc: 'limite numérique (a peut être ±∞), deux côtés comparés', ex: 'lim(sin(x)/x, x, 0)', res: '1' },
  { group: 'Analyse', sig: 'solve(équation, x, a)  ·  solve(…, x, a, b)', desc: 'racine : Newton depuis a, ou dichotomie sur [a, b]', ex: 'solve(x^2 = 2, x, 1)', res: '1.41421356237' },
  // arithmetic
  { group: 'Arithmétique', sig: 'gcd  lcm  (pgcd  ppcm)', desc: 'PGCD et PPCM de plusieurs entiers', ex: 'gcd(84, 120, 36)', res: '12' },
  { group: 'Arithmétique', sig: 'factor(n)', desc: 'décomposition en facteurs premiers', ex: 'factor(360)', res: '2³ · 3² · 5' },
  { group: 'Arithmétique', sig: 'divisors(n)', desc: 'liste des diviseurs', ex: 'divisors(28)', res: '1, 2, 4, 7, 14, 28  (6 diviseurs)' },
  { group: 'Arithmétique', sig: 'isprime(n)  nextprime  prevprime', desc: 'primalité exacte jusqu’à 2⁵³ (Miller-Rabin)', ex: 'isprime(2^31-1)', res: 'vrai' },
  { group: 'Arithmétique', sig: 'prime(n)  primepi(x)', desc: 'n-ième premier, nombre de premiers ≤ x', ex: 'primepi(1000)', res: '168' },
  { group: 'Arithmétique', sig: 'totient(n)  fib(n)', desc: 'indicatrice d’Euler, Fibonacci', ex: 'totient(36)', res: '12' },
  // probability
  { group: 'Combinatoire et probabilités', sig: 'binom(n, k)  arr(n, k)', desc: 'coefficients binomiaux, arrangements', ex: 'binom(49, 6)', res: '13 983 816' },
  { group: 'Combinatoire et probabilités', sig: 'erf  erfc', desc: 'fonction d’erreur (loi normale : P(|Z| ≤ z) = erf(z/V2))', ex: 'erf(1/V2)', res: '0.682689492137' },
  { group: 'Combinatoire et probabilités', sig: 'rand()  randint(a, b)', desc: 'hasard uniforme', ex: 'randint(1, 1)', res: '1' },
  // special
  { group: 'Fonctions spéciales', sig: 'gamma(x)  ·  Γ(x)  ·  lngamma', desc: 'fonction Γ (Γ(n) = (n−1)!)', ex: 'gamma(0.5)^2', res: '3.14159265359' },
  { group: 'Fonctions spéciales', sig: 'zeta(s)  ·  ζ(s)', desc: 'ζ de Riemann (s ≠ 1, aussi s < 0)', ex: 'zeta(-1)', res: '−0.0833333333333' },
  { group: 'Fonctions spéciales', sig: 'beta(a, b)  ·  β(a, b)', desc: 'fonction B d’Euler', ex: 'beta(2, 3)', res: '0.0833333333333' },
  // constants
  { group: 'Constantes', sig: 'pi  e  tau  phi  euler  inf', desc: 'π, e, τ = 2π, φ (nombre d’or), γ d’Euler-Mascheroni, ∞', ex: 'phi^2 - phi', res: '1' },
];
