# Labo 07 — version testable

Contenu : `pas-a-pas/fiche.js` (14 blocs par contenu, sur plusieurs périodes).
Moteur : `../pas-a-pas/blocs.js`, partagé avec Python 1 et Python 2.
Conducteur professeur : clé `labo-07` dans `../pas-a-pas/sequences.json` ; accessible au tableau.
Préparation, corrigé et activation : dépôt privé `campin-pedagogique/cours/3ttr-labo/sequences/07-coulisses-pc/PROF.md`.

Aperçu local : servir la racine du dépôt avec un serveur HTTP, puis ouvrir
`/labo-07/pas-a-pas/#bloc=1`. Les scripts utilisent les adresses absolues GitHub Pages nécessaires
à Apps Script : le test `essai-labo07.js` intercepte ces adresses vers le checkout local.
L’aperçu libre ne transmet ni ne conserve de réponse ; hors Apps Script, seul l’avancement local
reste sur ce navigateur. En classe, passer par Mes cours, avec le compte de l’école.

Rapport : `pas-a-pas/trame-rapport.txt` donne un plan sans mise en forme, copiable depuis
« Mon rapport et ma remise ». L’élève crée un seul document Google Docs, le met en page et y saisit
observations, conclusions et une capture ciblée. À la fin seulement, il joint ce document dans le
nouveau devoir Classroom que le professeur devra préparer et publier lui-même.

Collecte du site : API `noter()` et Journal existants. Les blocs **1, 4, 12** conservent les hypothèses
initiales (et le test final) en texte court, ≤ 200 caractères. Les autres blocs enregistrent uniquement
une déclaration `rapport:…` ; ils ne collectent pas les preuves du document. Le site ne lit ni Docs,
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
