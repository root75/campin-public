# Labo 07 — version testable

Contenu : `pas-a-pas/fiche.js` (préparer le rapport, trois missions, un défi final, remettre le rapport ; neuf étapes internes pour le suivi, à reprendre selon les besoins).
Moteur : `../pas-a-pas/blocs.js`, partagé avec Python 1 et Python 2.
Conducteur professeur : clé `labo-07` dans `../pas-a-pas/sequences.json` ; accessible au tableau.
Préparation, corrigé et activation : dépôt privé `campin-pedagogique/cours/3ttr-labo/sequences/07-coulisses-pc/PROF.md`.

Aperçu local : servir la racine du dépôt avec un serveur HTTP, puis ouvrir
`/labo-07/pas-a-pas/#bloc=1`. Les scripts utilisent les adresses absolues GitHub Pages nécessaires
à Apps Script : le test `essai-labo07.js` intercepte ces adresses vers le checkout local.
L’aperçu libre ne transmet ni ne conserve de réponse ; hors Apps Script, seul l’avancement local
reste sur ce navigateur. En classe, passer par Mes cours, avec le compte de l’école.

Rapport : `pas-a-pas/trame-rapport.txt` donne un plan sans mise en forme, copiable depuis
« Mon rapport : trame et critères » et depuis l’étape 1 « Préparer mon rapport » (bouton 📋 Copier la trame). La grille critériée complète /10 (descripteurs et points) est
accessible dans ce même dialogue et copiée en fin de rapport avec la trame. L’élève crée un seul document Google Docs, le met en page et y saisit
des preuves courtes : tableau et capture légendée, une phrase de disponibilité, un seul incident
en quatre lignes et une décision finale en deux phrases. Les trois autres incidents sont
manipulés et vérifiés en binôme, avec échange des rôles et correction par l’auteur, sans autre compte rendu. Le professeur garde le contrôle individuel du défi final. À la fin seulement, il joint ce document dans le
nouveau devoir Classroom que le professeur devra préparer et publier lui-même.

Collecte du site : API `noter()` et Journal existants. Les étapes internes **2, 4, 7** conservent les hypothèses
initiales (et le test final) en texte court, ≤ 200 caractères. Les six autres étapes enregistrent une déclaration `rapport:…`. Deux exercices préalables
non cotés varient les méthodes : QCM de conclusion et cartes de gestes à remettre dans l’ordre.
Leurs essais utilisent les événements existants (`faux`, `ouvert` préfixé `activité:`) sans faire
avancer seuls la mission. Ils ne collectent pas les preuves du document. Le site ne lit ni Docs,
ni les pièces jointes, ni le statut Classroom. Un bloc vert ne vaut ni réussite, ni remise, ni note.
Les preuves ne sont pas recopiées sur le site. Aucun nouveau Forms ni collecte de fichier ajouté.

L’enseignant corrige le rapport, ses gestes et les hypothèses initiales privées : enquête /7,
document et remise /3. Les brouillons d’hypothèses non envoyées ne sont pas sauvegardés ; le rapport
se conserve dans le Drive scolaire et doit indiquer qu’il est enregistré avant de quitter le poste.
Le bouton de suivi attend la confirmation du serveur et permet de réessayer en cas d’échec.
Pour continuer une enquête, conserver la même séance et le même document. La checklist de remise
est une aide personnelle : seule la vérification dans Classroom confirme l’envoi.

Migration du moteur : les index Python chargent le contenu avec une URL versionnée pour éviter
un ancien JavaScript en cache. Si Apps Script sert encore un ancien index sans `blocs.js`, le
contenu Python charge le moteur au DOM prêt seulement s’il manque. Les pages déjà en cache
continuent ainsi à démarrer pendant la transition.

Le parcours élève et le conducteur ne fixent pas de calendrier. La mission fichiers utilise
OneDrive dans l’Explorateur scolaire ; le rapport Docs est joint via le sélecteur en ligne de
Classroom. Aucun lecteur Google Drive installé n’est supposé.

La progression élève montre six entrées : Rapport, Mission 1, Mission 2, Mission 3, Défi, Remise (06/11/2026 : création et remise du rapport sorties du dialogue pour devenir des étapes, case par case ; animations sous les cases via `DEMOS_SOUS_CASES`). Les neuf étapes internes distinguent hypothèse
avant manipulation et déclaration de mission terminée. Aucun recueil de validation orale ajouté :
le professeur note le contrôle individuel final sur une liste privée ; les vérifications d’entraînement sont réalisées en binôme. Si une ancienne séance de test à 14 étapes
avait été utilisée, démarrer une nouvelle séance de test ; ne pas interpréter ses numéros comme
ceux du nouveau parcours. Les brouillons locaux utilisent une clé de version distincte.

Mode séquence : tableau professeur ▸ Labo 07 ▸ Lancer la séquence. Alternance de prédiction,
vote à effectifs agrégés, essais sur les postes, mises en commun et défi individuel. La fiche
affiche aussi une citation finale de Descartes, sourcée dans la préparation ; elle apparaît à tous
sans condition de réussite, et n’est pas annoncée avant la fin.

Autonomie : aides contextualisées et indices, puis binôme qui explique ; « J’attends de l’aide » pour un
blocage persistant. Relecture réciproque avant le défi final sur trois critères, avec un point
réussi et une correction possible à l’oral. Aucune fiche de relecture ou note de camarade ajoutée.
Le mode séquence contient un atelier de relecture ; le défi final reste individuel et sous le
contrôle du professeur. Le bouton du moniteur est présenté une fois au groupe, sinon cas simulé.

## Animations et variantes (5 novembre 2026)

`pas-a-pas/demos.js` + `demos.css` : animations « 👀 Regarde comment faire » (maquettes Windows, Docs,
Chrome, Classroom ; valeurs fictives), placées sous le but de l’étape par `blocs.js` (`Demo.pourEtape`),
et volet « Toutes les animations » en tête de fiche. Pas d’animation pour le défi final.
QCM de l’étape 2 et ordre de l’étape 5 : trois variantes (`BLOCS[i].variantes`), tirées par l’adresse de
l’élève (`tirage`, même hachage que `Code.gs`). Étape 1 : consigne « rapport à côté du cours » (vue
fractionnée de Chrome), avec son animation. Essai : `essai-labo07.js` (143 contrôles).

**06/11/2026** : une seule version du QCM (étape 3) et de l’ordre (étape 6) — les trois variantes
étaient presque identiques et ces exercices ne sont pas cotés ; exception voulue à la règle des trois
variantes. Mission 1, étape 1 : la consigne est dans les cases (« À ton avis… », « Mon hypothèse »),
sans « Lis le défi ». Remise : les trois exigences sont trois cases. Essai : 162 contrôles.
