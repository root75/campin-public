# campin-public

Pages et jeux destinés aux élèves, servis par GitHub Pages. Rien de nominatif ici : ce dépôt
est public. Les sources pédagogiques (fiches, mémoire) restent dans `campin-pedagogique`, privé.

- `index.html` — accueil public sans connexion ni redirection automatique, logo et valeurs WBE ; une seule entrée « Mes cours » (la séance ouverte de la classe, sinon Mes cours), puis « Me connecter et rendre un devoir » et les révisions en accès libre.
- `se-connecter/` — « À chaque cours » en sept gestes (Chrome par Démarrer, profil, Classroom ▸ À faire ▸ devoir ▸ Rendre le devoir ×2 ▸ Remis) avec une animation ; le reste replié : la première fois (profil Chrome, @ et point, rejoindre le cours), joindre un fichier, points et corrections, question, devoir déjà rendu ; « Ça coince ? ». Animations : lecteur commun, maquettes dans `se-connecter/demos.js`. Carte en tête de l’accueil et entrée « Rendre un devoir » du ☰ Menu des fiches (#rendre).
- `cours/` — adresse courte à donner aux élèves, redirige vers Mes cours (plus liée depuis l’accueil, qui pointe directement sur le déploiement).
- `portail/` — « Mon portail », page d'accueil des profils élèves : publique ici (« Tu n'es pas connecté »), remplie pour l'élève quand Apps Script la sert (`…/exec?vue=portail`). En haut à droite, la grille à 9 points des applis (`assets/lanceur.js`, « Mes cours » en premier), copie du vrai lanceur Google pour que l'élève prenne le geste ; chaque cours pas à pas la charge aussi. Aucune donnée d'élève dans ces fichiers.
- `portail/actus.json` — les titres de « Quelques nouvelles » du portail, relus chaque matin d'école dans les flux de 1jour1actu et du JDE par `outils/actus.cjs` (`.github/workflows/actus.yml`). Ajouter une source = une ligne dans `SOURCES`.
- `revisions/` — révisions et entraînements : une carte par cours, ses activités et « fait / à faire ». La page se construit depuis `revisions.json` (`revisions.js`) ; le portail lit le même fichier pour « Mes révisions ». Ajouter une activité = une ligne dans `revisions.json`, sans rien republier.
- `assets/progres.js` — le « fait / à faire » : noté dans le navigateur de l'élève (profil Chrome), jamais sur le serveur. Une page « je révise » le charge avec `data-quiz="quiz:<id>"`.
- `mots-croises/` — une grille de mots croisés par cours (`?cours=<id>`). Mots et indices dans `grilles.json` ; `grille.js` calcule la grille, toujours la même pour une même liste ; `jeu.js` + `jeu.css` sont le jeu lui-même, que le portail monte aussi sur place. Ajouter une grille = une entrée dans `grilles.json` et une activité dans `revisions.json` (`tests/mots-croises.cjs` vérifie les deux).
- `associe/` — « Associe l'image », pour les 1res : un dessin, son nom (`?jeu=<id>`). Paires dans `jeux.json`, dessins tracés pour le site dans `icones.js`.
- `derriere-lecran/` — « Vie en ligne 01 — Derrière l'écran », pour les 1res : les émotions dans les échanges en ligne (percevoir, comprendre, ajuster). `pas-a-pas/` = le cours (sept étapes, preuves en trois variantes, conducteur `vie-en-ligne-1` dans `pas-a-pas/sequences.json` avec un vote d'avis sans bonne réponse) ; la page du dossier = « je m'entraîne » : l'essentiel et douze situations (`situations.json`, `jeu.js`) ; `emotions.js` = les huit personnages et la roue cliquable, en SVG, pour la page et pour l'étape 1 du cours. Démarche inspirée du jeu « ConnectÉmoi » (Fédération Wallonie-Bruxelles) ; situations écrites pour le site.
- `outils/verifier-cours.cjs` — la vérification avant mise en ligne : chaque étape de chaque cours du catalogue ouverte dans Chromium (erreurs, fichiers et liens absents, images, nombre d'étapes, « Ça coince ? » vide, bouton affiché à tort au-dessus de la tâche). Lancée sur chaque PR ; mode d'emploi dans `pas-a-pas/MOTEUR.md`, section « Vérifier avant de publier ».
- `prof/` — raccourci vers le tableau professeur du même déploiement (`?vue=prof`).

- `devine-le-poids/` — 3e TTR, Labo 04 (M3, unités de mesure).
- `nomme-lecran/` — vocabulaire de l'interface (Windows, navigateur, Google Docs), S1 à S3.

Les anciennes adresses des activités et des parcours pas à pas restent disponibles.

Le serveur choisit la séance avec la classe enregistrée du compte scolaire et les cours ouverts. Sans séance, il affiche Mes cours. Ce comportement nécessite la mise à jour de `campin-pedagogique/outils/pas-a-pas/Code.gs` dans le déploiement Apps Script.

Le [catalogue commun](pas-a-pas/cours.json) centralise titres, liens et nombres d’étapes.
[Ajouter un cours et installer la lecture dynamique](pas-a-pas/CATALOGUE.md) : une dernière
mise à jour de Code.gs est nécessaire ; ensuite, le tableau propose **Actualiser le catalogue**.
Les autorisations par classe restent privées.

Les modules et activités proposent un bouton **Accueil** vers la page publique. Le lien absolu et `target="_top"` permettent aussi le retour depuis les cours intégrés dans Apps Script. Le style commun se trouve dans `assets/navigation.css`.
