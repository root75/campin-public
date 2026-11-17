/* Cloche : un clic sonne, sans question ni motif avant. Le seul panneau dit qu'une sonnerie n'est pas partie. */
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
  /* Plus rien à ouvrir avant de sonner. */
  assert.equal(Cloche.verifie,undefined,'plus de panneau avant la sonnerie');assert.equal(Cloche.MOTIFS,undefined,'plus de motifs');
  /* Limite atteinte : le panneau le dit, donne l'heure, et ne propose aucun bouton qui sonne. */
  let ancre=noeud('div');
  await Cloche.refuse({ancre,plein:true,info:{cloches:3,clocheMax:3,clocheLibre:Date.now()+600000}});
  assert.equal(Cloche.ouvert(ancre),true);
  assert.ok(ancre.tous().some(x=>/Plus de sonnerie/.test(x.textContent))&&ancre.tous().some(x=>/Prochaine sonnerie possible vers/.test(x.textContent)));
  assert.deepEqual(boutons(ancre).map(x=>x.textContent),['J’ai compris']);assert.ok(ancre.classes.has('epuise'),'cloche en pointillés');
  boutons(ancre)[0].click();assert.equal(Cloche.ouvert(ancre),false,'« J’ai compris » referme');
  /* Limite atteinte mais compte illisible : le panneau s'affiche quand même, sans heure. */
  ancre=noeud('div');await Cloche.refuse({ancre,plein:true,info:Promise.reject(new Error('x'))});
  assert.ok(ancre.tous().some(x=>/J’ai déjà sonné 3 fois en une heure\.$/.test(x.textContent)));
  /* Demande non transmise : l'élève sait qu'il doit recliquer. */
  ancre=noeud('div');await Cloche.refuse({ancre,plein:false});
  assert.ok(ancre.tous().some(x=>/Cloche non transmise/.test(x.textContent))&&ancre.tous().some(x=>/encore une fois sur la cloche/.test(x.textContent)));
  /* Compte local (aperçu) : trois sonneries, puis plus rien. */
  assert.equal(Cloche.restantes().n,3);Cloche.sonnee();Cloche.sonnee();Cloche.sonnee();assert.equal(Cloche.restantes().n,0);
  /* Le moteur sonne au premier clic et n'ouvre plus de question. */
  const moteur=lis('pas-a-pas/blocs.js');
  assert.ok(!/Cloche\.verifie|CLOCHE_ACCORD/.test(moteur),'blocs.js ne passe plus par un panneau avant de sonner');
  assert.ok(/noter\(COURS, \{ etape, type:"aide", reponse:"" \}\)/.test(moteur),'la sonnerie part au clic');
  const fiches=fs.readdirSync(racine).filter(d=>fs.existsSync(path.join(racine,d,'pas-a-pas/fiche.js')));
  assert.deepEqual(fiches.filter(d=>/CLOCHE_ACCORD/.test(lis(d+'/pas-a-pas/fiche.js'))),[]);
  /* Le tableau lit encore le motif des anciennes sonneries ; sans motif, « aide ». */
  assert.ok(/MOTIFS_CLOCHE\[e\.aide\.motif\]\|\|"aide"/.test(lis('pas-a-pas/tableau.js')));
  console.log('Cloche : un clic sonne ; panneau seulement en cas de refus ou de demande non transmise.');
})().catch(e=>{console.error(e);process.exit(1);});
