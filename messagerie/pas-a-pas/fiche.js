'use strict';
const INITIAL={etape:0,a:'',objet:'',salutation:'',message:'',fin:'',signature:'',nom:'',classe:'',locale:'',domaine:'',reponse:'',questionProf:'',erreur1:'',erreur2:'',erreur3:'',preuve:'',atteint:0};
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
 ['Message lu !','Tu as trouvé ce que ton professeur demande. À l’étape suivante, tu poses sa question à ton camarade.'],
 ['Ton message est prêt !','Vérifie encore : l’adresse du camarade dans À, celle du professeur dans Cc.'],
 ['Message parti !','Ton professeur, en Cc, l’a reçu lui aussi : c’est la preuve de ton envoi.'],
 ['Bravo pour ce parcours !','Ton professeur, en copie, a reçu ton message et ta réponse : il va les coter.']
];
/* Effets de réussite, comme le Rat de ville : bandeau « Bravo » en bas et confettis plein écran,
   une seule fois par étape ; grande fête au mail complet (7) et à la fin (12). */
let minuterieBravo=null;
function bravo(t,grand){const b=document.getElementById('bravo');if(!b)return;b.textContent=t;b.classList.toggle('grand',!!grand);b.classList.add('vu');clearTimeout(minuterieBravo);minuterieBravo=setTimeout(()=>b.classList.remove('vu'),grand?3200:1800);}
function confettis(n){
 if(typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const couleurs=['#ffcf3f','#287544','#d89b28','#7cc3de','#0086ad','#e8742a'];
 for(let k=0;k<n;k++){const c=document.createElement('span');c.className='confetti';c.setAttribute('aria-hidden','true');c.style.left=Math.random()*100+'vw';c.style.background=couleurs[k%couleurs.length];c.style.animationDelay=(Math.random()*.5)+'s';c.style.animationDuration=(1.2+Math.random())+'s';document.body.append(c);setTimeout(()=>c.remove(),2800);}
}
function animeReussite(zone,etape){
 const grand=[6,11].includes(etape);
 if(CELEBREES.has(etape)){bravo('✓ '+ENCOURAGEMENTS[etape][0],false);return;}
 CELEBREES.add(etape);
 bravo((grand?'⭐ ':'✉️ ')+'Étape '+(etape+1)+' réussie : « '+TITRES[etape]+' » !',grand);
 confettis(grand?60:30);
}
const DEST='camille.martin@example.org';
const TITRES=['Observer un email','Choisir le destinataire','Donner un objet','Saluer','Rédiger la demande','Terminer et signer','Relire le mail complet','Répondre au message reçu','Ouvrir et lire dans Outlook','Rédiger dans le corps du message','Envoyer et retrouver son mail','Répondre à son camarade'];
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’]/g,"'").replace(/\s+/g,' ').trim();
const classeSignature=d=>d.classe.trim()||(/(?:^|[\s,:])([12]\s*[a-z](?:\d)?)(?=$|[\s,.;])/i.exec(d.signature.trim())?.[1]||'');
const escapeHtml=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/* La salutation « Bonjour Camille, » : un mot du modèle, une majuscule, le prénom avec sa majuscule, une virgule.
   seule=true : rien d'autre sur la ligne (étape 4) ; sinon on ne lit que le début (réponse de l'étape 8). */
function erreurSalutation(brut,seule){
 const t=String(brut||'').trim(),m=/^([^\s,.!:;?]+)\s*([^\s,.!:;?]*)\s*([,.!:;?]?)/.exec(t)||['','','',''];
 const [,mot,prenom,ponct]=m;
 if(!/^(bonjour|salut|bonsoir)$/.test(norm(mot)))return 'Commence par la salutation du modèle : « Bonjour Camille, » (Salut ou Bonsoir conviennent aussi). Les autres formes (Coucou, Hello, Yo…) ne sont pas acceptées ici.';
 if(mot[0]!==mot[0].toUpperCase())return 'La salutation commence par une majuscule : « Bonjour », pas « '+mot+' ».';
 if(!prenom)return 'Après « '+mot+' », écris le prénom de la personne, puis une virgule : « Bonjour Camille, ».';
 if(norm(prenom)!=='camille')return 'Salue Camille par son prénom : « Bonjour Camille, ».';
 if(prenom[0]!==prenom[0].toUpperCase())return 'Le prénom prend une majuscule : « Camille », pas « '+prenom+' ».';
 if(ponct!==',')return 'Mets une virgule juste après le prénom : « Bonjour Camille, ».';
 if(seule&&t.length>m[0].length)return 'Écris seulement la salutation sur cette ligne : « Bonjour Camille, ». La suite vient à l’étape suivante.';
 return '';
}
/* Étape 8 : les cinq critères de la réponse à Camille, contrôlés TOUS ensemble. Avant le 12/11/2026, on n'en montrait
   qu'un à la fois : l'élève corrigeait la virgule, tombait sur la signature, puis sur la classe (2F, 12/11 : ~85 refus
   pour 18 élèves, jusqu'à 16 essais et 44 min sur cette étape). La liste sous la case se coche pendant qu'il écrit. */
function criteresReponse(d=state){
 const v=norm(d.reponse);
 const mots=norm(d.nom).split(/[^a-z0-9'-]+/).filter(Boolean);
 const classe=classeSignature(d)||(/(?:^|[\s,:])([12]\s*[a-z](?:\d)?)(?=$|[\s,.;])/i.exec(String(d.reponse||'').trim())?.[1]||'');
 const c=(nom,err)=>({nom,err:err||''});
 return [
  c('« Bonjour Camille, » au début',erreurSalutation(d.reponse,false)),
  c('Une phrase complète sur ton sport ou ton loisir',!/loisir|sport|activite|pratique|aime|joue|lecture|lire|musique|dessin|danse|anime/.test(v)?'Réponds à la question de Camille : écris une phrase complète sur ton sport ou ton loisir, par exemple « Je pratique le football. »':v.length<35?'Ta réponse est trop courte. Il faut, dans l’ordre : la salutation, une phrase complète sur ton loisir, une formule de fin et ta signature.':''),
  c('Une formule de fin : « Bonne journée, »',!/bonne journee|a bientot|merci|cordialement|bonne soiree/.test(v)?'Avant ta signature, ajoute une formule de fin du modèle : « Bonne journée, » ou « À bientôt, » (Merci, Cordialement ou Bonne soirée conviennent aussi).':''),
  c('Ta signature : ton prénom et ton nom',!mots.length?'Écris d’abord ton prénom et ton nom dans la case « Ton prénom et ton nom », juste au-dessus de ta réponse.':!mots.every(m=>v.split(/[^a-z0-9'-]+/).includes(m))?'Dans ta signature, reprends le prénom et le nom du bloc 6 : '+String(d.nom).trim()+'.':''),
  c('Ta classe, après ton nom',!classe?'Ajoute ta classe dans ta signature, après ton prénom et ton nom (exemple : 2B).':!v.replace(/\s/g,'').includes(norm(classe).replace(/\s/g,''))?'Dans ta signature, reprends la classe du bloc 6 : '+classe+'.':'')
 ];
}
function listeCriteres(){return '<ul class="controle" id="criteres-reponse" aria-live="polite">'+criteresReponse().map(c=>`<li class="${c.err?'':'ok'}">${c.err?'○':'✓'} ${escapeHtml(c.nom)}</li>`).join('')+'</ul>';}
function verifie(k,d=state){
 const v=norm(d[k]);
 if(k==='erreur1')return /arobase|@/.test(v)&&/manqu|absen|ajout|oubli/.test(v)?'':'Explique quel séparateur manque entre camille.martin et example.org.';
 if(k==='erreur2')return /espace/.test(v)&&/retir|supprim|enlev|interdit|pas|trop/.test(v)?'':'Repère le caractère ajouté au milieu de l’adresse et indique ce qu’il faut en faire.';
 if(k==='erreur3')return /domaine|example.net|\.net/.test(v)&&/different|autre|attendu|example.org|\.org|remplac|mauvais/.test(v)?'':'Cette adresse a une structure plausible, mais compare son domaine à example.org, celui de Camille.';
 if(k==='locale')return v==='camille.martin'?'':'La partie locale est ce qui se trouve avant @ : elle identifie la boîte dans ce domaine.';
 if(k==='domaine')return v==='example.org'?'':'Le domaine est ce qui se trouve après @. Ici, recopie example.org.';
 if(k==='reponse')return criteresReponse(d).find(c=>c.err)?.err||'';
 if(k==='questionProf')return String(d.questionProf||'').trim().length>=8?'':'Recopie la question du message de ton professeur, en entier : elle te sera rappelée à l’étape suivante.';
 if(k==='a')return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.a.trim())&&d.a.trim().toLowerCase()===DEST ? '' : 'Écris l’adresse de Camille indiquée dans la mission. Vérifie chaque lettre : un @ et une adresse plausible ne suffisent pas.';
 if(k==='objet'){
  if(!v)return 'Ajoute un titre qui annonce le sujet.';
  if(/[\r\n]/.test(d.objet)||d.objet.length>80||/bonjour|merci|cordialement|\?/.test(v))return 'Garde un titre court dans Objet. La salutation et la demande vont dans le message.';
  return /\b(loisir|loisirs|sport|sports|activite|activites|passion|passions)\b/.test(v) ? '' : 'L’objet doit annoncer les loisirs. Un prénom seul, « Bonjour » ou « Mon message » ne suffit pas.';
 }
 if(k==='salutation')return erreurSalutation(d.salutation,true);
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
/* Le nom à taper dans Cc : Outlook trouve la personne dans l'annuaire de l'école. */
function nomProf(){const c=String(classeScolaire||state.classe||'').replace(/\s/g,'').toUpperCase();if(/^2E/.test(c))return 'Michiels';if(c)return 'Louviaux';return 'Louviaux (2B, 2F) ou Michiels (2E)';}
const COTE=(rappel=false)=>`<aside class="mission cote"><b>${rappel?'Avant d’envoyer : la grille de ton message, coté sur 5':'⚠ Ton message au camarade est coté sur 5'}</b><p>Ton professeur est <b>en copie (Cc)</b> : il reçoit ton message et le cote avec cette grille. Un point par ligne.</p><table class="grille-cote"><tr><th>Dans ton message</th><th>Points</th></tr><tr><td><b>À</b> : l’adresse de ton camarade · <b>Cc</b> : ton professeur, ${nomProf()}</td><td>1</td></tr><tr><td><b>Objet</b> : un titre court qui annonce ta question.</td><td>1</td></tr><tr><td><b>Salutation</b> : « Bonjour », le prénom de ton camarade avec sa majuscule, puis une virgule. Par exemple « Bonjour Lucas, ».</td><td>1</td></tr><tr><td><b>Message</b> : la question de ton professeur, posée à ton camarade, avec une majuscule et un point d’interrogation.</td><td>1</td></tr><tr><td><b>Fin et signature</b> : une formule de fin, puis ton prénom, ton nom et ta classe.</td><td>1</td></tr></table><p>Sans ton professeur en Cc, il ne reçoit pas ton message et ne peut pas le coter.</p></aside>`;
/* La phrase de la fin (code commun : pas-a-pas/phrase-fin.js), sous le message de réussite de l'étape 11. */
const CITATION={texte:'Ce que l’on conçoit bien s’énonce clairement,\nEt les mots pour le dire arrivent aisément.',auteur:'Nicolas Boileau',source:'L’Art poétique, chant I (1674)',lien:'Un bon mail aussi : je sais ce que je veux dire, puis je l’écris simplement.'};
/* Pour ceux qui ont fini avant les autres : un ordre, une chose à la fois. */
const FINI='<aside class="mission fini" id="fini-avant"><b>🏁 Tu as fini avant les autres ? Dans l’ordre :</b><ol><li>Donne ton avis, juste en dessous : trois phrases courtes.</li><li>Révise avec « Mon premier message — je révise » : <a href="https://root75.github.io/campin-public/messagerie/" target="_blank" rel="noopener">ouvrir la page ↗</a>. Réponds aux questions, puis retourne les cartes mémoire.</li><li><b>Bonus : agrandir le ruban d’Outlook.</b> Le ruban, en haut, tient sur une seule ligne et ses boutons n’ont pas de nom ? Clique sur la petite flèche <b>˅</b> tout en bas à droite du ruban (« Changer de disposition ») : il s’agrandit, avec le nom sous chaque bouton.</li><li>Si ton professeur te le propose, deviens <b>aidant</b> : va voir un camarade qui a sonné la cloche 🔔. Tu expliques avec des mots, tu ne touches pas sa souris.</li></ol></aside>';
/* Le panneau de droite suit ce que l'élève tape. Étapes 1 à 7 : le mail d'entraînement. Étape 8 : sa réponse à Camille
   (destinataire et objet repris de la conversation, comme avec « Répondre »). */
const COTE_REPONSE=()=>`<aside class="mission cote"><b>⚠ Ta réponse est cotée sur 5, elle aussi</b><p>Ton premier message, envoyé à l’étape 11, est coté sur 5. Cette réponse l’est aussi, avec cette grille. Un point par ligne.</p><table class="grille-cote"><tr><th>Dans ta réponse</th><th>Points</th></tr><tr><td><b>Répondre à tous</b> : ton camarade dans À, ton professeur, ${nomProf()}, toujours en Cc.</td><td>1</td></tr><tr><td><b>Objet</b> : celui de la conversation, gardé tel quel, avec « RE: » devant.</td><td>1</td></tr><tr><td><b>Salutation</b> : « Bonjour », le prénom de ton camarade avec sa majuscule, puis une virgule.</td><td>1</td></tr><tr><td><b>Réponse</b> : tu réponds à sa question par une phrase complète, avec une majuscule et un point.</td><td>1</td></tr><tr><td><b>Fin et signature</b> : une formule de fin, puis ton prénom, ton nom et ta classe.</td><td>1</td></tr></table><p>Avec « Répondre » tout court, ton professeur ne reçoit pas ta réponse et ne peut pas la coter.</p></aside>`;
function apercuCote(){
 const rep=state.etape===7,titre=document.querySelector('.side h2'),barre=document.querySelector('.side .outlookbar');
 if(titre)titre.textContent=rep?'Ma réponse se construit':'Mon mail se construit';
 if(barre)barre.textContent='Messagerie d’entraînement · '+(rep?'Réponse':'Nouveau message');
 if(!rep)return apercu();
 return `<div class="email"><div class="ligne-mail"><b>À</b><span>${DEST}</span></div><div class="ligne-mail"><b>Objet</b><span>RE : ${escapeHtml(state.objet)}</span></div><div class="corps"><span class="tag">Corps de ma réponse</span><p>${escapeHtml(state.reponse)||'…'}</p></div></div>`;
}
const corps=d=>[d.salutation,d.message,d.fin,d.signature].join('\n\n');
const erreurs=d=>['a','objet','salutation','message','fin','signature'].map(k=>({champ:k,texte:verifie(k,d)})).filter(x=>x.texte);
/* Étapes 9 à 12 (dans le vrai Outlook) : une case à cocher par consigne, comme dans les autres cours. Les cases
   cochées sont gardées avec le brouillon (rechargement, retour sur l'étape) ; elles ne bloquent rien et ne sont pas notées. */
function casesAGestes(z,e){
 if(e<8)return;
 const coches=(state.coches&&typeof state.coches==='object')?state.coches:(state.coches={});
 const faites=Array.isArray(coches[e])?coches[e]:(coches[e]=[]);
 let n=0;
 z.querySelectorAll(':scope > ol').forEach(ol=>{
  ol.classList.add('etapes');
  [...ol.children].forEach(li=>{
   const k=n++,lab=document.createElement('label'),cb=document.createElement('input'),sp=document.createElement('span');
   cb.type='checkbox';cb.checked=faites.includes(k);sp.append(...li.childNodes);lab.append(cb,sp);li.append(lab);
   cb.addEventListener('change',()=>{const i=faites.indexOf(k);if(cb.checked&&i<0)faites.push(k);else if(!cb.checked&&i>=0)faites.splice(i,1);sauve();camembert();});
  });
 });
}
/* Le menu des étapes, comme dans les autres cours (repris du Rat de ville) : une pastille ronde par étape, qui se
   remplit comme un camembert selon les cases cochées ; le nom en infobulle, celui de l'étape affichée écrit dessous ;
   ✓ sur les étapes validées. Cliquable jusqu'à la première étape non
   validée : on revient relire, puis on repart en avant. Sans la barre (ancienne page en cache), rien ne se passe. */
/* Blocs ouverts (cadenas), comme dans le moteur commun : le professeur ouvre la classe jusqu'à une étape (tableau ▸
   rangée « Blocs ouverts »). Les étapes suivantes portent un cadenas ; l'élève qui y arrive lit le message et peut
   relire ses étapes validées. Le plafond arrive avec etat() au démarrage, puis avec moment() toutes les 5 s. */
let plafond=null;
const enPause=()=>!!plafond&&!APERCU&&plafond.bloc<TITRES.length&&state.etape>=plafond.bloc&&state.etape>=state.atteint;
function recoitPlafond(p){
 p=p&&Number(p.bloc)>0?{bloc:Number(p.bloc),message:String(p.message||'')}:null;
 if(JSON.stringify(p)===JSON.stringify(plafond))return;
 const avant=enPause();plafond=p;
 if(avant||enPause())render();else{pastilles(state.etape);camembert();}
}
function pastilles(e){
 const b=document.getElementById('pastilles');if(!b)return;
 for(const id of ['compteur','barre'])document.getElementById(id).hidden=true;
 b.replaceChildren();
 TITRES.forEach((t,i)=>{
  const fait=i<state.atteint,ferme=!!plafond&&!APERCU&&!fait&&i>=plafond.bloc,n=document.createElement('button');n.type='button';
  if(fait)n.className='fait';else if(ferme)n.className='ferme';
  n.textContent=fait?'✓':String(i+1);n.title=(i+1)+'. '+t+(ferme?' — pas encore ouverte':'');
  n.setAttribute('aria-label',n.title+(fait?' — validée':''));if(i===e)n.setAttribute('aria-current','step');
  n.disabled=i>state.atteint;
  n.addEventListener('click',()=>{if(i===e||i>state.atteint)return;state.etape=i;state.preuve='';sauve();render();scrollTo(0,0);});
  b.append(n);
 });
 const nom=document.createElement('p');nom.className='nom-etape';nom.textContent=(e+1)+'. '+TITRES[e];b.append(nom);
}
/* Le camembert de l'étape affichée : la part de ses cases cochées (étapes 9 à 12). */
function camembert(){
 const n=document.querySelector('#pastilles button[aria-current]'),c=[...document.querySelectorAll('#contenu ol.etapes input[type=checkbox]')];
 if(n)n.style.setProperty('--p',c.length?Math.round(100*c.filter(x=>x.checked).length/c.length):0);
}
/* Reprise au bloc 8 sur un autre poste : le brouillon des blocs 1 à 7 (dont le prénom et le nom du bloc 6) n'est gardé que
   sur l'ordinateur d'origine. Sans lui, la signature ne peut pas être vérifiée : on redemande le nom ici, une fois. */
let nomDemandeIci=false;
function nomSiManquant(){
 if(!state.nom.trim())nomDemandeIci=true;
 return nomDemandeIci?champ('nom','Ton prénom et ton nom','Tu reprends sur un autre poste : écris-les ici, ta signature sera vérifiée avec eux.'):'';
}
function champ(k,label,help,area=false){return `<label for="${k}">${label}</label>${help?`<p class="aide-champ" id="aide-${k}">${help}</p>`:''}<${area?'textarea':'input'} id="${k}" name="${k}" ${area?'rows="4"':'type="text"'} maxlength="${['message','reponse'].includes(k)?700:120}" ${help?`aria-describedby="aide-${k}"`:''}>${area?escapeHtml(state[k]):''}${area?'</textarea>':''}`;}
function apercu(d=state){return `<div class="email"><div class="ligne-mail"><b>À</b><span>${escapeHtml(d.a)||'…'}</span></div><div class="ligne-mail"><b>Objet</b><span>${escapeHtml(d.objet)||'…'}</span></div><div class="corps"><span class="tag">Corps du message</span><p>${escapeHtml(corps(d))||'…'}</p></div></div>`;}
/* « 👀 Regarde comment faire » sous une case : étape (à partir de 0) ▸ { "n° de la case": [clé de l'animation] }.
   Le volet et ses règles sont communs (DemoLecteur.sousCases) ; les animations : messagerie/pas-a-pas/demos.js. */
/* Le ruban n'est plus à l'étape 9 (Vincent, 12/11/2026 : un bonus dont les élèves ne se servent pas) : il est dans
   « Tu as fini avant les autres ? ». L'animation reste dans demos.js. */
const DEMOS_ETAPES={9:{'6':['nouveau']}};   // étape 10 : Nouveau message ▸ À ▸ Cc ▸ Objet (Vincent, 12/11/2026)
function render(){
 const e=state.etape;
 if(typeof DemoLecteur!=='undefined'&&DemoLecteur.arrete)DemoLecteur.arrete();
 document.getElementById('compteur').textContent=`${e+1} / ${TITRES.length} — ${TITRES[e]}`;
 document.getElementById('barre').value=e+1;
 pastilles(e);
 document.getElementById('choix-etape').value=e;for(const o of document.getElementById('choix-etape').options)o.disabled=Number(o.value)>state.atteint;
 const z=document.getElementById('contenu');
 if(enPause()){
  z.innerHTML=`<div class="mode-action"><b>🔒 Étapes 1 à ${plafond.bloc} ouvertes</b></div><h2>L’étape ${plafond.bloc+1} n’est pas encore ouverte</h2><p class="mission cote"><b>${escapeHtml(plafond.message||'On attend la correction ensemble.')}</b></p><p>En attendant, reviens sur tes étapes : clique sur une pastille ✓, juste au-dessus. Pour chacune, saurais-tu l’expliquer à ton voisin ?</p><p class="note">Le professeur ouvre la suite : le cadenas 🔒 disparaîtra tout seul, sans recharger la page.</p><div class="actions"><button type="button" class="secondaire" id="precedent">← Revenir</button></div>`;
  document.getElementById('precedent').addEventListener('click',()=>{state.etape--;state.preuve='';render();});
  return;
 }
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
 if(e===7)h+=`<p>Dans cette simulation, Camille a reçu ta question et t’a répondu. Lis son message.</p><div class="email"><div class="ligne-mail"><b>De</b><span>Camille Martin &lt;camille.martin@example.org&gt;</span></div><div class="ligne-mail"><b>Objet</b><span>RE : ${escapeHtml(state.objet)}</span></div><div class="corps"><p>Bonjour${state.nom.trim()?' '+escapeHtml(state.nom.trim().split(/\s+/)[0]):''},

Je pratique la boxe thaï. Et toi, quel sport ou quel loisir pratiques-tu ?

Bonne journée,
Camille</p></div></div><p><b>Utilise Répondre :</b> le destinataire et l’objet de la conversation sont conservés. Écris seulement ta réponse au-dessus du message précédent.</p><button type="button" id="ouvrir-reponse">↶ Répondre à Camille</button><div id="zone-reponse" hidden><div class="ligne-mail"><b>À</b><span>camille.martin@example.org</span></div><div class="ligne-mail"><b>Objet</b><span>RE : ${escapeHtml(state.objet)}</span></div>`+nomSiManquant()+champ('reponse','Corps de ta réponse','Commence par la salutation du modèle, « Bonjour Camille, ». Réponds à sa question par une phrase complète, puis ajoute une formule de fin (« Bonne journée, ») et ta signature. Tu peux inventer un loisir si tu préfères.'+(state.nom&&classeSignature(state)?'<br><b>Signature à reprendre :</b> '+escapeHtml(state.nom)+', '+escapeHtml(classeSignature(state))+'.':''),true)+listeCriteres()+`</div><p class="note">Les contrôles vérifient des éléments de forme. Le professeur vérifie aussi que la réponse a du sens et répond bien à la question.</p>`;
 if(e===8)h+=`<p><b>À partir d’ici, tout est réel.</b> Ouvre Outlook avec ton compte scolaire et lis le message de ton professeur <b>en entier</b>. Tu n’y réponds pas : tu vas te servir de sa question à l’étape suivante.</p><p><a class="bouton" href="https://outlook.office.com/" target="_blank" rel="noopener">Ouvrir Outlook ↗</a></p><ol><li>Ouvre <b>Boîte de réception</b>, à gauche.</li><li>Cherche le message « <b>Bienvenue dans ta boîte de l’école</b> ». Pas là ? Regarde l’onglet <b>Autres</b>, ou tape le nom du professeur dans <b>Rechercher</b>, tout en haut.</li><li>Clique sur le message pour l’ouvrir, puis <b>lis-le jusqu’au bout</b>.</li><li>Repère son nom, son adresse, l’objet et <b>la question qu’il te pose</b>.</li><li><b>Recopie cette question</b> dans la case ci-dessous : l’étape suivante te la rappellera.</li></ol><p class="note"><b>Ici, tu lis seulement.</b> Tu ne réponds pas au professeur et tu n’écris aucun message : cela vient à l’étape 10.</p>`+`<p><b>Repères :</b> les messages reçus sont dans Boîte de réception ; les messages commencés restent dans Brouillons ; les envois sont dans Éléments envoyés.</p>`+champ('questionProf','La question de ton professeur','Recopie-la en entier, avec son point d’interrogation. Elle t’est rappelée à l’étape suivante, quand tu écris à ton camarade.')+champPreuve(8);
 if(e===9)h+=`<p>Écris maintenant un vrai message à un camarade désigné par le professeur, <b>avec ton professeur en copie</b>.</p><p><span class="attention">⚠️ <b>N’utilise pas l’adresse fictive de Camille</b> : tu écris à un vrai camarade.</span></p><ol><li>Vérifie avec ton camarade son <b>adresse scolaire</b> exacte.</li><li>Outlook ▸ onglet <b>Accueil</b> ▸ bouton bleu <b>Nouveau message</b> (touche N).</li><li>Dans <b>À</b>, écris l’adresse de ton camarade et choisis-la dans la liste proposée.</li><li>Dans <b>Cc</b>, juste sous la ligne À, tape simplement le <b>nom</b> de ton professeur : <b>${nomProf()}</b>. Outlook te propose plusieurs lignes : clique sur celle dont l’adresse finit par <b>@arcampin.be</b>. Pas une ligne marquée « Externe », pas une adresse en @arcampin.com ou @gmail.com.</li><li>Laisse <b>Cci</b> vide.</li></ol><p class="note"><b>Pour écrire à n’importe quel professeur de l’école</b> : tape son nom dans À ou dans Cc, puis choisis dans la liste la ligne dont l’adresse finit par <b>@arcampin.be</b>. Outlook trouve son adresse tout seul : pas besoin de la connaître par cœur.</p><ol start="6"><li>Dans <b>Objet</b>, écris un titre court qui annonce ta question.</li><li><b>Clique dans la grande zone sous l’objet.</b> Écris « Bonjour », le prénom de ton camarade avec une majuscule et une virgule (« Bonjour Lucas, »), puis passe à la ligne.</li><li>Pose-lui <b>la question que ton professeur t’a posée</b> (étape 9)${state.questionProf.trim()?' : <span class="rappel-question">« '+escapeHtml(state.questionProf.trim())+' »</span>':'. Tu ne t’en souviens plus ? Rouvre son message dans Outlook, Boîte de réception.'} Passe à la ligne.</li><li>Ajoute une <b>formule de fin</b>, puis ton prénom, ton nom et ta classe.</li></ol><p><span class="attention">⚠️ <b>Attention : n’envoie pas encore !</b> Tu relis d’abord, à l’étape suivante.</span></p>`+COTE()+`<details><summary>Voir les champs dans Outlook</summary><img loading="lazy" src="https://root75.github.io/campin-public/messagerie/pas-a-pas/capture.webp?v=20261110" alt="Vue adaptée d’Outlook : À, Cc, Objet et corps du message."><p>Vue adaptée à partir de la capture fournie.</p></details>`+champPreuve(9);
 if(e===10)h+=`<p>Avant l’envoi, relis ton mail dans Outlook.</p><ul class="controle"><li><b>À</b> : l’adresse de ton camarade.</li><li><b>Cc</b> : ton professeur, ${nomProf()}, avec une adresse qui finit par @arcampin.be.</li><li><b>Objet</b> : il annonce ta question.</li><li>Le corps contient la salutation, la question du professeur, une formule de fin et ta signature (prénom, nom, classe).</li><li>Tu as relu l’orthographe : majuscule au début, point d’interrogation à la fin de ta question.</li></ul>`+COTE(true)+`<ol><li>Cherche les mots <b>soulignés en rouge</b> dans ton mail : Outlook pense qu’ils sont mal écrits.</li><li><span class="droit">🖱️ Clic <b>DROIT</b></span> (le bouton de <b>droite</b> de la souris) sur un mot souligné ▸ <b>Orthographe</b> ▸ clique sur le bon mot proposé. Un prénom souligné ? Laisse-le, il est juste.</li><li>Clique sur <b>Envoyer</b>.</li><li>Clique sur <b>Éléments envoyés</b>, à gauche, et ouvre ton mail : ton professeur doit apparaître dans la ligne Cc. S’il est encore dans <b>Brouillons</b>, il n’est pas parti.</li><li>Ton camarade te répond à l’étape 12. Pas de mail reçu chez lui ? Vérifiez ensemble <b>l’adresse dans la ligne À</b>.</li></ol>`+champPreuve(10);
 if(e===11)h+=`<p>Ouvre le mail reçu de ton camarade.</p>`+COTE_REPONSE()+`<ol><li>Lis <b>sa question</b> en entier.</li><li>Clique sur <b>Répondre à tous</b> (et pas Répondre) : ton professeur reste en Cc et reçoit ta réponse.</li><li>Garde l’<b>objet</b> de la conversation (« RE: »).</li><li>Dans le corps, salue ton camarade puis <b>réponds à sa question</b> par une phrase complète.</li><li>Ajoute une <b>formule de fin</b> et ta <b>signature</b>.</li><li>Relis, envoie, et vérifie dans <b>Éléments envoyés</b>. Vérifie aussi que tu as reçu sa réponse à ton premier mail.</li></ol><p class="note">Cette page ne voit pas Outlook. La vraie preuve, c’est ton professeur en Cc : il reçoit ton message et ta réponse.</p>`+champPreuve(11);
 if(e===7)h+=champPreuve(7);
 h+='<div id="retour" role="status" aria-live="polite" tabindex="-1"></div>';
 if(e===11&&state.atteint>=12)h+=FINI;
 h+='<div class="actions">'+(e>0?'<button type="button" class="secondaire" id="precedent">← Revenir</button>':'')+(e<=11?`<button type="button" id="suivant">${e===0?'Vérifier les deux parties de l’adresse':e===6?'Vérifier mon mail d’entraînement':'Vérifier cette étape'}</button>`:'<button type="button" id="revoir">Revoir mon entraînement</button>')+'</div>';
 z.innerHTML=h;
 casesAGestes(z,e);camembert();
 if(DEMOS_ETAPES[e]&&typeof Demo!=='undefined'&&DemoLecteur.sousCases)DemoLecteur.sousCases(z,DEMOS_ETAPES[e],Demo.cree,z);
 for(const el of z.querySelectorAll('input,textarea')){el.value=state[el.id]||'';el.addEventListener('input',()=>{state[el.id]=el.value;sauve();if(el.id==='reponse'||el.id==='nom'){const l=document.getElementById('criteres-reponse');if(l)l.outerHTML=listeCriteres();}document.getElementById('aperçu-courant').innerHTML=apercuCote();document.getElementById('retour').innerHTML='';document.getElementById('retour').className='';});}
 document.getElementById('ouvrir-reponse')?.addEventListener('click',()=>{document.getElementById('zone-reponse').hidden=false;document.getElementById('reponse').focus();});
 /* Étape 8 : une réponse déjà commencée se rouvre toute seule (retour sur l'étape, rechargement). */
 if(e===7&&state.reponse.trim())document.getElementById('zone-reponse').hidden=false;
 document.getElementById('precedent')?.addEventListener('click',()=>{state.etape--;state.preuve='';render();});
 document.getElementById('revoir')?.addEventListener('click',()=>{state.etape=6;render();});
 document.getElementById('suivant')?.addEventListener('click',async()=>{
  if(document.getElementById('suivant').disabled)return;
  /* Étape 8 : « Vérifier » sans avoir cliqué sur « Répondre à Camille ». La case de la réponse est encore fermée :
     on l'ouvre et on le dit, sans compter d'erreur ni reprocher une salutation que l'élève ne peut pas voir. */
  if(e===7&&document.getElementById('zone-reponse').hidden){
   document.getElementById('zone-reponse').hidden=false;
   const f=document.getElementById('retour');f.className='retour faux';
   f.innerHTML='<b>Écris d’abord ta réponse à Camille</b><p>La case « Corps de ta réponse » vient de s’ouvrir, plus haut. Écris-y ta réponse, puis clique de nouveau sur « Vérifier cette étape ».</p>';
   document.getElementById('reponse').focus();return;
  }
  const champs={0:['locale','domaine'],1:['a'],2:['objet'],3:['salutation'],4:['message'],5:['fin','signature'],7:['reponse'],8:['questionProf']}[e]||[];
  const err=e===6?erreurs(state):e===7?criteresReponse().filter(c=>c.err).map(c=>({champ:'reponse',texte:c.err})):champs.map(k=>({champ:k,texte:verifie(k)})).filter(x=>x.texte);
  const feedback=document.getElementById('retour');
  if(err.length){noteFaux(e,e===6?err.map(x=>x.champ).join(','):e===7?state.reponse:reponseCourte(e));feedback.className='retour faux';feedback.innerHTML='<b>À corriger</b><ul>'+err.map(x=>`<li>${escapeHtml(x.texte)}</li>`).join('')+'</ul>';feedback.focus();return;}
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
  if(SUIVI)window.eteintCloche?.('Étape validée : ma cloche est éteinte.');
  if(e===11){if(!document.getElementById('fini-avant'))feedback.insertAdjacentHTML('afterend',FINI);if(typeof PhraseFin!=='undefined'&&!document.querySelector('.citation')){const f=PhraseFin.figure(CITATION);if(f)feedback.after(f);}if(SUIVI)envoie({etape:12,type:'fini'}).catch(()=>{feedback.append(document.createTextNode(' La fin n’a pas pu être enregistrée : recharge avant de quitter.'));});avisFin();feedback.focus();return;}
  const suite=document.createElement('p');suite.textContent=e===6?'Tu peux maintenant lire la réponse fictive de Camille et lui répondre.':(e>=8?'Continue après avoir effectué la manipulation dans Outlook.':'Continue pour voir le mail se construire.');feedback.append(suite);
  const b=document.createElement('button');b.type='button';b.textContent=e===6?'Lire la réponse de Camille →':'Continuer →';b.addEventListener('click',()=>{if(JSON.stringify({...state,atteint:0})!==JSON.stringify({...JSON.parse(empreinte),atteint:0}))return;if((e===6?erreurs(state):champs.map(k=>({texte:verifie(k)})).filter(x=>x.texte)).length)return;state.etape++;state.preuve='';sauve();render();});feedback.append(b);b.focus();
 });
 document.getElementById('aperçu-courant').innerHTML=apercuCote();
 window.majCloche?.();
}
function init(){
 const sel=document.getElementById('choix-etape');TITRES.forEach((t,i)=>{const o=document.createElement('option');o.value=i;o.textContent=(i+1)+' — '+t;sel.append(o);});
 sel.addEventListener('change',()=>{if(Number(sel.value)>state.atteint)return;state.etape=Number(sel.value);state.preuve='';render();});
 document.getElementById('reset').addEventListener('click',()=>{if(!confirm('Effacer le brouillon sur ce poste ? Le journal professeur sera conservé.'))return;Object.assign(state,INITIAL);sauve();render();});
 render();
}

if(typeof module!=='undefined')module.exports={verifie,erreurs,corps,DEST};
const COURS='messagerie-1';
const APERCU=typeof location!=='undefined'&&/^#bloc=\d+$/.test(location.hash);
const SUIVI=!APERCU&&typeof google!=='undefined'&&!!google.script?.run;
const CLE='messagerie-01-v20261103';let repriseServeur=0,atteintServeur=0;
let identite='',classeScolaire='',preuves=null;const questionsEleve={};
/* Preuves 8 à 12 : trois variantes du même type ; le serveur donne à chaque élève la sienne (tirée de son adresse), pour éviter la recopie du voisin. Hors suivi : la variante 1. */
function questionPreuve(e){return questionsEleve[e]||preuves?.blocs?.[e]?.[0]||{q:'Réponds à la question de cette étape.',aide:''};}
function champPreuve(e){const q=questionPreuve(e);return champ('preuve',q.q,q.aide||'');}
const dejaValide=new Map(),dejaFaux=new Map();
/* localStorage : l'avancement survit à la fermeture de l'onglet (travail repris plus tard, hors séance). */
function stockage(){try{return localStorage;}catch(_){try{return sessionStorage;}catch(__){return null;}}}
function sauve(){if(APERCU)return;try{stockage()?.setItem(CLE+identite,JSON.stringify(state));}catch(_){}}
function rpc(n,...args){return new Promise((resolve,reject)=>{google.script.run.withSuccessHandler(resolve).withFailureHandler(()=>reject(new Error('Le suivi ne répond pas. Ta saisie reste ici ; réessaie avant de continuer.')))[n](...args);});}
function envoie(evt){return SUIVI?rpc('noter',COURS,evt):Promise.resolve();}
let humeurServeur='',avisServeur=null;
function zoneHA(id,debut){let z=document.getElementById(id);if(!z){z=document.createElement('div');z.id=id;z.hidden=true;const ind=document.getElementById('individuel');debut?ind.prepend(z):ind.append(z);}return z;}
function humeurDuJour(){if(APERCU||typeof HumeurAvis==='undefined')return;HumeurAvis.humeur(zoneHA('humeur',true),{valeur:humeurServeur,suivi:!!SUIVI,envoie:v=>envoie({etape:0,type:'humeur',reponse:v}).then(()=>{humeurServeur=v;})});}
function avisFin(){if(APERCU||typeof HumeurAvis==='undefined')return;HumeurAvis.avis(zoneHA('avis-fin',false),{valeur:avisServeur,suivi:!!SUIVI,envoie:a=>Promise.all(HumeurAvis.AVIS.map(([k])=>envoie({etape:12,type:'avis-'+k,reponse:a[k]}))).then(()=>{avisServeur=a;})});}
function regle(r,rep){const n=String(rep||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’']/g,"'").replace(/[«»"“”.]/g,'').replace(/\s+/g,' ').trim();return !!n&&(!r.egal||r.egal.some(x=>regleNorm(x)===n))&&(!r.exact||r.exact.includes(rep.trim().toLowerCase()))&&(!r.motif||new RegExp(r.motif).test(n))&&(!r.sauf||!new RegExp(r.sauf).test(n));}
function regleNorm(s){return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’']/g,"'").replace(/[«»"“”.]/g,'').replace(/\s+/g,' ').trim();}
function reponseCourte(e){return [state.locale+'@'+state.domaine,state.a,state.objet,state.salutation,state.message,state.fin+' | '+state.signature,state.objet,state.preuve,state.preuve,state.preuve,state.preuve,state.preuve][e];}
/* Une erreur repérée ici, sans aller au serveur : on la lui signale quand même, sinon le tableau
   (« Où le groupe bute — erreurs par bloc ») reste vide. Le serveur n'accepte de la page que « faux ». */
function noteFaux(e,rep){if(!SUIVI)return;const q=questionsEleve[e];const n=q&&preuves?preuves.blocs[e].indexOf(q)+1:1;envoie({etape:e+1,type:'faux',essais:1,reponse:('v'+n+':'+String(rep||'')).slice(0,190)}).catch(()=>{});}
async function valideServeur(e){
 const reponse=reponseCourte(e);
 if(!preuves)throw new Error('Les contrôles ne sont pas encore chargés. Recharge la page.');
 const q=e>=7?questionPreuve(e):preuves.blocs[e][0];
 if(!regle(q.regle,reponse)){noteFaux(e,reponse);throw new Error(q.faux);}
 if(dejaValide.get(e)===reponse)return;
 if(dejaFaux.get(e)===reponse)throw new Error('Modifie ta réponse avant de la vérifier à nouveau.');
 if(SUIVI){const actuel=await rpc('preuve',COURS,e+1);if(actuel?.q!==q.q)throw new Error('Le serveur utilise encore les anciens contrôles. Attends quelques minutes puis recharge ; ta réponse est conservée.');const r=await rpc('verifier',COURS,e+1,reponse,1);if(!r?.juste){dejaFaux.set(e,reponse);throw new Error(r?.texte||'La réponse n’a pas été validée.');}dejaValide.set(e,reponse);}
}
/* Le suivi peut caler quelques secondes (verrou du Journal, 12/11/2026) : on redemande etat() deux fois avant d'abandonner. */
async function etatSuivi(){let err;for(const d of [0,2000,5000]){if(d)await new Promise(ok=>setTimeout(ok,d));try{return await rpc('etat',COURS);}catch(e){err=e;}}throw err;}
async function demarre(){
 const status=document.getElementById('suivi-status');
 let quoi='les contrôles';
 try{
  const r=await fetch('https://root75.github.io/campin-public/messagerie/pas-a-pas/preuves.json?v=20261105b');if(!r.ok)throw Error();preuves=await r.json();
  if(SUIVI){quoi='le suivi du professeur';const etat=await etatSuivi();identite=':'+etat.email;classeScolaire=String(etat.classe||'').trim();repriseServeur=Number(etat.reprise)||0;atteintServeur=Math.min(12,Number(etat.atteint)||0);{const p=etat.plafond;plafond=p&&Number(p.bloc)>0?{bloc:Number(p.bloc),message:String(p.message||'')}:null;}humeurServeur=etat.humeur||'';avisServeur=etat.avis||null;status.textContent='Suivi professeur connecté. Les preuves courtes et demandes d’aide sont enregistrées.';envoie({etape:0,type:'ouvert'}).catch(()=>{});
   await Promise.all([7,8,9,10,11].map(async e=>{try{const a=await rpc('preuve',COURS,e+1);const v=preuves.blocs[e].find(x=>x.q===a?.q);if(v)questionsEleve[e]=v;}catch(_){}}));}
  else status.innerHTML='Entraînement libre : aucun résultat ni appel à l’aide transmis au professeur. Pour la séance suivie, <a href="https://script.google.com/a/macros/arcampin.be/s/AKfycbyOPTaq-L1PuittB1rkkiL9OOtShFc2WpiD8H_pH_INaw9ePWenCzhlIPlHu4zBOgLk/exec">ouvre ta séance scolaire</a>.';
  try{const saved=JSON.parse(stockage()?.getItem(CLE+identite)||'null');if(saved&&Number.isInteger(saved.etape)&&saved.etape>=0&&saved.etape<12){if(!SUIVI||Number(saved.reprise||0)===repriseServeur)Object.assign(state,saved);
   /* Le professeur a ramené l'élève à une étape (ex. 8) : on garde son brouillon, l'étape vient du serveur. */
   else if(atteintServeur>0)Object.assign(state,saved,{etape:0,atteint:0});}state.reprise=repriseServeur;}catch(_){}
  if(SUIVI&&classeScolaire)state.classe=classeScolaire;
  /* Autre poste, onglet fermé, travail à la maison : on reprend à l'étape validée sur le serveur. */
  if(SUIVI&&atteintServeur>state.atteint){state.atteint=atteintServeur;state.etape=Math.min(11,atteintServeur);}
  if(!APERCU&&state.atteint>0){document.getElementById('collectif').hidden=true;document.getElementById('individuel').hidden=false;document.getElementById('revoir-collectif').hidden=false;}
  if(APERCU){Object.assign(state,INITIAL);state.atteint=12;state.etape=Math.min(11,Math.max(0,Number(location.hash.slice(6))-1));document.getElementById('collectif').hidden=true;document.getElementById('individuel').hidden=false;document.getElementById('revoir-collectif').hidden=false;status.textContent='Aperçu du professeur : navigation libre, aucun résultat enregistré.';}
  init();humeurDuJour();if(state.atteint>=12||avisServeur)avisFin();document.body.dataset.pret='1';
 }catch(e){status.textContent='Impossible de charger '+quoi+'. Recharge la page (F5) ; aucun résultat n’est annoncé comme enregistré.';init();}
 document.getElementById('demarrer-individuel').onclick=()=>{document.getElementById('collectif').hidden=true;document.getElementById('individuel').hidden=false;document.getElementById('revoir-collectif').hidden=false;};
 document.getElementById('revoir-collectif').onclick=()=>{document.getElementById('collectif').hidden=false;document.getElementById('individuel').hidden=true;};
 /* La cloche 🔔 : protocole d'aide (relire, voisin), puis je sonne et je continue.
    Le professeur la voit au tableau ; quand il la réinitialise, elle s'éteint ici. */
 let aide=false,aideEtape=0;
 const zoneAide=document.getElementById('aide'),btnAide=document.getElementById('bloque'),texteAide=document.getElementById('aide-bloque');
 let minuterieInfo=null;
 function cloche(info){
  clearTimeout(minuterieInfo);if(info)minuterieInfo=setTimeout(()=>cloche(),6000);
  zoneAide.classList.toggle('active',aide);zoneAide.classList.toggle('info',!!info&&!aide);
  texteAide.textContent=info||(aide?'J’attends de l’aide (étape '+aideEtape+'). Je continue ailleurs. Débloqué ? Je re-clique.':'Relu ? Demandé au voisin ? Alors je sonne.');
  const mot=aide?'Je me suis débloqué':'Je bloque à l’étape '+(state.etape+1);
  btnAide.replaceChildren('🔔',Object.assign(document.createElement('span'),{className:'mot',textContent:mot}));btnAide.setAttribute('aria-label',mot);btnAide.title=aide?mot:'J’ai relu, demandé au voisin ? Je sonne.';
 }
 window.majCloche=()=>{if(!zoneAide.classList.contains('info'))cloche();};
 window.eteintCloche=info=>{if(!aide)return;aide=false;cloche(info);};
 /* Avant de sonner : avertissement et 3 sonneries par heure au plus (code commun pas-a-pas/cloche.js ;
    le serveur compte et refuse la 4e). Se débloquer ne demande rien et ne compte pas. */
 const commun=typeof Cloche!=='undefined';
 async function basculeCloche(){
  btnAide.disabled=true;
  try{
   if(SUIVI){const etape=aide?aideEtape:state.etape+1,type=aide?'aide-fin':'aide';
    await new Promise((ok,ko)=>google.script.run.withSuccessHandler(ok).withFailureHandler(ko).noter(COURS,{etape,type}));
    aide=!aide;aideEtape=etape;if(aide&&commun)Cloche.sonnee();cloche();}
   else cloche('Entraînement libre : la cloche n’est pas transmise. Appelle le professeur.');
  }catch(e){const m=String(e&&e.message||'');cloche(/sonneries/.test(m)?m.replace(/^(Exception|Error): /,''):'Cloche non transmise. Réessaie ou appelle le professeur.');}
  finally{btnAide.disabled=false;}
 }
 btnAide.onclick=function(){
  if(aide||!SUIVI||!commun){if(commun)Cloche.ferme(zoneAide);basculeCloche();return;}
  if(Cloche.ouvert(zoneAide)){Cloche.ferme(zoneAide);return;}
  Cloche.verifie({ancre:zoneAide,etape:'de l’étape '+(state.etape+1),
   info:new Promise(ok=>google.script.run.withSuccessHandler(ok).withFailureHandler(()=>ok(null)).cloches(COURS)),sonne:basculeCloche});
 };
 cloche();
 if(SUIVI){
  const relit=()=>{if(!aide||document.hidden)return;google.script.run.withSuccessHandler(r=>{if(r?.active===false)window.eteintCloche('Le professeur a réinitialisé ma cloche. Je peux sonner à nouveau.');}).withFailureHandler(()=>{}).etatAide(COURS);};
  google.script.run.withSuccessHandler(r=>{if(r?.active===true){aide=true;aideEtape=state.etape+1;cloche();}}).withFailureHandler(()=>{}).etatAide(COURS);
  setInterval(relit,15000);document.addEventListener('visibilitychange',relit);
 }
 if(SUIVI){window.PAS_A_PAS={cours:COURS,envoie,plafond:recoitPlafond,classe:'messagerie-scene',contenus:true,ecrans:ECRANS_SEQUENCE,
  horsSequence:()=>{document.getElementById('collectif').hidden=true;document.getElementById('individuel').hidden=false;document.getElementById('revoir-collectif').hidden=false;}};
  window.PasAPasSequence?.suivre(window.PAS_A_PAS);}
}
/* Mode séquence : le moteur commun pas-a-pas/sequence-eleve.js (depuis le 12/11/2026 ; avant, une copie à part).
   Un moment garde son écran propre au cours, rangé ici par titre du moment (sequences.json) ; « observe le mail » et
   « une adresse en trois parties » passent par le moteur commun depuis le 14/11 (champ « visuel » du moment). */
const ECRANS_SEQUENCE={
 'Quelle adresse pose problème ?':(zone,m,moi,{el,envoie,redessine,support})=>{
  const ouvert=m.phase==='ouvert';
  zone.append(el('h2','sq-grand',m.question),el('p','sq-note',ouvert?'À TOI DE TE POSITIONNER — coche toutes les adresses à écarter. La correction viendra avec le professeur.':m.phase==='clos'?'CHOIX FERMÉS — prépare ton explication orale.':'ENSEMBLE — lis la correction et explique le problème.'));
  const form=el('form','sq-adresses'),cases=[];zone.append(form);
  m.situations.forEach((adresse,k)=>{
   const ligne=el('div','sq-sit'),label=el('label','sq-case'),c=el('input');c.type='checkbox';c.checked=moi[k]===1;c.disabled=!ouvert||!!moi.soumis;c.setAttribute('aria-label','Écarter '+adresse);
   label.append(c,el('code',null,adresse));ligne.append(label);cases.push(c);
   if(m.bonnes){
    ligne.append(el('p','sq-res',m.bonnes[k]===1?'À écarter':'À utiliser'));
    const explication=support?.situations?.[k]?.explication;
    if(explication)ligne.append(el('p','sq-note',explication));
    if(moi.soumis)ligne.append(el('p','sq-note',moi[k]===m.bonnes[k]?'Ton choix correspond à la correction.':'Ton choix était différent : explique ce que tu corriges.'));
   }
   form.append(ligne);
  });
  const statut=el('p','sq-note',m.phase==='corrige'?'Correction collective affichée : prépare ton explication.':moi.soumis?'Choix enregistrés. Attends le signal du professeur.':'');statut.setAttribute('role','status');form.append(statut);
  if(!ouvert)return true;
  const b=el('button','sq-btn',moi.soumis?'Modifier mes choix':'Envoyer mes choix');b.type='submit';form.append(b);
  form.addEventListener('submit',async e=>{
   e.preventDefault();if(b.disabled)return;
   if(moi.soumis){moi.soumis=false;redessine();return;}
   b.disabled=true;cases.forEach(c=>c.disabled=true);statut.textContent='Enregistrement…';
   const choix=cases.map(c=>c.checked?1:0);
   if(moi.derniersChoix===choix.join(':')){moi.soumis=true;redessine();return;}
   try{await Promise.all(choix.map((j,k)=>envoie({etape:m.n,type:'vote',reponse:k+':'+j})));choix.forEach((j,k)=>moi[k]=j);moi.derniersChoix=choix.join(':');moi.soumis=true;redessine();}
   catch(_){b.disabled=false;cases.forEach(c=>c.disabled=false);statut.textContent='Envoi non confirmé. Garde tes choix et réessaie.';}
  });
  return true;}
};
if(typeof document!=='undefined')demarre();
if(typeof module!=='undefined')Object.assign(module.exports,{regle,reponseCourte});


