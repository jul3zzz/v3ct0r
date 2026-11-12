# V3CT0R écoles : administration

Ce guide couvre ce que tu fais toi-même côté Supabase et avec le script `npm run school`. Il est tenu à jour à chaque phase de `docs/ECOLES.md` ; il couvre aujourd'hui la phase 1, les essais.

Les commandes `npm run …` se lancent dans le dossier `vector-math`.

## 0. Une seule fois : préparer le projet Supabase

Projet : `dpefjnxejkapgchgcrco`, région UE.

1. **Passer le projet en Pro** (Organization → Billing) avant d'envoyer le premier lien d'essai.
   - Un projet gratuit se met en pause après 7 jours sans activité : le prospect tomberait sur « serveur injoignable ».
   - Le plan Pro ne se met jamais en pause et garde des sauvegardes quotidiennes pendant 7 jours.
2. **Clés** : Project Settings → API Keys.
   - **Clé publique** `sb_publishable_…`. L'ancienne clé `anon` marche encore, mais elle est dépréciée fin 2026.
     - Elle est publique par conception et va à deux endroits : `.env.local` (`VITE_SUPABASE_ANON_KEY=`) et la variable de dépôt GitHub du même nom.
     - Pour remplir la variable depuis le fichier sans l'afficher (PowerShell) :
       ```powershell
       (Select-String -Path .env.local -Pattern '^VITE_SUPABASE_ANON_KEY=(.+)$').Matches[0].Groups[1].Value | & "C:\Program Files\GitHub CLI\gh.exe" variable set VITE_SUPABASE_ANON_KEY
       ```
     - **Effet sur le site** : dès cette variable remplie, le site exige un compte de tout visiteur qui n'a pas de clé d'essai (règle du 2026-11-08, confirmée le 2026-11-11).
   - **Clé secrète** `sb_secret_…`. L'ancienne `service_role` est acceptée aussi, mais dépréciée.
     - Elle va seulement dans `.env.local`, sous le nom `SUPABASE_SECRET_KEY=`. Tu la colles toi-même.
     - Jamais de préfixe `VITE_` (sinon elle partirait dans le build), jamais dans le dépôt, jamais dans un chat.
     - Le smoke échoue si le build en contient une.
     - Supabase la refuse de toute façon depuis un navigateur.
     - Si elle fuit : la supprimer dans API Keys, en créer une nouvelle, mettre `.env.local` à jour.
3. **Adresse de contact**, affichée à la fin d'un essai.
   - Variable de dépôt :
     ```powershell
     & "C:\Program Files\GitHub CLI\gh.exe" variable set VITE_CONTACT_EMAIL --body "ton@adresse"
     ```
   - Pour les builds locaux, la même ligne `VITE_CONTACT_EMAIL=` dans `.env.local`.
   - Sans elle, l'écran de fin dit « contacte la personne qui t'a envoyé le lien ».
4. **Appliquer le SQL.** Deux façons, au choix.
   - **A. SQL Editor** (Dashboard → SQL Editor → New query) : coller puis lancer, dans l'ordre :
     1. `supabase/migrations/20261108000000_progress.sql` : la table `progress`. Elle peut être relancée sans risque.
     2. `supabase/migrations/20261111120000_school_trial.sql` : écoles, clés d'essai et suivi.
   - **B. CLI** : la version figée dans `package.json` ; le mot de passe de la base est demandé au `link`.
     ```powershell
     npm run supabase -- login
     npm run supabase -- link --project-ref dpefjnxejkapgchgcrco
     npm run supabase -- db push
     ```
   - Contrôle : `npm run school -- report` doit répondre « Aucune école ».
5. **Après fusion de la PR** : le site se reconstruit seul (GitHub Actions → `pages.yml`).

## 1. Créer une école et une clé d'essai

```powershell
npm run school -- create --slug lycee-x --name "Lycée X" --logo C:\chemin\logo.svg --accent "#2255cc" --start "#/learn/riemann"
npm run school -- trial --school lycee-x --days 30 --label "proviseure, mail du 12/11"
```

- `--slug` : minuscules, chiffres et tirets.
  - Relancer `create` avec le même slug modifie l'école ; seuls les champs donnés changent.
- `--logo` : SVG ou PNG de 150 ko au plus.
  - Le script refuse un SVG qui contient un script, un gestionnaire `on…=`, un `foreignObject`, un lien ou une `url()` externes, un DOCTYPE.
  - L'app revérifie le logo, puis ne l'affiche qu'en image.
  - Le logo garde ses couleurs.
- `--accent` : la couleur d'accent `#rrggbb`, sur les boutons actifs, l'onglet actif, les barres de progression, le cadre de l'accueil et le badge. Le texte posé dessus passe seul en noir ou en blanc.
- `--start` : la vue d'ouverture.
  - Formes possibles : `#/learn` (accueil LEARN), `#/learn/<cours>`, `#/<module>/<vue>` (ex. `#/4d/polytopes`), `#/atlas/<univers>`. `""` ouvre l'ATLAS.
  - Une route inconnue de l'app ouvre l'ATLAS.
- `--label` : une note pour toi, jamais affichée dans l'app. N'y mets que le nécessaire, par exemple la fonction et la date, pas de données superflues (voir RGPD.md).
- **La clé n'est affichée qu'une fois** : le serveur n'en garde que l'empreinte (sha256). Copie le lien `https://jul3zzz.github.io/v3ct0r/?essai=<clé>` dans ton mail.
- Pour l'app de bureau : J'AI UN CODE sur l'écran d'accueil, puis la clé. On peut aussi la saisir dans COMPTE → CODE D'ÉCOLE.

## 2. Suivre les essais

```powershell
npm run school -- report
npm run school -- report --school lycee-x
```

Une ligne par clé :
- fin et état (en cours, terminé, désactivé) ;
- première ouverture ;
- **visites** : chaque ouverture de l'app avec cette clé ;
- **temps** : temps actif, fenêtre visible et activité dans les 5 dernières minutes, envoyé toutes les 5 minutes ;
- dernière visite.

Rien d'autre n'est collecté : ni adresse IP, ni identifiant d'appareil.

## 3. Prolonger, désactiver, changer de statut

```powershell
npm run school -- extend --key dbd926d9 --days 15      # une clé (les premiers caractères de CLÉ dans report)
npm run school -- extend --school lycee-x --days 15    # toutes les clés de l'école
npm run school -- disable --key dbd926d9               # arrête l'essai (--on pour le rouvrir)
npm run school -- disable --school lycee-x             # toutes ses clés s'arrêtent
npm run school -- status --school lycee-x --set pilot  # trial | pilot | licensed | disabled
```

- Une prolongation part de maintenant si la clé est déjà terminée.
- L'app ouverte voit un arrêt dans les 5 minutes (au ping suivant), sinon à l'ouverture suivante.
- À la fin, elle affiche un écran bloquant avec l'adresse de contact et un champ « nouvelle clé ».
- Supprimer une école et ses clés : SQL Editor, `delete from school.schools where slug = 'lycee-x';` (cascade).

## 4. Tester en local (Docker)

Docker Desktop doit être ouvert.

- `npm run db:test` démarre la pile locale (base, auth, API), réapplique les migrations, puis lance les tests pgTAP de `supabase/tests/`.
- `npm run school -- <commande> --local` travaille sur la pile locale, avec les clés de développement de `supabase status`.
- L'app contre la pile locale : `npx vite --mode localstack`.
  - Il lit `.env.localstack.local`, ignoré par git, qui contient l'URL `http://127.0.0.1:54321`, la clé publique de développement donnée par `npm run supabase -- status` et une adresse de contact fictive.
  - Dans le panneau navigateur de Claude, c'est la configuration `v3ct0r-localstack` (port 5180).
- `npm run supabase -- stop` arrête la pile.

## 5. Sécurité, en bref

- Les tables des écoles sont dans le schéma `school`, que l'API n'expose pas. RLS y est active sans aucune policy.
- Les seules portes sont les fonctions `trial_open` et `trial_ping` (anonymes) et les fonctions `admin_*` (clé secrète seulement).
- Les clés sont stockées hachées. 30 échecs par minute bloquent les vérifications pendant cette minute.
- Pas de SDK Supabase dans l'app : des appels `fetch` (`src/core/cloud.ts`).
