'use strict';
/* Messagerie 02 — Je réponds, je joins, je transfère.
   Même moteur que Messagerie 01 (suivi Apps Script, cloche, reprise, variantes tirées par le serveur),
   mais les preuves sont surtout des QCM : la bonne réponse est en premier dans preuves.json,
   le serveur mélange les choix. Étapes 1-2 : entraînement dans la fiche ; 3-10 : Outlook réel. */
const COURS='messagerie-2';
const NB=10;
const TITRES=['Repérer le mail piège','Répondre, Répondre à tous ou Transférer ?','Ouvrir le message et vérifier','Ouvrir la fiche dans Word','Compléter la fiche','Répondre à ton professeur','Joindre ta fiche complétée','Écrire ta réponse','Envoyer et vérifier','Transférer au voisin, professeur en Cc'];
const MIN=[5,5,5,5,10,3,7,10,5,8];
const PARTIE=e=>e<2?'Partie A · Je m’entraîne — rien n’est envoyé':e<5?'Partie B · J’ouvre la pièce jointe sans risque':e<9?'Partie C · Je réponds et je joins ma fiche':'Partie D · Je transfère';
const ENCOURAGEMENTS=[
 ['Bien vu !','Qui l’envoie, quel fichier : tu as repéré le piège.'],
 ['Bon bouton !','Tu sais qui va recevoir ton message avant de cliquer.'],
 ['Message vérifié !','Expéditeur de l’école, fichier attendu : tu peux l’ouvrir.'],
 ['Fiche ouverte !','Elle est rangée dans ton OneDrive, prête à être complétée.'],
 ['Fiche complétée !','Word a tout enregistré tout seul. Retourne dans Courrier.'],
 ['Réponse ouverte !','L’adresse et l’objet sont déjà remplis. Joins ta fiche avant d’écrire.'],
 ['Fiche jointe !','Sa carte est sous l’objet : elle partira avec ta réponse.'],
 ['Réponse prête !','Copie-la dans Outlook, puis relis les cinq points avant d’envoyer.'],
 ['Réponse partie !','Ton professeur va recevoir ta fiche : c’est elle qui est cotée.'],
 ['Bravo pour ce parcours !','Tu sais ouvrir, répondre, joindre et transférer.']
];
const CITATION={texte:'Verba volant, scripta manent.',auteur:'Proverbe latin',source:'« Les paroles s’envolent, les écrits restent. »',lien:'Un mail envoyé reste : on le relit avant de cliquer sur Envoyer.'};
const OUTLOOK='https://outlook.cloud.microsoft/mail/';
const INITIAL={etape:0,atteint:0,reponses:{},nom:'',brouillon:''};
const state=JSON.parse(JSON.stringify(INITIAL));
const CELEBREES=new Set();

const norm=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[’]/g,"'").replace(/\s+/g,' ').trim();
const escapeHtml=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function regleNorm(s){return String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[’']/g,"'").replace(/[«»"“”.]/g,'').replace(/\s+/g,' ').trim();}
/* Mêmes règles que regle_() dans Code.gs. */
function regle(r,rep){const n=regleNorm(rep);return !!n&&(!r.sauf||!new RegExp(r.sauf).test(n))&&(!r.egal||r.egal.some(x=>regleNorm(x)===n))&&(!r.exact||r.exact.includes(String(rep).trim().toLowerCase()))&&(!r.contient||r.contient.some(x=>n.includes(regleNorm(x))))&&(!r.motif||new RegExp(r.motif).test(n));}

/* ===== Étape 8 : la réponse au professeur, contrôlée ligne par ligne ===== */
const FINS=['bonne journee','bonne soiree','a bientot','merci','merci d\'avance','cordialement','bien a vous','bon week-end','bon weekend'];
const SMS=/(^|[^a-z])(slt|bjr|stp|mrc|tkt|pk|pq|jsp|mdr|ptdr|wsh|bsr|dsl|koi|kan|bcp|tjr|jsuis|chui|svp)(?![a-z])/;
const classeDe=s=>(/(?:^|[\s,:])([12]\s*[a-z]\d?)(?=$|[\s,.;])/i.exec(String(s||''))||[])[1]||'';
function erreursReponse(texte,nom,classe){
 const t=String(texte||'').replace(/\r/g,'');
 const lignes=t.split('\n').map(l=>l.trim()).filter(Boolean);
 const err=[];
 if(lignes.length<4)return ['Écris ta réponse sur plusieurs lignes, comme le modèle : la salutation, tes phrases, la formule de fin, puis ta signature. Passe à la ligne avec la touche Entrée ↵.'];
 if(/\[|\]/.test(t))err.push('Remplace les indications entre crochets [ ] par ton propre texte, et retire les crochets.');
 const sal=lignes[0];
 if(!/^bonjour/i.test(sal))err.push('Commence par la salutation : « Bonjour Monsieur, » ou « Bonjour Madame, ».');
 else if(!/^Bonjour/.test(sal))err.push('« Bonjour » prend une majuscule.');
 else if(!/^Bonjour (monsieur|madame)\b/i.test(sal))err.push('Pour un professeur, écris « Bonjour Monsieur, » ou « Bonjour Madame, ».');
 else if(!/^Bonjour (Monsieur|Madame)\b/.test(sal))err.push('« Monsieur » et « Madame » prennent une majuscule.');
 else if(!/^Bonjour (Monsieur|Madame),/.test(sal))err.push('Mets une virgule juste après « Monsieur » ou « Madame ».');
 else if(!/^Bonjour (Monsieur|Madame),$/.test(sal))err.push('Écris seulement la salutation sur la première ligne, puis passe à la ligne (Entrée ↵).');
 const iFin=lignes.findIndex((l,i)=>i>0&&FINS.includes(norm(l).replace(/[\s!,.]+$/,'')));
 if(iFin<0){err.push('Ajoute une formule de fin seule sur sa ligne, avant ta signature : « Bonne journée, » (ou Merci, Cordialement, À bientôt).');return err;}
 const milieu=lignes.slice(1,iFin);
 const phrases=milieu.join(' ').split(/(?<=[.!?…])\s+/).filter(Boolean);
 if(!/piece jointe|ci-joint/.test(norm(milieu.join(' '))))err.push('Annonce ta fiche : « Voici ma fiche complétée, en pièce jointe. »');
 if(phrases.length<2)err.push('Il faut au moins deux phrases : la pièce jointe, puis la réponse de ta fiche que tu préfères, et pourquoi.');
 for(const p of phrases){if(!/^[A-ZÀ-ÖØ-Þ]/.test(p)){err.push('Chaque phrase commence par une majuscule : « '+p.slice(0,30)+'… ».');break;}}
 for(const p of phrases){if(!/[.!?…]$/.test(p)){err.push('Chaque phrase finit par un point : « …'+p.slice(-30)+' ».');break;}}
 if(milieu.join(' ').length<45)err.push('Ta phrase sur la fiche est trop courte : dis quelle réponse tu préfères, et pourquoi.');
 if(SMS.test(norm(t)))err.push('Pas de langage SMS : écris les mots en entier (s’il vous plaît, bonjour, merci…).');
 const sig=lignes.slice(iFin+1).join(' ');
 if(!sig)err.push('Signe sous la formule de fin : ton prénom, ton nom et ta classe.');
 else{
  const mots=norm(nom).split(/[^a-z0-9'-]+/).filter(Boolean);
  if(mots.length<2)err.push('Écris ton prénom et ton nom dans la case au-dessus : ils servent à vérifier ta signature.');
  else if(!mots.every(m=>norm(sig).split(/[^a-z0-9'-]+/).includes(m)))err.push('Ta signature reprend ton prénom et ton nom : '+String(nom).trim()+'.');
  const c=classe||classeDe(sig);
  if(!c||!norm(sig).replace(/\s/g,'').includes(norm(c).replace(/\s/g,'')))err.push('Ajoute ta classe dans ta signature'+(classe?' : '+classe:'')+', après ton prénom et ton nom.');
 }
 return err;
}

/* ===== Suivi, variantes, stockage ===== */
const APERCU=typeof location!=='undefined'&&/^#bloc=\d+$/.test(location.hash);
const SUIVI=!APERCU&&typeof google!=='undefined'&&!!google.script?.run;
const CLE='messagerie-02-v20261109';
let identite='',classeScolaire='',preuves=null,repriseServeur=0,atteintServeur=0,humeurServeur='',avisServeur=null;
const questionsEleve={},ordreChoix={};
const dejaValide=new Map(),dejaFaux=new Map();
function stockage(){try{return localStorage;}catch(_){try{return sessionStorage;}catch(__){return null;}}}
function sauve(){if(APERCU)return;try{stockage()?.setItem(CLE+identite,JSON.stringify(state));}catch(_){}}
function rpc(n,...args){return new Promise((resolve,reject)=>{google.script.run.withSuccessHandler(resolve).withFailureHandler(()=>reject(new Error('Le suivi ne répond pas. Ta réponse reste ici ; réessaie avant de continuer.')))[n](...args);});}
function envoie(evt){return SUIVI?rpc('noter',COURS,evt):Promise.resolve();}
const melange=a=>{const b=a.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;};
/* La variante de CET élève (donnée par le serveur), sinon la première. */
function question(e){return questionsEleve[e]||preuves?.blocs?.[e]?.[0]||null;}
function choix(e){const q=question(e);if(!q||q.type!=='qcm')return [];if(!ordreChoix[e]||ordreChoix[e].some(c=>!q.c.includes(c)))ordreChoix[e]=APERCU?q.c.slice():melange(q.c);return ordreChoix[e];}
function reponseCourte(e){return e===7?String(state.brouillon||'').trim().slice(0,190):String(state.reponses[e]||'').trim();}
function numeroVariante(e){const q=questionsEleve[e];return q&&preuves?preuves.blocs[e].indexOf(q)+1:1;}
function noteFaux(e,rep){if(!SUIVI)return;envoie({etape:e+1,type:'faux',essais:1,reponse:('v'+numeroVariante(e)+':'+String(rep||'')).slice(0,190)}).catch(()=>{});}
/* Contrôle local, puis le serveur (qui écrit « juste » au journal). */
function erreurLocale(e){
 if(e===7){const err=erreursReponse(state.brouillon,state.nom,classeScolaire);return err.length?err:null;}
 const q=question(e);if(!q)return ['Les questions ne sont pas encore chargées. Recharge la page (F5).'];
 const rep=reponseCourte(e);
 if(!rep)return [q.type==='qcm'?'Choisis une réponse, puis clique sur Vérifier.':'Écris ta réponse, puis clique sur Vérifier.'];
 if(q.type==='qcm'){const k=q.c.indexOf(rep);return k===0?null:[(k>0&&q.p[k])||'Ce n’est pas la bonne réponse. Relis la question.'];}
 return regle(q.regle,rep)?null:[q.faux];
}
async function valideServeur(e){
 const rep=reponseCourte(e),q=question(e);
 if(e===7&&!regle(q.regle,rep))throw new Error(q.faux);
 if(dejaValide.get(e)===rep)return;
 if(dejaFaux.get(e)===rep)throw new Error('Modifie ta réponse avant de la vérifier à nouveau.');
 if(!SUIVI)return;
 const actuel=await rpc('preuve',COURS,e+1);
 if(actuel?.q!==q.q)throw new Error('Le serveur utilise encore les anciens contrôles. Attends quelques minutes puis recharge ; ta réponse est conservée.');
 const r=await rpc('verifier',COURS,e+1,rep,1);
 if(!r?.juste){dejaFaux.set(e,rep);throw new Error(r?.texte||'La réponse n’a pas été validée.');}
 dejaValide.set(e,rep);
}

/* ===== Effets de réussite (comme Messagerie 01) ===== */
let minuterieBravo=null;
function bravo(t,grand){const b=document.getElementById('bravo');if(!b)return;b.textContent=t;b.classList.toggle('grand',!!grand);b.classList.add('vu');clearTimeout(minuterieBravo);minuterieBravo=setTimeout(()=>b.classList.remove('vu'),grand?3200:1800);}
function confettis(n){
 if(typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const couleurs=['#ffcf3f','#287544','#d89b28','#7cc3de','#0086ad','#e8742a'];
 for(let k=0;k<n;k++){const c=document.createElement('span');c.className='confetti';c.setAttribute('aria-hidden','true');c.style.left=Math.random()*100+'vw';c.style.background=couleurs[k%couleurs.length];c.style.animationDelay=(Math.random()*.5)+'s';c.style.animationDuration=(1.2+Math.random())+'s';document.body.append(c);setTimeout(()=>c.remove(),2800);}
}
function animeReussite(e){
 const grand=[8,9].includes(e);
 if(CELEBREES.has(e)){bravo('✓ '+ENCOURAGEMENTS[e][0],false);return;}
 CELEBREES.add(e);bravo((grand?'⭐ ':'📎 ')+'Étape '+(e+1)+' réussie : « '+TITRES[e]+' » !',grand);confettis(grand?60:30);
}

/* ===== Contenu des étapes ===== */
function nomProf(){const c=String(classeScolaire||'').replace(/\s/g,'').toUpperCase();if(/^2E/.test(c))return 'Michiels';if(c)return 'Louviaux';return 'Louviaux (2B, 2F) ou Michiels (2E)';}
function salutProf(){const c=String(classeScolaire||'').replace(/\s/g,'').toUpperCase();if(/^2E/.test(c))return 'Bonjour Madame,';if(c)return 'Bonjour Monsieur,';return 'Bonjour Monsieur, (2E : Bonjour Madame,)';}
const gestes=(l,debut=1)=>`<ol class="gestes" start="${debut}">`+l.map(t=>`<li><label><input type="checkbox"><span>${t}</span></label></li>`).join('')+'</ol>';
const coince=l=>`<details class="coince"><summary>Ça coince ?</summary><ul>${l.map(([q,r])=>`<li><b>${q}</b> ${r}</li>`).join('')}</ul><p class="note">Toujours bloqué ? Relis l’étape, demande à ton voisin (il explique, il ne touche pas ta souris), puis sonne la cloche 🔔 en haut à droite et continue ce que tu peux.</p></details>`;
const reel='<p class="reel">À partir d’ici, <b>tout est réel</b> : tu travailles dans Outlook, avec le message de ton professeur. Garde deux onglets : cette fiche et Courrier.</p>';
const COTE=()=>`<aside class="mission cote"><b>⚠ Ta réponse au professeur est cotée sur 5</b><ol><li>C’est une <b>réponse</b> à son message (bouton Répondre) : l’objet commence par <b>RE:</b>.</li><li>Ta fiche <b>complétée</b> est <b>jointe</b> : sa carte est sous l’objet.</li><li>Le texte commence par « <b>${escapeHtml(salutProf())}</b> ».</li><li>Des <b>phrases complètes</b>, avec une majuscule et un point ; pas de langage SMS.</li><li>Le message finit par ton <b>prénom</b>, ton <b>nom</b> et ta <b>classe</b>.</li></ol></aside>`;
const FINI='<aside class="mission fini" id="fini-avant"><b>🏁 Tu as fini avant les autres ? Dans l’ordre :</b><ol><li>Donne ton avis, juste en dessous : trois phrases courtes.</li><li>Ajoute ton voisin dans tes contacts : Outlook ▸ colonne de gauche ▸ icône <b>Contacts</b> (une fenêtre de bienvenue ? ▸ <b>Ignorer</b>) ▸ <b>Nouveau contact</b> ▸ Prénom, Nom de famille, Adresse e-mail professionnelle ▸ <b>Enregistrer</b>.</li><li>Révise avec « Je réponds et je joins — je révise » : <a href="https://root75.github.io/campin-public/messagerie-2/" target="_blank" rel="noopener">ouvrir la page ↗</a>. Fais le quiz, puis retourne les cartes.</li><li>Si ton professeur te le propose, deviens <b>aidant</b> : va voir un camarade qui a sonné la cloche 🔔. Tu expliques avec des mots, tu ne touches pas sa souris.</li></ol></aside>';
function carteMail(t){const m={};String(t).split(' · ').forEach(p=>{const i=p.indexOf(' : ');if(i>0)m[p.slice(0,i)]=p.slice(i+3);});return `<span class="mini-mail"><span><b>De :</b> ${escapeHtml(m['De']||t)}</span>${m['Objet']?`<span><b>Objet :</b> ${escapeHtml(m['Objet'])}</span>`:''}${m['Pièce jointe']?`<span class="pj">📎 ${escapeHtml(m['Pièce jointe'])}</span>`:''}</span>`;}
function widgetPreuve(e){
 const q=question(e);if(!q)return '<p class="retour faux">La question n’a pas pu se charger. Recharge la page (F5) : ton travail validé est gardé.</p>';
 if(q.type==='saisie')return `<div class="preuve"><label for="preuve">✍️ ${escapeHtml(q.q)}</label>${q.aide?`<p class="aide-champ">${escapeHtml(q.aide)}</p>`:''}<input id="preuve" type="text" maxlength="120" autocomplete="off"></div>`;
 const rep=state.reponses[e]||'';
 return `<fieldset class="preuve"><legend>✍️ ${escapeHtml(q.q)}</legend>${q.aide?`<p class="aide-champ">${escapeHtml(q.aide)}</p>`:''}<div class="choix${e===0?' mails':''}">`+choix(e).map((c,i)=>`<label class="un-choix"><input type="radio" name="choix" value="${escapeHtml(c)}"${c===rep?' checked':''}><span>${e===0?carteMail(c):escapeHtml(c)}</span></label>`).join('')+`</div><p class="note">Ton voisin a peut-être une autre question que toi : c’est normal. Explique-lui, ne lui donne pas ta réponse.</p></fieldset>`;
}
function contenu(e){
 const d=`<p class="duree">⏱ ${MIN[e]} min · ${PARTIE(e)}</p>`;
 if(e===0)return d+`<p>Une pièce jointe, c’est un document glissé dans l’enveloppe. Avant de l’ouvrir, on regarde l’enveloppe.</p><aside class="mission regle"><b>⭐ La règle de la leçon</b><p>Avant d’ouvrir une pièce jointe, je regarde <b>QUI</b> l’envoie et <b>QUEL</b> fichier c’est. Un inconnu, une adresse mal écrite, un fichier inattendu en <b>.exe</b> ou <b>.zip</b> : je n’ouvre pas, je sonne la cloche 🔔 et je montre à mon professeur.</p></aside>`+gestes(['Lis les quatre messages ci-dessous.','Regarde l’adresse après « De : », lettre par lettre.','Regarde la fin du nom du fichier, après le point.','Clique sur le message qu’il ne faut <b>pas</b> ouvrir.','Clique sur <b>Vérifier</b>.'])+widgetPreuve(e)+coince([['.docx, .pdf, .pptx ?','Un document Word, un PDF, une présentation : des fichiers de cours, normaux s’ils sont attendus.'],['.exe, .zip ?','.exe est un programme qui s’installe ; .zip est un paquet fermé de fichiers. D’un inconnu : on n’ouvre jamais.'],['L’école, c’est quoi ?','Les adresses de l’école finissent par <b>@arcampin.be</b>. Une seule lettre change, et ce n’est plus l’école.']]);
 if(e===1)return d+`<p>Trois boutons, trois destinataires différents. Lis le tableau, puis réponds.</p><table class="lettre"><tr><th>Bouton</th><th>Pour une lettre</th><th>Qui reçoit ?</th></tr><tr><td><b>↩ Répondre</b></td><td>je réponds à celui qui m’a écrit</td><td>l’expéditeur, seul</td></tr><tr><td><b>↩↩ Répondre à tous</b></td><td>je réponds à tous ceux qui ont reçu la lettre</td><td>l’expéditeur et tous les autres destinataires</td></tr><tr><td><b>↪ Transférer</b></td><td>je fais suivre la lettre à quelqu’un d’autre</td><td>la personne que je choisis ; la pièce jointe part avec</td></tr></table>`+gestes(['Lis la situation.','Demande-toi : qui doit recevoir mon message ?','Clique sur le bon bouton.','Clique sur <b>Vérifier</b>.'])+widgetPreuve(e)+coince([['Répondre ou Répondre à tous ?','Presque toujours <b>Répondre</b>. Répondre à tous seulement si tout le monde doit lire ta réponse : si le message a été envoyé à toute la classe, toute la classe la lit !']]);
 if(e===2)return d+reel+`<p>Ton professeur t’a envoyé un message « <b>Ta fiche à compléter</b> », avec une pièce jointe.</p><p><a class="bouton" href="${OUTLOOK}" target="_blank" rel="noopener">Ouvrir Courrier ↗</a></p>`+gestes(['Ouvre Courrier : le bouton ci-dessus, ou barre de favoris ▸ <b>Favoris du domaine arcampin.com</b> ▸ <b>Microsoft 365</b> ▸ <b>Courrier</b>.','À gauche, clique sur <b>Boîte de réception</b>.','Clique sur le message « <b>Ta fiche à compléter</b> » de ton professeur.','Regarde l’expéditeur : son adresse finit-elle par <b>@arcampin.be</b> ?','Regarde la carte du fichier, sous l’objet : son nom finit-il par <b>.docx</b> ?','Les deux sont bons ? Continue. Un doute : n’ouvre pas, sonne la cloche 🔔.'])+widgetPreuve(e)+coince([['Je ne trouve pas le message.','Regarde l’onglet <b>Autres</b>, au-dessus de la liste des messages. Ou tape le nom de ton professeur dans <b>Rechercher</b>, tout en haut.'],['Je ne vois pas l’adresse.','Clique sur le nom du professeur, en haut du message : son adresse complète s’affiche.']]);
 if(e===3)return d+`<p>Tu ouvres la fiche pour la compléter. Outlook en garde une copie dans ton OneDrive, ton classeur de l’école en ligne.</p>`+gestes(['Passe la souris sur la carte du fichier, sous l’objet.','Clique sur la petite flèche <b>▾</b>, à droite de la carte.','Clique sur <b>Modifier dans le navigateur</b>.','Un nouvel onglet s’ouvre : <b>Word</b>, le traitement de texte de Microsoft (comme Docs).','Word te demande de te connecter ? Ton adresse de l’école, puis ton mot de passe.'])+`<p class="note">Dans Courrier, sous la carte, Outlook écrit maintenant <b>Enregistré sur OneDrive</b> : ta fiche est rangée dans <b>OneDrive › Pièces jointes</b>.</p>`+widgetPreuve(e)+coince([['Je ne vois pas la flèche ▾.','Passe la souris sur la carte du fichier : la flèche apparaît à droite.'],['Un aperçu s’ouvre, mais je ne peux pas écrire.','Ferme l’aperçu, puis utilise la flèche ▾ ▸ <b>Modifier dans le navigateur</b>.']]);
 if(e===4)return d+`<p>Tu es dans Word. La fiche a un tableau : à gauche la question, à droite ta réponse.</p>`+gestes(['Clique dans la première case de droite du tableau.','Tape ta réponse : une phrase, avec une majuscule au début et un point à la fin.','Passe à la case suivante : clic dans la case, ou touche <b>Tab ⇥</b>.','Remplis les cinq cases.','N’enregistre rien : Word enregistre tout seul, comme Docs.'])+widgetPreuve(e)+coince([['Je ne peux pas écrire dans la fiche.','Tu es peut-être dans l’aperçu. Retourne dans Courrier et refais l’étape 4 : flèche ▾ ▸ <b>Modifier dans le navigateur</b>.'],['Je ne sais pas quoi répondre.','Une réponse simple suffit. Tu peux inventer : ce qui compte ici, c’est la phrase bien écrite.']]);
 if(e===5)return d+`<p>Tu réponds à celui qui t’a écrit, et à lui seul.</p>`+gestes(['En haut de Chrome, clique sur l’onglet <b>Courrier</b>.','Le message de ton professeur est encore ouvert.','Clique sur <b>↩ Répondre</b> (touche R) : sous le message, ou l’icône en haut à droite du message. Pas « Répondre à tous ».','Regarde : la ligne À porte déjà le nom de ton professeur ; l’objet est déjà rempli.','N’écris rien pour l’instant : tu joins d’abord ta fiche.'])+widgetPreuve(e)+coince([['J’ai cliqué sur Répondre à tous.','Ferme ta réponse (elle va dans <b>Brouillons</b>), puis recommence avec <b>Répondre</b>.'],['La ligne À est vide.','Tu as cliqué sur Nouveau message. Ferme-le, rouvre le message de ton professeur, puis <b>Répondre</b>.']]);
 if(e===6)return d+`<p>Ta fiche complétée doit partir avec ta réponse.</p>`+gestes(['Dans ta réponse, clique sur l’onglet <b>Message</b> du ruban, en haut.','Clique sur le trombone <b>📎 Joindre un fichier</b> ▸ <b>OneDrive</b>.','Le sélecteur s’ouvre sur <b>Récents</b> : coche « <b>Ma fiche a completer</b> ».','En bas, clique sur la petite flèche <b>▾</b> à côté de <b>Partager le lien</b> ▸ <b>Joindre</b>.','Regarde : la carte de ta fiche apparaît sous l’objet. 🛑 Pas de carte ? Ne continue pas.'])+widgetPreuve(e)+coince([['Ma fiche n’est pas dans Récents.','À gauche du sélecteur : <b>Fichiers</b> ▸ <b>Pièces jointes</b> ▸ Ma fiche a completer.'],['Joindre est grisé.','Coche <b>un seul</b> fichier : ta fiche.'],['Ma fiche part comme un lien.','Retire-la de ta réponse (✕ sur la carte), puis recommence en choisissant bien <b>Joindre</b>, pas Partager le lien.']]);
 if(e===7)return d+`<p>Prépare ta réponse <b>ici</b> : la fiche vérifie la forme avant que tu l’envoies. Ensuite, tu la copies dans Outlook.</p><div class="modele"><span class="tag">Modèle</span><p>${escapeHtml(salutProf())}
Voici ma fiche complétée, en pièce jointe.
[Une phrase : la réponse de ma fiche que je préfère, et pourquoi.]
Bonne journée,
[Prénom Nom], [classe]</p></div>`+COTE()+`<label for="nom">Ton prénom et ton nom</label><p class="aide-champ">Ils servent à vérifier ta signature.</p><input id="nom" type="text" maxlength="80" autocomplete="name">`+(classeScolaire?`<p class="note">Ta classe : <b>${escapeHtml(classeScolaire)}</b>.</p>`:'')+`<label for="brouillon">Ta réponse</label><p class="aide-champ">Une ligne pour la salutation, tes phrases, une ligne pour la formule de fin, une ligne pour ta signature. Passe à la ligne avec Entrée ↵.</p><textarea id="brouillon" rows="8" maxlength="700"></textarea>`+gestes(['Écris ta réponse dans la case, en suivant le modèle.','Clique sur <b>Vérifier</b> et corrige ce qui est signalé.','Clique sur <b>📋 Copier ma réponse</b> (ou sélectionne le texte, puis Ctrl+C).','Onglet <b>Courrier</b> ▸ clique dans la zone blanche de ta réponse, <b>au-dessus</b> du message de ton professeur.','Colle : <b>Ctrl+V</b> (ou clic droit ▸ Coller).','<b>N’envoie pas encore</b> : tu relis à l’étape suivante.'])+`<p><button type="button" class="secondaire" id="copier">📋 Copier ma réponse</button> <span id="copie-ok" role="status"></span></p>`+coince([['Le texte collé n’a pas les mêmes lignes.','Ce n’est pas grave : remets les retours à la ligne avec Entrée ↵ dans Outlook.'],['Bonjour Monsieur ou Madame ?','Ton professeur est un homme : Monsieur. Une femme : Madame. Toujours avec une majuscule et une virgule.']]);
 if(e===8)return d+`<p>Une réponse envoyée ne se reprend pas : relis-la dans Outlook avec les cinq points.</p>`+COTE()+gestes(['Relis ta réponse dans Outlook, point par point.','Clique sur <b>Envoyer</b>.','À gauche, clique sur <b>Éléments envoyés</b>.','Ta réponse est en haut de la liste, avec le petit trombone 📎 : ta fiche est partie.','Pas là ? Regarde dans <b>Brouillons</b> : elle n’est pas partie. Ouvre-la, puis Envoyer.'])+widgetPreuve(e)+coince([['Ma réponse est partie sans la fiche.','Écris une nouvelle réponse au même message : <b>Répondre</b>, joins la fiche (étape 7), une phrase « Voici ma fiche, oubliée dans mon premier message. », ta signature, Envoyer.']]);
 if(e===9)return d+`<p>Tu fais suivre le message de ton professeur à ton voisin, avec la fiche. Ton professeur est <b>en copie (Cc)</b> : il voit que tu sais transférer. Ce transfert n’est pas coté.</p>`+gestes(['À gauche, <b>Boîte de réception</b> ▸ ouvre le message « Ta fiche à compléter ».','Clique sur <b>↪ Transférer</b> (touche Maj+F) : sous le message, ou l’icône en haut à droite du message.','Dans <b>À</b>, tape le nom de ton voisin ▸ clique sur la ligne qui finit par <b>@arcampin.be</b>.',`Dans <b>Cc</b>, tape le nom de ton professeur : <b>${nomProf()}</b> ▸ clique sur la ligne qui finit par <b>@arcampin.be</b>.`,'Au-dessus du message, écris : « Bonjour » et le prénom de ton voisin, puis « Voici la fiche que nous avons reçue. », puis ton prénom.','Vérifie : l’objet commence par <b>TR:</b> et la carte de la fiche est là.','Clique sur <b>Envoyer</b>.'])+widgetPreuve(e)+coince([['Le nom de mon voisin ne s’affiche pas.','Tape son adresse en entier : prenom.nom@arcampin.be. Vérifie-la avec lui.'],['Outlook propose plusieurs lignes pour mon professeur.','Choisis celle qui finit par <b>@arcampin.be</b>. Pas « Externe », pas @arcampin.com.']]);
 return '';
}
function render(){
 const e=state.etape;
 document.getElementById('compteur').textContent=`${e+1} / ${NB} — ${TITRES[e]}`;
 document.getElementById('barre').value=e+1;
 const z=document.getElementById('contenu');
 let h=`<div class="mode-action"><b>À TOI D’AGIR</b> · Une case par geste : coche-la quand c’est fait, puis clique sur Vérifier.</div><h2>${e+1}. ${TITRES[e]}</h2>`+contenu(e);
 h+='<div id="retour" role="status" aria-live="polite" tabindex="-1"></div>';
 if(e===NB-1&&state.atteint>=NB)h+=FINI;
 h+='<div class="actions">'+(e>0?'<button type="button" class="secondaire" id="precedent">← Revenir</button>':'')+(e<NB-1&&state.atteint>e?'<button type="button" class="secondaire" id="avancer">Étape suivante →</button>':'')+'<button type="button" id="suivant">Vérifier</button></div>';
 z.innerHTML=h;
 const preuve=document.getElementById('preuve');
 if(preuve){preuve.value=state.reponses[e]||'';preuve.addEventListener('input',()=>{state.reponses[e]=preuve.value;sauve();efface();});}
 for(const r of z.querySelectorAll('input[name="choix"]'))r.addEventListener('change',()=>{state.reponses[e]=r.value;sauve();efface();});
 for(const k of ['nom','brouillon']){const el=document.getElementById(k);if(el){el.value=state[k]||'';el.addEventListener('input',()=>{state[k]=el.value;sauve();efface();});}}
 document.getElementById('copier')?.addEventListener('click',copier);
 document.getElementById('precedent')?.addEventListener('click',()=>{state.etape--;sauve();render();});
 document.getElementById('avancer')?.addEventListener('click',()=>{state.etape++;sauve();render();});
 document.getElementById('suivant').addEventListener('click',()=>verifie(e));
 window.majCloche?.();
}
function efface(){const f=document.getElementById('retour');if(f){f.innerHTML='';f.className='';}}
async function copier(){
 const t=String(state.brouillon||''),ok=document.getElementById('copie-ok');
 try{await navigator.clipboard.writeText(t);ok.textContent='✓ Copié. Colle dans Outlook : Ctrl+V.';}
 catch(_){const a=document.getElementById('brouillon');a.select();try{document.execCommand('copy');ok.textContent='✓ Copié. Colle dans Outlook : Ctrl+V.';}catch(__){ok.textContent='Sélectionne le texte, puis Ctrl+C.';}}
}
async function verifie(e){
 const bouton=document.getElementById('suivant');if(bouton.disabled)return;
 const feedback=document.getElementById('retour');
 const err=erreurLocale(e);
 if(err){noteFaux(e,reponseCourte(e));feedback.className='retour faux';feedback.innerHTML='<b>À corriger</b><ul>'+err.map(x=>`<li>${escapeHtml(x)}</li>`).join('')+'</ul>';feedback.focus();return;}
 bouton.disabled=true;const empreinte=reponseCourte(e);
 try{await valideServeur(e);}
 catch(error){feedback.className='retour faux';feedback.textContent=error.message;feedback.focus();bouton.disabled=false;return;}
 bouton.disabled=false;
 if(empreinte!==reponseCourte(e)){feedback.textContent='Ta réponse a changé pendant la vérification. Vérifie à nouveau.';return;}
 state.atteint=Math.max(state.atteint,e+1);sauve();
 const [t1,t2]=ENCOURAGEMENTS[e];
 feedback.className='retour juste';feedback.innerHTML='<b>✓ '+escapeHtml(t1)+'</b><p>'+escapeHtml(t2)+'</p>';
 animeReussite(e);
 if(SUIVI)window.eteintCloche?.('Étape validée : ma cloche est éteinte.');
 if(e===NB-1){
  if(!document.getElementById('fini-avant'))feedback.insertAdjacentHTML('afterend',FINI);
  if(typeof PhraseFin!=='undefined'&&!document.querySelector('.citation')){const f=PhraseFin.figure(CITATION);if(f)feedback.after(f);}
  if(SUIVI)envoie({etape:NB,type:'fini'}).catch(()=>feedback.append(document.createTextNode(' La fin n’a pas pu être enregistrée : recharge avant de quitter.')));
  avisFin();feedback.focus();return;
 }
 const b=document.createElement('button');b.type='button';b.textContent='Continuer →';
 b.addEventListener('click',()=>{state.etape=e+1;sauve();render();window.scrollTo?.(0,0);});
 feedback.append(b);b.focus();
}

/* ===== Humeur, avis, démarrage ===== */
function zoneHA(id,debut){let z=document.getElementById(id);if(!z){z=document.createElement('div');z.id=id;z.hidden=true;const ind=document.getElementById('individuel');debut?ind.prepend(z):ind.append(z);}return z;}
function humeurDuJour(){if(APERCU||typeof HumeurAvis==='undefined')return;HumeurAvis.humeur(zoneHA('humeur',true),{valeur:humeurServeur,suivi:!!SUIVI,envoie:v=>envoie({etape:0,type:'humeur',reponse:v}).then(()=>{humeurServeur=v;})});}
function avisFin(){if(APERCU||typeof HumeurAvis==='undefined')return;HumeurAvis.avis(zoneHA('avis-fin',false),{valeur:avisServeur,suivi:!!SUIVI,envoie:a=>Promise.all(HumeurAvis.AVIS.map(([k])=>envoie({etape:NB,type:'avis-'+k,reponse:a[k]}))).then(()=>{avisServeur=a;})});}
function montreIndividuel(oui){document.getElementById('collectif').hidden=oui;document.getElementById('individuel').hidden=!oui;document.getElementById('revoir-collectif').hidden=!oui;}
async function demarre(){
 const status=document.getElementById('suivi-status');
 try{
  const r=await fetch('https://root75.github.io/campin-public/messagerie-2/pas-a-pas/preuves.json?v=20261109');if(!r.ok)throw Error();preuves=await r.json();
  if(SUIVI){
   const etat=await rpc('etat',COURS);identite=':'+etat.email;classeScolaire=String(etat.classe||'').trim();repriseServeur=Number(etat.reprise)||0;atteintServeur=Math.min(NB,Number(etat.atteint)||0);humeurServeur=etat.humeur||'';avisServeur=etat.avis||null;
   status.textContent='Suivi professeur connecté : tes étapes et ta cloche sont transmises.';await envoie({etape:0,type:'ouvert'});
   await Promise.all(preuves.blocs.map(async(l,e)=>{if(l.length<2)return;try{const a=await rpc('preuve',COURS,e+1);const v=(a&&l[a.v-1]?.q===a.q)?l[a.v-1]:l.find(x=>x.q===a?.q);if(v){questionsEleve[e]=v;if(a.c)ordreChoix[e]=a.c;}}catch(_){}}));
  }else status.innerHTML='Entraînement libre : rien n’est transmis au professeur. Pour la séance suivie, <a href="https://script.google.com/a/macros/arcampin.be/s/AKfycbyOPTaq-L1PuittB1rkkiL9OOtShFc2WpiD8H_pH_INaw9ePWenCzhlIPlHu4zBOgLk/exec">ouvre ta séance scolaire</a>.';
  try{const saved=JSON.parse(stockage()?.getItem(CLE+identite)||'null');if(saved&&Number.isInteger(saved.etape)&&saved.etape>=0&&saved.etape<NB){
   if(!SUIVI||Number(saved.reprise||0)===repriseServeur)Object.assign(state,saved);
   else Object.assign(state,saved,{etape:0,atteint:0});}
   state.reprise=repriseServeur;}catch(_){}
  if(SUIVI&&atteintServeur>state.atteint){state.atteint=atteintServeur;state.etape=Math.min(NB-1,atteintServeur);}
  if(!APERCU&&state.atteint>0)montreIndividuel(true);
  if(APERCU){Object.assign(state,JSON.parse(JSON.stringify(INITIAL)));state.atteint=NB;state.etape=Math.min(NB-1,Math.max(0,Number(location.hash.slice(6))-1));montreIndividuel(true);status.textContent='Aperçu du professeur : navigation libre, aucun résultat enregistré.';}
  render();humeurDuJour();if(state.atteint>=NB||avisServeur)avisFin();document.body.dataset.pret='1';
 }catch(e){status.textContent='Impossible de charger les questions ou le suivi. Recharge la page (F5) ; aucun résultat n’est annoncé comme enregistré.';render();}
 document.getElementById('demarrer-individuel').onclick=()=>montreIndividuel(true);
 document.getElementById('revoir-collectif').onclick=()=>montreIndividuel(false);
 /* La cloche 🔔 : relire, le voisin, puis je sonne et je continue. Le professeur la voit au tableau. */
 let aide=false,aideEtape=0,minuterieInfo=null;
 const zoneAide=document.getElementById('aide'),btnAide=document.getElementById('bloque'),texteAide=document.getElementById('aide-bloque');
 function cloche(info){
  clearTimeout(minuterieInfo);if(info)minuterieInfo=setTimeout(()=>cloche(),6000);
  zoneAide.classList.toggle('active',aide);zoneAide.classList.toggle('info',!!info&&!aide);
  texteAide.textContent=info||(aide?'J’attends de l’aide (étape '+aideEtape+'). Je continue ailleurs. Débloqué ? Je re-clique.':'Relu ? Demandé au voisin ? Alors je sonne.');
  const mot=aide?'Je me suis débloqué':'Je bloque à l’étape '+(state.etape+1);
  btnAide.replaceChildren('🔔',Object.assign(document.createElement('span'),{className:'mot',textContent:mot}));btnAide.setAttribute('aria-label',mot);btnAide.title=aide?mot:'J’ai relu, demandé au voisin ? Je sonne.';
 }
 window.majCloche=()=>{if(!zoneAide.classList.contains('info'))cloche();};
 window.eteintCloche=info=>{if(!aide)return;aide=false;cloche(info);};
 btnAide.onclick=async function(){
  this.disabled=true;
  try{if(SUIVI){const etape=aide?aideEtape:state.etape+1;await envoie({etape,type:aide?'aide-fin':'aide'});aide=!aide;aideEtape=etape;cloche();}
   else cloche('Entraînement libre : la cloche n’est pas transmise. Appelle le professeur.');}
  catch(_){cloche('Cloche non transmise. Réessaie ou appelle le professeur.');}
  finally{this.disabled=false;}
 };
 cloche();
 if(SUIVI){
  const relit=()=>{if(!aide||document.hidden)return;google.script.run.withSuccessHandler(r=>{if(r?.active===false)window.eteintCloche('Le professeur a réinitialisé ma cloche. Je peux sonner à nouveau.');}).withFailureHandler(()=>{}).etatAide(COURS);};
  google.script.run.withSuccessHandler(r=>{if(r?.active===true){aide=true;aideEtape=state.etape+1;cloche();}}).withFailureHandler(()=>{}).etatAide(COURS);
  setInterval(relit,15000);document.addEventListener('visibilitychange',relit);
  window.PAS_A_PAS={cours:COURS,envoie};window.PasAPasSequence?.suivre(window.PAS_A_PAS);
 }
}
if(typeof module!=='undefined')module.exports={erreursReponse,regle,regleNorm,TITRES,MIN,NB,state,question,erreurLocale,reponseCourte,set preuves(p){preuves=p;}};
if(typeof document!=='undefined')demarre();
