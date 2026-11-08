# V3CT0R — instructions projet

Logiciel web d'exploration mathématique, statique, hors ligne : un seul `dist/index.html` qui doit s'ouvrir en `file://`.
Architecture et contrat `VizDef` : voir README.md.

## Commandes
- Vérifier chaque changement avec `npm run check` (tsc + vitest + build + smoke Edge en file://).
- Test ciblé : `npm run smoke -- --only=fractals --shots=<dossier>` (captures pour revue visuelle).
- Livrable : `npm run package` → ../V3CT0R.zip (index.html + courses/*/audio/*.mp3 + source/ ; jamais .env).
- Voix off LEARN : `npm run voice:list` (voix du compte, crédits ; gratuit) · `npm run voice -- --dry-run` (estimation, rien n'est envoyé) ; ne lancer `--yes` qu'avec l'accord explicite de l'utilisateur (coût en crédits). La clé est dans `.env` (ELEVENLABS_API_KEY) : ne jamais la lire, l'afficher ni la demander dans le chat.
- Vidéos YouTube des vues : `npm run videos:check` (réseau, oEmbed) ; `-- --write` met à jour titres, chaînes et durées.
- Décimales : `npm run digits` (BigInt, double vérification) ; polices : `npm run fonts` (réseau, rare).

## Règles
- DA stricte : noir #000 / blanc #FFF (opacités de blanc), lignes 1px ; jamais de text-transform sur les libellés (casse des symboles).
- Ne jamais nommer une classe CSS `overlay` (réservée aux dialogues ; le canvas 2D est `ov2d`).
- Les parcours et le tuto (`src/shell/tours.ts`) pilotent les vues par les libellés exacts des contrôles : renommer un libellé ou une option impose de mettre à jour tours.ts.
- Chaque vue a une entrée dans `src/modules/<module>/study.ts` (leçon + 3 exercices, vérifiés par `tests/study.test.ts`). Un exercice `task` liste dans `uses` les libellés exacts qu'il lit (le smoke les vérifie ; un contrôle qui n'existe qu'après un choix va dans `CONDITIONAL` de `scripts/smoke.mjs`).
- Cours LEARN : `courses/<id>/` (lesson.json, script.md, formulas.json, exercises.json, review.md) + `courses/curriculum.json` ; `tests/learn-courses.test.ts` valide marqueurs, exercices, scènes et durée. Une scène pilote une vue par alias (`src/learn/scene.ts`) : renommer un libellé de contrôle impose de mettre à jour ces alias. Les modules partagés avec `tools/` (script, speak, clips, types) restent sans DOM, imports avec extension `.ts`, pas de syntaxe TypeScript non effaçable (propriétés de paramètre, enums).
- Rigueur : énoncés exacts, références réelles uniquement, chaque point délicat noté dans le `review.md` du cours.
- Intros de module : `courses/intro-<module>/` (`"level": "intro"`, `"module"`, 24-36 s, pas d'exercice, hors `curriculum.json`), une par module, scènes du module uniquement. Choix de l'utilisateur : bruitages au premier plan (`"soundtrack": true`, voix `"voiceVolume": 0.6`), narration courte (voix < 75 % de la durée, vérifié par les tests), voix Alice. Les mots de `{{anim:word}}` restent en caractères latins (police Michroma sous-ensemble).
- ATLAS (`src/atlas/`) : écran d'accueil (aucune route ou `#/atlas`). `world.ts` (carte pure, testée) se construit depuis les modules et le cursus : toute nouvelle vue ou cours y apparaît seul ; un emblème de planète se choisit dans `EMBLEMS`. Pilotage par `e.code` (touches physiques, AZERTY et QWERTY) ; les touches globales de l'app restent lues par `e.key`.
- Leçons-jeux (`src/games/`) : briefing parlé dans `briefs.json` (formules en toutes lettres), voix via `npm run voice -- --course=games` → `courses/games/audio/` ; un texte modifié rend sa voix muette jusqu'à régénération (test dédié). Un `GameDef` (3 niveaux, règles, théorème exact, références réelles) + une `GameLogic` sans DOM hors `draw` ; ajouter dans `registry.ts` (LEARN, Ctrl+K et station ATLAS suivent). La mathématique de chaque jeu (réponse optimale, jugement, faisabilité) a ses tests dans `tests/games.test.ts`. Jamais de mise en majuscules des symboles (ε, δ…) : `up()` du moteur ne touche que les lettres latines.
- Cours écrits (`"format": "written"`) : `text.md` (chapitres `## Titre {#id}`, énoncés `::: type Titre {#id}` … `:::`) et `exercises.md` (`# id · simple|moyen|complexe · minutes · Titre`, 3 `## Indice`, `## Étape · points`, `## Réponse`). Durées : simple 5-15 min, moyen 20-45, complexe ≥ 60 ; au moins 2 simples, 2 moyens, 1 complexe. Titres d'énoncés et d'exercices sans LaTeX (symboles Unicode). Écrire ces fichiers avec Write/Edit (LaTeX tel quel, pas de JSON).
- Mode histoire (`src/story/`, `STORY.md`) : données pures testées (`data.ts` : actes, chapitres, frise, pièces) ; faits datés et vérifiables uniquement, « vers » pour les dates incertaines, chaque point douteux listé dans STORY.md §10. Un jeu d'époque est une leçon-jeu ajoutée à `STORY_GAMES` (`src/games/registry.ts`), avec ses tests de mathématiques dans `tests/story.test.ts`. Une balise passe à `ready: true` quand sa mission existe.
- Calculatrice (`src/calc/`) : chaque fonction documentée dans `docs.ts` avec un exemple et son résultat exact affiché (vérifié par les tests) ; un nouveau raccourci de caractère va dans `mnemonics.ts` (le test vérifie qu'il se tape).
- Vidéos (`src/modules/videos.json`) : 1 à 3 vidéos **réelles** par vue, ajoutées par leur `id` puis `npm run videos:check -- --write` ; jamais d'`iframe` ni de lecteur intégré (l'app reste hors ligne), seulement des liens.
- Nouvelle vue : l'ajouter dans `src/modules/<module>/index.ts` ; nouveau module : `registry.ts` + type `ModuleId` + kanji présent dans `scripts/fetch-fonts.mjs` (puis `npm run fonts`).
- Rendus lourds en shader (GPU), jamais pixel par pixel en CPU ; un seul contexte WebGL2 partagé.
- Aucune ressource réseau à l'exécution : tout est embarqué (vite-plugin-singlefile). Seule exception : la synchro de compte Supabase (`src/core/cloud.ts`, fetch sans SDK), qui ne s'active que si `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` sont fournis au build et que l'utilisateur se connecte ; l'app doit rester entièrement utilisable sans.
- Dépôt GitHub `v3ct0r` (public) : site par `.github/workflows/pages.yml` (push sur main), zip par `release.yml` (tag `v*`). Jamais de `.env`, `.env.local` ni de clé `service_role` dans le dépôt (`.gitignore`, et `scripts/package.mjs` refuse un `.env` dans le zip). Une nouvelle clé de progression à synchroniser s'ajoute à `SYNCED` (`src/core/sync.ts`) avec un test de fusion.
- Fichiers contenant des backslashes (LaTeX, GLSL, regex) : écrire avec Write/Edit, jamais via un heredoc Bash.
- Interface en français ; code, identifiants et commentaires en anglais.
