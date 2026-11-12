# Installer V3CT0R Lycée sur tous les PC d'un établissement

Ce guide s'adresse au technicien ou au référent numérique de l'établissement. Chaque kit d'installation en contient une copie adaptée (`LISEZ-MOI.txt`), avec la clé, le nombre de postes et la date de fin de la licence.

V3CT0R Lycée est l'app des établissements, distincte de V3CT0R (l'app pour tous) : son propre nom, son dossier, ses données. Après l'installation, elle s'ouvre **déjà débloquée pour tous les comptes Windows du poste** : les élèves n'ont ni code à saisir ni compte à créer.

## Le kit

Il est créé par l'éditeur avec `npm run school -- licence … --kit` (voir `docs/ADMIN.md`) et envoyé par un lien de partage.

| Fichier | Rôle |
|---|---|
| `V3CT0R-Lycee.msi` | V3CT0R Lycée, l’app des établissements (Windows 10 ou 11, 64 bits), installée pour tout le poste (Program Files) |
| `licence.json` | la clé de la licence ; copiée dans `C:\ProgramData\V3CT0R\licence.json` |
| `installer.cmd` | installation silencieuse : le MSI, puis `licence.json` (à lancer en administrateur) |
| `desinstaller.cmd` | désinstallation |
| `LISEZ-MOI.txt` | ce guide, avec les valeurs de la licence |

Si `V3CT0R-Lycee.msi` manque, il se télécharge sur https://github.com/jul3zzz/v3ct0r/releases/latest/download/V3CT0R-Lycee.msi et se pose à côté de `installer.cmd`.

## Avant de commencer

- **Réseau** : le pare-feu ou le proxy de l'établissement doit autoriser `https://dpefjnxejkapgchgcrco.supabase.co` (HTTPS, port 443). Chaque poste y vérifie la licence à sa première ouverture, puis s'ouvre aussi hors ligne jusqu'à la fin de la licence.
- **Droits** : l'installation se fait pour tout le poste et demande les droits d'administrateur.

## Installer : trois façons

### A. Poste par poste

Copier le dossier du kit sur le poste (ou le lire depuis un partage), clic droit sur `installer.cmd`, puis « Exécuter en tant qu'administrateur ».

### B. Stratégie de groupe (domaine Active Directory)

1. Copier le kit sur un partage lisible par les comptes ordinateurs, par exemple `\\serveur\logiciels\v3ct0r`.
2. Configuration ordinateur > Stratégies > Paramètres du logiciel > **Installation de logiciel** : nouveau package `\\serveur\logiciels\v3ct0r\V3CT0R-Lycee.msi`, mode « Attribué ».
3. Configuration ordinateur > Préférences > Paramètres Windows > **Fichiers** :
   - nouveau fichier, source `\\serveur\logiciels\v3ct0r\licence.json` ;
   - destination `C:\ProgramData\V3CT0R\licence.json`, action « Remplacer ».
4. Redémarrer les postes : l'installation se fait au démarrage.

### C. Intune, PDQ Deploy, SCCM ou équivalent

Déployer le dossier du kit comme application Win32, en contexte système :

| | |
|---|---|
| installation | `installer.cmd` |
| désinstallation | `desinstaller.cmd` |
| détection | le fichier `C:\ProgramData\V3CT0R\licence.json` existe |

Pour installer le MSI seul, sans la licence : `msiexec /i V3CT0R-Lycee.msi /qn /norestart`.

## Vérifier

Ouvrir V3CT0R Lycée (bureau ou menu Démarrer) avec un compte élève. La barre du haut doit montrer le logo de l'établissement et LICENCE, et rien ne doit être verrouillé.

Si un écran parle du serveur de licence, revoir le pare-feu (voir « Réseau » plus haut).

## Bon à savoir

- **Postes.**
  - La licence compte un nombre maximal de PC. Un PC compte une fois, quel que soit le compte Windows.
  - Au-delà, le PC affiche « Toutes les places de la licence sont prises ». L'éditeur peut libérer les postes remplacés.
- **Mise à jour** : installer le MSI d'une version plus récente par-dessus, par la même méthode. `licence.json` reste en place.
- **Profils** :
  - la progression des élèves est gardée dans leur profil Windows (`%APPDATA%\V3CT0R`) ;
  - si les profils sont effacés à chaque déconnexion, elle repart de zéro à chaque session.
- **Données** :
  - le serveur reçoit la clé, une empreinte anonyme du poste, le nombre d'ouvertures et le temps d'utilisation ;
  - aucune donnée personnelle : ni nom, ni adresse IP gardée, ni compte.
- **Clé copiée** :
  - la clé est lisible sur les postes ;
  - si elle sort de l'établissement, l'éditeur crée une nouvelle clé (un nouveau kit) et l'ancienne s'arrête ;
  - il suffit alors de remplacer `licence.json` sur les postes, comme à l'étape 3 de la méthode B ou avec `installer.cmd`.
