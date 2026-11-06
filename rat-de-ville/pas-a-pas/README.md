# Suivi du formatif « Le rat de ville »

Entrée du catalogue : `rat-de-ville-formatif`, 9 étapes sur deux périodes.
Les 48 petites cases (une action ou une vérification par case) déclarent les actions terminées ; elles ne corrigent pas la copie.
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

## Lecteur commun et format `demos` (6 novembre 2026)

Le lecteur d'animations (scène, curseur, légende, ◀ ▶ Revoir, prefers-reduced-motion) et le volet
« Toutes les animations » sont communs à tous les cours : `pas-a-pas/demo-lecteur.js`, chargé avant
`demos.js`. `demos.js` ne garde que les maquettes (Docs, Drive, Classroom, Chrome) et les images,
rangées par clé (`etape1` à `etape9`, `cote`). Le placement sous les cases est au **même format que
le moteur commun** `blocs.js` : dans `contenu.js`, chaque étape porte par exemple
`"demos": { "1": ["etape1", [0, 1, 2]], "3": ["cote", [0, 1, 2, 3]] }` (case N, à partir de 1 →
animation, numéros des images). Les images 1 à 8 de l'étape 9 vont sous la case 13 (remise).

Le Rat garde son propre `fiche.js` : cases enregistrées une par une (`suiviFormatif`), navigation
libre, grille « Moi » en étape finale, étapes 4 et 5 à la sonnerie. `blocs.js` est un parcours
linéaire (bloc validé → bloc suivant, `noter`) : y passer changerait ce que voient les élèves.
Différence assumée avec `blocs.js` : cocher une case n'ouvre pas l'animation suivante ; l'étape est
redessinée et l'animation ouverte reste où elle est.
