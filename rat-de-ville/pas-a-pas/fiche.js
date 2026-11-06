/* Suivi déclaratif : seule une réponse positive du serveur confirme une sauvegarde.
   Hors Apps Script, aperçu libre sans stockage de compte sur le poste partagé. */
const COURS = 'rat-de-ville-formatif';
const BASE = 'https://root75.github.io/campin-public/rat-de-ville/pas-a-pas/', ICONES = BASE + 'icones/';
const SUIVI = typeof google !== 'undefined' && google.script && google.script.run;
const $ = id => document.getElementById(id);
const txt = (tag, cls, t) => {const n=document.createElement(tag);if(cls)n.className=cls;if(t!=null)n.textContent=t;return n;};
let etat = {position:1,cases:{},moi:{},aide:null,etapes:[]}, pret=false, occupe=false, vueGrille=false, repriseVue=false;
/* La grille est l'étape finale, sans case : elle se range hors de la page tant qu'on ne l'affiche pas. */
const GRILLE=$('grille');GRILLE.remove();GRILLE.hidden=false;
/* Numéro interne d'une étape (id, celui des clés « 6.1 » et du Journal) ↔ sa place à l'écran. */
const place=id=>ETAPES_RAT.findIndex(e=>e.id===Number(id));
const numero=id=>place(id)>=0?place(id)+1:id;
/* Étapes terminées : toujours calculées ici, depuis les cases ; le serveur ne fait que les garder. */
function prepare(r){r.cases=r.cases||{};r.etapes=ETAPES_RAT.map(e=>e.actions.every((_,j)=>r.cases[e.id+'.'+(j+1)]));return r;}
function appel(evt){return new Promise((ok,ko)=>google.script.run.withSuccessHandler(r=>ok(prepare(r))).withFailureHandler(ko).suiviFormatif(COURS,evt));}
async function envoieHumeurAvis(evt){const r=SUIVI?await appel(evt):demo(evt);if(!occupe)etat=r;return r;}
function humeurDuJour(){if(typeof HumeurAvis==='undefined')return;HumeurAvis.humeur($('humeur'),{valeur:etat.humeur,suivi:!!SUIVI,envoie:v=>envoieHumeurAvis({type:'humeur',reponse:v})});}
function commandes(){document.querySelectorAll('#etapes button,#travail input,#travail button,#travail select,#aide-btn').forEach(n=>n.disabled=!pret||occupe);}
function calcule(){prepare(etat);}
function demo(evt){
  if(evt.type==='position')etat.position=evt.etape;
  if(evt.type==='case')etat.cases[evt.cle]=evt.fait;
  if(evt.type==='moi')etat.moi[evt.critere]=evt.lettre;
  if(evt.type==='aide')etat.aide={bloc:evt.etape};
  if(evt.type==='aide-fin')etat.aide=null;
  if(evt.type==='humeur')etat.humeur=evt.reponse;
  if(evt.type==='avis')etat.avis=evt.avis;
  calcule();return etat;
}
async function sauve(evt){
  if(!pret||occupe)return;
  if(evt.type==='position')vueGrille=false;
  occupe=true;commandes();$('sauvegarde').textContent=SUIVI?'Enregistrement…':'Aperçu : essai sans sauvegarde scolaire.';
  try{
    const avant=(etat.etapes||[]).slice();
    etat=SUIVI?await appel(evt):demo(evt);
    $('sauvegarde').textContent=SUIVI?'Enregistré avec mon compte scolaire.':'Aperçu : rien n’est enregistré.';
    if(evt.type==='case'&&evt.fait){const j=place(evt.etape);if(etat.etapes[j]&&!avant[j])fete(j);else bravo(BRAVOS[Math.floor(Math.random()*BRAVOS.length)],false);}
  }catch(e){$('sauvegarde').textContent='Non enregistré. Réessaie la case ou le déplacement. '+(e.message||'Connexion indisponible.');}
  finally{occupe=false;dessine();}
}
function dessine(){
  const i=Math.max(0,place(etat.position)),b=ETAPES_RAT[i];arreteAutres();
  $('etapes').replaceChildren(...ETAPES_RAT.map((e,j)=>{
    const faites=e.actions.filter((_,k)=>etat.cases[e.id+'.'+(k+1)]).length;
    const n=txt('button',etat.etapes[j]?'fini':'',etat.etapes[j]?'✓':String(j+1));n.style.setProperty('--p',Math.round(100*faites/e.actions.length));n.type='button';n.title=(j+1)+'. '+e.titre;n.setAttribute('aria-label',n.title+(etat.etapes[j]?' — déclaré terminé':''));if(j===i&&!vueGrille)n.setAttribute('aria-current','step');n.addEventListener('click',()=>sauve({type:'position',etape:e.id}));return n;
  }));
  const g=txt('button','grille-etape','📋');g.type='button';g.title='Ma grille d’évaluation';g.setAttribute('aria-label',g.title);if(vueGrille)g.setAttribute('aria-current','step');g.addEventListener('click',()=>{vueGrille=true;dessine();});$('etapes').append(g);
  const z=$('travail');
  if(vueGrille){dessineGrille(z);return;}z.replaceChildren(txt('p','numero','Période '+b.periode+' — '+(b.periode===1?'le texte':'la mise en forme')+' · '+b.min+' min'),txt('h2',null,(i+1)+'. '+b.titre));
  if(repriseVue)z.prepend(reprise());
  entreEtape(i,b);
  const repere=REPERES_RAT[i];
  const observation=txt('aside','repere observation');
  observation.append(txt('h3',null,'À observer'),txt('p',null,repere.observe));
  if(b.id===6){
    const modele=txt('div','apercu-document');modele.setAttribute('aria-label','Modèle de présentation des trois zones');
    const titre=txt('p','exemple-titre','TITRE DE LA FABLE');
    const corps=txt('p','exemple-strophe','Les strophes sont centrées.');
    const auteur=txt('p','exemple-auteur','Jean de La Fontaine');modele.append(titre,corps,auteur);observation.append(modele);
  }
  if(b.id===7){const tableau=txt('table','repere-polices');const legende=txt('caption',null,'Police et taille attendues');tableau.append(legende);
    [['Strophes','Police','Taille'],['1 et 2','Garamond','14'],['3 et 4','Arial','12'],['5','Calibri','10'],['6 et 7','Arial Black','8']].forEach((ligne,k)=>{const tr=txt('tr');ligne.forEach(v=>tr.append(txt(k?'td':'th',null,v)));tableau.append(tr);});observation.append(tableau);}
  z.append(observation,txt('p','agir','✋ À moi dans Docs ! Je fais, puis je coche.'),txt('p','note annuler','Je me suis trompé ? Tout de suite : ↶ Annuler (Ctrl + Z), la flèche tout à gauche de la barre d’outils.'));
  if(b.consigne)z.append(txt('p','note',b.consigne));
  const ul=txt('ul','cases');b.actions.forEach((t,j)=>{
    const cle=b.id+'.'+(j+1),li=txt('li'),lab=txt('label'),cb=txt('input');cb.type='checkbox';cb.dataset.cle=cle;cb.checked=!!etat.cases[cle];
    cb.addEventListener('change',()=>sauve({type:'case',etape:b.id,cle,fait:cb.checked}));const sp=txt('span');((b.icones&&b.icones[j])||[]).forEach(ico=>{const im=txt('img','ico');im.src=ICONES+ico+'.png';im.alt='';sp.append(im);});sp.append(t);lab.append(cb,sp);li.append(lab);
    const dc=demoCase(i,j);if(dc)li.append(dc);
    const image=b.images&&b.images[j];if(image){const im=txt('img','extrait');im.src=BASE+image;im.alt='Extrait de la fable à recopier';li.append(im);}
    const aide=b.aides && b.aides[j];
    if(aide){const d=txt('details');d.append(txt('summary',null,aide.titre),txt('p',null,aide.explication),txt('blockquote',null,aide.exemple),txt('p','note',aide.rappel));if(aide.image){const im=txt('img','capture');im.src=BASE+aide.image;im.alt='Menu Format ▸ Texte ▸ Minuscules/majuscules ▸ MAJUSCULES dans Docs';d.append(im);}li.append(d);}
    ul.append(li);
  });z.append(ul);
  const controle=txt('aside','repere verification');controle.append(txt('h3',null,'À vérifier dans mon document'),txt('p',null,repere.verifie),txt('p','note',repere.encouragement));z.append(controle);
  if(b.id===2){const lien=txt('a','btn vide','Voir le texte à recopier');lien.href='#texte';lien.addEventListener('click',()=>{$('texte').open=true;});z.append(lien);}
  const nav=txt('div','actions');for(const [delta,label] of [[-1,'← Étape précédente'],[1,'Étape suivante →']]){
    if(i+delta<0)continue;
    if(i+delta>=ETAPES_RAT.length){const n=txt('button','btn vide','Ma grille d’évaluation →');n.type='button';n.addEventListener('click',()=>{vueGrille=true;dessine();scrollTo(0,0);});nav.append(n);continue;}
    const n=txt('button','btn vide',label);n.type='button';n.addEventListener('click',()=>sauve({type:'position',etape:ETAPES_RAT[i+delta].id}));nav.append(n);
  }z.append(sonnerie(),nav,txt('p','note','Je peux continuer même si une case reste vide. Je coche quand j’ai terminé ; le professeur examine mon document.'));
  cloche();coince();progression();commandes();
}
/* « Ça coince ? » : seulement les aides de l'étape affichée (et « Je me trompe »), sauf si l'élève demande tout. */
let coinceTout=false;
function coince(){
  const n=vueGrille?0:etat.position;
  document.querySelectorAll('.coince section[data-etapes]').forEach(g=>{const e=g.dataset.etapes.split(' ');g.hidden=!(coinceTout||!n||e.includes('tout')||e.includes(String(n)));});
  $('coince-etape').textContent=coinceTout||!n?'Toutes les aides.':'Les aides de l’étape '+numero(n)+'.';
  $('coince-tout').textContent=coinceTout?'Seulement mon étape':'Voir toutes les aides';
}
$('coince-tout').addEventListener('click',()=>{coinceTout=!coinceTout;coince();});
function cloche(){
  $('aide').classList.toggle('active',!!etat.aide);
  $('aide-texte').textContent=etat.aide?'J’attends de l’aide (étape '+numero(etat.aide.bloc)+'). Je continue ailleurs. Débloqué ? Je re-clique.':'Relu ? Demandé au voisin ? Alors je sonne.';
  const mot=etat.aide?'Je me suis débloqué':'Je bloque à l’étape '+numero(etat.position);
  $('aide-btn').replaceChildren('🔔',txt('span','mot',mot));$('aide-btn').setAttribute('aria-label',mot);
}
function dessineGrille(z){
  z.replaceChildren(txt('p','numero','Étape finale · après mes '+ETAPES_RAT.length+' étapes'),txt('h2',null,'Ma grille d’évaluation'),txt('p','agir','Pour chaque critère, je lis les colonnes A à D. Je choisis ma lettre dans « Moi ».'),GRILLE);
  GRILLE.querySelectorAll('[data-critere]').forEach(n=>{n.value=etat.moi[n.dataset.critere]||'';});
  if(typeof HumeurAvis!=='undefined'){const av=txt('div');HumeurAvis.avis(av,{valeur:etat.avis,suivi:!!SUIVI,classeBouton:'btn',envoie:a=>envoieHumeurAvis({type:'avis',avis:a})});z.append(av);}
  const nav=txt('div','actions'),n=txt('button','btn vide','← Étape '+ETAPES_RAT.length);n.type='button';n.addEventListener('click',()=>sauve({type:'position',etape:ETAPES_RAT[ETAPES_RAT.length-1].id}));nav.append(n);z.append(nav);
  cloche();coince();progression();commandes();
}
/* Encouragements : chaque mission cochée, chaque étape terminée. */
const BRAVOS=['Bravo !','Super, une mission de plus !','Bien joué !','Continue comme ça !','Yes ! 🧀','Ça avance !','Top !'];
const BULLES=['Salut ! On va mettre une fable en forme, mission par mission.','Bon début ! Regarde bien les démos.','Tu es lancé(e) !','Déjà la moitié ! Le rat est fier de toi.','Presque fini, courage !','Tout est coché : bravo ! Il reste à remettre dans Classroom.'];
let minuterieBravo=null;
function bravo(t,grand){const b=$('bravo');b.textContent=t;b.classList.toggle('grand',!!grand);b.classList.add('vu');clearTimeout(minuterieBravo);minuterieBravo=setTimeout(()=>b.classList.remove('vu'),grand?3200:1600);
  const m=$('mascotte');if(m){m.classList.remove('saute');void m.offsetWidth;m.classList.add('saute');}}
function fete(j){bravo('⭐ Étape '+(j+1)+' réussie : « '+ETAPES_RAT[j].titre+' » !',true);
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const couleurs=['#ffcf3f','#2fa36b','#e3a922','#7cc3de','#f2a7b5','#e8742a'];
  for(let k=0;k<40;k++){const c=document.createElement('span');c.className='confetti';c.style.left=Math.random()*100+'vw';c.style.background=couleurs[k%couleurs.length];c.style.animationDelay=(Math.random()*.5)+'s';c.style.animationDuration=(1.2+Math.random())+'s';document.body.append(c);setTimeout(()=>c.remove(),2800);}}
function progression(){
  const total=ETAPES_RAT.reduce((n,e)=>n+e.actions.length,0);
  const faites=ETAPES_RAT.reduce((n,e)=>n+e.actions.filter((_,k)=>etat.cases[e.id+'.'+(k+1)]).length,0);
  const etapes=(etat.etapes||[]).filter(Boolean).length;
  $('jauge').style.width=Math.round(100*faites/total)+'%';
  $('progres-texte').textContent='🧀 '+faites+' / '+total+' missions';
  $('progres-etapes').textContent=etapes+' / '+ETAPES_RAT.length+' étapes';
  const r=faites/total;$('bulle').textContent=BULLES[r===1?5:r>=.8?4:r>=.5?3:r>=.2?2:r>0?1:0];
}
/* « Regarde comment faire » sous chaque case : champ « demos » de l'étape (contenu.js), même format
   que le moteur commun blocs.js ; le lecteur est pas-a-pas/demo-lecteur.js. Une démo par case, gardée
   d'un affichage à l'autre (cocher ne la relance pas, les cases restent enregistrées). Une seule ouverte
   à la fois ; en arrivant sur une étape, celle de la première case pas encore cochée s'ouvre et joue. */
const demos={},ouverts=new Set();let etapeVue=null;
const demoDe=(i,j)=>typeof Demo!=='undefined'&&ETAPES_RAT[i].demos&&ETAPES_RAT[i].demos[j+1];
function entreEtape(i,b){
  if(etapeVue===i)return;etapeVue=i;
  ouverts.forEach(c=>demos[c]&&demos[c].stop());ouverts.clear();
  if(typeof Demo==='undefined')return;
  const j=b.actions.findIndex((_,k)=>!etat.cases[b.id+'.'+(k+1)]&&demoDe(i,k));
  if(j>=0&&!repriseVue)ouverts.add(i+'.'+j); // pas deux animations à la fois avec l'encadré « Je reprends »
}
function demoCase(i,j){
  const v=demoDe(i,j);if(!v)return null;
  const cle=i+'.'+j;
  if(!demos[cle])demos[cle]=Demo.cree(v[0],ouverts.has(cle),v[1]);
  if(!demos[cle])return null;
  const d=txt('details','demo-case');d.dataset.demo=cle;
  d.open=ouverts.has(cle);d.append(txt('summary',null,'👀 Regarde comment faire'),demos[cle]);
  d.addEventListener('toggle',()=>{
    if(d.open&&!ouverts.has(cle)){ouverts.forEach(c=>{demos[c].stop();const x=document.querySelector('details.demo-case[data-demo="'+c+'"]');if(x)x.open=false;});ouverts.clear();ouverts.add(cle);demos[cle].joue();}
    else if(!d.open&&ouverts.has(cle)){ouverts.delete(cle);demos[cle].stop();}
  });
  return d;
}
/* Fermer et rouvrir ne sont plus des étapes : chacun le fait à la sonnerie, où qu'il en soit.
   « À la sonnerie » : sous chaque étape. « Je reprends » : en haut, à la réouverture du cours
   (déjà des cases cochées et plus de 5 min sans action), ou par le bouton de l'encadré. Pas de case. */
let autresActifs=[];
function arreteAutres(){autresActifs.forEach(x=>x.stop());autresActifs=[];}
function demoAutre(cle){
  if(typeof Demo==='undefined')return txt('span');
  const d=txt('details','demo-case');let box=null;d.append(txt('summary',null,'👀 Regarde comment faire'));
  d.addEventListener('toggle',()=>{if(d.open){if(!box){box=Demo.cree(cle,false);d.append(box);}autresActifs.push(box);setTimeout(()=>box.joue(),80);}else if(box)box.stop();});
  return d;
}
function sonnerie(){
  const a=txt('aside','repere sonnerie');
  a.append(txt('h3',null,'🔔 À la sonnerie, où que j’en sois'),txt('p',null,'Je ferme l’onglet de mon document. Je ne remets PAS : Docs l’enregistre tout seul.'),demoAutre('fermer'));
  const b=txt('button','lien','▶ Je reviens après la sonnerie : je reprends mon document');b.type='button';
  b.addEventListener('click',()=>{repriseVue=true;dessine();scrollTo(0,0);});a.append(b);return a;
}
function reprise(){
  const k=aReprendre(),box=txt('aside','repere reprise'),ol=txt('ol');
  box.append(txt('h3',null,'▶ Je reprends mon travail'));
  [['Menu Google (la gaufre) ▸ Drive ▸ Récents ▸ double-clic sur mon document.','retrouver'],
   ['Je place mon document à côté du cours : je clique sur l’onglet du cours, puis clic droit sur l’onglet de mon document ▸ Ajouter l’onglet à une nouvelle vue fractionnée.','cote']]
    .forEach(([t,cle])=>{const li=txt('li',null,t);li.append(demoAutre(cle));ol.append(li);});
  const b=txt('button','btn','C’est fait : je reprends à l’étape '+(k+1)+' — '+ETAPES_RAT[k].titre);b.type='button';
  b.addEventListener('click',()=>{repriseVue=false;etapeVue=null;const id=ETAPES_RAT[k].id;if(id===etat.position&&!vueGrille)dessine();else sauve({type:'position',etape:id});scrollTo(0,0);});
  box.append(ol,b);return box;
}
/* La première étape pas encore terminée (sa place), sinon la dernière. */
function aReprendre(){const k=ETAPES_RAT.findIndex((_,j)=>!etat.etapes[j]);return k<0?ETAPES_RAT.length-1:k;}
/* Volet « Toutes les animations » (pas-a-pas/demo-lecteur.js) : retrouver n'importe quel tuto sans changer d'étape. */
(function(){const liste=$('tutos-liste'),vue=$('tutos-vue');if(!liste||typeof Demo==='undefined')return;
  DemoLecteur.volet({details:$('tutos'),liste,vue,titre:true,cree:Demo.cree,
    entrees:ETAPES_RAT.map((e,i)=>['etape'+e.id,(i+1)+'. '+e.titre]).concat([['retrouver','Je retrouve mon document (reprise)'],['cote','Le cours et mon document côte à côte'],['fermer','À la sonnerie : je ferme sans remettre']])});})();
$('aide-btn').addEventListener('click',()=>sauve({type:etat.aide?'aide-fin':'aide',etape:etat.aide?etat.aide.bloc:etat.position}));
$('compact').addEventListener('click',()=>{const actif=document.body.classList.toggle('compact');$('compact').setAttribute('aria-pressed',String(actif));});
const boutons=[['','↶ Annuler (dès que je me trompe)','Ctrl + Z','Barre d’outils, tout à gauche : la flèche ↶'],['centrer','Centrer','Ctrl + Maj + E','Bouton « Aligner » ▾ de la barre d’outils'],['droite','Aligner à droite','Ctrl + Maj + R','Même bouton « Aligner » ▾'],['gras','Gras','Ctrl + B','Barre d’outils, après la taille'],['italique','Italique','Ctrl + I','Juste à côté du gras'],['souligne','Souligner','Ctrl + U','Juste à côté de l’italique'],['','MAJUSCULES','—','Format ▸ Texte ▸ Minuscules/majuscules ▸ MAJUSCULES'],['police','Changer la police','—','Le menu qui affiche le nom de la police'],['taille','Changer la taille','—','La case du nombre, avec – et +'],['puces','Liste à puces','Ctrl + Maj + 8','Barre d’outils, à droite'],['numeros','Liste numérotée','Ctrl + Maj + 7','Juste à côté des puces'],['orthographe','Vérifier l’orthographe','Ctrl + Alt + X','Barre d’outils, à gauche, à côté de l’imprimante']];
boutons.forEach(([ico,nom,racc,ou])=>{const tr=txt('tr'),td=txt('td');if(ico){const img=txt('img');img.src=ICONES+ico+'.png';img.alt='';td.append(img);}td.append(nom);tr.append(td,txt('td',null,racc),txt('td',null,ou));$('mes-boutons').append(tr);});
GRILLE_RAT.forEach((c,i)=>{
  const tr=txt('tr'),th=txt('th'),td=txt('td'),sel=txt('select');th.scope='row';th.append(txt('b',null,c.n+(c.inc?' ★':'')),txt('p',null,c.regarde));sel.dataset.critere=i+1;sel.setAttribute('aria-label','Moi — critère '+(i+1));['','A','B','C','D'].forEach(v=>{const o=txt('option',null,v||'À choisir');o.value=v;sel.append(o);});sel.addEventListener('change',()=>sauve({type:'moi',etape:etat.position,critere:i+1,lettre:sel.value}));td.append(sel);tr.append(th,td,...['A','B','C','D'].map(k=>txt('td',null,c[k])));GRILLE.querySelector('#criteres').append(tr);
});
async function demarre(){
  try{
    if(SUIVI){etat=await appel(null);const derniere=Number(etat.derniere)||0,deja=Object.values(etat.cases).some(Boolean);
      if(place(etat.position)<0)etat.position=ETAPES_RAT[aReprendre()].id; // ancienne étape 4 ou 5
      etat=await appel({type:'position',etape:etat.position});repriseVue=deja&&Date.now()-derniere>5*60000;$('qui').textContent='Connecté : '+etat.email+' · '+etat.classe;$('sauvegarde').textContent='Progression retrouvée. Mes cases et ma place sont conservées entre les périodes.';}
    else{const m=/#bloc=(\d+)/.exec(location.hash);if(m&&place(m[1])>=0)etat.position=Number(m[1]);calcule();repriseVue=/reprise/.test(location.hash);$('qui').textContent='Aperçu libre — ouvrir Mes cours avec le compte scolaire pour retrouver sa progression.';$('sauvegarde').textContent='Aperçu : rien n’est enregistré.';}
    pret=true;humeurDuJour();dessine();
  }catch(e){$('qui').textContent='Suivi indisponible.';$('sauvegarde').textContent='Progression non chargée : '+e.message;const b=txt('button','btn vide','Réessayer le chargement');b.addEventListener('click',()=>{b.remove();demarre();});$('travail').replaceChildren(b);commandes();b.disabled=false;}
}
demarre();

/* La cloche peut être remise à zéro par le professeur : tant qu'elle sonne, je relis mon état. */
async function relitCloche(){
  if(!SUIVI||!pret||occupe||document.hidden||!etat.aide)return;
  try{const r=await appel(null);if(!occupe&&!r.aide){etat=r;dessine();$('sauvegarde').textContent='Le professeur a réinitialisé ma cloche.';}}catch(e){}
}
setInterval(relitCloche,20000);
document.addEventListener('visibilitychange',relitCloche);
