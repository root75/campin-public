/* Messagerie 03 — Bien communiquer en ligne. DONNÉES seulement : le moteur est pas-a-pas/blocs.js.
   Questions de preuve : preuves.json (3 variantes par bloc, tirées et corrigées par le serveur).
   Complète Messagerie 01 et 02 avec ce que demande aussi le référentiel FMTTN des 1res : choisir entre courriel
   et messagerie instantanée, lu / non lu, spam et courrier indésirable, hameçonnage, Cc / Cci, nétiquette et
   émoticônes, verrouiller et se déconnecter. Fiche prof : campin-pedagogique, cours/activites-info-2e/sequences/04-messagerie/PROF-03.md. */
const COURS = 'messagerie-3';
const VERSION_PARCOURS = 'v1';
const PRESENTATION = 'missions';
const PREUVES = 'https://root75.github.io/campin-public/messagerie-3/pas-a-pas/preuves.json?v=20261112';
const HORS_SUIVI = 'Entraînement libre : rien n’est transmis au professeur. En classe, ouvre Mes cours avec ton compte scolaire.';

/* Un message d'exemple « De : … · Objet : … · Texte : … » affiché comme dans une boîte. */
const echappe = s => String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function carteMail(t){
  const m = {}; String(t).split(' · ').forEach(p=>{ const i=p.indexOf(' : '); if(i>0) m[p.slice(0,i)] = p.slice(i+3); });
  return '<span class="mini-mail"><span><b>De :</b> '+echappe(m['De'])+'</span><span><b>Objet :</b> '+echappe(m['Objet'])+'</span>'+(m['Texte']?'<span class="texte">'+echappe(m['Texte'])+'</span>':'')+'</span>';
}

const REEL = '<p class="reel"><span>Ici, <b>tout est réel</b> : tu travailles dans Outlook. Garde deux onglets : cette fiche et Courrier.</span> <a class="btn vide" href="https://outlook.cloud.microsoft/mail/" target="_blank" rel="noopener">Ouvrir Courrier ↗</a></p>';
const OUVRIR = 'Ouvre Courrier : le bouton ci-dessus, ou barre de favoris ▸ <b>Favoris du domaine arcampin.com</b> ▸ <b>Microsoft 365</b> ▸ <b>Courrier</b>.';

const BLOCS = [
 {partie:'A — Le bon outil', titre:'Courriel ou messagerie instantanée ?', min:5,
  veux:'Choisir l’outil qui convient à la personne à qui j’écris.',
  avant:'<table class="lettre"><tr><th></th><th>📧 Le courriel</th><th>💬 La messagerie instantanée</th></tr><tr><td>Exemples</td><td>Outlook, Gmail</td><td>WhatsApp, Messenger, Snapchat</td></tr><tr><td>Il faut</td><td>une adresse, un objet</td><td>un numéro de téléphone ou un pseudo</td></tr><tr><td>Pour</td><td>un professeur, l’école, un document à envoyer</td><td>une conversation rapide entre amis, un groupe</td></tr><tr><td>Le ton</td><td>poli : je salue et je signe</td><td>plus libre, mais toujours respectueux</td></tr></table>',
  essai:{q:'Tu as une question sur le devoir de sciences. Tu écris à ton professeur. Quel outil ?', choix:[['Un courriel, avec Outlook','Oui : un professeur, l’école, une question sérieuse. Courriel.'],['Un message sur WhatsApp','Non : on n’écrit pas à un professeur sur une messagerie instantanée. Et il n’a pas à avoir ton numéro.'],['Je ne sais pas','Normal : regarde la ligne « Pour » du tableau.']], apres:'<p>Avant d’écrire, une question : <b>à qui</b> j’écris ? Un professeur, l’école : <b>courriel</b>. Des amis, pour aller vite : <b>messagerie instantanée</b>.</p>', suite:'👉 À toi'},
  vois:'Je sais citer deux messageries instantanées et une application de courriel.',
  coince:['Teams est aussi une messagerie instantanée : celle de l’école, pour discuter dans une équipe.','Un SMS n’est pas une messagerie instantanée par internet, mais il sert à la même chose : une conversation rapide.'],
  q:{serveur:true}},
 {partie:'B — Ma boîte de réception', titre:'Lu ou non lu ?', min:5,
  veux:'Repérer les messages que je n’ai pas encore lus, et garder un message à lire plus tard.',
  avant:REEL,
  gestes:[OUVRIR,'À gauche, clique sur <b>Boîte de réception</b>.','Regarde la liste : un message <b>non lu</b> a son objet écrit en <b>gras</b>.','Clic droit sur un message que tu as déjà lu ▸ <b>Marquer comme non lu</b>.','Regarde : son objet repasse en gras.','Clic droit sur le même message ▸ <b>Marquer comme lu</b>.'],
  vois:'Je sais rendre un message non lu, puis lu.',
  coince:['Je ne vois pas « Marquer comme non lu » : fais le clic droit sur le message lui-même, dans la liste, pas dans le volet de lecture.','Tous mes messages sont en gras : tu ne les as pas encore ouverts. Ouvre-en un, puis recommence.'],
  q:{serveur:true}},
 {partie:'B — Ma boîte de réception', titre:'Le spam et le courrier indésirable', min:5,
  veux:'Savoir où Outlook range les messages douteux, et ne pas me faire avoir.',
  avant:'<aside class="repere"><h3>📮 Le spam</h3><p>Un <b>spam</b>, c’est un message envoyé à des milliers de personnes : publicité, faux cadeau, arnaque. Outlook le range souvent tout seul dans le dossier <b>Courrier indésirable</b>.</p><p>Un spam est arrivé dans ta Boîte de réception ? Clic droit dessus ▸ <b>Signaler</b> ▸ <b>Signaler comme courrier indésirable</b>.</p></aside>',
  gestes:['Dans Courrier, à gauche, clique sur <b>Courrier indésirable</b>.','Regarde la liste. Vide ? Tant mieux. Des messages ? N’en ouvre aucun.','Ne clique sur aucun lien, n’ouvre aucune pièce jointe de ce dossier.','Retourne dans <b>Boîte de réception</b>.'],
  vois:'Je sais où est le dossier Courrier indésirable, et je n’y ai rien ouvert.',
  coince:['Je ne vois pas Courrier indésirable : dans la colonne des dossiers, à gauche, sous Éléments supprimés. Si la colonne est repliée, clique sur les trois traits ☰ en haut à gauche.','Un message de mon professeur est dans Courrier indésirable : ne fais rien, montre-le-lui à la fin du cours.'],
  q:{serveur:true}},
 {partie:'B — Ma boîte de réception', titre:'Le message qui veut mon mot de passe', min:5,
  veux:'Reconnaître un message piège qui veut voler mon compte : on l’appelle l’hameçonnage.',
  avant:'<aside class="repere exemple"><h3>👀 Un exemple</h3>'+carteMail('De : Microsoft Sécurité <securite@micros0ft-compte.com> · Objet : Ton compte sera bloqué ce soir ! · Texte : Clique ici et tape ton mot de passe pour garder ton compte.')+'<p>Lis l’<b>adresse</b> lettre par lettre. Puis lis ce que le message te <b>demande</b>.</p></aside>',
  essai:{q:'Ce message vient-il vraiment de Microsoft ?', choix:[['Oui, c’est écrit Microsoft','Attention : n’importe qui peut écrire « Microsoft » comme nom. Regarde l’adresse.'],['Non, c’est un piège','Bien vu.'],['Je ne sais pas','Normal : voici comment on décide.']], apres:'<p><b>① L’adresse :</b> micros<b>0</b>ft, avec un <b>zéro</b> à la place du o. Ce n’est pas Microsoft.</p><p><b>② La demande :</b> ton mot de passe, et vite. Personne de sérieux ne demande ton mot de passe par message.</p><p><b>Donc :</b> je ne clique pas, je le signale (clic droit ▸ Signaler ▸ Signaler l’hameçonnage), et je le montre à mon professeur.</p>', suite:'👉 À toi'},
  vois:'Je sais dire pourquoi un message est un piège : l’adresse, la demande, l’urgence.',
  coince:['L’hameçonnage, c’est comme la pêche : le message est l’hameçon, ton mot de passe est le poisson.','J’ai déjà cliqué et tapé mon mot de passe : préviens ton professeur tout de suite, il faut le changer.'],
  q:{serveur:true}},
 {partie:'C — Écrire à plusieurs', titre:'Cc ou Cci ?', min:5,
  veux:'Choisir la bonne ligne quand j’écris à plusieurs personnes.',
  avant:'<table class="lettre"><tr><th>Ligne</th><th>Qui la voit ?</th><th>Quand ?</th></tr><tr><td><b>À</b></td><td>tout le monde</td><td>la personne à qui j’écris</td></tr><tr><td><b>Cc</b> : copie</td><td>tout le monde</td><td>quelqu’un qui doit être au courant (un professeur, un parent)</td></tr><tr><td><b>Cci</b> : copie cachée</td><td><b>personne d’autre</b></td><td>beaucoup de destinataires qui ne se connaissent pas : leurs adresses restent cachées</td></tr></table>',
  essai:{q:'Ton club écrit à 40 parents qui ne se connaissent pas. Où mettre leurs adresses ?', choix:[['Dans Cc','Non : chaque parent verrait les 39 autres adresses.'],['Dans Cci','Oui : chacun reçoit le message, personne ne voit les adresses des autres.'],['Je ne sais pas','Normal : regarde la colonne « Qui la voit ? ».']], apres:'<p>Une adresse est personnelle. Écrire à beaucoup de monde : <b>Cci</b>, et ma propre adresse dans <b>À</b>.</p>', suite:'👉 À toi'},
  vois:'Je sais dire qui voit les adresses en Cc et en Cci.',
  coince:['« Cci » veut dire « copie carbone invisible ». En anglais : Bcc.'],
  q:{serveur:true}},
 {partie:'C — Écrire à plusieurs', titre:'Envoyer un message en copie cachée', min:8,
  veux:'Envoyer un vrai message à deux camarades, sans qu’ils voient l’adresse l’un de l’autre.',
  avant:REEL,
  gestes:[OUVRIR,'Clique sur le bouton bleu <b>Nouveau message</b> (touche N).','Dans <b>À</b>, tape ton propre nom ▸ clique sur la ligne qui finit par <b>@arcampin.be</b>.','Au bout de la ligne À, à droite, clique sur <b>Cci</b> : une nouvelle ligne apparaît.','Dans <b>Cci</b>, tape le nom d’un camarade ▸ sa ligne en @arcampin.be. Puis un deuxième camarade.','Dans <b>Ajouter un objet</b>, tape : Essai de copie cachée.','Dans le corps : « Bonjour, ceci est un essai de copie cachée. », puis ton prénom.','Clique sur <b>Envoyer</b>.','À gauche, <b>Éléments envoyés</b> ▸ ouvre ton message.','Demande à un de tes deux camarades d’ouvrir ton message chez lui : voit-il l’adresse de l’autre ?'],
  vois:'Mon message est dans Éléments envoyés : mon adresse dans À, mes deux camarades dans Cci.', stop:true,
  coince:['Je ne vois pas Cci : il est au bout de la ligne À, à droite. Clique dans la ligne À d’abord.','Mon camarade n’a rien reçu : vérifie ensemble son adresse, lettre par lettre, dans ton message envoyé.','Outlook propose plusieurs lignes : choisis celle qui finit par @arcampin.be. Pas « Externe », pas @arcampin.com.'],
  q:{serveur:true}},
 {partie:'C — Écrire à plusieurs', titre:'La nétiquette et les émoticônes', min:5,
  veux:'Connaître les règles de politesse d’internet : la nétiquette.',
  avant:'<aside class="repere"><h3>🤝 La nétiquette</h3><ul><li>Je <b>salue</b> et je <b>signe</b>.</li><li>J’écris en minuscules : TOUT EN MAJUSCULES, c’est <b>crier</b>.</li><li>Les <b>émoticônes</b> 🙂 😂 : avec mes amis, oui ; dans un courriel à un professeur, non.</li><li>Je <b>relis</b> avant d’envoyer : un message envoyé ne se reprend pas.</li><li>Je ne transfère pas le message de quelqu’un sans son accord, et jamais un message pour se moquer.</li></ul></aside>',
  essai:{q:'Un courriel à ton professeur finit par « MERCI ENCORE 😂😂😂 ». Bonne idée ?', choix:[['Oui, c’est gentil','L’intention est gentille, mais les majuscules crient et les émoticônes sont pour les amis.'],['Non','Bien vu : « Merci, » puis ta signature suffit.'],['Je ne sais pas','Normal : relis la règle des majuscules et celle des émoticônes.']], apres:'<p>À un professeur : « <b>Merci,</b> », puis mon prénom, mon nom et ma classe.</p>', suite:'👉 À toi'},
  vois:'Je sais citer trois règles de la nétiquette.',
  coince:['« Nétiquette » : le mot vient de « net » (internet) et « étiquette » (les règles de politesse).'],
  q:{serveur:true}},
 {partie:'D — Je quitte mon poste', titre:'Verrouiller ou se déconnecter ?', min:5,
  veux:'Que personne n’utilise mon compte quand je quitte mon ordinateur.',
  avant:'<table class="lettre"><tr><th>Quand ?</th><th>Je fais</th><th>Le chemin</th></tr><tr><td>Une <b>pause</b> : je me lève quelques minutes</td><td>🔒 Je <b>verrouille</b></td><td><b>Ctrl + Alt + Delete</b> ▸ <b>Verrouiller</b> (ou touche Windows ⊞ + L)</td></tr><tr><td>La <b>fin de l’heure</b> de cours</td><td>🚪 Je me <b>déconnecte</b></td><td>Touche Windows ⊞ ▸ clic sur <b>mon prénom</b> ▸ <b>Se déconnecter</b> (ou <b>Ctrl + Alt + Delete</b> ▸ <b>Se déconnecter</b>)</td></tr></table><p>Sinon, l’élève suivant arrive dans <b>ma</b> session : mes courriels, mon Drive, en mon nom.</p>',
  gestes:['Appuie en même temps sur <b>Ctrl + Alt + Delete</b>.','Clique sur <b>Verrouiller</b> : l’écran de verrouillage s’affiche.','Appuie sur une touche, tape ton mot de passe, puis <b>Enter</b>.','Tu retrouves cette fiche, ouverte : rien n’est perdu.','Retiens : à la fin de l’heure, touche Windows ⊞ ▸ ton prénom ▸ Se déconnecter. Puis clique sur ✅ C’est vérifié.'],
  vois:'Je sais verrouiller mon poste, puis le rouvrir avec mon mot de passe.',
  coince:['Ctrl + Alt + Delete : trois touches en même temps. Garde Ctrl et Alt enfoncées, puis appuie sur Delete.','Mon mot de passe ne passe pas : vérifie que Caps Lock est éteint.'],
  q:{serveur:true}},
 {partie:'D — Je quitte mon poste', titre:'Et sur l’ordinateur de quelqu’un d’autre ?', min:5,
  veux:'Ne laisser aucune trace de mon compte sur un ordinateur partagé : chez un ami, à la bibliothèque.',
  avant:'<aside class="repere"><h3>🏫 À l’école</h3><p>Ton profil Chrome est à toi. <b>Ne te déconnecte pas d’Outlook</b> : tu serais déconnecté de tout (Drive, Word…). En fin d’heure, tu te déconnectes de <b>Windows</b>.</p></aside><aside class="repere"><h3>🏠 Sur l’ordinateur de quelqu’un d’autre</h3><ul><li>Chrome propose d’enregistrer ton mot de passe ? Clique sur <b>Jamais</b>.</li><li>Avant de partir : dans Courrier, clique sur <b>le rond de ton compte</b>, en haut à droite ▸ <b>Se déconnecter</b>.</li><li>Puis ferme <b>toutes</b> les fenêtres de Chrome.</li></ul></aside>',
  essai:{q:'À la bibliothèque, tu as lu tes courriels. Tu fermes juste l’onglet et tu pars. Ton compte est-il protégé ?', choix:[['Oui, l’onglet est fermé','Non : le compte reste souvent connecté. Le suivant rouvre Courrier… et lit tes messages.'],['Non','Bien vu : il faut se déconnecter avant de partir.'],['Je ne sais pas','Normal : relis le deuxième encadré.']], apres:'<p>Fermer un onglet ne déconnecte pas. Sur un ordinateur partagé : <b>Se déconnecter</b>, puis fermer Chrome.</p>', suite:'👉 À toi'},
  vois:'Je sais ce que je fais avant de quitter l’ordinateur de quelqu’un d’autre.',
  coince:['Le rond de ton compte : en haut à droite de Courrier, avec tes initiales ou ta photo.'],
  q:{serveur:true}}
];

const FIN = {
  titre:'Bravo : tu sais communiquer en ligne sans risque',
  bulle:'Parcours terminé !',
  texte:'Le bon outil, une boîte bien rangée, les pièges repérés, la copie cachée, la nétiquette, un poste fermé derrière toi.',
  citation:{texte:'Il faut tourner sa langue sept fois dans sa bouche avant de parler.', auteur:'Proverbe français', source:'Proverbe', lien:'Un message aussi : je le relis avant de l’envoyer.'},
  plus:'À la fin de l’heure : touche Windows ⊞ ▸ ton prénom ▸ Se déconnecter. En attendant, si ton professeur te le propose, deviens aidant : va voir un camarade qui a sonné la cloche 🔔, explique avec des mots, ne touche pas sa souris.',
  lien:'<a href="https://root75.github.io/campin-public/revisions/" target="_blank" rel="noopener">la page des révisions</a>'
};

if(typeof module!=='undefined') module.exports = { BLOCS, FIN, COURS };
