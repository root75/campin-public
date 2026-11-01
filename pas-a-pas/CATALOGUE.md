# Le catalogue des cours

[`cours.json`](cours.json) est la liste commune du tableau professeur, du serveur Mes cours et
des aperçus. Il contient uniquement des métadonnées publiques : aucun compte, aucune classe,
autorisation, réponse ou note. Les accès scolaires restent vérifiés par Apps Script.

## Installer ce fonctionnement une fois

Les fichiers de ce dépôt sont publiés sur GitHub Pages. Dans le projet Apps Script scolaire,
remplacer le **Code.gs complet** par la version du dépôt privé
`campin-pedagogique/outils/pas-a-pas/Code.gs`, en conservant les éventuels réglages `PROFS` et
`ADRESSE` propres au déploiement.

**Déployer → Gérer les déploiements → Mes cours → crayon → Nouvelle version → Déployer**.
Conserver l’URL et l’accès scolaire existants. Ne pas créer un autre déploiement.
Vérifier avec un professeur, un élève autorisé, un cours fermé et un compte externe.
Sans cette installation, le tableau signale que le serveur utilise encore sa liste fixe.

## Ajouter un cours ensuite

1. Préparer sa fiche dans `<dossier>/pas-a-pas/index.html` et les composants nécessaires.
   L’identifiant `COURS` de la fiche doit correspondre au champ `id` du catalogue.
2. Ajouter un objet à la liste `cours` de `cours.json`, en respectant les virgules du JSON :

   ```json
   {
     "id": "nouveau-cours",
     "titre": "Sujet 01 — Le titre visible",
     "chemin": "nouveau-cours/pas-a-pas/",
     "etapes": 8
   }
   ```

   Nommer les cours avec le sujet en premier, puis un numéro sur deux chiffres et le titre :
   **Python 01 — Premiers pas**, **Messagerie 01 — Mon premier message**. La vue élève
   trie les titres par ordre alphabétique français, sans distinguer casse et accents, et
   respecte l’ordre des numéros. Garder les identifiants et les chemins existants.

   `etapes` est le nombre d’étapes internes suivies, même si la navigation les regroupe en
   missions. Si le cours utilise les variantes corrigées côté serveur, ajouter par exemple
   `"preuves": "nouveau-cours/pas-a-pas/preuves.json"`. Les cours corrigés par leur moteur
   n’ont pas besoin de ce champ. Les chemins sont relatifs à la racine de campin-public.
3. Si un mode séquence est prévu, ajouter aussi son conducteur dans `sequences.json`.
4. Publier les fichiers, attendre la fin du déploiement GitHub Pages, puis cliquer sur
   **Actualiser le catalogue** dans le tableau professeur. La sélection et la séance en cours
   sont conservées si le cours existe toujours. Ce bouton ne lance aucune séance et ne change
   aucune ouverture par classe.
5. Ouvrir le nouveau cours pour les classes voulues dans le panneau **Mes cours** du tableau.
   Le lancement explicite d’une séance garde son comportement existant d’ouverture pour la classe.

Aucun changement du code serveur ou du registre JavaScript du tableau n’est nécessaire pour
cet ajout. La conception de la fiche et des activités reste à réaliser.

## Contrat et erreurs

Le document contient `version: 1` et `cours`, une liste de 1 à 200 objets. Chaque entrée a un
identifiant unique (lettre minuscule initiale, lettres, chiffres et tirets, 64 caractères maximum),
un titre non vide (150 caractères maximum), un chemin de dossier et un nombre entier d’étapes
entre 1 et 500. Le champ facultatif `preuves` désigne un fichier JSON. Les champs inconnus,
chemins externes ou remontant dans les dossiers, doublons et catalogues dépassant 80 000 octets
après validation sont refusés. Ne pas renommer l’identifiant d’un cours déjà utilisé : il relie
le journal, les séances, les ouvertures et les conducteurs.

Le navigateur et le serveur valident indépendamment le catalogue. Le serveur garde normalement
le catalogue 10 minutes en cache ; le bouton force sa relecture. Un JSON invalide ou un échec
réseau conserve le dernier catalogue valide disponible en cache et affiche un avertissement.
Ce secours dure au maximum 6 heures et Google peut évincer le cache plus tôt : ce n’est pas
une sauvegarde durable. Sans version valide disponible, les appels dépendant du catalogue
échouent avec un message explicite, sans accorder de nouvel accès.

Corriger et republier le JSON, puis **Actualiser le catalogue**. Les données du journal et les
réglages des classes ne sont pas réécrits par cette opération. Supprimer une entrée masque le
cours sans effacer son historique ; cela doit être une décision volontaire.

## Vérifier avant publication

Depuis ce dépôt :

```bash
node tests/catalogue.cjs
```

Depuis le dépôt privé, avec Playwright installé :

```bash
NODE_PATH=/chemin/node_modules node outils/pas-a-pas/essai-catalogue.js ../campin-public
```

Le second test exécute le vrai Code.gs dans des services Google simulés et le vrai tableau dans
Chromium : ajout par JSON seul, validation, refus des accès, actualisation, secours, preuves,
conservation des réglages et de la séance, compatibilité avec l’ancien serveur. Il n’accède à
aucune donnée scolaire. Les comptes et le déploiement réels restent à vérifier à l’école.
