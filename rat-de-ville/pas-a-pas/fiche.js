/* Suivi déclaratif : seule une réponse positive du serveur confirme une sauvegarde.
   Hors Apps Script, aperçu libre sans stockage de compte sur le poste partagé. */
const COURS = 'rat-de-ville-formatif';
const ICONES = 'https://root75.github.io/campin-public/rat-de-ville/pas-a-pas/icones/';
const SUIVI = typeof google !== 'undefined' && google.script && google.script.run;
const $ = id => document.getElementById(id);
const txt = (tag, cls, t) => {const n=document.createElement(tag);if(cls)n.className=cls;if(t!=null)n.textContent=t;return n;};
let etat = {position:1,cases:{},moi:{},aide:null,etapes:[]}, pret=false, occupe=false;
function appel(evt){return new Promise((ok,ko)=>google.script.run.withSuccessHandler(ok).withFailureHandler(ko).suiviFormatif(COURS,evt));}
function commandes(){document.querySelectorAll('#etapes button,#travail input,#travail button,#aide-btn,#criteres select').forEach(n=>n.disabled=!pret||occupe);}
function calcule(){etat.etapes=ETAPES_RAT.map((e,i)=>e.actions.every((_,j)=>etat.cases[(i+1)+'.'+(j+1)]));}
function demo(evt){
  if(evt.type==='position')etat.position=evt.etape;
  if(evt.type==='case')etat.cases[evt.cle]=evt.fait;
  if(evt.type==='moi')etat.moi[evt.critere]=evt.lettre;
  if(evt.type==='aide')etat.aide={bloc:evt.etape};
  if(evt.type==='aide-fin')etat.aide=null;
  calcule();return etat;
}
async function sauve(evt){
  if(!pret||occupe)return;
  occupe=true;commandes();$('sauvegarde').textContent=SUIVI?'Enregistrement…':'Aperçu : essai sans sauvegarde scolaire.';
  try{
    etat=SUIVI?await appel(evt):demo(evt);
    $('sauvegarde').textContent=SUIVI?'Enregistré avec mon compte scolaire.':'Aperçu : rien n’est enregistré.';
  }catch(e){$('sauvegarde').textContent='Non enregistré. Réessaie la case ou le déplacement. '+(e.message||'Connexion indisponible.');}
  finally{occupe=false;dessine();}
}
function dessine(){
  const i=etat.position-1,b=ETAPES_RAT[i];
  $('etapes').replaceChildren(...ETAPES_RAT.map((e,j)=>{
    const n=txt('button','btn '+(i===j?'plein':'vide'),(j+1)+(etat.etapes[j]?' ✓':''));n.type='button';n.title=(j+1)+'. '+e.titre;n.setAttribute('aria-label',n.title+(etat.etapes[j]?' — déclaré terminé':''));if(j===i)n.setAttribute('aria-current','step');n.addEventListener('click',()=>sauve({type:'position',etape:j+1}));return n;
  }));
  const z=$('travail');z.replaceChildren(txt('p','numero','Période '+b.periode+' — '+(b.periode===1?'le texte':'la mise en forme')+' · '+b.min+' min'),txt('h2',null,etat.position+'. '+b.titre));
  const repere=REPERES_RAT[i];
  const observation=txt('aside','repere observation');
  observation.append(txt('h3',null,'À observer'),txt('p',null,repere.observe));
  if(i===5){
    const modele=txt('div','apercu-document');modele.setAttribute('aria-label','Modèle de présentation des trois zones');
    const titre=txt('p','exemple-titre','TITRE DE LA FABLE');
    const corps=txt('p','exemple-strophe','Les strophes sont centrées.');
    const auteur=txt('p','exemple-auteur','Jean de La Fontaine');modele.append(titre,corps,auteur);observation.append(modele);
  }
  if(i===6){const tableau=txt('table','repere-polices');const legende=txt('caption',null,'Police et taille attendues');tableau.append(legende);
    [['Strophes','Police','Taille'],['1 et 2','Garamond','14'],['3 et 4','Arial','12'],['5','Calibri','10'],['6 et 7','Arial Black','8']].forEach((ligne,k)=>{const tr=txt('tr');ligne.forEach(v=>tr.append(txt(k?'td':'th',null,v)));tableau.append(tr);});observation.append(tableau);}
  z.append(observation,txt('p','repere agir','À toi dans Docs — réalise les actions ci-dessous, puis coche celles que tu as terminées.'));
  if(b.consigne)z.append(txt('p','note',b.consigne));
  const ul=txt('ul','cases');b.actions.forEach((t,j)=>{
    const cle=etat.position+'.'+(j+1),li=txt('li'),lab=txt('label'),cb=txt('input');cb.type='checkbox';cb.dataset.cle=cle;cb.checked=!!etat.cases[cle];
    cb.addEventListener('change',()=>sauve({type:'case',etape:i+1,cle,fait:cb.checked}));const sp=txt('span');((b.icones&&b.icones[j])||[]).forEach(ico=>{const im=txt('img','ico');im.src=ICONES+ico+'.png';im.alt='';sp.append(im);});sp.append(t);lab.append(cb,sp);li.append(lab);
    const aide=b.aides && b.aides[j];
    if(aide){const d=txt('details');d.append(txt('summary',null,aide.titre),txt('p',null,aide.explication),txt('blockquote',null,aide.exemple),txt('p','note',aide.rappel));li.append(d);}
    ul.append(li);
  });z.append(ul);
  const controle=txt('aside','repere verification');controle.append(txt('h3',null,'À vérifier dans ton document'),txt('p',null,repere.verifie),txt('p','note',repere.encouragement));z.append(controle);
  if(i===1||i===8){const lien=txt('a','btn vide',i===1?'Voir le texte à recopier':'Voir la grille et remplir « Moi »');lien.href=i===1?'#texte':'#grille';lien.addEventListener('click',()=>{$(i===1?'texte':'grille').open=true;});z.append(lien);}
  const nav=txt('div','actions');for(const [delta,label] of [[-1,'← Étape précédente'],[1,'Étape suivante →']]){
    if(i+delta<0||i+delta>8)continue;const n=txt('button','btn vide',label);n.type='button';n.addEventListener('click',()=>sauve({type:'position',etape:i+delta+1}));nav.append(n);
  }z.append(nav,txt('p','note','Je peux continuer même si une case reste vide. Je coche quand j’ai terminé ; le professeur examine mon document.'));
  $('aide').classList.toggle('active',!!etat.aide);
  $('aide-texte').textContent=etat.aide?'Blocage signalé à l’étape '+etat.aide.bloc+'. Je peux continuer ailleurs.':'Toujours bloqué après la relecture et le voisin ?';
  $('aide-btn').textContent=etat.aide?'Je me suis débloqué':'Je bloque à l’étape '+etat.position;
  document.querySelectorAll('[data-critere]').forEach(n=>{n.value=etat.moi[n.dataset.critere]||'';});commandes();
}
$('aide-btn').addEventListener('click',()=>sauve({type:etat.aide?'aide-fin':'aide',etape:etat.aide?etat.aide.bloc:etat.position}));
$('compact').addEventListener('click',()=>{const actif=document.body.classList.toggle('compact');$('compact').setAttribute('aria-pressed',String(actif));});
const boutons=[['centrer','Centrer','Ctrl + Maj + E','Bouton « Aligner » ▾ de la barre d’outils'],['droite','Aligner à droite','Ctrl + Maj + R','Même bouton « Aligner » ▾'],['gras','Gras','Ctrl + B','Barre d’outils, après la taille'],['italique','Italique','Ctrl + I','Juste à côté du gras'],['souligne','Souligner','Ctrl + U','Juste à côté de l’italique'],['','MAJUSCULES','—','Format ▸ Texte ▸ Minuscules/majuscules ▸ MAJUSCULES'],['police','Changer la police','—','Le menu qui affiche le nom de la police'],['taille','Changer la taille','—','La case du nombre, avec – et +'],['puces','Liste à puces','Ctrl + Maj + 8','Barre d’outils, à droite'],['numeros','Liste numérotée','Ctrl + Maj + 7','Juste à côté des puces'],['orthographe','Vérifier l’orthographe','Ctrl + Alt + X','Barre d’outils, à gauche, à côté de l’imprimante']];
boutons.forEach(([ico,nom,racc,ou])=>{const tr=txt('tr'),td=txt('td');if(ico){const img=txt('img');img.src=ICONES+ico+'.png';img.alt='';td.append(img);}td.append(nom);tr.append(td,txt('td',null,racc),txt('td',null,ou));$('mes-boutons').append(tr);});
GRILLE_RAT.forEach((c,i)=>{
  const tr=txt('tr'),th=txt('th'),td=txt('td'),sel=txt('select');th.scope='row';th.append(txt('b',null,c.n+(c.inc?' ★':'')),txt('p',null,c.regarde));sel.dataset.critere=i+1;sel.setAttribute('aria-label','Moi — critère '+(i+1));['','A','B','C','D'].forEach(v=>{const o=txt('option',null,v||'À choisir');o.value=v;sel.append(o);});sel.addEventListener('change',()=>sauve({type:'moi',etape:etat.position,critere:i+1,lettre:sel.value}));td.append(sel);tr.append(th,td,...['A','B','C','D'].map(k=>txt('td',null,c[k])));$('criteres').append(tr);
});
async function demarre(){
  try{
    if(SUIVI){etat=await appel(null);etat=await appel({type:'position',etape:etat.position});$('qui').textContent='Connecté : '+etat.email+' · '+etat.classe;$('sauvegarde').textContent='Progression retrouvée. Mes cases et ma place sont conservées entre les périodes.';}
    else{const m=/#bloc=(\d+)/.exec(location.hash);if(m)etat.position=Math.max(1,Math.min(9,Number(m[1])));$('qui').textContent='Aperçu libre — ouvrir Mes cours avec le compte scolaire pour retrouver sa progression.';$('sauvegarde').textContent='Aperçu : rien n’est enregistré.';}
    pret=true;dessine();
  }catch(e){$('qui').textContent='Suivi indisponible.';$('sauvegarde').textContent='Progression non chargée : '+e.message;const b=txt('button','btn vide','Réessayer le chargement');b.addEventListener('click',()=>{b.remove();demarre();});$('travail').replaceChildren(b);commandes();b.disabled=false;}
}
demarre();

// Le repère collectif ne déplace jamais la progression individuelle.
let lectureCollectif=false;
async function actualiseCollectif(){
  if(lectureCollectif||!$('collectif').open||document.hidden)return;
  if(!SUIVI){$('collectif-statut').textContent='Le repère de ta classe est disponible avec ton compte scolaire.';return;}
  lectureCollectif=true;
  try{
    const r=await new Promise((ok,ko)=>google.script.run.withSuccessHandler(ok).withFailureHandler(ko).repereEleveFormatif(COURS));
    const support=$('collectif-support');support.replaceChildren();
    if(!r){$('collectif-statut').textContent='Aucun repère collectif enregistré pour ta classe.';return;}
    const e=ETAPES_RAT[r.etape-1];if(!e)throw new Error('Repère invalide');
    support.append(txt('h3',null,r.etape+'. '+e.titre),txt('p',null,r.rappel),txt('p','repere observation',REPERES_RAT[r.etape-1].observe));
    $('collectif-statut').textContent='Repère du professeur · période '+e.periode+' · ta place personnelle ne change pas.';
  }catch(e){$('collectif-support').replaceChildren();$('collectif-statut').textContent='Repère indisponible. Réessaie avec Actualiser le repère. Tu peux poursuivre ton travail.';}
  finally{lectureCollectif=false;}
}
$('collectif').addEventListener('toggle',actualiseCollectif);
$('collectif-actualiser').addEventListener('click',actualiseCollectif);
document.addEventListener('visibilitychange',actualiseCollectif);
setInterval(actualiseCollectif,30000);
