# V3CT0R écoles : modèle de données

Modèle validé en phase 0, le 2026-11-11, pour toutes les phases. Le cahier des charges reste `docs/ECOLES.md`. Chaque phase repasse par un plan validé et peut préciser ce modèle ; ce document est alors mis à jour.

## Principes

- **Schéma.** Les tables vivent dans le schéma `school`, **non exposé par l'API** : PostgREST ne peut pas les atteindre, même si une policy est mal écrite.
- **RLS.** Elle est activée sur chaque table **sans aucune policy**, donc tout est refusé par défaut.
- **Portes d'entrée.** Ce sont uniquement des fonctions `public.*` :
  - en `security definer set search_path = ''`, avec des noms tous qualifiés ;
  - chacune contrôle explicitement le rôle de l'appelant ;
  - `EXECUTE` est retiré à `public`, `anon` et `authenticated`, puis accordé au seul rôle visé (`anon`, `authenticated` ou `service_role`).

  Supabase déconseille d'habitude une fonction `security definer` dans un schéma exposé. Ici l'exception est assumée : ces fonctions sont précisément l'API.
- **Codes.**
  - Format : base32 de Crockford, avec la même normalisation côté client (`src/school/codes.ts`) et côté serveur (`school.norm_code`).
  - Stockage : `sha256` en `bytea unique`. Le code en clair n'est affiché qu'une fois, par le script admin.
  - Longueurs : clé d'essai 20 caractères (100 bits), code prof ou proviseur 16 (80 bits), code de classe 12 (60 bits).
- **Tentatives.** Un plafond d'échecs par minute (`school.attempts`) : un compteur global pour les appels anonymes, un par utilisateur pour les appels authentifiés. Aucune adresse IP n'est utilisée.
- **Clé secrète.** Elle n'existe que dans `.env.local` (script admin) et dans les secrets des Edge Functions.

## Tables (schéma `school`)

| Table | Colonnes | Phase |
|---|---|---|
| `schools` | id, slug, name, logo (data URL SVG ou PNG), accent `#rrggbb`, start_route, status (`trial`/`pilot`/`licensed`/`disabled`), seats, created_at ; theme jsonb en phase 5 | 1 ✓ |
| `trial_keys` | id, school_id, key_hash, label (note de l'admin), ends_at, disabled, created_at, first_opened_at, last_seen_at, visits, seconds ; en 1b, kind (`trial`/`licence`) et seats (postes d'une licence, 0 = sans plafond). Le nom de la phase 1 est gardé : la table tient toutes les clés | 1 ✓, 1b ✓ |
| `devices` | key_id (→ trial_keys, cascade), device (32 octets : empreinte du poste), first_seen, last_seen ; une ligne par poste qui tient une place d'une licence | 1b ✓ |
| `attempts` | bucket, minute, failures (gardé 1 h) | 1 ✓ |
| `codes` | school_id, role (`teacher`/`principal`), code_hash, created_at, revoked_at | 2 |
| `classes` | id, school_id, name, code_hash, archived | 2 |
| `members` | user_id (→ auth.users, cascade), school_id, role (`student`/`teacher`/`principal`), class_id (élèves), pseudo (unique par classe), active | 2 |
| `class_teachers` | class_id, user_id | 2 |
| `assignments` | id, class_id, kind (`course`/`chapter`/`view`/`exercise`), target, due_on, created_by | 3 |
| `class_unlocks` | class_id, course_id | 3 |
| `school_courses` | id, school_id, files jsonb (même format que `courses/<id>/`), visible, validated | 6 |

## Fonctions

### Phase 1 (fait : `supabase/migrations/20261111120000_school_trial.sql`)

**Appels anonymes :**
- `trial_open(p_key)` renvoie **exactement une ligne** : state (`active`, `expired`, `disabled`, `unknown` ou `busy`), school_name, logo, accent, start_route, ends_at, server_now.
  - Elle compte une visite.
  - Elle ne lève jamais d'erreur pour une mauvaise clé : une erreur annulerait aussi le comptage de l'échec.
- `trial_ping(p_key, p_seconds)` ajoute au plus 900 s, et jamais plus que le temps écoulé depuis le dernier contact plus 60 s. Elle renvoie l'état.

**Réservées à `service_role` :** `admin_school_upsert`, `admin_school_status`, `admin_trial_create` (qui reçoit l'empreinte, jamais la clé), `admin_trial_extend`, `admin_school_extend`, `admin_trial_disable`, `admin_trial_report`.

### Phase 1b (fait : `supabase/migrations/20261112180000_school_licence.sql`)

**Appels anonymes :**
- `key_open(p_key, p_device)` : comme `trial_open`, avec en plus kind, seats, seats_used et l'état **`full`**.
  - Une licence avec un plafond réserve une place au poste (`school.take_seat`). La ligne de la clé est verrouillée : deux postes ne prennent jamais la dernière place ensemble.
  - Un poste déjà vu garde sa place. Sans empreinte valide (64 hexadécimaux minuscules), pas de place.
- `key_ping(p_key, p_seconds, p_device)` : comme `trial_ping`. Elle vérifie aussi la place, pour qu'une remise à zéro des postes ou une rotation arrête une session en cours.
- `trial_open` / `trial_ping` deviennent des relais (sans poste), pour les builds de la phase 1 : une licence avec plafond y répond `full`.

**Réservées à `service_role` :**
- `admin_key_create(p_slug, p_key_hash, p_kind, p_ends_at, p_seats, p_label)` :
  - essai : sans poste, 366 jours au plus ;
  - licence : de 1 à 10000 postes, 3 ans au plus.
- `admin_key_rotate(p_key_id, p_key_hash)` : nouvelle clé (même école, type, postes et fin) ; l'ancienne est désactivée et ses postes libérés.
- `admin_devices(p_key_id)` (8 premiers caractères de chaque empreinte), `admin_devices_reset(p_key_id)`.
- `admin_report()` : le rapport, avec le type et les postes.

### Deux apps (fait : `supabase/migrations/20261113090000_school_editions.sql`)

- `key_check(p_key)` (anonyme) : une ligne, state (`active`, `expired`, `disabled`, `full`, `unknown`, `busy`), kind, school_name, ends_at.
  - Ni visite comptée, ni place prise : le site s'en sert avant de télécharger V3CT0R Lycée.
  - Même plafond d'échecs que les autres portes.

### Phase 2 (comptes)

- **`join_school(p_code)`**, authentifiée : donne le rôle `teacher` ou `principal` dans l'école du code. Maximum 5 échecs par utilisateur et par quart d'heure.
- **`create_class` et `regen_class_code`** : réservées aux profs de l'école.
- **Places.**
  - `reserve_seat` verrouille la ligne de l'école (`for update`) et compte les élèves actifs.
  - Un trigger sur `members` refait le contrôle, au cas où.
- **Edge Function `student`**, déployée avec `--no-verify-jwt` et qui fait elle-même tous ses contrôles :
  - `join` : code de classe, pseudo et mot de passe.
    - `auth.admin.createUser` crée l'élève avec l'e-mail technique `s-<uuid>@eleves.v3ct0r.invalid`, `email_confirm: true` et `app_metadata.kind = 'student'`.
    - L'endpoint `/signup` n'est jamais appelé : la confirmation par e-mail des particuliers reste intacte.
    - **À tester d'abord sur la pile locale** : GoTrue pourrait refuser le domaine `.invalid`. Repli : un sous-domaine sans MX d'un domaine possédé.
  - `login` : code de classe, pseudo et mot de passe.
    - La fonction retrouve l'e-mail technique, puis appelle `/auth/v1/token` avec `Sb-Forwarded-For`. Ainsi les limites de GoTrue (150 requêtes par 5 minutes et par IP) portent sur l'IP de l'élève, sans la stocker.
    - Elle renvoie la session, gardée par `cloud.ts` comme aujourd'hui.
  - `reset` : un prof de la classe change le mot de passe (`updateUserById`).
  - `deactivate` : le proviseur bannit l'élève et libère la place.
- **Affichage.** L'e-mail technique n'est jamais affiché. `accountLabel(user)`, une fonction pure, donne le pseudo.
- **Suppression.** Supprimer un élève supprime son utilisateur GoTrue, puis `progress` et `members` par cascade.

### Phase 3 (onglet CLASSE)

- **`class_progress(p_class)`** vérifie que `auth.uid()` enseigne dans la classe ou en est le proviseur.
  - Elle renvoie une ligne par élève : pseudo, `updated_at`, et une **liste blanche** de clés : `progress.v1`, `learn.v1`, `games.v1`.
  - **Jamais `notes.v1`** (les notes privées) **ni `story.v1`**.
  - La table `progress` garde ses policies, et chacun ne lit que sa ligne.
- **Calculs.** Le tableau, le CSV et les statistiques sont faits par des modules purs testés (`src/school/report.ts`). Ils lisent ces données brutes avec les règles de `src/core/progress.ts` (`NEEDED`) et de `src/learn/progress.ts`.
- **Devoirs et déblocages** : `assign`, `unassign` et `class_unlock`, réservées au prof de la classe.
- **À préciser au plan de la phase 3** : « chapitre » désigne l'unité verrouillable, c'est-à-dire un cours LEARN ou une vue de l'explorateur.

### Phase 4 (proviseur)

`school_overview`, `remove_teacher`, `regen_school_code`, `school_stats`. Les statistiques donnent les élèves actifs par semaine, d'après `progress.updated_at` et l'activité datée.

### Phases 5 et 6

- **Thème complet** (`schools.theme`) : couleurs, police embarquée, fond. Il est appliqué par variables CSS, et le thème par défaut reste identique au pixel près.
- **Textes de l'école** : affichés en texte brut seulement, jamais en HTML.
- **Cours de l'école** : validés par les mêmes règles que `tests/learn-courses.test.ts`, et nettoyés avant affichage.

## Tests

- **Policies et fonctions** : pgTAP avec `npm run db:test`, sur la pile locale Docker. Les tests sont dans `supabase/tests/*.test.sql`.
- **Logique pure** : vitest (`tests/school.test.ts`, `tests/welcome.test.ts`).
- **Écrans** : le smoke (section ÉCOLE), avec un serveur simulé par `page.route`.
