/* Messagerie 02 — Je réponds, je joins, je transfère. DONNÉES seulement : le moteur est pas-a-pas/blocs.js.
   Questions de preuve : preuves.json (3 variantes par bloc, tirées et corrigées par le serveur). */
const COURS = 'messagerie-2';
const VERSION_PARCOURS = 'v1';
const PRESENTATION = 'missions';
const PREUVES = 'https://root75.github.io/campin-public/messagerie-2/pas-a-pas/preuves.json?v=20261110';
const HORS_SUIVI = 'Entraînement libre : rien n’est transmis au professeur. En classe, ouvre Mes cours avec ton compte scolaire.';

/* ===== La réponse au professeur (bloc 8), contrôlée ligne par ligne ===== */
const NORM_M2 = s => String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[’]/g,"'").replace(/\s+/g,' ').trim();
const FINS = ['bonne journee','bonne soiree','a bientot','merci','merci d\'avance','cordialement','bien a vous','bon week-end','bon weekend'];
const SMS = /(^|[^a-z])(slt|bjr|stp|mrc|tkt|pk|pq|jsp|mdr|ptdr|wsh|bsr|dsl|koi|kan|bcp|tjr|jsuis|chui|svp)(?![a-z])/;
const classeDe = s => (/(?:^|[\s,:])([12]\s*[a-z]\d?)(?=$|[\s,.;])/i.exec(String(s||''))||[])[1]||'';
function erreursReponse(texte, nom, classe){
  const t = String(texte||'').replace(/\r/g,'');
  const lignes = t.split('\n').map(l=>l.trim()).filter(Boolean);
  const err = [];
  if(lignes.length<4) return ['Écris ta réponse sur plusieurs lignes, comme le modèle : la salutation, tes phrases, la formule de fin, puis ta signature. Passe à la ligne avec la touche Enter ↵.'];
  if(/\[|\]/.test(t)) err.push('Remplace les indications entre crochets [ ] par ton propre texte, et retire les crochets.');
  const sal = lignes[0];
  if(!/^bonjour/i.test(sal)) err.push('Commence par la salutation : « Bonjour Monsieur, » ou « Bonjour Madame, ».');
  else if(!/^Bonjour/.test(sal)) err.push('« Bonjour » prend une majuscule.');
  else if(!/^Bonjour (monsieur|madame)\b/i.test(sal)) err.push('Pour un professeur, écris « Bonjour Monsieur, » ou « Bonjour Madame, ».');
  else if(!/^Bonjour (Monsieur|Madame)\b/.test(sal)) err.push('« Monsieur » et « Madame » prennent une majuscule.');
  else if(!/^Bonjour (Monsieur|Madame),/.test(sal)) err.push('Mets une virgule juste après « Monsieur » ou « Madame ».');
  else if(!/^Bonjour (Monsieur|Madame),$/.test(sal)) err.push('Écris seulement la salutation sur la première ligne, puis passe à la ligne (Enter ↵).');
  const iFin = lignes.findIndex((l,i)=>i>0 && FINS.includes(NORM_M2(l).replace(/[\s!,.]+$/,'')));
  if(iFin<0){ err.push('Ajoute une formule de fin seule sur sa ligne, avant ta signature : « Bonne journée, » (ou Merci, Cordialement, À bientôt).'); return err; }
  const milieu = lignes.slice(1,iFin).join(' ');
  const phrases = milieu.split(/(?<=[.!?…])\s+/).filter(Boolean);
  if(!/piece jointe|ci-joint/.test(NORM_M2(milieu))) err.push('Annonce ta fiche : « Voici ma fiche complétée, en pièce jointe. »');
  if(phrases.length<2) err.push('Il faut au moins deux phrases : la pièce jointe, puis la réponse de ta fiche que tu préfères, et pourquoi.');
  for(const p of phrases){ if(!/^[A-ZÀ-ÖØ-Þ]/.test(p)){ err.push('Chaque phrase commence par une majuscule : « '+p.slice(0,30)+'… ».'); break; } }
  for(const p of phrases){ if(!/[.!?…]$/.test(p)){ err.push('Chaque phrase finit par un point : « …'+p.slice(-30)+' ».'); break; } }
  if(milieu.length<45) err.push('Ta phrase sur la fiche est trop courte : dis quelle réponse tu préfères, et pourquoi.');
  if(SMS.test(NORM_M2(t))) err.push('Pas de langage SMS : écris les mots en entier (s’il vous plaît, bonjour, merci…).');
  const sig = lignes.slice(iFin+1).join(' ');
  if(!sig) err.push('Signe sous la formule de fin : ton prénom, ton nom et ta classe.');
  else {
    const mots = NORM_M2(nom).split(/[^a-z0-9'-]+/).filter(Boolean);
    if(mots.length<2) err.push('Écris ton prénom et ton nom dans la case au-dessus : ils servent à vérifier ta signature.');
    else if(!mots.every(m=>NORM_M2(sig).split(/[^a-z0-9'-]+/).includes(m))) err.push('Ta signature reprend ton prénom et ton nom : '+String(nom).trim()+'.');
    const c = classe || classeDe(sig);
    if(!c || !NORM_M2(sig).replace(/\s/g,'').includes(NORM_M2(c).replace(/\s/g,''))) err.push('Ajoute ta classe dans ta signature'+(classe?' : '+classe:'')+', après ton prénom et ton nom.');
  }
  return err;
}

/* Un message d'entraînement « De : … · Objet : … · Pièce jointe : … » affiché comme dans une boîte. */
const echappe = s => String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function carteMail(t){
  const m = {}; String(t).split(' · ').forEach(p=>{ const i=p.indexOf(' : '); if(i>0) m[p.slice(0,i)] = p.slice(i+3); });
  return '<span class="mini-mail"><span><b>De :</b> '+echappe(m['De']||t)+'</span>'+(m['Objet']?'<span><b>Objet :</b> '+echappe(m['Objet'])+'</span>':'')+(m['Pièce jointe']?'<span class="pj">📎 '+echappe(m['Pièce jointe'])+'</span>':'')+'</span>';
}

const PROF = 'tape <b>Louviaux</b> (2B, 2F) ou <b>Michiels</b> (2E)';
const COTE = '<aside class="repere cote"><h3>⚠ Ta réponse au professeur est cotée sur 5</h3><ol><li>C’est une <b>réponse</b> à son message (bouton Répondre) : l’objet commence par <b>RE:</b>.</li><li>Ta fiche <b>complétée</b> est <b>jointe</b> : sa carte est sous l’objet.</li><li>Le texte commence par « <b>Bonjour Monsieur,</b> » (2E : « <b>Bonjour Madame,</b> »).</li><li>Des <b>phrases complètes</b>, avec une majuscule et un point ; pas de langage SMS.</li><li>Le message finit par ton <b>prénom</b>, ton <b>nom</b> et ta <b>classe</b>.</li></ol></aside>';
const REEL = '<p class="reel">À partir d’ici, <b>tout est réel</b> : tu travailles dans Outlook. Garde deux onglets : cette fiche et Courrier. <a class="btn vide" href="https://outlook.cloud.microsoft/mail/" target="_blank" rel="noopener">Ouvrir Courrier ↗</a></p>';

const BLOCS = [
 {partie:'A — Je m’entraîne, rien n’est envoyé', titre:'Repérer le mail piège', min:5,
  veux:'Avant d’ouvrir une pièce jointe, je regarde <b>QUI</b> l’envoie et <b>QUEL</b> fichier c’est.',
  extra:'<aside class="repere regle"><h3>⭐ La règle de la leçon</h3><p>Un inconnu, une adresse mal écrite, un fichier inattendu en <b>.exe</b> ou <b>.zip</b> : je n’ouvre pas, je sonne la cloche 🔔 et je montre à mon professeur.</p></aside>',
  gestes:['Lis le message de la question.','Regarde l’adresse après « De : », lettre par lettre.','Regarde la fin du nom du fichier, après le point.','Complète l’explication avec les mots de la banque, puis écris ta phrase.'],
  vois:'Le message piège est repéré : je sais dire si c’est l’expéditeur ou le fichier qui pose problème.',
  coince:['.docx, .pdf, .pptx : un document Word, un PDF, une présentation. Normaux s’ils sont attendus.','.exe est un programme qui s’installe ; .zip est un paquet fermé de fichiers. D’un inconnu : on n’ouvre jamais.','Les adresses de l’école finissent par @arcampin.be. Une seule lettre change, et ce n’est plus l’école.'],
  q:{serveur:true}},
 {partie:'A — Je m’entraîne, rien n’est envoyé', titre:'Répondre, Répondre à tous ou Transférer ?', min:5,
  veux:'Avant de cliquer, je sais <b>qui</b> va recevoir mon message.',
  extra:'<table class="lettre"><tr><th>Bouton</th><th>Pour une lettre</th><th>Qui reçoit ?</th></tr><tr><td><b>↩ Répondre</b></td><td>je réponds à celui qui m’a écrit</td><td>l’expéditeur, seul</td></tr><tr><td><b>↩↩ Répondre à tous</b></td><td>je réponds à tous ceux qui ont reçu la lettre</td><td>l’expéditeur et tous les autres destinataires</td></tr><tr><td><b>↪ Transférer</b></td><td>je fais suivre la lettre à quelqu’un d’autre</td><td>la personne que je choisis ; la pièce jointe part avec</td></tr></table>',
  gestes:['Lis le tableau.','Lis la situation de la question.','Demande-toi : qui doit recevoir mon message ?','Complète l’explication avec les mots de la banque, puis écris ta phrase.'],
  vois:'Je peux expliquer mon choix à mon voisin : qui reçoit le message.',
  coince:['Presque toujours Répondre. Répondre à tous seulement si tout le monde doit lire ta réponse : si le message a été envoyé à toute la classe, toute la classe la lit !'],
  q:{serveur:true}},
 {partie:'B — J’ouvre la pièce jointe sans risque', titre:'Ouvrir le message et vérifier', min:5,
  veux:'Lire le message « Ta fiche à compléter » et vérifier sa pièce jointe avant de l’ouvrir.',
  extra:REEL,
  gestes:['Ouvre Courrier : le bouton ci-dessus, ou barre de favoris ▸ <b>Favoris du domaine arcampin.com</b> ▸ <b>Microsoft 365</b> ▸ <b>Courrier</b>.','À gauche, clique sur <b>Boîte de réception</b>.','Clique sur le message « <b>Ta fiche à compléter</b> » de ton professeur.','Regarde l’expéditeur : son adresse finit-elle par <b>@arcampin.be</b> ?','Regarde la carte du fichier, sous l’objet : son nom finit-il par <b>.docx</b> ?','Les deux sont bons ? Continue. Un doute : n’ouvre pas, sonne la cloche 🔔.'],
  vois:'Expéditeur de l’école, fichier .docx attendu : je peux ouvrir.', stop:true,
  coince:['Je ne trouve pas le message : regarde l’onglet Autres, au-dessus de la liste. Ou tape le nom de ton professeur dans Rechercher, tout en haut.','Je ne vois pas l’adresse : clique sur le nom du professeur, en haut du message.'],
  q:{serveur:true}},
 {partie:'B — J’ouvre la pièce jointe sans risque', titre:'Ouvrir la fiche dans Word', min:5,
  veux:'Ouvrir la fiche pour la compléter. Outlook en garde une copie dans mon OneDrive, mon classeur de l’école en ligne.',
  gestes:['Passe la souris sur la carte du fichier, sous l’objet.','Clique sur la petite flèche <b>▾</b>, à droite de la carte.','Clique sur <b>Modifier dans le navigateur</b>.','Un nouvel onglet s’ouvre : <b>Word</b>, le traitement de texte de Microsoft (comme Docs).','Word te demande de te connecter ? Ton adresse de l’école, puis ton mot de passe.'],
  vois:'Ma fiche est ouverte dans Word. Dans Courrier, sous la carte : <b>Enregistré sur OneDrive</b>.',
  coince:['Je ne vois pas la flèche ▾ : passe la souris sur la carte du fichier, la flèche apparaît à droite.','Un aperçu s’ouvre, mais je ne peux pas écrire : ferme l’aperçu, puis flèche ▾ ▸ Modifier dans le navigateur.'],
  q:{serveur:true}},
 {partie:'B — J’ouvre la pièce jointe sans risque', titre:'Compléter la fiche', min:10,
  veux:'Une fiche remplie, phrase par phrase.',
  gestes:['Clique dans la première case de droite du tableau.','Tape ta réponse : une phrase, avec une majuscule au début et un point à la fin.','Passe à la case suivante : clic dans la case, ou touche <b>Tab ⇥</b>.','Remplis les cinq cases.','N’enregistre rien : Word enregistre tout seul, comme Docs.'],
  vois:'Les cinq cases sont remplies.',
  coince:['Je ne peux pas écrire dans la fiche : tu es peut-être dans l’aperçu. Retourne dans Courrier et refais le bloc 4.','Je ne sais pas quoi répondre : une réponse simple suffit, tu peux inventer. Ce qui compte, c’est la phrase bien écrite.'],
  q:{serveur:true}},
 {partie:'C — Je réponds et je joins ma fiche', titre:'Répondre à ton professeur', min:3,
  veux:'Répondre à celui qui m’a écrit, et à lui seul.',
  gestes:['En haut de Chrome, clique sur l’onglet <b>Courrier</b>.','Le message de ton professeur est encore ouvert.','Clique sur <b>↩ Répondre</b> (touche R) : sous le message, ou l’icône en haut à droite du message. Pas « Répondre à tous ».','N’écris rien pour l’instant : tu joins d’abord ta fiche.'],
  vois:'La ligne À porte déjà le nom de mon professeur ; l’objet est déjà rempli.',
  coince:['J’ai cliqué sur Répondre à tous : ferme ta réponse (elle va dans Brouillons), puis recommence avec Répondre.','La ligne À est vide : tu as cliqué sur Nouveau message. Ferme-le, rouvre le message de ton professeur, puis Répondre.'],
  q:{serveur:true}},
 {partie:'C — Je réponds et je joins ma fiche', titre:'Joindre ta fiche complétée', min:7,
  veux:'Que ma fiche parte avec ma réponse.',
  gestes:['Dans ta réponse, clique sur l’onglet <b>Message</b> du ruban, en haut.','Clique sur le trombone <b>📎 Joindre un fichier</b> ▸ <b>OneDrive</b>.','Le sélecteur s’ouvre sur <b>Récents</b> : coche « <b>Ma fiche a completer</b> ».','En bas, clique sur la petite flèche <b>▾</b> à côté de <b>Partager le lien</b> ▸ <b>Joindre</b>.'],
  vois:'La carte de ma fiche apparaît sous l’objet de ma réponse.', stop:true,
  coince:['Ma fiche n’est pas dans Récents : à gauche du sélecteur, Fichiers ▸ Pièces jointes ▸ Ma fiche a completer.','Joindre est grisé : coche un seul fichier, ta fiche.','Ma fiche part comme un lien : retire-la (✕ sur la carte), puis recommence en choisissant bien Joindre, pas Partager le lien.'],
  q:{serveur:true}},
 {partie:'C — Je réponds et je joins ma fiche', titre:'Écrire ta réponse', min:10,
  veux:'Une réponse polie et complète, vérifiée <b>ici</b> avant de la coller dans Outlook.',
  extra:COTE,
  gestes:['Écris ta réponse dans la case, en suivant le modèle.','Clique sur <b>Vérifier</b> et corrige ce qui est signalé.','Clique sur <b>📋 Copier mon texte</b> (ou sélectionne le texte, puis Ctrl+C).','Onglet <b>Courrier</b> ▸ clique dans la zone blanche de ta réponse, <b>au-dessus</b> du message de ton professeur.','Colle : <b>Ctrl+V</b> (ou clic droit ▸ Coller).','<b>N’envoie pas encore</b> : tu relis au bloc suivant.'],
  vois:'Ma réponse est collée dans Outlook, au-dessus du message de mon professeur.',
  coince:['Le texte collé n’a pas les mêmes lignes : remets les retours à la ligne avec Enter ↵ dans Outlook.','Monsieur ou Madame ? Ton professeur est un homme : Monsieur. Une femme : Madame. Toujours avec une majuscule et une virgule.'],
  q:{serveur:true, type:'redaction', copier:true,
     modele:'Bonjour Monsieur,          (2E : Bonjour Madame,)\nVoici ma fiche complétée, en pièce jointe.\n[Une phrase : la réponse de ma fiche que je préfère, et pourquoi.]\nBonne journée,\n[Prénom Nom], [classe]',
     champs:[{cle:'nom', nom:'Ton prénom et ton nom', aide:'Ils servent à vérifier ta signature.'}],
     zone:{nom:'Ta réponse', aide:'Une ligne pour la salutation, tes phrases, une ligne pour la formule de fin, une ligne pour ta signature. Passe à la ligne avec Enter ↵.', lignes:8},
     controle:(texte, v, ctx) => erreursReponse(texte, v.nom, ctx.classe)}},
 {partie:'C — Je réponds et je joins ma fiche', titre:'Envoyer et vérifier', min:5,
  veux:'Être sûr que mon professeur va recevoir ma fiche. Une réponse envoyée ne se reprend pas.',
  extra:COTE,
  gestes:['Relis ta réponse dans Outlook, point par point.','Clique sur <b>Envoyer</b>.','À gauche, clique sur <b>Éléments envoyés</b>.','Ta réponse est en haut de la liste, avec le petit trombone 📎.','Pas là ? Regarde dans <b>Brouillons</b> : elle n’est pas partie. Ouvre-la, puis Envoyer.'],
  vois:'Ma réponse est dans Éléments envoyés, avec le trombone 📎.',
  coince:['Ma réponse est partie sans la fiche : Répondre à nouveau au même message, joins la fiche (bloc 7), une phrase « Voici ma fiche, oubliée dans mon premier message. », ta signature, Envoyer.'],
  q:{serveur:true}},
 {partie:'D — Je transfère', titre:'Transférer au voisin, professeur en Cc', min:8,
  veux:'Faire suivre le message de mon professeur à mon voisin, avec la fiche. Mon professeur est en copie (Cc) : il voit que je sais transférer. Pas de cote.',
  gestes:['À gauche, <b>Boîte de réception</b> ▸ ouvre le message « Ta fiche à compléter ».','Clique sur <b>↪ Transférer</b> (touche Shift+F) : sous le message, ou l’icône en haut à droite du message.','Dans <b>À</b>, tape le nom de ton voisin ▸ clique sur la ligne qui finit par <b>@arcampin.be</b>.','Dans <b>Cc</b>, '+PROF+' ▸ clique sur la ligne qui finit par <b>@arcampin.be</b>.','Au-dessus du message, écris : « Bonjour » et le prénom de ton voisin, puis « Voici la fiche que nous avons reçue. », puis ton prénom.','Clique sur <b>Envoyer</b>.'],
  vois:'Avant d’envoyer : l’objet commence par <b>TR:</b> et la carte de la fiche est là.',
  coince:['Le nom de mon voisin ne s’affiche pas : tape son adresse en entier, prenom.nom@arcampin.be, vérifiée avec lui.','Outlook propose plusieurs lignes pour mon professeur : choisis celle qui finit par @arcampin.be. Pas « Externe », pas @arcampin.com.'],
  q:{serveur:true}}
];

const FIN = {
  titre:'Bravo : tu sais ouvrir, répondre, joindre et transférer',
  bulle:'Parcours terminé !',
  texte:'Ton professeur a reçu ta réponse (cotée sur 5) et ton transfert en copie.',
  revision:{titre:'Je réponds et je joins — je révise ↗', texte:'Un quiz de 5 questions et 15 cartes pour réviser.', url:'https://root75.github.io/campin-public/messagerie-2/'},
  citation:{texte:'Verba volant, scripta manent.', auteur:'Proverbe latin', source:'« Les paroles s’envolent, les écrits restent. »', lien:'Un mail envoyé reste : on le relit avant de cliquer sur Envoyer.'},
  plus:'Ajoute ton voisin dans tes contacts : Outlook ▸ colonne de gauche ▸ icône Contacts (fenêtre de bienvenue ? ▸ Ignorer) ▸ Nouveau contact ▸ Prénom, Nom de famille, Adresse e-mail professionnelle ▸ Enregistrer. Si ton professeur te le propose, deviens aidant : va voir un camarade qui a sonné la cloche 🔔, explique avec des mots, ne touche pas sa souris.',
  lien:'<a href="https://root75.github.io/campin-public/messagerie-2/" target="_blank" rel="noopener">la page « Je réponds et je joins »</a>'
};

if(typeof module!=='undefined') module.exports = { erreursReponse, BLOCS, FIN, COURS };
