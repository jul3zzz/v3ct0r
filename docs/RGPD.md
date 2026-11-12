# V3CT0R : données personnelles

Version du 2026-11-11, à jour pour la phase 1 (essais d'école) de `docs/ECOLES.md`. Le document est complété à chaque phase : comptes élèves, onglet CLASSE, proviseur.

Il décrit les traitements tels qu'ils sont codés. Il ne remplace ni l'avis d'un juriste, ni la politique de confidentialité à publier (voir « Ouvert »).

## Qui traite quoi

- **Responsable de traitement** : l'éditeur de V3CT0R. Identité et adresse : *à compléter*.
- **Sous-traitant** : Supabase (base de données et authentification).
  - Projet `dpefjnxejkapgchgcrco`, région **UE**. Datacenter exact à relever dans Project Settings → General : *à compléter*.
  - Accord de sous-traitance (DPA) : à accepter dans le tableau de bord Supabase (Legal). Supabase étant une société américaine, ses sous-traitants et transferts relèvent de ce DPA (clauses contractuelles types).
- **Hébergement du site** : GitHub Pages. L'app n'y envoie aucune donnée. GitHub journalise les requêtes de service des pages, comme tout hébergeur.
- **Ce que l'app ne fait pas** : ni cookie publicitaire, ni mesure d'audience, ni ressource tierce chargée à l'exécution (polices et scripts sont embarqués). Le stockage local du navigateur (`localStorage`) sert seulement au fonctionnement de l'app.

## Données par personne

| Personne | Données | Où | Finalité | Base légale | Durée |
|---|---|---|---|---|---|
| Visiteur sans compte (site, zip, app de bureau) | progression, notes, réglages | son appareil seulement | utiliser l'app | — (rien n'est transmis) | jusqu'à ce qu'il efface les données du navigateur |
| Particulier avec un compte | e-mail, mot de passe (haché par Supabase Auth), journal de connexion de Supabase Auth (dont l'adresse IP), progression et notes synchronisées (table `progress`) | Supabase (UE) | retrouver sa progression sur plusieurs appareils | exécution du service demandé | tant que le compte existe ; durée d'inactivité avant suppression : *à décider* |
| Personne qui ouvre un lien d'essai | **par clé** : date de première ouverture, nombre d'ouvertures, temps actif, dernière visite. Aucun nom, e-mail, adresse IP ni identifiant d'appareil | Supabase (UE), `school.trial_keys` | suivi et relance de l'essai | intérêt légitime (prospection d'établissements) | proposition : 12 mois après la fin de l'essai sans suite, *à décider* |
| Toi (admin) | une note par clé (`label` : à qui elle a été remise) | Supabase (UE) | suivi commercial | intérêt légitime | même durée que la clé |

Détails sur l'essai :
- **Données pseudonymes.** Chaque clé est remise à un contact identifié : ses chiffres d'usage se rattachent donc à une personne. L'écran d'essai l'annonce : « Pendant l'essai, V3CT0R compte les ouvertures et le temps passé avec cette clé, rien d'autre. »
- **Contre les tentatives.** Un compteur global d'échecs par minute est gardé une heure, sans aucune donnée personnelle.
- **Journaux de Supabase.** L'API de Supabase journalise les requêtes (dont l'adresse IP) pendant une durée qui dépend du plan (7 jours en Pro). V3CT0R ne les lit pas et ne les stocke pas ailleurs.

## Phases suivantes (principes déjà décidés)

- **Élèves** : un pseudo, un mot de passe et une classe, **sans e-mail**.
  - L'adresse technique en `.invalid` exigée par Supabase Auth n'est jamais affichée.
  - Le prof voit la progression (vues, cours, exercices, leçons-jeux), **jamais les notes** ni le mode histoire.
- **Suppression** : supprimer un élève supprime son utilisateur Supabase Auth, et par cascade sa progression et son appartenance à la classe.
- **Profs et proviseur** : ils rejoignent l'école par un code. Leurs données sont décrites à la phase 2.

## Droits des personnes

Les personnes peuvent demander l'accès, la rectification, l'effacement ou s'opposer, à l'adresse de contact (`VITE_CONTACT_EMAIL`).

Pour l'instant, tout se fait à la main :
- **Supprimer un compte** : Supabase → Authentication → Users → Delete user. La progression et les notes suivent par cascade.
- **Supprimer le suivi d'une clé ou d'une école** : SQL Editor, `delete from school.trial_keys where id = '…'` ou `delete from school.schools where slug = '…'`.
- **Pas encore de suppression de compte depuis l'app** : à prévoir.

## Sécurité

- **Chiffrement** : TLS entre l'app et Supabase.
- **Tables de progression** : RLS, chacun ne lit et n'écrit que sa ligne.
- **Tables des écoles** : schéma non exposé par l'API, RLS sans policy, accès par des fonctions qui contrôlent les droits.
- **Clés d'essai** : stockées hachées (sha256), jamais en clair.
- **Clé secrète Supabase** : seulement dans `.env.local` sur le poste de l'admin. Elle n'est jamais dans le dépôt, le build ou le zip, et le smoke le vérifie.

## Ouvert

- Identité du responsable de traitement et datacenter exact.
- Acceptation du DPA Supabase.
- Durées de conservation : comptes inactifs, suivi des essais.
- **Politique de confidentialité et mentions légales à publier** sur le site, avant l'ouverture des comptes au public.
- Suppression du compte par l'utilisateur lui-même.
