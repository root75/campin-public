# Le moteur pas à pas — créer un cours

Un cours = **des données**. L'affichage, les preuves, le suivi professeur, la cloche 🔔, la reprise sur
un autre poste, l'humeur, l'avis et la phrase de fin sont faits par le moteur commun
[`blocs.js`](blocs.js). Utilisé par **tous les cours** : Python 1 à 4, le Labo 07, les Messageries 01 à 03, et le Rat de ville
(mode déclaratif, plus bas). La Messagerie 01 y est depuis le 16/11/2026 (état partagé entre les blocs, plus bas).
Le mode séquence est commun lui aussi : [`sequence-eleve.js`](sequence-eleve.js) ; une fiche lui passe ses champs
facultatifs par `const SEQUENCE = { contenus:true, classe:'…' }` (décrits en tête de ce fichier).

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
Champ facultatif `rappel` : l'adresse d'une page à projeter en début de cours ; le tableau en met le lien en haut du
cours collectif. Le bouton « Répéter sans les élèves » du tableau joue le conducteur sur le seul poste du professeur,
sans séance : rien n'est envoyé, les réponses sont fictives.
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
  gestes:['Une action par ligne, à l’impératif, avec le <b>chemin de clics</b>.', '…'],  // une case par geste, au moins un mot-clé en <b>
          // un geste peut porter son « ne fais pas » : {geste:'…', attention:'⚠️ …'} (encadré sous la case, jamais dans son texte)
  vois:'Ce qui est à l’écran quand c’est fait.',   // encadré « ✅ À vérifier »
  stop:true,                   // facultatif : 🛑 ne continue pas avant d'avoir vérifié
  extra:'<aside class="repere">…</aside>',          // facultatif : HTML sous les cases
  coince:['Blocage prévisible et sa solution.', '…'],  // le « Ça coince ? » du bloc
  fete:()=>{ … },              // facultatif : appelé une fois, à la première réussite du bloc (l'enveloppe de la Messagerie 01)
  arrive:api=>{ … },           // facultatif : appelé à chaque affichage du bloc. api = { zone, suivi, valeurs(), garde(cle, texte),
                               //   rappels(), serveur(nom, …arguments) → Promise } : brancher un jeu sur `avant`, demander une donnée au serveur
  q:{ … } }                    // la preuve, ci-dessous
```

**Une case ne demande jamais de lire ce qui n'est pas encore à l'écran.** La question de preuve n'apparaît qu'après
« ✅ C'est vérifié » : ce que l'élève doit lire d'abord (exemple, tableau) va dans `avant`, et la dernière case
annonce la question (« Clique sur ✅ C'est vérifié : … »).

`fais:'<ol class="etapes">…</ol>'` reste accepté à la place de `gestes` (fiches plus anciennes).

Chaque case à cocher porte **au moins un mot-clé en gras** (`<b>`, ou `<b class="chemin">` pour un chemin de clics) :
le geste ou l'objet de la case, pas un mot vide. L'œil accroche le geste avant de lire la phrase (Vincent, 13/11/2026).
Pas de gras dans un attribut ni dans un `<span data-rappel>`, que le moteur remplace. Chaque test de cours (`tests/*.cjs`)
le vérifie ; un test qui cherche une phrase de case telle quelle la compare sans balises.
Une interdiction n'est jamais une case : on ne coche pas « je n'ai pas fait ». Elle va dans l'encadré ⚠️ du geste
(`{geste, attention}` dans `gestes`, ou dans `CASES` des fiches Python), et les tests de cours le vérifient aussi.

## Les preuves

| `q.type` | L'élève… | Corrigé |
|---|---|---|
| `qcm` | clique un choix (2 à 8) ; `c[0]` est la bonne, `p[k]` explique le piège k | page, ou serveur |
| `saisie` | tape une réponse ; `regle:{egal, exact, contient, motif, sauf}` ou `ok:(r)=>…` | page, ou serveur |
| `redaction` | écrit un texte contrôlé par `controle(texte, valeurs, {classe})`, puis le copie (`copier:true`) | page, puis serveur |
| `trous` | complète un texte à trous avec une banque de mots, puis écrit une phrase libre (`phrase`) | page ; la phrase n'est **pas** jugée |
| `ordre`, `ligne`, `trace`, `code`, `ordre-gestes` | Python et logigrammes (voir les fiches Python) | page |
| `rapport`, `enquete`, `mixte` | déclare une étape, écrit un court raisonnement (Labo 07) | non corrigé |

`enquete` : chaque champ affiche « ✓ écrit / ✗ encore vide » pendant la frappe, et un envoi incomplet nomme **tous** les
champs vides d'un coup (jamais un manque à la fois) ; ces refus ne sont pas écrits au Journal. `rapport` : `liste:[…]`
(facultatif) = une case par point à vérifier dans le document ; un enregistrement incomplet nomme tous les points
non cochés. Sans `liste`, la seule `confirmation`.

**Rappels, au lieu de « retiens »** (12/11/2026). Une réponse `enquete` enregistrée est gardée sur le poste, sous
l'adresse de l'élève. `rappel:[{ de:'2:H', titre:'Ton hypothèse de départ' }]` dans un bloc = un encadré 🔁 sous le
but ; `<span data-rappel="5:F">ton fichier</span>` dans un texte = le champ F du bloc 5 ; `data-rappel="nom"` =
`RAPPELS.nom()` de la fiche (calculé de `EMAIL`, par exemple le nom d'un fichier). Sans valeur (autre poste, aperçu),
le texte d'origine reste : il doit se lire tel quel.

`q.colle:true` (avec `q.etiquette`, le titre de la zone) : la question et sa zone de réponse viennent **juste sous les
cases**, avant « ✅ À vérifier » et les encadrés — « à ton avis… » et la réponse se lisent d'un seul tenant.

**Un « ne fais pas » = un encadré** `<p class="attention">⚠️ …</p>`, dans la case du geste qu'il concerne (après le
`</label>`) ou sous les cases ; jamais dans le texte d'une case à cocher. **Les prolongements** vont hors du fil, dans
`<details id="plus-loin">` de la page ; l'écran du cadenas (blocs ouverts) propose d'y aller.

`code`, `ordre`, `trace` et `ligne` (Python dans la page, Pyodide) sont dans [`python-editeur.js`](python-editeur.js), commun aux
fiches Python : la page le charge **avant** sa fiche et avant `blocs.js`. La fiche peut déclarer `const PYTHON_INPUT = true`
(`input( )` lit les réponses de `q.essais`) et `const ERREURS_FICHE = {…}` (explications d'erreurs du cours).
**« Explique avec tes mots » = `trous`** (10/11/2026). `texte` porte un trou par `___` ; `mots` = le bon mot de chaque trou, dans
l'ordre ; `pieges` = les intrus de la banque ; `phrase` (facultatif) = la question de la phrase libre. La fiche corrige les
trous (les faux passent en rouge) ; la phrase libre est enregistrée sans verdict (événement `phrase`, 200 caractères, au moins
quatre mots) et s'affiche au tableau, panneau « Leurs phrases », sans les noms tant que la case n'est pas cochée. Le bloc
s'ouvre après la phrase. Trois versions par `variantes`, avec **la même `phrase`** pour la corriger ensemble.
Exemple : Python 02, bloc 2 ; contrôle : `tests/trous.cjs`.

Une question `code` avec `essais` peut porter une **scène** : `scene:{ decor:"porte" | "coffre" | "garde", ouvre:"Ouvert !", ferme:"Fermé." }`
ou `scene:{ decor:"salut", ouvre:["Bonjour Léa","Bonjour Sam"] }` (une ligne attendue par essai). Un petit décor par essai,
entre les boutons et la console, réagit à la dernière ligne affichée par `print( )` : la porte s'ouvre, reste fermée 🔒, ou
le décor grise (💥 erreur, 💤 rien d'affiché, ❓ autre texte). La scène ne juge rien — `test` reste seul juge — et ne montre
rien que la console ne dise. `ouvre` et `ferme` acceptent aussi une RegExp ou une fonction `(dit, x, i)` quand le texte
affiché est libre ; `montre(dit, x, i, etat)` rend ce que le décor affiche en grand (des cœurs, un nombre). Autres décors :
`calcul`, `coeurs`, `potion`, `distributeur`. Code : `sceneCree` et `sceneEtat` ; style : `.scene` dans [`python-missions.css`](python-missions.css).

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


## Le trésor de classe

Chaque bloc réussi par un élève ajoute une étoile au compteur de sa classe (jamais d'étoiles individuelles). Rien à
écrire dans une fiche : [`recompense.js`](recompense.js) (`Tresor`) affiche la ligne « ⭐ 24 étoiles dans le trésor de
la classe » dès que `moment()` porte `tresor`. Le compte est fait par le serveur (`Code.gs` ▸ `tresorLu_`, dépôt
campin-pedagogique, `outils/pas-a-pas/LISEZMOI.md`). Test : `tests/tresor.cjs`.

## L'état partagé entre les blocs — un texte construit pas à pas (la Messagerie 01)

Quand ce que l'élève écrit dans un bloc sert aux suivants : un mail construit champ par champ, relu en entier,
puis une réponse qui reprend son objet. Gardé sur le poste, sous l'adresse de l'élève, comme les cases.

- **Y écrire** : une rédaction `commun:true`. Ses `champs` (et sa `zone`, par `zone.cle`) lisent et écrivent l'état
  partagé ; son `controle(texte, valeurs, {classe})` reçoit **toutes** les valeurs partagées. `zone:false` = seulement
  des champs ; un champ `{lignes:3}` est une zone de plusieurs lignes ; `{siVide:true}` n'est demandé que si la valeur
  manque (reprise sur un autre poste). `reponse:(valeurs, texte, {classe, refus})` = ce qui part au serveur et au
  Journal ; `bouton` = le libellé de « Vérifier ».
- **Les critères, cochés pendant la frappe** : `criteres:(texte, valeurs, {classe}) => [{ nom, err }]`. La liste
  s'affiche sous la zone (○ / ✓) ; « Vérifier » donne toutes les erreurs d'un coup, jamais une à la fois.
- **L'aperçu en direct** : `const PARTAGE = { apercu:(valeurs, i, {classe}) => html }` et, dans la page,
  `<aside id="apercu-direct">` : redessiné à chaque frappe et à chaque bloc (`i` = rang du bloc, à partir de 0 ;
  `""` = caché). La fiche échappe elle-même ce que l'élève a tapé.
- **Un brouillon d'avant** : `PARTAGE.depart(email)` rend les valeurs de départ quand rien n'est encore gardé.
- **Relire une valeur** : `<span data-rappel="objet">…</span>` (la clé), ou `RAPPELS.x(valeurs, {classe, email})`.
- **Écrire, puis prouver** : `q:{ serveur:true, type:'mixte', activite:{ type:'redaction', commun:true, … },
  validation:{ juste:'…' } }`. L'activité est contrôlée dans la page ; la question de validation vient de
  `preuves.json` et le serveur la corrige. `ouvre:'↶ Répondre à Camille'` = un bouton à cliquer pour faire
  apparaître la zone (une rédaction déjà commencée se rouvre seule).
- `const CONFETTIS = true` : des confettis à chaque bloc validé.

Exemple : [`messagerie/pas-a-pas/fiche.js`](../messagerie/pas-a-pas/fiche.js) ; contrôle : `tests/messagerie-01.cjs`,
et le parcours dans Chromium, `campin-pedagogique/outils/pas-a-pas/essai-messagerie-01.js`.

## Le mode déclaratif — des cases, pas de preuves (le Rat de ville)

`const MODE = "declaratif"` dans la fiche. Pour un travail long dans un autre outil (un document Docs), où l'élève
**déclare** ce qu'il a fait et où le professeur examine la production.

- **Pas de `q`** dans les blocs. Une étape est terminée quand toutes les cases de `gestes` sont cochées.
- **Les cases sont enregistrées par le serveur**, une ligne « case » par geste (`noter()`, le chemin de tous les
  cours) : elles reviennent d'une période à l'autre et d'un poste à l'autre. La fiche n'écrit « Enregistré » qu'après
  la réponse du serveur ; un envoi raté repart seul (2 s, 5 s, 10 s), la case reste cochée.
- **Navigation libre** : toutes les pastilles sont cliquables, « Étape suivante → » est toujours là. Le cadenas
  « Blocs ouverts » du tableau s'applique quand même : au-delà, la fiche attend.
- **La grille « Moi »** : `const GRILLE = { intro, niveaux:{A:'dépasse',…}, criteres:[{ n, inc, regarde, A, B, C, D }], legende }`
  = l'écran final (pastille 📋), une lettre par critère, enregistrée comme une case. Une carte par critère, les
  niveaux l'un sous l'autre : l'élève clique sur la phrase qui décrit son travail (pas de tableau, trop large pour la page).
  Dans `legende`, `<ul class="couleurs">` et `<span class="couleur bleu|vert|jaune|orange">Bleu</span>` donnent une pastille de couleur par ligne. `FIN.titre` est son titre,
  `FIN.bouton` le libellé du bouton qui y mène ; `FIN.plus` et `FIN.lien` sont facultatifs.
- **Sous une case** : `{ geste, sous:'<img …>' }` (un extrait, une aide repliée) ; `{ geste, trous:{ titre, intro, bravo,
  variantes:[{ texte, mots, pieges }] } }` = un texte à trous d'entraînement, corrigé dans la page, jamais enregistré.
- **Sous chaque bloc** : `BAS_ETAPE` (« À la sonnerie », « Je reprends mon cours »), comme pour tous les cours.
- **`const REPRISE = { titre, html, demos }`** : l'encadré affiché en haut quand l'élève rouvre le cours plus de
  5 min après son dernier geste, avec le bouton « C'est fait : je reprends à l'étape N ».
- `coince` accepte `{ html:'<b>…</b>' }` à côté des textes simples ; `veux` est facultatif.

**Catalogue** : l'entrée du cours porte `"cases": { "1": 3, "2": 9, … }` (numéro d'étape : nombre de cases) et
`"criteres"`. C'est ce champ qui rend le cours déclaratif pour le serveur. **Une case est enregistrée sous
« étape.rang »** : ajouter une case en fin d'étape est sans risque ; déplacer une étape ou une case déplace les
déclarations déjà faites. Le test du cours compare `cours.json` et la fiche.

**Tableau** : le même que les autres cours. Les colonnes d'erreurs deviennent « Cases cochées » et « Moi » ; la barre
montre les étapes terminées et la place de l'élève ; « Où le groupe bute » compte les cloches par étape.
« Ramener la classe » et « Recommencer » ramènent l'élève à l'étape choisie et **décochent ses cases à partir de
cette étape** (les étapes d'avant restent) ; il recharge sa fiche. « Ouvrir pour une classe… » ne remet rien à zéro ;
« Recommencer à zéro » (nouvelle séance) vide les cases et les lettres « Moi » de la classe.
Une étape terminée se fête : bravo et confettis.

## Ce que le moteur fait seul

Humeur du jour au bloc 1 ; avis en fin de parcours ; cloche 🔔 « J'attends de l'aide » (relue du
serveur après un rechargement, éteinte quand le professeur la traite ; **un clic sonne, sans question ni motif avant** (17/11/2026), **3 sonneries par heure au plus** — code commun [`cloche.js`](cloche.js), à charger
avant `blocs.js` comme dans `modele/index.html`) ; bandeau « bravo » ; reprise de
l'avancement depuis le serveur ; aperçu professeur `#bloc=N` avec le choix de la version de la preuve ;
menu des étapes, repris du Rat de ville (une pastille ronde par bloc, ou par groupe de `PARCOURS` ; elle se remplit
comme un camembert selon les cases cochées — cases gardées sur le poste, sous l'adresse de l'élève, sans appel au serveur, ✓ sur fond vert une fois validée ; le nom en infobulle, celui de l'étape
affichée écrit sous les pastilles ; cliquable jusqu'au premier bloc non validé ; `rond:"📄"` dans un groupe de
`PARCOURS` = ce qui s'écrit dans sa pastille, sinon son numéro) ;
**blocs ouverts** : les blocs au-delà du dernier bloc ouvert portent un cadenas 🔒 dans la barre, sur ordre du tableau
(rangée « Blocs ouverts », un clic sur le numéro du dernier bloc à ouvrir) ou du moment `atelier` de la séquence qui porte
`"blocs": [premier, dernier]` — reçu avec `etat()` puis avec `moment()`, sans appel de plus ;
bandeau **« 🎁 Je m'occupe est ouvert pour toi jusqu'à HH:MM ▸ »** en bas de la fiche quand le professeur a coché 🎁 au
tableau, même pendant une séquence projetée — reçu avec `moment()`, affiché par le code commun [`recompense.js`](recompense.js),
à charger comme dans `modele/index.html` ;
brouillon d'une rédaction gardé sur le poste ; programme validé (question `code`) gardé sur le poste et
relu quand on revient sur le bloc : code de départ, essais ratés (programme, message de Python, explication), programme validé, lignes changées en gras,
explication `juste` ; erreurs envoyées au tableau (« Où le groupe bute »).

## Les animations « 👀 Regarde comment faire »

Un maximum de code en commun : changer une vue la change dans tous les cours (Vincent, 12/11/2026).

| Fichier | Ce qu'il porte |
|---|---|
| [`demo-lecteur.js`](demo-lecteur.js) | le lecteur (◀ ▶, numéros, Revoir), le volet « Toutes les animations », le volet sous la case (`sousCases`) |
| [`demo-lecteur.css`](demo-lecteur.css) | son style ; importé par `python-missions.css` |
| [`demos-communs.js`](demos-communs.js) | les vues : Chrome (fenêtre, vue fractionnée, onglets, nouvel onglet et profil), la gaufre Google, Windows (bureau, Démarrer, clic droit sur Démarrer), Classroom (la page d'un devoir : joindre, rendre, Remis, note), Outlook (liste, message lu, rédaction, sélecteur OneDrive, ruban), la souris DROIT — style compris |
| `<cours>/pas-a-pas/demos.js` | seulement les listes d'images du cours : `{ vue: 'ol-redac', …, cible, legende }` ; un devoir Classroom : `const rendre = DemosCommuns.devoir({ titre, fichier, … })`, puis `rendre({ joint: 1, cible, legende })` |

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
