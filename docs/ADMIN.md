# V3CT0R écoles : administration

Ce guide couvre ce que tu fais toi-même côté Supabase et avec le script `npm run school`. Il est tenu à jour à chaque phase de `docs/ECOLES.md`. Il couvre aujourd'hui :
- la phase 1, les essais ;
- la phase 1b, les licences d'établissement, le kit d'installation des PC et la signature de l'installeur.

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
     3. `supabase/migrations/20261112180000_school_licence.sql` : licences, postes. Les builds de la phase 1 continuent de marcher.
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

## 1b. Vendre une licence et installer les PC de l'établissement

```powershell
npm run school -- licence --school lycee-x --seats 30 --until 2027-08-31 --label "bon de commande 2026-041" --kit
```

- `--seats` : le nombre de postes (PC ou navigateurs) qui peuvent tenir la licence en même temps, de 1 à 10000.
  - Un PC compte une fois, quel que soit le compte Windows.
  - Au-delà, l'appareil suivant affiche « Toutes les places de la licence sont prises ».
- `--until AAAA-MM-JJ` : fin de la licence, à la fin de ce jour-là, 3 ans au plus. Sinon `--days 365` (défaut 365).
- La clé n'est affichée qu'une fois. Elle marche aussi tapée dans J'AI UN CODE (site, téléphone, zip).
- `--kit` écrit le kit d'installation dans `Desktop\math\V3CT0R-kits\lycee-x\`, **hors du dépôt** (il contient la clé en clair) :
  - `licence.json`, `installer.cmd`, `desinstaller.cmd`, `LISEZ-MOI.txt` (le guide du technicien, `docs/DEPLOIEMENT.md` avec les valeurs de la licence) ;
  - `V3CT0R-Ecole.msi`, téléchargé depuis la dernière release. Avant la première release qui le contient, `--msi release\V3CT0R-Ecole.msi` après `npm run app:win`.
  - `--out <dossier>` choisit un autre dossier, jamais dans le dépôt.
- **Envoi** : partager le dossier par un lien (OneDrive…), pas en pièce jointe, car les messageries bloquent les `.cmd`.
- Le technicien suit `LISEZ-MOI.txt` : poste par poste, GPO ou Intune. Après installation, chaque poste s'ouvre débloqué pour tous ses comptes, sans saisie.
- Passer l'école en `licensed` : `npm run school -- status --school lycee-x --set licensed`.

## 2. Suivre les essais et les licences

```powershell
npm run school -- report
npm run school -- report --school lycee-x
```

Une ligne par clé :
- type (essai ou licence), fin et état (en cours, terminé, désactivé) ;
- **postes** d'une licence : utilisés / total ;
- première ouverture ;
- **visites** : chaque ouverture de l'app avec cette clé ;
- **temps** : temps actif, fenêtre visible et activité dans les 5 dernières minutes, envoyé toutes les 5 minutes ;
- dernière visite.

Rien d'autre n'est collecté, ni adresse IP. Seule exception, pour compter les postes d'une licence : une empreinte de l'appareil (voir RGPD.md).

```powershell
npm run school -- devices --key 37f29cb7           # les postes d'une licence (début de leur empreinte, première et dernière fois)
npm run school -- devices --key 37f29cb7 --reset   # libère tous les postes (PC remplacés, salle réinstallée)
```

Après `--reset`, chaque appareil reprend une place à sa prochaine ouverture.

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
- Prolonger une licence d'un an : `npm run school -- extend --key <CLÉ> --days 365`. Les postes restent.
- **Clé copiée hors de l'établissement** :
  ```powershell
  npm run school -- rotate --key 37f29cb7 --kit
  ```
  - Crée une nouvelle clé (même école, mêmes postes, même fin) et écrit son kit.
  - Désactive l'ancienne et libère ses postes.
  - Les PC s'arrêtent jusqu'à ce que le technicien remplace `licence.json`, avec le nouveau kit.

## 4. Tester en local (Docker)

Docker Desktop doit être ouvert.

- `npm run db:test` démarre la pile locale (base, auth, API), réapplique les migrations, puis lance les tests pgTAP de `supabase/tests/`.
- `npm run school -- <commande> --local` travaille sur la pile locale, avec les clés de développement de `supabase status`.
- L'app contre la pile locale : `npx vite --mode localstack`.
  - Il lit `.env.localstack.local`, ignoré par git, qui contient l'URL `http://127.0.0.1:54321`, la clé publique de développement donnée par `npm run supabase -- status` et une adresse de contact fictive.
  - Dans le panneau navigateur de Claude, c'est la configuration `v3ct0r-localstack` (port 5180).
- `npm run supabase -- stop` arrête la pile.

- L'app de bureau avec une licence de poste, sans installer le MSI :
  - `npx vite build --mode localstack`, puis lancer Electron avec `V3CT0R_LICENCE_FILE=<kit>\licence.json` et `--user-data-dir` vers un dossier de test ;
  - `V3CT0R_LICENCE_FILE` ne sert qu'aux tests : il remplace `C:\ProgramData\V3CT0R\licence.json`.

## 5. Signer l'installeur (Azure Trusted Signing)

Sans signature, Windows affiche « Windows a protégé votre ordinateur » et beaucoup d'établissements refusent de déployer le MSI. La signature se fait dans `release.yml`, à chaque tag `v*`. Tant que les réglages ci-dessous n'existent pas, rien n'est signé.

1. **Compte**, de ton côté et à ta charge (environ 10 $ par mois) :
   - vérifier sur la page Microsoft « Trusted Signing » que ton entité (ou toi, comme particulier) y a droit dans ton pays ;
   - créer un compte de signature (*Code Signing Account*), faire valider l'identité, créer un profil de certificat *Public Trust*.
2. **Accès pour GitHub** : une inscription d'application Entra ID (*App registration*) avec un secret client, et le rôle « Trusted Signing Certificate Profile Signer » sur le compte de signature.
3. **Variables du dépôt** (rien de secret) :
   ```powershell
   & "C:\Program Files\GitHub CLI\gh.exe" variable set AZURE_SIGN_ENDPOINT --body "https://weu.codesigning.azure.net/"
   & "C:\Program Files\GitHub CLI\gh.exe" variable set AZURE_SIGN_ACCOUNT --body "<nom du compte de signature>"
   & "C:\Program Files\GitHub CLI\gh.exe" variable set AZURE_SIGN_PROFILE --body "<nom du profil de certificat>"
   & "C:\Program Files\GitHub CLI\gh.exe" variable set AZURE_SIGN_PUBLISHER --body "<nom exact du titulaire du certificat>"
   ```
   L'adresse dépend de la région du compte (`weu` : Europe de l'Ouest).
4. **Secrets du dépôt**, que tu tapes toi-même : `gh secret set` demande la valeur sans l'afficher, jamais dans un chat.
   ```powershell
   & "C:\Program Files\GitHub CLI\gh.exe" secret set AZURE_TENANT_ID
   & "C:\Program Files\GitHub CLI\gh.exe" secret set AZURE_CLIENT_ID
   & "C:\Program Files\GitHub CLI\gh.exe" secret set AZURE_CLIENT_SECRET
   ```
5. **Contrôle** : au tag suivant, le journal du job `windows` affiche `signing: Azure Trusted Signing (…)`. Puis clic droit sur le MSI téléchargé → Propriétés → Signatures numériques.

## 6. Sécurité, en bref

- Les tables des écoles sont dans le schéma `school`, que l'API n'expose pas. RLS y est active sans aucune policy.
- Les seules portes sont les fonctions `key_open` et `key_ping` (anonymes ; `trial_open` et `trial_ping` les relaient pour les builds de la phase 1) et les fonctions `admin_*` (clé secrète seulement).
- Les clés sont stockées hachées. 30 échecs par minute bloquent les vérifications pendant cette minute.
- Pas de SDK Supabase dans l'app : des appels `fetch` (`src/core/cloud.ts`).
