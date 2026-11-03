'use strict';
const INITIAL={etape:0,a:'',objet:'',salutation:'',message:'',fin:'',signature:'',nom:'',classe:'',locale:'',domaine:'',reponse:'',erreur1:'',erreur2:'',erreur3:'',preuve:'',atteint:0};
const state={...INITIAL};
const CELEBREES=new Set();
const ENCOURAGEMENTS=[
 ['Bien repéré !','Tu distingues la partie locale et le domaine.'],
 ['Bien joué !','Tu as écrit l’adresse exacte du destinataire.'],
 ['Un titre qui donne le sujet !','Ton objet annonce les loisirs sans contenir tout le message.'],
 ['Bien choisi !','Une seule salutation pour commencer le message.'],
 ['Ta demande prend forme !','Relis ta phrase : Camille comprend-elle ce que tu demandes ?'],
 ['Bien présenté !','La formule de fin et la signature sont en place.'],
 ['Ton mail est construit !','L’adresse, l’objet et les parties du corps sont en place. Relis ta demande avant la suite.'],
 ['Ta réponse est préparée !','Tu as préparé les parties de ta réponse. Explique au professeur comment tu réponds à la question de Camille.'],
 ['Bon repère !','Tu sais nommer l’expéditeur. Montre maintenant son nom dans Outlook.'],
 ['Tu as trouvé la bonne zone !','Le texte s’écrit dans le corps du message. Vérifie ton écran Outlook.'],
 ['Tu sais où vérifier !','Retrouve réellement ton email dans Éléments envoyés avant de continuer.'],
 ['Bravo pour ce parcours !','Montre les messages envoyés et reçus au professeur pour la vérification réelle.']
];
function animeReussite(zone,etape){
 if(CELEBREES.has(etape))return;
 CELEBREES.add(etape);
 if(typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 if(!document.getElementById('style-reussites')){
  const css=document.createElement('style');css.id='style-reussites';css.textContent=`
.retour.juste{position:relative;isolation:isolate}
.reussite-animee{animation:reussite-entree .28s ease-out}
.confettis-reussite{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:-1;border-radius:inherit}
.confettis-reussite i{position:absolute;top:-12px;left:var(--x);width:7px;height:11px;background:var(--couleur);border-radius:2px;opacity:0;animation:confetti-leger 1.1s var(--delai) ease-out forwards}
@keyframes reussite-entree{from{transform:translateY(5px);opacity:.5}to{transform:translateY(0);opacity:1}}
@keyframes confetti-leger{10%{opacity:.8}to{transform:translate(12px,150px) rotate(180deg);opacity:0}}
@media(prefers-reduced-motion:reduce){.reussite-animee,.confettis-reussite i{animation:none!important}.confettis-reussite{display:none}}
`;document.head.append(css);
 }
 zone.classList.add('reussite-animee');
 if(![6,11].includes(etape))return;
 const confettis=document.createElement('span');confettis.className='confettis-reussite';confettis.setAttribute('aria-hidden','true');
 const couleurs=['#197a70','#cd8a16','#4766a9'];
 for(let i=0;i<15;i++){const c=document.createElement('i');c.style.setProperty('--x',(5+(i*31)%91)+'%');c.style.setProperty('--couleur',couleurs[i%3]);c.style.setProperty('--delai',(i%5)*.07+'s');confettis.append(c);}
 zone.append(confettis);setTimeout(()=>confettis.remove(),1600);
}
const DEST='camille.martin@example.org';
const TITRES=['Observer un email','Choisir le destinataire','Donner un objet','Saluer','Rédiger la demande','Terminer et signer','Relire le mail complet','Répondre au message reçu','Ouvrir et lire dans Outlook','Rédiger dans le corps du message','Envoyer et retrouver son mail','Répondre à son camarade'];
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’]/g,"'").replace(/\s+/g,' ').trim();
const classeSignature=d=>d.classe.trim()||(/(?:^|[\s,:])([12]\s*[a-z](?:\d)?)(?=$|[\s,.;])/i.exec(d.signature.trim())?.[1]||'');
const escapeHtml=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function verifie(k,d=state){
 const v=norm(d[k]);
 if(k==='erreur1')return /arobase|@/.test(v)&&/manqu|absen|ajout|oubli/.test(v)?'':'Explique quel séparateur manque entre camille.martin et example.org.';
 if(k==='erreur2')return /espace/.test(v)&&/retir|supprim|enlev|interdit|pas|trop/.test(v)?'':'Repère le caractère ajouté au milieu de l’adresse et indique ce qu’il faut en faire.';
 if(k==='erreur3')return /domaine|example.net|\.net/.test(v)&&/different|autre|attendu|example.org|\.org|remplac|mauvais/.test(v)?'':'Cette adresse a une structure plausible, mais compare son domaine à example.org, celui de Camille.';
 if(k==='locale')return v==='camille.martin'?'':'La partie locale est ce qui se trouve avant @ : elle identifie la boîte dans ce domaine.';
 if(k==='domaine')return v==='example.org'?'':'Le domaine est ce qui se trouve après @. Ici, recopie example.org.';
 if(k==='reponse'){if(v.length<35||!/bonjour|salut|bonsoir/.test(v)||!/loisir|sport|activite|pratique|aime|joue|lecture|lire|musique|dessin|danse|anime/.test(v)||!/bonne journee|a bientot|merci|cordialement|bonne soiree/.test(v))return 'Rédige une réponse complète : une salutation, une phrase sur ton propre loisir, une formule de fin et ta signature.';const mots=norm(d.nom).split(/[^a-z0-9'-]+/).filter(Boolean);
 if(!mots.length)return 'Reviens au bloc 6 pour renseigner ton prénom et ton nom.';
 if(!mots.every(m=>v.split(/[^a-z0-9'-]+/).includes(m)))return 'Dans ta signature, reprends le prénom et le nom du bloc 6 : '+d.nom.trim()+'.';
 const classe=classeSignature(d);
 if(!classe)return 'Reviens au bloc 6 pour ajouter ta classe dans ta signature.';
 if(!v.replace(/\s/g,'').includes(norm(classe).replace(/\s/g,'')))return 'Dans ta signature, reprends la classe du bloc 6 : '+classe+'.';
 return ''; }
 if(k==='a')return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.a.trim())&&d.a.trim().toLowerCase()===DEST ? '' : 'Écris l’adresse de Camille indiquée dans la mission. Vérifie chaque lettre : un @ et une adresse plausible ne suffisent pas.';
 if(k==='objet'){
  if(!v)return 'Ajoute un titre qui annonce le sujet.';
  if(/[\r\n]/.test(d.objet)||d.objet.length>80||/bonjour|merci|cordialement|\?/.test(v))return 'Garde un titre court dans Objet. La salutation et la demande vont dans le message.';
  return /\b(loisir|loisirs|sport|sports|activite|activites|passion|passions)\b/.test(v) ? '' : 'L’objet doit annoncer les loisirs. Un prénom seul, « Bonjour » ou « Mon message » ne suffit pas.';
 }
 if(k==='salutation')return /^(bonjour|salut|bonsoir)( camille)?[!,.:]?$/i.test(v) ? '' : 'Adresse-toi une seule fois à Camille, par exemple Bonjour Camille,. Retire les variantes et les consignes entre parenthèses.';
 if(k==='message'){
  if(/\[|\]|\b(ma reponse|ta reponse|ton texte|votre texte)\b/.test(v))return 'Remplace les indications du modèle par ta propre demande.';
  if(d.message.length>190)return 'Garde une demande courte : une ou deux phrases, jusqu’à 190 caractères.';
  if(v.length<25)return 'Écris une demande complète : demande quel loisir Camille pratique.';
  if(!/\b(loisir|loisirs|sport|sports|activite|activites|passion|passions)\b/.test(v))return 'Ta demande doit parler du sport ou des loisirs de Camille.';
  
  if(!/\?|\b(peux|pourrais|quelle|quel|dis|proposes|proposer|voudrais|souhaites|aimerais)\b/.test(v))return 'Formule une demande adressée à Camille, plutôt qu’une simple affirmation.';
  if(!/[.!?…]$/.test(d.message.trim()))return 'Termine ta phrase par une ponctuation.';
  if(!/^[A-ZÀ-ÖØ-Þ]/.test(d.message.trim()))return 'Commence ta phrase par une majuscule.';
  return '';
 }
 if(k==='fin')return /^(bonne journee|bonne soiree|a bientot|merci|merci d'avance|cordialement|bien a toi|bien a vous|bon week.end)[\s!,.]*$/.test(v)?'':'Ajoute une formule de fin adaptée, par exemple Bonne journée, ou À bientôt,.';
 if(k==='signature'){
  if(!d.nom.trim()||d.nom.trim().split(/\s+/).length<2)return 'Renseigne ton prénom et ton nom au-dessus de la signature.';
  if(!/^[12]\s*[a-z](?:\d)?$/i.test(classeSignature(d)))return 'Ajoute ta classe dans ta signature, après ton prénom et ton nom.';
  if(/\[|\]|\b(prenom|classe|signature)\b/.test(v))return 'Écris tes informations dans la signature, sans conserver les indications du modèle.';
  const mots=norm(d.nom).split(/[^a-z0-9'-]+/).filter(Boolean);
  const sigTokens=v.split(/[^a-z0-9'-]+/).filter(Boolean);
  return mots.every(m=>sigTokens.includes(m))&&v.replace(/\s/g,'').includes(norm(classeSignature(d)).replace(/\s/g,''))?'':'La signature doit contenir ton prénom, ton nom et ta classe.';
 }
 return '';
}
const corps=d=>[d.salutation,d.message,d.fin,d.signature].join('\n\n');
const erreurs=d=>['a','objet','salutation','message','fin','signature'].map(k=>({champ:k,texte:verifie(k,d)})).filter(x=>x.texte);
function champ(k,label,help,area=false){return `<label for="${k}">${label}</label>${help?`<p class="aide-champ" id="aide-${k}">${help}</p>`:''}<${area?'textarea':'input'} id="${k}" name="${k}" ${area?'rows="4"':'type="text"'} maxlength="${['message','reponse'].includes(k)?700:120}" ${help?`aria-describedby="aide-${k}"`:''}>${area?escapeHtml(state[k]):''}${area?'</textarea>':''}`;}
function apercu(d=state){return `<div class="email"><div class="ligne-mail"><b>À</b><span>${escapeHtml(d.a)||'…'}</span></div><div class="ligne-mail"><b>Objet</b><span>${escapeHtml(d.objet)||'…'}</span></div><div class="corps"><span class="tag">Corps du message</span><p>${escapeHtml(corps(d))||'…'}</p></div></div>`;}
function render(){
 const e=state.etape;
 document.getElementById('compteur').textContent=`${e+1} / ${TITRES.length} — ${TITRES[e]}`;
 document.getElementById('barre').value=e+1;
 document.getElementById('choix-etape').value=e;for(const o of document.getElementById('choix-etape').options)o.disabled=Number(o.value)>state.atteint;
 const z=document.getElementById('contenu');
 const mission='<aside class="mission"><b>Ta mission d’entraînement</b><p>Écris à Camille pour lui demander quel sport ou quel loisir elle pratique.</p><p>Camille est fictive. Son adresse : <b>camille.martin@example.org</b>.</p></aside>';
 let h=`<div class="mode-action"><b>À TOI D’AGIR</b> · Lis la consigne, réalise l’action, puis clique sur Vérifier.</div><h2>${TITRES[e]}</h2>`;
 if(e===0)h+=`<p>Avant de toucher Outlook, observe les parties de ce mail. Clique sur chaque repère pour comprendre son rôle.</p><div class="email exemple"><details><summary>À : camille.martin@example.org</summary><p><b>Le destinataire</b> : la personne qui doit recevoir le mail. Une lettre différente peut changer son adresse.</p></details><details><summary>Objet : Une question sur tes loisirs</summary><p><b>L’objet</b> : un titre court. Il annonce le sujet et aide à retrouver le mail dans la liste.</p></details><details><summary>Bonjour Camille,</summary><p><b>La salutation</b> : elle s’adapte à la personne. Pour un professeur : Bonjour Monsieur, ou Bonjour Madame,. On en choisit une seule.</p></details><details><summary>Quel sport ou quel loisir pratiques-tu ?</summary><p><b>Le message</b> : il dit pourquoi tu écris et ce que tu demandes. Le destinataire doit pouvoir répondre.</p></details><details><summary>Bonne journée,</summary><p><b>La formule de fin</b> : elle termine le message poliment.</p></details><details><summary>Lina Dupont, 2B</summary><p><b>La signature</b> : elle permet d’identifier l’élève et sa classe.</p></details></div><p class="note">Le corps du mail réunit la salutation, le message, la formule de fin et la signature.</p>`;
 if(e===0)h+=`<h3>Comprendre une adresse email</h3><div class="email"><div class="ligne-mail"><b>camille.martin</b><b>@</b><b>example.org</b></div></div><ul><li><b>Partie locale :</b> avant @, elle identifie une boîte dans le domaine. Ce peut être une personne ou un service, comme secretariat.</li><li><b>@, l’arobase :</b> sépare les deux parties ; on peut le lire « chez ».</li><li><b>Domaine :</b> après @, il indique le domaine auquel appartient la boîte. Il n’est pas nécessairement le nom du serveur technique.</li></ul><p>Dans ton adresse scolaire, le domaine est <b>arcampin.be</b>. Recopie l’adresse fournie exactement, sans ajouter d’espace. Une adresse bien écrite ne prouve pas que la boîte existe ni que son propriétaire est fiable.</p><p class="note">example.org est utilisé ici pour les personnages fictifs. On ne lui envoie aucun message réel.</p>`+champ('locale','Repère la partie locale','Dans camille.martin@example.org, écris seulement ce qui précède @.')+champ('domaine','Repère le domaine','Écris seulement ce qui suit @.');
 if(e===1)h+=mission+`<p><b>À qui écris-tu ?</b> Écris l’adresse complète de Camille dans le champ À.</p>`+champ('a','À — adresse du destinataire','Recopie l’adresse de la mission. Le message viendra dans le corps du mail.')+`<p class="note">Les adresses qui posent problème sont travaillées ensemble dans le support collectif.</p>`;
 if(e===2)h+=mission+`<p>Donne un titre à ton email. Le texte de la demande viendra après.</p>`+champ('objet','Objet','Le titre doit parler des loisirs. Tu peux trouver ta propre formulation.');
 if(e===3)h+=mission+`<p>Commence le corps du message en saluant Camille. Choisis une seule formulation.</p>`+champ('salutation','Salutation','Commence ton message en saluant Camille.');
 if(e===4)h+=mission+`<p>Rédige ta demande en une ou deux phrases. Camille doit comprendre <b>ce que tu lui demandes</b> et pouvoir te répondre.</p><ol><li>Demande quel sport ou quel loisir Camille pratique.</li><li>Tu peux lui demander ce qui lui plaît dans cette activité.</li><li>Relis : une majuscule au début et une ponctuation à la fin.</li></ol>`+champ('message','Ton message','Écris ta propre phrase. La salutation et la signature sont déjà préparées aux autres étapes.',true)+`<p class="note">Le contrôle repère les éléments de la mission. Il ne remplace pas la lecture du professeur : des mots-clés présents ne prouvent pas, à eux seuls, qu’une phrase est claire.</p>`;
 if(e===5)h+=`<p>Termine ton message, puis signe avec tes informations d’élève.</p>`+champ('fin','Formule de fin','Exemples : Bonne journée, ou À bientôt,')+champ('nom','Ton prénom et ton nom','Utilisés pour vérifier ta signature.')+(classeScolaire?`<p class="note">Ta classe : <b>${escapeHtml(classeScolaire)}</b>. Elle est déjà connue dans cette séance.</p>`:'')+champ('signature','Signature','Signe avec ton prénom, ton nom et ta classe.');
 if(e===6)h+=`<p>Voici ton mail complet. Vérifie le destinataire, le titre et chacune des parties du corps.</p>`+apercu()+`<ul class="controle"><li>Le destinataire est bien Camille.</li><li>L’objet annonce le sujet des loisirs.</li><li>Je la salue une seule fois.</li><li>Je lui demande son sport ou son loisir.</li><li>Je termine et je signe.</li></ul><p class="note">« Vérifier » contrôle cet entraînement. Aucun email ne sera envoyé.</p>`;
 if(e===7)h+=`<p>Dans cette simulation, Camille a reçu ta question et t’a répondu. Lis son message.</p><div class="email"><div class="ligne-mail"><b>De</b><span>Camille Martin &lt;camille.martin@example.org&gt;</span></div><div class="ligne-mail"><b>Objet</b><span>RE : ${escapeHtml(state.objet)}</span></div><div class="corps"><p>Bonjour,

Je pratique la boxe thaï. Et toi, quel sport ou quel loisir pratiques-tu ?

Bonne journée,
Camille</p></div></div><p><b>Utilise Répondre :</b> le destinataire et l’objet de la conversation sont conservés. Écris seulement ta réponse au-dessus du message précédent.</p><button type="button" id="ouvrir-reponse">↶ Répondre à Camille</button><div id="zone-reponse" hidden><div class="ligne-mail"><b>À</b><span>camille.martin@example.org</span></div><div class="ligne-mail"><b>Objet</b><span>RE : ${escapeHtml(state.objet)}</span></div>`+champ('reponse','Corps de ta réponse','Salue Camille, réponds à sa question par une phrase complète, puis termine et signe. Tu peux inventer un loisir si tu préfères.'+(state.nom&&classeSignature(state)?'<br><b>Signature à reprendre :</b> '+escapeHtml(state.nom)+', '+escapeHtml(classeSignature(state))+'.':''),true)+`</div><p class="note">Les contrôles vérifient des éléments de forme. Le professeur vérifie aussi que la réponse a du sens et répond bien à la question.</p>`;
 if(e===8)h+=`<p>Ouvre Outlook avec ton compte scolaire, puis lis le message de ton professeur.</p><p><a class="bouton" href="https://outlook.office.com/" target="_blank" rel="noopener">Ouvrir Outlook ↗</a></p><ol><li>Ouvre <b>Boîte de réception</b>.</li><li>Si nécessaire, regarde <b>Autres</b> ou utilise <b>Rechercher</b> avec le nom du professeur.</li><li>Repère son nom, son adresse, l’objet et la question posée. Explique la demande à ton voisin.</li></ol><p><b>Repères :</b> les messages reçus sont dans Boîte de réception ; les messages commencés restent dans Brouillons ; les envois sont dans Éléments envoyés.</p>`+champ('preuve','Comment appelle-t-on la personne qui envoie le mail ?','Écris le terme, puis montre son nom dans Outlook.');
 if(e===9)h+=`<p>Écris maintenant à un camarade désigné par le professeur.</p><ol><li>Vérifie avec lui son adresse scolaire exacte. <b>N’utilise pas l’adresse fictive de Camille.</b></li><li>Choisis <b>Accueil → Nouveau message</b>.</li><li>Dans <b>À</b>, écris son adresse ; laisse Cc et Cci vides.</li><li>Dans <b>Objet</b>, écris un titre court sur les loisirs.</li><li><b>Clique dans la grande zone sous l’objet.</b> Salue ton camarade, puis passe à la ligne.</li><li>Écris une ou deux phrases pour demander son sport ou son loisir. Passe à la ligne.</li><li>Ajoute une formule de fin, puis ton prénom, ton nom et ta classe.</li></ol><details><summary>Voir les champs dans Outlook</summary><img src="${CAPTURE}" alt="Vue adaptée d’Outlook : À, Cc, Objet et corps du message."><p>Vue adaptée à partir de la capture fournie.</p></details>`+champ('preuve','Comment s’appelle la grande zone où tu écris ton texte ?','Ne recopie pas ton email ici : nomme cette partie.');
 if(e===10)h+=`<p>Avant l’envoi, relis ton mail dans Outlook.</p><ul><li>L’adresse est bien celle du camarade.</li><li>L’objet annonce le sujet.</li><li>Le corps contient une salutation, une demande compréhensible, une formule de fin et ta signature.</li><li>Tu as relu l’orthographe et retiré les indications du modèle.</li></ul><p>Clique sur <b>Envoyer</b>, puis retrouve et ouvre le mail dans <b>Éléments envoyés</b>. S’il est encore dans Brouillons, il n’est pas envoyé.</p>`+champ('preuve','Dans quel dossier retrouves-tu ton email envoyé ?','Vérifie aussi sa présence réelle dans Outlook.');
 if(e===11)h+=`<p>Ouvre le mail reçu de ton camarade, puis clique sur <b>Répondre</b>.</p><ol><li>Lis sa question en entier.</li><li>Vérifie le destinataire et garde l’objet de la conversation.</li><li>Dans le corps, salue-le puis réponds à sa question par une phrase complète. Tu peux inventer un loisir si tu préfères.</li><li>Ajoute une formule de fin et ta signature.</li><li>Relis, envoie et vérifie l’envoi. Vérifie aussi que tu as reçu sa réponse à ton premier mail.</li></ol><p class="note">Le professeur observe les messages réels. La page n’a pas accès à Outlook : les réponses ici ne prouvent pas qu’un email est parti.</p>`+champ('preuve','Quel bouton réutilise le destinataire et le sujet du mail reçu ?','Écris son nom.');
 if(e===7)h+=champ('preuve','Quel bouton utilises-tu pour répondre dans la conversation ?','Repère le bouton que tu viens d’utiliser.');
 h+='<div id="retour" role="status" aria-live="polite" tabindex="-1"></div>';
 h+='<div class="actions">'+(e>0?'<button type="button" class="secondaire" id="precedent">← Revenir</button>':'')+(e<=11?`<button type="button" id="suivant">${e===0?'Vérifier les deux parties de l’adresse':e===6?'Vérifier mon mail d’entraînement':'Vérifier cette étape'}</button>`:'<button type="button" id="revoir">Revoir mon entraînement</button>')+'</div>';
 z.innerHTML=h;
 for(const el of z.querySelectorAll('input,textarea')){el.value=state[el.id]||'';el.addEventListener('input',()=>{state[el.id]=el.value;sauve();document.getElementById('aperçu-courant').innerHTML=apercu();document.getElementById('retour').innerHTML='';document.getElementById('retour').className='';});}
 document.getElementById('ouvrir-reponse')?.addEventListener('click',()=>{document.getElementById('zone-reponse').hidden=false;document.getElementById('reponse').focus();});
 document.getElementById('precedent')?.addEventListener('click',()=>{state.etape--;state.preuve='';render();});
 document.getElementById('revoir')?.addEventListener('click',()=>{state.etape=6;render();});
 document.getElementById('suivant')?.addEventListener('click',async()=>{
  if(document.getElementById('suivant').disabled)return;
  const champs={0:['locale','domaine'],1:['a'],2:['objet'],3:['salutation'],4:['message'],5:['fin','signature'],7:['reponse']}[e]||[];
  const err=e===6?erreurs(state):champs.map(k=>({champ:k,texte:verifie(k)})).filter(x=>x.texte);
  const feedback=document.getElementById('retour');
  if(err.length){feedback.className='retour faux';feedback.innerHTML='<b>À corriger</b><ul>'+err.map(x=>`<li>${escapeHtml(x.texte)}</li>`).join('')+'</ul>';feedback.focus();return;}
  const bouton=document.getElementById('suivant');bouton.disabled=true;
  const empreinte=JSON.stringify(state);
  try {await valideServeur(e);}
  catch(error){feedback.className='retour faux';feedback.textContent=error.message;feedback.focus();bouton.disabled=false;return;}
  bouton.disabled=false;
  if(empreinte!==JSON.stringify(state)){feedback.textContent='La réponse a changé pendant la vérification. Vérifie à nouveau.';return;}
  state.atteint=Math.max(state.atteint,e+1);sauve();
  const encouragement=ENCOURAGEMENTS[e];
  feedback.className='retour juste';feedback.innerHTML='<b>✓ '+escapeHtml(encouragement[0])+'</b><p>'+escapeHtml(encouragement[1])+'</p>';
  animeReussite(feedback,e);
  if(e===11){if(SUIVI)envoie({etape:12,type:'fini'}).catch(()=>{feedback.append(document.createTextNode(' La fin n’a pas pu être enregistrée : recharge avant de quitter.'));});feedback.focus();return;}
  const suite=document.createElement('p');suite.textContent=e===6?'Tu peux maintenant lire la réponse fictive de Camille et lui répondre.':(e>=8?'Continue après avoir effectué la manipulation dans Outlook.':'Continue pour voir le mail se construire.');feedback.append(suite);
  const b=document.createElement('button');b.type='button';b.textContent=e===6?'Lire la réponse de Camille →':'Continuer →';b.addEventListener('click',()=>{if(JSON.stringify({...state,atteint:0})!==JSON.stringify({...JSON.parse(empreinte),atteint:0}))return;if((e===6?erreurs(state):champs.map(k=>({texte:verifie(k)})).filter(x=>x.texte)).length)return;state.etape++;state.preuve='';sauve();render();});feedback.append(b);b.focus();
 });
 document.getElementById('aperçu-courant').innerHTML=apercu();
}
function init(){
 const sel=document.getElementById('choix-etape');TITRES.forEach((t,i)=>{const o=document.createElement('option');o.value=i;o.textContent=(i+1)+' — '+t;sel.append(o);});
 sel.addEventListener('change',()=>{if(Number(sel.value)>state.atteint)return;state.etape=Number(sel.value);state.preuve='';render();});
 document.getElementById('reset').addEventListener('click',()=>{if(!confirm('Effacer le brouillon dans cet onglet ? Le journal professeur sera conservé.'))return;Object.assign(state,INITIAL);sauve();render();});
 render();
}

if(typeof module!=='undefined')module.exports={verifie,erreurs,corps,DEST};
const COURS='messagerie-1';
const APERCU=typeof location!=='undefined'&&/^#bloc=\d+$/.test(location.hash);
const SUIVI=!APERCU&&typeof google!=='undefined'&&!!google.script?.run;
const CLE='messagerie-01-v20261103';let repriseServeur=0;
let identite='',classeScolaire='',preuves=null;const dejaValide=new Map(),dejaFaux=new Map();
function sauve(){if(APERCU)return;try{sessionStorage.setItem(CLE+identite,JSON.stringify(state));}catch(_){}}
function rpc(n,...args){return new Promise((resolve,reject)=>{google.script.run.withSuccessHandler(resolve).withFailureHandler(()=>reject(new Error('Le suivi ne répond pas. Ta saisie reste ici ; réessaie avant de continuer.')))[n](...args);});}
function envoie(evt){return SUIVI?rpc('noter',COURS,evt):Promise.resolve();}
function regle(r,rep){const n=String(rep||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’']/g,"'").replace(/[«»"“”.]/g,'').replace(/\s+/g,' ').trim();return !!n&&(!r.egal||r.egal.some(x=>regleNorm(x)===n))&&(!r.exact||r.exact.includes(rep.trim().toLowerCase()))&&(!r.motif||new RegExp(r.motif).test(n))&&(!r.sauf||!new RegExp(r.sauf).test(n));}
function regleNorm(s){return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’']/g,"'").replace(/[«»"“”.]/g,'').replace(/\s+/g,' ').trim();}
function reponseCourte(e){return [state.locale+'@'+state.domaine,state.a,state.objet,state.salutation,state.message,state.fin+' | '+state.signature,state.objet,state.preuve,state.preuve,state.preuve,state.preuve,state.preuve][e];}
async function valideServeur(e){
 const reponse=reponseCourte(e);
 if(!preuves)throw new Error('Les contrôles ne sont pas encore chargés. Recharge la page.');
 const q=preuves.blocs[e][0];
 if(!regle(q.regle,reponse))throw new Error(q.faux);
 if(dejaValide.get(e)===reponse)return;
 if(dejaFaux.get(e)===reponse)throw new Error('Modifie ta réponse avant de la vérifier à nouveau.');
 if(SUIVI){const actuel=await rpc('preuve',COURS,e+1);if(actuel?.q!==q.q)throw new Error('Le serveur utilise encore les anciens contrôles. Attends quelques minutes puis recharge ; ta réponse est conservée.');const r=await rpc('verifier',COURS,e+1,reponse,1);if(!r?.juste){dejaFaux.set(e,reponse);throw new Error(r?.texte||'La réponse n’a pas été validée.');}dejaValide.set(e,reponse);}
}
async function demarre(){
 const status=document.getElementById('suivi-status');
 try{
  const r=await fetch('https://root75.github.io/campin-public/messagerie/pas-a-pas/preuves.json?v=20261103');if(!r.ok)throw Error();preuves=await r.json();
  if(SUIVI){const etat=await rpc('etat',COURS);identite=':'+etat.email;classeScolaire=String(etat.classe||'').trim();repriseServeur=Number(etat.reprise)||0;status.textContent='Suivi professeur connecté. Les preuves courtes et demandes d’aide sont enregistrées.';await envoie({etape:0,type:'ouvert'});}
  else status.innerHTML='Entraînement libre : aucun résultat ni appel à l’aide transmis au professeur. Pour la séance suivie, <a href="https://script.google.com/a/macros/arcampin.be/s/AKfycbyOPTaq-L1PuittB1rkkiL9OOtShFc2WpiD8H_pH_INaw9ePWenCzhlIPlHu4zBOgLk/exec">ouvre ta séance scolaire</a>.';
  try{const saved=JSON.parse(sessionStorage.getItem(CLE+identite)||'null');if(saved&&Number.isInteger(saved.etape)&&saved.etape>=0&&saved.etape<12&&(!SUIVI||Number(saved.reprise||0)===repriseServeur))Object.assign(state,saved);state.reprise=repriseServeur;}catch(_){}
  if(SUIVI&&classeScolaire)state.classe=classeScolaire;
  if(APERCU){Object.assign(state,INITIAL);state.atteint=12;state.etape=Math.min(11,Math.max(0,Number(location.hash.slice(6))-1));document.getElementById('collectif').hidden=true;document.getElementById('individuel').hidden=false;document.getElementById('revoir-collectif').hidden=false;status.textContent='Aperçu du professeur : navigation libre, aucun résultat enregistré.';}
  init();
 }catch(e){status.textContent='Impossible de charger les contrôles ou le suivi. Recharge la page ; aucun résultat n’est annoncé comme enregistré.';init();}
 document.getElementById('demarrer-individuel').onclick=()=>{document.getElementById('collectif').hidden=true;document.getElementById('individuel').hidden=false;document.getElementById('revoir-collectif').hidden=false;};
 document.getElementById('revoir-collectif').onclick=()=>{document.getElementById('collectif').hidden=false;document.getElementById('individuel').hidden=true;};
 let aide=false;
 document.getElementById('bloque').onclick=async function(){const zone=document.getElementById('aide-bloque');zone.hidden=false;this.disabled=true;try{if(SUIVI){await envoie({etape:state.etape+1,type:aide?'aide-fin':'aide'});aide=!aide;zone.textContent=aide?'Demande enregistrée pour le professeur. Garde cette étape ouverte.':'Difficulté signalée comme résolue.';this.textContent=aide?'✓ Je suis débloqué':'✋ Je suis bloqué';}else zone.textContent='Appelle le professeur et garde cette étape ouverte. En entraînement libre, aucune alerte n’est transmise.';}catch(e){zone.textContent='Demande non confirmée. Appelle le professeur ou réessaie.';}finally{this.disabled=false;this.setAttribute('aria-expanded','true');}};
 if(SUIVI)setInterval(()=>{if(!aide)return;google.script.run.withSuccessHandler(r=>{if(r?.active===false){aide=false;document.getElementById('bloque').textContent='✋ Je suis bloqué';document.getElementById('aide-bloque').textContent='Demande traitée par le professeur. Tu peux demander de l’aide à nouveau.';}}).withFailureHandler(()=>{}).etatAide(COURS);},15000);
 if(SUIVI){window.PAS_A_PAS={cours:COURS,envoie};window.PasAPasSequence?.suivre(window.PAS_A_PAS);}
}
if(typeof document!=='undefined')demarre();
if(typeof module!=='undefined')Object.assign(module.exports,{regle,reponseCourte});


