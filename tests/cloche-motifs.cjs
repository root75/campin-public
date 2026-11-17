/* Cloche : un bouton par motif, chacun sonne (deux clics en tout). « accord » seulement si la fiche le demande. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const racine=path.join(__dirname,'..'),lis=f=>fs.readFileSync(path.join(racine,f),'utf8');
function noeud(tag){
  const n={tag,enfants:[],classes:new Set(),dataset:{},attrs:{},ecoute:{},hidden:false,textContent:'',
    set className(v){n.classes=new Set(String(v).split(' ').filter(Boolean));},get className(){return [...n.classes].join(' ');},
    classList:{add:c=>n.classes.add(c),remove:c=>n.classes.delete(c),toggle:(c,on)=>on?n.classes.add(c):n.classes.delete(c),contains:c=>n.classes.has(c)},
    setAttribute:(k,v)=>{n.attrs[k]=v;},append:(...l)=>{n.enfants.push(...l);},replaceChildren:(...l)=>{n.enfants=l;},
    addEventListener:(t,f)=>{n.ecoute[t]=f;},focus:()=>{n.focus.vu=true;},click:()=>n.ecoute.click&&n.ecoute.click(),
    tous:()=>n.enfants.flatMap(x=>[x,...x.tous()]),
    querySelector:sel=>n.tous().find(x=>x.classes.has(sel.slice(1)))||null};
  return n;
}
const document={createElement:noeud,head:noeud('head'),addEventListener(){},querySelectorAll:()=>[]};
const c=vm.createContext({document,Date});
vm.runInContext(lis('pas-a-pas/cloche.js')+';this.Cloche=Cloche;',c);
const Cloche=c.Cloche;
const boutons=ancre=>ancre.tous().filter(x=>x.tag==='button');
(async()=>{
  /* Deux motifs par défaut, plus « Pas encore ». */
  let ancre=noeud('div'),sonne=[];
  await Cloche.verifie({ancre,info:null,sonne:m=>sonne.push(m)});
  let b=boutons(ancre);
  assert.deepEqual(b.map(x=>x.dataset.motif||''),['consigne','ecran',''],'consigne, écran, Pas encore');
  assert.equal(b[0].textContent,'🔔 Je ne comprends pas la consigne');assert.equal(b[1].textContent,'🔔 Ça ne marche pas à l’écran');assert.equal(b[2].textContent,'Pas encore');
  assert.ok(!ancre.tous().some(x=>/Oui, je sonne/.test(x.textContent)),'plus de bouton sans motif');
  b[1].click();assert.deepEqual(sonne,['ecran'],'un clic sur le motif sonne, avec le motif');assert.equal(Cloche.ouvert(ancre),false,'le panneau se referme');
  /* « Pas encore » ne sonne pas. */
  await Cloche.verifie({ancre,info:null,sonne:m=>sonne.push(m)});boutons(ancre)[2].click();assert.equal(sonne.length,1);
  /* La fiche qui demande l'accord avant la remise : un troisième motif. */
  ancre=noeud('div');await Cloche.verifie({ancre,info:null,accord:true,sonne:m=>sonne.push(m)});
  b=boutons(ancre);assert.deepEqual(b.map(x=>x.dataset.motif||''),['consigne','ecran','accord','']);
  assert.equal(b[2].textContent,'🔔 J’ai fini, je demande l’accord');b[2].click();assert.equal(sonne[1],'accord');
  /* Plus de sonnerie : aucun motif proposé. */
  ancre=noeud('div');await Cloche.verifie({ancre,info:{cloches:3,clocheMax:3,clocheLibre:Date.now()+600000},accord:true,sonne:m=>sonne.push(m)});
  assert.deepEqual(boutons(ancre).map(x=>x.textContent),['J’ai compris'],'limite atteinte : pas de bouton qui sonne');
  /* Le moteur transmet le motif, et seul le Rat de ville demande l'accord. */
  const moteur=lis('pas-a-pas/blocs.js');
  assert.ok(/type:"aide", reponse: motif \|\| ""/.test(moteur),'blocs.js envoie le motif dans la réponse de la ligne « aide »');
  assert.ok(/accord: typeof CLOCHE_ACCORD!=="undefined" && CLOCHE_ACCORD/.test(moteur),'« accord » : au choix de la fiche');
  const fiches=fs.readdirSync(racine).filter(d=>fs.existsSync(path.join(racine,d,'pas-a-pas/fiche.js')));
  assert.deepEqual(fiches.filter(d=>/^const CLOCHE_ACCORD = true/m.test(lis(d+'/pas-a-pas/fiche.js'))),['rat-de-ville']);
  /* Le tableau nomme le motif ; une ancienne sonnerie, sans motif, reste « aide ». */
  const tableau=lis('pas-a-pas/tableau.js');
  assert.ok(/MOTIFS_CLOCHE\[e\.aide\.motif\]\|\|"aide"/.test(tableau)&&/consigne:"consigne", ecran:"écran", accord:"accord"/.test(tableau),'pastille : 🔔 consigne, écran, accord, ou aide');
  assert.deepEqual(Object.keys(Cloche.MOTIFS),['consigne','ecran','accord']);
  console.log('Cloche : motifs en un clic, accord au choix de la fiche, pastille du tableau vérifiés.');
})().catch(e=>{console.error(e);process.exit(1);});
