# V3CT0R pour les écoles : cahier des charges

Si ce document n'est pas encore dans le dépôt, commence par l'enregistrer tel quel dans `docs/ECOLES.md`. C'est la référence pour toutes les phases. Tiens à jour la section « État » en bas, puis fais la phase 0 décrite plus loin.

## Objectif

Vendre des licences V3CT0R à des établissements : écoles d'ingénieurs privées avec prépa intégrée, lycées privés avec CPGE. Le parcours commercial a trois étapes :

1. **Essai** : le prospect reçoit un lien contenant une clé et découvre V3CT0R aux couleurs de son école, sans créer de compte.
2. **Pilote** : une classe pendant un semestre, à partir de janvier-février 2027, avec des comptes élèves et un onglet CLASSE pour le prof.
3. **Licence** : l'école entière, avec un proviseur, un nombre de places et une personnalisation totale.

Pour les particuliers, l'app reste gratuite et identique à aujourd'hui.

## Ce qui existe déjà (à vérifier en lisant le code)

- Vite + TypeScript + three.js. Le build produit un seul `dist/index.html` qui s'ouvre en `file://`. App de bureau Electron, site publié par GitHub Pages.
- Comptes Supabase optionnels, sans SDK :
  - `src/core/cloud.ts` : appels fetch vers GoTrue et PostgREST, connexion e-mail + mot de passe ;
  - table `progress` : une ligne jsonb par utilisateur (`supabase/schema.sql`) ;
  - clés synchronisées dans `src/core/sync.ts`.
- Accueil : `src/shell/welcome.ts` et `welcome-steps.ts`. Il propose le téléchargement, puis exige un compte si Supabase est configuré.
- « VERROUILLÉ » signifie « prérequis non terminés » (`src/learn/learn.ts`, `src/learn/tree.ts`, `BodyState` dans `src/atlas/atlas.ts`). Ce n'est pas un paywall.
- Vérification : `npm run check` (tsc + vitest + build + smoke Edge en `file://`). Docker Desktop est installé sur ma machine.

## Décisions prises

Ne les rediscute pas, mais signale-moi tout problème technique qu'elles posent.

### Essai
- Le lien a la forme `…/?essai=<clé>` sur le web. L'accueil a aussi un champ « J'ai un code », indispensable pour l'app de bureau.
- Personnalisation : logo, nom de l'école et une couleur d'accent.
- Aucun compte n'est demandé pendant l'essai. Le compte est seulement proposé pour sauvegarder la progression.
- Tous les prérequis sont débloqués, et l'app s'ouvre sur la vue choisie pour cette école.
- À la date de fin, un écran bloquant « essai terminé » affiche mon adresse de contact (configurable au build) et un champ pour saisir une nouvelle clé.
- Suivi par clé : date de première ouverture, nombre de visites, temps passé. Aucune donnée personnelle, pas d'adresse IP.

### Comptes école
- Trois rôles, chacun rattaché à une école : `student`, `teacher`, `principal` (le proviseur).
- Prof et proviseur : chaque école a un code secret par rôle. Saisir ce code dans un compte donne ce rôle dans cette école.
- Élèves : code de classe + pseudo + mot de passe, **sans e-mail**.
  - Le prof peut réinitialiser le mot de passe d'un élève depuis l'onglet CLASSE.
  - Les comptes des particuliers restent en e-mail + mot de passe.
- Le nombre de places de la licence est appliqué côté serveur : quand c'est plein, l'inscription d'un élève est refusée.

### Onglet CLASSE (prof)
Nouvel onglet du HUD, visible seulement pour les profs et le proviseur. Il contient :
- un tableau élèves × chapitres : chapitre vu, exercices réussis, dernière activité ;
- des devoirs : un chapitre ou un exercice à faire pour une date, que l'élève voit dans son app ;
- un export CSV de la classe ;
- le déblocage d'un chapitre pour toute la classe, même si les prérequis ne sont pas terminés.

### Proviseur
- Voir toutes les classes de l'école.
- Gérer les profs : retirer un prof, régénérer le code prof.
- Gérer les places : places utilisées sur le total, désactivation d'un élève.
- Statistiques de l'école : élèves actifs par semaine, chapitres les plus travaillés.

### Personnalisation totale (licence)
- Cours visibles ou masqués.
- Textes : message d'accueil, nom de la plateforme, consignes.
- Thème complet : couleurs, police choisie parmi celles embarquées, fond.
- Cours propres à l'école.

### Admin (moi)
Un script npm local, `npm run school -- …`, qui permet de :
- créer une école, ses clés d'essai et ses codes ;
- prolonger ou désactiver une école ou une clé ;
- afficher le suivi des essais (qui a ouvert, combien de temps), pour mes relances.

Ce script utilise la clé `service_role` lue dans `.env.local`, et nulle part ailleurs.

### Hors périmètre
- Version mobile et tactile : V3CT0R reste une app pour ordinateur, clavier et souris.
- Paiement en ligne : les écoles paient sur devis et facture.
- Messagerie, notes, emploi du temps : l'ENT de l'école s'en charge déjà.

## Contraintes

- **Règles du projet.** Celles de `CLAUDE.md` s'appliquent ; ajoute-y chaque nouvelle règle.
- **Direction artistique.** Le noir et blanc reste la règle par défaut. Le thème d'école est la seule exception, appliqué par variables CSS, et le thème par défaut doit rester identique au pixel près. Mets à jour la règle de DA de `CLAUDE.md` en conséquence.
- **Hors ligne.** Aucune ressource réseau à l'exécution en dehors de Supabase, qui est déjà l'exception.
  - Sans `VITE_SUPABASE_*`, l'app se comporte exactement comme aujourd'hui.
  - Le logo et le thème d'une école sont mis en cache pour s'ouvrir hors ligne.
- **Client.** Pas de SDK Supabase côté client : reste en fetch, comme `cloud.ts`. Les Edge Functions sont permises côté serveur : création d'élèves, réinitialisation de mot de passe, contrôle des places, limitation des tentatives.
- **Sécurité.**
  - Toute autorisation est vérifiée côté serveur : RLS sur chaque nouvelle table, avec refus par défaut, et fonctions `security definer` qui contrôlent explicitement le rôle. Ne fais jamais confiance au client.
  - Clés d'essai, codes école et codes de classe : aléatoires et assez longs pour ne pas être devinés, stockés hachés, vérifiés par une fonction qui ne renvoie qu'une seule ligne.
  - Aucune liste de clés dans le code ni dans le build. Limite le nombre de tentatives.
  - La clé `service_role` ne se trouve que dans `.env.local` (scripts locaux) et dans les secrets des Edge Functions. Jamais dans le dépôt, le build ou le zip.
  - Logos SVG et contenus des écoles (textes, cours) sont nettoyés avant affichage : pas de script, pas de HTML brut, pas de ressource externe.
  - Comptes élèves : si GoTrue exige un e-mail, utilise une adresse technique interne en `.invalid`, jamais affichée.
- **Données personnelles.** Rédige `docs/RGPD.md` : données collectées par rôle, finalité, durée de conservation, suppression, Supabase comme sous-traitant, et région du projet (à vérifier). Supprimer un élève supprime ses données.
- **Tests et parcours.** Le tuto et les parcours (`src/shell/tours.ts`), le smoke (`scripts/smoke.mjs`, drapeau `vector-math.e2e`) et les tests suivent chaque nouvel écran et chaque nouveau libellé.
- **Logique métier.** Droits, expiration, calcul du tableau de progression, CSV et statistiques vont dans des modules purs testés par vitest, sur le modèle de `welcome-steps.ts`.

## Phases

Une branche et un plan validé par moi pour chaque phase.

| Phase | Branche | Contenu | Échéance |
|---|---|---|---|
| 0 | — | Lecture du code, modèle de données, découpage affiné | Tout de suite |
| 1 | `feat/school-trial` | Tables écoles et essais ; script admin (créer, suivi) ; `?essai=` et « J'ai un code » ; logo, nom et couleur ; déblocage ; vue de départ ; suivi ; écran d'expiration | Au plus vite : mes mails de prospection attendent |
| 2 | `feat/school-accounts` | Rôles ; codes prof et proviseur ; classes et codes de classe ; comptes élèves par pseudo ; places ; réinitialisation par le prof | Avant janvier 2027 |
| 3 | `feat/class-tab` | Onglet CLASSE : tableau, devoirs, CSV, déblocage pour la classe | Avant janvier 2027 |
| 4 | `feat/principal` | Espace proviseur : classes, profs, places, statistiques | Avant la première licence |
| 5 | `feat/school-theme` | Thème complet ; textes et accueil ; cours visibles | Avant la première licence |
| 6 | `feat/school-courses` | Cours propres à l'école : éditeur, stockage, validation (mêmes règles que `tests/learn-courses.test.ts`), nettoyage | Ensuite |

### Phase 0 (maintenant)

1. Lis au minimum :
   - `src/core/cloud.ts`, `sync.ts`, `progress.ts` ;
   - `src/shell/welcome.ts`, `welcome-steps.ts`, `account.ts`, `layout.ts` ;
   - `src/learn/learn.ts`, `src/atlas/atlas.ts` ;
   - `supabase/schema.sql`, `scripts/smoke.mjs`.
2. Propose en mode plan :
   - le modèle de données : tables, colonnes, policies RLS, fonctions SQL et Edge Functions ;
   - comment le prof lit la progression de ses élèves sans exposer la table `progress`. Suggestion : une fonction qui vérifie le rôle et renvoie les données des membres de la classe ; le tableau se calcule ensuite avec les fonctions pures de `progress.ts` ;
   - la connexion pseudo + mot de passe avec GoTrue. Suggestion : une Edge Function crée l'utilisateur avec un e-mail technique confirmé d'office, sans toucher à la confirmation par e-mail des comptes particuliers ;
   - le test des policies RLS : pgTAP avec la CLI Supabase et Docker, sinon un script SQL de vérification avec les résultats attendus ;
   - la liste des fichiers touchés par la phase 1.
3. Attends ma validation. Pose-moi toutes les questions qui restent avant de coder, plutôt que de deviner.

## Méthode à chaque phase

- **Plan d'abord**, validé par moi, puis de petits changements cohérents.
- **Avant de dire qu'une étape est terminée**, il faut :
  - `npm run check` vert ;
  - des tests pour toute logique nouvelle ;
  - des captures du smoke (`--shots`) pour chaque nouvel écran ;
  - les étapes manuelles côté Supabase écrites dans `docs/ADMIN.md` : appliquer le SQL, déployer les Edge Functions, créer une école et une clé, lire le suivi.
- **SQL et Edge Functions versionnés.** Tu n'as pas accès au tableau de bord Supabase : chaque SQL à exécuter et chaque Edge Function à déployer va dans un fichier versionné (`supabase/…`), avec la commande exacte à lancer.
- **Commits** seulement quand je le demande, en Conventional Commits.
- **À la fin de chaque phase**, mets à jour la section « État » ci-dessous.

## État

- Phase 0 : faite le 2026-11-11.
  - Plan validé, modèle de données dans `docs/ECOLES-MODELE.md`.
  - Réponses : le compte reste obligatoire pour les particuliers dès que le site est configuré ; passage en Pro avant les mails ; région UE ; fusion de `feat/mobile-layout` avant la phase 1.
- Phase 1 (`feat/school-trial`) : code et tests faits le 2026-11-12, rien n'est commité.
  - **Fait.**
    - Migrations `supabase/migrations/` : schéma `school` non exposé, RLS sans policy, `trial_open` / `trial_ping`, fonctions `admin_*`.
    - 49 tests pgTAP (`npm run db:test`).
    - Script `npm run school`.
    - `?essai=` et J'AI UN CODE (accueil et COMPTE).
    - Carte d'essai aux couleurs de l'école, vue de départ, déblocage non enregistré, badge, accent.
    - Suivi des ouvertures et du temps actif.
    - Écran bloquant de fin d'essai (contact `VITE_CONTACT_EMAIL`, nouvelle clé).
    - Section ÉCOLE du smoke (`dist-smoke/`), avec captures.
    - `docs/ADMIN.md`, `docs/RGPD.md`.
  - **Vérifié de bout en bout** sur la pile Supabase locale, dans le navigateur.
  - **Reste**, à faire par l'utilisateur :
    - fusion de `feat/mobile-layout` dans main, puis `git merge main` dans `feat/school-trial` ;
    - commit et PR ;
    - côté Supabase : Pro, variables `VITE_SUPABASE_ANON_KEY` et `VITE_CONTACT_EMAIL`, migrations (`docs/ADMIN.md` §0) ;
    - `SUPABASE_SECRET_KEY` dans `.env.local`.
- Phases 2 à 6 : à faire.
