# campin-public

Pages et jeux destinés aux élèves, servis par GitHub Pages. Rien de nominatif ici : ce dépôt
est public. Les sources pédagogiques (fiches, mémoire) restent dans `campin-pedagogique`, privé.

- `index.html` — ouvre automatiquement `cours/` pour rejoindre la séance de la classe connectée ; liens de secours et révisions disponibles.
- `cours/` — redirection scolaire existante vers Mes cours.
- `revisions/` — révisions et entraînements regroupés par niveau (1re, 2e, 3e).
- `prof/` — raccourci vers le tableau professeur du même déploiement (`?vue=prof`).

- `devine-le-poids/` — 3e TTR, Labo 04 (M3, unités de mesure).
- `nomme-lecran/` — vocabulaire de l'interface (Windows, navigateur, Google Docs), S1 à S3.

Les anciennes adresses des activités et des parcours pas à pas restent disponibles.

Le serveur choisit la séance avec la classe enregistrée du compte scolaire et les cours ouverts. Sans séance, il affiche Mes cours. Ce comportement nécessite la mise à jour de `campin-pedagogique/outils/pas-a-pas/Code.gs` dans le déploiement Apps Script.
