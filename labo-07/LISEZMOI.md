# Labo 07 — version testable

Contenu : `pas-a-pas/fiche.js` (trois missions et un défi final ; sept étapes internes pour le suivi, à reprendre selon les besoins).
Moteur : `../pas-a-pas/blocs.js`, partagé avec Python 1 et Python 2.
Conducteur professeur : clé `labo-07` dans `../pas-a-pas/sequences.json` ; accessible au tableau.
Préparation, corrigé et activation : dépôt privé `campin-pedagogique/cours/3ttr-labo/sequences/07-coulisses-pc/PROF.md`.

Aperçu local : servir la racine du dépôt avec un serveur HTTP, puis ouvrir
`/labo-07/pas-a-pas/#bloc=1`. Les scripts utilisent les adresses absolues GitHub Pages nécessaires
à Apps Script : le test `essai-labo07.js` intercepte ces adresses vers le checkout local.
L’aperçu libre ne transmet ni ne conserve de réponse ; hors Apps Script, seul l’avancement local
reste sur ce navigateur. En classe, passer par Mes cours, avec le compte de l’école.

Rapport : `pas-a-pas/trame-rapport.txt` donne un plan sans mise en forme, copiable depuis
« Mon rapport et ma remise ». La grille critériée complète /10 (descripteurs et points) est
accessible dans ce même dialogue et copiée en fin de rapport avec la trame. L’élève crée un seul document Google Docs, le met en page et y saisit
des preuves courtes : tableau et capture légendée, une phrase de disponibilité, un seul incident
en quatre lignes et une décision finale en deux phrases. Les trois autres incidents sont
manipulés et vérifiés en binôme, avec échange des rôles et correction par l’auteur, sans autre compte rendu. Le professeur garde le contrôle individuel du défi final. À la fin seulement, il joint ce document dans le
nouveau devoir Classroom que le professeur devra préparer et publier lui-même.

Collecte du site : API `noter()` et Journal existants. Les étapes internes **1, 3, 6** conservent les hypothèses
initiales (et le test final) en texte court, ≤ 200 caractères. Les quatre autres étapes enregistrent une déclaration `rapport:…`. Deux exercices préalables
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

La progression élève montre quatre entrées. Les sept étapes internes distinguent hypothèse
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
