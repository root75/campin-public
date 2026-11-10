# Le moteur pas à pas — créer un cours

Un cours = **des données**. L'affichage, les preuves, le suivi professeur, la cloche 🔔, la reprise sur
un autre poste, l'humeur, l'avis et la phrase de fin sont faits par le moteur commun
[`blocs.js`](blocs.js). Utilisé par Python 1, 2 et 3, le Labo 07 et la Messagerie 02.
(La Messagerie 01 et le Rat de ville ont encore leur propre moteur.)

## Les quatre fichiers d'un cours

| Fichier | Rôle | Départ |
|---|---|---|
| `<dossier>/pas-a-pas/index.html` | la page : titre, aide-mémoire, styles propres | copie de [`modele/index.html`](modele/index.html), six « À REMPLACER » |
| `<dossier>/pas-a-pas/fiche.js` | les blocs | copie de [`modele/fiche.js`](modele/fiche.js) |
| `<dossier>/pas-a-pas/preuves.json` | les questions corrigées par le serveur (facultatif) | [`messagerie-2/pas-a-pas/preuves.json`](../messagerie-2/pas-a-pas/preuves.json) |
| [`cours.json`](cours.json) | une entrée : id, titre, chemin, nombre d'étapes, `preuves` | voir [CATALOGUE.md](CATALOGUE.md) |

Puis, si le cours a un moment collectif : son conducteur dans [`sequences.json`](sequences.json).
Puis un test `tests/<cours>.cjs` (modèle : [`tests/messagerie-02.cjs`](../tests/messagerie-02.cjs)).
**Aucun Code.gs à redéployer** pour un nouveau cours : publier, puis tableau ▸ « Actualiser le catalogue ».
Les liens prof du cours (fiche professeur, dossier Drive) : une ligne dans l'onglet « Liens prof » de la
feuille « Pas à pas — suivi », colonne Cours = l'id du catalogue ; pas de redéploiement non plus.

Les adresses des scripts restent **absolues** (`https://root75.github.io/campin-public/…`) : la page
est aussi servie par Apps Script, où une adresse relative ne mène nulle part.

## Un bloc

```js
{ partie:'A — Je découvre',   // « A » s'affiche ; le reste sert de repère
  titre:'…', min:5,            // durée indicative, affichée ⏱
  veux:'Le but en une phrase.',
  gestes:['Une action par ligne, à l’impératif, avec le chemin de clics.', '…'],  // une case par geste
  vois:'Ce qui est à l’écran quand c’est fait.',   // encadré « ✅ À vérifier »
  stop:true,                   // facultatif : 🛑 ne continue pas avant d'avoir vérifié
  extra:'<aside class="repere">…</aside>',          // facultatif : HTML sous les cases
  coince:['Blocage prévisible et sa solution.', '…'],  // le « Ça coince ? » du bloc
  q:{ … } }                    // la preuve, ci-dessous
```

`fais:'<ol class="etapes">…</ol>'` reste accepté à la place de `gestes` (fiches plus anciennes).

## Les preuves

| `q.type` | L'élève… | Corrigé |
|---|---|---|
| `qcm` | clique un choix (2 à 8) ; `c[0]` est la bonne, `p[k]` explique le piège k | page, ou serveur |
| `saisie` | tape une réponse ; `regle:{egal, exact, contient, motif, sauf}` ou `ok:(r)=>…` | page, ou serveur |
| `redaction` | écrit un texte contrôlé par `controle(texte, valeurs, {classe})`, puis le copie (`copier:true`) | page, puis serveur |
| `ordre`, `ligne`, `trace`, `code`, `ordre-gestes` | Python et logigrammes (voir les fiches Python) | page |
| `rapport`, `enquete`, `mixte` | déclare une étape, écrit un court raisonnement (Labo 07) | non corrigé |

**Variantes — règle anti-recopie : trois versions du même type, chacune avec sa bonne réponse.**
Deux façons de faire :

- **Par le serveur (à préférer)** : `const PREUVES = '…/preuves.json'` dans la fiche, `q:{serveur:true}`
  dans le bloc, et dans `preuves.json` une liste de trois questions par bloc. Le serveur tire la version
  de l'élève et corrige ; la page ne peut pas se déclarer juste. Le bloc peut ajouter `rendu:(choix)=>html`
  pour dessiner les choix, ou être une `redaction` (`q:{serveur:true, type:'redaction', …}`).
- **Dans la page** : `variantes:[{q:…},{q:…}]` dans le bloc ; la version est tirée de l'adresse de l'élève.

Dans `preuves.json`, deux versions peuvent avoir le même énoncé : la fiche les distingue par leur numéro.
Vérifier dans le test que la réponse d'une version ne valide pas les deux autres.

## Ce que le moteur fait seul

Humeur du jour au bloc 1 ; avis en fin de parcours ; cloche 🔔 « J'attends de l'aide » (relue du
serveur après un rechargement, éteinte quand le professeur la traite ; avant de sonner, avertissement
et trois cases à cocher, **3 sonneries par heure au plus** — code commun [`cloche.js`](cloche.js), à charger
avant `blocs.js` comme dans `modele/index.html`) ; bandeau « bravo » ; reprise de
l'avancement depuis le serveur ; aperçu professeur `#bloc=N` avec le choix de la version de la preuve ;
brouillon d'une rédaction gardé sur le poste ; programme validé (question `code`) gardé sur le poste et
relu quand on revient sur le bloc : code de départ, essais ratés (programme, message de Python, explication), programme validé, lignes changées en gras,
explication `juste` ; erreurs envoyées au tableau (« Où le groupe bute »).

## Vérifier avant de publier

```bash
node tests/<cours>.cjs && node tests/catalogue.cjs
```

Puis la fiche dans Chromium, avec Playwright, en interceptant `https://root75.github.io/**` vers le
dépôt local (exemple : l'essai de la Messagerie 02 décrit dans sa PR). Avec un faux
`google.script.run`, vérifier : la variante tirée, la correction, le journal (un seul « juste » par bloc),
et l'absence de défilement horizontal à 375 px.
