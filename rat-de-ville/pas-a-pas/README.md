# Suivi du formatif « Le rat de ville »

Entrée du catalogue : `rat-de-ville-formatif`, 9 étapes sur deux périodes.
Les 46 petites cases (une action ou une vérification par case) déclarent les actions terminées ; elles ne corrigent pas la copie.
Navigation libre, sept repères pendant la copie ; grille complète et colonne « Moi » en étape finale (bouton 📋). Plus de repère collectif depuis le 4/11 (voir LIVRAISON-RAT.md).
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
