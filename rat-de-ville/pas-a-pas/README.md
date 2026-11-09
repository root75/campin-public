# Suivi du formatif « Le rat de ville »

Entrée du catalogue : `rat-de-ville-formatif`, 7 étapes sur deux périodes (9 jusqu’au 6/11).
Les 45 petites cases (une action ou une vérification par case) déclarent les actions terminées ; elles ne corrigent pas la copie.
Navigation libre, copie par groupes de quatre vers (strophes séparées à l’étape 3) ; grille complète et colonne « Moi » en étape finale (bouton 📋). Plus de repère collectif depuis le 4/11 (voir LIVRAISON-RAT.md).
À l’étape 8, chaque partie du bloc-notes dispose d’une explication à déplier :
un élément du festin en exemple, un geste détaillé en exemple et un début de phrase
à compléter. Les productions sont écrites dans Docs ; au moins six gestes restent attendus.
Le signal « Je bloque » reste attaché à l'étape signalée jusqu'au déblocage explicite.

Les fiches papier et la révision `/rat-de-ville/` sont conservées. Le texte à recopier
reste uniquement l’image du papier, cliquable pour l’ouvrir en grand dans un nouvel
onglet et zoomer. Aucune transcription en texte brut ni restriction globale du
copier-coller n’est ajoutée. Le menu des majuscules suit
la vérification de Vincent du 19 octobre : Minuscules/majuscules.

La page publique est un aperçu sans sauvegarde. La sauvegarde scolaire utilise le
Journal existant et confirme chaque écriture côté serveur ; aucun stockage nominatif
sur le poste. Une nouvelle séance ne remet pas ce formatif à zéro. Le repère professeur,
par classe, est indépendant des fiches et du mode séquence collectif.

Les styles reprennent ceux des composants des fiches pas à pas ; le tableau et le
catalogue existants sont réutilisés. Aucun droit d'accès ne vient du catalogue public.

Source consultée le 2 novembre 2026 : dossier Drive fourni, fiche formative DOCX
(modifiée le 13 octobre), PDF de la même fiche et générateur privé `construire_rat.js`.
La grille est transcrite et la fable reste en image, sans modification des exigences.

Installation du serveur et vérifications scolaires restantes :
`campin-pedagogique/outils/pas-a-pas/LIVRAISON-RAT.md`.

## Adaptation du 4 novembre 2026

Chaque étape propose un repère d’observation, le travail dans Docs et une vérification
concrète, avec encouragement lié à la méthode. Modèle visuel des trois zones à
l’étape 6, tableau police/taille à l’étape 7, raccourci d’aide visible et animation
discrète respectant la préférence de mouvement réduit. Aucun nouveau champ élève.
Les neuf étapes, la grille et les exigences
restent identiques. Aucun contrôle ne prétend lire ou corriger le document Docs.

Vérification : essai-rat.js réussi dans Chromium avec services Google simulés ;
affichage mobile examiné. Non publié dans cette session. Le panneau « Le repère de la classe » affiche le titre, le rappel collectif et le
repère d’observation de l’étape choisie par le professeur. Actualisation à
l’ouverture, manuelle et toutes les 30 secondes si le panneau est ouvert et
l’onglet visible. La place personnelle ne change pas. Cette fonction nécessite
la nouvelle version de Code.gs ; un serveur antérieur affiche une indisponibilité
locale au panneau, sans bloquer la fiche.

## Une case par action (4 novembre 2026)

Étape 6 : 7 cases ; étape 9 : 13 cases (10 min), voisin après la colonne « Moi ». 46 cases au lieu de 35 :
`CASES_RAT` de `Code.gs` doit suivre `contenu.js`.

## Document à côté du cours (5 novembre 2026)

Étapes 1 et 5, sous les cases : courte consigne (champ `apres` de `contenu.js`) pour afficher
le cours et le document dans la vue fractionnée de Chrome (clic droit sur l'onglet du document ▸
Ajouter l'onglet à une nouvelle vue fractionnée). Pas de case : `CASES_RAT` ne change pas.
Libellé à vérifier sur un poste de l'école (Chrome en français, version récente requise).
Sous la consigne, une démo repliée « 👀 Regarde comment mettre le cours et mon document côte à
côte » (`Demo.cree('cote', false)`, 4 images, écran Chrome maquetté) ; elle ne se lance qu'à
l'ouverture du volet, pour ne pas tourner en même temps que la démo de l'étape.

## Toutes les animations (5 novembre 2026)

Volet « 👀 Toutes les animations « Regarde comment faire » », avant « Mes boutons » : un bouton
par animation (les 9 étapes + le côte à côte) ; un clic l'affiche dans le volet, sans changer
d'étape ni toucher à la progression. Une seule animation joue à la fois dans le volet.

## Animations sous les cases (6 novembre 2026)

Chaque « 👀 Regarde comment faire » est sous la case qu'il montre (champ `demos` de chaque étape
dans `contenu.js` depuis le 06/11/2026 — auparavant `PAR_CASE` dans `demos.js`) ;
plus de démo d'étape en haut. Aux étapes 1 et 5, la vue fractionnée devient une case (48 cases,
`CASES_RAT = [3, 9, 2, 1, 2, 7, 7, 4, 13]`). Les étapes 4 et 5 se font à la sonnerie et au début
de la période 2, où que l'élève en soit : rappel sur les autres étapes, bouton de reprise à l'étape 5.

## Étapes 4 et 5 retirées : « À la sonnerie » et « Je reprends » (6 novembre 2026)

Fermer et rouvrir ne sont plus des étapes : les élèves ne les faisaient pas au même moment.
- Sous chaque étape, l’encadré **🔔 À la sonnerie, où que j’en sois** (fermer l’onglet, ne pas
  remettre, animation) et le lien « Je reviens après la sonnerie : je reprends mon document ».
- En haut, l’encadré **▶ Je reprends mon travail** (Drive ▸ Récents, vue fractionnée, deux
  animations, bouton « C’est fait : je reprends à l’étape N »). Il s’affiche seul quand l’élève
  rouvre le cours avec déjà des cases cochées et plus de 5 minutes sans action. Pas de case.
- **7 étapes, 45 cases.** Chaque étape garde son **id** interne (1, 2, 3, 6, 7, 8, 9 dans
  `contenu.js`) : ce sont les clés des cases et du Journal, rien n’est perdu. Le numéro affiché
  est la place (1 à 7). Une ancienne place 4 ou 5 envoie à la première étape non finie.
- Les étapes terminées sont calculées par la fiche et le tableau, depuis les cases.
- Le serveur lit les cases dans `pas-a-pas/cours.json` (`cases`, `criteres`) : la prochaine
  modification des étapes ou des cases ne demande plus de redéployer Code.gs.
- La fiche papier (`construire_rat.js`, 9 étapes) n’est pas modifiée.

## Lecteur commun et format `demos` (6 novembre 2026)

Le lecteur d'animations (scène, curseur, légende, ◀ ▶ Revoir, prefers-reduced-motion) et le volet
« Toutes les animations » sont communs à tous les cours : `pas-a-pas/demo-lecteur.js`, chargé avant
`demos.js`. `demos.js` ne garde que les maquettes (Docs, Drive, Classroom, Chrome) et les images,
rangées par clé : `etape` + l'`id` de l'étape (`etape1`, `etape2`, `etape3`, `etape6` à `etape9`),
puis `fermer`, `retrouver` et `cote`. Le placement sous les cases est au **même format que le moteur
commun** `blocs.js` : dans `contenu.js`, chaque étape porte par exemple
`"demos": { "1": ["etape1", [0, 1, 2]], "3": ["cote", [0, 1, 2, 3]] }` (case N, à partir de 1 →
animation, numéros des images). Les images 1 à 8 de la dernière étape vont sous sa case 13 (remise).
Les encadrés « À la sonnerie » et « Je reprends » ouvrent `fermer` et `retrouver` par leur nom.

Le Rat garde son propre `fiche.js` : cases enregistrées une à une (`suiviFormatif`), navigation
libre, grille « Moi » en étape finale, encadrés de sonnerie et de reprise. `blocs.js` est un
parcours linéaire (bloc validé → bloc suivant, `noter`) : y passer changerait ce que voient les
élèves. Différence assumée avec `blocs.js` : cocher une case n'ouvre pas l'animation suivante ;
l'étape est redessinée et l'animation ouverte reste où elle est.

## Revenir à une image d'une animation (9 novembre 2026)

Sous chaque animation, les points sont devenus des **numéros cliquables** (1, 2, 3…) : un clic
arrête l'animation et ramène à cette image, avec sa légende et l'écran maquetté (curseur sur la
cible). Survoler un numéro affiche la légende en infobulle. Le changement est dans le lecteur
commun `pas-a-pas/demo-lecteur.js` : il vaut pour tous les cours qui l'utilisent (Python, Labo 07,
Se connecter), dont les feuilles de style ont reçu le même style de numéros.

## Pastilles d'étape toujours cliquables (9 novembre 2026)

Les pastilles 1 à 7 (et 📋) ne sont plus désactivées pendant l'enregistrement d'une case : avec
Apps Script, chaque case les bloquait 1 à 2 s sans signe visible, et indéfiniment si le serveur ne
répondait pas. Un clic affiche l'étape tout de suite ; la place est enregistrée dès que le serveur
est libre (`va()` dans `fiche.js`). Les boutons « Étape précédente / suivante », « ← Étape 7 » et
« C’est fait : je reprends » passent par le même chemin. Au survol : main et léger grossissement.

## Limiteur de cloche (9 novembre 2026)

Au plus 3 sonneries par heure glissante. Un clic sur 🔔 ouvre d'abord « ⚠️ Attention, avant de
sonner » : trois cases à cocher (consigne relue, « Ça coince ? » lu, voisin consulté), un lien
« Ouvrir « Ça coince ? » » et le nombre de sonneries restantes. « 🔔 Je sonne » n'est actif
qu'une fois les trois cases cochées. Au maximum, la cloche passe en pointillés et le panneau donne
l'heure de la prochaine sonnerie possible. Le compte vient du serveur (`cloches`, `clocheLibre`) ;
avec un serveur antérieur ou en aperçu, il est tenu dans la page ouverte. Se débloquer ne compte
pas et ne demande rien. Détails et déploiement : `campin-pedagogique/outils/pas-a-pas/LIVRAISON-RAT.md`.

Depuis le même jour, le panneau et le compte sont du **code commun** : `pas-a-pas/cloche.js`, aussi
utilisé par `blocs.js` (Python 1 à 3, Labo 07, Messagerie 2) et Messagerie 01. Le serveur applique la
même règle à tous les cours (`verifieCloche_` dans Code.gs).
