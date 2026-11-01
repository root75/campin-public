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

Collecte : API `noter()` et journal existants, réponse textuelle ≤ 200 caractères par bloc.
La validation vérifie seulement que les champs sont remplis. Un bloc vert est une étape enregistrée,
pas une note. Aucun dépôt de capture et aucune correction automatique d’explication ouverte.
Les réponses non envoyées ne sont pas sauvegardées ; le bouton attend la confirmation du serveur
et propose de réessayer après un échec. Pour continuer une enquête, conserver la séance existante.

Migration du moteur : les index Python chargent le contenu avec une URL versionnée pour éviter
un ancien JavaScript en cache. Si Apps Script sert encore un ancien index sans `blocs.js`, le
contenu Python charge le moteur au DOM prêt seulement s’il manque. Les pages déjà en cache
continuent ainsi à démarrer pendant la transition.
