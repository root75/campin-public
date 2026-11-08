# campin-public

Pages et jeux destinés aux élèves, servis par GitHub Pages. Rien de nominatif ici : ce dépôt
est public. Les sources pédagogiques (fiches, mémoire) restent dans `campin-pedagogique`, privé.

- `index.html` — accueil public sans connexion ni redirection automatique, logo et valeurs WBE ; accès libre aux révisions et bouton vers la séance avec le compte scolaire.
- `se-connecter/` — « À chaque cours » en sept gestes (Chrome par Démarrer, profil, Classroom ▸ À faire ▸ devoir ▸ Rendre le devoir ×2 ▸ Remis) avec une animation ; le reste replié : la première fois (profil Chrome, @ et point, rejoindre le cours), joindre un fichier, points et corrections, question, devoir déjà rendu ; « Ça coince ? ». Animations : lecteur commun, maquettes dans `se-connecter/demos.js`. Carte en tête de l’accueil et entrée « Rendre un devoir » du ☰ Menu des fiches (#rendre).
- `cours/` — redirection scolaire existante vers Mes cours.
- `revisions/` — révisions et entraînements regroupés par niveau (1re, 2e, 3e).
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
