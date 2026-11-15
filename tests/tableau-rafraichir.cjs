/* Le tableau prof ne relance pas donnees() tant que la réponse précédente n'est pas revenue, se tait quand
   l'onglet est caché et repart tout de suite au retour. Horloge et onglet simulés. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(process.argv[2]||require.resolve('../pas-a-pas/tableau.js'),'utf8');
const a=source.indexOf('let minuterieTableau'),b=source.indexOf('\n}',source.indexOf('function rafraichitSelonOnglet'))+2;
assert.ok(a>0&&b>a,'boucle de rafraîchissement introuvable');
assert.ok(!/setInterval\(charge/.test(source),'plus de setInterval sur charge');
let t=0;const minuteries=new Map();let id=0;
const setTimeout_=(f,ms)=>{minuteries.set(++id,{f,quand:t+ms});return id;};
const clearTimeout_=k=>minuteries.delete(k);
const avance=async ms=>{const fin=t+ms;for(;;){const p=[...minuteries].filter(([,m])=>m.quand<=fin).sort((x,y)=>x[1].quand-y[1].quand)[0];if(!p)break;t=p[1].quand;minuteries.delete(p[0]);p[1].f();for(let i=0;i<5;i++)await null;}t=fin;};
const appels=[];const document={hidden:false};
const c=vm.createContext({RAFRAICHIR:15000,document,setTimeout:setTimeout_,clearTimeout:clearTimeout_,Promise,
  charge:()=>new Promise(ok=>appels.push({ok,quand:t}))});
vm.runInContext(source.slice(a,b),c);
(async()=>{
  c.planifieCharge();
  await avance(15000);assert.equal(appels.length,1,'premier tour à 15 s');
  await avance(40000);assert.equal(appels.length,1,'serveur lent : pas de deuxième appel tant que le premier n’est pas revenu');
  appels[0].ok();for(let i=0;i<5;i++)await null;
  await avance(14999);assert.equal(appels.length,1);await avance(1);assert.equal(appels.length,2,'tour suivant 15 s après la réponse');
  appels[1].ok();for(let i=0;i<5;i++)await null;
  document.hidden=true;c.rafraichitSelonOnglet();
  await avance(10*60000);assert.equal(appels.length,2,'onglet caché : aucun appel en 10 min');
  document.hidden=false;c.rafraichitSelonOnglet();
  assert.equal(appels.length,3,'retour sur l’onglet : un tour tout de suite');
  c.rafraichitSelonOnglet();assert.equal(appels.length,3,'pas de second tour si un est déjà en cours');
  await avance(59999);assert.equal(appels.length,3);await avance(1+15000);assert.equal(appels.length,4,'réponse perdue : la boucle repart 60 s + 15 s plus tard');
  console.log('Tableau prof : rafraîchissement chaîné, pause onglet caché, reprise au retour vérifiés.');
})().catch(e=>{console.error(e);process.exitCode=1;});
