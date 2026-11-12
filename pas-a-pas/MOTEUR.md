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

Les styles communs sont dans [`fiche.css`](fiche.css) (puis [`python-missions.css`](python-missions.css) pour le style « missions ») :
la page les charge par leur adresse absolue et ne garde dans son `<style>` que ce qui lui est propre (`tests/styles-communs.cjs`).

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
  avant:'<aside class="repere">…</aside>',       // facultatif : HTML AVANT les cases (un exemple analysé, un tableau à lire)
  essai:{ q:'…', choix:[['libellé','retour'],…], apres:'<p>…</p>', suite:'👉 À toi' },   // facultatif : À LA PLACE des cases, une question d'essai sur `avant` (avec « Je ne sais pas »), puis l'analyse ; rien n'est noté
  gestes:['Une action par ligne, à l’impératif, avec le chemin de clics.', '…'],  // une case par geste
  vois:'Ce qui est à l’écran quand c’est fait.',   // encadré « ✅ À vérifier »
  stop:true,                   // facultatif : 🛑 ne continue pas avant d'avoir vérifié
  extra:'<aside class="repere">…</aside>',          // facultatif : HTML sous les cases
  coince:['Blocage prévisible et sa solution.', '…'],  // le « Ça coince ? » du bloc
  q:{ … } }                    // la preuve, ci-dessous
```

**Une case ne demande jamais de lire ce qui n'est pas encore à l'écran.** La question de preuve n'apparaît qu'après
« ✅ C'est vérifié » : ce que l'élève doit lire d'abord (exemple, tableau) va dans `avant`, et la dernière case
annonce la question (« Clique sur ✅ C'est vérifié : … »).

`fais:'<ol class="etapes">…</ol>'` reste accepté à la place de `gestes` (fiches plus anciennes).

## Les preuves

| `q.type` | L'élève… | Corrigé |
|---|---|---|
| `qcm` | clique un choix (2 à 8) ; `c[0]` est la bonne, `p[k]` explique le piège k | page, ou serveur |
| `saisie` | tape une réponse ; `regle:{egal, exact, contient, motif, sauf}` ou `ok:(r)=>…` | page, ou serveur |
| `redaction` | écrit un texte contrôlé par `controle(texte, valeurs, {classe})`, puis le copie (`copier:true`) | page, puis serveur |
| `trous` | complète un texte à trous avec une banque de mots, puis écrit une phrase libre (`phrase`) | page ; la phrase n'est **pas** jugée |
| `ordre`, `ligne`, `trace`, `code`, `ordre-gestes` | Python et logigrammes (voir les fiches Python) | page |
| `rapport`, `enquete`, `mixte` | déclare une étape, écrit un court raisonnement (Labo 07) | non corrigé |

`code`, `ordre`, `trace` et `ligne` (Python dans la page, Pyodide) sont dans [`python-editeur.js`](python-editeur.js), commun aux
fiches Python : la page le charge **avant** sa fiche et avant `blocs.js`. La fiche peut déclarer `const PYTHON_INPUT = true`
(`input( )` lit les réponses de `q.essais`) et `const ERREURS_FICHE = {…}` (explications d'erreurs du cours).
**« Explique avec tes mots » = `trous`** (10/11/2026). `texte` porte un trou par `___` ; `mots` = le bon mot de chaque trou, dans
l'ordre ; `pieges` = les intrus de la banque ; `phrase` (facultatif) = la question de la phrase libre. La fiche corrige les
trous (les faux passent en rouge) ; la phrase libre est enregistrée sans verdict (événement `phrase`, 200 caractères, au moins
quatre mots) et s'affiche au tableau, panneau « Leurs phrases », sans les noms tant que la case n'est pas cochée. Le bloc
s'ouvre après la phrase. Trois versions par `variantes`, avec **la même `phrase`** pour la corriger ensemble.
Exemple : Python 02, bloc 2 ; contrôle : `tests/trous.cjs`.

```js
q:{ type:"trous", q:"Complète la règle avec les mots de la banque.",
    texte:"Je commence par ___ le message. Il me dit quelle ___ est fautive.",
    mots:["lire","ligne"], pieges:["effacer","couleur"],
    phrase:"pourquoi faut-il lire le message avant de toucher au code ?", juste:"…" }
```

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
menu des étapes, repris du Rat de ville (une pastille ronde par bloc, ou par groupe de `PARCOURS` ; elle se remplit
comme un camembert selon les cases cochées — cases gardées sur le poste, sous l'adresse de l'élève, sans appel au serveur, ✓ sur fond vert une fois validée ; le nom en infobulle, celui de l'étape
affichée écrit sous les pastilles ; cliquable jusqu'au premier bloc non validé ; `rond:"📄"` dans un groupe de
`PARCOURS` = ce qui s'écrit dans sa pastille, sinon son numéro) ;
**blocs ouverts** : les blocs au-delà du dernier bloc ouvert portent un cadenas 🔒 dans la barre, sur ordre du tableau
(rangée « Blocs ouverts », un clic sur le numéro du dernier bloc à ouvrir) ou du moment `atelier` de la séquence qui porte
`"blocs": [premier, dernier]` — reçu avec `etat()` puis avec `moment()`, sans appel de plus ;
brouillon d'une rédaction gardé sur le poste ; programme validé (question `code`) gardé sur le poste et
relu quand on revient sur le bloc : code de départ, essais ratés (programme, message de Python, explication), programme validé, lignes changées en gras,
explication `juste` ; erreurs envoyées au tableau (« Où le groupe bute »).

## Les animations « 👀 Regarde comment faire »

Un maximum de code en commun : changer une vue la change dans tous les cours (Vincent, 12/11/2026).

| Fichier | Ce qu'il porte |
|---|---|
| [`demo-lecteur.js`](demo-lecteur.js) | le lecteur (◀ ▶, numéros, Revoir), le volet « Toutes les animations », le volet sous la case (`sousCases`) |
| [`demo-lecteur.css`](demo-lecteur.css) | son style ; importé par `python-missions.css` |
| [`demos-communs.js`](demos-communs.js) | les vues : Chrome (vue fractionnée, onglets), Outlook (liste, message lu, rédaction, sélecteur OneDrive, ruban), la souris DROIT — style compris |
| `<cours>/pas-a-pas/demos.js` | seulement les listes d'images du cours : `{ vue: 'ol-redac', …, cible, legende }` |

Charger dans l'ordre : `demo-lecteur.js`, `demos-communs.js`, puis le `demos.js` du cours. Dans un bloc,
`demos: { "4": ["cci"], "cote 1.2": ["cote"] }` met un volet sous la 4e case, et sous la 2e case du 1er
élément `.cote` (une liste `ol.etapes` dans `avant`). Une vue qui manque s'écrit dans `demos-communs.js`,
jamais dans le cours ; la liste des vues et de leurs options est en tête de ce fichier.

## Vérifier avant de publier

```bash
node tests/<cours>.cjs && node tests/catalogue.cjs
```

Puis la fiche dans Chromium, avec Playwright, en interceptant `https://root75.github.io/**` vers le
dépôt local (exemple : l'essai de la Messagerie 02 décrit dans sa PR). Avec un faux
`google.script.run`, vérifier : la variante tirée, la correction, le journal (un seul « juste » par bloc),
et l'absence de défilement horizontal à 375 px.
